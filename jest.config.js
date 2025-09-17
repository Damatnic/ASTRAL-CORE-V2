/**
 * ASTRAL_CORE 2.0 - Jest Configuration
 * 
 * LIFE-CRITICAL TESTING CONFIGURATION
 * This configuration ensures comprehensive testing of the crisis intervention platform.
 * Every test could represent a life saved.
 */

module.exports = {
  // Test environment configuration
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Root directories
  rootDir: '.',
  roots: ['<rootDir>/tests', '<rootDir>/packages', '<rootDir>/apps'],
  
  // Module paths and aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@apps/(.*)$': '<rootDir>/apps/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@astralcore/(.*)$': '<rootDir>/packages/$1/src',
  },
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/packages/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/apps/**/*.test.(ts|tsx|js|jsx)',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/.next/',
    '<rootDir>/apps/web/.next/',
  ],
  
  // Module path ignore patterns
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // Setup files (executed before tests)
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Global setup and teardown (commented out to simplify performance testing)
  // globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  // globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'apps/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  
  // Coverage thresholds - CRITICAL for life-saving systems
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher thresholds for critical crisis packages
    'packages/crisis/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'packages/ai-safety/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeouts (crisis scenarios need adequate time)
  testTimeout: 30000, // 30 seconds for crisis tests
  
  // Verbose output for debugging
  verbose: true,
  
  // Error handling
  bail: false, // Don't stop on first failure - need full test results
  errorOnDeprecated: true,
  
  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  
  // Performance and resource management
  maxWorkers: '50%', // Use half of available CPU cores
  
  // Test result processor for crisis system monitoring
  testResultsProcessor: '<rootDir>/tests/utils/crisisTestProcessor.js',
  
  // Custom test environment variables
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  
  // Jest extensions for accessibility and performance testing
  testRunner: 'jest-circus/runner',
  
  // Snapshot configuration
  // snapshotSerializers: ['enzyme-to-json/serializer'], // Commented out - package not installed
  
  // Watch mode configuration
  watchman: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],
  
  // Crisis-specific test categories
  projects: [
    {
      displayName: 'Crisis Core Tests',
      testMatch: ['<rootDir>/tests/crisis/**/*.test.(ts|tsx)'],
      setupFilesAfterEnv: [
        '<rootDir>/tests/setup.ts',
        '<rootDir>/tests/crisis/setup.ts',
      ],
    },
    {
      displayName: 'Accessibility Tests',
      testMatch: ['<rootDir>/tests/accessibility/**/*.test.(ts|tsx)'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/tests/performance/**/*.test.(ts|tsx)'],
      testTimeout: 60000, // Longer timeout for performance tests
    },
    {
      displayName: 'Security Tests',
      testMatch: ['<rootDir>/tests/security/**/*.test.(ts|tsx)'],
      testTimeout: 45000, // Adequate time for security scans
    },
    {
      displayName: 'Package Tests',
      testMatch: ['<rootDir>/packages/**/*.test.(ts|tsx)'],
    },
    {
      displayName: 'App Tests',
      testMatch: ['<rootDir>/apps/**/*.test.(ts|tsx)'],
    },
  ],
};