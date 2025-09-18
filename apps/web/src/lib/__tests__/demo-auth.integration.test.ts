/**
 * ASTRAL_CORE V2.0 - Demo Authentication Integration Tests
 * 
 * Tests the NextAuth integration and backend authentication flow for demo accounts
 * Validates that demo credentials work correctly with the authentication system
 * 
 * Critical paths tested:
 * - Demo credential validation in NextAuth providers
 * - Session creation for demo users
 * - Role assignment and user metadata
 * - Authentication callbacks and redirects
 * - Security isolation for demo accounts
 */

import { authOptions } from '../auth';
import { NextAuthOptions } from 'next-auth';

// Mock Prisma adapter and database
const mockPrismaAdapter = {
  createUser: jest.fn(),
  getUser: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserByAccount: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  linkAccount: jest.fn(),
  unlinkAccount: jest.fn(),
  createSession: jest.fn(),
  getSessionAndUser: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  createVerificationToken: jest.fn(),
  useVerificationToken: jest.fn(),
};

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockReturnValue({
        catch: jest.fn(),
      }),
    },
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-random-string'),
  }),
}));

describe('Demo Authentication Integration Tests', () => {
  let volunteerProvider: any;
  let therapistProvider: any;
  let credentialsProvider: any;
  let anonymousProvider: any;

  beforeAll(() => {
    // Extract providers from authOptions
    const providers = authOptions.providers;
    volunteerProvider = providers.find(p => p.id === 'volunteer');
    therapistProvider = providers.find(p => p.id === 'therapist');
    credentialsProvider = providers.find(p => p.id === 'credentials');
    anonymousProvider = providers.find(p => p.id === 'anonymous');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Demo Volunteer Authentication', () => {
    test('should authenticate valid demo volunteer credentials', async () => {
      const credentials = {
        id: 'demo-volunteer',
        passcode: 'volunteer123',
      };

      const result = await volunteerProvider.authorize(credentials);

      expect(result).toEqual({
        id: 'demo-volunteer',
        name: 'Volunteer demo-volunteer',
        email: 'volunteerdemo-volunteer@astralcore.demo',
        image: null,
        isVolunteer: true,
        volunteerId: 'demo-volunteer',
      });
    });

    test('should reject invalid volunteer credentials', async () => {
      const invalidCredentials = [
        { id: 'demo-volunteer', passcode: 'wrong-password' },
        { id: 'invalid-volunteer', passcode: 'volunteer123' },
        { id: '', passcode: 'volunteer123' },
        { id: 'demo-volunteer', passcode: '' },
      ];

      for (const credentials of invalidCredentials) {
        const result = await volunteerProvider.authorize(credentials);
        expect(result).toBeNull();
      }
    });

    test('should work with any volunteer ID when using demo passcode', async () => {
      const customVolunteerCredentials = {
        id: 'custom-volunteer-id',
        passcode: 'volunteer123',
      };

      const result = await volunteerProvider.authorize(customVolunteerCredentials);

      expect(result).toEqual({
        id: 'custom-volunteer-id',
        name: 'Volunteer custom-volunteer-id',
        email: 'volunteercustom-volunteer-id@astralcore.demo',
        image: null,
        isVolunteer: true,
        volunteerId: 'custom-volunteer-id',
      });
    });
  });

  describe('Demo Therapist Authentication', () => {
    test('should authenticate valid demo therapist credentials', async () => {
      const credentials = {
        licenseId: 'demo-therapist',
        passcode: 'therapist123',
      };

      const result = await therapistProvider.authorize(credentials);

      expect(result).toEqual({
        id: 'demo-therapist',
        name: 'Dr. demo-therapist',
        email: 'therapistdemo-therapist@astralcore.demo',
        image: null,
        isTherapist: true,
        licenseId: 'demo-therapist',
      });
    });

    test('should reject invalid therapist credentials', async () => {
      const invalidCredentials = [
        { licenseId: 'demo-therapist', passcode: 'wrong-password' },
        { licenseId: 'invalid-therapist', passcode: 'therapist123' },
        { licenseId: '', passcode: 'therapist123' },
        { licenseId: 'demo-therapist', passcode: '' },
      ];

      for (const credentials of invalidCredentials) {
        const result = await therapistProvider.authorize(credentials);
        expect(result).toBeNull();
      }
    });

    test('should work with any license ID when using demo passcode', async () => {
      const customTherapistCredentials = {
        licenseId: 'LIC123456',
        passcode: 'therapist123',
      };

      const result = await therapistProvider.authorize(customTherapistCredentials);

      expect(result).toEqual({
        id: 'LIC123456',
        name: 'Dr. LIC123456',
        email: 'therapistLIC123456@astralcore.demo',
        image: null,
        isTherapist: true,
        licenseId: 'LIC123456',
      });
    });
  });

  describe('Demo Admin Authentication (Email/Password)', () => {
    test('should authenticate when database user exists for demo admin', async () => {
      const bcrypt = require('bcryptjs');
      const { prisma } = require('@/lib/db');

      // Mock successful database lookup
      const mockUser = {
        id: 1,
        name: 'Demo Admin',
        email: 'admin@astralcore.org',
        password: 'hashed-demo123',
        emailVerified: new Date(),
        role: 'ADMIN',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const credentials = {
        email: 'admin@astralcore.org',
        password: 'demo123',
      };

      const result = await credentialsProvider.authorize(credentials);

      expect(result).toEqual({
        id: '1',
        name: 'Demo Admin',
        email: 'admin@astralcore.org',
        image: mockUser.image,
        isVolunteer: false,
        isTherapist: false,
        role: 'ADMIN',
        volunteerId: undefined,
        licenseId: undefined,
      });
    });

    test('should reject invalid admin credentials', async () => {
      const bcrypt = require('bcryptjs');
      const { prisma } = require('@/lib/db');

      // Mock failed password comparison
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@astralcore.org',
        password: 'hashed-demo123',
        emailVerified: new Date(),
      });
      bcrypt.compare.mockResolvedValue(false);

      const credentials = {
        email: 'admin@astralcore.org',
        password: 'wrong-password',
      };

      const result = await credentialsProvider.authorize(credentials);
      expect(result).toBeNull();
    });

    test('should reject unverified email addresses', async () => {
      const bcrypt = require('bcryptjs');
      const { prisma } = require('@/lib/db');

      // Mock unverified user
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@astralcore.org',
        password: 'hashed-demo123',
        emailVerified: null, // Not verified
      });
      bcrypt.compare.mockResolvedValue(true);

      const credentials = {
        email: 'admin@astralcore.org',
        password: 'demo123',
      };

      await expect(credentialsProvider.authorize(credentials)).rejects.toThrow(
        'Please verify your email before signing in.'
      );
    });
  });

  describe('Anonymous Access Authentication', () => {
    test('should create anonymous session for crisis access', async () => {
      const credentials = {
        type: 'anonymous',
      };

      const result = await anonymousProvider.authorize(credentials);

      expect(result).toEqual({
        id: 'mock-random-string',
        name: 'Anonymous User',
        email: null,
        image: null,
        isAnonymous: true,
        sessionToken: 'mock-random-string',
      });
    });

    test('should work without any credentials for anonymous access', async () => {
      const result = await anonymousProvider.authorize({});

      expect(result).toEqual({
        id: 'mock-random-string',
        name: 'Anonymous User',
        email: null,
        image: null,
        isAnonymous: true,
        sessionToken: 'mock-random-string',
      });
    });
  });

  describe('Session and Callback Integration', () => {
    test('should handle signIn callback for anonymous users', async () => {
      const signInCallback = authOptions.callbacks?.signIn;
      
      if (signInCallback) {
        const anonymousUser = {
          id: 'anon-123',
          name: 'Anonymous User',
          email: null,
          isAnonymous: true,
        };

        const result = await signInCallback({
          user: anonymousUser,
          account: { provider: 'anonymous' },
          profile: undefined,
        });

        expect(result).toBe(true);
      }
    });

    test('should handle signIn callback for OAuth users', async () => {
      const { prisma } = require('@/lib/db');
      const signInCallback = authOptions.callbacks?.signIn;

      if (signInCallback) {
        // Mock no existing user
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({
          id: 1,
          email: 'oauth-user@example.com',
          name: 'OAuth User',
        });

        const oauthUser = {
          id: 'oauth-123',
          name: 'OAuth User',
          email: 'oauth-user@example.com',
        };

        const account = {
          provider: 'google',
          providerAccountId: 'google-123',
        };

        const result = await signInCallback({
          user: oauthUser,
          account,
          profile: undefined,
        });

        expect(result).toBe(true);
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: {
            email: 'oauth-user@example.com',
            name: 'OAuth User',
            image: undefined,
            emailVerified: expect.any(Date),
            role: 'USER',
            provider: 'GOOGLE',
            providerId: 'google-123',
          },
        });
      }
    });

    test('should handle session callback correctly', async () => {
      const sessionCallback = authOptions.callbacks?.session;

      if (sessionCallback) {
        const mockSession = {
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: '2024-01-01',
        };

        const mockUser = {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        };

        const result = await sessionCallback({
          session: mockSession,
          user: mockUser,
        });

        expect(result.user).toEqual({
          ...mockSession.user,
          id: 'user-123',
          isAnonymous: false,
          isVolunteer: false,
          isTherapist: false,
          role: 'USER',
          volunteerId: undefined,
          licenseId: undefined,
        });
      }
    });

    test('should handle redirect callback for secure redirects', async () => {
      const redirectCallback = authOptions.callbacks?.redirect;

      if (redirectCallback) {
        const baseUrl = 'https://astralcore.org';

        // Test internal redirects
        expect(await redirectCallback({ url: '/dashboard', baseUrl })).toBe(`${baseUrl}/dashboard`);
        expect(await redirectCallback({ url: 'https://astralcore.org/admin', baseUrl })).toBe('https://astralcore.org/admin');

        // Test external redirect prevention
        expect(await redirectCallback({ url: 'https://malicious.com', baseUrl })).toBe(baseUrl);
        expect(await redirectCallback({ url: 'javascript:alert(1)', baseUrl })).toBe(baseUrl);
      }
    });
  });

  describe('Security and Audit Logging', () => {
    test('should log successful sign-in events', async () => {
      const { prisma } = require('@/lib/db');
      const signInEvent = authOptions.events?.signIn;

      if (signInEvent) {
        const mockAuditCreate = jest.fn().mockReturnValue({
          catch: jest.fn(),
        });
        prisma.auditLog.create = mockAuditCreate;

        await signInEvent({
          user: { id: 'demo-volunteer' },
          account: { provider: 'volunteer' },
          profile: undefined,
          isNewUser: false,
        });

        expect(mockAuditCreate).toHaveBeenCalledWith({
          data: {
            action: 'USER_SIGNIN',
            userId: 'demo-volunteer',
            details: {
              provider: 'volunteer',
              isNewUser: false,
              userAgent: 'NextAuth',
              timestamp: expect.any(String),
            },
            severity: 'INFO',
          },
        });
      }
    });

    test('should log sign-out events', async () => {
      const { prisma } = require('@/lib/db');
      const signOutEvent = authOptions.events?.signOut;

      if (signOutEvent) {
        const mockAuditCreate = jest.fn().mockReturnValue({
          catch: jest.fn(),
        });
        prisma.auditLog.create = mockAuditCreate;

        await signOutEvent({
          session: { user: { id: 'demo-volunteer' } },
        });

        expect(mockAuditCreate).toHaveBeenCalledWith({
          data: {
            action: 'USER_SIGNOUT',
            userId: 'demo-volunteer',
            details: {
              timestamp: expect.any(String),
            },
            severity: 'INFO',
          },
        });
      }
    });

    test('should handle audit logging failures gracefully', async () => {
      const { prisma } = require('@/lib/db');
      const signInEvent = authOptions.events?.signIn;

      if (signInEvent) {
        // Mock audit logging failure
        prisma.auditLog.create.mockRejectedValue(new Error('Database error'));

        // Should not throw error
        await expect(signInEvent({
          user: { id: 'demo-volunteer' },
          account: { provider: 'volunteer' },
          profile: undefined,
          isNewUser: false,
        })).resolves.not.toThrow();
      }
    });
  });

  describe('Demo Account Isolation and Security', () => {
    test('should ensure demo accounts use demo email domains', () => {
      const demoVolunteerResult = volunteerProvider.authorize({
        id: 'demo-volunteer',
        passcode: 'volunteer123',
      });

      const demoTherapistResult = therapistProvider.authorize({
        licenseId: 'demo-therapist',
        passcode: 'therapist123',
      });

      expect(demoVolunteerResult.email).toContain('@astralcore.demo');
      expect(demoTherapistResult.email).toContain('@astralcore.demo');
    });

    test('should prevent access to real user data for demo accounts', async () => {
      // Demo accounts should not trigger database lookups for real users
      const { prisma } = require('@/lib/db');

      await volunteerProvider.authorize({
        id: 'demo-volunteer',
        passcode: 'volunteer123',
      });

      await therapistProvider.authorize({
        licenseId: 'demo-therapist',
        passcode: 'therapist123',
      });

      // Verify no database queries were made for demo accounts
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    test('should use predictable but secure demo identifiers', async () => {
      const crypto = require('crypto');

      // Reset crypto mock to return predictable values
      crypto.randomBytes.mockReturnValueOnce({
        toString: jest.fn().mockReturnValue('demo-session-token'),
      });

      const anonymousResult = await anonymousProvider.authorize({});

      expect(anonymousResult.sessionToken).toBe('demo-session-token');
      expect(anonymousResult.id).toBe('demo-session-token');
    });
  });
});