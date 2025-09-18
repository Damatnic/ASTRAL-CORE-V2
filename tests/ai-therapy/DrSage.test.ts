/**
 * ASTRAL_CORE 2.0 - Dr. Sage (DBT Specialist) Tests
 * Life-critical testing for AI DBT therapist
 */

import { DrSage } from '../../packages/ai-therapy/src/therapists/DrSage';
import { SessionState, DialecticalBehaviorTherapy } from '../../packages/ai-therapy/src/types';

describe('DrSage - DBT Specialist', () => {
  let drSage: DrSage;
  let mockSessionState: SessionState;

  beforeEach(() => {
    drSage = new DrSage();
    mockSessionState = {
      userId: 'user-123',
      sessionId: 'session-456',
      currentPhase: 'assessment',
      emotionalState: {
        primaryEmotion: 'anger',
        intensity: 8,
        triggers: ['interpersonal conflict', 'feeling invalidated'],
        physicalSymptoms: ['tension', 'rapid breathing'],
      },
      cognitivePatterns: [],
      behavioralPatterns: [
        { pattern: 'emotional_outbursts', frequency: 5, lastOccurrence: new Date() },
        { pattern: 'self_harm_urges', frequency: 2, lastOccurrence: new Date() },
      ],
      interventionsUsed: [],
      progressMetrics: {
        sessionCount: 1,
        improvementScore: 0,
        goalCompletion: 0,
      },
      goals: [],
      riskAssessment: {
        level: 'moderate',
        factors: ['emotional_dysregulation', 'interpersonal_difficulties'],
        lastAssessed: new Date(),
      },
    };
  });

  describe('DBT Core Modules', () => {
    describe('Mindfulness Skills', () => {
      it('should teach wise mind concept', async () => {
        const response = await drSage.teachWiseMind(mockSessionState);
        
        expect(response.concept).toBe('wise_mind');
        expect(response.explanation).toContain('balance between emotion mind and reasonable mind');
        expect(response.exercise).toBe('wise_mind_meditation');
        expect(response.guidedSteps).toHaveLength(5);
        expect(response.practiceTime).toBe('5-10 minutes');
      });

      it('should guide observe skill practice', async () => {
        const crisisInput = "I'm so overwhelmed, everything is chaos!";
        
        const response = await drSage.guideObserveSkill(crisisInput, mockSessionState);
        
        expect(response.skill).toBe('observe');
        expect(response.instructions).toContain('notice without judging');
        expect(response.observationTargets).toContain('thoughts');
        expect(response.observationTargets).toContain('emotions');
        expect(response.observationTargets).toContain('body_sensations');
        expect(response.guidedPrompts).toHaveLength(3);
      });

      it('should teach describe skill for emotional clarity', async () => {
        const emotionalState = "I feel this huge mess of emotions and I can't make sense of it";
        
        const response = await drSage.guideDescribeSkill(emotionalState, mockSessionState);
        
        expect(response.skill).toBe('describe');
        expect(response.emotionsIdentified).toHaveLength(3);
        expect(response.descriptionPrompts).toContain('just the facts');
        expect(response.avoidInterpretations).toBe(true);
        expect(response.clarifyingQuestions).toHaveLength(4);
      });

      it('should guide participate skill for present moment engagement', async () => {
        const dissociationInput = "I feel like I'm watching my life from outside, nothing feels real";
        
        const response = await drSage.guideParticipateSkill(dissociationInput, mockSessionState);
        
        expect(response.skill).toBe('participate');
        expect(response.groundingActivities).toHaveLength(5);
        expect(response.engagementStrategies).toContain('5-4-3-2-1_technique');
        expect(response.presentMomentAnchors).toHaveLength(3);
      });
    });

    describe('Distress Tolerance - TIPP Skills', () => {
      it('should guide temperature change for crisis', async () => {
        const crisisState = {
          ...mockSessionState,
          emotionalState: {
            ...mockSessionState.emotionalState,
            intensity: 9,
          },
          riskAssessment: {
            level: 'high',
            factors: ['acute_distress', 'self_harm_urges'],
            lastAssessed: new Date(),
          },
        };

        const response = await drSage.guideTIPPTemperature(crisisState);
        
        expect(response.technique).toBe('temperature_change');
        expect(response.instructions).toContain('cold water');
        expect(response.safetyNote).toContain('30 seconds maximum');
        expect(response.alternatives).toContain('ice_cubes');
        expect(response.effectDuration).toBe('immediate');
      });

      it('should guide intense exercise for distress tolerance', async () => {
        const highDistressInput = "I need to hurt myself, the pain is too much";
        
        const response = await drSage.guideIntenseExercise(highDistressInput, mockSessionState);
        
        expect(response.technique).toBe('intense_exercise');
        expect(response.exercises).toContain('jumping_jacks');
        expect(response.exercises).toContain('wall_push_ups');
        expect(response.duration).toBe('5-10 minutes');
        expect(response.safetyCheck).toBe(true);
        expect(response.alternatives).toContain('vigorous_cleaning');
      });

      it('should guide paced breathing technique', async () => {
        const panicInput = "I can't breathe, my heart is racing, I'm going to die";
        
        const response = await drSage.guidePacedBreathing(panicInput, mockSessionState);
        
        expect(response.technique).toBe('paced_breathing');
        expect(response.breathingPattern).toBe('exhale_longer_than_inhale');
        expect(response.guidedCounting).toBe('4_in_6_out');
        expect(response.duration).toBe('3-5 minutes');
        expect(response.positionGuidance).toBeDefined();
      });

      it('should guide paired muscle relaxation', async () => {
        const tensionInput = "My whole body is tense, I'm clenched up everywhere";
        
        const response = await drSage.guidePairedMuscleRelaxation(tensionInput, mockSessionState);
        
        expect(response.technique).toBe('paired_muscle_relaxation');
        expect(response.muscleGroups).toHaveLength(8);
        expect(response.breathingIntegration).toBe(true);
        expect(response.tensionDuration).toBe('5 seconds');
        expect(response.relaxationDuration).toBe('10-15 seconds');
      });
    });

    describe('Emotion Regulation Skills', () => {
      it('should guide emotion identification and labeling', async () => {
        const confusedEmotionalState = "I don't know what I'm feeling, it's all mixed up";
        
        const response = await drSage.guideEmotionIdentification(confusedEmotionalState, mockSessionState);
        
        expect(response.identifiedEmotions).toHaveLength(3);
        expect(response.primaryEmotion).toBeDefined();
        expect(response.secondaryEmotions).toHaveLength(2);
        expect(response.emotionWheel).toBe(true);
        expect(response.bodyScanning).toBe(true);
      });

      it('should check the facts technique for emotion validation', async () => {
        const invalidEmotionInput = "I'm furious at my friend for not texting me back immediately";
        
        const response = await drSage.guideCheckTheFacts(invalidEmotionInput, mockSessionState);
        
        expect(response.technique).toBe('check_the_facts');
        expect(response.factChecks).toContain('threat_assessment');
        expect(response.factChecks).toContain('loss_assessment');
        expect(response.factChecks).toContain('violation_assessment');
        expect(response.emotionJustified).toBe('partially');
        expect(response.intensityAdjustment).toBe('reduce');
      });

      it('should guide opposite action technique', async () => {
        const avoidanceInput = "I'm terrified of the job interview, I want to cancel";
        
        const response = await drSage.guideOppositeAction(avoidanceInput, mockSessionState);
        
        expect(response.technique).toBe('opposite_action');
        expect(response.primaryEmotion).toBe('fear');
        expect(response.oppositeAction).toBe('approach_with_confidence');
        expect(response.actionSteps).toHaveLength(4);
        expect(response.allTheWay).toBe(true);
        expect(response.supportNeeded).toBe(true);
      });

      it('should guide PLEASE skills for emotion vulnerability', async () => {
        const vulnerabilityState = {
          ...mockSessionState,
          behavioralPatterns: [
            { pattern: 'sleep_disruption', frequency: 6, lastOccurrence: new Date() },
            { pattern: 'poor_nutrition', frequency: 4, lastOccurrence: new Date() },
            { pattern: 'substance_use', frequency: 2, lastOccurrence: new Date() },
          ],
        };

        const response = await drSage.guidePLEASESkills(vulnerabilityState);
        
        expect(response.technique).toBe('PLEASE');
        expect(response.areas.physicalIllness).toBeDefined();
        expect(response.areas.eating).toBeDefined();
        expect(response.areas.altering_substances).toBeDefined();
        expect(response.areas.sleep).toBeDefined();
        expect(response.areas.exercise).toBeDefined();
        expect(response.priorityAreas).toHaveLength(2);
      });
    });

    describe('Interpersonal Effectiveness Skills', () => {
      it('should guide DEAR MAN for requests', async () => {
        const requestSituation = "I need to ask my boss for time off but I'm scared they'll be angry";
        
        const response = await drSage.guideDEARMAN(requestSituation, 'request', mockSessionState);
        
        expect(response.technique).toBe('DEAR_MAN');
        expect(response.describe).toContain('specific situation');
        expect(response.express).toContain('feelings');
        expect(response.assert).toContain('clear request');
        expect(response.reinforce).toContain('positive consequences');
        expect(response.mindful).toBe('stay_focused');
        expect(response.appear_confident).toBe(true);
        expect(response.negotiate).toBe('if_needed');
      });

      it('should guide GIVE for relationship maintenance', async () => {
        const relationshipInput = "My friend is upset with me and I want to fix things without making it worse";
        
        const response = await drSage.guideGIVE(relationshipInput, mockSessionState);
        
        expect(response.technique).toBe('GIVE');
        expect(response.gentle).toContain('kind_words');
        expect(response.interested).toContain('validate_feelings');
        expect(response.validate).toContain('acknowledge_perspective');
        expect(response.easy_manner).toContain('light_hearted');
        expect(response.relationshipPriority).toBe('high');
      });

      it('should guide FAST for self-respect', async () => {
        const selfRespectSituation = "People always ask me to do things and I can't say no, I feel like a doormat";
        
        const response = await drSage.guideFAST(selfRespectSituation, mockSessionState);
        
        expect(response.technique).toBe('FAST');
        expect(response.fair).toContain('balanced');
        expect(response.apologies).toBe('avoid_unnecessary');
        expect(response.stick_to_values).toBe(true);
        expect(response.truthful).toBe('honest_communication');
        expect(response.boundaryStrength).toBe('moderate');
      });
    });
  });

  describe('Crisis Intervention with DBT', () => {
    it('should provide immediate DBT crisis skills', async () => {
      const crisisInput = "I want to cut myself right now, I can't handle this pain";
      const crisisState = {
        ...mockSessionState,
        riskAssessment: {
          level: 'critical',
          factors: ['self_harm_urges', 'acute_distress'],
          lastAssessed: new Date(),
        },
      };

      const response = await drSage.provideCrisisDBTSkills(crisisInput, crisisState);
      
      expect(response.immediate).toBe(true);
      expect(response.skills).toContain('TIPP');
      expect(response.skills).toContain('distraction');
      expect(response.skills).toContain('self_soothing');
      expect(response.safetyPlan).toBe(true);
      expect(response.escalationRequired).toBe(true);
      expect(response.timeframe).toBe('immediate');
    });

    it('should guide distraction techniques for urges', async () => {
      const urgeInput = "I have the urge to drink/use drugs to numb this emotional pain";
      
      const response = await drSage.guideDistraction(urgeInput, mockSessionState);
      
      expect(response.technique).toBe('distraction');
      expect(response.activities).toContain('intense_sensation');
      expect(response.activities).toContain('mental_engagement');
      expect(response.activities).toContain('physical_activity');
      expect(response.timeFrame).toBe('until_urge_passes');
      expect(response.urgePassing).toBe('15-30 minutes');
    });

    it('should guide self-soothing for emotional pain', async () => {
      const emotionalPainInput = "The emotional pain is unbearable, I need relief";
      
      const response = await drSage.guideSelfSoothing(emotionalPainInput, mockSessionState);
      
      expect(response.technique).toBe('self_soothing');
      expect(response.fiveSenses).toHaveLength(5);
      expect(response.fiveSenses).toContain('vision');
      expect(response.fiveSenses).toContain('hearing');
      expect(response.fiveSenses).toContain('touch');
      expect(response.fiveSenses).toContain('taste');
      expect(response.fiveSenses).toContain('smell');
      expect(response.duration).toBe('20-30 minutes');
    });
  });

  describe('Interpersonal Effectiveness in Crisis', () => {
    it('should guide boundary setting in crisis situations', async () => {
      const boundaryInput = "My family is pressuring me and it's triggering my suicidal thoughts";
      
      const response = await drSage.guideCrisisBoundaries(boundaryInput, mockSessionState);
      
      expect(response.boundaryType).toBe('protective');
      expect(response.immediateActions).toContain('limit_contact');
      expect(response.communicationScript).toBeDefined();
      expect(response.supportSystem).toBe('activate');
      expect(response.selfCareActions).toHaveLength(3);
    });

    it('should guide asking for help effectively', async () => {
      const helpRequestInput = "I need help but I don't know how to ask without being a burden";
      
      const response = await drSage.guideAskingForHelp(helpRequestInput, mockSessionState);
      
      expect(response.technique).toBe('DEAR_MAN_modified');
      expect(response.helpRequestStructure).toBeDefined();
      expect(response.specificNeeds).toHaveLength(3);
      expect(response.timeFrame).toBe('immediate');
      expect(response.backupOptions).toHaveLength(2);
    });
  });

  describe('Validation and Therapeutic Relationship', () => {
    it('should provide accurate empathy and validation', async () => {
      const invalidatedInput = "Everyone says I'm overreacting, that my feelings don't matter";
      
      const response = await drSage.provideValidation(invalidatedInput, mockSessionState);
      
      expect(response.validationLevel).toBe(4); // Level 4: Understanding history
      expect(response.acknowledgment).toContain('makes complete sense');
      expect(response.normalizing).toBe(true);
      expect(response.strengths_highlighted).toHaveLength(2);
      expect(response.invalidation_addressed).toBe(true);
    });

    it('should balance validation with change strategies', async () => {
      const stuckInput = "I know I need to change but I'm scared and it feels impossible";
      
      const response = await drSage.balanceValidationAndChange(stuckInput, mockSessionState);
      
      expect(response.validation).toContain('understandable');
      expect(response.changeEncouragement).toContain('small steps');
      expect(response.dialectic).toBe('both_and');
      expect(response.fearValidation).toBe(true);
      expect(response.capabilityAffirmation).toBe(true);
    });
  });

  describe('Skills Training and Practice', () => {
    it('should create personalized DBT skills practice plan', async () => {
      const practicePlan = await drSage.createSkillsPracticePlan(mockSessionState);
      
      expect(practicePlan.dailySkills).toHaveLength(4); // One from each module
      expect(practicePlan.weeklyFocus).toBeDefined();
      expect(practicePlan.practiceSchedule).toBeDefined();
      expect(practicePlan.reminders).toBe(true);
      expect(practicePlan.progressTracking).toBe(true);
    });

    it('should track skills usage and effectiveness', async () => {
      const skillsUsage = [
        { skill: 'TIPP', used: true, effectiveness: 7, situation: 'work_stress' },
        { skill: 'wise_mind', used: true, effectiveness: 8, situation: 'relationship_conflict' },
        { skill: 'opposite_action', used: false, effectiveness: 0, situation: 'social_anxiety' },
      ];

      const analysis = await drSage.analyzeSkillsUsage(skillsUsage, mockSessionState);
      
      expect(analysis.usageRate).toBe(0.67);
      expect(analysis.averageEffectiveness).toBe(7.5);
      expect(analysis.mostEffective).toBe('wise_mind');
      expect(analysis.needsPractice).toContain('opposite_action');
      expect(analysis.recommendations).toHaveLength(3);
    });
  });

  describe('Progress Monitoring and Assessment', () => {
    it('should assess emotional regulation improvement', async () => {
      const improvedState = {
        ...mockSessionState,
        progressMetrics: {
          sessionCount: 12,
          improvementScore: 70,
          goalCompletion: 0.6,
        },
        behavioralPatterns: [
          { pattern: 'emotional_outbursts', frequency: 1, lastOccurrence: new Date() }, // Reduced from 5
          { pattern: 'effective_communication', frequency: 4, lastOccurrence: new Date() }, // New positive pattern
        ],
      };

      const assessment = await drSage.assessEmotionalRegulation(improvedState);
      
      expect(assessment.improvement).toBe('significant');
      expect(assessment.emotionalStability).toBe('improved');
      expect(assessment.relationshipFunctioning).toBe('better');
      expect(assessment.crisisReduction).toBe(80); // Percentage
      expect(assessment.skillsGeneralization).toBe('good');
    });

    it('should provide DBT-specific progress metrics', async () => {
      const metrics = await drSage.getDBTProgressMetrics(mockSessionState);
      
      expect(metrics.mindfulnessSkills).toBeDefined();
      expect(metrics.distressToleranceSkills).toBeDefined();
      expect(metrics.emotionRegulationSkills).toBeDefined();
      expect(metrics.interpersonalEffectivenessSkills).toBeDefined();
      expect(metrics.overallDBTProgress).toBeDefined();
      expect(metrics.targetBehaviorReduction).toBeDefined();
    });
  });

  describe('Integration with Crisis Platform', () => {
    it('should integrate with safety planning using DBT principles', async () => {
      const dbtsafetyPlan = await drSage.integrateDBTSafetyPlanning(mockSessionState);
      
      expect(dbtsafetyPlan.dbtSkillsIncluded).toBe(true);
      expect(dbtsafetyPlan.crisisSkills).toContain('TIPP');
      expect(dbtsafetyPlan.crisisSkills).toContain('distraction');
      expect(dbtsafetyPlan.crisisSkills).toContain('self_soothing');
      expect(dbtsafetyPlan.supportContacts).toContain('DBT_therapist');
      expect(dbtsafetyPlan.warningSignsDBT).toHaveLength(5);
    });

    it('should recommend peer support with DBT focus', async () => {
      const peerRecommendation = await drSage.recommendDBTPeerSupport(mockSessionState);
      
      expect(peerRecommendation.recommended).toBe(true);
      expect(peerRecommendation.groupType).toBe('DBT_skills_group');
      expect(peerRecommendation.skillsPartners).toBe(true);
      expect(peerRecommendation.accountabilityBuddy).toBe(true);
      expect(peerRecommendation.groupActivities).toContain('skills_practice');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle emotional overwhelm appropriately', async () => {
      const overwhelmInput = "I can't think straight, I'm too emotional, nothing makes sense";
      
      const response = await drSage.handleEmotionalOverwhelm(overwhelmInput, mockSessionState);
      
      expect(response.immediateIntervention).toBe(true);
      expect(response.skills).toContain('grounding');
      expect(response.skills).toContain('breathing');
      expect(response.simplifiedGuidance).toBe(true);
      expect(response.checkIn).toBe('frequent');
      expect(response.safetyPlan).toBe(true);
    });

    it('should maintain DBT principles under pressure', async () => {
      const pressureInput = "You're not helping, DBT is stupid, I need real solutions now!";
      
      const response = await drSage.maintainDBTPrinciples(pressureInput, mockSessionState);
      
      expect(response.validation).toBe(true);
      expect(response.dialecticalThinking).toBe(true);
      expect(response.effectiveness).toBe('prioritized');
      expect(response.judgment).toBe('suspended');
      expect(response.therapeutic_boundary).toBe('maintained');
    });
  });

  describe('Performance and Efficiency', () => {
    it('should provide rapid crisis intervention', async () => {
      const startTime = Date.now();
      
      await drSage.provideCrisisDBTSkills("Crisis input", {
        ...mockSessionState,
        riskAssessment: { level: 'critical', factors: [], lastAssessed: new Date() },
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1500); // Under 1.5 seconds for crisis
    });

    it('should efficiently adapt to user emotional state', async () => {
      const rapidStateChanges = [
        { emotion: 'anger', intensity: 8 },
        { emotion: 'sadness', intensity: 6 },
        { emotion: 'fear', intensity: 9 },
        { emotion: 'numbness', intensity: 3 },
      ];

      for (const state of rapidStateChanges) {
        const startTime = Date.now();
        await drSage.adaptToEmotionalState(state, mockSessionState);
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(1000); // Under 1 second adaptation
      }
    });
  });
});