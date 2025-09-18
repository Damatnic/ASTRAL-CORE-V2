/**
 * ASTRAL_CORE 2.0 - Database Package Jest Configuration
 * 
 * LIFE-CRITICAL TESTING CONFIGURATION
 * Database integrity and zero-knowledge encryption are foundational.
 * Every untested database operation could compromise user privacy or data integrity.
 */

module.exports = {
  displayName: '🗄️ Database & Encryption Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '.',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx}',
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/../../tests/setup.ts'],
  
  // Coverage configuration - 100% for data-critical code
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/seed.ts', // Exclude seed file from coverage
  ],
  
  // Coverage thresholds - CRITICAL for data integrity
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // Encryption and core database functions must have 100% coverage
    './src/encryption/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/models/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/migrations/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for database operations
  testTimeout: 20000, // 20 seconds for database operations and encryption
  
  // Performance requirements
  globals: {
    DATABASE_PERFORMANCE_TARGETS: {
      ENCRYPTION_TIME: 10, // ms (10ms max)
      DECRYPTION_TIME: 10, // ms (10ms max)
      QUERY_TIME: 100, // ms (100ms max for simple queries)
      CONNECTION_TIME: 1000, // ms (1 second max)
    },
  },
  
  // Database test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/astral_test',
  },
  
  // Verbose output for debugging
  verbose: true,
  
  // Don't stop on first failure - need complete test results
  bail: false,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/prisma/migrations/', // Prisma migration files
  ],
  
  // Watch options
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/prisma/migrations/',
  ],
};