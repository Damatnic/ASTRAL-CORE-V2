/**
 * ASTRAL_CORE 2.0 Volunteer Management Engine
 *
 * Manages the complete volunteer lifecycle from application to expert responder.
 * Ensures every volunteer is properly trained, supported, and matched effectively.
 */
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { prisma, executeWithMetrics } from '@astralcore/database';
import { VolunteerTrainingSystem } from '../training/VolunteerTrainingSystem';
import { BurnoutPreventionSystem } from '../wellness/BurnoutPreventionSystem';
import { VolunteerPerformanceMonitor } from '../monitoring/VolunteerPerformanceMonitor';
import { BackgroundVerification } from '../verification/BackgroundVerification';
import { VOLUNTEER_CONSTANTS, VOLUNTEER_STATUS_FLOW } from '../index';
export class VolunteerManagementEngine {
    static instance;
    trainingSystem;
    burnoutPrevention;
    performanceMonitor;
    backgroundVerification;
    constructor() {
        this.trainingSystem = new VolunteerTrainingSystem();
        this.burnoutPrevention = new BurnoutPreventionSystem();
        this.performanceMonitor = new VolunteerPerformanceMonitor();
        this.backgroundVerification = new BackgroundVerification();
        // Start volunteer monitoring
        this.startVolunteerMonitoring();
    }
    static getInstance() {
        if (!VolunteerManagementEngine.instance) {
            VolunteerManagementEngine.instance = new VolunteerManagementEngine();
        }
        return VolunteerManagementEngine.instance;
    }
    /**
     * Process new volunteer application
     * Complete onboarding pipeline from application to active volunteer
     */
    async processApplication(application) {
        const startTime = performance.now();
        return await executeWithMetrics(async () => {
            // Validate application completeness
            this.validateApplication(application);
            // Create volunteer profile with anonymous ID
            const anonymousId = uuidv4();
            const hashedContact = application.emergencyContact
                ? await bcrypt.hash(application.emergencyContact, 12)
                : null;
            const volunteer = await prisma.volunteer.create({
                data: {
                    anonymousId,
                    status: 'PENDING',
                    specializations: application.specializations || [],
                    languages: application.languages || ['en'],
                    backgroundCheck: 'PENDING',
                    isActive: false,
                    schedule: application.availability || {},
                    timezone: application.timezone || 'UTC',
                },
            });
            // Start background verification (async)
            const verificationPromise = this.backgroundVerification.initiateCheck({
                volunteerId: volunteer.id,
                personalInfo: {
                    // Hash PII for verification while maintaining privacy
                    identityHash: await bcrypt.hash(application.fullName + application.email, 12),
                    references: application.references,
                },
            });
            // Enroll in training program
            const trainingEnrollment = await this.trainingSystem.enrollVolunteer(volunteer.id, application.experience || 'beginner');
            // Set up monitoring
            await this.performanceMonitor.initializeVolunteer(volunteer.id);
            await this.burnoutPrevention.setupMonitoring(volunteer.id);
            const executionTime = performance.now() - startTime;
            console.log(`✅ Volunteer application processed: ${volunteer.id} (${executionTime.toFixed(2)}ms)`);
            return {
                volunteerId: volunteer.id,
                anonymousId,
                status: 'PENDING',
                trainingRequired: trainingEnrollment.requiredModules,
                estimatedTrainingHours: trainingEnrollment.totalHours,
                backgroundCheckInitiated: true,
                nextSteps: [
                    'Complete identity verification',
                    'Begin training program',
                    'Schedule initial interview',
                    'Await background check results'
                ],
                executionTimeMs: executionTime,
            };
        }, 'process-volunteer-application');
    }
    /**
     * Update volunteer status through the pipeline
     */
    async updateVolunteerStatus(volunteerId, newStatus, reason, metadata) {
        await executeWithMetrics(async () => {
            const volunteer = await prisma.volunteer.findUnique({
                where: { id: volunteerId },
                select: { status: true, anonymousId: true },
            });
            if (!volunteer) {
                throw new Error('Volunteer not found');
            }
            // Validate status transition
            const allowedTransitions = VOLUNTEER_STATUS_FLOW[volunteer.status];
            if (!allowedTransitions.includes(newStatus)) {
                throw new Error(`Invalid status transition: ${volunteer.status} -> ${newStatus}`);
            }
            // Update volunteer status
            await prisma.volunteer.update({
                where: { id: volunteerId },
                data: {
                    status: newStatus,
                    isActive: newStatus === 'ACTIVE',
                },
            });
            // Handle status-specific actions
            switch (newStatus) {
                case 'ACTIVE':
                    await this.activateVolunteer(volunteerId);
                    break;
                case 'SUSPENDED':
                    await this.suspendVolunteer(volunteerId, reason);
                    break;
                case 'REVOKED':
                    await this.revokeVolunteer(volunteerId, reason);
                    break;
            }
            // Log status change for audit
            await prisma.auditLog.create({
                data: {
                    action: 'VOLUNTEER_STATUS_CHANGE',
                    entity: 'Volunteer',
                    entityId: volunteerId,
                    details: {
                        previousStatus: volunteer.status,
                        newStatus,
                        reason,
                        metadata,
                    },
                    outcome: 'SUCCESS',
                },
            });
            console.log(`📝 Volunteer status updated: ${volunteer.anonymousId} -> ${newStatus}`);
        }, 'update-volunteer-status');
    }
    /**
     * Get available volunteers for crisis assignment
     */
    async getAvailableVolunteers(criteria) {
        return await executeWithMetrics(async () => {
            const volunteers = await prisma.volunteer.findMany({
                where: {
                    status: 'ACTIVE',
                    isActive: true,
                    currentLoad: {
                        lt: criteria?.maxCurrentLoad || VOLUNTEER_CONSTANTS.MAX_CONCURRENT_SESSIONS,
                    },
                    ...(criteria?.emergencyOnly && { emergencyAvailable: true }),
                    ...(criteria?.specializations && {
                        specializations: {
                            hasSome: criteria.specializations,
                        },
                    }),
                    ...(criteria?.languages && {
                        languages: {
                            hasSome: criteria.languages,
                        },
                    }),
                    // Only volunteers active in last 30 minutes
                    lastActive: {
                        gte: new Date(Date.now() - 30 * 60 * 1000),
                    },
                    // Exclude volunteers with high burnout scores
                    burnoutScore: {
                        lt: VOLUNTEER_CONSTANTS.BURNOUT_THRESHOLD,
                    },
                },
                orderBy: [
                    { currentLoad: 'asc' },
                    { averageRating: 'desc' },
                    { responseRate: 'desc' },
                ],
                take: 50, // Limit for performance
            });
            return volunteers.map(v => ({
                id: v.id,
                anonymousId: v.anonymousId,
                specializations: v.specializations,
                languages: v.languages,
                currentLoad: v.currentLoad,
                maxConcurrent: v.maxConcurrent,
                averageRating: v.averageRating || 0,
                responseRate: v.responseRate,
                isEmergencyResponder: v.emergencyResponder,
                lastActive: v.lastActive,
                burnoutScore: v.burnoutScore,
            }));
        }, 'get-available-volunteers');
    }
    /**
     * Assign volunteer to crisis session
     */
    async assignToCrisisSession(volunteerId, sessionId, priority = 'normal') {
        const startTime = performance.now();
        return await executeWithMetrics(async () => {
            // Check volunteer availability
            const volunteer = await prisma.volunteer.findUnique({
                where: { id: volunteerId },
                select: {
                    id: true,
                    anonymousId: true,
                    status: true,
                    isActive: true,
                    currentLoad: true,
                    maxConcurrent: true,
                    burnoutScore: true,
                },
            });
            if (!volunteer || volunteer.status !== 'ACTIVE' || !volunteer.isActive) {
                throw new Error('Volunteer not available for assignment');
            }
            if (volunteer.currentLoad >= volunteer.maxConcurrent) {
                throw new Error('Volunteer at maximum capacity');
            }
            if (volunteer.burnoutScore >= VOLUNTEER_CONSTANTS.BURNOUT_THRESHOLD) {
                throw new Error('Volunteer showing burnout signs - assignment blocked');
            }
            // Update volunteer load
            await prisma.volunteer.update({
                where: { id: volunteerId },
                data: {
                    currentLoad: { increment: 1 },
                    lastActive: new Date(),
                },
            });
            // Create volunteer session record
            const session = await prisma.volunteerSession.create({
                data: {
                    volunteerId,
                    sessionType: priority === 'emergency' ? 'CRISIS_RESPONSE' : 'PEER_SUPPORT',
                    crisisSessionId: sessionId,
                },
            });
            const executionTime = performance.now() - startTime;
            // Check performance target for emergency assignments
            if (priority === 'emergency' && executionTime > 1000) {
                console.warn(`⚠️ Emergency volunteer assignment took ${executionTime.toFixed(2)}ms (target: <1000ms)`);
            }
            console.log(`✅ Volunteer assigned: ${volunteer.anonymousId} -> Session ${sessionId}`);
            return {
                volunteerId: volunteer.id,
                sessionId,
                priority,
                assignedAt: new Date(),
                estimatedResponseTime: this.estimateResponseTime(volunteer),
                executionTimeMs: executionTime,
            };
        }, 'assign-crisis-session');
    }
    /**
     * Complete volunteer session and update performance metrics
     */
    async completeSession(volunteerId, sessionId, outcome) {
        await executeWithMetrics(async () => {
            // Update volunteer session
            await prisma.volunteerSession.update({
                where: { id: sessionId },
                data: {
                    endedAt: new Date(),
                    duration: outcome.duration,
                    userSatisfaction: outcome.userSatisfaction,
                    outcome: outcome.escalated ? 'ESCALATED' : 'SUCCESSFUL_RESOLUTION',
                },
            });
            // Update volunteer metrics
            const volunteer = await prisma.volunteer.findUnique({
                where: { id: volunteerId },
                select: {
                    sessionsCount: true,
                    averageRating: true,
                    hoursVolunteered: true,
                    currentLoad: true,
                },
            });
            if (volunteer) {
                const newSessionCount = volunteer.sessionsCount + 1;
                const newAverageRating = outcome.userSatisfaction
                    ? ((volunteer.averageRating || 0) * volunteer.sessionsCount + outcome.userSatisfaction) / newSessionCount
                    : volunteer.averageRating;
                await prisma.volunteer.update({
                    where: { id: volunteerId },
                    data: {
                        sessionsCount: newSessionCount,
                        averageRating: newAverageRating,
                        hoursVolunteered: volunteer.hoursVolunteered + (outcome.duration / 3600), // Convert to hours
                        currentLoad: Math.max(0, volunteer.currentLoad - 1),
                        lastActive: new Date(),
                    },
                });
            }
            // Update performance monitoring
            await this.performanceMonitor.recordSession(volunteerId, {
                duration: outcome.duration,
                satisfaction: outcome.userSatisfaction,
                escalated: outcome.escalated || false,
            });
            // Check for burnout indicators
            await this.burnoutPrevention.assessPostSession(volunteerId, outcome);
        }, 'complete-volunteer-session');
    }
    /**
     * Get comprehensive volunteer statistics
     */
    async getVolunteerStats() {
        return await executeWithMetrics(async () => {
            const [totalVolunteers, activeVolunteers, trainingVolunteers, avgRating, avgResponseRate, sessionsToday, burnoutCases,] = await Promise.all([
                prisma.volunteer.count(),
                prisma.volunteer.count({ where: { status: 'ACTIVE', isActive: true } }),
                prisma.volunteer.count({ where: { status: 'TRAINING' } }),
                prisma.volunteer.aggregate({
                    where: { status: 'ACTIVE' },
                    _avg: { averageRating: true },
                }),
                prisma.volunteer.aggregate({
                    where: { status: 'ACTIVE' },
                    _avg: { responseRate: true },
                }),
                prisma.volunteerSession.count({
                    where: {
                        startedAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
                prisma.volunteer.count({
                    where: {
                        burnoutScore: { gte: VOLUNTEER_CONSTANTS.BURNOUT_THRESHOLD },
                    },
                }),
            ]);
            return {
                totalVolunteers,
                activeVolunteers,
                trainingVolunteers,
                averageRating: avgRating._avg.averageRating || 0,
                averageResponseRate: avgResponseRate._avg.responseRate || 0,
                sessionsToday,
                burnoutCases,
                systemHealth: burnoutCases < 5 ? 'HEALTHY' : burnoutCases < 15 ? 'DEGRADED' : 'CRITICAL',
                capacity: {
                    current: activeVolunteers,
                    target: Math.ceil(totalVolunteers * 0.7), // 70% active is healthy
                    utilization: activeVolunteers / Math.max(totalVolunteers, 1),
                },
            };
        }, 'get-volunteer-stats');
    }
    // Private helper methods
    validateApplication(application) {
        if (!application.motivation || application.motivation.length < 100) {
            throw new Error('Motivation statement must be at least 100 characters');
        }
        if (!application.availability || Object.keys(application.availability).length === 0) {
            throw new Error('Availability schedule is required');
        }
        if (!application.references || application.references.length < 2) {
            throw new Error('At least 2 references required');
        }
        if (application.age && application.age < 18) {
            throw new Error('Volunteers must be at least 18 years old');
        }
    }
    async activateVolunteer(volunteerId) {
        await prisma.volunteer.update({
            where: { id: volunteerId },
            data: {
                isActive: true,
                lastActive: new Date(),
            },
        });
        // Send welcome notification (would integrate with notification system)
        console.log(`🎉 Volunteer activated and ready to save lives: ${volunteerId}`);
    }
    async suspendVolunteer(volunteerId, reason) {
        await prisma.volunteer.update({
            where: { id: volunteerId },
            data: {
                isActive: false,
                currentLoad: 0, // Remove all current assignments
            },
        });
        console.log(`⚠️ Volunteer suspended: ${volunteerId} - ${reason}`);
    }
    async revokeVolunteer(volunteerId, reason) {
        await prisma.volunteer.update({
            where: { id: volunteerId },
            data: {
                isActive: false,
                currentLoad: 0,
            },
        });
        // Archive volunteer data (GDPR compliant)
        console.log(`🚫 Volunteer access revoked: ${volunteerId} - ${reason}`);
    }
    estimateResponseTime(volunteer) {
        // Base response time on historical performance
        const baseTime = 60000; // 1 minute base
        const loadFactor = volunteer.currentLoad / volunteer.maxConcurrent;
        const performanceFactor = volunteer.responseRate || 0.8;
        return Math.round(baseTime * (1 + loadFactor) / performanceFactor);
    }
    startVolunteerMonitoring() {
        // Monitor volunteer wellness every 5 minutes
        setInterval(async () => {
            try {
                await this.burnoutPrevention.checkAllVolunteers();
            }
            catch (error) {
                console.error('❌ Volunteer wellness check failed:', error);
            }
        }, 300000);
        // Update performance metrics every hour
        setInterval(async () => {
            try {
                await this.performanceMonitor.updateAllMetrics();
            }
            catch (error) {
                console.error('❌ Performance metrics update failed:', error);
            }
        }, 3600000);
        // System health check every minute
        setInterval(async () => {
            try {
                const stats = await this.getVolunteerStats();
                if (stats.systemHealth === 'CRITICAL') {
                    console.error('🔴 CRITICAL: Volunteer system health degraded');
                }
                console.log(`👥 Volunteers: ${stats.activeVolunteers} active, ${stats.burnoutCases} burnout cases`);
            }
            catch (error) {
                console.error('❌ Volunteer health check failed:', error);
            }
        }, 60000);
    }
}
//# sourceMappingURL=VolunteerManagementEngine.js.map