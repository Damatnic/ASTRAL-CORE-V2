/**
 * Database Types for ASTRAL_CORE 2.0 Mental Health Crisis Intervention Platform
 * Comprehensive type definitions for database operations, models, and connections
 */

// ============================================================================
// DATABASE CONNECTION TYPES
// ============================================================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  connectionTimeout: number;
  encryptionKey?: string;
}

export interface ConnectionPool {
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  totalConnections: number;
  waitingRequests: number;
}

export interface DatabaseHealth {
  isConnected: boolean;
  responseTime: number;
  poolStatus: ConnectionPool;
  lastHealthCheck: Date;
  errors: string[];
}

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  version: number;
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  passwordHash?: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  lastLogin?: Date;
  isVerified: boolean;
  totpSecret?: string;
  recoveryTokens?: string[];
}

export enum UserRole {
  PERSON_IN_CRISIS = 'person_in_crisis',
  VOLUNTEER = 'volunteer',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
  SYSTEM = 'system'
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  timezone: string;
  language: string;
  emergencyContact?: EmergencyContact;
  mentalHealthHistory?: string;
  triggers?: string[];
  copingStrategies?: string[];
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
  communication: CommunicationPreferences;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
}

// ============================================================================
// CRISIS SESSION TYPES
// ============================================================================

export interface CrisisSession extends BaseEntity {
  personInCrisisId: string;
  volunteerId?: string;
  sessionType: SessionType;
  status: SessionStatus;
  severity: CrisisSeverity;
  urgencyLevel: UrgencyLevel;
  location?: GeographicLocation;
  initialAssessment: CrisisAssessment;
  interventions: Intervention[];
  messages: SessionMessage[];
  escalations: Escalation[];
  outcomes: SessionOutcome[];
  endedAt?: Date;
  duration?: number;
  metadata: SessionMetadata;
}

export enum SessionType {
  CHAT = 'chat',
  VIDEO = 'video',
  PHONE = 'phone',
  EMERGENCY = 'emergency',
  TETHER = 'tether'
}

export enum SessionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ESCALATED = 'escalated',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EMERGENCY = 'emergency'
}

export enum CrisisSeverity {
  LOW = 1,
  MODERATE = 2,
  HIGH = 3,
  SEVERE = 4,
  IMMINENT = 5
}

export enum UrgencyLevel {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  CRITICAL = 'critical',
  IMMEDIATE = 'immediate'
}

export interface CrisisAssessment {
  riskFactors: RiskFactor[];
  protectiveFactors: string[];
  immediateNeeds: string[];
  suicidalIdeation: SuicidalIdeation;
  mentalState: MentalState;
  socialSupport: SocialSupport;
  assessedBy?: string;
  assessmentDate: Date;
  confidence: number;
}

export interface RiskFactor {
  type: string;
  severity: number;
  description: string;
  isModifiable: boolean;
}

export interface SuicidalIdeation {
  present: boolean;
  intensity: number;
  method?: string;
  plan?: string;
  means?: string;
  timeframe?: string;
  deterrents?: string[];
}

export interface MentalState {
  mood: string;
  affect: string;
  cognition: string;
  perception: string;
  behavior: string;
  insight: string;
  judgment: string;
}

export interface SocialSupport {
  hasSupport: boolean;
  supportSources: string[];
  supportQuality: number;
  recentLosses?: string[];
  isolation: boolean;
}

// ============================================================================
// VOLUNTEER TYPES
// ============================================================================

export interface Volunteer extends BaseEntity {
  userId: string;
  status: VolunteerStatus;
  availability: VolunteerAvailability;
  specializations: Specialization[];
  certifications: Certification[];
  performance: VolunteerPerformance;
  training: TrainingRecord[];
  workload: WorkloadMetrics;
  wellness: WellnessMetrics;
  supervisorId?: string;
}

export enum VolunteerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_BREAK = 'on_break',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated'
}

export interface VolunteerAvailability {
  schedule: AvailabilitySlot[];
  maxConcurrentSessions: number;
  preferredSessionTypes: SessionType[];
  blackoutDates: DateRange[];
  lastUpdated: Date;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isRecurring: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface Specialization {
  area: string;
  level: SpecializationLevel;
  certifiedDate: Date;
  validUntil?: Date;
}

export enum SpecializationLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// ============================================================================
// TETHER TYPES
// ============================================================================

export interface TetherConnection extends BaseEntity {
  primaryUserId: string;
  tetherUserId: string;
  relationshipType: RelationshipType;
  trustLevel: number;
  permissions: TetherPermission[];
  emergencyProtocol: EmergencyProtocol;
  lastInteraction?: Date;
  isEmergencyContact: boolean;
  status: TetherStatus;
}

export enum RelationshipType {
  FAMILY = 'family',
  FRIEND = 'friend',
  PARTNER = 'partner',
  THERAPIST = 'therapist',
  SUPPORT_PERSON = 'support_person',
  EMERGENCY_CONTACT = 'emergency_contact'
}

export enum TetherStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  BLOCKED = 'blocked'
}

export interface TetherPermission {
  action: string;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface EmergencyProtocol {
  autoNotify: boolean;
  escalationSteps: EscalationStep[];
  maxResponseTime: number;
  includeLocation: boolean;
  shareAssessment: boolean;
}

export interface EscalationStep {
  stepNumber: number;
  action: string;
  delayMinutes: number;
  recipients: string[];
  message?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent extends BaseEntity {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  source: string;
  userAgent?: string;
  ipAddress?: string;
  isAnonymized: boolean;
}

export interface SystemMetrics extends BaseEntity {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: NetworkMetrics;
  databaseMetrics: DatabaseMetrics;
  activeUsers: number;
  activeSessions: number;
  responseTime: number;
}

export interface NetworkMetrics {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
}

export interface DatabaseMetrics {
  connections: number;
  queries: number;
  slowQueries: number;
  cacheHitRate: number;
  diskIO: number;
}

// ============================================================================
// AUDIT AND COMPLIANCE TYPES
// ============================================================================

export interface AuditLog extends BaseEntity {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes: AuditChange[];
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
  sensitivity: DataSensitivity;
}

export interface AuditChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  changeType: ChangeType;
}

export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read'
}

export enum DataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata: Record<string, any>;
}

export enum NotificationType {
  SYSTEM = 'system',
  CRISIS_ALERT = 'crisis_alert',
  SESSION_REMINDER = 'session_reminder',
  TRAINING_DUE = 'training_due',
  WELLNESS_CHECK = 'wellness_check',
  EMERGENCY = 'emergency'
}

export enum NotificationPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  PHONE = 'phone'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface GeographicLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  timezone?: string;
}

export interface NotificationPreferences {
  crisisAlerts: boolean;
  systemUpdates: boolean;
  trainingReminders: boolean;
  wellnessChecks: boolean;
  sessionReminders: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
}

export interface PrivacyPreferences {
  shareLocation: boolean;
  shareUsageData: boolean;
  allowResearch: boolean;
  dataRetention: number;
  anonymizeData: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  voiceCommands: boolean;
  slowAnimations: boolean;
}

export interface CommunicationPreferences {
  preferredLanguage: string;
  communicationStyle: string;
  triggerWarnings: boolean;
  contentFiltering: boolean;
}

// ============================================================================
// QUERY AND RESULT TYPES
// ============================================================================

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: OrderBy[];
  filters?: Filter[];
  includes?: string[];
  select?: string[];
}

export interface OrderBy {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  LIKE = 'like',
  ILIKE = 'ilike',
  IS_NULL = 'null',
  IS_NOT_NULL = 'not_null'
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  hasMore: boolean;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  query?: string;
  parameters?: any[];
}

// ============================================================================
// MIGRATION AND SCHEMA TYPES
// ============================================================================

export interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  appliedAt: Date;
  executionTime: number;
  checksum: string;
}

export interface SchemaVersion {
  version: string;
  description: string;
  migrations: Migration[];
  createdAt: Date;
  isActive: boolean;
}

// ============================================================================
// EXPORT CONSOLIDATED TYPES
// ============================================================================

export interface SessionMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  messageType: string;
  timestamp: Date;
  isEncrypted: boolean;
  metadata?: Record<string, any>;
}

export interface Intervention {
  id: string;
  sessionId: string;
  type: string;
  description: string;
  implementedBy: string;
  timestamp: Date;
  effectiveness?: number;
  followUpRequired: boolean;
}

export interface Escalation {
  id: string;
  sessionId: string;
  reason: string;
  escalatedTo: string;
  escalatedBy: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface SessionOutcome {
  id: string;
  sessionId: string;
  outcome: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  createdBy: string;
  timestamp: Date;
}

export interface SessionMetadata {
  platform: string;
  deviceType: string;
  browserInfo?: string;
  referralSource?: string;
  previousSessions?: number;
  connectionQuality?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  isActive: boolean;
}

export interface TrainingRecord {
  id: string;
  courseId: string;
  courseName: string;
  completedDate: Date;
  score?: number;
  certificateId?: string;
  validUntil?: Date;
}

export interface VolunteerPerformance {
  totalSessions: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
  escalationRate: number;
  lastPerformanceReview?: Date;
  improvementAreas?: string[];
  strengths?: string[];
}

export interface WorkloadMetrics {
  currentActiveSessions: number;
  averageSessionsPerWeek: number;
  hoursPerWeek: number;
  peakHours: string[];
  burnoutRisk: number;
  lastWorkloadAssessment: Date;
}

export interface WellnessMetrics {
  stressLevel: number;
  jobSatisfaction: number;
  workLifeBalance: number;
  lastWellnessCheck: Date;
  supportNeeded: boolean;
  interventionsRecommended?: string[];
}