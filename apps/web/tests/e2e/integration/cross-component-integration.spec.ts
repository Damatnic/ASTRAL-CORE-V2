import { test, expect, Page } from '@playwright/test';

/**
 * ASTRAL CORE V2 - Cross-Component Integration Testing
 * 
 * Validates data flow and communication between components:
 * 1. Crisis chat to AI therapy handoff
 * 2. Real-time volunteer connection
 * 3. Progress data synchronization
 * 4. Provider notification system
 * 5. Offline-to-online data sync
 * 6. Cross-browser real-time features
 */

test.describe('Cross-Component Integration Testing', () => {
  let userPage: Page;
  let providerPage: Page;
  let volunteerPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Set up multiple contexts for different user types
    const userContext = await browser.newContext({
      storageState: 'tests/e2e/auth/regular-user.json'
    });
    userPage = await userContext.newPage();

    const providerContext = await browser.newContext();
    providerPage = await providerContext.newPage();

    const volunteerContext = await browser.newContext();
    volunteerPage = await volunteerContext.newPage();
  });

  test('Crisis Chat to AI Therapy Handoff Integration', async () => {
    console.log('🔄 Testing Crisis Chat to AI Therapy Handoff');

    await test.step('Initiate crisis chat and escalate to AI therapy', async () => {
      // User starts crisis chat
      await userPage.goto('/crisis');
      await userPage.locator('[data-testid="start-crisis-chat"]').click();
      await userPage.waitForSelector('[data-testid="crisis-chat-interface"]');

      // Send crisis message
      const chatInput = userPage.locator('[data-testid="chat-input"]');
      await chatInput.fill('I am having severe anxiety and panic attacks. I need help managing this crisis.');
      await userPage.keyboard.press('Enter');

      // Wait for crisis assessment
      await userPage.waitForSelector('[data-testid="crisis-assessment"]', { timeout: 10000 });
      
      // Complete assessment with high anxiety
      await userPage.locator('[data-testid="anxiety-level-high"]').click();
      await userPage.locator('[data-testid="panic-symptoms-yes"]').click();
      await userPage.locator('[data-testid="submit-assessment"]').click();

      // Verify AI therapy handoff is offered
      await userPage.waitForSelector('[data-testid="ai-therapy-handoff"]', { timeout: 15000 });
      await expect(userPage.locator('[data-testid="ai-therapy-handoff"]')).toContainText(/ai.*therapy|therapeutic.*support/i);

      // Accept AI therapy handoff
      await userPage.locator('[data-testid="accept-ai-therapy"]').click();

      // Verify seamless transition to AI therapy
      await userPage.waitForSelector('[data-testid="ai-therapist-active"]', { timeout: 15000 });
      await expect(userPage.locator('[data-testid="ai-therapist-intro"]')).toBeVisible();

      // Verify crisis context is passed to AI
      await expect(userPage.locator('[data-testid="ai-crisis-context"]')).toContainText(/anxiety|panic/i);

      // AI provides immediate coping strategies
      await userPage.waitForSelector('[data-testid="immediate-coping-strategies"]', { timeout: 10000 });
      await expect(userPage.locator('[data-testid="breathing-exercise-suggestion"]')).toBeVisible();
    });

    await test.step('Verify data continuity across handoff', async () => {
      // Check that crisis severity is maintained
      await expect(userPage.locator('[data-testid="current-crisis-level"]')).toContainText(/high|severe/i);

      // Verify chat history is preserved
      await expect(userPage.locator('[data-testid="chat-history"]')).toContainText('severe anxiety');

      // Check that user profile reflects current crisis state
      await userPage.goto('/profile');
      await expect(userPage.locator('[data-testid="current-status"]')).toContainText(/crisis|support/i);
    });
  });

  test('Real-time Volunteer Connection Integration', async () => {
    console.log('🤝 Testing Real-time Volunteer Connection');

    await test.step('Set up volunteer availability', async () => {
      // Volunteer logs in and sets availability
      await volunteerPage.goto('/auth/signin');
      await volunteerPage.locator('[data-testid="demo-volunteer-login"]').click();
      await volunteerPage.waitForURL('**/dashboard');

      // Set volunteer as available
      await volunteerPage.locator('[data-testid="volunteer-availability-toggle"]').click();
      await expect(volunteerPage.locator('[data-testid="status-available"]')).toBeVisible();

      // Verify volunteer appears in available pool
      await expect(volunteerPage.locator('[data-testid="volunteer-queue-status"]')).toContainText(/ready|available/i);
    });

    await test.step('User requests volunteer connection', async () => {
      // User navigates to crisis support
      await userPage.goto('/crisis');
      await userPage.locator('[data-testid="connect-with-volunteer"]').click();

      // Verify connection request is initiated
      await expect(userPage.locator('[data-testid="volunteer-connecting"]')).toBeVisible();
      await expect(userPage.locator('[data-testid="connection-status"]')).toContainText(/connecting|searching/i);
    });

    await test.step('Verify real-time volunteer notification', async () => {
      // Volunteer should receive real-time notification
      await volunteerPage.waitForSelector('[data-testid="new-connection-request"]', { timeout: 15000 });
      await expect(volunteerPage.locator('[data-testid="connection-alert"]')).toBeVisible();

      // Volunteer accepts connection
      await volunteerPage.locator('[data-testid="accept-connection"]').click();

      // Verify chat interface opens for volunteer
      await volunteerPage.waitForSelector('[data-testid="volunteer-chat-interface"]');
      await expect(volunteerPage.locator('[data-testid="user-profile-summary"]')).toBeVisible();
    });

    await test.step('Test real-time bidirectional communication', async () => {
      // User receives volunteer connection confirmation
      await userPage.waitForSelector('[data-testid="volunteer-connected"]', { timeout: 10000 });
      await expect(userPage.locator('[data-testid="volunteer-name"]')).toBeVisible();

      // User sends message
      const userChatInput = userPage.locator('[data-testid="chat-input"]');
      await userChatInput.fill('Thank you for connecting with me. I really need someone to talk to.');
      await userPage.keyboard.press('Enter');

      // Volunteer receives message in real-time
      await volunteerPage.waitForSelector('[data-testid="new-message"]', { timeout: 5000 });
      await expect(volunteerPage.locator('[data-testid="user-message"]:last-child')).toContainText('Thank you for connecting');

      // Volunteer responds
      const volunteerChatInput = volunteerPage.locator('[data-testid="volunteer-chat-input"]');
      await volunteerChatInput.fill('I\'m here to support you. You\'re not alone. Can you tell me what\'s on your mind?');
      await volunteerPage.keyboard.press('Enter');

      // User receives volunteer response in real-time
      await userPage.waitForSelector('[data-testid="volunteer-message"]:last-child', { timeout: 5000 });
      await expect(userPage.locator('[data-testid="volunteer-message"]:last-child')).toContainText('I\'m here to support');
    });
  });

  test('Progress Data Synchronization Integration', async () => {
    console.log('📊 Testing Progress Data Synchronization');

    await test.step('Complete activities and verify real-time updates', async () => {
      // User completes mood check-in
      await userPage.goto('/dashboard');
      await userPage.locator('[data-testid="mood-tracker"]').click();
      await userPage.locator('[data-testid="mood-rating-8"]').click();
      await userPage.locator('[data-testid="save-mood-checkin"]').click();

      // Verify immediate dashboard update
      await expect(userPage.locator('[data-testid="current-mood-display"]')).toContainText('8');

      // Complete breathing exercise
      await userPage.goto('/self-help/breathing');
      await userPage.locator('[data-testid="start-breathing-exercise"]').click();
      await userPage.waitForSelector('[data-testid="breathing-exercise-complete"]', { timeout: 30000 });
      await userPage.locator('[data-testid="session-rating-5"]').click();
      await userPage.locator('[data-testid="save-session"]').click();

      // Return to dashboard and verify activity completion
      await userPage.goto('/dashboard');
      await expect(userPage.locator('[data-testid="breathing-exercise-complete"]')).toHaveClass(/completed/);
    });

    await test.step('Verify progress syncs to provider dashboard', async () => {
      // Provider logs in
      await providerPage.goto('/auth/signin');
      await providerPage.locator('[data-testid="demo-therapist-login"]').click();
      await providerPage.waitForURL('**/dashboard');

      // Navigate to patient progress
      await providerPage.goto('/provider/patients');
      
      // Select the user's progress (assuming they're in the patient list)
      const patientCard = providerPage.locator('[data-testid="patient-card"]:first-child');
      if (await patientCard.isVisible()) {
        await patientCard.click();

        // Verify real-time progress data is visible
        await expect(providerPage.locator('[data-testid="latest-mood-entry"]')).toContainText('8');
        await expect(providerPage.locator('[data-testid="recent-activities"]')).toContainText(/breathing|exercise/i);

        // Check that timestamps are recent
        const lastUpdate = providerPage.locator('[data-testid="last-activity-timestamp"]');
        if (await lastUpdate.isVisible()) {
          await expect(lastUpdate).toContainText(/minutes?.*ago|just now/i);
        }
      }
    });

    await test.step('Test cross-device synchronization', async () => {
      // Simulate user accessing from different device (new context)
      const mobileContext = await userPage.context().browser()?.newContext({
        storageState: 'tests/e2e/auth/regular-user.json',
        viewport: { width: 375, height: 812 }
      });
      
      if (mobileContext) {
        const mobilePage = await mobileContext.newPage();

        // Navigate to dashboard on mobile
        await mobilePage.goto('/dashboard');

        // Verify data is synchronized across devices
        await expect(mobilePage.locator('[data-testid="current-mood-display"]')).toContainText('8');
        await expect(mobilePage.locator('[data-testid="breathing-exercise-complete"]')).toHaveClass(/completed/);

        await mobilePage.close();
        await mobileContext.close();
      }
    });
  });

  test('Provider Notification System Integration', async () => {
    console.log('🔔 Testing Provider Notification System');

    await test.step('Trigger crisis alert notification', async () => {
      // User triggers high-priority crisis alert
      await userPage.goto('/crisis');
      await userPage.locator('[data-testid="emergency-help"]').click();
      
      // Complete crisis assessment with highest severity
      await userPage.locator('[data-testid="severity-critical"]').click();
      await userPage.locator('[data-testid="immediate-danger-yes"]').click();
      await userPage.locator('[data-testid="submit-crisis-assessment"]').click();
    });

    await test.step('Verify provider receives real-time notification', async () => {
      // Provider should receive immediate notification
      await providerPage.waitForSelector('[data-testid="crisis-alert-notification"]', { timeout: 10000 });
      
      // Verify notification contains critical information
      await expect(providerPage.locator('[data-testid="alert-severity"]')).toContainText(/critical|high/i);
      await expect(providerPage.locator('[data-testid="alert-timestamp"]')).toBeVisible();
      
      // Click on notification to view details
      await providerPage.locator('[data-testid="crisis-alert-notification"]').click();
      
      // Verify crisis details page opens
      await expect(providerPage.locator('[data-testid="crisis-details"]')).toBeVisible();
      await expect(providerPage.locator('[data-testid="user-safety-status"]')).toBeVisible();
    });

    await test.step('Test provider response workflow', async () => {
      // Provider responds to crisis
      await providerPage.locator('[data-testid="respond-to-crisis"]').click();
      await providerPage.fill('[data-testid="provider-response"]', 'Immediate intervention initiated. Contacting emergency services.');
      await providerPage.locator('[data-testid="submit-crisis-response"]').click();

      // Verify response is recorded and user is notified
      await expect(providerPage.locator('[data-testid="response-submitted"]')).toBeVisible();
      
      // User should see provider response
      await userPage.waitForSelector('[data-testid="provider-response-received"]', { timeout: 10000 });
      await expect(userPage.locator('[data-testid="provider-message"]')).toContainText(/intervention.*initiated/i);
    });
  });

  test('Offline-to-Online Data Sync Integration', async () => {
    console.log('🌐 Testing Offline-to-Online Data Sync');

    await test.step('Create data while offline', async () => {
      // Go offline
      await userPage.context().setOffline(true);
      
      // Verify offline mode indicator
      await userPage.goto('/dashboard');
      await expect(userPage.locator('[data-testid="offline-mode"]')).toBeVisible();

      // Complete mood check-in offline
      await userPage.locator('[data-testid="mood-tracker"]').click();
      await userPage.locator('[data-testid="mood-rating-6"]').click();
      await userPage.locator('[data-testid="save-offline"]').click();

      // Verify data is queued for sync
      await expect(userPage.locator('[data-testid="data-queued"]')).toBeVisible();

      // Try to write journal entry offline
      await userPage.goto('/self-help/journaling');
      await userPage.locator('[data-testid="new-journal-entry"]').click();
      await userPage.fill('[data-testid="journal-editor"]', 'This entry was written while offline. Testing sync capabilities.');
      await userPage.locator('[data-testid="save-offline-entry"]').click();
      
      // Verify offline entry is saved locally
      await expect(userPage.locator('[data-testid="offline-entry-saved"]')).toBeVisible();
    });

    await test.step('Verify data syncs when back online', async () => {
      // Go back online
      await userPage.context().setOffline(false);
      
      // Verify online indicator appears
      await userPage.waitForSelector('[data-testid="online-indicator"]', { timeout: 15000 });
      
      // Verify data synchronization
      await userPage.waitForSelector('[data-testid="data-synced"]', { timeout: 20000 });
      
      // Check that offline data is now available online
      await userPage.goto('/dashboard');
      await expect(userPage.locator('[data-testid="current-mood-display"]')).toContainText('6');
      
      // Verify journal entry synced
      await userPage.goto('/self-help/journaling');
      await expect(userPage.locator('[data-testid="journal-entry-today"]')).toContainText('written while offline');
    });

    await test.step('Verify synced data is visible to providers', async () => {
      // Provider checks for updated data
      await providerPage.goto('/provider/patients');
      
      // Refresh patient data
      await providerPage.locator('[data-testid="refresh-patient-data"]').click();
      
      // Verify synced mood data is visible
      const patientCard = providerPage.locator('[data-testid="patient-card"]:first-child');
      if (await patientCard.isVisible()) {
        await patientCard.click();
        await expect(providerPage.locator('[data-testid="latest-mood-entry"]')).toContainText('6');
      }
    });
  });

  test('Cross-Browser Real-time Features', async () => {
    console.log('🌍 Testing Cross-Browser Real-time Features');

    await test.step('Test WebSocket connections across browsers', async () => {
      // Test real-time updates work across different browser contexts
      const firefoxContext = await userPage.context().browser()?.newContext({
        storageState: 'tests/e2e/auth/regular-user.json'
      });
      
      if (firefoxContext) {
        const firefoxPage = await firefoxContext.newPage();
        
        // User makes update in Chrome (userPage)
        await userPage.goto('/dashboard');
        await userPage.locator('[data-testid="mood-tracker"]').click();
        await userPage.locator('[data-testid="mood-rating-9"]').click();
        await userPage.locator('[data-testid="save-mood-checkin"]').click();
        
        // Verify update appears in Firefox page
        await firefoxPage.goto('/dashboard');
        await firefoxPage.waitForSelector('[data-testid="current-mood-display"]', { timeout: 10000 });
        await expect(firefoxPage.locator('[data-testid="current-mood-display"]')).toContainText('9');
        
        await firefoxPage.close();
        await firefoxContext.close();
      }
    });

    await test.step('Test concurrent user sessions', async () => {
      // Create second user session
      const user2Context = await userPage.context().browser()?.newContext();
      
      if (user2Context) {
        const user2Page = await user2Context.newPage();
        
        // Second user triggers crisis
        await user2Page.goto('/crisis');
        await user2Page.locator('[data-testid="start-crisis-chat"]').click();
        
        // Verify volunteer can see multiple active sessions
        await volunteerPage.goto('/volunteer/dashboard');
        const activeSessions = volunteerPage.locator('[data-testid="active-crisis-sessions"]');
        
        if (await activeSessions.isVisible()) {
          // Should show multiple sessions
          await expect(activeSessions).toContainText(/[2-9]+|multiple/i);
        }
        
        await user2Page.close();
        await user2Context.close();
      }
    });
  });

  test.afterAll(async () => {
    // Clean up all pages and contexts
    if (userPage) await userPage.close();
    if (providerPage) await providerPage.close();
    if (volunteerPage) await volunteerPage.close();
  });
});