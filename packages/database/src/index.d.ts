/**
 * ASTRAL_CORE 2.0 Database Package
 * Zero-Knowledge, HIPAA-Compliant Database Layer
 */
import { PrismaClient } from '../generated/client';
declare global {
    var __prisma: typeof PrismaClient.prototype | undefined;
}
export declare const prisma: PrismaClient<any, any, any> | PrismaClient<{
    log: ("query" | "warn" | "error")[];
    datasources: {
        db: {
            url: string;
        };
    } | undefined;
}, "query" | "warn" | "error", import("packages/database/generated/client/runtime/library").DefaultArgs>;
export * from '../generated/client';
export * from './utils/crisis';
export * from './utils/tether';
export * from './utils/volunteer';
export * from './utils/analytics';
export declare function createCrisisSession(data: {
    anonymousId: string;
    severity: number;
    encryptedData?: Buffer;
    keyDerivationSalt?: Buffer;
}): Promise<{
    status: import(".").$Enums.CrisisStatus;
    severity: number;
    responseTimeMs: number | null;
    id: string;
    anonymousId: string;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
} | {
    status: import(".").$Enums.CrisisStatus;
    severity: number;
    responseTimeMs: number | null;
    id: string;
    anonymousId: string;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
}>;
export declare function assignVolunteerToSession(sessionId: string, volunteerId: string): Promise<{
    status: import(".").$Enums.CrisisStatus;
    severity: number;
    responseTimeMs: number | null;
    id: string;
    anonymousId: string;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
    encryptedData: Uint8Array | null;
    keyDerivationSalt: Uint8Array | null;
    handoffTime: number | null;
    resolutionTime: number | null;
    emergencyTriggered: boolean;
    escalatedAt: Date | null;
    escalationType: import(".").$Enums.EscalationType | null;
} | {
    status: import(".").$Enums.CrisisStatus;
    severity: number;
    responseTimeMs: number | null;
    id: string;
    anonymousId: string;
    responderId: string | null;
    startedAt: Date;
    endedAt: Date | null;
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
    id: string;
    sessionId: string;
    senderType: import(".").$Enums.MessageSender;
    senderId: string;
    encryptedContent: Uint8Array;
    messageHash: string;
    timestamp: Date;
    messageType: import(".").$Enums.MessageType;
    priority: import(".").$Enums.MessagePriority;
    sentimentScore: number | null;
    riskScore: number | null;
    keywordsDetected: string[];
} | {
    id: string;
    sessionId: string;
    senderType: import(".").$Enums.MessageSender;
    senderId: string;
    encryptedContent: Uint8Array;
    messageHash: string;
    timestamp: Date;
    messageType: import(".").$Enums.MessageType;
    priority: import(".").$Enums.MessagePriority;
    sentimentScore: number | null;
    riskScore: number | null;
    keywordsDetected: string[];
}>;
export declare function escalateToEmergency(sessionId: string, reason: string): Promise<{
    severity: import(".").$Enums.EscalationSeverity;
    emergencyContacted: boolean;
    lifeline988Called: boolean;
    id: string;
    sessionId: string;
    triggeredBy: import(".").$Enums.EscalationTrigger;
    reason: string;
    actionsTaken: string[];
    triggeredAt: Date;
    resolvedAt: Date | null;
    responseTime: number | null;
    handledBy: string | null;
    outcome: import(".").$Enums.EscalationOutcome | null;
} | {
    severity: import(".").$Enums.EscalationSeverity;
    emergencyContacted: boolean;
    lifeline988Called: boolean;
    id: string;
    sessionId: string;
    triggeredBy: import(".").$Enums.EscalationTrigger;
    reason: string;
    actionsTaken: string[];
    triggeredAt: Date;
    resolvedAt: Date | null;
    responseTime: number | null;
    handledBy: string | null;
    outcome: import(".").$Enums.EscalationOutcome | null;
}>;
export declare function checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    error?: string;
}>;
export declare function executeWithMetrics<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
//# sourceMappingURL=index.d.ts.map