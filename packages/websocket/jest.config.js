/**
 * ASTRAL_CORE 2.0 - WebSocket Package Jest Configuration
 * 
 * CRITICAL TESTING CONFIGURATION
 * Real-time communication is essential for crisis intervention.
 * Every untested connection issue could break life-saving communications.
 */

module.exports = {
  displayName: '🔌 WebSocket Communication Tests',
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
  
  // Coverage configuration - HIGH for real-time communication
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage thresholds - HIGH for communication
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Connection management must have high coverage
    './src/connection/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/message-handling/**/*.ts': {
      branches: 88,
      functions: 88,
      lines: 88,
      statements: 88,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for WebSocket operations
  testTimeout: 10000, // 10 seconds for connection tests
  
  // Performance requirements
  globals: {
    WEBSOCKET_PERFORMANCE_TARGETS: {
      CONNECTION_TIME: 1000, // ms (1 second max)
      MESSAGE_DELIVERY: 50, // ms (50ms max)
      RECONNECTION_TIME: 2000, // ms (2 seconds max)
      PING_RESPONSE: 100, // ms (100ms max)
    },
  },
  
  // Verbose output for debugging
  verbose: true,
  
  // Don't stop on first failure
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