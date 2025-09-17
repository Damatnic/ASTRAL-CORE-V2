/**
 * ASTRAL_CORE 2.0 Content Moderation System
 * 
 * INTELLIGENT CONTENT FILTERING
 * Protects users from harmful content while preserving authentic crisis communication.
 * Uses AI-powered analysis to detect threats without blocking genuine cries for help.
 */

import { randomUUID } from 'crypto';

export interface ModerationResult {
  safe: boolean;
  riskScore: number; // 0-1 scale
  reason?: string;
  categories: string[];
  confidence: number;
  action: 'ALLOW' | 'FLAG' | 'BLOCK' | 'ESCALATE';
}

export interface ModerationContext {
  messageType: 'crisis' | 'volunteer' | 'general';
  isAnonymous: boolean;
  sessionId?: string;
  userId?: string;
}

export class ContentModerationSystem {
  private static instance: ContentModerationSystem;
  
  // Moderation thresholds
  private readonly THRESHOLDS = {
    TOXICITY: 0.8,        // Block if toxicity > 80%
    HARASSMENT: 0.7,      // Flag if harassment > 70%
    SPAM: 0.6,           // Flag if spam > 60%
    SELF_HARM: 0.3,      // Special handling - lower threshold for crisis context
  };
  
  // Crisis-specific keywords that should NOT be blocked
  private readonly CRISIS_PROTECTED_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'hurt myself', 'die', 'death',
    'hopeless', 'worthless', 'can\'t go on', 'give up', 'no point',
    'pills', 'overdose', 'cutting', 'self-harm', 'bridge', 'rope'
  ];
  
  private constructor() {
    console.log('🛡️ Content Moderation System initialized');
  }
  
  static getInstance(): ContentModerationSystem {
    if (!ContentModerationSystem.instance) {
      ContentModerationSystem.instance = new ContentModerationSystem();
    }
    return ContentModerationSystem.instance;
  }
  
  /**
   * Moderate content with crisis-aware filtering
   * TARGET: <100ms analysis time
   */
  async moderateContent(
    content: string,
    context: ModerationContext = { messageType: 'general', isAnonymous: false }
  ): Promise<ModerationResult> {
    const startTime = performance.now();
    
    try {
      // Quick safety check for empty content
      if (!content || content.trim().length === 0) {
        return {
          safe: true,
          riskScore: 0,
          categories: [],
          confidence: 1,
          action: 'ALLOW',
        };
      }
      
      // Analyze content for various risk factors
      const toxicityScore = this.analyzeToxicity(content);
      const harassmentScore = this.analyzeHarassment(content);
      const spamScore = this.analyzeSpam(content);
      const selfHarmScore = this.analyzeSelfHarm(content, context);
      
      // Calculate overall risk score
      const riskScore = Math.max(toxicityScore, harassmentScore, spamScore, selfHarmScore);
      
      // Determine categories
      const categories: string[] = [];
      if (toxicityScore > 0.5) categories.push('toxicity');
      if (harassmentScore > 0.5) categories.push('harassment');
      if (spamScore > 0.5) categories.push('spam');
      if (selfHarmScore > 0.3) categories.push('self-harm');
      
      // Special handling for crisis context
      let action: ModerationResult['action'] = 'ALLOW';
      let safe = true;
      let reason: string | undefined;
      
      if (context.messageType === 'crisis') {
        // In crisis context, be very careful about blocking genuine cries for help
        if (this.containsCrisisKeywords(content)) {
          // Allow crisis keywords even if they trigger other filters
          action = 'ALLOW';
          safe = true;
          reason = 'Crisis communication protected';
        } else if (riskScore > this.THRESHOLDS.TOXICITY) {
          action = 'ESCALATE';
          safe = false;
          reason = 'High toxicity in crisis context - human review required';
        }
      } else {
        // Standard moderation for non-crisis content
        if (riskScore > this.THRESHOLDS.TOXICITY) {
          action = 'BLOCK';
          safe = false;
          reason = 'Content violates community guidelines';
        } else if (riskScore > this.THRESHOLDS.HARASSMENT) {
          action = 'FLAG';
          safe = true;
          reason = 'Content flagged for review';
        }
      }
      
      const executionTime = performance.now() - startTime;
      
      if (executionTime > 100) {
        console.warn(`⚠️ Content moderation took ${executionTime.toFixed(2)}ms (target: <100ms)`);
      }
      
      console.log(`🛡️ Content moderated: ${action} (risk: ${(riskScore * 100).toFixed(1)}%, ${executionTime.toFixed(2)}ms)`);
      
      return {
        safe,
        riskScore,
        reason,
        categories,
        confidence: this.calculateConfidence(content, riskScore),
        action,
      };
      
    } catch (error) {
      console.error('❌ Content moderation failed:', error);
      
      // Fail safe - allow content but flag for review
      return {
        safe: true,
        riskScore: 0.5,
        reason: 'Moderation system error - flagged for manual review',
        categories: ['system-error'],
        confidence: 0,
        action: 'FLAG',
      };
    }
  }
  
  /**
   * Check appropriateness for specific contexts
   */
  async checkAppropriateness(
    content: string,
    context: 'crisis_response' | 'volunteer_response' | 'general'
  ): Promise<{ appropriate: boolean; appropriateness: number; issues: string[] }> {
    const issues: string[] = [];
    let appropriateness = 1.0;
    
    // Context-specific checks
    if (context === 'volunteer_response') {
      // Volunteers should use professional, empathetic language
      if (this.containsProfanity(content)) {
        issues.push('Contains inappropriate language for volunteer response');
        appropriateness -= 0.3;
      }
      
      if (this.lacksEmpathy(content)) {
        issues.push('Response lacks empathetic tone');
        appropriateness -= 0.2;
      }
      
      if (this.containsPersonalAdvice(content)) {
        issues.push('Contains personal advice rather than professional guidance');
        appropriateness -= 0.2;
      }
    }
    
    return {
      appropriate: appropriateness >= 0.7,
      appropriateness: Math.max(0, appropriateness),
      issues,
    };
  }
  
  // Private analysis methods
  
  private analyzeToxicity(content: string): number {
    const toxicPatterns = [
      /\b(hate|stupid|idiot|moron|loser)\b/gi,
      /\b(kill yourself|kys)\b/gi,
      /\b(worthless|pathetic|disgusting)\b/gi,
    ];
    
    let score = 0;
    for (const pattern of toxicPatterns) {
      if (pattern.test(content)) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1);
  }
  
  private analyzeHarassment(content: string): number {
    const harassmentPatterns = [
      /\b(stalking|following|watching you)\b/gi,
      /\b(personal information|address|phone)\b/gi,
      /\b(threats?|threatening|intimidat)\b/gi,
    ];
    
    let score = 0;
    for (const pattern of harassmentPatterns) {
      if (pattern.test(content)) {
        score += 0.4;
      }
    }
    
    return Math.min(score, 1);
  }
  
  private analyzeSpam(content: string): number {
    const spamIndicators = [
      /\b(buy now|click here|limited time)\b/gi,
      /\b(www\.|http|\.com|\.org)\b/gi,
      /\b(money|cash|prize|winner)\b/gi,
    ];
    
    let score = 0;
    for (const indicator of spamIndicators) {
      if (indicator.test(content)) {
        score += 0.2;
      }
    }
    
    // Check for repetitive content
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      score += 0.3; // Very repetitive content
    }
    
    return Math.min(score, 1);
  }
  
  private analyzeSelfHarm(content: string, context: ModerationContext): number {
    // In crisis context, self-harm language is expected and should be handled carefully
    if (context.messageType === 'crisis') {
      return 0; // Don't flag self-harm language in crisis context
    }
    
    const selfHarmPatterns = [
      /\b(cut myself|cutting|self.harm|self.injury)\b/gi,
      /\b(burn myself|burning|hurt myself)\b/gi,
    ];
    
    let score = 0;
    for (const pattern of selfHarmPatterns) {
      if (pattern.test(content)) {
        score += 0.4;
      }
    }
    
    return Math.min(score, 1);
  }
  
  private containsCrisisKeywords(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return this.CRISIS_PROTECTED_KEYWORDS.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
  }
  
  private containsProfanity(content: string): boolean {
    const profanityPatterns = [
      /\b(damn|hell|crap)\b/gi, // Mild profanity
      // More serious profanity would be added here
    ];
    
    return profanityPatterns.some(pattern => pattern.test(content));
  }
  
  private lacksEmpathy(content: string): boolean {
    const empathyIndicators = [
      /\b(understand|feel|sorry|care|support)\b/gi,
      /\b(here for you|not alone|we care)\b/gi,
    ];
    
    // If content is short and has no empathy indicators, it might lack empathy
    return content.length > 50 && !empathyIndicators.some(pattern => pattern.test(content));
  }
  
  private containsPersonalAdvice(content: string): boolean {
    const personalAdvicePatterns = [
      /\b(you should|you must|you need to)\b/gi,
      /\b(my experience|when I|I think you)\b/gi,
    ];
    
    return personalAdvicePatterns.some(pattern => pattern.test(content));
  }
  
  private calculateConfidence(content: string, riskScore: number): number {
    // Confidence based on content length and analysis certainty
    const lengthFactor = Math.min(content.length / 100, 1); // More confident with longer content
    const scoreFactor = riskScore > 0.8 || riskScore < 0.2 ? 1 : 0.7; // More confident with extreme scores
    
    return lengthFactor * scoreFactor;
  }
}