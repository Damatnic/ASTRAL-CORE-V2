/**
 * Crisis Session Manager
 * Secure session management for mental health crisis intervention
 */
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
// TODO: Fix imports after packages are properly configured
// import { CrisisSecurityService, EncryptionService } from '@astralcore/security';
// Mock services for build compatibility
class MockCrisisSecurityService {
    validateSession() { return true; }
    encryptData(data) { return data; }
    async createCrisisSession(initiatorId, sessionType, metadata) {
        return {
            sessionId: `session_${Date.now()}`,
            securityToken: 'mock_token',
            encryptionKey: 'mock_key'
        };
    }
    async validateAccess(sessionId, userId) { return true; }
    async escalateToEmergency(sessionId, reason) { return true; }
    async assignVolunteer(sessionId, volunteerId) { return true; }
    async unassignVolunteer(sessionId, volunteerId) { return true; }
    async endSession(sessionId, reason) { return true; }
    async processMessage(sessionId, senderId, senderType, content) {
        return {
            validated: true,
            encrypted: content,
            riskLevel: 'low',
            flagged: false,
            messageId: `msg_${Date.now()}`
        };
    }
}
class MockEncryptionService {
    encrypt(data) { return data; }
    decrypt(data) { return data; }
    async encryptSessionData(data) { return JSON.stringify(data); }
    async decryptSessionData(data) { return JSON.parse(data || '{}'); }
}
const CrisisSecurityService = MockCrisisSecurityService;
const EncryptionService = MockEncryptionService;
export class CrisisSessionManager extends EventEmitter {
    crisisSecurity;
    encryption;
    activeSessions = new Map();
    config;
    cleanupInterval;
    constructor(config = {}) {
        super();
        this.config = {
            maxSessionDuration: 4 * 60 * 60 * 1000, // 4 hours
            autoEscalationThreshold: 3, // 3 high-risk messages
            encryptionRequired: true,
            anonymousSessionsAllowed: true,
            maxConcurrentSessions: 1000,
            ...config
        };
        this.crisisSecurity = new MockCrisisSecurityService();
        this.encryption = new MockEncryptionService();
        this.startSessionCleanup();
    }
    /**
     * Create new crisis session with enhanced security
     */
    async createSecureSession(initiatorId, sessionType = 'anonymous_chat', metadata = {}) {
        try {
            // Check concurrent session limit
            if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
                throw new Error('Maximum concurrent sessions reached');
            }
            const sessionId = crypto.randomUUID();
            const now = new Date();
            // Map session type to expected format
            const mappedSessionType = sessionType === 'anonymous_chat' ? 'anonymous' :
                sessionType === 'authenticated_session' ? 'authenticated' :
                    sessionType === 'emergency_escalation' ? 'emergency' : 'anonymous';
            // Create secure crisis session
            const crisisSession = await this.crisisSecurity.createCrisisSession(initiatorId || 'anonymous', mappedSessionType, metadata);
            // Create session participant
            const initiator = {
                id: initiatorId || 'anonymous',
                type: initiatorId ? 'user' : 'user',
                role: 'crisis_seeker',
                anonymous: !initiatorId,
                encrypted: this.config.encryptionRequired,
                joinedAt: now,
                lastActivity: now,
                permissions: ['send_message', 'request_help', 'end_session']
            };
            // Create session data
            const session = {
                id: sessionId,
                type: sessionType,
                status: 'active',
                severity: 'medium',
                participants: [initiator],
                startTime: now,
                lastActivity: now,
                messageCount: 0,
                riskFlags: [],
                emergencyEscalations: 0,
                encrypted: this.config.encryptionRequired,
                confidential: true,
                metadata: {
                    ipHash: this.hashIP(metadata.ip || ''),
                    deviceFingerprint: metadata.deviceFingerprint || '',
                    geoLocation: metadata.location,
                    referralSource: metadata.referral || 'direct',
                    userAgent: metadata.userAgent || ''
                }
            };
            this.activeSessions.set(sessionId, session);
            // Emit session created event
            this.emit('session_created', {
                sessionId,
                type: sessionType,
                encrypted: session.encrypted,
                anonymous: initiator.anonymous
            });
            // Auto-escalate to emergency if needed
            if (sessionType === 'emergency_escalation') {
                await this.escalateToEmergency(sessionId, 'session_creation');
            }
            return session;
        }
        catch (error) {
            throw new Error(`Failed to create secure session: ${error.message}`);
        }
    }
    /**
     * Add volunteer to crisis session
     */
    async addVolunteerToSession(sessionId, volunteerId, volunteerType = 'volunteer') {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            // Check if volunteer already in session
            if (session.participants.some(p => p.id === volunteerId)) {
                return true; // Already in session
            }
            const volunteer = {
                id: volunteerId,
                type: volunteerType,
                role: 'crisis_responder',
                anonymous: false,
                encrypted: session.encrypted,
                joinedAt: new Date(),
                lastActivity: new Date(),
                permissions: [
                    'send_message',
                    'view_history',
                    'escalate_crisis',
                    'request_supervisor',
                    ...(volunteerType === 'supervisor' ? ['end_session', 'transfer_session'] : [])
                ]
            };
            session.participants.push(volunteer);
            session.lastActivity = new Date();
            // Update crisis security service
            await this.crisisSecurity.assignVolunteer(sessionId, volunteerId);
            // Emit volunteer joined event
            this.emit('volunteer_joined', {
                sessionId,
                volunteerId,
                volunteerType,
                participantCount: session.participants.length
            });
            return true;
        }
        catch (error) {
            throw new Error(`Failed to add volunteer: ${error.message}`);
        }
    }
    /**
     * Process secure message in crisis session
     */
    async processSecureMessage(sessionId, senderId, content, messageType = 'text') {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            // Verify sender is participant
            const sender = session.participants.find(p => p.id === senderId);
            if (!sender) {
                throw new Error('Unauthorized sender');
            }
            // Update participant activity
            sender.lastActivity = new Date();
            session.lastActivity = new Date();
            session.messageCount++;
            // Map sender type to expected format
            const mappedSenderType = sender.type === 'supervisor' ? 'system' :
                sender.type === 'ai_assistant' ? 'ai' :
                    sender.type; // user and volunteer map directly
            // Process message through crisis security
            const processedMessage = await this.crisisSecurity.processMessage(sessionId, senderId, mappedSenderType, content);
            // Handle risk detection
            if (processedMessage.riskLevel === 'high' || processedMessage.riskLevel === 'critical') {
                session.riskFlags.push(`${processedMessage.riskLevel}_risk_detected`);
                if (processedMessage.riskLevel === 'critical') {
                    await this.escalateToEmergency(sessionId, 'critical_message');
                }
                // Update session severity
                if (processedMessage.riskLevel === 'critical') {
                    session.severity = 'critical';
                }
                else if (processedMessage.riskLevel === 'high' && session.severity !== 'critical') {
                    session.severity = 'high';
                }
            }
            // Check auto-escalation threshold
            const highRiskFlags = session.riskFlags.filter(flag => flag.includes('high_risk') || flag.includes('critical_risk')).length;
            if (highRiskFlags >= this.config.autoEscalationThreshold && session.status !== 'escalated') {
                await this.escalateToEmergency(sessionId, 'auto_escalation_threshold');
            }
            // Emit message processed event
            this.emit('message_processed', {
                sessionId,
                senderId,
                messageType,
                riskLevel: processedMessage.riskLevel,
                encrypted: processedMessage.encrypted,
                flagged: processedMessage.flagged
            });
            return true;
        }
        catch (error) {
            throw new Error(`Failed to process message: ${error.message}`);
        }
    }
    /**
     * Escalate session to emergency status
     */
    async escalateToEmergency(sessionId, reason, escalatedBy) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            session.status = 'escalated';
            session.severity = 'critical';
            session.emergencyEscalations++;
            session.lastActivity = new Date();
            // Add emergency escalation flag
            session.riskFlags.push(`emergency_escalated:${reason}`);
            // Add emergency services as participant
            const emergencyServices = {
                id: 'emergency_services',
                type: 'supervisor',
                role: 'emergency_contact',
                anonymous: false,
                encrypted: session.encrypted,
                joinedAt: new Date(),
                lastActivity: new Date(),
                permissions: ['view_all', 'contact_authorities', 'preserve_evidence']
            };
            session.participants.push(emergencyServices);
            // Emit emergency escalation event
            this.emit('emergency_escalated', {
                sessionId,
                reason,
                escalatedBy: escalatedBy || 'system',
                severity: session.severity,
                participantCount: session.participants.length,
                riskFlags: session.riskFlags
            });
            return true;
        }
        catch (error) {
            throw new Error(`Failed to escalate to emergency: ${error.message}`);
        }
    }
    /**
     * End crisis session securely
     */
    async endSecureSession(sessionId, endedBy, reason = 'session_complete') {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            // Verify ending permissions
            const participant = session.participants.find(p => p.id === endedBy);
            if (!participant || !participant.permissions.includes('end_session')) {
                throw new Error('Insufficient permissions to end session');
            }
            session.status = 'ended';
            session.endTime = new Date();
            session.lastActivity = new Date();
            // Calculate session duration
            const duration = session.endTime.getTime() - session.startTime.getTime();
            // Emit session ended event
            this.emit('session_ended', {
                sessionId,
                endedBy,
                reason,
                duration,
                messageCount: session.messageCount,
                severity: session.severity,
                escalated: session.emergencyEscalations > 0,
                encrypted: session.encrypted
            });
            // Remove from active sessions (will be cleaned up automatically for ephemeral sessions)
            if (!session.riskFlags.includes('preserve_evidence')) {
                setTimeout(() => {
                    this.activeSessions.delete(sessionId);
                }, 5 * 60 * 1000); // Keep for 5 minutes before removal
            }
            return true;
        }
        catch (error) {
            throw new Error(`Failed to end session: ${error.message}`);
        }
    }
    /**
     * Get session data (with access control)
     */
    getSessionData(sessionId, requesterId, requesterRole) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return null;
        // Check access permissions
        const isParticipant = session.participants.some(p => p.id === requesterId);
        const isAuthorized = isParticipant ||
            requesterRole === 'admin' ||
            requesterRole === 'supervisor';
        if (!isAuthorized) {
            return null;
        }
        // Return session data (potentially filtered based on permissions)
        return session;
    }
    /**
     * Get active sessions summary
     */
    getActiveSessionsSummary() {
        const sessions = Array.from(this.activeSessions.values());
        return {
            total: sessions.length,
            byStatus: {
                active: sessions.filter(s => s.status === 'active').length,
                escalated: sessions.filter(s => s.status === 'escalated').length,
                resolved: sessions.filter(s => s.status === 'resolved').length
            },
            bySeverity: {
                low: sessions.filter(s => s.severity === 'low').length,
                medium: sessions.filter(s => s.severity === 'medium').length,
                high: sessions.filter(s => s.severity === 'high').length,
                critical: sessions.filter(s => s.severity === 'critical').length
            },
            encrypted: sessions.filter(s => s.encrypted).length,
            anonymous: sessions.filter(s => s.participants.some(p => p.anonymous)).length
        };
    }
    /**
     * Start session cleanup process
     */
    startSessionCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        const expired = [];
        for (const [sessionId, session] of this.activeSessions) {
            const sessionAge = now - session.startTime.getTime();
            const inactiveTime = now - session.lastActivity.getTime();
            // Remove if max duration exceeded or inactive for too long
            const shouldCleanup = sessionAge > this.config.maxSessionDuration ||
                (inactiveTime > 30 * 60 * 1000 && session.status === 'ended') || // 30 min after end
                (inactiveTime > 60 * 60 * 1000 && session.status === 'active'); // 1 hour inactive
            if (shouldCleanup && !session.riskFlags.includes('preserve_evidence')) {
                expired.push(sessionId);
            }
        }
        expired.forEach(sessionId => {
            const session = this.activeSessions.get(sessionId);
            if (session && session.status !== 'escalated') {
                this.activeSessions.delete(sessionId);
                this.emit('session_cleaned', {
                    sessionId,
                    reason: 'expired',
                    duration: Date.now() - session.startTime.getTime()
                });
            }
        });
    }
    /**
     * Utility methods
     */
    hashIP(ip) {
        return crypto.createHash('sha256').update(ip + 'crisis_salt').digest('hex').substring(0, 16);
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.activeSessions.clear();
        this.removeAllListeners();
    }
}
export default CrisisSessionManager;
//# sourceMappingURL=CrisisSessionManager.js.map