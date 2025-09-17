/**
 * HIPAA-Compliant Audit Logging System
 * Comprehensive audit trail for mental health data access and operations
 */
export interface AuditEvent {
    id: string;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    result: 'success' | 'failure' | 'warning';
    risk: 'low' | 'medium' | 'high' | 'critical';
    phi?: boolean;
    compliance: {
        hipaa: boolean;
        gdpr: boolean;
        sox: boolean;
    };
    hash: string;
    previousHash?: string;
}
export interface AuditQuery {
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: Date;
    dateTo?: Date;
    result?: 'success' | 'failure' | 'warning';
    risk?: 'low' | 'medium' | 'high' | 'critical';
    phi?: boolean;
    limit?: number;
    offset?: number;
}
export interface AuditSummary {
    totalEvents: number;
    successCount: number;
    failureCount: number;
    warningCount: number;
    riskDistribution: Record<string, number>;
    phiAccess: number;
    uniqueUsers: number;
    topActions: Array<{
        action: string;
        count: number;
    }>;
    complianceScore: number;
}
export declare class AuditService {
    private logger;
    private auditStore;
    private lastHash;
    private auditLogPath;
    private encryptionKey;
    private retentionPeriod;
    constructor();
    /**
     * Initialize audit system
     */
    private initializeAuditSystem;
    /**
     * Log audit event
     */
    logEvent(event: Partial<AuditEvent>): Promise<AuditEvent>;
    /**
     * Log PHI access (HIPAA requirement)
     */
    logPHIAccess(userId: string, action: string, resourceId: string, details?: any): Promise<AuditEvent>;
    /**
     * Log crisis intervention access
     */
    logCrisisAccess(userId: string, action: string, crisisId: string, details?: any): Promise<AuditEvent>;
    /**
     * Log authentication events
     */
    logAuthEvent(userId: string, action: 'login' | 'logout' | 'login_failed' | 'password_change', ip?: string, userAgent?: string, details?: any): Promise<AuditEvent>;
    /**
     * Log data access events
     */
    logDataAccess(userId: string, action: 'read' | 'write' | 'delete' | 'export', resource: string, resourceId: string, isPHI?: boolean): Promise<AuditEvent>;
    /**
     * Log security violations
     */
    logSecurityViolation(action: string, details: any, ip?: string, userId?: string): Promise<AuditEvent>;
    /**
     * Query audit events
     */
    queryEvents(query: AuditQuery): Promise<AuditEvent[]>;
    /**
     * Generate audit summary
     */
    generateSummary(dateFrom?: Date, dateTo?: Date): Promise<AuditSummary>;
    /**
     * Verify audit chain integrity
     */
    verifyChainIntegrity(): boolean;
    /**
     * Generate event hash for tamper detection
     */
    private generateEventHash;
    /**
     * Persist audit event to secure storage
     */
    private persistAuditEvent;
    /**
     * Load existing audit chain
     */
    private loadAuditChain;
    /**
     * Encrypt audit data
     */
    private encryptAuditData;
    /**
     * Decrypt audit data
     */
    private decryptAuditData;
    /**
     * Generate audit key
     */
    private generateAuditKey;
    /**
     * Get top actions from events
     */
    private getTopActions;
    /**
     * Calculate compliance score
     */
    private calculateComplianceScore;
    /**
     * Start cleanup schedule for old audit logs
     */
    private startCleanupSchedule;
    /**
     * Clean up old audit logs (keeping retention period)
     */
    private cleanupOldLogs;
    /**
     * Export audit logs for compliance
     */
    exportAuditLogs(dateFrom: Date, dateTo: Date, format?: 'json' | 'csv'): Promise<string>;
    /**
     * Format events as CSV
     */
    private formatAsCSV;
}
export default AuditService;
//# sourceMappingURL=audit.d.ts.map