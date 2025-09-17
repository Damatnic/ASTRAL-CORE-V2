/**
 * ASTRAL_CORE 2.0 Metrics Types
 * Type definitions for metrics collection and reporting
 */

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  unit: string;
  category: MetricCategory;
  tags: string[];
  aggregation: MetricAggregation[];
  retention: MetricRetention;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
  SET = 'set'
}

export enum MetricCategory {
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  OPERATIONAL = 'operational',
  SECURITY = 'security',
  USER_EXPERIENCE = 'user_experience'
}

export enum MetricAggregation {
  SUM = 'sum',
  COUNT = 'count',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE_90 = 'p90',
  PERCENTILE_95 = 'p95',
  PERCENTILE_99 = 'p99',
  RATE = 'rate'
}

export interface MetricRetention {
  raw: string; // e.g., '1d', '7d', '30d'
  aggregated: string; // e.g., '90d', '1y', '2y'
}

export interface MetricValue {
  metricId: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  dimensions?: Record<string, string>;
}

export interface MetricQuery {
  metricId: string;
  startTime: Date;
  endTime: Date;
  aggregation: MetricAggregation;
  interval?: string; // e.g., '1m', '5m', '1h', '1d'
  filters?: MetricFilter[];
  groupBy?: string[];
}

export interface MetricFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with'
}

export interface MetricQueryResult {
  metricId: string;
  query: MetricQuery;
  dataPoints: MetricDataPoint[];
  aggregatedValue?: number;
  metadata: MetricResultMetadata;
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

export interface MetricResultMetadata {
  executionTime: number;
  dataPointCount: number;
  samplingRate?: number;
  approximation?: boolean;
}

// Crisis-specific metrics
export interface CrisisMetrics {
  totalSessions: MetricValue;
  activeSessions: MetricValue;
  averageResponseTime: MetricValue;
  escalationRate: MetricValue;
  resolutionRate: MetricValue;
  volunteerUtilization: MetricValue;
  emergencyResponseTime: MetricValue;
  userSatisfactionScore: MetricValue;
}

// System metrics
export interface SystemMetrics {
  cpuUsage: MetricValue;
  memoryUsage: MetricValue;
  diskUsage: MetricValue;
  networkThroughput: MetricValue;
  activeConnections: MetricValue;
  requestsPerSecond: MetricValue;
  errorRate: MetricValue;
  uptime: MetricValue;
}

// Business metrics
export interface BusinessMetrics {
  dailyActiveUsers: MetricValue;
  monthlyActiveUsers: MetricValue;
  sessionDuration: MetricValue;
  userRetention: MetricValue;
  conversionRate: MetricValue;
  churnRate: MetricValue;
  volunteerEngagement: MetricValue;
  platformGrowth: MetricValue;
}

export interface MetricDashboard {
  id: string;
  name: string;
  description: string;
  widgets: MetricWidget[];
  refreshInterval: number;
  timeRange: TimeRange;
  filters: MetricFilter[];
  permissions: DashboardPermissions;
}

export interface MetricWidget {
  id: string;
  type: WidgetType;
  title: string;
  query: MetricQuery;
  visualization: VisualizationConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  GAUGE = 'gauge',
  COUNTER = 'counter',
  TABLE = 'table',
  HEATMAP = 'heatmap',
  SCATTER_PLOT = 'scatter_plot'
}

export interface VisualizationConfig {
  colors?: string[];
  axes?: AxisConfig;
  legend?: LegendConfig;
  thresholds?: ThresholdConfig[];
}

export interface AxisConfig {
  x?: {
    label?: string;
    scale?: 'linear' | 'log';
  };
  y?: {
    label?: string;
    scale?: 'linear' | 'log';
    min?: number;
    max?: number;
  };
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ThresholdConfig {
  value: number;
  color: string;
  label?: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
  relative?: string; // e.g., 'last_1h', 'last_24h', 'last_7d'
}

export interface DashboardPermissions {
  viewers: string[];
  editors: string[];
  owners: string[];
}

export interface MetricAlert {
  id: string;
  name: string;
  description: string;
  metricId: string;
  condition: AlertCondition;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  notifications: AlertNotification[];
  cooldown: number; // minutes
  lastTriggered?: Date;
}

export interface AlertCondition {
  operator: FilterOperator;
  timeWindow: string; // e.g., '5m', '15m', '1h'
  aggregation: MetricAggregation;
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AlertNotification {
  type: NotificationType;
  target: string;
  template?: string;
}

export enum NotificationType {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  PUSH = 'push'
}