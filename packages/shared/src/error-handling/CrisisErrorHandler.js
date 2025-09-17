/**
 * ASTRAL_CORE 2.0 Crisis Error Handling System
 *
 * Comprehensive error handling for life-critical crisis intervention platform.
 * Includes circuit breakers, retry logic, escalation protocols, and emergency fallbacks.
 */
import { logger } from '../logging/Logger';
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity[ErrorSeverity["LOW"] = 1] = "LOW";
    ErrorSeverity[ErrorSeverity["MEDIUM"] = 2] = "MEDIUM";
    ErrorSeverity[ErrorSeverity["HIGH"] = 3] = "HIGH";
    ErrorSeverity[ErrorSeverity["CRITICAL"] = 4] = "CRITICAL";
    ErrorSeverity[ErrorSeverity["LIFE_THREATENING"] = 5] = "LIFE_THREATENING";
})(ErrorSeverity || (ErrorSeverity = {}));
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["DATABASE"] = "database";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["EXTERNAL_SERVICE"] = "external_service";
    ErrorCategory["CRISIS_ENGINE"] = "crisis_engine";
    ErrorCategory["VOLUNTEER_MATCHING"] = "volunteer_matching";
    ErrorCategory["EMERGENCY_PROTOCOL"] = "emergency_protocol";
    ErrorCategory["ENCRYPTION"] = "encryption";
    ErrorCategory["WEBSOCKET"] = "websocket";
})(ErrorCategory || (ErrorCategory = {}));
class CrisisErrorHandler {
    static instance;
    config;
    circuitBreakers = new Map();
    errorStats = new Map();
    constructor(config) {
        this.config = {
            maxRetries: 3,
            baseDelayMs: 1000,
            maxDelayMs: 30000,
            circuitBreakerThreshold: 5,
            circuitBreakerTimeoutMs: 60000,
            enableEmergencyEscalation: true,
            enableDetailedLogging: process.env.NODE_ENV !== 'production',
            ...config
        };
    }
    static getInstance(config) {
        if (!CrisisErrorHandler.instance) {
            CrisisErrorHandler.instance = new CrisisErrorHandler(config);
        }
        return CrisisErrorHandler.instance;
    }
    /**
     * Create a standardized crisis error with proper context and metadata
     */
    createCrisisError(message, severity, category, originalError, context = {}, sessionId, userId) {
        const errorId = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const crisisError = new Error(message);
        // Add crisis-specific properties
        Object.defineProperties(crisisError, {
            errorId: { value: errorId, writable: false },
            severity: { value: severity, writable: false },
            category: { value: category, writable: false },
            context: { value: { ...context, originalError: originalError?.message }, writable: false },
            sessionId: { value: sessionId, writable: false },
            userId: { value: userId, writable: false },
            timestamp: { value: new Date(), writable: false },
            retryable: { value: this.isRetryable(category, severity), writable: false },
            requiresEmergencyProtocol: { value: severity >= ErrorSeverity.CRITICAL, writable: false }
        });
        // Copy stack trace from original error if available
        if (originalError?.stack) {
            crisisError.stack = `${crisisError.stack}\nCaused by: ${originalError.stack}`;
        }
        return crisisError;
    }
    /**
     * Handle errors with automatic retry, circuit breaking, and escalation
     */
    async handleError(operation, errorContext, retryOptions) {
        const { operationName, category, sessionId, userId, context = {} } = errorContext;
        const options = { ...this.getDefaultRetryOptions(), ...retryOptions };
        // Check circuit breaker
        if (this.isCircuitOpen(operationName)) {
            throw this.createCrisisError(`Circuit breaker is open for ${operationName}`, ErrorSeverity.HIGH, category, undefined, { circuitBreakerState: this.circuitBreakers.get(operationName) }, sessionId, userId);
        }
        let lastError = null;
        let attempt = 0;
        while (attempt < options.maxAttempts) {
            try {
                const result = await operation();
                // Success - reset circuit breaker
                this.resetCircuitBreaker(operationName);
                // Log successful recovery if this was a retry
                if (attempt > 0) {
                    logger.info('CrisisErrorHandler', `Operation ${operationName} succeeded after ${attempt} retries`, context, sessionId);
                }
                return result;
            }
            catch (error) {
                lastError = error;
                attempt++;
                // Record failure for circuit breaker
                this.recordFailure(operationName);
                // Determine if we should retry
                const shouldRetry = attempt < options.maxAttempts &&
                    (options.retryCondition ? options.retryCondition(lastError) : this.isRetryable(category, this.assessErrorSeverity(lastError)));
                if (!shouldRetry) {
                    break;
                }
                // Calculate delay with exponential backoff and jitter
                const delay = this.calculateDelay(attempt, options);
                logger.warn('CrisisErrorHandler', `Operation ${operationName} failed, retrying in ${delay}ms (attempt ${attempt}/${options.maxAttempts})`, { error: lastError.message, ...context }, sessionId);
                await this.sleep(delay);
            }
        }
        // All retries exhausted - create comprehensive error
        const severity = this.assessErrorSeverity(lastError);
        const crisisError = this.createCrisisError(`Operation ${operationName} failed after ${attempt} attempts`, severity, category, lastError, { totalAttempts: attempt, ...context }, sessionId, userId);
        // Log the final failure
        if (severity >= ErrorSeverity.CRITICAL) {
            logger.critical('CrisisErrorHandler', `CRITICAL FAILURE: ${operationName}`, crisisError, context, sessionId);
        }
        else {
            logger.error('CrisisErrorHandler', `Operation failure: ${operationName}`, crisisError, context, sessionId);
        }
        // Update error statistics
        this.updateErrorStats(operationName);
        // Trigger emergency escalation if needed
        if (crisisError.requiresEmergencyProtocol && this.config.enableEmergencyEscalation) {
            await this.triggerEmergencyEscalation(crisisError);
        }
        throw crisisError;
    }
    /**
     * Execute operation with timeout and emergency fallback
     */
    async withTimeout(operation, timeoutMs, fallback, context = { operationName: 'unknown' }) {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const timeoutError = this.createCrisisError(`Operation ${context.operationName} timed out after ${timeoutMs}ms`, ErrorSeverity.HIGH, ErrorCategory.CRISIS_ENGINE, undefined, { timeoutMs }, context.sessionId);
                if (fallback) {
                    logger.warn('CrisisErrorHandler', `Operation ${context.operationName} timed out, using fallback`, { timeoutMs }, context.sessionId);
                    Promise.resolve(fallback()).then(resolve).catch(reject);
                }
                else {
                    reject(timeoutError);
                }
            }, timeoutMs);
            try {
                const result = await operation();
                clearTimeout(timeoutId);
                resolve(result);
            }
            catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }
    /**
     * Graceful degradation handler for non-critical features
     */
    async withGracefulDegradation(primaryOperation, fallbackOperation, context) {
        try {
            return await primaryOperation();
        }
        catch (error) {
            const degradationMessage = context.degradationMessage ||
                `Primary operation ${context.operationName} failed, using fallback`;
            logger.warn('CrisisErrorHandler', degradationMessage, { error: error.message }, context.sessionId);
            return await Promise.resolve(fallbackOperation());
        }
    }
    // Private helper methods
    isRetryable(category, severity) {
        // Never retry life-threatening errors - escalate immediately
        if (severity === ErrorSeverity.LIFE_THREATENING) {
            return false;
        }
        // Retry network and database issues
        if (category === ErrorCategory.NETWORK || category === ErrorCategory.DATABASE) {
            return true;
        }
        // Don't retry authentication or validation errors
        if (category === ErrorCategory.AUTHENTICATION || category === ErrorCategory.VALIDATION) {
            return false;
        }
        // Retry external service failures
        if (category === ErrorCategory.EXTERNAL_SERVICE) {
            return true;
        }
        return severity <= ErrorSeverity.MEDIUM;
    }
    assessErrorSeverity(error) {
        const message = error.message.toLowerCase();
        // Life-threatening indicators
        if (message.includes('emergency') || message.includes('911') || message.includes('suicide')) {
            return ErrorSeverity.LIFE_THREATENING;
        }
        // Critical system failures
        if (message.includes('database connection') || message.includes('authentication failed')) {
            return ErrorSeverity.CRITICAL;
        }
        // High severity network issues
        if (message.includes('timeout') || message.includes('connection refused')) {
            return ErrorSeverity.HIGH;
        }
        // Medium severity for validation errors
        if (message.includes('validation') || message.includes('invalid')) {
            return ErrorSeverity.MEDIUM;
        }
        return ErrorSeverity.LOW;
    }
    isCircuitOpen(operationName) {
        const breaker = this.circuitBreakers.get(operationName);
        if (!breaker)
            return false;
        if (breaker.state === 'OPEN' && breaker.nextAttemptTime && new Date() > breaker.nextAttemptTime) {
            breaker.state = 'HALF_OPEN';
            return false;
        }
        return breaker.state === 'OPEN';
    }
    recordFailure(operationName) {
        let breaker = this.circuitBreakers.get(operationName);
        if (!breaker) {
            breaker = {
                state: 'CLOSED',
                failureCount: 0,
                lastFailureTime: null,
                nextAttemptTime: null
            };
            this.circuitBreakers.set(operationName, breaker);
        }
        breaker.failureCount++;
        breaker.lastFailureTime = new Date();
        if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
            breaker.state = 'OPEN';
            breaker.nextAttemptTime = new Date(Date.now() + this.config.circuitBreakerTimeoutMs);
            logger.warn('CrisisErrorHandler', `Circuit breaker opened for ${operationName}`, { failureCount: breaker.failureCount, threshold: this.config.circuitBreakerThreshold });
        }
    }
    resetCircuitBreaker(operationName) {
        const breaker = this.circuitBreakers.get(operationName);
        if (breaker) {
            breaker.state = 'CLOSED';
            breaker.failureCount = 0;
            breaker.lastFailureTime = null;
            breaker.nextAttemptTime = null;
        }
    }
    calculateDelay(attempt, options) {
        let delay = options.baseDelayMs || this.config.baseDelayMs;
        if (options.exponentialBackoff) {
            delay = Math.min(delay * Math.pow(2, attempt - 1), options.maxDelayMs || this.config.maxDelayMs);
        }
        if (options.jitter) {
            delay = delay + Math.random() * delay * 0.1; // Add 10% jitter
        }
        return Math.floor(delay);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getDefaultRetryOptions() {
        return {
            maxAttempts: this.config.maxRetries,
            baseDelayMs: this.config.baseDelayMs,
            maxDelayMs: this.config.maxDelayMs,
            exponentialBackoff: true,
            jitter: true,
            retryCondition: () => true
        };
    }
    updateErrorStats(operationName) {
        const stats = this.errorStats.get(operationName) || { count: 0, lastOccurrence: new Date() };
        stats.count++;
        stats.lastOccurrence = new Date();
        this.errorStats.set(operationName, stats);
    }
    async triggerEmergencyEscalation(error) {
        try {
            // In a real implementation, this would:
            // 1. Alert on-call engineers
            // 2. Escalate to emergency services if needed
            // 3. Notify system administrators
            // 4. Create incident tickets
            // 5. Execute emergency protocols
            logger.critical('CrisisErrorHandler', 'EMERGENCY ESCALATION TRIGGERED', error, {
                errorId: error.errorId,
                severity: error.severity,
                category: error.category,
                sessionId: error.sessionId,
                requiresImmediate: error.severity === ErrorSeverity.LIFE_THREATENING
            });
            // Mock escalation for development
            if (process.env.NODE_ENV === 'development') {
                console.error('🚨 EMERGENCY ESCALATION:', {
                    errorId: error.errorId,
                    message: error.message,
                    severity: error.severity,
                    sessionId: error.sessionId
                });
            }
        }
        catch (escalationError) {
            logger.critical('CrisisErrorHandler', 'EMERGENCY ESCALATION FAILED - SYSTEM IN CRITICAL STATE', escalationError, { originalError: error.message });
        }
    }
    /**
     * Get error statistics for monitoring and alerting
     */
    getErrorStats() {
        return new Map(this.errorStats);
    }
    /**
     * Get circuit breaker states for monitoring
     */
    getCircuitBreakerStates() {
        return new Map(this.circuitBreakers);
    }
    /**
     * Reset error statistics (useful for testing or after system recovery)
     */
    resetStats() {
        this.errorStats.clear();
        this.circuitBreakers.clear();
    }
}
// Export singleton instance and convenience functions
export const crisisErrorHandler = CrisisErrorHandler.getInstance();
// Convenience functions for common error handling patterns
export const withErrorHandling = crisisErrorHandler.handleError.bind(crisisErrorHandler);
export const withTimeout = crisisErrorHandler.withTimeout.bind(crisisErrorHandler);
export const withGracefulDegradation = crisisErrorHandler.withGracefulDegradation.bind(crisisErrorHandler);
export const createCrisisError = crisisErrorHandler.createCrisisError.bind(crisisErrorHandler);
// Type guards
export function isCrisisError(error) {
    return error && typeof error.errorId === 'string' && typeof error.severity === 'number';
}
export function isRetryableError(error) {
    if (isCrisisError(error)) {
        return error.retryable;
    }
    // Default heuristics for standard errors
    const message = error.message.toLowerCase();
    return message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('network') ||
        message.includes('temporary');
}
//# sourceMappingURL=CrisisErrorHandler.js.map