import { test, expect, Page } from '@playwright/test';

/**
 * ASTRAL CORE V2 - Regular User Daily Journey E2E Testing
 * 
 * Complete validation of typical daily user experience:
 * 1. Login and dashboard overview
 * 2. Daily mood check-in
 * 3. Journaling session
 * 4. Breathing exercise completion
 * 5. DBT/CBT skill practice
 * 6. Progress review
 */

test.describe('Regular User Daily Journey', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      // Use demo user authentication state
      storageState: 'tests/e2e/auth/regular-user.json'
    });
    page = await context.newPage();
    
    // Log console errors for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
  });

  test('Complete Daily Mental Health Routine', async () => {
    console.log('🌅 Testing Complete Daily Mental Health Routine');

    // Step 1: Login and dashboard overview
    await test.step('Access dashboard and daily overview', async () => {
      await page.goto('/dashboard');
      
      // Verify dashboard loads successfully
      await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
      
      // Check daily greeting message
      await expect(page.locator('[data-testid="daily-greeting"]')).toContainText(/good|morning|afternoon|evening/i);
      
      // Verify key dashboard sections
      await expect(page.locator('[data-testid="mood-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="daily-goals"]')).toBeVisible();
      
      // Check crisis resources are always accessible
      await expect(page.locator('[data-testid="crisis-help-access"]')).toBeVisible();
    });

    // Step 2: Daily mood check-in
    await test.step('Complete daily mood check-in', async () => {
      // Click on mood tracker
      const moodTracker = page.locator('[data-testid="mood-tracker"], [data-testid="daily-checkin"]');
      await expect(moodTracker).toBeVisible();
      await moodTracker.click();
      
      // Select mood rating
      await page.locator('[data-testid="mood-rating-7"]').click(); // Good mood
      
      // Add mood notes
      const moodNotes = page.locator('[data-testid="mood-notes"]');
      if (await moodNotes.isVisible()) {
        await moodNotes.fill('Feeling optimistic today. Had a good night\'s sleep and looking forward to practicing mindfulness.');
      }
      
      // Select mood factors
      await page.check('[data-testid="factor-sleep"]');
      await page.check('[data-testid="factor-exercise"]');
      await page.check('[data-testid="factor-social"]');
      
      // Save mood check-in
      await page.locator('[data-testid="save-mood-checkin"]').click();
      
      // Verify mood saved successfully
      await expect(page.locator('[data-testid="mood-saved-confirmation"]')).toBeVisible();
      
      // Check streak counter updated
      const streakCounter = page.locator('[data-testid="checkin-streak"]');
      if (await streakCounter.isVisible()) {
        await expect(streakCounter).toContainText(/\d+/); // Should show number
      }
    });

    // Step 3: Journaling session
    await test.step('Complete journaling session', async () => {
      // Navigate to journaling
      await page.goto('/self-help/journaling');
      
      // Start new journal entry
      const newEntryButton = page.locator('[data-testid="new-journal-entry"]');
      await expect(newEntryButton).toBeVisible();
      await newEntryButton.click();
      
      // Select journal prompt or free writing
      const promptOption = page.locator('[data-testid="journal-prompt-gratitude"]');
      if (await promptOption.isVisible()) {
        await promptOption.click();
      }
      
      // Write journal entry
      const journalEditor = page.locator('[data-testid="journal-editor"], textarea[data-testid="journal-content"]');
      await expect(journalEditor).toBeVisible();
      await journalEditor.fill(`
        Today I am grateful for:
        1. The peaceful morning I had with my coffee
        2. The supportive conversation with my friend
        3. The progress I'm making with my mental health
        
        I'm feeling more confident in my ability to handle stress and I'm proud of myself for staying consistent with my self-care routine.
      `);
      
      // Add mood tag to entry
      const moodTag = page.locator('[data-testid="journal-mood-positive"]');
      if (await moodTag.isVisible()) {
        await moodTag.click();
      }
      
      // Save journal entry
      await page.locator('[data-testid="save-journal-entry"]').click();
      
      // Verify entry saved
      await expect(page.locator('[data-testid="journal-saved"]')).toBeVisible();
      
      // Check entry appears in journal list
      await expect(page.locator('[data-testid="journal-entry-today"]')).toBeVisible();
    });

    // Step 4: Breathing exercise completion
    await test.step('Complete breathing exercise session', async () => {
      // Navigate to breathing exercises
      await page.goto('/self-help/breathing');
      
      // Select 4-7-8 breathing technique
      const breathingTechnique = page.locator('[data-testid="breathing-4-7-8"], [data-testid="select-4-7-8"]');
      await expect(breathingTechnique).toBeVisible();
      await breathingTechnique.click();
      
      // Start the exercise
      const startButton = page.locator('[data-testid="start-breathing-exercise"]');
      await expect(startButton).toBeVisible();
      await startButton.click();
      
      // Wait for exercise instructions
      await expect(page.locator('[data-testid="breathing-instructions"]')).toBeVisible();
      
      // Follow exercise cycles (simulated - wait for completion)
      await page.waitForSelector('[data-testid="breathing-cycle-1"]', { timeout: 10000 });
      await page.waitForSelector('[data-testid="breathing-cycle-2"]', { timeout: 15000 });
      await page.waitForSelector('[data-testid="breathing-cycle-3"]', { timeout: 20000 });
      
      // Exercise completion
      await page.waitForSelector('[data-testid="breathing-exercise-complete"]', { timeout: 30000 });
      
      // Rate the session
      const rating = page.locator('[data-testid="session-rating-4"]');
      if (await rating.isVisible()) {
        await rating.click();
      }
      
      // Add session feedback
      const feedback = page.locator('[data-testid="session-feedback"]');
      if (await feedback.isVisible()) {
        await feedback.fill('This breathing exercise helped me feel more centered and calm.');
      }
      
      // Save session data
      await page.locator('[data-testid="save-session"]').click();
      
      // Verify session recorded
      await expect(page.locator('[data-testid="session-recorded"]')).toBeVisible();
    });

    // Step 5: DBT/CBT skill practice
    await test.step('Practice DBT/CBT skills', async () => {
      // Navigate to DBT skills
      await page.goto('/self-help/dbt');
      
      // Select TIPP skill (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation)
      const tippSkill = page.locator('[data-testid="dbt-skill-tipp"], [data-testid="select-tipp"]');
      await expect(tippSkill).toBeVisible();
      await tippSkill.click();
      
      // Read skill instructions
      await expect(page.locator('[data-testid="skill-instructions"]')).toBeVisible();
      
      // Practice the skill
      const practiceButton = page.locator('[data-testid="practice-skill"]');
      await expect(practiceButton).toBeVisible();
      await practiceButton.click();
      
      // Follow guided practice
      await page.waitForSelector('[data-testid="practice-step-1"]', { timeout: 5000 });
      await page.locator('[data-testid="complete-step-1"]').click();
      
      await page.waitForSelector('[data-testid="practice-step-2"]', { timeout: 5000 });
      await page.locator('[data-testid="complete-step-2"]').click();
      
      await page.waitForSelector('[data-testid="practice-step-3"]', { timeout: 5000 });
      await page.locator('[data-testid="complete-step-3"]').click();
      
      // Complete skill practice
      await page.waitForSelector('[data-testid="skill-practice-complete"]', { timeout: 10000 });
      
      // Rate skill effectiveness
      await page.locator('[data-testid="skill-effectiveness-high"]').click();
      
      // Save practice session
      await page.locator('[data-testid="save-skill-practice"]').click();
      
      // Verify practice recorded
      await expect(page.locator('[data-testid="practice-saved"]')).toBeVisible();
    });

    // Step 6: Progress review
    await test.step('Review daily progress and plan ahead', async () => {
      // Navigate to progress page
      await page.goto('/progress');
      
      // Verify progress dashboard loads
      await expect(page.locator('[data-testid="progress-dashboard"]')).toBeVisible();
      
      // Check mood trend chart
      await expect(page.locator('[data-testid="mood-trend-chart"]')).toBeVisible();
      
      // Check activity completion metrics
      await expect(page.locator('[data-testid="daily-activity-completion"]')).toBeVisible();
      
      // Verify today's activities are marked complete
      await expect(page.locator('[data-testid="mood-checkin-complete"]')).toHaveClass(/completed/);
      await expect(page.locator('[data-testid="journaling-complete"]')).toHaveClass(/completed/);
      await expect(page.locator('[data-testid="breathing-complete"]')).toHaveClass(/completed/);
      await expect(page.locator('[data-testid="skill-practice-complete"]')).toHaveClass(/completed/);
      
      // Check weekly progress
      const weeklyProgress = page.locator('[data-testid="weekly-progress"]');
      if (await weeklyProgress.isVisible()) {
        await expect(weeklyProgress).toContainText(/\d+%/); // Should show percentage
      }
      
      // Set goals for tomorrow
      const tomorrowGoals = page.locator('[data-testid="tomorrow-goals"]');
      if (await tomorrowGoals.isVisible()) {
        await page.check('[data-testid="goal-mood-checkin"]');
        await page.check('[data-testid="goal-meditation"]');
        await page.check('[data-testid="goal-exercise"]');
        
        await page.locator('[data-testid="save-tomorrow-goals"]').click();
        
        // Verify goals saved
        await expect(page.locator('[data-testid="goals-saved"]')).toBeVisible();
      }
    });

    // Step 7: Check notifications and reminders
    await test.step('Manage notifications and reminders', async () => {
      // Check for any notifications
      const notificationBell = page.locator('[data-testid="notifications"], [data-testid="notification-bell"]');
      if (await notificationBell.isVisible()) {
        await notificationBell.click();
        
        // Check for encouragement messages
        const encouragementNotif = page.locator('[data-testid="encouragement-notification"]');
        if (await encouragementNotif.isVisible()) {
          await expect(encouragementNotif).toContainText(/great|progress|keep/i);
        }
        
        // Mark notifications as read
        const markAllRead = page.locator('[data-testid="mark-all-read"]');
        if (await markAllRead.isVisible()) {
          await markAllRead.click();
        }
      }
      
      // Set reminder for tomorrow
      const setReminder = page.locator('[data-testid="set-daily-reminder"]');
      if (await setReminder.isVisible()) {
        await setReminder.click();
        
        // Select reminder time
        await page.selectOption('[data-testid="reminder-time"]', '09:00');
        
        // Save reminder
        await page.locator('[data-testid="save-reminder"]').click();
        
        // Verify reminder set
        await expect(page.locator('[data-testid="reminder-confirmed"]')).toBeVisible();
      }
    });

    console.log('✅ Regular User Daily Journey completed successfully');
  });

  test('Quick Daily Check-in Flow', async () => {
    console.log('⚡ Testing Quick Daily Check-in Flow');

    await test.step('Complete minimal daily routine', async () => {
      await page.goto('/dashboard');
      
      // Quick mood check-in
      await page.locator('[data-testid="quick-mood-checkin"]').click();
      await page.locator('[data-testid="mood-good"]').click();
      
      // Skip optional activities
      await page.locator('[data-testid="skip-detailed-checkin"]').click();
      
      // Verify quick completion recorded
      await expect(page.locator('[data-testid="quick-checkin-complete"]')).toBeVisible();
    });
  });

  test('Daily Journey Mobile Experience', async () => {
    console.log('📱 Testing Daily Journey Mobile Experience');

    await test.step('Complete daily routine on mobile', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      
      await page.goto('/dashboard');
      
      // Verify mobile-friendly layout
      await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
      
      // Test swipe navigation for mood check-in
      const moodSlider = page.locator('[data-testid="mood-slider"]');
      if (await moodSlider.isVisible()) {
        // Simulate touch interaction
        await moodSlider.click();
        await page.mouse.move(200, 300);
        await page.mouse.down();
        await page.mouse.move(250, 300);
        await page.mouse.up();
      }
      
      // Test mobile breathing exercise
      await page.goto('/self-help/breathing');
      await page.locator('[data-testid="mobile-breathing-start"]').click();
      
      // Verify mobile breathing interface
      await expect(page.locator('[data-testid="mobile-breathing-circle"]')).toBeVisible();
    });
  });

  test('Daily Journey Offline Capability', async () => {
    console.log('🌐 Testing Daily Journey Offline Capability');

    await test.step('Test offline mood tracking', async () => {
      await page.goto('/dashboard');
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to complete mood check-in offline
      await page.locator('[data-testid="mood-tracker"]').click();
      await page.locator('[data-testid="mood-rating-6"]').click();
      
      // Verify offline mode indicator
      await expect(page.locator('[data-testid="offline-mode"]')).toBeVisible();
      
      // Save offline data
      await page.locator('[data-testid="save-offline"]').click();
      
      // Verify data queued for sync
      await expect(page.locator('[data-testid="data-queued"]')).toBeVisible();
      
      // Go back online
      await page.context().setOffline(false);
      
      // Verify data syncs
      await page.waitForSelector('[data-testid="data-synced"]', { timeout: 10000 });
    });
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });
});