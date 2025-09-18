interface MoodAnalysis {
  mood: 'positive' | 'neutral' | 'negative' | 'crisis';
  score: number; // -1 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    anxiety: number;
    hope: number;
  };
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  recommendations: string[];
}

interface TherapistResponse {
  message: string;
  followUpQuestions: string[];
  resources: string[];
  techniques: string[];
}

class AIService {
  private apiKey: string;
  private apiUrl: string;
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Analyze mood and emotional state from text
   */
  async analyzeMood(text: string): Promise<MoodAnalysis> {
    try {
      const prompt = `
        Analyze the emotional state and mood from the following text. 
        Provide a detailed analysis including:
        1. Overall mood (positive/neutral/negative/crisis)
        2. Emotional scores for: joy, sadness, anger, fear, anxiety, hope (0-1 scale)
        3. Risk level assessment (none/low/medium/high/critical)
        4. Key emotional keywords detected
        5. Recommended support approaches
        
        Text to analyze: "${text}"
        
        Respond in JSON format.
      `;

      const response = await this.generateContent(prompt);
      
      // Parse AI response (in production, use actual API)
      // For now, return mock analysis based on keyword detection
      return this.performLocalAnalysis(text);
    } catch (error) {
      console.error('AI mood analysis failed:', error);
      return this.performLocalAnalysis(text);
    }
  }

  /**
   * Generate therapeutic response
   */
  async generateTherapeuticResponse(
    userMessage: string,
    context?: string,
    therapistStyle: 'cognitive' | 'supportive' | 'solution-focused' = 'supportive'
  ): Promise<TherapistResponse> {
    try {
      const prompt = `
        You are a compassionate and professional mental health counselor using a ${therapistStyle} approach.
        
        User context: ${context || 'First time user seeking support'}
        User message: "${userMessage}"
        
        Provide:
        1. An empathetic and helpful response
        2. 2-3 follow-up questions to better understand their situation
        3. Relevant coping techniques or exercises
        4. Resources that might help
        
        Keep the response warm, professional, and focused on the user's wellbeing.
        Respond in JSON format.
      `;

      const response = await this.generateContent(prompt);
      
      // For now, return template response
      return this.getTemplateResponse(userMessage, therapistStyle);
    } catch (error) {
      console.error('AI therapeutic response failed:', error);
      return this.getTemplateResponse(userMessage, therapistStyle);
    }
  }

  /**
   * Detect crisis keywords and assess urgency
   */
  detectCrisis(text: string): {
    isCrisis: boolean;
    urgencyLevel: number;
    triggers: string[];
    action: 'monitor' | 'alert' | 'escalate' | 'emergency';
  } {
    const lowerText = text.toLowerCase();
    
    // Crisis keyword categories with urgency weights
    const crisisPatterns = {
      immediate: {
        keywords: ['suicide', 'kill myself', 'end my life', 'want to die', 'plan to'],
        weight: 10,
      },
      high: {
        keywords: ['self harm', 'hurt myself', 'cutting', 'overdose', 'pills'],
        weight: 8,
      },
      medium: {
        keywords: ['hopeless', 'worthless', 'no point', 'cant go on', 'give up'],
        weight: 5,
      },
      low: {
        keywords: ['depressed', 'anxious', 'struggling', 'overwhelmed', 'scared'],
        weight: 3,
      },
    };
    
    let urgencyLevel = 0;
    const triggers: string[] = [];
    
    Object.entries(crisisPatterns).forEach(([level, pattern]) => {
      pattern.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          urgencyLevel = Math.max(urgencyLevel, pattern.weight);
          triggers.push(keyword);
        }
      });
    });
    
    let action: 'monitor' | 'alert' | 'escalate' | 'emergency' = 'monitor';
    if (urgencyLevel >= 10) action = 'emergency';
    else if (urgencyLevel >= 8) action = 'escalate';
    else if (urgencyLevel >= 5) action = 'alert';
    
    return {
      isCrisis: urgencyLevel >= 5,
      urgencyLevel,
      triggers,
      action,
    };
  }

  /**
   * Match user with appropriate support type
   */
  async recommendSupport(
    moodAnalysis: MoodAnalysis,
    userPreferences?: {
      anonymous?: boolean;
      preferredSupport?: 'peer' | 'volunteer' | 'professional';
    }
  ): Promise<{
    primaryRecommendation: 'peer' | 'volunteer' | 'professional' | 'emergency';
    alternatives: string[];
    reasoning: string;
  }> {
    let primaryRecommendation: 'peer' | 'volunteer' | 'professional' | 'emergency';
    
    // Determine based on risk level
    switch (moodAnalysis.riskLevel) {
      case 'critical':
        primaryRecommendation = 'emergency';
        break;
      case 'high':
        primaryRecommendation = 'professional';
        break;
      case 'medium':
        primaryRecommendation = 'volunteer';
        break;
      default:
        primaryRecommendation = 'peer';
    }
    
    // Adjust based on preferences
    if (userPreferences?.preferredSupport && moodAnalysis.riskLevel !== 'critical') {
      primaryRecommendation = userPreferences.preferredSupport;
    }
    
    const alternatives = this.getAlternativeSupport(primaryRecommendation);
    const reasoning = this.explainRecommendation(moodAnalysis, primaryRecommendation);
    
    return {
      primaryRecommendation,
      alternatives,
      reasoning,
    };
  }

  /**
   * Generate personalized coping strategies
   */
  async generateCopingStrategies(
    emotions: MoodAnalysis['emotions'],
    context?: string
  ): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  }> {
    const strategies = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
    };
    
    // Immediate strategies based on dominant emotion
    const dominantEmotion = this.getDominantEmotion(emotions);
    
    switch (dominantEmotion) {
      case 'anxiety':
        strategies.immediate = [
          'Take 5 deep breaths (4 counts in, hold 4, out 4)',
          'Name 5 things you can see, 4 you can touch, 3 you can hear',
          'Progressive muscle relaxation starting from your toes',
        ];
        strategies.shortTerm = [
          'Daily 10-minute meditation practice',
          'Regular exercise routine',
          'Journaling worry thoughts',
        ];
        strategies.longTerm = [
          'Cognitive behavioral therapy techniques',
          'Lifestyle modifications for stress reduction',
          'Building a support network',
        ];
        break;
        
      case 'sadness':
        strategies.immediate = [
          'Connect with a trusted friend or family member',
          'Engage in a comforting activity',
          'Practice self-compassion statements',
        ];
        strategies.shortTerm = [
          'Daily gratitude practice',
          'Regular physical activity',
          'Engaging in meaningful activities',
        ];
        strategies.longTerm = [
          'Exploring underlying causes with a therapist',
          'Building resilience through mindfulness',
          'Developing healthy coping mechanisms',
        ];
        break;
        
      // Add more emotion-specific strategies
      default:
        strategies.immediate = [
          'Ground yourself in the present moment',
          'Practice deep breathing',
          'Reach out for support',
        ];
    }
    
    return strategies;
  }

  // Private helper methods
  private async generateContent(prompt: string): Promise<any> {
    // In production, call actual Gemini API
    // For now, return mock response
    return {};
  }

  private performLocalAnalysis(text: string): MoodAnalysis {
    const crisis = this.detectCrisis(text);
    const emotions = this.analyzeEmotions(text);
    
    let mood: MoodAnalysis['mood'] = 'neutral';
    let riskLevel: MoodAnalysis['riskLevel'] = 'none';
    
    if (crisis.urgencyLevel >= 8) {
      mood = 'crisis';
      riskLevel = 'critical';
    } else if (crisis.urgencyLevel >= 5) {
      mood = 'negative';
      riskLevel = 'high';
    } else if (emotions.sadness > 0.6 || emotions.anxiety > 0.6) {
      mood = 'negative';
      riskLevel = 'medium';
    } else if (emotions.hope > 0.5 || emotions.joy > 0.5) {
      mood = 'positive';
      riskLevel = 'none';
    }
    
    return {
      mood,
      score: this.calculateMoodScore(emotions),
      emotions,
      riskLevel,
      keywords: crisis.triggers,
      recommendations: this.getRecommendations(riskLevel),
    };
  }

  private analyzeEmotions(text: string): MoodAnalysis['emotions'] {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based emotion detection
    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing'],
      sadness: ['sad', 'depressed', 'down', 'blue', 'crying', 'tears'],
      anger: ['angry', 'mad', 'furious', 'rage', 'hate', 'frustrated'],
      fear: ['scared', 'afraid', 'terrified', 'frightened', 'panic'],
      anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'],
      hope: ['hope', 'optimistic', 'better', 'improve', 'looking forward'],
    };
    
    const emotions: MoodAnalysis['emotions'] = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      anxiety: 0,
      hope: 0,
    };
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          emotions[emotion as keyof typeof emotions] = Math.min(
            emotions[emotion as keyof typeof emotions] + 0.3,
            1
          );
        }
      });
    });
    
    return emotions;
  }

  private calculateMoodScore(emotions: MoodAnalysis['emotions']): number {
    const positiveScore = (emotions.joy + emotions.hope) / 2;
    const negativeScore = (emotions.sadness + emotions.anger + emotions.fear + emotions.anxiety) / 4;
    return Math.max(-1, Math.min(1, positiveScore - negativeScore));
  }

  private getDominantEmotion(emotions: MoodAnalysis['emotions']): string {
    let maxEmotion = 'neutral';
    let maxValue = 0;
    
    Object.entries(emotions).forEach(([emotion, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxEmotion = emotion;
      }
    });
    
    return maxEmotion;
  }

  private getTemplateResponse(
    userMessage: string,
    style: 'cognitive' | 'supportive' | 'solution-focused'
  ): TherapistResponse {
    const templates = {
      supportive: {
        message: "I hear that you're going through a difficult time. Your feelings are valid, and it takes courage to reach out for support. You're not alone in this.",
        followUpQuestions: [
          "How long have you been feeling this way?",
          "What support systems do you currently have in place?",
          "What has helped you cope in the past?"
        ],
        resources: [
          "Crisis Text Line: Text HOME to 741741",
          "National Suicide Prevention Lifeline: 988",
          "SAMHSA National Helpline: 1-800-662-4357"
        ],
        techniques: [
          "Deep breathing exercises",
          "Grounding techniques (5-4-3-2-1 method)",
          "Progressive muscle relaxation"
        ]
      },
      cognitive: {
        message: "I understand you're experiencing challenging thoughts. Let's work together to examine these thoughts and find more balanced perspectives.",
        followUpQuestions: [
          "What specific thoughts are troubling you most?",
          "What evidence supports or contradicts these thoughts?",
          "How would you advise a friend in this situation?"
        ],
        resources: [
          "Cognitive Restructuring Worksheet",
          "Thought Record Template",
          "CBT Self-Help Resources"
        ],
        techniques: [
          "Thought challenging",
          "Cognitive reframing",
          "Evidence examination"
        ]
      },
      'solution-focused': {
        message: "I appreciate you sharing this with me. Let's focus on finding practical steps that can help improve your situation.",
        followUpQuestions: [
          "What would need to change for things to feel better?",
          "What small step could you take today?",
          "When have you successfully handled similar challenges?"
        ],
        resources: [
          "Goal-Setting Worksheet",
          "Problem-Solving Template",
          "Action Planning Guide"
        ],
        techniques: [
          "SMART goal setting",
          "Solution brainstorming",
          "Scaling questions"
        ]
      }
    };
    
    return templates[style];
  }

  private getAlternativeSupport(primary: string): string[] {
    const alternatives = {
      emergency: ['Call 911', 'Go to nearest ER', 'Call 988'],
      professional: ['Licensed therapist', 'Psychiatrist', 'Crisis counselor'],
      volunteer: ['Trained peer support', 'Support groups', 'Crisis chat'],
      peer: ['Community forum', 'Support groups', 'Volunteer counselor'],
    };
    
    return alternatives[primary as keyof typeof alternatives] || [];
  }

  private getRecommendations(riskLevel: string): string[] {
    const recommendations = {
      critical: [
        'Immediate professional intervention required',
        'Contact emergency services if in danger',
        'Stay with someone trusted',
      ],
      high: [
        'Connect with crisis counselor',
        'Schedule urgent therapy appointment',
        'Create safety plan',
      ],
      medium: [
        'Regular check-ins with support system',
        'Consider therapy or counseling',
        'Practice self-care routines',
      ],
      low: [
        'Monitor mood patterns',
        'Maintain healthy routines',
        'Build coping skills',
      ],
      none: [
        'Continue positive practices',
        'Stay connected with support network',
        'Practice preventive self-care',
      ],
    };
    
    return recommendations[riskLevel as keyof typeof recommendations] || recommendations.none;
  }

  private explainRecommendation(analysis: MoodAnalysis, recommendation: string): string {
    const explanations = {
      emergency: `Based on critical risk indicators, immediate professional intervention is essential for your safety.`,
      professional: `Your current emotional state suggests that professional support would be most beneficial for addressing complex needs.`,
      volunteer: `A trained volunteer can provide the supportive listening and guidance that matches your current needs.`,
      peer: `Connecting with peers who understand your experience can provide valuable support and community.`,
    };
    
    return explanations[recommendation as keyof typeof explanations] || 
           'Support recommendation based on your current needs.';
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export type { MoodAnalysis, TherapistResponse };