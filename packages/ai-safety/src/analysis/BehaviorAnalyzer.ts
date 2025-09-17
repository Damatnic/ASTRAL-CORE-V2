/**
 * ASTRAL_CORE 2.0 Behavior Analysis System
 * 
 * COMPREHENSIVE BEHAVIORAL ANALYSIS ENGINE
 * Crisis escalation pattern recognition, anomaly detection for user safety,
 * and volunteer burnout indicators with real-time predictive modeling.
 * 
 * Performance Target: <100ms analysis for real-time intervention
 */

import { EventEmitter } from 'events';

// Core Types
export interface BehaviorAnalysisResult {
  riskLevel: number; // 0-1 scale
  patterns: BehaviorPattern[];
  concerns: SafetyConcern[];
  needsIntervention: boolean;
  recommendations: string[];
  confidence: number;
  escalationRisk: EscalationRisk;
  anomalies: AnomalyDetection[];
  sessionQuality: SessionQualityMetrics;
  timestamp: Date;
}

export interface BehaviorPattern {
  type: PatternType;
  severity: number; // 0-1 scale
  confidence: number;
  indicators: string[];
  timeline: PatternTimeline;
}

export interface SafetyConcern {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  actionRequired: boolean;
}

export interface EscalationRisk {
  probability: number; // 0-1 scale
  timeframe: string; // e.g., "next 30 minutes"
  indicators: string[];
  preventionStrategies: string[];
}

export interface AnomalyDetection {
  type: AnomalyType;
  deviation: number; // Standard deviations from norm
  description: string;
  riskLevel: number;
}

export interface SessionQualityMetrics {
  score: number; // 0-100
  engagement: number;
  therapeutic: number;
  effectiveness: number;
  improvements: string[];
}

export interface VolunteerMetrics {
  volunteerId: string;
  burnoutRisk: number; // 0-1 scale
  performanceScore: number;
  fatigueIndicators: string[];
  recommendations: string[];
  shiftQuality: ShiftQualityMetrics;
}

export interface ShiftQualityMetrics {
  responseTime: number; // milliseconds
  empathyScore: number; // 0-1 scale
  accuracyScore: number;
  engagementLevel: number;
  breakPatterns: BreakPattern[];
}

export interface BreakPattern {
  frequency: number;
  duration: number;
  reason: string;
}

export interface UserActivity {
  type: string;
  timestamp: Date;
  metadata?: any;
  sessionId?: string;
  volunteerId?: string;
}

export interface PatternTimeline {
  start: Date;
  duration: number; // minutes
  frequency: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// Enums
export enum PatternType {
  CRISIS_ESCALATION = 'CRISIS_ESCALATION',
  COMMUNICATION_BREAKDOWN = 'COMMUNICATION_BREAKDOWN',
  EMOTIONAL_DYSREGULATION = 'EMOTIONAL_DYSREGULATION',
  HELP_REJECTION = 'HELP_REJECTION',
  ISOLATION_TENDENCY = 'ISOLATION_TENDENCY',
  PANIC_PATTERN = 'PANIC_PATTERN',
  DISSOCIATION_INDICATORS = 'DISSOCIATION_INDICATORS',
  SUICIDAL_IDEATION = 'SUICIDAL_IDEATION',
  SELF_HARM_INDICATORS = 'SELF_HARM_INDICATORS',
  SUBSTANCE_USE_CRISIS = 'SUBSTANCE_USE_CRISIS'
}

export enum AnomalyType {
  UNUSUAL_TIME_PATTERN = 'UNUSUAL_TIME_PATTERN',
  SUDDEN_SEVERITY_SPIKE = 'SUDDEN_SEVERITY_SPIKE',
  COMMUNICATION_STYLE_CHANGE = 'COMMUNICATION_STYLE_CHANGE',
  RESPONSE_PATTERN_DEVIATION = 'RESPONSE_PATTERN_DEVIATION',
  EMOTIONAL_STATE_SHIFT = 'EMOTIONAL_STATE_SHIFT',
  ENGAGEMENT_ANOMALY = 'ENGAGEMENT_ANOMALY'
}

// Main Behavior Analyzer Class
export class BehaviorAnalyzer extends EventEmitter {
  private static instance: BehaviorAnalyzer;
  
  // Pattern Recognition Thresholds
  private readonly THRESHOLDS = {
    CRISIS_ESCALATION: 0.7,
    HIGH_FREQUENCY: 0.6,
    ESCALATING_SEVERITY: 0.75,
    ISOLATION_PATTERN: 0.65,
    HELP_REJECTION: 0.7,
    BURNOUT_RISK: 0.6,
    ANOMALY_DEVIATION: 2.0, // Standard deviations
    SESSION_QUALITY_MIN: 60,
    RESPONSE_TIME_MAX: 100, // milliseconds
  };
  
  // Crisis Keywords and Patterns
  private readonly CRISIS_INDICATORS = {
    immediate: ['suicide', 'kill myself', 'end it all', 'no point', 'overdose', 'hurt myself'],
    high: ['hopeless', 'cant go on', 'no way out', 'trapped', 'unbearable', 'give up'],
    moderate: ['overwhelmed', 'breaking down', 'falling apart', 'cant cope', 'too much'],
    escalation: ['getting worse', 'cant take it', 'losing control', 'spiraling'],
  };
  
  // Behavioral Pattern Cache
  private patternCache = new Map<string, BehaviorPattern[]>();
  private sessionMetrics = new Map<string, SessionQualityMetrics>();
  private volunteerMetrics = new Map<string, VolunteerMetrics>();
  private userBaselines = new Map<string, UserBaseline>();
  private metricsInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    super();
    this.initializeAnalyzer();
  }
  
  private initializeAnalyzer(): void {
    console.log('🧠 Advanced Behavior Analyzer initialized');
    console.log('✅ Crisis escalation detection active');
    console.log('✅ Anomaly detection system online');
    console.log('✅ Volunteer burnout monitoring enabled');
    
    // Start periodic metric aggregation (only in production)
    if (process.env.NODE_ENV !== 'test') {
      this.metricsInterval = setInterval(() => this.aggregateMetrics(), 60000); // Every minute
    }
  }
  
  // Cleanup method for tests
  public cleanup(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    this.patternCache.clear();
    this.sessionMetrics.clear();
    this.volunteerMetrics.clear();
    this.userBaselines.clear();
  }
  
  static getInstance(): BehaviorAnalyzer {
    if (!BehaviorAnalyzer.instance) {
      BehaviorAnalyzer.instance = new BehaviorAnalyzer();
    }
    return BehaviorAnalyzer.instance;
  }
  
  /**
   * CORE ANALYSIS: Comprehensive behavior analysis with crisis detection
   * TARGET: <100ms execution time for real-time intervention
   */
  async analyzeMessage(
    userId: string,
    message: string,
    context?: AnalysisContext
  ): Promise<BehaviorAnalysisResult> {
    const startTime = performance.now();
    
    try {
      // Parallel analysis for performance
      const [
        recentActivity,
        baseline,
        messageAnalysis,
        crisisIndicators,
      ] = await Promise.all([
        this.getUserRecentActivity(userId),
        this.getUserBaseline(userId),
        this.analyzeMessageContent(message),
        this.detectCrisisIndicators(message),
      ]);
      
      // Pattern recognition
      const patterns = await this.identifyBehaviorPatterns(
        recentActivity,
        message,
        baseline
      );
      
      // Anomaly detection
      const anomalies = this.detectAnomalies(
        messageAnalysis,
        baseline,
        recentActivity
      );
      
      // Crisis escalation analysis
      const escalationRisk = this.assessEscalationRisk(
        patterns,
        crisisIndicators,
        recentActivity
      );
      
      // Calculate comprehensive risk
      const riskLevel = this.calculateComprehensiveRisk(
        patterns,
        anomalies,
        escalationRisk,
        crisisIndicators
      );
      
      // Generate safety concerns
      const concerns = this.generateSafetyConcerns(
        patterns,
        anomalies,
        escalationRisk,
        riskLevel
      );
      
      // Session quality analysis
      const sessionQuality = await this.analyzeSessionQuality(
        userId,
        context?.sessionId
      );
      
      // Generate recommendations
      const recommendations = this.generateInterventionRecommendations(
        patterns,
        concerns,
        escalationRisk,
        sessionQuality
      );
      
      // Performance check
      const executionTime = performance.now() - startTime;
      if (executionTime > 100) {
        console.warn(`⚠️ Behavior analysis took ${executionTime.toFixed(2)}ms (target: <100ms)`);
      }
      
      // Emit critical events
      if (riskLevel > 0.8) {
        this.emit('criticalRisk', { userId, riskLevel, patterns, escalationRisk });
      }
      
      // Cache patterns for trend analysis
      this.patternCache.set(userId, patterns);
      
      return {
        riskLevel,
        patterns,
        concerns,
        needsIntervention: riskLevel > 0.7 || escalationRisk.probability > 0.6,
        recommendations,
        confidence: this.calculateConfidence(recentActivity.length, patterns, anomalies),
        escalationRisk,
        anomalies,
        sessionQuality,
        timestamp: new Date(),
      };
      
    } catch (error) {
      console.error('❌ Behavior analysis failed:', error);
      return this.getFailsafeAnalysis();
    }
  }
  
  /**
   * VOLUNTEER BURNOUT DETECTION
   * Monitors volunteer performance and wellbeing indicators
   */
  async analyzeVolunteerBurnout(
    volunteerId: string,
    sessionData: VolunteerSessionData
  ): Promise<VolunteerMetrics> {
    try {
      const startTime = performance.now();
      
      // Get volunteer's historical performance
      const historicalMetrics = await this.getVolunteerHistory(volunteerId);
      
      // Analyze current shift quality
      const shiftQuality = this.analyzeShiftQuality(sessionData, historicalMetrics);
      
      // Detect fatigue indicators
      const fatigueIndicators = this.detectFatigueIndicators(
        sessionData,
        shiftQuality,
        historicalMetrics
      );
      
      // Calculate burnout risk
      const burnoutRisk = this.calculateBurnoutRisk(
        fatigueIndicators,
        shiftQuality,
        historicalMetrics
      );
      
      // Performance scoring
      const performanceScore = this.calculatePerformanceScore(
        shiftQuality,
        sessionData
      );
      
      // Generate recommendations
      const recommendations = this.generateVolunteerRecommendations(
        burnoutRisk,
        fatigueIndicators,
        performanceScore
      );
      
      const metrics: VolunteerMetrics = {
        volunteerId,
        burnoutRisk,
        performanceScore,
        fatigueIndicators,
        recommendations,
        shiftQuality,
      };
      
      // Cache metrics
      this.volunteerMetrics.set(volunteerId, metrics);
      
      // Alert if burnout risk is high
      if (burnoutRisk > this.THRESHOLDS.BURNOUT_RISK) {
        this.emit('volunteerBurnoutRisk', metrics);
      }
      
      const executionTime = performance.now() - startTime;
      console.log(`✅ Volunteer analysis completed in ${executionTime.toFixed(2)}ms`);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ Volunteer burnout analysis failed:', error);
      return this.getDefaultVolunteerMetrics(volunteerId);
    }
  }
  
  /**
   * CRISIS ESCALATION PATTERN RECOGNITION
   * Identifies patterns indicating crisis escalation
   */
  private async identifyBehaviorPatterns(
    activities: UserActivity[],
    currentMessage: string,
    baseline: UserBaseline
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];
    
    // Crisis Escalation Detection
    const escalationPattern = this.detectEscalationPattern(activities, currentMessage);
    if (escalationPattern) {
      patterns.push(escalationPattern);
    }
    
    // Communication Breakdown
    const communicationPattern = this.detectCommunicationBreakdown(
      currentMessage,
      activities,
      baseline
    );
    if (communicationPattern) {
      patterns.push(communicationPattern);
    }
    
    // Emotional Dysregulation
    const emotionalPattern = this.detectEmotionalDysregulation(
      activities,
      currentMessage,
      baseline
    );
    if (emotionalPattern) {
      patterns.push(emotionalPattern);
    }
    
    // Help Rejection Pattern
    if (this.detectHelpRejection(currentMessage, activities)) {
      patterns.push({
        type: PatternType.HELP_REJECTION,
        severity: 0.7,
        confidence: 0.8,
        indicators: ['Refusing assistance', 'Negative response to support'],
        timeline: this.getPatternTimeline(activities, 'help_rejection'),
      });
    }
    
    // Isolation Tendency
    const isolationPattern = this.detectIsolationTendency(activities, baseline);
    if (isolationPattern) {
      patterns.push(isolationPattern);
    }
    
    // Panic Pattern Recognition
    const panicPattern = this.detectPanicPattern(currentMessage, activities);
    if (panicPattern) {
      patterns.push(panicPattern);
    }
    
    // Self-Harm Indicators
    const selfHarmPattern = this.detectSelfHarmIndicators(currentMessage, activities);
    if (selfHarmPattern) {
      patterns.push(selfHarmPattern);
    }
    
    return patterns;
  }
  
  /**
   * ANOMALY DETECTION SYSTEM
   * Identifies unusual patterns that may indicate safety risks
   */
  private detectAnomalies(
    messageAnalysis: MessageAnalysis,
    baseline: UserBaseline,
    activities: UserActivity[]
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Time Pattern Anomaly
    const timeAnomaly = this.detectTimePatternAnomaly(activities, baseline);
    if (timeAnomaly) {
      anomalies.push(timeAnomaly);
    }
    
    // Severity Spike Detection
    const severitySpike = this.detectSeveritySpike(messageAnalysis, baseline);
    if (severitySpike) {
      anomalies.push(severitySpike);
    }
    
    // Communication Style Change
    const styleChange = this.detectCommunicationStyleChange(
      messageAnalysis,
      baseline
    );
    if (styleChange) {
      anomalies.push(styleChange);
    }
    
    // Response Pattern Deviation
    const responseDeviation = this.detectResponsePatternDeviation(
      activities,
      baseline
    );
    if (responseDeviation) {
      anomalies.push(responseDeviation);
    }
    
    // Emotional State Shift
    const emotionalShift = this.detectEmotionalStateShift(
      messageAnalysis,
      baseline
    );
    if (emotionalShift) {
      anomalies.push(emotionalShift);
    }
    
    return anomalies;
  }
  
  /**
   * ESCALATION RISK ASSESSMENT
   * Predicts likelihood of crisis escalation
   */
  private assessEscalationRisk(
    patterns: BehaviorPattern[],
    crisisIndicators: CrisisIndicators,
    activities: UserActivity[]
  ): EscalationRisk {
    // Calculate base probability from patterns
    let probability = 0;
    const indicators: string[] = [];
    
    // Pattern-based risk
    patterns.forEach(pattern => {
      if (pattern.type === PatternType.CRISIS_ESCALATION) {
        probability += 0.3;
        indicators.push('Crisis escalation pattern detected');
      }
      if (pattern.type === PatternType.EMOTIONAL_DYSREGULATION) {
        probability += 0.2;
        indicators.push('Emotional dysregulation present');
      }
      if (pattern.type === PatternType.PANIC_PATTERN) {
        probability += 0.25;
        indicators.push('Panic symptoms identified');
      }
    });
    
    // Crisis indicator risk
    if (crisisIndicators.immediate.length > 0) {
      probability += 0.4;
      indicators.push('Immediate crisis keywords detected');
    }
    if (crisisIndicators.high.length > 0) {
      probability += 0.2;
      indicators.push('High-risk language present');
    }
    
    // Temporal risk factors
    const recentEscalation = this.detectRecentEscalation(activities);
    if (recentEscalation) {
      probability += 0.15;
      indicators.push('Recent escalation trend observed');
    }
    
    // Cap probability at 1.0
    probability = Math.min(probability, 1.0);
    
    // Determine timeframe
    const timeframe = this.predictEscalationTimeframe(probability, patterns);
    
    // Generate prevention strategies
    const preventionStrategies = this.generatePreventionStrategies(
      patterns,
      crisisIndicators,
      probability
    );
    
    return {
      probability,
      timeframe,
      indicators,
      preventionStrategies,
    };
  }
  
  /**
   * SESSION QUALITY ANALYSIS
   * Evaluates the quality and effectiveness of support sessions
   */
  private async analyzeSessionQuality(
    userId: string,
    sessionId?: string
  ): Promise<SessionQualityMetrics> {
    try {
      // Get session data
      const sessionData = sessionId ? 
        await this.getSessionData(sessionId) : 
        await this.getCurrentSessionData(userId);
      
      // Calculate quality metrics
      const engagement = this.calculateEngagementScore(sessionData);
      const therapeutic = this.calculateTherapeuticValue(sessionData);
      const effectiveness = this.calculateEffectivenessScore(sessionData);
      
      // Overall quality score
      const score = (engagement * 0.3 + therapeutic * 0.4 + effectiveness * 0.3) * 100;
      
      // Identify improvement areas
      const improvements = this.identifySessionImprovements(
        engagement,
        therapeutic,
        effectiveness,
        sessionData
      );
      
      const metrics: SessionQualityMetrics = {
        score,
        engagement,
        therapeutic,
        effectiveness,
        improvements,
      };
      
      // Cache metrics
      if (sessionId) {
        this.sessionMetrics.set(sessionId, metrics);
      }
      
      return metrics;
      
    } catch (error) {
      console.error('Session quality analysis error:', error);
      return {
        score: 50,
        engagement: 0.5,
        therapeutic: 0.5,
        effectiveness: 0.5,
        improvements: ['Unable to analyze session quality'],
      };
    }
  }
  
  // HELPER METHODS - Pattern Detection
  
  private detectEscalationPattern(
    activities: UserActivity[],
    message: string
  ): BehaviorPattern | null {
    const indicators: string[] = [];
    let severity = 0;
    
    // Check message urgency increase
    const recentMessages = activities.filter(a => 
      a.type === 'message' && 
      Date.now() - a.timestamp.getTime() < 1800000 // Last 30 minutes
    );
    
    if (recentMessages.length > 5) {
      const urgencyTrend = this.calculateUrgencyTrend(recentMessages);
      if (urgencyTrend > 0.5) {
        severity += 0.3;
        indicators.push('Increasing message urgency');
      }
    }
    
    // Check for escalation keywords
    const escalationKeywords = this.CRISIS_INDICATORS.escalation;
    const hasEscalationWords = escalationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (hasEscalationWords) {
      severity += 0.4;
      indicators.push('Escalation language detected');
    }
    
    // Check frequency acceleration
    const frequencyAcceleration = this.calculateFrequencyAcceleration(activities);
    if (frequencyAcceleration > 1.5) {
      severity += 0.3;
      indicators.push('Rapid increase in communication frequency');
    }
    
    if (severity > 0.3) {
      return {
        type: PatternType.CRISIS_ESCALATION,
        severity: Math.min(severity, 1),
        confidence: 0.75,
        indicators,
        timeline: this.getPatternTimeline(activities, 'escalation'),
      };
    }
    
    return null;
  }
  
  private detectCommunicationBreakdown(
    message: string,
    activities: UserActivity[],
    baseline: UserBaseline
  ): BehaviorPattern | null {
    const indicators: string[] = [];
    let severity = 0;
    
    // Check message coherence
    const coherence = this.analyzeMessageCoherence(message);
    if (coherence < 0.4) {
      severity += 0.3;
      indicators.push('Low message coherence');
    }
    
    // Check for fragmented thoughts
    const fragmentationScore = this.detectFragmentation(message);
    if (fragmentationScore > 0.6) {
      severity += 0.3;
      indicators.push('Fragmented communication');
    }
    
    // Compare to baseline communication style
    if (baseline.communicationStyle) {
      const deviation = this.calculateStyleDeviation(message, baseline.communicationStyle);
      if (deviation > 0.7) {
        severity += 0.4;
        indicators.push('Significant deviation from normal communication');
      }
    }
    
    if (severity > 0.4) {
      return {
        type: PatternType.COMMUNICATION_BREAKDOWN,
        severity: Math.min(severity, 1),
        confidence: 0.7,
        indicators,
        timeline: this.getPatternTimeline(activities, 'communication'),
      };
    }
    
    return null;
  }
  
  private detectEmotionalDysregulation(
    activities: UserActivity[],
    message: string,
    baseline: UserBaseline
  ): BehaviorPattern | null {
    const indicators: string[] = [];
    let severity = 0;
    
    // Analyze emotional volatility
    const emotionalSwings = this.detectEmotionalSwings(activities);
    if (emotionalSwings > 0.6) {
      severity += 0.35;
      indicators.push('Rapid emotional shifts detected');
    }
    
    // Check for extreme emotions
    const extremeEmotions = this.detectExtremeEmotions(message);
    if (extremeEmotions.length > 0) {
      severity += 0.3;
      indicators.push(`Extreme emotions: ${extremeEmotions.join(', ')}`);
    }
    
    // Compare to baseline emotional state
    if (baseline.emotionalBaseline) {
      const emotionalDeviation = this.calculateEmotionalDeviation(
        message,
        baseline.emotionalBaseline
      );
      if (emotionalDeviation > 2.0) {
        severity += 0.35;
        indicators.push('Significant emotional deviation from baseline');
      }
    }
    
    if (severity > 0.4) {
      return {
        type: PatternType.EMOTIONAL_DYSREGULATION,
        severity: Math.min(severity, 1),
        confidence: 0.75,
        indicators,
        timeline: this.getPatternTimeline(activities, 'emotional'),
      };
    }
    
    return null;
  }
  
  // HELPER METHODS - Anomaly Detection
  
  private detectTimePatternAnomaly(
    activities: UserActivity[],
    baseline: UserBaseline
  ): AnomalyDetection | null {
    // Analyze current activity time
    const currentHour = new Date().getHours();
    const typicalHours = baseline.typicalActiveHours || [9, 10, 11, 14, 15, 16, 19, 20, 21];
    
    if (!typicalHours.includes(currentHour)) {
      const deviation = this.calculateTimeDeviation(currentHour, typicalHours);
      
      if (deviation > this.THRESHOLDS.ANOMALY_DEVIATION) {
        return {
          type: AnomalyType.UNUSUAL_TIME_PATTERN,
          deviation,
          description: `Activity at unusual hour (${currentHour}:00)`,
          riskLevel: deviation / 4, // Normalize to 0-1 scale
        };
      }
    }
    
    return null;
  }
  
  private detectSeveritySpike(
    messageAnalysis: MessageAnalysis,
    baseline: UserBaseline
  ): AnomalyDetection | null {
    const currentSeverity = messageAnalysis.severity || 0;
    const baselineSeverity = baseline.averageSeverity || 0.3;
    
    const deviation = (currentSeverity - baselineSeverity) / (baseline.severityStdDev || 0.15);
    
    if (Math.abs(deviation) > this.THRESHOLDS.ANOMALY_DEVIATION) {
      return {
        type: AnomalyType.SUDDEN_SEVERITY_SPIKE,
        deviation,
        description: `Severity ${deviation > 0 ? 'spike' : 'drop'} detected`,
        riskLevel: Math.min(Math.abs(deviation) / 3, 1),
      };
    }
    
    return null;
  }
  
  // HELPER METHODS - Volunteer Analysis
  
  private analyzeShiftQuality(
    sessionData: VolunteerSessionData,
    historicalMetrics: VolunteerHistory
  ): ShiftQualityMetrics {
    // Calculate response time
    const responseTime = this.calculateAverageResponseTime(sessionData.responses);
    
    // Calculate empathy score
    const empathyScore = this.calculateEmpathyScore(sessionData.messages);
    
    // Calculate accuracy score
    const accuracyScore = this.calculateAccuracyScore(
      sessionData.interventions,
      sessionData.outcomes
    );
    
    // Calculate engagement level
    const engagementLevel = this.calculateVolunteerEngagement(sessionData);
    
    // Analyze break patterns
    const breakPatterns = this.analyzeBreakPatterns(sessionData.breaks);
    
    return {
      responseTime,
      empathyScore,
      accuracyScore,
      engagementLevel,
      breakPatterns,
    };
  }
  
  private detectFatigueIndicators(
    sessionData: VolunteerSessionData,
    shiftQuality: ShiftQualityMetrics,
    historicalMetrics: VolunteerHistory
  ): string[] {
    const indicators: string[] = [];
    
    // Response time degradation
    if (shiftQuality.responseTime > historicalMetrics.averageResponseTime * 1.5) {
      indicators.push('Response time significantly increased');
    }
    
    // Empathy score decline
    if (shiftQuality.empathyScore < historicalMetrics.averageEmpathy - 0.2) {
      indicators.push('Empathy levels below normal');
    }
    
    // Increased break frequency
    if (shiftQuality.breakPatterns.length > historicalMetrics.averageBreaks * 1.5) {
      indicators.push('Increased break frequency');
    }
    
    // Engagement drop
    if (shiftQuality.engagementLevel < 0.5) {
      indicators.push('Low engagement level');
    }
    
    // Session duration patterns
    if (sessionData.totalDuration > historicalMetrics.averageShiftDuration * 1.3) {
      indicators.push('Extended shift duration');
    }
    
    return indicators;
  }
  
  private calculateBurnoutRisk(
    fatigueIndicators: string[],
    shiftQuality: ShiftQualityMetrics,
    historicalMetrics: VolunteerHistory
  ): number {
    let risk = 0;
    
    // Fatigue indicator weight
    risk += fatigueIndicators.length * 0.15;
    
    // Performance degradation
    const performanceDrop = 1 - (shiftQuality.accuracyScore / historicalMetrics.averageAccuracy);
    risk += performanceDrop * 0.3;
    
    // Empathy exhaustion
    const empathyDrop = 1 - (shiftQuality.empathyScore / historicalMetrics.averageEmpathy);
    risk += empathyDrop * 0.25;
    
    // Break pattern analysis
    const breakScore = shiftQuality.breakPatterns.length / 10; // Normalize
    risk += breakScore * 0.15;
    
    // Engagement factor
    risk += (1 - shiftQuality.engagementLevel) * 0.15;
    
    return Math.min(risk, 1);
  }
  
  // HELPER METHODS - Utilities
  
  private async getUserRecentActivity(userId: string): Promise<UserActivity[]> {
    // In production, this would fetch from database
    // Mock implementation for now
    return [
      {
        type: 'message',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        metadata: { severity: 0.6, content: 'feeling overwhelmed' },
      },
      {
        type: 'message',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        metadata: { severity: 0.5, content: 'anxious about everything' },
      },
      {
        type: 'session_start',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        metadata: { sessionType: 'crisis' },
      },
    ];
  }
  
  private async getUserBaseline(userId: string): Promise<UserBaseline> {
    // Check cache first
    if (this.userBaselines.has(userId)) {
      return this.userBaselines.get(userId)!;
    }
    
    // In production, fetch from database
    // Mock baseline for now
    const baseline: UserBaseline = {
      userId,
      averageSeverity: 0.4,
      severityStdDev: 0.15,
      typicalActiveHours: [10, 14, 15, 16, 19, 20, 21],
      communicationStyle: 'moderate',
      emotionalBaseline: 0.5,
      responsePatterns: [],
    };
    
    this.userBaselines.set(userId, baseline);
    return baseline;
  }
  
  private analyzeMessageContent(message: string): MessageAnalysis {
    // Sentiment analysis
    const sentiment = this.analyzeSentiment(message);
    
    // Urgency detection
    const urgency = this.detectUrgency(message);
    
    // Coherence analysis
    const coherence = this.analyzeMessageCoherence(message);
    
    // Emotional intensity
    const emotionalIntensity = this.detectEmotionalIntensity(message);
    
    // Crisis severity
    const severity = this.calculateMessageSeverity(message);
    
    return {
      sentiment,
      urgency,
      coherence,
      emotionalIntensity,
      severity,
      wordCount: message.split(/\s+/).length,
      capsRatio: (message.match(/[A-Z]/g) || []).length / message.length,
    };
  }
  
  private detectCrisisIndicators(message: string): CrisisIndicators {
    const lowerMessage = message.toLowerCase();
    
    return {
      immediate: this.CRISIS_INDICATORS.immediate.filter(keyword => 
        lowerMessage.includes(keyword)
      ),
      high: this.CRISIS_INDICATORS.high.filter(keyword => 
        lowerMessage.includes(keyword)
      ),
      moderate: this.CRISIS_INDICATORS.moderate.filter(keyword => 
        lowerMessage.includes(keyword)
      ),
      escalation: this.CRISIS_INDICATORS.escalation.filter(keyword => 
        lowerMessage.includes(keyword)
      ),
    };
  }
  
  private calculateComprehensiveRisk(
    patterns: BehaviorPattern[],
    anomalies: AnomalyDetection[],
    escalationRisk: EscalationRisk,
    crisisIndicators: CrisisIndicators
  ): number {
    let risk = 0;
    
    // Pattern-based risk (40% weight)
    const patternRisk = patterns.reduce((sum, p) => sum + p.severity, 0) / 
      Math.max(patterns.length, 1);
    risk += patternRisk * 0.4;
    
    // Anomaly-based risk (20% weight)
    const anomalyRisk = anomalies.reduce((sum, a) => sum + a.riskLevel, 0) / 
      Math.max(anomalies.length, 1);
    risk += anomalyRisk * 0.2;
    
    // Escalation risk (25% weight)
    risk += escalationRisk.probability * 0.25;
    
    // Crisis indicator risk (15% weight)
    const indicatorRisk = (
      crisisIndicators.immediate.length * 1.0 +
      crisisIndicators.high.length * 0.7 +
      crisisIndicators.moderate.length * 0.4 +
      crisisIndicators.escalation.length * 0.5
    ) / 10; // Normalize
    risk += Math.min(indicatorRisk, 1) * 0.15;
    
    return Math.min(risk, 1);
  }
  
  private generateSafetyConcerns(
    patterns: BehaviorPattern[],
    anomalies: AnomalyDetection[],
    escalationRisk: EscalationRisk,
    riskLevel: number
  ): SafetyConcern[] {
    const concerns: SafetyConcern[] = [];
    
    // Critical risk concerns
    if (riskLevel > 0.8) {
      concerns.push({
        level: 'critical',
        type: 'IMMEDIATE_RISK',
        description: 'User showing critical risk indicators requiring immediate intervention',
        actionRequired: true,
      });
    }
    
    // Pattern-based concerns
    patterns.forEach(pattern => {
      if (pattern.type === PatternType.SUICIDAL_IDEATION) {
        concerns.push({
          level: 'critical',
          type: 'SUICIDAL_IDEATION',
          description: 'Suicidal ideation indicators detected',
          actionRequired: true,
        });
      } else if (pattern.type === PatternType.SELF_HARM_INDICATORS) {
        concerns.push({
          level: 'high',
          type: 'SELF_HARM_RISK',
          description: 'Self-harm indicators present',
          actionRequired: true,
        });
      } else if (pattern.severity > 0.7) {
        concerns.push({
          level: 'high',
          type: pattern.type,
          description: `High severity ${pattern.type.toLowerCase().replace(/_/g, ' ')}`,
          actionRequired: pattern.severity > 0.8,
        });
      }
    });
    
    // Anomaly-based concerns
    anomalies.forEach(anomaly => {
      if (anomaly.riskLevel > 0.7) {
        concerns.push({
          level: anomaly.riskLevel > 0.85 ? 'high' : 'medium',
          type: anomaly.type,
          description: anomaly.description,
          actionRequired: anomaly.riskLevel > 0.85,
        });
      }
    });
    
    // Escalation concerns
    if (escalationRisk.probability > 0.7) {
      concerns.push({
        level: 'high',
        type: 'ESCALATION_RISK',
        description: `High probability of crisis escalation ${escalationRisk.timeframe}`,
        actionRequired: true,
      });
    }
    
    return concerns;
  }
  
  private generateInterventionRecommendations(
    patterns: BehaviorPattern[],
    concerns: SafetyConcern[],
    escalationRisk: EscalationRisk,
    sessionQuality: SessionQualityMetrics
  ): string[] {
    const recommendations: string[] = [];
    
    // Critical interventions
    const criticalConcerns = concerns.filter(c => c.level === 'critical');
    if (criticalConcerns.length > 0) {
      recommendations.push('IMMEDIATE: Escalate to crisis specialist');
      recommendations.push('Implement crisis safety protocol');
      recommendations.push('Consider emergency services if imminent danger');
    }
    
    // Pattern-specific recommendations
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case PatternType.CRISIS_ESCALATION:
          recommendations.push('Apply de-escalation techniques');
          recommendations.push('Focus on grounding and stabilization');
          break;
        case PatternType.EMOTIONAL_DYSREGULATION:
          recommendations.push('Provide emotional regulation strategies');
          recommendations.push('Use validation and normalization');
          break;
        case PatternType.HELP_REJECTION:
          recommendations.push('Adopt non-directive approach');
          recommendations.push('Focus on building trust and rapport');
          break;
        case PatternType.PANIC_PATTERN:
          recommendations.push('Guide through breathing exercises');
          recommendations.push('Provide panic attack coping strategies');
          break;
        case PatternType.ISOLATION_TENDENCY:
          recommendations.push('Gently encourage connection');
          recommendations.push('Explore support system options');
          break;
      }
    });
    
    // Escalation prevention
    if (escalationRisk.probability > 0.5) {
      escalationRisk.preventionStrategies.forEach(strategy => {
        recommendations.push(strategy);
      });
    }
    
    // Session quality improvements
    if (sessionQuality.score < this.THRESHOLDS.SESSION_QUALITY_MIN) {
      sessionQuality.improvements.forEach(improvement => {
        recommendations.push(improvement);
      });
    }
    
    // Remove duplicates and limit to top 5
    return [...new Set(recommendations)].slice(0, 5);
  }
  
  private generateVolunteerRecommendations(
    burnoutRisk: number,
    fatigueIndicators: string[],
    performanceScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (burnoutRisk > 0.8) {
      recommendations.push('Immediate break recommended');
      recommendations.push('Consider shift rotation');
      recommendations.push('Schedule debriefing session');
    } else if (burnoutRisk > 0.6) {
      recommendations.push('Take regular breaks (every 30 minutes)');
      recommendations.push('Practice self-care techniques');
      recommendations.push('Monitor stress levels closely');
    }
    
    if (performanceScore < 0.6) {
      recommendations.push('Review recent challenging cases');
      recommendations.push('Consider additional training or support');
    }
    
    if (fatigueIndicators.includes('Extended shift duration')) {
      recommendations.push('End shift within next 30 minutes');
    }
    
    if (fatigueIndicators.includes('Empathy levels below normal')) {
      recommendations.push('Practice compassion meditation');
      recommendations.push('Take emotional reset break');
    }
    
    return recommendations;
  }
  
  // Utility methods for calculations
  
  private analyzeSentiment(message: string): number {
    const positiveWords = ['better', 'hope', 'thank', 'good', 'improve', 'calm', 'safe'];
    const negativeWords = ['worse', 'hopeless', 'terrible', 'awful', 'hate', 'die', 'pain'];
    
    const words = message.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(w => positiveWords.some(p => w.includes(p))).length;
    const negativeCount = words.filter(w => negativeWords.some(n => w.includes(n))).length;
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 0.5;
    
    return positiveCount / total;
  }
  
  private detectUrgency(message: string): number {
    const urgentWords = ['now', 'immediately', 'urgent', 'emergency', 'help', 'please', 'cant'];
    const exclamations = (message.match(/!/g) || []).length;
    const capitals = (message.match(/[A-Z]{3,}/g) || []).length;
    
    const words = message.toLowerCase().split(/\s+/);
    const urgentCount = words.filter(w => urgentWords.some(u => w.includes(u))).length;
    
    let urgency = (urgentCount / words.length) * 2; // Weight urgent words
    urgency += exclamations * 0.1;
    urgency += capitals * 0.05;
    
    return Math.min(urgency, 1);
  }
  
  private analyzeMessageCoherence(message: string): number {
    // Check for proper sentence structure
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0.3;
    
    let coherenceScore = 0;
    
    // Check average sentence length
    const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgLength >= 3 && avgLength <= 20) coherenceScore += 0.3;
    
    // Check for proper capitalization
    const properCaps = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
    coherenceScore += (properCaps / sentences.length) * 0.3;
    
    // Check for reasonable word variety
    const words = message.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const variety = uniqueWords.size / words.length;
    coherenceScore += variety * 0.4;
    
    return Math.min(coherenceScore, 1);
  }
  
  private detectEmotionalIntensity(message: string): number {
    const intenseWords = [
      'extremely', 'absolutely', 'completely', 'totally', 'utterly',
      'desperate', 'unbearable', 'overwhelming', 'devastating', 'crushing'
    ];
    
    const words = message.toLowerCase().split(/\s+/);
    const intenseCount = words.filter(w => intenseWords.some(i => w.includes(i))).length;
    const exclamations = (message.match(/!/g) || []).length;
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    
    let intensity = (intenseCount / words.length) * 2;
    intensity += exclamations * 0.15;
    intensity += capsRatio * 0.5;
    
    return Math.min(intensity, 1);
  }
  
  private calculateMessageSeverity(message: string): number {
    const sentiment = this.analyzeSentiment(message);
    const urgency = this.detectUrgency(message);
    const intensity = this.detectEmotionalIntensity(message);
    
    // Check for crisis keywords
    const lowerMessage = message.toLowerCase();
    let keywordSeverity = 0;
    
    if (this.CRISIS_INDICATORS.immediate.some(k => lowerMessage.includes(k))) {
      keywordSeverity = 1.0;
    } else if (this.CRISIS_INDICATORS.high.some(k => lowerMessage.includes(k))) {
      keywordSeverity = 0.7;
    } else if (this.CRISIS_INDICATORS.moderate.some(k => lowerMessage.includes(k))) {
      keywordSeverity = 0.4;
    }
    
    // Weighted calculation
    return (
      (1 - sentiment) * 0.2 +  // Negative sentiment
      urgency * 0.25 +
      intensity * 0.25 +
      keywordSeverity * 0.3
    );
  }
  
  private calculateConfidence(
    activityCount: number,
    patterns: BehaviorPattern[],
    anomalies: AnomalyDetection[]
  ): number {
    // More data = higher confidence
    const dataConfidence = Math.min(activityCount / 20, 1) * 0.4;
    
    // Clear patterns = higher confidence
    const patternConfidence = patterns.length > 0 ? 
      patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length * 0.3 : 
      0.2;
    
    // Strong anomalies = higher confidence
    const anomalyConfidence = anomalies.length > 0 ?
      Math.min(anomalies.reduce((sum, a) => sum + Math.abs(a.deviation), 0) / 10, 1) * 0.3 :
      0.2;
    
    return dataConfidence + patternConfidence + anomalyConfidence;
  }
  
  private getPatternTimeline(activities: UserActivity[], patternType: string): PatternTimeline {
    const relevantActivities = activities.filter(a => 
      Date.now() - a.timestamp.getTime() < 3600000 // Last hour
    );
    
    if (relevantActivities.length === 0) {
      return {
        start: new Date(),
        duration: 0,
        frequency: 0,
        trend: 'stable',
      };
    }
    
    const start = relevantActivities[relevantActivities.length - 1].timestamp;
    const duration = (Date.now() - start.getTime()) / 60000; // minutes
    const frequency = relevantActivities.length;
    
    // Determine trend
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (relevantActivities.length >= 3) {
      const firstHalf = relevantActivities.slice(0, Math.floor(relevantActivities.length / 2));
      const secondHalf = relevantActivities.slice(Math.floor(relevantActivities.length / 2));
      
      const firstRate = firstHalf.length / (firstHalf[firstHalf.length - 1].timestamp.getTime() - firstHalf[0].timestamp.getTime());
      const secondRate = secondHalf.length / (secondHalf[secondHalf.length - 1].timestamp.getTime() - secondHalf[0].timestamp.getTime());
      
      if (secondRate > firstRate * 1.2) trend = 'increasing';
      else if (secondRate < firstRate * 0.8) trend = 'decreasing';
    }
    
    return { start, duration, frequency, trend };
  }
  
  private getFailsafeAnalysis(): BehaviorAnalysisResult {
    return {
      riskLevel: 0.5,
      patterns: [],
      concerns: [{
        level: 'medium',
        type: 'ANALYSIS_ERROR',
        description: 'Unable to complete behavior analysis',
        actionRequired: false,
      }],
      needsIntervention: false,
      recommendations: ['Manual review recommended'],
      confidence: 0,
      escalationRisk: {
        probability: 0,
        timeframe: 'unknown',
        indicators: [],
        preventionStrategies: [],
      },
      anomalies: [],
      sessionQuality: {
        score: 50,
        engagement: 0.5,
        therapeutic: 0.5,
        effectiveness: 0.5,
        improvements: [],
      },
      timestamp: new Date(),
    };
  }
  
  private getDefaultVolunteerMetrics(volunteerId: string): VolunteerMetrics {
    return {
      volunteerId,
      burnoutRisk: 0.3,
      performanceScore: 0.7,
      fatigueIndicators: [],
      recommendations: ['Continue current approach'],
      shiftQuality: {
        responseTime: 1000,
        empathyScore: 0.7,
        accuracyScore: 0.7,
        engagementLevel: 0.7,
        breakPatterns: [],
      },
    };
  }
  
  // Additional helper methods
  private detectHelpRejection(message: string, activities: UserActivity[]): boolean {
    const rejectionPhrases = [
      'dont want help',
      'leave me alone',
      'cant help me',
      'no point',
      'doesnt matter',
      'wont work'
    ];
    
    const lowerMessage = message.toLowerCase().replace(/['"]/g, '');
    return rejectionPhrases.some(phrase => lowerMessage.includes(phrase));
  }
  
  private detectIsolationTendency(
    activities: UserActivity[],
    baseline: UserBaseline
  ): BehaviorPattern | null {
    // Check for decreasing engagement
    const recentEngagement = activities.filter(a => 
      a.type === 'message' && 
      Date.now() - a.timestamp.getTime() < 1800000
    ).length;
    
    const historicalEngagement = baseline.averageMessageCount || 10;
    
    if (recentEngagement < historicalEngagement * 0.3) {
      return {
        type: PatternType.ISOLATION_TENDENCY,
        severity: 0.6,
        confidence: 0.7,
        indicators: ['Decreased engagement', 'Withdrawal from interaction'],
        timeline: this.getPatternTimeline(activities, 'isolation'),
      };
    }
    
    return null;
  }
  
  private detectPanicPattern(
    message: string,
    activities: UserActivity[]
  ): BehaviorPattern | null {
    const panicIndicators = [
      'cant breathe',
      'heart racing',
      'panic attack',
      'freaking out',
      'losing control',
      'going crazy'
    ];
    
    const lowerMessage = message.toLowerCase();
    const hasPanicWords = panicIndicators.some(indicator => lowerMessage.includes(indicator));
    
    if (hasPanicWords) {
      return {
        type: PatternType.PANIC_PATTERN,
        severity: 0.8,
        confidence: 0.85,
        indicators: ['Panic symptoms reported', 'Acute anxiety state'],
        timeline: this.getPatternTimeline(activities, 'panic'),
      };
    }
    
    return null;
  }
  
  private detectSelfHarmIndicators(
    message: string,
    activities: UserActivity[]
  ): BehaviorPattern | null {
    const selfHarmIndicators = [
      'hurt myself',
      'cut myself',
      'self harm',
      'punish myself',
      'deserve pain'
    ];
    
    const lowerMessage = message.toLowerCase();
    const hasSelfHarmWords = selfHarmIndicators.some(indicator => lowerMessage.includes(indicator));
    
    if (hasSelfHarmWords) {
      return {
        type: PatternType.SELF_HARM_INDICATORS,
        severity: 0.9,
        confidence: 0.9,
        indicators: ['Self-harm ideation present', 'Immediate safety concern'],
        timeline: this.getPatternTimeline(activities, 'self_harm'),
      };
    }
    
    return null;
  }
  
  private aggregateMetrics(): void {
    // Periodic aggregation of metrics for reporting
    console.log(`📊 Aggregating behavioral metrics at ${new Date().toISOString()}`);
    
    // Clean old cache entries
    const oneHourAgo = Date.now() - 3600000;
    this.patternCache.forEach((patterns, userId) => {
      const recentPatterns = patterns.filter(p => 
        p.timeline.start.getTime() > oneHourAgo
      );
      if (recentPatterns.length === 0) {
        this.patternCache.delete(userId);
      } else {
        this.patternCache.set(userId, recentPatterns);
      }
    });
    
    // Emit aggregated metrics
    this.emit('metricsAggregated', {
      activeUsers: this.patternCache.size,
      activeSessions: this.sessionMetrics.size,
      volunteersMonitored: this.volunteerMetrics.size,
    });
  }
  
  // Additional helper methods continue...
  private predictEscalationTimeframe(probability: number, patterns: BehaviorPattern[]): string {
    if (probability > 0.8) return 'next 15 minutes';
    if (probability > 0.6) return 'next 30 minutes';
    if (probability > 0.4) return 'next hour';
    return 'next 2 hours';
  }
  
  private generatePreventionStrategies(
    patterns: BehaviorPattern[],
    crisisIndicators: CrisisIndicators,
    probability: number
  ): string[] {
    const strategies: string[] = [];
    
    if (probability > 0.7) {
      strategies.push('Immediate de-escalation required');
      strategies.push('Consider crisis protocol activation');
    }
    
    if (patterns.some(p => p.type === PatternType.EMOTIONAL_DYSREGULATION)) {
      strategies.push('Apply emotional regulation techniques');
    }
    
    if (crisisIndicators.immediate.length > 0) {
      strategies.push('Safety assessment critical');
      strategies.push('Develop safety plan immediately');
    }
    
    return strategies;
  }
  
  // Continue with remaining helper methods...
  private calculateUrgencyTrend(messages: UserActivity[]): number {
    if (messages.length < 2) return 0;
    
    let trend = 0;
    for (let i = 1; i < messages.length; i++) {
      const prevUrgency = messages[i-1].metadata?.urgency || 0;
      const currUrgency = messages[i].metadata?.urgency || 0;
      trend += currUrgency - prevUrgency;
    }
    
    return trend / (messages.length - 1);
  }
  
  private calculateFrequencyAcceleration(activities: UserActivity[]): number {
    const timeWindows = [300000, 600000, 900000]; // 5, 10, 15 minutes
    const frequencies: number[] = [];
    
    timeWindows.forEach(window => {
      const count = activities.filter(a => 
        Date.now() - a.timestamp.getTime() < window
      ).length;
      frequencies.push(count / (window / 60000)); // Messages per minute
    });
    
    // Calculate acceleration
    if (frequencies.length < 2) return 1;
    
    let acceleration = 0;
    for (let i = 1; i < frequencies.length; i++) {
      acceleration += frequencies[i] / frequencies[i-1];
    }
    
    return acceleration / (frequencies.length - 1);
  }
  
  private detectFragmentation(message: string): number {
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0.8;
    
    // Check for incomplete thoughts
    const incompleteCount = sentences.filter(s => {
      const words = s.trim().split(/\s+/);
      return words.length < 3 || !s.trim().match(/^[A-Z]/);
    }).length;
    
    return incompleteCount / sentences.length;
  }
  
  private calculateStyleDeviation(message: string, baselineStyle: string): number {
    // Simplified style comparison
    const currentLength = message.split(/\s+/).length;
    const baselineLength = baselineStyle === 'verbose' ? 50 : baselineStyle === 'moderate' ? 20 : 10;
    
    return Math.abs(currentLength - baselineLength) / baselineLength;
  }
  
  private detectEmotionalSwings(activities: UserActivity[]): number {
    const emotions = activities
      .filter(a => a.metadata?.emotion)
      .map(a => a.metadata.emotion);
    
    if (emotions.length < 2) return 0;
    
    let swings = 0;
    for (let i = 1; i < emotions.length; i++) {
      if (Math.abs(emotions[i] - emotions[i-1]) > 0.5) {
        swings++;
      }
    }
    
    return swings / (emotions.length - 1);
  }
  
  private detectExtremeEmotions(message: string): string[] {
    const extremeEmotions: Record<string, string[]> = {
      rage: ['hate', 'furious', 'rage', 'angry'],
      despair: ['hopeless', 'worthless', 'meaningless', 'empty'],
      panic: ['terrified', 'panic', 'cant breathe', 'dying'],
    };
    
    const detected: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    Object.entries(extremeEmotions).forEach(([emotion, keywords]) => {
      if (keywords.some(k => lowerMessage.includes(k))) {
        detected.push(emotion);
      }
    });
    
    return detected;
  }
  
  private calculateEmotionalDeviation(message: string, baseline: number): number {
    const currentEmotion = this.detectEmotionalIntensity(message);
    return Math.abs(currentEmotion - baseline) / 0.2; // Standard deviation approximation
  }
  
  private detectCommunicationStyleChange(
    analysis: MessageAnalysis,
    baseline: UserBaseline
  ): AnomalyDetection | null {
    const baselineWordCount = baseline.averageWordCount || 20;
    const deviation = Math.abs(analysis.wordCount - baselineWordCount) / (baseline.wordCountStdDev || 5);
    
    if (deviation > this.THRESHOLDS.ANOMALY_DEVIATION) {
      return {
        type: AnomalyType.COMMUNICATION_STYLE_CHANGE,
        deviation,
        description: `Message length ${analysis.wordCount > baselineWordCount ? 'increased' : 'decreased'} significantly`,
        riskLevel: deviation / 4,
      };
    }
    
    return null;
  }
  
  private detectResponsePatternDeviation(
    activities: UserActivity[],
    baseline: UserBaseline
  ): AnomalyDetection | null {
    // Check response time patterns
    const recentResponses = activities.filter(a => a.type === 'response');
    if (recentResponses.length < 2) return null;
    
    const avgResponseTime = recentResponses.reduce((sum, r, i) => {
      if (i === 0) return sum;
      return sum + (r.timestamp.getTime() - recentResponses[i-1].timestamp.getTime());
    }, 0) / (recentResponses.length - 1);
    
    const baselineResponseTime = baseline.averageResponseTime || 120000; // 2 minutes
    const deviation = Math.abs(avgResponseTime - baselineResponseTime) / (baseline.responseTimeStdDev || 30000);
    
    if (deviation > this.THRESHOLDS.ANOMALY_DEVIATION) {
      return {
        type: AnomalyType.RESPONSE_PATTERN_DEVIATION,
        deviation,
        description: 'Response pattern significantly different from normal',
        riskLevel: deviation / 3,
      };
    }
    
    return null;
  }
  
  private detectEmotionalStateShift(
    analysis: MessageAnalysis,
    baseline: UserBaseline
  ): AnomalyDetection | null {
    const currentSentiment = analysis.sentiment;
    const baselineSentiment = baseline.averageSentiment || 0.5;
    
    const deviation = Math.abs(currentSentiment - baselineSentiment) / (baseline.sentimentStdDev || 0.15);
    
    if (deviation > this.THRESHOLDS.ANOMALY_DEVIATION) {
      return {
        type: AnomalyType.EMOTIONAL_STATE_SHIFT,
        deviation,
        description: `Emotional state ${currentSentiment < baselineSentiment ? 'deteriorated' : 'improved'} significantly`,
        riskLevel: currentSentiment < baselineSentiment ? deviation / 2.5 : deviation / 5,
      };
    }
    
    return null;
  }
  
  private calculateTimeDeviation(currentHour: number, typicalHours: number[]): number {
    const minDistance = Math.min(...typicalHours.map(h => 
      Math.min(Math.abs(currentHour - h), 24 - Math.abs(currentHour - h))
    ));
    
    return minDistance / 3; // Normalize to ~standard deviations
  }
  
  private detectRecentEscalation(activities: UserActivity[]): boolean {
    const recent = activities.filter(a => 
      Date.now() - a.timestamp.getTime() < 600000 // Last 10 minutes
    );
    
    if (recent.length < 3) return false;
    
    const severities = recent
      .filter(a => a.metadata?.severity)
      .map(a => a.metadata.severity);
    
    if (severities.length < 3) return false;
    
    // Check if severity is increasing
    for (let i = 1; i < severities.length; i++) {
      if (severities[i] <= severities[i-1]) return false;
    }
    
    return true;
  }
  
  private async getSessionData(sessionId: string): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      messages: 10,
      duration: 1800000, // 30 minutes
      interventions: 3,
      userSatisfaction: 0.7,
    };
  }
  
  private async getCurrentSessionData(userId: string): Promise<any> {
    // Mock implementation
    return {
      messages: 5,
      duration: 900000, // 15 minutes
      interventions: 2,
      userSatisfaction: 0.6,
    };
  }
  
  private calculateEngagementScore(sessionData: any): number {
    const messageRate = sessionData.messages / (sessionData.duration / 60000);
    const normalizedRate = Math.min(messageRate / 2, 1); // 2 messages per minute = full engagement
    
    return normalizedRate;
  }
  
  private calculateTherapeuticValue(sessionData: any): number {
    const interventionQuality = sessionData.interventions / sessionData.messages;
    const satisfaction = sessionData.userSatisfaction || 0.5;
    
    return (interventionQuality + satisfaction) / 2;
  }
  
  private calculateEffectivenessScore(sessionData: any): number {
    return sessionData.userSatisfaction || 0.5;
  }
  
  private identifySessionImprovements(
    engagement: number,
    therapeutic: number,
    effectiveness: number,
    sessionData: any
  ): string[] {
    const improvements: string[] = [];
    
    if (engagement < 0.5) {
      improvements.push('Increase user engagement through active listening');
    }
    
    if (therapeutic < 0.5) {
      improvements.push('Apply more therapeutic interventions');
    }
    
    if (effectiveness < 0.5) {
      improvements.push('Focus on addressing user\'s primary concerns');
    }
    
    if (sessionData.duration > 3600000) {
      improvements.push('Consider session time management');
    }
    
    return improvements;
  }
  
  private async getVolunteerHistory(volunteerId: string): Promise<VolunteerHistory> {
    // Mock implementation
    return {
      volunteerId,
      averageResponseTime: 1500,
      averageEmpathy: 0.75,
      averageAccuracy: 0.8,
      averageBreaks: 3,
      averageShiftDuration: 7200000, // 2 hours
    };
  }
  
  private calculateAverageResponseTime(responses: any[]): number {
    // Mock calculation
    return 1200;
  }
  
  private calculateEmpathyScore(messages: any[]): number {
    // Mock calculation
    return 0.7;
  }
  
  private calculateAccuracyScore(interventions: any[], outcomes: any[]): number {
    // Mock calculation
    return 0.75;
  }
  
  private calculateVolunteerEngagement(sessionData: any): number {
    // Mock calculation
    return 0.65;
  }
  
  private analyzeBreakPatterns(breaks: any[]): BreakPattern[] {
    // Mock implementation
    return [
      { frequency: 3, duration: 300000, reason: 'scheduled' },
      { frequency: 1, duration: 600000, reason: 'fatigue' },
    ];
  }
  
  private calculatePerformanceScore(
    shiftQuality: ShiftQualityMetrics,
    sessionData: any
  ): number {
    return (
      shiftQuality.empathyScore * 0.3 +
      shiftQuality.accuracyScore * 0.3 +
      shiftQuality.engagementLevel * 0.2 +
      (1 - Math.min(shiftQuality.responseTime / 3000, 1)) * 0.2
    );
  }
}

// Type definitions for better type safety
interface UserBaseline {
  userId: string;
  averageSeverity: number;
  severityStdDev: number;
  typicalActiveHours: number[];
  communicationStyle: string;
  emotionalBaseline: number;
  responsePatterns: any[];
  averageWordCount?: number;
  wordCountStdDev?: number;
  averageResponseTime?: number;
  responseTimeStdDev?: number;
  averageSentiment?: number;
  sentimentStdDev?: number;
  averageMessageCount?: number;
}

interface MessageAnalysis {
  sentiment: number;
  urgency: number;
  coherence: number;
  emotionalIntensity: number;
  severity: number;
  wordCount: number;
  capsRatio: number;
}

interface CrisisIndicators {
  immediate: string[];
  high: string[];
  moderate: string[];
  escalation: string[];
}

interface AnalysisContext {
  sessionId?: string;
  volunteerId?: string;
  previousAnalysis?: BehaviorAnalysisResult;
}

interface VolunteerSessionData {
  responses: any[];
  messages: any[];
  interventions: any[];
  outcomes: any[];
  breaks: any[];
  totalDuration: number;
}

interface VolunteerHistory {
  volunteerId: string;
  averageResponseTime: number;
  averageEmpathy: number;
  averageAccuracy: number;
  averageBreaks: number;
  averageShiftDuration: number;
}

// Export singleton instance
export const behaviorAnalyzer = BehaviorAnalyzer.getInstance();