/**
 * ASTRAL_CORE 2.0 - Security Package Jest Configuration
 * 
 * LIFE-CRITICAL TESTING CONFIGURATION
 * Security systems protect vulnerable users and ensure HIPAA compliance.
 * Every untested security function could expose sensitive mental health data.
 */

module.exports = {
  displayName: '🔒 Security & Compliance Tests',
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
  
  // Coverage configuration - 100% for security-critical code
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage thresholds - CRITICAL for security
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // Security functions must have 100% coverage
    './src/authentication/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/authorization/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/encryption/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/hipaa/**/*.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for security operations
  testTimeout: 15000, // 15 seconds for security scans and encryption
  
  // Performance requirements
  globals: {
    SECURITY_PERFORMANCE_TARGETS: {
      AUTHENTICATION_TIME: 1000, // ms (1 second max)
      AUTHORIZATION_TIME: 500, // ms (500ms max)
      ENCRYPTION_TIME: 100, // ms (100ms max)
      TOKEN_VALIDATION: 50, // ms (50ms max)
    },
  },
  
  // Security test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    SECURITY_LEVEL: 'maximum',
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