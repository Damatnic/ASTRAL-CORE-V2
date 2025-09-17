/**
 * ASTRAL_CORE 2.0 Database Utilities - Tether Operations
 * Utility functions for tether-related database operations
 */

import { prisma } from '../index';

export async function createTetherLink(data: {
  seekerId: string;
  supporterId: string;
  strength?: number;
  specialties?: string[];
  languages?: string[];
  timezone?: string;
}) {
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

export async function updateTetherStrength(tetherId: string, newStrength: number) {
  return await prisma.tetherLink.update({
    where: { id: tetherId },
    data: { strength: newStrength },
  });
}

export async function recordTetherPulse(data: {
  tetherId: string;
  pulseType: string;
  strength: number;
  mood?: number;
  status?: string;
  message?: string;
}) {
  return await prisma.tetherPulse.create({
    data: {
      tetherId: data.tetherId,
      pulseType: data.pulseType as any,
      strength: data.strength,
      mood: data.mood,
      status: (data.status as any) || 'NORMAL',
      message: data.message,
    },
  });
}