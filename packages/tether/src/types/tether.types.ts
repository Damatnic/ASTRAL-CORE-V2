/**
 * ASTRAL_CORE 2.0 Tether Types
 * Core type definitions for the Tether connection system
 */

export interface TetherConnection {
  id: string;
  seekerId: string;
  supporterId: string;
  strength: number; // 0-1 scale
  established: Date;
  lastActivity?: Date;
  pulseInterval: number; // seconds
  emergencyActive: boolean;
  emergencyType?: string;
  specialties: string[];
  languages: string[];
  compatibility?: CompatibilityResult;
  executionTimeMs?: number;
}

export interface CreateTetherRequest {
  seekerId: string;
  supporterId: string;
  preferences?: TetherPreferences;
  sharedPreferences?: Record<string, any>;
  timezone?: string;
  dataSharing?: 'MINIMAL' | 'STANDARD' | 'FULL';
  locationSharing?: boolean;
  emergencyContact?: boolean;
  pulseInterval?: number;
}

export interface TetherPreferences {
  communicationStyle: 'text' | 'voice' | 'video' | 'mixed';
  availabilityHours: { start: number; end: number };
  responseTimeExpectation: 'immediate' | 'quick' | 'flexible';
  supportTopics: string[];
  triggerWarnings: string[];
  preferredLanguage: string;
}

export interface TetherPulseData {
  type: 'HEARTBEAT' | 'CHECK_IN' | 'SUPPORT_REQUEST' | 'EMERGENCY' | 'GRATITUDE';
  strength?: number;
  mood?: number; // 1-10 scale
  status?: 'NORMAL' | 'STRESSED' | 'CRISIS' | 'IMPROVING';
  message?: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  emergencySignal?: boolean;
  senderId?: string;
  metadata?: Record<string, any>;
}

export interface TetherEmergencyTrigger {
  triggerUserId: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message?: string;
  type: 'MENTAL_HEALTH_CRISIS' | 'SAFETY_CONCERN' | 'MEDICAL_EMERGENCY' | 'OTHER';
  severity?: number; // 1-10 scale
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: string;
  };
}

export interface TetherStats {
  totalTethers: number;
  activeTethers: number;
  emergencyTethers: number;
  averageStrength: number;
  pulsesToday: number;
  emergenciesToday: number;
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export interface TetherUpdateData {
  strength?: number;
  trustScore?: number;
  lastActivity?: Date;
  emergencyActive?: boolean;
  emergencyType?: string;
  missedPulses?: number;
}

export interface CompatibilityResult {
  score: number; // 0-1 scale
  sharedInterests: string[];
  sharedLanguages: string[];
  timezoneCompatibility: number;
  communicationStyleMatch: number;
  supportTopicOverlap: number;
  factors: {
    personality: number;
    availability: number;
    experience: number;
    specialization: number;
  };
}

export interface TetherLink {
  id: string;
  seekerId: string;
  supporterId: string;
  strength: number;
  trustScore: number;
  matchingScore: number;
  established: Date;
  lastActivity: Date;
  lastPulse: Date;
  lastEmergency?: Date;
  pulseInterval: number;
  missedPulses: number;
  emergencyActive: boolean;
  emergencyType?: string;
  specialties: string[];
  languages: string[];
  timezone: string;
  dataSharing: 'MINIMAL' | 'STANDARD' | 'FULL';
  locationSharing: boolean;
  emergencyContact: boolean;
  encryptedMeta?: Buffer;
}