/**
 * Comprehensive Modernization Test Suite
 * Validates all modernization requirements are met
 */

import { test, expect } from '@playwright/test';

describe('ASTRAL CORE V2 - Modernization Validation', () => {
  
  test.describe('Phase 1: Legacy Code Elimination', () => {
    test('should have no jQuery dependencies', async ({ page }) => {
      await page.goto('/');
      
      // Check for jQuery in global scope
      const hasJQuery = await page.evaluate(() => {
        return typeof window.$ !== 'undefined' || typeof window.jQuery !== 'undefined';
      });
      
      expect(hasJQuery).toBe(false);
    });

    test('should use modern JavaScript features', async ({ page }) => {
      await page.goto('/');
      
      // Check for modern features usage
      const usesModernJS = await page.evaluate(() => {
        // Check for ES6+ features in the page
        const scripts = Array.from(document.scripts);
        return scripts.some(script => 
          script.textContent?.includes('const ') ||
          script.textContent?.includes('let ') ||
          script.textContent?.includes('=>') ||
          script.textContent?.includes('async ')
        );
      });
      
      expect(usesModernJS).toBe(true);
    });
  });

  test.describe('Phase 2: Performance Optimization', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      await page.goto('/');
      
      // Measure Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};
          
          // LCP
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.LCP = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // FID would be measured with real user interaction
          // CLS
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            metrics.CLS = entries.reduce((acc, entry) => acc + entry.value, 0);
          }).observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => resolve(metrics), 3000);
        });
      });
      
      expect(metrics.LCP).toBeLessThan(2500); // 2.5s threshold
      expect(metrics.CLS).toBeLessThan(0.1);  // CLS threshold
    });

    test('should have optimized bundle size', async ({ page }) => {
      const response = await page.goto('/');
      const transferSize = response?.request().sizes().transferSize || 0;
      
      // Check that initial bundle is under 200KB
      expect(transferSize).toBeLessThan(200 * 1024);
    });

    test('should implement lazy loading', async ({ page }) => {
      await page.goto('/');
      
      const hasLazyLoading = await page.evaluate(() => {
        const images = Array.from(document.images);
        return images.some(img => img.loading === 'lazy');
      });
      
      expect(hasLazyLoading).toBe(true);
    });
  });

  test.describe('Phase 3: Modern UI/UX', () => {
    test('should have modern CSS features', async ({ page }) => {
      await page.goto('/');
      
      const usesModernCSS = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        let hasModernFeatures = false;
        
        try {
          stylesheets.forEach(sheet => {
            if (sheet.cssRules) {
              Array.from(sheet.cssRules).forEach(rule => {
                if (rule.cssText.includes('grid') || 
                    rule.cssText.includes('flex') ||
                    rule.cssText.includes('clamp(') ||
                    rule.cssText.includes('var(--')) {
                  hasModernFeatures = true;
                }
              });
            }
          });
        } catch (e) {
          // CORS issues with external stylesheets
        }
        
        return hasModernFeatures;
      });
      
      expect(usesModernCSS).toBe(true);
    });

    test('should support dark mode', async ({ page }) => {
      await page.goto('/');
      
      // Check for dark mode support
      const supportsDarkMode = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ||
               getComputedStyle(document.documentElement).getPropertyValue('--background') ||
               !!document.querySelector('[data-theme]');
      });
      
      expect(supportsDarkMode).toBe(true);
    });
  });

  test.describe('Phase 4: Accessibility Compliance', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => 
        elements.map(el => el.tagName)
      );
      
      // Should start with h1
      expect(headings[0]).toBe('H1');
      
      // Should not skip heading levels
      const levels = headings.map(tag => parseInt(tag.charAt(1)));
      let validHierarchy = true;
      
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i-1] + 1) {
          validHierarchy = false;
          break;
        }
      }
      
      expect(validHierarchy).toBe(true);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');
      
      const imagesWithoutAlt = await page.$$eval('img', (images) =>
        images.filter(img => !img.alt || img.alt.trim() === '').length
      );
      
      expect(imagesWithoutAlt).toBe(0);
    });

    test('should have proper focus management', async ({ page }) => {
      await page.goto('/');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe('Phase 5: Security & Privacy', () => {
    test('should have security headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers() || {};
      
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeTruthy();
      expect(headers['referrer-policy']).toBeTruthy();
    });

    test('should use HTTPS', async ({ page }) => {
      await page.goto('/');
      const url = page.url();
      expect(url).toMatch(/^https:/);
    });
  });

  test.describe('Phase 6: Mental Health Specific Features', () => {
    test('should have crisis intervention accessible', async ({ page }) => {
      await page.goto('/');
      
      // Look for crisis-related elements
      const hasCrisisFeatures = await page.evaluate(() => {
        const text = document.body.textContent?.toLowerCase() || '';
        return text.includes('crisis') || 
               text.includes('emergency') || 
               text.includes('help') ||
               !!document.querySelector('[data-testid*="crisis"]') ||
               !!document.querySelector('[data-testid*="emergency"]');
      });
      
      expect(hasCrisisFeatures).toBe(true);
    });

    test('should have accessible therapy features', async ({ page }) => {
      await page.goto('/');
      
      const hasTherapyFeatures = await page.evaluate(() => {
        const text = document.body.textContent?.toLowerCase() || '';
        return text.includes('therapy') || 
               text.includes('counseling') || 
               text.includes('support') ||
               !!document.querySelector('[data-testid*="therapy"]');
      });
      
      expect(hasTherapyFeatures).toBe(true);
    });
  });

  test.describe('Phase 7: Monitoring & Analytics', () => {
    test('should have monitoring endpoints available', async ({ page }) => {
      // Test health endpoint
      const healthResponse = await page.request.get('/api/health');
      expect(healthResponse.status()).toBe(200);
      
      const healthData = await healthResponse.json();
      expect(healthData.status).toBe('healthy');
    });

    test('should track web vitals', async ({ page }) => {
      await page.goto('/');
      
      // Check if web vitals tracking is loaded
      const hasWebVitalsTracking = await page.evaluate(() => {
        return typeof window.webVitalsTracker !== 'undefined' ||
               !!document.querySelector('script[src*="web-vitals"]');
      });
      
      expect(hasWebVitalsTracking).toBe(true);
    });
  });

  test.describe('Phase 8: Cross-Browser Compatibility', () => {
    test('should work in modern browsers', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Check for browser compatibility
      const isCompatible = await page.evaluate(() => {
        // Check for modern features support
        return 'fetch' in window &&
               'Promise' in window &&
               'Array.from' in window &&
               'Object.assign' in window;
      });
      
      expect(isCompatible).toBe(true);
    });
  });

  test.describe('Phase 9: Mobile Responsiveness', () => {
    test('should be mobile responsive', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check if layout adapts to mobile
      const isMobileOptimized = await page.evaluate(() => {
        const metaViewport = document.querySelector('meta[name="viewport"]');
        return metaViewport?.getAttribute('content')?.includes('width=device-width');
      });
      
      expect(isMobileOptimized).toBe(true);
    });

    test('should have touch-friendly targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Check button sizes for touch
      const buttonSizes = await page.$$eval('button, a', (elements) =>
        elements.map(el => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        })
      );
      
      // Check that most interactive elements are at least 44x44px
      const touchFriendly = buttonSizes.filter(size => 
        size.width >= 44 && size.height >= 44
      ).length;
      
      expect(touchFriendly).toBeGreaterThan(buttonSizes.length * 0.8);
    });
  });

  test.describe('Phase 10: Final Validation', () => {
    test('should have no console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForTimeout(3000); // Wait for page to fully load
      
      // Filter out known non-critical errors
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon.ico') &&
        !error.includes('google-analytics') &&
        !error.includes('Evaluation failed')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });

    test('should meet all modernization criteria', async ({ page }) => {
      await page.goto('/');
      
      // Overall modernization score check
      const modernizationScore = await page.evaluate(() => {
        let score = 0;
        
        // Modern JavaScript (10 points)
        if (typeof Promise !== 'undefined') score += 10;
        
        // No jQuery (10 points)  
        if (typeof window.$ === 'undefined') score += 10;
        
        // Modern CSS (10 points)
        if (CSS.supports('display', 'grid')) score += 10;
        
        // Responsive design (10 points)
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) score += 10;
        
        // Accessibility (10 points)
        if (document.querySelector('[alt]')) score += 10;
        
        // Performance (10 points - simplified check)
        if (document.querySelector('[loading="lazy"]')) score += 10;
        
        // Modern semantics (10 points)
        if (document.querySelector('main, section, article, header, footer')) score += 10;
        
        // Security (10 points)
        if (location.protocol === 'https:') score += 10;
        
        // Modern features (10 points)
        if ('IntersectionObserver' in window) score += 10;
        
        // Clean code (10 points)
        if (!document.querySelector('[style*="!important"]')) score += 10;
        
        return score;
      });
      
      // Should score at least 80% (80/100)
      expect(modernizationScore).toBeGreaterThanOrEqual(80);
    });
  });
});