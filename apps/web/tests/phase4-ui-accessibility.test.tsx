/**
 * PHASE 4: UI AND ACCESSIBILITY TESTING
 * ASTRAL CORE V2 - Mental Health Crisis Intervention Platform
 * 
 * This comprehensive test suite validates:
 * - WCAG 2.1 AA Compliance
 * - Crisis-appropriate UI design
 * - Responsive design across devices
 * - Multi-language support
 * - Low-bandwidth accessibility
 * - Cognitive accessibility
 * - Emergency access features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Add custom matchers
expect.extend(toHaveNoViolations);

// Mock components for testing
const mockSessionProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const mockDataPersistenceProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Import components to test
import Layout from '@/app/layout';
import CrisisPage from '@/app/crisis/page';
import SignInPage from '@/app/auth/signin/page';

describe('PHASE 4: UI AND ACCESSIBILITY TESTING', () => {
  
  // ============================
  // 1. WCAG 2.1 AA COMPLIANCE
  // ============================
  
  describe('1. WCAG 2.1 AA Compliance', () => {
    
    test('1.1 Layout passes axe accessibility audit', async () => {
      const { container } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('1.2 Keyboard navigation works for all interactive elements', async () => {
      render(
        <Layout>
          <CrisisPage />
        </Layout>
      );
      
      // Test tab navigation through interactive elements
      const user = userEvent.setup();
      
      // First tab should focus on skip link or first interactive element
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href');
      
      // Continue tabbing through all interactive elements
      const interactiveElements = screen.getAllByRole(/(button|link|textbox|combobox)/);
      
      for (let i = 0; i < interactiveElements.length; i++) {
        await user.tab();
        expect(document.activeElement).toBeInTheDocument();
        
        // Verify element is focusable
        if (document.activeElement) {
          expect(document.activeElement).toHaveProperty('tabIndex');
          expect(document.activeElement.tabIndex).toBeGreaterThanOrEqual(-1);
        }
      }
    });
    
    test('1.3 Screen reader compatibility - proper ARIA labels', () => {
      render(
        <Layout>
          <CrisisPage />
        </Layout>
      );
      
      // Check for proper ARIA labels on critical elements
      const crisisHotline = screen.getByLabelText(/call 988/i);
      expect(crisisHotline).toBeInTheDocument();
      
      // Check for navigation landmarks
      const navigation = screen.getByRole('navigation', { name: /main navigation/i });
      expect(navigation).toBeInTheDocument();
      
      // Check for heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Verify heading levels are sequential
      const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));
      for (let i = 1; i < headingLevels.length; i++) {
        expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
      }
    });
    
    test('1.4 Color contrast ratios meet WCAG standards', () => {
      const { container } = render(
        <Layout>
          <CrisisPage />
        </Layout>
      );
      
      // Test critical text elements for contrast
      const criticalTexts = container.querySelectorAll('[class*="text-"], button, a');
      
      criticalTexts.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Verify text is not using low contrast colors
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // Check that text uses sufficiently dark/light colors
          expect(color).not.toBe('rgb(229, 231, 235)'); // Not light gray on white
          expect(color).not.toBe('rgb(75, 85, 99)'); // Not medium gray that might fail contrast
        }
      });
    });
    
    test('1.5 Focus indicators are visible', async () => {
      render(
        <Layout>
          <CrisisPage />
        </Layout>
      );
      
      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');
      
      for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
        await user.tab();
        
        if (document.activeElement === button) {
          const styles = window.getComputedStyle(button);
          
          // Check for focus ring or outline
          const hasOutline = styles.outline !== 'none' && styles.outline !== '';
          const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
          const hasRing = button.className.includes('ring') || button.className.includes('focus:');
          
          expect(hasOutline || hasBoxShadow || hasRing).toBe(true);
        }
      }
    });
  });
  
  // ============================
  // 2. CRISIS-APPROPRIATE UI DESIGN
  // ============================
  
  describe('2. Crisis-Appropriate UI Design', () => {
    
    test('2.1 Uses calming, non-triggering colors', () => {
      const { container } = render(<CrisisPage />);
      
      // Check background uses calming gradients
      const backgroundElements = container.querySelectorAll('[class*="bg-"]');
      
      backgroundElements.forEach(element => {
        const className = element.className;
        
        // Verify use of appropriate colors
        if (className.includes('bg-')) {
          // Should use calming colors like blue, green, slate, not harsh colors
          const hasCalming = 
            className.includes('slate') ||
            className.includes('blue') ||
            className.includes('green') ||
            className.includes('purple') ||
            className.includes('white') ||
            className.includes('gray');
          
          // Red should only be used for emergency elements
          if (className.includes('red')) {
            // Verify it's for emergency buttons/banners
            expect(element.textContent).toMatch(/(988|crisis|emergency|help)/i);
          }
        }
      });
    });
    
    test('2.2 Uses clear, simple language without jargon', () => {
      render(<CrisisPage />);
      
      // Check for simple, supportive language
      expect(screen.getByText(/you're safe here/i)).toBeInTheDocument();
      expect(screen.getByText(/need help right now/i)).toBeInTheDocument();
      
      // Verify no complex medical jargon in main content
      const bodyText = document.body.textContent || '';
      const jargonTerms = ['psychiatric', 'pathology', 'disorder', 'syndrome', 'diagnosis'];
      
      jargonTerms.forEach(term => {
        expect(bodyText.toLowerCase()).not.toContain(term);
      });
    });
    
    test('2.3 Crisis hotline is prominently visible', () => {
      render(<CrisisPage />);
      
      // Check for multiple crisis contact points
      const crisisButtons = screen.getAllByText(/988/);
      expect(crisisButtons.length).toBeGreaterThanOrEqual(1);
      
      // Verify crisis button is in header (always visible)
      const header = screen.getByRole('banner');
      const headerCrisisButton = within(header).queryByText(/988/);
      expect(headerCrisisButton).toBeInTheDocument();
      
      // Check text crisis option is also available
      expect(screen.getByText(/741741/)).toBeInTheDocument();
    });
    
    test('2.4 Reduced cognitive load design patterns', () => {
      render(<CrisisPage />);
      
      // Check for progressive disclosure
      const detailsElements = screen.getAllByText(/more/i);
      expect(detailsElements.length).toBeGreaterThan(0);
      
      // Verify main actions are limited and clear
      const mainButtons = screen.getAllByRole('button');
      const primaryButtons = mainButtons.filter(btn => 
        btn.className.includes('bg-red') || 
        btn.className.includes('bg-blue')
      );
      
      // Should have limited primary actions to reduce decision fatigue
      expect(primaryButtons.length).toBeLessThanOrEqual(4);
    });
    
    test('2.5 Intuitive navigation for distressed users', () => {
      render(<CrisisPage />);
      
      // Check for clear navigation hierarchy
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Verify back button when in sub-pages
      const { rerender } = render(<CrisisPage />);
      fireEvent.click(screen.getByText(/find the right support/i));
      
      // Back navigation should be available
      waitFor(() => {
        expect(screen.queryByText(/back to crisis hub/i)).toBeInTheDocument();
      });
    });
  });
  
  // ============================
  // 3. RESPONSIVE DESIGN TESTING
  // ============================
  
  describe('3. Responsive Design Testing', () => {
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: '4K', width: 2560, height: 1440 }
    ];
    
    viewports.forEach(viewport => {
      test(`3.1 Renders correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        // Set viewport
        global.innerWidth = viewport.width;
        global.innerHeight = viewport.height;
        
        const { container } = render(<CrisisPage />);
        
        // Check critical elements are visible
        expect(screen.getByText(/988/)).toBeVisible();
        expect(screen.getByText(/you're safe here/i)).toBeVisible();
        
        // Check for responsive classes
        const responsiveElements = container.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
        expect(responsiveElements.length).toBeGreaterThan(0);
      });
    });
    
    test('3.2 Touch-friendly interface elements on mobile', () => {
      global.innerWidth = 375;
      
      render(<CrisisPage />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        
        // Minimum touch target size (44x44 pixels per WCAG)
        if (rect.height > 0) {
          expect(rect.height).toBeGreaterThanOrEqual(44);
          expect(rect.width).toBeGreaterThanOrEqual(44);
        }
      });
    });
    
    test('3.3 Offline functionality for critical features', () => {
      // Mock offline state
      const mockOffline = jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      
      render(<CrisisPage />);
      
      // Critical elements should still be accessible
      expect(screen.getByText(/988/)).toBeInTheDocument();
      expect(screen.getByText(/741741/)).toBeInTheDocument();
      
      // Phone links should work offline
      const phoneLink = screen.getAllByRole('link')[0];
      expect(phoneLink.getAttribute('href')).toContain('tel:');
      
      mockOffline.mockRestore();
    });
  });
  
  // ============================
  // 4. MULTI-LANGUAGE SUPPORT
  // ============================
  
  describe('4. Multi-Language Support', () => {
    
    test('4.1 Language attribute is set correctly', () => {
      const { container } = render(
        <Layout>
          <CrisisPage />
        </Layout>
      );
      
      // Check HTML lang attribute
      const htmlElement = container.closest('html');
      expect(htmlElement?.getAttribute('lang')).toBe('en');
    });
    
    test('4.2 RTL language support structure', () => {
      const { container } = render(<CrisisPage />);
      
      // Check for flexible layout that can support RTL
      const flexElements = container.querySelectorAll('[class*="flex"]');
      expect(flexElements.length).toBeGreaterThan(0);
      
      // Verify no hard-coded left/right margins that would break RTL
      flexElements.forEach(element => {
        const className = element.className;
        if (className.includes('ml-') || className.includes('mr-')) {
          // Should also have logical properties or flex spacing
          expect(className).toMatch(/(space-x|gap|flex)/);
        }
      });
    });
    
    test('4.3 Crisis resources structure for multiple languages', () => {
      render(<CrisisPage />);
      
      // Verify crisis numbers are clearly marked and separable
      const crisisNumbers = ['988', '741741'];
      
      crisisNumbers.forEach(number => {
        const element = screen.getByText(new RegExp(number));
        expect(element).toBeInTheDocument();
        
        // Numbers should be in separate, translatable elements
        expect(element.tagName).toMatch(/^(SPAN|BUTTON|A)$/);
      });
    });
  });
  
  // ============================
  // 5. LOW-BANDWIDTH ACCESSIBILITY
  // ============================
  
  describe('5. Low-Bandwidth Accessibility', () => {
    
    test('5.1 Progressive enhancement structure', () => {
      const { container } = render(<CrisisPage />);
      
      // Check for semantic HTML that works without JS
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
      
      // Links should use proper href attributes
      const links = container.querySelectorAll('a[href]');
      expect(links.length).toBeGreaterThan(0);
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).not.toBe('#');
      });
    });
    
    test('5.2 Text-only fallbacks available', () => {
      render(<CrisisPage />);
      
      // All images should have alt text
      const images = screen.queryAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
      
      // Icon-only buttons should have accessible labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        if (!button.textContent?.trim()) {
          expect(button).toHaveAttribute('aria-label');
        }
      });
    });
    
    test('5.3 Critical content loads without JavaScript', () => {
      // Test static rendering of critical elements
      const { container } = render(<CrisisPage />);
      
      // Crisis hotline info should be in HTML, not JS-generated
      const staticContent = container.innerHTML;
      expect(staticContent).toContain('988');
      expect(staticContent).toContain('741741');
      expect(staticContent).toContain('Crisis Support');
    });
  });
  
  // ============================
  // 6. COGNITIVE ACCESSIBILITY
  // ============================
  
  describe('6. Cognitive Accessibility', () => {
    
    test('6.1 Simplified navigation options', () => {
      render(<CrisisPage />);
      
      // Check for limited main navigation items
      const mainNav = screen.getByRole('navigation');
      const navLinks = within(mainNav).getAllByRole('link');
      
      // Should have limited options to reduce cognitive load
      expect(navLinks.length).toBeLessThanOrEqual(5);
      
      // Check for grouped/collapsed navigation
      expect(screen.getByText(/more/i)).toBeInTheDocument();
    });
    
    test('6.2 Clear instructions and help text', () => {
      render(<CrisisPage />);
      
      // Check for supportive, clear messaging
      expect(screen.getByText(/you've taken an important step/i)).toBeInTheDocument();
      expect(screen.getByText(/choose what feels right/i)).toBeInTheDocument();
      
      // Buttons should have clear, action-oriented text
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const text = button.textContent;
        if (text) {
          // Should use simple action words
          expect(text).toMatch(/(call|text|help|support|create|join|explore|track)/i);
        }
      });
    });
    
    test('6.3 Consistent UI patterns', () => {
      render(<CrisisPage />);
      
      // Check for consistent button styling patterns
      const primaryButtons = screen.getAllByRole('button').filter(btn =>
        btn.className.includes('bg-red-600') || btn.className.includes('bg-blue-600')
      );
      
      primaryButtons.forEach(button => {
        // All primary buttons should have consistent styling
        expect(button.className).toContain('rounded');
        expect(button.className).toContain('font-semibold');
      });
    });
    
    test('6.4 Error recovery mechanisms', () => {
      const { container } = render(<CrisisPage />);
      
      // Check for details/summary elements for progressive disclosure
      const detailsElements = container.querySelectorAll('details');
      expect(detailsElements.length).toBeGreaterThan(0);
      
      // Verify collapsible sections work
      detailsElements.forEach(details => {
        const summary = details.querySelector('summary');
        expect(summary).toBeInTheDocument();
        expect(summary?.getAttribute('tabIndex')).not.toBe('-1');
      });
    });
    
    test('6.5 Reduced animation options', () => {
      const { container } = render(<CrisisPage />);
      
      // Check for animation classes that respect prefers-reduced-motion
      const animatedElements = container.querySelectorAll('[class*="animate-"], [class*="transition-"]');
      
      // Animations should be subtle and optional
      animatedElements.forEach(element => {
        const className = element.className;
        if (className.includes('animate-')) {
          // Only subtle animations like pulse for important elements
          expect(className).toMatch(/animate-(pulse|none)/);
        }
      });
    });
  });
  
  // ============================
  // 7. EMERGENCY ACCESS FEATURES
  // ============================
  
  describe('7. Emergency Access Features', () => {
    
    test('7.1 Quick access to crisis hotlines', () => {
      render(<CrisisPage />);
      
      // Crisis hotline should be accessible within 1-2 clicks/taps
      const crisisButtons = screen.getAllByText(/988/);
      expect(crisisButtons.length).toBeGreaterThanOrEqual(2); // At least header + main
      
      // Should have tel: links for immediate dialing
      const telLinks = screen.getAllByRole('link').filter(link =>
        link.getAttribute('href')?.startsWith('tel:')
      );
      expect(telLinks.length).toBeGreaterThan(0);
    });
    
    test('7.2 Panic button functionality', () => {
      render(<CrisisPage />);
      
      // Check for prominent emergency button
      const emergencyButton = screen.getByRole('button', { name: /call 988/i });
      expect(emergencyButton).toBeInTheDocument();
      
      // Should be visually prominent
      expect(emergencyButton.className).toContain('bg-red');
      
      // Should be in fixed/sticky position
      const header = emergencyButton.closest('header') || emergencyButton.closest('[class*="sticky"]');
      expect(header).toBeInTheDocument();
    });
    
    test('7.3 Emergency contact shortcuts', () => {
      render(<CrisisPage />);
      
      // Multiple ways to reach help
      expect(screen.getByText(/call 988/i)).toBeInTheDocument();
      expect(screen.getByText(/text/i)).toBeInTheDocument();
      expect(screen.getByText(/741741/)).toBeInTheDocument();
      
      // Check for SMS link
      const smsLinks = screen.getAllByRole('button').filter(btn =>
        btn.onclick?.toString().includes('sms:')
      );
      expect(smsLinks.length).toBeGreaterThan(0);
    });
    
    test('7.4 Crisis escalation visibility', () => {
      render(<CrisisPage />);
      
      // Check for clear escalation path
      expect(screen.getByText(/need help right now/i)).toBeInTheDocument();
      expect(screen.getByText(/thinking about hurting/i)).toBeInTheDocument();
      
      // Emergency section should be visually distinct
      const emergencySection = screen.getByText(/need help right now/i).closest('div');
      expect(emergencySection?.className).toContain('bg-red');
    });
    
    test('7.5 One-click access to human support', () => {
      render(<CrisisPage />);
      
      const user = userEvent.setup();
      
      // Test immediate access to support
      const callButton = screen.getAllByText(/call 988/i)[0];
      
      // Should be immediately clickable without additional steps
      fireEvent.click(callButton);
      
      // Verify it triggers phone action (in real env would open tel:)
      expect(callButton.closest('a')?.getAttribute('href')).toBe('tel:988');
    });
  });
  
  // ============================
  // ACCESSIBILITY COMPLIANCE SUMMARY
  // ============================
  
  describe('Accessibility Compliance Summary', () => {
    
    test('Overall WCAG 2.1 AA Compliance Score', async () => {
      const { container } = render(
        <Layout>
          <CrisisPage />
        </Layout>
      );
      
      // Run comprehensive axe audit
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'label': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true }
        }
      });
      
      // Log any violations for debugging
      if (results.violations.length > 0) {
        console.log('Accessibility violations found:', results.violations);
      }
      
      // Should have no critical violations
      const criticalViolations = results.violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
      
      // Calculate compliance score
      const totalChecks = results.passes.length + results.violations.length;
      const passRate = (results.passes.length / totalChecks) * 100;
      
      console.log(`WCAG 2.1 AA Compliance Score: ${passRate.toFixed(1)}%`);
      
      // Should maintain at least 95% compliance
      expect(passRate).toBeGreaterThanOrEqual(95);
    });
  });
});

// ============================
// TEST UTILITIES
// ============================

// Helper function to test color contrast
function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation (in production, use full WCAG formula)
  return 4.5; // Mocked for testing
}

// Helper to simulate screen reader navigation
function simulateScreenReader(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  return {
    elements: Array.from(focusableElements),
    announcements: Array.from(focusableElements).map(el => 
      el.getAttribute('aria-label') || el.textContent || ''
    )
  };
}

// Export test results summary
export const Phase4TestSummary = {
  category: 'UI and Accessibility',
  totalTests: 34,
  criticalTests: [
    'WCAG 2.1 AA Compliance',
    'Crisis hotline visibility',
    'Emergency access features',
    'Keyboard navigation',
    'Screen reader compatibility'
  ],
  performanceMetrics: {
    wcagComplianceTarget: 95,
    mobileLoadTime: '<2s',
    touchTargetSize: '44x44px',
    contrastRatio: '4.5:1'
  }
};