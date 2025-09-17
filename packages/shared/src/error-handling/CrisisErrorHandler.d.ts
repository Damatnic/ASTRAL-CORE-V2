/**
 * ASTRAL_CORE 2.0 Crisis Error Handling System
 *
 * Comprehensive error handling for life-critical crisis intervention platform.
 * Includes circuit breakers, retry logic, escalation protocols, and emergency fallbacks.
 */
export declare enum ErrorSeverity {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4,
    LIFE_THREATENING = 5
}
export declare enum ErrorCategory {
    NETWORK = "network",
    DATABASE = "database",
    AUTHENTICATION = "authentication",
    VALIDATION = "validation",
    EXTERNAL_SERVICE = "external_service",
    CRISIS_ENGINE = "crisis_engine",
    VOLUNTEER_MATCHING = "volunteer_matching",
    EMERGENCY_PROTOCOL = "emergency_protocol",
    ENCRYPTION = "encryption",
    WEBSOCKET = "websocket"
}
export interface CrisisError extends Error {
    readonly errorId: string;
    readonly severity: ErrorSeverity;
    readonly category: ErrorCategory;
    readonly context: Record<string, any>;
    readonly sessionId?: string;
    readonly userId?: string;
    readonly timestamp: Date;
    readonly retryable: boolean;
    readonly requiresEmergencyProtocol: boolean;
}
export interface ErrorHandlingConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    circuitBreakerThreshold: number;
    circuitBreakerTimeoutMs: number;
    enableEmergencyEscalation: boolean;
    enableDetailedLogging: boolean;
}
export interface RetryOptions {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    exponentialBackoff?: boolean;
    jitter?: boolean;
    retryCondition?: (error: Error) => boolean;
}
export interface CircuitBreakerState {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    lastFailureTime: Date | null;
    nextAttemptTime: Date | null;
}
declare class CrisisErrorHandler {
    private static instance;
    private readonly config;
    private readonly circuitBreakers;
    private readonly errorStats;
    private constructor();
    static getInstance(config?: Partial<ErrorHandlingConfig>): CrisisErrorHandler;
    /**
     * Create a standardized crisis error with proper context and metadata
     */
    createCrisisError(message: string, severity: ErrorSeverity, category: ErrorCategory, originalError?: Error, context?: Record<string, any>, sessionId?: string, userId?: string): CrisisError;
    /**
     * Handle errors with automatic retry, circuit breaking, and escalation
     */
    handleError<T>(operation: () => Promise<T>, errorContext: {
        operationName: string;
        category: ErrorCategory;
        sessionId?: string;
        userId?: string;
        context?: Record<string, any>;
    }, retryOptions?: RetryOptions): Promise<T>;
    /**
     * Execute operation with timeout and emergency fallback
     */
    withTimeout<T>(operation: () => Promise<T>, timeoutMs: number, fallback?: () => Promise<T> | T, context?: {
        operationName: string;
        sessionId?: string;
    }): Promise<T>;
    /**
     * Graceful degradation handler for non-critical features
     */
    withGracefulDegradation<T>(primaryOperation: () => Promise<T>, fallbackOperation: () => Promise<T> | T, context: {
        operationName: string;
        category: ErrorCategory;
        sessionId?: string;
        degradationMessage?: string;
    }): Promise<T>;
    private isRetryable;
    private assessErrorSeverity;
    private isCircuitOpen;
    private recordFailure;
    private resetCircuitBreaker;
    private calculateDelay;
    private sleep;
    private getDefaultRetryOptions;
    private updateErrorStats;
    private triggerEmergencyEscalation;
    /**
     * Get error statistics for monitoring and alerting
     */
    getErrorStats(): Map<string, {
        count: number;
        lastOccurrence: Date;
    }>;
    /**
     * Get circuit breaker states for monitoring
     */
    getCircuitBreakerStates(): Map<string, CircuitBreakerState>;
    /**
     * Reset error statistics (useful for testing or after system recovery)
     */
    resetStats(): void;
}
export declare const crisisErrorHandler: CrisisErrorHandler;
export declare const withErrorHandling: <T>(operation: () => Promise<T>, errorContext: {
    operationName: string;
    category: ErrorCategory;
    sessionId?: string;
    userId?: string;
    context?: Record<string, any>;
}, retryOptions?: RetryOptions) => Promise<T>;
export declare const withTimeout: <T>(operation: () => Promise<T>, timeoutMs: number, fallback?: () => Promise<T> | T, context?: {
    operationName: string;
    sessionId?: string;
}) => Promise<T>;
export declare const withGracefulDegradation: <T>(primaryOperation: () => Promise<T>, fallbackOperation: () => Promise<T> | T, context: {
    operationName: string;
    category: ErrorCategory;
    sessionId?: string;
    degradationMessage?: string;
}) => Promise<T>;
export declare const createCrisisError: (message: string, severity: ErrorSeverity, category: ErrorCategory, originalError?: Error, context?: Record<string, any>, sessionId?: string, userId?: string) => CrisisError;
export declare function isCrisisError(error: any): error is CrisisError;
export declare function isRetryableError(error: Error): boolean;
export {};
//# sourceMappingURL=CrisisErrorHandler.d.ts.map