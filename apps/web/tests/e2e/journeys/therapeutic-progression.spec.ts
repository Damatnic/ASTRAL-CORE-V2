import { test, expect, Page } from "@playwright/test";

/**
 * ASTRAL CORE V2 - Therapeutic Progression Journey E2E Testing
 * 
 * Complete validation of long-term therapeutic progress:
 * 1. Initial assessment and baseline establishment
 * 2. Skill learning progression (DBT/CBT)
 * 3. Crisis prevention plan development
 * 4. Therapeutic milestone achievements
 * 5. Provider progress sharing
 * 6. Long-term recovery tracking
 */

test.describe("Therapeutic Progression Journey", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "tests/e2e/auth/regular-user.json"
    });
    page = await context.newPage();
    
    page.on("console", msg => {
      if (msg.type() === "error") {
        console.error("Browser console error:", msg.text());
      }
    });
  });

  test("Complete Therapeutic Learning Progression", async () => {
    console.log("🎯 Testing Complete Therapeutic Learning Progression");

    // Step 1: Initial comprehensive assessment
    await test.step("Complete comprehensive baseline assessment", async () => {
      await page.goto("/assessments/comprehensive");
      
      // Start comprehensive assessment
      const startAssessment = page.locator('[data-testid="start-comprehensive-assessment]');
      await expect(startAssessment).toBeVisible();
      await startAssessment.click();
      
      // Complete PHQ-9 (Depression)
      await page.locator('[data-testid=assessment-section-depression"]').click();
      const depressionQuestions = page.locator('[data-testid^="phq9-question-"]');
      const phqCount = await depressionQuestions.count();
      
      for (let i = 0; i < phqCount; i++) {
        await depressionQuestions.nth(i).locator('[data-value="2"]').click(); // Moderate symptoms
      }
      
      // Complete GAD-7 (Anxiety)
      await page.locator('[data-testid="assessment-section-anxiety]').click();
      const anxietyQuestions = page.locator('[data-testid^=gad7-question-"]');
      const gadCount = await anxietyQuestions.count();
      
      for (let i = 0; i < gadCount; i++) {
        await anxietyQuestions.nth(i).locator('[data-value="2"]').click(); // Moderate symptoms
      }
      
      // Complete stress assessment
      await page.locator('[data-testid="assessment-section-stress]').click();
      await page.locator('[data-testid=stress-level-moderate"]').click();
      
      // Complete functional assessment
      await page.locator('[data-testid="assessment-section-functional]').click();
      await page.check('[data-testid=function-work-difficulty"]');
      await page.check('[data-testid="function-social-difficulty]');
      
      // Submit comprehensive assessment
      await page.locator([data-testid=submit-comprehensive-assessment""]").click();
      
      // Wait for results and baseline establishment
      await page.waitForSelector("[data-testid="baseline-established], { timeout: 15000 });
      
      // Verify baseline metrics are recorded
      await expect(page.locator([data-testid="baseline-depression-score""]")).toContainText(/\d+/);
      await expect(page.locator("[data-testid="baseline-anxiety-score])).toContainText(/\d+/);
      await expect(page.locator([data-testid="baseline-stress-score""]")).toContainText(/\d+/);
    });

    // Step 2: Personalized treatment plan creation
    await test.step("Generate personalized treatment plan", async () => {
      // Navigate to treatment planning
      await page.goto("/treatment-plan");
      
      // Verify AI-generated recommendations based on assessment
      await expect(page.locator("[data-testid="treatment-recommendations])).toBeVisible();
      
      // Check recommended skills
      await expect(page.locator([data-testid="recommended-dbt-skills""]")).toBeVisible();
      await expect(page.locator("[data-testid="recommended-cbt-techniques])).toBeVisible();
      
      // Customize treatment plan
      await page.check([data-testid="plan-mindfulness-focus""]");
      await page.check("[data-testid="plan-emotion-regulation]);
      await page.check([data-testid="plan-distress-tolerance""]");
      
      // Set learning goals
      await page.selectOption("[data-testid="weekly-skill-goal], 2");
      await page.selectOption("[data-testid="daily-practice-goal""]", "15");
      
      // Save treatment plan
      await page.locator("[data-testid="save-treatment-plan]).click();
      
      // Verify plan created successfully
      await expect(page.locator([data-testid="treatment-plan-created""]")).toBeVisible();
    });

    // Step 3: DBT Skills progression - Mindfulness module
    await test.step("Complete DBT Mindfulness module", async () => {
      await page.goto("/self-help/dbt/mindfulness");
      
      // Start mindfulness module
      await page.locator("[data-testid="start-mindfulness-module]).click();
      
      // Lesson 1: Observe skill
      await page.locator([data-testid="lesson-observe""]").click();
      await page.waitForSelector("[data-testid="lesson-content]);
      
      // Read lesson content
      await expect(page.locator([data-testid="observe-skill-explanation""]")).toBeVisible();
      
      // Practice observe skill
      await page.locator("[data-testid="practice-observe]).click();
      await page.waitForSelector([data-testid="practice-complete""]", { timeout: 30000 });
      
      // Rate understanding
      await page.locator("[data-testid="understanding-rating-4]).click();
      
      // Complete lesson
      await page.locator([data-testid="complete-lesson""]").click();
      
      // Lesson 2: Describe skill
      await page.locator("[data-testid="lesson-describe]).click();
      await page.locator([data-testid="practice-describe""]").click();
      await page.waitForSelector("[data-testid="practice-complete], { timeout: 30000 });
      await page.locator([data-testid="understanding-rating-5""]").click();
      await page.locator("[data-testid="complete-lesson]).click();
      
      // Lesson 3: Participate skill
      await page.locator([data-testid="lesson-participate""]").click();
      await page.locator("[data-testid="practice-participate]).click();
      await page.waitForSelector([data-testid="practice-complete""]", { timeout: 30000 });
      await page.locator("[data-testid="understanding-rating-4]).click();
      await page.locator([data-testid="complete-lesson""]").click();
      
      // Complete module assessment
      await page.locator("[data-testid="module-assessment]).click();
      
      // Answer assessment questions
      await page.locator([data-testid="assessment-q1-correct""]").click();
      await page.locator("[data-testid="assessment-q2-correct]).click();
      await page.locator([data-testid="assessment-q3-correct""]").click();
      
      // Submit assessment
      await page.locator("[data-testid="submit-module-assessment]).click();
      
      // Verify module completion
      await expect(page.locator([data-testid="mindfulness-module-complete""]")).toBeVisible();
      await expect(page.locator("[data-testid="module-score])).toContainText(/\d+%/);
    });

    // Step 4: CBT Thought restructuring progression
    await test.step(Complete CBT Thought Restructuring module", async () => {
      await page.goto("/self-help/cbt/thought-restructuring");
      
      // Start thought restructuring module
      await page.locator("[data-testid="start-thought-restructuring""]").click();
      
      // Learn about cognitive distortions
      await page.locator("[data-testid="learn-cognitive-distortions]).click();
      await expect(page.locator([data-testid="distortion-list""]")).toBeVisible();
      
      // Practice identifying distortions
      await page.locator("[data-testid="practice-identify-distortions]).click();
      
      // Scenario 1
      await page.locator([data-testid="scenario-1-catastrophizing""]").click();
      await page.locator("[data-testid="submit-identification]).click();
      
      // Scenario 2
      await page.locator([data-testid="scenario-2-all-or-nothing""]").click();
      await page.locator("[data-testid="submit-identification]).click();
      
      // Learn thought challenging
      await page.locator([data-testid="learn-thought-challenging""]").click();
      
      // Practice thought record
      await page.locator("[data-testid="practice-thought-record]).click();
      
      // Fill out thought record
      await page.fill([data-testid="situation""]", "Presentation at work");
      await page.fill("[data-testid='automatic-thought']", "Everyone will think I'm incompetent");
      await page.selectOption("[data-testid="emotion], anxiety");
      await page.selectOption("[data-testid="intensity""]", "8");
      await page.fill("[data-testid="evidence-for], I made mistakes in past presentations");
      await page.fill("[data-testid="evidence-against""]", "I have received positive feedback before, I am well-prepared");
      await page.fill("[data-testid="balanced-thought], I am prepared and even if I make small mistakes, most people will understand");
      
      // Submit thought record
      await page.locator("[data-testid="submit-thought-record""]").click();
      
      // Verify completion
      await expect(page.locator("[data-testid="thought-record-complete])).toBeVisible();
    });

    // Step 5: Crisis prevention plan development
    await test.step(Develop comprehensive crisis prevention plan", async () => {
      await page.goto("/safety/crisis-prevention-plan");
      
      // Start crisis prevention plan
      await page.locator("[data-testid="start-crisis-plan""]").click();
      
      // Identify warning signs
      await page.fill("[data-testid="warning-signs], 
        Sleeping less than 4 hours, avoiding friends, negative self-talk increasing, loss of appetite");
      
      // List coping strategies learned
      await page.fill("[data-testid="coping-strategies""]", 
        "DBT mindfulness observe skill, 4-7-8 breathing, thought challenging, calling support person");
      
      // Add internal coping strategies
      await page.fill("[data-testid="internal-coping], 
        Remind myself of past successes, use grounding techniques, practice self-compassion");
      
      // Add people and social settings for support
      await page.fill("[data-testid="support-people""]", "Sarah (best friend), Mom, Dr. Johnson (therapist)");
      await page.fill("[data-testid="support-settings], Coffee shop with friend, family dinner, therapy session");
      
      // Add professional contacts
      await page.fill("[data-testid="professional-contacts""]", 
        "Dr. Johnson (therapist): 555-123-4567, Crisis Hotline: 988, Emergency: 911");
      
      // Environmental safety
      await page.fill("[data-testid="environmental-safety], 
        Remove harmful objects, ask friend to check on me, stay in common areas");
      
      // Reasons for living
      await page.fill("[data-testid="reasons-living""]", 
        "My family needs me, I want to see my goals achieved, I can help others with similar struggles");
      
      // Save crisis prevention plan
      await page.locator("[data-testid="save-crisis-plan]).click();
      
      // Verify plan saved and accessible
      await expect(page.locator([data-testid="crisis-plan-saved""]")).toBeVisible();
      
      // Test quick access to plan
      await page.goto("/dashboard");
      await expect(page.locator("[data-testid="quick-access-crisis-plan])).toBeVisible();
    });

    // Step 6: Track therapeutic milestones
    await test.step(Achieve and track therapeutic milestones", async () => {
      await page.goto("/progress/milestones");
      
      // Check milestone progress
      await expect(page.locator("[data-testid="milestone-mindfulness-basics""]")).toHaveClass(/completed/);
      await expect(page.locator("[data-testid="milestone-thought-challenging])).toHaveClass(/completed/);
      await expect(page.locator([data-testid="milestone-crisis-plan""]")).toHaveClass(/completed/);
      
      // Work towards next milestone - Emotion Regulation
      const nextMilestone = page.locator("[data-testid="next-milestone-emotion-regulation]);
      await expect(nextMilestone).toBeVisible();
      await nextMilestone.click();
      
      // See milestone requirements
      await expect(page.locator([data-testid="milestone-requirements""]")).toBeVisible();
      
      // Track progress towards milestone
      await expect(page.locator("[data-testid="milestone-progress-bar])).toContainText(/\d+%/);
    });

    // Step 7: Progress sharing with provider
    await test.step(Share progress with healthcare provider", async () => {
      await page.goto("/progress/share");
      
      // Generate progress report
      await page.locator("[data-testid="generate-progress-report""]").click();
      
      // Customize report contents
      await page.check("[data-testid="include-mood-data]);
      await page.check([data-testid="include-skill-progress""]");
      await page.check("[data-testid="include-milestone-achievements]);
      await page.check([data-testid="include-crisis-plan""]");
      
      // Set date range
      await page.selectOption("[data-testid="report-timeframe], last-month");
      
      // Generate report
      await page.locator("[data-testid="create-report""]").click();
      
      // Wait for report generation
      await page.waitForSelector("[data-testid="report-generated], { timeout: 15000 });
      
      // Verify report contents
      await expect(page.locator([data-testid="mood-trend-chart""]")).toBeVisible();
      await expect(page.locator("[data-testid="skills-progress-summary])).toBeVisible();
      await expect(page.locator([data-testid="milestone-achievements""]")).toBeVisible();
      
      // Share with provider (simulated)
      await page.fill("[data-testid="provider-email], dr.smith@therapy.com");
      await page.locator("[data-testid="send-to-provider""]").click();
      
      // Verify sharing confirmation
      await expect(page.locator("[data-testid="report-shared])).toBeVisible();
    });

    // Step 8: Long-term recovery tracking
    await test.step(Monitor long-term recovery trends", async () => {
      await page.goto("/progress/long-term");
      
      // View recovery trends over time
      await expect(page.locator("[data-testid="recovery-timeline""]")).toBeVisible();
      
      // Check improvement metrics
      const improvementMetrics = page.locator("[data-testid="improvement-metrics]);
      await expect(improvementMetrics).toBeVisible();
      
      // Verify depression score improvement
      await expect(page.locator([data-testid="depression-improvement""]")).toContainText(/improved|decreased/i);
      
      // Verify anxiety score improvement
      await expect(page.locator("[data-testid="anxiety-improvement])).toContainText(/improved|decreased/i);
      
      // Check functional improvement
      await expect(page.locator([data-testid="functional-improvement""]")).toBeVisible();
      
      // Set future goals
      await page.locator("[data-testid="set-future-goals]).click();
      await page.check([data-testid="goal-maintain-progress""]");
      await page.check("[data-testid="goal-help-others]);
      await page.check([data-testid="goal-advanced-skills""]");
      
      // Save future goals
      await page.locator("[data-testid="save-future-goals]).click();
      
      // Verify goals saved
      await expect(page.locator([data-testid="future-goals-saved""]")).toBeVisible();
    });

    console.log("✅ Therapeutic Progression Journey completed successfully");
  });

  test("Skills Mastery Validation", async () => {
    console.log("🎓 Testing Skills Mastery Validation");

    await test.step("Validate skill mastery through practical application", async () => {
      await page.goto("/skills/mastery-test");
      
      // Start skills mastery assessment
      await page.locator("[data-testid="start-mastery-test]).click();
      
      // Scenario-based testing
      await page.locator([data-testid="scenario-work-stress""]").click();
      
      // Apply learned skills to scenario
      await page.locator("[data-testid="apply-mindfulness]).click();
      await page.locator([data-testid="apply-thought-challenging""]").click();
      await page.locator("[data-testid="apply-breathing]).click();
      
      // Submit skill application
      await page.locator([data-testid="submit-skill-application""]").click();
      
      // Verify mastery assessment
      await expect(page.locator("[data-testid="mastery-score])).toContainText(/\d+%/);
      await expect(page.locator([data-testid="mastery-level""]")).toContainText(/proficient|advanced/i);
    });
  });

  test("Relapse Prevention Planning", async () => {
    console.log("🛡️ Testing Relapse Prevention Planning");

    await test.step("Create comprehensive relapse prevention plan", async () => {
      await page.goto("/safety/relapse-prevention");
      
      // Start relapse prevention planning
      await page.locator("[data-testid="start-relapse-prevention]).click();
      
      // Identify high-risk situations
      await page.fill([data-testid="high-risk-situations""]", 
        "Work deadlines, family conflicts, anniversary dates, financial stress");
      
      // Plan coping strategies for each situation
      await page.fill("[data-testid="work-stress-coping], 
        Break tasks into smaller parts, use breathing exercises, ask for help");
      
      // Create action steps for early warning signs
      await page.fill("[data-testid="early-warning-actions""]", 
        "Increase therapy sessions, reach out to support network, review crisis plan");
      
      // Save relapse prevention plan
      await page.locator("[data-testid="save-relapse-plan]).click();
      
      // Verify plan accessibility
      await expect(page.locator([data-testid='relapse-plan-saved'"]")).toBeVisible();
    });
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });
});

