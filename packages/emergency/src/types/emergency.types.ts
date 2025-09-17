/**
 * ASTRAL_CORE 2.0 Emergency System Types
 * Type definitions for emergency escalation and response systems
 */

export interface EmergencyContact {
  id: string;
  name: string;
  role: 'CRISIS_COUNSELOR' | 'THERAPIST' | 'PSYCHIATRIST' | 'EMERGENCY_SERVICES' | 'FAMILY_CONTACT' | 'SUPERVISOR';
  contactMethods: ContactMethod[];
  availability: AvailabilitySchedule;
  specializations: string[];
  priority: number;
  isActive: boolean;
  responseTimeExpected: number; // in minutes
  escalationLevel: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'EMERGENCY';
  credentials: ProfessionalCredentials;
  lastContactedAt?: Date;
}

export interface ContactMethod {
  type: 'PHONE' | 'SMS' | 'EMAIL' | 'VIDEO_CALL' | 'SECURE_MESSAGE' | 'EMERGENCY_HOTLINE';
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  lastVerifiedAt: Date;
  restrictions?: {
    hours?: TimeRange;
    emergencyOnly?: boolean;
  };
}

export interface AvailabilitySchedule {
  timezone: string;
  regularHours: WeeklySchedule;
  emergencyHours?: WeeklySchedule;
  blackoutDates: DateRange[];
  currentStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'EMERGENCY_ONLY';
  lastUpdated: Date;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  timeRanges: TimeRange[];
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface DateRange {
  start: Date;
  end: Date;
  reason?: string;
}

export interface ProfessionalCredentials {
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: Date;
  certifications: string[];
  yearsExperience: number;
  specialtyAreas: string[];
  isVerified: boolean;
  verificationDate?: Date;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  description: string;
  triggerConditions: TriggerCondition[];
  escalationSteps: EscalationStep[];
  requiredApprovals: string[];
  timeoutSettings: TimeoutSettings;
  documentationRequired: DocumentationRequirement[];
  isActive: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy: string;
}

export interface TriggerCondition {
  type: 'KEYWORD_DETECTION' | 'RISK_LEVEL' | 'TIME_BASED' | 'MANUAL_TRIGGER' | 'BEHAVIOR_PATTERN';
  criteria: Record<string, any>;
  weight: number;
  isRequired: boolean;
}

export interface EscalationStep {
  stepNumber: number;
  action: EscalationAction;
  timeoutMinutes: number;
  failureAction: 'PROCEED' | 'RETRY' | 'ESCALATE' | 'ABORT';
  requiredRoles: string[];
  notification: NotificationSettings;
  documentation: string[];
}

export interface EscalationAction {
  type: 'CONTACT_PROFESSIONAL' | 'NOTIFY_EMERGENCY_SERVICES' | 'ALERT_SUPERVISOR' | 'TRANSFER_SESSION' | 'ACTIVATE_EMERGENCY_PROTOCOL';
  parameters: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  autoExecute: boolean;
}

export interface TimeoutSettings {
  initialResponse: number; // minutes
  followUp: number; // minutes
  escalation: number; // minutes
  maxDuration: number; // minutes
}

export interface DocumentationRequirement {
  type: 'INCIDENT_REPORT' | 'CONTACT_LOG' | 'ASSESSMENT_NOTES' | 'FOLLOW_UP_PLAN';
  isRequired: boolean;
  template?: string;
  deadline: number; // hours after incident
}

export interface NotificationSettings {
  channels: ('EMAIL' | 'SMS' | 'PUSH' | 'VOICE_CALL' | 'SECURE_MESSAGE')[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  retryAttempts: number;
  retryInterval: number; // minutes
}

export interface EmergencyResponse {
  id: string;
  incidentId: string;
  protocolId: string;
  triggeredBy: string;
  triggeredAt: Date;
  status: 'INITIATED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CANCELLED' | 'FAILED';
  currentStep: number;
  steps: ResponseStep[];
  contacts: EmergencyContactAttempt[];
  timeline: ResponseTimeline[];
  resolution?: EmergencyResolution;
  metadata: EmergencyMetadata;
}

export interface ResponseStep {
  stepNumber: number;
  action: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt?: Date;
  completedAt?: Date;
  executedBy?: string;
  result?: string;
  notes?: string;
}

export interface EmergencyContactAttempt {
  contactId: string;
  method: string;
  attemptedAt: Date;
  status: 'SUCCESSFUL' | 'FAILED' | 'NO_RESPONSE' | 'BUSY' | 'UNAVAILABLE';
  responseTime?: number; // minutes
  notes?: string;
}

export interface ResponseTimeline {
  timestamp: Date;
  event: string;
  description: string;
  performedBy?: string;
  data?: Record<string, any>;
}

export interface EmergencyResolution {
  resolvedAt: Date;
  resolvedBy: string;
  resolution: 'CRISIS_AVERTED' | 'PROFESSIONAL_CONTACTED' | 'EMERGENCY_SERVICES_DISPATCHED' | 'REFERRED_TO_CARE' | 'FALSE_ALARM';
  outcome: string;
  followUpRequired: boolean;
  followUpActions: string[];
  lessonsLearned?: string[];
}

export interface EmergencyMetadata {
  sessionId?: string;
  userId?: string;
  userLocation?: {
    country: string;
    region: string;
    city?: string;
    timezone: string;
  };
  riskFactors: string[];
  protectiveFactors: string[];
  priorIncidents: number;
  relationshipToUser?: string;
}

export interface EmergencyAlert {
  id: string;
  type: 'IMMINENT_RISK' | 'HIGH_RISK' | 'ESCALATION_TIMEOUT' | 'SYSTEM_FAILURE' | 'MANUAL_ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  message: string;
  details: string;
  createdAt: Date;
  expiresAt?: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  relatedIncidentId?: string;
}

export interface EmergencyStatistics {
  totalIncidents: number;
  responseTimeAverage: number; // minutes
  resolutionRate: number; // percentage
  escalationRate: number; // percentage
  contactSuccessRate: number; // percentage
  protocolEffectiveness: Record<string, number>;
  timeBreakdown: {
    detection: number;
    response: number;
    resolution: number;
  };
  outcomeDistribution: Record<string, number>;
}