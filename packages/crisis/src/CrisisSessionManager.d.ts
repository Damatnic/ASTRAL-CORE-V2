/**
 * Crisis Session Manager
 * Secure session management for mental health crisis intervention
 */
import { EventEmitter } from 'events';
export interface CrisisSessionConfig {
    maxSessionDuration: number;
    autoEscalationThreshold: number;
    encryptionRequired: boolean;
    anonymousSessionsAllowed: boolean;
    maxConcurrentSessions: number;
}
export interface SessionParticipant {
    id: string;
    type: 'user' | 'volunteer' | 'supervisor' | 'ai_assistant';
    role: 'crisis_seeker' | 'crisis_responder' | 'supervisor' | 'emergency_contact';
    anonymous: boolean;
    encrypted: boolean;
    joinedAt: Date;
    lastActivity: Date;
    permissions: string[];
}
export interface CrisisSessionData {
    id: string;
    type: 'anonymous_chat' | 'authenticated_session' | 'emergency_escalation';
    status: 'active' | 'escalated' | 'resolved' | 'transferred' | 'ended';
    severity: 'low' | 'medium' | 'high' | 'critical';
    participants: SessionParticipant[];
    startTime: Date;
    endTime?: Date;
    lastActivity: Date;
    messageCount: number;
    riskFlags: string[];
    emergencyEscalations: number;
    encrypted: boolean;
    confidential: boolean;
    metadata: {
        ipHash: string;
        deviceFingerprint: string;
        geoLocation?: string;
        referralSource: string;
        userAgent: string;
    };
}
export declare class CrisisSessionManager extends EventEmitter {
    private crisisSecurity;
    private encryption;
    private activeSessions;
    private config;
    private cleanupInterval?;
    constructor(config?: Partial<CrisisSessionConfig>);
    /**
     * Create new crisis session with enhanced security
     */
    createSecureSession(initiatorId?: string, sessionType?: 'anonymous_chat' | 'authenticated_session' | 'emergency_escalation', metadata?: any): Promise<CrisisSessionData>;
    /**
     * Add volunteer to crisis session
     */
    addVolunteerToSession(sessionId: string, volunteerId: string, volunteerType?: 'volunteer' | 'supervisor'): Promise<boolean>;
    /**
     * Process secure message in crisis session
     */
    processSecureMessage(sessionId: string, senderId: string, content: string, messageType?: 'text' | 'system' | 'emergency'): Promise<boolean>;
    /**
     * Escalate session to emergency status
     */
    escalateToEmergency(sessionId: string, reason: string, escalatedBy?: string): Promise<boolean>;
    /**
     * End crisis session securely
     */
    endSecureSession(sessionId: string, endedBy: string, reason?: string): Promise<boolean>;
    /**
     * Get session data (with access control)
     */
    getSessionData(sessionId: string, requesterId: string, requesterRole: string): CrisisSessionData | null;
    /**
     * Get active sessions summary
     */
    getActiveSessionsSummary(): any;
    /**
     * Start session cleanup process
     */
    private startSessionCleanup;
    /**
     * Cleanup expired sessions
     */
    private cleanupExpiredSessions;
    /**
     * Utility methods
     */
    private hashIP;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
export default CrisisSessionManager;
//# sourceMappingURL=CrisisSessionManager.d.ts.map