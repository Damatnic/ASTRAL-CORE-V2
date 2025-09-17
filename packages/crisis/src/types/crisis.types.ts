/**
 * ASTRAL_CORE 2.0 Crisis System Type Definitions
 * Comprehensive type safety for life-critical operations
 */

export interface CrisisConnection {
  /** Unique session identifier */
  sessionId: string;
  
  /** Session token for encryption and authentication */
  sessionToken: string;
  
  /** Anonymous user identifier (no PII) */
  anonymousId: string;
  
  /** Crisis severity level (1-10) */
  severity: number;
  
  /** WebSocket connection URL for real-time chat */
  websocketUrl: string;
  
  /** Whether messages are encrypted */
  encrypted: boolean;
  
  /** Response time for this connection (ms) */
  responseTimeMs: number;
  
  /** Whether response time met target */
  targetMet: boolean;
  
  /** Immediate crisis resources */
  resources: any[];
}

export interface CrisisSessionData {
  id: string;
  anonymousId: string;
  severity: number;
  status: CrisisStatus;
  responderId?: string;
  startedAt: Date;
  endedAt?: Date;
  responseTimeMs?: number;
  emergencyTriggered: boolean;
  escalationType?: EscalationType;
  outcome?: string;
}

export interface CrisisMessage {
  id: string;
  sessionId: string;
  senderType: MessageSender;
  senderId: string;
  timestamp: Date;
  encrypted: boolean;
  riskScore?: number;
  responseTimeMs?: number;
  sentimentScore?: number;
  keywordsDetected?: string[];
  riskLevel?: number;
}

export interface EmergencyProtocolResult {
  escalationId: string;
  severity: EscalationSeverity;
  actionsExecuted: string[];
  emergencyContacted: boolean;
  lifeline988Called: boolean;
  specialistAssigned: boolean;
  responseTimeMs: number;
  targetMet: boolean;
  nextSteps: string[];
}

export interface CrisisResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  phoneNumber?: string;
  url?: string;
  email?: string;
  textNumber?: string;
  content?: string;
  instructions: string[];
  available24_7: boolean;
  languages: string[];
  countries: string[];
  priority: number;
  isEmergency: boolean;
  severityMin: number;
  tags: string[];
}

export interface VolunteerMatchCriteria {
  severity: number;
  keywords: string[];
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  languages?: string[];
  specializations?: string[];
  timeZone?: string;
}

export interface VolunteerMatch {
  id: string;
  anonymousId: string;
  matchScore: number;
  specializations: string[];
  languages: string[];
  averageRating: number;
  responseRate: number;
  currentLoad: number;
  maxConcurrent: number;
  isEmergencyResponder: boolean;
}

export interface CrisisStats {
  activeSessions: number;
  totalToday: number;
  averageResponseTimeMs: number;
  targetMet: boolean;
  volunteersOnline: number;
  emergencySessions: number;
  escalatedSessions: number;
  livesHelped: number;
}

export interface PerformanceMetrics {
  responseTime: {
    current: number;
    average: number;
    p95: number;
    p99: number;
    target: number;
  };
  throughput: {
    sessionsPerHour: number;
    messagesPerSecond: number;
    peakConcurrency: number;
  };
  reliability: {
    uptime: number;
    errorRate: number;
    messageDelivery: number;
  };
  volunteers: {
    online: number;
    averageResponseTime: number;
    utilization: number;
  };
}

// Enums (matching database schema)

export type CrisisStatus = 
  | 'ACTIVE'
  | 'ASSIGNED' 
  | 'RESOLVED'
  | 'ESCALATED'
  | 'ABANDONED';

export type EscalationType =
  | 'AUTOMATIC_KEYWORD'
  | 'MANUAL_VOLUNTEER'
  | 'USER_REQUEST'
  | 'SYSTEM_TIMEOUT'
  | 'EMERGENCY_SERVICES';

export type MessageSender =
  | 'ANONYMOUS_USER'
  | 'VOLUNTEER'
  | 'SYSTEM'
  | 'AI_ASSISTANT';

export type MessageType =
  | 'TEXT'
  | 'VOICE_NOTE'
  | 'IMAGE'
  | 'SYSTEM_MESSAGE'
  | 'RESOURCE_SHARE';

export type MessagePriority =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT'
  | 'EMERGENCY';

export type EscalationSeverity =
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'
  | 'EMERGENCY';
export type EscalationOutcome =
  | 'RESOLVED'
  | 'ESCALATED'
  | 'TRANSFERRED'
  | 'PENDING'
  | 'FAILED';


export type EmergencyOutcome =
  | 'RESOLVED_INTERNALLY'
  | 'REFERRED_TO_PROFESSIONAL'
  | 'EMERGENCY_SERVICES_CONTACTED'
  | 'USER_DISCONNECTED'
  | 'ONGOING';

export type EscalationTrigger =
  | 'AUTOMATIC_KEYWORD'
  | 'VOLUNTEER_REQUEST'
  | 'USER_REQUEST'
  | 'TIMEOUT'
  | 'AI_ASSESSMENT'
  | 'SEVERITY_INCREASE';

export type ResourceCategory =
  | 'CRISIS_HOTLINE'
  | 'EMERGENCY_SERVICE'
  | 'SELF_HELP_TOOL'
  | 'BREATHING_EXERCISE'
  | 'GROUNDING_TECHNIQUE'
  | 'SAFETY_PLANNING'
  | 'PROFESSIONAL_HELP'
  | 'PEER_SUPPORT';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'EMERGENCY_SERVICES' | 'CRISIS_HOTLINE' | 'FAMILY' | 'FRIEND' | 'PROFESSIONAL';
  priority: number;
  available24_7: boolean;
  region?: string;
}

// Event types for analytics
export interface CrisisEvent {
  type: 'crisis_session_created' | 'crisis_message_sent' | 'emergency_escalated' | 'volunteer_assigned';
  sessionId: string;
  timestamp: Date;
  metadata: {
    severity?: number;
    responseTime?: number;
    volunteerId?: string;
    escalationType?: EscalationType;
    [key: string]: any;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'volunteer_joined' | 'system_notification' | 'emergency_alert';
  sessionToken: string;
  data: {
    messageId?: string;
    content?: string;
    senderType?: MessageSender;
    timestamp?: Date;
    metadata?: any;
  };
}

// Error types
export class CrisisSystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical',
    public context?: any
  ) {
    super(message);
    this.name = 'CrisisSystemError';
  }
}

export class EmergencyEscalationError extends Error {
  constructor(
    message: string,
    public sessionId: string,
    public escalationType: EscalationType,
    public context?: any
  ) {
    super(message);
    this.name = 'EmergencyEscalationError';
  }
}