/**
 * ASTRAL_CORE 2.0 - Volunteer Package Jest Configuration
 * 
 * LIFE-CRITICAL TESTING CONFIGURATION
 * Volunteer matching and training systems are critical for crisis intervention.
 * Every untested line could affect volunteer-user connections.
 */

module.exports = {
  displayName: '🙋 Volunteer Management Tests',
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
    '^@astralcore/tether$': '<rootDir>/../tether/src',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/../../tests/setup.ts'],
  
  // Coverage configuration - High for volunteer-critical code
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage thresholds - HIGH
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Volunteer matching functions must have 95% coverage
    './src/matching/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/training/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/authentication/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for volunteer operations
  testTimeout: 12000, // 12 seconds for volunteer matching
  
  // Performance requirements
  globals: {
    VOLUNTEER_PERFORMANCE_TARGETS: {
      MATCHING_TIME: 3000, // ms (3 seconds max)
      AUTHENTICATION_TIME: 1000, // ms (1 second max)
      TRAINING_SYNC: 5000, // ms (5 seconds max)
      AVAILABILITY_UPDATE: 500, // ms (500ms max)
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