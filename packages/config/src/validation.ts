/**
 * ASTRAL_CORE 2.0 - Environment Configuration Validation
 * 
 * LIFE-CRITICAL CONFIGURATION VALIDATOR
 * This module validates and loads environment variables for the crisis platform.
 * Ensures all critical configurations are present and valid.
 */

import { config } from 'dotenv';
import { ZodSchema, ZodError } from 'zod';
import { 
  webAppEnvSchema, 
  mobileEnvSchema, 
  adminEnvSchema, 
  packageEnvSchema,
  type WebAppEnv,
  type MobileEnv,
  type AdminEnv,
  type PackageEnv
} from './schemas';

// Load environment variables from .env files
config();

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: string[]
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validates environment configuration against a schema
 */
export function validateConfig<T>(
  schema: ZodSchema<T>,
  envSource: Record<string, string | undefined> = process.env
): T {
  try {
    // Filter out undefined values to let Zod defaults work properly
    const cleanEnv = Object.fromEntries(
      Object.entries(envSource).filter(([, value]) => value !== undefined)
    );
    return schema.parse(cleanEnv);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      throw new ConfigValidationError(
        `Environment configuration validation failed:\n${validationErrors.join('\n')}`,
        validationErrors
      );
    }
    throw error;
  }
}

/**
 * Validates web application environment
 */
export function validateWebAppConfig(
  envSource?: Record<string, string | undefined>
): WebAppEnv {
  return validateConfig(webAppEnvSchema, envSource || process.env) as WebAppEnv;
}

/**
 * Validates mobile application environment
 */
export function validateMobileConfig(
  envSource?: Record<string, string | undefined>
): MobileEnv {
  return validateConfig(mobileEnvSchema, envSource || process.env) as MobileEnv;
}

/**
 * Validates admin application environment
 */
export function validateAdminConfig(
  envSource?: Record<string, string | undefined>
): AdminEnv {
  return validateConfig(adminEnvSchema, envSource || process.env) as AdminEnv;
}

/**
 * Validates package environment (for shared packages)
 */
export function validatePackageConfig(
  envSource?: Record<string, string | undefined>
): PackageEnv {
  return validateConfig(packageEnvSchema, envSource || process.env) as PackageEnv;
}

/**
 * Validates environment and provides helpful error messages for missing vars
 */
export function validateEnvironment(
  schema: ZodSchema<any>,
  context: string = 'application'
): any {
  try {
    const config = validateConfig(schema);
    console.log(`✅ ${context} environment configuration is valid`);
    return config;
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      console.error(`❌ ${context} environment configuration is invalid:`);
      error.validationErrors.forEach(err => console.error(`  - ${err}`));
      
      // Provide helpful hints for common missing variables
      const missingRequired = error.validationErrors
        .filter(err => err.includes('Required'))
        .map(err => err.split(':')[0]);
        
      if (missingRequired.length > 0) {
        console.error('\nMissing required environment variables:');
        missingRequired.forEach(varName => {
          console.error(`  - ${varName}: Add to your .env file or environment`);
        });
        
        console.error('\nFor development, copy .env.example to .env and fill in the values.');
        console.error('For production, ensure all environment variables are set in your deployment.');
      }
      
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Gets environment-specific configuration with validation
 */
export function getConfig(type: 'web'): WebAppEnv;
export function getConfig(type: 'mobile'): MobileEnv;
export function getConfig(type: 'admin'): AdminEnv;
export function getConfig(type: 'package'): PackageEnv;
export function getConfig(type: string): any {
  switch (type) {
    case 'web':
      return validateEnvironment(webAppEnvSchema, 'Web App');
    case 'mobile':
      return validateEnvironment(mobileEnvSchema, 'Mobile App');
    case 'admin':
      return validateEnvironment(adminEnvSchema, 'Admin App');
    case 'package':
      return validateEnvironment(packageEnvSchema, 'Package');
    default:
      throw new Error(`Unknown configuration type: ${type}`);
  }
}

/**
 * Safely gets an environment variable with fallback
 */
export function getEnvVar(
  key: string, 
  fallback?: string,
  required: boolean = false
): string {
  const value = process.env[key] || fallback;
  
  if (required && !value) {
    throw new Error(
      `Environment variable ${key} is required but not set. ` +
      `Please add it to your .env file or environment.`
    );
  }
  
  return value || '';
}

/**
 * Safely gets a numeric environment variable
 */
export function getEnvNumber(
  key: string,
  fallback: number,
  min?: number,
  max?: number
): number {
  const value = process.env[key];
  if (!value) return fallback;
  
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    console.warn(`Warning: ${key} is not a valid number, using fallback: ${fallback}`);
    return fallback;
  }
  
  if (min !== undefined && num < min) {
    console.warn(`Warning: ${key} is below minimum (${min}), using minimum`);
    return min;
  }
  
  if (max !== undefined && num > max) {
    console.warn(`Warning: ${key} is above maximum (${max}), using maximum`);
    return max;
  }
  
  return num;
}

/**
 * Checks if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if we're in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}