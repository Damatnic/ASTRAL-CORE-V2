/**
 * Environment Variable Validator
 * Ensures all critical environment variables are properly configured
 * for the mental health crisis intervention platform
 */
import { z } from 'zod';
/**
 * Get the appropriate schema based on NODE_ENV
 */
declare function getEnvSchema(): z.ZodObject<{
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    JWT_SECRET: z.ZodString;
    ENCRYPTION_KEY: z.ZodString;
    CRISIS_RESPONSE_TARGET: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    EMERGENCY_ESCALATION_TARGET: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    WEBSOCKET_PORT: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    WEBSOCKET_SECRET: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodEnum<{
        production: "production";
        development: "development";
        staging: "staging";
        test: "test";
    }>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        info: "info";
        error: "error";
        debug: "debug";
        warn: "warn";
    }>>;
    CRISIS_MODE: z.ZodEnum<{
        production: "production";
        development: "development";
        staging: "staging";
    }>;
    ANONYMOUS_CHAT_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    EMERGENCY_ESCALATION_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    AI_SAFETY_CHECKS_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    CRISIS_WEBHOOK_URL: z.ZodOptional<z.ZodString>;
    EMERGENCY_CONTACT_API: z.ZodOptional<z.ZodString>;
    DEBUG_MODE: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    SKIP_AUTH: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
}, z.core.$strip> | z.ZodObject<{
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    JWT_SECRET: z.ZodString;
    ENCRYPTION_KEY: z.ZodString;
    CRISIS_WEBHOOK_URL: z.ZodOptional<z.ZodString>;
    EMERGENCY_CONTACT_API: z.ZodString;
    CRISIS_RESPONSE_TARGET: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    EMERGENCY_ESCALATION_TARGET: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    WEBSOCKET_PORT: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    WEBSOCKET_SECRET: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodEnum<{
        production: "production";
        development: "development";
        staging: "staging";
        test: "test";
    }>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        info: "info";
        error: "error";
        debug: "debug";
        warn: "warn";
    }>>;
    CRISIS_MODE: z.ZodEnum<{
        production: "production";
        development: "development";
        staging: "staging";
    }>;
    ANONYMOUS_CHAT_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    EMERGENCY_ESCALATION_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    AI_SAFETY_CHECKS_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    SENTRY_DSN: z.ZodString;
    PERFORMANCE_THRESHOLD_MS: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    ALERT_WEBHOOK_URL: z.ZodString;
    UPTIME_MONITOR_SECRET: z.ZodString;
}, z.core.$strip> | z.ZodObject<{
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    JWT_SECRET: z.ZodString;
    ENCRYPTION_KEY: z.ZodString;
    EMERGENCY_CONTACT_API: z.ZodString;
    CRISIS_RESPONSE_TARGET: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    EMERGENCY_ESCALATION_TARGET: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    WEBSOCKET_PORT: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    WEBSOCKET_SECRET: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodEnum<{
        production: "production";
        development: "development";
        staging: "staging";
        test: "test";
    }>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        info: "info";
        error: "error";
        debug: "debug";
        warn: "warn";
    }>>;
    CRISIS_MODE: z.ZodEnum<{
        production: "production";
        development: "development";
        staging: "staging";
    }>;
    ANONYMOUS_CHAT_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    EMERGENCY_ESCALATION_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    AI_SAFETY_CHECKS_ENABLED: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    CRISIS_WEBHOOK_URL: z.ZodString;
    SENTRY_DSN: z.ZodString;
    VERCEL_ANALYTICS_ID: z.ZodOptional<z.ZodString>;
    MIXPANEL_TOKEN: z.ZodOptional<z.ZodString>;
    PERFORMANCE_THRESHOLD_MS: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    ALERT_WEBHOOK_URL: z.ZodString;
    UPTIME_MONITOR_SECRET: z.ZodString;
    TWILIO_ACCOUNT_SID: z.ZodString;
    TWILIO_AUTH_TOKEN: z.ZodString;
    TWILIO_PHONE_NUMBER: z.ZodString;
    SMTP_HOST: z.ZodString;
    SMTP_PORT: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    SMTP_USER: z.ZodString;
    SMTP_PASS: z.ZodString;
    HIPAA_AUDIT_ENDPOINT: z.ZodString;
    DATA_RETENTION_DAYS: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    AUTO_PURGE_ENABLED: z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>;
    COMPLIANCE_WEBHOOK: z.ZodString;
    BACKUP_ENDPOINT: z.ZodString;
    BACKUP_FREQUENCY_HOURS: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    BACKUP_RETENTION_DAYS: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    DISASTER_RECOVERY_WEBHOOK: z.ZodString;
    GDPR_COMPLIANCE_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
}, z.core.$strip> | z.ZodObject<{
    NODE_ENV: z.ZodLiteral<"test">;
    TEST_DATABASE_URL: z.ZodString;
    TEST_ENCRYPTION_KEY: z.ZodString;
    TEST_MODE: z.ZodDefault<z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>>;
    JWT_SECRET: z.ZodDefault<z.ZodString>;
    ENCRYPTION_KEY: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
/**
 * Validate environment variables
 * @throws {Error} If validation fails with detailed error messages
 */
export declare function validateEnv(): {
    DATABASE_URL: string;
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    CRISIS_RESPONSE_TARGET: number;
    EMERGENCY_ESCALATION_TARGET: number;
    NODE_ENV: "production" | "development" | "staging" | "test";
    LOG_LEVEL: "info" | "error" | "debug" | "warn";
    CRISIS_MODE: "production" | "development" | "staging";
    ANONYMOUS_CHAT_ENABLED: boolean;
    EMERGENCY_ESCALATION_ENABLED: boolean;
    AI_SAFETY_CHECKS_ENABLED: boolean;
    DEBUG_MODE: boolean;
    SKIP_AUTH: boolean;
    REDIS_URL?: string | undefined;
    WEBSOCKET_PORT?: number | undefined;
    WEBSOCKET_SECRET?: string | undefined;
    CRISIS_WEBHOOK_URL?: string | undefined;
    EMERGENCY_CONTACT_API?: string | undefined;
} | {
    DATABASE_URL: string;
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    EMERGENCY_CONTACT_API: string;
    CRISIS_RESPONSE_TARGET: number;
    EMERGENCY_ESCALATION_TARGET: number;
    NODE_ENV: "production" | "development" | "staging" | "test";
    LOG_LEVEL: "info" | "error" | "debug" | "warn";
    CRISIS_MODE: "production" | "development" | "staging";
    ANONYMOUS_CHAT_ENABLED: boolean;
    EMERGENCY_ESCALATION_ENABLED: boolean;
    AI_SAFETY_CHECKS_ENABLED: boolean;
    SENTRY_DSN: string;
    PERFORMANCE_THRESHOLD_MS: number;
    ALERT_WEBHOOK_URL: string;
    UPTIME_MONITOR_SECRET: string;
    REDIS_URL?: string | undefined;
    CRISIS_WEBHOOK_URL?: string | undefined;
    WEBSOCKET_PORT?: number | undefined;
    WEBSOCKET_SECRET?: string | undefined;
} | {
    NODE_ENV: "test";
    TEST_DATABASE_URL: string;
    TEST_ENCRYPTION_KEY: string;
    TEST_MODE: boolean;
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
};
/**
 * Get validated environment variables with type safety
 */
export declare function getValidatedEnv(): {
    DATABASE_URL: string;
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    CRISIS_RESPONSE_TARGET: number;
    EMERGENCY_ESCALATION_TARGET: number;
    NODE_ENV: "production" | "development" | "staging" | "test";
    LOG_LEVEL: "info" | "error" | "debug" | "warn";
    CRISIS_MODE: "production" | "development" | "staging";
    ANONYMOUS_CHAT_ENABLED: boolean;
    EMERGENCY_ESCALATION_ENABLED: boolean;
    AI_SAFETY_CHECKS_ENABLED: boolean;
    DEBUG_MODE: boolean;
    SKIP_AUTH: boolean;
    REDIS_URL?: string | undefined;
    WEBSOCKET_PORT?: number | undefined;
    WEBSOCKET_SECRET?: string | undefined;
    CRISIS_WEBHOOK_URL?: string | undefined;
    EMERGENCY_CONTACT_API?: string | undefined;
} | {
    DATABASE_URL: string;
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    EMERGENCY_CONTACT_API: string;
    CRISIS_RESPONSE_TARGET: number;
    EMERGENCY_ESCALATION_TARGET: number;
    NODE_ENV: "production" | "development" | "staging" | "test";
    LOG_LEVEL: "info" | "error" | "debug" | "warn";
    CRISIS_MODE: "production" | "development" | "staging";
    ANONYMOUS_CHAT_ENABLED: boolean;
    EMERGENCY_ESCALATION_ENABLED: boolean;
    AI_SAFETY_CHECKS_ENABLED: boolean;
    SENTRY_DSN: string;
    PERFORMANCE_THRESHOLD_MS: number;
    ALERT_WEBHOOK_URL: string;
    UPTIME_MONITOR_SECRET: string;
    REDIS_URL?: string | undefined;
    CRISIS_WEBHOOK_URL?: string | undefined;
    WEBSOCKET_PORT?: number | undefined;
    WEBSOCKET_SECRET?: string | undefined;
} | {
    NODE_ENV: "test";
    TEST_DATABASE_URL: string;
    TEST_ENCRYPTION_KEY: string;
    TEST_MODE: boolean;
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
};
/**
 * Check if a critical service is configured
 */
export declare function isCrisisSystemConfigured(): boolean;
/**
 * Check if monitoring is properly configured
 */
export declare function isMonitoringConfigured(): boolean;
/**
 * Check if emergency notifications are configured
 */
export declare function isEmergencyNotificationConfigured(): boolean;
/**
 * Validate critical system requirements
 */
export declare function validateCriticalSystems(): void;
export type ValidatedEnv = z.infer<ReturnType<typeof getEnvSchema>>;
export {};
//# sourceMappingURL=env-validator.d.ts.map