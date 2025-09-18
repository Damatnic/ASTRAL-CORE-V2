/**
 * Dr. Aria - CBT (Cognitive Behavioral Therapy) Specialist
 * 
 * Specializes in cognitive restructuring, behavioral activation,
 * and evidence-based CBT interventions
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

export class DrAria {
  private profile: TherapistProfile;
  private cbtTechniques: Map<string, TherapeuticIntervention>;
  
  constructor() {
    this.profile = this.initializeProfile();
    this.cbtTechniques = this.loadCBTTechniques();
  }

  private initializeProfile(): TherapistProfile {
    return {
      id: 'dr-aria-cbt',
      name: 'Dr. Aria',
      title: 'Cognitive Behavioral Therapy Specialist',
      specialization: 'CBT',
      bio: `Dr. Aria is an AI therapist specializing in Cognitive Behavioral Therapy (CBT). 
            With extensive training in evidence-based CBT techniques, Dr. Aria helps clients 
            identify and challenge negative thought patterns, develop healthier behaviors, 
            and build practical coping strategies for depression, anxiety, and various other conditions.`,
      credentials: [
        'Advanced CBT Certification',
        'Cognitive Therapy Specialist',
        'Behavioral Activation Training',
        'Exposure and Response Prevention'
      ],
      experience: 'Specialized in CBT interventions with focus on mood and anxiety disorders',
      approach: `I use a collaborative, structured approach to help you understand the connections 
                between your thoughts, feelings, and behaviors. Together, we'll work on identifying 
                unhelpful patterns and developing practical strategies to create positive change in your life.`,
      languages: ['English', 'Spanish', 'French'],
      availability: 'available'
    };
  }

  /**
   * Generate a CBT-focused therapeutic response
   */
  public async generateResponse(
    clientMessage: string,
    emotionalState: EmotionalState,
    context?: SessionContext
  ): Promise<TherapeuticResponse> {
    // Analyze for cognitive distortions
    const distortions = this.identifyCognitiveDistortions(clientMessage);
    
    // Select appropriate CBT intervention
    const intervention = this.selectCBTIntervention(
      distortions,
      emotionalState,
      context
    );
    
    // Generate CBT-specific response
    const message = await this.craftCBTResponse(
      clientMessage,
      distortions,
      intervention
    );
    
    // Create follow-up questions for cognitive exploration
    const followUpQuestions = this.generateCognitiveQuestions(distortions);
    
    // Assign homework if appropriate
    const homework = this.shouldAssignHomework(emotionalState) ?
      this.createCBTHomework(distortions, intervention) :
      undefined;
    
    // Select relevant resources
    const resources = this.selectCBTResources(distortions, intervention);

    return {
      message,
      intervention,
      emotionalTone: this.selectTone(emotionalState),
      followUpQuestions,
      resources,
      homework,
      crisisDetected: false,
      handoffRecommended: false,
      confidence: 0.85
    };
  }

  /**
   * Identify cognitive distortions in client message
   */
  private identifyCognitiveDistortions(message: string): string[] {
    const distortions: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // All-or-Nothing Thinking
    const absoluteTerms = ['always', 'never', 'every', 'none', 'completely', 'totally'];
    if (absoluteTerms.some(term => lowerMessage.includes(term))) {
      distortions.push('all-or-nothing thinking');
    }
    
    // Catastrophizing
    const catastrophicTerms = ['worst', 'terrible', 'awful', 'disaster', 'horrible', 'nightmare'];
    if (catastrophicTerms.some(term => lowerMessage.includes(term))) {
      distortions.push('catastrophizing');
    }
    
    // Mind Reading
    const mindReadingPhrases = ['they think', 'she believes', 'he knows', 'everyone sees'];
    if (mindReadingPhrases.some(phrase => lowerMessage.includes(phrase))) {
      distortions.push('mind reading');
    }
    
    // Fortune Telling
    const futurePhrases = ['will never', 'going to fail', 'won\'t work', 'will always'];
    if (futurePhrases.some(phrase => lowerMessage.includes(phrase))) {
      distortions.push('fortune telling');
    }
    
    // Personalization
    const personalPhrases = ['my fault', 'because of me', 'i caused', 'i\'m responsible for everything'];
    if (personalPhrases.some(phrase => lowerMessage.includes(phrase))) {
      distortions.push('personalization');
    }
    
    // Should Statements
    const shouldTerms = ['should', 'must', 'ought to', 'have to', 'supposed to'];
    if (shouldTerms.some(term => lowerMessage.includes(term))) {
      distortions.push('should statements');
    }
    
    // Emotional Reasoning
    const emotionalPhrases = ['i feel therefore', 'feels true', 'because i feel'];
    if (emotionalPhrases.some(phrase => lowerMessage.includes(phrase))) {
      distortions.push('emotional reasoning');
    }
    
    // Filtering (Mental Filter)
    const filteringPhrases = ['nothing good', 'only bad', 'ignore the positive', 'focus on negative'];
    if (filteringPhrases.some(phrase => lowerMessage.includes(phrase))) {
      distortions.push('mental filter');
    }
    
    // Labeling
    const labelingTerms = ['i am a', 'i\'m such a', 'total failure', 'complete loser', 'worthless'];
    if (labelingTerms.some(term => lowerMessage.includes(term))) {
      distortions.push('labeling');
    }
    
    return distortions;
  }

  /**
   * Select appropriate CBT intervention
   */
  private selectCBTIntervention(
    distortions: string[],
    emotionalState: EmotionalState,
    _context?: SessionContext
  ): TherapeuticIntervention {
    // Priority: Address most prominent distortion
    if (distortions.includes('catastrophizing')) {
      return this.cbtTechniques.get('decatastrophizing')!;
    }
    
    if (distortions.includes('all-or-nothing thinking')) {
      return this.cbtTechniques.get('cognitive_restructuring')!;
    }
    
    if (distortions.includes('should statements')) {
      return this.cbtTechniques.get('should_challenging')!;
    }
    
    // If high depression, use behavioral activation
    if (emotionalState.depression > 0.7) {
      return this.cbtTechniques.get('behavioral_activation')!;
    }
    
    // If high anxiety, use worry time or exposure
    if (emotionalState.anxiety > 0.7) {
      return this.cbtTechniques.get('worry_time')!;
    }
    
    // Default to thought record
    return this.cbtTechniques.get('thought_record')!;
  }

  /**
   * Craft CBT-specific therapeutic response
   */
  private async craftCBTResponse(
    _clientMessage: string,
    distortions: string[],
    intervention: TherapeuticIntervention
  ): Promise<string> {
    let response = '';
    
    // Acknowledge and validate
    response += `I hear that you're experiencing some difficult thoughts and feelings. `;
    
    // Gently identify distortion if present
    if (distortions.length > 0) {
      response += `I notice you might be engaging in what we call "${distortions[0]}" - `;
      response += this.explainDistortion(distortions[0]);
      response += ` This is a very common pattern that many people experience. `;
    }
    
    // Introduce intervention
    response += `\n\nLet's try ${intervention.technique}. ${intervention.rationale} `;
    
    // Provide specific guidance
    response += `\n\n${intervention.instructions}`;
    
    // Add encouragement
    response += `\n\nRemember, changing thought patterns takes practice. Be patient with yourself as we work through this together.`;
    
    return response;
  }

  /**
   * Generate cognitive exploration questions
   */
  private generateCognitiveQuestions(distortions: string[]): string[] {
    const questions: string[] = [];
    
    // Evidence-based questions
    questions.push('What evidence do you have that supports this thought?');
    questions.push('What evidence might contradict this thought?');
    
    // Perspective-taking questions
    questions.push('How would you advise a friend who had this thought?');
    
    // Probability questions
    if (distortions.includes('catastrophizing')) {
      questions.push('On a scale of 0-100%, how likely is this worst-case scenario?');
      questions.push('What are some more likely outcomes?');
    }
    
    // Coping questions
    questions.push('Even if this thought were true, how could you cope with it?');
    
    // Alternative thought generation
    questions.push('Can you think of a more balanced way to view this situation?');
    
    return questions.slice(0, 3); // Return top 3 most relevant
  }

  /**
   * Create CBT homework assignment
   */
  private createCBTHomework(
    distortions: string[],
    intervention: TherapeuticIntervention
  ): HomeworkAssignment {
    const homeworkOptions: HomeworkAssignment[] = [
      {
        id: 'thought-record-' + Date.now(),
        title: 'Daily Thought Record',
        description: 'Track your thoughts, emotions, and alternative perspectives',
        type: 'worksheet',
        instructions: [
          'When you notice strong emotions, write down the situation',
          'Record your automatic thoughts',
          'Rate your emotions (0-100%)',
          'Identify any thinking errors',
          'Generate a balanced alternative thought',
          'Re-rate your emotions'
        ],
        trackingMetrics: ['completion', 'mood_before', 'mood_after']
      },
      {
        id: 'behavioral-activation-' + Date.now(),
        title: 'Pleasant Activity Scheduling',
        description: 'Schedule and engage in mood-boosting activities',
        type: 'behavioral',
        instructions: [
          'List 10 activities you used to enjoy or might enjoy',
          'Schedule at least one activity each day',
          'Rate your mood before and after each activity (0-10)',
          'Notice the connection between activity and mood'
        ],
        trackingMetrics: ['activities_completed', 'mood_ratings']
      },
      {
        id: 'worry-time-' + Date.now(),
        title: 'Designated Worry Time',
        description: 'Contain worries to a specific time period',
        type: 'practice',
        instructions: [
          'Set aside 15 minutes each day as "worry time"',
          'During the day, write worries down but postpone thinking about them',
          'During worry time, review your list',
          'Problem-solve what you can, accept what you cannot',
          'After 15 minutes, engage in a pleasant activity'
        ],
        trackingMetrics: ['worry_postponed', 'worry_time_used']
      }
    ];
    
    // Select based on primary distortion or intervention
    if (distortions.includes('catastrophizing') || distortions.includes('fortune telling')) {
      return homeworkOptions[2]; // Worry time
    }
    
    if (intervention.type === 'behavioral_activation') {
      return homeworkOptions[1]; // Pleasant activities
    }
    
    return homeworkOptions[0]; // Thought record (default)
  }

  /**
   * Select CBT-specific resources
   */
  private selectCBTResources(
    distortions: string[],
    _intervention: TherapeuticIntervention
  ): Resource[] {
    const resources: Resource[] = [
      {
        id: 'cbt-basics',
        type: 'article',
        title: 'Understanding CBT: How Thoughts Affect Feelings',
        description: 'Learn about the cognitive triangle and how CBT works',
        url: '/resources/cbt-basics',
        difficulty: 'beginner'
      },
      {
        id: 'thought-distortions',
        type: 'worksheet',
        title: 'Common Thinking Errors Checklist',
        description: 'Identify and challenge cognitive distortions',
        url: '/resources/thinking-errors',
        difficulty: 'beginner'
      },
      {
        id: 'thought-record-template',
        type: 'worksheet',
        title: 'CBT Thought Record Template',
        description: 'A structured worksheet for challenging negative thoughts',
        url: '/resources/thought-record',
        difficulty: 'intermediate'
      }
    ];
    
    // Add specific resources based on issues
    if (distortions.includes('catastrophizing')) {
      resources.push({
        id: 'decatastrophizing',
        type: 'video',
        title: 'Dealing with Catastrophic Thinking',
        description: 'Learn techniques to challenge worst-case scenario thinking',
        url: '/resources/videos/catastrophizing',
        duration: 10,
        difficulty: 'intermediate'
      });
    }
    
    return resources.slice(0, 3);
  }

  /**
   * Load CBT techniques library
   */
  private loadCBTTechniques(): Map<string, TherapeuticIntervention> {
    const techniques = new Map<string, TherapeuticIntervention>();
    
    techniques.set('cognitive_restructuring', {
      type: 'cognitive_restructuring',
      technique: 'Cognitive Restructuring',
      rationale: 'This helps us examine and challenge unhelpful thought patterns to develop more balanced perspectives.',
      instructions: `Let's work through this together:
1. What's the specific thought that's troubling you?
2. How much do you believe this thought (0-100%)?
3. What emotions does this thought trigger?
4. What evidence supports this thought?
5. What evidence contradicts it?
6. Can we create a more balanced thought?
7. How much do you believe the new thought?`
    });
    
    techniques.set('thought_record', {
      type: 'cognitive_restructuring',
      technique: 'Thought Record',
      rationale: 'Thought records help us track patterns in our thinking and develop alternative perspectives.',
      instructions: `I'd like you to complete a thought record:
- Situation: What triggered these feelings?
- Automatic Thoughts: What went through your mind?
- Emotions: What did you feel? (rate 0-100%)
- Evidence For: What supports these thoughts?
- Evidence Against: What contradicts them?
- Balanced Thought: A more realistic perspective
- Emotions Now: Re-rate your feelings`
    });
    
    techniques.set('behavioral_activation', {
      type: 'behavioral_activation',
      technique: 'Behavioral Activation',
      rationale: 'By increasing pleasant and meaningful activities, we can improve mood and break the cycle of depression.',
      instructions: `Let's create an activity plan:
1. List activities you used to enjoy or might enjoy
2. Start with small, achievable activities
3. Schedule specific times for these activities
4. Track your mood before and after
5. Notice patterns between activity and mood
What's one small activity you could do today?`
    });
    
    techniques.set('decatastrophizing', {
      type: 'cognitive_restructuring',
      technique: 'Decatastrophizing',
      rationale: 'This technique helps us challenge catastrophic predictions and develop more realistic expectations.',
      instructions: `Let's examine this worst-case scenario:
1. What's the worst that could happen?
2. How likely is this (0-100%)?
3. What's the best that could happen?
4. What's most likely to happen?
5. If the worst did happen, how would you cope?
6. What past experiences show you can handle difficulties?`
    });
    
    techniques.set('should_challenging', {
      type: 'cognitive_restructuring',
      technique: 'Challenging Should Statements',
      rationale: '"Should" statements often create unnecessary pressure and guilt. Let\'s explore more flexible thinking.',
      instructions: `Let's reframe these "should" statements:
1. What's the "should" rule you're applying?
2. Where did this rule come from?
3. Is this rule helpful or harmful?
4. Can we change "should" to "prefer" or "would like"?
5. What would you tell a friend with this rule?
6. How can we make this more compassionate?`
    });
    
    techniques.set('worry_time', {
      type: 'cognitive_restructuring',
      technique: 'Designated Worry Time',
      rationale: 'By containing worries to a specific time, we can reduce their impact on daily life.',
      instructions: `Let's implement worry time:
1. Set aside 15-20 minutes daily for worrying
2. When worries arise, write them down
3. Tell yourself "I'll think about this during worry time"
4. During worry time, review your list
5. Problem-solve what you can control
6. Practice accepting what you cannot control`
    });
    
    return techniques;
  }

  // Thought record templates removed - not currently used

  /**
   * Explain specific cognitive distortion
   */
  private explainDistortion(distortion: string): string {
    const explanations: Record<string, string> = {
      'all-or-nothing thinking': 'viewing things in absolute, black-and-white categories',
      'catastrophizing': 'expecting the worst possible outcome',
      'mind reading': 'assuming you know what others are thinking',
      'fortune telling': 'predicting negative outcomes without evidence',
      'personalization': 'taking excessive responsibility for events',
      'should statements': 'rigid rules that create pressure and guilt',
      'emotional reasoning': 'assuming feelings reflect facts',
      'mental filter': 'focusing only on negatives while ignoring positives',
      'labeling': 'defining yourself with harsh, global labels'
    };
    
    return explanations[distortion] || 'a common thinking pattern';
  }

  /**
   * Determine if homework should be assigned
   */
  private shouldAssignHomework(emotionalState: EmotionalState): boolean {
    // Don't assign if in crisis
    if (emotionalState.overall === 'distressed' && emotionalState.stress > 0.8) {
      return false;
    }
    
    // Assign if moderate symptoms present
    return emotionalState.depression > 0.4 || emotionalState.anxiety > 0.4;
  }

  /**
   * Select appropriate emotional tone
   */
  private selectTone(emotionalState: EmotionalState): EmotionalTone {
    if (emotionalState.overall === 'distressed') {
      return 'validating';
    }
    
    if (emotionalState.anxiety > 0.6) {
      return 'supportive';
    }
    
    if (emotionalState.depression > 0.6) {
      return 'encouraging';
    }
    
    return 'empathetic';
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