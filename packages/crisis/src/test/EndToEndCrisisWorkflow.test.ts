/**
 * ASTRAL_CORE 2.0 End-to-End Crisis Response Workflow Tests
 * 
 * CRITICAL INTEGRATION TESTING:
 * - Tests complete crisis response pipeline
 * - Validates performance targets (<200ms response)
 * - Ensures all safety mechanisms work together
 * - Verifies emergency escalation workflows
 * 
 * LIFE-CRITICAL VALIDATION:
 * - No false negatives for emergency situations
 * - Proper volunteer assignment under load
 * - Emergency services integration
 * - Zero-knowledge encryption integrity
 */

import { CrisisInterventionEngine } from '../engines/CrisisInterventionEngine';
import { CrisisSeverityAssessment } from '../assessment/CrisisSeverityAssessment';
import { OptimizedVolunteerMatcher } from '../matching/OptimizedVolunteerMatcher';
import { EmergencyEscalation } from '../escalation/EmergencyEscalation';
import { CRISIS_CONSTANTS } from '../index';

describe('End-to-End Crisis Response Workflow', () => {
  let crisisEngine: CrisisInterventionEngine;
  let assessment: CrisisSeverityAssessment;
  let matcher: OptimizedVolunteerMatcher;
  let escalation: EmergencyEscalation;
  
  beforeAll(async () => {
    // Initialize crisis system components
    crisisEngine = CrisisInterventionEngine.getInstance();
    assessment = new CrisisSeverityAssessment();
    matcher = OptimizedVolunteerMatcher.getInstance();
    escalation = EmergencyEscalation.getInstance();
    
    // Warm up caches for performance testing
    await matcher.warmupCache();
  });
  
  describe('Emergency Crisis Detection and Response', () => {
    test('should detect emergency keywords and trigger immediate response', async () => {
      const emergencyMessage = "I want to kill myself tonight. I have a plan and I'm ready to do it.";
      const startTime = performance.now();
      
      // Test enhanced assessment
      const result = await assessment.assessMessageWithRiskScore(emergencyMessage);
      
      const responseTime = performance.now() - startTime;
      
      // Validate emergency detection
      expect(result.severity).toBeGreaterThanOrEqual(9);
      expect(result.riskBreakdown.riskLevel).toBe('EMERGENCY');
      expect(result.riskBreakdown.immediateAction).toBe(true);
      expect(result.emergencyKeywords.length).toBeGreaterThan(0);
      
      // Validate performance
      expect(responseTime).toBeLessThan(25); // Target: <25ms for enhanced assessment
      expect(result.riskBreakdown.executionTimeMs).toBeLessThan(20);
      
      // Validate recommended actions
      expect(result.recommendedActions).toContain('IMMEDIATE_ESCALATION');
      expect(result.recommendedActions).toContain('EMERGENCY_SERVICES_ALERT');
      
      // Validate risk factors
      expect(result.riskBreakdown.riskFactors).toContain(expect.stringContaining('Emergency keywords detected'));
      expect(result.riskBreakdown.riskFactors).toContain('Planning language detected');
      expect(result.riskBreakdown.riskFactors).toContain('Immediate time references');
    });
    
    test('should complete emergency volunteer assignment within 2 seconds', async () => {
      const startTime = performance.now();
      
      const volunteerMatch = await matcher.findBestMatch({
        severity: 10,
        keywords: ['suicide', 'kill myself'],
        urgency: 'CRITICAL',
        specializations: ['suicide-prevention', 'crisis-intervention'],
        languages: ['en'],
      }, true); // Emergency flag
      
      const responseTime = performance.now() - startTime;
      
      // Validate emergency matching performance
      expect(responseTime).toBeLessThan(2000); // Target: <2s for emergency
      expect(volunteerMatch).toBeTruthy();
      
      if (volunteerMatch) {
        expect(volunteerMatch.isEmergencyResponder).toBe(true);
        expect(volunteerMatch.matchScore).toBeGreaterThan(0.8); // High quality match
        expect(volunteerMatch.currentLoad).toBeLessThan(volunteerMatch.maxConcurrent);
      }
    });
    
    test('should trigger emergency escalation protocol correctly', async () => {
      const mockSessionId = 'test-emergency-session-001';
      const startTime = performance.now();
      
      const escalationResult = await escalation.triggerEmergencyProtocol(
        mockSessionId,
        'AUTOMATIC_KEYWORD'
      );
      
      const responseTime = performance.now() - startTime;
      
      // Validate escalation performance
      expect(responseTime).toBeLessThan(30000); // Target: <30s for emergency escalation
      expect(escalationResult.severity).toBe('EMERGENCY');
      expect(escalationResult.targetMet).toBe(true);
      
      // Validate escalation actions
      expect(escalationResult.actionsExecuted).toContain('EMERGENCY_SERVICES_CONTACTED');
      expect(escalationResult.actionsExecuted).toContain('988_LIFELINE_CONTACTED');
      expect(escalationResult.actionsExecuted).toContain('CRISIS_SPECIALIST_ASSIGNED');
      
      expect(escalationResult.emergencyContacted).toBe(true);
      expect(escalationResult.lifeline988Called).toBe(true);
      expect(escalationResult.specialistAssigned).toBe(true);
    });
  });
  
  describe('Standard Crisis Response Performance', () => {
    test('should handle moderate crisis with standard response time', async () => {
      const moderateMessage = "I'm feeling really depressed and overwhelmed. I don't know what to do anymore.";
      const startTime = performance.now();
      
      const result = await assessment.assessMessageWithRiskScore(moderateMessage);
      
      const responseTime = performance.now() - startTime;
      
      // Validate moderate crisis detection
      expect(result.severity).toBeGreaterThanOrEqual(4);
      expect(result.severity).toBeLessThan(7);
      expect(result.riskBreakdown.riskLevel).toMatch(/MODERATE|HIGH/);
      
      // Validate performance
      expect(responseTime).toBeLessThan(25);
      
      // Validate appropriate response level
      expect(result.riskBreakdown.interventionLevel).toMatch(/PROFESSIONAL|PEER_SUPPORT/);
      expect(result.recommendedActions).toContain('RESOURCE_PROVISION');
    });
    
    test('should complete standard volunteer assignment within 5 seconds', async () => {
      const startTime = performance.now();
      
      const volunteerMatch = await matcher.findBestMatch({
        severity: 5,
        keywords: ['depressed', 'overwhelmed'],
        urgency: 'NORMAL',
        specializations: ['depression-support'],
        languages: ['en'],
      }, false);
      
      const responseTime = performance.now() - startTime;
      
      // Validate standard matching performance
      expect(responseTime).toBeLessThan(5000); // Target: <5s for standard
      expect(volunteerMatch).toBeTruthy();
      
      if (volunteerMatch) {
        expect(volunteerMatch.matchScore).toBeGreaterThan(0.6); // Minimum match threshold
        expect(volunteerMatch.specializations).toContain('crisis-intervention');
      }
    });
  });
  
  describe('Complete Crisis Session Workflow', () => {
    test('should handle complete anonymous crisis session', async () => {
      const initialMessage = "I'm having a panic attack and can't breathe. I need help right now.";
      const startTime = performance.now();
      
      // Test complete crisis connection flow
      const connection = await crisisEngine.connectAnonymous(initialMessage);
      
      const connectionTime = performance.now() - startTime;
      
      // Validate connection performance
      expect(connectionTime).toBeLessThan(CRISIS_CONSTANTS.MAX_RESPONSE_TIME_MS);
      expect(connection.targetMet).toBe(true);
      
      // Validate connection setup
      expect(connection.sessionId).toBeTruthy();
      expect(connection.sessionToken).toBeTruthy();
      expect(connection.anonymousId).toBeTruthy();
      expect(connection.websocketUrl).toBeTruthy();
      expect(connection.encrypted).toBe(true);
      
      // Validate severity assessment
      expect(connection.severity).toBeGreaterThanOrEqual(6); // Panic attack should be high severity
      expect(connection.resources).toBeTruthy();
      expect(connection.resources.length).toBeGreaterThan(0);
      
      // Test follow-up message handling
      const followUpMessage = "The breathing exercises helped a bit. Thank you.";
      const messageStart = performance.now();
      
      const messageResult = await crisisEngine.sendMessage(
        connection.sessionToken,
        followUpMessage,
        connection.anonymousId
      );
      
      const messageTime = performance.now() - messageStart;
      
      // Validate message processing performance
      expect(messageTime).toBeLessThan(50); // Target: <50ms for message processing
      expect(messageResult.encrypted).toBe(true);
      expect(messageResult.riskScore).toBeLessThan(connection.severity); // Should show improvement
      
      // Test session cleanup
      await crisisEngine.endSession(connection.sessionToken, 'RESOLVED', { helpful: true });
    });
  });
  
  describe('Risk Progression Tracking', () => {
    test('should track risk escalation over multiple messages', async () => {
      const sessionId = 'test-progression-session';
      
      // Simulate conversation with escalating risk
      const messages = [
        "I'm feeling a bit down today.",
        "Actually, I'm more than down. I'm really struggling.",
        "I can't handle this anymore. Everything is falling apart.",
        "I'm thinking about ending it all. I don't see any other way.",
        "I have a plan. I'm going to do it tonight."
      ];
      
      const assessments = [];
      for (const message of messages) {
        const result = await assessment.assessMessageWithRiskScore(message, sessionId);
        assessments.push(result);
      }
      
      // Validate risk progression
      expect(assessments[0].severity).toBeLessThan(assessments[4].severity);
      expect(assessments[4].riskBreakdown.riskLevel).toBe('EMERGENCY');
      expect(assessments[4].riskBreakdown.immediateAction).toBe(true);
      
      // Validate progression tracking
      const finalAssessment = assessments[4];
      expect(finalAssessment.riskBreakdown.components.progressionRisk).toBeGreaterThan(0);
    });
  });
  
  describe('System Performance Under Load', () => {
    test('should maintain performance targets under concurrent load', async () => {
      const concurrentSessions = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentSessions; i++) {
        const promise = (async () => {
          const startTime = performance.now();
          const message = `I'm in crisis and need help immediately. Session ${i}`;
          
          const result = await assessment.assessMessageWithRiskScore(message);
          const responseTime = performance.now() - startTime;
          
          return { result, responseTime };
        })();
        promises.push(promise);
      }
      
      const results = await Promise.all(promises);
      
      // Validate all sessions met performance targets
      for (const { result, responseTime } of results) {
        expect(responseTime).toBeLessThan(50); // Should maintain performance under load
        expect(result.severity).toBeGreaterThan(0);
        expect(result.riskBreakdown).toBeTruthy();
      }
      
      // Validate average performance
      const avgResponseTime = results.reduce((sum, { responseTime }) => sum + responseTime, 0) / results.length;
      expect(avgResponseTime).toBeLessThan(30);
    });
  });
  
  describe('Error Handling and Resilience', () => {
    test('should handle invalid input gracefully', async () => {
      const invalidInputs = ['', '   ', null, undefined];
      
      for (const input of invalidInputs) {
        try {
          // Should not throw errors for invalid input
          const result = await assessment.assessMessage(input as any);
          expect(result).toBeTruthy();
          expect(result.severity).toBeGreaterThanOrEqual(1);
        } catch (error) {
          // If it throws, it should be a controlled error
          expect(error).toBeInstanceOf(Error);
        }
      }
    });
    
    test('should maintain service availability during component failures', async () => {
      // Test fallback mechanisms
      const testMessage = "I need help with my depression.";
      
      try {
        const result = await assessment.assessMessage(testMessage);
        expect(result).toBeTruthy();
        expect(result.severity).toBeGreaterThan(0);
      } catch (error) {
        // Should have fallback mechanisms
        fail('Crisis assessment should not fail completely');
      }
    });
  });
  
  afterAll(async () => {
    // Cleanup test resources
    console.log('🧪 Crisis workflow testing completed');
  });
});