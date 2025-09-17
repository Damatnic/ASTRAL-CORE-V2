/**
 * ASTRAL_CORE 2.0 Emergency Override Protocols
 *
 * LIFE-CRITICAL EMERGENCY OVERRIDES:
 * - Immediate intervention bypass for imminent danger
 * - Manual override capabilities for crisis supervisors
 * - Emergency service direct contact protocols
 * - Location services integration for life-threatening situations
 * - Automated safety net when all else fails
 *
 * ACTIVATION TRIGGERS:
 * - Multiple emergency keywords in single message
 * - Severity score >= 9.5 with immediate time indicators
 * - Manual supervisor override
 * - System-detected imminent danger patterns
 * - Failed volunteer assignment for critical case
 */
import type { CrisisAssessment } from '../types/assessment.types';
export interface EmergencyOverrideRequest {
    sessionId: string;
    trigger: EmergencyOverrideTrigger;
    severity: number;
    message?: string;
    userLocation?: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    supervisorId?: string;
    reason: string;
    immediateAction: boolean;
}
export interface EmergencyOverrideResponse {
    overrideId: string;
    activated: boolean;
    actionsInitiated: EmergencyAction[];
    emergencyContacts: EmergencyContact[];
    responseTimeMs: number;
    estimatedArrivalTime?: number;
    trackingId?: string;
    fallbackPlan: string[];
}
export type EmergencyOverrideTrigger = 'IMMINENT_DANGER_DETECTED' | 'SUPERVISOR_MANUAL_OVERRIDE' | 'SYSTEM_FAILURE_PROTECTION' | 'LOCATION_BASED_EMERGENCY' | 'FAILED_VOLUNTEER_ASSIGNMENT' | 'MULTIPLE_EMERGENCY_KEYWORDS' | 'ESCALATION_TIMEOUT';
export type EmergencyAction = 'EMERGENCY_SERVICES_DISPATCHED' | 'LOCATION_SERVICES_ACTIVATED' | 'CRISIS_HOTLINE_CONNECTED' | 'SUPERVISOR_ALERTED' | 'EMERGENCY_CONTACT_NOTIFIED' | 'WELLNESS_CHECK_REQUESTED' | 'CRISIS_TEAM_MOBILIZED' | 'HOSPITAL_ALERT_SENT';
export interface EmergencyContact {
    type: 'EMERGENCY_SERVICES' | 'CRISIS_HOTLINE' | 'HOSPITAL' | 'MENTAL_HEALTH_CRISIS';
    name: string;
    phone: string;
    location?: string;
    estimatedResponse: number;
    capabilities: string[];
}
export declare class EmergencyOverrideProtocol {
    private static instance;
    private readonly OVERRIDE_TARGETS;
    private readonly EMERGENCY_CONTACTS;
    private readonly activeOverrides;
    private constructor();
    static getInstance(): EmergencyOverrideProtocol;
    /**
     * Activate emergency override protocol
     * TARGET: <5s activation time
     */
    activateEmergencyOverride(request: EmergencyOverrideRequest): Promise<EmergencyOverrideResponse>;
    /**
     * Check if emergency override should be triggered automatically
     */
    shouldTriggerOverride(assessment: CrisisAssessment, context?: any): boolean;
    /**
     * Get override status for tracking
     */
    getOverrideStatus(overrideId: string): EmergencyOverrideResponse | null;
    /**
     * Complete emergency override (when situation is resolved)
     */
    completeOverride(overrideId: string, outcome: string): Promise<void>;
    private assessImmediateSafety;
    private determineEmergencyActions;
    private contactEmergencyServices;
    private activateLocationServices;
    private alertSupervisors;
    private establishEmergencyContact;
    private getEmergencyContacts;
    private generateTrackingId;
    private createFallbackPlan;
    private createEmergencyFallback;
    private logEmergencyOverride;
    private logEmergencyServiceContact;
    private logOverrideCompletion;
    private initializeEmergencyProtocols;
}
//# sourceMappingURL=EmergencyOverride.d.ts.map