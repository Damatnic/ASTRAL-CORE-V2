/**
 * Dr. Luna - Trauma/EMDR Specialist
 * 
 * Specializes in trauma-informed care, EMDR processing,
 * and somatic awareness techniques
 */

import {
  TherapistProfile,
  TherapeuticIntervention,
  TherapeuticResponse,
  HomeworkAssignment,
  Resource,
  EmotionalTone,
  SafetyPlan
} from '../types/therapy.types';

import {
  SessionContext,
  EmotionalState,
  SentimentAnalysis
} from '../types/session.types';

export class DrLuna {
  private profile: TherapistProfile;
  private emdrPhases: Map<number, TherapeuticIntervention>;
  private somaticTechniques: Map<string, TherapeuticIntervention>;
  private traumaResources: Map<string, Resource>;
  
  constructor() {
    this.profile = this.initializeProfile();
    this.emdrPhases = this.loadEMDRPhases();
    this.somaticTechniques = this.loadSomaticTechniques();
    this.traumaResources = this.loadTraumaResources();
  }

  private initializeProfile(): TherapistProfile {
    return {
      id: 'dr-luna-emdr',
      name: 'Dr. Luna',
      title: 'Trauma and EMDR Specialist',
      specialization: 'EMDR',
      approach: 'Trauma-informed, somatic-based processing',
      bio: 'Dr. Luna specializes in trauma therapy using EMDR, somatic experiencing, and attachment-based interventions.',
      credentials: [
        'Licensed Clinical Psychologist',
        'EMDR Certified Therapist',
        'Trauma-Informed Care Specialist',
        'Somatic Experiencing Practitioner',
        'Complex PTSD Treatment'
      ],
      experience: 'Specialized in trauma processing, PTSD treatment, and nervous system regulation',
      languages: ['English', 'Portuguese', 'Italian'],
      availability: 'available'
    };
  }

  public async provideTreatment(
    context: SessionContext,
    emotionalState: EmotionalState,
    sentiment: SentimentAnalysis,
    messageText?: string
  ): Promise<TherapeuticResponse> {
    const indicators = this.analyzeTraumaIndicators(messageText || '');
    const toleranceWindow = this.assessToleranceWindow(emotionalState);
    
    // Select appropriate intervention
    let intervention: TherapeuticIntervention;
    
    // For now, use a simple crisis detection based on emotional state
    if (emotionalState.anxiety > 0.8 || emotionalState.stress > 0.8) {
      intervention = this.selectCrisisIntervention(toleranceWindow);
    } else if (context.previousSessions.length === 0) {
      intervention = this.emdrPhases.get(1)!;
    } else {
      intervention = this.selectPhaseIntervention(2, indicators);
    }

    const homeworkAssignments = this.generateHomework(indicators, toleranceWindow);
    
    return {
      message: this.generateTherapeuticMessage(intervention, toleranceWindow, indicators),
      intervention: intervention,
      homework: homeworkAssignments.length > 0 ? homeworkAssignments[0] : undefined,
      resources: this.selectTraumaResources(indicators),
      emotionalTone: this.adaptTone(toleranceWindow),
      crisisDetected: toleranceWindow === 'hyperarousal' && emotionalState.stress > 0.8,
      handoffRecommended: false,
      confidence: 0.8
    };
  }

  private analyzeTraumaIndicators(text: string): any {
    const lowerText = text.toLowerCase();
    
    // Simple keyword analysis - in production this would be more sophisticated
    const flashbackTerms = ['flashback', 'reliving', 'back there', 'happening again', 'cannot escape'];
    const dissociationTerms = ['numb', 'disconnected', 'not real', 'floating', 'outside my body', 'watching myself'];
    const hypervigilanceTerms = ['on edge', 'cannot relax', 'danger everywhere', 'startled', 'always watching'];
    const avoidanceTerms = ['cannot talk about', 'avoid', 'stay away', 'do not want to remember', 'block it out'];
    const intrusionTerms = ['nightmares', 'intrusive thoughts', 'cannot stop thinking', 'images', 'memories'];
    const negativeTerms = ['my fault', 'damaged', 'broken', 'dirty', 'worthless', 'powerless'];

    return {
      flashbacks: this.countMatches(lowerText, flashbackTerms),
      dissociation: this.countMatches(lowerText, dissociationTerms),
      hypervigilance: this.countMatches(lowerText, hypervigilanceTerms),
      avoidance: this.countMatches(lowerText, avoidanceTerms),
      intrusion: this.countMatches(lowerText, intrusionTerms),
      negativeBeliefs: this.countMatches(lowerText, negativeTerms)
    };
  }

  private countMatches(text: string, terms: string[]): number {
    return terms.reduce((count, term) => text.includes(term) ? count + 1 : count, 0) / terms.length;
  }

  private assessToleranceWindow(emotionalState: EmotionalState): 'hyperarousal' | 'optimal' | 'hypoarousal' {
    const { anxiety, stress, depression } = emotionalState;
    
    // High activation states
    if (anxiety > 0.7 || stress > 0.8) {
      return 'hyperarousal'; // Fight/flight
    }
    
    // Low activation states  
    if (depression > 0.7 && anxiety < 0.3) {
      return 'hypoarousal'; // Freeze/collapse
    }
    
    return 'optimal';
  }

  private selectCrisisIntervention(toleranceWindow: 'hyperarousal' | 'optimal' | 'hypoarousal'): TherapeuticIntervention {
    if (toleranceWindow === 'hyperarousal') {
      return this.somaticTechniques.get('grounding')!;
    }
    
    if (toleranceWindow === 'hypoarousal') {
      return this.somaticTechniques.get('activation')!;
    }
    
    // Optimal window
    return this.somaticTechniques.get('orientation')!;
  }

  private selectPhaseIntervention(phase: number, indicators: any): TherapeuticIntervention {
    return this.emdrPhases.get(phase) || this.emdrPhases.get(2)!;
  }

  private generateTherapeuticMessage(
    intervention: TherapeuticIntervention, 
    toleranceWindow: string, 
    indicators: any
  ): string {
    let response = '';
    
    // Attune to current state
    if (toleranceWindow === 'hyperarousal') {
      response += 'I can see your nervous system is activated right now. Let us focus on helping you feel safer and more grounded in this moment. You are safe here with me.';
    } else if (toleranceWindow === 'hypoarousal') {
      response += 'I notice you might be feeling disconnected or numb. That is your nervous system way of protecting you. Let us gently work on coming back into connection with the present moment.';
    } else {
      response += 'Thank you for sharing this with me. I want you to know you are safe here, and we will go at exactly the pace that feels right for you.';
    }

    if (indicators.flashbacks > 0.5 || indicators.intrusion > 0.5) {
      response += '\n\nWhat you are experiencing is a normal response to abnormal events. ';
      response += 'Your nervous system is trying to process and integrate difficult experiences. ';
      response += 'We will work together to help your system complete this natural healing process.';
    }

    if (indicators.negativeBeliefs > 0.5) {
      response += '\n\nI want you to know that the difficult thoughts you are having about yourself are not the truth about who you are. ';
      response += 'Trauma can create these painful beliefs, and together we can work to replace them with beliefs that reflect your true worth and strength.';
    }

    response += '\n\nYou are in control here. We can pause or stop at any time. ';
    response += 'Your pace is the right pace. ' + intervention.instructions;

    return response;
  }

  private generateHomework(indicators: any, toleranceWindow: string): HomeworkAssignment[] {
    const assignments: HomeworkAssignment[] = [];

    // Safe place practice
    assignments.push({
      id: 'safe-place-' + Date.now(),
      title: 'Safe Place Visualization',
      description: 'Practice accessing your internal safe place',
      type: 'practice',
      instructions: [
        'Find a quiet moment each day',
        'Close your eyes or soften your gaze',
        'Imagine a place where you feel completely safe',
        'Notice all the details - colors, sounds, smells, textures',
        'Notice how your body feels in this safe place',
        'Practice for 5-10 minutes daily',
        'You can return here whenever you need to'
      ],
      trackingMetrics: ['practice_frequency', 'effectiveness']
    });

    // Bilateral stimulation
    assignments.push({
      id: 'bilateral-' + Date.now(),
      title: 'Butterfly Hug Practice',
      description: 'Self-administered bilateral stimulation for calming',
      type: 'practice',
      instructions: [
        'Cross your arms over your chest',
        'Place each hand on opposite shoulder/upper arm',
        'Gently tap alternating sides (like a butterfly wings)',
        'Maintain a slow, rhythmic pace',
        'Continue for 30 seconds to 2 minutes',
        'Notice any shifts in your body or emotions',
        'Use when feeling activated or overwhelmed'
      ],
      trackingMetrics: ['usage_frequency', 'calm_level_after']
    });

    return assignments;
  }

  private loadEMDRPhases(): Map<number, TherapeuticIntervention> {
    const phases = new Map<number, TherapeuticIntervention>();
    
    phases.set(1, {
      type: 'trauma_processing',
      technique: 'History Taking',
      rationale: 'Understanding your history helps us identify targets for processing and your existing resources.',
      instructions: 'Share what feels comfortable about your experiences and current symptoms.'
    });

    phases.set(2, {
      type: 'grounding_technique',
      technique: 'Preparation and Stabilization',
      rationale: 'Building resources and coping skills ensures you have tools to manage any distress.',
      instructions: 'Let us identify and strengthen your resources - people, places, activities, or memories that help you feel calm and capable.'
    });

    return phases;
  }

  private loadSomaticTechniques(): Map<string, TherapeuticIntervention> {
    const techniques = new Map<string, TherapeuticIntervention>();
    
    techniques.set('grounding', {
      type: 'grounding_technique',
      technique: 'Somatic Grounding',
      rationale: 'Grounding helps regulate your nervous system and bring you back to the present moment.',
      instructions: 'Let us ground together: Feel your feet on the floor, notice your breath, look around and name what you see.'
    });

    techniques.set('activation', {
      type: 'grounding_technique',
      technique: 'Gentle Activation',
      rationale: 'When we are shut down, gentle movement helps us reconnect.',
      instructions: 'Let us gently activate your system: Wiggle your fingers and toes, take a deeper breath, gently move your shoulders.'
    });

    techniques.set('orientation', {
      type: 'grounding_technique',
      technique: 'Orientation to Present',
      rationale: 'Orienting helps your nervous system recognize current safety.',
      instructions: 'Let us orient to the here and now: What year is it? Where are you right now? You are safe in this moment.'
    });
    
    return techniques;
  }

  private loadTraumaResources(): Map<string, Resource> {
    const resources = new Map<string, Resource>();
    
    resources.set('trauma-psychoed', {
      id: 'trauma-psychoed',
      type: 'article',
      title: 'Understanding Trauma Responses',
      description: 'Learn why your nervous system responds the way it does',
      url: '/resources/trauma-responses',
      difficulty: 'beginner'
    });

    resources.set('safe-place', {
      id: 'safe-place-audio',
      type: 'audio',
      title: 'Guided Safe Place Meditation',
      description: 'Create and strengthen your internal safe place',
      url: '/resources/audio/safe-place',
      duration: 15,
      difficulty: 'beginner'
    });
    
    return resources;
  }

  private selectTraumaResources(indicators: any): Resource[] {
    const resources: Resource[] = [];
    
    // Always include psychoeducation
    const psychoedResource = this.traumaResources.get('trauma-psychoed');
    if (psychoedResource) {
      resources.push(psychoedResource);
    }
    
    // Add specific resources based on indicators
    if (indicators.flashbacks > 0.5 || indicators.intrusion > 0.5) {
      const safePlace = this.traumaResources.get('safe-place');
      if (safePlace) {
        resources.push(safePlace);
      }
    }
    
    return resources;
  }

  private adaptTone(toleranceWindow: string): EmotionalTone {
    switch (toleranceWindow) {
      case 'hyperarousal':
        return 'supportive'; // Calm and grounding
      case 'hypoarousal':
        return 'encouraging'; // Gentle activation
      default:
        return 'empathetic'; // Warm and attuned
    }
  }

  private generateSafetyPlan(indicators: any): SafetyPlan | undefined {
    return undefined; // Implement based on needs
  }

  private planNextSteps(toleranceWindow: string, indicators: any): string[] {
    return ['Continue building safety and resources', 'Practice grounding techniques daily'];
  }

  private calculateFollowUpTime(toleranceWindow: string): number {
    return toleranceWindow === 'hyperarousal' ? 24 : 72; // Hours
  }

  private generateSessionNotes(intervention: TherapeuticIntervention, toleranceWindow: string): string {
    return `Session focused on ${intervention.technique}. Client window of tolerance: ${toleranceWindow}.`;
  }

  /**
   * Get therapist profile
   */
  public getProfile(): TherapistProfile {
    return this.profile;
  }

  /**
   * Check availability
   */
  public isAvailable(): boolean {
    return this.profile.availability === 'available';
  }
}