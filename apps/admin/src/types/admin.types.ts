/**
 * ASTRAL_CORE 2.0 Admin Dashboard Types
 * 
 * Comprehensive type definitions for the crisis intervention admin system
 */

export interface CrisisAlert {
  alert_id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'crisis' | 'system' | 'security' | 'performance';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  created_at: Date;
  updated_at?: Date;
  source: string;
  details: string;
  session_id?: string;
  volunteer_id?: string;
  actions_taken?: string[];
  escalation_level?: number;
  estimated_resolution?: Date;
  tags?: string[];
}

export interface CrisisSession {
  session_id: string;
  anonymous_id: string;
  status: 'active' | 'waiting' | 'completed' | 'escalated' | 'emergency';
  severity: number;
  started_at: Date;
  ended_at?: Date;
  volunteer_id?: string;
  volunteer_name?: string;
  last_activity: Date;
  messages_count: number;
  escalation_count: number;
  emergency_triggered: boolean;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
  };
  risk_assessment?: {
    initial_score: number;
    current_score: number;
    risk_factors: string[];
    protective_factors: string[];
  };
  emergency_contacts?: {
    local_911: boolean;
    crisis_hotline: boolean;
    emergency_services: boolean;
  };
}

export interface VolunteerStatus {
  volunteer_id: string;
  anonymous_id: string;
  name: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  active_sessions: number;
  max_sessions: number;
  availability: {
    timezone: string;
    preferred_hours: string;
    specializations: string[];
    languages: string[];
  };
  performance: {
    total_sessions: number;
    average_rating: number;
    response_time_avg: number;
    resolution_rate: number;
    escalation_rate: number;
  };
  certifications: string[];
  last_active: Date;
  training_status: 'complete' | 'in_progress' | 'expired';
  emergency_certified: boolean;
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical' | 'down';
  response_time: {
    average: number;
    p95: number;
    p99: number;
    target: number;
  };
  active_connections: number;
  database: {
    status: 'connected' | 'degraded' | 'disconnected';
    response_time: number;
    active_connections: number;
    max_connections: number;
  };
  websocket: {
    status: 'connected' | 'degraded' | 'disconnected';
    active_connections: number;
    message_rate: number;
    error_rate: number;
  };
  crisis_engine: {
    status: 'operational' | 'degraded' | 'critical' | 'offline';
    queue_length: number;
    processing_rate: number;
    error_rate: number;
  };
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  uptime: number;
  last_updated: Date;
}

export interface PerformanceMetrics {
  timestamp: Date;
  metric_type: string;
  value: number;
  unit: string;
  context?: Record<string, any>;
}

export interface EmergencyAction {
  action_id: string;
  type: '911_call' | '988_referral' | 'emergency_services' | 'manual_override';
  session_id: string;
  triggered_by: string;
  triggered_at: Date;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  details: string;
  external_reference?: string;
  resolution_notes?: string;
}

export interface AdminUser {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator' | 'observer';
  permissions: string[];
  last_login: Date;
  status: 'active' | 'inactive';
}

export interface AdminStore {
  // Real-time data
  alerts: CrisisAlert[];
  sessions: CrisisSession[];
  volunteers: VolunteerStatus[];
  systemHealth: SystemHealth;
  
  // Connection status
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdate: Date;
  
  // User context
  currentUser: AdminUser | null;
  
  // UI state
  selectedSession?: string;
  alertFilters: {
    priority: string;
    category: string;
    status: string;
  };
  
  // Performance data
  metrics: PerformanceMetrics[];
  
  // Emergency tracking
  activeEmergencies: EmergencyAction[];
}

export interface AdminActions {
  // Alert management
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string, notes?: string) => Promise<void>;
  dismissAlert: (alertId: string, reason?: string) => Promise<void>;
  
  // Session management
  escalateSession: (sessionId: string, level: number) => Promise<void>;
  assignVolunteer: (sessionId: string, volunteerId: string) => Promise<void>;
  endSession: (sessionId: string, outcome: string) => Promise<void>;
  
  // Emergency actions
  trigger911: (sessionId: string, details: string) => Promise<EmergencyAction>;
  trigger988: (sessionId: string) => Promise<EmergencyAction>;
  triggerEmergencyServices: (sessionId: string, type: string) => Promise<EmergencyAction>;
  
  // System management
  refreshData: () => Promise<void>;
  updateSystemHealth: () => Promise<void>;
  
  // Volunteer management
  updateVolunteerStatus: (volunteerId: string, status: VolunteerStatus['status']) => Promise<void>;
  sendVolunteerMessage: (volunteerId: string, message: string) => Promise<void>;
  
  // Data management
  exportData: (type: string, filters: Record<string, any>) => Promise<Blob>;
  generateReport: (type: string, dateRange: [Date, Date]) => Promise<Blob>;
}

export interface AdminProviderValue {
  store: AdminStore;
  actions: AdminActions;
}

// Component prop types
export interface AlertsPanelProps {
  className?: string;
}

export interface CrisisSessionsTableProps {
  className?: string;
  maxItems?: number;
}

export interface SystemHealthMonitorProps {
  className?: string;
  refreshInterval?: number;
}

export interface VolunteerStatusGridProps {
  className?: string;
  showOffline?: boolean;
}

// Utility types
export type AlertPriority = CrisisAlert['priority'];
export type AlertCategory = CrisisAlert['category'];
export type AlertStatus = CrisisAlert['status'];
export type SessionStatus = CrisisSession['status'];
export type VolunteerStatusType = VolunteerStatus['status'];
export type SystemStatusType = SystemHealth['overall_status'];

// Filter and sort types
export interface AlertFilters {
  priority?: AlertPriority | 'all';
  category?: AlertCategory | 'all';
  status?: AlertStatus | 'all';
  dateRange?: [Date, Date];
  searchTerm?: string;
}

export interface SessionFilters {
  status?: SessionStatus | 'all';
  severity?: {
    min: number;
    max: number;
  };
  volunteer?: string | 'all';
  dateRange?: [Date, Date];
}

export type SortOrder = 'asc' | 'desc';
export type AlertSortField = 'priority' | 'created_at' | 'category' | 'status';
export type SessionSortField = 'started_at' | 'severity' | 'status' | 'last_activity';
export type VolunteerSortField = 'name' | 'status' | 'active_sessions' | 'last_active';