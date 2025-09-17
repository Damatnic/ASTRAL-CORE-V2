/**
 * Crisis prevention and safety planning type definitions
 */

import { UUID, Timestamp, MediaContent } from './index';

// Safety plan types
export interface SafetyPlan {
  id: UUID;
  userId: UUID;
  version: number;
  warningSigns: WarningSign[];
  copingStrategies: CopingStrategy[];
  distractionContacts: Contact[];
  supportContacts: EmergencyContact[];
  professionals: Professional[];
  safeEnvironment: EnvironmentStep[];
  reasonsToLive: ReasonToLive[];
  isActive: boolean;
  shareWithTherapist: boolean;
  shareWithContacts: UUID[]; // User IDs who can access
  lastUpdated: Timestamp;
  lastReviewed: Timestamp;
  nextReviewDate?: Timestamp;
  createdAt: Timestamp;
}

export interface WarningSign {
  id: UUID;
  description: string;
  category: 'thought' | 'emotion' | 'behavior' | 'physical' | 'situational';
  severity: 'mild' | 'moderate' | 'severe';
  frequency?: 'rare' | 'occasional' | 'frequent' | 'constant';
  lastExperienced?: Timestamp;
  triggerIds?: UUID[]; // References to triggers
}

export interface CopingStrategy {
  id: UUID;
  name: string;
  description: string;
  category: CopingCategory;
  steps?: string[];
  effectiveness?: number; // 1-10 based on user history
  lastUsed?: Timestamp;
  usageCount: number;
  toolId?: UUID; // Reference to self-help tool
  customStrategy: boolean;
  requiresPreparation: boolean;
  preparationSteps?: string[];
}

export type CopingCategory = 
  | 'distraction'
  | 'self-soothing'
  | 'mindfulness'
  | 'physical'
  | 'creative'
  | 'social'
  | 'cognitive'
  | 'spiritual';

export interface Contact {
  id: UUID;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  preferredContact: 'phone' | 'text' | 'email' | 'in-person';
  availability?: string; // e.g., "Weekdays 9-5"
  notes?: string;
}

export interface EmergencyContact extends Contact {
  isPrimary: boolean;
  is24Hour: boolean;
  canCallForMe: boolean; // Can call emergency services on user's behalf
  hasAgreedToHelp: boolean;
  lastContacted?: Timestamp;
}

export interface Professional {
  id: UUID;
  name: string;
  title: string;
  specialty?: string;
  organization?: string;
  phone: string;
  emergencyPhone?: string;
  email?: string;
  address?: string;
  availability: string;
  isCurrentProvider: boolean;
  lastAppointment?: Timestamp;
  nextAppointment?: Timestamp;
}

export interface EnvironmentStep {
  id: UUID;
  action: string;
  category: 'remove' | 'avoid' | 'modify' | 'add';
  location?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ReasonToLive {
  id: UUID;
  reason: string;
  category?: ReasonCategory;
  importance: number; // 1-10
  media?: MediaContent[];
  reminderFrequency?: 'daily' | 'weekly' | 'monthly';
  lastReminded?: Timestamp;
}

export type ReasonCategory = 
  | 'family'
  | 'friends'
  | 'pets'
  | 'goals'
  | 'beliefs'
  | 'experiences'
  | 'responsibilities'
  | 'other';

// Hope box / Comfort kit
export interface HopeBox {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  items: HopeItem[];
  categories: HopeCategory[];
  isPublic: boolean;
  isShared: boolean;
  sharedWith?: UUID[]; // User IDs
  lastAccessed: Timestamp;
  createdAt: Timestamp;
  itemCount: number;
}

export interface HopeItem {
  id: UUID;
  type: HopeItemType;
  title: string;
  description?: string;
  content?: string; // Text content
  media?: MediaContent;
  category: string;
  tags: string[];
  source?: string; // Who gave it, where it's from
  addedDate: Timestamp;
  accessCount: number;
  lastAccessed?: Timestamp;
  isFavorite: boolean;
  mood?: number; // Mood when added
  notes?: string;
}

export type HopeItemType = 
  | 'photo'
  | 'video'
  | 'audio'
  | 'text'
  | 'quote'
  | 'letter'
  | 'achievement'
  | 'memory'
  | 'gratitude'
  | 'affirmation'
  | 'song'
  | 'poem';

export interface HopeCategory {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  itemCount: number;
}

// Trigger management
export interface TriggerProfile {
  userId: UUID;
  triggers: DetailedTrigger[];
  patterns: TriggerPattern[];
  copingMap: TriggerCopingMap[];
  riskLevel: RiskLevel;
  lastAssessment: Timestamp;
}

export interface DetailedTrigger {
  id: UUID;
  type: 'internal' | 'external' | 'situational';
  category: TriggerCategory;
  description: string;
  intensity: number; // 1-10
  frequency: FrequencyLevel;
  predictability: 'unpredictable' | 'somewhat' | 'predictable';
  copingStrategies: UUID[]; // Strategy IDs
  warningTime?: number; // Minutes of warning before trigger
  lastOccurrence?: Timestamp;
  occurrenceCount: number;
  notes?: string;
}

export type TriggerCategory = 
  | 'interpersonal'
  | 'environmental'
  | 'emotional'
  | 'physical'
  | 'cognitive'
  | 'trauma-related'
  | 'substance-related'
  | 'financial'
  | 'health';

export interface TriggerPattern {
  id: UUID;
  description: string;
  triggers: UUID[]; // Trigger IDs that form pattern
  frequency: number;
  timePattern?: string; // e.g., "mornings", "weekends"
  seasonalPattern?: string;
  confidence: number; // 0-1, statistical confidence
}

export interface TriggerCopingMap {
  triggerId: UUID;
  strategyId: UUID;
  effectiveness: number; // 1-10
  usageCount: number;
  lastUsed?: Timestamp;
  notes?: string;
}

// Crisis prevention planning
export interface PreventionPlan {
  id: UUID;
  userId: UUID;
  earlyWarningSigns: EarlyWarningSign[];
  vulnerabilityFactors: VulnerabilityFactor[];
  protectiveFactors: ProtectiveFactor[];
  actionSteps: PreventionStep[];
  checkInSchedule: CheckInSchedule;
  escalationProtocol: EscalationProtocol;
  lastUpdated: Timestamp;
}

export interface EarlyWarningSign {
  sign: string;
  timeframe: string; // e.g., "2-3 days before crisis"
  severity: 'low' | 'medium' | 'high';
  actionRequired: string;
}

export interface VulnerabilityFactor {
  factor: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  manageable: boolean;
  managementStrategy?: string;
}

export interface ProtectiveFactor {
  factor: string;
  category: string;
  strength: 'weak' | 'moderate' | 'strong';
  howToStrengthen?: string;
}

export interface PreventionStep {
  trigger: string;
  action: string;
  whenToUse: string;
  effectiveness?: number;
}

export interface CheckInSchedule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  preferredTimes: string[];
  method: 'self' | 'automated' | 'therapist' | 'support-person';
  questions: string[];
}

export interface EscalationProtocol {
  levels: EscalationLevel[];
  currentLevel: number;
  lastEscalation?: Timestamp;
  autoEscalate: boolean;
  escalationThresholds: EscalationThreshold[];
}

export interface EscalationLevel {
  level: number;
  description: string;
  indicators: string[];
  actions: string[];
  contacts: UUID[]; // Contact IDs to notify
}

export interface EscalationThreshold {
  metric: string;
  threshold: number;
  action: 'alert' | 'escalate' | 'intervene';
}

// Risk assessment
export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe' | 'critical';
export type FrequencyLevel = 'never' | 'rare' | 'occasional' | 'frequent' | 'constant';