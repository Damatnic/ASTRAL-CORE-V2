/**
 * ASTRAL_CORE 2.0 Database Package
 * Zero-Knowledge, HIPAA-Compliant Database Layer
 */
import { PrismaClient } from '../generated/client';
declare global {
    var __prisma: typeof PrismaClient.prototype | undefined;
}
export declare const prisma: PrismaClient<any, any, any> | PrismaClient<{
    log: ("error" | "query" | "warn")[];
    datasources: {
        db: {
            url: string;
        };
    } | undefined;
}, "error" | "query" | "warn", import("packages/database/generated/client/runtime/library").DefaultArgs>;
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
}): Promise<{
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import(".").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
} | {
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import(".").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
}>;
export declare function assignVolunteerToSession(sessionId: string, volunteerId: string): Promise<{
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import(".").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
} | {
    id: string;
    sessionToken: string;
    anonymousId: string;
    severity: number;
    status: import(".").$Enums.CrisisStatus;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    responseTimeMs: number | null;
    outcome: string | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
}>;
export declare function storeCrisisMessage(sessionId: string, senderType: string, senderId: string, encryptedContent: Buffer, messageHash: string, metadata?: {
    sentimentScore?: number;
    riskScore?: number;
    keywordsDetected?: string[];
}): Promise<{
    sessionId: string;
    timestamp: Date;
    id: string;
    senderType: import(".").$Enums.MessageSender;
    senderId: string;
    encryptedContent: Uint8Array;
    messageHash: string;
    messageType: import(".").$Enums.MessageType;
    priority: import(".").$Enums.MessagePriority;
    sentimentScore: number | null;
    riskScore: number | null;
    riskLevel: string | null;
    keywordsDetected: string | null;
} | {
    sessionId: string;
    timestamp: Date;
    id: string;
    senderType: import(".").$Enums.MessageSender;
    senderId: string;
    encryptedContent: Uint8Array;
    messageHash: string;
    messageType: import(".").$Enums.MessageType;
    priority: import(".").$Enums.MessagePriority;
    sentimentScore: number | null;
    riskScore: number | null;
    riskLevel: string | null;
    keywordsDetected: string | null;
}>;
export declare function escalateToEmergency(sessionId: string, reason: string): Promise<{
    sessionId: string;
    id: string;
    severity: import(".").$Enums.EscalationSeverity;
    outcome: import(".").$Enums.EscalationOutcome | null;
    triggeredBy: import(".").$Enums.EscalationTrigger;
    reason: string;
    actionsTaken: string | null;
    emergencyContacted: boolean;
    lifeline988Called: boolean;
    triggeredAt: Date;
    resolvedAt: Date | null;
    responseTime: number | null;
    handledBy: string | null;
} | {
    sessionId: string;
    id: string;
    severity: import(".").$Enums.EscalationSeverity;
    outcome: import(".").$Enums.EscalationOutcome | null;
    triggeredBy: import(".").$Enums.EscalationTrigger;
    reason: string;
    actionsTaken: string | null;
    emergencyContacted: boolean;
    lifeline988Called: boolean;
    triggeredAt: Date;
    resolvedAt: Date | null;
    responseTime: number | null;
    handledBy: string | null;
}>;
export declare function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
}>;
export declare function executeWithMetrics<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
//# sourceMappingURL=index.d.ts.map