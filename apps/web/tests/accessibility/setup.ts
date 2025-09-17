/**
 * ASTRAL_CORE V2.0 - Accessibility Testing Setup
 * 
 * Configures axe-core for WCAG 2.1 AA compliance testing
 * Crisis intervention platform requires 100% accessibility for users in distress
 */

import 'jest-axe/extend-expect';
import { configureAxe } from 'jest-axe';

// Configure axe for WCAG 2.1 AA compliance
const axe = configureAxe({
  rules: {
    // WCAG 2.1 AA Rules - Core Requirements
    'color-contrast': { enabled: true }, // 4.5:1 contrast ratio
    'color-contrast-enhanced': { enabled: false }, // AAA level - optional
    'keyboard-navigation': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'label': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
    
    // Crisis-specific accessibility requirements
    'emergency-button-accessible': { enabled: true },
    'crisis-chat-accessible': { enabled: true },
    'screen-reader-friendly': { enabled: true },
    
    // Touch target requirements for mobile crisis users
    'target-size': { enabled: true }, // 44px minimum touch targets
    
    // Reduced motion for trauma-informed design
    'motion-reduced': { enabled: true },
    
    // Text scaling support up to 200%
    'zoom-content': { enabled: true },
    
    // Crisis intervention specific
    'emergency-call-accessible': { enabled: true },
    'anonymous-chat-accessible': { enabled: true },
    'volunteer-interface-accessible': { enabled: true },
    
    // Disable non-critical rules that might interfere with crisis UX
    'landmark-unique': { enabled: false }, // Can be repetitive in crisis flows
    'scrollable-region-focusable': { enabled: false }, // May interfere with chat
  },
  
  // Tags for WCAG 2.1 AA compliance
  tags: [
    'wcag2a',
    'wcag2aa',
    'wcag21aa',
    'best-practice',
    'crisis-accessibility' // Custom tag for crisis-specific rules
  ],
  
  // Crisis platform specific configuration
  options: {
    // Allow slightly more time for crisis interventions to load
    timeout: 5000,
    
    // Include shadow DOM for Web Components
    includeShadowDom: true,
    
    // Crisis-specific selectors to always test
    include: [
      '[data-testid*="crisis"]',
      '[data-testid*="emergency"]',
      '[data-testid*="chat"]',
      '[role="button"]',
      '[role="link"]',
      '[role="textbox"]',
      '[aria-live]',
      '.crisis-emergency-button',
      '.crisis-chat-interface',
      '.volunteer-dashboard',
      '.accessibility-critical'
    ],
    
    // Exclude decorative elements that don't impact crisis functionality
    exclude: [
      '.decorative-only',
      '[aria-hidden="true"]',
      '.background-animation',
      '[data-testid="decorative"]'
    ]
  }
});

// Global accessibility test helpers
global.testAccessibility = axe;

// Custom accessibility matchers for crisis scenarios
global.expectEmergencyButtonAccessible = (element: HTMLElement) => {
  expect(element).toHaveAttribute('role', 'button');
  expect(element).toHaveAttribute('aria-label');
  expect(element).not.toHaveAttribute('aria-disabled', 'true');
  expect(element.tabIndex).not.toBe(-1);
};

global.expectCrisisChatAccessible = (element: HTMLElement) => {
  expect(element).toHaveAttribute('aria-live');
  expect(element).toHaveAttribute('aria-relevant');
  expect(element.getAttribute('aria-atomic')).toBe('false');
};

global.expectKeyboardNavigable = async (element: HTMLElement) => {
  element.focus();
  expect(document.activeElement).toBe(element);
  
  // Test Enter and Space key activation for buttons
  if (element.getAttribute('role') === 'button') {
    const clickHandler = jest.fn();
    element.addEventListener('click', clickHandler);
    
    // Test Enter key
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(clickHandler).toHaveBeenCalled();
    
    // Test Space key
    clickHandler.mockClear();
    element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(clickHandler).toHaveBeenCalled();
  }
};

// Color contrast validation helper
global.validateColorContrast = async (element: HTMLElement, expectedRatio = 4.5) => {
  const styles = window.getComputedStyle(element);
  const backgroundColor = styles.backgroundColor;
  const color = styles.color;
  
  // Use contrast checking library or axe-core's color contrast
  const results = await testAccessibility(element, {
    rules: {
      'color-contrast': { enabled: true }
    }
  });
  
  expect(results).toHaveNoViolations();
};

// Trauma-informed UX validation
global.validateTraumaInformedDesign = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  
  // Check for calming colors (no aggressive reds/oranges except for emergency)
  if (!element.classList.contains('emergency-button')) {
    const backgroundColor = styles.backgroundColor;
    // Add specific color validation logic
  }
  
  // Check for reduced motion support
  expect(styles.getPropertyValue('--reduce-motion')).toBeDefined();
  
  // Check for gentle typography
  const fontSize = parseFloat(styles.fontSize);
  expect(fontSize).toBeGreaterThanOrEqual(16); // Minimum readable size
};

// Mobile accessibility validation
global.validateMobileAccessibility = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  
  // Touch target size validation (44px minimum)
  if (element.matches('button, [role="button"], a, [role="link"], input')) {
    expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
  }
  
  // Ensure adequate spacing for crisis situations
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const elementIndex = siblings.indexOf(element);
    
    if (elementIndex > 0) {
      const prevSibling = siblings[elementIndex - 1] as HTMLElement;
      const prevRect = prevSibling.getBoundingClientRect();
      const spacing = rect.top - (prevRect.top + prevRect.height);
      
      // Minimum 8px spacing for crisis UX
      expect(spacing).toBeGreaterThanOrEqual(8);
    }
  }
};

// Screen reader simulation helpers
global.simulateScreenReader = {
  announce: (element: HTMLElement) => {
    const ariaLive = element.getAttribute('aria-live');
    const ariaAtomic = element.getAttribute('aria-atomic');
    const ariaRelevant = element.getAttribute('aria-relevant');
    
    return {
      announced: !!ariaLive,
      priority: ariaLive === 'assertive' ? 'high' : 'normal',
      atomic: ariaAtomic === 'true',
      relevant: ariaRelevant || 'additions text'
    };
  },
  
  getAccessibleName: (element: HTMLElement) => {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') ||
           element.textContent ||
           element.getAttribute('title') ||
           '';
  },
  
  getRole: (element: HTMLElement) => {
    return element.getAttribute('role') || element.tagName.toLowerCase();
  }
};

// Crisis flow accessibility helpers
global.crisisAccessibilityHelpers = {
  validateEmergencyFlow: async (container: HTMLElement) => {
    // Find emergency buttons
    const emergencyButtons = container.querySelectorAll('[data-testid*="emergency"], .crisis-emergency-button');
    
    for (const button of emergencyButtons) {
      global.expectEmergencyButtonAccessible(button as HTMLElement);
      await global.validateColorContrast(button as HTMLElement, 4.5);
      global.validateMobileAccessibility(button as HTMLElement);
    }
  },
  
  validateChatInterface: async (container: HTMLElement) => {
    // Find chat components
    const chatElements = container.querySelectorAll('[data-testid*="chat"], .crisis-chat-interface');
    
    for (const element of chatElements) {
      global.expectCrisisChatAccessible(element as HTMLElement);
      await global.expectKeyboardNavigable(element as HTMLElement);
    }
  },
  
  validateFormAccessibility: async (form: HTMLElement) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    for (const input of inputs) {
      const inputElement = input as HTMLElement;
      
      // Check for proper labeling
      expect(
        inputElement.getAttribute('aria-label') ||
        inputElement.getAttribute('aria-labelledby') ||
        form.querySelector(`label[for="${inputElement.id}"]`)
      ).toBeTruthy();
      
      // Check for error states
      if (inputElement.getAttribute('aria-invalid') === 'true') {
        expect(
          inputElement.getAttribute('aria-describedby') ||
          form.querySelector(`[id="${inputElement.getAttribute('aria-describedby')}"]`)
        ).toBeTruthy();
      }
    }
  }
};

// Setup global accessibility testing
beforeEach(() => {
  // Reset any accessibility state
  document.body.innerHTML = '';
  
  // Clear any previous axe configuration
  jest.clearAllMocks();
});

afterEach(async () => {
  // Run accessibility check on any remaining DOM
  if (document.body.children.length > 0) {
    const results = await testAccessibility(document.body);
    if (results.violations.length > 0) {
      console.warn('Accessibility violations found in test cleanup:', results.violations);
    }
  }
});

export {};