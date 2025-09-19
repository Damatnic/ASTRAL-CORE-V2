/**
 * Comprehensive E2E User Journey Tests
 * Tests complete user workflows from start to finish
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
test.describe.configure({ mode: 'parallel' });

// Helper functions
async function loginUser(page: Page, role: 'patient' | 'provider' | 'volunteer' = 'patient') {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', `test.${role}@example.com`);
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
}

async function checkAccessibility(page: Page) {
  // Basic accessibility checks
  const violations = await page.evaluate(() => {
    // This would use axe-core in real implementation
    const issues = [];
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });
    
    // Check for button labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (!btn.textContent && !btn.getAttribute('aria-label')) {
        issues.push('Button missing accessible label');
      }
    });
    
    return issues;
  });
  
  expect(violations).toHaveLength(0);
}

test.describe('Crisis User Journey - Life Saving Workflow', () => {
  test('user in immediate crisis gets help within seconds', async ({ page, context }) => {
    // Start timing
    const startTime = Date.now();
    
    // User arrives at site in crisis
    await page.goto('/');
    
    // Crisis help should be immediately visible
    const crisisButton = page.locator('button:has-text("Crisis Help"), a:has-text("Crisis Help")').first();
    await expect(crisisButton).toBeVisible();
    await crisisButton.click();
    
    // Should redirect to crisis page immediately
    await expect(page).toHaveURL(/crisis/);
    
    // 988 number should be prominently displayed
    await expect(page.locator('text=988')).toBeVisible();
    
    // Multiple crisis options should be available
    await expect(page.locator('button:has-text("Call Now")')).toBeVisible();
    await expect(page.locator('button:has-text("Chat Now")')).toBeVisible();
    await expect(page.locator('button:has-text("Text Crisis")')).toBeVisible();
    
    // Verify response time
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(3000); // Must load in under 3 seconds
    
    // Start anonymous crisis chat
    await page.click('button:has-text("Start Crisis Chat")');
    await expect(page).toHaveURL(/crisis\/chat/);
    
    // Chat should work without authentication
    const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
    await expect(chatInput).toBeVisible();
    
    // Send crisis message
    await chatInput.fill('I want to end my life');
    await page.keyboard.press('Enter');
    
    // Immediate response required
    await expect(page.locator('text=/crisis resources|immediate help|988/i')).toBeVisible({ timeout: 2000 });
    
    // Emergency resources should be displayed
    await expect(page.locator('text=988 Suicide & Crisis Lifeline')).toBeVisible();
    await expect(page.locator('text=Crisis Text Line')).toBeVisible();
    
    // Safety plan prompt should appear
    await expect(page.locator('text=/safety plan/i')).toBeVisible();
  });

  test('crisis de-escalation through guided exercises', async ({ page }) => {
    await page.goto('/crisis');
    
    // Select immediate coping strategy
    await page.click('button:has-text("I need to calm down now")');
    
    // Should show breathing exercise
    await expect(page.locator('text=/breathing exercise/i')).toBeVisible();
    
    // Start exercise
    await page.click('button:has-text("Start Exercise")');
    
    // Breathing animation should play
    await expect(page.locator('[data-testid="breathing-animation"]')).toBeVisible();
    
    // Wait for one cycle (typically 4-7-8 breathing)
    await page.waitForTimeout(19000); // 4+7+8 seconds
    
    // Should show completion and ask about feeling
    await expect(page.locator('text=/How are you feeling now/i')).toBeVisible();
    
    // Select improved mood
    await page.click('button:has-text("A bit better")');
    
    // Should offer additional resources
    await expect(page.locator('text=/Would you like to/i')).toBeVisible();
    await expect(page.locator('button:has-text("Create Safety Plan")')).toBeVisible();
    await expect(page.locator('button:has-text("Talk to Someone")')).toBeVisible();
  });

  test('creating and accessing safety plan', async ({ page }) => {
    await page.goto('/crisis/safety-plan');
    
    // Should work without login
    expect(page.url()).toContain('safety-plan');
    
    // Fill out safety plan sections
    // Warning signs
    await page.fill('input[placeholder*="warning sign"]', 'Feeling isolated');
    await page.keyboard.press('Enter');
    await page.fill('input[placeholder*="warning sign"]', 'Negative thoughts increasing');
    await page.keyboard.press('Enter');
    
    // Coping strategies
    await page.fill('input[placeholder*="coping"]', 'Take a walk');
    await page.keyboard.press('Enter');
    await page.fill('input[placeholder*="coping"]', 'Call my friend Sarah');
    await page.keyboard.press('Enter');
    
    // Support contacts
    await page.fill('input[name="contact-name"]', 'Mom');
    await page.fill('input[name="contact-phone"]', '555-1234');
    await page.click('button:has-text("Add Contact")');
    
    // Professional contacts
    await page.fill('input[name="professional-name"]', 'Dr. Smith');
    await page.fill('input[name="professional-phone"]', '555-5678');
    await page.click('button:has-text("Add Professional")');
    
    // Reasons to live
    await page.fill('textarea[placeholder*="reasons"]', 'My family, My dog Max, My future goals');
    
    // Save plan
    await page.click('button:has-text("Save Safety Plan")');
    
    // Should generate access code for anonymous users
    await expect(page.locator('text=/Access Code:|Recovery Code:/i')).toBeVisible();
    const accessCode = await page.locator('[data-testid="access-code"]').textContent();
    expect(accessCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    
    // Test quick access
    await page.goto('/');
    await page.click('button:has-text("Access Safety Plan")');
    await page.fill('input[placeholder*="code"]', accessCode!);
    await page.click('button:has-text("View Plan")');
    
    // Verify plan contents
    await expect(page.locator('text=Feeling isolated')).toBeVisible();
    await expect(page.locator('text=Take a walk')).toBeVisible();
    await expect(page.locator('text=Mom')).toBeVisible();
  });
});

test.describe('Regular User Daily Wellness Journey', () => {
  test('complete daily mental health check-in', async ({ page }) => {
    await loginUser(page, 'patient');
    
    // Dashboard should show daily check-in prompt
    await expect(page.locator('text=/Daily Check-in/i')).toBeVisible();
    await page.click('button:has-text("Start Check-in")');
    
    // Mood tracking
    await expect(page).toHaveURL(/mood/);
    await page.click('button[aria-label="Mood: 7"]');
    
    // Additional factors
    await expect(page.locator('text=/Energy Level/i')).toBeVisible();
    await page.click('button[aria-label="Energy: 6"]');
    
    await expect(page.locator('text=/Anxiety/i')).toBeVisible();
    await page.click('button[aria-label="Anxiety: 4"]');
    
    await expect(page.locator('text=/Sleep Quality/i')).toBeVisible();
    await page.click('button[aria-label="Sleep: 8 hours"]');
    
    // Activities
    await page.click('input[value="exercise"]');
    await page.click('input[value="socializing"]');
    await page.click('input[value="work"]');
    
    // Notes
    await page.fill('textarea[name="notes"]', 'Good day overall, went for a run this morning');
    
    // Save entry
    await page.click('button:has-text("Save Entry")');
    
    // Should show insights
    await expect(page.locator('text=/Mood saved/i')).toBeVisible();
    await expect(page.locator('text=/Your mood is trending/i')).toBeVisible();
    
    // Navigate to wellness tools
    await page.click('a:has-text("Wellness Tools")');
    
    // Try a breathing exercise
    await page.click('[data-testid="breathing-exercise-card"]');
    await page.click('button:has-text("4-7-8 Breathing")');
    await page.click('button:has-text("Start")');
    
    // Complete one cycle
    await page.waitForTimeout(19000);
    
    // Rate the exercise
    await expect(page.locator('text=/How helpful was this/i')).toBeVisible();
    await page.click('button[aria-label="Very helpful"]');
    
    // View progress
    await page.click('a:has-text("My Progress")');
    await expect(page.locator('text=/Mood Trends/i')).toBeVisible();
    await expect(page.locator('[data-testid="mood-chart"]')).toBeVisible();
    await expect(page.locator('text=/7-day average/i')).toBeVisible();
  });

  test('engage with AI therapy for anxiety management', async ({ page }) => {
    await loginUser(page, 'patient');
    
    // Navigate to AI therapy
    await page.click('a:has-text("AI Therapy")');
    
    // Select therapy type
    await page.click('button:has-text("Cognitive Behavioral Therapy")');
    await page.click('button:has-text("Start Session")');
    
    // Pre-session check
    await expect(page.locator('text=/How are you feeling/i')).toBeVisible();
    await page.click('button[aria-label="Mood: 5"]');
    
    // Set session goals
    await page.click('button:has-text("Set Goals")');
    await page.click('input[value="manage_anxiety"]');
    await page.click('input[value="challenge_thoughts"]');
    await page.click('button:has-text("Continue")');
    
    // Start conversation
    const chatInput = page.locator('textarea[placeholder*="Share your thoughts"]');
    await chatInput.fill('I have been feeling anxious about an upcoming presentation at work');
    await page.keyboard.press('Enter');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 10000 });
    
    // Continue conversation
    await chatInput.fill('I keep thinking I will embarrass myself and everyone will judge me');
    await page.keyboard.press('Enter');
    
    // AI should provide CBT technique
    await expect(page.locator('text=/cognitive distortion|thought challenging|evidence/i')).toBeVisible({ timeout: 10000 });
    
    // Complete thought record
    await page.click('button:has-text("Try Thought Record")');
    
    // Fill out thought record
    await page.fill('input[name="situation"]', 'Upcoming work presentation');
    await page.fill('input[name="thought"]', 'I will embarrass myself');
    await page.fill('input[name="emotion"]', 'Anxiety');
    await page.fill('input[name="intensity"]', '8');
    
    // Evidence for
    await page.fill('textarea[name="evidence-for"]', 'I stumbled during practice');
    
    // Evidence against
    await page.fill('textarea[name="evidence-against"]', 'I have given successful presentations before\nMy colleagues are supportive\nI know the material well');
    
    // Balanced thought
    await page.fill('textarea[name="balanced-thought"]', 'While I may feel nervous, I have prepared well and have succeeded before');
    
    // New intensity
    await page.fill('input[name="new-intensity"]', '5');
    
    // Save thought record
    await page.click('button:has-text("Save Record")');
    
    // Return to chat
    await page.click('button:has-text("Continue Session")');
    
    // End session
    await page.click('button:has-text("End Session")');
    
    // Post-session check
    await expect(page.locator('text=/How are you feeling now/i')).toBeVisible();
    await page.click('button[aria-label="Mood: 7"]');
    
    // Session summary
    await expect(page.locator('text=/Session Summary/i')).toBeVisible();
    await expect(page.locator('text=/Mood Improvement: +2/i')).toBeVisible();
    await expect(page.locator('text=/Techniques Used/i')).toBeVisible();
    await expect(page.locator('text=/Thought Challenging/i')).toBeVisible();
    
    // Save session notes
    await page.fill('textarea[name="session-notes"]', 'Helpful session, learned to challenge anxious thoughts');
    await page.click('button:has-text("Save & Close")');
  });
});

test.describe('Provider Managing Patients Journey', () => {
  test('provider reviews alerts and responds to crisis', async ({ page, context }) => {
    // Open provider dashboard
    await loginUser(page, 'provider');
    
    // Check alerts
    await expect(page.locator('[data-testid="alert-badge"]')).toBeVisible();
    const alertCount = await page.locator('[data-testid="alert-badge"]').textContent();
    expect(parseInt(alertCount || '0')).toBeGreaterThan(0);
    
    // View critical alerts
    await page.click('button:has-text("View Alerts")');
    
    // Find urgent alert
    const urgentAlert = page.locator('[data-priority="urgent"]').first();
    await expect(urgentAlert).toBeVisible();
    
    // Open alert details
    await urgentAlert.click();
    
    // Alert modal should show patient info
    await expect(page.locator('text=/Patient:/i')).toBeVisible();
    await expect(page.locator('text=/Risk Level:/i')).toBeVisible();
    await expect(page.locator('text=/Immediate Action Required/i')).toBeVisible();
    
    // Contact patient
    await page.click('button:has-text("Contact Patient")');
    
    // Communication options
    await expect(page.locator('button:has-text("Send Secure Message")')).toBeVisible();
    await expect(page.locator('button:has-text("Schedule Emergency Session")')).toBeVisible();
    await expect(page.locator('button:has-text("Call Now")')).toBeVisible();
    
    // Send secure message
    await page.click('button:has-text("Send Secure Message")');
    await page.fill('textarea[name="message"]', 'I received an alert about your wellbeing. I am here to help. Can we schedule a session today?');
    await page.click('button:has-text("Send")');
    
    // Acknowledge alert
    await page.click('button:has-text("Acknowledge Alert")');
    await page.selectOption('select[name="action"]', 'contacted_patient');
    await page.fill('textarea[name="notes"]', 'Sent secure message, awaiting response');
    await page.click('button:has-text("Submit")');
    
    // Return to patient list
    await page.click('a:has-text("Patients")');
    
    // Filter by risk
    await page.selectOption('select[name="filter-risk"]', 'high');
    
    // View patient details
    const patientCard = page.locator('[data-testid="patient-card"]').first();
    await patientCard.click();
    
    // Patient dashboard should show
    await expect(page.locator('text=/Recent Mood Entries/i')).toBeVisible();
    await expect(page.locator('text=/Therapy Sessions/i')).toBeVisible();
    await expect(page.locator('text=/Medications/i')).toBeVisible();
    await expect(page.locator('text=/Risk Indicators/i')).toBeVisible();
    
    // Review mood chart
    await expect(page.locator('[data-testid="patient-mood-chart"]')).toBeVisible();
    
    // Check therapy notes
    await page.click('tab:has-text("Session Notes")');
    await expect(page.locator('[data-testid="session-notes-list"]')).toBeVisible();
    
    // Add clinical note
    await page.click('button:has-text("Add Clinical Note")');
    await page.fill('textarea[name="clinical-note"]', 'Patient showing signs of increased anxiety. Adjusted treatment plan to include daily CBT exercises.');
    await page.click('button:has-text("Save Note")');
    
    // Update treatment plan
    await page.click('tab:has-text("Treatment Plan")');
    await page.click('button:has-text("Edit Plan")');
    await page.click('input[value="increase_session_frequency"]');
    await page.click('input[value="add_medication_review"]');
    await page.fill('textarea[name="plan-notes"]', 'Increased session frequency to twice weekly due to elevated risk');
    await page.click('button:has-text("Save Plan")');
  });

  test('provider conducts teletherapy session', async ({ page }) => {
    await loginUser(page, 'provider');
    
    // Go to sessions
    await page.click('a:has-text("Sessions")');
    
    // Find upcoming session
    const upcomingSession = page.locator('[data-testid="session-card"]:has-text("Today")').first();
    await upcomingSession.click();
    
    // Pre-session checklist
    await expect(page.locator('text=/Pre-Session Checklist/i')).toBeVisible();
    await page.click('input[name="reviewed-notes"]');
    await page.click('input[name="prepared-materials"]');
    await page.click('input[name="checked-risk"]');
    
    // Start session
    await page.click('button:has-text("Start Session")');
    
    // Session interface
    await expect(page.locator('[data-testid="session-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-notes"]')).toBeVisible();
    
    // Take session notes
    await page.fill('[data-testid="session-notes"]', 'Patient discussed work stress. Applied CBT techniques for cognitive restructuring.');
    
    // Use session tools
    await page.click('button:has-text("Tools")');
    await page.click('button:has-text("Thought Record")');
    
    // Collaborate on thought record
    await page.fill('input[name="collaborative-thought"]', 'My boss hates me');
    await page.fill('textarea[name="collaborative-evidence-against"]', 'Boss gave positive feedback last week');
    await page.click('button:has-text("Save to Patient Record")');
    
    // End session
    await page.click('button:has-text("End Session")');
    
    // Post-session tasks
    await expect(page.locator('text=/Post-Session Tasks/i')).toBeVisible();
    
    // Rate session
    await page.click('button[aria-label="Session Quality: Good"]');
    
    // Set homework
    await page.fill('textarea[name="homework"]', 'Practice thought challenging daily, Complete mood log');
    
    // Schedule follow-up
    await page.click('button:has-text("Schedule Follow-up")');
    await page.click('[data-testid="calendar-next-week"]');
    await page.click('[data-time="14:00"]');
    await page.click('button:has-text("Confirm")');
    
    // Finalize session
    await page.click('button:has-text("Complete Session")');
    
    await expect(page.locator('text=/Session completed successfully/i')).toBeVisible();
  });
});

test.describe('Volunteer Supporting Users Journey', () => {
  test('volunteer provides peer support in group session', async ({ page }) => {
    await loginUser(page, 'volunteer');
    
    // Volunteer dashboard
    await expect(page.locator('text=/Volunteer Dashboard/i')).toBeVisible();
    await expect(page.locator('text=/Active Sessions/i')).toBeVisible();
    await expect(page.locator('text=/Training Modules/i')).toBeVisible();
    
    // Join support group
    await page.click('button:has-text("Join Support Group")');
    
    // Select group
    await page.click('[data-testid="group-anxiety-support"]');
    
    // Group session interface
    await expect(page.locator('text=/Anxiety Support Group/i')).toBeVisible();
    await expect(page.locator('[data-testid="participants-list"]')).toBeVisible();
    
    // Participate in discussion
    const chatInput = page.locator('textarea[placeholder*="Share your support"]');
    await chatInput.fill('Welcome everyone! I am here as a peer supporter who has also dealt with anxiety.');
    await page.keyboard.press('Enter');
    
    // Respond to user
    await page.waitForSelector('text=/I am struggling/i', { timeout: 30000 });
    await chatInput.fill('I hear you and your feelings are valid. What has helped me is breaking tasks into smaller steps.');
    await page.keyboard.press('Enter');
    
    // Share resource
    await page.click('button:has-text("Share Resource")');
    await page.click('[data-resource="breathing-exercises"]');
    await page.click('button:has-text("Share with Group")');
    
    // Monitor for crisis
    // If crisis message appears
    const crisisMessage = page.locator('text=/suicide|harm|kill/i');
    if (await crisisMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Escalate to professional
      await page.click('button:has-text("Alert Moderator")');
      await page.selectOption('select[name="reason"]', 'crisis_risk');
      await page.fill('textarea[name="details"]', 'User expressing suicidal ideation');
      await page.click('button:has-text("Send Alert")');
      
      // Provide immediate resources
      await chatInput.fill('If you are in crisis, please reach out to 988 Suicide & Crisis Lifeline. You are not alone.');
      await page.keyboard.press('Enter');
    }
    
    // End participation
    await page.click('button:has-text("Leave Session")');
    
    // Log session
    await page.fill('textarea[name="session-reflection"]', 'Provided peer support to 3 members. One potential crisis escalated appropriately.');
    await page.click('button:has-text("Submit Log")');
  });

  test('volunteer completes crisis intervention training', async ({ page }) => {
    await loginUser(page, 'volunteer');
    
    // Access training
    await page.click('a:has-text("Training")');
    
    // Select crisis intervention module
    await page.click('[data-module="crisis-intervention"]');
    
    // Complete training sections
    await expect(page.locator('text=/Recognizing Crisis Signs/i')).toBeVisible();
    await page.click('button:has-text("Start Module")');
    
    // Watch video
    await page.waitForSelector('[data-testid="training-video"]');
    // Simulate video completion
    await page.waitForTimeout(3000);
    await page.click('button:has-text("Continue")');
    
    // Take quiz
    await expect(page.locator('text=/Knowledge Check/i')).toBeVisible();
    
    // Question 1
    await page.click('input[value="immediate_help"]');
    await page.click('button:has-text("Next")');
    
    // Question 2
    await page.click('input[value="988"]');
    await page.click('button:has-text("Next")');
    
    // Question 3
    await page.click('input[value="active_listening"]');
    await page.click('button:has-text("Submit Quiz")');
    
    // Results
    await expect(page.locator('text=/Quiz Passed/i')).toBeVisible();
    await expect(page.locator('text=/Certificate/i')).toBeVisible();
    
    // Download certificate
    await page.click('button:has-text("Download Certificate")');
  });
});

test.describe('Comprehensive Platform Integration Journey', () => {
  test('multi-user crisis response scenario', async ({ browser }) => {
    // Create multiple browser contexts for different users
    const patientContext = await browser.newContext();
    const providerContext = await browser.newContext();
    const volunteerContext = await browser.newContext();
    
    const patientPage = await patientContext.newPage();
    const providerPage = await providerContext.newPage();
    const volunteerPage = await volunteerContext.newPage();
    
    // Patient in crisis
    await patientPage.goto('/crisis/chat');
    const patientChat = patientPage.locator('textarea[placeholder*="message"]');
    await patientChat.fill('I cannot handle this anymore. I want to die.');
    await patientPage.keyboard.press('Enter');
    
    // System should detect crisis
    await expect(patientPage.locator('text=/Crisis Resources/i')).toBeVisible({ timeout: 2000 });
    
    // Provider receives alert
    await loginUser(providerPage, 'provider');
    await expect(providerPage.locator('[data-testid="crisis-alert-popup"]')).toBeVisible({ timeout: 5000 });
    await providerPage.click('button:has-text("Respond to Crisis")');
    
    // Volunteer sees crisis indicator in group
    await loginUser(volunteerPage, 'volunteer');
    await volunteerPage.click('button:has-text("Join Support Group")');
    await expect(volunteerPage.locator('[data-testid="crisis-in-progress"]')).toBeVisible({ timeout: 5000 });
    
    // Provider intervenes
    await providerPage.fill('textarea[name="crisis-message"]', 'This is Dr. Smith. I am here to help you. You are not alone.');
    await providerPage.click('button:has-text("Send")');
    
    // Patient receives support
    await expect(patientPage.locator('text=/Dr. Smith/i')).toBeVisible({ timeout: 3000 });
    
    // Cleanup
    await patientContext.close();
    await providerContext.close();
    await volunteerContext.close();
  });

  test('platform performance under load', async ({ page, context }) => {
    // Simulate multiple operations
    const operations = [
      () => page.goto('/mood'),
      () => page.goto('/ai-therapy'),
      () => page.goto('/wellness'),
      () => page.goto('/resources'),
      () => page.goto('/crisis')
    ];
    
    // Measure load times
    const loadTimes = [];
    
    for (const operation of operations) {
      const startTime = Date.now();
      await operation();
      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);
      
      // Each page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }
    
    // Average load time should be under 2 seconds
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    expect(avgLoadTime).toBeLessThan(2000);
    
    // Test concurrent operations
    await loginUser(page, 'patient');
    
    // Start multiple operations simultaneously
    const concurrentOps = Promise.all([
      page.evaluate(() => fetch('/api/mood', { method: 'GET' })),
      page.evaluate(() => fetch('/api/ai-therapy/sessions', { method: 'GET' })),
      page.evaluate(() => fetch('/api/self-help/dbt/progress', { method: 'GET' }))
    ]);
    
    const concurrentStart = Date.now();
    await concurrentOps;
    const concurrentTime = Date.now() - concurrentStart;
    
    // Concurrent operations should complete efficiently
    expect(concurrentTime).toBeLessThan(1000);
  });
});

test.describe('Accessibility Compliance Journey', () => {
  test('platform is fully keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through main navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
    
    // Navigate to crisis help using keyboard
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const text = await page.evaluate(() => document.activeElement?.textContent);
      if (text?.includes('Crisis')) {
        await page.keyboard.press('Enter');
        break;
      }
    }
    
    await expect(page).toHaveURL(/crisis/);
    
    // Navigate form using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Test message');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify form submission worked
    await expect(page.locator('text=Test message')).toBeVisible({ timeout: 5000 });
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    
    // Check ARIA landmarks
    const landmarks = await page.evaluate(() => {
      const elements = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"]');
      return elements.length;
    });
    expect(landmarks).toBeGreaterThan(0);
    
    // Check heading hierarchy
    const headings = await page.evaluate(() => {
      const h1Count = document.querySelectorAll('h1').length;
      const h2Count = document.querySelectorAll('h2').length;
      return { h1Count, h2Count };
    });
    
    expect(headings.h1Count).toBe(1); // Only one h1 per page
    expect(headings.h2Count).toBeGreaterThan(0);
    
    // Check form labels
    await page.goto('/mood');
    const formInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      let labeledCount = 0;
      inputs.forEach(input => {
        const id = input.id;
        const label = document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        if (label || ariaLabel) labeledCount++;
      });
      return { total: inputs.length, labeled: labeledCount };
    });
    
    expect(formInputs.labeled).toBe(formInputs.total);
    
    // Check alt text on images
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let withAlt = 0;
      imgs.forEach(img => {
        if (img.alt) withAlt++;
      });
      return { total: imgs.length, withAlt };
    });
    
    expect(images.withAlt).toBe(images.total);
  });

  test('color contrast compliance', async ({ page }) => {
    await page.goto('/');
    
    // This would normally use axe-core
    const contrastIssues = await page.evaluate(() => {
      // Simplified contrast check
      const elements = document.querySelectorAll('*');
      const issues = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Very basic check - real implementation would calculate actual contrast ratio
        if (color === backgroundColor && color !== 'rgba(0, 0, 0, 0)') {
          issues.push({
            element: el.tagName,
            issue: 'Same foreground and background color'
          });
        }
      });
      
      return issues;
    });
    
    expect(contrastIssues).toHaveLength(0);
  });
});