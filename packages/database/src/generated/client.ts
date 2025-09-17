/**
 * ASTRAL_CORE 2.0 - Database Client Export
 * Generated Prisma client for zero-knowledge encrypted mental health platform
 */

import { PrismaClient } from '../../generated/client';

// Create Prisma client with optimized configuration for crisis platform
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'colorless',
});

// Export the client instance
export { prisma };
export default prisma;

// Export all Prisma types for TypeScript - from the generated client
export * from '../../generated/client';