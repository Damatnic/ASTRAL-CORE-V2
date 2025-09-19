/**
 * Comprehensive Accessibility Tests
 * WCAG 2.2 AA Compliance for Mental Health Platform
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Import components and pages
import HomePage from '@/app/page';
import CrisisPage from '@/app/crisis/page';
import AITherapyChat from '@/components/ai-therapy/AITherapyChat';
import MoodTracker from '@/components/mood/MoodTracker';
import Navigation from '@/components/navigation/Navigation';
import SafetyPlan from '@/components/crisis/SafetyPlan';

// Accessibility testing utilities
class AccessibilityTester {
  static async checkWCAGCompliance(container: HTMLElement) {
    const results = await axe(container, {
      rules: {
        // WCAG 2.2 AA rules
        'color-contrast': { enabled: true },
        'valid-lang': { enabled: true },
        'bypass': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
        'button-name': { enabled: true },
        'image-alt': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'aria-allowed-attr': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-required-parent': { enabled: true }
      }
    });
    return results;
  }

  static checkColorContrast(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const color = style.color;
    
    // Convert RGB to relative luminance
    const getLuminance = (rgb: string) => {
      const values = rgb.match(/\d+/g);
      if (!values) return 0;
      
      const [r, g, b] = values.map(Number);
      const [rs, gs, bs] = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const bgLuminance = getLuminance(backgroundColor);
    const textLuminance = getLuminance(color);
    
    const ratio = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                  (Math.min(bgLuminance, textLuminance) + 0.05);
    
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    const fontSize = parseFloat(style.fontSize);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && style.fontWeight === 'bold');
    
    return ratio >= (isLargeText ? 3 : 4.5);
  }

  static checkFocusIndicator(element: HTMLElement): boolean {
    element.focus();
    const focusedStyle = window.getComputedStyle(element);
    
    // Check for visible focus indicator
    const hasOutline = focusedStyle.outlineWidth !== '0px' && 
                      focusedStyle.outlineStyle !== 'none';
    const hasBorder = focusedStyle.borderWidth !== '0px';
    const hasBoxShadow = focusedStyle.boxShadow !== 'none';
    
    return hasOutline || hasBorder || hasBoxShadow;
  }

  static async testKeyboardNavigation(container: HTMLElement) {
    const interactiveElements = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues = [];
    interactiveElements.forEach((element: any) => {
      // Check if element is reachable via keyboard
      if (!element.tabIndex || element.tabIndex < 0) {
        if (!element.disabled && !element.getAttribute('aria-hidden')) {
          issues.push(`Element not keyboard accessible: ${element.outerHTML.substring(0, 50)}`);
        }
      }
      
      // Check for keyboard traps
      const onKeyDown = element.onkeydown;
      if (onKeyDown && onKeyDown.toString().includes('preventDefault') && 
          !onKeyDown.toString().includes('Escape')) {
        issues.push(`Potential keyboard trap: ${element.outerHTML.substring(0, 50)}`);
      }
    });
    
    return issues;
  }
}

describe('WCAG 2.2 AA Compliance Tests', () => {
  describe('Perceivable - Guideline 1', () => {
    describe('1.1 Text Alternatives', () => {
      it('should provide alt text for all informative images', () => {
        const { container } = render(<HomePage />);
        const images = container.querySelectorAll('img');
        
        images.forEach(img => {
          const isDecorative = img.getAttribute('role') === 'presentation' || 
                              img.getAttribute('aria-hidden') === 'true';
          
          if (!isDecorative) {
            expect(img).toHaveAttribute('alt');
            expect(img.getAttribute('alt')).not.toBe('');
          }
        });
      });

      it('should provide text alternatives for complex graphics', () => {
        const { container } = render(<MoodTracker userId="test-user" />);
        const charts = container.querySelectorAll('[role="img"], svg[aria-label]');
        
        charts.forEach(chart => {
          const hasLabel = chart.getAttribute('aria-label') || 
                          chart.getAttribute('aria-describedby');
          expect(hasLabel).toBeTruthy();
        });
      });

      it('should provide captions for video content', () => {
        const { container } = render(<AITherapyChat userId="test-user" />);
        const videos = container.querySelectorAll('video');
        
        videos.forEach(video => {
          const track = video.querySelector('track[kind="captions"]');
          expect(track).toBeTruthy();
        });
      });
    });

    describe('1.3 Adaptable Content', () => {
      it('should have proper semantic structure', () => {
        const { container } = render(<CrisisPage />);
        
        // Check heading hierarchy
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        
        headings.forEach(heading => {
          const level = parseInt(heading.tagName[1]);
          expect(level - lastLevel).toBeLessThanOrEqual(1); // No skipped levels
          lastLevel = level;
        });
        
        // Check for landmarks
        expect(container.querySelector('main')).toBeTruthy();
        expect(container.querySelector('nav, [role="navigation"]')).toBeTruthy();
      });

      it('should maintain content relationship in DOM order', () => {
        const { container } = render(<SafetyPlan userId="test-user" />);
        
        // Labels should precede or be associated with form controls
        const inputs = container.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
          const id = input.id;
          const label = container.querySelector(`label[for="${id}"]`);
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');
          
          expect(label || ariaLabel || ariaLabelledby).toBeTruthy();
        });
      });
    });

    describe('1.4 Distinguishable', () => {
      it('should have sufficient color contrast (4.5:1 for normal text)', () => {
        const { container } = render(<HomePage />);
        const textElements = container.querySelectorAll('p, span, div, a, button');
        
        textElements.forEach(element => {
          if (element.textContent?.trim()) {
            const hasContrast = AccessibilityTester.checkColorContrast(element as HTMLElement);
            expect(hasContrast).toBe(true);
          }
        });
      });

      it('should not use color as the only means of conveying information', () => {
        const { container } = render(<MoodTracker userId="test-user" />);
        
        // Check error messages have text, not just color
        const errors = container.querySelectorAll('[role="alert"], .error');
        errors.forEach(error => {
          expect(error.textContent?.trim()).toBeTruthy();
        });
        
        // Check status indicators have text or icons
        const statusElements = container.querySelectorAll('[data-status]');
        statusElements.forEach(status => {
          const hasText = status.textContent?.trim();
          const hasIcon = status.querySelector('svg, img');
          const hasAriaLabel = status.getAttribute('aria-label');
          
          expect(hasText || hasIcon || hasAriaLabel).toBeTruthy();
        });
      });

      it('should allow text spacing adjustments', () => {
        const { container } = render(<HomePage />);
        
        // Apply WCAG text spacing requirements
        container.style.cssText = `
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        `;
        
        // Content should not be cut off or overlap
        const textElements = container.querySelectorAll('p, div, span');
        textElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element as HTMLElement);
          
          // Check for overflow
          expect(style.overflow).not.toBe('hidden');
          expect(rect.width).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Operable - Guideline 2', () => {
    describe('2.1 Keyboard Accessible', () => {
      it('should make all functionality keyboard accessible', async () => {
        const user = userEvent.setup();
        const { container } = render(<CrisisPage />);
        
        // Tab through all interactive elements
        const interactiveElements = container.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        for (const element of Array.from(interactiveElements)) {
          await user.tab();
          expect(document.activeElement).toBe(element);
        }
      });

      it('should not trap keyboard focus', async () => {
        const user = userEvent.setup();
        render(<AITherapyChat userId="test-user" />);
        
        // Open a modal or dialog
        const openButton = screen.getByRole('button', { name: /settings/i });
        await user.click(openButton);
        
        // Should be able to escape with Escape key
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should provide keyboard shortcuts for critical functions', () => {
        const { container } = render(<CrisisPage />);
        
        // Check for accesskey attributes or documented shortcuts
        const crisisButton = container.querySelector('[data-crisis-help]');
        const accessKey = crisisButton?.getAttribute('accesskey');
        const ariaKeyShortcuts = crisisButton?.getAttribute('aria-keyshortcuts');
        
        expect(accessKey || ariaKeyShortcuts).toBeTruthy();
      });
    });

    describe('2.2 Enough Time', () => {
      it('should allow users to extend time limits', async () => {
        jest.useFakeTimers();
        render(<AITherapyChat userId="test-user" />);
        
        // Advance time to near session limit
        jest.advanceTimersByTime(55 * 60 * 1000); // 55 minutes
        
        // Should show warning
        await waitFor(() => {
          expect(screen.getByText(/session will expire/i)).toBeInTheDocument();
        });
        
        // Should offer extension option
        expect(screen.getByRole('button', { name: /extend session/i })).toBeInTheDocument();
        
        jest.useRealTimers();
      });

      it('should allow users to pause auto-updating content', () => {
        render(<MoodAnalytics />);
        
        // Check for pause button on auto-updating charts
        const pauseButton = screen.queryByRole('button', { name: /pause.*update/i });
        expect(pauseButton).toBeInTheDocument();
      });
    });

    describe('2.3 Seizures and Physical Reactions', () => {
      it('should not have content that flashes more than 3 times per second', () => {
        const { container } = render(<HomePage />);
        
        // Check for potentially problematic animations
        const animatedElements = container.querySelectorAll('[class*="animate"], [class*="flash"]');
        
        animatedElements.forEach(element => {
          const style = window.getComputedStyle(element as HTMLElement);
          const animationDuration = style.animationDuration;
          
          if (animationDuration && animationDuration !== 'none') {
            const duration = parseFloat(animationDuration);
            // If animation repeats, ensure it's not too fast
            expect(duration).toBeGreaterThan(0.333); // Not faster than 3Hz
          }
        });
      });
    });

    describe('2.4 Navigable', () => {
      it('should provide skip links for repetitive content', () => {
        render(<HomePage />);
        
        // Tab once to reveal skip link
        fireEvent.keyDown(document.body, { key: 'Tab' });
        
        const skipLink = screen.queryByText(/skip to main content/i);
        expect(skipLink).toBeInTheDocument();
      });

      it('should have descriptive page titles', () => {
        const pages = [
          { component: HomePage, expectedTitle: /Astral Core/i },
          { component: CrisisPage, expectedTitle: /Crisis.*Help/i },
          { component: AITherapyPage, expectedTitle: /AI.*Therapy/i }
        ];
        
        pages.forEach(({ component: Component, expectedTitle }) => {
          render(<Component />);
          expect(document.title).toMatch(expectedTitle);
        });
      });

      it('should indicate current location in navigation', () => {
        const { container } = render(<Navigation currentPath="/crisis" />);
        
        const currentLink = container.querySelector('[aria-current="page"]');
        expect(currentLink).toBeTruthy();
        expect(currentLink?.textContent).toMatch(/crisis/i);
      });

      it('should have descriptive link text', () => {
        const { container } = render(<ResourcesPage />);
        
        const links = container.querySelectorAll('a');
        links.forEach(link => {
          const text = link.textContent?.trim();
          const ariaLabel = link.getAttribute('aria-label');
          
          // Links should not have generic text
          expect(text).not.toMatch(/^(click here|read more|link)$/i);
          
          // Links should be descriptive
          expect(text || ariaLabel).toBeTruthy();
        });
      });
    });

    describe('2.5 Input Modalities', () => {
      it('should have large enough touch targets (44x44 CSS pixels)', () => {
        const { container } = render(<CrisisPage />);
        
        const touchTargets = container.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]');
        
        touchTargets.forEach(target => {
          const rect = target.getBoundingClientRect();
          const style = window.getComputedStyle(target as HTMLElement);
          
          // Account for padding
          const paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
          const paddingV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          
          const width = rect.width + paddingH;
          const height = rect.height + paddingV;
          
          // WCAG 2.2 requires 44x44 CSS pixels minimum
          expect(width).toBeGreaterThanOrEqual(44);
          expect(height).toBeGreaterThanOrEqual(44);
        });
      });

      it('should not require complex gestures', () => {
        const { container } = render(<AITherapyChat userId="test-user" />);
        
        // Check that all functionality is available through simple clicks/taps
        const interactiveElements = container.querySelectorAll('[onclick], [onmousedown]');
        
        interactiveElements.forEach(element => {
          const handlers = element.getAttributeNames().filter(attr => attr.startsWith('on'));
          
          // Should not require multi-touch or path-based gestures
          handlers.forEach(handler => {
            expect(handler).not.toMatch(/swipe|pinch|rotate/i);
          });
        });
      });
    });
  });

  describe('Understandable - Guideline 3', () => {
    describe('3.1 Readable', () => {
      it('should specify page language', () => {
        const { container } = render(<HomePage />);
        
        const html = document.documentElement;
        expect(html).toHaveAttribute('lang');
        expect(html.getAttribute('lang')).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      });

      it('should use plain language for crisis resources', () => {
        render(<CrisisPage />);
        
        // Check readability of critical content
        const crisisText = screen.getByTestId('crisis-instructions').textContent;
        
        // Simple readability check
        const sentences = crisisText?.split(/[.!?]/).filter(Boolean) || [];
        const avgWordsPerSentence = sentences.reduce((acc, sentence) => {
          return acc + sentence.trim().split(/\s+/).length;
        }, 0) / sentences.length;
        
        // Crisis content should be simple and clear
        expect(avgWordsPerSentence).toBeLessThan(20);
      });
    });

    describe('3.2 Predictable', () => {
      it('should not change context on focus', async () => {
        const user = userEvent.setup();
        const mockNavigate = jest.fn();
        
        render(<FormComponent onNavigate={mockNavigate} />);
        
        const input = screen.getByRole('textbox');
        await user.tab(); // Focus the input
        
        // Should not navigate or submit on focus
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it('should have consistent navigation across pages', () => {
        const pages = [HomePage, CrisisPage, AITherapyPage, MoodPage];
        
        const navStructures = pages.map(Page => {
          const { container } = render(<Page />);
          const nav = container.querySelector('nav');
          const links = nav?.querySelectorAll('a');
          return links ? Array.from(links).map(link => link.textContent) : [];
        });
        
        // Navigation should be consistent across all pages
        navStructures.forEach(structure => {
          expect(structure).toEqual(navStructures[0]);
        });
      });
    });

    describe('3.3 Input Assistance', () => {
      it('should provide error identification and description', async () => {
        const user = userEvent.setup();
        render(<MoodEntryForm />);
        
        // Submit form with errors
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);
        
        // Errors should be announced
        const errors = screen.getAllByRole('alert');
        expect(errors.length).toBeGreaterThan(0);
        
        // Each error should describe the problem
        errors.forEach(error => {
          expect(error.textContent).toMatch(/required|invalid|must/i);
        });
        
        // Errors should be associated with fields
        const invalidInputs = screen.getAllByLabelText(/./);
        invalidInputs.forEach(input => {
          if (input.getAttribute('aria-invalid') === 'true') {
            const describedBy = input.getAttribute('aria-describedby');
            expect(describedBy).toBeTruthy();
            
            const errorMessage = document.getElementById(describedBy!);
            expect(errorMessage).toBeTruthy();
          }
        });
      });

      it('should provide input labels and instructions', () => {
        render(<SafetyPlan userId="test-user" />);
        
        const inputs = screen.getAllByRole('textbox');
        
        inputs.forEach(input => {
          // Should have label
          const label = screen.queryByLabelText(input.getAttribute('name') || '');
          expect(label || input.getAttribute('aria-label')).toBeTruthy();
          
          // Should have instructions for complex inputs
          if (input.getAttribute('pattern') || input.getAttribute('required')) {
            const describedBy = input.getAttribute('aria-describedby');
            if (describedBy) {
              const instructions = document.getElementById(describedBy);
              expect(instructions).toBeTruthy();
            }
          }
        });
      });

      it('should suggest corrections for errors', async () => {
        const user = userEvent.setup();
        render(<LoginForm />);
        
        // Enter invalid email
        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'notanemail');
        await user.tab(); // Trigger validation
        
        // Should suggest correction
        await waitFor(() => {
          const suggestion = screen.queryByText(/valid email.*example@domain.com/i);
          expect(suggestion).toBeInTheDocument();
        });
      });
    });
  });

  describe('Robust - Guideline 4', () => {
    describe('4.1 Compatible', () => {
      it('should have valid HTML', async () => {
        const { container } = render(<HomePage />);
        
        // Check for duplicate IDs
        const ids = new Set();
        const duplicates: string[] = [];
        
        container.querySelectorAll('[id]').forEach(element => {
          const id = element.id;
          if (ids.has(id)) {
            duplicates.push(id);
          }
          ids.add(id);
        });
        
        expect(duplicates).toHaveLength(0);
        
        // Check for proper nesting
        const invalidNesting = container.querySelectorAll('p p, p div, button button');
        expect(invalidNesting).toHaveLength(0);
      });

      it('should have proper ARIA attributes', async () => {
        const { container } = render(<CrisisPage />);
        
        const results = await AccessibilityTester.checkWCAGCompliance(container);
        expect(results).toHaveNoViolations();
      });

      it('should work with assistive technologies', () => {
        const { container } = render(<AITherapyChat userId="test-user" />);
        
        // Check for proper roles
        const interactiveElements = container.querySelectorAll('div[onclick], span[onclick]');
        
        interactiveElements.forEach(element => {
          const role = element.getAttribute('role');
          const tabIndex = element.getAttribute('tabindex');
          
          // Interactive divs/spans should have appropriate roles
          expect(role).toMatch(/button|link|checkbox|radio/);
          expect(tabIndex).toBeDefined();
        });
        
        // Check for live regions for dynamic content
        const dynamicContent = container.querySelectorAll('[data-dynamic]');
        
        dynamicContent.forEach(content => {
          const liveRegion = content.getAttribute('aria-live') || 
                            content.closest('[aria-live]');
          expect(liveRegion).toBeTruthy();
        });
      });
    });
  });
});

describe('Crisis-Specific Accessibility', () => {
  it('should make crisis resources immediately accessible', () => {
    render(<CrisisPage />);
    
    // Crisis number should be in heading
    const crisisNumber = screen.getByRole('heading', { name: /988/i });
    expect(crisisNumber).toBeInTheDocument();
    
    // Should be first focusable element
    const firstButton = screen.getAllByRole('button')[0];
    expect(firstButton).toHaveTextContent(/call.*988|crisis.*help/i);
  });

  it('should provide clear, simple language in crisis situations', () => {
    render(<CrisisChat />);
    
    const instructions = screen.getByTestId('crisis-chat-instructions');
    const text = instructions.textContent || '';
    
    // Check for simple, action-oriented language
    expect(text).toMatch(/you.*safe|we.*here.*help|talk.*someone/i);
    
    // Should avoid complex mental health jargon
    expect(text).not.toMatch(/psychiatric|psychotherapy|cognitive behavioral/i);
  });

  it('should work with screen readers in crisis mode', async () => {
    const { container } = render(<CrisisPage />);
    
    // Check for announcement of crisis resources
    const liveRegion = container.querySelector('[role="alert"], [aria-live="assertive"]');
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.textContent).toMatch(/crisis.*help.*available/i);
  });
});

// Mock components for testing
function MoodAnalytics() {
  return <div>Mood Analytics</div>;
}

function AITherapyPage() {
  return <div>AI Therapy</div>;
}

function MoodPage() {
  return <div>Mood Tracker</div>;
}

function ResourcesPage() {
  return <div>Resources</div>;
}

function FormComponent({ onNavigate }: any) {
  return <form><input type="text" /></form>;
}

function MoodEntryForm() {
  return <form><input required aria-label="Mood" /><button>Submit</button></form>;
}

function LoginForm() {
  return <form><input type="email" aria-label="Email" /><button>Login</button></form>;
}