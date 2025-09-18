import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * ASTRAL CORE V2 - Global E2E Test Teardown
 * Cleanup test environment and generate final reports
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 ASTRAL CORE V2 - Phase 10 E2E Testing Teardown');
  console.log('Cleaning up test environment...');

  try {
    // Clean up authentication state files
    await cleanupAuthStates();
    
    // Generate test summary
    await generateTestSummary();
    
    console.log('✅ Test environment cleanup complete');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

/**
 * Clean up authentication state files
 */
async function cleanupAuthStates() {
  console.log('🗑️  Cleaning up authentication states...');
  
  const authDir = 'tests/e2e/auth';
  const authFiles = [
    'crisis-user.json',
    'regular-user.json', 
    'therapist-user.json',
    'volunteer-user.json',
    'admin-user.json'
  ];

  for (const file of authFiles) {
    const filePath = path.join(authDir, file);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  ✅ Removed ${file}`);
      }
    } catch (error) {
      console.log(`  ⚠️  Could not remove ${file}:`, error.message);
    }
  }
}

/**
 * Generate test summary report
 */
async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  const summaryData = {
    phase: 'Phase 10 - End-to-End User Journey Testing',
    platform: 'ASTRAL CORE V2',
    timestamp: new Date().toISOString(),
    testEnvironment: {
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      ci: !!process.env.CI,
      node: process.version
    },
    userJourneys: [
      'Crisis User Journey - Anonymous chat to recovery',
      'New User Onboarding - Account creation to first session',
      'Regular User Daily - Login to progress tracking',
      'Therapeutic Progression - Skills learning to milestones',
      'Provider/Volunteer - Dashboard to crisis response'
    ],
    criticalValidations: [
      'Crisis escalation protocols',
      'AI therapy handoffs', 
      'Real-time communication',
      'Data persistence',
      'Accessibility compliance',
      'Cross-browser compatibility'
    ]
  };

  try {
    // Ensure test-results directory exists
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }

    // Write summary file
    fs.writeFileSync(
      'test-results/phase-10-summary.json',
      JSON.stringify(summaryData, null, 2)
    );
    
    console.log('✅ Test summary generated: test-results/phase-10-summary.json');
    
  } catch (error) {
    console.error('❌ Failed to generate test summary:', error);
  }
}

export default globalTeardown;