/**
 * Alert Manager for Performance Degradation
 * 
 * Manages and dispatches critical alerts when performance thresholds are breached.
 * Integrates with multiple notification channels for emergency response.
 */

import { EventEmitter } from 'events';
import logger from '../utils/logger';

export interface Alert {
  id?: string;
  timestamp?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  details?: any;
  threshold?: number;
  value?: number;
  component?: string;
  resolved?: boolean;
  resolvedAt?: number;
}

export interface AlertConfig {
  cooldownPeriod: number; // Minimum time between same alerts (ms)
  maxAlertsPerHour: number;
  channels: AlertChannel[];
  escalationPolicy: EscalationPolicy;
}

export interface AlertChannel {
  type: 'console' | 'webhook' | 'email' | 'sms' | 'pagerduty' | 'slack';
  enabled: boolean;
  config: any;
  severityFilter?: Alert['severity'][];
}

export interface EscalationPolicy {
  enabled: boolean;
  rules: EscalationRule[];
}

export interface EscalationRule {
  condition: 'unresolved_duration' | 'repeat_count' | 'severity';
  threshold: number;
  action: 'upgrade_severity' | 'notify_oncall' | 'trigger_incident';
}

export class AlertManager extends EventEmitter {
  private static instance: AlertManager;
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private cooldowns: Map<string, number> = new Map();
  private config: AlertConfig;
  private oncallNotified: Set<string> = new Set();

  private readonly DEFAULT_CONFIG: AlertConfig = {
    cooldownPeriod: 60000, // 1 minute
    maxAlertsPerHour: 100,
    channels: [
      { type: 'console', enabled: true, config: {} },
      { type: 'webhook', enabled: false, config: { url: process.env.ALERT_WEBHOOK_URL } }
    ],
    escalationPolicy: {
      enabled: true,
      rules: [
        { condition: 'unresolved_duration', threshold: 300000, action: 'upgrade_severity' }, // 5 minutes
        { condition: 'severity', threshold: 3, action: 'notify_oncall' }, // critical = 3
        { condition: 'repeat_count', threshold: 5, action: 'trigger_incident' }
      ]
    }
  };

  private constructor(config?: Partial<AlertConfig>) {
    super();
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.startEscalationMonitor();
    this.startCleanup();
  }

  public static getInstance(config?: Partial<AlertConfig>): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager(config);
    }
    return AlertManager.instance;
  }

  public triggerAlert(alert: Alert): void {
    // Add metadata
    alert.id = this.generateAlertId(alert);
    alert.timestamp = Date.now();

    // Check cooldown
    if (this.isInCooldown(alert.id)) {
      logger.debug(`Alert ${alert.id} is in cooldown period`);
      return;
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      logger.warn('Alert rate limit exceeded');
      return;
    }

    // Store alert
    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);
    this.setCooldown(alert.id);

    // Dispatch to channels
    this.dispatchAlert(alert);

    // Check escalation rules
    this.checkEscalation(alert);

    // Emit event
    this.emit('alert', alert);

    logger.warn('Performance alert triggered', {
      id: alert.id,
      severity: alert.severity,
      type: alert.type,
      message: alert.message
    });
  }

  public triggerCriticalAlert(details: any): void {
    this.triggerAlert({
      severity: 'critical',
      type: details.type || 'critical_performance',
      message: details.message || 'Critical performance issue detected',
      details,
      component: details.component
    });

    // For critical alerts, immediately notify on-call
    this.notifyOnCall({
      severity: 'critical',
      details,
      timestamp: Date.now()
    });
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      
      logger.info(`Alert resolved: ${alertId}`, {
        duration: alert.resolvedAt - (alert.timestamp || 0)
      });

      this.emit('alert_resolved', alert);
    }
  }

  private dispatchAlert(alert: Alert): void {
    const enabledChannels = this.config.channels.filter(channel => {
      if (!channel.enabled) return false;
      if (channel.severityFilter && !channel.severityFilter.includes(alert.severity)) {
        return false;
      }
      return true;
    });

    for (const channel of enabledChannels) {
      this.sendToChannel(channel, alert);
    }
  }

  private sendToChannel(channel: AlertChannel, alert: Alert): void {
    switch (channel.type) {
      case 'console':
        this.logToConsole(alert);
        break;
      case 'webhook':
        this.sendWebhook(channel.config, alert);
        break;
      case 'slack':
        this.sendSlackNotification(channel.config, alert);
        break;
      case 'pagerduty':
        this.sendPagerDutyAlert(channel.config, alert);
        break;
      case 'email':
        this.sendEmailAlert(channel.config, alert);
        break;
      case 'sms':
        this.sendSMSAlert(channel.config, alert);
        break;
    }
  }

  private logToConsole(alert: Alert): void {
    const color = this.getSeverityColor(alert.severity);
    console.log(`${color}[PERFORMANCE ALERT] [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}\x1b[0m`);
    if (alert.details) {
      console.log('Details:', JSON.stringify(alert.details, null, 2));
    }
  }

  private async sendWebhook(config: any, alert: Alert): Promise<void> {
    if (!config.url) return;

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Alert-Severity': alert.severity,
          'X-Alert-Type': alert.type
        },
        body: JSON.stringify({
          ...alert,
          environment: process.env.NODE_ENV,
          service: 'astral-core-performance',
          hostname: require('os').hostname()
        })
      });

      if (!response.ok) {
        logger.error('Failed to send webhook alert', {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      logger.error('Error sending webhook alert', error);
    }
  }

  private async sendSlackNotification(config: any, alert: Alert): Promise<void> {
    if (!config.webhookUrl) return;

    const color = this.getSlackColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Performance Monitor',
          icon_emoji: ':warning:',
          attachments: [{
            color,
            pretext: `${emoji} *Performance Alert*`,
            title: alert.type,
            text: alert.message,
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Component', value: alert.component || 'Unknown', short: true },
              { title: 'Time', value: new Date(alert.timestamp!).toISOString(), short: false }
            ],
            footer: 'Astral Core Performance Monitor',
            ts: Math.floor(alert.timestamp! / 1000)
          }]
        })
      });
    } catch (error) {
      logger.error('Error sending Slack notification', error);
    }
  }

  private async sendPagerDutyAlert(config: any, alert: Alert): Promise<void> {
    if (!config.integrationKey) return;

    const severity = this.mapToPagerDutySeverity(alert.severity);

    try {
      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.pagerduty+json;version=2'
        },
        body: JSON.stringify({
          routing_key: config.integrationKey,
          event_action: 'trigger',
          dedup_key: alert.id,
          payload: {
            summary: alert.message,
            source: 'astral-core-performance',
            severity,
            component: alert.component,
            class: alert.type,
            custom_details: alert.details
          }
        })
      });
    } catch (error) {
      logger.error('Error sending PagerDuty alert', error);
    }
  }

  private async sendEmailAlert(config: any, alert: Alert): Promise<void> {
    // Email implementation would go here
    // This would typically integrate with an email service like SendGrid or AWS SES
    logger.info('Email alert would be sent', { to: config.recipients, alert });
  }

  private async sendSMSAlert(config: any, alert: Alert): Promise<void> {
    // SMS implementation would go here
    // This would typically integrate with Twilio or similar service
    logger.info('SMS alert would be sent', { to: config.phoneNumbers, alert });
  }

  private checkEscalation(alert: Alert): void {
    if (!this.config.escalationPolicy.enabled) return;

    for (const rule of this.config.escalationPolicy.rules) {
      switch (rule.condition) {
        case 'severity':
          if (this.getSeverityLevel(alert.severity) >= rule.threshold) {
            this.executeEscalationAction(rule.action, alert);
          }
          break;
        case 'repeat_count':
          const count = this.getAlertRepeatCount(alert.type);
          if (count >= rule.threshold) {
            this.executeEscalationAction(rule.action, alert);
          }
          break;
        case 'unresolved_duration':
          // This is handled by the escalation monitor
          break;
      }
    }
  }

  private executeEscalationAction(action: string, alert: Alert): void {
    switch (action) {
      case 'upgrade_severity':
        this.upgradeSeverity(alert);
        break;
      case 'notify_oncall':
        this.notifyOnCall(alert);
        break;
      case 'trigger_incident':
        this.triggerIncident(alert);
        break;
    }
  }

  private upgradeSeverity(alert: Alert): void {
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = severityLevels.indexOf(alert.severity);
    if (currentIndex < severityLevels.length - 1) {
      alert.severity = severityLevels[currentIndex + 1] as Alert['severity'];
      logger.warn(`Alert severity upgraded to ${alert.severity}`, { alertId: alert.id });
    }
  }

  private notifyOnCall(alert: any): void {
    const key = `${alert.type}-${alert.severity}`;
    if (this.oncallNotified.has(key)) {
      return; // Already notified for this alert type
    }

    this.oncallNotified.add(key);
    
    // Implement on-call notification logic here
    logger.critical('ON-CALL NOTIFICATION TRIGGERED', {
      alert,
      timestamp: new Date().toISOString()
    });

    // Clear notification flag after 1 hour
    setTimeout(() => {
      this.oncallNotified.delete(key);
    }, 3600000);
  }

  private triggerIncident(alert: Alert): void {
    logger.critical('INCIDENT TRIGGERED', {
      alert,
      timestamp: new Date().toISOString()
    });
    
    // This would integrate with incident management systems
    this.emit('incident_triggered', alert);
  }

  private startEscalationMonitor(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [_id, alert] of this.alerts) {
        if (alert.resolved) continue;

        const duration = now - (alert.timestamp || 0);
        for (const rule of this.config.escalationPolicy.rules) {
          if (rule.condition === 'unresolved_duration' && duration >= rule.threshold) {
            this.executeEscalationAction(rule.action, alert);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private startCleanup(): void {
    setInterval(() => {
      const cutoff = Date.now() - 3600000; // 1 hour
      
      // Clean up old resolved alerts
      for (const [_id, alert] of this.alerts) {
        if (alert.resolved && (alert.resolvedAt || 0) < cutoff) {
          this.alerts.delete(_id);
        }
      }

      // Clean up old history
      this.alertHistory = this.alertHistory.filter(
        alert => (alert.timestamp || 0) > cutoff
      );

      // Clean up old cooldowns
      for (const [_id, timestamp] of this.cooldowns) {
        if (timestamp < Date.now()) {
          this.cooldowns.delete(_id);
        }
      }
    }, 300000); // Clean up every 5 minutes
  }

  private generateAlertId(alert: Alert): string {
    return `${alert.type}-${alert.severity}-${alert.component || 'system'}-${Date.now()}`;
  }

  private isInCooldown(alertId: string): boolean {
    const cooldownEnd = this.cooldowns.get(alertId);
    return cooldownEnd ? Date.now() < cooldownEnd : false;
  }

  private setCooldown(alertId: string): void {
    this.cooldowns.set(alertId, Date.now() + this.config.cooldownPeriod);
  }

  private checkRateLimit(): boolean {
    const hourAgo = Date.now() - 3600000;
    const recentAlerts = this.alertHistory.filter(
      alert => (alert.timestamp || 0) > hourAgo
    );
    return recentAlerts.length < this.config.maxAlertsPerHour;
  }

  private getAlertRepeatCount(type: string): number {
    const hourAgo = Date.now() - 3600000;
    return this.alertHistory.filter(
      alert => alert.type === type && (alert.timestamp || 0) > hourAgo
    ).length;
  }

  private getSeverityLevel(severity: Alert['severity']): number {
    const levels = { low: 0, medium: 1, high: 2, critical: 3 };
    return levels[severity];
  }

  private getSeverityColor(severity: Alert['severity']): string {
    const colors = {
      low: '\x1b[33m',      // Yellow
      medium: '\x1b[35m',   // Magenta
      high: '\x1b[31m',     // Red
      critical: '\x1b[41m'  // Red background
    };
    return colors[severity];
  }

  private getSlackColor(severity: Alert['severity']): string {
    const colors = {
      low: '#FFEB3B',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#B71C1C'
    };
    return colors[severity];
  }

  private getSeverityEmoji(severity: Alert['severity']): string {
    const emojis = {
      low: ':warning:',
      medium: ':exclamation:',
      high: ':rotating_light:',
      critical: ':fire:'
    };
    return emojis[severity];
  }

  private mapToPagerDutySeverity(severity: Alert['severity']): string {
    const mapping = {
      low: 'warning',
      medium: 'error',
      high: 'error',
      critical: 'critical'
    };
    return mapping[severity];
  }

  public getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  public getAlertHistory(limit?: number): Alert[] {
    const sorted = [...this.alertHistory].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  public clearAllAlerts(): void {
    this.alerts.clear();
    this.alertHistory = [];
    this.cooldowns.clear();
    this.oncallNotified.clear();
  }
}
