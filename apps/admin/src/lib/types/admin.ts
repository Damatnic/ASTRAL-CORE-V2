// Admin System Type Definitions for ASTRAL CORE 2.0
// Mental Health Crisis Intervention Platform

export interface Alert {
  id: string;
  alert_id: string; // Added for component compatibility
  type: 'critical' | 'warning' | 'info' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  created_at: Date; // Added for component compatibility
  source: 'system' | 'crisis' | 'volunteer' | 'ai' | 'emergency';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
  acknowledgments: string[];
  escalationLevel: number;
  affectedSystems: string[];
  requiresImmediateAction: boolean;
  priority: PriorityLevel;
  actions?: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed'; // Added for component compatibility
  category: string; // Added for component compatibility
  details?: string; // Added for component compatibility
}

export interface CrisisSession {
  id: string;
  session_id: string; // Added for component compatibility
  sessionCode: string;
  userId: string;
  client_id: string; // Added for component compatibility
  volunteerId?: string;
  volunteer_id?: string; // Added for component compatibility
  volunteer_name?: string; // Added for component compatibility
  status: 'waiting' | 'active' | 'escalated' | 'completed' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  riskLevel: number; // 1-10 scale
  risk_score: number; // Added for component compatibility (same as riskLevel)
  startedAt: Date;
  endedAt?: Date;
  lastActivity: Date;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unstable';
  created_at: Date; // Added for AdminProvider compatibility
  duration?: number; // Added for component compatibility (in minutes)
  aiRiskAssessment: {
    score: number;
    factors: string[];
    recommendations: string[];
    confidence: number;
    lastUpdated: Date;
  };
  emergencyProtocols: {
    activated: boolean;
    level: number;
    contactedAuthorities: boolean;
    emergencyContacts: string[];
    activatedAt?: Date;
  };
  sessionMetrics: {
    messageCount: number;
    averageResponseTime: number;
    emotionalStateProgression: Array<{
      timestamp: Date;
      state: string;
      confidence: number;
    }>;
    interventionSuccess: boolean;
  };
  tetherConnection?: {
    tetherId: string;
    connectionStrength: number;
    lastHeartbeat: Date;
    emergencyPulseActive: boolean;
  };
  location?: {
    country: string;
    region: string;
    timezone: string;
    emergencyServices: string[];
  };
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  status: 'available' | 'busy' | 'offline' | 'training' | 'break' | 'emergency';
  specializations: string[];
  languages: string[];
  certifications: Array<{
    name: string;
    level: string;
    expiresAt: Date;
    verified: boolean;
  }>;
  currentSessions: string[];
  maxConcurrentSessions: number;
  performanceMetrics: {
    totalSessions: number;
    successRate: number;
    averageSessionDuration: number;
    userSatisfactionScore: number;
    lastActive: Date;
    responseTime: number;
    escalationRate: number;
  };
  wellnessStatus: {
    burnoutRisk: 'low' | 'medium' | 'high' | 'critical';
    lastWellnessCheck: Date;
    weeklyHours: number;
    consecutiveDays: number;
    needsBreak: boolean;
    supportRequired: boolean;
  };
  trainingProgress: {
    completedModules: string[];
    currentModule?: string;
    overallProgress: number;
    lastTrainingSession: Date;
    upcomingDeadlines: Array<{
      module: string;
      deadline: Date;
      mandatory: boolean;
    }>;
  };
  emergencyCapabilities: {
    canHandleEmergencies: boolean;
    emergencyTrainingLevel: number;
    lastEmergencyHandled?: Date;
    emergencySuccessRate: number;
  };
}

export interface SystemHealthMetric {
  id: string;
  component: string;
  metric: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  threshold: {
    warning: number;
    critical: number;
  };
  timestamp: Date;
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdated: Date;
  dependencies: string[];
  affectedFeatures: string[];
}

export interface EmergencyEscalation {
  id: string;
  sessionId: string;
  triggeredBy: 'ai' | 'volunteer' | 'system' | 'user' | 'tether';
  escalationLevel: 1 | 2 | 3 | 4 | 5; // 5 = immediate emergency services
  reason: string;
  automatedActions: string[];
  manualActions: string[];
  contactedServices: Array<{
    service: string;
    contactedAt: Date;
    responseReceived: boolean;
    caseNumber?: string;
  }>;
  timeline: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    result: string;
  }>;
  resolved: boolean;
  outcome: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DashboardStats {
  activeSessions: number;
  availableVolunteers: number;
  emergencyEscalations: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  avgResponseTime: number;
  successRate: number;
  last24Hours: {
    totalSessions: number;
    completedSessions: number;
    emergencies: number;
    newVolunteers: number;
  };
  performanceMetrics: {
    uptime: number;
    errorRate: number;
    averageSessionDuration: number;
    userSatisfactionScore: number;
  };
  capacityMetrics: {
    currentLoad: number;
    maxCapacity: number;
    utilizationRate: number;
    predictedPeakTime: Date;
  };
  aiPerformance: {
    riskAssessmentAccuracy: number;
    falsePositiveRate: number;
    responseLatency: number;
    modelVersion: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'observer';
  permissions: string[];
  lastLogin: Date;
  accessLevel: number;
  department: string;
  emergencyContact: boolean;
}

export interface AdminContextType {
  // State
  alerts: Alert[];
  crisisSessions: CrisisSession[];
  volunteers: Volunteer[];
  systemHealth: SystemHealthMetric[];
  dashboardStats: DashboardStats;
  loading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  
  // WebSocket connection
  wsConnected: boolean;
  wsReconnecting: boolean;
  
  // Current user
  currentUser: AdminUser | null;
  
  // Actions
  refreshData: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string, resolution: string) => Promise<void>;
  escalateSession: (sessionId: string, level: number, reason: string) => Promise<void>;
  assignVolunteer: (sessionId: string, volunteerId: string) => Promise<void>;
  updateVolunteerStatus: (volunteerId: string, status: Volunteer['status']) => Promise<void>;
  triggerEmergencyProtocol: (sessionId: string, level: number) => Promise<void>;
  
  // Emergency actions
  initiateEmergencyEscalation: (sessionId: string, escalationData: Partial<EmergencyEscalation>) => Promise<void>;
  contactEmergencyServices: (sessionId: string, serviceType: string) => Promise<void>;
  broadcastEmergencyAlert: (message: string, severity: Alert['severity']) => Promise<void>;
  
  // System management
  setSystemMaintenance: (enabled: boolean, message?: string) => Promise<void>;
  restartSystemComponent: (component: string) => Promise<void>;
  updateSystemConfiguration: (config: Record<string, any>) => Promise<void>;
  
  // Reporting
  generateReport: (type: string, parameters: Record<string, any>) => Promise<any>;
  exportData: (type: string, dateRange: { start: Date; end: Date }) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToAlerts: () => void;
  unsubscribeFromAlerts: () => void;
  subscribeToSessions: () => void;
  unsubscribeFromSessions: () => void;
  subscribeToSystemHealth: () => void;
  unsubscribeFromSystemHealth: () => void;
  
  // Missing methods expected by AdminProvider components
  fetchAlerts: () => Promise<void>;
  fetchCrisisSessions: () => Promise<void>;
  fetchVolunteers: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  escalateAlert: (alertId: string) => Promise<void>;
  assignVolunteerToSession: (sessionId: string, volunteerId: string) => Promise<void>;
}

// Utility Types
export type AlertType = Alert['type'];
export type AlertSeverity = Alert['severity'];
export type SessionStatus = CrisisSession['status'];
export type VolunteerStatus = Volunteer['status'];
export type SystemStatus = SystemHealthMetric['status'];
export type EscalationLevel = EmergencyEscalation['escalationLevel'];

// Event Types for WebSocket
export interface WebSocketEvent {
  type: 'alert' | 'session' | 'volunteer' | 'system' | 'emergency';
  action: 'create' | 'update' | 'delete' | 'escalate';
  data: any;
  timestamp: Date;
  source: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Filter and Search Types
export interface AlertFilter {
  type?: AlertType[];
  severity?: AlertSeverity[];
  resolved?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  source?: string[];
}

export interface SessionFilter {
  status?: SessionStatus[];
  priority?: CrisisSession['priority'][];
  volunteerId?: string;
  riskLevel?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface VolunteerFilter {
  status?: VolunteerStatus[];
  specializations?: string[];
  languages?: string[];
  wellnessRisk?: Volunteer['wellnessStatus']['burnoutRisk'][];
  availability?: boolean;
}

// Configuration Types
export interface AdminConfiguration {
  alertThresholds: {
    [key: string]: {
      warning: number;
      critical: number;
    };
  };
  emergencySettings: {
    autoEscalationEnabled: boolean;
    escalationDelayMinutes: number;
    emergencyContactTimeout: number;
    authorityContactThreshold: number;
  };
  systemSettings: {
    maxConcurrentSessions: number;
    sessionTimeoutMinutes: number;
    volunteerBreakRequiredHours: number;
    aiConfidenceThreshold: number;
  };
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    emergencyContactMethods: string[];
  };
}

// Additional Types Expected by AdminProvider
export interface AdminStore {
  sessions: CrisisSession[];
  volunteers: Volunteer[];
  systemHealth: SystemHealthInfo;
  alerts: Alert[];
  stats: QuickStats;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  isLoading: boolean;
  lastUpdated: string;
}

export interface VolunteerInfo {
  id: string;
  volunteer_id?: string; // Added for component compatibility (optional to match AdminProvider)
  name: string;
  email: string;
  status: 'online' | 'offline' | 'busy' | 'away' | 'break'; // Added 'break' status for component compatibility
  specializations?: string[];
  specialties?: string[]; // Added for component compatibility (alias for specializations)
  currentSessions?: string[];
  current_session_id?: string; // Added for component compatibility
  lastActive?: string;
  last_active?: string; // Added for component compatibility
  performance_score?: number; // Added for component compatibility
  total_sessions?: number; // Added for component compatibility
  burnout_risk?: 'low' | 'medium' | 'high' | 'critical'; // Added for component compatibility
}

export interface SystemHealthInfo {
  timestamp: string;
  infrastructure: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_latency: number;
  };
  services: {
    [key: string]: {
      status: ServiceHealthStatus;
      response_time: number;
      last_check: string;
      error_rate: number;
    };
  };
  metrics: {
    active_sessions: number;
    total_volunteers_online: number;
    average_response_time: number;
    system_uptime: number;
  };
}

export interface QuickStats {
  activeSessions: number;
  onlineVolunteers: number;
  criticalAlerts: number;
  averageResponseTime: number;
}

// Type Aliases for AdminProvider Compatibility
export type VolunteerStatusType = 'online' | 'offline' | 'busy' | 'away' | 'active' | 'inactive' | 'training' | 'suspended' | 'escalated';
export type CrisisStatusType = 'active' | 'waiting' | 'escalated' | 'completed' | 'emergency';
export type ServiceHealthStatus = 'healthy' | 'warning' | 'critical' | 'degraded' | 'down' | 'maintenance';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

// Component-specific type aliases to resolve compilation errors
export type AlertPriority = PriorityLevel;
export type CrisisPriority = PriorityLevel;

// Helper function types for date formatting
export type DateFormatter = (date: Date | string) => string;

// Enhanced CrisisSession with additional properties expected by AdminProvider
export interface CrisisSessionWithExtras extends CrisisSession {
  created_at: Date; // Now matches the main CrisisSession interface
  assignedVolunteer?: string;
}

// All types are exported individually above for direct import usage
// Usage: import { Alert, CrisisSession, AdminContextType, AdminStore } from './admin';