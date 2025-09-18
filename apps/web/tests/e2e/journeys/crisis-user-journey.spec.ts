import { test, expect, Page } from '@playwright/test';

/**
 * ASTRAL CORE V2 - Crisis User Journey E2E Testing
 * 
 * Complete validation of crisis intervention flow:
 * 1. Anonymous crisis chat initiation
 * 2. Crisis severity assessment and escalation
 * 3. Volunteer connection and handoff
 * 4. AI therapist intervention
 * 5. Safety plan creation
 * 6. Follow-up and recovery tracking
 */

test.describe('Crisis User Journey - End-to-End Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create new context for each test (fresh start)
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  test('Complete Crisis Intervention Flow - Anonymous User', async () => {
    console.log('🚨 Testing Complete Crisis Intervention Flow');

    // Step 1: Access crisis page anonymously
    await test.step('Access crisis page anonymously', async () => {
      await page.goto('/crisis');
      
      // Verify crisis page loads
      await expect(page.locator('h1')).toContainText(/crisis|help|support/i);
      
      // Check for emergency contact info immediately visible
      await expect(page.locator('[data-testid="emergency-contact"]')).toBeVisible();
      
      // Verify 988 crisis line is prominently displayed
      await expect(page.locator('text=988')).toBeVisible();
    });

    // Step 2: Initiate anonymous crisis chat
    await test.step('Initiate anonymous crisis chat', async () => {
      // Click on start chat button
      const startChatButton = page.locator('[data-testid="start-crisis-chat"], button:has-text("Start Chat")');
      await expect(startChatButton).toBeVisible();
      await startChatButton.click();
      
      // Verify chat interface loads
      await page.waitForSelector('[data-testid="crisis-chat-interface"]', { timeout: 15000 });
      
      // Check for safety disclaimer
      await expect(page.locator('[data-testid="safety-disclaimer"]')).toBeVisible();
      
      // Verify chat input is available
      await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    });

    // Step 3: Crisis severity assessment
    await test.step('Complete crisis severity assessment', async () => {
      // Send initial crisis message
      const chatInput = page.locator('[data-testid="chat-input"]');
      await chatInput.fill('I am having thoughts of self-harm and need help');
      await page.keyboard.press('Enter');
      
      // Wait for AI response with assessment questions
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 10000 });
      
      // Look for crisis assessment interface
      const assessmentPrompt = page.locator('[data-testid="crisis-assessment"]');
      if (await assessmentPrompt.isVisible()) {
        // Complete crisis severity assessment
        await page.locator('[data-testid="severity-high"]').click();
        await page.locator('[data-testid="immediate-danger-yes"]').click();
        await page.locator('[data-testid="submit-assessment"]').click();
      }
      
      // Verify high-risk response triggered
      await expect(page.locator('[data-testid="high-risk-response"]')).toBeVisible({ timeout: 15000 });
    });

    // Step 4: Volunteer connection and escalation
    await test.step('Connect with volunteer and escalate', async () => {
      // Check for volunteer connection notification
      const volunteerConnect = page.locator('[data-testid="volunteer-connecting"]');
      
      if (await volunteerConnect.isVisible()) {
        // Wait for volunteer to join (simulated)
        await page.waitForSelector('[data-testid="volunteer-joined"]', { timeout: 20000 });
        
        // Verify volunteer identification
        await expect(page.locator('[data-testid="volunteer-name"]')).toBeVisible();
        
        // Simulate conversation with volunteer
        await chatInput.fill('Thank you for connecting with me');
        await page.keyboard.press('Enter');
        
        // Check for escalation options
        const escalateButton = page.locator('[data-testid="escalate-to-professional"]');
        if (await escalateButton.isVisible()) {
          await escalateButton.click();
        }
      }
    });

    // Step 5: AI therapist intervention
    await test.step('AI therapist intervention and support', async () => {
      // Wait for AI therapist to join
      await page.waitForSelector('[data-testid="ai-therapist-active"]', { timeout: 15000 });
      
      // Verify AI therapist introduction
      await expect(page.locator('[data-testid="ai-therapist-intro"]')).toContainText(/AI|therapist|support/i);
      
      // Engage with AI therapist
      await chatInput.fill('I need help with coping strategies');
      await page.keyboard.press('Enter');
      
      // Wait for AI response with coping strategies
      await page.waitForSelector('[data-testid="coping-strategies"]', { timeout: 15000 });
      
      // Verify therapeutic content provided
      await expect(page.locator('[data-testid="breathing-exercise"]')).toBeVisible();
      await expect(page.locator('[data-testid="grounding-technique"]')).toBeVisible();
    });

    // Step 6: Safety plan creation
    await test.step('Create personalized safety plan', async () => {
      // Access safety plan creation
      const safetyPlanButton = page.locator('[data-testid="create-safety-plan"]');
      await expect(safetyPlanButton).toBeVisible();
      await safetyPlanButton.click();
      
      // Fill out safety plan components
      await page.fill('[data-testid="warning-signs"]', 'Feeling overwhelmed, isolation, negative thoughts');
      await page.fill('[data-testid="coping-strategies"]', 'Deep breathing, calling friend, listening to music');
      await page.fill('[data-testid="support-contacts"]', 'Best friend: Sarah (555) 123-4567');
      await page.fill('[data-testid="professional-contacts"]', 'Therapist: Dr. Smith (555) 987-6543');
      
      // Save safety plan
      await page.locator('[data-testid="save-safety-plan"]').click();
      
      // Verify safety plan saved
      await expect(page.locator('[data-testid="safety-plan-saved"]')).toBeVisible();
    });

    // Step 7: Follow-up and recovery tracking setup
    await test.step('Set up follow-up and recovery tracking', async () => {
      // Check for follow-up options
      const followUpSection = page.locator('[data-testid="follow-up-options"]');
      
      if (await followUpSection.isVisible()) {
        // Schedule check-in
        await page.locator('[data-testid="schedule-checkin"]').click();
        await page.selectOption('[data-testid="checkin-frequency"]', '24-hours');
        await page.locator('[data-testid="confirm-followup"]').click();
        
        // Verify follow-up scheduled
        await expect(page.locator('[data-testid="followup-confirmed"]')).toBeVisible();
      }
      
      // Check for resource recommendations
      await expect(page.locator('[data-testid="crisis-resources"]')).toBeVisible();
      await expect(page.locator('[data-testid="self-help-tools"]')).toBeVisible();
    });

    // Step 8: Verify crisis session completion
    await test.step('Complete crisis session with proper closure', async () => {
      // End crisis session
      const endSessionButton = page.locator('[data-testid="end-crisis-session"]');
      if (await endSessionButton.isVisible()) {
        await endSessionButton.click();
        
        // Confirm session end
        await page.locator('[data-testid="confirm-end-session"]').click();
        
        // Verify session summary
        await expect(page.locator('[data-testid="session-summary"]')).toBeVisible();
        
        // Check for crisis resources still available
        await expect(page.locator('[data-testid="emergency-resources"]')).toBeVisible();
      }
    });

    console.log('✅ Crisis User Journey completed successfully');
  });

  test('Crisis Escalation - Immediate Danger Protocol', async () => {
    console.log('🚨 Testing Immediate Danger Escalation Protocol');

    await test.step('Trigger immediate danger protocol', async () => {
      await page.goto('/crisis');
      
      // Start crisis chat
      await page.locator('[data-testid="start-crisis-chat"]').click();
      await page.waitForSelector('[data-testid="crisis-chat-interface"]');
      
      // Send immediate danger message
      const chatInput = page.locator('[data-testid="chat-input"]');
      await chatInput.fill('I am going to hurt myself right now');
      await page.keyboard.press('Enter');
      
      // Verify immediate escalation
      await page.waitForSelector('[data-testid="immediate-danger-alert"]', { timeout: 5000 });
      
      // Check for emergency protocol activation
      await expect(page.locator('[data-testid="emergency-protocol"]')).toBeVisible();
      await expect(page.locator('[data-testid="crisis-hotline-dial"]')).toBeVisible();
      
      // Verify 911 call option present
      await expect(page.locator('[data-testid="call-911"]')).toBeVisible();
    });
  });

  test('Crisis Chat - Network Connectivity Recovery', async () => {
    console.log('🌐 Testing Crisis Chat Network Recovery');

    await test.step('Test offline/online crisis chat continuity', async () => {
      await page.goto('/crisis');
      
      // Start crisis chat
      await page.locator('[data-testid="start-crisis-chat"]').click();
      await page.waitForSelector('[data-testid="crisis-chat-interface"]');
      
      // Send message
      const chatInput = page.locator('[data-testid="chat-input"]');
      await chatInput.fill('I need help with anxiety');
      await page.keyboard.press('Enter');
      
      // Simulate network interruption
      await page.context().setOffline(true);
      
      // Try to send message while offline
      await chatInput.fill('Are you still there?');
      await page.keyboard.press('Enter');
      
      // Verify offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Restore network
      await page.context().setOffline(false);
      
      // Verify reconnection and message sync
      await page.waitForSelector('[data-testid="online-indicator"]', { timeout: 10000 });
      await expect(page.locator('[data-testid="messages-synced"]')).toBeVisible();
    });
  });

  test.afterEach(async () => {
    // Cleanup after each test
    if (page) {
      await page.close();
    }
  });
});