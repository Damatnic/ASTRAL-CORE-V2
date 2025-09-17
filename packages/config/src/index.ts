/**
 * ASTRAL_CORE 2.0 - Configuration Package Entry Point
 * 
 * Centralized configuration and environment validation for the crisis platform.
 */

export * from './schemas';
export * from './validation';

// Re-export commonly used functions
export {
  validateWebAppConfig,
  validateMobileConfig,
  validateAdminConfig,
  validatePackageConfig,
  getConfig,
  getEnvVar,
  getEnvNumber,
  isDevelopment,
  isProduction,
  isTest,
  ConfigValidationError
} from './validation';