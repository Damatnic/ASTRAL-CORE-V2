/**
 * ASTRAL_CORE 2.0 Emergency Escalation System
 *
 * LIFE-CRITICAL EMERGENCY RESPONSE
 * Handles emergency escalations during crisis interventions.
 * Target: <30 seconds for emergency response activation
 */
import type { EmergencyProtocolResult, EscalationTrigger } from '../types/crisis.types';
export interface EmergencyEscalationRequest {
    sessionId: string;
    trigger: EscalationTrigger;
    severity: number;
    reason: string;
    context?: {
        keywords?: string[];
        riskFactors?: string[];
        timelineIndicators?: string[];
    };
}
export declare class EmergencyEscalation {
    private static instance;
    private readonly ESCALATION_TARGETS;
    private constructor();
    static getInstance(): EmergencyEscalation;
    /**
     * Trigger emergency protocol for crisis session
     * CRITICAL: <30s response time for emergency escalations
     */
    triggerEmergencyProtocol(sessionId: string, trigger: EscalationTrigger): Promise<EmergencyProtocolResult>;
    /**
     * Get emergency escalation statistics
     */
    getEscalationStats(): Promise<{
        totalEscalationsToday: number;
        averageResponseTimeMs: number;
        emergencyEscalationsToday: number;
        targetMet: boolean;
    }>;
    private determineEscalationSeverity;
    private mapTriggerToEnum;
    private contactEmergencyServices;
    private contact988Lifeline;
    private assignCrisisSpecialist;
    private generateNextSteps;
    private initializeEmergencyProtocols;
}
//# sourceMappingURL=EmergencyEscalation.d.ts.map