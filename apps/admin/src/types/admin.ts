// Core Admin Dashboard Types for ASTRAL CORE Crisis Intervention Platform

export type CrisisSessionStatus = 'active' | 'waiting' | 'assigned' | 'escalated' | 'resolved' | 'abandoned';
export type CrisisPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'dismissed' | 'escalated';
export type VolunteerStatusType = 'online' | 'busy' | 'break' | 'offline';

// Crisis Session Management
export interface CrisisSession {
  id: string;
  session_id: string;
  user_id: string;
  volunteer_id?: string;
  status: CrisisSessionStatus;
  priority: CrisisPriority;
  risk_score: number;
  created_at: string;
  updated_at: string;
  last_activity: string;
  session_duration: number; // in seconds
  tags: string[];
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  metadata: {
    user_age?: number;
    crisis_type?: string;
    previous_sessions?: number;
    referral_source?: string;
  };
}

// Volunteer Management
export interface VolunteerStatus {
  id: string;
  volunteer_id: string;
  user_id: string;
  name: string;
  email: string;
  status: VolunteerStatusType;
  current_session_id?: string;
  last_active: string;
  online_since?: string;
  specialties: string[];
  performance_metrics: {
    total_sessions: number;
    average_rating: number;
    response_time_avg: number; // in seconds
    resolution_rate: number; // percentage
    burnout_risk: number; // 0-100 scale
  };
  certification: {
    level: string;
    expires_at: string;
    training_completed: string[];
  };
  availability: {
    timezone: string;
    preferred_hours: string[];
    max_concurrent_sessions: number;
  };
}

// System Health Monitoring
export interface SystemHealthData {
  timestamp: string;
  infrastructure: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_latency: number;
  };
  services: {
    database: ServiceHealthStatus;
    websocket: ServiceHealthStatus;
    ai_moderation: ServiceHealthStatus;
    crisis_detection: ServiceHealthStatus;
    volunteer_matching: ServiceHealthStatus;
  };
  metrics: {
    active_sessions: number;
    total_volunteers_online: number;
    average_response_time: number;
    system_uptime: number;
  };
}

export interface ServiceHealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'down';
  response_time: number;
  last_check: string;
  error_rate: number;
  details?: string;
}

export type ServiceStatusInfo = ServiceHealthStatus['status'];

// Alert System
export interface Alert {
  id: string;
  alert_id: string;
  title: string;
  message: string;
  priority: AlertPriority;
  status: AlertStatus;
  category: string; // 'system', 'security', 'crisis', 'volunteer', 'performance'
  source: string;
  created_at: string;
  updated_at: string;
  acknowledged_by?: string;
  resolved_at?: string;
  details?: string;
  actions?: string[];
  metadata?: Record<string, any>;
}

// Dashboard Analytics
export interface DashboardStats {
  period: string; // '24h', '7d', '30d'
  crisis_sessions: {
    total: number;
    active: number;
    resolved: number;
    average_duration: number;
    response_time_avg: number;
  };
  volunteers: {
    total_active: number;
    average_load: number;
    burnout_alerts: number;
    new_certifications: number;
  };
  system_performance: {
    uptime_percentage: number;
    error_rate: number;
    peak_concurrent_users: number;
  };
  trends: {
    crisis_volume_change: number; // percentage change
    resolution_rate_change: number;
    volunteer_utilization_change: number;
  };
}

// User Authentication
export interface AdminUser {
  user_id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst';
  permissions: string[];
  last_login: string;
  created_at: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// WebSocket Events
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface CrisisSessionEvent extends WebSocketEvent {
  type: 'crisis_session_created' | 'crisis_session_updated' | 'crisis_session_ended';
  payload: {
    session: CrisisSession;
    previous_status?: CrisisSessionStatus;
  };
}

export interface VolunteerEvent extends WebSocketEvent {
  type: 'volunteer_status_changed' | 'volunteer_assigned' | 'volunteer_performance_updated';
  payload: {
    volunteer: VolunteerStatus;
    session_id?: string;
  };
}

export interface SystemEvent extends WebSocketEvent {
  type: 'system_health_updated' | 'service_status_changed' | 'alert_created';
  payload: {
    health_data?: SystemHealthData;
    service?: string;
    alert?: Alert;
  };
}

// Filter and Search Types
export interface CrisisSessionFilters {
  status?: CrisisSessionStatus[];
  priority?: CrisisPriority[];
  volunteer_assigned?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  risk_score_min?: number;
  risk_score_max?: number;
  search_term?: string;
}

export interface VolunteerFilters {
  status?: VolunteerStatusType[];
  specialties?: string[];
  availability?: boolean;
  burnout_risk_threshold?: number;
  certification_level?: string[];
  search_term?: string;
}

export interface AlertFilters {
  priority?: AlertPriority[];
  status?: AlertStatus[];
  category?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search_term?: string;
}

// Configuration Types
export interface AdminConfig {
  refresh_intervals: {
    crisis_sessions: number;
    volunteers: number;
    system_health: number;
    alerts: number;
  };
  thresholds: {
    high_risk_score: number;
    burnout_risk_warning: number;
    response_time_warning: number;
    system_health_warning: number;
  };
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    critical_alerts_immediate: boolean;
  };
}

// Admin Store State Management
export interface AdminStore {
  sessions: CrisisSession[];
  volunteers: VolunteerStatus[];
  systemHealth: SystemHealthData;
  alerts: Alert[];
  stats: QuickStats;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  isLoading: boolean;
  lastUpdated: string;
}

// Admin Context Interface
export interface AdminContextType extends AdminStore {
  dismissAlert: (alertId: string) => void;
  escalateIncident: (sessionId: string) => void;
  assignVolunteer: (sessionId: string, volunteerId: string) => void;
  refreshData: () => void;
  fetchSystemHealth: () => void;
}

// Quick Dashboard Statistics
export interface QuickStats {
  activeSessions: number;
  onlineVolunteers: number;
  criticalAlerts: number;
  averageResponseTime: number;
}

// Additional Types
export type CrisisStatusType = CrisisSessionStatus;
export type AlertType = Alert;
export type VolunteerInfo = VolunteerStatus;
export type SystemHealthInfo = SystemHealthData;

// Backward compatibility aliases
export type SystemHealth = SystemHealthData;
export type ServiceStatus = ServiceHealthStatus;
export type PriorityLevel = CrisisPriority;