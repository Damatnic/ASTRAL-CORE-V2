/**
 * Database Schema & Models Testing
 * Tests all Prisma models, relationships, constraints, and indexes
 */

import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

describe('Database Schema & Models', () => {
  let prisma: PrismaClient;
  
  beforeAll(async () => {
    // Use test database
    prisma = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL || 'file:./test.db',
    });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.$executeRaw`DELETE FROM crisis_sessions WHERE anonymous_id LIKE 'test_%'`;
    await prisma.$executeRaw`DELETE FROM users WHERE anonymous_id LIKE 'test_%'`;
  });

  describe('Crisis Session Model', () => {
    test('should create crisis session with all required fields', async () => {
      const sessionData = {
        sessionToken: crypto.randomBytes(32).toString('hex'),
        anonymousId: 'test_anonymous_' + Date.now(),
        severity: 8,
        status: 'ACTIVE' as const,
        startedAt: new Date(),
      };

      const session = await prisma.crisisSession.create({
        data: sessionData,
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.sessionToken).toBe(sessionData.sessionToken);
      expect(session.severity).toBe(8);
      expect(session.status).toBe('ACTIVE');
    });

    test('should enforce unique constraints on sessionToken', async () => {
      const token = crypto.randomBytes(32).toString('hex');
      
      await prisma.crisisSession.create({
        data: {
          sessionToken: token,
          anonymousId: 'test_anon_1',
          severity: 5,
        },
      });

      await expect(
        prisma.crisisSession.create({
          data: {
            sessionToken: token, // Same token
            anonymousId: 'test_anon_2',
            severity: 6,
          },
        })
      ).rejects.toThrow();
    });

    test('should support encrypted fields', async () => {
      const encryptedData = Buffer.from('encrypted_conversation_data');
      const salt = crypto.randomBytes(16);

      const session = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_encrypted_' + Date.now(),
          severity: 7,
          encryptedData: encryptedData,
          keyDerivationSalt: salt,
        },
      });

      expect(session.encryptedData).toEqual(encryptedData);
      expect(session.keyDerivationSalt).toEqual(salt);
    });

    test('should track emergency escalation', async () => {
      const session = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_emergency_' + Date.now(),
          severity: 10,
          emergencyTriggered: true,
          escalatedAt: new Date(),
          escalationType: 'EMERGENCY_SERVICES',
        },
      });

      expect(session.emergencyTriggered).toBe(true);
      expect(session.escalatedAt).toBeDefined();
      expect(session.escalationType).toBe('EMERGENCY_SERVICES');
    });

    test('should have proper indexes for performance', async () => {
      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 100; i++) {
        sessions.push({
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: `test_perf_${i}`,
          severity: Math.floor(Math.random() * 10) + 1,
          status: i % 2 === 0 ? 'ACTIVE' : 'RESOLVED' as const,
          emergencyTriggered: i % 10 === 0,
        });
      }

      await prisma.crisisSession.createMany({ data: sessions });

      // Test indexed queries performance
      const startTime = performance.now();
      
      // Query by status and severity (indexed)
      await prisma.crisisSession.findMany({
        where: {
          status: 'ACTIVE',
          severity: { gte: 7 },
        },
      });

      const queryTime = performance.now() - startTime;
      expect(queryTime).toBeLessThan(50); // Should be fast due to index
    });
  });

  describe('Crisis Message Model', () => {
    let testSessionId: string;

    beforeEach(async () => {
      const session = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_msg_session_' + Date.now(),
          severity: 5,
        },
      });
      testSessionId = session.id;
    });

    test('should create crisis message with encryption', async () => {
      const encryptedContent = Buffer.from('encrypted message content');
      const messageHash = crypto.createHash('sha256')
        .update('message content')
        .digest('hex');

      const message = await prisma.crisisMessage.create({
        data: {
          sessionId: testSessionId,
          senderType: 'ANONYMOUS_USER',
          senderId: 'test_user_123',
          encryptedContent: encryptedContent,
          messageHash: messageHash,
          messageType: 'TEXT',
          priority: 'HIGH',
          sentimentScore: -0.8,
          riskScore: 8,
          riskLevel: 'HIGH',
        },
      });

      expect(message.encryptedContent).toEqual(encryptedContent);
      expect(message.messageHash).toBe(messageHash);
      expect(message.riskScore).toBe(8);
    });

    test('should cascade delete messages when session deleted', async () => {
      // Create messages
      await prisma.crisisMessage.createMany({
        data: [
          {
            sessionId: testSessionId,
            senderType: 'ANONYMOUS_USER',
            senderId: 'user1',
            encryptedContent: Buffer.from('msg1'),
            messageHash: 'hash1',
          },
          {
            sessionId: testSessionId,
            senderType: 'VOLUNTEER',
            senderId: 'volunteer1',
            encryptedContent: Buffer.from('msg2'),
            messageHash: 'hash2',
          },
        ],
      });

      // Verify messages exist
      const messagesBefore = await prisma.crisisMessage.findMany({
        where: { sessionId: testSessionId },
      });
      expect(messagesBefore).toHaveLength(2);

      // Delete session
      await prisma.crisisSession.delete({
        where: { id: testSessionId },
      });

      // Verify messages are deleted
      const messagesAfter = await prisma.crisisMessage.findMany({
        where: { sessionId: testSessionId },
      });
      expect(messagesAfter).toHaveLength(0);
    });
  });

  describe('User Model', () => {
    test('should create anonymous user', async () => {
      const anonymousId = 'test_anon_user_' + Date.now();
      
      const user = await prisma.user.create({
        data: {
          anonymousId: anonymousId,
          isAnonymous: true,
          dataSharing: 'MINIMAL',
          allowAnalytics: false,
        },
      });

      expect(user.anonymousId).toBe(anonymousId);
      expect(user.isAnonymous).toBe(true);
      expect(user.email).toBeNull();
    });

    test('should create registered user with email', async () => {
      const email = `test_${Date.now()}@example.com`;
      
      const user = await prisma.user.create({
        data: {
          email: email,
          username: 'testuser_' + Date.now(),
          isAnonymous: false,
          dataSharing: 'COMMUNITY_FEATURES',
        },
      });

      expect(user.email).toBe(email);
      expect(user.isAnonymous).toBe(false);
    });

    test('should enforce unique constraints', async () => {
      const email = `unique_test_${Date.now()}@example.com`;
      const username = 'unique_user_' + Date.now();

      await prisma.user.create({
        data: {
          email: email,
          username: username,
          isAnonymous: false,
        },
      });

      // Try to create user with same email
      await expect(
        prisma.user.create({
          data: {
            email: email,
            username: 'different_username',
            isAnonymous: false,
          },
        })
      ).rejects.toThrow();

      // Try to create user with same username
      await expect(
        prisma.user.create({
          data: {
            email: 'different@example.com',
            username: username,
            isAnonymous: false,
          },
        })
      ).rejects.toThrow();
    });

    test('should support encrypted profile data', async () => {
      const encryptedProfile = Buffer.from(JSON.stringify({
        age: 25,
        location: 'encrypted',
        preferences: 'encrypted',
      }));

      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_encrypted_user_' + Date.now(),
          isAnonymous: true,
          encryptedProfile: encryptedProfile,
        },
      });

      expect(user.encryptedProfile).toEqual(encryptedProfile);
    });

    test('should handle data retention settings', async () => {
      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_retention_' + Date.now(),
          isAnonymous: true,
          dataRetentionDays: 30, // GDPR compliance
        },
      });

      expect(user.dataRetentionDays).toBe(30);
    });
  });

  describe('Volunteer Model', () => {
    test('should create volunteer with verification status', async () => {
      const volunteer = await prisma.volunteer.create({
        data: {
          anonymousId: 'test_volunteer_' + Date.now(),
          status: 'TRAINING',
          trainingHours: 20.5,
          specializations: JSON.stringify(['crisis', 'anxiety']),
          languages: JSON.stringify(['en', 'es']),
          backgroundCheck: 'IN_PROGRESS',
          timezone: 'America/New_York',
        },
      });

      expect(volunteer.status).toBe('TRAINING');
      expect(volunteer.trainingHours).toBe(20.5);
      expect(volunteer.backgroundCheck).toBe('IN_PROGRESS');
    });

    test('should track volunteer performance metrics', async () => {
      const volunteer = await prisma.volunteer.create({
        data: {
          anonymousId: 'test_perf_volunteer_' + Date.now(),
          status: 'ACTIVE',
          sessionsCount: 150,
          hoursVolunteered: 300.5,
          averageRating: 4.8,
          responseRate: 0.92,
          burnoutScore: 0.3,
        },
      });

      expect(volunteer.sessionsCount).toBe(150);
      expect(volunteer.averageRating).toBe(4.8);
      expect(volunteer.burnoutScore).toBe(0.3);
    });

    test('should handle concurrent session limits', async () => {
      const volunteer = await prisma.volunteer.create({
        data: {
          anonymousId: 'test_concurrent_' + Date.now(),
          status: 'ACTIVE',
          isActive: true,
          currentLoad: 2,
          maxConcurrent: 3,
        },
      });

      expect(volunteer.currentLoad).toBeLessThanOrEqual(volunteer.maxConcurrent);
    });
  });

  describe('Safety Plan Model', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_safety_user_' + Date.now(),
          isAnonymous: true,
        },
      });
      testUserId = user.id;
    });

    test('should create encrypted safety plan', async () => {
      const encryptedContent = Buffer.from(JSON.stringify({
        warningSignals: ['feeling overwhelmed', 'isolation'],
        copingStrategies: ['breathing exercises', 'call friend'],
        emergencyContacts: ['encrypted'],
      }));
      const contentHash = crypto.createHash('sha256')
        .update(encryptedContent)
        .digest('hex');

      const safetyPlan = await prisma.safetyPlan.create({
        data: {
          userId: testUserId,
          title: 'My Safety Plan',
          version: 1,
          isActive: true,
          encryptedContent: encryptedContent,
          contentHash: contentHash,
        },
      });

      expect(safetyPlan.encryptedContent).toEqual(encryptedContent);
      expect(safetyPlan.contentHash).toBe(contentHash);
      expect(safetyPlan.isActive).toBe(true);
    });

    test('should support versioning', async () => {
      const safetyPlan = await prisma.safetyPlan.create({
        data: {
          userId: testUserId,
          title: 'Versioned Plan',
          version: 1,
          encryptedContent: Buffer.from('version 1'),
          contentHash: 'hash1',
        },
      });

      // Create version history
      await prisma.safetyPlanVersion.create({
        data: {
          safetyPlanId: safetyPlan.id,
          version: 1,
          encryptedContent: Buffer.from('version 1'),
          contentHash: 'hash1',
          createdBy: testUserId,
        },
      });

      const versions = await prisma.safetyPlanVersion.findMany({
        where: { safetyPlanId: safetyPlan.id },
      });

      expect(versions).toHaveLength(1);
    });
  });

  describe('Emergency Contact Model', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_emergency_user_' + Date.now(),
          isAnonymous: true,
        },
      });
      testUserId = user.id;
    });

    test('should store encrypted emergency contact', async () => {
      const salt = crypto.randomBytes(16);
      const encryptedName = Buffer.from('John Doe (encrypted)');
      const encryptedPhone = Buffer.from('+1234567890 (encrypted)');
      const encryptedEmail = Buffer.from('john@example.com (encrypted)');

      const contact = await prisma.emergencyContact.create({
        data: {
          userId: testUserId,
          encryptedName: encryptedName,
          encryptedPhone: encryptedPhone,
          encryptedEmail: encryptedEmail,
          relationship: 'spouse',
          priority: 1,
          contactMethod: 'phone',
          autoNotify: true,
          crisisOnly: false,
          hasConsent: true,
          consentDate: new Date(),
          keyDerivationSalt: salt,
        },
      });

      expect(contact.encryptedName).toEqual(encryptedName);
      expect(contact.encryptedPhone).toEqual(encryptedPhone);
      expect(contact.autoNotify).toBe(true);
      expect(contact.priority).toBe(1);
    });
  });

  describe('Database Performance', () => {
    test('should handle bulk inserts efficiently', async () => {
      const startTime = performance.now();
      
      // Create 1000 mood entries in bulk
      const moodEntries = [];
      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_bulk_user_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      for (let i = 0; i < 1000; i++) {
        moodEntries.push({
          userId: userId,
          mood: Math.floor(Math.random() * 10) + 1,
          emotions: JSON.stringify({ happy: Math.random() }),
          triggers: JSON.stringify(['test']),
          activities: JSON.stringify(['bulk test']),
        });
      }

      await prisma.moodEntry.createMany({ data: moodEntries });
      
      const bulkInsertTime = performance.now() - startTime;
      expect(bulkInsertTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should query with pagination efficiently', async () => {
      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_pagination_user_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      // Create test data
      const entries = [];
      for (let i = 0; i < 100; i++) {
        entries.push({
          userId: userId,
          mood: Math.floor(Math.random() * 10) + 1,
          emotions: JSON.stringify({}),
          triggers: JSON.stringify([]),
          activities: JSON.stringify([]),
        });
      }
      await prisma.moodEntry.createMany({ data: entries });

      // Test pagination query
      const startTime = performance.now();
      
      const page1 = await prisma.moodEntry.findMany({
        where: { userId: userId },
        orderBy: { timestamp: 'desc' },
        skip: 0,
        take: 20,
      });

      const page2 = await prisma.moodEntry.findMany({
        where: { userId: userId },
        orderBy: { timestamp: 'desc' },
        skip: 20,
        take: 20,
      });

      const paginationTime = performance.now() - startTime;
      
      expect(page1).toHaveLength(20);
      expect(page2).toHaveLength(20);
      expect(paginationTime).toBeLessThan(100); // Should be very fast
    });

    test('should handle complex joins efficiently', async () => {
      // Create test data
      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_join_user_' + Date.now(),
          isAnonymous: true,
        },
      });

      const safetyPlan = await prisma.safetyPlan.create({
        data: {
          userId: user.id,
          title: 'Test Plan',
          encryptedContent: Buffer.from('test'),
          contentHash: 'hash',
        },
      });

      await prisma.moodEntry.createMany({
        data: Array(10).fill(null).map(() => ({
          userId: user.id,
          mood: 5,
          emotions: JSON.stringify({}),
          triggers: JSON.stringify([]),
          activities: JSON.stringify([]),
        })),
      });

      // Complex query with joins
      const startTime = performance.now();
      
      const userWithRelations = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          moodEntries: {
            orderBy: { timestamp: 'desc' },
            take: 5,
          },
          safetyPlans: {
            where: { isActive: true },
          },
        },
      });

      const joinTime = performance.now() - startTime;
      
      expect(userWithRelations?.moodEntries).toHaveLength(5);
      expect(userWithRelations?.safetyPlans).toHaveLength(1);
      expect(joinTime).toBeLessThan(200); // Should complete quickly
    });
  });

  describe('Data Integrity', () => {
    test('should maintain referential integrity', async () => {
      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_integrity_' + Date.now(),
          isAnonymous: true,
        },
      });

      // Try to create mood entry with invalid user ID
      await expect(
        prisma.moodEntry.create({
          data: {
            userId: 'invalid-user-id',
            mood: 5,
            emotions: JSON.stringify({}),
            triggers: JSON.stringify([]),
            activities: JSON.stringify([]),
          },
        })
      ).rejects.toThrow();
    });

    test('should handle transaction rollback', async () => {
      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_transaction_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      try {
        await prisma.$transaction(async (tx) => {
          // First operation succeeds
          await tx.moodEntry.create({
            data: {
              userId: userId,
              mood: 5,
              emotions: JSON.stringify({}),
              triggers: JSON.stringify([]),
              activities: JSON.stringify([]),
            },
          });

          // Second operation fails (invalid data)
          await tx.moodEntry.create({
            data: {
              userId: 'invalid-id', // This will fail
              mood: 5,
              emotions: JSON.stringify({}),
              triggers: JSON.stringify([]),
              activities: JSON.stringify([]),
            },
          });
        });
      } catch (error) {
        // Transaction should have rolled back
      }

      // Verify no entries were created due to rollback
      const entries = await prisma.moodEntry.findMany({
        where: { userId: userId },
      });

      expect(entries).toHaveLength(0);
    });
  });
});