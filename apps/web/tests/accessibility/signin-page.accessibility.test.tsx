/**
 * ASTRAL_CORE V2.0 - Sign-In Page Accessibility Tests
 * 
 * WCAG 2.1 AA Compliance Testing for Authentication & Demo Login System
 * Phase 4 Testing: UI & Accessibility Testing
 * 
 * Critical Requirements:
 * - Demo login system must be fully accessible
 * - Emergency access banner must be screen reader friendly
 * - Form validation with accessible error messages
 * - Keyboard navigation for all authentication flows
 * - Mobile accessibility for crisis users on phones
 */

import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import SignInPage from '../../src/app/auth/signin/page';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn().mockResolvedValue({ ok: true, error: null }),
  getSession: jest.fn(),
  getProviders: jest.fn().mockResolvedValue({
    google: { id: 'google', name: 'Google', type: 'oauth' },
    github: { id: 'github', name: 'GitHub', type: 'oauth' }
  }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockReturnValue(null),
  })),
}));

// Helper to render with Suspense
const renderSignInPage = () => {
  return render(
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
};

describe('Sign-In Page - WCAG 2.1 AA Accessibility Compliance', () => {

  describe('Emergency Access Banner Accessibility', () => {
    test('should have accessible emergency access banner with proper ARIA attributes', async () => {
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/crisis support available 24.*7/i)).toBeInTheDocument();
      });
      
      // Find emergency banner
      const emergencyBanner = container.querySelector('.bg-red-600') ||
                             screen.getByText(/crisis support available/i).closest('[class*="bg-red"]');
      
      expect(emergencyBanner).toBeInTheDocument();
      
      // Should have proper role and labeling
      expect(emergencyBanner).toHaveAttribute('role', 'banner');
      expect(emergencyBanner).toHaveAttribute('aria-label', expect.stringMatching(/emergency|crisis|24.*7/i));
      
      // Emergency access button should be accessible
      const emergencyButton = screen.getByRole('button', { name: /emergency access/i });
      expect(emergencyButton).toBeInTheDocument();
      expect(emergencyButton).toHaveAttribute('aria-label', expect.stringMatching(/emergency|crisis|immediate/i));
      
      // Test keyboard accessibility
      emergencyButton.focus();
      expect(document.activeElement).toBe(emergencyButton);
      
      // Run axe accessibility check
      const results = await axe(emergencyBanner as HTMLElement);
      expect(results).toHaveNoViolations();
    });

    test('should have proper color contrast for emergency elements', async () => {
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/crisis support available/i)).toBeInTheDocument();
      });
      
      // Test emergency banner contrast
      const emergencyBanner = container.querySelector('.bg-red-600');
      if (emergencyBanner) {
        const results = await axe(emergencyBanner as HTMLElement, {
          rules: { 'color-contrast': { enabled: true } }
        });
        expect(results).toHaveNoViolations();
      }
      
      // Test emergency button contrast
      const emergencyButton = screen.getByRole('button', { name: /emergency access/i });
      const buttonResults = await axe(emergencyButton);
      expect(buttonResults).toHaveNoViolations();
    });
  });

  describe('Form Accessibility and Labeling', () => {
    test('should have proper form labeling for all input types', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/email.*password/i)).toBeInTheDocument();
      });
      
      // Select email authentication type
      const emailOption = screen.getByText('Email & Password').closest('button');
      await user.click(emailOption!);
      
      // Check email input labeling
      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      const emailLabel = screen.getByLabelText(/email address/i);
      
      expect(emailInput).toBe(emailLabel);
      expect(emailInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      
      // Check password input labeling
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const passwordLabel = screen.getByLabelText(/password/i);
      
      expect(passwordInput).toBe(passwordLabel);
      expect(passwordInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      
      // Test show/hide password button
      const togglePasswordButton = container.querySelector('[type="button"]');
      if (togglePasswordButton && togglePasswordButton.closest('.relative')) {
        expect(togglePasswordButton).toHaveAttribute('aria-label', expect.stringMatching(/show|hide|toggle.*password/i));
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible volunteer and therapist credential forms', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/volunteer access/i)).toBeInTheDocument();
      });
      
      // Test volunteer form
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      await user.click(volunteerOption!);
      
      const volunteerIdInput = screen.getByPlaceholderText('Enter your volunteer ID');
      const volunteerIdLabel = screen.getByLabelText(/volunteer id/i);
      
      expect(volunteerIdInput).toBe(volunteerIdLabel);
      expect(volunteerIdInput).toHaveAttribute('id');
      expect(volunteerIdInput).toHaveAttribute('type', 'text');
      
      const volunteerPasscodeInput = screen.getByPlaceholderText('Enter your passcode');
      const volunteerPasscodeLabel = screen.getByLabelText(/passcode/i);
      
      expect(volunteerPasscodeInput).toBe(volunteerPasscodeLabel);
      expect(volunteerPasscodeInput).toHaveAttribute('type', 'password');
      
      // Test therapist form
      const therapistOption = screen.getByText('Therapist Portal').closest('button');
      await user.click(therapistOption!);
      
      const licenseIdInput = screen.getByPlaceholderText('Enter your license ID');
      const licenseIdLabel = screen.getByLabelText(/license id/i);
      
      expect(licenseIdInput).toBe(licenseIdLabel);
      expect(licenseIdInput).toHaveAttribute('id');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible error messaging', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      // Mock authentication error
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' });
      
      await waitFor(() => {
        expect(screen.getByText(/email.*password/i)).toBeInTheDocument();
      });
      
      // Trigger error by attempting sign in with empty fields
      const emailOption = screen.getByText('Email & Password').closest('button');
      await user.click(emailOption!);
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);
      
      // Wait for error message
      await waitFor(() => {
        const errorMessage = screen.queryByText(/invalid.*email.*password/i);
        if (errorMessage) {
          // Error should be properly associated with form
          expect(errorMessage).toHaveAttribute('role', 'alert');
          expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
          
          // Error should be announced to screen readers immediately
          const alertIcon = errorMessage.querySelector('[data-testid="alert-icon"]') ||
                           errorMessage.querySelector('svg');
          if (alertIcon) {
            expect(alertIcon).toHaveAttribute('aria-hidden', 'true');
          }
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Demo Login System Accessibility', () => {
    test('should have accessible demo section with clear instructions', async () => {
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/demo access/i)).toBeInTheDocument();
      });
      
      // Demo section should be properly labeled
      const demoSection = screen.getByText(/demo access/i).closest('[class*="bg-amber"]');
      expect(demoSection).toBeInTheDocument();
      expect(demoSection).toHaveAttribute('role', 'region');
      expect(demoSection).toHaveAttribute('aria-labelledby');
      
      // Check demo description
      const demoDescription = screen.getByText(/try the platform with pre-configured demo accounts/i);
      expect(demoDescription).toBeInTheDocument();
      
      const results = await axe(demoSection as HTMLElement);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible demo buttons with proper keyboard support', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/demo access/i)).toBeInTheDocument();
      });
      
      // Find all demo buttons
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });
      
      // Test accessibility attributes
      [demoVolunteerBtn, demoTherapistBtn, demoAdminBtn].forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('aria-label');
        expect(button.tabIndex).not.toBe(-1);
      });
      
      // Test keyboard navigation
      demoVolunteerBtn.focus();
      expect(document.activeElement).toBe(demoVolunteerBtn);
      
      await user.tab();
      expect(document.activeElement).toBe(demoTherapistBtn);
      
      await user.tab();
      expect(document.activeElement).toBe(demoAdminBtn);
      
      // Test Enter key activation
      const mockClick = jest.fn();
      demoVolunteerBtn.addEventListener('click', mockClick);
      fireEvent.keyDown(demoVolunteerBtn, { key: 'Enter', code: 'Enter' });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper touch targets for mobile demo access', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/demo access/i)).toBeInTheDocument();
      });
      
      // Check demo button touch targets
      const demoButtons = [
        screen.getByRole('button', { name: /demo volunteer/i }),
        screen.getByRole('button', { name: /demo therapist/i }),
        screen.getByRole('button', { name: /demo admin/i })
      ];
      
      demoButtons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        
        // WCAG 2.5.5: Target Size - minimum 44x44 pixels
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide accessible help text for demo credentials', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/demo access/i)).toBeInTheDocument();
      });
      
      // Click demo volunteer button
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);
      
      // Check for help text
      const helpText = screen.getByText(/demo credentials.*volunteer123/i);
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveAttribute('id');
      
      // Help text should be associated with form fields
      const passcodeInput = screen.getByPlaceholderText('Enter your passcode');
      expect(passcodeInput).toHaveAttribute('aria-describedby', expect.stringContaining(helpText.id));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Authentication Type Selection Accessibility', () => {
    test('should have accessible radio-like selection for auth types', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/choose access type/i)).toBeInTheDocument();
      });
      
      // Find auth type buttons
      const emailOption = screen.getByText('Email & Password').closest('button');
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      const therapistOption = screen.getByText('Therapist Portal').closest('button');
      const anonymousOption = screen.getByText('Crisis Support').closest('button');
      
      // Should behave like radio group
      const authOptions = [emailOption, volunteerOption, therapistOption, anonymousOption];
      
      authOptions.forEach((option) => {
        expect(option).toHaveAttribute('role', 'radio');
        expect(option).toHaveAttribute('aria-checked');
        expect(option).toHaveAttribute('tabindex');
      });
      
      // Test selection behavior
      await user.click(volunteerOption!);
      expect(volunteerOption).toHaveAttribute('aria-checked', 'true');
      expect(emailOption).toHaveAttribute('aria-checked', 'false');
      
      // Test keyboard navigation with arrow keys
      volunteerOption!.focus();
      fireEvent.keyDown(volunteerOption!, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(therapistOption);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should provide descriptive labels for each auth type', async () => {
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/choose access type/i)).toBeInTheDocument();
      });
      
      // Check descriptions for each auth type
      expect(screen.getByText('For volunteers and therapists')).toBeInTheDocument();
      expect(screen.getByText('Quick ID-based access')).toBeInTheDocument();
      expect(screen.getByText('Licensed professionals')).toBeInTheDocument();
      expect(screen.getByText('Anonymous emergency access')).toBeInTheDocument();
      
      // Each option should have accessible name and description
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      expect(volunteerOption).toHaveAttribute('aria-describedby');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Privacy and Security Accessibility', () => {
    test('should have accessible privacy notice with proper semantic markup', async () => {
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/your privacy is protected/i)).toBeInTheDocument();
      });
      
      // Find privacy notice
      const privacyNotice = screen.getByText(/your privacy is protected/i).closest('[class*="bg-green"]');
      expect(privacyNotice).toBeInTheDocument();
      expect(privacyNotice).toHaveAttribute('role', 'region');
      expect(privacyNotice).toHaveAttribute('aria-labelledby');
      
      // Should mention HIPAA compliance
      expect(screen.getByText(/hipaa compliant/i)).toBeInTheDocument();
      
      // Shield icon should be decorative
      const shieldIcon = privacyNotice?.querySelector('svg');
      if (shieldIcon) {
        expect(shieldIcon).toHaveAttribute('aria-hidden', 'true');
      }
      
      const results = await axe(privacyNotice as HTMLElement);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible anonymous access information', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/crisis support/i)).toBeInTheDocument();
      });
      
      // Select anonymous option
      const anonymousOption = screen.getByText('Crisis Support').closest('button');
      await user.click(anonymousOption!);
      
      // Check for anonymous access notice
      const anonymousNotice = screen.queryByText(/anonymous access ensures your privacy/i);
      if (anonymousNotice) {
        expect(anonymousNotice).toBeInTheDocument();
        expect(anonymousNotice).toHaveAttribute('role', 'note');
      }
      
      // Emergency notice should be present and accessible
      const emergencyNotice = screen.getByText(/emergency.*call 988 immediately/i);
      expect(emergencyNotice).toBeInTheDocument();
      expect(emergencyNotice).toHaveAttribute('aria-live', 'polite');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility and Responsive Design', () => {
    test('should maintain accessibility on mobile viewports', async () => {
      // Test various mobile viewports
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone 11
      ];
      
      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, writable: true });
        
        const { container, unmount } = renderSignInPage();
        
        await waitFor(() => {
          expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        });
        
        // Check that all interactive elements are accessible
        const interactiveElements = container.querySelectorAll(
          'button, [role="button"], input, [role="radio"]'
        );
        
        interactiveElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
        });
        
        // Check for horizontal scrolling
        const body = document.body;
        expect(body.scrollWidth).toBeLessThanOrEqual(viewport.width + 20);
        
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        
        unmount();
      }
    });

    test('should support landscape orientation on mobile', async () => {
      // Mock landscape mobile
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
      
      // Emergency banner should still be accessible in landscape
      const emergencyBanner = container.querySelector('.bg-red-600');
      expect(emergencyBanner).toBeInTheDocument();
      
      // Form should still be usable
      const emailOption = screen.getByText('Email & Password').closest('button');
      expect(emailOption).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading and Error States Accessibility', () => {
    test('should have accessible loading states', async () => {
      const { container } = render(<SignInPage />);
      
      // Check initial loading state
      const loadingElement = screen.queryByTestId('loading');
      if (loadingElement) {
        expect(loadingElement).toHaveAttribute('aria-live', 'polite');
        expect(loadingElement).toHaveTextContent(/loading/i);
      }
      
      // Check for loading spinner accessibility
      const spinner = container.querySelector('.animate-spin');
      if (spinner) {
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
        expect(spinner.closest('[aria-live]')).toBeTruthy();
      }
    });

    test('should announce state changes to screen readers', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
      
      // Test state change when selecting auth type
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      await user.click(volunteerOption!);
      
      // Form should announce the change
      const volunteerForm = container.querySelector('[class*="bg-gray-50"]');
      if (volunteerForm) {
        expect(volunteerForm).toHaveAttribute('aria-live', 'polite');
      }
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    test('should manage focus properly during form interactions', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
      
      // Test focus management when switching auth types
      const emailOption = screen.getByText('Email & Password').closest('button');
      await user.click(emailOption!);
      
      // Focus should move to first form field
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('your.email@example.com');
        expect(document.activeElement).toBe(emailInput);
      });
      
      // Test tab order through form
      await user.tab();
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      expect(document.activeElement).toBe(passwordInput);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should trap focus in modal-like components', async () => {
      const user = userEvent.setup();
      const { container } = renderSignInPage();
      
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
      
      // The form container should manage focus properly
      const firstFocusable = container.querySelector('button, [role="button"], input');
      const lastFocusable = Array.from(container.querySelectorAll('button, [role="button"], input')).pop();
      
      if (firstFocusable && lastFocusable) {
        // Test forward tab from last element
        (lastFocusable as HTMLElement).focus();
        await user.tab();
        
        // Should not leave the component area
        expect(document.activeElement).not.toBe(document.body);
      }
    });
  });
});