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
// Types
export * from './types/volunteer.types';
export * from './types/training.types';
export * from './types/performance.types';
// Constants
export const VOLUNTEER_CONSTANTS = {
    // Training requirements
    MIN_TRAINING_HOURS: 20,
    REQUIRED_MODULES: [
        'crisis_intervention_basics',
        'active_listening',
        'de_escalation',
        'platform_protocols',
        'self_care_boundaries'
    ],
    PASSING_SCORE: 80,
    CERTIFICATION_VALIDITY_MONTHS: 12,
    // Performance standards
    MIN_RESPONSE_RATE: 0.8, // 80% of assigned sessions responded to
    MAX_RESPONSE_TIME_MS: 120000, // 2 minutes
    MIN_USER_SATISFACTION: 4.0, // Out of 5
    MAX_CONCURRENT_SESSIONS: 3,
    // Burnout prevention
    MAX_HOURS_PER_WEEK: 20,
    MAX_CRISIS_SESSIONS_PER_DAY: 8,
    MANDATORY_BREAK_HOURS: 8,
    BURNOUT_THRESHOLD: 0.7,
    // Matching criteria
    SPECIALTY_MATCH_WEIGHT: 0.3,
    LANGUAGE_MATCH_WEIGHT: 0.2,
    AVAILABILITY_WEIGHT: 0.2,
    PERFORMANCE_WEIGHT: 0.2,
    EXPERIENCE_WEIGHT: 0.1,
    // Verification
    BACKGROUND_CHECK_VALIDITY_YEARS: 2,
    REFERENCE_CHECK_COUNT: 3,
    INTERVIEW_REQUIRED: true,
};
// Volunteer status transitions
export const VOLUNTEER_STATUS_FLOW = {
    PENDING: ['TRAINING', 'REJECTED'],
    TRAINING: ['BACKGROUND_CHECK', 'FAILED'],
    BACKGROUND_CHECK: ['VERIFIED', 'REJECTED'],
    VERIFIED: ['ACTIVE', 'INACTIVE'],
    ACTIVE: ['INACTIVE', 'SUSPENDED'],
    INACTIVE: ['ACTIVE', 'REVOKED'],
    SUSPENDED: ['ACTIVE', 'REVOKED'],
    FAILED: [], // Terminal state
    REJECTED: [], // Terminal state
    REVOKED: [], // Terminal state
};
//# sourceMappingURL=index.js.map