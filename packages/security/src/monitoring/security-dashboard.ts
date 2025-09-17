/**
 * Security Monitoring Dashboard
 * Real-time security metrics and monitoring for mental health platform
 */

import { EventEmitter } from 'events';
import { SecurityLogger } from '../logging/security-logger';
import { AuditService, AuditSummary } from '../audit';
import { BreachDetectionService, BreachAlert } from '../breach-detection/breach-monitor';

export interface SecurityMetrics {
  timestamp: Date;
  period: 'hour' | 'day' | 'week' | 'month';
  totalRequests: number;
  blockedRequests: number;
  failedLogins: number;
  successfulLogins: number;
  phiAccess: number;
  crisisEscalations: number;
  securityViolations: number;
  activeThreats: number;
  complianceScore: number;
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  geographicDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: 'security_violation' | 'compliance_breach' | 'system_anomaly' | 'performance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  metadata?: any;
  acknowledged: boolean;
  resolved: boolean;
  assignedTo?: string;
}

export interface DashboardConfig {
  refreshInterval: number;
  alertThresholds: {
    failedLogins: number;
    blockedRequests: number;
    responseTime: number;
    complianceScore: number;
  };
  enableRealTimeAlerts: boolean;
  retentionPeriod: number;
}

export class SecurityDashboard extends EventEmitter {
  private logger: SecurityLogger;
  private auditService: AuditService;
  private breachDetection: BreachDetectionService;
  private config: DashboardConfig;
  private metrics: Map<string, SecurityMetrics[]> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();
  private isMonitoring: boolean = false;
  private refreshTimer?: NodeJS.Timeout;

  constructor(config: Partial<DashboardConfig> = {}) {
    super();
    this.logger = new SecurityLogger();
    this.auditService = new AuditService();
    this.breachDetection = new BreachDetectionService();
    
    this.config = {
      refreshInterval: 60000, // 1 minute
      alertThresholds: {
        failedLogins: 10,
        blockedRequests: 50,
        responseTime: 5000,
        complianceScore: 80
      },
      enableRealTimeAlerts: true,
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      ...config
    };

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for real-time monitoring
   */
  private setupEventListeners(): void {
    if (this.config.enableRealTimeAlerts) {
      // Listen for breach alerts
      this.breachDetection.on('breachAlert', (alert: BreachAlert) => {
        this.createSecurityAlert({
          type: 'security_violation',
          severity: alert.severity,
          title: `Security Breach: ${alert.type}`,
          description: alert.description,
          source: 'breach_detection',
          metadata: alert
        });
      });
    }
  }

  /**
   * Start monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.refreshTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.refreshInterval);

    // Initial metrics collection
    this.collectMetrics();

    this.logger.audit('Security monitoring started', {
      action: 'monitoring_start',
      timestamp: new Date().toISOString()
    });

    this.emit('monitoring_started');
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    this.logger.audit('Security monitoring stopped', {
      action: 'monitoring_stop',
      timestamp: new Date().toISOString()
    });

    this.emit('monitoring_stopped');
  }

  /**
   * Collect security metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get audit summary for the last hour
      const auditSummary = await this.auditService.generateSummary(oneHourAgo, now);

      // Get active threats
      const activeThreats = this.breachDetection.getActiveAlerts().length;

      // Calculate metrics
      const metrics: SecurityMetrics = {
        timestamp: now,
        period: 'hour',
        totalRequests: auditSummary.totalEvents,
        blockedRequests: this.calculateBlockedRequests(auditSummary),
        failedLogins: this.calculateFailedLogins(auditSummary),
        successfulLogins: this.calculateSuccessfulLogins(auditSummary),
        phiAccess: auditSummary.phiAccess,
        crisisEscalations: this.calculateCrisisEscalations(auditSummary),
        securityViolations: auditSummary.failureCount,
        activeThreats,
        complianceScore: auditSummary.complianceScore,
        responseTime: await this.calculateResponseTimes(),
        geographicDistribution: await this.calculateGeographicDistribution(),
        deviceDistribution: await this.calculateDeviceDistribution(),
        riskDistribution: {
          low: auditSummary.riskDistribution.low || 0,
          medium: auditSummary.riskDistribution.medium || 0,
          high: auditSummary.riskDistribution.high || 0,
          critical: auditSummary.riskDistribution.critical || 0
        }
      };

      // Store metrics
      const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
      if (!this.metrics.has(hourKey)) {
        this.metrics.set(hourKey, []);
      }
      this.metrics.get(hourKey)!.push(metrics);

      // Check for alerts
      this.checkAlertThresholds(metrics);

      // Emit metrics update
      this.emit('metrics_updated', metrics);

      // Clean up old metrics
      this.cleanupOldMetrics();

    } catch (error) {
      this.logger.error('Metrics collection failed', error as Error);
    }
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(metrics: SecurityMetrics): void {
    // Failed logins threshold
    if (metrics.failedLogins > this.config.alertThresholds.failedLogins) {
      this.createSecurityAlert({
        type: 'security_violation',
        severity: 'high',
        title: 'High Failed Login Rate',
        description: `${metrics.failedLogins} failed logins detected in the last hour`,
        source: 'metrics',
        metadata: { failedLogins: metrics.failedLogins, threshold: this.config.alertThresholds.failedLogins }
      });
    }

    // Blocked requests threshold
    if (metrics.blockedRequests > this.config.alertThresholds.blockedRequests) {
      this.createSecurityAlert({
        type: 'security_violation',
        severity: 'medium',
        title: 'High Blocked Request Rate',
        description: `${metrics.blockedRequests} requests blocked in the last hour`,
        source: 'metrics',
        metadata: { blockedRequests: metrics.blockedRequests, threshold: this.config.alertThresholds.blockedRequests }
      });
    }

    // Response time threshold
    if (metrics.responseTime.avg > this.config.alertThresholds.responseTime) {
      this.createSecurityAlert({
        type: 'performance_issue',
        severity: 'medium',
        title: 'High Response Time',
        description: `Average response time is ${metrics.responseTime.avg}ms`,
        source: 'metrics',
        metadata: { responseTime: metrics.responseTime, threshold: this.config.alertThresholds.responseTime }
      });
    }

    // Compliance score threshold
    if (metrics.complianceScore < this.config.alertThresholds.complianceScore) {
      this.createSecurityAlert({
        type: 'compliance_breach',
        severity: 'high',
        title: 'Low Compliance Score',
        description: `Compliance score dropped to ${metrics.complianceScore}%`,
        source: 'metrics',
        metadata: { complianceScore: metrics.complianceScore, threshold: this.config.alertThresholds.complianceScore }
      });
    }
  }

  /**
   * Create security alert
   */
  private createSecurityAlert(alertData: Partial<SecurityAlert>): SecurityAlert {
    const alert: SecurityAlert = {
      id: require('crypto').randomUUID(),
      timestamp: new Date(),
      type: alertData.type || 'system_anomaly',
      severity: alertData.severity || 'medium',
      title: alertData.title || 'Security Alert',
      description: alertData.description || 'A security event was detected',
      source: alertData.source || 'dashboard',
      metadata: alertData.metadata,
      acknowledged: false,
      resolved: false,
      assignedTo: alertData.assignedTo
    };

    this.alerts.set(alert.id, alert);

    // Log the alert
    this.logger.warn(`Security alert: ${alert.title}`, {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      source: alert.source
    });

    // Emit alert
    this.emit('security_alert', alert);

    return alert;
  }

  /**
   * Get current metrics
   */
  public getCurrentMetrics(): SecurityMetrics | null {
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    const hourMetrics = this.metrics.get(hourKey);
    
    return hourMetrics && hourMetrics.length > 0 ? hourMetrics[hourMetrics.length - 1] : null;
  }

  /**
   * Get metrics for period
   */
  public getMetricsForPeriod(
    startDate: Date,
    endDate: Date,
    period: 'hour' | 'day' = 'hour'
  ): SecurityMetrics[] {
    const result: SecurityMetrics[] = [];
    
    for (const [key, metrics] of this.metrics.entries()) {
      const keyParts = key.split('-');
      const keyDate = new Date(
        parseInt(keyParts[0]),
        parseInt(keyParts[1]),
        parseInt(keyParts[2]),
        parseInt(keyParts[3] || '0')
      );
      
      if (keyDate >= startDate && keyDate <= endDate) {
        result.push(...metrics.filter(m => m.period === period));
      }
    }
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => {
        // Sort by severity then by timestamp
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.assignedTo = userId;

    this.logger.audit('Security alert acknowledged', {
      action: 'alert_acknowledge',
      alertId,
      userId,
      timestamp: new Date().toISOString()
    });

    this.emit('alert_acknowledged', alert);
    return true;
  }

  /**
   * Resolve alert
   */
  public resolveAlert(alertId: string, userId: string, resolution: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.assignedTo = userId;
    alert.metadata = { ...alert.metadata, resolution, resolvedBy: userId, resolvedAt: new Date() };

    this.logger.audit('Security alert resolved', {
      action: 'alert_resolve',
      alertId,
      userId,
      resolution,
      timestamp: new Date().toISOString()
    });

    this.emit('alert_resolved', alert);
    return true;
  }

  /**
   * Get security dashboard summary
   */
  public getDashboardSummary(): any {
    const currentMetrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    
    return {
      timestamp: new Date(),
      monitoring: this.isMonitoring,
      currentMetrics,
      activeAlerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      },
      systemHealth: {
        status: this.calculateSystemHealth(),
        lastUpdate: currentMetrics?.timestamp,
        complianceScore: currentMetrics?.complianceScore || 0
      }
    };
  }

  /**
   * Calculate system health status
   */
  private calculateSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const currentMetrics = this.getCurrentMetrics();
    const criticalAlerts = this.getActiveAlerts().filter(a => a.severity === 'critical');
    
    if (criticalAlerts.length > 0) return 'critical';
    if (!currentMetrics) return 'warning';
    if (currentMetrics.complianceScore < 70) return 'critical';
    if (currentMetrics.complianceScore < 85) return 'warning';
    if (currentMetrics.activeThreats > 0) return 'warning';
    
    return 'healthy';
  }

  /**
   * Export dashboard data
   */
  public exportDashboardData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      exportTimestamp: new Date().toISOString(),
      config: this.config,
      metrics: Array.from(this.metrics.entries()),
      alerts: Array.from(this.alerts.values())
    };

    if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Utility calculation methods
   */
  private calculateBlockedRequests(summary: AuditSummary): number {
    // This would be calculated from specific audit events
    return Math.floor(summary.failureCount * 0.3); // Rough estimation
  }

  private calculateFailedLogins(summary: AuditSummary): number {
    // This would be calculated from authentication events
    return Math.floor(summary.failureCount * 0.5); // Rough estimation
  }

  private calculateSuccessfulLogins(summary: AuditSummary): number {
    // This would be calculated from authentication events
    return Math.floor(summary.successCount * 0.2); // Rough estimation
  }

  private calculateCrisisEscalations(summary: AuditSummary): number {
    // This would be calculated from crisis-specific events
    return Math.floor(summary.totalEvents * 0.01); // Rough estimation
  }

  private async calculateResponseTimes(): Promise<{ avg: number; p95: number; p99: number }> {
    // This would calculate actual response times from request logs
    return {
      avg: 150,
      p95: 300,
      p99: 500
    };
  }

  private async calculateGeographicDistribution(): Promise<Record<string, number>> {
    // This would be calculated from IP geolocation data
    return {
      'US': 75,
      'CA': 15,
      'EU': 8,
      'Other': 2
    };
  }

  private async calculateDeviceDistribution(): Promise<Record<string, number>> {
    // This would be calculated from device fingerprint data
    return {
      'Desktop': 45,
      'Mobile': 40,
      'Tablet': 15
    };
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use proper CSV library
    return JSON.stringify(data);
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp.getTime() >= cutoffTime);
      if (filteredMetrics.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filteredMetrics);
      }
    }
  }
}

export default SecurityDashboard;