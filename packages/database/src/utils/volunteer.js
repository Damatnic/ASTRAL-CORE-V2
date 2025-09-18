/**
 * ASTRAL_CORE 2.0 Database Utilities - Volunteer Operations
 * Utility functions for volunteer-related database operations
 */
import { prisma } from '../index';
export async function createVolunteer(data) {
    return await prisma.volunteer.create({
        data: {
            anonymousId: data.anonymousId,
            status: 'PENDING',
            specializations: data.specializations?.join(',') || '',
            languages: data.languages?.join(',') || 'en',
            timezone: data.timezone || 'UTC',
            isActive: false,
            currentLoad: 0,
            maxConcurrent: 3,
        },
    });
}
export async function updateVolunteerStatus(volunteerId, status) {
    return await prisma.volunteer.update({
        where: { id: volunteerId },
        data: {
            status: status,
            isActive: status === 'ACTIVE',
        },
    });
}
export async function assignVolunteerToSession(sessionId, volunteerId) {
    // Update session with volunteer
    await prisma.crisisSession.update({
        where: { id: sessionId },
        data: { responderId: volunteerId },
    });
    // Update volunteer load
    return await prisma.volunteer.update({
        where: { id: volunteerId },
        data: { currentLoad: { increment: 1 } },
    });
}
export async function recordVolunteerSession(data) {
    return await prisma.volunteerSession.create({
        data: {
            volunteerId: data.volunteerId,
            sessionType: data.sessionType,
            crisisSessionId: data.crisisSessionId,
        },
    });
}
//# sourceMappingURL=volunteer.js.map