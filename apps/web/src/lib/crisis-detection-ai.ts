/**
 * Advanced Crisis Detection AI System
 * 
 * Real-time risk assessment for mental health crisis intervention
 * Uses multiple indicators and machine learning patterns to detect
 * suicidal ideation, self-harm risk, and immediate safety concerns
 */

export interface CrisisRiskIndicator {
  type: 'linguistic' | 'behavioral' | 'temporal' | 'contextual';
  indicator: string;
  weight: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface CrisisAssessment {
  riskScore: number; // 0-10 scale
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  immediateIntervention: boolean;
  triggeredIndicators: CrisisRiskIndicator[];
  confidence: number; // 0-1 confidence in assessment
  recommendations: string[];
  emergencyContacts: string[];
  timestamp: Date;
  sessionContext?: {
    duration: number;
    previousSessions: number;
    moodTrend: 'declining' | 'stable' | 'improving';
  };
}

export interface CrisisInterventionAction {
  type: 'immediate' | 'urgent' | 'followup' | 'monitoring';
  action: string;
  priority: number;
  timeframe: string;
  resources: string[];
}

// Comprehensive crisis indicators based on clinical research
const CRISIS_INDICATORS: CrisisRiskIndicator[] = [
  // CRITICAL LINGUISTIC INDICATORS (Suicidal Ideation)
  {
    type: 'linguistic',
    indicator: 'kill myself|suicide|end my life|take my own life|don\'t want to live',
    weight: 10,
    severity: 'critical',
    description: 'Direct suicidal ideation expressed'
  },
  {
    type: 'linguistic',
    indicator: 'better off dead|wish I was dead|want to die|ready to die',
    weight: 9,
    severity: 'critical',
    description: 'Death wishes and suicidal thoughts'
  },
  {
    type: 'linguistic',
    indicator: 'planning to|going to hurt myself|have a plan|pills|gun|bridge|rope',
    weight: 10,
    severity: 'critical',
    description: 'Suicide planning or method identification'
  },

  // HIGH RISK INDICATORS (Self-harm and Crisis)
  {
    type: 'linguistic',
    indicator: 'hurt myself|cut myself|self harm|burning myself|hitting myself',
    weight: 8,
    severity: 'high',
    description: 'Self-harm behaviors or intentions'
  },
  {
    type: 'linguistic',
    indicator: 'can\'t take it anymore|too much pain|unbearable|can\'t go on',
    weight: 7,
    severity: 'high',
    description: 'Overwhelming distress and inability to cope'
  },
  {
    type: 'linguistic',
    indicator: 'no way out|trapped|hopeless|pointless|meaningless|empty inside',
    weight: 6,
    severity: 'high',
    description: 'Hopelessness and entrapment'
  },
  {
    type: 'linguistic',
    indicator: 'everyone would be better|burden|waste of space|worthless|useless',
    weight: 6,
    severity: 'high',
    description: 'Feelings of being a burden or worthless'
  },

  // MEDIUM RISK INDICATORS
  {
    type: 'linguistic',
    indicator: 'giving up|can\'t handle|falling apart|breaking down|lost control',
    weight: 5,
    severity: 'medium',
    description: 'Loss of control and coping breakdown'
  },
  {
    type: 'linguistic',
    indicator: 'alone|isolated|nobody cares|nobody understands|abandoned',
    weight: 4,
    severity: 'medium',
    description: 'Social isolation and loneliness'
  },
  {
    type: 'linguistic',
    indicator: 'scared|terrified|panic|anxiety attack|can\'t breathe',
    weight: 4,
    severity: 'medium',
    description: 'Acute anxiety and panic symptoms'
  },

  // BEHAVIORAL INDICATORS
  {
    type: 'behavioral',
    indicator: 'sudden_mood_change',
    weight: 5,
    severity: 'medium',
    description: 'Sudden dramatic mood changes during session'
  },
  {
    type: 'behavioral',
    indicator: 'repeated_crisis_contacts',
    weight: 6,
    severity: 'high',
    description: 'Multiple crisis contacts within short timeframe'
  },
  {
    type: 'behavioral',
    indicator: 'session_abrupt_end',
    weight: 7,
    severity: 'high',
    description: 'Abruptly ending sessions after expressing distress'
  },

  // TEMPORAL INDICATORS
  {
    type: 'temporal',
    indicator: 'late_night_crisis',
    weight: 4,
    severity: 'medium',
    description: 'Crisis contact during vulnerable hours (10PM-6AM)'
  },
  {
    type: 'temporal',
    indicator: 'anniversary_date',
    weight: 5,
    severity: 'medium',
    description: 'Contact near anniversary of traumatic event'
  },

  // CONTEXTUAL INDICATORS
  {
    type: 'contextual',
    indicator: 'recent_loss',
    weight: 6,
    severity: 'high',
    description: 'Recent loss of relationship, job, or loved one'
  },
  {
    type: 'contextual',
    indicator: 'substance_use',
    weight: 5,
    severity: 'medium',
    description: 'Current substance use mentioned'
  }
];

// Protective factors that reduce risk
const PROTECTIVE_FACTORS: { indicator: string; weight: number; description: string }[] = [
  {
    indicator: 'support system|family|friends|therapist|counselor',
    weight: -2,
    description: 'Strong support network present'
  },
  {
    indicator: 'treatment|medication|therapy|getting help|seeing doctor',
    weight: -2,
    description: 'Currently engaged in treatment'
  },
  {
    indicator: 'future plans|tomorrow|next week|looking forward|goals',
    weight: -3,
    description: 'Future orientation and planning'
  },
  {
    indicator: 'children|kids|pets|responsible for|taking care of',
    weight: -4,
    description: 'Caregiving responsibilities'
  },
  {
    indicator: 'reasons to live|hope|getting better|improving|recovery',
    weight: -3,
    description: 'Hope and reasons for living'
  }
];

export class CrisisDetectionAI {
  private sessionHistory: Map<string, any[]> = new Map();
  private userProfiles: Map<string, any> = new Map();

  /**
   * Perform comprehensive crisis risk assessment
   */
  public async assessCrisisRisk(
    input: string,
    userId: string,
    sessionContext?: any
  ): Promise<CrisisAssessment> {
    const assessment: CrisisAssessment = {
      riskScore: 0,
      riskLevel: 'low',
      immediateIntervention: false,
      triggeredIndicators: [],
      confidence: 0,
      recommendations: [],
      emergencyContacts: [],
      timestamp: new Date(),
      sessionContext
    };

    // Normalize input for analysis
    const normalizedInput = this.normalizeInput(input);

    // Analyze linguistic indicators
    const linguisticRisk = this.analyzeLinguisticIndicators(normalizedInput);
    assessment.triggeredIndicators.push(...linguisticRisk.indicators);
    assessment.riskScore += linguisticRisk.score;

    // Analyze protective factors
    const protectiveFactors = this.analyzeProtectiveFactors(normalizedInput);
    assessment.riskScore += protectiveFactors.score; // This will be negative, reducing risk

    // Analyze behavioral patterns
    const behavioralRisk = this.analyzeBehavioralPatterns(userId, sessionContext);
    assessment.riskScore += behavioralRisk.score;
    assessment.triggeredIndicators.push(...behavioralRisk.indicators);

    // Analyze temporal factors
    const temporalRisk = this.analyzeTemporalFactors();
    assessment.riskScore += temporalRisk.score;
    assessment.triggeredIndicators.push(...temporalRisk.indicators);

    // Calculate final risk level
    assessment.riskScore = Math.max(0, Math.min(10, assessment.riskScore));
    assessment.riskLevel = this.calculateRiskLevel(assessment.riskScore);
    assessment.immediateIntervention = assessment.riskScore >= 8;

    // Calculate confidence based on number and quality of indicators
    assessment.confidence = this.calculateConfidence(assessment.triggeredIndicators);

    // Generate recommendations
    assessment.recommendations = this.generateRecommendations(assessment);

    // Add emergency contacts for high-risk cases
    if (assessment.riskScore >= 6) {
      assessment.emergencyContacts = this.getEmergencyContacts();
    }

    // Store assessment for pattern analysis
    this.storeAssessment(userId, assessment);

    return assessment;
  }

  /**
   * Generate immediate intervention actions based on risk assessment
   */
  public generateInterventionActions(assessment: CrisisAssessment): CrisisInterventionAction[] {
    const actions: CrisisInterventionAction[] = [];

    if (assessment.immediateIntervention || assessment.riskScore >= 8) {
      // Critical risk - immediate action required
      actions.push({
        type: 'immediate',
        action: 'Connect to crisis counselor immediately',
        priority: 1,
        timeframe: 'Now',
        resources: ['988 Suicide & Crisis Lifeline', 'Crisis Chat', 'Emergency Services']
      });

      actions.push({
        type: 'immediate',
        action: 'Initiate safety planning protocol',
        priority: 2,
        timeframe: 'Within 5 minutes',
        resources: ['Safety Plan Creator', 'Crisis Support Team']
      });

      actions.push({
        type: 'immediate',
        action: 'Alert designated emergency contacts',
        priority: 3,
        timeframe: 'Within 10 minutes',
        resources: ['Emergency Contact System', 'Family/Friend Network']
      });
    } else if (assessment.riskScore >= 6) {
      // High risk - urgent action needed
      actions.push({
        type: 'urgent',
        action: 'Schedule crisis counseling session',
        priority: 1,
        timeframe: 'Within 1 hour',
        resources: ['Crisis Counselors', 'AI Therapy Escalation']
      });

      actions.push({
        type: 'urgent',
        action: 'Provide coping strategies and resources',
        priority: 2,
        timeframe: 'Immediately',
        resources: ['Coping Toolbox', 'Grounding Techniques', 'Crisis Resources']
      });
    } else if (assessment.riskScore >= 4) {
      // Medium risk - follow-up needed
      actions.push({
        type: 'followup',
        action: 'Schedule check-in within 24 hours',
        priority: 1,
        timeframe: 'Within 24 hours',
        resources: ['AI Therapy Check-in', 'Peer Support']
      });

      actions.push({
        type: 'followup',
        action: 'Provide self-help resources',
        priority: 2,
        timeframe: 'Immediately',
        resources: ['Self-Help Hub', 'Mood Tracking', 'Wellness Tools']
      });
    } else {
      // Low risk - monitoring
      actions.push({
        type: 'monitoring',
        action: 'Continue regular support',
        priority: 1,
        timeframe: 'Ongoing',
        resources: ['AI Therapy', 'Peer Support', 'Self-Help Tools']
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  private normalizeInput(input: string): string {
    return input.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private analyzeLinguisticIndicators(input: string): { score: number; indicators: CrisisRiskIndicator[] } {
    let score = 0;
    const triggeredIndicators: CrisisRiskIndicator[] = [];

    for (const indicator of CRISIS_INDICATORS.filter(i => i.type === 'linguistic')) {
      const regex = new RegExp(indicator.indicator, 'i');
      if (regex.test(input)) {
        score += indicator.weight;
        triggeredIndicators.push(indicator);
      }
    }

    return { score, indicators: triggeredIndicators };
  }

  private analyzeProtectiveFactors(input: string): { score: number } {
    let score = 0;

    for (const factor of PROTECTIVE_FACTORS) {
      const regex = new RegExp(factor.indicator, 'i');
      if (regex.test(input)) {
        score += factor.weight; // Negative weights reduce risk
      }
    }

    return { score };
  }

  private analyzeBehavioralPatterns(userId: string, sessionContext?: any): { score: number; indicators: CrisisRiskIndicator[] } {
    let score = 0;
    const indicators: CrisisRiskIndicator[] = [];

    // Analyze session patterns
    if (sessionContext) {
      // Multiple crisis contacts in short timeframe
      const recentSessions = this.getRecentSessions(userId, 24); // Last 24 hours
      if (recentSessions.length >= 3) {
        score += 6;
        indicators.push(CRISIS_INDICATORS.find(i => i.indicator === 'repeated_crisis_contacts')!);
      }

      // Declining mood trend
      if (sessionContext.moodTrend === 'declining') {
        score += 3;
      }

      // Very short sessions (possible avoidance)
      if (sessionContext.duration < 300) { // Less than 5 minutes
        score += 2;
      }
    }

    return { score, indicators };
  }

  private analyzeTemporalFactors(): { score: number; indicators: CrisisRiskIndicator[] } {
    let score = 0;
    const indicators: CrisisRiskIndicator[] = [];

    const currentTime = new Date();
    const hour = currentTime.getHours();

    // Late night/early morning vulnerability
    if (hour >= 22 || hour <= 6) {
      score += 4;
      indicators.push(CRISIS_INDICATORS.find(i => i.indicator === 'late_night_crisis')!);
    }

    return { score, indicators };
  }

  private calculateRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  private calculateConfidence(indicators: CrisisRiskIndicator[]): number {
    if (indicators.length === 0) return 0.1;
    
    // Higher confidence with more indicators and critical indicators
    const criticalCount = indicators.filter(i => i.severity === 'critical').length;
    const highCount = indicators.filter(i => i.severity === 'high').length;
    
    const baseConfidence = Math.min(0.9, 0.3 + (indicators.length * 0.1));
    const severityBonus = (criticalCount * 0.2) + (highCount * 0.1);
    
    return Math.min(0.95, baseConfidence + severityBonus);
  }

  private generateRecommendations(assessment: CrisisAssessment): string[] {
    const recommendations: string[] = [];

    if (assessment.riskScore >= 8) {
      recommendations.push('Contact emergency services or call 988 immediately');
      recommendations.push('Do not leave the person alone');
      recommendations.push('Remove any potential means of self-harm');
      recommendations.push('Stay with the person until professional help arrives');
    } else if (assessment.riskScore >= 6) {
      recommendations.push('Connect with a crisis counselor within the hour');
      recommendations.push('Develop or review safety plan');
      recommendations.push('Contact trusted support person');
      recommendations.push('Remove any immediate risk factors from environment');
    } else if (assessment.riskScore >= 4) {
      recommendations.push('Schedule follow-up within 24 hours');
      recommendations.push('Practice grounding and coping techniques');
      recommendations.push('Reach out to support network');
      recommendations.push('Monitor mood and safety closely');
    } else {
      recommendations.push('Continue with regular support and therapy');
      recommendations.push('Practice self-care and wellness activities');
      recommendations.push('Stay connected with support network');
    }

    return recommendations;
  }

  private getEmergencyContacts(): string[] {
    return [
      '988 - Suicide & Crisis Lifeline',
      '911 - Emergency Services',
      'Crisis Text Line: Text HOME to 741741',
      'SAMHSA National Helpline: 1-800-662-4357',
      'Veterans Crisis Line: 1-800-273-8255, Press 1',
      'Trans Lifeline: 877-565-8860',
      'Trevor Project (LGBTQ): 1-866-488-7386'
    ];
  }

  private getRecentSessions(userId: string, hours: number): any[] {
    const userSessions = this.sessionHistory.get(userId) || [];
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    return userSessions.filter(session => 
      new Date(session.timestamp) > cutoffTime
    );
  }

  private storeAssessment(userId: string, assessment: CrisisAssessment): void {
    const userSessions = this.sessionHistory.get(userId) || [];
    userSessions.push({
      timestamp: assessment.timestamp,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      indicators: assessment.triggeredIndicators.length
    });
    
    // Keep only last 100 sessions per user
    if (userSessions.length > 100) {
      userSessions.splice(0, userSessions.length - 100);
    }
    
    this.sessionHistory.set(userId, userSessions);
  }

  /**
   * Get risk trend for a user over time
   */
  public getRiskTrend(userId: string, days: number = 7): 'increasing' | 'stable' | 'decreasing' {
    const userSessions = this.sessionHistory.get(userId) || [];
    const cutoffTime = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const recentSessions = userSessions.filter(session => 
      new Date(session.timestamp) > cutoffTime
    );

    if (recentSessions.length < 3) return 'stable';

    // Calculate trend in risk scores
    const scores = recentSessions.map(s => s.riskScore);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 1) return 'increasing';
    if (difference < -1) return 'decreasing';
    return 'stable';
  }
}

// Singleton instance
export const crisisDetectionAI = new CrisisDetectionAI();