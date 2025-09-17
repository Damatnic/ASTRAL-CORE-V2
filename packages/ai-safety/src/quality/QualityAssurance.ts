/**
 * ASTRAL_CORE 2.0 Quality Assurance System
 * 
 * VOLUNTEER RESPONSE QUALITY MONITORING
 * Ensures volunteer responses meet high standards for crisis intervention.
 * Provides real-time feedback and training recommendations.
 */

export interface QualityAssessmentResult {
  qualityScore: number; // 0-1 scale
  helpfulness: number;
  empathy: number;
  clarity: number;
  appropriateness: number;
  suggestions: string[];
  approved: boolean;
}

export interface EthicsCheckResult {
  followsGuidelines: boolean;
  violations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class QualityAssurance {
  private static instance: QualityAssurance;
  
  // Quality thresholds
  private readonly QUALITY_THRESHOLDS = {
    MINIMUM_OVERALL: 0.7,    // 70% minimum quality
    HELPFULNESS: 0.8,        // 80% helpfulness required
    EMPATHY: 0.7,           // 70% empathy required
    CLARITY: 0.7,           // 70% clarity required
    APPROPRIATENESS: 0.9,    // 90% appropriateness required
  };
  
  // Ethics guidelines
  private readonly ETHICS_GUIDELINES = {
    NO_PERSONAL_ADVICE: 'Avoid giving personal advice; focus on professional guidance',
    MAINTAIN_BOUNDARIES: 'Maintain professional boundaries',
    NO_DIAGNOSIS: 'Do not provide medical or psychological diagnoses',
    ENCOURAGE_PROFESSIONAL_HELP: 'Encourage seeking professional help when appropriate',
    RESPECT_AUTONOMY: 'Respect user autonomy and choices',
    CONFIDENTIALITY: 'Maintain confidentiality and privacy',
  };
  
  private constructor() {
    console.log('✅ Quality Assurance System initialized');
  }
  
  static getInstance(): QualityAssurance {
    if (!QualityAssurance.instance) {
      QualityAssurance.instance = new QualityAssurance();
    }
    return QualityAssurance.instance;
  }
  
  /**
   * Assess volunteer response quality
   * TARGET: <150ms assessment time
   */
  async assessResponse(response: string): Promise<QualityAssessmentResult> {
    const startTime = performance.now();
    
    try {
      // Assess different quality dimensions
      const helpfulness = this.assessHelpfulness(response);
      const empathy = this.assessEmpathy(response);
      const clarity = this.assessClarity(response);
      const appropriateness = this.assessAppropriateness(response);
      
      // Calculate overall quality score
      const qualityScore = (
        helpfulness * 0.3 +
        empathy * 0.3 +
        clarity * 0.2 +
        appropriateness * 0.2
      );
      
      // Generate improvement suggestions
      const suggestions = this.generateSuggestions({
        helpfulness,
        empathy,
        clarity,
        appropriateness,
      });
      
      // Determine if response is approved
      const approved = 
        qualityScore >= this.QUALITY_THRESHOLDS.MINIMUM_OVERALL &&
        helpfulness >= this.QUALITY_THRESHOLDS.HELPFULNESS &&
        empathy >= this.QUALITY_THRESHOLDS.EMPATHY &&
        clarity >= this.QUALITY_THRESHOLDS.CLARITY &&
        appropriateness >= this.QUALITY_THRESHOLDS.APPROPRIATENESS;
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 150) {
        console.warn(`⚠️ Quality assessment took ${executionTime.toFixed(2)}ms (target: <150ms)`);
      }
      
      console.log(`✅ Response quality assessed: ${(qualityScore * 100).toFixed(1)}% (${approved ? 'APPROVED' : 'NEEDS_REVIEW'})`);
      
      return {
        qualityScore,
        helpfulness,
        empathy,
        clarity,
        appropriateness,
        suggestions,
        approved,
      };
      
    } catch (error) {
      console.error('❌ Quality assessment failed:', error);
      
      return {
        qualityScore: 0.5,
        helpfulness: 0.5,
        empathy: 0.5,
        clarity: 0.5,
        appropriateness: 0.5,
        suggestions: ['Quality assessment failed - manual review required'],
        approved: false,
      };
    }
  }
  
  /**
   * Assess volunteer response with conversation context
   */
  async assessVolunteerResponse(
    response: string,
    conversationContext: string[]
  ): Promise<QualityAssessmentResult> {
    // Enhanced assessment with context
    const baseAssessment = await this.assessResponse(response);
    
    // Context-aware adjustments
    const contextRelevance = this.assessContextRelevance(response, conversationContext);
    const continuity = this.assessContinuity(response, conversationContext);
    
    // Adjust scores based on context
    const adjustedQuality = (baseAssessment.qualityScore + contextRelevance + continuity) / 3;
    
    return {
      ...baseAssessment,
      qualityScore: adjustedQuality,
      suggestions: [
        ...baseAssessment.suggestions,
        ...this.generateContextSuggestions(contextRelevance, continuity),
      ],
    };
  }
  
  /**
   * Check ethical guidelines compliance
   */
  async checkEthicalGuidelines(response: string): Promise<EthicsCheckResult> {
    const violations: string[] = [];
    let severity: EthicsCheckResult['severity'] = 'LOW';
    
    // Check for personal advice
    if (this.containsPersonalAdvice(response)) {
      violations.push(this.ETHICS_GUIDELINES.NO_PERSONAL_ADVICE);
      severity = 'MEDIUM';
    }
    
    // Check for boundary violations
    if (this.violatesBoundaries(response)) {
      violations.push(this.ETHICS_GUIDELINES.MAINTAIN_BOUNDARIES);
      severity = 'HIGH';
    }
    
    // Check for inappropriate diagnosis
    if (this.containsDiagnosis(response)) {
      violations.push(this.ETHICS_GUIDELINES.NO_DIAGNOSIS);
      severity = 'CRITICAL';
    }
    
    // Check for autonomy respect
    if (this.violatesAutonomy(response)) {
      violations.push(this.ETHICS_GUIDELINES.RESPECT_AUTONOMY);
      severity = 'MEDIUM';
    }
    
    return {
      followsGuidelines: violations.length === 0,
      violations,
      severity,
    };
  }
  
  // Private assessment methods
  
  private assessHelpfulness(response: string): number {
    let score = 0.5; // Base score
    
    // Positive indicators
    const helpfulIndicators = [
      /\b(resource|help|support|guidance|suggestion)\b/gi,
      /\b(try|consider|might|could|perhaps)\b/gi,
      /\b(information|contact|call|reach out)\b/gi,
    ];
    
    for (const indicator of helpfulIndicators) {
      if (indicator.test(response)) {
        score += 0.15;
      }
    }
    
    // Negative indicators
    if (response.length < 20) score -= 0.2; // Too short
    if (!/[.!?]/.test(response)) score -= 0.1; // No punctuation
    
    return Math.max(0, Math.min(1, score));
  }
  
  private assessEmpathy(response: string): number {
    let score = 0.3; // Base score
    
    // Empathy indicators
    const empathyIndicators = [
      /\b(understand|feel|sorry|care|here for you)\b/gi,
      /\b(not alone|we care|support you|with you)\b/gi,
      /\b(difficult|hard|challenging|tough)\b/gi,
      /\b(brave|strong|courage|proud)\b/gi,
    ];
    
    for (const indicator of empathyIndicators) {
      if (indicator.test(response)) {
        score += 0.2;
      }
    }
    
    // Check for validation
    if (/\b(valid|legitimate|understandable|makes sense)\b/gi.test(response)) {
      score += 0.15;
    }
    
    return Math.max(0, Math.min(1, score));
  }
  
  private assessClarity(response: string): number {
    let score = 0.5; // Base score
    
    // Clarity indicators
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = response.length / Math.max(sentences.length, 1);
    
    // Optimal sentence length (10-30 words)
    if (avgSentenceLength >= 50 && avgSentenceLength <= 150) {
      score += 0.2;
    } else if (avgSentenceLength > 200) {
      score -= 0.2; // Too long
    }
    
    // Check for clear structure
    if (sentences.length > 1) score += 0.1; // Multiple sentences
    if (/\b(first|second|next|then|finally)\b/gi.test(response)) {
      score += 0.1; // Sequential structure
    }
    
    // Check for jargon or complex terms
    const complexWords = response.match(/\b\w{10,}\b/g) || [];
    if (complexWords.length > 3) {
      score -= 0.1; // Too much jargon
    }
    
    return Math.max(0, Math.min(1, score));
  }
  
  private assessAppropriateness(response: string): number {
    let score = 1.0; // Start with perfect score
    
    // Check for inappropriate content
    if (this.containsPersonalAdvice(response)) score -= 0.3;
    if (this.containsDiagnosis(response)) score -= 0.5;
    if (this.violatesBoundaries(response)) score -= 0.4;
    if (this.containsProfanity(response)) score -= 0.2;
    
    return Math.max(0, score);
  }
  
  private assessContextRelevance(response: string, context: string[]): number {
    if (context.length === 0) return 0.7; // Default if no context
    
    // Check if response addresses recent context
    const recentContext = context.slice(-3).join(' ').toLowerCase();
    const responseLower = response.toLowerCase();
    
    // Look for contextual references
    const contextWords = recentContext.split(/\s+/).filter(word => word.length > 3);
    const relevantWords = contextWords.filter(word => responseLower.includes(word));
    
    return Math.min(relevantWords.length / Math.max(contextWords.length * 0.3, 1), 1);
  }
  
  private assessContinuity(response: string, context: string[]): number {
    if (context.length === 0) return 0.7; // Default if no context
    
    // Check for conversation flow indicators
    const continuityIndicators = [
      /\b(you mentioned|as you said|following up|continuing)\b/gi,
      /\b(earlier|before|previously|last time)\b/gi,
    ];
    
    const hasContinuity = continuityIndicators.some(indicator => 
      indicator.test(response)
    );
    
    return hasContinuity ? 0.9 : 0.6;
  }
  
  private generateSuggestions(scores: {
    helpfulness: number;
    empathy: number;
    clarity: number;
    appropriateness: number;
  }): string[] {
    const suggestions: string[] = [];
    
    if (scores.helpfulness < this.QUALITY_THRESHOLDS.HELPFULNESS) {
      suggestions.push('Provide more specific guidance or resources');
    }
    
    if (scores.empathy < this.QUALITY_THRESHOLDS.EMPATHY) {
      suggestions.push('Show more understanding and validation of feelings');
    }
    
    if (scores.clarity < this.QUALITY_THRESHOLDS.CLARITY) {
      suggestions.push('Use clearer language and shorter sentences');
    }
    
    if (scores.appropriateness < this.QUALITY_THRESHOLDS.APPROPRIATENESS) {
      suggestions.push('Review professional boundaries and guidelines');
    }
    
    return suggestions;
  }
  
  private generateContextSuggestions(contextRelevance: number, continuity: number): string[] {
    const suggestions: string[] = [];
    
    if (contextRelevance < 0.5) {
      suggestions.push('Address the specific concerns mentioned by the user');
    }
    
    if (continuity < 0.5) {
      suggestions.push('Reference previous conversation points for better flow');
    }
    
    return suggestions;
  }
  
  // Helper methods for ethics checking
  
  private containsPersonalAdvice(response: string): boolean {
    const personalAdvicePatterns = [
      /\b(you should|you must|you need to)\b/gi,
      /\b(my advice|I recommend|I suggest)\b/gi,
      /\b(if I were you|in my opinion)\b/gi,
    ];
    
    return personalAdvicePatterns.some(pattern => pattern.test(response));
  }
  
  private violatesBoundaries(response: string): boolean {
    const boundaryViolations = [
      /\b(personal|private|relationship|dating)\b/gi,
      /\b(meet|visit|come over|phone number)\b/gi,
      /\b(friend|buddy|pal)\b/gi, // Too casual for professional context
    ];
    
    return boundaryViolations.some(pattern => pattern.test(response));
  }
  
  private containsDiagnosis(response: string): boolean {
    const diagnosisPatterns = [
      /\b(you have|diagnosed with|suffering from)\b/gi,
      /\b(depression|anxiety|bipolar|ptsd|disorder)\b/gi,
      /\b(mental illness|condition|syndrome)\b/gi,
    ];
    
    return diagnosisPatterns.some(pattern => pattern.test(response));
  }
  
  private violatesAutonomy(response: string): boolean {
    const autonomyViolations = [
      /\b(you must|you have to|you need to)\b/gi,
      /\b(should definitely|absolutely must)\b/gi,
    ];
    
    return autonomyViolations.some(pattern => pattern.test(response));
  }
  
  private containsProfanity(response: string): boolean {
    // Basic profanity check - would be more comprehensive in production
    const profanityPatterns = [
      /\b(damn|hell|crap)\b/gi,
    ];
    
    return profanityPatterns.some(pattern => pattern.test(response));
  }
}