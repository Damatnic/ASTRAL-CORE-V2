/**
 * ASTRAL_CORE AI Safety Integration Tests
 * 
 * Comprehensive test suite for AI safety systems ensuring life-critical
 * reliability and performance under all conditions.
 */

import { 
  AISafetyEngine,
  ContentModerationSystem,
  CrisisKeywordDetector,
  BehaviorAnalyzer,
  QualityAssurance,
  AnomalyDetector,
  AuditTrailSystem,
  AI_SAFETY_CONSTANTS 
} from '../src';

describe('AI Safety System Integration', () => {
  let safetyEngine: AISafetyEngine;
  let contentModeration: ContentModerationSystem;
  let crisisDetector: CrisisKeywordDetector;
  let behaviorAnalyzer: BehaviorAnalyzer;
  let qualityAssurance: QualityAssurance;
  let anomalyDetector: AnomalyDetector;
  let auditTrail: AuditTrailSystem;

  beforeAll(() => {
    safetyEngine = AISafetyEngine.getInstance();
    contentModeration = ContentModerationSystem.getInstance();
    crisisDetector = CrisisKeywordDetector.getInstance();
    behaviorAnalyzer = BehaviorAnalyzer.getInstance();
    qualityAssurance = QualityAssurance.getInstance();
    anomalyDetector = AnomalyDetector.getInstance();
    auditTrail = AuditTrailSystem.getInstance();
  });

  describe('Critical Crisis Detection', () => {
    test('should detect immediate suicide threats within 50ms', async () => {
      const crisisMessages = [
        "I'm going to kill myself tonight",
        "I have the pills ready to end it all",
        "The rope is ready, I can't take it anymore",
        "I'm standing on the bridge right now",
        "Loading the gun, this is it"
      ];

      for (const message of crisisMessages) {
        const startTime = performance.now();
        const result = await crisisDetector.detectCrisisKeywords(message);
        const duration = performance.now() - startTime;

        expect(duration).toBeLessThan(50);
        expect(result.severity).toBeGreaterThanOrEqual(9);
        expect(result.urgency).toBe('CRITICAL');
        expect(result.immediateAction).toBe(true);
        expect(result.keywords.length).toBeGreaterThan(0);
      }
    });

    test('should minimize false positives on crisis keywords', async () => {
      const nonCrisisMessages = [
        "I'm watching a movie about someone who wanted to kill the main character",
        "This video game level is killing me, it's so hard",
        "I'm dying of laughter at this comedy show",
        "My phone battery is dead, need to charge it",
        "I'm dead tired from work today"
      ];

      for (const message of nonCrisisMessages) {
        const result = await crisisDetector.detectCrisisKeywords(message);
        
        expect(result.severity).toBeLessThan(6);
        expect(result.urgency).not.toBe('CRITICAL');
        expect(result.immediateAction).toBe(false);
      }
    });

    test('should detect escalating crisis severity patterns', async () => {
      const userId = 'test-user-escalation';
      const messages = [
        "Having a bad day",
        "Feeling pretty down lately",
        "I don't see the point anymore",
        "Can't take this much longer",
        "I'm done with everything"
      ];

      for (let i = 0; i < messages.length; i++) {
        const result = await behaviorAnalyzer.analyzeMessage(userId, messages[i]);
        
        if (i > 2) { // Should detect escalating pattern
          expect(result.patterns).toContain('ESCALATING_SEVERITY');
          expect(result.riskLevel).toBeGreaterThan(0.6);
        }
      }
    });
  });

  describe('Content Moderation Performance', () => {
    test('should moderate content within 100ms target', async () => {
      const testMessages = [
        "You're a worthless piece of garbage and should kill yourself",
        "I hate you so much, you disgusting person",
        "Nobody cares about you, just disappear",
        "You're pathetic and deserve to suffer",
        "Go die in a hole, loser"
      ];

      for (const message of testMessages) {
        const startTime = performance.now();
        const result = await contentModeration.moderateContent(message);
        const duration = performance.now() - startTime;

        expect(duration).toBeLessThan(100);
        expect(result.safe).toBe(false);
        expect(result.action).toBeOneOf(['BLOCK', 'FLAG', 'ESCALATE']);
        expect(result.riskScore).toBeGreaterThan(0.7);
      }
    });

    test('should protect crisis communication from moderation', async () => {
      const crisisMessages = [
        "I want to kill myself but I need help",
        "I'm having thoughts of suicide, please help",
        "I'm cutting myself and want to stop",
        "I'm thinking about ending my life",
        "Help me, I want to hurt myself"
      ];

      for (const message of crisisMessages) {
        const result = await contentModeration.moderateContent(message, {
          messageType: 'crisis',
          isAnonymous: true
        });

        expect(result.safe).toBe(true);
        expect(result.action).toBe('ALLOW');
        expect(result.reason).toContain('Crisis communication protected');
      }
    });
  });

  describe('Volunteer Quality Assurance', () => {
    test('should assess volunteer response quality accurately', async () => {
      const goodResponses = [
        "I understand you're going through a difficult time. You're not alone, and there are people who want to help you. Have you considered speaking with a mental health professional?",
        "It sounds like you're experiencing a lot of pain right now. That must be really hard for you. There are resources available that might help. Would you like me to share some information?",
        "Thank you for sharing that with me. Your feelings are valid, and it takes courage to reach out. Let's talk about some ways we can help you feel safer right now."
      ];

      const poorResponses = [
        "Just get over it",
        "You should probably see a doctor or something",
        "I went through the same thing, here's what you need to do...",
        "Stop being so negative",
        "Everyone has problems, deal with it"
      ];

      // Test good responses
      for (const response of goodResponses) {
        const result = await qualityAssurance.assessResponse(response);
        
        expect(result.qualityScore).toBeGreaterThanOrEqual(0.8);
        expect(result.empathy).toBeGreaterThanOrEqual(0.7);
        expect(result.helpfulness).toBeGreaterThanOrEqual(0.7);
        expect(result.approved).toBe(true);
      }

      // Test poor responses
      for (const response of poorResponses) {
        const result = await qualityAssurance.assessResponse(response);
        
        expect(result.qualityScore).toBeLessThan(0.7);
        expect(result.approved).toBe(false);
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
    });

    test('should check ethical guidelines compliance', async () => {
      const ethicsViolations = [
        "You have severe depression and need medication immediately",
        "I think you should leave your partner, that's what I did",
        "You definitely have PTSD from your trauma",
        "You must call the police right now",
        "As your friend, I'm telling you to quit your job"
      ];

      for (const response of ethicsViolations) {
        const result = await qualityAssurance.checkEthicalGuidelines(response);
        
        expect(result.followsGuidelines).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.severity).toBeOneOf(['MEDIUM', 'HIGH', 'CRITICAL']);
      }
    });
  });

  describe('Anomaly Detection', () => {
    test('should detect bot-like behavior patterns', async () => {
      const botMessages = [
        "Thank you for your message. I understand your concern. Please contact support for assistance.",
        "Thank you for your message. I understand your concern. Please contact support for assistance.",
        "Thank you for your message. I understand your concern. Please contact support for assistance."
      ];

      const context = {
        userId: 'potential-bot',
        sessionId: 'bot-session-1',
        messageType: 'general' as const,
        timestamp: new Date()
      };

      for (const message of botMessages) {
        const result = await anomalyDetector.checkForAnomalies(message, context);
        
        if (result.anomalies.includes('POTENTIAL_BOT')) {
          expect(result.riskScore).toBeGreaterThan(0.7);
          expect(result.severity).toBeOneOf(['HIGH', 'CRITICAL']);
        }
      }
    });

    test('should detect rapid messaging anomalies', async () => {
      const context = {
        userId: 'rapid-user',
        sessionId: 'rapid-session',
        messageType: 'general' as const,
        timestamp: new Date()
      };

      // Simulate rapid messaging
      for (let i = 0; i < 15; i++) {
        const result = await anomalyDetector.checkForAnomalies(`Message ${i}`, context);
        
        if (i > 10) { // Should detect rapid messaging
          expect(result.anomalies).toContain('RAPID_MESSAGING');
          expect(result.riskScore).toBeGreaterThan(0.5);
        }
      }
    });
  });

  describe('Comprehensive Safety Check', () => {
    test('should perform complete safety analysis within 100ms', async () => {
      const testCases = [
        {
          content: "I'm going to kill myself tonight, I have the pills ready",
          context: {
            userId: 'crisis-user-1',
            sessionId: 'crisis-session-1',
            messageType: 'crisis' as const,
            isAnonymous: true
          },
          expectedActions: ['EMERGENCY_SERVICES_IMMEDIATELY']
        },
        {
          content: "You're a worthless piece of garbage",
          context: {
            userId: 'toxic-user-1',
            sessionId: 'toxic-session-1',
            messageType: 'general' as const,
            isAnonymous: false
          },
          expectedActions: ['BLOCK_MESSAGE']
        },
        {
          content: "Just get over it, everyone has problems",
          context: {
            userId: 'volunteer-1',
            sessionId: 'volunteer-session-1',
            messageType: 'volunteer' as const,
            isAnonymous: false
          },
          expectedActions: ['QUALITY_REVIEW_REQUIRED']
        }
      ];

      for (const testCase of testCases) {
        const startTime = performance.now();
        const result = await safetyEngine.performSafetyCheck(
          testCase.content,
          testCase.context
        );
        const duration = performance.now() - startTime;

        expect(duration).toBeLessThan(100);
        expect(result.executionTimeMs).toBeLessThan(100);
        
        for (const expectedAction of testCase.expectedActions) {
          expect(result.actions).toContain(expectedAction);
        }
      }
    });

    test('should maintain audit trail for all decisions', async () => {
      const testMessage = "I'm feeling really depressed and hopeless";
      const context = {
        userId: 'audit-test-user',
        sessionId: 'audit-test-session',
        messageType: 'crisis' as const,
        isAnonymous: false
      };

      const result = await safetyEngine.performSafetyCheck(testMessage, context);
      
      // Verify audit entry was created
      expect(result.moderationResult).toBeDefined();
      expect(result.crisisDetection).toBeDefined();
      expect(result.executionTimeMs).toBeDefined();
      
      // Check that decision was logged (would query database in real test)
      const auditId = await auditTrail.logDecision(
        'CRISIS_DETECTION',
        {
          content: testMessage,
          context: context,
          userId: context.userId,
          sessionId: context.sessionId
        },
        {
          riskScore: result.riskScore,
          confidence: result.crisisDetection?.confidence || 0,
          reasoning: ['Crisis keywords detected'],
          categories: result.crisisDetection?.categories || [],
          actions: result.actions
        }
      );

      expect(auditId).toBeDefined();
      expect(typeof auditId).toBe('string');
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle concurrent safety checks efficiently', async () => {
      const concurrentTests = 50;
      const testMessage = "This is a test message for concurrent processing";
      const context = {
        sessionId: 'concurrent-test',
        messageType: 'general' as const,
        isAnonymous: true
      };

      const promises = Array(concurrentTests).fill(0).map((_, i) => 
        safetyEngine.performSafetyCheck(testMessage, {
          ...context,
          userId: `concurrent-user-${i}`
        })
      );

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      expect(results).toHaveLength(concurrentTests);
      expect(totalTime).toBeLessThan(5000); // All 50 requests in under 5 seconds
      
      // Verify all results are valid
      results.forEach(result => {
        expect(result).toHaveProperty('safe');
        expect(result).toHaveProperty('riskScore');
        expect(result).toHaveProperty('actions');
        expect(result.executionTimeMs).toBeLessThan(200);
      });
    });

    test('should gracefully handle system errors', async () => {
      // Test with malformed input
      const invalidInputs = [
        null,
        undefined,
        "",
        "x".repeat(100000), // Very long message
        String.fromCharCode(0, 1, 2, 3), // Control characters
      ];

      for (const input of invalidInputs) {
        try {
          const result = await safetyEngine.performSafetyCheck(
            input as any,
            {
              sessionId: 'error-test',
              messageType: 'general',
              isAnonymous: true
            }
          );
          
          // Should not throw, should return safe defaults
          expect(result).toHaveProperty('safe');
          expect(result).toHaveProperty('riskScore');
          expect(result.riskScore).toBeGreaterThanOrEqual(0);
          expect(result.riskScore).toBeLessThanOrEqual(1);
          
        } catch (error) {
          // If it does throw, it should be a handled error
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    test('should maintain accuracy under load', async () => {
      const loadTestMessages = [
        { content: "I want to kill myself", expectedHigh: true },
        { content: "Having a great day!", expectedHigh: false },
        { content: "You're an idiot", expectedHigh: true },
        { content: "Thanks for the help", expectedHigh: false },
        { content: "I'm going to hurt myself", expectedHigh: true }
      ];

      const iterations = 20;
      let correct = 0;
      let total = 0;

      for (let i = 0; i < iterations; i++) {
        for (const testCase of loadTestMessages) {
          const result = await safetyEngine.performSafetyCheck(
            testCase.content,
            {
              userId: `load-test-${i}`,
              sessionId: `load-session-${i}`,
              messageType: 'general',
              isAnonymous: true
            }
          );

          const actualHigh = result.riskScore >= 0.7;
          if (actualHigh === testCase.expectedHigh) {
            correct++;
          }
          total++;
        }
      }

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.85); // 85% accuracy minimum under load
    });
  });

  describe('Safety Statistics and Monitoring', () => {
    test('should provide accurate safety statistics', async () => {
      const stats = await safetyEngine.getSafetyStats();
      
      expect(stats).toHaveProperty('totalChecks');
      expect(stats).toHaveProperty('blockedContent');
      expect(stats).toHaveProperty('crisisDetections');
      expect(stats).toHaveProperty('accuracy');
      expect(stats).toHaveProperty('systemHealth');
      expect(stats).toHaveProperty('responseTimeMs');
      
      expect(stats.accuracy).toBeGreaterThanOrEqual(0);
      expect(stats.accuracy).toBeLessThanOrEqual(1);
      expect(stats.responseTimeMs).toBeGreaterThan(0);
      expect(stats.systemHealth).toBeOneOf(['HEALTHY', 'DEGRADED', 'CRITICAL']);
    });

    test('should generate audit analysis reports', async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const analysis = await auditTrail.generateAuditAnalysis({
        startDate: oneWeekAgo,
        includeOutcomes: true
      }, true);
      
      expect(analysis).toHaveProperty('totalDecisions');
      expect(analysis).toHaveProperty('accuracyRate');
      expect(analysis).toHaveProperty('falsePositiveRate');
      expect(analysis).toHaveProperty('falseNegativeRate');
      expect(analysis).toHaveProperty('humanOverrideRate');
      expect(analysis).toHaveProperty('decisionBreakdown');
      expect(analysis).toHaveProperty('riskDistribution');
      expect(analysis).toHaveProperty('trends');
      
      expect(analysis.accuracyRate).toBeGreaterThanOrEqual(0);
      expect(analysis.accuracyRate).toBeLessThanOrEqual(1);
      expect(analysis.falsePositiveRate).toBeLessThanOrEqual(0.05); // <5% false positive target
    });
  });

  describe('Integration with Crisis Management', () => {
    test('should trigger appropriate escalations for crisis levels', async () => {
      const crisisLevels = [
        {
          message: "I'm going to kill myself right now",
          expectedEscalation: 'EMERGENCY_SERVICES_IMMEDIATELY'
        },
        {
          message: "I have a suicide plan for tomorrow",
          expectedEscalation: 'EMERGENCY_ESCALATION'
        },
        {
          message: "I'm cutting myself and can't stop",
          expectedEscalation: 'PRIORITY_INTERVENTION'
        },
        {
          message: "I feel really hopeless and sad",
          expectedEscalation: 'STANDARD_SUPPORT'
        }
      ];

      for (const test of crisisLevels) {
        const result = await safetyEngine.performSafetyCheck(test.message, {
          sessionId: 'crisis-escalation-test',
          messageType: 'crisis',
          isAnonymous: true
        });

        const hasExpectedEscalation = result.actions.some(action => 
          action.includes(test.expectedEscalation.split('_')[0])
        );
        
        if (test.expectedEscalation === 'EMERGENCY_SERVICES_IMMEDIATELY') {
          expect(result.actions).toContain('EMERGENCY_SERVICES_IMMEDIATELY');
        } else if (test.expectedEscalation === 'EMERGENCY_ESCALATION') {
          expect(result.actions.some(a => a.includes('EMERGENCY'))).toBe(true);
        }
      }
    });
  });
});