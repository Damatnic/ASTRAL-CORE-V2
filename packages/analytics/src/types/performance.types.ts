/**
 * ASTRAL_CORE 2.0 Performance Types
 * Type definitions for performance monitoring and metrics
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: PerformanceUnit;
  timestamp: Date;
  category: PerformanceCategory;
  tags?: Record<string, string>;
  threshold?: PerformanceThreshold;
}

export enum PerformanceUnit {
  MILLISECONDS = 'ms',
  SECONDS = 's',
  BYTES = 'bytes',
  KILOBYTES = 'kb',
  MEGABYTES = 'mb',
  PERCENTAGE = '%',
  COUNT = 'count',
  REQUESTS_PER_SECOND = 'rps',
  OPERATIONS_PER_SECOND = 'ops'
}

export enum PerformanceCategory {
  RESPONSE_TIME = 'response_time',
  THROUGHPUT = 'throughput',
  ERROR_RATE = 'error_rate',
  RESOURCE_USAGE = 'resource_usage',
  DATABASE = 'database',
  WEBSOCKET = 'websocket',
  API = 'api',
  CRISIS_INTERVENTION = 'crisis_intervention',
  USER_EXPERIENCE = 'user_experience'
}

export interface PerformanceThreshold {
  warning: number;
  critical: number;
  target?: number;
}

export interface PerformanceAlert {
  id: string;
  metricId: string;
  level: AlertLevel;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export interface SystemPerformanceSnapshot {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  processes: {
    active: number;
    total: number;
  };
}

export interface WebSocketPerformanceMetrics {
  connectionTime: number;
  messageLatency: number;
  reconnectionCount: number;
  activeConnections: number;
  messagesPerSecond: number;
  errorRate: number;
  bandwidthUsage: number;
}

export interface DatabasePerformanceMetrics {
  queryTime: number;
  connectionPoolSize: number;
  activeConnections: number;
  slowQueries: number;
  deadlocks: number;
  cacheHitRatio: number;
}

export interface CrisisInterventionMetrics {
  averageResponseTime: number;
  escalationTime: number;
  volunteerAssignmentTime: number;
  sessionDuration: number;
  successRate: number;
  abandonmentRate: number;
  emergencyResponseTime: number;
}

export interface PerformanceReport {
  id: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: PerformanceSummary;
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  recommendations: string[];
}

export interface PerformanceSummary {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  peakConcurrentUsers: number;
  criticalAlerts: number;
  warningAlerts: number;
}

export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  retentionDays: number;
  alerting: {
    enabled: boolean;
    channels: AlertChannel[];
  };
  thresholds: Record<string, PerformanceThreshold>;
}

export enum AlertChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  PUSH_NOTIFICATION = 'push_notification'
}