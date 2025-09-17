/**
 * ASTRAL_CORE 2.0 Database Package
 * Zero-Knowledge, HIPAA-Compliant Database Layer
 */

import { PrismaClient } from '../generated/client';
import { validateEnvConfig } from './config/env.validation';
import * as crypto from 'crypto';

// Validate environment configuration at startup
validateEnvConfig();

// Global Prisma client with connection pooling optimized for crisis response
declare global {
  var __prisma: typeof PrismaClient.prototype | undefined;
}

// Connection pool configuration optimized for crisis workloads
const createPrismaClient = () => {
  // Use a dummy URL if not provided (for type checking and testing)
  const databaseUrl = process.env.DATABASE_URL || 
    (process.env.NODE_ENV === 'test' 
      ? 'postgresql://test:test@localhost:5432/test?schema=public' 
      : undefined);
  
  if (!databaseUrl && process.env.NODE_ENV !== 'test') {
    console.error('⚠️  DATABASE_URL is not set. Database operations will fail.');
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Optimize for high-performance crisis response
    datasources: databaseUrl ? {
      db: {
        url: databaseUrl,
      },
    } : undefined,
    
    // Note: Connection pool settings are now configured via DATABASE_URL parameters
    // Example: postgresql://user:pass@host/db?connection_limit=100&pool_timeout=10
  });
};

// Singleton pattern with proper cleanup
export const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections...');
  await prisma.$disconnect();
  process.exit(0);
});

// Export all types and enums
export * from '../generated/client';

// Export utility functions
export * from './utils/crisis';
export * from './utils/tether';
export * from './utils/volunteer';
export * from './utils/analytics';

// Export services
export * from './services';
export { MoodService } from './services/mood.service';
export { UserService } from './services/user.service';

// Crisis utility functions
export async function createCrisisSession(data: {
  anonymousId: string;
  severity: number;
  encryptedData?: Buffer;
  keyDerivationSalt?: Buffer;
}) {
  return await prisma.crisisSession.create({
    data: {
      anonymousId: data.anonymousId,
      severity: data.severity,
      sessionToken: crypto.randomBytes(32).toString('hex'),
      encryptedData: data.encryptedData,
      keyDerivationSalt: data.keyDerivationSalt,
      status: 'ACTIVE',
    },
  });
}

export async function assignVolunteerToSession(sessionId: string, volunteerId: string) {
  return await prisma.crisisSession.update({
    where: { id: sessionId },
    data: {
      responderId: volunteerId,
      status: 'ASSIGNED',
    },
  });
}

export async function storeCrisisMessage(
  sessionId: string,
  senderType: string,
  senderId: string,
  encryptedContent: Buffer,
  messageHash: string,
  metadata?: {
    sentimentScore?: number;
    riskScore?: number;
    keywordsDetected?: string[];
  }
) {
  return await prisma.crisisMessage.create({
    data: {
      sessionId,
      senderType: senderType as any,
      senderId,
      encryptedContent,
      messageHash,
      sentimentScore: metadata?.sentimentScore,
      riskScore: metadata?.riskScore,
      keywordsDetected: metadata?.keywordsDetected || [],
    },
  });
}

export async function escalateToEmergency(sessionId: string, reason: string) {
  return await prisma.crisisEscalation.create({
    data: {
      sessionId,
      triggeredBy: 'KEYWORD_DETECTION',
      severity: 'EMERGENCY',
      reason,
      actionsTaken: ['EMERGENCY_ESCALATION_TRIGGERED'],
    },
  });
}

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - start;
    
    // Log slow database responses (warning at 100ms, critical at 500ms)
    if (responseTime > 500) {
      console.error(`🔴 Database health check CRITICAL: ${responseTime}ms`);
    } else if (responseTime > 100) {
      console.warn(`🟡 Database health check SLOW: ${responseTime}ms`);
    }
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    console.error('🔴 Database health check FAILED:', error);
    
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Performance monitoring for crisis-critical queries
export async function executeWithMetrics<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - start;
    
    // Log slow operations (crisis operations should be <50ms)
    if (operationName.includes('crisis') && duration > 50) {
      console.warn(`⚠️ SLOW CRISIS OPERATION: ${operationName} took ${duration}ms`);
    }
    
    // Track all operations for analytics
    await prisma.performanceMetric.create({
      data: {
        metricType: 'database_operation',
        value: duration,
        unit: 'ms',
        endpoint: operationName,
        target: operationName.includes('crisis') ? 50 : 100,
        status: duration > (operationName.includes('crisis') ? 50 : 100) ? 'WARNING' : 'NORMAL',
      },
    }).catch(() => {
      // Don't fail the operation if metrics logging fails
      console.error('Failed to log performance metric');
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    console.error(`🔴 DATABASE OPERATION FAILED: ${operationName} (${duration}ms)`, error);
    
    // Log failed operations
    await prisma.performanceMetric.create({
      data: {
        metricType: 'database_operation',
        value: duration,
        unit: 'ms',
        endpoint: operationName,
        status: 'CRITICAL',
      },
    }).catch(() => {
      // Don't fail if metrics logging fails
    });
    
    throw error;
  }
}