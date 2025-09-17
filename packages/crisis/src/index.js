/**
 * ASTRAL_CORE 2.0 Crisis Intervention Engine
 *
 * CRITICAL PERFORMANCE TARGETS:
 * - Response Time: <200ms (target: 100ms)
 * - Zero Message Loss: 100% guarantee
 * - Uptime: 99.99% (52 minutes/year max)
 * - Zero-Knowledge Encryption: Per-session keys
 *
 * LIFE-SAVING FEATURES:
 * - Instant anonymous connection
 * - AI-powered severity assessment
 * - Automatic emergency escalation
 * - Real-time volunteer matching
 * - Perfect forward secrecy
 */
export { CrisisInterventionEngine } from './engines/CrisisInterventionEngine';
export { ZeroKnowledgeEncryption } from './encryption/ZeroKnowledgeEncryption';
export { CrisisSeverityAssessment } from './assessment/CrisisSeverityAssessment';
export { EmergencyEscalation } from './escalation/EmergencyEscalation';
export { VolunteerMatcher } from './matching/VolunteerMatcher';
export { CrisisWebSocketManager } from './websocket/CrisisWebSocketManager';
// Types
export * from './types/crisis.types';
export * from './types/encryption.types';
export * from './types/assessment.types';
// Constants
export const CRISIS_CONSTANTS = {
    // Performance targets
    MAX_RESPONSE_TIME_MS: 200,
    TARGET_RESPONSE_TIME_MS: 100,
    MAX_VOLUNTEER_ASSIGNMENT_TIME_MS: 5000,
    // Emergency thresholds
    CRITICAL_SEVERITY_THRESHOLD: 8,
    EMERGENCY_KEYWORDS_THRESHOLD: 3,
    AUTO_ESCALATION_TIME_MS: 300000, // 5 minutes
    // Encryption settings
    ENCRYPTION_ALGORITHM: 'aes-256-gcm',
    KEY_DERIVATION_ITERATIONS: 100000,
    SALT_LENGTH: 32,
    IV_LENGTH: 16,
    // Session limits
    MAX_SESSION_DURATION_HOURS: 4,
    MAX_MESSAGES_PER_SESSION: 1000,
    SESSION_CLEANUP_INTERVAL_HOURS: 24,
};
//# sourceMappingURL=index.js.map