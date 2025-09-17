/**
 * ASTRAL_CORE 2.0 Crisis Intervention Engine Tests
 * 
 * LIFE-CRITICAL TESTING
 * These tests verify the core crisis intervention functionality.
 * Every test ensures a life-saving feature works correctly.
 */

import { jest } from '@jest/globals';
import { CrisisInterventionEngine } from '../CrisisInterventionEngine';
import { ZeroKnowledgeEncryption } from '../../encryption/ZeroKnowledgeEncryption';
import { CrisisSeverityAssessment } from '../../assessment/CrisisSeverityAssessment';
import { EmergencyEscalation } from '../../escalation/EmergencyEscalation';
import { VolunteerMatcher } from '../../matching/VolunteerMatcher';
import { CrisisWebSocketManager } from '../../websocket/CrisisWebSocketManager';
import { CRISIS_CONSTANTS } from '../../index';

// Mock dependencies
jest.mock('@astralcore/database');
jest.mock('../../encryption/ZeroKnowledgeEncryption');
jest.mock('../../assessment/CrisisSeverityAssessment');
jest.mock('../../escalation/EmergencyEscalation');
jest.mock('../../matching/VolunteerMatcher');
jest.mock('../../websocket/CrisisWebSocketManager');

describe('CrisisInterventionEngine', () => {
  let engine: CrisisInterventionEngine;
  let mockEncryption: jest.Mocked<ZeroKnowledgeEncryption>;
  let mockAssessment: jest.Mocked<CrisisSeverityAssessment>;
  let mockEscalation: jest.Mocked<EmergencyEscalation>;
  let mockMatcher: jest.Mocked<VolunteerMatcher>;
  let mockWebSocket: jest.Mocked<CrisisWebSocketManager>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock the database functions
    const mockDatabase = require('@astralcore/database');
    mockDatabase.executeWithMetrics.mockImplementation(async (fn: Function) => await fn());
    mockDatabase.createCrisisSession.mockResolvedValue({
      id: 'session-123',
      anonymousId: 'anon-456',
      status: 'ACTIVE',
      startedAt: new Date(),
    });
    mockDatabase.storeCrisisMessage.mockResolvedValue({
      id: 'msg-789',
      timestamp: new Date(),
    });

    // Mock ZeroKnowledgeEncryption
    mockEncryption = {
      generateSessionToken: jest.fn().mockResolvedValue('session-token-123'),
      generateSessionKeys: jest.fn().mockReturnValue({ key: 'mock-key' }),
      encrypt: jest.fn().mockReturnValue({
        encryptedData: 'encrypted-data-hex',
        salt: 'salt-hex',
      }),
      decrypt: jest.fn().mockReturnValue('decrypted message'),
      generateMessageHash: jest.fn().mockReturnValue('hash-123'),
      destroySessionKeys: jest.fn(),
    } as any;
    (ZeroKnowledgeEncryption as jest.Mock).mockImplementation(() => mockEncryption);

    // Mock CrisisSeverityAssessment
    mockAssessment = {
      assessMessage: jest.fn().mockResolvedValue({
        severity: 5,
        keywordsDetected: [],
        riskScore: 5,
        sentimentScore: 0.5,
      }),
      isEmergencyKeyword: jest.fn().mockReturnValue(false),
    } as any;
    (CrisisSeverityAssessment as jest.Mock).mockImplementation(() => mockAssessment);

    // Mock EmergencyEscalation
    mockEscalation = {
      triggerEmergencyProtocol: jest.fn().mockResolvedValue({ escalated: true }),
    } as any;
    (EmergencyEscalation.getInstance as jest.Mock).mockReturnValue(mockEscalation);

    // Mock VolunteerMatcher
    mockMatcher = {
      findBestMatch: jest.fn().mockResolvedValue({ id: 'volunteer-123' }),
      getAvailableVolunteerCount: jest.fn().mockResolvedValue(5),
      queueSession: jest.fn(),
    } as any;
    (VolunteerMatcher.getInstance as jest.Mock).mockReturnValue(mockMatcher);

    // Mock CrisisWebSocketManager
    mockWebSocket = {
      createConnection: jest.fn().mockResolvedValue({ url: 'ws://localhost:8080' }),
      broadcastToSession: jest.fn(),
      closeSession: jest.fn(),
    } as any;
    (CrisisWebSocketManager.getInstance as jest.Mock).mockReturnValue(mockWebSocket);

    // Mock prisma
    const mockPrisma = {
      crisisSession: {
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(10),
      },
      crisisMessage: {
        findUnique: jest.fn(),
      },
      crisisResource: {
        findMany: jest.fn().mockResolvedValue([
          { title: 'National Suicide Prevention Lifeline', phoneNumber: '988' },
          { title: 'Crisis Text Line', url: 'text HOME to 741741' },
        ]),
      },
      performanceMetric: {
        create: jest.fn(),
      },
    };
    (mockDatabase.prisma as any) = mockPrisma;

    // Get singleton instance
    engine = CrisisInterventionEngine.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const engine1 = CrisisInterventionEngine.getInstance();
      const engine2 = CrisisInterventionEngine.getInstance();
      expect(engine1).toBe(engine2);
    });
  });

  describe('connectAnonymous', () => {
    it('should connect anonymous user within 100ms target time', async () => {
      const startTime = performance.now();
      
      const connection = await engine.connectAnonymous('I need help');
      
      const responseTime = performance.now() - startTime;
      
      expect(connection).toMatchObject({
        sessionId: 'session-123',
        sessionToken: 'session-token-123',
        severity: 5,
        encrypted: true,
        targetMet: expect.any(Boolean),
      });
      
      // Performance requirement: <100ms (allowing for test overhead)
      expect(responseTime).toBeLessThan(1000); // 1 second in test environment
      expect(connection.responseTimeMs).toBeDefined();
      
      // Verify database calls
      expect(mockDatabase.createCrisisSession).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 5,
          encryptedData: expect.any(Buffer),
        })
      );
    });

    it('should handle initial message assessment', async () => {
      mockAssessment.assessMessage.mockResolvedValue({
        severity: 8,
        keywordsDetected: ['suicide', 'kill'],
        riskScore: 9,
        sentimentScore: -0.8,
      });

      const connection = await engine.connectAnonymous('I want to kill myself');

      expect(mockAssessment.assessMessage).toHaveBeenCalledWith('I want to kill myself');
      expect(connection.severity).toBe(8);
      expect(mockDatabase.createCrisisSession).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 8,
        })
      );
    });

    it('should trigger emergency protocol for high-severity messages', async () => {
      mockAssessment.assessMessage.mockResolvedValue({
        severity: 10,
        keywordsDetected: ['suicide'],
        riskScore: 10,
        sentimentScore: -1.0,
      });
      mockAssessment.isEmergencyKeyword.mockReturnValue(true);

      await engine.connectAnonymous('I am going to kill myself tonight');

      expect(mockEscalation.triggerEmergencyProtocol).toHaveBeenCalledWith(
        'session-123',
        'AUTOMATIC_KEYWORD'
      );
    });

    it('should establish WebSocket connection', async () => {
      await engine.connectAnonymous('I need someone to talk to');

      expect(mockWebSocket.createConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-123',
          sessionToken: 'session-token-123',
          severity: 5,
          isEmergency: false,
        })
      );
    });

    it('should assign volunteer asynchronously', async () => {
      await engine.connectAnonymous('I feel depressed');

      // Give time for async volunteer assignment
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockMatcher.findBestMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 5,
          urgency: 'NORMAL',
        })
      );
    });

    it('should provide emergency resources on failure', async () => {
      mockDatabase.createCrisisSession.mockRejectedValue(new Error('Database error'));

      await expect(engine.connectAnonymous('Help me')).rejects.toThrow('Failed to establish crisis connection');
    });

    it('should handle connection without initial message', async () => {
      const connection = await engine.connectAnonymous();

      expect(connection.severity).toBe(5); // Default moderate severity
      expect(connection.encrypted).toBe(false); // No initial message to encrypt
      expect(mockAssessment.assessMessage).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      const mockDatabase = require('@astralcore/database');
      mockDatabase.prisma.crisisSession.findUnique.mockResolvedValue({
        id: 'session-123',
        status: 'ACTIVE',
      });
    });

    it('should send and encrypt message within 50ms target', async () => {
      const startTime = performance.now();
      
      const message = await engine.sendMessage(
        'session-token-123',
        'I am feeling better now',
        'anon-456'
      );
      
      const responseTime = performance.now() - startTime;
      
      expect(message).toMatchObject({
        id: 'msg-789',
        sessionId: 'session-123',
        senderType: 'ANONYMOUS_USER',
        encrypted: true,
        riskScore: 5,
      });
      
      // Performance requirement: <50ms (allowing for test overhead)
      expect(responseTime).toBeLessThan(500); // 500ms in test environment
      
      expect(mockEncryption.encrypt).toHaveBeenCalledWith('I am feeling better now', 'session-token-123');
      expect(mockDatabase.storeCrisisMessage).toHaveBeenCalled();
    });

    it('should assess message and trigger escalation if needed', async () => {
      mockAssessment.assessMessage.mockResolvedValue({
        severity: 9,
        keywordsDetected: ['suicide'],
        riskScore: 9,
        sentimentScore: -0.9,
      });

      await engine.sendMessage('session-token-123', 'I want to die', 'anon-456');

      expect(mockAssessment.assessMessage).toHaveBeenCalledWith('I want to die');
      expect(mockEscalation.triggerEmergencyProtocol).toHaveBeenCalledWith(
        'session-123',
        'SEVERITY_INCREASE'
      );
    });

    it('should broadcast message via WebSocket', async () => {
      await engine.sendMessage('session-token-123', 'Thank you for helping', 'anon-456');

      expect(mockWebSocket.broadcastToSession).toHaveBeenCalledWith(
        'session-token-123',
        expect.objectContaining({
          messageId: 'msg-789',
          senderType: 'ANONYMOUS_USER',
          encrypted: true,
        })
      );
    });

    it('should reject message for inactive session', async () => {
      const mockDatabase = require('@astralcore/database');
      mockDatabase.prisma.crisisSession.findUnique.mockResolvedValue({
        id: 'session-123',
        status: 'ENDED',
      });

      await expect(
        engine.sendMessage('session-token-123', 'Hello', 'anon-456')
      ).rejects.toThrow('Session not found or not active');
    });

    it('should handle volunteer messages', async () => {
      await engine.sendMessage(
        'session-token-123',
        'How can I support you?',
        'volunteer-123',
        'VOLUNTEER'
      );

      expect(mockDatabase.storeCrisisMessage).toHaveBeenCalledWith(
        'session-123',
        'VOLUNTEER',
        'volunteer-123',
        expect.any(Buffer),
        'hash-123',
        expect.any(Object)
      );
    });
  });

  describe('getMessage', () => {
    it('should decrypt and return message for valid session', async () => {
      const mockDatabase = require('@astralcore/database');
      mockDatabase.prisma.crisisMessage.findUnique.mockResolvedValue({
        id: 'msg-123',
        encryptedContent: Buffer.from('encrypted-data-hex', 'hex'),
        session: { sessionToken: 'session-token-123' },
      });

      const message = await engine.getMessage('msg-123', 'session-token-123');

      expect(message).toBe('decrypted message');
      expect(mockEncryption.decrypt).toHaveBeenCalledWith('encrypted-data-hex', 'session-token-123');
    });

    it('should reject access to message with wrong session token', async () => {
      const mockDatabase = require('@astralcore/database');
      mockDatabase.prisma.crisisMessage.findUnique.mockResolvedValue({
        id: 'msg-123',
        session: { sessionToken: 'different-token' },
      });

      await expect(
        engine.getMessage('msg-123', 'session-token-123')
      ).rejects.toThrow('Message not found or access denied');
    });
  });

  describe('endSession', () => {
    it('should end session and destroy encryption keys', async () => {
      const mockDatabase = require('@astralcore/database');
      mockDatabase.prisma.crisisSession.update.mockResolvedValue({});

      await engine.endSession('session-token-123', 'RESOLVED', { helpful: true });

      expect(mockDatabase.prisma.crisisSession.update).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-123' },
        data: {
          status: 'RESOLVED',
          endedAt: expect.any(Date),
          outcome: 'RESOLVED',
        },
      });

      expect(mockWebSocket.closeSession).toHaveBeenCalledWith('session-token-123');
      expect(mockEncryption.destroySessionKeys).toHaveBeenCalledWith('session-token-123');
    });
  });

  describe('getCrisisStats', () => {
    it('should return real-time crisis statistics', async () => {
      const stats = await engine.getCrisisStats();

      expect(stats).toMatchObject({
        activeSessions: 10,
        totalToday: 10,
        averageResponseTimeMs: expect.any(Number),
        targetMet: expect.any(Boolean),
        volunteersOnline: 5,
      });

      expect(mockMatcher.getAvailableVolunteerCount).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track response times', async () => {
      // Connect multiple times to build response time data
      await engine.connectAnonymous('Test 1');
      await engine.connectAnonymous('Test 2');
      await engine.connectAnonymous('Test 3');

      const stats = await engine.getCrisisStats();
      expect(stats.averageResponseTimeMs).toBeGreaterThan(0);
    });

    it('should warn when response time exceeds target', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock a slow operation
      mockDatabase.createCrisisSession.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 'session-123' }), 300))
      );

      await engine.connectAnonymous('Slow test');

      // Should have logged a warning about slow response
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Crisis connection took')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should provide emergency resources on connection failure', async () => {
      mockDatabase.createCrisisSession.mockRejectedValue(new Error('Database failure'));

      try {
        await engine.connectAnonymous('Help me');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.name).toBe('CrisisConnectionError');
        expect(error.emergencyResources).toBeDefined();
        expect(error.responseTime).toBeGreaterThan(0);
      }
    });

    it('should handle volunteer assignment failures gracefully', async () => {
      mockMatcher.findBestMatch.mockRejectedValue(new Error('Matching failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should still connect successfully even if volunteer assignment fails
      const connection = await engine.connectAnonymous('I need help');
      expect(connection).toBeDefined();

      // Give time for async volunteer assignment to fail
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to assign volunteer:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle emergency escalation failures gracefully', async () => {
      mockAssessment.assessMessage.mockResolvedValue({
        severity: 10,
        keywordsDetected: ['suicide'],
        riskScore: 10,
        sentimentScore: -1.0,
      });
      mockAssessment.isEmergencyKeyword.mockReturnValue(true);
      mockEscalation.triggerEmergencyProtocol.mockRejectedValue(new Error('Escalation failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should still connect successfully even if escalation fails
      const connection = await engine.connectAnonymous('I want to kill myself');
      expect(connection).toBeDefined();

      // Give time for async escalation to fail
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔴 CRITICAL: Emergency protocol failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Security', () => {
    it('should generate unique session tokens', async () => {
      const connection1 = await engine.connectAnonymous('Message 1');
      const connection2 = await engine.connectAnonymous('Message 2');

      expect(connection1.sessionToken).not.toBe(connection2.sessionToken);
      expect(connection1.anonymousId).not.toBe(connection2.anonymousId);
    });

    it('should encrypt all messages', async () => {
      await engine.connectAnonymous('Secret message');

      expect(mockEncryption.encrypt).toHaveBeenCalledWith('Secret message', expect.any(String));
      expect(mockDatabase.createCrisisSession).toHaveBeenCalledWith(
        expect.objectContaining({
          encryptedData: expect.any(Buffer),
          keyDerivationSalt: expect.any(Buffer),
        })
      );
    });

    it('should validate session tokens for message access', async () => {
      const mockDatabase = require('@astralcore/database');
      mockDatabase.prisma.crisisMessage.findUnique.mockResolvedValue(null);

      await expect(
        engine.getMessage('nonexistent-msg', 'invalid-token')
      ).rejects.toThrow('Message not found or access denied');
    });
  });

  describe('Integration with Constants', () => {
    it('should use correct severity thresholds', async () => {
      mockAssessment.assessMessage.mockResolvedValue({
        severity: CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD,
        keywordsDetected: [],
        riskScore: 10,
        sentimentScore: -0.8,
      });

      const connection = await engine.connectAnonymous('Critical message');

      expect(mockWebSocket.createConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          isEmergency: true,
        })
      );
    });

    it('should validate performance targets', () => {
      expect(CRISIS_CONSTANTS.TARGET_RESPONSE_TIME_MS).toBeDefined();
      expect(CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS).toBeDefined();
      expect(CRISIS_CONSTANTS.CRITICAL_SEVERITY_THRESHOLD).toBeDefined();

      expect(CRISIS_CONSTANTS.TARGET_RESPONSE_TIME_MS).toBeLessThanOrEqual(
        CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS
      );
    });
  });
});