import { test, expect, Page } from '@playwright/test';

/**
 * ASTRAL CORE V2 - User Journey Performance Testing
 * 
 * Performance validation for complete user flows:
 * 1. Page load times and Core Web Vitals
 * 2. Crisis response time validation
 * 3. Real-time features performance
 * 4. Database query optimization
 * 5. Concurrent user scenarios
 * 6. Memory usage optimization
 */

test.describe('User Journey Performance Testing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'tests/e2e/auth/regular-user.json'
    });
    page = await context.newPage();
    
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Track performance metrics
      window.performanceMetrics = {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoaded: performance.timing.domContentLoadedEventEnd,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      };
      
      // Capture Web Vitals
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-paint') {
                window.performanceMetrics.firstPaint = entry.startTime;
              } else if (entry.name === 'first-contentful-paint') {
                window.performanceMetrics.firstContentfulPaint = entry.startTime;
              }
            } else if (entry.entryType === 'largest-contentful-paint') {
              window.performanceMetrics.largestContentfulPaint = entry.startTime;
            } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              window.performanceMetrics.cumulativeLayoutShift += entry.value;
            } else if (entry.entryType === 'first-input') {
              window.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
            }
          }
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
      }
    });
  });

  test('Dashboard Load Performance', async () => {
    console.log('⚡ Testing Dashboard Load Performance');

    await test.step('Measure dashboard load times', async () => {
      const startTime = Date.now();
      
      // Navigate to dashboard
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      console.log(`Dashboard load time: ${loadTime}ms`);
      
      // Verify load time is under 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check for critical elements
      await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="mood-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-summary"]')).toBeVisible();
    });

    await test.step('Validate Core Web Vitals', async () => {
      // Wait for performance metrics to be collected
      await page.waitForTimeout(2000);
      
      const metrics = await page.evaluate(() => window.performanceMetrics);
      
      // First Contentful Paint should be under 1.8s
      expect(metrics.firstContentfulPaint).toBeLessThan(1800);
      console.log(`First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
      
      // Largest Contentful Paint should be under 2.5s
      expect(metrics.largestContentfulPaint).toBeLessThan(2500);
      console.log(`Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`);
      
      // Cumulative Layout Shift should be under 0.1
      expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1);
      console.log(`Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);
      
      // First Input Delay should be under 100ms
      if (metrics.firstInputDelay > 0) {
        expect(metrics.firstInputDelay).toBeLessThan(100);
        console.log(`First Input Delay: ${metrics.firstInputDelay}ms`);
      }
    });

    await test.step('Test interactive responsiveness', async () => {
      // Test mood tracker responsiveness
      const startInteraction = Date.now();
      await page.locator('[data-testid="mood-tracker"]').click();
      await page.waitForSelector('[data-testid="mood-rating-scale"]');
      const interactionTime = Date.now() - startInteraction;
      
      console.log(`Mood tracker interaction time: ${interactionTime}ms`);
      expect(interactionTime).toBeLessThan(500);
      
      // Test progress chart load
      const chartStart = Date.now();
      await page.goto('/progress');
      await page.waitForSelector('[data-testid="progress-dashboard"]');
      const chartTime = Date.now() - chartStart;
      
      console.log(`Progress chart load time: ${chartTime}ms`);
      expect(chartTime).toBeLessThan(2000);
    });
  });

  test('Crisis Response Time Performance', async () => {
    console.log('🚨 Testing Crisis Response Time Performance');

    await test.step('Measure crisis page load speed', async () => {
      const startTime = Date.now();
      
      // Navigate to crisis page
      await page.goto('/crisis');
      
      // Wait for critical crisis elements
      await expect(page.locator('[data-testid="emergency-contact"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-crisis-chat"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      console.log(`Crisis page load time: ${loadTime}ms`);
      
      // Crisis page must load in under 1 second (life-critical)
      expect(loadTime).toBeLessThan(1000);
    });

    await test.step('Test crisis chat initialization speed', async () => {
      const chatStartTime = Date.now();
      
      // Start crisis chat
      await page.locator('[data-testid="start-crisis-chat"]').click();
      
      // Wait for chat interface
      await page.waitForSelector('[data-testid="crisis-chat-interface"]');
      await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
      
      const chatInitTime = Date.now() - chatStartTime;
      console.log(`Crisis chat initialization time: ${chatInitTime}ms`);
      
      // Crisis chat must initialize in under 2 seconds
      expect(chatInitTime).toBeLessThan(2000);
    });

    await test.step('Test crisis assessment response time', async () => {
      const assessmentStart = Date.now();
      
      // Send crisis message to trigger assessment
      const chatInput = page.locator('[data-testid="chat-input"]');
      await chatInput.fill('I am having thoughts of self-harm');
      await page.keyboard.press('Enter');
      
      // Wait for crisis assessment to appear
      await page.waitForSelector('[data-testid="crisis-assessment"]', { timeout: 5000 });
      
      const assessmentTime = Date.now() - assessmentStart;
      console.log(`Crisis assessment response time: ${assessmentTime}ms`);
      
      // Crisis assessment must trigger in under 3 seconds
      expect(assessmentTime).toBeLessThan(3000);
    });
  });

  test('Real-time Features Performance', async () => {
    console.log('🔄 Testing Real-time Features Performance');

    await test.step('Test WebSocket connection establishment', async () => {
      // Monitor WebSocket connection timing
      const connectionPromise = page.waitForEvent('websocket');
      
      await page.goto('/crisis');
      await page.locator('[data-testid="start-crisis-chat"]').click();
      
      const ws = await connectionPromise;
      console.log('WebSocket connection established');
      
      // Test message round-trip time
      const messageStart = Date.now();
      
      await page.locator('[data-testid="chat-input"]').fill('Test real-time message');
      await page.keyboard.press('Enter');
      
      // Wait for message to appear in chat
      await page.waitForSelector('[data-testid="chat-message"]:last-child');
      
      const roundTripTime = Date.now() - messageStart;
      console.log(`Message round-trip time: ${roundTripTime}ms`);
      
      // Real-time messages should have low latency
      expect(roundTripTime).toBeLessThan(1000);
    });

    await test.step('Test live updates performance', async () => {
      // Test mood update propagation
      await page.goto('/dashboard');
      
      const updateStart = Date.now();
      
      // Update mood
      await page.locator('[data-testid="mood-tracker"]').click();
      await page.locator('[data-testid="mood-rating-7"]').click();
      await page.locator('[data-testid="save-mood-checkin"]').click();
      
      // Wait for UI update
      await expect(page.locator('[data-testid="current-mood-display"]')).toContainText('7');
      
      const updateTime = Date.now() - updateStart;
      console.log(`Live update time: ${updateTime}ms`);
      
      // Live updates should be fast
      expect(updateTime).toBeLessThan(2000);
    });
  });

  test('Database Query Performance', async () => {
    console.log('🗄️ Testing Database Query Performance');

    await test.step('Test progress page query performance', async () => {
      const queryStart = Date.now();
      
      // Navigate to progress page (data-heavy)
      await page.goto('/progress');
      
      // Wait for all data to load
      await page.waitForSelector('[data-testid="mood-trend-chart"]');
      await page.waitForSelector('[data-testid="activity-completion-chart"]');
      await page.waitForSelector('[data-testid="progress-metrics"]');
      
      const queryTime = Date.now() - queryStart;
      console.log(`Progress data query time: ${queryTime}ms`);
      
      // Complex queries should complete in reasonable time
      expect(queryTime).toBeLessThan(4000);
    });

    await test.step('Test self-help tools query performance', async () => {
      const toolsStart = Date.now();
      
      // Navigate to self-help hub
      await page.goto('/self-help');
      
      // Wait for all tools to load
      await page.waitForSelector('[data-testid="breathing-exercises"]');
      await page.waitForSelector('[data-testid="dbt-skills"]');
      await page.waitForSelector('[data-testid="cbt-tools"]');
      await page.waitForSelector('[data-testid="journaling-tools"]');
      
      const toolsTime = Date.now() - toolsStart;
      console.log(`Self-help tools query time: ${toolsTime}ms`);
      
      // Tools should load quickly
      expect(toolsTime).toBeLessThan(3000);
    });

    await test.step('Test search functionality performance', async () => {
      // Test resource search
      await page.goto('/resources');
      
      const searchStart = Date.now();
      
      // Perform search
      await page.fill('[data-testid="resource-search"]', 'anxiety');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForSelector('[data-testid="search-results"]');
      
      const searchTime = Date.now() - searchStart;
      console.log(`Search query time: ${searchTime}ms`);
      
      // Search should be fast
      expect(searchTime).toBeLessThan(1500);
    });
  });

  test('Concurrent User Performance', async () => {
    console.log('👥 Testing Concurrent User Performance');

    await test.step('Simulate multiple user sessions', async () => {
      const contexts = [];
      const pages = [];
      
      try {
        // Create multiple user contexts
        for (let i = 0; i < 5; i++) {
          const context = await page.context().browser()?.newContext({
            storageState: 'tests/e2e/auth/regular-user.json'
          });
          
          if (context) {
            contexts.push(context);
            const newPage = await context.newPage();
            pages.push(newPage);
          }
        }
        
        // Measure concurrent dashboard loads
        const loadStart = Date.now();
        
        const loadPromises = pages.map(p => p.goto('/dashboard', { waitUntil: 'networkidle' }));
        await Promise.all(loadPromises);
        
        const concurrentLoadTime = Date.now() - loadStart;
        console.log(`Concurrent dashboard load time (5 users): ${concurrentLoadTime}ms`);
        
        // Concurrent loads should not significantly degrade performance
        expect(concurrentLoadTime).toBeLessThan(8000);
        
        // Test concurrent crisis chat initiation
        const chatStart = Date.now();
        
        const chatPromises = pages.map(async (p) => {
          await p.goto('/crisis');
          await p.locator('[data-testid="start-crisis-chat"]').click();
          await p.waitForSelector('[data-testid="crisis-chat-interface"]');
        });
        
        await Promise.all(chatPromises);
        
        const concurrentChatTime = Date.now() - chatStart;
        console.log(`Concurrent crisis chat time (5 users): ${concurrentChatTime}ms`);
        
        // Concurrent crisis chats must handle well
        expect(concurrentChatTime).toBeLessThan(10000);
        
      } finally {
        // Clean up contexts and pages
        for (const p of pages) {
          await p.close();
        }
        for (const context of contexts) {
          await context.close();
        }
      }
    });
  });

  test('Memory Usage Optimization', async () => {
    console.log('🧠 Testing Memory Usage Optimization');

    await test.step('Monitor memory usage during normal flow', async () => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (initialMemory) {
        console.log(`Initial memory usage: ${(initialMemory.used / 1024 / 1024).toFixed(2)} MB`);
        
        // Navigate through multiple pages
        const pages = ['/dashboard', '/self-help', '/progress', '/crisis', '/resources'];
        
        for (const pagePath of pages) {
          await page.goto(pagePath);
          await page.waitForTimeout(1000); // Allow page to fully load
        }
        
        // Check memory after navigation
        const finalMemory = await page.evaluate(() => {
          if (performance.memory) {
            return {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
              limit: performance.memory.jsHeapSizeLimit
            };
          }
          return null;
        });
        
        if (finalMemory) {
          console.log(`Final memory usage: ${(finalMemory.used / 1024 / 1024).toFixed(2)} MB`);
          
          const memoryIncrease = finalMemory.used - initialMemory.used;
          const memoryIncreasePercent = (memoryIncrease / initialMemory.used) * 100;
          
          console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${memoryIncreasePercent.toFixed(1)}%)`);
          
          // Memory increase should be reasonable
          expect(memoryIncreasePercent).toBeLessThan(100); // Less than 100% increase
        }
      }
    });

    await test.step('Test memory cleanup after heavy operations', async () => {
      // Perform memory-intensive operations
      await page.goto('/progress');
      await page.waitForSelector('[data-testid="mood-trend-chart"]');
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      const afterGCMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return null;
      });
      
      if (afterGCMemory) {
        console.log(`Memory after GC: ${(afterGCMemory / 1024 / 1024).toFixed(2)} MB`);
      }
    });
  });

  test('Bundle Size and Load Performance', async () => {
    console.log('📦 Testing Bundle Size and Load Performance');

    await test.step('Analyze network performance', async () => {
      // Enable network monitoring
      await page.route('**/*', async (route) => {
        const response = await route.fetch();
        const size = (await response.body()).length;
        
        if (route.request().url().includes('.js') && size > 1024 * 1024) {
          console.warn(`Large JS bundle detected: ${route.request().url()} (${(size / 1024 / 1024).toFixed(2)} MB)`);
        }
        
        route.fulfill({ response });
      });
      
      await page.goto('/dashboard');
      
      // Check for efficient loading
      const performanceEntries = await page.evaluate(() => {
        return performance.getEntriesByType('navigation').map(entry => ({
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize
        }));
      });
      
      if (performanceEntries.length > 0) {
        const entry = performanceEntries[0];
        console.log(`DOM Content Loaded: ${entry.domContentLoaded}ms`);
        console.log(`Load Complete: ${entry.loadComplete}ms`);
        console.log(`Transfer Size: ${(entry.transferSize / 1024).toFixed(2)} KB`);
        
        // Verify reasonable transfer sizes
        expect(entry.transferSize).toBeLessThan(5 * 1024 * 1024); // Less than 5MB total
      }
    });
  });

  test.afterEach(async () => {
    // Log final performance summary
    const finalMetrics = await page.evaluate(() => window.performanceMetrics);
    
    console.log('\n📊 Performance Summary:');
    console.log(`First Contentful Paint: ${finalMetrics.firstContentfulPaint}ms`);
    console.log(`Largest Contentful Paint: ${finalMetrics.largestContentfulPaint}ms`);
    console.log(`Cumulative Layout Shift: ${finalMetrics.cumulativeLayoutShift}`);
    if (finalMetrics.firstInputDelay > 0) {
      console.log(`First Input Delay: ${finalMetrics.firstInputDelay}ms`);
    }
    
    if (page) {
      await page.close();
    }
  });
});