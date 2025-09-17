/**
 * ASTRAL_CORE 2.0 Crisis System Type Definitions
 * Comprehensive type safety for life-critical operations
 */
// Error types
export class CrisisSystemError extends Error {
    code;
    severity;
    context;
    constructor(message, code, severity, context) {
        super(message);
        this.code = code;
        this.severity = severity;
        this.context = context;
        this.name = 'CrisisSystemError';
    }
}
export class EmergencyEscalationError extends Error {
    sessionId;
    escalationType;
    context;
    constructor(message, sessionId, escalationType, context) {
        super(message);
        this.sessionId = sessionId;
        this.escalationType = escalationType;
        this.context = context;
        this.name = 'EmergencyEscalationError';
    }
}
//# sourceMappingURL=crisis.types.js.map