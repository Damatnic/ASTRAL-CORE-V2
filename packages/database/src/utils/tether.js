/**
 * ASTRAL_CORE 2.0 Database Utilities - Tether Operations
 * Utility functions for tether-related database operations
 */
import { prisma } from '../index';
export async function createTetherLink(data) {
    return await prisma.tetherLink.create({
        data: {
            seekerId: data.seekerId,
            supporterId: data.supporterId,
            strength: data.strength || 0.5,
            specialties: data.specialties?.join(',') || '',
            languages: data.languages?.join(',') || 'en',
            timezone: data.timezone || 'UTC',
        },
    });
}
export async function updateTetherStrength(tetherId, newStrength) {
    return await prisma.tetherLink.update({
        where: { id: tetherId },
        data: { strength: newStrength },
    });
}
export async function recordTetherPulse(data) {
    return await prisma.tetherPulse.create({
        data: {
            tetherId: data.tetherId,
            pulseType: data.pulseType,
            strength: data.strength,
            mood: data.mood,
            status: data.status || 'NORMAL',
            message: data.message,
        },
    });
}
//# sourceMappingURL=tether.js.map