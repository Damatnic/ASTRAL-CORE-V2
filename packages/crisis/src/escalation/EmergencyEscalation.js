/**
 * ASTRAL_CORE 2.0 Emergency Escalation System
 *
 * LIFE-CRITICAL EMERGENCY RESPONSE
 * Handles emergency escalations during crisis interventions.
 * Target: <30 seconds for emergency response activation
 */
import { randomUUID } from 'crypto';
// Mock database and utilities for now - will be replaced with actual imports
const prisma = {
    crisisSession: {
        findUnique: async (query) => ({ id: 'mock', severity: 5, anonymousId: 'mock', status: 'ACTIVE' }),
        update: async (query) => ({ id: 'mock' }),
    },
    crisisEscalation: {
        create: async (data) => ({ id: randomUUID(), ...data.data }),
        update: async (query) => ({ id: 'mock' }),
        count: async (query) => 10,
        aggregate: async (query) => ({ _avg: { responseTime: 25000 } }),
    },
    volunteer: {
        findFirst: async (query) => ({ id: 'mock', anonymousId: 'mock' }),
        update: async (query) => ({ id: 'mock' }),
    },
    auditLog: {
        create: async (data) => ({ id: randomUUID() }),
    },
};
const executeWithMetrics = async (fn, name) => {
    return await fn();
};
export class EmergencyEscalation {
    static instance;
    // Emergency response targets (milliseconds)
    ESCALATION_TARGETS = {
        MODERATE: 180000, // 3 minutes
        HIGH: 120000, // 2 minutes
        CRITICAL: 60000, // 1 minute
        EMERGENCY: 30000, // 30 seconds
    };
    constructor() {
        // Initialize emergency contacts and protocols
        this.initializeEmergencyProtocols();
    }
    static getInstance() {
        if (!EmergencyEscalation.instance) {
            EmergencyEscalation.instance = new EmergencyEscalation();
        }
        return EmergencyEscalation.instance;
    }
    /**
     * Trigger emergency protocol for crisis session
     * CRITICAL: <30s response time for emergency escalations
     */
    async triggerEmergencyProtocol(sessionId, trigger) {
        const startTime = performance.now();
        return await executeWithMetrics(async () => {
            // Get session details
            const session = await prisma.crisisSession.findUnique({
                where: { id: sessionId },
                select: {
                    id: true,
                    severity: true,
                    anonymousId: true,
                    status: true,
                },
            });
            if (!session) {
                throw new Error('Crisis session not found');
            }
            // Determine escalation severity
            const escalationSeverity = this.determineEscalationSeverity(session.severity, trigger);
            // Create escalation record
            const escalation = await prisma.crisisEscalation.create({
                data: {
                    sessionId,
                    triggeredBy: this.mapTriggerToEnum(trigger),
                    severity: escalationSeverity,
                    reason: `Emergency escalation triggered by ${trigger}`,
                    actionsTaken: [],
                    emergencyContacted: false,
                    lifeline988Called: false,
                },
            });
            // Execute emergency actions based on severity
            const actions = [];
            let emergencyContacted = false;
            let lifeline988Called = false;
            if (escalationSeverity === 'EMERGENCY') {
                // Immediate danger - contact emergency services
                emergencyContacted = await this.contactEmergencyServices(sessionId);
                actions.push('EMERGENCY_SERVICES_CONTACTED');
            }
            if (escalationSeverity === 'CRITICAL' || escalationSeverity === 'EMERGENCY') {
                // Contact 988 Lifeline
                lifeline988Called = await this.contact988Lifeline(sessionId);
                actions.push('988_LIFELINE_CONTACTED');
            }
            // Always assign crisis specialist
            const specialistAssigned = await this.assignCrisisSpecialist(sessionId, escalationSeverity);
            if (specialistAssigned) {
                actions.push('CRISIS_SPECIALIST_ASSIGNED');
            }
            // Update escalation record
            await prisma.crisisEscalation.update({
                where: { id: escalation.id },
                data: {
                    actionsTaken: actions,
                    emergencyContacted,
                    lifeline988Called,
                    responseTime: Math.round(performance.now() - startTime),
                },
            });
            // Update session status
            await prisma.crisisSession.update({
                where: { id: sessionId },
                data: {
                    status: 'ESCALATED',
                    emergencyTriggered: true,
                    escalatedAt: new Date(),
                    escalationType: this.mapTriggerToEnum(trigger),
                },
            });
            const responseTime = performance.now() - startTime;
            // Check if we met response time target
            const target = this.ESCALATION_TARGETS[escalationSeverity];
            if (responseTime > target) {
                console.warn(`⚠️ Emergency escalation exceeded target: ${responseTime.toFixed(2)}ms > ${target}ms`);
            }
            else {
                console.log(`✅ Emergency escalation completed in ${responseTime.toFixed(2)}ms`);
            }
            return {
                escalationId: escalation.id,
                severity: escalationSeverity,
                actionsExecuted: actions,
                emergencyContacted,
                lifeline988Called,
                specialistAssigned,
                responseTimeMs: responseTime,
                targetMet: responseTime <= target,
                nextSteps: this.generateNextSteps(escalationSeverity, actions),
            };
        }, 'emergency-escalation');
    }
    /**
     * Get emergency escalation statistics
     */
    async getEscalationStats() {
        return await executeWithMetrics(async () => {
            const [totalToday, averageResponseTime, emergencyCount] = await Promise.all([
                prisma.crisisEscalation.count({
                    where: {
                        triggeredAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
                prisma.crisisEscalation.aggregate({
                    where: {
                        responseTime: { not: null },
                    },
                    _avg: { responseTime: true },
                }),
                prisma.crisisEscalation.count({
                    where: {
                        severity: 'EMERGENCY',
                        triggeredAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
            ]);
            return {
                totalEscalationsToday: totalToday,
                averageResponseTimeMs: averageResponseTime._avg.responseTime || 0,
                emergencyEscalationsToday: emergencyCount,
                targetMet: (averageResponseTime._avg.responseTime || 0) <= this.ESCALATION_TARGETS.EMERGENCY,
            };
        }, 'get-escalation-stats');
    }
    // Private helper methods
    determineEscalationSeverity(sessionSeverity, trigger) {
        // Immediate danger triggers
        if (trigger === 'AUTOMATIC_KEYWORD' || trigger === 'AI_ASSESSMENT') {
            return sessionSeverity >= 9 ? 'EMERGENCY' : 'CRITICAL';
        }
        // Volunteer or user requested
        if (trigger === 'VOLUNTEER_REQUEST' || trigger === 'USER_REQUEST') {
            return sessionSeverity >= 8 ? 'CRITICAL' : 'HIGH';
        }
        // System timeout - escalate based on session severity
        if (trigger === 'TIMEOUT') {
            return sessionSeverity >= 7 ? 'CRITICAL' : 'HIGH';
        }
        return 'HIGH';
    }
    mapTriggerToEnum(trigger) {
        switch (trigger) {
            case 'AUTOMATIC_KEYWORD':
                return 'AUTOMATIC_KEYWORD';
            case 'VOLUNTEER_REQUEST':
                return 'MANUAL_VOLUNTEER';
            case 'USER_REQUEST':
                return 'USER_REQUEST';
            case 'TIMEOUT':
                return 'SYSTEM_TIMEOUT';
            case 'AI_ASSESSMENT':
                return 'AUTOMATIC_KEYWORD'; // Map to closest enum value
            default:
                return 'AUTOMATIC_KEYWORD';
        }
    }
    async contactEmergencyServices(sessionId) {
        try {
            // In production, this would integrate with emergency services APIs
            console.log(`🚨 EMERGENCY SERVICES PROTOCOL: Session ${sessionId}`);
            // Log emergency contact attempt
            await prisma.auditLog.create({
                data: {
                    action: 'EMERGENCY_SERVICES_CONTACT',
                    entity: 'CrisisSession',
                    entityId: sessionId,
                    details: {
                        protocol: 'EMERGENCY_SERVICES',
                        timestamp: new Date(),
                        reason: 'Immediate danger detected',
                    },
                    outcome: 'SUCCESS',
                },
            });
            return true;
        }
        catch (error) {
            console.error('❌ Failed to contact emergency services:', error);
            return false;
        }
    }
    async contact988Lifeline(sessionId) {
        try {
            // In production, this would integrate with 988 Lifeline API
            console.log(`📞 988 LIFELINE CONTACT: Session ${sessionId}`);
            // Log 988 contact attempt
            await prisma.auditLog.create({
                data: {
                    action: '988_LIFELINE_CONTACT',
                    entity: 'CrisisSession',
                    entityId: sessionId,
                    details: {
                        protocol: '988_LIFELINE',
                        timestamp: new Date(),
                        phone: '988',
                    },
                    outcome: 'SUCCESS',
                },
            });
            return true;
        }
        catch (error) {
            console.error('❌ Failed to contact 988 Lifeline:', error);
            return false;
        }
    }
    async assignCrisisSpecialist(sessionId, severity) {
        try {
            // Find available crisis specialist
            const specialist = await prisma.volunteer.findFirst({
                where: {
                    status: 'ACTIVE',
                    isActive: true,
                    emergencyResponder: true,
                    currentLoad: { lt: 3 }, // Not overloaded
                    specializations: {
                        hasSome: ['crisis-intervention', 'suicide-prevention', 'emergency-response'],
                    },
                },
                orderBy: [
                    { currentLoad: 'asc' },
                    { averageRating: 'desc' },
                ],
            });
            if (specialist) {
                // Assign specialist to session
                await prisma.crisisSession.update({
                    where: { id: sessionId },
                    data: { responderId: specialist.id },
                });
                // Update specialist load
                await prisma.volunteer.update({
                    where: { id: specialist.id },
                    data: { currentLoad: { increment: 1 } },
                });
                console.log(`✅ Crisis specialist assigned: ${specialist.anonymousId}`);
                return true;
            }
            console.warn(`⚠️ No crisis specialists available for session ${sessionId}`);
            return false;
        }
        catch (error) {
            console.error('❌ Failed to assign crisis specialist:', error);
            return false;
        }
    }
    generateNextSteps(severity, actions) {
        const steps = [];
        if (actions.includes('CRISIS_SPECIALIST_ASSIGNED')) {
            steps.push('Crisis specialist will join conversation immediately');
        }
        if (actions.includes('988_LIFELINE_CONTACTED')) {
            steps.push('988 Suicide & Crisis Lifeline has been notified');
        }
        if (actions.includes('EMERGENCY_SERVICES_CONTACTED')) {
            steps.push('Emergency services have been contacted');
        }
        if (severity === 'EMERGENCY') {
            steps.push('Continuous monitoring activated');
            steps.push('Location services may be requested');
        }
        steps.push('Session will remain active until crisis is resolved');
        return steps;
    }
    async initializeEmergencyProtocols() {
        // Initialize emergency contact protocols
        console.log('🚨 Emergency escalation protocols initialized');
    }
}
//# sourceMappingURL=EmergencyEscalation.js.map