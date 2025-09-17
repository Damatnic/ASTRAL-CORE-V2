/**
 * ASTRAL_CORE 2.0 Emergency Escalation System Tests
 * 
 * CRITICAL LIFE-SAFETY TESTING
 * 
 * These tests verify the functionality of the 5-tier emergency escalation system.
 * All tests must pass before deployment - lives depend on this system.
 */

import EmergencyEscalationSystem from '../emergency-escalation';
import type { EscalationRequest, SeverityAssessmentResult, EscalationResult } from '../emergency-escalation';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
global.performance = { now: mockPerformanceNow } as any;

describe('EmergencyEscalationSystem', () => {
  let escalationSystem: EmergencyEscalationSystem;
  
  beforeEach(() => {
    escalationSystem = EmergencyEscalationSystem.getInstance();
    mockPerformanceNow.mockReturnValue(0);
    jest.clearAllMocks();
  });

  describe('Severity Assessment', () => {
    it('should detect Level 5 (Emergency) keywords', async () => {
      const testCases = [
        'I want to kill myself right now',
        'I have a plan to end my life tonight',
        'I am going to take all these pills',
        'I want to jump off this bridge today'
      ];

      for (const text of testCases) {
        const result = await escalationSystem.assessSeverity(text);
        expect(result.level).toBe(5);
        expect(result.confidence).toBeGreaterThanOrEqual(95);
        expect(result.keywords.length).toBeGreaterThan(0);
      }
    });

    it('should detect Level 4 (Critical) keywords', async () => {
      const testCases = [
        'I want to die',
        'I have suicidal thoughts',
        'I want to hurt myself',
        'The pain is too much'
      ];

      for (const text of testCases) {
        const result = await escalationSystem.assessSeverity(text);
        expect(result.level).toBe(4);
        expect(result.confidence).toBeGreaterThanOrEqual(70);
      }
    });

    it('should detect Level 3 (High) keywords', async () => {
      const testCases = [
        'I am having a panic attack',
        'I am in crisis',
        'I cannot cope anymore',
        'I am completely overwhelmed'
      ];

      for (const text of testCases) {
        const result = await escalationSystem.assessSeverity(text);
        expect(result.level).toBe(3);
        expect(result.confidence).toBeGreaterThanOrEqual(60);
      }
    });

    it('should detect Level 2 (Elevated) keywords', async () => {
      const testCases = [
        'I am struggling',
        'I need support',
        'I am going through a difficult time',
        'I feel very stressed'
      ];

      for (const text of testCases) {
        const result = await escalationSystem.assessSeverity(text);
        expect(result.level).toBe(2);
        expect(result.confidence).toBeGreaterThanOrEqual(50);
      }
    });

    it('should default to Level 1 for general messages', async () => {
      const testCases = [
        'Hello, how are you?',
        'I had a good day today',
        'What is the weather like?',
        'Thank you for your help'
      ];

      for (const text of testCases) {
        const result = await escalationSystem.assessSeverity(text);
        expect(result.level).toBe(1);
      }
    });

    it('should identify risk factors correctly', async () => {
      const result = await escalationSystem.assessSeverity(
        'I am alone and nobody cares, I have been drinking and I have a plan to kill myself'
      );
      
      expect(result.level).toBe(5);
      expect(result.confidence).toBe(100);
      expect(result.riskFactors).toContain('social_isolation');
      expect(result.riskFactors).toContain('substance_use');
      expect(result.riskFactors).toContain('suicide_plan');
    });

    it('should identify timeline indicators', async () => {
      const result = await escalationSystem.assessSeverity(
        'I want to kill myself right now'
      );
      
      expect(result.timelineIndicators).toContain('immediate_timeline');
      expect(result.confidence).toBe(100);
    });

    it('should complete assessment within performance target (<10ms)', async () => {
      const startTime = Date.now();
      await escalationSystem.assessSeverity('I want to hurt myself');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('Level 5 (Emergency) Escalation', () => {
    it('should execute all emergency actions', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-emergency',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I want to kill myself right now',
        reason: 'Immediate danger detected',
        context: {
          geolocation: { country: 'US', state: 'NY' }
        }
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(25000); // 25 seconds

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(5);
      expect(result.severity).toBe('EMERGENCY');
      expect(result.emergencyServicesContacted).toBe(true);
      expect(result.hotlineContacted).toBe(true);
      expect(result.volunteerAssigned).toBe(true);
      expect(result.actionsExecuted).toContain('CONTACT_911');
      expect(result.actionsExecuted).toContain('CONTACT_988_LIFELINE');
      expect(result.actionsExecuted).toContain('ASSIGN_CRISIS_SPECIALIST');
      expect(result.actionsExecuted).toContain('LOCATION_SERVICES');
      expect(result.actionsExecuted).toContain('CONTINUOUS_MONITORING');
      expect(result.responseTimeMs).toBe(25000);
      expect(result.targetMet).toBe(true); // Under 30 second target
    });

    it('should meet 30-second response target', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-speed',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I have a gun and I want to use it on myself',
        reason: 'Immediate danger with weapon'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(20000); // 20 seconds

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(5);
      expect(result.responseTimeMs).toBe(20000);
      expect(result.targetMet).toBe(true);
    });

    it('should include appropriate next steps for emergency escalation', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-steps',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I am going to jump off this bridge',
        reason: 'Immediate suicide threat'
      };

      const result = await escalationSystem.escalate(request);

      expect(result.nextSteps).toContain('Emergency services have been contacted');
      expect(result.nextSteps).toContain('988 Suicide & Crisis Lifeline has been notified');
      expect(result.nextSteps).toContain('Crisis specialist is joining immediately');
      expect(result.nextSteps).toContain('Location services activated for safety');
      expect(result.nextSteps).toContain('Continuous monitoring in effect');
    });
  });

  describe('Level 4 (Critical) Escalation', () => {
    it('should execute critical risk actions', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-critical',
        trigger: 'AI_ASSESSMENT',
        inputText: 'I have been thinking about suicide',
        reason: 'Critical risk assessment'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(45000); // 45 seconds

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(4);
      expect(result.severity).toBe('CRITICAL');
      expect(result.hotlineContacted).toBe(true);
      expect(result.volunteerAssigned).toBe(true);
      expect(result.emergencyServicesContacted).toBe(false);
      expect(result.actionsExecuted).toContain('CONTACT_988_LIFELINE');
      expect(result.actionsExecuted).toContain('ASSIGN_SPECIALIST');
      expect(result.actionsExecuted).toContain('EMERGENCY_PROTOCOL');
      expect(result.responseTimeMs).toBe(45000);
      expect(result.targetMet).toBe(true); // Under 60 second target
    });

    it('should meet 1-minute response target', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-critical-speed',
        trigger: 'VOLUNTEER_REQUEST',
        severity: 8,
        reason: 'Volunteer escalation for high-risk user'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(50000); // 50 seconds

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(4);
      expect(result.responseTimeMs).toBe(50000);
      expect(result.targetMet).toBe(true);
    });
  });

  describe('Level 3 (High Risk) Escalation', () => {
    it('should execute high risk actions', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-high',
        trigger: 'USER_REQUEST',
        inputText: 'I am having a mental health crisis',
        reason: 'User requested escalation'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(90000); // 90 seconds

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(3);
      expect(result.severity).toBe('HIGH');
      expect(result.volunteerAssigned).toBe(true);
      expect(result.hotlineContacted).toBe(false);
      expect(result.emergencyServicesContacted).toBe(false);
      expect(result.actionsExecuted).toContain('ASSIGN_COUNSELOR');
      expect(result.actionsExecuted).toContain('SAFETY_PLAN');
      expect(result.actionsExecuted).toContain('CONTINUOUS_MONITORING');
      expect(result.responseTimeMs).toBe(90000);
      expect(result.targetMet).toBe(true); // Under 2 minute target
    });
  });

  describe('Level 2 (Elevated) Escalation', () => {
    it('should execute elevated support actions', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-elevated',
        trigger: 'TIMEOUT',
        severity: 4,
        reason: 'Session timeout escalation'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(120000); // 2 minutes

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(2);
      expect(result.severity).toBe('MODERATE');
      expect(result.volunteerAssigned).toBe(true);
      expect(result.actionsExecuted).toContain('ASSIGN_TRAINED_VOLUNTEER');
      expect(result.actionsExecuted).toContain('SAFETY_CHECK');
      expect(result.actionsExecuted).toContain('COPING_STRATEGIES');
      expect(result.responseTimeMs).toBe(120000);
      expect(result.targetMet).toBe(true); // Under 3 minute target
    });
  });

  describe('Level 1 (Standard) Escalation', () => {
    it('should execute standard support actions', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-standard',
        trigger: 'USER_REQUEST',
        severity: 2,
        reason: 'Basic support request'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(180000); // 3 minutes

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(1);
      expect(result.severity).toBe('MODERATE');
      expect(result.volunteerAssigned).toBe(true);
      expect(result.actionsExecuted).toContain('ASSIGN_PEER_VOLUNTEER');
      expect(result.actionsExecuted).toContain('PROVIDE_RESOURCES');
      expect(result.responseTimeMs).toBe(180000);
      expect(result.targetMet).toBe(true); // Under 5 minute target
    });
  });

  describe('Geographic Routing', () => {
    it('should provide correct emergency numbers for US', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-us',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I want to kill myself',
        reason: 'Emergency in US',
        context: {
          geolocation: { country: 'US', state: 'CA' }
        }
      };

      const result = await escalationSystem.escalate(request);

      expect(result.geographicRouting.region).toBe('US');
      expect(result.geographicRouting.emergencyNumbers).toContain('911');
      expect(result.geographicRouting.emergencyNumbers).toContain('988');
      expect(result.geographicRouting.supportLanguages).toContain('en');
      expect(result.geographicRouting.supportLanguages).toContain('es');
    });

    it('should provide correct emergency numbers for Canada', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session-ca',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I want to end my life',
        reason: 'Emergency in Canada',
        context: {
          geolocation: { country: 'CA', state: 'ON' }
        }
      };

      const result = await escalationSystem.escalate(request);

      expect(result.geographicRouting.region).toBe('CA');
      expect(result.geographicRouting.emergencyNumbers).toContain('911');
      expect(result.geographicRouting.emergencyNumbers).toContain('833-456-4566');
      expect(result.geographicRouting.supportLanguages).toContain('en');
      expect(result.geographicRouting.supportLanguages).toContain('fr');
    });
  });

  describe('Performance Requirements', () => {
    it('should complete Level 5 escalation within 30 seconds', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-perf-level5',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I have a gun and want to use it on myself right now',
        reason: 'Performance test'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(25000);

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(5);
      expect(result.responseTimeMs).toBeLessThanOrEqual(30000);
      expect(result.targetMet).toBe(true);
    });

    it('should complete Level 4 escalation within 60 seconds', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-perf-level4',
        trigger: 'AI_ASSESSMENT',
        severity: 8,
        reason: 'Performance test'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(55000);

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(4);
      expect(result.responseTimeMs).toBeLessThanOrEqual(60000);
      expect(result.targetMet).toBe(true);
    });

    it('should detect when response time targets are missed', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-missed-target',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I want to kill myself',
        reason: 'Performance test - missed target'
      };

      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(35000); // 35 seconds (over 30s target)

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(5);
      expect(result.responseTimeMs).toBeGreaterThan(30000);
      expect(result.targetMet).toBe(false);
    });
  });

  describe('System Health Monitoring', () => {
    it('should return system health status', async () => {
      const health = await escalationSystem.getSystemHealth();

      expect(health).toHaveProperty('totalEscalationsToday');
      expect(health).toHaveProperty('averageResponseTimeMs');
      expect(health).toHaveProperty('emergencyEscalationsToday');
      expect(health).toHaveProperty('criticalEscalationsToday');
      expect(health.systemStatus).toBe('OPERATIONAL');
      expect(health.allLevelsOperational).toBe(true);
      expect(health.hotlineIntegrationStatus).toBe('CONNECTED');
      expect(health.emergencyServicesStatus).toBe('CONNECTED');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid session ID gracefully', async () => {
      const request: EscalationRequest = {
        sessionId: 'invalid-session',
        trigger: 'USER_REQUEST',
        reason: 'Test invalid session'
      };

      await expect(escalationSystem.escalate(request)).rejects.toThrow('Crisis session not found');
    });

    it('should handle missing input gracefully', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-session',
        trigger: 'USER_REQUEST',
        reason: 'Test missing input'
      };

      // Should not throw error, should use trigger-based escalation
      const result = await escalationSystem.escalate(request);
      expect(result.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Integration Requirements', () => {
    it('should log all Level 5 escalations for audit trail', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-audit',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I want to kill myself with this gun',
        reason: 'Audit trail test'
      };

      const result = await escalationSystem.escalate(request);

      expect(result.level).toBe(5);
      expect(result.emergencyServicesContacted).toBe(true);
      expect(result.hotlineContacted).toBe(true);
      // Audit logs would be verified through database integration tests
    });

    it('should provide comprehensive escalation results', async () => {
      const request: EscalationRequest = {
        sessionId: 'test-comprehensive',
        trigger: 'AUTOMATIC_KEYWORD',
        inputText: 'I am going to end my life tonight',
        reason: 'Comprehensive test'
      };

      const result = await escalationSystem.escalate(request);

      // Verify all required result properties
      expect(result).toHaveProperty('escalationId');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('actionsExecuted');
      expect(result).toHaveProperty('volunteerAssigned');
      expect(result).toHaveProperty('hotlineContacted');
      expect(result).toHaveProperty('emergencyServicesContacted');
      expect(result).toHaveProperty('responseTimeMs');
      expect(result).toHaveProperty('targetMet');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('geographicRouting');

      expect(Array.isArray(result.actionsExecuted)).toBe(true);
      expect(Array.isArray(result.nextSteps)).toBe(true);
      expect(typeof result.volunteerAssigned).toBe('boolean');
      expect(typeof result.hotlineContacted).toBe('boolean');
      expect(typeof result.emergencyServicesContacted).toBe('boolean');
      expect(typeof result.responseTimeMs).toBe('number');
      expect(typeof result.targetMet).toBe('boolean');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EmergencyEscalationSystem.getInstance();
      const instance2 = EmergencyEscalationSystem.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});

/**
 * Integration Tests
 * These would run against actual services in integration environment
 */
describe('Emergency Escalation Integration Tests', () => {
  // These tests would be run in integration environment with real services
  
  it.skip('should actually contact 988 Lifeline API', async () => {
    // Integration test with real 988 Lifeline API
  });

  it.skip('should actually interface with emergency services', async () => {
    // Integration test with emergency services API
  });

  it.skip('should assign real volunteers from database', async () => {
    // Integration test with real volunteer database
  });

  it.skip('should create real audit logs', async () => {
    // Integration test with real database
  });

  it.skip('should handle real geographic routing', async () => {
    // Integration test with real geolocation services
  });
});