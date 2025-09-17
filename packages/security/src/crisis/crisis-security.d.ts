/**
 * Crisis-Specific Security Measures
 * Enhanced security for mental health crisis intervention platform
 */
export interface CrisisSession {
    id: string;
    userId?: string;
    volunteerId?: string;
    type: 'anonymous' | 'authenticated' | 'emergency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    startTime: Date;
    endTime?: Date;
    encrypted: boolean;
    ephemeral: boolean;
    metadata: {
        ipHash: string;
        deviceFingerprint: string;
        geoLocation?: string;
        referralSource?: string;
    };
}
export interface CrisisMessage {
    id: string;
    sessionId: string;
    senderId: string;
    senderType: 'user' | 'volunteer' | 'system' | 'ai';
    content: string;
    timestamp: Date;
    encrypted: boolean;
    flagged: boolean;
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    aiAnalysis?: {
        sentiment: number;
        riskFactors: string[];
        recommendations: string[];
    };
}
export interface EmergencyEscalation {
    id: string;
    sessionId: string;
    userId?: string;
    triggeredBy: 'user' | 'volunteer' | 'ai' | 'keyword';
    severity: 'urgent' | 'critical';
    reason: string;
    location?: {
        country: string;
        region?: string;
        approximate: boolean;
    };
    actions: Array<{
        type: 'notify_emergency' | 'alert_supervisor' | 'contact_authorities' | 'preserve_evidence';
        executed: boolean;
        timestamp: Date;
        result?: any;
    }>;
    resolved: boolean;
    timestamp: Date;
}
export declare class CrisisSecurityService {
    private logger;
    private auditService;
    private encryptionService;
    private breachDetection;
    private activeSessions;
    private riskKeywords;
    private emergencyContacts;
    constructor();
    /**
     * Initialize risk detection keywords
     */
    private initializeRiskKeywords;
    /**
     * Create secure crisis session
     */
    createCrisisSession(userId?: string, type?: 'anonymous' | 'authenticated' | 'emergency', metadata?: any): Promise<CrisisSession>;
    /**
     * Secure message processing for crisis chat
     */
    processMessage(sessionId: string, senderId: string, senderType: 'user' | 'volunteer' | 'system' | 'ai', content: string): Promise<CrisisMessage>;
    /**
     * Analyze message for risk factors
     */
    private analyzeMessageRisk;
    /**
     * Handle high-risk messages
     */
    private handleHighRiskMessage;
    /**
     * Create emergency escalation
     */
    private createEmergencyEscalation;
    /**
     * Execute emergency action
     */
    private executeEmergencyAction;
    /**
     * Anonymize user data for privacy
     */
    anonymizeUserData(data: any): any;
    /**
     * Secure session cleanup
     */
    private cleanupSession;
    /**
     * Start automatic session cleanup
     */
    private startSessionCleanup;
    /**
     * Utility methods
     */
    private hashIP;
    private hashData;
    /**
     * Get active sessions (for monitoring)
     */
    getActiveSessions(): CrisisSession[];
    /**
     * Get session by ID (with access control)
     */
    getSession(sessionId: string, requesterId: string, requesterRole: string): CrisisSession | null;
    /**
     * Update session volunteer assignment
     */
    assignVolunteer(sessionId: string, volunteerId: string): Promise<void>;
}
export default CrisisSecurityService;
//# sourceMappingURL=crisis-security.d.ts.map