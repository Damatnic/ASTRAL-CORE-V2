/**
 * ASTRAL_CORE V2.0 - Demo Login System Tests
 * 
 * Comprehensive test suite for the demo login functionality
 * Phase 2 Testing: Validates all demo account types, UI interactions, and authentication flows
 * 
 * Critical paths tested:
 * - Demo button functionality and UI/UX
 * - Authentication integration for all demo account types
 * - Role-based access control and redirection
 * - Security and data isolation for demo accounts
 * - Accessibility compliance
 * - Error handling and edge cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SignInPage from '../page';

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
  getProviders: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock providers for OAuth testing
const mockProviders = {
  google: {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    signinUrl: '/api/auth/signin/google',
    callbackUrl: '/api/auth/callback/google',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    type: 'oauth',
    signinUrl: '/api/auth/signin/github',
    callbackUrl: '/api/auth/callback/github',
  },
};

describe('Demo Login System - Phase 2 Testing', () => {
  let mockSignIn: jest.MockedFunction<typeof signIn>;
  let mockPush: jest.Mock;
  let mockRefresh: jest.Mock;
  let mockGetProviders: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup NextAuth mocks
    mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: null });

    mockGetProviders = require('next-auth/react').getProviders;
    mockGetProviders.mockResolvedValue(mockProviders);

    // Setup router mocks
    mockPush = jest.fn();
    mockRefresh = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });

    // Setup search params mock
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });
  });

  describe('Demo Button Functionality Testing', () => {
    test('should render demo section with all three demo buttons', async () => {
      render(<SignInPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Check demo section description
      expect(screen.getByText('Try the platform with pre-configured demo accounts')).toBeInTheDocument();

      // Check all three demo buttons are present
      expect(screen.getByRole('button', { name: /demo volunteer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /demo therapist/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /demo admin/i })).toBeInTheDocument();
    });

    test('should populate volunteer credentials when Demo Volunteer button is clicked', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Volunteer button
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Check that volunteer auth type is selected
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      expect(volunteerOption).toHaveClass('border-purple-500', 'bg-purple-50', 'text-purple-700');

      // Check credentials are populated
      const volunteerIdInput = screen.getByPlaceholderText('Enter your volunteer ID');
      const passcodeInput = screen.getByPlaceholderText('Enter your passcode');

      expect(volunteerIdInput).toHaveValue('demo-volunteer');
      expect(passcodeInput).toHaveValue('volunteer123');
    });

    test('should populate therapist credentials when Demo Therapist button is clicked', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Therapist button
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      await user.click(demoTherapistBtn);

      // Check that therapist auth type is selected
      const therapistOption = screen.getByText('Therapist Portal').closest('button');
      expect(therapistOption).toHaveClass('border-green-500', 'bg-green-50', 'text-green-700');

      // Check credentials are populated
      const licenseIdInput = screen.getByPlaceholderText('Enter your license ID');
      const passcodeInput = screen.getByPlaceholderText('Enter your passcode');

      expect(licenseIdInput).toHaveValue('demo-therapist');
      expect(passcodeInput).toHaveValue('therapist123');
    });

    test('should populate admin credentials when Demo Admin button is clicked', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Admin button
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });
      await user.click(demoAdminBtn);

      // Check that email auth type is selected
      const emailOption = screen.getByText('Email & Password').closest('button');
      expect(emailOption).toHaveClass('border-blue-500', 'bg-blue-50', 'text-blue-700');

      // Check credentials are populated
      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      const passwordInput = screen.getByPlaceholderText('Enter your password');

      expect(emailInput).toHaveValue('admin@astralcore.org');
      expect(passwordInput).toHaveValue('demo123');
    });

    test('should have proper styling and hover effects for demo buttons', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });

      // Check initial styling
      expect(demoVolunteerBtn).toHaveClass('bg-purple-100', 'text-purple-700');
      expect(demoTherapistBtn).toHaveClass('bg-green-100', 'text-green-700');
      expect(demoAdminBtn).toHaveClass('bg-blue-100', 'text-blue-700');

      // Check hover effects (simulate hover)
      await user.hover(demoVolunteerBtn);
      expect(demoVolunteerBtn).toHaveClass('hover:bg-purple-200');
    });
  });

  describe('Authentication Integration Testing', () => {
    test('should authenticate demo volunteer account successfully', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Volunteer button
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Click Sign In button
      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Verify correct signIn call
      expect(mockSignIn).toHaveBeenCalledWith('volunteer', {
        redirect: false,
        id: 'demo-volunteer',
        passcode: 'volunteer123',
      });

      // Verify redirection
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/volunteer');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    test('should authenticate demo therapist account successfully', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Therapist button
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      await user.click(demoTherapistBtn);

      // Click Sign In button
      const signInBtn = screen.getByRole('button', { name: /access therapist portal/i });
      await user.click(signInBtn);

      // Verify correct signIn call
      expect(mockSignIn).toHaveBeenCalledWith('therapist', {
        redirect: false,
        licenseId: 'demo-therapist',
        passcode: 'therapist123',
      });

      // Verify redirection
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/therapist');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    test('should authenticate demo admin account successfully', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Admin button
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });
      await user.click(demoAdminBtn);

      // Click Sign In button
      const signInBtn = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInBtn);

      // Verify correct signIn call
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@astralcore.org',
        password: 'demo123',
        callbackUrl: '/',
        redirect: false,
      });

      // Verify redirection
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    test('should handle authentication errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock authentication failure
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin', status: 401, url: null });
      
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Volunteer and sign in
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Check error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials. Please try again.')).toBeInTheDocument();
      });

      // Verify no redirection occurred
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should show loading state during authentication', async () => {
      const user = userEvent.setup();
      
      // Mock slow authentication
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, error: null, status: 200, url: null }), 1000)));
      
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Volunteer and sign in
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Check loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(signInBtn).toBeDisabled();
    });
  });

  describe('Role-Based Access Control and Redirection', () => {
    test('should redirect to correct dashboard for each user type', async () => {
      const testCases = [
        {
          buttonName: /demo volunteer/i,
          expectedPath: '/volunteer',
          authType: 'volunteer',
        },
        {
          buttonName: /demo therapist/i,
          expectedPath: '/therapist',
          authType: 'therapist',
        },
        {
          buttonName: /demo admin/i,
          expectedPath: '/',
          authType: 'email',
        },
      ];

      for (const testCase of testCases) {
        const user = userEvent.setup();
        render(<SignInPage />);

        await waitFor(() => {
          expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
        });

        // Clear previous mock calls
        mockPush.mockClear();
        mockRefresh.mockClear();

        // Click demo button and sign in
        const demoBtn = screen.getByRole('button', { name: testCase.buttonName });
        await user.click(demoBtn);

        const signInBtn = testCase.authType === 'email' 
          ? screen.getByRole('button', { name: /sign in/i })
          : screen.getByRole('button', { name: new RegExp(`access.*portal`, 'i') });
        
        await user.click(signInBtn);

        // Verify correct redirection
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(testCase.expectedPath);
        });
      }
    });

    test('should respect callback URL parameter for admin login', async () => {
      const user = userEvent.setup();
      
      // Mock search params with callback URL
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((param) => param === 'callbackUrl' ? '/admin/dashboard' : null),
      });

      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Click Demo Admin button
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });
      await user.click(demoAdminBtn);

      const signInBtn = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInBtn);

      // Verify callback URL is used
      expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
        callbackUrl: '/admin/dashboard',
      }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
      });
    });
  });

  describe('User Experience and Accessibility Testing', () => {
    test('should have proper ARIA labels and roles', async () => {
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Check demo buttons have proper roles
      const demoButtons = screen.getAllByRole('button');
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });

      expect(demoVolunteerBtn).toHaveAttribute('type', 'button');
      expect(demoTherapistBtn).toHaveAttribute('type', 'button');
      expect(demoAdminBtn).toHaveAttribute('type', 'button');

      // Check form inputs have proper labels
      const user = userEvent.setup();
      await user.click(demoVolunteerBtn);

      const volunteerIdInput = screen.getByLabelText(/volunteer id/i);
      const passcodeInput = screen.getByLabelText(/passcode/i);

      expect(volunteerIdInput).toBeInTheDocument();
      expect(passcodeInput).toBeInTheDocument();
    });

    test('should be keyboard navigable', async () => {
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });

      // Test keyboard navigation
      demoVolunteerBtn.focus();
      expect(document.activeElement).toBe(demoVolunteerBtn);

      // Test Enter key activation
      fireEvent.keyDown(demoVolunteerBtn, { key: 'Enter', code: 'Enter' });
      
      // Should populate volunteer credentials
      await waitFor(() => {
        const volunteerIdInput = screen.getByPlaceholderText('Enter your volunteer ID');
        expect(volunteerIdInput).toHaveValue('demo-volunteer');
      });
    });

    test('should display helpful instructions for demo accounts', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Check demo section has clear instructions
      expect(screen.getByText('Try the platform with pre-configured demo accounts')).toBeInTheDocument();

      // Click volunteer demo and check helper text
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      expect(screen.getByText('Demo credentials: Use "volunteer123" as the passcode')).toBeInTheDocument();

      // Check therapist demo helper text
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      await user.click(demoTherapistBtn);

      expect(screen.getByText('Demo credentials: Use "therapist123" as the passcode')).toBeInTheDocument();
    });
  });

  describe('Security and Data Isolation Testing', () => {
    test('should use secure demo credentials that match backend validation', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Test volunteer demo credentials
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Verify demo credentials match expected backend validation
      expect(mockSignIn).toHaveBeenCalledWith('volunteer', {
        redirect: false,
        id: 'demo-volunteer',
        passcode: 'volunteer123',
      });

      // Test therapist demo credentials
      mockSignIn.mockClear();
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });
      await user.click(demoTherapistBtn);

      const therapistSignInBtn = screen.getByRole('button', { name: /access therapist portal/i });
      await user.click(therapistSignInBtn);

      expect(mockSignIn).toHaveBeenCalledWith('therapist', {
        redirect: false,
        licenseId: 'demo-therapist',
        passcode: 'therapist123',
      });
    });

    test('should prevent unauthorized access with invalid demo credentials', async () => {
      const user = userEvent.setup();
      
      // Mock authentication failure for invalid credentials
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Invalid credentials', status: 401, url: null });
      
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Manually enter invalid credentials
      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      // Modify credentials to invalid ones
      const passcodeInput = screen.getByPlaceholderText('Enter your passcode');
      await user.clear(passcodeInput);
      await user.type(passcodeInput, 'invalid123');

      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials. Please try again.')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    test('should not expose sensitive information in demo mode', async () => {
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Check that demo credentials are clearly marked as demo
      expect(screen.getByText(/demo access/i)).toBeInTheDocument();
      expect(screen.getByText(/try the platform with pre-configured demo accounts/i)).toBeInTheDocument();

      // Verify demo emails use demo domain
      const user = userEvent.setup();
      const demoAdminBtn = screen.getByRole('button', { name: /demo admin/i });
      await user.click(demoAdminBtn);

      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      expect(emailInput).toHaveValue('admin@astralcore.org');
      // Demo email should be clearly identifiable as demo
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      mockSignIn.mockRejectedValueOnce(new Error('Network error'));
      
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      await user.click(demoVolunteerBtn);

      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      await user.click(signInBtn);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    test('should disable sign in button when credentials are incomplete', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      // Select volunteer option without using demo button
      const volunteerOption = screen.getByText('Volunteer Access').closest('button');
      await user.click(volunteerOption!);

      // Sign in button should be disabled with empty credentials
      const signInBtn = screen.getByRole('button', { name: /access volunteer portal/i });
      expect(signInBtn).toBeDisabled();

      // Fill only ID, should still be disabled
      const volunteerIdInput = screen.getByPlaceholderText('Enter your volunteer ID');
      await user.type(volunteerIdInput, 'test-id');
      expect(signInBtn).toBeDisabled();

      // Fill passcode, should be enabled
      const passcodeInput = screen.getByPlaceholderText('Enter your passcode');
      await user.type(passcodeInput, 'test-passcode');
      expect(signInBtn).toBeEnabled();
    });

    test('should handle rapid clicking of demo buttons without race conditions', async () => {
      const user = userEvent.setup();
      render(<SignInPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Demo Access')).toBeInTheDocument();
      });

      const demoVolunteerBtn = screen.getByRole('button', { name: /demo volunteer/i });
      const demoTherapistBtn = screen.getByRole('button', { name: /demo therapist/i });

      // Rapidly click different demo buttons
      await user.click(demoVolunteerBtn);
      await user.click(demoTherapistBtn);
      await user.click(demoVolunteerBtn);

      // Should end up in volunteer state
      const volunteerIdInput = screen.getByPlaceholderText('Enter your volunteer ID');
      expect(volunteerIdInput).toHaveValue('demo-volunteer');
    });
  });
});