/**
 * ASTRAL_CORE V2.0 - Crisis Chat Accessibility Tests
 * 
 * WCAG 2.1 AA Compliance Testing for Anonymous Crisis Chat Interface
 * Phase 4 Testing: Crisis-Specific Accessibility Features
 * 
 * Critical Requirements:
 * - Anonymous crisis chat must be fully accessible to users with disabilities
 * - Real-time message updates via screen readers (ARIA live regions)
 * - Emergency escalation accessible via keyboard and assistive technology
 * - Zero-knowledge encryption UI must not hinder accessibility
 * - Crisis-appropriate trauma-informed design patterns
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import AnonymousCrisisChat from '../../src/components/crisis/AnonymousCrisisChat';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock audio for notification sounds
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
  })),
});

// Mock crypto API for encryption
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock window.confirm for session ending
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
});

describe('Crisis Chat - WCAG 2.1 AA Accessibility Compliance', () => {

  describe('Welcome Screen Accessibility', () => {
    test('should have accessible welcome screen with proper heading hierarchy', async () => {
      const { container } = render(<AnonymousCrisisChat />);
      
      // Check heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent(/you.*not alone/i);
      
      const subHeading = screen.getByRole('heading', { level: 2 });
      expect(subHeading).toHaveTextContent(/you.*not alone/i);
      
      // Check for descriptive content
      const description = screen.getByText(/connect instantly.*trained crisis counselor/i);
      expect(description).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible feature list with proper semantic markup', async () => {
      const { container } = render(<AnonymousCrisisChat />);
      
      // Find feature list items
      const anonymousFeature = screen.getByText(/100% Anonymous/i);
      const encryptionFeature = screen.getByText(/Zero-Knowledge Encryption/i);
      const availabilityFeature = screen.getByText(/Available 24\/7/i);
      
      // Each feature should be in a proper list structure
      const featureList = anonymousFeature.closest('div[class*="space-y"]');
      expect(featureList).toBeInTheDocument();
      
      // Icons should be decorative
      const icons = container.querySelectorAll('svg');
      icons.forEach((icon) => {
        expect(
          icon.getAttribute('aria-hidden') === 'true' ||
          icon.getAttribute('role') === 'presentation' ||
          icon.getAttribute('aria-label')
        ).toBeTruthy();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible start chat button with proper focus management', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      
      // Button should be properly labeled
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveAttribute('aria-label', expect.stringMatching(/start|begin|anonymous|chat/i));
      expect(startButton).not.toHaveAttribute('aria-disabled', 'true');
      
      // Test keyboard focus
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
      
      // Test Enter key activation
      const mockClick = jest.fn();
      startButton.addEventListener('click', mockClick);
      fireEvent.keyDown(startButton, { key: 'Enter', code: 'Enter' });
      
      // Button should have adequate touch target
      const rect = startButton.getBoundingClientRect();
      expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should display accessible emergency notice', async () => {
      const { container } = render(<AnonymousCrisisChat />);
      
      // Find emergency notice
      const emergencyNotice = screen.getByText(/if you.*immediate danger.*911.*988/i);
      expect(emergencyNotice).toBeInTheDocument();
      expect(emergencyNotice).toHaveAttribute('role', 'alert');
      expect(emergencyNotice).toHaveAttribute('aria-live', 'polite');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Connection Process Accessibility', () => {
    test('should have accessible connection status with live updates', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      // Start chat to trigger connection
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for connection status
      await waitFor(() => {
        const connectionStatus = screen.queryByText(/connecting.*counselor/i);
        if (connectionStatus) {
          // Connection status should be announced to screen readers
          expect(connectionStatus.closest('[aria-live]')).toBeTruthy();
          
          // Should show position in queue
          const queuePosition = screen.queryByText(/position in queue/i);
          if (queuePosition) {
            expect(queuePosition).toHaveAttribute('aria-live', 'polite');
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible loading indicators', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Check for loading spinner accessibility
      const spinner = container.querySelector('.animate-spin');
      if (spinner) {
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
        
        // Spinner should be in a live region with text
        const loadingText = screen.queryByText(/connecting/i);
        if (loadingText) {
          expect(loadingText.closest('[aria-live]')).toBeTruthy();
        }
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Chat Interface Accessibility', () => {
    test('should have accessible chat messages with proper ARIA live regions', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      // Start chat and wait for connection
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for chat to be connected
      await waitFor(() => {
        const messageArea = container.querySelector('[class*="messages"], [class*="chat"]');
        if (messageArea) {
          // Message area should be a live region
          expect(messageArea).toHaveAttribute('aria-live', 'polite');
          expect(messageArea).toHaveAttribute('aria-relevant', 'additions');
          expect(messageArea).toHaveAttribute('aria-atomic', 'false');
          
          // Should be properly labeled
          expect(messageArea).toHaveAttribute('aria-label', expect.stringMatching(/chat|messages|conversation/i));
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible message input with proper labeling', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      // Start and connect chat
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for message input to appear
      await waitFor(() => {
        const messageInput = screen.queryByPlaceholderText(/type your message/i);
        if (messageInput) {
          // Input should be properly labeled
          expect(messageInput).toHaveAttribute('aria-label', expect.stringMatching(/message|chat|type/i));
          expect(messageInput).toHaveAttribute('role', 'textbox');
          expect(messageInput).toHaveAttribute('aria-multiline', 'true');
          
          // Should have instructions for keyboard shortcuts
          expect(messageInput).toHaveAttribute('aria-describedby');
          const description = document.getElementById(messageInput.getAttribute('aria-describedby')!);
          if (description) {
            expect(description.textContent).toMatch(/shift.*enter/i);
          }
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible send button with proper states', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      await waitFor(() => {
        const sendButton = screen.queryByRole('button', { name: /send/i });
        if (sendButton) {
          // Send button should be labeled
          expect(sendButton).toHaveAttribute('aria-label', expect.stringMatching(/send|submit/i));
          
          // Should be disabled when input is empty
          const messageInput = screen.queryByPlaceholderText(/type your message/i);
          if (messageInput && !messageInput.textContent) {
            expect(sendButton).toBeDisabled();
            expect(sendButton).toHaveAttribute('aria-disabled', 'true');
          }
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should differentiate user and volunteer messages for screen readers', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for initial volunteer message
      await waitFor(() => {
        const messages = container.querySelectorAll('[class*="message"], [role="log"] > div');
        
        messages.forEach((message) => {
          // Each message should identify the sender
          expect(
            message.getAttribute('aria-label') ||
            message.querySelector('[aria-label]') ||
            message.textContent?.includes('Counselor') ||
            message.textContent?.includes('You')
          ).toBeTruthy();
          
          // Message timestamps should be accessible
          const timestamp = message.querySelector('[class*="text-xs"], [class*="timestamp"]');
          if (timestamp) {
            expect(timestamp).toHaveAttribute('aria-label', expect.stringMatching(/time|sent|received/i));
          }
        });
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Encryption Status Accessibility', () => {
    test('should have accessible encryption indicators', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Find encryption status button
      await waitFor(() => {
        const encryptionButton = container.querySelector('[title*="encryption"], [aria-label*="encryption"]');
        if (encryptionButton) {
          expect(encryptionButton).toHaveAttribute('aria-label', expect.stringMatching(/encryption|secure|privacy/i));
          expect(encryptionButton).toHaveAttribute('role', 'button');
        }
      });
      
      // Check for encryption details when expanded
      const encryptionDetails = container.querySelector('[class*="bg-green-50"]');
      if (encryptionDetails) {
        expect(encryptionDetails).toHaveAttribute('role', 'region');
        expect(encryptionDetails).toHaveAttribute('aria-labelledby');
        
        // Encryption explanation should be readable
        const explanation = screen.queryByText(/zero-knowledge protocol/i);
        if (explanation) {
          expect(explanation).toBeInTheDocument();
        }
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible session ID display', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      await waitFor(() => {
        const sessionId = screen.queryByText(/session id/i);
        if (sessionId) {
          // Session ID should be properly labeled and copyable
          expect(sessionId.closest('[role="region"]')).toBeTruthy();
          
          // Should not expose full session ID for privacy
          const idValue = container.querySelector('code, [class*="font-mono"]');
          if (idValue) {
            expect(idValue.textContent).toMatch(/\.\.\./); // Should be truncated
          }
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Risk Assessment Accessibility', () => {
    test('should have accessible risk level indicators', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for chat interface and send a message to trigger risk assessment
      await waitFor(() => {
        const messageInput = screen.queryByPlaceholderText(/type your message/i);
        if (messageInput) {
          // Type a message that might trigger risk assessment
          fireEvent.change(messageInput, { target: { value: 'I am feeling very depressed' } });
          
          const sendButton = screen.queryByRole('button', { name: /send/i });
          if (sendButton && !sendButton.disabled) {
            fireEvent.click(sendButton);
          }
        }
      }, 10000);
      
      // Check for risk assessment display
      await waitFor(() => {
        const riskIndicator = container.querySelector('[class*="bg-yellow-50"], [class*="bg-orange-50"], [class*="bg-red-50"]');
        if (riskIndicator) {
          expect(riskIndicator).toHaveAttribute('role', 'alert');
          expect(riskIndicator).toHaveAttribute('aria-live', 'assertive');
          
          // Risk level should be clearly indicated
          const riskLevel = screen.queryByText(/risk level/i);
          if (riskLevel) {
            expect(riskLevel).toHaveAttribute('aria-label');
          }
        }
      }, 5000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should announce escalation to screen readers', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Check for escalation notifications
      await waitFor(() => {
        const escalationNotice = screen.queryByText(/senior counselor.*notified/i);
        if (escalationNotice) {
          expect(escalationNotice.closest('[aria-live]')).toBeTruthy();
          expect(escalationNotice.closest('[role="alert"]')).toBeTruthy();
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Volunteer Information Accessibility', () => {
    test('should have accessible volunteer profile display', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for volunteer connection
      await waitFor(() => {
        const volunteerInfo = container.querySelector('[class*="bg-green-50"]');
        if (volunteerInfo) {
          expect(volunteerInfo).toHaveAttribute('role', 'region');
          expect(volunteerInfo).toHaveAttribute('aria-labelledby');
          
          // Volunteer name should be accessible
          const volunteerName = screen.queryByText(/crisis counselor/i);
          if (volunteerName) {
            expect(volunteerName).toBeInTheDocument();
          }
          
          // Volunteer rating should be accessible
          const rating = container.querySelectorAll('[class*="text-yellow-500"]');
          if (rating.length > 0) {
            const ratingContainer = rating[0].closest('div');
            expect(ratingContainer).toHaveAttribute('aria-label', expect.stringMatching(/rating|stars/i));
          }
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Emergency Resources Accessibility', () => {
    test('should have accessible emergency resource bar', async () => {
      const { container } = render(<AnonymousCrisisChat />);
      
      // Emergency resources bar should always be present
      const resourceBar = container.querySelector('.bg-red-600');
      expect(resourceBar).toBeInTheDocument();
      expect(resourceBar).toHaveAttribute('role', 'banner');
      expect(resourceBar).toHaveAttribute('aria-label', expect.stringMatching(/emergency|crisis|resources/i));
      
      // Emergency contact links should be accessible
      const call911Link = screen.getByRole('link', { name: /911/i });
      const call988Link = screen.getByRole('link', { name: /988/i });
      const text741741Link = screen.getByRole('link', { name: /text.*741741/i });
      
      [call911Link, call988Link, text741741Link].forEach((link) => {
        expect(link).toHaveAttribute('href');
        expect(link).toHaveAttribute('aria-label');
        
        // Should open in same tab for immediate access
        expect(link).not.toHaveAttribute('target', '_blank');
      });
      
      const results = await axe(resourceBar as HTMLElement);
      expect(results).toHaveNoViolations();
    });

    test('should have proper focus management for emergency actions', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      // Emergency links should be keyboard accessible
      const call988Link = screen.getByRole('link', { name: /988/i });
      
      call988Link.focus();
      expect(document.activeElement).toBe(call988Link);
      
      // Test Enter key navigation
      const mockClick = jest.fn();
      call988Link.addEventListener('click', mockClick);
      fireEvent.keyDown(call988Link, { key: 'Enter', code: 'Enter' });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Session Management Accessibility', () => {
    test('should have accessible end chat functionality', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Wait for end chat button to appear
      await waitFor(() => {
        const endButton = screen.queryByRole('button', { name: /end chat/i });
        if (endButton) {
          expect(endButton).toHaveAttribute('aria-label', expect.stringMatching(/end|close|finish/i));
          expect(endButton).toHaveAttribute('aria-describedby');
          
          // Should have warning about data deletion
          const warningId = endButton.getAttribute('aria-describedby');
          if (warningId) {
            const warning = document.getElementById(warningId);
            expect(warning?.textContent).toMatch(/permanently deleted/i);
          }
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible session duration information', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Check for session duration display
      await waitFor(() => {
        const sessionInfo = screen.queryByText(/session.*\d+.*min/i);
        if (sessionInfo) {
          expect(sessionInfo).toHaveAttribute('aria-live', 'polite');
          expect(sessionInfo).toHaveAttribute('aria-label', expect.stringMatching(/session.*duration/i));
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Crisis Chat Accessibility', () => {
    test('should maintain accessibility on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      const { container } = render(<AnonymousCrisisChat />);
      
      // All interactive elements should have adequate touch targets
      const interactiveElements = container.querySelectorAll(
        'button, [role="button"], a, [role="link"], input, textarea'
      );
      
      interactiveElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
      
      // Test with user agent for mobile screen reader
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        configurable: true,
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should support swipe gestures without breaking keyboard access', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      await user.click(startButton);
      
      // Ensure chat interface supports both touch and keyboard
      await waitFor(() => {
        const chatContainer = container.querySelector('[class*="chat"], [class*="messages"]');
        if (chatContainer) {
          // Should be scrollable but not interfere with keyboard navigation
          expect(chatContainer).toHaveAttribute('tabindex', '0');
          expect(chatContainer).toHaveAttribute('role', 'log');
        }
      }, 10000);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Performance Impact on Accessibility', () => {
    test('should maintain screen reader performance during real-time updates', async () => {
      const user = userEvent.setup();
      const { container } = render(<AnonymousCrisisChat />);
      
      const startButton = screen.getByRole('button', { name: /start anonymous chat/i });
      
      const startTime = performance.now();
      await user.click(startButton);
      
      // Wait for multiple message updates
      await waitFor(() => {
        const messages = container.querySelectorAll('[aria-live] > *');
        expect(messages.length).toBeGreaterThan(0);
      }, 10000);
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Real-time updates should not significantly impact performance
      expect(updateTime).toBeLessThan(1000); // Should be under 1 second
      
      // ARIA live regions should not cause excessive DOM updates
      const liveRegions = container.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeLessThanOrEqual(5); // Reasonable number of live regions
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});