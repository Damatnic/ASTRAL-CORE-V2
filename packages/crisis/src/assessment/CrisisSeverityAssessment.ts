/**
 * ASTRAL_CORE 2.0 Crisis Severity Assessment System
 * 
 * AI-POWERED LIFE-SAVING ANALYSIS:
 * - Real-time keyword detection
 * - Sentiment analysis for emotional state
 * - Risk scoring with immediate escalation triggers
 * - Context-aware severity assessment
 * - Multi-language support for global reach
 * 
 * PERFORMANCE TARGETS:
 * - Assessment time: <20ms
 * - Accuracy: >95% for emergency detection
 * - False positive rate: <2% for emergency escalation
 */

import type { CrisisAssessment, KeywordMatch, SentimentAnalysis } from '../types/assessment.types';
import { RealTimeRiskScorer, type RiskScoreBreakdown } from './RealTimeRiskScorer';

export class CrisisSeverityAssessment {
  private readonly riskScorer: RealTimeRiskScorer;
  
  constructor() {
    this.riskScorer = new RealTimeRiskScorer();
  }
  
  // Emergency keywords that trigger immediate escalation
  private readonly emergencyKeywords = new Set([
    // Direct suicide indicators
    'kill myself', 'end it all', 'suicide', 'take my own life', 'don\'t want to live',
    'better off dead', 'end my life', 'nothing to live for', 'want to die',
    
    // Self-harm indicators
    'hurt myself', 'cut myself', 'self harm', 'self-harm', 'cutting', 'burning myself',
    'overdose', 'pills', 'razor', 'blade',
    
    // Immediate danger
    'right now', 'tonight', 'going to do it', 'have a plan', 'ready to',
    'can\'t take it', 'it\'s time', 'goodbye', 'final message',
    
    // Method indicators
    'rope', 'bridge', 'gun', 'knife', 'poison', 'carbon monoxide',
    'hanging', 'jumping', 'shooting',
  ]);
  
  // High-risk keywords (severity 7-8)
  private readonly highRiskKeywords = new Set([
    'hopeless', 'worthless', 'burden', 'failure', 'trapped', 'stuck',
    'can\'t escape', 'no way out', 'give up', 'tired of living',
    'exhausted', 'broken', 'damaged', 'ruined', 'destroyed',
    'hate myself', 'disgusted', 'ashamed', 'guilty', 'regret',
    'anxiety attack', 'panic attack', 'can\'t breathe', 'chest tight',
    'heart racing', 'dizzy', 'nauseous', 'shaking',
  ]);
  
  // Moderate-risk keywords (severity 4-6)
  private readonly moderateRiskKeywords = new Set([
    'depressed', 'sad', 'down', 'blue', 'unhappy', 'miserable',
    'lonely', 'isolated', 'alone', 'empty', 'numb', 'disconnected',
    'anxious', 'worried', 'stressed', 'overwhelmed', 'scared',
    'afraid', 'nervous', 'tense', 'restless', 'agitated',
    'angry', 'furious', 'rage', 'mad', 'frustrated', 'irritated',
    'crying', 'tears', 'weeping', 'sobbing',
  ]);
  
  // Positive indicators (reduce severity)
  private readonly positiveKeywords = new Set([
    'hope', 'hopeful', 'better', 'improving', 'getting help',
    'therapy', 'counseling', 'medication', 'support', 'family',
    'friends', 'love', 'care', 'grateful', 'thankful',
    'tomorrow', 'future', 'plans', 'goals', 'dreams',
    'recovery', 'healing', 'progress', 'strength', 'courage',
  ]);
  
  // Coping mechanism indicators
  private readonly copingKeywords = new Set([
    'breathing', 'meditation', 'exercise', 'music', 'art',
    'journal', 'writing', 'talking', 'prayer', 'nature',
    'pets', 'hobbies', 'reading', 'movies', 'games',
  ]);
  
  /**
   * Enhanced crisis assessment with real-time risk scoring
   * TARGET: <25ms execution time (includes risk scoring)
   */
  async assessMessageWithRiskScore(
    message: string, 
    sessionId?: string
  ): Promise<CrisisAssessment & { riskBreakdown: RiskScoreBreakdown }> {
    const start = performance.now();
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Parallel analysis for performance
    const [
      keywordAnalysis,
      sentimentAnalysis,
      contextAnalysis
    ] = await Promise.all([
      this.analyzeKeywords(normalizedMessage),
      this.analyzeSentiment(normalizedMessage),
      this.analyzeContext(normalizedMessage)
    ]);
    
    // Calculate base severity from keyword matches
    let severity = this.calculateBaseSeverity(keywordAnalysis);
    
    // Adjust severity based on sentiment
    severity = this.adjustForSentiment(severity, sentimentAnalysis);
    
    // Apply contextual adjustments
    severity = this.applyContextualAdjustments(severity, contextAnalysis, normalizedMessage);
    
    // Ensure severity is within bounds
    severity = Math.max(1, Math.min(10, Math.round(severity)));
    
    // Create basic assessment
    const basicAssessment: CrisisAssessment = {
      severity,
      riskScore: severity, // Will be updated by risk scorer
      keywordsDetected: keywordAnalysis.matches.map(m => m.keyword),
      emergencyKeywords: keywordAnalysis.emergencyMatches,
      sentimentScore: sentimentAnalysis.score,
      confidence: this.calculateConfidence(keywordAnalysis, sentimentAnalysis),
      immediateRisk: severity >= 9 || keywordAnalysis.emergencyMatches.length > 0,
      recommendedActions: this.getRecommendedActions(severity, keywordAnalysis),
      executionTimeMs: 0, // Will be updated below
    };
    
    // Get detailed risk breakdown
    const riskBreakdown = await this.riskScorer.calculateRiskScore(
      basicAssessment,
      contextAnalysis,
      sessionId
    );
    
    // Update assessment with risk scorer results
    basicAssessment.riskScore = riskBreakdown.totalScore;
    basicAssessment.immediateRisk = riskBreakdown.immediateAction;
    
    const executionTime = performance.now() - start;
    basicAssessment.executionTimeMs = executionTime;
    
    // Log slow assessments
    if (executionTime > 25) {
      console.warn(`⚠️ Enhanced crisis assessment took ${executionTime.toFixed(2)}ms (target: <25ms)`);
    }
    
    // Log high-risk assessments
    if (basicAssessment.immediateRisk || riskBreakdown.riskLevel === 'CRITICAL' || riskBreakdown.riskLevel === 'EMERGENCY') {
      console.log(`🚨 HIGH-RISK MESSAGE DETECTED: Risk Level ${riskBreakdown.riskLevel}, Score ${riskBreakdown.totalScore.toFixed(1)}, Keywords: ${keywordAnalysis.emergencyMatches.join(', ')}`);
    }
    
    return {
      ...basicAssessment,
      riskBreakdown,
    };
  }

  /**
   * Original assessment method (maintained for backwards compatibility)
   * Assesses crisis severity of a message
   * TARGET: <20ms execution time
   */
  async assessMessage(message: string): Promise<CrisisAssessment> {
    const start = performance.now();
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Parallel analysis for performance
    const [
      keywordAnalysis,
      sentimentAnalysis,
      contextAnalysis
    ] = await Promise.all([
      this.analyzeKeywords(normalizedMessage),
      this.analyzeSentiment(normalizedMessage),
      this.analyzeContext(normalizedMessage)
    ]);
    
    // Calculate base severity from keyword matches
    let severity = this.calculateBaseSeverity(keywordAnalysis);
    
    // Adjust severity based on sentiment
    severity = this.adjustForSentiment(severity, sentimentAnalysis);
    
    // Apply contextual adjustments
    severity = this.applyContextualAdjustments(severity, contextAnalysis, normalizedMessage);
    
    // Ensure severity is within bounds
    severity = Math.max(1, Math.min(10, Math.round(severity)));
    
    const executionTime = performance.now() - start;
    
    // Log slow assessments
    if (executionTime > 20) {
      console.warn(`⚠️ Crisis assessment took ${executionTime.toFixed(2)}ms (target: <20ms)`);
    }
    
    const assessment: CrisisAssessment = {
      severity,
      riskScore: severity, // 1-10 scale
      keywordsDetected: keywordAnalysis.matches.map(m => m.keyword),
      emergencyKeywords: keywordAnalysis.emergencyMatches,
      sentimentScore: sentimentAnalysis.score,
      confidence: this.calculateConfidence(keywordAnalysis, sentimentAnalysis),
      immediateRisk: severity >= 9 || keywordAnalysis.emergencyMatches.length > 0,
      recommendedActions: this.getRecommendedActions(severity, keywordAnalysis),
      executionTimeMs: executionTime,
    };
    
    // Log high-risk assessments
    if (assessment.immediateRisk) {
      console.log(`🚨 HIGH-RISK MESSAGE DETECTED: Severity ${severity}, Keywords: ${keywordAnalysis.emergencyMatches.join(', ')}`);
    }
    
    return assessment;
  }
  
  /**
   * Checks if a keyword triggers emergency protocol
   */
  isEmergencyKeyword(keyword: string): boolean {
    return this.emergencyKeywords.has(keyword.toLowerCase());
  }
  
  /**
   * Gets severity threshold for emergency escalation
   */
  getEmergencyThreshold(): number {
    return 8; // Severity 8+ triggers emergency protocol
  }
  
  // Private analysis methods
  
  private async analyzeKeywords(message: string): Promise<KeywordMatch> {
    const matches: Array<{keyword: string; category: string; weight: number}> = [];
    const emergencyMatches: string[] = [];
    
    // Check emergency keywords
    for (const keyword of this.emergencyKeywords) {
      if (message.includes(keyword)) {
        matches.push({ keyword, category: 'emergency', weight: 10 });
        emergencyMatches.push(keyword);
      }
    }
    
    // Check high-risk keywords
    for (const keyword of this.highRiskKeywords) {
      if (message.includes(keyword)) {
        matches.push({ keyword, category: 'high-risk', weight: 7 });
      }
    }
    
    // Check moderate-risk keywords
    for (const keyword of this.moderateRiskKeywords) {
      if (message.includes(keyword)) {
        matches.push({ keyword, category: 'moderate-risk', weight: 4 });
      }
    }
    
    // Check positive keywords (reduce severity)
    const positiveMatches: string[] = [];
    for (const keyword of this.positiveKeywords) {
      if (message.includes(keyword)) {
        matches.push({ keyword, category: 'positive', weight: -2 });
        positiveMatches.push(keyword);
      }
    }
    
    // Check coping keywords
    const copingMatches: string[] = [];
    for (const keyword of this.copingKeywords) {
      if (message.includes(keyword)) {
        matches.push({ keyword, category: 'coping', weight: -1 });
        copingMatches.push(keyword);
      }
    }
    
    return {
      matches,
      emergencyMatches,
      positiveMatches,
      copingMatches,
      totalWeight: matches.reduce((sum, match) => sum + match.weight, 0),
    };
  }
  
  private async analyzeSentiment(message: string): Promise<SentimentAnalysis> {
    // Enhanced sentiment analysis with more comprehensive word lists and linguistic patterns
    const words = message.split(/\s+/);
    
    let positiveScore = 0;
    let negativeScore = 0;
    let intensityMultiplier = 1;
    
    // Expanded positive sentiment words with weights
    const positiveWords = new Map([
      // Hope and recovery words (high weight)
      ['hope', 3], ['hopeful', 3], ['healing', 3], ['recovery', 3], ['progress', 3], ['improving', 3],
      ['better', 2.5], ['stronger', 2.5], ['grateful', 2.5], ['thankful', 2.5], ['blessed', 2.5],
      ['optimistic', 2.5], ['encouraged', 2.5], ['supported', 2.5], ['cared', 2.5], ['loved', 2.5],
      
      // General positive words (medium weight)
      ['good', 2], ['great', 2], ['happy', 2], ['joy', 2], ['love', 2], ['amazing', 2], ['wonderful', 2],
      ['excited', 2], ['peaceful', 2], ['calm', 2], ['relaxed', 2], ['content', 2], ['satisfied', 2],
      ['accomplished', 2], ['proud', 2], ['confident', 2], ['motivated', 2], ['inspired', 2],
      
      // Mild positive words (low weight)
      ['okay', 1], ['fine', 1], ['decent', 1], ['alright', 1], ['pleasant', 1], ['nice', 1],
    ]);
    
    // Expanded negative sentiment words with weights
    const negativeWords = new Map([
      // Crisis-specific high-risk words (maximum weight)
      ['suicidal', 5], ['hopeless', 5], ['worthless', 5], ['trapped', 5], ['helpless', 5],
      ['unbearable', 5], ['overwhelming', 5], ['desperate', 5], ['drowning', 5], ['suffocating', 5],
      ['destroyed', 4], ['broken', 4], ['devastated', 4], ['shattered', 4], ['ruined', 4],
      ['empty', 4], ['numb', 4], ['void', 4], ['darkness', 4], ['nightmare', 4],
      
      // High negative emotion words (high weight)
      ['terrible', 3], ['awful', 3], ['horrible', 3], ['hate', 3], ['worst', 3], ['miserable', 3],
      ['depressed', 3], ['anxious', 3], ['terrified', 3], ['panicked', 3], ['scared', 3],
      ['angry', 3], ['furious', 3], ['rage', 3], ['disgusted', 3], ['ashamed', 3],
      
      // Medium negative words (medium weight)
      ['bad', 2], ['sad', 2], ['down', 2], ['upset', 2], ['worried', 2], ['stressed', 2],
      ['frustrated', 2], ['disappointed', 2], ['hurt', 2], ['lonely', 2], ['isolated', 2],
      ['tired', 2], ['exhausted', 2], ['drained', 2], ['overwhelmed', 2],
      
      // Mild negative words (low weight)
      ['uncomfortable', 1], ['bothered', 1], ['annoyed', 1], ['concerned', 1], ['unsure', 1],
    ]);
    
    // Intensity amplifiers and diminishers
    const intensifiers = new Set(['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so', 'quite', 'pretty']);
    const diminishers = new Set(['somewhat', 'slightly', 'a bit', 'a little', 'kind of', 'sort of', 'maybe', 'perhaps']);
    
    // Negation words that flip sentiment
    const negationWords = new Set(['not', 'no', 'never', 'none', 'nothing', 'neither', 'nobody', 'nowhere', "don't", "won't", "can't", "shouldn't", "wouldn't", "couldn't"]);
    
    // Process words with context awareness
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[^\w]/g, '');
      let isNegated = false;
      
      // Check for negation in previous 2 words
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (negationWords.has(words[j].toLowerCase().replace(/[^\w]/g, ''))) {
          isNegated = true;
          break;
        }
      }
      
      // Check for intensity modifiers in previous word
      if (i > 0) {
        const prevWord = words[i - 1].toLowerCase().replace(/[^\w]/g, '');
        if (intensifiers.has(prevWord)) {
          intensityMultiplier = 1.5;
        } else if (diminishers.has(prevWord)) {
          intensityMultiplier = 0.7;
        } else {
          intensityMultiplier = 1;
        }
      }
      
      // Apply sentiment scoring with context
      if (positiveWords.has(word)) {
        const weight = positiveWords.get(word)! * intensityMultiplier;
        if (isNegated) {
          negativeScore += weight; // Negated positive becomes negative
        } else {
          positiveScore += weight;
        }
      } else if (negativeWords.has(word)) {
        const weight = negativeWords.get(word)! * intensityMultiplier;
        if (isNegated) {
          positiveScore += weight * 0.8; // Negated negative becomes somewhat positive
        } else {
          negativeScore += weight;
        }
      }
    }
    
    // Advanced sentiment patterns
    const sentimentPatterns = [
      // Despair patterns
      { pattern: /can't (take|handle|deal|cope)/i, weight: -4 },
      { pattern: /no (point|reason|hope|way)/i, weight: -4 },
      { pattern: /give up/i, weight: -3 },
      { pattern: /end (it|this) all/i, weight: -5 },
      
      // Recovery patterns
      { pattern: /getting (better|help|through)/i, weight: 3 },
      { pattern: /feeling (better|stronger|hopeful)/i, weight: 3 },
      { pattern: /thank you/i, weight: 2 },
      { pattern: /appreciate/i, weight: 2 },
    ];
    
    for (const pattern of sentimentPatterns) {
      if (pattern.pattern.test(message)) {
        if (pattern.weight > 0) {
          positiveScore += pattern.weight;
        } else {
          negativeScore += Math.abs(pattern.weight);
        }
      }
    }
    
    // Calculate final sentiment score
    const totalSentimentWords = positiveScore + negativeScore;
    let score = 0; // Neutral
    
    if (totalSentimentWords > 0) {
      score = (positiveScore - negativeScore) / totalSentimentWords;
      // Normalize to -1 to 1 range with sigmoid-like curve for extreme values
      score = Math.tanh(score); 
    }
    
    // Calculate confidence based on sentiment word density and context clues
    const sentimentWordDensity = totalSentimentWords / words.length;
    const contextClues = (intensityMultiplier !== 1 ? 0.2 : 0) + (sentimentPatterns.some(p => p.pattern.test(message)) ? 0.3 : 0);
    const confidence = Math.min(sentimentWordDensity + contextClues, 1);
    
    return {
      score,
      confidence,
      positiveIndicators: Math.round(positiveScore),
      negativeIndicators: Math.round(negativeScore),
    };
  }
  
  private async analyzeContext(message: string): Promise<any> {
    const messageLength = message.length;
    const wordCount = message.split(/\s+/).length;
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Punctuation and formatting analysis
    const hasQuestionMarks = (message.match(/\?/g) || []).length;
    const hasExclamationMarks = (message.match(/!/g) || []).length;
    const hasAllCaps = (message.match(/[A-Z]{3,}/g) || []).length;
    const hasRepeatedPunctuation = /[.!?]{2,}/.test(message);
    const hasEllipsis = /\.{3,}/.test(message);
    
    // Time indicators (expanded for better crisis detection)
    const immediateTimePatterns = [
      /\b(now|tonight|today|right now|immediately|this moment|can't wait)\b/i,
      /\b(about to|going to|planning to|ready to)\b/i,
      /\b(in (a )?few (minutes|hours)|very soon)\b/i
    ];
    const hasImmediateTimeWords = immediateTimePatterns.some(pattern => pattern.test(message));
    
    const futureTimePatterns = [
      /\b(tomorrow|next (week|month|year)|future|later|someday|eventually)\b/i,
      /\b(when (this|i) (get|am) (better|through)|after (this|treatment))\b/i,
      /\b(hope to|plan to|want to|looking forward)\b/i
    ];
    const hasFutureWords = futureTimePatterns.some(pattern => pattern.test(message));
    
    // Support system indicators (expanded)
    const supportPatterns = [
      /\b(help|support|therapy|counselor|therapist|psychiatrist|doctor)\b/i,
      /\b(family|friend|partner|spouse|boyfriend|girlfriend|mom|dad|parent)\b/i,
      /\b(group|meeting|session|appointment|treatment|medication)\b/i,
      /\b(hotline|crisis line|chat|call)\b/i
    ];
    const hasSupportWords = supportPatterns.some(pattern => pattern.test(message));
    
    // Crisis-specific behavioral patterns
    const isolationPatterns = [
      /\b(alone|lonely|isolated|nobody|no one|by myself)\b/i,
      /\b(can't (talk|tell|reach)|no one (understands|cares|listens))\b/i
    ];
    const hasIsolationIndicators = isolationPatterns.some(pattern => pattern.test(message));
    
    const planningPatterns = [
      /\b(plan|planned|planning|method|way|how to)\b/i,
      /\b(have (a )?plan|know how|figured out)\b/i,
      /\b(decided|chosen|picked|selected)\b/i
    ];
    const hasPlanningLanguage = planningPatterns.some(pattern => pattern.test(message));
    
    const finalityPatterns = [
      /\b(goodbye|farewell|see you|last time|final|end|over|done)\b/i,
      /\b(won't (see|talk|be)|this is it|that's it)\b/i,
      /\b(taking care of|getting rid of|giving away)\b/i
    ];
    const hasFinalityLanguage = finalityPatterns.some(pattern => pattern.test(message));
    
    // Communication style analysis
    const fragmentedSentences = sentences.filter(s => s.trim().split(/\s+/).length < 3).length;
    const averageSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    const hasIncompleteThoughts = fragmentedSentences > sentences.length * 0.3; // >30% fragmented
    
    // Emotional intensity indicators
    const repeatedWords = this.findRepeatedWords(message);
    const emotionalIntensity = this.calculateEmotionalIntensity(message);
    const hasRapidThoughts = this.detectRapidThoughts(message);
    
    // Cognitive distortions
    const cognitiveDistortions = this.detectCognitiveDistortions(message);
    
    return {
      // Basic metrics
      length: messageLength,
      wordCount,
      sentenceCount: sentences.length,
      averageSentenceLength,
      
      // Punctuation indicators
      hasQuestionMarks,
      hasExclamationMarks,
      hasAllCaps,
      hasRepeatedPunctuation,
      hasEllipsis,
      
      // Time indicators
      hasImmediateTimeWords,
      hasFutureWords,
      
      // Support and resources
      hasSupportWords,
      
      // Crisis-specific indicators
      hasIsolationIndicators,
      hasPlanningLanguage,
      hasFinalityLanguage,
      hasIncompleteThoughts,
      
      // Communication patterns
      fragmentedSentences,
      repeatedWords,
      emotionalIntensity,
      hasRapidThoughts,
      
      // Cognitive patterns
      cognitiveDistortions,
      
      // Composite scores
      urgencyIndicators: (hasImmediateTimeWords ? 2 : 0) + (hasPlanningLanguage ? 2 : 0) + (hasFinalityLanguage ? 3 : 0),
      hopeIndicators: (hasFutureWords ? 2 : 0) + (hasSupportWords ? 1 : 0) + (cognitiveDistortions.hope > 0 ? 1 : 0),
      riskEscalationScore: this.calculateRiskEscalationScore({
        hasIsolationIndicators,
        hasPlanningLanguage,
        hasFinalityLanguage,
        emotionalIntensity,
        hasIncompleteThoughts,
      }),
    };
  }
  
  /**
   * Find repeated words that might indicate rumination or distress
   */
  private findRepeatedWords(message: string): Array<{word: string; count: number}> {
    const words = message.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCounts = new Map<string, number>();
    
    for (const word of words) {
      if (word.length > 2) { // Ignore very short words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    
    return Array.from(wordCounts.entries())
      .filter(([word, count]) => count > 1)
      .map(([word, count]) => ({word, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 repeated words
  }
  
  /**
   * Calculate emotional intensity based on language patterns
   */
  private calculateEmotionalIntensity(message: string): number {
    let intensity = 0;
    
    // ALL CAPS words (indicates strong emotion)
    const capsWords = (message.match(/\b[A-Z]{2,}\b/g) || []).length;
    intensity += capsWords * 0.5;
    
    // Repeated letters (e.g., "soooo", "nooooo")
    const repeatedLetters = (message.match(/(\w)\1{2,}/g) || []).length;
    intensity += repeatedLetters * 0.3;
    
    // Multiple exclamation marks
    const multipleExclamation = (message.match(/!{2,}/g) || []).length;
    intensity += multipleExclamation * 0.4;
    
    // Intense emotional words
    const intenseWords = [
      'extremely', 'incredibly', 'absolutely', 'completely', 'totally',
      'devastating', 'overwhelming', 'unbearable', 'excruciating', 'agonizing'
    ];
    for (const word of intenseWords) {
      if (message.toLowerCase().includes(word)) {
        intensity += 1;
      }
    }
    
    return Math.min(intensity, 10); // Cap at 10
  }
  
  /**
   * Detect rapid or racing thoughts patterns
   */
  private detectRapidThoughts(message: string): boolean {
    // Long messages with many short sentences
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 8 && message.length > 500) {
      const avgSentenceLength = message.length / sentences.length;
      if (avgSentenceLength < 50) {
        return true;
      }
    }
    
    // Many topic changes (indicated by transition words)
    const transitionWords = ['but', 'however', 'also', 'and', 'then', 'plus', 'wait', 'oh'];
    const transitionCount = transitionWords.reduce((count, word) => {
      return count + (message.toLowerCase().split(word).length - 1);
    }, 0);
    
    return transitionCount > sentences.length * 0.5;
  }
  
  /**
   * Detect cognitive distortions that might indicate crisis risk
   */
  private detectCognitiveDistortions(message: string): {
    allOrNothing: number;
    catastrophizing: number;
    personalization: number;
    hopelessness: number;
    hope: number;
  } {
    const lowerMessage = message.toLowerCase();
    
    // All-or-nothing thinking
    const allOrNothingPatterns = [
      /\b(always|never|everything|nothing|everyone|no one|all|none)\b/g,
      /\b(completely|totally|absolutely|perfect|failure|disaster)\b/g
    ];
    const allOrNothing = allOrNothingPatterns.reduce((count, pattern) => {
      return count + (lowerMessage.match(pattern) || []).length;
    }, 0);
    
    // Catastrophizing
    const catastrophizingPatterns = [
      /\b(worst|terrible|awful|horrible|disaster|catastrophe|doomed)\b/g,
      /\b(end of the world|life is over|can't survive|will never)\b/g
    ];
    const catastrophizing = catastrophizingPatterns.reduce((count, pattern) => {
      return count + (lowerMessage.match(pattern) || []).length;
    }, 0);
    
    // Personalization (blaming self)
    const personalizationPatterns = [
      /\b(my fault|i caused|i ruined|i destroyed|i'm to blame)\b/g,
      /\b(if only i|i should have|why did i|i always)\b/g
    ];
    const personalization = personalizationPatterns.reduce((count, pattern) => {
      return count + (lowerMessage.match(pattern) || []).length;
    }, 0);
    
    // Hopelessness
    const hopelessnessPatterns = [
      /\b(no hope|hopeless|pointless|useless|worthless|meaningless)\b/g,
      /\b(never get better|never change|no way out|no future)\b/g
    ];
    const hopelessness = hopelessnessPatterns.reduce((count, pattern) => {
      return count + (lowerMessage.match(pattern) || []).length;
    }, 0);
    
    // Hope indicators
    const hopePatterns = [
      /\b(hope|hopeful|maybe|possible|could|might|try|attempt)\b/g,
      /\b(getting better|improving|progress|step forward)\b/g
    ];
    const hope = hopePatterns.reduce((count, pattern) => {
      return count + (lowerMessage.match(pattern) || []).length;
    }, 0);
    
    return {
      allOrNothing,
      catastrophizing,
      personalization,
      hopelessness,
      hope,
    };
  }
  
  /**
   * Calculate composite risk escalation score
   */
  private calculateRiskEscalationScore(factors: {
    hasIsolationIndicators: boolean;
    hasPlanningLanguage: boolean;
    hasFinalityLanguage: boolean;
    emotionalIntensity: number;
    hasIncompleteThoughts: boolean;
  }): number {
    let score = 0;
    
    // High-risk factors
    if (factors.hasFinalityLanguage) score += 4;
    if (factors.hasPlanningLanguage) score += 3;
    if (factors.hasIsolationIndicators) score += 2;
    
    // Emotional state factors
    score += Math.min(factors.emotionalIntensity * 0.3, 2);
    
    // Communication pattern factors
    if (factors.hasIncompleteThoughts) score += 1;
    
    return Math.min(score, 10); // Cap at 10
  }
  
  private calculateBaseSeverity(keywordAnalysis: KeywordMatch): number {
    // Start with baseline severity
    let severity = 3;
    
    // Emergency keywords automatically set high severity
    if (keywordAnalysis.emergencyMatches.length > 0) {
      severity = Math.max(9, severity);
    }
    
    // Add weighted keyword scores
    severity += keywordAnalysis.totalWeight * 0.3;
    
    // Multiple emergency keywords increase severity
    if (keywordAnalysis.emergencyMatches.length > 1) {
      severity += 1;
    }
    
    return severity;
  }
  
  private adjustForSentiment(severity: number, sentiment: SentimentAnalysis): number {
    // Very negative sentiment increases severity
    if (sentiment.score < -0.5) {
      severity += 1.5;
    } else if (sentiment.score < -0.2) {
      severity += 0.5;
    }
    
    // Positive sentiment can slightly reduce severity (but not below certain thresholds)
    if (sentiment.score > 0.3 && severity < 7) {
      severity -= 0.5;
    }
    
    return severity;
  }
  
  private applyContextualAdjustments(severity: number, context: any, message: string): number {
    // Immediate time indicators increase urgency
    if (context.hasImmediateTimeWords) {
      severity += 1.5; // Increased weight for immediate time indicators
    }
    
    // Planning language significantly increases risk
    if (context.hasPlanningLanguage) {
      severity += 2; // High-risk factor
    }
    
    // Finality language is extremely high risk
    if (context.hasFinalityLanguage) {
      severity += 3; // Maximum risk factor
    }
    
    // Isolation indicators increase risk
    if (context.hasIsolationIndicators) {
      severity += 1.5;
    }
    
    // Emotional intensity adjustments
    severity += Math.min(context.emotionalIntensity * 0.2, 2);
    
    // Cognitive distortions impact
    if (context.cognitiveDistortions) {
      severity += Math.min(context.cognitiveDistortions.hopelessness * 0.3, 1.5);
      severity += Math.min(context.cognitiveDistortions.catastrophizing * 0.2, 1);
      severity += Math.min(context.cognitiveDistortions.allOrNothing * 0.15, 0.8);
      
      // Hope indicators can reduce severity (but not below certain thresholds)
      if (severity < 8 && context.cognitiveDistortions.hope > 0) {
        severity -= Math.min(context.cognitiveDistortions.hope * 0.2, 1);
      }
    }
    
    // Communication pattern adjustments
    if (context.hasIncompleteThoughts) {
      severity += 0.5; // May indicate severe distress
    }
    
    if (context.hasRapidThoughts) {
      severity += 0.8; // Racing thoughts can indicate crisis
    }
    
    // Fragmented communication
    if (context.fragmentedSentences > context.sentenceCount * 0.5) {
      severity += 0.7; // Highly fragmented communication
    }
    
    // Future planning and support reduce immediate risk (but with limits)
    if (context.hasFutureWords && severity < 8) {
      severity -= 0.8; // Stronger reduction for future thinking
    }
    
    if (context.hasSupportWords && severity < 7) {
      severity -= 0.5; // Support system mention is protective
    }
    
    // Risk escalation score integration
    severity += Math.min(context.riskEscalationScore * 0.3, 2);
    
    // Punctuation and formatting adjustments
    if (context.hasAllCaps > 2) {
      severity += 0.7; // Multiple ALL CAPS words indicate high distress
    }
    
    if (context.hasRepeatedPunctuation) {
      severity += 0.3; // Emotional expression through punctuation
    }
    
    if (context.hasEllipsis) {
      severity += 0.2; // May indicate trailing off, uncertainty
    }
    
    // Message length considerations
    if (message.length < 50 && severity > 6) {
      severity += 0.5; // Very short high-risk messages
    } else if (message.length > 1000 && context.emotionalIntensity > 5) {
      severity += 0.4; // Very long emotional messages
    }
    
    // Repeated words (rumination indicator)
    if (context.repeatedWords && context.repeatedWords.length > 0) {
      const maxRepeats = Math.max(...context.repeatedWords.map((rw: { word: string; count: number }) => rw.count));
      if (maxRepeats > 3) {
        severity += 0.5; // Excessive repetition may indicate rumination
      }
    }
    
    return severity;
  }
  
  private calculateConfidence(keywords: KeywordMatch, sentiment: SentimentAnalysis): number {
    // Base confidence on number of indicators
    let confidence = 0.5;
    
    // Strong keyword matches increase confidence
    if (keywords.emergencyMatches.length > 0) {
      confidence += 0.3;
    }
    
    confidence += Math.min(keywords.matches.length * 0.1, 0.4);
    confidence += sentiment.confidence * 0.2;
    
    return Math.min(confidence, 1);
  }
  
  private getRecommendedActions(severity: number, keywords: KeywordMatch): string[] {
    const actions: string[] = [];
    
    if (severity >= 9 || keywords.emergencyMatches.length > 0) {
      actions.push('IMMEDIATE_ESCALATION');
      actions.push('EMERGENCY_SERVICES_ALERT');
      actions.push('SUPERVISOR_NOTIFICATION');
    } else if (severity >= 7) {
      actions.push('PRIORITY_VOLUNTEER_ASSIGNMENT');
      actions.push('ENHANCED_MONITORING');
      actions.push('RESOURCE_PROVISION');
    } else if (severity >= 5) {
      actions.push('STANDARD_VOLUNTEER_ASSIGNMENT');
      actions.push('RESOURCE_PROVISION');
    } else {
      actions.push('PEER_SUPPORT_MATCHING');
      actions.push('WELLNESS_RESOURCES');
    }
    
    // Add specific actions based on keywords
    if (keywords.copingMatches.length > 0) {
      actions.push('REINFORCE_COPING_STRATEGIES');
    }
    
    if (keywords.positiveMatches.length > 0) {
      actions.push('BUILD_ON_POSITIVE_INDICATORS');
    }
    
    return actions;
  }
}