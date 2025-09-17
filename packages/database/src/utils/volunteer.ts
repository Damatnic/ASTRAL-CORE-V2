/**
 * ASTRAL_CORE 2.0 Database Utilities - Volunteer Operations
 * Utility functions for volunteer-related database operations
 */

import { prisma } from '../index';

export async function createVolunteer(data: {
  anonymousId: string;
  specializations?: string[];
  languages?: string[];
  timezone?: string;
}) {
  return await prisma.volunteer.create({
    data: {
      anonymousId: data.anonymousId,
      status: 'PENDING',
      specializations: data.specializations || [],
      languages: data.languages || ['en'],
      timezone: data.timezone || 'UTC',
      isActive: false,
      currentLoad: 0,
      maxConcurrent: 3,
    },
  });
}

export async function updateVolunteerStatus(volunteerId: string, status: string) {
  return await prisma.volunteer.update({
    where: { id: volunteerId },
    data: { 
      status: status as any,
      isActive: status === 'ACTIVE',
    },
  });
}

export async function assignVolunteerToSession(sessionId: string, volunteerId: string) {
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

export async function recordVolunteerSession(data: {
  volunteerId: string;
  sessionType: string;
  crisisSessionId?: string;
}) {
  return await prisma.volunteerSession.create({
    data: {
      volunteerId: data.volunteerId,
      sessionType: data.sessionType as any,
      crisisSessionId: data.crisisSessionId,
    },
  });
}