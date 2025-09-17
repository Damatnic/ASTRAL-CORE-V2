/**
 * HIPAA-Compliant Audit Logging System
 * Comprehensive audit trail for mental health data access and operations
 */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { SecurityLogger } from './logging/security-logger';
export class AuditService {
    logger;
    auditStore = [];
    lastHash = '';
    auditLogPath;
    encryptionKey;
    retentionPeriod = 6 * 365 * 24 * 60 * 60 * 1000; // 6 years for HIPAA
    constructor() {
        this.logger = new SecurityLogger();
        this.auditLogPath = process.env.AUDIT_LOG_PATH || path.join(process.cwd(), 'logs', 'audit');
        this.encryptionKey = process.env.AUDIT_LOG_SECRET || this.generateAuditKey();
        this.initializeAuditSystem();
    }
    /**
     * Initialize audit system
     */
    initializeAuditSystem() {
        // Create audit log directory if it doesn't exist
        if (!fs.existsSync(this.auditLogPath)) {
            fs.mkdirSync(this.auditLogPath, { recursive: true });
        }
        // Load existing audit chain
        this.loadAuditChain();
        // Start periodic cleanup
        this.startCleanupSchedule();
    }
    /**
     * Log audit event
     */
    async logEvent(event) {
        try {
            const auditEvent = {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                action: event.action || 'unknown',
                resource: event.resource || 'unknown',
                result: event.result || 'success',
                risk: event.risk || 'low',
                phi: event.phi || false,
                compliance: {
                    hipaa: event.phi || false,
                    gdpr: true,
                    sox: event.resource === 'financial' || false
                },
                hash: '',
                previousHash: this.lastHash,
                ...event
            };
            // Generate hash for tamper detection
            auditEvent.hash = this.generateEventHash(auditEvent);
            this.lastHash = auditEvent.hash;
            // Store event
            this.auditStore.push(auditEvent);
            await this.persistAuditEvent(auditEvent);
            // Log security-relevant events
            if (auditEvent.risk === 'high' || auditEvent.risk === 'critical') {
                this.logger.warn('High-risk audit event', {
                    eventId: auditEvent.id,
                    action: auditEvent.action,
                    resource: auditEvent.resource,
                    risk: auditEvent.risk,
                    phi: auditEvent.phi
                });
            }
            return auditEvent;
        }
        catch (error) {
            this.logger.error('Audit logging failed', error);
            throw error;
        }
    }
    /**
     * Log PHI access (HIPAA requirement)
     */
    async logPHIAccess(userId, action, resourceId, details) {
        return this.logEvent({
            userId,
            action,
            resource: 'phi',
            resourceId,
            details,
            phi: true,
            risk: 'high',
            compliance: {
                hipaa: true,
                gdpr: true,
                sox: false
            }
        });
    }
    /**
     * Log crisis intervention access
     */
    async logCrisisAccess(userId, action, crisisId, details) {
        return this.logEvent({
            userId,
            action,
            resource: 'crisis',
            resourceId: crisisId,
            details,
            phi: true,
            risk: 'critical',
            compliance: {
                hipaa: true,
                gdpr: true,
                sox: false
            }
        });
    }
    /**
     * Log authentication events
     */
    async logAuthEvent(userId, action, ip, userAgent, details) {
        return this.logEvent({
            userId,
            action,
            resource: 'authentication',
            details,
            ip,
            userAgent,
            result: action === 'login_failed' ? 'failure' : 'success',
            risk: action === 'login_failed' ? 'medium' : 'low'
        });
    }
    /**
     * Log data access events
     */
    async logDataAccess(userId, action, resource, resourceId, isPHI = false) {
        return this.logEvent({
            userId,
            action,
            resource,
            resourceId,
            phi: isPHI,
            risk: isPHI ? 'high' : 'medium',
            compliance: {
                hipaa: isPHI,
                gdpr: true,
                sox: false
            }
        });
    }
    /**
     * Log security violations
     */
    async logSecurityViolation(action, details, ip, userId) {
        return this.logEvent({
            userId,
            action,
            resource: 'security',
            details,
            ip,
            result: 'failure',
            risk: 'critical'
        });
    }
    /**
     * Query audit events
     */
    async queryEvents(query) {
        try {
            let events = [...this.auditStore];
            // Apply filters
            if (query.userId) {
                events = events.filter(e => e.userId === query.userId);
            }
            if (query.action) {
                events = events.filter(e => e.action === query.action);
            }
            if (query.resource) {
                events = events.filter(e => e.resource === query.resource);
            }
            if (query.dateFrom) {
                events = events.filter(e => e.timestamp >= query.dateFrom);
            }
            if (query.dateTo) {
                events = events.filter(e => e.timestamp <= query.dateTo);
            }
            if (query.result) {
                events = events.filter(e => e.result === query.result);
            }
            if (query.risk) {
                events = events.filter(e => e.risk === query.risk);
            }
            if (query.phi !== undefined) {
                events = events.filter(e => e.phi === query.phi);
            }
            // Sort by timestamp (newest first)
            events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            // Apply pagination
            if (query.offset) {
                events = events.slice(query.offset);
            }
            if (query.limit) {
                events = events.slice(0, query.limit);
            }
            // Log the query
            await this.logEvent({
                action: 'audit_query',
                resource: 'audit',
                details: query,
                risk: 'medium'
            });
            return events;
        }
        catch (error) {
            this.logger.error('Audit query failed', error);
            throw error;
        }
    }
    /**
     * Generate audit summary
     */
    async generateSummary(dateFrom, dateTo) {
        try {
            let events = this.auditStore;
            if (dateFrom) {
                events = events.filter(e => e.timestamp >= dateFrom);
            }
            if (dateTo) {
                events = events.filter(e => e.timestamp <= dateTo);
            }
            const summary = {
                totalEvents: events.length,
                successCount: events.filter(e => e.result === 'success').length,
                failureCount: events.filter(e => e.result === 'failure').length,
                warningCount: events.filter(e => e.result === 'warning').length,
                riskDistribution: {
                    low: events.filter(e => e.risk === 'low').length,
                    medium: events.filter(e => e.risk === 'medium').length,
                    high: events.filter(e => e.risk === 'high').length,
                    critical: events.filter(e => e.risk === 'critical').length
                },
                phiAccess: events.filter(e => e.phi).length,
                uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
                topActions: this.getTopActions(events),
                complianceScore: this.calculateComplianceScore(events)
            };
            // Log summary generation
            await this.logEvent({
                action: 'audit_summary',
                resource: 'audit',
                details: { period: { from: dateFrom, to: dateTo } },
                risk: 'low'
            });
            return summary;
        }
        catch (error) {
            this.logger.error('Audit summary generation failed', error);
            throw error;
        }
    }
    /**
     * Verify audit chain integrity
     */
    verifyChainIntegrity() {
        try {
            for (let i = 1; i < this.auditStore.length; i++) {
                const current = this.auditStore[i];
                const previous = this.auditStore[i - 1];
                if (current.previousHash !== previous.hash) {
                    this.logger.error('Audit chain integrity violation', new Error(`Audit chain integrity violation for event ${current.id}`));
                    return false;
                }
                // Verify current event hash
                const { hash, ...eventForHash } = current;
                const expectedHash = this.generateEventHash(eventForHash);
                if (current.hash !== expectedHash) {
                    this.logger.error('Audit event hash mismatch', new Error(`Hash mismatch for event ${current.id}: expected ${expectedHash}, got ${current.hash}`));
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error('Audit chain verification failed', error);
            return false;
        }
    }
    /**
     * Generate event hash for tamper detection
     */
    generateEventHash(event) {
        const data = JSON.stringify({
            id: event.id,
            timestamp: event.timestamp,
            userId: event.userId,
            action: event.action,
            resource: event.resource,
            resourceId: event.resourceId,
            details: event.details,
            result: event.result,
            previousHash: event.previousHash
        });
        return crypto
            .createHmac('sha256', this.encryptionKey)
            .update(data)
            .digest('hex');
    }
    /**
     * Persist audit event to secure storage
     */
    async persistAuditEvent(event) {
        try {
            const fileName = `audit_${event.timestamp.toISOString().split('T')[0]}.log`;
            const filePath = path.join(this.auditLogPath, fileName);
            const logEntry = {
                ...event,
                encrypted: true
            };
            const encryptedData = this.encryptAuditData(JSON.stringify(logEntry));
            await fs.promises.appendFile(filePath, encryptedData + '\n');
        }
        catch (error) {
            this.logger.error('Audit event persistence failed', error);
            throw error;
        }
    }
    /**
     * Load existing audit chain
     */
    loadAuditChain() {
        try {
            const files = fs.readdirSync(this.auditLogPath)
                .filter(file => file.startsWith('audit_') && file.endsWith('.log'))
                .sort();
            for (const file of files) {
                const filePath = path.join(this.auditLogPath, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.trim().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const decrypted = this.decryptAuditData(line.trim());
                            const event = JSON.parse(decrypted);
                            this.auditStore.push(event);
                            if (event.hash) {
                                this.lastHash = event.hash;
                            }
                        }
                        catch (error) {
                            this.logger.warn('Failed to load audit event', { file, error });
                        }
                    }
                }
            }
            // Sort by timestamp
            this.auditStore.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        catch (error) {
            this.logger.warn('Failed to load audit chain', error);
        }
    }
    /**
     * Encrypt audit data
     */
    encryptAuditData(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return JSON.stringify({
            iv: iv.toString('hex'),
            data: encrypted,
            authTag: authTag.toString('hex')
        });
    }
    /**
     * Decrypt audit data
     */
    decryptAuditData(encryptedData) {
        const { iv, data, authTag } = JSON.parse(encryptedData);
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * Generate audit key
     */
    generateAuditKey() {
        const key = crypto.randomBytes(32).toString('hex');
        console.warn('Generated new audit key. Store this securely:', key);
        return key;
    }
    /**
     * Get top actions from events
     */
    getTopActions(events) {
        const actionCounts = new Map();
        events.forEach(event => {
            const count = actionCounts.get(event.action) || 0;
            actionCounts.set(event.action, count + 1);
        });
        return Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    /**
     * Calculate compliance score
     */
    calculateComplianceScore(events) {
        if (events.length === 0)
            return 100;
        const failureCount = events.filter(e => e.result === 'failure').length;
        const criticalCount = events.filter(e => e.risk === 'critical').length;
        const phiViolations = events.filter(e => e.phi && e.result === 'failure').length;
        const failureRatio = failureCount / events.length;
        const criticalRatio = criticalCount / events.length;
        const phiViolationRatio = phiViolations / events.length;
        const score = 100 -
            (failureRatio * 30) -
            (criticalRatio * 40) -
            (phiViolationRatio * 50);
        return Math.max(0, Math.round(score));
    }
    /**
     * Start cleanup schedule for old audit logs
     */
    startCleanupSchedule() {
        // Run cleanup daily
        setInterval(() => {
            this.cleanupOldLogs();
        }, 24 * 60 * 60 * 1000);
    }
    /**
     * Clean up old audit logs (keeping retention period)
     */
    cleanupOldLogs() {
        try {
            const cutoffDate = new Date(Date.now() - this.retentionPeriod);
            // Remove events older than retention period
            this.auditStore = this.auditStore.filter(event => event.timestamp >= cutoffDate);
            this.logger.audit('Audit log cleanup completed', {
                action: 'audit_cleanup',
                cutoffDate: cutoffDate.toISOString(),
                retainedEvents: this.auditStore.length
            });
        }
        catch (error) {
            this.logger.error('Audit log cleanup failed', error);
        }
    }
    /**
     * Export audit logs for compliance
     */
    async exportAuditLogs(dateFrom, dateTo, format = 'json') {
        try {
            const events = await this.queryEvents({ dateFrom, dateTo });
            let exportData;
            if (format === 'csv') {
                exportData = this.formatAsCSV(events);
            }
            else {
                exportData = JSON.stringify(events, null, 2);
            }
            await this.logEvent({
                action: 'audit_export',
                resource: 'audit',
                details: {
                    format,
                    period: { from: dateFrom, to: dateTo },
                    eventCount: events.length
                },
                risk: 'medium'
            });
            return exportData;
        }
        catch (error) {
            this.logger.error('Audit export failed', error);
            throw error;
        }
    }
    /**
     * Format events as CSV
     */
    formatAsCSV(events) {
        const headers = [
            'ID', 'Timestamp', 'User ID', 'Action', 'Resource', 'Resource ID',
            'Result', 'Risk', 'PHI', 'IP', 'Details', 'Hash'
        ];
        const rows = events.map(event => [
            event.id,
            event.timestamp.toISOString(),
            event.userId || '',
            event.action,
            event.resource,
            event.resourceId || '',
            event.result,
            event.risk,
            event.phi ? 'Yes' : 'No',
            event.ip || '',
            JSON.stringify(event.details || {}),
            event.hash
        ]);
        return [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    }
}
export default AuditService;
//# sourceMappingURL=audit.js.map