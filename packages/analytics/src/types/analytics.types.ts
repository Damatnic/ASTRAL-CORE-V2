/**
 * ASTRAL_CORE 2.0 Analytics Types
 * Type definitions for analytics and monitoring systems
 */

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  volunteerId?: string;
  data: Record<string, any>;
  metadata?: AnalyticsMetadata;
}

export enum AnalyticsEventType {
  // Crisis Events
  CRISIS_SESSION_STARTED = 'crisis_session_started',
  CRISIS_SESSION_ENDED = 'crisis_session_ended',
  EMERGENCY_ESCALATION = 'emergency_escalation',
  VOLUNTEER_ASSIGNED = 'volunteer_assigned',
  
  // User Behavior
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  
  // System Events
  SYSTEM_ERROR = 'system_error',
  PERFORMANCE_METRIC = 'performance_metric',
  WEBSOCKET_CONNECTION = 'websocket_connection',
  WEBSOCKET_DISCONNECTION = 'websocket_disconnection',
  
  // Tether Events
  TETHER_CREATED = 'tether_created',
  TETHER_ACTIVATED = 'tether_activated',
  TETHER_ENDED = 'tether_ended',
  
  // Training Events
  TRAINING_STARTED = 'training_started',
  TRAINING_COMPLETED = 'training_completed',
  CERTIFICATION_EARNED = 'certification_earned'
}

export interface AnalyticsMetadata {
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  device?: {
    type: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
  };
  referrer?: string;
}

export interface AnalyticsQuery {
  eventTypes?: AnalyticsEventType[];
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  volunteerId?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
  aggregation?: AnalyticsAggregation;
}

export interface AnalyticsAggregation {
  groupBy: string[];
  metrics: AnalyticsMetric[];
  timeInterval?: 'hour' | 'day' | 'week' | 'month';
}

export enum AnalyticsMetric {
  COUNT = 'count',
  UNIQUE_COUNT = 'unique_count',
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  PERCENTILE_95 = 'percentile_95',
  PERCENTILE_99 = 'percentile_99'
}

export interface AnalyticsResult {
  events?: AnalyticsEvent[];
  aggregations?: AnalyticsAggregationResult[];
  totalCount: number;
  query: AnalyticsQuery;
  executionTime: number;
}

export interface AnalyticsAggregationResult {
  groupKey: Record<string, any>;
  metrics: Record<string, number>;
  count: number;
}

export interface CrisisAnalyticsData {
  sessionId: string;
  duration: number;
  escalationLevel: 'low' | 'medium' | 'high' | 'emergency';
  responseTime: number;
  volunteerAssignmentTime?: number;
  outcome: 'resolved' | 'escalated' | 'transferred' | 'abandoned';
  keywordsDetected: string[];
  riskScore: number;
}

export interface UserBehaviorData {
  userId: string;
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  bounceRate: number;
  conversionEvents: string[];
  lastActivity: Date;
}

export interface SystemHealthData {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  errorRate: number;
  responseTime: number;
}