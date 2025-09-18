/**
 * Session-related type definitions
 */

import { 
  TherapeuticIntervention, 
  TherapistProfile, 
  TherapyApproach,
  RiskAssessment,
  SessionNote,
  TherapeuticAlliance,
  ClientInsight
} from './therapy.types';

export interface TherapySession {
  id: string;
  userId: string;
  therapistId: string;
  therapistProfile: TherapistProfile;
  approach: TherapyApproach;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  status: SessionStatus;
  mode: SessionMode;
  transcript: SessionTranscript[];
  interventionsUsed: TherapeuticIntervention[];
  insights: ClientInsight[];
  riskAssessment?: RiskAssessment;
  sessionNote?: SessionNote;
  therapeuticAlliance?: TherapeuticAlliance;
  metadata: SessionMetadata;
}

export type SessionStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'crisis_escalated';

export type SessionMode = 
  | 'text'
  | 'audio'
  | 'video'
  | 'hybrid';

export interface SessionTranscript {
  id: string;
  timestamp: Date;
  speaker: 'client' | 'therapist' | 'system';
  message: string;
  sentiment?: SentimentAnalysis;
  emotionalState?: EmotionalState;
  interventionTriggered?: TherapeuticIntervention;
  crisisFlag?: boolean;
}

export interface SentimentAnalysis {
  polarity: number; // -1 to 1
  subjectivity: number; // 0 to 1
  confidence: number; // 0 to 1
  primaryEmotion?: string;
  emotions: Record<string, number>;
}

export interface EmotionalState {
  anxiety: number; // 0-1
  depression: number; // 0-1
  anger: number; // 0-1
  fear: number; // 0-1
  sadness: number; // 0-1
  joy: number; // 0-1
  hope: number; // 0-1
  calm: number; // 0-1
  stress: number; // 0-1
  overall: 'distressed' | 'neutral' | 'positive';
}

export interface SessionMetadata {
  device: string;
  location?: string; // anonymized
  connectionQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  interruptions?: number;
  technicalIssues?: string[];
  handoffOccurred?: boolean;
  handoffReason?: string;
  emergencyProtocolActivated?: boolean;
}

export interface SessionContext {
  previousSessions: SessionSummary[];
  currentMedications?: string[];
  recentLifeEvents?: string[];
  currentStressors?: string[];
  supportSystem?: string[];
  copingStrategies?: string[];
  lastAssessmentScores?: AssessmentScores;
  treatmentGoals?: string[];
  preferences?: ClientPreferences;
}

export interface SessionSummary {
  id: string;
  date: Date;
  duration: number;
  approach: TherapyApproach;
  keyTopics: string[];
  interventionsUsed: string[];
  homework?: string[];
  progress?: string;
  nextSteps?: string[];
}

export interface AssessmentScores {
  PHQ9?: number;
  GAD7?: number;
  PCL5?: number;
  MDI?: number;
  customScores?: Record<string, number>;
  lastUpdated: Date;
}

export interface ClientPreferences {
  preferredTherapist?: string;
  preferredApproach?: TherapyApproach;
  communicationStyle?: CommunicationStyle;
  sessionFrequency?: SessionFrequency;
  topicsToAvoid?: string[];
  culturalConsiderations?: string[];
  religiousConsiderations?: string[];
  languagePreference?: string;
  accessibilityNeeds?: string[];
}

export type CommunicationStyle = 
  | 'directive'
  | 'collaborative'
  | 'supportive'
  | 'exploratory'
  | 'structured'
  | 'flexible';

export type SessionFrequency = 
  | 'daily'
  | 'twice_weekly'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'as_needed';

export interface SessionRequest {
  userId: string;
  requestedTherapist?: string;
  requestedApproach?: TherapyApproach;
  urgency: 'routine' | 'urgent' | 'crisis';
  presentingConcern: string;
  previousTherapy?: boolean;
  medications?: string[];
  preferredMode: SessionMode;
  availableNow: boolean;
  scheduledFor?: Date;
}

export interface SessionResponse {
  sessionId: string;
  therapistAssigned: TherapistProfile;
  estimatedWaitTime?: number; // minutes
  status: 'confirmed' | 'waitlist' | 'unavailable' | 'crisis_redirect';
  joinUrl?: string;
  preparationTips?: string[];
  alternativeOptions?: AlternativeOption[];
}

export interface AlternativeOption {
  type: 'self_help' | 'peer_support' | 'crisis_line' | 'emergency';
  description: string;
  accessInfo: string;
  immediatelyAvailable: boolean;
}

export interface SessionFeedback {
  sessionId: string;
  rating: number; // 1-5
  helpful: boolean;
  feelingSafe: boolean;
  wouldRecommend: boolean;
  therapistRating?: number; // 1-5
  approachEffectiveness?: number; // 1-5
  technicalQuality?: number; // 1-5
  improvements?: string;
  positives?: string;
  additionalComments?: string;
  submittedAt: Date;
}

export interface SessionAnalytics {
  sessionId: string;
  engagementScore: number; // 0-1
  therapeuticAllianceScore: number; // 0-1
  interventionEffectiveness: Map<string, number>;
  emotionalTrajectory: EmotionalState[];
  keyThemes: string[];
  riskIndicators: string[];
  progressIndicators: string[];
  recommendedFollowUp: string[];
}

export interface TherapistAvailability {
  therapistId: string;
  currentStatus: 'available' | 'in_session' | 'break' | 'offline';
  nextAvailable?: Date;
  sessionQueue: number;
  estimatedWaitTime: number; // minutes
  maxDailySessionsReached: boolean;
}

export interface SessionProtocol {
  approach: TherapyApproach;
  phase: number;
  totalPhases: number;
  currentIntervention: string;
  protocolAdherence: number; // 0-1
  deviationReason?: string;
  supervisorApprovalNeeded?: boolean;
}