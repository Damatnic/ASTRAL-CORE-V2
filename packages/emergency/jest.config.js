/**
 * ASTRAL_CORE 2.0 - Emergency Package Jest Configuration
 * 
 * LIFE-CRITICAL TESTING CONFIGURATION
 * Emergency response and crisis escalation requires 100% test coverage.
 * Every untested line could delay life-saving intervention.
 */

module.exports = {
  displayName: '🚨 Emergency Response Tests',
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
  
  // Module name mapping for workspace dependencies
  moduleNameMapper: {
    '^@astralcore/database$': '<rootDir>/../database/src',
    '^@astralcore/crisis$': '<rootDir>/../crisis/src',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/../../tests/setup.ts'],
  
  // Coverage configuration - 100% for emergency-critical code
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage thresholds - CRITICAL
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // Emergency escalation functions must have 100% coverage
    './src/escalation/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/notification/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/coordination/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for emergency scenarios
  testTimeout: 15000, // 15 seconds for emergency coordination
  
  // Performance requirements
  globals: {
    EMERGENCY_PERFORMANCE_TARGETS: {
      ESCALATION_TIME: 5000, // ms (5 seconds max)
      NOTIFICATION_TIME: 1000, // ms (1 second max)
      COORDINATION_TIME: 2000, // ms (2 seconds max)
      ALERT_DELIVERY: 500, // ms (500ms max)
    },
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
  ],
  
  // Watch options
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
};