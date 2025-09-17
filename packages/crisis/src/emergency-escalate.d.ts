import { CrisisProfile, EmergencyProtocol, EscalationLevel } from './types';
export interface EmergencyEscalation {
    escalationId: string;
    level: EscalationLevel;
    triggeredAt: Date;
    protocol: EmergencyProtocol;
    notifiedParties: string[];
    estimatedResponseTime: number;
}
export declare class EmergencyEscalationEngine {
    private static instance;
    private escalationRules;
    private activeEscalations;
    private constructor();
    static getInstance(): EmergencyEscalationEngine;
    evaluateEscalationNeed(crisis: CrisisProfile): Promise<EmergencyEscalation | null>;
    triggerEmergencyEscalation(crisisId: string, level: EscalationLevel, reason: string): Promise<EmergencyEscalation>;
    private assessRiskLevel;
    private triggerImmediateEscalation;
    private triggerStandardEscalation;
    private getProtocolForLevel;
    private getNotificationList;
    private getEstimatedResponseTime;
    private executeEscalationProtocol;
    private sendNotification;
    private initializeEscalationRules;
    /**
     * Assess severity of a crisis message/text
     */
    assessSeverity(message: string): Promise<SeverityAssessmentResult>;
    /**
     * Get system health status
     */
    getSystemHealth(): Promise<{
        systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
        activeEscalations: number;
        responseTime: number;
        uptime: number;
        lastCheck: Date;
    }>;
}
export type { EscalationLevel } from './types';
export interface SeverityAssessmentResult {
    level: number;
    confidence: number;
    reason: string;
    riskFactors: string[];
}
export interface EscalationRequest {
    crisisId: string;
    level: EscalationLevel;
    reason: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface EscalationResult {
    escalationId: string;
    success: boolean;
    responseTime: number;
    responseTimeMs: number;
    notifiedParties: string[];
    nextActions: string[];
    nextSteps: string[];
    level: number;
    targetMet: boolean;
    actionsExecuted: number;
    volunteerAssigned: boolean;
    hotlineContacted: boolean;
    emergencyServicesContacted: boolean;
    geographicRouting: {
        region: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
        availableResources: string[];
    };
}
//# sourceMappingURL=emergency-escalate.d.ts.map