/**
 * Security Monitoring Service
 * Real-time security threat detection and response
 */

import { EventEmitter } from 'events';
import { SecurityLogger, SecurityEventType } from '../logging/security-logger';

export interface SecurityThreat {
  id: string;
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target?: string;
  description: string;
  timestamp: Date;
  metadata?: any;
  mitigationApplied?: boolean;
}

export enum ThreatType {
  BRUTE_FORCE = 'BRUTE_FORCE',
  DOS_ATTACK = 'DOS_ATTACK',
  SQL_INJECTION = 'SQL_INJECTION',
  XSS_ATTACK = 'XSS_ATTACK',
  CSRF_ATTACK = 'CSRF_ATTACK',
  SESSION_HIJACKING = 'SESSION_HIJACKING',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  API_ABUSE = 'API_ABUSE',
  BOT_ACTIVITY = 'BOT_ACTIVITY'
}

export interface MonitoringConfig {
  enableRealTimeAlerts?: boolean;
  alertThresholds?: Map<ThreatType, number>;
  monitoringInterval?: number;
  maxEventsPerWindow?: number;
  windowDuration?: number;
  autoMitigation?: boolean;
}

export class SecurityMonitor extends EventEmitter {
  private logger: SecurityLogger;
  private config: Required<MonitoringConfig>;
  private threats: Map<string, SecurityThreat> = new Map();
  private eventWindow: Map<string, number[]> = new Map();
  private blockedIPs: Set<string> = new Set();
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: MonitoringConfig = {}) {
    super();
    this.logger = new SecurityLogger();
    this.config = this.initializeConfig(config);
    this.startMonitoring();
  }

  /**
   * Initialize monitoring configuration
   */
  private initializeConfig(config: MonitoringConfig): Required<MonitoringConfig> {
    const alertThresholds = new Map<ThreatType, number>([
      [ThreatType.BRUTE_FORCE, 5],
      [ThreatType.DOS_ATTACK, 100],
      [ThreatType.SQL_INJECTION, 1],
      [ThreatType.XSS_ATTACK, 1],
      [ThreatType.CSRF_ATTACK, 3],
      [ThreatType.SESSION_HIJACKING, 1],
      [ThreatType.PRIVILEGE_ESCALATION, 1],
      [ThreatType.DATA_BREACH_ATTEMPT, 1],
      [ThreatType.API_ABUSE, 50],
      [ThreatType.BOT_ACTIVITY, 10]
    ]);

    return {
      enableRealTimeAlerts: true,
      alertThresholds: config.alertThresholds || alertThresholds,
      monitoringInterval: 5000, // 5 seconds
      maxEventsPerWindow: 1000,
      windowDuration: 60000, // 1 minute
      autoMitigation: true,
      ...config
    };
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.analyzeThreats();
      this.cleanupOldData();
    }, this.config.monitoringInterval);

    this.logger.info('Security monitoring started');
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.logger.info('Security monitoring stopped');
  }

  /**
   * Report security event
   */
  public reportEvent(
    type: ThreatType,
    source: string,
    target?: string,
    metadata?: any
  ): void {
    const key = `${type}_${source}`;
    const now = Date.now();

    // Track event in window
    if (!this.eventWindow.has(key)) {
      this.eventWindow.set(key, []);
    }

    const events = this.eventWindow.get(key)!;
    events.push(now);

    // Check threshold
    const threshold = this.config.alertThresholds.get(type) || 10;
    const recentEvents = events.filter(
      t => now - t < this.config.windowDuration
    );

    if (recentEvents.length >= threshold) {
      this.detectThreat(type, source, target, metadata);
    }

    // Update window
    this.eventWindow.set(key, recentEvents);
  }

  /**
   * Detect and handle threat
   */
  private detectThreat(
    type: ThreatType,
    source: string,
    target?: string,
    metadata?: any
  ): void {
    const threat: SecurityThreat = {
      id: this.generateThreatId(),
      type,
      severity: this.calculateSeverity(type),
      source,
      target,
      description: this.getThreatDescription(type, source, target),
      timestamp: new Date(),
      metadata,
      mitigationApplied: false
    };

    // Store threat
    this.threats.set(threat.id, threat);

    // Log threat
    this.logger.logViolation(this.mapThreatToEventType(type), {
      threatId: threat.id,
      source,
      target,
      severity: threat.severity,
      metadata
    });

    // Apply mitigation if enabled
    if (this.config.autoMitigation) {
      this.applyMitigation(threat);
    }

    // Emit threat event
    this.emit('threat', threat);

    // Send real-time alert if enabled
    if (this.config.enableRealTimeAlerts) {
      this.sendAlert(threat);
    }
  }

  /**
   * Apply automatic mitigation
   */
  private applyMitigation(threat: SecurityThreat): void {
    switch (threat.type) {
      case ThreatType.BRUTE_FORCE:
      case ThreatType.DOS_ATTACK:
      case ThreatType.BOT_ACTIVITY:
        // Block IP address
        this.blockIP(threat.source);
        threat.mitigationApplied = true;
        break;

      case ThreatType.SQL_INJECTION:
      case ThreatType.XSS_ATTACK:
        // Block request pattern
        this.blockPattern(threat.metadata?.pattern);
        threat.mitigationApplied = true;
        break;

      case ThreatType.SESSION_HIJACKING:
        // Invalidate session
        this.invalidateSession(threat.metadata?.sessionId);
        threat.mitigationApplied = true;
        break;

      case ThreatType.API_ABUSE:
        // Apply rate limiting
        this.applyStrictRateLimit(threat.source);
        threat.mitigationApplied = true;
        break;

      default:
        // Log for manual review
        this.logger.warn('Threat detected, manual review required', threat);
    }
  }

  /**
   * Block IP address
   */
  public blockIP(ip: string, duration: number = 3600000): void {
    this.blockedIPs.add(ip);

    // Auto-unblock after duration
    setTimeout(() => {
      this.unblockIP(ip);
    }, duration);

    this.logger.info('IP blocked', { ip, duration });
    this.emit('ip-blocked', { ip, duration });
  }

  /**
   * Unblock IP address
   */
  public unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.logger.info('IP unblocked', { ip });
    this.emit('ip-unblocked', { ip });
  }

  /**
   * Check if IP is blocked
   */
  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Block pattern
   */
  private blockPattern(pattern: string): void {
    // Implement pattern blocking logic
    this.logger.info('Pattern blocked', { pattern });
  }

  /**
   * Invalidate session
   */
  private invalidateSession(sessionId: string): void {
    // Implement session invalidation
    this.logger.info('Session invalidated', { sessionId });
    this.emit('session-invalidated', { sessionId });
  }

  /**
   * Apply strict rate limiting
   */
  private applyStrictRateLimit(source: string): void {
    // Implement strict rate limiting
    this.logger.info('Strict rate limit applied', { source });
    this.emit('rate-limit-applied', { source });
  }

  /**
   * Analyze threats
   */
  private analyzeThreats(): void {
    const now = Date.now();
    const recentThreats = Array.from(this.threats.values()).filter(
      t => now - t.timestamp.getTime() < 300000 // Last 5 minutes
    );

    if (recentThreats.length > 10) {
      const criticalThreats = recentThreats.filter(t => t.severity === 'critical');
      
      if (criticalThreats.length > 0) {
        this.emit('critical-threat-level', {
          threatCount: recentThreats.length,
          criticalCount: criticalThreats.length
        });
      }
    }

    // Detect patterns
    this.detectAttackPatterns(recentThreats);
  }

  /**
   * Detect attack patterns
   */
  private detectAttackPatterns(threats: SecurityThreat[]): void {
    // Group by source
    const bySource = new Map<string, SecurityThreat[]>();
    
    threats.forEach(threat => {
      if (!bySource.has(threat.source)) {
        bySource.set(threat.source, []);
      }
      bySource.get(threat.source)!.push(threat);
    });

    // Check for coordinated attacks
    bySource.forEach((sourceThreats, source) => {
      if (sourceThreats.length > 5) {
        const types = new Set(sourceThreats.map(t => t.type));
        
        if (types.size > 3) {
          this.detectThreat(
            ThreatType.SUSPICIOUS_PATTERN,
            source,
            undefined,
            {
              pattern: 'Coordinated attack',
              threatTypes: Array.from(types),
              count: sourceThreats.length
            }
          );
        }
      }
    });
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    // Clean up threats
    for (const [id, threat] of this.threats.entries()) {
      if (now - threat.timestamp.getTime() > maxAge) {
        this.threats.delete(id);
      }
    }

    // Clean up event windows
    for (const [key, events] of this.eventWindow.entries()) {
      const recent = events.filter(t => now - t < maxAge);
      if (recent.length === 0) {
        this.eventWindow.delete(key);
      } else {
        this.eventWindow.set(key, recent);
      }
    }
  }

  /**
   * Send real-time alert
   */
  private sendAlert(threat: SecurityThreat): void {
    // Implement real-time alerting (email, SMS, Slack, etc.)
    console.error('SECURITY ALERT:', threat);
    
    // Emit alert event for external handlers
    this.emit('alert', threat);
  }

  /**
   * Calculate threat severity
   */
  private calculateSeverity(type: ThreatType): SecurityThreat['severity'] {
    switch (type) {
      case ThreatType.SQL_INJECTION:
      case ThreatType.DATA_BREACH_ATTEMPT:
      case ThreatType.PRIVILEGE_ESCALATION:
        return 'critical';
      
      case ThreatType.XSS_ATTACK:
      case ThreatType.CSRF_ATTACK:
      case ThreatType.SESSION_HIJACKING:
        return 'high';
      
      case ThreatType.BRUTE_FORCE:
      case ThreatType.UNAUTHORIZED_ACCESS:
        return 'medium';
      
      default:
        return 'low';
    }
  }

  /**
   * Get threat description
   */
  private getThreatDescription(
    type: ThreatType,
    source: string,
    target?: string
  ): string {
    const descriptions: Record<ThreatType, string> = {
      [ThreatType.BRUTE_FORCE]: `Brute force attack detected from ${source}`,
      [ThreatType.DOS_ATTACK]: `Denial of service attack from ${source}`,
      [ThreatType.SQL_INJECTION]: `SQL injection attempt from ${source} on ${target}`,
      [ThreatType.XSS_ATTACK]: `XSS attack attempt from ${source}`,
      [ThreatType.CSRF_ATTACK]: `CSRF attack attempt from ${source}`,
      [ThreatType.SESSION_HIJACKING]: `Session hijacking attempt from ${source}`,
      [ThreatType.PRIVILEGE_ESCALATION]: `Privilege escalation attempt by ${source}`,
      [ThreatType.DATA_BREACH_ATTEMPT]: `Data breach attempt from ${source}`,
      [ThreatType.SUSPICIOUS_PATTERN]: `Suspicious activity pattern from ${source}`,
      [ThreatType.UNAUTHORIZED_ACCESS]: `Unauthorized access attempt from ${source}`,
      [ThreatType.API_ABUSE]: `API abuse detected from ${source}`,
      [ThreatType.BOT_ACTIVITY]: `Bot activity detected from ${source}`
    };

    return descriptions[type] || `Security threat detected from ${source}`;
  }

  /**
   * Map threat type to security event type
   */
  private mapThreatToEventType(type: ThreatType): SecurityEventType {
    const mapping: Partial<Record<ThreatType, SecurityEventType>> = {
      [ThreatType.SQL_INJECTION]: SecurityEventType.SQL_INJECTION_ATTEMPT,
      [ThreatType.XSS_ATTACK]: SecurityEventType.XSS_ATTEMPT,
      [ThreatType.CSRF_ATTACK]: SecurityEventType.CSRF_VIOLATION,
      [ThreatType.SESSION_HIJACKING]: SecurityEventType.SESSION_HIJACK_ATTEMPT,
      [ThreatType.PRIVILEGE_ESCALATION]: SecurityEventType.PRIVILEGE_ESCALATION,
      [ThreatType.BRUTE_FORCE]: SecurityEventType.SECURITY_VIOLATION,
      [ThreatType.UNAUTHORIZED_ACCESS]: SecurityEventType.ACCESS_DENIED
    };

    return mapping[type] || SecurityEventType.SECURITY_VIOLATION;
  }

  /**
   * Generate threat ID
   */
  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get security metrics
   */
  public getMetrics(): any {
    const threats = Array.from(this.threats.values());
    const now = Date.now();
    const last24h = threats.filter(
      t => now - t.timestamp.getTime() < 86400000
    );

    return {
      totalThreats: threats.length,
      last24Hours: last24h.length,
      blockedIPs: this.blockedIPs.size,
      threatsBySeverity: {
        critical: threats.filter(t => t.severity === 'critical').length,
        high: threats.filter(t => t.severity === 'high').length,
        medium: threats.filter(t => t.severity === 'medium').length,
        low: threats.filter(t => t.severity === 'low').length
      },
      threatsByType: Object.values(ThreatType).reduce((acc, type) => {
        acc[type] = threats.filter(t => t.type === type).length;
        return acc;
      }, {} as Record<string, number>),
      mitigationRate: threats.filter(t => t.mitigationApplied).length / threats.length
    };
  }
}