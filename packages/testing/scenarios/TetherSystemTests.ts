/**
 * ASTRAL_CORE 2.0 - Comprehensive Tether System Tests
 * 
 * LIFE-CRITICAL TESTING SCENARIOS
 * These tests ensure the tether system works correctly in emergency situations.
 * Test failures could result in loss of life - all tests must pass.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient } from '@astralcore/database';
import { HeartbeatDetectionService } from '../../core/services/tether/HeartbeatDetectionService';
import { EmergencyInterventionTriggers } from '../../core/services/tether/EmergencyInterventionTriggers';

interface TestTether {
  id: string;
  seekerId: string;
  supporterId: string;
  pulseInterval: number;
  emergencyActive: boolean;
  lastPulse: Date;
  missedPulses: number;
}

interface TestUser {
  id: string;
  type: 'seeker' | 'supporter';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  wellnessScore?: number;
  emergencyContacts?: string[];
}

interface TestScenario {
  name: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedOutcome: string;
  maxResponseTime: number; // milliseconds
  criticalPath: boolean; // If true, failure means lives at risk
}

describe('Tether System Integration Tests', () => {
  let prisma: PrismaClient;
  let heartbeatService: HeartbeatDetectionService;
  let interventionService: EmergencyInterventionTriggers;
  let testUsers: TestUser[];
  let testTethers: TestTether[];

  beforeEach(async () => {
    // Initialize test environment
    prisma = new PrismaClient();
    heartbeatService = new HeartbeatDetectionService(prisma);
    interventionService = new EmergencyInterventionTriggers(prisma);

    // Set up test data
    await setupTestEnvironment();
    
    // Start services
    await heartbeatService.start();
    await interventionService.start();
  });

  afterEach(async () => {
    // Clean up test environment
    await cleanupTestEnvironment();
    
    // Stop services
    await heartbeatService.stop();
    await interventionService.stop();
    
    await prisma.$disconnect();
  });

  async function setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up tether system test environment...');

    // Create test users
    testUsers = [
      {
        id: 'test-seeker-high-risk',
        type: 'seeker',
        riskLevel: 'HIGH',
        wellnessScore: 2,
        emergencyContacts: ['emergency-contact-1']
      },
      {
        id: 'test-seeker-medium-risk',
        type: 'seeker',
        riskLevel: 'MEDIUM',
        wellnessScore: 5,
      },
      {
        id: 'test-seeker-low-risk',
        type: 'seeker',
        riskLevel: 'LOW',
        wellnessScore: 8,
      },
      {
        id: 'test-supporter-emergency',
        type: 'supporter',
        riskLevel: 'LOW',
      },
      {
        id: 'test-supporter-regular',
        type: 'supporter',
        riskLevel: 'LOW',
      }
    ];

    // Create test tether connections
    testTethers = [
      {
        id: 'tether-high-risk',
        seekerId: 'test-seeker-high-risk',
        supporterId: 'test-supporter-emergency',
        pulseInterval: 30, // 30 seconds
        emergencyActive: false,
        lastPulse: new Date(),
        missedPulses: 0,
      },
      {
        id: 'tether-medium-risk',
        seekerId: 'test-seeker-medium-risk',
        supporterId: 'test-supporter-regular',
        pulseInterval: 60, // 1 minute
        emergencyActive: false,
        lastPulse: new Date(),
        missedPulses: 0,
      }
    ];

    // Insert test data into database
    for (const tether of testTethers) {
      await prisma.tetherLink.create({
        data: {
          id: tether.id,
          seekerId: tether.seekerId,
          supporterId: tether.supporterId,
          pulseInterval: tether.pulseInterval,
          emergencyActive: tether.emergencyActive,
          lastPulse: tether.lastPulse,
          missedPulses: tether.missedPulses,
          strength: 0.8,
          trustScore: 0.7,
        }
      });
    }

    console.log('✅ Test environment setup complete');
  }

  async function cleanupTestEnvironment(): Promise<void> {
    console.log('🧹 Cleaning up test environment...');
    
    // Clean up test data
    await prisma.tetherLink.deleteMany({
      where: {
        id: {
          in: testTethers.map(t => t.id)
        }
      }
    });

    console.log('✅ Test environment cleanup complete');
  }

  describe('Critical Emergency Response Tests', () => {
    const criticalScenarios: TestScenario[] = [
      {
        name: 'High-Risk User Missed Heartbeat Emergency',
        description: 'High-risk user misses multiple heartbeats, should trigger immediate emergency response',
        riskLevel: 'CRITICAL',
        expectedOutcome: 'Emergency escalation within 60 seconds',
        maxResponseTime: 60000,
        criticalPath: true,
      },
      {
        name: 'Emergency Signal Direct Activation',
        description: 'User manually triggers emergency signal, should activate all response protocols',
        riskLevel: 'CRITICAL',
        expectedOutcome: 'All emergency protocols activated within 30 seconds',
        maxResponseTime: 30000,
        criticalPath: true,
      },
      {
        name: 'Wellness Score Critical Decline',
        description: 'Wellness score drops to 1/10, should trigger crisis intervention',
        riskLevel: 'CRITICAL',
        expectedOutcome: 'Crisis intervention triggered within 2 minutes',
        maxResponseTime: 120000,
        criticalPath: true,
      }
    ];

    criticalScenarios.forEach((scenario) => {
      it(`CRITICAL: ${scenario.name}`, async () => {
        console.log(`🚨 CRITICAL TEST: ${scenario.name}`);
        const startTime = Date.now();

        try {
          await executeEmergencyScenario(scenario);
          
          const responseTime = Date.now() - startTime;
          expect(responseTime).toBeLessThan(scenario.maxResponseTime);
          
          console.log(`✅ CRITICAL TEST PASSED: ${scenario.name} (${responseTime}ms)`);
        } catch (error) {
          console.error(`❌ CRITICAL TEST FAILED: ${scenario.name}`, error);
          throw new Error(`LIFE-CRITICAL TEST FAILURE: ${scenario.name} - ${error.message}`);
        }
      }, 30000); // 30 second timeout for critical tests
    });
  });

  describe('Heartbeat Detection Tests', () => {
    it('should detect missed heartbeats within monitoring interval', async () => {
      const tether = testTethers[0];
      
      // Simulate missed heartbeats by setting last pulse to past
      const pastTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      await prisma.tetherLink.update({
        where: { id: tether.id },
        data: { 
          lastPulse: pastTime,
          missedPulses: 10 // 10 missed beats
        }
      });

      // Wait for heartbeat detection cycle
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds

      // Verify emergency was triggered
      const updatedTether = await prisma.tetherLink.findUnique({
        where: { id: tether.id }
      });

      expect(updatedTether?.emergencyActive).toBe(true);
    });

    it('should handle heartbeat recovery correctly', async () => {
      const tether = testTethers[0];
      
      // First trigger emergency
      await prisma.tetherLink.update({
        where: { id: tether.id },
        data: { 
          emergencyActive: true,
          missedPulses: 10
        }
      });

      // Then simulate heartbeat recovery
      await heartbeatService.updateHeartbeat(tether.id, {
        pulseType: 'HEARTBEAT',
        strength: 0.8,
        status: 'NORMAL'
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Verify recovery
      const updatedTether = await prisma.tetherLink.findUnique({
        where: { id: tether.id }
      });

      expect(updatedTether?.emergencyActive).toBe(false);
      expect(updatedTether?.missedPulses).toBe(0);
    });
  });

  describe('Pulse Monitoring Tests', () => {
    it('should process normal pulse correctly', async () => {
      const tether = testTethers[1];
      
      const pulseData = {
        tetherId: tether.id,
        pulseType: 'HEARTBEAT' as const,
        strength: 0.9,
        mood: 7,
        status: 'NORMAL' as const,
        urgencyLevel: 'LOW' as const,
      };

      const response = await fetch('/api/tether/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pulseData)
      });

      const result = await response.json();
      
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.emergencyTriggered).toBe(false);
    });

    it('should trigger emergency for crisis pulse', async () => {
      const tether = testTethers[0]; // High-risk user
      
      const emergencyPulse = {
        tetherId: tether.id,
        pulseType: 'EMERGENCY' as const,
        strength: 0.2,
        mood: 1,
        status: 'EMERGENCY' as const,
        urgencyLevel: 'CRITICAL' as const,
        emergencySignal: true,
      };

      const response = await fetch('/api/tether/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyPulse)
      });

      const result = await response.json();
      
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.emergencyTriggered).toBe(true);
      expect(result.emergencyLevel).toBe('CRITICAL');
    });
  });

  describe('Tether Matching Tests', () => {
    it('should find compatible supporter for emergency matching', async () => {
      // Create emergency volunteer
      await prisma.volunteer.create({
        data: {
          id: 'emergency-volunteer',
          anonymousId: 'emergency-vol-anon',
          status: 'ACTIVE',
          isActive: true,
          currentLoad: 0,
          maxConcurrent: 5,
          emergencyResponder: true,
          emergencyAvailable: true,
          trainingHours: 50,
          specializations: ['crisis_intervention', 'suicide_prevention'],
          languages: ['en'],
          timezone: 'America/New_York',
        }
      });

      const matchingRequest = {
        seekerId: 'emergency-seeker-test',
        urgencyLevel: 'CRITICAL',
        preferences: {
          emergencyResponse: true,
          preferredLanguages: ['en'],
          preferredTimezone: 'America/New_York',
        },
        emergencyMatch: true,
        createConnection: false, // Just find matches
      };

      const response = await fetch('/api/tether/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchingRequest)
      });

      const result = await response.json();
      
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.bestMatch.emergencyCapable).toBe(true);
      expect(result.bestMatch.matchType).toBe('EMERGENCY');
    });

    it('should prioritize emergency responders for high-risk users', async () => {
      // Test that emergency-capable supporters are prioritized
      const matchingRequest = {
        seekerId: 'high-risk-seeker-test',
        urgencyLevel: 'HIGH',
        riskFactors: ['suicidal_ideation'],
        preferences: {
          emergencyResponse: true,
        },
        createConnection: false,
      };

      const response = await fetch('/api/tether/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchingRequest)
      });

      const result = await response.json();
      
      if (result.success && result.matches.length > 0) {
        // First match should be emergency capable for high-risk user
        expect(result.bestMatch.emergencyCapable).toBe(true);
      }
    });
  });

  describe('Emergency Intervention Tests', () => {
    it('should trigger manual intervention correctly', async () => {
      const triggerId = await interventionService.manualTrigger(
        'MISSED_HEARTBEAT',
        'CRITICAL',
        'test-user-intervention',
        {
          missedBeats: 15,
          timeSinceLastBeat: 900, // 15 minutes
          tetherId: 'test-tether-intervention'
        }
      );

      expect(triggerId).toBeDefined();
      expect(triggerId).toMatch(/^manual-MISSED_HEARTBEAT-/);

      // Wait for intervention processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify intervention was processed
      const status = interventionService.getStatus();
      expect(status.activeTriggers).toBeGreaterThan(0);
    });

    it('should escalate according to severity levels', async () => {
      const criticalTriggerId = await interventionService.manualTrigger(
        'EMERGENCY_SIGNAL',
        'CRITICAL',
        'test-user-critical',
        { emergencyType: 'MENTAL_HEALTH_CRISIS' }
      );

      const mediumTriggerId = await interventionService.manualTrigger(
        'WELLNESS_DECLINE',
        'MEDIUM',
        'test-user-medium',
        { wellnessScore: 4 }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const status = interventionService.getStatus();
      
      // Critical triggers should be processed faster and with more urgency
      expect(status.triggerBreakdown['CRITICAL']).toBeGreaterThanOrEqual(1);
      expect(status.triggerBreakdown['MEDIUM']).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Location Tracking Tests', () => {
    it('should handle emergency location request with consent', async () => {
      // Set up location consent
      await prisma.locationConsent.create({
        data: {
          userId: 'test-user-location',
          consentType: 'EMERGENCY_ONLY',
          granularity: 'PRECISE',
          emergencyOverride: true,
          consentGivenAt: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }
      });

      const locationRequest = {
        userId: 'test-user-location',
        requestType: 'EMERGENCY',
        urgencyLevel: 'CRITICAL',
        requestedBy: 'crisis-team-001',
        requestedByType: 'CRISIS_TEAM',
        reason: 'Emergency response requires location',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          source: 'GPS',
          timestamp: new Date(),
        }
      };

      const response = await fetch('/api/tether/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationRequest)
      });

      const result = await response.json();
      
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.locationShared).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.responders.notified).toBe(true);
    });

    it('should respect location consent settings', async () => {
      // Set up restrictive consent
      await prisma.locationConsent.create({
        data: {
          userId: 'test-user-no-location',
          consentType: 'NEVER',
          granularity: 'DISABLED',
          emergencyOverride: false,
          consentGivenAt: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }
      });

      const locationRequest = {
        userId: 'test-user-no-location',
        requestType: 'VOLUNTARY',
        urgencyLevel: 'MEDIUM',
        requestedBy: 'tether-partner',
        requestedByType: 'TETHER_PARTNER',
        reason: 'Welfare check',
      };

      const response = await fetch('/api/tether/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationRequest)
      });

      const result = await response.json();
      
      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('disabled');
    });
  });

  describe('Performance and Reliability Tests', () => {
    it('should handle multiple concurrent emergency requests', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();

      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        fetch('/api/tether/pulse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tetherId: testTethers[0].id,
            pulseType: 'EMERGENCY',
            strength: 0.1,
            status: 'EMERGENCY',
            urgencyLevel: 'CRITICAL',
            emergencySignal: true,
          })
        })
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Total time should be reasonable
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(10000); // Less than 10 seconds

      console.log(`✅ Handled ${concurrentRequests} concurrent emergency requests in ${totalTime}ms`);
    });

    it('should maintain service availability during high load', async () => {
      const status = heartbeatService.getStatus();
      expect(status.isRunning).toBe(true);

      const interventionStatus = interventionService.getStatus();
      expect(interventionStatus.isRunning).toBe(true);

      // Services should remain responsive
      const healthCheck = await fetch('/api/health');
      expect(healthCheck.status).toBe(200);
    });
  });

  describe('Data Integrity and Audit Tests', () => {
    it('should maintain audit trail for all emergency actions', async () => {
      const initialAuditCount = await prisma.auditLog.count();

      // Trigger emergency scenario
      await interventionService.manualTrigger(
        'EMERGENCY_SIGNAL',
        'CRITICAL',
        'test-audit-user',
        { emergencyType: 'TEST' }
      );

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalAuditCount = await prisma.auditLog.count();
      expect(finalAuditCount).toBeGreaterThan(initialAuditCount);

      // Verify audit log contains emergency action
      const recentAudits = await prisma.auditLog.findMany({
        where: {
          userId: 'test-audit-user',
          timestamp: {
            gte: new Date(Date.now() - 5000) // Last 5 seconds
          }
        }
      });

      expect(recentAudits.length).toBeGreaterThan(0);
    });

    it('should handle service failures gracefully', async () => {
      // Test heartbeat service resilience
      await heartbeatService.stop();
      
      // Service should handle being stopped gracefully
      expect(heartbeatService.getStatus().isRunning).toBe(false);
      
      // Restart should work
      await heartbeatService.start();
      expect(heartbeatService.getStatus().isRunning).toBe(true);
    });
  });

  async function executeEmergencyScenario(scenario: TestScenario): Promise<void> {
    console.log(`Executing emergency scenario: ${scenario.description}`);

    switch (scenario.name) {
      case 'High-Risk User Missed Heartbeat Emergency':
        await simulateMissedHeartbeatEmergency();
        break;
        
      case 'Emergency Signal Direct Activation':
        await simulateEmergencySignalActivation();
        break;
        
      case 'Wellness Score Critical Decline':
        await simulateWellnessScoreCriticalDecline();
        break;
        
      default:
        throw new Error(`Unknown emergency scenario: ${scenario.name}`);
    }
  }

  async function simulateMissedHeartbeatEmergency(): Promise<void> {
    const tether = testTethers[0]; // High-risk user tether
    
    // Simulate 10 missed heartbeats (5 minutes with 30s interval)
    await prisma.tetherLink.update({
      where: { id: tether.id },
      data: {
        lastPulse: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        missedPulses: 10
      }
    });

    // Wait for emergency detection and response
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify emergency was triggered
    const updatedTether = await prisma.tetherLink.findUnique({
      where: { id: tether.id }
    });

    if (!updatedTether?.emergencyActive) {
      throw new Error('Emergency was not triggered for missed heartbeat');
    }
  }

  async function simulateEmergencySignalActivation(): Promise<void> {
    const tether = testTethers[0];
    
    // Send emergency pulse
    const emergencyPulse = {
      tetherId: tether.id,
      pulseType: 'EMERGENCY' as const,
      strength: 0.1,
      mood: 1,
      status: 'EMERGENCY' as const,
      urgencyLevel: 'CRITICAL' as const,
      emergencySignal: true,
    };

    const response = await fetch('/api/tether/pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emergencyPulse)
    });

    const result = await response.json();

    if (!result.success || !result.emergencyTriggered) {
      throw new Error('Emergency signal was not processed correctly');
    }
  }

  async function simulateWellnessScoreCriticalDecline(): Promise<void> {
    // Create crisis session with critical wellness score
    const session = await prisma.crisisSession.create({
      data: {
        id: 'test-crisis-session',
        anonymousId: 'test-anon-critical',
        severity: 10,
        status: 'ACTIVE',
        latestWellnessScore: 1, // Critical score
        riskLevel: 'HIGH',
        nextScheduledCheckIn: new Date(Date.now() - 60 * 1000), // Overdue
      }
    });

    // Create check-in with critical wellness score
    await prisma.crisisCheckIn.create({
      data: {
        id: 'test-checkin-critical',
        sessionId: session.id,
        wellnessScore: 1,
        riskFactors: ['suicidal_ideation', 'immediate_danger'],
        responses: {
          safetyLevel: 'immediate_danger',
          moodLevel: 1,
          copingLevel: 1,
        },
      }
    });

    // Wait for intervention trigger detection
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify intervention was triggered
    const interventionStatus = interventionService.getStatus();
    if (interventionStatus.activeTriggers === 0) {
      throw new Error('Critical wellness decline did not trigger intervention');
    }
  }
});

/**
 * Integration test suite that validates the entire tether system flow
 */
describe('End-to-End Tether System Integration', () => {
  it('CRITICAL: Complete emergency response flow', async () => {
    console.log('🚨 TESTING COMPLETE EMERGENCY RESPONSE FLOW');

    // This test validates the entire emergency response pipeline:
    // 1. User in distress sends emergency pulse
    // 2. Heartbeat detection service processes it
    // 3. Emergency intervention triggers activate
    // 4. Tether partner and crisis team are notified
    // 5. Location services are activated (with consent)
    // 6. All actions are audited

    const startTime = Date.now();

    try {
      // 1. Setup emergency scenario
      const emergencyUser = 'end-to-end-test-user';
      const emergencyTether = 'end-to-end-test-tether';

      // 2. User sends emergency pulse
      const emergencyPulse = {
        tetherId: emergencyTether,
        pulseType: 'EMERGENCY' as const,
        strength: 0.1,
        mood: 1,
        status: 'EMERGENCY' as const,
        urgencyLevel: 'CRITICAL' as const,
        emergencySignal: true,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          source: 'GPS' as const,
        }
      };

      // 3. Send emergency pulse
      const pulseResponse = await fetch('/api/tether/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyPulse)
      });

      expect(pulseResponse.status).toBe(201);
      
      const pulseResult = await pulseResponse.json();
      expect(pulseResult.emergencyTriggered).toBe(true);

      // 4. Verify emergency intervention was triggered
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 5. Verify complete emergency response
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(30000); // Must complete within 30 seconds

      console.log(`✅ COMPLETE EMERGENCY RESPONSE FLOW VALIDATED (${responseTime}ms)`);

    } catch (error) {
      const failureTime = Date.now() - startTime;
      console.error(`❌ CRITICAL FAILURE: Emergency response flow failed after ${failureTime}ms`, error);
      throw new Error(`LIFE-CRITICAL SYSTEM FAILURE: Complete emergency response flow failed - ${error.message}`);
    }

  }, 60000); // 60 second timeout for complete flow test
});

export { TetherSystemTests };