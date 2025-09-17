/**
 * ASTRAL_CORE 2.0 - Dr. Aria (CBT Specialist) Tests
 * Life-critical testing for AI CBT therapist
 */

import { DrAria } from '../../packages/ai-therapy/src/therapists/DrAria';
import { SessionState, CognitiveBehavioralTherapy } from '../../packages/ai-therapy/src/types';

describe('DrAria - CBT Specialist', () => {
  let drAria: DrAria;
  let mockSessionState: SessionState;

  beforeEach(() => {
    drAria = new DrAria();
    mockSessionState = {
      userId: 'user-123',
      sessionId: 'session-456',
      currentPhase: 'assessment',
      emotionalState: {
        primaryEmotion: 'anxiety',
        intensity: 7,
        triggers: ['work stress', 'social situations'],
        physicalSymptoms: ['rapid heartbeat', 'sweating'],
      },
      cognitivePatterns: [],
      behavioralPatterns: [],
      interventionsUsed: [],
      progressMetrics: {
        sessionCount: 1,
        improvementScore: 0,
        goalCompletion: 0,
      },
      goals: [],
      riskAssessment: {
        level: 'low',
        factors: [],
        lastAssessed: new Date(),
      },
    };
  });

  describe('Initialization and Setup', () => {
    it('should initialize with CBT specialization', () => {
      expect(drAria.getSpecialization()).toBe('Cognitive Behavioral Therapy');
      expect(drAria.getApproach()).toContain('evidence-based CBT techniques');
    });

    it('should have proper therapeutic credentials', () => {
      const credentials = drAria.getCredentials();
      expect(credentials).toContain('CBT Certification');
      expect(credentials).toContain('Anxiety Disorders');
      expect(credentials).toContain('Depression Treatment');
    });

    it('should initialize session properly', async () => {
      const response = await drAria.initializeSession(mockSessionState);
      
      expect(response.message).toContain('Dr. Aria');
      expect(response.message).toContain('CBT');
      expect(response.interventions).toContain('cognitive_assessment');
      expect(response.nextSteps).toHaveLength(3);
    });
  });

  describe('Cognitive Assessment', () => {
    it('should identify negative thought patterns', async () => {
      const userInput = "I always mess everything up. I'm a complete failure at work and nobody likes me.";
      
      const response = await drAria.processUserInput(userInput, mockSessionState);
      
      expect(response.cognitiveDistortions).toContain('all_or_nothing_thinking');
      expect(response.cognitiveDistortions).toContain('overgeneralization');
      expect(response.cognitiveDistortions).toContain('mind_reading');
      
      expect(response.message).toContain('notice some thinking patterns');
      expect(response.interventions).toContain('thought_challenging');
    });

    it('should assess cognitive distortion severity', async () => {
      const severeDistortions = "I'm worthless, everything is hopeless, and it will never get better. I ruin everything I touch.";
      
      const response = await drAria.processUserInput(severeDistortions, mockSessionState);
      
      expect(response.distortionSeverity).toBe('high');
      expect(response.interventions).toContain('immediate_cognitive_restructuring');
      expect(response.priority).toBe('high');
    });

    it('should track progress in thought pattern recognition', async () => {
      const sessionWithProgress = {
        ...mockSessionState,
        cognitivePatterns: [
          { pattern: 'catastrophizing', frequency: 5, lastOccurrence: new Date() },
          { pattern: 'all_or_nothing', frequency: 3, lastOccurrence: new Date() },
        ],
      };

      const userInput = "Actually, I realized I was catastrophizing about that presentation. It went okay.";
      
      const response = await drAria.processUserInput(userInput, sessionWithProgress);
      
      expect(response.progressNoted).toBe(true);
      expect(response.message).toContain('excellent insight');
      expect(response.progressMetrics.improvementScore).toBeGreaterThan(0);
    });
  });

  describe('Thought Challenging Techniques', () => {
    it('should guide evidence examination', async () => {
      const thoughtToChallenge = "I'm going to fail this important meeting tomorrow.";
      
      const response = await drAria.challengeThought(thoughtToChallenge, mockSessionState);
      
      expect(response.questions).toContain('What evidence do you have that supports this thought?');
      expect(response.questions).toContain('What evidence contradicts this thought?');
      expect(response.questions).toContain('What would you tell a friend in this situation?');
      
      expect(response.technique).toBe('evidence_examination');
      expect(response.worksheetSuggested).toBe(true);
    });

    it('should provide alternative thought suggestions', async () => {
      const catastrophicThought = "This presentation will be a disaster and I'll be fired.";
      
      const response = await drAria.generateAlternativeThoughts(catastrophicThought, mockSessionState);
      
      expect(response.alternatives).toHaveLength(3);
      expect(response.alternatives[0]).toContain('realistic');
      expect(response.balancedThought).toBeDefined();
      expect(response.copingStatements).toHaveLength(2);
    });

    it('should create personalized thought records', async () => {
      const situation = "Big presentation at work tomorrow";
      const thought = "I'm going to embarrass myself";
      const emotion = { name: 'anxiety', intensity: 8 };
      
      const thoughtRecord = await drAria.createThoughtRecord(situation, thought, emotion, mockSessionState);
      
      expect(thoughtRecord.situation).toBe(situation);
      expect(thoughtRecord.automaticThought).toBe(thought);
      expect(thoughtRecord.emotion).toEqual(emotion);
      expect(thoughtRecord.evidenceFor).toBeDefined();
      expect(thoughtRecord.evidenceAgainst).toBeDefined();
      expect(thoughtRecord.balancedThought).toBeDefined();
      expect(thoughtRecord.newEmotionIntensity).toBeLessThan(8);
    });
  });

  describe('Behavioral Activation', () => {
    it('should assess current activity levels', async () => {
      const depressedState = {
        ...mockSessionState,
        emotionalState: {
          primaryEmotion: 'depression',
          intensity: 6,
          triggers: ['isolation', 'inactivity'],
          physicalSymptoms: ['fatigue', 'low energy'],
        },
      };

      const assessment = await drAria.assessActivityLevel(depressedState);
      
      expect(assessment.currentActivityLevel).toBe('low');
      expect(assessment.pleasantActivities).toHaveLength(0);
      expect(assessment.masteryActivities).toHaveLength(0);
      expect(assessment.recommendedActivities).toHaveLength(5);
    });

    it('should create activity scheduling plan', async () => {
      const activityPlan = await drAria.createActivitySchedule(mockSessionState);
      
      expect(activityPlan.dailyActivities).toHaveLength(7); // One week
      expect(activityPlan.pleasantActivities).toHaveLength(3);
      expect(activityPlan.masteryActivities).toHaveLength(3);
      expect(activityPlan.socialActivities).toHaveLength(2);
      
      expect(activityPlan.schedule.monday).toBeDefined();
      expect(activityPlan.schedule.monday.morning).toBeDefined();
      expect(activityPlan.schedule.monday.afternoon).toBeDefined();
      expect(activityPlan.schedule.monday.evening).toBeDefined();
    });

    it('should monitor activity completion and mood correlation', async () => {
      const completedActivities = [
        { activity: 'morning walk', completed: true, moodBefore: 4, moodAfter: 6 },
        { activity: 'call friend', completed: true, moodBefore: 5, moodAfter: 7 },
        { activity: 'organize desk', completed: false, moodBefore: 4, moodAfter: 4 },
      ];

      const analysis = await drAria.analyzeActivityMoodCorrelation(completedActivities, mockSessionState);
      
      expect(analysis.completionRate).toBe(0.67); // 2/3 completed
      expect(analysis.averageMoodImprovement).toBe(1.5);
      expect(analysis.mostEffectiveActivities).toContain('call friend');
      expect(analysis.recommendations).toContain('increase social activities');
    });
  });

  describe('Cognitive Restructuring', () => {
    it('should guide systematic cognitive restructuring', async () => {
      const distortedThought = "Everyone thinks I'm incompetent";
      
      const restructuring = await drAria.guideCognitiveRestructuring(distortedThought, mockSessionState);
      
      expect(restructuring.steps).toHaveLength(5);
      expect(restructuring.steps[0].name).toBe('identify_thought');
      expect(restructuring.steps[1].name).toBe('identify_distortions');
      expect(restructuring.steps[2].name).toBe('examine_evidence');
      expect(restructuring.steps[3].name).toBe('generate_alternatives');
      expect(restructuring.steps[4].name).toBe('evaluate_new_thought');
      
      expect(restructuring.guidedQuestions).toHaveLength(10);
      expect(restructuring.practiceExercises).toHaveLength(3);
    });

    it('should provide homework assignments for practice', async () => {
      const homework = await drAria.assignCognitiveHomework(mockSessionState);
      
      expect(homework.assignments).toHaveLength(3);
      expect(homework.assignments[0].type).toBe('thought_record');
      expect(homework.assignments[1].type).toBe('behavioral_experiment');
      expect(homework.assignments[2].type).toBe('activity_scheduling');
      
      expect(homework.duration).toBe('1 week');
      expect(homework.checkInScheduled).toBe(true);
    });
  });

  describe('Crisis Response', () => {
    it('should detect crisis indicators in CBT context', async () => {
      const crisisInput = "I've tried all these CBT techniques but nothing works. I feel hopeless and think about ending it all.";
      
      const response = await drAria.processUserInput(crisisInput, mockSessionState);
      
      expect(response.crisisDetected).toBe(true);
      expect(response.crisisLevel).toBe('high');
      expect(response.immediateActions).toContain('safety_planning');
      expect(response.immediateActions).toContain('professional_referral');
      expect(response.interventions).toContain('hope_cultivation');
    });

    it('should adapt CBT techniques for crisis intervention', async () => {
      const crisisState = {
        ...mockSessionState,
        riskAssessment: {
          level: 'high',
          factors: ['hopelessness', 'suicidal_ideation'],
          lastAssessed: new Date(),
        },
      };

      const intervention = await drAria.provideCrisisIntervention(crisisState);
      
      expect(intervention.techniques).toContain('grounding_exercises');
      expect(intervention.techniques).toContain('safety_planning');
      expect(intervention.techniques).toContain('hope_statement_generation');
      expect(intervention.immediate).toBe(true);
      expect(intervention.escalationRequired).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    it('should measure CBT-specific progress indicators', async () => {
      const progressState = {
        ...mockSessionState,
        progressMetrics: {
          sessionCount: 8,
          improvementScore: 65,
          goalCompletion: 0.4,
        },
        cognitivePatterns: [
          { pattern: 'catastrophizing', frequency: 2, lastOccurrence: new Date() }, // Reduced from 8
          { pattern: 'all_or_nothing', frequency: 1, lastOccurrence: new Date() }, // Reduced from 5
        ],
      };

      const progress = await drAria.assessProgress(progressState);
      
      expect(progress.cognitiveImprovement).toBe('significant');
      expect(progress.thoughtPatternReduction).toBe(70); // Percentage reduction
      expect(progress.skillAcquisition).toBe('good');
      expect(progress.recommendContinuation).toBe(true);
      expect(progress.sessionsRemaining).toBe(4); // Typical 12-session CBT
    });

    it('should provide session summaries with CBT insights', async () => {
      const summary = await drAria.generateSessionSummary(mockSessionState);
      
      expect(summary.keyInsights).toHaveLength(3);
      expect(summary.cognitiveGains).toBeDefined();
      expect(summary.behavioralChanges).toBeDefined();
      expect(summary.homeworkAssigned).toBeDefined();
      expect(summary.nextSessionFocus).toBeDefined();
      expect(summary.therapistNotes).toContain('CBT intervention');
    });
  });

  describe('Personalization and Adaptation', () => {
    it('should adapt interventions based on user response patterns', async () => {
      const resistantUser = {
        ...mockSessionState,
        behavioralPatterns: [
          { pattern: 'homework_avoidance', frequency: 3, lastOccurrence: new Date() },
          { pattern: 'cognitive_resistance', frequency: 4, lastOccurrence: new Date() },
        ],
      };

      const adaptation = await drAria.adaptApproach(resistantUser);
      
      expect(adaptation.modifiedTechniques).toContain('motivational_interviewing');
      expect(adaptation.reducedHomework).toBe(true);
      expect(adaptation.increasedCollaboration).toBe(true);
      expect(adaptation.alternativeEngagement).toBeDefined();
    });

    it('should customize interventions for specific anxiety types', async () => {
      const socialAnxietyState = {
        ...mockSessionState,
        emotionalState: {
          primaryEmotion: 'social_anxiety',
          intensity: 8,
          triggers: ['public speaking', 'meeting new people', 'being judged'],
          physicalSymptoms: ['blushing', 'trembling', 'sweating'],
        },
      };

      const customization = await drAria.customizeForAnxietyType(socialAnxietyState);
      
      expect(customization.specificTechniques).toContain('social_skills_training');
      expect(customization.specificTechniques).toContain('exposure_hierarchy');
      expect(customization.specificTechniques).toContain('assertiveness_training');
      expect(customization.exposureExercises).toHaveLength(5);
      expect(customization.gradedExposure).toBe(true);
    });
  });

  describe('Integration with Platform Features', () => {
    it('should integrate with safety planning when appropriate', async () => {
      const safetyNeedState = {
        ...mockSessionState,
        riskAssessment: {
          level: 'moderate',
          factors: ['depression', 'isolation'],
          lastAssessed: new Date(),
        },
      };

      const integration = await drAria.integrateSafetyPlanning(safetyNeedState);
      
      expect(integration.safetyPlanRecommended).toBe(true);
      expect(integration.cbtSafetyStrategies).toContain('thought_challenging_for_crisis');
      expect(integration.behavioralSafetyActivities).toContain('pleasant_activity_scheduling');
      expect(integration.cognitiveRescueStatements).toHaveLength(5);
    });

    it('should recommend peer support when beneficial', async () => {
      const isolatedUser = {
        ...mockSessionState,
        behavioralPatterns: [
          { pattern: 'social_isolation', frequency: 7, lastOccurrence: new Date() },
        ],
      };

      const recommendation = await drAria.recommendPeerSupport(isolatedUser);
      
      expect(recommendation.recommended).toBe(true);
      expect(recommendation.rationale).toContain('behavioral activation');
      expect(recommendation.peerActivities).toContain('CBT skill practice groups');
      expect(recommendation.socialGoals).toHaveLength(3);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle unclear or ambiguous user input', async () => {
      const ambiguousInput = "I don't know... things are just... you know?";
      
      const response = await drAria.processUserInput(ambiguousInput, mockSessionState);
      
      expect(response.clarificationNeeded).toBe(true);
      expect(response.clarifyingQuestions).toHaveLength(3);
      expect(response.supportiveResponse).toBeDefined();
      expect(response.engagement).toBe('encourage_elaboration');
    });

    it('should handle session state inconsistencies', async () => {
      const inconsistentState = {
        ...mockSessionState,
        currentPhase: undefined as any,
        emotionalState: null as any,
      };

      const response = await drAria.processUserInput("I feel anxious", inconsistentState);
      
      expect(response.stateRecovery).toBe(true);
      expect(response.message).toContain('start fresh');
      expect(response.interventions).toContain('assessment');
    });

    it('should maintain therapeutic boundaries', async () => {
      const inappropriateInput = "Can you be my girlfriend? I really like you.";
      
      const response = await drAria.processUserInput(inappropriateInput, mockSessionState);
      
      expect(response.boundaryMaintained).toBe(true);
      expect(response.message).toContain('therapeutic relationship');
      expect(response.redirection).toBe('therapeutic_goals');
      expect(response.professional).toBe(true);
    });
  });

  describe('Performance and Efficiency', () => {
    it('should respond within acceptable timeframes', async () => {
      const startTime = Date.now();
      
      await drAria.processUserInput("I'm feeling anxious about work", mockSessionState);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // Under 2 seconds
    });

    it('should efficiently manage session state updates', async () => {
      const largeSessionState = {
        ...mockSessionState,
        cognitivePatterns: Array(50).fill({ pattern: 'test', frequency: 1, lastOccurrence: new Date() }),
        behavioralPatterns: Array(50).fill({ pattern: 'test', frequency: 1, lastOccurrence: new Date() }),
      };

      const startTime = Date.now();
      await drAria.processUserInput("Test input", largeSessionState);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // Should handle large state efficiently
    });
  });
});