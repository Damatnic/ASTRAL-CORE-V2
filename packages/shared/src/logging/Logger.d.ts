/**
 * ASTRAL_CORE 2.0 Centralized Logging System
 *
 * Replaces console.log statements with structured, configurable logging
 * that includes emergency alerting for critical crisis intervention events.
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    message: string;
    metadata?: Record<string, any>;
    sessionId?: string;
    userId?: string;
    performanceMetrics?: {
        responseTimeMs?: number;
        memoryUsageMB?: number;
        cpuUsagePercent?: number;
    };
}
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFileLogging: boolean;
    enableSentryLogging: boolean;
    enableCrisisAlerts: boolean;
    logFilePath?: string;
    sentryDsn?: string;
}
declare class Logger {
    private static instance;
    private config;
    private logStream?;
    private constructor();
    static getInstance(): Logger;
    private initializeLogStream;
    private formatLogEntry;
    private shouldLog;
    private writeLog;
    private sendCrisisAlert;
    private sendToSentry;
    debug(module: string, message: string, metadata?: Record<string, any>, sessionId?: string): void;
    info(module: string, message: string, metadata?: Record<string, any>, sessionId?: string): void;
    warn(module: string, message: string, metadata?: Record<string, any>, sessionId?: string): void;
    error(module: string, message: string, error?: Error, metadata?: Record<string, any>, sessionId?: string): void;
    critical(module: string, message: string, error?: Error, metadata?: Record<string, any>, sessionId?: string): void;
    performance(module: string, message: string, performanceMetrics: NonNullable<LogEntry['performanceMetrics']>, sessionId?: string, metadata?: Record<string, any>): void;
    updateConfig(config: Partial<LoggerConfig>): void;
}
export declare const logger: Logger;
export declare const logCrisisEvent: (event: string, sessionId: string, metadata?: Record<string, any>) => void;
export declare const logCrisisError: (error: string, sessionId: string, errorObj?: Error, metadata?: Record<string, any>) => void;
export declare const logCrisisCritical: (critical: string, sessionId: string, errorObj?: Error, metadata?: Record<string, any>) => void;
export declare const logPerformance: (operation: string, responseTimeMs: number, targetMs: number, sessionId?: string, metadata?: Record<string, any>) => void;
export {};
//# sourceMappingURL=Logger.d.ts.map