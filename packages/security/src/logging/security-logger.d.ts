/**
 * Security Audit Logger
 * HIPAA-compliant audit logging for security events
 */
export declare enum SecurityEventType {
    AUTH_SUCCESS = "AUTH_SUCCESS",
    AUTH_FAILURE = "AUTH_FAILURE",
    ACCESS_GRANTED = "ACCESS_GRANTED",
    ACCESS_DENIED = "ACCESS_DENIED",
    DATA_ACCESS = "DATA_ACCESS",
    DATA_MODIFICATION = "DATA_MODIFICATION",
    DATA_DELETION = "DATA_DELETION",
    SECURITY_VIOLATION = "SECURITY_VIOLATION",
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    CSRF_VIOLATION = "CSRF_VIOLATION",
    XSS_ATTEMPT = "XSS_ATTEMPT",
    SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION",
    SESSION_HIJACK_ATTEMPT = "SESSION_HIJACK_ATTEMPT",
    ENCRYPTION_ERROR = "ENCRYPTION_ERROR",
    KEY_ROTATION = "KEY_ROTATION",
    AUDIT_LOG_ACCESS = "AUDIT_LOG_ACCESS",
    SYSTEM_ERROR = "SYSTEM_ERROR"
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
export declare class SecurityLogger {
    private logger;
    private auditLogger;
    private encryptionService;
    private previousHash;
    private logChain;
    private alertThresholds;
    private eventCounters;
    constructor();
    /**
     * Create main security logger
     */
    private createLogger;
    /**
     * Create audit logger for compliance
     */
    private createAuditLogger;
    /**
     * Initialize alert thresholds for different event types
     */
    private initializeAlertThresholds;
    /**
     * Log security event
     */
    logSecurityEvent(event: SecurityEvent): void;
    /**
     * Create audit log entry with integrity checks
     */
    private createAuditLogEntry;
    /**
     * Calculate hash for audit log entry
     */
    private calculateHash;
    /**
     * Sign audit log entry
     */
    private signEntry;
    /**
     * Verify audit log integrity
     */
    verifyLogIntegrity(entries: AuditLogEntry[]): boolean;
    /**
     * Check alert conditions
     */
    private checkAlertConditions;
    /**
     * Trigger security alert
     */
    private triggerSecurityAlert;
    /**
     * Send security notification
     */
    private sendSecurityNotification;
    /**
     * Clean up event counters
     */
    private cleanupEventCounters;
    /**
     * Generate unique event ID
     */
    private generateEventId;
    /**
     * Log methods for different levels
     */
    info(message: string, metadata?: any): void;
    warn(message: string, metadata?: any): void;
    error(message: string, error?: Error, metadata?: any): void;
    audit(message: string, metadata?: any): void;
    critical(message: string, metadata?: any): void;
    /**
     * Log authentication events
     */
    logAuth(success: boolean, userId?: string, metadata?: any): void;
    /**
     * Log data access events
     */
    logDataAccess(userId: string, resource: string, action: string, metadata?: any): void;
    /**
     * Log security violations
     */
    logViolation(type: SecurityEventType, metadata?: any): void;
    /**
     * Export audit logs for compliance
     */
    exportAuditLogs(startDate: Date, endDate: Date): Promise<AuditLogEntry[]>;
    /**
     * Get security metrics
     */
    getSecurityMetrics(): any;
}
//# sourceMappingURL=security-logger.d.ts.map