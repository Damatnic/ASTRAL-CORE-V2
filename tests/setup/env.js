/**
 * ASTRAL_CORE 2.0 - Test Environment Variables
 * Crisis intervention platform test configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-crisis-platform';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/astralcore_test';
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/astralcore_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.LOG_LEVEL = 'error'; // Reduce logging in tests
process.env.CRISIS_ALERT_WEBHOOK = 'http://localhost:3000/test/webhook';
process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.TWILIO_PHONE_NUMBER = '+15555551234';
process.env.SENTRY_DSN = 'https://test@sentry.io/test';

// Disable external API calls in tests
process.env.ENABLE_EXTERNAL_APIS = 'false';
process.env.ENABLE_REAL_SMS = 'false';
process.env.ENABLE_REAL_EMAIL = 'false';

// Crisis testing specific variables
process.env.CRISIS_TEST_MODE = 'true';
process.env.ENABLE_CRISIS_ALERTS = 'false'; // Disable real alerts in tests
process.env.CRISIS_SESSION_TIMEOUT = '300000'; // 5 minutes for tests