/**
 * ASTRAL_CORE 2.0 Crisis Intervention Engine
 *
 * This is the heart of the crisis intervention system.
 * Every millisecond counts - lives depend on the performance of this code.
 */
import { v4 as uuidv4 } from 'uuid';
import { prisma, executeWithMetrics, createCrisisSession, assignVolunteerToSession, storeCrisisMessage } from '@astralcore/database';
import { ZeroKnowledgeEncryption } from '../encryption/ZeroKnowledgeEncryption';
import { CrisisSeverityAssessment } from '../assessment/CrisisSeverityAssessment';
import { EmergencyEscalation } from '../escalation/EmergencyEscalation';
import { VolunteerMatcher } from '../matching/VolunteerMatcher';
import { CrisisWebSocketManager } from '../websocket/CrisisWebSocketManager';
import { CRISIS_CONSTANTS } from '../index';
export class CrisisInterventionEngine {
    static instance;
    encryption;
    assessment;
    escalation;
    matcher;
    websocket;
    // Performance tracking
    responseTimesMs = [];
    constructor() {
        this.encryption = new ZeroKnowledgeEncryption();
        this.assessment = new CrisisSeverityAssessment();
        this.escalation = new EmergencyEscalation();
        this.matcher = new VolunteerMatcher();
        this.websocket = new CrisisWebSocketManager();
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
                if (initialMessage) {
                    const assessment = await this.assessment.assessMessage(initialMessage);
                    severity = assessment.severity;
                    keywordsDetected = assessment.keywordsDetected;
                    riskScore = assessment.riskScore;
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
                if (responseTime > CRISIS_CONSTANTS.TARGET_RESPONSE_TIME_MS) {
                    console.warn(`⚠️ Crisis connection took ${responseTime.toFixed(2)}ms (target: ${CRISIS_CONSTANTS.TARGET_RESPONSE_TIME_MS}ms)`);
                }
                else {
                    console.log(`✅ Crisis connection established in ${responseTime.toFixed(2)}ms`);
                }
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
            console.error('🔴 CRITICAL: Crisis connection failed:', error);
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
        // Assess message for risk
        const assessment = await this.assessment.assessMessage(message);
        // Store encrypted message
        const storedMessage = await storeCrisisMessage(session.id, senderType, senderId, Buffer.from(encrypted.encryptedData, 'hex'), messageHash, {
            sentimentScore: assessment.sentimentScore,
            riskScore: assessment.riskScore,
            keywordsDetected: assessment.keywordsDetected,
        });
        // Check for escalation triggers
        if (assessment.severity >= CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD) {
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
        if (responseTime > 50) {
            console.warn(`⚠️ Message send took ${responseTime.toFixed(2)}ms (target: <50ms)`);
        }
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
        const encryptedData = message.encryptedContent.toString('hex');
        return this.encryption.decrypt(encryptedData, sessionToken);
    }
    /**
     * End crisis session and destroy encryption keys
     */
    async endSession(sessionToken, outcome, feedback) {
        await executeWithMetrics(async () => {
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
            console.log(`✅ Crisis session ended: ${sessionToken}`);
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
            const volunteer = await this.matcher.findBestMatch({
                severity,
                keywords,
                urgency: severity >= CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD ? 'HIGH' : 'NORMAL',
            });
            if (volunteer) {
                await assignVolunteerToSession(sessionId, volunteer.id);
                console.log(`✅ Volunteer ${volunteer.id} assigned to session ${sessionId}`);
            }
            else {
                console.warn(`⚠️ No available volunteers for session ${sessionId}`);
                // Queue for next available volunteer
                await this.matcher.queueSession(sessionId, severity);
            }
        }
        catch (error) {
            console.error('❌ Failed to assign volunteer:', error);
        }
    }
    async triggerEmergencyProtocolAsync(sessionId, trigger) {
        try {
            const result = await this.escalation.triggerEmergencyProtocol(sessionId, trigger);
            console.log(`🚨 Emergency protocol triggered for session ${sessionId}:`, result);
        }
        catch (error) {
            console.error('🔴 CRITICAL: Emergency protocol failed:', error);
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
        return resources.map(r => ({
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
        return resources.map(r => `${r.title}: ${r.phoneNumber || r.url}`);
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
                console.error(`🔴 PERFORMANCE ALERT: Average response time ${avgResponseTime.toFixed(2)}ms exceeds target`);
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