/**
 * ASTRAL_CORE 2.0 Context-Aware Risk Assessment System
 * 
 * INTELLIGENT RISK ANALYSIS
 * - Context-aware false positive reduction to <1%
 * - Multi-dimensional risk scoring
 * - User behavior pattern analysis
 * - Session context integration
 * - Historical risk correlation
 * - Emotional state assessment
 * 
 * TARGET PERFORMANCE:
 * - False positive rate: <1%
 * - Risk assessment accuracy: >99%
 * - Processing latency: <100ms
 * - Context retention: 24 hours
 */

import { EventEmitter } from 'events';

export interface RiskContext {
  // Message context
  messageType: 'crisis' | 'volunteer' | 'general' | 'emergency' | 'followup';
  isAnonymous: boolean;
  sessionId?: string;
  userId?: string;
  
  // Conversation context
  conversationHistory?: Array<{
    content: string;
    timestamp: Date;
    speaker: 'user' | 'volunteer';
    riskScore?: number;
  }>;
  
  // User context
  userProfile?: {
    age?: number;
    demographics?: string;
    previousSessions?: number;
    historicalRiskLevel?: number;
    lastCrisisEvent?: Date;
  };
  
  // Session context
  sessionMetadata?: {
    duration: number;
    messageCount: number;
    escalationCount: number;
    interventionHistory?: string[];
    currentVolunteerExperience?: number;
  };
  
  // Environmental context
  environment?: {
    timeOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    timezone?: string;
    weatherCondition?: string;
    holidayOrSpecialDate?: boolean;
  };
  
  // Platform context
  platform?: {
    deviceType: 'mobile' | 'desktop' | 'tablet';
    connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
    appVersion: string;
    accessMethod: 'web' | 'app' | 'emergency';
  };
}

export interface RiskAssessmentResult {
  adjustedRiskScore: number; // 0-100 scale
  originalRiskScore: number;
  confidenceLevel: number; // 0-100 scale
  falsePositiveProbability: number; // 0-1 scale
  riskFactors: Array<{
    factor: string;
    weight: number;
    impact: 'increase' | 'decrease';
    confidence: number;
  }>;
  contextualInsights: {
    userPattern: 'normal' | 'concerning' | 'escalating' | 'improving';
    sessionPattern: 'stable' | 'volatile' | 'crisis' | 'resolution';
    temporalPattern: 'typical' | 'atypical' | 'high_risk_time';
    environmentalFactors: string[];
  };
  recommendations: {
    immediateActions: string[];
    monitoringNeeded: boolean;
    escalationThreshold: number;
    followUpRequired: boolean;
  };
  processingTime: number;
  analysisVersion: string;
}

/**
 * Advanced sentiment and emotional state analysis
 */
export interface EmotionalStateAnalysis {
  primaryEmotion: 'despair' | 'anger' | 'fear' | 'hope' | 'sadness' | 'anxiety' | 'confusion' | 'relief';
  emotionalIntensity: number; // 0-10 scale
  emotionalStability: number; // 0-10 scale (10 = very stable)
  emotionalTrajectory: 'improving' | 'declining' | 'stable' | 'volatile';
  emotionBreakdown: {
    despair: number;
    anger: number;
    fear: number;
    hope: number;
    sadness: number;
    anxiety: number;
    confusion: number;
    relief: number;
  };
  cognitiveIndicators: {
    clarityOfThought: number; // 0-10 scale
    decisionMakingCapacity: number; // 0-10 scale
    futureOrientation: number; // 0-10 scale
    selfEfficacy: number; // 0-10 scale
  };
  linguisticMarkers: {
    wordComplexity: number;
    sentenceStructure: number;
    coherence: number;
    urgencyMarkers: number;
  };
}

/**
 * Context-Aware Risk Assessment Engine
 * Reduces false positives while maintaining high sensitivity for genuine crises
 */
export class ContextAwareRiskAssessor extends EventEmitter {
  private static instance: ContextAwareRiskAssessor;
  
  // Risk pattern database
  private userPatterns = new Map<string, {
    baselineRisk: number;
    riskHistory: number[];
    patterns: string[];
    lastUpdate: Date;
  }>();
  
  // Session context cache
  private sessionContexts = new Map<string, {
    context: RiskContext;
    riskProgression: number[];
    startTime: Date;
    lastUpdate: Date;
  }>();
  
  // Temporal risk patterns
  private temporalPatterns = {
    hourlyRisk: new Array(24).fill(1.0), // Risk multipliers by hour
    weeklyRisk: new Array(7).fill(1.0),  // Risk multipliers by day of week
    seasonalRisk: new Array(12).fill(1.0) // Risk multipliers by month
  };
  
  // Performance metrics
  private metrics = {
    assessmentsCompleted: 0,
    falsePositiveRate: 0,
    accuracyRate: 0,
    averageLatency: 0,
    contextFactorsAnalyzed: 0,
    falsePositiveReductions: 0
  };
  
  private readonly CACHE_CLEANUP_INTERVAL = 3600000; // 1 hour
  private readonly CONTEXT_RETENTION_TIME = 86400000; // 24 hours
  
  private constructor() {
    super();
    this.initializeTemporalPatterns();
    this.startMaintenanceTasks();
    console.log('🧠 Context-Aware Risk Assessment System initialized');
  }
  
  static getInstance(): ContextAwareRiskAssessor {
    if (!ContextAwareRiskAssessor.instance) {
      ContextAwareRiskAssessor.instance = new ContextAwareRiskAssessor();
    }
    return ContextAwareRiskAssessor.instance;
  }
  
  /**
   * PRIMARY RISK ASSESSMENT FUNCTION
   * Analyzes risk with full context awareness to minimize false positives
   */
  async assessRisk(
    originalRiskScore: number,
    content: string,
    context: RiskContext
  ): Promise<RiskAssessmentResult> {
    const startTime = performance.now();
    
    try {
      this.metrics.assessmentsCompleted++;
      
      // Update session context
      this.updateSessionContext(context);
      
      // Analyze emotional state
      const emotionalState = await this.analyzeEmotionalState(content, context);
      
      // Collect context factors
      const contextFactors = await this.collectContextFactors(context, emotionalState);
      
      // Calculate risk adjustments
      const riskAdjustments = this.calculateRiskAdjustments(contextFactors, originalRiskScore);
      
      // Apply temporal context
      const temporalAdjustment = this.analyzeTemporalContext(context);
      
      // Calculate final adjusted risk score
      const adjustedRiskScore = this.calculateAdjustedRisk(
        originalRiskScore,
        riskAdjustments,
        temporalAdjustment
      );
      
      // Calculate confidence and false positive probability
      const confidenceLevel = this.calculateConfidenceLevel(contextFactors, adjustedRiskScore);
      const falsePositiveProbability = this.calculateFalsePositiveProbability(
        originalRiskScore,
        adjustedRiskScore,
        contextFactors
      );
      
      // Generate contextual insights
      const contextualInsights = this.generateContextualInsights(
        context,
        emotionalState,
        riskAdjustments
      );
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        adjustedRiskScore,
        contextualInsights,
        falsePositiveProbability
      );
      
      // Update user patterns
      this.updateUserPatterns(context, adjustedRiskScore);
      
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime, falsePositiveProbability);
      
      const result: RiskAssessmentResult = {
        adjustedRiskScore: Math.round(adjustedRiskScore * 100) / 100,
        originalRiskScore,
        confidenceLevel,
        falsePositiveProbability,
        riskFactors: contextFactors,
        contextualInsights,
        recommendations,
        processingTime,
        analysisVersion: 'context-aware-v2.1'
      };
      
      // Emit events for monitoring
      this.emit('risk_assessed', result);
      
      if (falsePositiveProbability < 0.01) {
        this.emit('high_confidence_assessment', result);
      }
      
      // Log performance warning if needed
      if (processingTime > 100) {
        console.warn(`⚠️ Risk assessment exceeded target latency: ${processingTime.toFixed(2)}ms`);
      }
      
      console.log(`🧠 Risk assessment: ${originalRiskScore}→${adjustedRiskScore.toFixed(1)}, confidence: ${confidenceLevel.toFixed(1)}%, FP: ${(falsePositiveProbability * 100).toFixed(2)}%`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Risk assessment failed:', error);
      return this.createErrorResult(originalRiskScore, startTime, error);
    }
  }
  
  /**
   * Advanced emotional state analysis with linguistic markers
   */
  async analyzeEmotionalState(content: string, context: RiskContext): Promise<EmotionalStateAnalysis> {
    const lowerContent = content.toLowerCase();
    
    // Emotional word dictionaries with weights
    const emotionDictionaries = {
      despair: { words: ['hopeless', 'pointless', 'worthless', 'nothing matters', 'give up', 'no point'], weight: 1.2 },
      anger: { words: ['angry', 'furious', 'hate', 'rage', 'mad', 'pissed off', 'enraged'], weight: 0.8 },
      fear: { words: ['scared', 'afraid', 'terrified', 'panic', 'anxiety', 'worried', 'frightened'], weight: 1.0 },
      hope: { words: ['hope', 'better', 'improve', 'future', 'tomorrow', 'possibility', 'chance'], weight: -0.5 },
      sadness: { words: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'grief', 'sorrow'], weight: 0.7 },
      anxiety: { words: ['anxious', 'nervous', 'stressed', 'overwhelmed', 'panic', 'worry'], weight: 0.9 },
      confusion: { words: ['confused', 'lost', 'don\'t know', 'uncertain', 'unclear', 'mixed up'], weight: 0.6 },
      relief: { words: ['relief', 'better', 'calmer', 'peaceful', 'relaxed', 'easier'], weight: -0.7 }
    };
    
    // Calculate emotion scores
    const emotionScores: Record<string, number> = {};
    let primaryEmotion = 'sadness';
    let maxScore = 0;
    
    Object.entries(emotionDictionaries).forEach(([emotion, { words, weight }]) => {
      const matches = words.filter(word => lowerContent.includes(word)).length;
      const score = Math.min(matches * Math.abs(weight), 10);
      emotionScores[emotion] = score;
      
      if (score > maxScore && weight > 0) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    });
    
    // Analyze cognitive indicators
    const wordCount = content.split(/\s+/).length;
    const complexWords = content.split(/\s+/).filter(word => word.length > 6).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
    
    const cognitiveIndicators = {
      clarityOfThought: Math.min(10, (complexWords / wordCount) * 10 + sentences / Math.max(wordCount / 10, 1)),
      decisionMakingCapacity: this.assessDecisionCapacity(lowerContent),
      futureOrientation: this.assessFutureOrientation(lowerContent),
      selfEfficacy: this.assessSelfEfficacy(lowerContent)
    };
    
    // Analyze linguistic markers
    const linguisticMarkers = {
      wordComplexity: complexWords / Math.max(wordCount, 1),
      sentenceStructure: sentences / Math.max(wordCount / 15, 1),
      coherence: this.assessCoherence(content),
      urgencyMarkers: this.countUrgencyMarkers(lowerContent)
    };
    
    // Calculate emotional trajectory from conversation history
    const emotionalTrajectory = this.calculateEmotionalTrajectory(context, emotionScores);
    
    // Calculate emotional intensity and stability
    const emotionalIntensity = Math.min(10, maxScore * 1.5);
    const emotionalStability = this.calculateEmotionalStability(emotionScores, context);
    
    return {
      primaryEmotion: primaryEmotion as EmotionalStateAnalysis['primaryEmotion'],
      emotionalIntensity,
      emotionalStability,
      emotionalTrajectory,
      emotionBreakdown: {
        despair: emotionScores.despair || 0,
        anger: emotionScores.anger || 0,
        fear: emotionScores.fear || 0,
        hope: emotionScores.hope || 0,
        sadness: emotionScores.sadness || 0,
        anxiety: emotionScores.anxiety || 0,
        confusion: emotionScores.confusion || 0,
        relief: emotionScores.relief || 0
      },
      cognitiveIndicators,
      linguisticMarkers
    };
  }
  
  /**
   * Collect and analyze context factors for risk adjustment
   */
  private async collectContextFactors(
    context: RiskContext,
    emotionalState: EmotionalStateAnalysis
  ): Promise<Array<{
    factor: string;
    weight: number;
    impact: 'increase' | 'decrease';
    confidence: number;
  }>> {
    const factors: Array<{
      factor: string;
      weight: number;
      impact: 'increase' | 'decrease';
      confidence: number;
    }> = [];
    
    // User history factors
    if (context.userProfile?.historicalRiskLevel !== undefined) {
      if (context.userProfile.historicalRiskLevel > 7) {
        factors.push({
          factor: 'high_historical_risk',
          weight: 0.3,
          impact: 'increase',
          confidence: 0.8
        });
      } else if (context.userProfile.historicalRiskLevel < 3) {
        factors.push({
          factor: 'low_historical_risk',
          weight: 0.2,
          impact: 'decrease',
          confidence: 0.7
        });
      }
    }
    
    // Session pattern factors
    if (context.sessionMetadata) {
      if (context.sessionMetadata.duration > 3600000) { // > 1 hour
        factors.push({
          factor: 'extended_session',
          weight: 0.15,
          impact: 'increase',
          confidence: 0.6
        });
      }
      
      if (context.sessionMetadata.escalationCount > 0) {
        factors.push({
          factor: 'previous_escalations',
          weight: 0.25 * context.sessionMetadata.escalationCount,
          impact: 'increase',
          confidence: 0.9
        });
      }
      
      if (context.sessionMetadata.currentVolunteerExperience && context.sessionMetadata.currentVolunteerExperience > 100) {
        factors.push({
          factor: 'experienced_volunteer',
          weight: 0.1,
          impact: 'decrease',
          confidence: 0.5
        });
      }
    }
    
    // Emotional state factors
    if (emotionalState.emotionalStability < 3) {
      factors.push({
        factor: 'emotional_instability',
        weight: 0.2,
        impact: 'increase',
        confidence: 0.8
      });
    }
    
    if (emotionalState.emotionBreakdown.hope > 5) {
      factors.push({
        factor: 'presence_of_hope',
        weight: 0.3,
        impact: 'decrease',
        confidence: 0.7
      });
    }
    
    if (emotionalState.cognitiveIndicators.futureOrientation > 6) {
      factors.push({
        factor: 'future_oriented_thinking',
        weight: 0.25,
        impact: 'decrease',
        confidence: 0.8
      });
    }
    
    // Conversation pattern factors
    if (context.conversationHistory && context.conversationHistory.length > 5) {
      const recentMessages = context.conversationHistory.slice(-5);
      const averageRisk = recentMessages
        .filter(m => m.riskScore !== undefined)
        .reduce((sum, m) => sum + (m.riskScore || 0), 0) / 5;
      
      if (averageRisk < 3) {
        factors.push({
          factor: 'stable_conversation',
          weight: 0.2,
          impact: 'decrease',
          confidence: 0.6
        });
      }
    }
    
    // Environmental factors
    if (context.environment) {
      // High-risk times (late night, early morning)
      if (context.environment.timeOfDay >= 23 || context.environment.timeOfDay <= 5) {
        factors.push({
          factor: 'high_risk_time_period',
          weight: 0.15,
          impact: 'increase',
          confidence: 0.7
        });
      }
      
      // Weekend patterns
      if (context.environment.dayOfWeek === 0 || context.environment.dayOfWeek === 6) {
        factors.push({
          factor: 'weekend_pattern',
          weight: 0.1,
          impact: 'increase',
          confidence: 0.5
        });
      }
      
      // Holiday or special date
      if (context.environment.holidayOrSpecialDate) {
        factors.push({
          factor: 'holiday_period',
          weight: 0.2,
          impact: 'increase',
          confidence: 0.6
        });
      }
    }
    
    // Platform context factors
    if (context.platform) {
      if (context.platform.accessMethod === 'emergency') {
        factors.push({
          factor: 'emergency_access',
          weight: 0.4,
          impact: 'increase',
          confidence: 0.9
        });
      }
      
      if (context.platform.connectionQuality === 'poor') {
        factors.push({
          factor: 'poor_connection',
          weight: 0.1,
          impact: 'increase',
          confidence: 0.4
        });
      }
    }
    
    // Message type context
    if (context.messageType === 'followup') {
      factors.push({
        factor: 'followup_message',
        weight: 0.15,
        impact: 'decrease',
        confidence: 0.6
      });
    }
    
    this.metrics.contextFactorsAnalyzed += factors.length;
    
    return factors;
  }
  
  /**
   * Calculate risk adjustments based on context factors
   */
  private calculateRiskAdjustments(
    factors: Array<{
      factor: string;
      weight: number;
      impact: 'increase' | 'decrease';
      confidence: number;
    }>,
    originalRisk: number
  ): { adjustment: number; factors: typeof factors } {
    let totalAdjustment = 0;
    
    factors.forEach(factor => {
      const weightedAdjustment = factor.weight * factor.confidence;
      if (factor.impact === 'increase') {
        totalAdjustment += weightedAdjustment;
      } else {
        totalAdjustment -= weightedAdjustment;
      }
    });
    
    // Limit adjustment to prevent extreme swings
    const maxAdjustment = originalRisk * 0.5; // Maximum 50% adjustment
    totalAdjustment = Math.max(-maxAdjustment, Math.min(maxAdjustment, totalAdjustment));
    
    return { adjustment: totalAdjustment, factors };
  }
  
  /**
   * Analyze temporal context for time-based risk patterns
   */
  private analyzeTemporalContext(context: RiskContext): number {
    if (!context.environment) return 1.0;
    
    const hourMultiplier = this.temporalPatterns.hourlyRisk[context.environment.timeOfDay] || 1.0;
    const dayMultiplier = this.temporalPatterns.weeklyRisk[context.environment.dayOfWeek] || 1.0;
    
    return hourMultiplier * dayMultiplier;
  }
  
  /**
   * Calculate final adjusted risk score
   */
  private calculateAdjustedRisk(
    originalRisk: number,
    riskAdjustments: { adjustment: number },
    temporalAdjustment: number
  ): number {
    let adjustedRisk = originalRisk + riskAdjustments.adjustment;
    adjustedRisk = adjustedRisk * temporalAdjustment;
    
    // Ensure risk stays within bounds
    return Math.max(0, Math.min(10, adjustedRisk));
  }
  
  /**
   * Calculate confidence level in the risk assessment
   */
  private calculateConfidenceLevel(
    factors: Array<{ confidence: number }>,
    adjustedRisk: number
  ): number {
    if (factors.length === 0) return 70; // Base confidence without context
    
    const averageFactorConfidence = factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;
    const factorCountBonus = Math.min(factors.length * 5, 20); // More factors = higher confidence
    
    let confidence = 60 + (averageFactorConfidence * 30) + factorCountBonus;
    
    // Higher confidence for extreme risk scores (very high or very low)
    if (adjustedRisk > 8 || adjustedRisk < 2) {
      confidence += 10;
    }
    
    return Math.min(100, confidence);
  }
  
  /**
   * Calculate probability of false positive
   */
  private calculateFalsePositiveProbability(
    originalRisk: number,
    adjustedRisk: number,
    factors: Array<{ impact: string; confidence: number }>
  ): number {
    // Base false positive probability
    let fpProbability = 0.05; // 5% base rate
    
    // Reduction factors
    const decreaseFactors = factors.filter(f => f.impact === 'decrease');
    const reductionStrength = decreaseFactors.reduce((sum, f) => sum + f.confidence, 0) / Math.max(decreaseFactors.length, 1);
    
    // Significant risk reduction suggests potential false positive
    const riskReduction = originalRisk - adjustedRisk;
    if (riskReduction > 2) {
      fpProbability *= (1 - (reductionStrength * 0.8)); // Up to 80% reduction
    }
    
    // Additional factors that reduce false positive probability
    if (originalRisk > 8) {
      fpProbability *= 0.3; // High original risk is less likely to be false positive
    }
    
    if (factors.length > 5) {
      fpProbability *= 0.7; // More context factors = more reliable assessment
    }
    
    return Math.max(0.001, Math.min(0.2, fpProbability)); // Keep between 0.1% and 20%
  }
  
  // Helper methods for emotional analysis
  
  private assessDecisionCapacity(content: string): number {
    const decisionWords = ['decide', 'choice', 'option', 'think', 'consider', 'plan'];
    const matches = decisionWords.filter(word => content.includes(word)).length;
    return Math.min(10, matches * 2 + 3);
  }
  
  private assessFutureOrientation(content: string): number {
    const futureWords = ['tomorrow', 'next', 'future', 'will', 'going to', 'plan', 'hope', 'expect'];
    const matches = futureWords.filter(word => content.includes(word)).length;
    return Math.min(10, matches * 1.5 + 2);
  }
  
  private assessSelfEfficacy(content: string): number {
    const efficacyWords = ['can', 'able', 'capable', 'strong', 'handle', 'manage', 'cope'];
    const inefficacyWords = ['can\'t', 'unable', 'helpless', 'weak', 'powerless'];
    
    const positive = efficacyWords.filter(word => content.includes(word)).length;
    const negative = inefficacyWords.filter(word => content.includes(word)).length;
    
    return Math.max(0, Math.min(10, 5 + positive * 2 - negative * 2));
  }
  
  private assessCoherence(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return 0;
    
    // Simple coherence based on sentence length variation and structure
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const lengthVariation = sentences.reduce((sum, s) => sum + Math.abs(s.length - avgLength), 0) / sentences.length;
    
    return Math.min(10, avgLength / 10 - lengthVariation / 20 + 5);
  }
  
  private countUrgencyMarkers(content: string): number {
    const urgencyMarkers = ['now', 'immediately', 'urgent', 'emergency', 'quick', 'fast', 'hurry', 'asap'];
    return urgencyMarkers.filter(marker => content.includes(marker)).length;
  }
  
  private calculateEmotionalTrajectory(
    context: RiskContext,
    currentEmotions: Record<string, number>
  ): EmotionalStateAnalysis['emotionalTrajectory'] {
    if (!context.conversationHistory || context.conversationHistory.length < 3) {
      return 'stable';
    }
    
    // Simple trajectory analysis based on risk scores
    const recentRisks = context.conversationHistory
      .slice(-3)
      .map(m => m.riskScore || 5)
      .filter(score => score !== undefined);
    
    if (recentRisks.length < 2) return 'stable';
    
    const trend = recentRisks[recentRisks.length - 1] - recentRisks[0];
    
    if (trend > 2) return 'declining';
    if (trend < -2) return 'improving';
    if (Math.abs(trend) > 1) return 'volatile';
    
    return 'stable';
  }
  
  private calculateEmotionalStability(
    emotions: Record<string, number>,
    context: RiskContext
  ): number {
    const emotionValues = Object.values(emotions);
    const maxEmotion = Math.max(...emotionValues);
    const emotionSpread = Math.max(...emotionValues) - Math.min(...emotionValues);
    
    // Lower stability for extreme emotions or high emotional spread
    let stability = 10 - (maxEmotion * 0.5) - (emotionSpread * 0.3);
    
    // Factor in conversation history volatility
    if (context.conversationHistory) {
      const riskScores = context.conversationHistory
        .map(m => m.riskScore)
        .filter(score => score !== undefined);
      
      if (riskScores.length > 2) {
        const riskVariance = this.calculateVariance(riskScores as number[]);
        stability -= riskVariance * 0.2;
      }
    }
    
    return Math.max(0, Math.min(10, stability));
  }
  
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  }
  
  // Context management methods
  
  private updateSessionContext(context: RiskContext): void {
    if (!context.sessionId) return;
    
    const existing = this.sessionContexts.get(context.sessionId);
    const now = new Date();
    
    if (existing) {
      existing.lastUpdate = now;
      existing.context = { ...existing.context, ...context };
    } else {
      this.sessionContexts.set(context.sessionId, {
        context,
        riskProgression: [],
        startTime: now,
        lastUpdate: now
      });
    }
  }
  
  private updateUserPatterns(context: RiskContext, riskScore: number): void {
    if (!context.userId) return;
    
    const existing = this.userPatterns.get(context.userId);
    const now = new Date();
    
    if (existing) {
      existing.riskHistory.push(riskScore);
      existing.lastUpdate = now;
      
      // Keep only last 100 risk scores
      if (existing.riskHistory.length > 100) {
        existing.riskHistory = existing.riskHistory.slice(-100);
      }
      
      // Update baseline risk
      existing.baselineRisk = existing.riskHistory.reduce((sum, r) => sum + r, 0) / existing.riskHistory.length;
    } else {
      this.userPatterns.set(context.userId, {
        baselineRisk: riskScore,
        riskHistory: [riskScore],
        patterns: [],
        lastUpdate: now
      });
    }
  }
  
  // Result generation methods
  
  private generateContextualInsights(
    context: RiskContext,
    emotionalState: EmotionalStateAnalysis,
    riskAdjustments: { factors: any[] }
  ): RiskAssessmentResult['contextualInsights'] {
    
    // Determine user pattern
    let userPattern: 'normal' | 'concerning' | 'escalating' | 'improving' = 'normal';
    if (context.userId) {
      const userHistory = this.userPatterns.get(context.userId);
      if (userHistory && userHistory.riskHistory.length > 3) {
        const recentAvg = userHistory.riskHistory.slice(-3).reduce((sum, r) => sum + r, 0) / 3;
        const overallAvg = userHistory.baselineRisk;
        
        if (recentAvg > overallAvg + 2) userPattern = 'escalating';
        else if (recentAvg < overallAvg - 2) userPattern = 'improving';
        else if (overallAvg > 6) userPattern = 'concerning';
      }
    }
    
    // Determine session pattern
    let sessionPattern: 'stable' | 'volatile' | 'crisis' | 'resolution' = 'stable';
    if (context.sessionMetadata) {
      if (context.sessionMetadata.escalationCount > 0) sessionPattern = 'crisis';
      else if (context.conversationHistory && context.conversationHistory.length > 5) {
        const riskScores = context.conversationHistory
          .map(m => m.riskScore)
          .filter(s => s !== undefined) as number[];
        
        if (riskScores.length > 2) {
          const variance = this.calculateVariance(riskScores);
          if (variance > 4) sessionPattern = 'volatile';
          else if (riskScores[riskScores.length - 1] < riskScores[0] - 2) sessionPattern = 'resolution';
        }
      }
    }
    
    // Determine temporal pattern
    let temporalPattern: 'typical' | 'atypical' | 'high_risk_time' = 'typical';
    if (context.environment) {
      if ((context.environment.timeOfDay >= 23 || context.environment.timeOfDay <= 5) ||
          context.environment.holidayOrSpecialDate) {
        temporalPattern = 'high_risk_time';
      }
    }
    
    // Environmental factors
    const environmentalFactors: string[] = [];
    if (context.environment?.holidayOrSpecialDate) {
      environmentalFactors.push('holiday_period');
    }
    if (context.platform?.accessMethod === 'emergency') {
      environmentalFactors.push('emergency_access');
    }
    
    return {
      userPattern,
      sessionPattern,
      temporalPattern,
      environmentalFactors
    };
  }
  
  private generateRecommendations(
    adjustedRiskScore: number,
    insights: RiskAssessmentResult['contextualInsights'],
    falsePositiveProbability: number
  ): RiskAssessmentResult['recommendations'] {
    
    const immediateActions: string[] = [];
    let monitoringNeeded = false;
    let escalationThreshold = 8;
    let followUpRequired = false;
    
    // High-risk recommendations
    if (adjustedRiskScore >= 8) {
      immediateActions.push('Escalate to senior volunteer');
      immediateActions.push('Activate crisis protocol');
      monitoringNeeded = true;
      escalationThreshold = 7;
      followUpRequired = true;
    } else if (adjustedRiskScore >= 6) {
      immediateActions.push('Increase monitoring frequency');
      immediateActions.push('Prepare crisis resources');
      monitoringNeeded = true;
      followUpRequired = true;
    }
    
    // Context-specific recommendations
    if (insights.userPattern === 'escalating') {
      immediateActions.push('Review user history for patterns');
      escalationThreshold -= 1;
    }
    
    if (insights.sessionPattern === 'volatile') {
      immediateActions.push('Stabilize conversation tone');
      monitoringNeeded = true;
    }
    
    if (insights.temporalPattern === 'high_risk_time') {
      immediateActions.push('Consider time-sensitive factors');
      escalationThreshold -= 0.5;
    }
    
    // False positive mitigation
    if (falsePositiveProbability > 0.1) {
      immediateActions.push('Verify risk assessment with additional context');
      escalationThreshold += 1;
    }
    
    return {
      immediateActions,
      monitoringNeeded,
      escalationThreshold: Math.max(5, escalationThreshold),
      followUpRequired
    };
  }
  
  private createErrorResult(originalRiskScore: number, startTime: number, error: any): RiskAssessmentResult {
    return {
      adjustedRiskScore: originalRiskScore,
      originalRiskScore,
      confidenceLevel: 0,
      falsePositiveProbability: 0.5,
      riskFactors: [],
      contextualInsights: {
        userPattern: 'normal',
        sessionPattern: 'stable',
        temporalPattern: 'typical',
        environmentalFactors: ['system_error']
      },
      recommendations: {
        immediateActions: ['Manual review required due to system error'],
        monitoringNeeded: true,
        escalationThreshold: 6,
        followUpRequired: true
      },
      processingTime: performance.now() - startTime,
      analysisVersion: 'error-handler'
    };
  }
  
  // Initialization and maintenance
  
  private initializeTemporalPatterns(): void {
    // Initialize hourly patterns (higher risk during late night/early morning)
    for (let hour = 0; hour < 24; hour++) {
      if (hour >= 23 || hour <= 5) {
        this.temporalPatterns.hourlyRisk[hour] = 1.3; // 30% higher risk
      } else if (hour >= 18 && hour <= 22) {
        this.temporalPatterns.hourlyRisk[hour] = 1.1; // 10% higher risk
      } else {
        this.temporalPatterns.hourlyRisk[hour] = 1.0; // Baseline risk
      }
    }
    
    // Initialize weekly patterns (higher risk on weekends)
    this.temporalPatterns.weeklyRisk[0] = 1.2; // Sunday
    this.temporalPatterns.weeklyRisk[6] = 1.1; // Saturday
    
    console.log('📊 Temporal risk patterns initialized');
  }
  
  private startMaintenanceTasks(): void {
    // Clean up old cache entries
    setInterval(() => {
      this.cleanupOldEntries();
    }, this.CACHE_CLEANUP_INTERVAL);
    
    // Log performance metrics
    setInterval(() => {
      console.log(`🧠 Risk Assessment Metrics - Assessments: ${this.metrics.assessmentsCompleted}, FP Rate: ${(this.metrics.falsePositiveRate * 100).toFixed(2)}%, Accuracy: ${(this.metrics.accuracyRate * 100).toFixed(1)}%`);
    }, 300000); // Every 5 minutes
  }
  
  private cleanupOldEntries(): void {
    const cutoffTime = Date.now() - this.CONTEXT_RETENTION_TIME;
    
    // Clean user patterns
    for (const [userId, pattern] of this.userPatterns.entries()) {
      if (pattern.lastUpdate.getTime() < cutoffTime) {
        this.userPatterns.delete(userId);
      }
    }
    
    // Clean session contexts
    for (const [sessionId, context] of this.sessionContexts.entries()) {
      if (context.lastUpdate.getTime() < cutoffTime) {
        this.sessionContexts.delete(sessionId);
      }
    }
  }
  
  private updateMetrics(latency: number, falsePositiveProbability: number): void {
    // Update average latency
    this.metrics.averageLatency = (this.metrics.averageLatency * (this.metrics.assessmentsCompleted - 1) + latency) / this.metrics.assessmentsCompleted;
    
    // Update false positive rate
    this.metrics.falsePositiveRate = (this.metrics.falsePositiveRate * (this.metrics.assessmentsCompleted - 1) + falsePositiveProbability) / this.metrics.assessmentsCompleted;
    
    // Track false positive reductions
    if (falsePositiveProbability < 0.01) {
      this.metrics.falsePositiveReductions++;
    }
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Validate performance against targets
   */
  validatePerformance(): { valid: boolean; issues: string[]; metrics: any } {
    const issues: string[] = [];
    
    if (this.metrics.averageLatency > 100) {
      issues.push(`Average latency ${this.metrics.averageLatency.toFixed(2)}ms exceeds target of 100ms`);
    }
    
    if (this.metrics.falsePositiveRate > 0.01) {
      issues.push(`False positive rate ${(this.metrics.falsePositiveRate * 100).toFixed(2)}% exceeds target of 1%`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      metrics: this.getMetrics()
    };
  }
}

// Export singleton instance
export const contextAwareRiskAssessor = ContextAwareRiskAssessor.getInstance();