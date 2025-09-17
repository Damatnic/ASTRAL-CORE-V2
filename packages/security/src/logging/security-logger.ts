/**
 * Security Audit Logger
 * HIPAA-compliant audit logging for security events
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as crypto from 'crypto';
import { EncryptionService } from '../encryption/encryption-service';

export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETION = 'DATA_DELETION',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  SESSION_HIJACK_ATTEMPT = 'SESSION_HIJACK_ATTEMPT',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  KEY_ROTATION = 'KEY_ROTATION',
  AUDIT_LOG_ACCESS = 'AUDIT_LOG_ACCESS',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export interface SecurityEvent {
  timestamp: Date;
  eventType: SecurityEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  result?: 'success' | 'failure';
  details?: any;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  hash: string;
  previousHash?: string;
  event: SecurityEvent;
  signature?: string;
}

export class SecurityLogger {
  private logger: winston.Logger;
  private auditLogger: winston.Logger;
  private encryptionService: EncryptionService;
  private previousHash: string = '';
  private logChain: AuditLogEntry[] = [];
  private alertThresholds: Map<SecurityEventType, number> = new Map();
  private eventCounters: Map<string, number> = new Map();

  constructor() {
    this.encryptionService = new EncryptionService();
    this.logger = this.createLogger();
    this.auditLogger = this.createAuditLogger();
    this.initializeAlertThresholds();
  }

  /**
   * Create main security logger
   */
  private createLogger(): winston.Logger {
    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { 
        service: 'security',
        environment: process.env.NODE_ENV 
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
          silent: process.env.NODE_ENV === 'production'
        }),
        // File transport for all security logs
        new DailyRotateFile({
          filename: 'logs/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        // Separate file for errors
        new DailyRotateFile({
          filename: 'logs/security-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error'
        })
      ]
    });
  }

  /**
   * Create audit logger for compliance
   */
  private createAuditLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Audit logs are immutable and encrypted
        new DailyRotateFile({
          filename: 'logs/audit/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '50m',
          maxFiles: '365d', // Keep for 1 year for compliance
          auditFile: 'logs/audit/.audit-log.json'
        })
      ]
    });
  }

  /**
   * Initialize alert thresholds for different event types
   */
  private initializeAlertThresholds(): void {
    this.alertThresholds.set(SecurityEventType.AUTH_FAILURE, 5);
    this.alertThresholds.set(SecurityEventType.ACCESS_DENIED, 10);
    this.alertThresholds.set(SecurityEventType.SECURITY_VIOLATION, 1);
    this.alertThresholds.set(SecurityEventType.SQL_INJECTION_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.XSS_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.SESSION_HIJACK_ATTEMPT, 1);
    this.alertThresholds.set(SecurityEventType.PRIVILEGE_ESCALATION, 1);
    this.alertThresholds.set(SecurityEventType.RATE_LIMIT_EXCEEDED, 20);
  }

  /**
   * Log security event
   */
  public logSecurityEvent(event: SecurityEvent): void {
    // Create audit log entry
    const auditEntry = this.createAuditLogEntry(event);
    
    // Log to security logger
    this.logger.info('Security Event', auditEntry);
    
    // Log to audit logger (encrypted and tamper-proof)
    this.auditLogger.info(auditEntry);
    
    // Check for alert conditions
    this.checkAlertConditions(event);
    
    // Store in chain for integrity
    this.logChain.push(auditEntry);
    
    // Update previous hash
    this.previousHash = auditEntry.hash;
  }

  /**
   * Create audit log entry with integrity checks
   */
  private createAuditLogEntry(event: SecurityEvent): AuditLogEntry {
    const id = this.generateEventId();
    const timestamp = new Date().toISOString();
    
    // Create entry
    const entry: AuditLogEntry = {
      id,
      timestamp,
      hash: '',
      previousHash: this.previousHash,
      event: {
        ...event,
        timestamp: event.timestamp || new Date()
      }
    };

    // Calculate hash for integrity
    entry.hash = this.calculateHash(entry);
    
    // Sign the entry for non-repudiation
    entry.signature = this.signEntry(entry);

    return entry;
  }

  /**
   * Calculate hash for audit log entry
   */
  private calculateHash(entry: AuditLogEntry): string {
    const data = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      previousHash: entry.previousHash,
      event: entry.event
    });

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Sign audit log entry
   */
  private signEntry(entry: AuditLogEntry): string {
    const data = entry.hash;
    const secret = process.env.AUDIT_LOG_SECRET || 'default-secret';
    
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify audit log integrity
   */
  public verifyLogIntegrity(entries: AuditLogEntry[]): boolean {
    let previousHash = '';
    
    for (const entry of entries) {
      // Verify hash
      const calculatedHash = this.calculateHash(entry);
      if (calculatedHash !== entry.hash) {
        this.logger.error('Hash mismatch detected', { entry });
        return false;
      }

      // Verify chain
      if (entry.previousHash !== previousHash) {
        this.logger.error('Chain broken', { entry });
        return false;
      }

      // Verify signature
      const calculatedSignature = this.signEntry(entry);
      if (calculatedSignature !== entry.signature) {
        this.logger.error('Signature mismatch', { entry });
        return false;
      }

      previousHash = entry.hash;
    }

    return true;
  }

  /**
   * Check alert conditions
   */
  private checkAlertConditions(event: SecurityEvent): void {
    const key = `${event.eventType}_${event.ipAddress || 'unknown'}`;
    const count = (this.eventCounters.get(key) || 0) + 1;
    this.eventCounters.set(key, count);

    const threshold = this.alertThresholds.get(event.eventType);
    
    if (threshold && count >= threshold) {
      this.triggerSecurityAlert(event, count);
      // Reset counter after alert
      this.eventCounters.set(key, 0);
    }

    // Clean up old counters periodically
    if (this.eventCounters.size > 1000) {
      this.cleanupEventCounters();
    }
  }

  /**
   * Trigger security alert
   */
  private triggerSecurityAlert(event: SecurityEvent, count: number): void {
    const alert = {
      timestamp: new Date(),
      eventType: event.eventType,
      count,
      ipAddress: event.ipAddress,
      userId: event.userId,
      details: event.details,
      riskLevel: event.riskLevel || 'high',
      message: `Security alert: ${event.eventType} threshold exceeded (${count} occurrences)`
    };

    // Log critical alert
    this.logger.error('SECURITY ALERT', alert);

    // Send notifications (implement based on your notification service)
    this.sendSecurityNotification(alert);
  }

  /**
   * Send security notification
   */
  private sendSecurityNotification(alert: any): void {
    // Implement notification logic (email, SMS, Slack, etc.)
    // This is a placeholder - integrate with your notification service
    console.error('SECURITY ALERT:', alert);
  }

  /**
   * Clean up event counters
   */
  private cleanupEventCounters(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, _] of this.eventCounters) {
      const timestamp = parseInt(key.split('_').pop() || '0');
      if (now - timestamp > maxAge) {
        this.eventCounters.delete(key);
      }
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Log methods for different levels
   */
  public info(message: string, metadata?: any): void {
    this.logger.info(message, metadata);
  }

  public warn(message: string, metadata?: any): void {
    this.logger.warn(message, metadata);
  }

  public error(message: string, error?: Error, metadata?: any): void {
    this.logger.error(message, { error: error?.stack, ...metadata });
  }

  public audit(message: string, metadata?: any): void {
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: SecurityEventType.AUDIT_LOG_ACCESS,
      details: { message, ...metadata },
      result: 'success'
    });
  }

  public critical(message: string, metadata?: any): void {
    this.logger.error(message, metadata);
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: SecurityEventType.SYSTEM_ERROR,
      details: { message, ...metadata },
      result: 'failure',
      riskLevel: 'critical'
    });
  }

  /**
   * Log authentication events
   */
  public logAuth(success: boolean, userId?: string, metadata?: any): void {
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: success ? SecurityEventType.AUTH_SUCCESS : SecurityEventType.AUTH_FAILURE,
      userId,
      result: success ? 'success' : 'failure',
      ...metadata
    });
  }

  /**
   * Log data access events
   */
  public logDataAccess(userId: string, resource: string, action: string, metadata?: any): void {
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: SecurityEventType.DATA_ACCESS,
      userId,
      resource,
      action,
      result: 'success',
      ...metadata
    });
  }

  /**
   * Log security violations
   */
  public logViolation(type: SecurityEventType, metadata?: any): void {
    this.logSecurityEvent({
      timestamp: new Date(),
      eventType: type,
      riskLevel: 'high',
      result: 'failure',
      ...metadata
    });
  }

  /**
   * Export audit logs for compliance
   */
  public async exportAuditLogs(startDate: Date, endDate: Date): Promise<AuditLogEntry[]> {
    // Filter logs by date range
    const filtered = this.logChain.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Verify integrity before export
    if (!this.verifyLogIntegrity(filtered)) {
      throw new Error('Audit log integrity check failed');
    }

    return filtered;
  }

  /**
   * Get security metrics
   */
  public getSecurityMetrics(): any {
    const metrics = {
      totalEvents: this.logChain.length,
      eventsByType: {} as Record<string, number>,
      recentAlerts: [] as any[],
      integrityStatus: this.verifyLogIntegrity(this.logChain)
    };

    // Count events by type
    for (const entry of this.logChain) {
      const type = entry.event.eventType;
      metrics.eventsByType[type] = (metrics.eventsByType[type] || 0) + 1;
    }

    return metrics;
  }
}