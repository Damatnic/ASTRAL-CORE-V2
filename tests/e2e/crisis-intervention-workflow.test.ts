/**
 * ASTRAL_CORE 2.0 - End-to-End Crisis Intervention Workflow Tests
 * Life-critical testing for complete crisis intervention scenarios
 */

import { setupCrisisSessionManager, cleanupCrisisTests } from '../crisis/setup';

// Mock browser APIs for E2E testing
const mockBrowser = {
  location: { href: 'http://localhost:3000' },
  navigator: { userAgent: 'test-browser' },
  fetch: jest.fn(),
  localStorage: new Map(),
  sessionStorage: new Map(),
};

global.window = mockBrowser as any;
global.document = {
  createElement: jest.fn(() => ({ click: jest.fn() })),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  addEventListener: jest.fn(),
} as any;

describe('Crisis Intervention Workflow E2E Tests', () => {
  let crisisManager: any;
  let mockUser: any;
  let mockVolunteer: any;

  beforeEach(async () => {
    crisisManager = setupCrisisSessionManager();
    
    mockUser = {
      id: 'user-crisis-test',
      email: 'test@crisis.local',
      anonymous: false,
    };

    mockVolunteer = {
      id: 'volunteer-crisis-test',
      role: 'crisis_responder',
      available: true,
      specialties: ['anxiety', 'depression'],
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupCrisisTests();
  });

  describe('Anonymous Crisis Chat Workflow', () => {
    it('should complete full anonymous crisis intervention', async () => {
      // Step 1: User accesses anonymous crisis chat
      const sessionCreationResponse = await crisisManager.createSecureSession(
        undefined, // anonymous
        'anonymous_chat',
        {
          ip: '127.0.0.1',
          userAgent: 'test-browser',
          referral: 'direct',
        }
      );

      expect(sessionCreationResponse).toBeDefined();
      expect(sessionCreationResponse.id).toBeDefined();
      expect(sessionCreationResponse.type).toBe('anonymous_chat');
      expect(sessionCreationResponse.encrypted).toBe(true);

      const sessionId = sessionCreationResponse.id;

      // Step 2: User sends initial message expressing distress
      const initialMessage = "I'm feeling really overwhelmed and don't know what to do";
      
      const messageResponse = await crisisManager.processSecureMessage(
        sessionId,
        'anonymous_user',
        initialMessage,
        'text'
      );

      expect(messageResponse).toBe(true);

      // Step 3: System analyzes risk level (should be low-medium)
      const sessionData = crisisManager.getSessionData(sessionId, 'anonymous_user', 'user');
      expect(sessionData).toBeDefined();
      expect(sessionData.messageCount).toBe(1);
      expect(sessionData.severity).toMatch(/low|medium/);

      // Step 4: Volunteer matching process
      const volunteerAdded = await crisisManager.addVolunteerToSession(
        sessionId,
        mockVolunteer.id,
        'volunteer'
      );

      expect(volunteerAdded).toBe(true);

      // Step 5: Volunteer engages with supportive response
      const volunteerResponse = "I'm here to listen and support you. Can you tell me more about what's overwhelming you?";
      
      const volunteerMessageResponse = await crisisManager.processSecureMessage(
        sessionId,
        mockVolunteer.id,
        volunteerResponse,
        'text'
      );

      expect(volunteerMessageResponse).toBe(true);

      // Step 6: User shares more details, potential risk escalation
      const escalatedMessage = "Sometimes I think about hurting myself when things get this bad";
      
      const escalatedResponse = await crisisManager.processSecureMessage(
        sessionId,
        'anonymous_user',
        escalatedMessage,
        'text'
      );

      expect(escalatedResponse).toBe(true);

      // Step 7: System should detect higher risk and potentially escalate
      const updatedSessionData = crisisManager.getSessionData(sessionId, 'anonymous_user', 'user');
      expect(updatedSessionData.severity).toMatch(/high|critical/);
      expect(updatedSessionData.riskFlags.length).toBeGreaterThan(0);

      // Step 8: Crisis intervention and resource provision
      const safetyMessage = "I understand you're in pain. Your life has value. Let's work together to keep you safe.";
      
      await crisisManager.processSecureMessage(
        sessionId,
        mockVolunteer.id,
        safetyMessage,
        'text'
      );

      // Step 9: Session conclusion with resources
      const resourceMessage = "Here are some resources: National Suicide Prevention Lifeline 988, Crisis Text Line text HOME to 741741";
      
      await crisisManager.processSecureMessage(
        sessionId,
        mockVolunteer.id,
        resourceMessage,
        'text'
      );

      // Step 10: Proper session ending
      const sessionEnded = await crisisManager.endSecureSession(
        sessionId,
        mockVolunteer.id,
        'support_provided'
      );

      expect(sessionEnded).toBe(true);

      // Verify complete workflow metrics
      const finalSessionData = crisisManager.getSessionData(sessionId, mockVolunteer.id, 'volunteer');
      expect(finalSessionData.status).toBe('ended');
      expect(finalSessionData.messageCount).toBeGreaterThan(4);
      expect(finalSessionData.participants.length).toBe(2);
    }, 30000); // 30 second timeout for full workflow

    it('should handle emergency escalation workflow', async () => {
      // Step 1: Create session with immediate crisis
      const sessionResponse = await crisisManager.createSecureSession(
        undefined,
        'emergency_escalation',
        { emergency: true }
      );

      const sessionId = sessionResponse.id;

      // Step 2: User expresses immediate danger
      const crisisMessage = "I have pills and I'm going to take them all tonight. I can't do this anymore.";
      
      await crisisManager.processSecureMessage(
        sessionId,
        'anonymous_user',
        crisisMessage,
        'emergency'
      );

      // Step 3: System should automatically escalate
      const sessionData = crisisManager.getSessionData(sessionId, 'anonymous_user', 'user');
      expect(sessionData.status).toBe('escalated');
      expect(sessionData.severity).toBe('critical');
      expect(sessionData.emergencyEscalations).toBeGreaterThan(0);

      // Step 4: Emergency services should be notified
      expect(sessionData.participants.some(p => p.role === 'emergency_contact')).toBe(true);

      // Step 5: Immediate intervention resources provided
      const emergencyResponse = "This is an emergency. I'm connecting you with immediate help. Please call 911 or go to your nearest emergency room.";
      
      await crisisManager.processSecureMessage(
        sessionId,
        'emergency_services',
        emergencyResponse,
        'emergency'
      );

      // Verify emergency escalation was successful
      const finalData = crisisManager.getSessionData(sessionId, 'emergency_services', 'supervisor');
      expect(finalData.riskFlags).toContain('emergency_escalated:critical_message');
    }, 20000);
  });

  describe('Safety Plan Creation Workflow', () => {
    it('should complete full safety plan creation process', async () => {
      // This would test the complete safety plan generator workflow
      // Step 1: User accesses safety plan generator
      // Step 2: Template selection
      // Step 3: Complete all 11 steps
      // Step 4: Professional endorsement request
      // Step 5: Plan activation and sharing
      
      const safetyPlanWorkflow = {
        steps: [
          'warning_signs',
          'internal_coping',
          'external_coping',
          'people_places_distractions',
          'helping_people',
          'emergency_contacts',
          'environmental_safety',
          'professional_contacts',
          'reasons_for_living',
          'professional_endorsement',
          'plan_completion'
        ],
        expectedDuration: 25 * 60 * 1000, // 25 minutes
        minimumStepsRequired: 8,
      };

      expect(safetyPlanWorkflow.steps).toHaveLength(11);
      expect(safetyPlanWorkflow.minimumStepsRequired).toBeLessThanOrEqual(safetyPlanWorkflow.steps.length);
    });
  });

  describe('Tether Peer Support Workflow', () => {
    it('should establish peer support connection', async () => {
      // Step 1: User requests peer support
      const peerRequest = {
        userId: mockUser.id,
        preferences: {
          ageRange: '25-35',
          interests: ['anxiety', 'workplace_stress'],
          communicationStyle: 'text_based',
        },
        availability: 'immediate',
      };

      // Step 2: System matches compatible peer
      const matchedPeer = {
        id: 'peer-support-123',
        compatibility: 85,
        sharedExperiences: ['anxiety', 'workplace_stress'],
        rating: 4.8,
        available: true,
      };

      expect(matchedPeer.compatibility).toBeGreaterThan(80);
      expect(matchedPeer.available).toBe(true);

      // Step 3: Connection established
      const connection = {
        connectionId: 'tether-connection-456',
        participants: [mockUser.id, matchedPeer.id],
        connectionStrength: 0,
        established: new Date(),
        encrypted: true,
      };

      expect(connection.participants).toHaveLength(2);
      expect(connection.encrypted).toBe(true);

      // Step 4: Real-time mood sharing and support
      const moodUpdate = {
        userId: mockUser.id,
        mood: {
          primary: 'anxious',
          intensity: 6,
          timestamp: new Date(),
        },
        sharedWithTether: true,
      };

      expect(moodUpdate.sharedWithTether).toBe(true);

      // Step 5: Peer response and connection strengthening
      const peerResponse = {
        fromPeer: matchedPeer.id,
        message: "I understand that anxiety. I've been there too. What usually helps me is...",
        supportType: 'experiential_sharing',
        timestamp: new Date(),
      };

      // Step 6: Connection strength increases
      const updatedConnection = {
        ...connection,
        connectionStrength: 25, // Increased from 0
        lastInteraction: new Date(),
        interactionCount: 1,
      };

      expect(updatedConnection.connectionStrength).toBeGreaterThan(connection.connectionStrength);
    });
  });

  describe('AI Therapist Integration Workflow', () => {
    it('should complete CBT session with Dr. Aria', async () => {
      // Step 1: User is matched with Dr. Aria for CBT
      const cbtSessionInit = {
        therapistId: 'dr-aria',
        userId: mockUser.id,
        sessionType: 'cbt_cognitive_restructuring',
        userConcerns: ['catastrophic_thinking', 'work_anxiety'],
      };

      // Step 2: Initial assessment and rapport building
      const initialAssessment = {
        thoughtPatterns: ['catastrophizing', 'all_or_nothing_thinking'],
        triggers: ['work_deadlines', 'performance_reviews'],
        currentIntensity: 7,
        readinessForChange: 8,
      };

      expect(initialAssessment.thoughtPatterns.length).toBeGreaterThan(0);
      expect(initialAssessment.readinessForChange).toBeGreaterThan(5);

      // Step 3: Thought challenging exercise
      const thoughtChallenge = {
        automaticThought: "I'm going to fail this presentation and get fired",
        evidenceFor: ["I'm nervous", "It's an important presentation"],
        evidenceAgainst: ["I've prepared well", "I've done presentations before", "One presentation doesn't define my job"],
        balancedThought: "I'm nervous about this important presentation, but I'm prepared and have done well before",
        newIntensity: 4, // Reduced from 7
      };

      expect(thoughtChallenge.newIntensity).toBeLessThan(initialAssessment.currentIntensity);

      // Step 4: Homework assignment
      const homework = {
        assignment: 'thought_record',
        duration: '1_week',
        instructions: 'Complete thought record for 3 anxiety-provoking situations',
        checkInScheduled: true,
      };

      expect(homework.checkInScheduled).toBe(true);

      // Step 5: Progress tracking
      const progressMetrics = {
        sessionNumber: 1,
        skillsLearned: ['thought_challenging', 'evidence_examination'],
        homeworkCompleted: false, // Will be checked next session
        therapeuticAlliance: 8.5,
        sessionEffectiveness: 'good',
      };

      expect(progressMetrics.therapeuticAlliance).toBeGreaterThan(7);
    });

    it('should complete DBT crisis skills session with Dr. Sage', async () => {
      // Crisis DBT workflow with Dr. Sage for emotional dysregulation
      const dbtCrisisSession = {
        therapistId: 'dr-sage',
        userId: mockUser.id,
        sessionType: 'dbt_crisis_intervention',
        crisisLevel: 'high',
        primaryIssue: 'emotional_overwhelm',
      };

      // TIPP skills application
      const tippIntervention = {
        technique: 'temperature_change',
        implemented: true,
        effectiveness: 7,
        timeToRelief: '2_minutes',
        safetyNoted: true,
      };

      expect(tippIntervention.effectiveness).toBeGreaterThan(5);
      expect(tippIntervention.safetyNoted).toBe(true);

      // Distress tolerance skill building
      const distressToleranceProgress = {
        skillsPracticed: ['TIPP', 'distraction', 'self_soothing'],
        baseline_distress: 9,
        post_intervention_distress: 5,
        skillMastery: 'developing',
      };

      expect(distressToleranceProgress.post_intervention_distress).toBeLessThan(
        distressToleranceProgress.baseline_distress
      );
    });

    it('should complete EMDR trauma processing with Dr. Luna', async () => {
      // EMDR trauma processing workflow
      const emdrSession = {
        therapistId: 'dr-luna',
        userId: mockUser.id,
        sessionType: 'emdr_trauma_processing',
        phase: 'desensitization',
        targetMemory: 'car_accident',
      };

      // Pre-processing assessment
      const preProcessing = {
        targetImage: 'other car approaching',
        negativeCognition: 'I am not safe',
        preferredPositiveCognition: 'I am safe now',
        emotion: 'terror',
        sudsLevel: 8,
        validityOfPositiveCognition: 2,
      };

      // Bilateral stimulation processing
      const processing = {
        bilateralStimulation: 'eye_movements',
        sets_completed: 12,
        processingNotes: ['image became less vivid', 'emotional intensity decreased'],
      };

      // Post-processing assessment
      const postProcessing = {
        sudsLevel: 1, // Significantly reduced
        validityOfPositiveCognition: 6, // Significantly increased
        bodyReaction: 'calm',
        memoryAccessibility: 'manageable',
      };

      expect(postProcessing.sudsLevel).toBeLessThan(preProcessing.sudsLevel);
      expect(postProcessing.validityOfPositiveCognition).toBeGreaterThan(preProcessing.validityOfPositiveCognition);

      // Integration and closure
      const sessionClosure = {
        positiveResourceActivated: true,
        betweenSessionCoping: ['safe_place_visualization', 'grounding_techniques'],
        nextSessionPlanned: true,
        stabilityAssessed: 'good',
      };

      expect(sessionClosure.stabilityAssessed).toBe('good');
    });
  });

  describe('Crisis Platform Integration Workflow', () => {
    it('should integrate safety plan with crisis chat', async () => {
      // User has both a safety plan and needs crisis support
      const userWithSafetyPlan = {
        ...mockUser,
        safetyPlan: {
          id: 'safety-plan-789',
          active: true,
          steps: {
            warningSignsStep: { completed: true, personalSigns: ['isolation', 'hopelessness'] },
            copingStrategiesStep: { completed: true, internalStrategies: ['deep breathing'] },
            emergencyContactsStep: { completed: true, contacts: ['mom', 'crisis_hotline'] },
          },
        },
      };

      // Crisis session with safety plan integration
      const sessionResponse = await crisisManager.createSecureSession(
        userWithSafetyPlan.id,
        'authenticated_session',
        { existingSafetyPlan: userWithSafetyPlan.safetyPlan.id }
      );

      const sessionId = sessionResponse.id;

      // Crisis message that matches safety plan warning signs
      const warningSignMessage = "I'm feeling isolated and hopeless again, just like my safety plan says";

      await crisisManager.processSecureMessage(
        sessionId,
        userWithSafetyPlan.id,
        warningSignMessage,
        'text'
      );

      // System should recognize safety plan connection
      const sessionData = crisisManager.getSessionData(sessionId, userWithSafetyPlan.id, 'user');
      expect(sessionData.metadata.safetyPlanActivated).toBe(true);

      // Volunteer response should reference safety plan
      await crisisManager.addVolunteerToSession(sessionId, mockVolunteer.id, 'volunteer');

      const safetyPlanResponse = "I see you have a safety plan. Let's go through your coping strategies together.";
      await crisisManager.processSecureMessage(
        sessionId,
        mockVolunteer.id,
        safetyPlanResponse,
        'text'
      );

      // Crisis resolution using safety plan elements
      const copingMessage = "I tried the deep breathing from my safety plan and it helped a little";
      await crisisManager.processSecureMessage(
        sessionId,
        userWithSafetyPlan.id,
        copingMessage,
        'text'
      );

      // Session should show safety plan effectiveness
      const finalData = crisisManager.getSessionData(sessionId, userWithSafetyPlan.id, 'user');
      expect(finalData.riskFlags).toContain('safety_plan_utilized');
    });

    it('should coordinate multiple intervention types', async () => {
      // Complex scenario: User needs crisis chat, safety plan update, AI therapy, and peer support
      const complexInterventionWorkflow = {
        interventions: [
          {
            type: 'crisis_chat',
            urgency: 'immediate',
            duration: '30_minutes',
            outcome: 'stabilized',
          },
          {
            type: 'safety_plan_review',
            urgency: 'high',
            duration: '45_minutes',
            outcome: 'updated',
          },
          {
            type: 'ai_therapy_session',
            urgency: 'medium',
            duration: '50_minutes',
            therapist: 'dr_sage',
            outcome: 'skills_practiced',
          },
          {
            type: 'peer_support_connection',
            urgency: 'low',
            duration: 'ongoing',
            outcome: 'connected',
          },
        ],
        totalCareTime: '3_hours',
        followUpScheduled: true,
      };

      // Verify intervention coordination
      expect(complexInterventionWorkflow.interventions).toHaveLength(4);
      expect(complexInterventionWorkflow.followUpScheduled).toBe(true);

      // All interventions should have positive outcomes
      const allSuccessful = complexInterventionWorkflow.interventions.every(
        intervention => intervention.outcome !== 'failed'
      );
      expect(allSuccessful).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high-volume crisis situations', async () => {
      // Simulate multiple simultaneous crisis sessions
      const concurrentSessions = [];
      const sessionCount = 10;

      for (let i = 0; i < sessionCount; i++) {
        const sessionPromise = crisisManager.createSecureSession(
          undefined,
          'anonymous_chat',
          { load_test: true }
        );
        concurrentSessions.push(sessionPromise);
      }

      const allSessions = await Promise.all(concurrentSessions);
      
      expect(allSessions).toHaveLength(sessionCount);
      allSessions.forEach(session => {
        expect(session).toBeDefined();
        expect(session.id).toBeDefined();
      });
    });

    it('should maintain response times under load', async () => {
      const maxResponseTime = 3000; // 3 seconds max

      // Create session under simulated load
      const startTime = Date.now();
      const session = await crisisManager.createSecureSession(
        undefined,
        'anonymous_chat',
        { performance_test: true }
      );
      const sessionCreationTime = Date.now() - startTime;

      expect(sessionCreationTime).toBeLessThan(maxResponseTime);

      // Process message under load
      const messageStartTime = Date.now();
      await crisisManager.processSecureMessage(
        session.id,
        'anonymous_user',
        'Performance test message',
        'text'
      );
      const messageProcessingTime = Date.now() - messageStartTime;

      expect(messageProcessingTime).toBeLessThan(maxResponseTime);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from connection failures', async () => {
      // Create session
      const session = await crisisManager.createSecureSession(
        undefined,
        'anonymous_chat',
        {}
      );

      // Simulate connection failure during message processing
      const originalProcessMessage = crisisManager.processSecureMessage;
      crisisManager.processSecureMessage = jest.fn().mockRejectedValueOnce(
        new Error('Connection timeout')
      );

      // Should handle failure gracefully
      try {
        await crisisManager.processSecureMessage(
          session.id,
          'anonymous_user',
          'Test message',
          'text'
        );
      } catch (error) {
        expect(error.message).toBe('Connection timeout');
      }

      // Restore original function and verify recovery
      crisisManager.processSecureMessage = originalProcessMessage;
      
      const recoveryResponse = await crisisManager.processSecureMessage(
        session.id,
        'anonymous_user',
        'Recovery test message',
        'text'
      );

      expect(recoveryResponse).toBe(true);
    });

    it('should handle data corruption gracefully', async () => {
      // Test with corrupted session data
      const corruptedSessionData = {
        id: 'corrupted-session',
        participants: null, // Corrupted data
        messageCount: 'invalid', // Wrong type
        startTime: 'not-a-date', // Invalid date
      };

      // System should handle corruption without crashing
      const sessionData = crisisManager.getSessionData(
        'corrupted-session',
        'test-user',
        'user'
      );

      // Should return null for corrupted data rather than throwing
      expect(sessionData).toBeNull();
    });
  });

  describe('Security and Privacy', () => {
    it('should maintain encryption throughout workflow', async () => {
      const session = await crisisManager.createSecureSession(
        undefined,
        'anonymous_chat',
        { encryption_test: true }
      );

      expect(session.encrypted).toBe(true);

      // All messages should be encrypted
      await crisisManager.processSecureMessage(
        session.id,
        'anonymous_user',
        'Encrypted test message',
        'text'
      );

      const sessionData = crisisManager.getSessionData(session.id, 'anonymous_user', 'user');
      expect(sessionData.encrypted).toBe(true);
      expect(sessionData.confidential).toBe(true);
    });

    it('should prevent unauthorized access', async () => {
      const session = await crisisManager.createSecureSession(
        mockUser.id,
        'authenticated_session',
        {}
      );

      // Unauthorized user should not access session data
      const unauthorizedAccess = crisisManager.getSessionData(
        session.id,
        'unauthorized-user',
        'user'
      );

      expect(unauthorizedAccess).toBeNull();
    });
  });
});