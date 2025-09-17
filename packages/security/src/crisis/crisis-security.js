/**
 * Crisis-Specific Security Measures
 * Enhanced security for mental health crisis intervention platform
 */
import * as crypto from 'crypto';
import { EncryptionService } from '../encryption/encryption-service';
import { AuditService } from '../audit';
import { SecurityLogger } from '../logging/security-logger';
import { BreachDetectionService } from '../breach-detection/breach-monitor';
export class CrisisSecurityService {
    logger;
    auditService;
    encryptionService;
    breachDetection;
    activeSessions = new Map();
    riskKeywords = new Set();
    emergencyContacts = new Map();
    constructor() {
        this.logger = new SecurityLogger();
        this.auditService = new AuditService();
        this.encryptionService = new EncryptionService();
        this.breachDetection = new BreachDetectionService();
        this.initializeRiskKeywords();
        this.startSessionCleanup();
    }
    /**
     * Initialize risk detection keywords
     */
    initializeRiskKeywords() {
        this.riskKeywords = new Set([
            // High-risk keywords
            'suicide', 'kill myself', 'end it all', 'not worth living',
            'harm myself', 'cut myself', 'overdose', 'pills',
            'rope', 'gun', 'jump', 'bridge',
            // Self-harm keywords
            'self harm', 'self-harm', 'cutting', 'burning',
            'hurting myself', 'pain relief', 'deserve pain',
            // Violence keywords  
            'hurt others', 'kill them', 'revenge', 'weapon',
            'violence', 'attack', 'harm them',
            // Crisis indicators
            'goodbye', 'final message', 'last time', 'can\'t go on',
            'nobody cares', 'hopeless', 'nothing left',
            'emergency', 'crisis', 'help me', 'urgent'
        ]);
    }
    /**
     * Create secure crisis session
     */
    async createCrisisSession(userId, type = 'anonymous', metadata = {}) {
        try {
            const sessionId = crypto.randomUUID();
            const session = {
                id: sessionId,
                userId,
                type,
                severity: 'medium',
                startTime: new Date(),
                encrypted: true,
                ephemeral: type === 'anonymous',
                metadata: {
                    ipHash: this.hashIP(metadata.ip || ''),
                    deviceFingerprint: metadata.deviceFingerprint || '',
                    geoLocation: metadata.location,
                    referralSource: metadata.referral
                }
            };
            this.activeSessions.set(sessionId, session);
            // Log session creation with enhanced security
            await this.auditService.logCrisisAccess(userId || 'anonymous', 'crisis_session_created', sessionId, {
                sessionType: type,
                ephemeral: session.ephemeral,
                encrypted: session.encrypted,
                ipHash: session.metadata.ipHash
            });
            // Set up automatic cleanup for anonymous sessions
            if (session.ephemeral) {
                setTimeout(() => {
                    this.cleanupSession(sessionId);
                }, 4 * 60 * 60 * 1000); // 4 hours
            }
            return session;
        }
        catch (error) {
            this.logger.error('Crisis session creation failed', error);
            throw error;
        }
    }
    /**
     * Secure message processing for crisis chat
     */
    async processMessage(sessionId, senderId, senderType, content) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error('Invalid session');
            }
            // Analyze message for risk
            const riskAnalysis = await this.analyzeMessageRisk(content);
            const message = {
                id: crypto.randomUUID(),
                sessionId,
                senderId,
                senderType,
                content: session.encrypted ? this.encryptionService.encryptField(content, 'crisis_message') : content,
                timestamp: new Date(),
                encrypted: session.encrypted,
                flagged: riskAnalysis.flagged,
                riskLevel: riskAnalysis.riskLevel,
                aiAnalysis: riskAnalysis.aiAnalysis
            };
            // Handle high-risk messages
            if (riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') {
                await this.handleHighRiskMessage(session, message);
            }
            // Log message processing
            await this.auditService.logCrisisAccess(senderId, 'crisis_message_processed', sessionId, {
                messageId: message.id,
                riskLevel: message.riskLevel,
                flagged: message.flagged,
                encrypted: message.encrypted
            });
            return message;
        }
        catch (error) {
            this.logger.error('Message processing failed', error);
            throw error;
        }
    }
    /**
     * Analyze message for risk factors
     */
    async analyzeMessageRisk(content) {
        const lowerContent = content.toLowerCase();
        const riskFactors = [];
        let riskScore = 0;
        // Check for risk keywords
        for (const keyword of this.riskKeywords) {
            if (lowerContent.includes(keyword)) {
                riskFactors.push(keyword);
                // Weight different types of keywords
                if (keyword.includes('suicide') || keyword.includes('kill')) {
                    riskScore += 10;
                }
                else if (keyword.includes('harm') || keyword.includes('cut')) {
                    riskScore += 7;
                }
                else if (keyword.includes('help') || keyword.includes('crisis')) {
                    riskScore += 5;
                }
                else {
                    riskScore += 3;
                }
            }
        }
        // Simple sentiment analysis (in production, use proper NLP)
        const negativeWords = ['sad', 'depressed', 'angry', 'hopeless', 'alone', 'worthless'];
        const positiveWords = ['better', 'hope', 'help', 'support', 'love', 'care'];
        let sentiment = 0;
        negativeWords.forEach(word => {
            if (lowerContent.includes(word))
                sentiment -= 1;
        });
        positiveWords.forEach(word => {
            if (lowerContent.includes(word))
                sentiment += 1;
        });
        // Determine risk level
        let riskLevel = 'none';
        if (riskScore >= 15)
            riskLevel = 'critical';
        else if (riskScore >= 10)
            riskLevel = 'high';
        else if (riskScore >= 5)
            riskLevel = 'medium';
        else if (riskScore > 0)
            riskLevel = 'low';
        // Generate recommendations
        const recommendations = [];
        if (riskLevel === 'critical' || riskLevel === 'high') {
            recommendations.push('Immediate human intervention required');
            recommendations.push('Consider emergency services escalation');
            recommendations.push('Preserve conversation data');
        }
        else if (riskLevel === 'medium') {
            recommendations.push('Monitor conversation closely');
            recommendations.push('Prepare crisis resources');
        }
        return {
            flagged: riskLevel === 'high' || riskLevel === 'critical',
            riskLevel,
            aiAnalysis: {
                sentiment,
                riskFactors,
                recommendations
            }
        };
    }
    /**
     * Handle high-risk messages
     */
    async handleHighRiskMessage(session, message) {
        try {
            // Update session severity
            if (message.riskLevel === 'critical') {
                session.severity = 'critical';
            }
            else if (message.riskLevel === 'high' && session.severity !== 'critical') {
                session.severity = 'high';
            }
            // Create emergency escalation if critical
            if (message.riskLevel === 'critical') {
                await this.createEmergencyEscalation(session, message);
            }
            // Alert monitoring systems
            await this.breachDetection.createBreachAlert({
                type: 'data_access_anomaly',
                severity: message.riskLevel === 'critical' ? 'critical' : 'high',
                description: `High-risk crisis message detected in session ${session.id}`,
                userId: session.userId,
                indicators: message.aiAnalysis?.riskFactors.map(factor => ({
                    type: 'risk_keyword',
                    value: factor,
                    confidence: 0.9
                })) || [],
                automated: false,
                affectedData: {
                    type: 'phi',
                    records: 1,
                    details: { sessionId: session.id, messageId: message.id }
                }
            });
            // Log high-risk event
            await this.auditService.logEvent({
                action: 'high_risk_message_detected',
                resource: 'crisis',
                resourceId: session.id,
                details: {
                    messageId: message.id,
                    riskLevel: message.riskLevel,
                    riskFactors: message.aiAnalysis?.riskFactors,
                    sessionSeverity: session.severity
                },
                phi: true,
                risk: 'critical'
            });
        }
        catch (error) {
            this.logger.error('High-risk message handling failed', error);
        }
    }
    /**
     * Create emergency escalation
     */
    async createEmergencyEscalation(session, message) {
        const escalationId = crypto.randomUUID();
        const escalation = {
            id: escalationId,
            sessionId: session.id,
            userId: session.userId,
            triggeredBy: 'ai',
            severity: 'critical',
            reason: `Critical risk message detected: ${message.aiAnalysis?.riskFactors.join(', ')}`,
            location: session.metadata.geoLocation ? {
                country: 'US', // This would be determined from actual geo data
                region: session.metadata.geoLocation,
                approximate: true
            } : undefined,
            actions: [],
            resolved: false,
            timestamp: new Date()
        };
        // Execute emergency actions
        const actions = [
            'alert_supervisor',
            'preserve_evidence',
            'notify_emergency'
        ];
        for (const actionType of actions) {
            try {
                const result = await this.executeEmergencyAction(actionType, escalation);
                escalation.actions.push({
                    type: actionType,
                    executed: true,
                    timestamp: new Date(),
                    result
                });
            }
            catch (error) {
                escalation.actions.push({
                    type: actionType,
                    executed: false,
                    timestamp: new Date(),
                    result: error
                });
            }
        }
        // Log emergency escalation
        await this.auditService.logEvent({
            action: 'emergency_escalation_created',
            resource: 'crisis',
            resourceId: escalation.id,
            details: {
                sessionId: session.id,
                severity: escalation.severity,
                triggeredBy: escalation.triggeredBy,
                actions: escalation.actions.length,
                location: escalation.location
            },
            phi: true,
            risk: 'critical'
        });
        return escalation;
    }
    /**
     * Execute emergency action
     */
    async executeEmergencyAction(actionType, escalation) {
        switch (actionType) {
            case 'alert_supervisor':
                // Alert crisis supervisors
                return { alerted: ['supervisor1', 'supervisor2'], timestamp: new Date() };
            case 'preserve_evidence':
                // Preserve session data
                const session = this.activeSessions.get(escalation.sessionId);
                if (session) {
                    session.ephemeral = false; // Prevent auto-deletion
                }
                return { preserved: true, sessionId: escalation.sessionId };
            case 'notify_emergency':
                // This would integrate with 988 Lifeline or emergency services
                return { service: '988_lifeline', notified: true, reference: crypto.randomUUID() };
            case 'contact_authorities':
                // Contact local authorities if location is available
                if (escalation.location) {
                    return {
                        contacted: true,
                        location: escalation.location,
                        reference: crypto.randomUUID()
                    };
                }
                return { contacted: false, reason: 'No location available' };
            default:
                throw new Error(`Unknown emergency action: ${actionType}`);
        }
    }
    /**
     * Anonymize user data for privacy
     */
    anonymizeUserData(data) {
        const anonymized = { ...data };
        // Remove or hash identifying information
        if (anonymized.userId) {
            anonymized.userId = this.hashData(anonymized.userId);
        }
        if (anonymized.email) {
            delete anonymized.email;
        }
        if (anonymized.phone) {
            delete anonymized.phone;
        }
        if (anonymized.name) {
            delete anonymized.name;
        }
        if (anonymized.ip) {
            anonymized.ipHash = this.hashIP(anonymized.ip);
            delete anonymized.ip;
        }
        return anonymized;
    }
    /**
     * Secure session cleanup
     */
    async cleanupSession(sessionId) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session)
                return;
            // Only cleanup ephemeral sessions
            if (session.ephemeral) {
                session.endTime = new Date();
                // Log session cleanup
                await this.auditService.logEvent({
                    action: 'crisis_session_cleanup',
                    resource: 'crisis',
                    resourceId: sessionId,
                    details: {
                        sessionType: session.type,
                        duration: session.endTime.getTime() - session.startTime.getTime(),
                        severity: session.severity
                    },
                    phi: true,
                    risk: 'low'
                });
                // Remove from active sessions
                this.activeSessions.delete(sessionId);
            }
        }
        catch (error) {
            this.logger.error('Session cleanup failed', error);
        }
    }
    /**
     * Start automatic session cleanup
     */
    startSessionCleanup() {
        // Clean up expired sessions every hour
        setInterval(() => {
            const now = Date.now();
            const fourHoursAgo = now - (4 * 60 * 60 * 1000);
            for (const [sessionId, session] of this.activeSessions) {
                if (session.ephemeral && session.startTime.getTime() < fourHoursAgo) {
                    this.cleanupSession(sessionId);
                }
            }
        }, 60 * 60 * 1000);
    }
    /**
     * Utility methods
     */
    hashIP(ip) {
        return crypto.createHash('sha256').update(ip + 'salt').digest('hex').substring(0, 16);
    }
    hashData(data) {
        return crypto.createHash('sha256').update(data + 'data_salt').digest('hex').substring(0, 16);
    }
    /**
     * Get active sessions (for monitoring)
     */
    getActiveSessions() {
        return Array.from(this.activeSessions.values());
    }
    /**
     * Get session by ID (with access control)
     */
    getSession(sessionId, requesterId, requesterRole) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return null;
        // Access control
        if (requesterRole === 'admin' || requesterRole === 'supervisor') {
            return session;
        }
        if (session.userId === requesterId || session.volunteerId === requesterId) {
            return session;
        }
        // Log unauthorized access attempt
        this.auditService.logSecurityViolation('unauthorized_session_access', { sessionId, requesterId, requesterRole }, undefined, requesterId);
        return null;
    }
    /**
     * Update session volunteer assignment
     */
    async assignVolunteer(sessionId, volunteerId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        session.volunteerId = volunteerId;
        await this.auditService.logEvent({
            action: 'crisis_volunteer_assigned',
            resource: 'crisis',
            resourceId: sessionId,
            details: { volunteerId, sessionType: session.type },
            phi: true,
            risk: 'medium'
        });
    }
}
export default CrisisSecurityService;
//# sourceMappingURL=crisis-security.js.map