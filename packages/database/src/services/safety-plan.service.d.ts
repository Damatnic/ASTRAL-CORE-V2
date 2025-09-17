/**
 * Advanced Safety Plan Service
 * HIPAA-Compliant Safety Plan Management for Crisis Prevention & Response
 *
 * Features:
 * - Encrypted safety plan storage with version control
 * - Smart crisis detection and safety plan activation
 * - Emergency contact integration
 * - Collaborative safety planning (with consent)
 * - Evidence-based safety planning templates
 * - Crisis prediction and prevention
 */
import { SafetyPlan, SafetyPlanVersion } from '../generated/client';
export interface SafetyPlanData {
    warningSignsInternal: string[];
    warningSignsExternal: string[];
    copingStrategies: string[];
    socialSupports: string[];
    professionalContacts: string[];
    environmentalSafety: string[];
    emergencyContacts: string[];
    reasonsToLive: string[];
    crisisNumbers: string[];
    riskFactors: string[];
    protectiveFactors: string[];
    medications: string[];
    medicalConditions: string[];
    preferredCopingMethods: string[];
    pastEffectiveStrategies: string[];
    triggerPatterns: string[];
    shareWithEmergencyContacts: boolean;
    allowProfessionalAccess: boolean;
    autoActivateOnCrisis: boolean;
}
export interface CreateSafetyPlanParams {
    userId: string;
    title: string;
    planData: SafetyPlanData;
    sharedWith?: string[];
    emergencyShare?: boolean;
}
export interface UpdateSafetyPlanParams {
    planId: string;
    title?: string;
    planData?: Partial<SafetyPlanData>;
    changeLog?: string;
    sharedWith?: string[];
    emergencyShare?: boolean;
}
/**
 * Creates a new safety plan with encrypted content
 */
export declare function createSafetyPlan(params: CreateSafetyPlanParams): Promise<SafetyPlan>;
/**
 * Updates a safety plan with version control
 */
export declare function updateSafetyPlan(params: UpdateSafetyPlanParams): Promise<SafetyPlan>;
/**
 * Gets decrypted safety plan data
 */
export declare function getSafetyPlanData(planId: string, userId: string): Promise<SafetyPlanData>;
/**
 * Gets all safety plans for a user
 */
export declare function getUserSafetyPlans(userId: string): Promise<SafetyPlan[]>;
/**
 * Activates a safety plan during crisis (sends to emergency contacts)
 */
export declare function activateSafetyPlan(planId: string, userId: string, sessionId?: string, triggerReason?: string): Promise<void>;
/**
 * Gets safety plan version history
 */
export declare function getSafetyPlanVersions(planId: string, userId: string): Promise<SafetyPlanVersion[]>;
/**
 * Shares safety plan with emergency contacts or professionals
 */
export declare function shareSafetyPlan(planId: string, userId: string, shareWithEmergencyContacts: boolean, allowProfessionalAccess: boolean): Promise<SafetyPlan>;
/**
 * Creates a safety plan from template (evidence-based)
 */
export declare function createSafetyPlanFromTemplate(userId: string, templateType: 'suicide_prevention' | 'anxiety_management' | 'depression_support' | 'general_wellness'): Promise<SafetyPlan>;
/**
 * Safety plan system health check
 */
export declare function checkSafetyPlanHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    totalPlans: number;
    activePlans: number;
    recentlyUpdated: number;
    averageVersions: number;
}>;
//# sourceMappingURL=safety-plan.service.d.ts.map