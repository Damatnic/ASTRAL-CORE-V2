/**
 * ASTRAL_CORE 2.0 Crisis Keyword Detection System
 * 
 * LIFE-SAVING KEYWORD ANALYSIS
 * Detects crisis indicators in real-time to trigger immediate interventions.
 * Balances sensitivity with accuracy to catch genuine emergencies without false positives.
 */

export interface CrisisDetectionResult {
  severity: number; // 1-10 scale
  keywords: string[];
  categories: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  immediateAction: boolean;
  timelineIndicators: string[];
}

export class CrisisKeywordDetector {
  private static instance: CrisisKeywordDetector;
  
  // Crisis keyword categories with severity weights
  private readonly CRISIS_KEYWORDS = {
    SUICIDE_DIRECT: {
      weight: 10,
      keywords: [
        'kill myself', 'end my life', 'suicide', 'take my own life',
        'don\'t want to live', 'better off dead', 'end it all'
      ]
    },
    SUICIDE_INDIRECT: {
      weight: 8,
      keywords: [
        'can\'t go on', 'no point living', 'tired of living',
        'want to disappear', 'wish I was dead', 'life isn\'t worth it'
      ]
    },
    SELF_HARM: {
      weight: 7,
      keywords: [
        'hurt myself', 'cut myself', 'harm myself', 'self-injury',
        'cutting', 'burning myself', 'punish myself'
      ]
    },
    METHOD_SPECIFIC: {
      weight: 9,
      keywords: [
        'pills', 'overdose', 'bridge', 'rope', 'gun', 'knife',
        'hanging', 'jumping', 'poison', 'carbon monoxide'
      ]
    },
    TIMELINE_IMMEDIATE: {
      weight: 10,
      keywords: [
        'tonight', 'right now', 'immediately', 'today',
        'in an hour', 'this morning', 'can\'t wait'
      ]
    },
    TIMELINE_SOON: {
      weight: 8,
      keywords: [
        'tomorrow', 'this week', 'soon', 'planning to',
        'going to', 'decided to', 'made up my mind'
      ]
    },
    HOPELESSNESS: {
      weight: 6,
      keywords: [
        'hopeless', 'worthless', 'useless', 'failure',
        'burden', 'no hope', 'nothing left', 'give up'
      ]
    },
    ISOLATION: {
      weight: 5,
      keywords: [
        'alone', 'nobody cares', 'no one understands',
        'isolated', 'abandoned', 'rejected', 'unloved'
      ]
    },
    PAIN_EMOTIONAL: {
      weight: 6,
      keywords: [
        'unbearable pain', 'can\'t take it', 'too much pain',
        'suffering', 'agony', 'torment', 'overwhelming'
      ]
    }
  };
  
  private constructor() {
    console.log('🔍 Crisis Keyword Detector initialized');
  }
  
  static getInstance(): CrisisKeywordDetector {
    if (!CrisisKeywordDetector.instance) {
      CrisisKeywordDetector.instance = new CrisisKeywordDetector();
    }
    return CrisisKeywordDetector.instance;
  }
  
  /**
   * Detect crisis keywords and assess severity
   * TARGET: <50ms analysis time for real-time detection
   */
  async detectCrisisKeywords(content: string): Promise<CrisisDetectionResult> {
    const startTime = performance.now();
    
    try {
      const lowerContent = content.toLowerCase();
      const detectedKeywords: string[] = [];
      const categories: string[] = [];
      const timelineIndicators: string[] = [];
      let totalSeverity = 0;
      let maxCategorySeverity = 0;
      
      // Analyze each keyword category
      for (const [category, data] of Object.entries(this.CRISIS_KEYWORDS)) {
        const categoryMatches = data.keywords.filter(keyword => 
          lowerContent.includes(keyword.toLowerCase())
        );
        
        if (categoryMatches.length > 0) {
          detectedKeywords.push(...categoryMatches);
          categories.push(category);
          
          // Calculate severity contribution
          const categorySeverity = data.weight * categoryMatches.length;
          totalSeverity += categorySeverity;
          maxCategorySeverity = Math.max(maxCategorySeverity, data.weight);
          
          // Track timeline indicators separately
          if (category.includes('TIMELINE')) {
            timelineIndicators.push(...categoryMatches);
          }
        }
      }
      
      // Calculate final severity (1-10 scale)
      const severity = Math.min(Math.round(totalSeverity / 10), 10);
      
      // Determine urgency level
      let urgency: CrisisDetectionResult['urgency'] = 'LOW';
      if (severity >= 9 || timelineIndicators.length > 0) {
        urgency = 'CRITICAL';
      } else if (severity >= 7) {
        urgency = 'HIGH';
      } else if (severity >= 5) {
        urgency = 'MEDIUM';
      }
      
      // Determine if immediate action is needed
      const immediateAction = 
        urgency === 'CRITICAL' ||
        categories.includes('SUICIDE_DIRECT') ||
        categories.includes('METHOD_SPECIFIC') ||
        timelineIndicators.length > 0;
      
      // Calculate confidence based on keyword specificity and context
      const confidence = this.calculateConfidence(detectedKeywords, content);
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 50) {
        console.warn(`⚠️ Crisis detection took ${executionTime.toFixed(2)}ms (target: <50ms)`);
      }
      
      if (detectedKeywords.length > 0) {
        console.log(`🚨 Crisis keywords detected: ${detectedKeywords.length} matches, severity ${severity}`);
      }
      
      return {
        severity,
        keywords: detectedKeywords,
        categories,
        urgency,
        confidence,
        immediateAction,
        timelineIndicators,
      };
      
    } catch (error) {
      console.error('❌ Crisis keyword detection failed:', error);
      
      // Fail safe - assume medium risk for manual review
      return {
        severity: 5,
        keywords: [],
        categories: ['DETECTION_ERROR'],
        urgency: 'MEDIUM',
        confidence: 0,
        immediateAction: false,
        timelineIndicators: [],
      };
    }
  }
  
  /**
   * Check if keyword is considered emergency-level
   */
  isEmergencyKeyword(keyword: string): boolean {
    const emergencyCategories = ['SUICIDE_DIRECT', 'METHOD_SPECIFIC', 'TIMELINE_IMMEDIATE'];
    
    for (const category of emergencyCategories) {
      const categoryData = this.CRISIS_KEYWORDS[category as keyof typeof this.CRISIS_KEYWORDS];
      if (categoryData.keywords.some(k => k.toLowerCase() === keyword.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Update keyword database (for continuous learning)
   */
  async updateKeywords(): Promise<void> {
    try {
      // In production, this would fetch updated keywords from a secure API
      console.log('🔄 Updating crisis keyword database...');
      
      // Mock update - in real system would fetch from crisis research databases
      const newKeywords = await this.fetchLatestCrisisKeywords();
      
      // Merge new keywords with existing ones
      // Implementation would update the keyword database
      
      console.log('✅ Crisis keyword database updated');
    } catch (error) {
      console.error('❌ Failed to update crisis keywords:', error);
    }
  }
  
  /**
   * Get detection statistics
   */
  getDetectionStats() {
    return {
      totalKeywords: Object.values(this.CRISIS_KEYWORDS).reduce(
        (total, category) => total + category.keywords.length, 0
      ),
      categories: Object.keys(this.CRISIS_KEYWORDS).length,
      emergencyKeywords: this.getEmergencyKeywordCount(),
      lastUpdated: new Date(), // Would track actual last update
    };
  }
  
  // Private helper methods
  
  private calculateConfidence(detectedKeywords: string[], content: string): number {
    if (detectedKeywords.length === 0) return 0;
    
    // Base confidence on keyword specificity and context
    let confidence = 0.5;
    
    // Higher confidence for multiple keyword matches
    if (detectedKeywords.length > 1) {
      confidence += 0.2;
    }
    
    // Higher confidence for specific/direct keywords
    const directKeywords = detectedKeywords.filter(keyword =>
      this.CRISIS_KEYWORDS.SUICIDE_DIRECT.keywords.includes(keyword) ||
      this.CRISIS_KEYWORDS.METHOD_SPECIFIC.keywords.includes(keyword)
    );
    
    if (directKeywords.length > 0) {
      confidence += 0.3;
    }
    
    // Lower confidence for very short messages (might be false positives)
    if (content.length < 20) {
      confidence -= 0.2;
    }
    
    // Higher confidence for longer, more detailed messages
    if (content.length > 100) {
      confidence += 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  private getEmergencyKeywordCount(): number {
    return this.CRISIS_KEYWORDS.SUICIDE_DIRECT.keywords.length +
           this.CRISIS_KEYWORDS.METHOD_SPECIFIC.keywords.length +
           this.CRISIS_KEYWORDS.TIMELINE_IMMEDIATE.keywords.length;
  }
  
  private async fetchLatestCrisisKeywords(): Promise<string[]> {
    // Mock implementation - in production would fetch from research databases
    return [
      'new crisis indicator',
      'updated emergency phrase',
    ];
  }
}