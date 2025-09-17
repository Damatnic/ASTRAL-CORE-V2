import { defineConfig, devices } from '@playwright/test';

/**
 * ASTRAL CORE V2 - Phase 10 End-to-End Testing Configuration
 * Comprehensive user journey validation for mental health crisis platform
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: false, // Sequential for crisis scenarios
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line']
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global test timeout
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  // Configure projects for major browsers
  projects: [
    // Desktop Chrome - Primary testing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Mobile Chrome
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Mobile Safari
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Microsoft Edge
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    // Crisis-specific testing setup
    {
      name: 'crisis-flows',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'tests/e2e/auth/crisis-user.json'
      },
      testMatch: '**/crisis-*.spec.ts'
    },

    // Provider portal testing
    {
      name: 'provider-flows',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'tests/e2e/auth/provider-user.json'
      },
      testMatch: '**/provider-*.spec.ts'
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Test timeout
  timeout: 120000,
  
  // Expect timeout
  expect: {
    timeout: 30000,
  },

  // Output directories
  outputDir: 'test-results/',
  
  // Test metadata
  metadata: {
    testType: 'E2E User Journey Testing',
    platform: 'ASTRAL CORE V2',
    phase: 'Phase 10 - End-to-End Validation',
    criticalFeatures: [
      'Crisis Chat Intervention',
      'Volunteer Connection',
      'AI Therapy Integration',
      'Safety Plan Creation',
      'Provider Dashboard',
      'Self-Help Tools'
    ]
  }
});