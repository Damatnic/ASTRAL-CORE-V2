// Crisis System Core Types

export interface CrisisProfile {
  id: string;
  severityLevel?: number;
  complexityLevel?: number;
  suicidalIdeation?: boolean;
  violenceRisk?: boolean;
  substanceAbuse?: boolean;
  requiredSkills?: string[];
  preferredLanguages?: string[];
  religiousConsiderations?: {
    compatible?: string[];
  };
  communicationPreference?: string;
}

export interface VolunteerProfile {
  id: string;
  specializations?: string[];
  experienceLevel?: number;
  languages?: string[];
  religiousBackground?: string;
  communicationStyle?: string;
  culturalSensitivity?: {
    level: number;
  };
}

export interface EmergencyProtocol {
  responseTime: number;
  requiresSupervisor: boolean;
  contactEmergencyServices: boolean;
}

export type EscalationLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface QualityMetrics {
  averageScore: number;
  totalSessions: number;
  positiveOutcomes: number;
  improvementAreas: string[];
  strengths: string[];
}

export interface PerformanceAnalysis {
  volunteerId: string;
  period: {
    start: Date;
    end: Date;
  };
  averageScore: number;
  totalSessions: number;
  positiveOutcomes: number;
  improvementAreas: string[];
  strengths: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface MatchResult {
  volunteerId: string;
  score: number;
  factors: string[];
}

export interface CrisisMessage {
  id: string;
  sessionId: string;
  messageId: string;
  type: string;
  content: string;
  timestamp: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface WebSocketConnection {
  id: string;
  sessionId: string;
  socket: any;
  isActive: boolean;
  lastHeartbeat: Date;
  config: any;
  messageCount: number;
  createdAt: Date;
}

export interface ConnectionPool {
  primary: any[];
  backup: any[];
}

export interface CulturalSensitivity {
  level: number;
}