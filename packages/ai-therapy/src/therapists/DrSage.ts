/**
 * Dr. Sage - DBT (Dialectical Behavior Therapy) Specialist
 * 
 * Specializes in distress tolerance, emotion regulation,
 * interpersonal effectiveness, and mindfulness
 */

import {
  TherapistProfile,
  TherapeuticIntervention,
  TherapeuticResponse,
  HomeworkAssignment,
  Resource,
  EmotionalTone
} from '../types/therapy.types';

import {
  SessionContext,
  EmotionalState
} from '../types/session.types';

export class DrSage {
  private profile: TherapistProfile;
  private dbtModules: Map<string, TherapeuticIntervention>;
  
  constructor() {
    this.profile = this.initializeProfile();
    this.dbtModules = this.loadDBTModules();
  }

  private initializeProfile(): TherapistProfile {
    return {
      id: 'dr-sage-dbt',
      name: 'Dr. Sage',
      title: 'Dialectical Behavior Therapy Specialist',
      specialization: 'DBT',
      bio: `Dr. Sage specializes in Dialectical Behavior Therapy (DBT), helping clients develop 
            skills for managing intense emotions, improving relationships, and building a life worth living. 
            With expertise in distress tolerance, emotion regulation, interpersonal effectiveness, and 
            mindfulness, Dr. Sage provides compassionate support for those struggling with emotional dysregulation.`,
      credentials: [
        'DBT Intensive Training',
        'Distress Tolerance Specialist',
        'Emotion Regulation Expert',
        'Mindfulness-Based Interventions'
      ],
      experience: 'Specialized in DBT for emotional dysregulation, self-harm, and interpersonal difficulties',
      approach: `I combine acceptance and change strategies to help you build skills for managing difficult 
                emotions and situations. We'll work together on developing practical tools you can use in 
                your daily life while practicing radical acceptance and mindfulness.`,
      languages: ['English', 'Spanish', 'Mandarin'],
      availability: 'available'
    };
  }

  /**
   * Generate a DBT-focused therapeutic response
   */
  public async generateResponse(
    clientMessage: string,
    emotionalState: EmotionalState,
    context?: SessionContext
  ): Promise<TherapeuticResponse> {
    // Assess emotional dysregulation level
    const dysregulationLevel = this.assessEmotionalDysregulation(emotionalState);
    
    // Identify primary DBT target
    const primaryTarget = this.identifyDBTTarget(
      clientMessage,
      emotionalState,
      dysregulationLevel
    );
    
    // Select appropriate DBT skill
    const intervention = this.selectDBTIntervention(
      primaryTarget,
      dysregulationLevel,
      context
    );
    
    // Generate DBT-specific response
    const message = await this.craftDBTResponse(
      clientMessage,
      primaryTarget,
      intervention,
      dysregulationLevel
    );
    
    // Create skill-building questions
    const followUpQuestions = this.generateDBTQuestions(primaryTarget, intervention);
    
    // Assign DBT homework/practice
    const homework = this.createDBTHomework(primaryTarget, intervention);
    
    // Select DBT resources
    const resources = this.selectDBTResources(primaryTarget);

    return {
      message,
      intervention,
      emotionalTone: this.selectDBTTone(emotionalState, dysregulationLevel),
      followUpQuestions,
      resources,
      homework,
      crisisDetected: dysregulationLevel === 'crisis',
      handoffRecommended: dysregulationLevel === 'crisis',
      confidence: 0.82
    };
  }

  /**
   * Assess level of emotional dysregulation
   */
  private assessEmotionalDysregulation(
    emotionalState: EmotionalState
  ): 'low' | 'moderate' | 'high' | 'crisis' {
    const intensityScore = (
      emotionalState.anxiety +
      emotionalState.anger +
      emotionalState.sadness +
      emotionalState.fear +
      emotionalState.stress
    ) / 5;
    
    if (emotionalState.overall === 'distressed' && intensityScore > 0.8) {
      return 'crisis';
    }
    
    if (intensityScore > 0.6) {
      return 'high';
    }
    
    if (intensityScore > 0.4) {
      return 'moderate';
    }
    
    return 'low';
  }

  /**
   * Identify primary DBT target area
   */
  private identifyDBTTarget(
    message: string,
    _emotionalState: EmotionalState,
    dysregulationLevel: string
  ): 'distress_tolerance' | 'emotion_regulation' | 'interpersonal' | 'mindfulness' {
    const lowerMessage = message.toLowerCase();
    
    // Crisis or high distress → Distress Tolerance
    if (dysregulationLevel === 'crisis' || dysregulationLevel === 'high') {
      return 'distress_tolerance';
    }
    
    // Interpersonal conflicts
    const interpersonalIndicators = [
      'relationship', 'partner', 'friend', 'family',
      'conflict', 'argument', 'communication', 'boundary'
    ];
    if (interpersonalIndicators.some(term => lowerMessage.includes(term))) {
      return 'interpersonal';
    }
    
    // Emotion regulation needs
    const emotionIndicators = [
      'can\'t control', 'overwhelmed', 'emotional',
      'mood swing', 'unstable', 'intense feelings'
    ];
    if (emotionIndicators.some(term => lowerMessage.includes(term))) {
      return 'emotion_regulation';
    }
    
    // Default to mindfulness for awareness building
    return 'mindfulness';
  }

  /**
   * Select appropriate DBT intervention
   */
  private selectDBTIntervention(
    target: string,
    dysregulationLevel: string,
    _context?: SessionContext
  ): TherapeuticIntervention {
    switch (target) {
      case 'distress_tolerance':
        if (dysregulationLevel === 'crisis') {
          return this.dbtModules.get('tipp')!; // Temperature, Intense exercise, Paced breathing, Paired muscle relaxation
        }
        return this.dbtModules.get('accepts')!; // Distraction skills
        
      case 'emotion_regulation':
        return this.dbtModules.get('please')!; // Treating PhysicaL illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise
        
      case 'interpersonal':
        return this.dbtModules.get('dearman')!; // Interpersonal effectiveness
        
      case 'mindfulness':
      default:
        return this.dbtModules.get('wise_mind')!;
    }
  }

  /**
   * Craft DBT-specific therapeutic response
   */
  private async craftDBTResponse(
    _clientMessage: string,
    _target: string,
    intervention: TherapeuticIntervention,
    dysregulationLevel: string
  ): Promise<string> {
    let response = '';
    
    // Validate the experience (key DBT principle)
    response += this.generateValidation(dysregulationLevel);
    
    // Dialectical stance (acceptance AND change)
    response += `\n\nI can see you're doing the best you can with the skills you have right now, `;
    response += `AND we can work together on building new skills to help you cope more effectively. `;
    
    // Introduce the skill
    response += `\n\nLet's try using ${intervention.technique}. ${intervention.rationale} `;
    
    // Provide skill instructions
    response += `\n\n${intervention.instructions}`;
    
    // Add encouragement specific to DBT
    response += `\n\nRemember, these skills take practice. You're building your ability to tolerate distress `;
    response += `and regulate emotions - this is hard work and you're doing it.`;
    
    return response;
  }

  /**
   * Generate validation statement (core DBT principle)
   */
  private generateValidation(dysregulationLevel: string): string {
    const validations = {
      crisis: `I can see you're in tremendous pain right now. This level of distress is incredibly difficult to bear, and it makes complete sense that you're struggling.`,
      high: `What you're feeling right now is intense and overwhelming. Anyone in your situation would find this challenging.`,
      moderate: `I hear how difficult this is for you. Your emotions are giving you important information about what matters to you.`,
      low: `Thank you for sharing this with me. It takes courage to explore these feelings and work on new ways of coping.`
    };
    
    return validations[dysregulationLevel as keyof typeof validations] || validations.moderate;
  }

  /**
   * Generate DBT skill-building questions
   */
  private generateDBTQuestions(
    target: string,
    _intervention: TherapeuticIntervention
  ): string[] {
    const questions: string[] = [];
    
    switch (target) {
      case 'distress_tolerance':
        questions.push('What usually helps you get through difficult moments?');
        questions.push('On a scale of 1-10, how intense is your distress right now?');
        questions.push('What would "getting through this" look like for you?');
        break;
        
      case 'emotion_regulation':
        questions.push('Can you name the specific emotion you\'re feeling?');
        questions.push('What prompted this emotion? What happened right before?');
        questions.push('How is this emotion trying to help or protect you?');
        break;
        
      case 'interpersonal':
        questions.push('What do you need from this relationship or interaction?');
        questions.push('How can you ask for what you need while maintaining self-respect?');
        questions.push('What boundaries would be helpful here?');
        break;
        
      case 'mindfulness':
        questions.push('What are you noticing in this present moment?');
        questions.push('Can you observe your thoughts without judging them?');
        questions.push('What would your "wise mind" say about this situation?');
        break;
    }
    
    return questions;
  }

  /**
   * Create DBT homework assignment
   */
  private createDBTHomework(
    target: string,
    _intervention: TherapeuticIntervention
  ): HomeworkAssignment {
    const homeworkOptions: Record<string, HomeworkAssignment> = {
      distress_tolerance: {
        id: 'dt-skills-' + Date.now(),
        title: 'Distress Tolerance Skills Practice',
        description: 'Practice TIPP or ACCEPTS skills when distressed',
        type: 'practice',
        instructions: [
          'When you notice distress rising above 6/10:',
          '1. Use Temperature change (cold water on face)',
          '2. Or try Intense exercise (jumping jacks for 1 minute)',
          '3. Or use Paced breathing (4-7-8 pattern)',
          '4. Record which skill you used and effectiveness (1-10)',
          '5. Note what situation triggered the need for the skill'
        ],
        trackingMetrics: ['skill_used', 'effectiveness', 'distress_before', 'distress_after']
      },
      
      emotion_regulation: {
        id: 'er-diary-' + Date.now(),
        title: 'Emotion Regulation Diary Card',
        description: 'Track emotions and skills used daily',
        type: 'journal',
        instructions: [
          'Each day, track:',
          '1. Emotions experienced (rate intensity 0-10)',
          '2. Triggers for strong emotions',
          '3. Skills used to regulate emotions',
          '4. Effectiveness of skills (0-10)',
          '5. Self-care activities (PLEASE skills)',
          '6. One thing you\'re grateful for'
        ],
        trackingMetrics: ['emotions', 'skills_used', 'effectiveness']
      },
      
      interpersonal: {
        id: 'ip-practice-' + Date.now(),
        title: 'DEARMAN Practice',
        description: 'Practice interpersonal effectiveness skills',
        type: 'practice',
        instructions: [
          'Before a difficult conversation:',
          'Describe the situation objectively',
          'Express your feelings and opinions',
          'Assert your needs clearly',
          'Reinforce the benefits',
          'Mindfully stay focused',
          'Appear confident',
          'Negotiate if needed'
        ],
        trackingMetrics: ['situation', 'skill_used', 'outcome']
      },
      
      mindfulness: {
        id: 'mindfulness-' + Date.now(),
        title: 'Wise Mind Practice',
        description: 'Daily mindfulness and wise mind exercises',
        type: 'practice',
        instructions: [
          'Practice for 5-10 minutes daily:',
          '1. Find a quiet space',
          '2. Focus on your breath',
          '3. Notice when in emotion mind (hot, reactive)',
          '4. Notice when in reasonable mind (cold, logical)',
          '5. Find the middle path - wise mind',
          '6. What does wise mind tell you?'
        ],
        trackingMetrics: ['practice_duration', 'insights']
      }
    };
    
    return homeworkOptions[target] || homeworkOptions.mindfulness;
  }

  /**
   * Select DBT-specific resources
   */
  private selectDBTResources(target: string): Resource[] {
    const resources: Resource[] = [];
    
    // Core DBT resources
    resources.push({
      id: 'dbt-skills-overview',
      type: 'article',
      title: 'DBT Skills Overview',
      description: 'Introduction to the four modules of DBT',
      url: '/resources/dbt-overview',
      difficulty: 'beginner'
    });
    
    // Target-specific resources
    switch (target) {
      case 'distress_tolerance':
        resources.push(
          {
            id: 'crisis-survival',
            type: 'worksheet',
            title: 'Crisis Survival Skills (TIPP)',
            description: 'Quick skills for intense distress',
            url: '/resources/tipp-skills',
            difficulty: 'beginner'
          },
          {
            id: 'distraction-skills',
            type: 'video',
            title: 'ACCEPTS Distraction Techniques',
            description: 'Seven ways to distract from painful emotions',
            url: '/resources/videos/accepts',
            duration: 8,
            difficulty: 'beginner'
          }
        );
        break;
        
      case 'emotion_regulation':
        resources.push(
          {
            id: 'emotion-wheel',
            type: 'worksheet',
            title: 'Emotion Identification Wheel',
            description: 'Tool for naming and understanding emotions',
            url: '/resources/emotion-wheel',
            difficulty: 'beginner'
          },
          {
            id: 'please-skills',
            type: 'article',
            title: 'PLEASE Skills for Emotional Balance',
            description: 'Taking care of your body to regulate emotions',
            url: '/resources/please-skills',
            difficulty: 'intermediate'
          }
        );
        break;
        
      case 'interpersonal':
        resources.push(
          {
            id: 'dearman-guide',
            type: 'worksheet',
            title: 'DEARMAN Interpersonal Effectiveness',
            description: 'Script for asking for what you need',
            url: '/resources/dearman',
            difficulty: 'intermediate'
          },
          {
            id: 'fast-skills',
            type: 'article',
            title: 'FAST Skills for Self-Respect',
            description: 'Maintaining self-respect in relationships',
            url: '/resources/fast-skills',
            difficulty: 'intermediate'
          }
        );
        break;
        
      case 'mindfulness':
        resources.push(
          {
            id: 'wise-mind',
            type: 'audio',
            title: 'Wise Mind Meditation',
            description: 'Guided meditation for accessing wise mind',
            url: '/resources/audio/wise-mind',
            duration: 10,
            difficulty: 'beginner'
          },
          {
            id: 'observe-describe',
            type: 'worksheet',
            title: 'Observe and Describe Practice',
            description: 'Mindfulness exercises for daily life',
            url: '/resources/observe-describe',
            difficulty: 'beginner'
          }
        );
        break;
    }
    
    return resources.slice(0, 3);
  }

  /**
   * Load DBT modules and interventions
   */
  private loadDBTModules(): Map<string, TherapeuticIntervention> {
    const modules = new Map<string, TherapeuticIntervention>();
    
    // Distress Tolerance Skills
    modules.set('tipp', {
      type: 'distress_tolerance',
      technique: 'TIPP (Crisis Survival Skills)',
      rationale: 'These skills work quickly to calm your body\'s arousal system when emotions are overwhelming.',
      instructions: `Let's use TIPP to bring down the intensity:

**T**emperature: Splash cold water on your face or hold ice cubes. This triggers the dive response and calms your system.

**I**ntense Exercise: Do jumping jacks, run in place, or dance vigorously for 1-2 minutes.

**P**aced Breathing: Breathe in for 4 counts, hold for 4, out for 6. This slows your heart rate.

**P**aired Muscle Relaxation: Tense and release muscle groups while breathing out.

Which of these feels most doable for you right now?`
    });
    
    modules.set('accepts', {
      type: 'distress_tolerance',
      technique: 'ACCEPTS (Distraction Skills)',
      rationale: 'When we can\'t solve a problem right away, distraction helps us tolerate the distress without making things worse.',
      instructions: `Try ACCEPTS for healthy distraction:

**A**ctivities: Do something that requires focus
**C**ontributing: Help someone else
**C**omparisons: Remember harder times you've survived
**E**motions: Watch/read something to shift emotions
**P**ushing Away: Mentally put the problem in a box
**T**houghts: Count, do puzzles, redirect thinking
**S**ensations: Use intense sensations (cold shower, loud music)

What distraction might work best for you now?`
    });
    
    // Emotion Regulation Skills
    modules.set('please', {
      type: 'emotion_regulation',
      technique: 'PLEASE (Reducing Vulnerability)',
      rationale: 'Taking care of our physical health makes us less vulnerable to emotional dysregulation.',
      instructions: `Let's check your PLEASE skills:

**P**L - Treat **Ph**ysica**L** illness: Are you taking care of any health issues?
**E**ating: Are you eating regularly and balanced?
**A**void mood-altering substances: Are substances affecting your emotions?
**S**leep: Are you getting enough quality sleep?
**E**xercise: Are you moving your body regularly?

Which area needs the most attention? Small changes here can significantly impact emotional stability.`
    });
    
    modules.set('opposite_action', {
      type: 'emotion_regulation',
      technique: 'Opposite Action',
      rationale: 'When emotions don\'t fit the facts or aren\'t effective, acting opposite to the emotion\'s urge can help change it.',
      instructions: `Let's practice Opposite Action:

1. Name the emotion and its intensity (0-10)
2. What is this emotion urging you to do?
3. Does this emotion fit the facts? Is acting on it effective?
4. If not, what's the opposite action?
5. Do the opposite action fully and mindfully
6. Repeat until the emotion decreases

What emotion are you wanting to change right now?`
    });
    
    // Interpersonal Effectiveness Skills
    modules.set('dearman', {
      type: 'interpersonal',
      technique: 'DEARMAN (Getting What You Want)',
      rationale: 'This script helps you ask for what you need effectively while maintaining relationships.',
      instructions: `Let's prepare your DEARMAN script:

**D**escribe: State the facts of the situation objectively
**E**xpress: Share your feelings and opinions
**A**ssert: Ask for what you want clearly
**R**einforce: Explain the benefits to the other person
**M**indful: Stay focused on your goal
**A**ppear confident: Use confident body language and tone
**N**egotiate: Be willing to give to get

What situation do you need to address? Let's script it out.`
    });
    
    modules.set('give', {
      type: 'interpersonal',
      technique: 'GIVE (Maintaining Relationships)',
      rationale: 'These skills help maintain and improve relationships while addressing issues.',
      instructions: `Use GIVE to maintain the relationship:

**G**entle: Be kind, no attacks or threats
**I**nterested: Listen and appear interested
**V**alidate: Acknowledge the other person's feelings
**E**asy Manner: Use humor, smile, be light

How can you apply these to your current relationship challenge?`
    });
    
    // Mindfulness Skills
    modules.set('wise_mind', {
      type: 'mindfulness',
      technique: 'Wise Mind',
      rationale: 'Wise mind is the balanced place between emotion mind and reasonable mind - it includes both logic and emotion.',
      instructions: `Let's find your wise mind:

1. Notice if you're in emotion mind (hot, reactive, mood-dependent)
2. Notice if you're in reasonable mind (cold, logical, facts-only)
3. Take several deep breaths
4. Drop into your center - some find wise mind in their gut, heart, or between the eyes
5. Ask wise mind: "What do I need to know?"
6. Listen without forcing an answer

What does your wise mind tell you about this situation?`
    });
    
    modules.set('what_skills', {
      type: 'mindfulness',
      technique: 'WHAT Skills (Observe, Describe, Participate)',
      rationale: 'These skills help us be more present and aware without getting overwhelmed by experiences.',
      instructions: `Practice the WHAT skills:

**Observe**: Notice your experience without words. Just notice thoughts, feelings, sensations as they are.

**Describe**: Put words on the experience. "I notice the thought..." "I feel sensation of..."

**Participate**: Throw yourself fully into the moment. Be one with your experience.

Right now, what are you observing in your body? Can you describe it without judgment?`
    });
    
    return modules;
  }

  // Skill libraries removed - not currently used

  /**
   * Select appropriate DBT emotional tone
   */
  private selectDBTTone(
    emotionalState: EmotionalState,
    dysregulationLevel: string
  ): EmotionalTone {
    // DBT emphasizes validation
    if (dysregulationLevel === 'crisis' || dysregulationLevel === 'high') {
      return 'validating';
    }
    
    if (emotionalState.overall === 'distressed') {
      return 'supportive';
    }
    
    // Balance of acceptance and change
    return 'encouraging';
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