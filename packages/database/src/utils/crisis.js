/**
 * Crisis Database Utilities
 * Optimized for <200ms response times and zero-knowledge encryption
 */
import { prisma } from '../';
/**
 * Creates a new crisis session with optimized performance
 * Target: <50ms execution time
 */
export async function createCrisisSession(params) {
    const start = Date.now();
    const session = await prisma.crisisSession.create({
        data: {
            anonymousId: params.anonymousId,
            severity: params.severity,
            status: 'ACTIVE',
            encryptedData: params.encryptedData,
            keyDerivationSalt: params.keyDerivationSalt,
            responseTimeMs: null, // Will be updated when volunteer assigns
        },
    });
    const executionTime = Date.now() - start;
    // Log performance for monitoring
    if (executionTime > 50) {
        console.warn(`⚠️ createCrisisSession took ${executionTime}ms (target: <50ms)`);
    }
    return session;
}
/**
 * Finds active crisis sessions needing volunteers
 * Optimized for emergency response
 */
export async function findUnassignedCrisisSessions(limit = 10) {
    return await prisma.crisisSession.findMany({
        where: {
            status: 'ACTIVE',
            responderId: null,
            // Priority to high-severity cases
            severity: {
                gte: 5,
            },
        },
        orderBy: [
            { severity: 'desc' },
            { startedAt: 'asc' }, // First-in-first-out for same severity
        ],
        take: limit,
        select: {
            id: true,
            anonymousId: true,
            severity: true,
            startedAt: true,
            emergencyTriggered: true,
        },
    });
}
/**
 * Assigns a volunteer to a crisis session
 * Updates response time metrics
 */
export async function assignVolunteerToSession(sessionId, volunteerId) {
    const start = Date.now();
    const session = await prisma.crisisSession.findUnique({
        where: { id: sessionId },
        select: { startedAt: true, status: true },
    });
    if (!session || session.status !== 'ACTIVE') {
        throw new Error('Session not found or not active');
    }
    const responseTime = Date.now() - session.startedAt.getTime();
    const updatedSession = await prisma.crisisSession.update({
        where: { id: sessionId },
        data: {
            responderId: volunteerId,
            status: 'ASSIGNED',
            responseTimeMs: responseTime,
            handoffTime: responseTime,
        },
    });
    // Log if response time exceeds target
    if (responseTime > 200000) { // 200 seconds = 200,000ms
        console.error(`🔴 CRISIS RESPONSE TIME EXCEEDED: ${responseTime}ms`);
    }
    else if (responseTime > 120000) { // 2 minutes
        console.warn(`🟡 Crisis response time high: ${responseTime}ms`);
    }
    return updatedSession;
}
/**
 * Stores an encrypted crisis message
 * Zero-knowledge: message content never stored in plaintext
 */
export async function storeCrisisMessage(sessionId, senderType, senderId, encryptedContent, messageHash, metadata) {
    return await prisma.crisisMessage.create({
        data: {
            sessionId,
            senderType: senderType,
            senderId,
            encryptedContent,
            messageHash,
            sentimentScore: metadata?.sentimentScore,
            riskScore: metadata?.riskScore,
            keywordsDetected: metadata?.keywordsDetected || [],
        },
    });
}
/**
 * Triggers emergency escalation for a crisis session
 * High-priority operation for life-saving interventions
 */
export async function escalateToEmergency(sessionId, escalationType, trigger, reason, actionsTaken = []) {
    const start = Date.now();
    // Update session status
    const sessionUpdate = prisma.crisisSession.update({
        where: { id: sessionId },
        data: {
            status: 'ESCALATED',
            emergencyTriggered: true,
            escalatedAt: new Date(),
            escalationType: escalationType,
        },
    });
    // Create escalation record
    const escalationRecord = prisma.crisisEscalation.create({
        data: {
            sessionId,
            triggeredBy: trigger,
            severity: 'EMERGENCY',
            reason,
            actionsTaken,
            emergencyContacted: false, // Will be updated when contact is made
            lifeline988Called: false,
        },
    });
    // Execute both operations
    const [session, escalation] = await Promise.all([
        sessionUpdate,
        escalationRecord,
    ]);
    const executionTime = Date.now() - start;
    // Emergency escalations must be fast
    if (executionTime > 100) {
        console.error(`🔴 EMERGENCY ESCALATION SLOW: ${executionTime}ms`);
    }
    // Log the escalation for monitoring
    console.log(`🚨 EMERGENCY ESCALATED: Session ${sessionId}, Reason: ${reason}`);
    return { session, escalation };
}
/**
 * Gets crisis session statistics for monitoring
 */
export async function getCrisisSessionStats(timeframe = 'hour') {
    const timeframeMins = timeframe === 'hour' ? 60 : timeframe === 'day' ? 1440 : 10080;
    const since = new Date(Date.now() - timeframeMins * 60 * 1000);
    const [totalSessions, activeSessions, emergencySessions, averageResponseTime, escalatedSessions,] = await Promise.all([
        // Total sessions in timeframe
        prisma.crisisSession.count({
            where: { startedAt: { gte: since } },
        }),
        // Currently active sessions
        prisma.crisisSession.count({
            where: { status: 'ACTIVE' },
        }),
        // Emergency sessions
        prisma.crisisSession.count({
            where: {
                startedAt: { gte: since },
                emergencyTriggered: true,
            },
        }),
        // Average response time
        prisma.crisisSession.aggregate({
            where: {
                startedAt: { gte: since },
                responseTimeMs: { not: null },
            },
            _avg: { responseTimeMs: true },
        }),
        // Escalated sessions
        prisma.crisisSession.count({
            where: {
                startedAt: { gte: since },
                status: 'ESCALATED',
            },
        }),
    ]);
    return {
        totalSessions,
        activeSessions,
        emergencySessions,
        escalatedSessions,
        averageResponseTimeMs: averageResponseTime._avg.responseTimeMs || 0,
        responseTimeTargetMet: (averageResponseTime._avg.responseTimeMs || 0) < 200000,
        timeframe,
        since,
    };
}
/**
 * Cleans up expired crisis sessions and their encrypted data
 * Called periodically to maintain zero-knowledge guarantee
 */
export async function cleanupExpiredSessions(maxAgeHours = 24) {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    // Find expired sessions
    const expiredSessions = await prisma.crisisSession.findMany({
        where: {
            OR: [
                { status: 'RESOLVED', endedAt: { lt: cutoff } },
                { startedAt: { lt: cutoff }, status: { not: 'ACTIVE' } },
            ],
        },
        select: { id: true },
    });
    if (expiredSessions.length === 0) {
        return { cleaned: 0, message: 'No expired sessions found' };
    }
    const sessionIds = expiredSessions.map((s) => s.id);
    // Delete related data first (cascading deletes)
    await Promise.all([
        prisma.crisisMessage.deleteMany({
            where: { sessionId: { in: sessionIds } },
        }),
        prisma.crisisEscalation.deleteMany({
            where: { sessionId: { in: sessionIds } },
        }),
    ]);
    // Delete the sessions
    const deleted = await prisma.crisisSession.deleteMany({
        where: { id: { in: sessionIds } },
    });
    console.log(`🗑️ Cleaned up ${deleted.count} expired crisis sessions`);
    return {
        cleaned: deleted.count,
        message: `Successfully cleaned ${deleted.count} expired sessions`,
    };
}
//# sourceMappingURL=crisis.js.map