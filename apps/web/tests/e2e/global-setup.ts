import { chromium, FullConfig } from '@playwright/test';

/**
 * ASTRAL CORE V2 - Global E2E Test Setup
 * Initializes test environment and authentication states
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 ASTRAL CORE V2 - Phase 10 E2E Testing Setup');
  console.log('Initializing crisis platform test environment...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Base URL from config
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  try {
    // Wait for the application to be ready
    console.log('🔍 Checking application availability...');
    await page.goto(baseURL, { timeout: 60000 });
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Create demo user authentication states
    await setupDemoAuthentication(page, baseURL);
    
    console.log('✅ Test environment setup complete');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Setup demo user authentication states for different user types
 */
async function setupDemoAuthentication(page: any, baseURL: string) {
  console.log('🔐 Setting up demo authentication states...');

  // Crisis user authentication
  await createAuthState(page, baseURL, {
    email: 'crisis.user@demo.astral',
    password: 'CrisisDemo2024!',
    userType: 'crisis-user',
    filePath: 'tests/e2e/auth/crisis-user.json'
  });

  // Regular user authentication  
  await createAuthState(page, baseURL, {
    email: 'user@demo.astral',
    password: 'UserDemo2024!',
    userType: 'user',
    filePath: 'tests/e2e/auth/regular-user.json'
  });

  // Therapist authentication
  await createAuthState(page, baseURL, {
    email: 'therapist@demo.astral',
    password: 'TherapistDemo2024!',
    userType: 'therapist',
    filePath: 'tests/e2e/auth/therapist-user.json'
  });

  // Volunteer authentication
  await createAuthState(page, baseURL, {
    email: 'volunteer@demo.astral',
    password: 'VolunteerDemo2024!',
    userType: 'volunteer',
    filePath: 'tests/e2e/auth/volunteer-user.json'
  });

  // Admin authentication
  await createAuthState(page, baseURL, {
    email: 'admin@demo.astral',
    password: 'AdminDemo2024!',
    userType: 'admin',
    filePath: 'tests/e2e/auth/admin-user.json'
  });

  console.log('✅ Demo authentication states created');
}

/**
 * Create authentication state for a specific user type
 */
async function createAuthState(page: any, baseURL: string, config: any) {
  try {
    console.log(`  📝 Creating ${config.userType} authentication...`);
    
    // Navigate to demo login
    await page.goto(`${baseURL}/auth/signin`);
    
    // Wait for demo login section
    await page.waitForSelector('[data-testid="demo-login-section"]', { timeout: 10000 });
    
    // Click on the appropriate demo login button
    const demoButton = await page.locator(`[data-testid="demo-${config.userType}-login"]`);
    if (await demoButton.count() > 0) {
      await demoButton.click();
      
      // Wait for successful login and dashboard load
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      
      // Save authentication state
      await page.context().storageState({ path: config.filePath });
      
      console.log(`  ✅ ${config.userType} authentication created`);
    } else {
      console.log(`  ⚠️  Demo ${config.userType} button not found, skipping...`);
    }
    
  } catch (error) {
    console.log(`  ❌ Failed to create ${config.userType} auth:`, error.message);
    // Continue with other auth states even if one fails
  }
}

export default globalSetup;