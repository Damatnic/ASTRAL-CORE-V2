/**
 * ASTRAL_CORE 2.0 Crisis Intervention Engine
 *
 * This is the heart of the crisis intervention system.
 * Every millisecond counts - lives depend on the performance of this code.
 */
import type { CrisisConnection, CrisisMessage } from '../types/crisis.types';
export declare class CrisisInterventionEngine {
    private static instance;
    private readonly encryption;
    private readonly assessment;
    private readonly escalation;
    private readonly matcher;
    private readonly websocket;
    private readonly responseTimesMs;
    private constructor();
    static getInstance(): CrisisInterventionEngine;
    /**
     * CRITICAL METHOD: Connect anonymous user to crisis help
     * TARGET: <100ms execution time
     * REQUIREMENT: Zero registration barriers
     */
    connectAnonymous(initialMessage?: string): Promise<CrisisConnection>;
    /**
     * Send encrypted message in crisis session
     * TARGET: <50ms execution time
     */
    sendMessage(sessionToken: string, message: string, senderId: string, senderType?: 'ANONYMOUS_USER' | 'VOLUNTEER'): Promise<CrisisMessage>;
    /**
     * Retrieve and decrypt message (only for active sessions)
     */
    getMessage(messageId: string, sessionToken: string): Promise<string>;
    /**
     * End crisis session and destroy encryption keys
     */
    endSession(sessionToken: string, outcome?: string, feedback?: any): Promise<void>;
    /**
     * Get real-time crisis statistics
     */
    getCrisisStats(): Promise<{
        activeSessions: any;
        totalToday: any;
        averageResponseTimeMs: any;
        targetMet: boolean;
        volunteersOnline: number;
    }>;
    private assignVolunteerAsync;
    private triggerEmergencyProtocolAsync;
    private getImmediateResources;
    private getEmergencyResources;
    private trackResponseTime;
    private getAverageResponseTime;
    private startPerformanceMonitoring;
}
//# sourceMappingURL=CrisisInterventionEngine.d.ts.map