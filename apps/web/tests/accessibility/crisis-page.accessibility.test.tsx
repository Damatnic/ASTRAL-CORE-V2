/**
 * ASTRAL_CORE V2.0 - Crisis Page Accessibility Tests
 * 
 * WCAG 2.1 AA Compliance Testing for Crisis Intervention Landing Page
 * Phase 4 Testing: UI & Accessibility Testing
 * 
 * Critical Requirements:
 * - 100% keyboard accessibility for emergency features
 * - Full screen reader support for crisis interventions  
 * - WCAG 2.1 AA compliance (4.5:1 contrast, proper ARIA)
 * - Mobile accessibility for users seeking help on phones
 * - Trauma-informed design principles
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import CrisisPage from '../../src/app/crisis/page';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dynamic imports
jest.mock('next/dynamic', () => {
  return (importFn: any, options: any) => {
    const Component = () => <div data-testid={options.loading().props['data-testid'] || 'mocked-component'}>Mocked Component</div>;
    return Component;
  };
});

describe('Crisis Page - WCAG 2.1 AA Accessibility Compliance', () => {
  
  describe('Emergency Banner Accessibility', () => {
    test('should have accessible emergency banner with proper ARIA attributes', async () => {
      const { container } = render(<CrisisPage />);
      
      // Find emergency banner
      const emergencyBanner = container.querySelector('[data-testid="emergency-banner"]') || 
                             container.querySelector('.bg-red-600');
      
      expect(emergencyBanner).toBeInTheDocument();
      
      // Check for proper semantic markup
      expect(emergencyBanner).toHaveAttribute('role', 'banner');
      expect(emergencyBanner).toHaveAttribute('aria-label', expect.stringMatching(/emergency|crisis|24.*7/i));
      
      // Run axe accessibility check
      const results = await axe(emergencyBanner as HTMLElement);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible emergency call buttons with proper keyboard support', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisPage />);
      
      // Find emergency call buttons
      const call988Button = screen.getByRole('button', { name: /call 988/i });
      const text741741Button = screen.getByRole('button', { name: /text.*741741/i });
      
      // Validate 988 button accessibility
      expect(call988Button).toBeInTheDocument();
      expect(call988Button).toHaveAttribute('aria-label', expect.stringMatching(/call.*988|crisis.*hotline/i));
      expect(call988Button.tagName).toBe('BUTTON');
      
      // Test keyboard navigation
      call988Button.focus();
      expect(document.activeElement).toBe(call988Button);
      
      // Test Enter key activation
      const mockClick = jest.fn();
      call988Button.addEventListener('click', mockClick);
      fireEvent.keyDown(call988Button, { key: 'Enter', code: 'Enter' });
      
      // Validate 741741 button accessibility  
      expect(text741741Button).toBeInTheDocument();
      expect(text741741Button).toHaveAttribute('aria-label', expect.stringMatching(/text.*741741|crisis.*text/i));
      
      // Test mobile touch targets (minimum 44px)
      const call988Rect = call988Button.getBoundingClientRect();
      const text741741Rect = text741741Button.getBoundingClientRect();
      
      expect(Math.min(call988Rect.width, call988Rect.height)).toBeGreaterThanOrEqual(44);
      expect(Math.min(text741741Rect.width, text741741Rect.height)).toBeGreaterThanOrEqual(44);
      
      // Run axe checks
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should meet WCAG color contrast requirements for emergency elements', async () => {
      const { container } = render(<CrisisPage />);
      
      const emergencyBanner = container.querySelector('.bg-red-600');
      const call988Button = screen.getByRole('button', { name: /call 988/i });
      
      // Test with axe color-contrast rule
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
      
      // Additional contrast validation for critical elements
      if (emergencyBanner) {
        const styles = window.getComputedStyle(emergencyBanner);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        // Emergency banner should have high contrast (red background, white text)
        expect(backgroundColor).toMatch(/rgb\(220,\s*38,\s*38\)/); // red-600
        expect(color).toMatch(/rgb\(255,\s*255,\s*255\)/); // white
      }
    });
  });

  describe('Navigation Accessibility', () => {
    test('should have accessible navigation with proper landmark roles', async () => {
      const { container } = render(<CrisisPage />);
      
      // Check for navigation landmarks
      const navigation = container.querySelector('nav') || 
                        container.querySelector('[role="navigation"]');
      
      if (navigation) {
        expect(navigation).toHaveAttribute('aria-label', expect.stringMatching(/main|primary|crisis/i));
      }
      
      // Check back button accessibility
      const backButton = screen.queryByRole('button', { name: /back.*crisis.*hub/i });
      if (backButton) {
        expect(backButton).toHaveAttribute('aria-label', expect.stringMatching(/back|return|home/i));
        
        // Test keyboard navigation
        backButton.focus();
        expect(document.activeElement).toBe(backButton);
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible view selection buttons with proper state management', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisPage />);
      
      // Find view selection buttons (chat, peer support, resources)
      const chatButton = screen.queryByRole('button', { name: /crisis chat/i });
      const peerButton = screen.queryByRole('button', { name: /peer support/i });
      const resourcesButton = screen.queryByRole('button', { name: /resources/i });
      
      if (chatButton && peerButton && resourcesButton) {
        // Check ARIA states
        expect(chatButton).toHaveAttribute('aria-pressed');
        expect(peerButton).toHaveAttribute('aria-pressed');
        expect(resourcesButton).toHaveAttribute('aria-pressed');
        
        // Test keyboard navigation between options
        await user.tab(); // Focus first button
        expect(document.activeElement).toBe(chatButton);
        
        await user.tab(); // Focus second button
        expect(document.activeElement).toBe(peerButton);
        
        await user.tab(); // Focus third button
        expect(document.activeElement).toBe(resourcesButton);
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Home View Accessibility', () => {
    test('should have accessible hero section with proper heading hierarchy', async () => {
      const { container } = render(<CrisisPage />);
      
      // Check for proper heading hierarchy
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent(/you.*safe.*here/i);
      
      // Check for descriptive content
      const safetyIndicator = screen.getByText(/confidential.*support.*24.*7/i);
      expect(safetyIndicator).toBeInTheDocument();
      expect(safetyIndicator).toHaveAttribute('aria-live', 'polite');
      
      // Validate heading structure
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible crisis severity cards with proper ARIA labeling', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisPage />);
      
      // Find emergency and non-emergency support cards
      const emergencyCard = container.querySelector('.bg-red-50') || 
                           screen.getByText(/need help right now/i).closest('[role="region"]');
      const supportCard = container.querySelector('.bg-blue-50') ||
                         screen.getByText(/looking for support/i).closest('[role="region"]');
      
      if (emergencyCard) {
        expect(emergencyCard).toHaveAttribute('aria-labelledby');
        expect(emergencyCard).toHaveAttribute('role', 'region');
        
        // Find buttons within emergency card
        const emergencyButtons = emergencyCard.querySelectorAll('button');
        emergencyButtons.forEach((button) => {
          expect(button).toHaveAttribute('aria-label');
          expect(button.tabIndex).not.toBe(-1);
        });
      }
      
      if (supportCard) {
        expect(supportCard).toHaveAttribute('aria-labelledby');
        expect(supportCard).toHaveAttribute('role', 'region');
        
        // Test keyboard navigation within support card
        const supportButtons = supportCard.querySelectorAll('button');
        if (supportButtons.length > 0) {
          (supportButtons[0] as HTMLElement).focus();
          expect(document.activeElement).toBe(supportButtons[0]);
        }
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible expandable support options with proper ARIA states', async () => {
      const user = userEvent.setup();
      const { container } = render(<CrisisPage />);
      
      // Find expandable details section
      const detailsElement = container.querySelector('details');
      
      if (detailsElement) {
        const summary = detailsElement.querySelector('summary');
        
        expect(summary).toBeInTheDocument();
        expect(summary).toHaveAttribute('role', 'button');
        expect(summary).toHaveAttribute('aria-expanded');
        expect(summary).toHaveAttribute('tabindex', '0');
        
        // Test keyboard expansion
        summary?.focus();
        expect(document.activeElement).toBe(summary);
        
        // Test Enter key to expand
        fireEvent.keyDown(summary!, { key: 'Enter', code: 'Enter' });
        
        // Check for expanded state
        await waitFor(() => {
          expect(summary).toHaveAttribute('aria-expanded', 'true');
        });
        
        // Check support option cards within expanded section
        const supportOptions = detailsElement.querySelectorAll('[role="region"], .bg-white');
        supportOptions.forEach((option) => {
          const button = option.querySelector('button');
          if (button) {
            expect(button).toHaveAttribute('aria-label');
            expect(button).not.toHaveAttribute('aria-disabled', 'true');
          }
        });
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    test('should have adequate touch targets for mobile crisis users', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      const { container } = render(<CrisisPage />);
      
      // Find all interactive elements
      const interactiveElements = container.querySelectorAll(
        'button, [role="button"], a, [role="link"], input, textarea, select'
      );
      
      interactiveElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        
        // WCAG 2.5.5: Target Size - minimum 44x44 pixels
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
        
        // Ensure adequate spacing between touch targets
        const siblings = Array.from(element.parentElement?.children || []);
        const elementIndex = siblings.indexOf(element);
        
        if (elementIndex > 0) {
          const prevSibling = siblings[elementIndex - 1] as HTMLElement;
          const prevRect = prevSibling.getBoundingClientRect();
          const spacing = rect.top - (prevRect.top + prevRect.height);
          
          // Minimum 8px spacing for crisis UX
          expect(spacing).toBeGreaterThanOrEqual(8);
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should support responsive design without horizontal scrolling', async () => {
      // Test various mobile viewports
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone 11
      ];
      
      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, writable: true });
        
        const { container, unmount } = render(<CrisisPage />);
        
        // Check that content doesn't overflow horizontally
        const body = document.body;
        const html = document.documentElement;
        
        const scrollWidth = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth
        );
        
        expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 20); // 20px tolerance
        
        unmount();
      }
    });
  });

  describe('Trauma-Informed UX Accessibility', () => {
    test('should have calming color scheme with proper contrast', async () => {
      const { container } = render(<CrisisPage />);
      
      // Check for trauma-informed color usage
      const backgroundElement = container.querySelector('.bg-gradient-to-br');
      if (backgroundElement) {
        const styles = window.getComputedStyle(backgroundElement);
        const background = styles.background;
        
        // Should use calming colors (blues, purples, soft gradients)
        expect(background).toMatch(/(blue|purple|white)/i);
        expect(background).not.toMatch(/(#ff0000|rgb\(255,\s*0,\s*0\))/); // No pure red except emergency
      }
      
      // Emergency elements can use red but must maintain contrast
      const emergencyElements = container.querySelectorAll('.bg-red-600, .text-red-600');
      for (const element of emergencyElements) {
        const results = await axe(element as HTMLElement, {
          rules: { 'color-contrast': { enabled: true } }
        });
        expect(results).toHaveNoViolations();
      }
    });

    test('should respect reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn(() => ({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });
      
      const { container } = render(<CrisisPage />);
      
      // Check for animation elements
      const animatedElements = container.querySelectorAll('.animate-pulse, .animate-spin, [class*="animate"]');
      
      animatedElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        
        // Should respect reduced motion
        expect(
          styles.animationDuration === '0s' ||
          styles.animationIterationCount === '0' ||
          element.classList.contains('motion-safe:animate-pulse')
        ).toBe(true);
      });
    });

    test('should have supportive and non-triggering language', async () => {
      const { container } = render(<CrisisPage />);
      
      // Check for supportive language patterns
      const textContent = container.textContent || '';
      
      // Should include supportive language
      expect(textContent).toMatch(/(safe|support|here for you|not alone|confidential)/i);
      
      // Should avoid triggering language
      expect(textContent).not.toMatch(/(kill|die|suicide|self-harm)/i);
      
      // Emergency sections can reference crisis terms but should be appropriately labeled
      const emergencySection = container.querySelector('.bg-red-50, .bg-red-600');
      if (emergencySection) {
        expect(emergencySection).toHaveAttribute('aria-label', expect.stringMatching(/emergency|immediate/i));
      }
    });
  });

  describe('Screen Reader Compatibility', () => {
    test('should provide proper ARIA live regions for dynamic content', async () => {
      const { container } = render(<CrisisPage />);
      
      // Find status indicators and dynamic content areas
      const liveRegions = container.querySelectorAll('[aria-live]');
      
      liveRegions.forEach((region) => {
        const ariaLive = region.getAttribute('aria-live');
        const ariaRelevant = region.getAttribute('aria-relevant');
        
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        
        if (ariaRelevant) {
          expect(['additions', 'removals', 'text', 'all']).toContain(ariaRelevant);
        }
      });
      
      // Check for status updates (24/7 availability, connection status)
      const statusIndicators = container.querySelectorAll('.animate-pulse, [data-testid*="status"]');
      statusIndicators.forEach((indicator) => {
        expect(
          indicator.getAttribute('aria-live') ||
          indicator.closest('[aria-live]')
        ).toBeTruthy();
      });
    });

    test('should have proper semantic markup for screen readers', async () => {
      const { container } = render(<CrisisPage />);
      
      // Check for semantic landmarks
      const landmarks = container.querySelectorAll(
        'main, nav, aside, header, footer, section, article, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'
      );
      
      expect(landmarks.length).toBeGreaterThan(0);
      
      // Check for proper list markup
      const lists = container.querySelectorAll('ul, ol, dl');
      lists.forEach((list) => {
        const items = list.querySelectorAll('li, dt, dd');
        expect(items.length).toBeGreaterThan(0);
      });
      
      // Run comprehensive axe check
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide alternative text for images and icons', async () => {
      const { container } = render(<CrisisPage />);
      
      // Check images
      const images = container.querySelectorAll('img');
      images.forEach((img) => {
        expect(
          img.getAttribute('alt') !== null ||
          img.getAttribute('aria-hidden') === 'true' ||
          img.getAttribute('role') === 'presentation'
        ).toBe(true);
      });
      
      // Check icon accessibility (Lucide icons)
      const icons = container.querySelectorAll('svg, [data-lucide]');
      icons.forEach((icon) => {
        expect(
          icon.getAttribute('aria-label') ||
          icon.getAttribute('aria-hidden') === 'true' ||
          icon.getAttribute('role') === 'presentation' ||
          icon.closest('[aria-label]')
        ).toBeTruthy();
      });
    });
  });

  describe('Performance Impact on Accessibility', () => {
    test('should load accessibility features without performance degradation', async () => {
      const startTime = performance.now();
      
      const { container } = render(<CrisisPage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Render time should be under 100ms for crisis scenarios
      expect(renderTime).toBeLessThan(100);
      
      // Check that accessibility attributes don't slow down interactions
      const interactiveElements = container.querySelectorAll('button, [role="button"]');
      
      const interactionStart = performance.now();
      
      interactiveElements.forEach((element) => {
        element.getAttribute('aria-label');
        element.getAttribute('role');
        element.getAttribute('tabindex');
      });
      
      const interactionEnd = performance.now();
      const interactionTime = interactionEnd - interactionStart;
      
      // Accessibility attribute access should be near-instant
      expect(interactionTime).toBeLessThan(10);
    });
  });
});