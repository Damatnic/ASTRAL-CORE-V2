/**
 * ASTRAL_CORE 2.0 Crisis Detection Types
 * Type definitions for crisis detection and anomaly detection systems
 */

export interface DetectionResult {
  id: string;
  contentId: string;
  detectionType: 'CRISIS_KEYWORDS' | 'SENTIMENT_ANALYSIS' | 'BEHAVIOR_ANOMALY' | 'PATTERN_MATCH';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'IMMINENT';
  confidence: number;
  detectedAt: Date;
  triggers: DetectionTrigger[];
  metadata: DetectionMetadata;
  escalationRequired: boolean;
  reviewStatus: 'PENDING' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED';
  followUpActions: string[];
}

export interface DetectionTrigger {
  type: 'KEYWORD' | 'PHRASE' | 'PATTERN' | 'SENTIMENT' | 'FREQUENCY' | 'CONTEXT';
  value: string;
  weight: number;
  location: {
    start: number;
    end: number;
    context: string;
  };
  category: string;
}

export interface DetectionMetadata {
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  contentLength: number;
  language?: string;
  platform: string;
  userContext?: {
    previousSessions: number;
    riskHistory: string[];
    supportLevel: 'FIRST_TIME' | 'RETURNING' | 'HIGH_RISK' | 'CHRONIC';
  };
}

export interface CrisisKeyword {
  keyword: string;
  variations: string[];
  weight: number;
  category: 'SUICIDE' | 'SELF_HARM' | 'DEPRESSION' | 'ANXIETY' | 'SUBSTANCE_ABUSE' | 'DOMESTIC_VIOLENCE' | 'CRISIS_GENERAL';
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context: 'DIRECT' | 'INDIRECT' | 'METAPHORICAL' | 'PLANNING';
  requiredEscalation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  patternType: 'FREQUENCY' | 'TIMING' | 'CONTENT' | 'BEHAVIOR' | 'ESCALATION';
  algorithm: 'STATISTICAL' | 'ML_BASED' | 'RULE_BASED' | 'HYBRID';
  thresholds: {
    warning: number;
    alert: number;
    critical: number;
  };
  timeWindow: {
    value: number;
    unit: 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';
  };
  isActive: boolean;
}

export interface SentimentAnalysis {
  id: string;
  contentId: string;
  overallSentiment: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE';
  emotionalIndicators: {
    hopelessness: number;
    despair: number;
    anger: number;
    fear: number;
    sadness: number;
    isolation: number;
  };
  linguisticMarkers: {
    finalityLanguage: number;
    isolationLanguage: number;
    helplessnessLanguage: number;
    painLanguage: number;
  };
  riskFactors: string[];
  protectiveFactors: string[];
  confidence: number;
  processingTime: number;
}

export interface BehaviorAnalysis {
  id: string;
  userId: string;
  sessionId: string;
  behaviors: DetectedBehavior[];
  riskAssessment: RiskAssessment;
  recommendations: string[];
  analysisTimestamp: Date;
  modelVersion: string;
}

export interface DetectedBehavior {
  type: 'COMMUNICATION_PATTERN' | 'SESSION_FREQUENCY' | 'ENGAGEMENT_LEVEL' | 'RESPONSE_TIME' | 'HELP_SEEKING';
  value: string | number;
  normalRange: {
    min: number;
    max: number;
  };
  deviation: number;
  significance: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'RAPID_DECLINE';
}

export interface RiskAssessment {
  overallRisk: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'IMMINENT';
  riskFactors: RiskFactor[];
  protectiveFactors: ProtectiveFactor[];
  immediateActions: string[];
  recommendedInterventions: string[];
  confidenceLevel: number;
  validUntil: Date;
}

export interface RiskFactor {
  factor: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string[];
  weight: number;
  category: 'HISTORICAL' | 'CURRENT' | 'ENVIRONMENTAL' | 'BEHAVIORAL';
}

export interface ProtectiveFactor {
  factor: string;
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  evidence: string[];
  category: 'SOCIAL' | 'PERSONAL' | 'PROFESSIONAL' | 'SPIRITUAL' | 'PHYSICAL';
}

export interface DetectionConfig {
  keywordSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
  sentimentThreshold: number;
  behaviorAnalysisEnabled: boolean;
  realTimeProcessing: boolean;
  escalationRules: EscalationRule[];
  falsePositiveReduction: boolean;
  learningMode: boolean;
}

export interface EscalationRule {
  id: string;
  condition: string;
  action: 'NOTIFY_VOLUNTEER' | 'EMERGENCY_CONTACT' | 'PROFESSIONAL_REFERRAL' | 'CRISIS_INTERVENTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  autoExecute: boolean;
  requiredApprovals: string[];
}