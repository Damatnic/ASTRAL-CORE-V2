/**
 * ASTRAL_CORE 2.0 - Dr. Luna (EMDR Specialist) Tests
 * Life-critical testing for AI EMDR trauma therapist
 */

import { DrLuna } from '../../packages/ai-therapy/src/therapists/DrLuna';
import { SessionState, EMDRTherapy, TraumaAssessment } from '../../packages/ai-therapy/src/types';

describe('DrLuna - EMDR Specialist', () => {
  let drLuna: DrLuna;
  let mockSessionState: SessionState;
  let mockTraumaState: SessionState & { traumaHistory: TraumaAssessment };

  beforeEach(() => {
    drLuna = new DrLuna();
    mockSessionState = {
      userId: 'user-123',
      sessionId: 'session-456',
      currentPhase: 'assessment',
      emotionalState: {
        primaryEmotion: 'anxiety',
        intensity: 6,
        triggers: ['crowded places', 'loud noises'],
        physicalSymptoms: ['hypervigilance', 'startled response'],
      },
      cognitivePatterns: [
        { pattern: 'intrusive_thoughts', frequency: 4, lastOccurrence: new Date() },
        { pattern: 'negative_self_beliefs', frequency: 6, lastOccurrence: new Date() },
      ],
      behavioralPatterns: [
        { pattern: 'avoidance', frequency: 5, lastOccurrence: new Date() },
        { pattern: 'hypervigilance', frequency: 7, lastOccurrence: new Date() },
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
        factors: ['trauma_symptoms', 'avoidance_behaviors'],
        lastAssessed: new Date(),
      },
    };

    mockTraumaState = {
      ...mockSessionState,
      traumaHistory: {
        traumaType: 'single_incident',
        timeAgo: '2 years',
        processed: false,
        triggers: ['car_horns', 'screeching_tires'],
        avoidanceBehaviors: ['driving', 'being_passenger'],
        intrusiveSymptoms: ['flashbacks', 'nightmares'],
        hyperarousalSymptoms: ['startled_response', 'sleep_difficulties'],
        negativeCognitions: ['I am not safe', 'It was my fault'],
        sudsLevel: 8, // Subjective Units of Disturbance
        validityOfPositiveCognition: 2, // 1-7 scale
      },
    };
  });

  describe('EMDR 8-Phase Protocol', () => {
    describe('Phase 1: Client History and Treatment Planning', () => {
      it('should conduct comprehensive trauma assessment', async () => {
        const assessment = await drLuna.conductTraumaAssessment(mockSessionState);
        
        expect(assessment.traumaScreening).toBeDefined();
        expect(assessment.traumaInventory).toHaveLength(5);
        expect(assessment.resourceAssessment).toBeDefined();
        expect(assessment.stabilityEvaluation).toBeDefined();
        expect(assessment.readinessForEMDR).toBe('requires_preparation');
      });

      it('should identify target memories for processing', async () => {
        const targets = await drLuna.identifyTargetMemories(mockTraumaState);
        
        expect(targets.pastTargets).toHaveLength(1);
        expect(targets.presentTriggers).toHaveLength(2);
        expect(targets.futureTemplates).toHaveLength(1);
        expect(targets.priorityRanking).toBeDefined();
        expect(targets.processingOrder).toHaveLength(4);
      });

      it('should create EMDR treatment plan', async () => {
        const treatmentPlan = await drLuna.createEMDRTreatmentPlan(mockTraumaState);
        
        expect(treatmentPlan.phases).toHaveLength(8);
        expect(treatmentPlan.estimatedSessions).toBe(12);
        expect(treatmentPlan.preparationNeeded).toBe(true);
        expect(treatmentPlan.resourceInstallation).toBe(true);
        expect(treatmentPlan.safetyPrecautions).toHaveLength(4);
      });
    });

    describe('Phase 2: Preparation', () => {
      it('should establish safe place visualization', async () => {
        const safePlace = await drLuna.establishSafePlace(mockSessionState);
        
        expect(safePlace.visualization).toBeDefined();
        expect(safePlace.sensoryDetails).toHaveLength(5);
        expect(safePlace.positiveEmotions).toContain('calm');
        expect(safePlace.positiveEmotions).toContain('secure');
        expect(safePlace.bodyAwareness).toBeDefined();
        expect(safePlace.installed).toBe(true);
      });

      it('should teach bilateral stimulation preparation', async () => {
        const bilateralPrep = await drLuna.prepareBilateralStimulation(mockSessionState);
        
        expect(bilateralPrep.methods).toContain('eye_movements');
        expect(bilateralPrep.methods).toContain('tactile_tapping');
        expect(bilateralPrep.methods).toContain('auditory_tones');
        expect(bilateralPrep.preferences).toBeDefined();
        expect(bilateralPrep.practiceSession).toBe(true);
        expect(bilateralPrep.comfort_level).toBeGreaterThan(7);
      });

      it('should install positive resources', async () => {
        const resources = await drLuna.installPositiveResources(mockSessionState);
        
        expect(resources.strengthsIdentified).toHaveLength(3);
        expect(resources.positiveMemories).toHaveLength(2);
        expect(resources.supportNetwork).toBeDefined();
        expect(resources.copingSkills).toHaveLength(4);
        expect(resources.selfEfficacy).toBeGreaterThan(5);
      });

      it('should teach containment exercises', async () => {
        const containment = await drLuna.teachContainmentExercises(mockSessionState);
        
        expect(containment.techniques).toContain('container_visualization');
        expect(containment.techniques).toContain('safe_lockbox');
        expect(containment.techniques).toContain('mental_filing_cabinet');
        expect(containment.practiceRequired).toBe(true);
        expect(containment.effectiveness).toBeGreaterThan(6);
      });
    });

    describe('Phase 3: Assessment', () => {
      it('should assess target memory components', async () => {
        const targetMemory = "The car accident - I see the other car coming toward me";
        
        const assessment = await drLuna.assessTargetMemory(targetMemory, mockTraumaState);
        
        expect(assessment.image).toBe('other car approaching');
        expect(assessment.negativeCognition).toContain('I am not safe');
        expect(assessment.preferredPositiveCognition).toContain('I am safe now');
        expect(assessment.validityOfPositiveCognition).toBe(2);
        expect(assessment.emotion).toBe('terror');
        expect(assessment.sudsLevel).toBe(8);
        expect(assessment.bodyLocation).toContain('chest');
      });

      it('should validate negative cognitions', async () => {
        const negativeCognitions = ['I am powerless', 'I am in danger', 'It was my fault'];
        
        const validation = await drLuna.validateNegativeCognitions(negativeCognitions, mockTraumaState);
        
        expect(validation.mostResonant).toBe('I am powerless');
        expect(validation.resonanceLevel).toBeGreaterThan(6);
        expect(validation.bodyResponse).toBeDefined();
        expect(validation.emotionalResponse).toBeDefined();
      });

      it('should establish positive cognitions', async () => {
        const negativeCognition = "I am powerless";
        
        const positiveCognition = await drLuna.establishPositiveCognition(negativeCognition, mockTraumaState);
        
        expect(positiveCognition.statement).toBe('I have power and choices');
        expect(positiveCognition.validity).toBeLessThan(4);
        expect(positiveCognition.aspirational).toBe(true);
        expect(positiveCognition.personallyMeaningful).toBe(true);
      });
    });

    describe('Phase 4: Desensitization', () => {
      it('should guide bilateral stimulation for memory processing', async () => {
        const processing = await drLuna.guideBilateralStimulation(mockTraumaState);
        
        expect(processing.stimulationType).toBe('eye_movements');
        expect(processing.speed).toBe('medium');
        expect(processing.sets).toBe(24);
        expect(processing.direction).toBe('left_to_right');
        expect(processing.monitoring).toBe('continuous');
      });

      it('should monitor SUDS levels during processing', async () => {
        const sudsMonitoring = await drLuna.monitorSUDSLevels(mockTraumaState);
        
        expect(sudsMonitoring.initialSUDS).toBe(8);
        expect(sudsMonitoring.checkpoints).toHaveLength(6);
        expect(sudsMonitoring.targetSUDS).toBe(0);
        expect(sudsMonitoring.significantReduction).toBe(true);
      });

      it('should handle abreactions safely', async () => {
        const abreactionInput = "I'm reliving it exactly like it happened, I can't breathe";
        
        const response = await drLuna.handleAbreaction(abreactionInput, mockTraumaState);
        
        expect(response.stopProcessing).toBe(true);
        expect(response.groundingTechniques).toContain('safe_place');
        expect(response.breathingGuidance).toBe(true);
        expect(response.orientationToPresent).toBe(true);
        expect(response.safetyPriority).toBe('highest');
      });

      it('should process stuck points and blocks', async () => {
        const stuckPoint = "The image keeps coming back to the same horrible moment";
        
        const response = await drLuna.processStuckPoint(stuckPoint, mockTraumaState);
        
        expect(response.technique).toBe('cognitive_interweave');
        expect(response.interventions).toContain('information');
        expect(response.interventions).toContain('responsibility');
        expect(response.interventions).toContain('safety');
        expect(response.blockCleared).toBe(true);
      });
    });

    describe('Phase 5: Installation', () => {
      it('should install positive cognition', async () => {
        const positiveCognition = "I am safe now";
        const processedState = {
          ...mockTraumaState,
          traumaHistory: {
            ...mockTraumaState.traumaHistory,
            sudsLevel: 1, // Significantly reduced
          },
        };

        const installation = await drLuna.installPositiveCognition(positiveCognition, processedState);
        
        expect(installation.technique).toBe('bilateral_stimulation_with_PC');
        expect(installation.validityOfPositiveCognition).toBeGreaterThan(6);
        expect(installation.bodyResonance).toBe('positive');
        expect(installation.emotionalResonance).toBe('calm');
        expect(installation.fullyInstalled).toBe(true);
      });

      it('should strengthen positive beliefs', async () => {
        const strengthening = await drLuna.strengthenPositiveBeliefs(mockTraumaState);
        
        expect(strengthening.techniques).toContain('resource_amplification');
        expect(strengthening.techniques).toContain('future_positive_scenario');
        expect(strengthening.believabilityIncrease).toBeGreaterThan(2);
        expect(strengthening.generalizedToOtherAreas).toBe(true);
      });
    });

    describe('Phase 6: Body Scan', () => {
      it('should conduct systematic body scan', async () => {
        const bodyScan = await drLuna.conductBodyScan(mockTraumaState);
        
        expect(bodyScan.systematic).toBe(true);
        expect(bodyScan.bodyRegions).toHaveLength(7);
        expect(bodyScan.residualTension).toBeDefined();
        expect(bodyScan.processing_needed).toBe(false);
        expect(bodyScan.clearance).toBe('complete');
      });

      it('should address residual body sensations', async () => {
        const residualSensation = "I still feel tension in my shoulders when I think about it";
        
        const response = await drLuna.addressResidualSensations(residualSensation, mockTraumaState);
        
        expect(response.sensationLocation).toBe('shoulders');
        expect(response.additionalProcessing).toBe(true);
        expect(response.bilateralStimulation).toBe('focused');
        expect(response.resolution).toBe('complete');
      });
    });

    describe('Phase 7: Closure', () => {
      it('should provide session closure', async () => {
        const closure = await drLuna.provideSessionClosure(mockTraumaState);
        
        expect(closure.returnToCalm).toBe(true);
        expect(closure.safePlace).toBe('activated');
        expect(closure.selfCareInstructions).toHaveLength(3);
        expect(closure.journalingGuidance).toBe(true);
        expect(closure.nextSessionPreview).toBe(true);
      });

      it('should teach between-session coping', async () => {
        const coping = await drLuna.teachBetweenSessionCoping(mockTraumaState);
        
        expect(coping.techniques).toContain('safe_place_access');
        expect(coping.techniques).toContain('grounding_exercises');
        expect(coping.techniques).toContain('containment_if_needed');
        expect(coping.support_contacts).toHaveLength(2);
        expect(coping.emergency_plan).toBe(true);
      });
    });

    describe('Phase 8: Reevaluation', () => {
      it('should reevaluate previous session work', async () => {
        const reevaluation = await drLuna.reevaluatePreviousWork(mockTraumaState);
        
        expect(reevaluation.targetMemoryStatus).toBe('fully_processed');
        expect(reevaluation.currentSUDS).toBe(0);
        expect(reevaluation.positiveBeliefStrength).toBeGreaterThan(6);
        expect(reevaluation.generalizedImprovements).toHaveLength(3);
        expect(reevaluation.newTargetsIdentified).toHaveLength(1);
      });

      it('should assess treatment progress', async () => {
        const progress = await drLuna.assessEMDRProgress(mockTraumaState);
        
        expect(progress.traumaSymptomReduction).toBeGreaterThan(70);
        expect(progress.functionalImprovement).toBe('significant');
        expect(progress.qualityOfLife).toBe('improved');
        expect(progress.remainingTargets).toHaveLength(2);
        expect(progress.treatmentCompletion).toBe(0.6);
      });
    });
  });

  describe('Trauma-Specific Interventions', () => {
    it('should handle complex trauma presentations', async () => {
      const complexTraumaState = {
        ...mockTraumaState,
        traumaHistory: {
          ...mockTraumaState.traumaHistory,
          traumaType: 'complex_developmental',
          multipleIncidents: true,
          attachmentTrauma: true,
        },
      };

      const intervention = await drLuna.handleComplexTrauma(complexTraumaState);
      
      expect(intervention.phaseOriented).toBe(true);
      expect(intervention.stabilizationPriority).toBe('high');
      expect(intervention.resourceBuilding).toBe('extensive');
      expect(intervention.titration).toBe('careful');
      expect(intervention.attachmentFocus).toBe(true);
    });

    it('should address trauma-related dissociation', async () => {
      const dissociationInput = "I feel like I'm floating above my body, watching this happen to someone else";
      
      const response = await drLuna.addressDissociation(dissociationInput, mockTraumaState);
      
      expect(response.grounding).toBe('immediate');
      expect(response.orientationTechniques).toHaveLength(5);
      expect(response.bodyAwareness).toBe('enhanced');
      expect(response.processingPaused).toBe(true);
      expect(response.safetyFirst).toBe(true);
    });

    it('should work with somatic trauma responses', async () => {
      const somaticInput = "My body remembers even when my mind doesn't";
      
      const response = await drLuna.addressSomaticTrauma(somaticInput, mockTraumaState);
      
      expect(response.bodyAwareness).toBe('enhanced');
      expect(response.somaticResources).toHaveLength(4);
      expect(response.gentleApproach).toBe(true);
      expect(response.bodyMindIntegration).toBe(true);
      expect(response.movementIntegration).toBe('optional');
    });
  });

  describe('Crisis Intervention in EMDR Context', () => {
    it('should handle trauma-related crisis', async () => {
      const crisisInput = "The flashbacks are happening constantly now, I can't make them stop";
      const crisisState = {
        ...mockTraumaState,
        riskAssessment: {
          level: 'high',
          factors: ['severe_flashbacks', 'destabilization'],
          lastAssessed: new Date(),
        },
      };

      const response = await drLuna.handleTraumaCrisis(crisisInput, crisisState);
      
      expect(response.stabilization).toBe('immediate');
      expect(response.groundingTechniques).toHaveLength(4);
      expect(response.safePlace).toBe('activated');
      expect(response.processingPaused).toBe(true);
      expect(response.emergencySupport).toBe(true);
    });

    it('should provide trauma-informed safety planning', async () => {
      const safetyPlan = await drLuna.createTraumaInformedSafetyPlan(mockTraumaState);
      
      expect(safetyPlan.triggerAwareness).toBe(true);
      expect(safetyPlan.groundingSkills).toHaveLength(5);
      expect(safetyPlan.safePlace).toBe('readily_accessible');
      expect(safetyPlan.supportNetwork).toBe('trauma_informed');
      expect(safetyPlan.professionalBackup).toBe(true);
    });
  });

  describe('Resource Development and Integration', () => {
    it('should develop protective resources', async () => {
      const resources = await drLuna.developProtectiveResources(mockSessionState);
      
      expect(resources.protectiveFigures).toHaveLength(2);
      expect(resources.strengthQualities).toHaveLength(4);
      expect(resources.wisdomFigures).toHaveLength(1);
      expect(resources.nurturingFigures).toHaveLength(2);
      expect(resources.installed).toBe(true);
    });

    it('should integrate somatic resources', async () => {
      const somaticResources = await drLuna.integrateSomaticResources(mockSessionState);
      
      expect(somaticResources.bodyStrengths).toHaveLength(3);
      expect(somaticResources.breathingAnchors).toBe(true);
      expect(somaticResources.movementResources).toHaveLength(2);
      expect(somaticResources.sensoryComfort).toHaveLength(5);
      expect(somaticResources.embodiedSafety).toBe(true);
    });
  });

  describe('Progress Monitoring and Assessment', () => {
    it('should assess trauma symptom reduction', async () => {
      const improvedState = {
        ...mockTraumaState,
        progressMetrics: {
          sessionCount: 10,
          improvementScore: 75,
          goalCompletion: 0.7,
        },
        traumaHistory: {
          ...mockTraumaState.traumaHistory,
          sudsLevel: 1,
          validityOfPositiveCognition: 6.5,
          processed: true,
        },
      };

      const assessment = await drLuna.assessTraumaSymptomReduction(improvedState);
      
      expect(assessment.ptsdSymptomReduction).toBeGreaterThan(70);
      expect(assessment.intrusivenessReduction).toBeGreaterThan(80);
      expect(assessment.avoidanceReduction).toBeGreaterThan(60);
      expect(assessment.hyperarousalReduction).toBeGreaterThan(70);
      expect(assessment.functionalImprovement).toBe('significant');
    });

    it('should monitor therapy stability and integration', async () => {
      const stability = await drLuna.monitorTherapyStability(mockTraumaState);
      
      expect(stability.emotionalStability).toBeDefined();
      expect(stability.memoryIntegration).toBeDefined();
      expect(stability.dailyFunctioning).toBeDefined();
      expect(stability.relationshipQuality).toBeDefined();
      expect(stability.overallWellbeing).toBeDefined();
    });
  });

  describe('Integration with Platform Features', () => {
    it('should integrate with safety planning', async () => {
      const integration = await drLuna.integrateTraumaSafetyPlanning(mockTraumaState);
      
      expect(integration.traumaAwareness).toBe(true);
      expect(integration.triggerManagement).toBe(true);
      expect(integration.groundingSkills).toHaveLength(5);
      expect(integration.safePlace).toBe('accessible');
      expect(integration.professionalSupport).toBe('trauma_specialized');
    });

    it('should recommend appropriate peer support', async () => {
      const peerRecommendation = await drLuna.recommendTraumaPeerSupport(mockTraumaState);
      
      expect(peerRecommendation.recommended).toBe(true);
      expect(peerRecommendation.traumaInformed).toBe(true);
      expect(peerRecommendation.groupType).toBe('trauma_survivors');
      expect(peerRecommendation.screeningRequired).toBe(true);
      expect(peerRecommendation.stabilityPrerequisite).toBe(true);
    });
  });

  describe('Ethical and Safety Considerations', () => {
    it('should maintain trauma-informed consent', async () => {
      const consent = await drLuna.ensureTraumaInformedConsent(mockSessionState);
      
      expect(consent.risksExplained).toBe(true);
      expect(consent.benefitsExplained).toBe(true);
      expect(consent.alternativesDiscussed).toBe(true);
      expect(consent.rightToStop).toBe(true);
      expect(consent.ongoingConsent).toBe(true);
    });

    it('should recognize contraindications for EMDR', async () => {
      const contraindicatedState = {
        ...mockSessionState,
        riskAssessment: {
          level: 'critical',
          factors: ['active_psychosis', 'severe_dissociation', 'substance_intoxication'],
          lastAssessed: new Date(),
        },
      };

      const assessment = await drLuna.assessEMDRSuitability(contraindicatedState);
      
      expect(assessment.suitable).toBe(false);
      expect(assessment.contraindications).toHaveLength(3);
      expect(assessment.alternativeRecommendations).toHaveLength(2);
      expect(assessment.stabilizationFirst).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle overwhelming emotional activation', async () => {
      const overwhelmInput = "This is too much, I can't handle these feelings, make it stop";
      
      const response = await drLuna.handleOverwhelm(overwhelmInput, mockTraumaState);
      
      expect(response.stopProcessing).toBe(true);
      expect(response.stabilize).toBe(true);
      expect(response.groundingImmediate).toBe(true);
      expect(response.safePlace).toBe('activated');
      expect(response.supportNeeded).toBe(true);
    });

    it('should manage therapeutic boundaries with trauma survivors', async () => {
      const boundaryInput = "You're the only one who understands me, I need to see you every day";
      
      const response = await drLuna.manageBoundaries(boundaryInput, mockTraumaState);
      
      expect(response.validation).toBe(true);
      expect(response.boundaryMaintenance).toBe(true);
      expect(response.therapeuticExplanation).toBe(true);
      expect(response.supportAlternatives).toHaveLength(3);
      expect(response.professional).toBe(true);
    });
  });

  describe('Performance and Efficiency', () => {
    it('should provide rapid stabilization when needed', async () => {
      const startTime = Date.now();
      
      await drLuna.provideRapidStabilization(mockTraumaState);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Under 1 second for stabilization
    });

    it('should efficiently assess trauma readiness', async () => {
      const startTime = Date.now();
      
      await drLuna.assessTraumaReadiness(mockSessionState);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(2000); // Under 2 seconds for assessment
    });
  });

  describe('Treatment Completion and Maintenance', () => {
    it('should assess treatment completion criteria', async () => {
      const completedState = {
        ...mockTraumaState,
        traumaHistory: {
          ...mockTraumaState.traumaHistory,
          sudsLevel: 0,
          validityOfPositiveCognition: 7,
          processed: true,
        },
      };

      const completion = await drLuna.assessTreatmentCompletion(completedState);
      
      expect(completion.criteriaaMet).toBe(true);
      expect(completion.symptomsResolved).toBe(true);
      expect(completion.functionalityRestored).toBe(true);
      expect(completion.qualityOfLifeImproved).toBe(true);
      expect(completion.maintenanceRecommended).toBe(true);
    });

    it('should provide relapse prevention strategies', async () => {
      const prevention = await drLuna.provideRelapsePrevention(mockTraumaState);
      
      expect(prevention.triggerManagement).toBe(true);
      expect(prevention.copingStrategies).toHaveLength(5);
      expect(prevention.resourceMaintenance).toBe(true);
      expect(prevention.earlyWarningSignsrs).toHaveLength(4);
      expect(prevention.refresherSessions).toBe('available');
    });
  });
});