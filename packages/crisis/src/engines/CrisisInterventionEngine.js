/**
 * ASTRAL_CORE 2.0 Crisis Intervention Engine
 *
 * This is the heart of the crisis intervention system.
 * Every millisecond counts - lives depend on the performance of this code.
 */
import { v4 as uuidv4 } from 'uuid';
import { prisma, executeWithMetrics, createCrisisSession, assignVolunteerToSession, storeCrisisMessage } from '@astralcore/database';
// TODO: Fix shared package imports
// import { logger, logCrisisEvent, logCrisisError, logCrisisCritical, logPerformance } from '@astralcore/shared';
// Mock logger functions for build compatibility
const logger = {
    info: (...args) => console.log(`[INFO]`, ...args),
    error: (...args) => console.error(`[ERROR]`, ...args),
    warn: (...args) => console.warn(`[WARN]`, ...args),
    debug: (...args) => console.log(`[DEBUG]`, ...args)
};
const logCrisisEvent = (...args) => console.log(`[CRISIS]`, ...args);
const logCrisisError = (...args) => console.error(`[CRISIS ERROR]`, ...args);
const logCrisisCritical = (...args) => console.error(`[CRISIS CRITICAL]`, ...args);
const logPerformance = (...args) => console.log(`[PERF]`, ...args);
import { ZeroKnowledgeEncryption } from '../encryption/ZeroKnowledgeEncryption';
import { CrisisSeverityAssessment } from '../assessment/CrisisSeverityAssessment';
import { EmergencyEscalation } from '../escalation/EmergencyEscalation';
import { VolunteerMatcher } from '../matching/VolunteerMatcher';
import { OptimizedVolunteerMatcher } from '../matching/OptimizedVolunteerMatcher';
import { CrisisWebSocketManager } from '../websocket/CrisisWebSocketManager';
import { EmergencyOverrideProtocol } from '../protocols/EmergencyOverride';
import { CRISIS_CONSTANTS } from '../index';
export class CrisisInterventionEngine {
    static instance;
    encryption;
    assessment;
    escalation;
    matcher;
    optimizedMatcher;
    websocket;
    emergencyOverride;
    // Performance tracking
    responseTimesMs = [];
    constructor() {
        this.encryption = new ZeroKnowledgeEncryption();
        this.assessment = new CrisisSeverityAssessment();
        this.escalation = EmergencyEscalation.getInstance();
        this.matcher = VolunteerMatcher.getInstance();
        this.optimizedMatcher = OptimizedVolunteerMatcher.getInstance();
        this.websocket = CrisisWebSocketManager.getInstance();
        this.emergencyOverride = EmergencyOverrideProtocol.getInstance();
        // Start performance monitoring
        this.startPerformanceMonitoring();
    }
    static getInstance() {
        if (!CrisisInterventionEngine.instance) {
            CrisisInterventionEngine.instance = new CrisisInterventionEngine();
        }
        return CrisisInterventionEngine.instance;
    }
    /**
     * CRITICAL METHOD: Connect anonymous user to crisis help
     * TARGET: <100ms execution time
     * REQUIREMENT: Zero registration barriers
     */
    async connectAnonymous(initialMessage) {
        const startTime = performance.now();
        const performanceId = `crisis-connect-${Date.now()}`;
        try {
            return await executeWithMetrics(async () => {
                // Generate anonymous ID (no PII)
                const anonymousId = uuidv4();
                // Assess initial severity if message provided
                let severity = 5; // Default moderate severity
                let keywordsDetected = [];
                let riskScore = 5;
                let riskBreakdown = null;
                if (initialMessage) {
                    const assessment = await this.assessment.assessMessageWithRiskScore(initialMessage, anonymousId);
                    severity = assessment.severity;
                    keywordsDetected = assessment.keywordsDetected;
                    riskScore = assessment.riskScore;
                    riskBreakdown = assessment.riskBreakdown;
                }
                // Create encryption keys for this session
                const sessionToken = await this.encryption.generateSessionToken();
                const encryptionKeys = this.encryption.generateSessionKeys(sessionToken);
                // Encrypt initial message if provided
                let encryptedData;
                let keyDerivationSalt;
                if (initialMessage) {
                    const encrypted = this.encryption.encrypt(initialMessage, sessionToken);
                    encryptedData = Buffer.from(encrypted.encryptedData, 'hex');
                    keyDerivationSalt = Buffer.from(encrypted.salt, 'hex');
                }
                // Create crisis session in database
                const session = await createCrisisSession({
                    anonymousId,
                    severity,
                    encryptedData,
                    keyDerivationSalt,
                });
                // Store initial message if provided
                if (initialMessage && encryptedData) {
                    await storeCrisisMessage(session.id, 'ANONYMOUS_USER', anonymousId, encryptedData, this.encryption.generateMessageHash(initialMessage), {
                        riskScore,
                        keywordsDetected,
                    });
                }
                // Find available volunteer (async, don't wait)
                this.assignVolunteerAsync(session.id, severity, keywordsDetected);
                // Establish WebSocket connection
                const websocketConnection = await this.websocket.createConnection({
                    sessionId: session.id,
                    anonymousId,
                    sessionToken,
                    severity,
                    isEmergency: severity >= CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD,
                });
                // Check for immediate escalation needs
                if (severity >= CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD ||
                    keywordsDetected.some(keyword => this.assessment.isEmergencyKeyword(keyword))) {
                    // Trigger emergency protocol (async, don't wait)
                    this.triggerEmergencyProtocolAsync(session.id, 'AUTOMATIC_KEYWORD');
                }
                // Calculate response time
                const responseTime = performance.now() - startTime;
                this.trackResponseTime(responseTime);
                // Log performance
                logPerformance('Crisis connection established', responseTime, CRISIS_CONSTANTS.TARGET_RESPONSE_TIME_MS, session.id, { severity, anonymousId });
                return {
                    sessionId: session.id,
                    sessionToken,
                    anonymousId,
                    severity,
                    websocketUrl: websocketConnection.url,
                    encrypted: !!encryptedData,
                    responseTimeMs: responseTime,
                    targetMet: responseTime < CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS,
                    resources: await this.getImmediateResources(severity),
                };
            }, performanceId);
        }
        catch (error) {
            const responseTime = performance.now() - startTime;
            logCrisisCritical('Crisis connection failed - IMMEDIATE ATTENTION REQUIRED', 'unknown', error, { responseTime, startTime });
            // Even in failure, provide emergency resources
            throw new CrisisConnectionError('Failed to establish crisis connection', responseTime, await this.getEmergencyResources());
        }
    }
    /**
     * Send encrypted message in crisis session
     * TARGET: <50ms execution time
     */
    async sendMessage(sessionToken, message, senderId, senderType = 'ANONYMOUS_USER') {
        const startTime = performance.now();
        // Get session
        const session = await prisma.crisisSession.findUnique({
            where: { sessionToken },
            select: { id: true, status: true },
        });
        if (!session || session.status !== 'ACTIVE') {
            throw new Error('Session not found or not active');
        }
        // Encrypt message
        const encrypted = this.encryption.encrypt(message, sessionToken);
        const messageHash = this.encryption.generateMessageHash(message);
        // Assess message for risk with enhanced scoring
        const assessment = await this.assessment.assessMessageWithRiskScore(message, session.id);
        // Store encrypted message with enhanced risk data
        const storedMessage = await storeCrisisMessage(session.id, senderType, senderId, Buffer.from(encrypted.encryptedData, 'hex'), messageHash, {
            sentimentScore: assessment.sentimentScore,
            riskScore: assessment.riskScore,
            keywordsDetected: assessment.keywordsDetected,
        });
        // Check for emergency override triggers first (most critical)
        if (this.emergencyOverride.shouldTriggerOverride(assessment, assessment.riskBreakdown)) {
            this.triggerEmergencyOverrideAsync(session.id, message, assessment);
        }
        // Check for standard escalation triggers (enhanced conditions)
        else if (assessment.riskBreakdown.immediateAction ||
            assessment.riskBreakdown.riskLevel === 'CRITICAL' ||
            assessment.riskBreakdown.riskLevel === 'EMERGENCY' ||
            assessment.severity >= CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD) {
            this.triggerEmergencyProtocolAsync(session.id, 'SEVERITY_INCREASE');
        }
        // Broadcast to WebSocket
        await this.websocket.broadcastToSession(sessionToken, {
            messageId: storedMessage.id,
            senderType,
            timestamp: storedMessage.timestamp,
            encrypted: true,
            severity: assessment.severity,
        });
        const responseTime = performance.now() - startTime;
        logPerformance('Crisis message sent', responseTime, 50, session.id, { senderType, riskScore: assessment.riskScore });
        return {
            id: storedMessage.id,
            sessionId: session.id,
            senderType,
            senderId,
            timestamp: storedMessage.timestamp,
            encrypted: true,
            riskScore: assessment.riskScore,
            responseTimeMs: responseTime,
        };
    }
    /**
     * Retrieve and decrypt message (only for active sessions)
     */
    async getMessage(messageId, sessionToken) {
        const message = await prisma.crisisMessage.findUnique({
            where: { id: messageId },
            include: { session: true },
        });
        if (!message || message.session.sessionToken !== sessionToken) {
            throw new Error('Message not found or access denied');
        }
        // Decrypt message
        const encryptedData = Buffer.from(message.encryptedContent).toString('hex');
        return this.encryption.decrypt(encryptedData, sessionToken);
    }
    /**
     * End crisis session and destroy encryption keys
     */
    async endSession(sessionToken, outcome, feedback) {
        await executeWithMetrics(async () => {
            // Get session data first
            const session = await prisma.crisisSession.findUnique({
                where: { sessionToken },
            });
            if (!session) {
                throw new Error('Crisis session not found');
            }
            // Update session status
            await prisma.crisisSession.update({
                where: { sessionToken },
                data: {
                    status: 'RESOLVED',
                    endedAt: new Date(),
                    outcome,
                },
            });
            // Close WebSocket connections
            await this.websocket.closeSession(sessionToken);
            // CRITICAL: Destroy encryption keys for perfect forward secrecy
            this.encryption.destroySessionKeys(sessionToken);
            logCrisisEvent('Crisis session ended successfully', sessionToken, { outcome, duration: Date.now() - new Date(session.startedAt).getTime() });
        }, 'end-crisis-session');
    }
    /**
     * Get real-time crisis statistics
     */
    async getCrisisStats() {
        return await executeWithMetrics(async () => {
            const [activeSessions, totalToday, averageResponseTime] = await Promise.all([
                prisma.crisisSession.count({ where: { status: 'ACTIVE' } }),
                prisma.crisisSession.count({
                    where: {
                        startedAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
                this.getAverageResponseTime(),
            ]);
            return {
                activeSessions,
                totalToday,
                averageResponseTimeMs: averageResponseTime,
                targetMet: averageResponseTime < CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS,
                volunteersOnline: await this.matcher.getAvailableVolunteerCount(),
            };
        }, 'get-crisis-stats');
    }
    // Private helper methods
    async assignVolunteerAsync(sessionId, severity, keywords) {
        try {
            const isEmergency = severity >= CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD;
            // Use optimized matcher for faster response times
            const volunteer = await this.optimizedMatcher.findBestMatch({
                severity,
                keywords,
                urgency: isEmergency ? 'CRITICAL' : 'NORMAL',
                specializations: this.extractSpecializationsFromKeywords(keywords),
                languages: ['en'], // Default to English, can be enhanced with user preference
            }, isEmergency);
            if (volunteer) {
                await assignVolunteerToSession(sessionId, volunteer.id);
                logCrisisEvent('Volunteer successfully assigned to crisis session', sessionId, {
                    volunteerId: volunteer.anonymousId,
                    matchScore: volunteer.matchScore,
                    severity,
                    specializations: volunteer.specializations
                });
            }
            else {
                logger.warn('CrisisIntervention', 'No available volunteers for crisis session - queuing for next available', { severity, keywords }, sessionId);
                // Fallback to original matcher for queuing
                await this.matcher.queueSession(sessionId, severity);
            }
        }
        catch (error) {
            logCrisisError('Failed to assign volunteer to crisis session', sessionId, error, { severity, keywords });
        }
    }
    /**
     * Extract relevant specializations from crisis keywords
     */
    extractSpecializationsFromKeywords(keywords) {
        const specializations = [];
        const keywordLower = keywords.map(k => k.toLowerCase());
        // Map crisis keywords to volunteer specializations
        const specializationMap = {
            'suicide': ['suicide-prevention', 'crisis-intervention'],
            'self-harm': ['self-harm-support', 'crisis-intervention'],
            'panic': ['anxiety-support', 'panic-disorder'],
            'anxiety': ['anxiety-support', 'panic-disorder'],
            'depression': ['depression-support', 'mood-disorders'],
            'depressed': ['depression-support', 'mood-disorders'],
            'trauma': ['trauma-support', 'ptsd-support'],
            'addiction': ['addiction-support', 'substance-abuse'],
            'eating': ['eating-disorder-support'],
            'abuse': ['trauma-support', 'domestic-violence-support'],
        };
        for (const keyword of keywordLower) {
            for (const [trigger, specs] of Object.entries(specializationMap)) {
                if (keyword.includes(trigger)) {
                    specializations.push(...specs);
                }
            }
        }
        // Always include general crisis intervention
        if (!specializations.includes('crisis-intervention')) {
            specializations.push('crisis-intervention');
        }
        return [...new Set(specializations)]; // Remove duplicates
    }
    async triggerEmergencyProtocolAsync(sessionId, trigger) {
        try {
            const result = await this.escalation.triggerEmergencyProtocol(sessionId, trigger);
            logCrisisEvent('Emergency protocol triggered for crisis session', sessionId, { trigger, result });
        }
        catch (error) {
            logCrisisCritical('Emergency protocol failed - CRITICAL SYSTEM FAILURE', sessionId, error, { trigger });
        }
    }
    /**
     * Trigger emergency override protocol for immediate intervention
     * Used when situation requires bypassing normal procedures
     */
    async triggerEmergencyOverrideAsync(sessionId, message, assessment) {
        try {
            logCrisisCritical('EMERGENCY OVERRIDE TRIGGERED - Imminent danger detected', sessionId, undefined, { severity: assessment.severity, riskScore: assessment.riskScore });
            const overrideRequest = {
                sessionId,
                trigger: 'IMMINENT_DANGER_DETECTED',
                severity: assessment.severity,
                message,
                reason: `Automatic override: ${assessment.riskBreakdown.riskLevel} risk detected with score ${assessment.riskScore}`,
                immediateAction: true,
            };
            const result = await this.emergencyOverride.activateEmergencyOverride(overrideRequest);
            logCrisisEvent('Emergency override successfully activated', sessionId, {
                overrideId: result.overrideId,
                actions: result.actionsInitiated,
                responseTime: result.responseTimeMs,
                trackingId: result.trackingId,
                severity: assessment.severity,
                riskScore: assessment.riskScore
            });
            // Also trigger standard emergency protocol as backup
            await this.escalation.triggerEmergencyProtocol(sessionId, 'AUTOMATIC_KEYWORD');
        }
        catch (error) {
            logCrisisCritical('Emergency override failed - CRITICAL FAILURE in life-safety system', sessionId, error, { severity: assessment.severity, riskScore: assessment.riskScore });
            // Fallback to standard emergency protocol
            await this.triggerEmergencyProtocolAsync(sessionId, 'AUTOMATIC_KEYWORD');
        }
    }
    async getImmediateResources(severity) {
        const resources = await prisma.crisisResource.findMany({
            where: {
                isActive: true,
                severityMin: { lte: severity },
            },
            orderBy: { priority: 'desc' },
            take: 3,
        });
        return resources.map((r) => ({
            title: r.title,
            phone: r.phoneNumber,
            url: r.url,
            description: r.description,
        }));
    }
    async getEmergencyResources() {
        const resources = await prisma.crisisResource.findMany({
            where: {
                isActive: true,
                isEmergency: true,
            },
            orderBy: { priority: 'desc' },
        });
        return resources.map((r) => `${r.title}: ${r.phoneNumber || r.url}`);
    }
    trackResponseTime(responseTime) {
        this.responseTimesMs.push(responseTime);
        // Keep only last 1000 response times for memory efficiency
        if (this.responseTimesMs.length > 1000) {
            this.responseTimesMs.shift();
        }
    }
    getAverageResponseTime() {
        if (this.responseTimesMs.length === 0)
            return 0;
        const sum = this.responseTimesMs.reduce((a, b) => a + b, 0);
        return sum / this.responseTimesMs.length;
    }
    startPerformanceMonitoring() {
        // Monitor response times every minute
        setInterval(() => {
            const avgResponseTime = this.getAverageResponseTime();
            if (avgResponseTime > CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS) {
                logger.error('PerformanceMonitor', `PERFORMANCE ALERT: Crisis system response time exceeds target - ${avgResponseTime.toFixed(2)}ms`, undefined, {
                    avgResponseTime,
                    target: CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS,
                    recentSamples: this.responseTimesMs.slice(-10)
                });
            }
            // Update metrics in database
            prisma.performanceMetric.create({
                data: {
                    metricType: 'crisis_response_time',
                    value: avgResponseTime,
                    unit: 'ms',
                    target: CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS,
                    status: avgResponseTime > CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS ? 'CRITICAL' : 'NORMAL',
                },
            }).catch(() => {
                // Don't fail if metrics logging fails
            });
        }, 60000); // Every minute
    }
}
// Custom error class for crisis connection failures
class CrisisConnectionError extends Error {
    responseTime;
    emergencyResources;
    constructor(message, responseTime, emergencyResources) {
        super(message);
        this.responseTime = responseTime;
        this.emergencyResources = emergencyResources;
        this.name = 'CrisisConnectionError';
    }
}
//# sourceMappingURL=CrisisInterventionEngine.js.map