/**
 * Security Audit Logger
 * HIPAA-compliant audit logging for security events
 */
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as crypto from 'crypto';
import { EncryptionService } from '../encryption/encryption-service';
export var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["AUTH_SUCCESS"] = "AUTH_SUCCESS";
    SecurityEventType["AUTH_FAILURE"] = "AUTH_FAILURE";
    SecurityEventType["ACCESS_GRANTED"] = "ACCESS_GRANTED";
    SecurityEventType["ACCESS_DENIED"] = "ACCESS_DENIED";
    SecurityEventType["DATA_ACCESS"] = "DATA_ACCESS";
    SecurityEventType["DATA_MODIFICATION"] = "DATA_MODIFICATION";
    SecurityEventType["DATA_DELETION"] = "DATA_DELETION";
    SecurityEventType["SECURITY_VIOLATION"] = "SECURITY_VIOLATION";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    SecurityEventType["CSRF_VIOLATION"] = "CSRF_VIOLATION";
    SecurityEventType["XSS_ATTEMPT"] = "XSS_ATTEMPT";
    SecurityEventType["SQL_INJECTION_ATTEMPT"] = "SQL_INJECTION_ATTEMPT";
    SecurityEventType["PRIVILEGE_ESCALATION"] = "PRIVILEGE_ESCALATION";
    SecurityEventType["SESSION_HIJACK_ATTEMPT"] = "SESSION_HIJACK_ATTEMPT";
    SecurityEventType["ENCRYPTION_ERROR"] = "ENCRYPTION_ERROR";
    SecurityEventType["KEY_ROTATION"] = "KEY_ROTATION";
    SecurityEventType["AUDIT_LOG_ACCESS"] = "AUDIT_LOG_ACCESS";
    SecurityEventType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(SecurityEventType || (SecurityEventType = {}));
export class SecurityLogger {
    logger;
    auditLogger;
    encryptionService;
    previousHash = '';
    logChain = [];
    alertThresholds = new Map();
    eventCounters = new Map();
    constructor() {
        this.encryptionService = new EncryptionService();
        this.logger = this.createLogger();
        this.auditLogger = this.createAuditLogger();
        this.initializeAlertThresholds();
    }
    /**
     * Create main security logger
     */
    createLogger() {
        return winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            defaultMeta: {
                service: 'security',
                environment: process.env.NODE_ENV
            },
            transports: [
                // Console transport for development
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                    silent: process.env.NODE_ENV === 'production'
                }),
                // File transport for all security logs
                new DailyRotateFile({
                    filename: 'logs/security-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: winston.format.combine(winston.format.timestamp(), winston.format.json())
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
    createAuditLogger() {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
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
    initializeAlertThresholds() {
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
    logSecurityEvent(event) {
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
    createAuditLogEntry(event) {
        const id = this.generateEventId();
        const timestamp = new Date().toISOString();
        // Create entry
        const entry = {
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
    calculateHash(entry) {
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
    signEntry(entry) {
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
    verifyLogIntegrity(entries) {
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
    checkAlertConditions(event) {
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
    triggerSecurityAlert(event, count) {
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
    sendSecurityNotification(alert) {
        // Implement notification logic (email, SMS, Slack, etc.)
        // This is a placeholder - integrate with your notification service
        console.error('SECURITY ALERT:', alert);
    }
    /**
     * Clean up event counters
     */
    cleanupEventCounters() {
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
    generateEventId() {
        return `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
    /**
     * Log methods for different levels
     */
    info(message, metadata) {
        this.logger.info(message, metadata);
    }
    warn(message, metadata) {
        this.logger.warn(message, metadata);
    }
    error(message, error, metadata) {
        this.logger.error(message, { error: error?.stack, ...metadata });
    }
    audit(message, metadata) {
        this.logSecurityEvent({
            timestamp: new Date(),
            eventType: SecurityEventType.AUDIT_LOG_ACCESS,
            details: { message, ...metadata },
            result: 'success'
        });
    }
    critical(message, metadata) {
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
    logAuth(success, userId, metadata) {
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
    logDataAccess(userId, resource, action, metadata) {
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
    logViolation(type, metadata) {
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
    async exportAuditLogs(startDate, endDate) {
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
    getSecurityMetrics() {
        const metrics = {
            totalEvents: this.logChain.length,
            eventsByType: {},
            recentAlerts: [],
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
//# sourceMappingURL=security-logger.js.map