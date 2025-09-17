/**
 * ASTRAL_CORE 2.0 - Environment Configuration Schemas
 * 
 * LIFE-CRITICAL CONFIGURATION VALIDATION
 * These schemas validate environment variables for the crisis platform.
 * Invalid configurations could prevent crisis interventions.
 */

import { z } from 'zod';

// Base environment schema
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
});

// Database configuration schema
export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url('Database URL must be a valid URL'),
  DIRECT_URL: z.string().url('Direct database URL must be a valid URL').optional(),
  DATABASE_POOL_SIZE: z.coerce.number().min(1).max(100).default(10),
  DATABASE_TIMEOUT: z.coerce.number().min(1000).max(60000).default(30000), // 30 seconds
});

// Authentication and security schema
export const authEnvSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
});

// Crisis platform specific schema
export const crisisEnvSchema = z.object({
  CRISIS_RESPONSE_TIMEOUT: z.coerce.number().min(1000).max(300000).default(30000), // 30 seconds
  EMERGENCY_ESCALATION_TIMEOUT: z.coerce.number().min(5000).max(60000).default(15000), // 15 seconds
  MAX_CONCURRENT_SESSIONS: z.coerce.number().min(1).max(1000).default(100),
  VOLUNTEER_MATCHING_TIMEOUT: z.coerce.number().min(1000).max(30000).default(10000), // 10 seconds
});

// External services schema
export const servicesEnvSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Emergency services integration
  EMERGENCY_WEBHOOK_URL: z.string().url().optional(),
  CRISIS_WEBHOOK_URL: z.string().url().optional(),
  
  // Monitoring and observability
  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),
});

// WebSocket configuration schema
export const websocketEnvSchema = z.object({
  WEBSOCKET_PORT: z.coerce.number().min(1).max(65535).default(3001),
  WEBSOCKET_HEARTBEAT_INTERVAL: z.coerce.number().min(1000).max(60000).default(30000), // 30 seconds
  WEBSOCKET_CONNECTION_TIMEOUT: z.coerce.number().min(1000).max(300000).default(60000), // 60 seconds
  WEBSOCKET_MAX_CONNECTIONS: z.coerce.number().min(1).max(10000).default(1000),
});

// Tether system schema
export const tetherEnvSchema = z.object({
  TETHER_PULSE_INTERVAL: z.coerce.number().min(10000).max(300000).default(30000), // 30 seconds
  TETHER_EMERGENCY_TIMEOUT: z.coerce.number().min(5000).max(120000).default(30000), // 30 seconds
  TETHER_MAX_MISSED_PULSES: z.coerce.number().min(1).max(10).default(3),
  TETHER_MATCHING_COOLDOWN: z.coerce.number().min(60000).max(86400000).default(3600000), // 1 hour
});

// Combined application schemas for different environments
export const webAppEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(authEnvSchema)
  .merge(crisisEnvSchema)
  .merge(servicesEnvSchema)
  .merge(websocketEnvSchema);

export const mobileEnvSchema = baseEnvSchema
  .merge(authEnvSchema.partial())
  .merge(servicesEnvSchema.partial())
  .merge(websocketEnvSchema.pick({ WEBSOCKET_PORT: true }));

export const adminEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(authEnvSchema)
  .merge(servicesEnvSchema);

export const packageEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema.partial())
  .merge(crisisEnvSchema.partial())
  .merge(tetherEnvSchema.partial());

// Environment variable types
export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;
export type CrisisEnv = z.infer<typeof crisisEnvSchema>;
export type ServicesEnv = z.infer<typeof servicesEnvSchema>;
export type WebSocketEnv = z.infer<typeof websocketEnvSchema>;
export type TetherEnv = z.infer<typeof tetherEnvSchema>;

export type WebAppEnv = z.infer<typeof webAppEnvSchema>;
export type MobileEnv = z.infer<typeof mobileEnvSchema>;
export type AdminEnv = z.infer<typeof adminEnvSchema>;
export type PackageEnv = z.infer<typeof packageEnvSchema>;