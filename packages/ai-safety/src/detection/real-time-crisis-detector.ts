/**
 * ASTRAL_CORE 2.0 Real-Time Crisis Keyword Detection System
 * 
 * HIGH-PERFORMANCE CRISIS DETECTION
 * - <50ms detection latency
 * - >99% keyword detection accuracy
 * - Real-time pattern matching
 * - Optimized trie-based keyword lookup
 * - Multi-language support
 * - Context-aware severity scoring
 * 
 * TARGET PERFORMANCE:
 * - Processing latency: <50ms
 * - Detection accuracy: >99%
 * - False positive rate: <1%
 * - Memory usage: <100MB
 */

import { EventEmitter } from 'events';

export interface CrisisKeyword {
  keyword: string;
  language: string;
  severity: number; // 0-10 scale
  category: 'immediate' | 'planning' | 'selfHarm' | 'distress' | 'method' | 'emergency';
  context: string[];
  aliases: string[];
}

export interface CrisisDetectionResult {
  detected: boolean;
  severity: number; // 0-10 scale
  confidence: number; // 0-1 scale
  keywords: Array<{
    keyword: string;
    severity: number;
    category: string;
    position: number;
    context: string;
  }>;
  immediateRisk: boolean;
  recommendedAction: 'MONITOR' | 'ESCALATE' | 'EMERGENCY' | 'IMMEDIATE_INTERVENTION';
  processingTime: number;
  language: string;
}

export interface CrisisContext {
  messageType: 'crisis' | 'general' | 'emergency';
  previousMessages?: string[];
  userHistory?: {
    previousCrisisLevel: number;
    escalationHistory: number;
  };
  sessionMetadata?: Record<string, any>;
}

/**
 * Optimized Trie data structure for ultra-fast keyword matching
 * Enables <50ms detection even with large keyword databases
 */
class CrisisKeywordTrie {
  private root: TrieNode = new TrieNode();
  private keywordCount = 0;
  
  insert(keyword: CrisisKeyword): void {
    let current = this.root;
    const normalizedKeyword = keyword.keyword.toLowerCase().trim();
    
    for (const char of normalizedKeyword) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    current.keywords.push(keyword);
    this.keywordCount++;
  }
  
  search(text: string): Array<{
    keyword: CrisisKeyword;
    position: number;
    matchedText: string;
  }> {
    const results: Array<{
      keyword: CrisisKeyword;
      position: number;
      matchedText: string;
    }> = [];
    
    const normalizedText = text.toLowerCase();
    
    for (let i = 0; i < normalizedText.length; i++) {
      let current = this.root;
      let j = i;
      
      while (j < normalizedText.length && current.children.has(normalizedText[j])) {
        current = current.children.get(normalizedText[j])!;
        j++;
        
        if (current.isEndOfWord) {
          const matchedText = normalizedText.substring(i, j);
          current.keywords.forEach(keyword => {
            results.push({
              keyword,
              position: i,
              matchedText
            });
          });
        }
      }
    }
    
    return results;
  }
  
  getStats(): { keywordCount: number; nodeCount: number } {
    return {
      keywordCount: this.keywordCount,
      nodeCount: this.countNodes(this.root)
    };
  }
  
  private countNodes(node: TrieNode): number {
    let count = 1;
    for (const child of node.children.values()) {
      count += this.countNodes(child);
    }
    return count;
  }
}

class TrieNode {
  children = new Map<string, TrieNode>();
  isEndOfWord = false;
  keywords: CrisisKeyword[] = [];
}

/**
 * Real-Time Crisis Detection Engine
 * Optimized for ultra-low latency crisis keyword detection
 */
export class RealTimeCrisisDetector extends EventEmitter {
  private static instance: RealTimeCrisisDetector;
  
  // High-performance keyword lookup
  private keywordTrie = new CrisisKeywordTrie();
  
  // Performance monitoring
  private metrics = {
    totalDetections: 0,
    averageLatency: 0,
    accuracyRate: 0,
    falsePositiveRate: 0,
    emergencyDetections: 0,
    latencyBuffer: [] as number[]
  };
  
  // Language-specific pattern matchers
  private languagePatterns = new Map<string, RegExp[]>();
  
  // Context analysis cache
  private contextCache = new Map<string, { severity: number; timestamp: number }>();
  private readonly CONTEXT_CACHE_TTL = 300000; // 5 minutes
  
  private constructor() {
    super();
    this.initializeKeywordDatabase();
    this.initializeLanguagePatterns();
    this.startPerformanceMonitoring();
    console.log('🚨 Real-Time Crisis Detection System initialized');
  }
  
  static getInstance(): RealTimeCrisisDetector {
    if (!RealTimeCrisisDetector.instance) {
      RealTimeCrisisDetector.instance = new RealTimeCrisisDetector();
    }
    return RealTimeCrisisDetector.instance;
  }
  
  /**
   * PRIMARY DETECTION FUNCTION
   * Ultra-fast crisis keyword detection with <50ms target
   */
  async detectCrisis(
    content: string,
    context: CrisisContext = { messageType: 'general' },
    language = 'en'
  ): Promise<CrisisDetectionResult> {
    const startTime = performance.now();
    
    try {
      this.metrics.totalDetections++;
      
      // Quick validation
      if (!content || content.trim().length === 0) {
        return this.createEmptyResult(startTime);
      }
      
      // Normalize content for analysis
      const normalizedContent = this.normalizeContent(content);
      
      // Primary keyword detection using trie
      const keywordMatches = this.keywordTrie.search(normalizedContent);
      
      // Pattern-based detection for complex phrases
      const patternMatches = this.detectPatterns(normalizedContent, language);
      
      // Combine and analyze all matches
      const allMatches = [...keywordMatches, ...patternMatches];
      
      // Calculate severity and confidence
      const severity = this.calculateSeverity(allMatches, context);
      const confidence = this.calculateConfidence(allMatches, normalizedContent, context);
      
      // Determine immediate risk
      const immediateRisk = this.assessImmediateRisk(allMatches, severity);
      
      // Generate recommended action
      const recommendedAction = this.determineAction(severity, immediateRisk, context);
      
      // Extract context for matched keywords
      const keywordDetails = this.extractKeywordContext(allMatches, content);
      
      const processingTime = performance.now() - startTime;
      this.updateMetrics(processingTime);
      
      // Performance warning if exceeding target
      if (processingTime > 50) {
        console.warn(`⚠️ Crisis detection exceeded target latency: ${processingTime.toFixed(2)}ms`);
      }
      
      const result: CrisisDetectionResult = {
        detected: allMatches.length > 0,
        severity,
        confidence,
        keywords: keywordDetails,
        immediateRisk,
        recommendedAction,
        processingTime,
        language
      };
      
      // Emit events for monitoring and escalation
      this.emit('crisis_analyzed', result);
      
      if (immediateRisk) {
        this.emit('immediate_risk_detected', result);
        this.metrics.emergencyDetections++;
      }
      
      console.log(`🚨 Crisis detection: ${allMatches.length} keywords, severity ${severity}/10, ${processingTime.toFixed(2)}ms`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Crisis detection failed:', error);
      return this.createErrorResult(startTime, error);
    }
  }
  
  /**
   * Batch detection for multiple messages
   * Optimized for processing conversation history
   */
  async detectCrisisBatch(
    messages: Array<{ content: string; timestamp: Date; context?: CrisisContext }>,
    language = 'en'
  ): Promise<{
    results: CrisisDetectionResult[];
    overallSeverity: number;
    escalationPattern: boolean;
    processingTime: number;
  }> {
    const startTime = performance.now();
    
    const results = await Promise.all(
      messages.map(msg => this.detectCrisis(msg.content, msg.context, language))
    );
    
    // Analyze patterns across messages
    const overallSeverity = this.calculateOverallSeverity(results);
    const escalationPattern = this.detectEscalationPattern(results);
    
    const processingTime = performance.now() - startTime;
    
    return {
      results,
      overallSeverity,
      escalationPattern,
      processingTime
    };
  }
  
  /**
   * Update keyword database in real-time
   * Enables dynamic updates without system restart
   */
  async updateKeywordDatabase(keywords: CrisisKeyword[]): Promise<void> {
    console.log('🔄 Updating crisis keyword database...');
    
    // Clear existing trie and rebuild
    this.keywordTrie = new CrisisKeywordTrie();
    
    for (const keyword of keywords) {
      this.keywordTrie.insert(keyword);
    }
    
    console.log(`✅ Keyword database updated: ${keywords.length} keywords loaded`);
    this.emit('keyword_database_updated', { keywordCount: keywords.length });
  }
  
  /**
   * Get detailed performance metrics
   */
  getMetrics(): typeof this.metrics & { trieStats: any } {
    return {
      ...this.metrics,
      trieStats: this.keywordTrie.getStats()
    };
  }
  
  /**
   * Validate system performance against targets
   */
  validatePerformance(): {
    valid: boolean;
    issues: string[];
    metrics: any;
  } {
    const issues: string[] = [];
    
    if (this.metrics.averageLatency > 50) {
      issues.push(`Average latency ${this.metrics.averageLatency.toFixed(2)}ms exceeds target of 50ms`);
    }
    
    if (this.metrics.falsePositiveRate > 0.01) {
      issues.push(`False positive rate ${(this.metrics.falsePositiveRate * 100).toFixed(2)}% exceeds target of 1%`);
    }
    
    if (this.metrics.accuracyRate < 0.99) {
      issues.push(`Accuracy rate ${(this.metrics.accuracyRate * 100).toFixed(2)}% below target of 99%`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      metrics: this.getMetrics()
    };
  }
  
  // Private implementation methods
  
  private initializeKeywordDatabase(): void {
    // Core crisis keywords with severity and categories
    const coreKeywords: CrisisKeyword[] = [
      // Immediate danger (severity 10)
      { keyword: 'kill myself now', language: 'en', severity: 10, category: 'immediate', context: ['tonight', 'today', 'right now'], aliases: ['end my life now'] },
      { keyword: 'going to die tonight', language: 'en', severity: 10, category: 'immediate', context: ['plan', 'ready'], aliases: ['dying tonight'] },
      { keyword: 'have the pills', language: 'en', severity: 10, category: 'immediate', context: ['ready', 'enough'], aliases: ['got the pills'] },
      { keyword: 'gun is loaded', language: 'en', severity: 10, category: 'immediate', context: ['ready', 'chamber'], aliases: ['loaded gun'] },
      { keyword: 'rope around neck', language: 'en', severity: 10, category: 'immediate', context: ['noose', 'hanging'], aliases: ['noose ready'] },
      
      // Suicide planning (severity 9)
      { keyword: 'suicide plan', language: 'en', severity: 9, category: 'planning', context: ['detailed', 'method'], aliases: ['plan to die'] },
      { keyword: 'how to kill myself', language: 'en', severity: 9, category: 'planning', context: ['method', 'painless'], aliases: ['ways to die'] },
      { keyword: 'suicide note', language: 'en', severity: 9, category: 'planning', context: ['wrote', 'finished'], aliases: ['goodbye letter'] },
      { keyword: 'final arrangements', language: 'en', severity: 9, category: 'planning', context: ['will', 'insurance'], aliases: ['last things'] },
      
      // Self-harm active (severity 8)
      { keyword: 'cutting myself', language: 'en', severity: 8, category: 'selfHarm', context: ['razor', 'blade'], aliases: ['self cutting'] },
      { keyword: 'burning myself', language: 'en', severity: 8, category: 'selfHarm', context: ['fire', 'cigarette'], aliases: ['self burning'] },
      { keyword: 'hitting myself', language: 'en', severity: 8, category: 'selfHarm', context: ['punching', 'wall'], aliases: ['self hitting'] },
      
      // Severe distress (severity 7)
      { keyword: 'can\'t take anymore', language: 'en', severity: 7, category: 'distress', context: ['breaking point'], aliases: ['cannot take it'] },
      { keyword: 'no hope left', language: 'en', severity: 7, category: 'distress', context: ['hopeless'], aliases: ['lost all hope'] },
      { keyword: 'better off dead', language: 'en', severity: 7, category: 'distress', context: ['everyone'], aliases: ['world without me'] },
      
      // Methods (severity 6-9 based on specificity)
      { keyword: 'overdose', language: 'en', severity: 8, category: 'method', context: ['pills', 'medication'], aliases: ['take too many'] },
      { keyword: 'bridge jump', language: 'en', severity: 9, category: 'method', context: ['high', 'fall'], aliases: ['jumping off bridge'] },
      { keyword: 'carbon monoxide', language: 'en', severity: 8, category: 'method', context: ['car', 'garage'], aliases: ['co poisoning'] },
      
      // Emergency indicators (severity 10)
      { keyword: 'call 911', language: 'en', severity: 10, category: 'emergency', context: ['help', 'dying'], aliases: ['need ambulance'] },
      { keyword: 'bleeding out', language: 'en', severity: 10, category: 'emergency', context: ['cut', 'deep'], aliases: ['losing blood'] },
      { keyword: 'can\'t breathe', language: 'en', severity: 8, category: 'emergency', context: ['choking', 'panic'], aliases: ['cannot breathe'] }
    ];
    
    // Add multi-language variants
    const multiLangKeywords = this.generateMultiLanguageKeywords(coreKeywords);
    
    // Insert all keywords into trie
    [...coreKeywords, ...multiLangKeywords].forEach(keyword => {
      this.keywordTrie.insert(keyword);
    });
    
    console.log(`📚 Crisis keyword database initialized: ${coreKeywords.length + multiLangKeywords.length} keywords`);
  }
  
  private initializeLanguagePatterns(): void {
    // Complex pattern matching for phrases that can't be captured by simple keywords
    const englishPatterns = [
      /\b(?:want to|going to|planning to)\s+(?:kill myself|end my life|die)\b/gi,
      /\b(?:have|got)\s+(?:the|enough)\s+(?:pills|medication|drugs)\s+(?:to|ready)\b/gi,
      /\b(?:wrote|finished|left)\s+(?:my|a)\s+(?:suicide|goodbye)\s+(?:note|letter)\b/gi,
      /\b(?:no\s+(?:point|reason|hope)|nothing\s+(?:left|matters))\s+(?:anymore|living)\b/gi,
      /\b(?:everyone|world|life)\s+(?:would be|is)\s+better\s+without\s+me\b/gi,
      /\b(?:ready to|going to|want to)\s+(?:jump|end it|do it)\s+(?:tonight|today|now)\b/gi
    ];
    
    this.languagePatterns.set('en', englishPatterns);
    
    // Add patterns for other languages
    const spanishPatterns = [
      /\b(?:quiero|voy a)\s+(?:matarme|morir|suicidarme)\b/gi,
      /\b(?:tengo|conseguí)\s+(?:las|suficientes)\s+pastillas\b/gi,
      /\b(?:escribí|terminé)\s+(?:mi|una)\s+(?:carta|nota)\s+de\s+(?:suicidio|despedida)\b/gi
    ];
    
    this.languagePatterns.set('es', spanishPatterns);
  }
  
  private generateMultiLanguageKeywords(baseKeywords: CrisisKeyword[]): CrisisKeyword[] {
    // Simplified translation mapping
    const translations = {
      'kill myself now': { es: 'matarme ahora', fr: 'me tuer maintenant', de: 'mich jetzt töten' },
      'suicide plan': { es: 'plan de suicidio', fr: 'plan de suicide', de: 'selbstmordplan' },
      'no hope left': { es: 'sin esperanza', fr: 'sans espoir', de: 'keine hoffnung' }
    };
    
    const multiLangKeywords: CrisisKeyword[] = [];
    
    baseKeywords.forEach(keyword => {
      const trans = translations[keyword.keyword as keyof typeof translations];
      if (trans) {
        Object.entries(trans).forEach(([lang, translation]) => {
          multiLangKeywords.push({
            ...keyword,
            keyword: translation,
            language: lang
          });
        });
      }
    });
    
    return multiLangKeywords;
  }
  
  private normalizeContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  private detectPatterns(content: string, language: string): Array<{
    keyword: CrisisKeyword;
    position: number;
    matchedText: string;
  }> {
    const patterns = this.languagePatterns.get(language) || [];
    const matches: Array<{
      keyword: CrisisKeyword;
      position: number;
      matchedText: string;
    }> = [];
    
    patterns.forEach((pattern, index) => {
      const regexMatches = [...content.matchAll(pattern)];
      regexMatches.forEach(match => {
        if (match.index !== undefined) {
          matches.push({
            keyword: {
              keyword: match[0],
              language,
              severity: 8, // High severity for pattern matches
              category: 'planning',
              context: [],
              aliases: []
            },
            position: match.index,
            matchedText: match[0]
          });
        }
      });
    });
    
    return matches;
  }
  
  private calculateSeverity(
    matches: Array<{ keyword: CrisisKeyword; position: number; matchedText: string }>,
    context: CrisisContext
  ): number {
    if (matches.length === 0) return 0;
    
    // Base severity is the highest severity keyword found
    let baseSeverity = Math.max(...matches.map(m => m.keyword.severity));
    
    // Modifiers based on context
    if (context.messageType === 'emergency') {
      baseSeverity = Math.min(baseSeverity + 1, 10);
    }
    
    // Multiple severe keywords increase severity
    const highSeverityCount = matches.filter(m => m.keyword.severity >= 8).length;
    if (highSeverityCount > 1) {
      baseSeverity = Math.min(baseSeverity + 0.5, 10);
    }
    
    // Consider user history
    if (context.userHistory?.previousCrisisLevel && context.userHistory.previousCrisisLevel >= 7) {
      baseSeverity = Math.min(baseSeverity + 0.5, 10);
    }
    
    return Math.round(baseSeverity * 10) / 10; // Round to 1 decimal
  }
  
  private calculateConfidence(
    matches: Array<{ keyword: CrisisKeyword; position: number; matchedText: string }>,
    content: string,
    context: CrisisContext
  ): number {
    if (matches.length === 0) return 0;
    
    let confidence = 0.9; // Base confidence for keyword matches
    
    // Higher confidence for multiple matches
    if (matches.length > 1) {
      confidence = Math.min(confidence + 0.05, 1.0);
    }
    
    // Higher confidence for specific context words
    const contextWords = ['tonight', 'now', 'ready', 'plan', 'method'];
    const hasContext = contextWords.some(word => content.toLowerCase().includes(word));
    if (hasContext) {
      confidence = Math.min(confidence + 0.05, 1.0);
    }
    
    // Lower confidence for very short messages
    if (content.length < 20) {
      confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  private assessImmediateRisk(
    matches: Array<{ keyword: CrisisKeyword; position: number; matchedText: string }>,
    severity: number
  ): boolean {
    // Immediate risk if severity >= 9 or immediate category keywords found
    return severity >= 9 || matches.some(m => m.keyword.category === 'immediate' || m.keyword.category === 'emergency');
  }
  
  private determineAction(
    severity: number,
    immediateRisk: boolean,
    context: CrisisContext
  ): CrisisDetectionResult['recommendedAction'] {
    if (immediateRisk || severity >= 9) {
      return 'IMMEDIATE_INTERVENTION';
    } else if (severity >= 8) {
      return 'EMERGENCY';
    } else if (severity >= 6) {
      return 'ESCALATE';
    } else {
      return 'MONITOR';
    }
  }
  
  private extractKeywordContext(
    matches: Array<{ keyword: CrisisKeyword; position: number; matchedText: string }>,
    originalContent: string
  ): CrisisDetectionResult['keywords'] {
    return matches.map(match => {
      const contextStart = Math.max(0, match.position - 50);
      const contextEnd = Math.min(originalContent.length, match.position + match.matchedText.length + 50);
      const context = originalContent.substring(contextStart, contextEnd);
      
      return {
        keyword: match.keyword.keyword,
        severity: match.keyword.severity,
        category: match.keyword.category,
        position: match.position,
        context: context.trim()
      };
    });
  }
  
  private calculateOverallSeverity(results: CrisisDetectionResult[]): number {
    if (results.length === 0) return 0;
    
    // Weight recent messages more heavily
    let weightedSum = 0;
    let totalWeight = 0;
    
    results.forEach((result, index) => {
      const weight = Math.pow(0.9, results.length - index - 1); // Recent messages have higher weight
      weightedSum += result.severity * weight;
      totalWeight += weight;
    });
    
    return weightedSum / totalWeight;
  }
  
  private detectEscalationPattern(results: CrisisDetectionResult[]): boolean {
    if (results.length < 3) return false;
    
    // Check if severity is increasing over time
    const recentSeverities = results.slice(-3).map(r => r.severity);
    return recentSeverities[2] > recentSeverities[1] && recentSeverities[1] > recentSeverities[0];
  }
  
  private createEmptyResult(startTime: number): CrisisDetectionResult {
    return {
      detected: false,
      severity: 0,
      confidence: 1,
      keywords: [],
      immediateRisk: false,
      recommendedAction: 'MONITOR',
      processingTime: performance.now() - startTime,
      language: 'en'
    };
  }
  
  private createErrorResult(startTime: number, error: any): CrisisDetectionResult {
    console.error('Crisis detection error:', error);
    return {
      detected: false,
      severity: 0,
      confidence: 0,
      keywords: [],
      immediateRisk: false,
      recommendedAction: 'ESCALATE', // Escalate on error to be safe
      processingTime: performance.now() - startTime,
      language: 'en'
    };
  }
  
  private updateMetrics(latency: number): void {
    this.metrics.latencyBuffer.push(latency);
    
    // Keep only last 1000 measurements for rolling average
    if (this.metrics.latencyBuffer.length > 1000) {
      this.metrics.latencyBuffer.shift();
    }
    
    this.metrics.averageLatency = this.metrics.latencyBuffer.reduce((sum, val) => sum + val, 0) / this.metrics.latencyBuffer.length;
  }
  
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const stats = this.keywordTrie.getStats();
      console.log(`🚨 Crisis Detection Metrics - Detections: ${this.metrics.totalDetections}, Avg Latency: ${this.metrics.averageLatency.toFixed(2)}ms, Keywords: ${stats.keywordCount}, Emergency: ${this.metrics.emergencyDetections}`);
    }, 60000); // Log every minute
  }
}

// Export singleton instance
export const realTimeCrisisDetector = RealTimeCrisisDetector.getInstance();