import { test, expect, Page } from '@playwright/test';

/**
 * ASTRAL CORE V2 - New User Onboarding Journey E2E Testing
 * 
 * Complete validation of new user experience:
 * 1. Account creation and verification
 * 2. Onboarding flow and tutorials
 * 3. Initial assessments and goal setting
 * 4. First self-help tool usage
 * 5. AI therapist introduction
 * 6. Dashboard familiarization
 */

test.describe('New User Onboarding Journey', () => {
  let page: Page;
  const testEmail = `test.user.${Date.now()}@astral.test`;
  const testPassword = 'NewUser2024!';

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Log console errors for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  test('Complete New User Onboarding Flow', async () => {
    console.log('👋 Testing Complete New User Onboarding Flow');

    // Step 1: Account creation and verification
    await test.step('Create new user account', async () => {
      await page.goto('/auth/signup');
      
      // Verify signup page loads
      await expect(page.locator('h1')).toContainText(/sign up|create|register/i);
      
      // Fill out registration form
      await page.fill('[data-testid="signup-email"], input[type="email"]', testEmail);
      await page.fill('[data-testid="signup-password"], input[type="password"]', testPassword);
      await page.fill('[data-testid="signup-confirm-password"]', testPassword);
      
      // Accept terms and conditions
      await page.check('[data-testid="accept-terms"]');
      
      // Submit registration
      await page.locator('[data-testid="signup-submit"], button[type="submit"]').click();
      
      // Verify account created (may redirect to verification or dashboard)
      await page.waitForURL(/\/(verify|dashboard|onboarding)/, { timeout: 15000 });
    });

    // Step 2: Complete email verification (if required)
    await test.step('Handle email verification process', async () => {
      const currentUrl = page.url();
      
      if (currentUrl.includes('/verify')) {
        // Simulate email verification
        console.log('📧 Email verification required');
        
        // For testing, assume verification code is available
        const verificationInput = page.locator('[data-testid="verification-code"]');
        if (await verificationInput.isVisible()) {
          await verificationInput.fill('123456'); // Test verification code
          await page.locator('[data-testid="verify-submit"]').click();
          
          // Wait for verification completion
          await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
        }
      }
    });

    // Step 3: Onboarding flow and tutorials
    await test.step('Complete onboarding tutorials', async () => {
      // Check if onboarding flow is present
      const onboardingStart = page.locator('[data-testid="onboarding-start"], [data-testid="welcome-tutorial"]');
      
      if (await onboardingStart.isVisible()) {
        await onboardingStart.click();
        
        // Navigate through onboarding steps
        const steps = [
          'platform-overview',
          'crisis-resources',
          'self-help-tools',
          'ai-therapist-intro',
          'privacy-security'
        ];
        
        for (const step of steps) {
          const stepElement = page.locator(`[data-testid="onboarding-${step}"]`);
          if (await stepElement.isVisible()) {
            // Verify step content is visible
            await expect(stepElement).toBeVisible();
            
            // Click next button
            const nextButton = page.locator('[data-testid="onboarding-next"]');
            if (await nextButton.isVisible()) {
              await nextButton.click();
              await page.waitForTimeout(1000); // Allow transition
            }
          }
        }
        
        // Complete onboarding
        const completeButton = page.locator('[data-testid="onboarding-complete"]');
        if (await completeButton.isVisible()) {
          await completeButton.click();
        }
      }
    });

    // Step 4: Initial assessments and goal setting
    await test.step('Complete initial mental health assessment', async () => {
      // Look for initial assessment prompt
      const assessmentPrompt = page.locator('[data-testid="initial-assessment"], [data-testid="mental-health-assessment"]');
      
      if (await assessmentPrompt.isVisible()) {
        await assessmentPrompt.click();
        
        // Complete PHQ-9 style assessment
        const moodQuestions = page.locator('[data-testid^="mood-question-"]');
        const questionCount = await moodQuestions.count();
        
        for (let i = 0; i < questionCount; i++) {
          const question = moodQuestions.nth(i);
          // Select moderate response (index 2 out of 0-3 scale)
          await question.locator('input[value="2"], [data-value="2"]').check();
        }
        
        // Submit assessment
        await page.locator('[data-testid="submit-assessment"]').click();
        
        // Verify assessment results
        await expect(page.locator('[data-testid="assessment-results"]')).toBeVisible();
      }
    });

    // Step 5: Goal setting
    await test.step('Set personal mental health goals', async () => {
      const goalSetting = page.locator('[data-testid="goal-setting"], [data-testid="set-goals"]');
      
      if (await goalSetting.isVisible()) {
        await goalSetting.click();
        
        // Set primary goals
        await page.check('[data-testid="goal-anxiety-management"]');
        await page.check('[data-testid="goal-mood-improvement"]');
        await page.check('[data-testid="goal-coping-skills"]');
        
        // Set custom goal
        const customGoalInput = page.locator('[data-testid="custom-goal-input"]');
        if (await customGoalInput.isVisible()) {
          await customGoalInput.fill('Improve sleep quality and reduce stress');
        }
        
        // Save goals
        await page.locator('[data-testid="save-goals"]').click();
        
        // Verify goals saved
        await expect(page.locator('[data-testid="goals-saved"]')).toBeVisible();
      }
    });

    // Step 6: First self-help tool usage
    await test.step('Complete first self-help tool session', async () => {
      // Navigate to self-help tools
      await page.goto('/self-help');
      
      // Try breathing exercises first
      const breathingExercise = page.locator('[data-testid="breathing-exercises"], a[href*="breathing"]');
      await expect(breathingExercise).toBeVisible();
      await breathingExercise.click();
      
      // Complete a breathing exercise
      const startExercise = page.locator('[data-testid="start-breathing-exercise"]');
      if (await startExercise.isVisible()) {
        await startExercise.click();
        
        // Wait for exercise to complete (simulated)
        await page.waitForSelector('[data-testid="exercise-complete"]', { timeout: 30000 });
        
        // Rate the exercise
        const ratingStars = page.locator('[data-testid="exercise-rating"] [data-testid^="star-"]');
        if (await ratingStars.first().isVisible()) {
          await ratingStars.nth(3).click(); // 4-star rating
        }
        
        // Save feedback
        const feedbackInput = page.locator('[data-testid="exercise-feedback"]');
        if (await feedbackInput.isVisible()) {
          await feedbackInput.fill('This breathing exercise was very helpful for calming my anxiety.');
          await page.locator('[data-testid="save-feedback"]').click();
        }
      }
    });

    // Step 7: AI therapist introduction
    await test.step('Meet the AI therapist', async () => {
      // Navigate to AI therapy section
      await page.goto('/ai-therapy');
      
      // Start AI therapist introduction
      const aiIntro = page.locator('[data-testid="ai-therapist-intro"], [data-testid="start-ai-session"]');
      if (await aiIntro.isVisible()) {
        await aiIntro.click();
        
        // Wait for AI therapist to load
        await page.waitForSelector('[data-testid="ai-therapist-active"]', { timeout: 15000 });
        
        // Verify AI introduction message
        await expect(page.locator('[data-testid="ai-welcome-message"]')).toContainText(/welcome|hello|introduction/i);
        
        // Engage in brief conversation
        const chatInput = page.locator('[data-testid="ai-chat-input"]');
        await chatInput.fill('Hello, I am new to the platform and would like to learn about mental health support.');
        await page.keyboard.press('Enter');
        
        // Wait for AI response
        await page.waitForSelector('[data-testid="ai-response"]', { timeout: 10000 });
        
        // Verify AI provides helpful information
        await expect(page.locator('[data-testid="ai-response"]')).toContainText(/support|help|resources/i);
      }
    });

    // Step 8: Dashboard familiarization
    await test.step('Explore and familiarize with dashboard', async () => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Verify key dashboard elements
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
      
      // Check crisis resources are easily accessible
      await expect(page.locator('[data-testid="crisis-resources-access"]')).toBeVisible();
      
      // Verify self-help tools are available
      await expect(page.locator('[data-testid="self-help-access"]')).toBeVisible();
      
      // Check mood tracking is available
      const moodTracker = page.locator('[data-testid="mood-tracker"], [data-testid="daily-checkin"]');
      if (await moodTracker.isVisible()) {
        await moodTracker.click();
        
        // Complete first mood check-in
        await page.locator('[data-testid="mood-good"]').click();
        await page.locator('[data-testid="save-mood"]').click();
        
        // Verify mood saved
        await expect(page.locator('[data-testid="mood-saved"]')).toBeVisible();
      }
    });

    // Step 9: Complete onboarding checklist
    await test.step('Verify onboarding completion', async () => {
      // Check onboarding progress
      const onboardingProgress = page.locator('[data-testid="onboarding-progress"]');
      if (await onboardingProgress.isVisible()) {
        // Verify key milestones completed
        await expect(page.locator('[data-testid="milestone-account-created"]')).toHaveClass(/completed/);
        await expect(page.locator('[data-testid="milestone-assessment-done"]')).toHaveClass(/completed/);
        await expect(page.locator('[data-testid="milestone-first-tool-used"]')).toHaveClass(/completed/);
        await expect(page.locator('[data-testid="milestone-ai-introduced"]')).toHaveClass(/completed/);
      }
      
      // Verify user preferences are set
      await page.goto('/settings');
      await expect(page.locator('[data-testid="user-preferences"]')).toBeVisible();
      
      // Verify crisis plan option is available
      await expect(page.locator('[data-testid="create-crisis-plan"]')).toBeVisible();
    });

    console.log('✅ New User Onboarding Journey completed successfully');
  });

  test('Onboarding Accessibility Validation', async () => {
    console.log('♿ Testing Onboarding Accessibility');

    await test.step('Verify onboarding accessibility compliance', async () => {
      await page.goto('/auth/signup');
      
      // Check form accessibility
      await expect(page.locator('label[for="email"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
      
      // Verify ARIA labels
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('aria-describedby');
      
      // Check keyboard navigation
      await page.keyboard.press('Tab');
      await expect(emailInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
    });
  });

  test('Onboarding Error Recovery', async () => {
    console.log('🔄 Testing Onboarding Error Recovery');

    await test.step('Handle network interruption during onboarding', async () => {
      await page.goto('/auth/signup');
      
      // Start filling form
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      
      // Simulate network interruption
      await page.context().setOffline(true);
      
      // Try to submit
      await page.locator('button[type="submit"]').click();
      
      // Verify error handling
      await expect(page.locator('[data-testid="network-error"], [data-testid="offline-message"]')).toBeVisible();
      
      // Restore network
      await page.context().setOffline(false);
      
      // Verify form data preserved
      await expect(page.locator('input[type="email"]')).toHaveValue(testEmail);
      
      // Retry submission
      await page.locator('button[type="submit"]').click();
      
      // Verify successful submission after recovery
      await page.waitForURL(/\/(verify|dashboard|onboarding)/, { timeout: 15000 });
    });
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });
});