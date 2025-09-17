/**
 * ASTRAL_CORE 2.0 AI Safety & Moderation Types
 * Core type definitions for AI safety and moderation systems
 */

export interface SafetyCheckResult {
  id: string;
  content: string;
  checkType: 'TOXICITY' | 'SELF_HARM' | 'ABUSE' | 'SPAM' | 'QUALITY';
  score: number;
  threshold: number;
  passed: boolean;
  confidence: number;
  reasons: string[];
  timestamp: Date;
  processingTime: number;
}

export interface SafetyMetrics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  averageProcessingTime: number;
  averageScore: number;
  highRiskDetections: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
}

export interface SafetyConfiguration {
  toxicityThreshold: number;
  selfHarmThreshold: number;
  abuseThreshold: number;
  qualityThreshold: number;
  autoEscalateThreshold: number;
  autoBlockThreshold: number;
  supervisorAlertThreshold: number;
  enableDataAnonymization: boolean;
  enablePiiDetection: boolean;
  privacyHashRounds: number;
}

export interface UserBehaviorProfile {
  userId: string;
  riskScore: number;
  behaviorPatterns: BehaviorPattern[];
  recentActivity: ActivityRecord[];
  flaggedInteractions: number;
  trustLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED';
  lastUpdated: Date;
}

export interface BehaviorPattern {
  type: 'MESSAGING_FREQUENCY' | 'CONTENT_QUALITY' | 'INTERACTION_STYLE' | 'RISK_INDICATORS';
  pattern: string;
  frequency: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  firstDetected: Date;
  lastDetected: Date;
}

export interface ActivityRecord {
  timestamp: Date;
  action: string;
  content?: string;
  riskScore?: number;
  flagged: boolean;
  sessionId?: string;
}

export interface AIModelConfig {
  modelName: string;
  version: string;
  endpoint: string;
  apiKey?: string;
  timeout: number;
  maxRetries: number;
  confidenceThreshold: number;
  enabled: boolean;
}

export interface SafetyAction {
  id: string;
  type: 'BLOCK' | 'ESCALATE' | 'WARN' | 'LOG' | 'HUMAN_REVIEW';
  triggered: boolean;
  reason: string;
  confidence: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}