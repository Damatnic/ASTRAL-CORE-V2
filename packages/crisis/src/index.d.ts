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
export * from './types/crisis.types';
export * from './types/encryption.types';
export * from './types/assessment.types';
export declare const CRISIS_CONSTANTS: {
    readonly MAX_RESPONSE_TIME_MS: 200;
    readonly TARGET_RESPONSE_TIME_MS: 100;
    readonly MAX_VOLUNTEER_ASSIGNMENT_TIME_MS: 5000;
    readonly CRITICAL_SEVERITY_THRESHOLD: 8;
    readonly EMERGENCY_KEYWORDS_THRESHOLD: 3;
    readonly AUTO_ESCALATION_TIME_MS: 300000;
    readonly ENCRYPTION_ALGORITHM: "aes-256-gcm";
    readonly KEY_DERIVATION_ITERATIONS: 100000;
    readonly SALT_LENGTH: 32;
    readonly IV_LENGTH: 16;
    readonly MAX_SESSION_DURATION_HOURS: 4;
    readonly MAX_MESSAGES_PER_SESSION: 1000;
    readonly SESSION_CLEANUP_INTERVAL_HOURS: 24;
};
//# sourceMappingURL=index.d.ts.map