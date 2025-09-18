/** @type {import('jest').Config} */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path to your Next.js app
  dir: './',
});

// Custom Jest configuration for ASTRAL_CORE 2.0
// Crisis-critical testing with accessibility and performance validation
const customJestConfig = {
  displayName: 'ASTRAL_CORE 2.0 - Crisis Platform Tests',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/crisis/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // Coverage configuration - 100% for crisis-critical functions
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    // Crisis intervention must have 100% coverage
    'src/lib/crisis/**/*.{js,jsx,ts,tsx}',
    'src/components/crisis/**/*.{js,jsx,ts,tsx}',
    'src/app/crisis/**/*.{js,jsx,ts,tsx}',
    // Volunteer management critical paths
    'src/lib/volunteer/**/*.{js,jsx,ts,tsx}',
    // Safety systems must be fully tested
    'src/lib/safety/**/*.{js,jsx,ts,tsx}',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Crisis-critical code requires 100% coverage
    'src/lib/crisis/**': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/crisis/**': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/lib/safety/**': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  
  // Module name mapping for monorepo packages
  moduleNameMapper: {
    '^@astral/(.*)$': '<rootDir>/../../packages/$1/src',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    '^.+\\.css$': 'jest-transform-stub',
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Test timeout - longer for integration tests
  testTimeout: 30000,
  
  // Custom reporters for crisis platform
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'crisis-test-report.html',
        pageTitle: 'ASTRAL_CORE 2.0 Crisis Platform Tests',
        logoImgPath: './public/logo.png',
        hideIcon: false,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
  
  // Test categories
  projects: [
    // Unit tests - fast, isolated
    {
      displayName: '🧪 Unit Tests',
      testMatch: ['<rootDir>/src/**/*.unit.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 5000,
    },
    
    // Integration tests - component + API
    {
      displayName: '🔗 Integration Tests', 
      testMatch: ['<rootDir>/src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 15000,
    },
    
    // Crisis flow tests - end-to-end critical paths
    {
      displayName: '🚨 Crisis Tests',
      testMatch: ['<rootDir>/tests/crisis/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 30000,
      setupFilesAfterEnv: [
        '<rootDir>/tests/crisis/setup.ts',
      ],
    },
    
    // Performance tests - response time validation
    {
      displayName: '⚡ Performance Tests',
      testMatch: ['<rootDir>/tests/performance/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 60000,
    },
    
    // Accessibility tests - WCAG compliance
    {
      displayName: '♿ Accessibility Tests',
      testMatch: ['<rootDir>/tests/accessibility/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 15000,
      setupFilesAfterEnv: [
        '<rootDir>/tests/accessibility/setup.ts',
      ],
    },
    
    // Security tests - penetration testing
    {
      displayName: '🔒 Security Tests',
      testMatch: ['<rootDir>/tests/security/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 30000,
    },
  ],
  
  // Global setup and teardown (disabled until files exist)
  // globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  // globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',
  
  // Verbose output for debugging
  verbose: true,
  
  // Fail fast on critical test failures
  bail: process.env.NODE_ENV === 'production' ? 5 : false,
  
  // Watch options
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
  ],
};

// Export Jest configuration
module.exports = createJestConfig(customJestConfig);