/**
 * ASTRAL_CORE 2.0 Database Package
 * Zero-Knowledge, HIPAA-Compliant Database Layer
 */
import { PrismaClient } from '../generated/client';
declare global {
    var __prisma: typeof PrismaClient.prototype | undefined;
}
export declare const prisma: any;
export * from '../generated/client';
export * from './utils/crisis';
export * from './utils/tether';
export * from './utils/volunteer';
export * from './utils/analytics';
export * from './services';
export { MoodService } from './services/mood.service';
export { UserService } from './services/user.service';
export * from './services/emergency-contact.service';
export * from './services/safety-plan.service';
export * from './services/verification.service';
export declare function createCrisisSession(data: {
    anonymousId: string;
    severity: number;
    encryptedData?: Buffer;
    keyDerivationSalt?: Buffer;
}): Promise<any>;
export declare function assignVolunteerToSession(sessionId: string, volunteerId: string): Promise<any>;
export declare function storeCrisisMessage(sessionId: string, senderType: string, senderId: string, encryptedContent: Buffer, messageHash: string, metadata?: {
    sentimentScore?: number;
    riskScore?: number;
    keywordsDetected?: string[];
}): Promise<any>;
export declare function escalateToEmergency(sessionId: string, reason: string): Promise<any>;
export declare function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
}>;
export declare function executeWithMetrics<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
//# sourceMappingURL=index.d.ts.map