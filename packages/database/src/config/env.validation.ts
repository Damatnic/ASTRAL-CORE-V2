// Environment configuration validation for ASTRAL_CORE
// Ensures all required environment variables are set and valid

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NODE_ENV',
  // Add more required variables as needed
];

export function validateEnvConfig(env: NodeJS.ProcessEnv = process.env): void {
  // Skip validation in test mode or if explicitly disabled
  if (env.SKIP_ENV_VALIDATION === 'true' || env.NODE_ENV === 'test') {
    return;
  }
  
  const missing: string[] = [];
  for (const key of REQUIRED_ENV_VARS) {
    if (!env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables: ${missing.join(', ')}`
    );
    console.warn('   Set these in your .env file or environment');
    // Don't throw in development to allow easier testing
    if (env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }
}

// Usage: Call validateEnvConfig() at app startup
