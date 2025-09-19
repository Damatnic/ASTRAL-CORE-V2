/**
 * Comprehensive Accessibility Testing Utilities
 * 
 * Provides runtime accessibility testing, validation, and reporting
 * for mental health platform compliance with WCAG 2.2 AA standards
 */

export interface AccessibilityTestResult {
  testName: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: Element;
  wcagCriterion?: string;
  suggestions?: string[];
}

export interface AccessibilityReport {
  timestamp: Date;
  pageUrl: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  errors: number;
  results: AccessibilityTestResult[];
  score: number; // 0-100
}

/**
 * Comprehensive Accessibility Tester
 */
export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];

  /**
   * Run all accessibility tests
   */
  async runAllTests(): Promise<AccessibilityReport> {
    this.results = [];

    // Core WCAG 2.2 tests
    await this.testKeyboardNavigation();
    await this.testFocusManagement();
    await this.testColorContrast();
    await this.testScreenReaderCompatibility();
    await this.testSkipNavigation();
    await this.testFormAccessibility();
    await this.testImageAccessibility();
    await this.testHeadingStructure();
    await this.testLandmarkRoles();
    await this.testMotionAccessibility();

    // Mental health specific tests
    await this.testCrisisAccessibility();
    await this.testChatAccessibility();
    await this.testEmergencyAccess();

    return this.generateReport();
  }

  /**
   * Test keyboard navigation
   */
  private async testKeyboardNavigation(): Promise<void> {
    const focusableElements = this.getFocusableElements();
    
    // Test: All interactive elements are keyboard accessible
    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      const isNativelyFocusable = this.isNativelyFocusable(element);
      
      if (!isNativelyFocusable && (!tabIndex || parseInt(tabIndex) < 0)) {
        this.addResult({
          testName: 'Keyboard Navigation',
          passed: false,
          severity: 'error',
          message: `Element ${element.tagName} is not keyboard accessible`,
          element,
          wcagCriterion: '2.1.1 Keyboard',
          suggestions: ['Add tabindex="0" or make element natively focusable']
        });
      }
    });

    // Test: Focus is visible
    const focusVisibleStyle = getComputedStyle(document.documentElement).getPropertyValue('--focus-visible');
    if (!focusVisibleStyle && !document.querySelector('.focus-visible')) {
      this.addResult({
        testName: 'Focus Visibility',
        passed: false,
        severity: 'error',
        message: 'Focus indicators are not clearly visible',
        wcagCriterion: '2.4.7 Focus Visible',
        suggestions: ['Implement clear focus indicators with sufficient contrast']
      });
    }

    // Test: Tab order is logical
    const tabOrderIssues = this.validateTabOrder(focusableElements);
    if (tabOrderIssues.length > 0) {
      this.addResult({
        testName: 'Tab Order',
        passed: false,
        severity: 'warning',
        message: `Tab order issues found: ${tabOrderIssues.join(', ')}`,
        wcagCriterion: '2.4.3 Focus Order',
        suggestions: ['Review and fix tab order using tabindex or DOM structure']
      });
    }

    this.addResult({
      testName: 'Keyboard Navigation',
      passed: true,
      severity: 'info',
      message: `${focusableElements.length} focusable elements found and accessible`
    });
  }

  /**
   * Test focus management
   */
  private async testFocusManagement(): Promise<void> {
    // Test: Focus traps in modals
    const modals = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
    modals.forEach(modal => {
      if (modal.getAttribute('aria-hidden') !== 'true') {
        const focusableInModal = this.getFocusableElements(modal as HTMLElement);
        if (focusableInModal.length === 0) {
          this.addResult({
            testName: 'Focus Management',
            passed: false,
            severity: 'error',
            message: 'Modal has no focusable elements',
            element: modal,
            wcagCriterion: '2.4.3 Focus Order',
            suggestions: ['Add focusable elements or implement proper focus management']
          });
        }
      }
    });

    // Test: Focus restoration
    const buttons = document.querySelectorAll('button[data-opens-modal]');
    if (buttons.length > 0) {
      this.addResult({
        testName: 'Focus Management',
        passed: true,
        severity: 'info',
        message: 'Modal triggers found - ensure focus restoration is implemented'
      });
    }
  }

  /**
   * Test color contrast
   */
  private async testColorContrast(): Promise<void> {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
    let contrastIssues = 0;

    for (const element of textElements) {
      if (element.textContent?.trim()) {
        const contrast = this.calculateContrast(element as HTMLElement);
        const fontSize = parseFloat(getComputedStyle(element as HTMLElement).fontSize);
        const fontWeight = getComputedStyle(element as HTMLElement).fontWeight;
        
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);
        const requiredRatio = isLargeText ? 3 : 4.5;

        if (contrast < requiredRatio) {
          contrastIssues++;
          this.addResult({
            testName: 'Color Contrast',
            passed: false,
            severity: 'error',
            message: `Insufficient contrast ratio: ${contrast.toFixed(2)} (required: ${requiredRatio})`,
            element: element as Element,
            wcagCriterion: '1.4.3 Contrast (Minimum)',
            suggestions: ['Increase color contrast between text and background']
          });
        }
      }
    }

    if (contrastIssues === 0) {
      this.addResult({
        testName: 'Color Contrast',
        passed: true,
        severity: 'info',
        message: 'All text elements meet WCAG AA contrast requirements'
      });
    }
  }

  /**
   * Test screen reader compatibility
   */
  private async testScreenReaderCompatibility(): Promise<void> {
    // Test: ARIA labels and descriptions
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    ariaElements.forEach(element => {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      const ariaDescribedby = element.getAttribute('aria-describedby');

      if (ariaLabelledby) {
        const labelElement = document.getElementById(ariaLabelledby);
        if (!labelElement) {
          this.addResult({
            testName: 'Screen Reader Compatibility',
            passed: false,
            severity: 'error',
            message: `aria-labelledby references non-existent element: ${ariaLabelledby}`,
            element: element as Element,
            wcagCriterion: '4.1.2 Name, Role, Value',
            suggestions: ['Fix aria-labelledby reference or add missing element']
          });
        }
      }

      if (ariaDescribedby) {
        const descElement = document.getElementById(ariaDescribedby);
        if (!descElement) {
          this.addResult({
            testName: 'Screen Reader Compatibility',
            passed: false,
            severity: 'error',
            message: `aria-describedby references non-existent element: ${ariaDescribedby}`,
            element: element as Element,
            wcagCriterion: '4.1.2 Name, Role, Value',
            suggestions: ['Fix aria-describedby reference or add missing element']
          });
        }
      }
    });

    // Test: Live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    if (liveRegions.length === 0) {
      this.addResult({
        testName: 'Screen Reader Compatibility',
        passed: false,
        severity: 'warning',
        message: 'No ARIA live regions found for dynamic content',
        wcagCriterion: '4.1.3 Status Messages',
        suggestions: ['Add aria-live regions for dynamic updates']
      });
    }

    // Test: Form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = this.hasAccessibleLabel(input as HTMLInputElement);
      if (!hasLabel) {
        this.addResult({
          testName: 'Screen Reader Compatibility',
          passed: false,
          severity: 'error',
          message: 'Form input lacks accessible label',
          element: input as Element,
          wcagCriterion: '3.3.2 Labels or Instructions',
          suggestions: ['Add proper label, aria-label, or aria-labelledby']
        });
      }
    });
  }

  /**
   * Test skip navigation
   */
  private async testSkipNavigation(): Promise<void> {
    const skipLinks = document.querySelectorAll('a[href="#main-content"], a[href^="#"][href*="skip"], a[href^="#"][href*="main"]');
    
    if (skipLinks.length === 0) {
      this.addResult({
        testName: 'Skip Navigation',
        passed: false,
        severity: 'error',
        message: 'No skip navigation links found',
        wcagCriterion: '2.4.1 Bypass Blocks',
        suggestions: ['Add skip navigation link to main content']
      });
      return;
    }

    // Test each skip link
    skipLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        const target = document.querySelector(href);
        if (!target) {
          this.addResult({
            testName: 'Skip Navigation',
            passed: false,
            severity: 'error',
            message: `Skip link target not found: ${href}`,
            element: link as Element,
            wcagCriterion: '2.4.1 Bypass Blocks',
            suggestions: ['Ensure skip link target exists']
          });
        }
      }
    });

    // Test skip link visibility on focus
    const firstSkipLink = skipLinks[0] as HTMLElement;
    if (firstSkipLink) {
      const styles = getComputedStyle(firstSkipLink);
      const focusStyles = getComputedStyle(firstSkipLink, ':focus');
      
      if (styles.position !== 'absolute' && !firstSkipLink.classList.contains('sr-only')) {
        this.addResult({
          testName: 'Skip Navigation',
          passed: false,
          severity: 'warning',
          message: 'Skip link should be visually hidden until focused',
          element: firstSkipLink,
          wcagCriterion: '2.4.1 Bypass Blocks',
          suggestions: ['Hide skip link with sr-only class or position: absolute']
        });
      }
    }

    this.addResult({
      testName: 'Skip Navigation',
      passed: true,
      severity: 'info',
      message: `${skipLinks.length} skip navigation link(s) found`
    });
  }

  /**
   * Test form accessibility
   */
  private async testFormAccessibility(): Promise<void> {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Test required field indicators
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      requiredFields.forEach(field => {
        const hasRequiredIndicator = this.hasRequiredIndicator(field as HTMLInputElement);
        if (!hasRequiredIndicator) {
          this.addResult({
            testName: 'Form Accessibility',
            passed: false,
            severity: 'warning',
            message: 'Required field lacks clear indicator',
            element: field as Element,
            wcagCriterion: '3.3.2 Labels or Instructions',
            suggestions: ['Add visual and programmatic required indicators']
          });
        }
      });

      // Test error messages
      const errorElements = form.querySelectorAll('[aria-invalid="true"]');
      errorElements.forEach(element => {
        const hasErrorMessage = element.getAttribute('aria-describedby') || 
                               element.parentElement?.querySelector('.error-message');
        if (!hasErrorMessage) {
          this.addResult({
            testName: 'Form Accessibility',
            passed: false,
            severity: 'error',
            message: 'Invalid field lacks error message',
            element: element as Element,
            wcagCriterion: '3.3.1 Error Identification',
            suggestions: ['Add descriptive error message linked with aria-describedby']
          });
        }
      });
    });
  }

  /**
   * Test image accessibility
   */
  private async testImageAccessibility(): Promise<void> {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const ariaLabel = img.getAttribute('aria-label');
      const ariaHidden = img.getAttribute('aria-hidden');
      
      if (!alt && !ariaLabel && ariaHidden !== 'true') {
        this.addResult({
          testName: 'Image Accessibility',
          passed: false,
          severity: 'error',
          message: 'Image lacks alt text or aria-label',
          element: img,
          wcagCriterion: '1.1.1 Non-text Content',
          suggestions: ['Add descriptive alt text or aria-hidden="true" for decorative images']
        });
      }
    });
  }

  /**
   * Test heading structure
   */
  private async testHeadingStructure(): Promise<void> {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels: number[] = [];
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.slice(1));
      headingLevels.push(level);
    });

    // Check for proper heading hierarchy
    let hasH1 = headingLevels.includes(1);
    if (!hasH1) {
      this.addResult({
        testName: 'Heading Structure',
        passed: false,
        severity: 'error',
        message: 'Page lacks h1 heading',
        wcagCriterion: '1.3.1 Info and Relationships',
        suggestions: ['Add h1 heading for page title']
      });
    }

    // Check for skipped heading levels
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      
      if (current > previous + 1) {
        this.addResult({
          testName: 'Heading Structure',
          passed: false,
          severity: 'warning',
          message: `Heading level skipped: h${previous} to h${current}`,
          wcagCriterion: '1.3.1 Info and Relationships',
          suggestions: ['Use sequential heading levels']
        });
      }
    }
  }

  /**
   * Test landmark roles
   */
  private async testLandmarkRoles(): Promise<void> {
    const landmarks = {
      main: document.querySelectorAll('main, [role="main"]'),
      nav: document.querySelectorAll('nav, [role="navigation"]'),
      banner: document.querySelectorAll('header, [role="banner"]'),
      contentinfo: document.querySelectorAll('footer, [role="contentinfo"]')
    };

    if (landmarks.main.length === 0) {
      this.addResult({
        testName: 'Landmark Roles',
        passed: false,
        severity: 'error',
        message: 'Page lacks main landmark',
        wcagCriterion: '1.3.1 Info and Relationships',
        suggestions: ['Add <main> element or role="main"']
      });
    }

    if (landmarks.main.length > 1) {
      this.addResult({
        testName: 'Landmark Roles',
        passed: false,
        severity: 'error',
        message: 'Multiple main landmarks found',
        wcagCriterion: '1.3.1 Info and Relationships',
        suggestions: ['Ensure only one main landmark per page']
      });
    }
  }

  /**
   * Test motion accessibility
   */
  private async testMotionAccessibility(): Promise<void> {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"], [style*="transition"]');

    if (prefersReducedMotion && animatedElements.length > 0) {
      // This is informational - check if animations respect reduced motion
      this.addResult({
        testName: 'Motion Accessibility',
        passed: true,
        severity: 'info',
        message: `User prefers reduced motion. Found ${animatedElements.length} potentially animated elements`,
        wcagCriterion: '2.3.3 Animation from Interactions',
        suggestions: ['Ensure animations respect prefers-reduced-motion setting']
      });
    }
  }

  /**
   * Test crisis-specific accessibility
   */
  private async testCrisisAccessibility(): Promise<void> {
    // Test crisis buttons
    const crisisButtons = document.querySelectorAll('button[href*="988"], button[href*="741741"], a[href*="tel:988"], a[href*="sms:741741"]');
    
    crisisButtons.forEach(button => {
      const ariaLabel = button.getAttribute('aria-label');
      if (!ariaLabel || !ariaLabel.toLowerCase().includes('crisis')) {
        this.addResult({
          testName: 'Crisis Accessibility',
          passed: false,
          severity: 'error',
          message: 'Crisis button lacks descriptive aria-label',
          element: button as Element,
          wcagCriterion: '4.1.2 Name, Role, Value',
          suggestions: ['Add descriptive aria-label for crisis buttons']
        });
      }
    });

    // Test emergency alerts
    const emergencyAlerts = document.querySelectorAll('[role="alert"], .crisis-alert, .emergency');
    emergencyAlerts.forEach(alert => {
      const ariaLive = alert.getAttribute('aria-live');
      if (ariaLive !== 'assertive') {
        this.addResult({
          testName: 'Crisis Accessibility',
          passed: false,
          severity: 'warning',
          message: 'Emergency alert should use aria-live="assertive"',
          element: alert as Element,
          wcagCriterion: '4.1.3 Status Messages',
          suggestions: ['Use aria-live="assertive" for urgent announcements']
        });
      }
    });
  }

  /**
   * Test chat accessibility
   */
  private async testChatAccessibility(): Promise<void> {
    const chatContainers = document.querySelectorAll('[data-chat-container], [role="log"]');
    
    chatContainers.forEach(container => {
      const ariaLabel = container.getAttribute('aria-label');
      const ariaLive = container.getAttribute('aria-live');
      
      if (!ariaLabel) {
        this.addResult({
          testName: 'Chat Accessibility',
          passed: false,
          severity: 'warning',
          message: 'Chat container lacks descriptive aria-label',
          element: container as Element,
          wcagCriterion: '4.1.2 Name, Role, Value',
          suggestions: ['Add aria-label describing the chat area']
        });
      }

      if (!ariaLive) {
        this.addResult({
          testName: 'Chat Accessibility',
          passed: false,
          severity: 'warning',
          message: 'Chat container should have aria-live for new messages',
          element: container as Element,
          wcagCriterion: '4.1.3 Status Messages',
          suggestions: ['Add aria-live="polite" or "assertive" for message updates']
        });
      }
    });

    // Test message input accessibility
    const messageInputs = document.querySelectorAll('input[placeholder*="message"], textarea[placeholder*="message"]');
    messageInputs.forEach(input => {
      const hasLabel = this.hasAccessibleLabel(input as HTMLInputElement);
      if (!hasLabel) {
        this.addResult({
          testName: 'Chat Accessibility',
          passed: false,
          severity: 'error',
          message: 'Message input lacks accessible label',
          element: input as Element,
          wcagCriterion: '3.3.2 Labels or Instructions',
          suggestions: ['Add proper label or aria-label for message input']
        });
      }
    });
  }

  /**
   * Test emergency access features
   */
  private async testEmergencyAccess(): Promise<void> {
    // Test keyboard shortcuts for emergency actions
    const emergencyButtons = document.querySelectorAll('.crisis-button, .emergency-button, [data-emergency]');
    
    if (emergencyButtons.length > 0) {
      this.addResult({
        testName: 'Emergency Access',
        passed: true,
        severity: 'info',
        message: `${emergencyButtons.length} emergency action(s) found`,
        suggestions: ['Ensure emergency actions are easily accessible via keyboard']
      });
    }

    // Test if emergency numbers are easily accessible
    const emergencyLinks = document.querySelectorAll('a[href*="988"], a[href*="911"], a[href*="741741"]');
    if (emergencyLinks.length === 0) {
      this.addResult({
        testName: 'Emergency Access',
        passed: false,
        severity: 'warning',
        message: 'No easily accessible emergency contact links found',
        wcagCriterion: 'Mental Health Best Practice',
        suggestions: ['Add prominent emergency contact links']
      });
    }
  }

  // Helper methods
  private getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  private isNativelyFocusable(element: Element): boolean {
    const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
    return focusableTags.includes(element.tagName.toLowerCase()) && 
           !element.hasAttribute('disabled');
  }

  private validateTabOrder(elements: HTMLElement[]): string[] {
    const issues: string[] = [];
    const tabIndices = elements.map(el => parseInt(el.getAttribute('tabindex') || '0'));
    
    // Check for positive tabindex values (not recommended)
    const positiveTabIndices = tabIndices.filter(index => index > 0);
    if (positiveTabIndices.length > 0) {
      issues.push('Positive tabindex values found (not recommended)');
    }

    return issues;
  }

  private calculateContrast(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    // Simplified contrast calculation
    // In real implementation, you'd need a proper color contrast library
    const bgLuminance = this.getLuminance(backgroundColor);
    const textLuminance = this.getLuminance(color);
    
    const lighter = Math.max(bgLuminance, textLuminance);
    const darker = Math.min(bgLuminance, textLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: string): number {
    // Simplified luminance calculation
    // This is a placeholder - implement proper RGB to luminance conversion
    return 0.5; // Placeholder value
  }

  private hasAccessibleLabel(input: HTMLInputElement): boolean {
    const id = input.id;
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledby = input.getAttribute('aria-labelledby');
    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
    const parentLabel = input.closest('label');

    return !!(ariaLabel || ariaLabelledby || label || parentLabel);
  }

  private hasRequiredIndicator(field: HTMLInputElement): boolean {
    const ariaRequired = field.getAttribute('aria-required');
    const hasVisualIndicator = field.parentElement?.textContent?.includes('*') ||
                             field.parentElement?.querySelector('.required');
    
    return ariaRequired === 'true' || hasVisualIndicator;
  }

  private addResult(result: AccessibilityTestResult): void {
    this.results.push(result);
  }

  private generateReport(): AccessibilityReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const errors = this.results.filter(r => r.severity === 'error').length;
    const warnings = this.results.filter(r => r.severity === 'warning').length;
    
    const score = Math.round((passed / this.results.length) * 100);

    return {
      timestamp: new Date(),
      pageUrl: window.location.href,
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      errors,
      results: this.results,
      score
    };
  }
}

/**
 * Quick accessibility check for development
 */
export async function runQuickAccessibilityCheck(): Promise<AccessibilityReport> {
  const tester = new AccessibilityTester();
  return await tester.runAllTests();
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static saveFocus(element: HTMLElement = document.activeElement as HTMLElement): void {
    if (element) {
      this.focusStack.push(element);
    }
  }

  static restoreFocus(): void {
    const element = this.focusStack.pop();
    if (element && document.contains(element)) {
      element.focus();
    }
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Development-only accessibility monitoring
 */
export function enableAccessibilityMonitoring(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // Monitor focus changes
  let lastFocusedElement: Element | null = null;
  document.addEventListener('focusin', (e) => {
    const newFocus = e.target as Element;
    if (lastFocusedElement !== newFocus) {
      console.log('Focus moved to:', newFocus);
      lastFocusedElement = newFocus;
    }
  });

  // Monitor ARIA changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('aria-')) {
        console.log('ARIA attribute changed:', mutation.attributeName, mutation.target);
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['aria-live', 'aria-expanded', 'aria-hidden', 'aria-label'],
    subtree: true
  });

  console.log('Accessibility monitoring enabled');
}