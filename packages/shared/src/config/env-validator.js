/**
 * Environment Variable Validator
 * Ensures all critical environment variables are properly configured
 * for the mental health crisis intervention platform
 */
import { z } from 'zod';
// Define environment variable schemas for different environments
const baseEnvSchema = z.object({
    // Database Configuration
    DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().url().optional(),
    // Authentication & Security
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
    // Crisis System Configuration
    CRISIS_WEBHOOK_URL: z.string().url().optional(),
    EMERGENCY_CONTACT_API: z.string().url(),
    CRISIS_RESPONSE_TARGET: z.string().transform(Number).pipe(z.number().positive()),
    EMERGENCY_ESCALATION_TARGET: z.string().transform(Number).pipe(z.number().positive()),
    // WebSocket Configuration
    WEBSOCKET_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
    WEBSOCKET_SECRET: z.string().min(32).optional(),
    // Environment Settings
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Feature Flags
    CRISIS_MODE: z.enum(['development', 'staging', 'production']),
    ANONYMOUS_CHAT_ENABLED: z.string().default('true').transform(val => val === 'true'),
    EMERGENCY_ESCALATION_ENABLED: z.string().default('true').transform(val => val === 'true'),
    AI_SAFETY_CHECKS_ENABLED: z.string().default('true').transform(val => val === 'true'),
});
// Development environment schema (more lenient)
const developmentEnvSchema = baseEnvSchema.extend({
    // Allow optional crisis webhooks in development
    CRISIS_WEBHOOK_URL: z.string().url().optional(),
    EMERGENCY_CONTACT_API: z.string().url().optional(),
    // Development-specific
    DEBUG_MODE: z.string().default('true').transform(val => val === 'true'),
    SKIP_AUTH: z.string().optional().transform(val => val === 'true'),
});
// Staging environment schema
const stagingEnvSchema = baseEnvSchema.extend({
    // Staging requires most production settings
    SENTRY_DSN: z.string().url(),
    PERFORMANCE_THRESHOLD_MS: z.string().transform(Number).pipe(z.number().positive()),
    // Monitoring
    ALERT_WEBHOOK_URL: z.string().url(),
    UPTIME_MONITOR_SECRET: z.string().min(16),
});
// Production environment schema (strictest)
const productionEnvSchema = baseEnvSchema.extend({
    // All webhooks required in production
    CRISIS_WEBHOOK_URL: z.string().url(),
    // Monitoring & Analytics (required in production)
    SENTRY_DSN: z.string().url(),
    VERCEL_ANALYTICS_ID: z.string().optional(),
    MIXPANEL_TOKEN: z.string().optional(),
    // Performance Monitoring
    PERFORMANCE_THRESHOLD_MS: z.string().transform(Number).pipe(z.number().positive()),
    ALERT_WEBHOOK_URL: z.string().url(),
    UPTIME_MONITOR_SECRET: z.string().min(16),
    // SMS Service (required for emergency notifications)
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_PHONE_NUMBER: z.string(),
    // Email Service
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    // HIPAA Compliance
    HIPAA_AUDIT_ENDPOINT: z.string().url(),
    DATA_RETENTION_DAYS: z.string().transform(Number).pipe(z.number().positive()),
    AUTO_PURGE_ENABLED: z.string().transform(val => val === 'true'),
    COMPLIANCE_WEBHOOK: z.string().url(),
    // Backup & Recovery
    BACKUP_ENDPOINT: z.string().url(),
    BACKUP_FREQUENCY_HOURS: z.string().transform(Number).pipe(z.number().positive()),
    BACKUP_RETENTION_DAYS: z.string().transform(Number).pipe(z.number().positive()),
    DISASTER_RECOVERY_WEBHOOK: z.string().url(),
    // Legal & Compliance
    GDPR_COMPLIANCE_ENABLED: z.string().transform(val => val === 'true').default(true),
});
// Test environment schema
const testEnvSchema = z.object({
    NODE_ENV: z.literal('test'),
    TEST_DATABASE_URL: z.string().url(),
    TEST_ENCRYPTION_KEY: z.string().min(32),
    TEST_MODE: z.string().transform(val => val === 'true').default(true),
    JWT_SECRET: z.string().default('test-jwt-secret-for-testing-only-32-chars'),
    ENCRYPTION_KEY: z.string().default('test-encryption-key-32-bytes-long!'),
});
/**
 * Get the appropriate schema based on NODE_ENV
 */
function getEnvSchema() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    switch (nodeEnv) {
        case 'production':
            return productionEnvSchema;
        case 'staging':
            return stagingEnvSchema;
        case 'test':
            return testEnvSchema;
        case 'development':
        default:
            return developmentEnvSchema;
    }
}
/**
 * Validate environment variables
 * @throws {Error} If validation fails with detailed error messages
 */
export function validateEnv() {
    const schema = getEnvSchema();
    try {
        const parsed = schema.parse(process.env);
        return parsed;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((err) => {
                const path = err.path.join('.');
                const message = err.message;
                return `  ❌ ${path}: ${message}`;
            }).join('\n');
            throw new Error(`\n🚨 Environment validation failed for ${process.env.NODE_ENV || 'development'} environment:\n\n${errors}\n\n` +
                `Please check your .env file and ensure all required variables are set correctly.\n` +
                `Refer to .env.example for the complete list of required variables.`);
        }
        throw error;
    }
}
/**
 * Get validated environment variables with type safety
 */
export function getValidatedEnv() {
    return validateEnv();
}
/**
 * Check if a critical service is configured
 */
export function isCrisisSystemConfigured() {
    const env = process.env;
    return !!(env.EMERGENCY_CONTACT_API &&
        env.CRISIS_RESPONSE_TARGET &&
        env.EMERGENCY_ESCALATION_TARGET);
}
/**
 * Check if monitoring is properly configured
 */
export function isMonitoringConfigured() {
    const env = process.env;
    return !!(env.SENTRY_DSN ||
        env.ALERT_WEBHOOK_URL ||
        env.UPTIME_MONITOR_SECRET);
}
/**
 * Check if emergency notifications are configured
 */
export function isEmergencyNotificationConfigured() {
    const env = process.env;
    return !!((env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) ||
        (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS));
}
/**
 * Validate critical system requirements
 */
export function validateCriticalSystems() {
    const errors = [];
    if (!isCrisisSystemConfigured()) {
        errors.push('Crisis intervention system is not properly configured');
    }
    if (process.env.NODE_ENV === 'production') {
        if (!isMonitoringConfigured()) {
            errors.push('Monitoring system is not configured for production');
        }
        if (!isEmergencyNotificationConfigured()) {
            errors.push('Emergency notification system is not configured for production');
        }
    }
    if (errors.length > 0) {
        throw new Error(`\n⚠️  Critical system configuration errors:\n\n${errors.map(e => `  • ${e}`).join('\n')}\n\n` +
            `These systems are essential for crisis intervention functionality.`);
    }
}
//# sourceMappingURL=env-validator.js.map