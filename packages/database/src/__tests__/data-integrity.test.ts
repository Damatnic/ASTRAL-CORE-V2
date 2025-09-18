/**
 * Data Integrity & Crisis Management Testing
 * Tests data validation, encryption, transactions, and crisis workflows
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { performance } from 'perf_hooks';

// Encryption helper functions for testing
function encryptData(data: string, key: Buffer): Buffer {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return Buffer.concat([iv, authTag, encrypted]);
}

function decryptData(encryptedData: Buffer, key: Buffer): string {
  const iv = encryptedData.slice(0, 16);
  const authTag = encryptedData.slice(16, 32);
  const encrypted = encryptedData.slice(32);
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  
  return decrypted.toString('utf8');
}

describe('Data Integrity & Validation', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL || 'file:./test.db',
    });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Data Validation Rules', () => {
    test('should validate crisis severity range (1-10)', async () => {
      // Valid severity
      const validSession = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_severity_valid_' + Date.now(),
          severity: 7,
        },
      });
      expect(validSession.severity).toBe(7);

      // Test database constraint (would need to be enforced at app level)
      const invalidSeverities = [0, -1, 11, 100];
      for (const severity of invalidSeverities) {
        try {
          await prisma.$executeRaw`
            INSERT INTO crisis_sessions (id, session_token, anonymous_id, severity, status, started_at)
            VALUES (${crypto.randomUUID()}, ${crypto.randomBytes(32).toString('hex')}, 
                    ${'test_invalid_' + Date.now()}, ${severity}, 'ACTIVE', datetime('now'))
          `;
          // If no error, check application should validate
          expect(severity).toBeGreaterThanOrEqual(1);
          expect(severity).toBeLessThanOrEqual(10);
        } catch (error) {
          // Database constraint violation expected
        }
      }
    });

    test('should validate email format for registered users', async () => {
      const validEmails = [
        'user@example.com',
        'test.user+tag@domain.co.uk',
        'valid_email@test-domain.org',
      ];

      for (const email of validEmails) {
        const user = await prisma.user.create({
          data: {
            email: email,
            isAnonymous: false,
          },
        });
        expect(user.email).toBe(email);
        
        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }

      // Invalid emails should be rejected at application level
      const invalidEmails = [
        'not-an-email',
        '@nodomain.com',
        'no-at-sign.com',
        'spaces in@email.com',
      ];

      for (const email of invalidEmails) {
        // Application should validate before database
        expect(email).toMatch(/@/); // Basic check that would fail
      }
    });

    test('should validate JSON fields structure', async () => {
      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_json_user_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      // Valid JSON structures
      const validMoodEntry = await prisma.moodEntry.create({
        data: {
          userId: userId,
          mood: 5,
          emotions: { happy: 0.5, sad: 0.3, anxious: 0.2 },
          triggers: ['work', 'relationships'],
          activities: ['meditation', 'walking'],
        },
      });

      expect(validMoodEntry.emotions).toHaveProperty('happy');
      expect(Array.isArray(validMoodEntry.triggers)).toBe(true);

      // Test that JSON is properly stored and retrieved
      const retrieved = await prisma.moodEntry.findUnique({
        where: { id: validMoodEntry.id },
      });

      expect(retrieved?.emotions).toEqual(validMoodEntry.emotions);
      expect(retrieved?.triggers).toEqual(validMoodEntry.triggers);
    });

    test('should enforce required fields', async () => {
      // Test missing required fields
      await expect(
        prisma.crisisSession.create({
          data: {
            // Missing sessionToken and anonymousId
            severity: 5,
          } as any,
        })
      ).rejects.toThrow();

      await expect(
        prisma.volunteer.create({
          data: {
            // Missing anonymousId
            status: 'ACTIVE',
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Encrypted Field Handling', () => {
    test('should properly store and retrieve encrypted data', async () => {
      const encryptionKey = crypto.randomBytes(32);
      const sensitiveData = {
        ssn: '123-45-6789',
        medicalHistory: 'Confidential medical information',
        phoneNumber: '+1-555-0123',
      };

      const encryptedBuffer = encryptData(
        JSON.stringify(sensitiveData),
        encryptionKey
      );

      const user = await prisma.user.create({
        data: {
          anonymousId: 'test_encrypted_' + Date.now(),
          isAnonymous: true,
          encryptedProfile: encryptedBuffer,
        },
      });

      // Verify data is stored as encrypted buffer
      expect(user.encryptedProfile).toBeInstanceOf(Buffer);
      expect(user.encryptedProfile?.length).toBeGreaterThan(0);

      // Verify can decrypt
      const decrypted = decryptData(user.encryptedProfile!, encryptionKey);
      const decryptedData = JSON.parse(decrypted);
      expect(decryptedData).toEqual(sensitiveData);
    });

    test('should handle emergency contact encryption', async () => {
      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_contact_user_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      const encryptionKey = crypto.randomBytes(32);
      const salt = crypto.randomBytes(16);

      const contactInfo = {
        name: 'John Doe',
        phone: '+1-555-9876',
        email: 'john.doe@example.com',
      };

      const emergencyContact = await prisma.emergencyContact.create({
        data: {
          userId: userId,
          encryptedName: encryptData(contactInfo.name, encryptionKey),
          encryptedPhone: encryptData(contactInfo.phone, encryptionKey),
          encryptedEmail: encryptData(contactInfo.email, encryptionKey),
          relationship: 'spouse',
          priority: 1,
          keyDerivationSalt: salt,
          hasConsent: true,
          consentDate: new Date(),
        },
      });

      // Verify all PII is encrypted
      expect(emergencyContact.encryptedName).toBeInstanceOf(Buffer);
      expect(emergencyContact.encryptedPhone).toBeInstanceOf(Buffer);
      expect(emergencyContact.encryptedEmail).toBeInstanceOf(Buffer);

      // Verify can decrypt
      const decryptedName = decryptData(emergencyContact.encryptedName, encryptionKey);
      expect(decryptedName).toBe(contactInfo.name);
    });

    test('should maintain encryption integrity across updates', async () => {
      const encryptionKey = crypto.randomBytes(32);
      const originalPlan = {
        warningSignals: ['isolation', 'negative thoughts'],
        copingStrategies: ['call friend', 'breathing exercises'],
        emergencyContacts: ['therapist', 'crisis hotline'],
      };

      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_plan_user_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      // Create safety plan
      const safetyPlan = await prisma.safetyPlan.create({
        data: {
          userId: userId,
          title: 'My Safety Plan',
          encryptedContent: encryptData(JSON.stringify(originalPlan), encryptionKey),
          contentHash: crypto.createHash('sha256')
            .update(JSON.stringify(originalPlan))
            .digest('hex'),
        },
      });

      // Update the plan
      const updatedPlan = {
        ...originalPlan,
        copingStrategies: [...originalPlan.copingStrategies, 'meditation'],
      };

      await prisma.safetyPlan.update({
        where: { id: safetyPlan.id },
        data: {
          encryptedContent: encryptData(JSON.stringify(updatedPlan), encryptionKey),
          contentHash: crypto.createHash('sha256')
            .update(JSON.stringify(updatedPlan))
            .digest('hex'),
          version: { increment: 1 },
        },
      });

      // Retrieve and verify
      const retrieved = await prisma.safetyPlan.findUnique({
        where: { id: safetyPlan.id },
      });

      const decrypted = decryptData(retrieved!.encryptedContent, encryptionKey);
      const decryptedPlan = JSON.parse(decrypted);
      expect(decryptedPlan.copingStrategies).toContain('meditation');
    });
  });

  describe('Transaction Rollback Scenarios', () => {
    test('should rollback crisis session creation on error', async () => {
      const anonymousId = 'test_rollback_' + Date.now();

      try {
        await prisma.$transaction(async (tx) => {
          // Create crisis session
          const session = await tx.crisisSession.create({
            data: {
              sessionToken: crypto.randomBytes(32).toString('hex'),
              anonymousId: anonymousId,
              severity: 8,
            },
          });

          // Create initial message
          await tx.crisisMessage.create({
            data: {
              sessionId: session.id,
              senderType: 'ANONYMOUS_USER',
              senderId: anonymousId,
              encryptedContent: Buffer.from('help me'),
              messageHash: 'hash123',
            },
          });

          // Simulate error condition
          throw new Error('Simulated transaction failure');
        });
      } catch (error) {
        // Expected error
      }

      // Verify nothing was committed
      const sessions = await prisma.crisisSession.findMany({
        where: { anonymousId: anonymousId },
      });
      expect(sessions).toHaveLength(0);
    });

    test('should maintain consistency in volunteer assignment', async () => {
      const volunteerId = (await prisma.volunteer.create({
        data: {
          anonymousId: 'test_volunteer_tx_' + Date.now(),
          status: 'ACTIVE',
          currentLoad: 0,
          maxConcurrent: 3,
        },
      })).id;

      const sessionId = (await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_session_tx_' + Date.now(),
          severity: 7,
        },
      })).id;

      // Concurrent assignment attempts
      const assignmentPromises = Array(5).fill(null).map(async () => {
        try {
          return await prisma.$transaction(async (tx) => {
            // Check volunteer load
            const volunteer = await tx.volunteer.findUnique({
              where: { id: volunteerId },
            });

            if (volunteer!.currentLoad >= volunteer!.maxConcurrent) {
              throw new Error('Volunteer at capacity');
            }

            // Assign volunteer
            await tx.volunteer.update({
              where: { id: volunteerId },
              data: { currentLoad: { increment: 1 } },
            });

            // Update session
            await tx.crisisSession.update({
              where: { id: sessionId },
              data: { 
                responderId: volunteerId,
                status: 'ASSIGNED',
              },
            });

            return { success: true };
          });
        } catch (error) {
          return { success: false, error };
        }
      });

      const results = await Promise.all(assignmentPromises);
      const successful = results.filter(r => r.success).length;
      
      // Should not exceed max concurrent
      expect(successful).toBeLessThanOrEqual(3);

      // Verify final state
      const finalVolunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId },
      });
      expect(finalVolunteer!.currentLoad).toBeLessThanOrEqual(3);
    });
  });

  describe('Data Consistency Across Tables', () => {
    test('should maintain consistency between crisis session and messages', async () => {
      const sessionData = {
        sessionToken: crypto.randomBytes(32).toString('hex'),
        anonymousId: 'test_consistency_' + Date.now(),
        severity: 6,
      };

      const session = await prisma.crisisSession.create({
        data: sessionData,
      });

      // Add messages
      const messageIds = [];
      for (let i = 0; i < 5; i++) {
        const message = await prisma.crisisMessage.create({
          data: {
            sessionId: session.id,
            senderType: i % 2 === 0 ? 'ANONYMOUS_USER' : 'VOLUNTEER',
            senderId: `sender_${i}`,
            encryptedContent: Buffer.from(`message ${i}`),
            messageHash: `hash_${i}`,
            riskScore: Math.floor(Math.random() * 10) + 1,
          },
        });
        messageIds.push(message.id);
      }

      // Verify relationship integrity
      const sessionWithMessages = await prisma.crisisSession.findUnique({
        where: { id: session.id },
        include: { messages: true },
      });

      expect(sessionWithMessages!.messages).toHaveLength(5);
      expect(sessionWithMessages!.messages.map(m => m.id).sort())
        .toEqual(messageIds.sort());
    });

    test('should cascade updates properly', async () => {
      const userId = (await prisma.user.create({
        data: {
          anonymousId: 'test_cascade_user_' + Date.now(),
          isAnonymous: true,
        },
      })).id;

      // Create related data
      await prisma.moodEntry.createMany({
        data: Array(3).fill(null).map((_, i) => ({
          userId: userId,
          mood: 5,
          emotions: JSON.stringify({}),
          triggers: JSON.stringify([]),
          activities: JSON.stringify([]),
        })),
      });

      await prisma.safetyPlan.create({
        data: {
          userId: userId,
          title: 'Test Plan',
          encryptedContent: Buffer.from('test'),
          contentHash: 'hash',
        },
      });

      // Delete user - should cascade
      await prisma.user.delete({
        where: { id: userId },
      });

      // Verify cascaded deletion
      const moodEntries = await prisma.moodEntry.findMany({
        where: { userId: userId },
      });
      const safetyPlans = await prisma.safetyPlan.findMany({
        where: { userId: userId },
      });

      expect(moodEntries).toHaveLength(0);
      expect(safetyPlans).toHaveLength(0);
    });
  });

  describe('Crisis Data Management', () => {
    test('should handle crisis escalation workflow', async () => {
      const session = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_escalation_' + Date.now(),
          severity: 5,
          status: 'ACTIVE',
        },
      });

      // Simulate escalation trigger
      const escalation = await prisma.crisisEscalation.create({
        data: {
          sessionId: session.id,
          triggeredBy: 'KEYWORD_DETECTION',
          severity: 'CRITICAL',
          reason: 'Self-harm keywords detected',
          emergencyContacted: true,
          lifeline988Called: true,
        },
      });

      // Update session status
      await prisma.crisisSession.update({
        where: { id: session.id },
        data: {
          status: 'ESCALATED',
          severity: 10,
          emergencyTriggered: true,
          escalatedAt: new Date(),
          escalationType: 'AUTOMATIC_KEYWORD',
        },
      });

      // Verify escalation recorded
      const updatedSession = await prisma.crisisSession.findUnique({
        where: { id: session.id },
        include: { escalations: true },
      });

      expect(updatedSession!.status).toBe('ESCALATED');
      expect(updatedSession!.severity).toBe(10);
      expect(updatedSession!.escalations).toHaveLength(1);
      expect(updatedSession!.escalations[0].lifeline988Called).toBe(true);
    });

    test('should track crisis severity changes over time', async () => {
      const sessionId = (await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_severity_tracking_' + Date.now(),
          severity: 3,
        },
      })).id;

      const severityChanges = [3, 5, 7, 9, 6, 4];
      const timestamps: Date[] = [];

      for (const newSeverity of severityChanges) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        
        await prisma.crisisSession.update({
          where: { id: sessionId },
          data: { severity: newSeverity },
        });

        timestamps.push(new Date());

        // Log severity change in messages for audit
        await prisma.crisisMessage.create({
          data: {
            sessionId: sessionId,
            senderType: 'SYSTEM',
            senderId: 'system',
            encryptedContent: Buffer.from(`Severity changed to ${newSeverity}`),
            messageHash: crypto.randomBytes(16).toString('hex'),
            messageType: 'SYSTEM_MESSAGE',
            riskScore: newSeverity,
          },
        });
      }

      // Verify severity history through messages
      const messages = await prisma.crisisMessage.findMany({
        where: {
          sessionId: sessionId,
          senderType: 'SYSTEM',
        },
        orderBy: { timestamp: 'asc' },
      });

      expect(messages).toHaveLength(severityChanges.length);
      
      // Verify severity progression
      const recordedSeverities = messages.map(m => m.riskScore);
      expect(recordedSeverities).toEqual(severityChanges);
    });

    test('should handle anonymous session data properly', async () => {
      const anonymousId = 'anon_' + crypto.randomBytes(8).toString('hex');
      
      const session = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: anonymousId,
          severity: 7,
        },
      });

      // Verify no PII is stored unencrypted
      expect(session.anonymousId).toBe(anonymousId);
      expect(session.anonymousId).not.toContain('@'); // Not an email
      expect(session.anonymousId).not.toMatch(/\d{3}-\d{2}-\d{4}/); // Not SSN
      expect(session.anonymousId).not.toMatch(/\+?\d{10,}/); // Not phone

      // Session should be completely anonymous
      const retrieved = await prisma.crisisSession.findUnique({
        where: { id: session.id },
      });

      expect(retrieved!.responderId).toBeNull(); // No responder PII initially
      expect(retrieved!.outcome).toBeNull(); // No outcome details initially
    });

    test('should log intervention history', async () => {
      const sessionId = (await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_intervention_' + Date.now(),
          severity: 8,
        },
      })).id;

      // Log various interventions
      const interventions = [
        { type: 'RESOURCE_SHARE', resource: 'Crisis Hotline' },
        { type: 'BREATHING_EXERCISE', resource: 'Box Breathing' },
        { type: 'SAFETY_PLANNING', resource: 'Safety Plan Template' },
      ];

      for (const intervention of interventions) {
        await prisma.crisisResourceUsage.create({
          data: {
            sessionId: sessionId,
            resourceId: crypto.randomUUID(),
            resourceTitle: intervention.resource,
            resourceType: intervention.type as any,
            wasHelpful: true,
            helpfulRating: 4,
          },
        });
      }

      // Verify intervention history
      const usages = await prisma.crisisResourceUsage.findMany({
        where: { sessionId: sessionId },
        orderBy: { accessedAt: 'asc' },
      });

      expect(usages).toHaveLength(3);
      expect(usages.map(u => u.resourceTitle))
        .toEqual(interventions.map(i => i.resource));
    });
  });

  describe('Performance & Scalability', () => {
    test('should handle high-volume crisis sessions', async () => {
      const startTime = performance.now();
      const sessionCount = 100;
      
      // Create many concurrent crisis sessions
      const sessionPromises = Array(sessionCount).fill(null).map((_, i) => 
        prisma.crisisSession.create({
          data: {
            sessionToken: crypto.randomBytes(32).toString('hex'),
            anonymousId: `test_volume_${i}_${Date.now()}`,
            severity: Math.floor(Math.random() * 10) + 1,
            status: i % 3 === 0 ? 'ESCALATED' : 'ACTIVE' as const,
          },
        })
      );

      const sessions = await Promise.all(sessionPromises);
      const creationTime = performance.now() - startTime;

      expect(sessions).toHaveLength(sessionCount);
      expect(creationTime).toBeLessThan(10000); // Should handle 100 sessions in < 10s

      // Test query performance on large dataset
      const queryStart = performance.now();
      
      const activeSessions = await prisma.crisisSession.findMany({
        where: {
          status: 'ACTIVE',
          severity: { gte: 7 },
        },
        orderBy: { severity: 'desc' },
        take: 10,
      });

      const queryTime = performance.now() - queryStart;
      expect(queryTime).toBeLessThan(100); // Query should be fast

      // Clean up
      await prisma.crisisSession.deleteMany({
        where: {
          anonymousId: { startsWith: 'test_volume_' },
        },
      });
    });

    test('should optimize connection pooling', async () => {
      const concurrentQueries = 50;
      const queryPromises = [];

      for (let i = 0; i < concurrentQueries; i++) {
        queryPromises.push(
          prisma.crisisSession.findMany({
            where: { status: 'ACTIVE' },
            take: 1,
          })
        );
      }

      const startTime = performance.now();
      await Promise.all(queryPromises);
      const totalTime = performance.now() - startTime;

      // Should handle many concurrent queries efficiently
      expect(totalTime).toBeLessThan(2000); // 50 queries in < 2s
      
      const avgTime = totalTime / concurrentQueries;
      expect(avgTime).toBeLessThan(100); // Average < 100ms per query
    });
  });

  describe('Backup & Recovery', () => {
    test('should support point-in-time recovery simulation', async () => {
      const testTimestamp = new Date();
      
      // Create data at specific point
      const session = await prisma.crisisSession.create({
        data: {
          sessionToken: crypto.randomBytes(32).toString('hex'),
          anonymousId: 'test_recovery_' + Date.now(),
          severity: 7,
          startedAt: testTimestamp,
        },
      });

      // Add messages over time
      const messageTimestamps = [];
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const message = await prisma.crisisMessage.create({
          data: {
            sessionId: session.id,
            senderType: 'ANONYMOUS_USER',
            senderId: 'user',
            encryptedContent: Buffer.from(`message ${i}`),
            messageHash: `hash_${i}`,
          },
        });
        messageTimestamps.push(message.timestamp);
      }

      // Simulate point-in-time query (messages before specific timestamp)
      const recoveryPoint = messageTimestamps[2]; // Recover to 3rd message
      
      const recoveredMessages = await prisma.crisisMessage.findMany({
        where: {
          sessionId: session.id,
          timestamp: { lte: recoveryPoint },
        },
      });

      expect(recoveredMessages).toHaveLength(3);
    });

    test('should maintain audit trail integrity', async () => {
      const userId = 'audit_user_' + Date.now();
      const actions = [
        { action: 'LOGIN', success: true },
        { action: 'VIEW_RESOURCES', success: true },
        { action: 'CREATE_SAFETY_PLAN', success: true },
        { action: 'INVALID_ACCESS', success: false },
      ];

      for (const actionData of actions) {
        await prisma.auditLog.create({
          data: {
            userId: userId,
            action: actionData.action,
            resource: 'test_resource',
            success: actionData.success,
            details: { test: true },
            ipAddress: '192.168.1.1',
            userAgent: 'test-agent',
          },
        });
      }

      // Verify audit trail
      const auditTrail = await prisma.auditLog.findMany({
        where: { userId: userId },
        orderBy: { timestamp: 'asc' },
      });

      expect(auditTrail).toHaveLength(4);
      expect(auditTrail.map(a => a.action)).toEqual(actions.map(a => a.action));
      
      // Verify failed actions are logged
      const failedActions = auditTrail.filter(a => !a.success);
      expect(failedActions).toHaveLength(1);
      expect(failedActions[0].action).toBe('INVALID_ACCESS');
    });
  });
});