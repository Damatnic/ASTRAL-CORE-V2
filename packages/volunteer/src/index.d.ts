/**
 * ASTRAL_CORE 2.0 Volunteer Management Platform
 *
 * EMPOWERING CRISIS RESPONDERS:
 * - Comprehensive volunteer onboarding
 * - Evidence-based training programs
 * - Real-time performance monitoring
 * - Burnout prevention and support
 * - Smart crisis-volunteer matching
 * - Continuous education pathways
 *
 * TRAINING STANDARDS:
 * - Crisis intervention fundamentals (8 hours)
 * - Active listening mastery (4 hours)
 * - De-escalation techniques (3 hours)
 * - Platform protocols (2 hours)
 * - Self-care and boundaries (3 hours)
 * - Ongoing supervision and support
 *
 * QUALITY ASSURANCE:
 * - Background verification
 * - Skills assessment
 * - Performance monitoring
 * - Peer feedback systems
 * - Continuous improvement
 */
export { VolunteerManagementEngine } from './engines/VolunteerManagementEngine';
export { VolunteerTrainingSystem } from './training/VolunteerTrainingSystem';
export { VolunteerMatcher } from './matching/VolunteerMatcher';
export { BurnoutPreventionSystem } from './wellness/BurnoutPreventionSystem';
export { VolunteerPerformanceMonitor } from './monitoring/VolunteerPerformanceMonitor';
export { BackgroundVerification } from './verification/BackgroundVerification';
export * from './types/volunteer.types';
export * from './types/training.types';
export * from './types/performance.types';
export declare const VOLUNTEER_CONSTANTS: {
    readonly MIN_TRAINING_HOURS: 20;
    readonly REQUIRED_MODULES: readonly ["crisis_intervention_basics", "active_listening", "de_escalation", "platform_protocols", "self_care_boundaries"];
    readonly PASSING_SCORE: 80;
    readonly CERTIFICATION_VALIDITY_MONTHS: 12;
    readonly MIN_RESPONSE_RATE: 0.8;
    readonly MAX_RESPONSE_TIME_MS: 120000;
    readonly MIN_USER_SATISFACTION: 4;
    readonly MAX_CONCURRENT_SESSIONS: 3;
    readonly MAX_HOURS_PER_WEEK: 20;
    readonly MAX_CRISIS_SESSIONS_PER_DAY: 8;
    readonly MANDATORY_BREAK_HOURS: 8;
    readonly BURNOUT_THRESHOLD: 0.7;
    readonly SPECIALTY_MATCH_WEIGHT: 0.3;
    readonly LANGUAGE_MATCH_WEIGHT: 0.2;
    readonly AVAILABILITY_WEIGHT: 0.2;
    readonly PERFORMANCE_WEIGHT: 0.2;
    readonly EXPERIENCE_WEIGHT: 0.1;
    readonly BACKGROUND_CHECK_VALIDITY_YEARS: 2;
    readonly REFERENCE_CHECK_COUNT: 3;
    readonly INTERVIEW_REQUIRED: true;
};
export declare const VOLUNTEER_STATUS_FLOW: {
    readonly PENDING: readonly ["TRAINING", "REJECTED"];
    readonly TRAINING: readonly ["BACKGROUND_CHECK", "FAILED"];
    readonly BACKGROUND_CHECK: readonly ["VERIFIED", "REJECTED"];
    readonly VERIFIED: readonly ["ACTIVE", "INACTIVE"];
    readonly ACTIVE: readonly ["INACTIVE", "SUSPENDED"];
    readonly INACTIVE: readonly ["ACTIVE", "REVOKED"];
    readonly SUSPENDED: readonly ["ACTIVE", "REVOKED"];
    readonly FAILED: readonly [];
    readonly REJECTED: readonly [];
    readonly REVOKED: readonly [];
};
export interface TrainingModuleDefinition {
    id: string;
    title: string;
    description: string;
    duration: number;
    type: 'interactive' | 'video' | 'assessment' | 'simulation';
    prerequisites: string[];
    objectives: string[];
    content: {
        sections: Array<{
            title: string;
            content: string;
            resources?: string[];
            activities?: any[];
        }>;
        assessment: {
            questions: Array<{
                type: 'multiple_choice' | 'scenario' | 'essay';
                question: string;
                options?: string[];
                correctAnswer?: string;
                points: number;
            }>;
            passingScore: number;
            timeLimit?: number;
        };
    };
    isRequired: boolean;
    category: 'foundation' | 'advanced' | 'specialized' | 'continuing_education';
}
//# sourceMappingURL=index.d.ts.map