/**
 * ASTRAL_CORE 2.0 - AI Safety Package Jest Configuration
 * 
 * LIFE-CRITICAL TESTING CONFIGURATION
 * AI safety systems prevent harmful content and ensure ethical AI responses.
 * Every untested AI function could risk user safety in crisis situations.
 */

module.exports = {
  displayName: '🤖 AI Safety Tests',
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
  
  // Coverage configuration - HIGH for AI safety
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage thresholds - HIGH for AI safety
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Content filtering must have 95% coverage
    './src/content-filtering/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/harm-detection/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/ethical-guidelines/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for AI operations
  testTimeout: 18000, // 18 seconds for AI processing
  
  // Performance requirements
  globals: {
    AI_SAFETY_PERFORMANCE_TARGETS: {
      CONTENT_ANALYSIS: 2000, // ms (2 seconds max)
      HARM_DETECTION: 1000, // ms (1 second max)
      RESPONSE_FILTERING: 500, // ms (500ms max)
      ETHICAL_CHECK: 300, // ms (300ms max)
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