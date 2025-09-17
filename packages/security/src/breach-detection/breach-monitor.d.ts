/**
 * Data Breach Detection and Response System
 * Real-time monitoring and automatic incident response for mental health platform
 */
import { EventEmitter } from 'events';
export interface BreachAlert {
    id: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'data_access_anomaly' | 'bulk_download' | 'unauthorized_access' | 'injection_attempt' | 'privilege_escalation' | 'data_exfiltration' | 'system_compromise' | 'data_breach';
    description: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    affectedData?: {
        type: 'phi' | 'pii' | 'credentials' | 'system';
        records: number;
        details?: any;
    };
    indicators: Array<{
        type: string;
        value: any;
        confidence: number;
    }>;
    automated: boolean;
    status: 'active' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
    response?: BreachResponse;
}
export interface BreachResponse {
    id: string;
    alertId: string;
    timestamp: Date;
    actions: Array<{
        type: 'block_ip' | 'disable_account' | 'revoke_session' | 'alert_admin' | 'backup_data' | 'notify_authorities';
        executed: boolean;
        timestamp: Date;
        result?: any;
    }>;
    notificationsSent: string[];
    complianceRequirements: {
        hipaa: boolean;
        gdpr: boolean;
        state: string[];
    };
}
export interface ThreatPattern {
    id: string;
    name: string;
    description: string;
    indicators: Array<{
        field: string;
        operator: 'equals' | 'contains' | 'regex' | 'threshold' | 'anomaly';
        value: any;
        weight: number;
    }>;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoResponse: boolean;
}
export interface UserBehaviorProfile {
    userId: string;
    baseline: {
        avgSessionDuration: number;
        typicalAccessPatterns: string[];
        usualLocations: string[];
        deviceFingerprints: string[];
        accessFrequency: number;
        dataAccessVolume: number;
    };
    recent: {
        sessions: Array<{
            timestamp: Date;
            duration: number;
            ip: string;
            actions: string[];
            dataAccessed: number;
        }>;
        anomalies: number;
        riskScore: number;
    };
    lastUpdated: Date;
}
export declare class BreachDetectionService extends EventEmitter {
    private logger;
    private auditService;
    private threatPatterns;
    private userProfiles;
    private activeAlerts;
    private blockedIPs;
    private monitoring;
    constructor();
    /**
     * Initialize threat detection patterns
     */
    private initializeThreatPatterns;
    /**
     * Start monitoring for security threats
     */
    startMonitoring(): void;
    /**
     * Analyze recent activities for threats
     */
    private performThreatAnalysis;
    /**
     * Check specific threat pattern against events
     */
    private checkThreatPattern;
    /**
     * Calculate threat score based on pattern indicators
     */
    private calculateThreatScore;
    /**
     * Evaluate individual indicator
     */
    private evaluateIndicator;
    /**
     * Evaluate threshold-based indicator
     */
    private evaluateThreshold;
    /**
     * Evaluate equals-based indicator
     */
    private evaluateEquals;
    /**
     * Evaluate contains-based indicator
     */
    private evaluateContains;
    /**
     * Evaluate regex-based indicator
     */
    private evaluateRegex;
    /**
     * Evaluate anomaly-based indicator
     */
    private evaluateAnomaly;
    /**
     * Create breach alert
     */
    createBreachAlert(alertData: Partial<BreachAlert>): Promise<BreachAlert>;
    /**
     * Execute automated response to breach
     */
    private executeAutomatedResponse;
    /**
     * Determine response actions based on alert
     */
    private determineResponseActions;
    /**
     * Execute specific action
     */
    private executeAction;
    /**
     * Check for behavioral anomalies
     */
    private checkBehavioralAnomalies;
    /**
     * Calculate anomaly score for user behavior
     */
    private calculateAnomalyScore;
    /**
     * Update user behavior profiles
     */
    private updateUserProfiles;
    /**
     * Utility methods
     */
    private getTimeSpan;
    private calculateDownloadVolume;
    private isOffHoursActivity;
    private isOffHours;
    private analyzeAffectedData;
    private sendNotifications;
    private sendAdminAlert;
    private initiateDataBackup;
    private notifyAuthorities;
    /**
     * Public methods
     */
    getActiveAlerts(): BreachAlert[];
    resolveAlert(alertId: string, resolution: string): Promise<void>;
    isIPBlocked(ip: string): boolean;
    unblockIP(ip: string): void;
    stopMonitoring(): void;
}
export default BreachDetectionService;
//# sourceMappingURL=breach-monitor.d.ts.map