/**
 * Runtime Environment Validator
 * Validates environment configuration at application runtime
 * Ensures critical services are available and properly configured
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    metadata: {
        environment: string;
        timestamp: string;
        criticalSystemsOk: boolean;
    };
}
export interface HealthCheckResult {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
}
/**
 * Perform runtime validation of environment configuration
 */
export declare function validateRuntime(): Promise<ValidationResult>;
/**
 * Monitor environment configuration continuously
 */
export declare class EnvironmentMonitor {
    private intervalId?;
    private lastValidation?;
    /**
     * Start monitoring environment configuration
     */
    start(intervalMs?: number): void;
    /**
     * Stop monitoring
     */
    stop(): void;
    /**
     * Perform validation and handle results
     */
    private validate;
    /**
     * Detect changes between validations
     */
    private detectChanges;
    /**
     * Trigger alert for critical issues
     */
    private triggerAlert;
    /**
     * Get last validation result
     */
    getLastValidation(): ValidationResult | undefined;
}
export declare const environmentMonitor: EnvironmentMonitor;
//# sourceMappingURL=runtime-validator.d.ts.map