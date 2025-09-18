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
export declare function createCrisisSession(params: CreateCrisisSessionParams): Promise<any>;
/**
 * Finds active crisis sessions needing volunteers
 * Optimized for emergency response
 */
export declare function findUnassignedCrisisSessions(limit?: number): Promise<any>;
/**
 * Assigns a volunteer to a crisis session
 * Updates response time metrics
 */
export declare function assignVolunteerToSession(sessionId: string, volunteerId: string): Promise<any>;
/**
 * Stores an encrypted crisis message
 * Zero-knowledge: message content never stored in plaintext
 */
export declare function storeCrisisMessage(sessionId: string, senderType: string, senderId: string, encryptedContent: Buffer, messageHash: string, metadata?: {
    sentimentScore?: number;
    riskScore?: number;
    keywordsDetected?: string[];
}): Promise<any>;
/**
 * Triggers emergency escalation for a crisis session
 * High-priority operation for life-saving interventions
 */
export declare function escalateToEmergency(sessionId: string, escalationType: string, trigger: string, reason: string, actionsTaken?: string[]): Promise<{
    session: any;
    escalation: any;
}>;
/**
 * Gets crisis session statistics for monitoring
 */
export declare function getCrisisSessionStats(timeframe?: 'hour' | 'day' | 'week'): Promise<{
    totalSessions: any;
    activeSessions: any;
    emergencySessions: any;
    escalatedSessions: any;
    averageResponseTimeMs: any;
    responseTimeTargetMet: boolean;
    timeframe: "week" | "hour" | "day";
    since: Date;
}>;
/**
 * Cleans up expired crisis sessions and their encrypted data
 * Called periodically to maintain zero-knowledge guarantee
 */
export declare function cleanupExpiredSessions(maxAgeHours?: number): Promise<{
    cleaned: any;
    message: string;
}>;
//# sourceMappingURL=crisis.d.ts.map