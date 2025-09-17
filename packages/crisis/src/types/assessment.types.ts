/**
 * ASTRAL_CORE 2.0 Crisis Assessment Types
 */

export interface CrisisAssessment {
  /** Severity level 1-10 (10 = immediate life threat) */
  severity: number;
  
  /** Risk score 1-10 (matches severity) */
  riskScore: number;
  
  /** All keywords detected in message */
  keywordsDetected: string[];
  
  /** Emergency keywords that trigger immediate escalation */
  emergencyKeywords: string[];
  
  /** Sentiment score -1 (very negative) to 1 (very positive) */
  sentimentScore: number;
  
  /** Assessment confidence 0-1 */
  confidence: number;
  
  /** Whether immediate risk is detected */
  immediateRisk: boolean;
  
  /** Recommended actions based on assessment */
  recommendedActions: string[];
  
  /** Time taken for assessment in ms */
  executionTimeMs: number;
}

export interface KeywordMatch {
  /** All keyword matches with metadata */
  matches: Array<{
    keyword: string;
    category: string;
    weight: number;
  }>;
  
  /** Emergency keywords found */
  emergencyMatches: string[];
  
  /** Positive indicators found */
  positiveMatches: string[];
  
  /** Coping mechanism indicators */
  copingMatches: string[];
  
  /** Total weighted score from all matches */
  totalWeight: number;
}

export interface SentimentAnalysis {
  /** Sentiment score -1 (negative) to 1 (positive) */
  score: number;
  
  /** Confidence in sentiment assessment */
  confidence: number;
  
  /** Number of positive indicators */
  positiveIndicators: number;
  
  /** Number of negative indicators */
  negativeIndicators: number;
}

export interface ContextualFactors {
  /** Message length in characters */
  length: number;
  
  /** Word count */
  wordCount: number;
  
  /** Number of question marks */
  hasQuestionMarks: number;
  
  /** Number of exclamation marks */
  hasExclamationMarks: number;
  
  /** Number of ALL CAPS words */
  hasAllCaps: number;
  
  /** Immediate time references (now, tonight, etc.) */
  hasImmediateTimeWords: boolean;
  
  /** Future time references */
  hasFutureWords: boolean;
  
  /** Support system mentions */
  hasSupportWords: boolean;
  
  /** Urgency indicator count */
  urgencyIndicators: number;
  
  /** Hope indicator count */
  hopeIndicators: number;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

export type AssessmentAction = 
  | 'IMMEDIATE_ESCALATION'
  | 'EMERGENCY_SERVICES_ALERT'
  | 'SUPERVISOR_NOTIFICATION'
  | 'PRIORITY_VOLUNTEER_ASSIGNMENT'
  | 'ENHANCED_MONITORING'
  | 'STANDARD_VOLUNTEER_ASSIGNMENT'
  | 'PEER_SUPPORT_MATCHING'
  | 'RESOURCE_PROVISION'
  | 'WELLNESS_RESOURCES'
  | 'REINFORCE_COPING_STRATEGIES'
  | 'BUILD_ON_POSITIVE_INDICATORS';

export interface AssessmentConfig {
  /** Emergency threshold (severity >= this triggers emergency) */
  emergencyThreshold: number;
  
  /** High-risk threshold */
  highRiskThreshold: number;
  
  /** Moderate-risk threshold */
  moderateRiskThreshold: number;
  
  /** Whether to use ML models for assessment */
  useMLModels: boolean;
  
  /** Sentiment analysis enabled */
  sentimentAnalysisEnabled: boolean;
  
  /** Contextual analysis enabled */
  contextualAnalysisEnabled: boolean;
  
  /** Languages supported */
  supportedLanguages: string[];
}