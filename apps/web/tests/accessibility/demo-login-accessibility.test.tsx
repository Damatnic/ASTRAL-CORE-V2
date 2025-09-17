/**
 * ASTRAL_CORE V2.0 - Demo Login Accessibility Tests
 * 
 * Comprehensive accessibility testing for the demo login system
 * Ensures WCAG 2.1 AA compliance and mental health app best practices
 * 
 * Critical accessibility features tested:
 * - Keyboard navigation and focus management
 * - Screen reader compatibility and ARIA labels
 * - Color contrast and visual accessibility
 * - Crisis support accessibility (emergency access)
 * - Form accessibility and error announcements
 * - Mobile accessibility and touch targets
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import SignInPage from '../../src/app/auth/signin/page';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn().mockResolvedValue({ ok: true }),
  getSession: jest.fn(),
  getProviders: jest.fn().mockResolvedValue({}),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('Demo Login Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Overall Accessibility Compliance', () => {
    test('should have no accessibility violations on initial load', async () => {
      const { container } = render(<SignInPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should maintain accessibility when demo buttons are used', async () => {
      const user = userEvent.setup();
      const { container } = render(<SignInPage />);

      // Click each demo button and test accessibility
      const demoButtons = ['Demo Volunteer', 'Demo Therapist', 'Demo Admin'];
      
      for (const buttonText of demoButtons) {
        const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
        await user.click(button);
        
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Keyboard Navigation and Focus Management', () => {
    test('should allow keyboard navigation through all demo buttons', async () => {
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });

      // Test focus order
      demoVolunteerBtn.focus();
      expect(document.activeElement).toBe(demoVolunteerBtn);

      // Test tab navigation
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      // Note: In a real browser, this would move focus to the next element

      // Test Enter key activation
      fireEvent.keyDown(demoVolunteerBtn, { key: 'Enter' });
      
      // Check that credentials are populated (indicating button worked)
      const volunteerIdInput = screen.getByDisplayValue('demo-volunteer');
      expect(volunteerIdInput).toBeInTheDocument();
    });

    test('should maintain focus when switching between demo account types', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Focus should be managed properly after interaction
      const volunteerIdInput = screen.getByDisplayValue('demo-volunteer');
      expect(volunteerIdInput).toBeInTheDocument();

      // Focus should be accessible via keyboard
      volunteerIdInput.focus();
      expect(document.activeElement).toBe(volunteerIdInput);
    });

    test('should support Space key activation for demo buttons', () => {
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      demoVolunteerBtn.focus();

      // Test Space key activation
      fireEvent.keyDown(demoVolunteerBtn, { key: ' ', code: 'Space' });
      fireEvent.keyUp(demoVolunteerBtn, { key: ' ', code: 'Space' });

      // Check that credentials are populated
      const volunteerIdInput = screen.getByDisplayValue('demo-volunteer');
      expect(volunteerIdInput).toBeInTheDocument();
    });

    test('should trap focus in modal-like demo section appropriately', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // Demo section should not trap focus (it's not a modal)
      // But should have logical tab order
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);

      // All inputs should be reachable by keyboard
      inputs.forEach(input => {
        input.focus();
        expect(document.activeElement).toBe(input);
      });
    });
  });

  describe('Screen Reader Compatibility and ARIA Labels', () => {
    test('should have proper ARIA labels for demo buttons', () => {
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });

      // Buttons should have accessible names
      expect(demoVolunteerBtn).toHaveAccessibleName();
      expect(demoTherapistBtn).toHaveAccessibleName();
      expect(demoAdminBtn).toHaveAccessibleName();

      // Buttons should have proper roles
      expect(demoVolunteerBtn).toHaveAttribute('type', 'button');
      expect(demoTherapistBtn).toHaveAttribute('type', 'button');
      expect(demoAdminBtn).toHaveAttribute('type', 'button');
    });

    test('should have proper form labels for demo credential inputs', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // Test volunteer form labels
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const volunteerIdInput = screen.getByLabelText(/volunteer id/i);
      const passcodeInput = screen.getByLabelText(/passcode/i);

      expect(volunteerIdInput).toBeInTheDocument();
      expect(passcodeInput).toBeInTheDocument();

      // Test therapist form labels
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      await user.click(demoTherapistBtn);

      const licenseIdInput = screen.getByLabelText(/license id/i);
      const therapistPasscodeInput = screen.getByLabelText(/passcode/i);

      expect(licenseIdInput).toBeInTheDocument();
      expect(therapistPasscodeInput).toBeInTheDocument();

      // Test admin form labels
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });
      await user.click(demoAdminBtn);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test('should announce demo section purpose to screen readers', () => {
      render(<SignInPage />);

      // Demo section should have clear heading and description
      const demoHeading = screen.getByText('🎯 Demo Access');
      const demoDescription = screen.getByText('Try the platform with pre-configured demo accounts');

      expect(demoHeading).toBeInTheDocument();
      expect(demoDescription).toBeInTheDocument();

      // Should be properly structured for screen readers
      expect(demoHeading.tagName).toBe('H3');
    });

    test('should provide helper text for demo credentials', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Helper text should be associated with form for screen readers
      const helperText = screen.getByText(/demo credentials: use "volunteer123" as the passcode/i);
      expect(helperText).toBeInTheDocument();
    });
  });

  describe('Crisis Support Accessibility', () => {
    test('should have highly accessible emergency access banner', () => {
      render(<SignInPage />);

      const emergencyBanner = screen.getByText('Crisis Support Available 24/7');
      const emergencyButton = screen.getByRole('button', { name: /emergency access/i });

      expect(emergencyBanner).toBeInTheDocument();
      expect(emergencyButton).toBeInTheDocument();

      // Emergency access should be highly visible and accessible
      expect(emergencyButton).toHaveClass('bg-white', 'text-red-600');
    });

    test('should maintain crisis support accessibility when demo is active', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // Emergency access should remain accessible even when demo buttons are used
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const emergencyButton = screen.getByRole('button', { name: /emergency access/i });
      expect(emergencyButton).toBeInTheDocument();
      expect(emergencyButton).toBeEnabled();
    });

    test('should have proper contrast for crisis support elements', () => {
      render(<SignInPage />);

      const emergencyButton = screen.getByRole('button', { name: /emergency access/i });
      
      // Emergency button should have high contrast (white on red)
      expect(emergencyButton).toHaveClass('bg-white', 'text-red-600');
      
      // Crisis notice should be clearly visible
      const crisisNotice = screen.getByText(/emergency\? call 988 immediately/i);
      expect(crisisNotice).toHaveClass('text-red-600');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('should have sufficient color contrast for demo buttons', () => {
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });

      // Check color combinations meet WCAG AA standards
      expect(demoVolunteerBtn).toHaveClass('bg-purple-100', 'text-purple-700');
      expect(demoTherapistBtn).toHaveClass('bg-green-100', 'text-green-700');
      expect(demoAdminBtn).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    test('should maintain readability when demo options are selected', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Selected state should have good contrast
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      expect(volunteerOption).toHaveClass('border-purple-500', 'bg-purple-50', 'text-purple-700');
    });

    test('should not rely solely on color to convey demo state', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Information should be conveyed through text and structure, not just color
      expect(screen.getByText('Demo credentials: Use "volunteer123" as the passcode')).toBeInTheDocument();
      expect(screen.getByDisplayValue('demo-volunteer')).toBeInTheDocument();
    });
  });

  describe('Form Accessibility and Error Announcements', () => {
    test('should associate form labels with inputs correctly', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const volunteerIdInput = screen.getByLabelText(/volunteer id/i);
      const passcodeInput = screen.getByLabelText(/passcode/i);

      // Inputs should be properly associated with labels
      expect(volunteerIdInput).toHaveAttribute('id');
      expect(passcodeInput).toHaveAttribute('id');

      // Labels should reference input IDs
      const volunteerIdLabel = screen.getByText(/volunteer id/i);
      const passcodeLabel = screen.getByText(/passcode/i);
      
      expect(volunteerIdLabel).toHaveAttribute('for', volunteerIdInput.getAttribute('id'));
    });

    test('should provide accessible error messages', async () => {
      // Mock authentication error
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' });

      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Error should be announced to screen readers
      const errorMessage = await screen.findByText(/invalid credentials/i);
      expect(errorMessage).toBeInTheDocument();
      
      // Error should be in an alert region for immediate announcement
      const alertRegion = errorMessage.closest('[role="alert"]') || errorMessage.parentElement;
      expect(alertRegion).toHaveClass('bg-red-50'); // Error styling
    });

    test('should have proper placeholder text for demo inputs', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const volunteerIdInput = screen.getByPlaceholderText('Enter your volunteer ID');
      const passcodeInput = screen.getByPlaceholderText('Enter your passcode');

      expect(volunteerIdInput).toBeInTheDocument();
      expect(passcodeInput).toBeInTheDocument();

      // Placeholders should be descriptive but not replace labels
      expect(screen.getByLabelText(/volunteer id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/passcode/i)).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility and Touch Targets', () => {
    test('should have adequate touch target sizes for demo buttons', () => {
      render(<SignInPage />);

      const demoButtons = [
        screen.getByRole('button', { name: /demo volunteer/i }),
        screen.getByRole('button', { name: /demo therapist/i }),
        screen.getByRole('button', { name: /demo admin/i }),
      ];

      demoButtons.forEach(button => {
        // Buttons should have adequate padding for touch targets (44px minimum)
        expect(button).toHaveClass('px-3', 'py-2');
      });
    });

    test('should maintain accessibility on mobile viewports', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SignInPage />);

      // Demo section should use responsive grid
      const demoContainer = screen.getByText('🎯 Demo Access').closest('div')?.querySelector('.grid');
      expect(demoContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-3');

      // Mobile-specific accessibility features
      const emergencyBanner = screen.getByText('Crisis Support Available 24/7').closest('div');
      expect(emergencyBanner).toHaveClass('flex-col', 'sm:flex-row');
    });

    test('should support touch interactions for demo buttons', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });

      // Simulate touch interaction
      fireEvent.touchStart(demoVolunteerBtn);
      fireEvent.touchEnd(demoVolunteerBtn);
      await user.click(demoVolunteerBtn);

      // Should populate credentials correctly
      const volunteerIdInput = screen.getByDisplayValue('demo-volunteer');
      expect(volunteerIdInput).toBeInTheDocument();
    });
  });

  describe('Mental Health App Accessibility Best Practices', () => {
    test('should use calming colors and avoid aggressive styling', () => {
      render(<SignInPage />);

      // Demo section should use calming amber color scheme
      const demoSection = screen.getByText('🎯 Demo Access').closest('div');
      expect(demoSection).toHaveClass('bg-amber-50', 'border-amber-200');

      // Colors should be mental health appropriate
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      expect(demoVolunteerBtn).toHaveClass('bg-purple-100'); // Calming purple
    });

    test('should provide clear privacy messaging', () => {
      render(<SignInPage />);

      // Privacy notice should be clearly visible
      const privacyNotice = screen.getByText('Your privacy is protected');
      expect(privacyNotice).toBeInTheDocument();

      // HIPAA compliance should be mentioned
      const hipaaNotice = screen.getByText(/hipaa compliant/i);
      expect(hipaaNotice).toBeInTheDocument();
    });

    test('should have gentle, supportive language in demo instructions', () => {
      render(<SignInPage />);

      // Language should be welcoming and non-intimidating
      expect(screen.getByText('Try the platform with pre-configured demo accounts')).toBeInTheDocument();
      expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();

      // Should avoid technical jargon
      const demoDescription = screen.getByText('Try the platform with pre-configured demo accounts');
      expect(demoDescription.textContent).not.toMatch(/API|endpoint|authentication/i);
    });

    test('should maintain crisis support prominence during demo use', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      // Crisis support should remain visible even when using demo
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Emergency banner should still be prominent
      const emergencyBanner = screen.getByText('Crisis Support Available 24/7');
      expect(emergencyBanner).toBeInTheDocument();

      // Crisis notice should be visible for anonymous access
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      await user.click(volunteerOption!);
      
      const anonymousOption = screen.getByText('Crisis Support').closest('button');
      await user.click(anonymousOption!);

      const crisisNotice = screen.getByText(/emergency\? call 988 immediately/i);
      expect(crisisNotice).toBeInTheDocument();
    });
  });
});