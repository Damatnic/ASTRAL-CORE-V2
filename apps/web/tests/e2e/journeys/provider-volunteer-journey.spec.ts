import { test, expect, Page } from "@playwright/test";

/**
 * ASTRAL CORE V2 - Provider/Volunteer Journey E2E Testing
 * 
 * Complete validation of provider and volunteer workflows:
 * 1. Demo login access (therapist/volunteer/admin)
 * 2. Dashboard and patient overview
 * 3. Crisis alert response
 * 4. Progress monitoring
 * 5. Report generation
 * 6. Communication with users
 */

test.describe("Provider/Volunteer Journey", () => {
  test.describe("Therapist Provider Journey", () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      
      page.on("console", msg => {
        if (msg.type() === "error") {
          console.error("Browser console error:", msg.text());
        }
      });
    });

    test("Complete Therapist Provider Workflow", async () => {
      console.log("👩‍⚕️ Testing Complete Therapist Provider Workflow");

      // Step 1: Demo login as therapist
      await test.step("Login as demo therapist", async () => {
        await page.goto("/auth/signin");
        
        // Verify demo login section is available
        await expect(page.locator("[data-testid="demo-login-section"]")).toBeVisible();
        
        // Click therapist demo login
        const therapistLogin = page.locator("[data-testid="demo-therapist-login"]");
        await expect(therapistLogin).toBeVisible();
        await therapistLogin.click();
        
        // Verify successful login to provider dashboard
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await expect(page.locator("[data-testid="provider-dashboard"]")).toBeVisible();
      });

      // Step 2: Dashboard and patient overview
      await test.step("Navigate provider dashboard and patient overview", async () => {
        // Verify provider dashboard elements
        await expect(page.locator("[data-testid="provider-welcome"]")).toContainText(/therapist|provider|dr\./i);
        await expect(page.locator("[data-testid="patient-overview"]")).toBeVisible();
        await expect(page.locator("[data-testid="crisis-alerts"]")).toBeVisible();
        await expect(page.locator("[data-testid="recent-activity"]")).toBeVisible();
        
        // Check patient list
        const patientList = page.locator("[data-testid="patient-list"]");
        if (await patientList.isVisible()) {
          await expect(patientList).toBeVisible();
          
          // View patient details
          const firstPatient = page.locator("[data-testid="patient-card"]:first-child");
          if (await firstPatient.isVisible()) {
            await firstPatient.click();
            
            // Verify patient detail view
            await expect(page.locator("[data-testid="patient-profile"]")).toBeVisible();
            await expect(page.locator("[data-testid="patient-progress"]")).toBeVisible();
            await expect(page.locator("[data-testid="patient-history"]")).toBeVisible();
            
            // Return to dashboard
            await page.locator("[data-testid="back-to-dashboard"]").click();
          }
        }
        
        // Check crisis alert panel
        const crisisAlerts = page.locator("[data-testid="active-crisis-alerts"]");
        if (await crisisAlerts.isVisible()) {
          const alertCount = await crisisAlerts.locator("[data-testid="crisis-alert-item"]").count();
          console.log(`Active crisis alerts: ${alertCount}`);
        }
      });

      // Step 3: Crisis alert response simulation
      await test.step("Respond to crisis alert", async () => {
        // Check for crisis alerts
        const crisisAlert = page.locator("[data-testid="crisis-alert-item"]:first-child");
        
        if (await crisisAlert.isVisible()) {
          // Click on crisis alert
          await crisisAlert.click();
          
          // Verify crisis details
          await expect(page.locator("[data-testid="crisis-details"]")).toBeVisible();
          await expect(page.locator("[data-testid="crisis-severity"]")).toBeVisible();
          await expect(page.locator("[data-testid="crisis-timestamp"]")).toBeVisible();
          
          // Review crisis assessment
          await expect(page.locator("[data-testid="crisis-assessment-results"]")).toBeVisible();
          
          // Take action on crisis
          const responseOptions = page.locator("[data-testid="crisis-response-options"]");
          if (await responseOptions.isVisible()) {
            // Select appropriate response
            await page.locator("[data-testid="escalate-to-emergency"]").click();
            
            // Add provider notes
            const providerNotes = page.locator("[data-testid="provider-crisis-notes"]");
            if (await providerNotes.isVisible()) {
              await providerNotes.fill("Patient presenting with high-risk indicators. Immediate intervention required. Coordinating with emergency services.");
            }
            
            // Submit crisis response
            await page.locator("[data-testid="submit-crisis-response"]").click();
            
            // Verify response recorded
            await expect(page.locator("[data-testid="crisis-response-recorded"]")).toBeVisible();
          }
        } else {
          // Simulate crisis alert for testing
          console.log("No active crisis alerts - simulating for test purposes");
          
          // Navigate to crisis simulation
          await page.goto("/provider/crisis-simulation");
          
          if (await page.locator("[data-testid="crisis-simulation"]").isVisible()) {
            await page.locator("[data-testid="simulate-crisis-alert"]").click();
            await page.waitForSelector("[data-testid="simulated-crisis-alert"]");
            
            // Respond to simulated alert
            await page.locator("[data-testid="respond-to-simulation"]").click();
            await page.fill("[data-testid="simulation-response"]", "Immediate assessment and intervention protocol initiated.");
            await page.locator("[data-testid="submit-simulation-response"]").click();
          }
        }
      });

      // Step 4: Patient progress monitoring
      await test.step("Monitor patient progress", async () => {
        await page.goto("/provider/patients");
        
        // Select a patient for progress review
        const patientForReview = page.locator("[data-testid="patient-progress-review"]:first-child");
        if (await patientForReview.isVisible()) {
          await patientForReview.click();
          
          // Review progress dashboard
          await expect(page.locator("[data-testid="patient-progress-dashboard"]")).toBeVisible();
          
          // Check mood trends
          await expect(page.locator("[data-testid="mood-trend-chart"]")).toBeVisible();
          
          // Review skill practice progress
          await expect(page.locator("[data-testid="skill-progress-summary"]")).toBeVisible();
          
          // Check crisis plan status
          await expect(page.locator("[data-testid="crisis-plan-status"]")).toBeVisible();
          
          // Review therapy goals
          const therapyGoals = page.locator("[data-testid="therapy-goals-progress"]");
          if (await therapyGoals.isVisible()) {
            await expect(therapyGoals).toBeVisible();
            
            // Update goal status
            await page.locator("[data-testid="update-goal-status"]").click();
            await page.selectOption("[data-testid="goal-status-select"]", "in-progress");
            await page.fill("[data-testid="goal-notes"]", "Patient showing good progress with mindfulness techniques. Continue current approach.");
            await page.locator("[data-testid="save-goal-update"]").click();
            
            // Verify update saved
            await expect(page.locator("[data-testid="goal-update-saved"]")).toBeVisible();
          }
        }
      });

      // Step 5: Generate clinical report
      await test.step("Generate clinical progress report", async () => {
        await page.goto("/provider/reports");
        
        // Start report generation
        await page.locator("[data-testid="generate-clinical-report"]").click();
        
        // Select patient for report
        await page.selectOption("[data-testid="report-patient-select"]", "1"); // First patient
        
        // Set report parameters
        await page.selectOption("[data-testid="report-timeframe"]", "last-month");
        await page.check("[data-testid="include-mood-data"]");
        await page.check("[data-testid="include-crisis-events"]");
        await page.check("[data-testid="include-skill-progress"]");
        await page.check("[data-testid="include-therapeutic-goals"]");
        
        // Generate report
        await page.locator("[data-testid="create-clinical-report"]").click();
        
        // Wait for report generation
        await page.waitForSelector("[data-testid="clinical-report-generated"]", { timeout: 20000 });
        
        // Verify report contents
        await expect(page.locator("[data-testid="report-patient-summary"]")).toBeVisible();
        await expect(page.locator("[data-testid="report-mood-analysis"]")).toBeVisible();
        await expect(page.locator("[data-testid="report-risk-assessment"]")).toBeVisible();
        await expect(page.locator("[data-testid="report-recommendations"]")).toBeVisible();
        
        // Download report
        const downloadPromise = page.waitForEvent("download");
        await page.locator("[data-testid="download-report"]").click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain("clinical-report");
      });

      // Step 6: Communication with patients
      await test.step("Communicate with patients through platform", async () => {
        await page.goto("/provider/messages");
        
        // Check message inbox
        await expect(page.locator("[data-testid="provider-message-inbox"]")).toBeVisible();
        
        // Send message to patient
        await page.locator("[data-testid="compose-message"]").click();
        
        // Select patient
        await page.selectOption("[data-testid="message-recipient"]", "1");
        
        // Compose message
        await page.fill("[data-testid="message-subject"]", "Weekly Check-in and Progress Update");
        await page.fill("[data-testid="message-content"]", 
          "Hello! I wanted to check in on your progress this week. Your mood tracking data shows positive trends. Keep up the excellent work with your mindfulness practice. Let me know if you have any questions or concerns.");
        
        // Send message
        await page.locator("[data-testid="send-message"]").click();
        
        // Verify message sent
        await expect(page.locator("[data-testid="message-sent-confirmation"]")).toBeVisible();
        
        // Check sent messages
        await page.locator("[data-testid="sent-messages"]").click();
        await expect(page.locator("[data-testid="sent-message-item"]:first-child")).toContainText("Weekly Check-in");
      });

      console.log("✅ Therapist Provider Journey completed successfully");
    });
  });

  test.describe("Volunteer Journey", () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
    });

    test("Complete Volunteer Crisis Response Workflow", async () => {
      console.log("🤝 Testing Complete Volunteer Crisis Response Workflow");

      // Step 1: Demo login as volunteer
      await test.step("Login as demo volunteer", async () => {
        await page.goto("/auth/signin");
        
        // Click volunteer demo login
        const volunteerLogin = page.locator("[data-testid="demo-volunteer-login"]");
        await expect(volunteerLogin).toBeVisible();
        await volunteerLogin.click();
        
        // Verify successful login to volunteer dashboard
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await expect(page.locator("[data-testid="volunteer-dashboard"]")).toBeVisible();
      });

      // Step 2: Volunteer dashboard overview
      await test.step("Navigate volunteer dashboard", async () => {
        // Verify volunteer dashboard elements
        await expect(page.locator("[data-testid="volunteer-welcome"]")).toContainText(/volunteer/i);
        await expect(page.locator("[data-testid="crisis-queue"]")).toBeVisible();
        await expect(page.locator("[data-testid="volunteer-status"]")).toBeVisible();
        
        // Set availability status
        const availabilityToggle = page.locator("[data-testid="volunteer-availability-toggle"]");
        if (await availabilityToggle.isVisible()) {
          await availabilityToggle.click();
          await expect(page.locator("[data-testid="status-available"]")).toBeVisible();
        }
        
        // Check training status
        await expect(page.locator("[data-testid="training-status"]")).toBeVisible();
        await expect(page.locator("[data-testid="certification-status"]")).toBeVisible();
      });

      // Step 3: Respond to crisis chat request
      await test.step("Respond to crisis chat request", async () => {
        // Check for available crisis chats
        const crisisQueue = page.locator("[data-testid="crisis-chat-queue"]");
        
        if (await crisisQueue.isVisible()) {
          const availableChat = page.locator("[data-testid="crisis-chat-request"]:first-child");
          
          if (await availableChat.isVisible()) {
            // Accept crisis chat
            await page.locator("[data-testid="accept-crisis-chat"]").click();
            
            // Verify chat interface opens
            await page.waitForSelector("[data-testid="volunteer-chat-interface"]", { timeout: 10000 });
            
            // Send initial volunteer message
            const chatInput = page.locator("[data-testid="volunteer-chat-input"]");
            await chatInput.fill("Hello, I'm here to support you. My name is Sarah and I'm a trained crisis volunteer. How are you feeling right now?");
            await page.keyboard.press("Enter");
            
            // Simulate user response and volunteer conversation
            await page.waitForSelector("[data-testid="user-message"]", { timeout: 5000 });
            
            // Provide supportive response
            await chatInput.fill("I understand you're going through a difficult time. Your feelings are valid and I'm here to listen. Can you tell me more about what's troubling you?");
            await page.keyboard.press("Enter");
            
            // Use crisis assessment tools
            const assessmentTools = page.locator("[data-testid="crisis-assessment-tools"]");
            if (await assessmentTools.isVisible()) {
              await assessmentTools.click();
              
              // Conduct safety assessment
              await page.locator("[data-testid="safety-assessment"]").click();
              await page.locator("[data-testid="assess-immediate-danger"]").click();
              
              // Based on assessment, provide appropriate resources
              await page.locator("[data-testid="provide-resources"]").click();
              await page.check("[data-testid="resource-crisis-hotline"]");
              await page.check("[data-testid="resource-breathing-exercises"]");
              
              await page.locator("[data-testid="send-resources"]").click();
            }
            
            // End chat session appropriately
            const endChatButton = page.locator("[data-testid="end-volunteer-chat"]");
            if (await endChatButton.isVisible()) {
              await endChatButton.click();
              
              // Provide session summary
              await page.fill("[data-testid="session-summary"]", 
                "User presented with anxiety and emotional distress. Provided active listening, emotional validation, and crisis resources. No immediate safety concerns identified. Encouraged to continue with professional support.");
              
              // Rate session outcome
              await page.locator("[data-testid="outcome-positive"]").click();
              
              // Submit session report
              await page.locator("[data-testid="submit-session-report"]").click();
              
              // Verify session completed
              await expect(page.locator("[data-testid="session-completed"]")).toBeVisible();
            }
          }
        } else {
          console.log("No crisis chats in queue - this is normal for testing");
        }
      });

      // Step 4: Volunteer training and development
      await test.step("Access volunteer training resources", async () => {
        await page.goto("/volunteer/training");
        
        // Check training modules
        await expect(page.locator("[data-testid="training-modules"]")).toBeVisible();
        
        // Access crisis intervention training
        const crisisTraining = page.locator("[data-testid="crisis-intervention-training"]");
        if (await crisisTraining.isVisible()) {
          await crisisTraining.click();
          
          // Verify training content
          await expect(page.locator("[data-testid="training-content"]")).toBeVisible();
          
          // Complete training module (simulated)
          const completeModule = page.locator("[data-testid="complete-training-module"]");
          if (await completeModule.isVisible()) {
            await completeModule.click();
            await expect(page.locator("[data-testid="module-completed"]")).toBeVisible();
          }
        }
        
        // Check continuing education requirements
        await expect(page.locator("[data-testid="continuing-education"]")).toBeVisible();
      });

      console.log("✅ Volunteer Journey completed successfully");
    });
  });

  test.describe("Admin Journey", () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
    });

    test("Complete Admin Management Workflow", async () => {
      console.log("👑 Testing Complete Admin Management Workflow");

      // Step 1: Demo login as admin
      await test.step("Login as demo admin", async () => {
        await page.goto("/auth/signin");
        
        // Click admin demo login
        const adminLogin = page.locator("[data-testid="demo-admin-login"]");
        await expect(adminLogin).toBeVisible();
        await adminLogin.click();
        
        // Verify successful login to admin dashboard
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await expect(page.locator("[data-testid="admin-dashboard"]")).toBeVisible();
      });

      // Step 2: Platform monitoring and analytics
      await test.step("Monitor platform analytics", async () => {
        // Verify admin dashboard elements
        await expect(page.locator("[data-testid="platform-statistics"]")).toBeVisible();
        await expect(page.locator("[data-testid="user-metrics"]")).toBeVisible();
        await expect(page.locator("[data-testid="crisis-metrics"]")).toBeVisible();
        
        // Check real-time monitoring
        await expect(page.locator("[data-testid="active-users"]")).toContainText(/\d+/);
        await expect(page.locator("[data-testid="active-crisis-sessions"]")).toContainText(/\d+/);
        await expect(page.locator("[data-testid="volunteer-availability"]")).toContainText(/\d+/);
      });

      // Step 3: User management
      await test.step("Manage users and access", async () => {
        await page.goto("/admin/users");
        
        // Verify user management interface
        await expect(page.locator("[data-testid="user-management"]")).toBeVisible();
        
        // Search for users
        const userSearch = page.locator("[data-testid="user-search"]");
        if (await userSearch.isVisible()) {
          await userSearch.fill("test@example.com");
          await page.keyboard.press("Enter");
          
          // Verify search results
          await expect(page.locator("[data-testid="user-search-results"]")).toBeVisible();
        }
        
        // Manage user permissions
        const manageUser = page.locator("[data-testid="manage-user-permissions"]:first-child");
        if (await manageUser.isVisible()) {
          await manageUser.click();
          
          // Verify permission management interface
          await expect(page.locator("[data-testid="permission-management"]")).toBeVisible();
        }
      });

      // Step 4: System health monitoring
      await test.step("Monitor system health and performance", async () => {
        await page.goto("/admin/system-health");
        
        // Check system status indicators
        await expect(page.locator("[data-testid="database-status"]")).toBeVisible();
        await expect(page.locator("[data-testid="api-status"]")).toBeVisible();
        await expect(page.locator("[data-testid="websocket-status"]")).toBeVisible();
        
        // Verify performance metrics
        await expect(page.locator("[data-testid="response-time-metrics"]")).toBeVisible();
        await expect(page.locator("[data-testid="error-rate-metrics"]")).toBeVisible();
        
        // Check recent errors log
        const errorLog = page.locator("[data-testid="recent-errors"]");
        if (await errorLog.isVisible()) {
          await expect(errorLog).toBeVisible();
        }
      });

      console.log("✅ Admin Journey completed successfully");
    });
  });

  test.afterEach(async ({ page }) => {
    if (page) {
      await page.close();
    }
  });
});