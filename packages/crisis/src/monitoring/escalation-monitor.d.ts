/**
 * ASTRAL_CORE 2.0 Emergency Escalation Monitoring System
 *
 * CRITICAL SYSTEM MONITORING
 *
 * Real-time monitoring and alerting for the emergency escalation system.
 * Tracks performance, availability, and response metrics for all escalation levels.
 *
 * Features:
 * - Real-time performance monitoring
 * - Escalation audit trail
 * - Alert system for system failures
 * - Response time analysis
 * - Geographic distribution tracking
 * - 24/7 system health monitoring
 */
import type { EscalationResult } from '../emergency-escalate';
export interface EscalationMetrics {
    totalEscalations: number;
    escalationsByLevel: Record<1 | 2 | 3 | 4 | 5, number>;
    averageResponseTime: number;
    responseTimeByLevel: Record<1 | 2 | 3 | 4 | 5, number>;
    targetsMet: number;
    targetsMissed: number;
    successRate: number;
    volunteerAssignmentRate: number;
    hotlineContactRate: number;
    emergencyServicesContactRate: number;
    geographicDistribution: Record<string, number>;
    hourlyDistribution: Record<string, number>;
}
export interface SystemAlert {
    id: string;
    type: 'PERFORMANCE' | 'AVAILABILITY' | 'ERROR' | 'THRESHOLD' | 'SECURITY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    timestamp: Date;
    escalationLevel?: 1 | 2 | 3 | 4 | 5;
    sessionId?: string;
    responseTime?: number;
    targetTime?: number;
    resolved: boolean;
    resolvedAt?: Date;
    metadata?: any;
}
export interface AuditEntry {
    id: string;
    timestamp: Date;
    action: string;
    sessionId: string;
    escalationId?: string;
    level: 1 | 2 | 3 | 4 | 5;
    trigger: string;
    responseTime: number;
    targetMet: boolean;
    actionsExecuted: string[];
    volunteerAssigned: boolean;
    hotlineContacted: boolean;
    emergencyServicesContacted: boolean;
    geolocation?: {
        country: string;
        state?: string;
        region?: string;
    };
    outcome: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
    errorMessage?: string;
    metadata?: any;
}
export interface PerformanceThresholds {
    level1ResponseTime: number;
    level2ResponseTime: number;
    level3ResponseTime: number;
    level4ResponseTime: number;
    level5ResponseTime: number;
    successRateThreshold: number;
    volunteerAssignmentThreshold: number;
    hotlineContactThreshold: number;
    emergencyServicesThreshold: number;
}
export declare class EscalationMonitor {
    private static instance;
    private auditTrail;
    private activeAlerts;
    private metrics;
    private readonly thresholds;
    private constructor();
    static getInstance(): EscalationMonitor;
    /**
     * Log escalation event to audit trail
     */
    logEscalation(sessionId: string, escalationResult: EscalationResult, trigger: string, geolocation?: any): Promise<void>;
    /**
     * Create system alert
     */
    createAlert(type: SystemAlert['type'], severity: SystemAlert['severity'], message: string, metadata?: any): Promise<string>;
    /**
     * Resolve system alert
     */
    resolveAlert(alertId: string, resolution?: string): Promise<boolean>;
    /**
     * Get current system metrics
     */
    getMetrics(): EscalationMetrics;
    /**
     * Get active alerts
     */
    getActiveAlerts(): SystemAlert[];
    /**
     * Get audit trail
     */
    getAuditTrail(sessionId?: string, level?: 1 | 2 | 3 | 4 | 5, since?: Date, limit?: number): AuditEntry[];
    /**
     * Get performance report
     */
    getPerformanceReport(timeframe?: '1h' | '24h' | '7d' | '30d' | '1y'): Promise<{
        timeframe: string;
        metrics: EscalationMetrics;
        alerts: SystemAlert[];
        recommendations: string[];
        systemHealth: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
    }>;
    /**
     * Check for threshold violations and create alerts
     */
    private checkThresholds;
    /**
     * Update system metrics
     */
    private updateMetrics;
    /**
     * Calculate service contact rate
     */
    private calculateServiceRate;
    /**
     * Determine escalation outcome
     */
    private determineOutcome;
    /**
     * Initialize metrics structure
     */
    private initializeMetrics;
    /**
     * Calculate metrics for specific time period
     */
    private calculateMetrics;
    /**
     * Generate system recommendations
     */
    private generateRecommendations;
    /**
     * Calculate overall system health
     */
    private calculateSystemHealth;
    /**
     * Get cutoff date for timeframe
     */
    private getTimeframeCutoff;
    /**
     * Start background monitoring
     */
    private startMonitoring;
    /**
     * Export audit trail for compliance
     */
    exportAuditTrail(format?: 'JSON' | 'CSV' | 'PDF', timeframe?: '24h' | '7d' | '30d' | '1y'): Promise<string>;
}
export default EscalationMonitor;
//# sourceMappingURL=escalation-monitor.d.ts.map