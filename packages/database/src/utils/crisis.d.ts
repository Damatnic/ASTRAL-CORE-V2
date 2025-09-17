/**
 * Crisis Database Utilities
 * Optimized for <200ms response times and zero-knowledge encryption
 */
export interface CreateCrisisSessionParams {
    anonymousId: string;
    severity: number;
    encryptedData?: Buffer;
    keyDerivationSalt?: Buffer;
}
export interface CrisisSessionWithMetrics {
    id: string;
    anonymousId: string;
    severity: number;
    status: string;
    startedAt: Date;
    responseTimeMs?: number;
    messagesCount: number;
    isEmergency: boolean;
}
/**
 * Creates a new crisis session with optimized performance
 * Target: <50ms execution time
 */
export declare function createCrisisSession(params: CreateCrisisSessionParams): Promise<{
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import("packages/database/generated/client").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import("packages/database/generated/client").$Enums.EscalationType | null;
} | {
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import("packages/database/generated/client").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import("packages/database/generated/client").$Enums.EscalationType | null;
}>;
/**
 * Finds active crisis sessions needing volunteers
 * Optimized for emergency response
 */
export declare function findUnassignedCrisisSessions(limit?: number): Promise<{
    id: string;
    anonymousId: string;
    severity: number;
    startedAt: Date;
    emergencyTriggered: boolean;
}[] | {
    id: string;
    anonymousId: string;
    severity: number;
    startedAt: Date;
    emergencyTriggered: boolean;
}[]>;
/**
 * Assigns a volunteer to a crisis session
 * Updates response time metrics
 */
export declare function assignVolunteerToSession(sessionId: string, volunteerId: string): Promise<{
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import("packages/database/generated/client").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import("packages/database/generated/client").$Enums.EscalationType | null;
} | {
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import("packages/database/generated/client").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import("packages/database/generated/client").$Enums.EscalationType | null;
}>;
/**
 * Stores an encrypted crisis message
 * Zero-knowledge: message content never stored in plaintext
 */
export declare function storeCrisisMessage(sessionId: string, senderType: string, senderId: string, encryptedContent: Buffer, messageHash: string, metadata?: {
    sentimentScore?: number;
    riskScore?: number;
    keywordsDetected?: string[];
}): Promise<{
    sessionId: string;
    timestamp: Date;
    id: string;
    senderType: import("packages/database/generated/client").$Enums.MessageSender;
    senderId: string;
    encryptedContent: Uint8Array;
    messageHash: string;
    messageType: import("packages/database/generated/client").$Enums.MessageType;
    priority: import("packages/database/generated/client").$Enums.MessagePriority;
    sentimentScore: number | null;
    riskScore: number | null;
    riskLevel: string | null;
    keywordsDetected: string | null;
} | {
    sessionId: string;
    timestamp: Date;
    id: string;
    senderType: import("packages/database/generated/client").$Enums.MessageSender;
    senderId: string;
    encryptedContent: Uint8Array;
    messageHash: string;
    messageType: import("packages/database/generated/client").$Enums.MessageType;
    priority: import("packages/database/generated/client").$Enums.MessagePriority;
    sentimentScore: number | null;
    riskScore: number | null;
    riskLevel: string | null;
    keywordsDetected: string | null;
}>;
/**
 * Triggers emergency escalation for a crisis session
 * High-priority operation for life-saving interventions
 */
export declare function escalateToEmergency(sessionId: string, escalationType: string, trigger: string, reason: string, actionsTaken?: string[]): Promise<{
    session: {
        id: string;
        sessionToken: string;
        anonymousId: string;
        severity: number;
        status: import("packages/database/generated/client").$Enums.CrisisStatus;
        responderId: string | null;
        startedAt: Date;
        endedAt: Date | null;
        responseTimeMs: number | null;
        outcome: string | null;
        encryptedData: Uint8Array | null;
        keyDerivationSalt: Uint8Array | null;
        handoffTime: number | null;
        resolutionTime: number | null;
        emergencyTriggered: boolean;
        escalatedAt: Date | null;
        escalationType: import("packages/database/generated/client").$Enums.EscalationType | null;
    } | {
        id: string;
        sessionToken: string;
        anonymousId: string;
        severity: number;
        status: import("packages/database/generated/client").$Enums.CrisisStatus;
        responderId: string | null;
        startedAt: Date;
        endedAt: Date | null;
        responseTimeMs: number | null;
        outcome: string | null;
        encryptedData: Uint8Array | null;
        keyDerivationSalt: Uint8Array | null;
        handoffTime: number | null;
        resolutionTime: number | null;
        emergencyTriggered: boolean;
        escalatedAt: Date | null;
        escalationType: import("packages/database/generated/client").$Enums.EscalationType | null;
    };
    escalation: {
        sessionId: string;
        id: string;
        severity: import("packages/database/generated/client").$Enums.EscalationSeverity;
        outcome: import("packages/database/generated/client").$Enums.EscalationOutcome | null;
        triggeredBy: import("packages/database/generated/client").$Enums.EscalationTrigger;
        reason: string;
        actionsTaken: string | null;
        emergencyContacted: boolean;
        lifeline988Called: boolean;
        triggeredAt: Date;
        resolvedAt: Date | null;
        responseTime: number | null;
        handledBy: string | null;
    } | {
        sessionId: string;
        id: string;
        severity: import("packages/database/generated/client").$Enums.EscalationSeverity;
        outcome: import("packages/database/generated/client").$Enums.EscalationOutcome | null;
        triggeredBy: import("packages/database/generated/client").$Enums.EscalationTrigger;
        reason: string;
        actionsTaken: string | null;
        emergencyContacted: boolean;
        lifeline988Called: boolean;
        triggeredAt: Date;
        resolvedAt: Date | null;
        responseTime: number | null;
        handledBy: string | null;
    };
}>;
/**
 * Gets crisis session statistics for monitoring
 */
export declare function getCrisisSessionStats(timeframe?: 'hour' | 'day' | 'week'): Promise<{
    totalSessions: number;
    activeSessions: number;
    emergencySessions: number;
    escalatedSessions: number;
    averageResponseTimeMs: number;
    responseTimeTargetMet: boolean;
    timeframe: "hour" | "day" | "week";
    since: Date;
}>;
/**
 * Cleans up expired crisis sessions and their encrypted data
 * Called periodically to maintain zero-knowledge guarantee
 */
export declare function cleanupExpiredSessions(maxAgeHours?: number): Promise<{
    cleaned: number;
    message: string;
}>;
//# sourceMappingURL=crisis.d.ts.map