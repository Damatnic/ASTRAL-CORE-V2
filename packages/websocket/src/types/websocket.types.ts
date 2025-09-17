/**
 * WebSocket Types for ASTRAL_CORE 2.0 Mental Health Crisis Intervention Platform
 * Comprehensive type definitions for real-time communication, crisis management, and emergency protocols
 */

// ============================================================================
// CORE WEBSOCKET TYPES
// ============================================================================

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  messageQueueSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  rateLimitConfig: RateLimitConfig;
}

export interface RateLimitConfig {
  maxMessagesPerSecond: number;
  maxMessagesPerMinute: number;
  maxBytesPerSecond: number;
  banDuration: number;
  warningThreshold: number;
}

export interface WebSocketConnectionInfo {
  id: string;
  userId?: string;
  role: UserRole;
  sessionId?: string;
  connectedAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  isAuthenticated: boolean;
  permissions: string[];
  metadata: ConnectionMetadata;
}

export interface ConnectionMetadata {
  platform: string;
  deviceType: string;
  browserInfo?: string;
  networkType?: string;
  geolocation?: GeographicLocation;
  timezone: string;
  language: string;
}

export interface GeographicLocation {
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  city?: string;
  accuracy?: number;
}

export enum UserRole {
  PERSON_IN_CRISIS = 'person_in_crisis',
  VOLUNTEER = 'volunteer',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin',
  SYSTEM = 'system',
  EMERGENCY_RESPONDER = 'emergency_responder'
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface WebSocketMessage {
  id: string;
  type: MessageType;
  timestamp: Date;
  senderId: string;
  senderRole: UserRole;
  targetId?: string;
  targetType?: TargetType;
  data: any;
  metadata: MessageMetadata;
  encryption?: EncryptionInfo;
  priority: MessagePriority;
  expiresAt?: Date;
}

export enum MessageType {
  // Authentication
  AUTH_REQUEST = 'auth_request',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  AUTH_REFRESH = 'auth_refresh',

  // Session Management
  SESSION_START = 'session_start',
  SESSION_JOIN = 'session_join',
  SESSION_LEAVE = 'session_leave',
  SESSION_END = 'session_end',
  SESSION_UPDATE = 'session_update',

  // Crisis Communication
  CRISIS_MESSAGE = 'crisis_message',
  CRISIS_ALERT = 'crisis_alert',
  CRISIS_ESCALATION = 'crisis_escalation',
  CRISIS_RESOLUTION = 'crisis_resolution',

  // Emergency
  EMERGENCY_ALERT = 'emergency_alert',
  EMERGENCY_RESPONSE = 'emergency_response',
  EMERGENCY_ESCALATION = 'emergency_escalation',
  EMERGENCY_BROADCAST = 'emergency_broadcast',

  // Volunteer Management
  VOLUNTEER_AVAILABLE = 'volunteer_available',
  VOLUNTEER_UNAVAILABLE = 'volunteer_unavailable',
  VOLUNTEER_ASSIGNMENT = 'volunteer_assignment',
  VOLUNTEER_STATUS_UPDATE = 'volunteer_status_update',

  // Tether Connection
  TETHER_CONNECT = 'tether_connect',
  TETHER_DISCONNECT = 'tether_disconnect',
  TETHER_HEARTBEAT = 'tether_heartbeat',
  TETHER_ALERT = 'tether_alert',
  TETHER_STATUS = 'tether_status',

  // System
  SYSTEM_NOTIFICATION = 'system_notification',
  SYSTEM_HEALTH = 'system_health',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_BROADCAST = 'system_broadcast',

  // Real-time Updates
  USER_TYPING = 'user_typing',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_STATUS = 'user_status',

  // Heartbeat
  PING = 'ping',
  PONG = 'pong',
  HEARTBEAT = 'heartbeat',

  // Error Handling
  ERROR = 'error',
  RETRY = 'retry',
  DISCONNECT = 'disconnect',
  RECONNECT = 'reconnect'
}

export enum TargetType {
  USER = 'user',
  SESSION = 'session',
  ROOM = 'room',
  BROADCAST = 'broadcast',
  ROLE = 'role'
}

export interface MessageMetadata {
  sessionId?: string;
  roomId?: string;
  crisisLevel?: number;
  isUrgent: boolean;
  requiresAcknowledgment: boolean;
  deliveryAttempts: number;
  originalTimestamp?: Date;
  correlationId?: string;
  parentMessageId?: string;
  tags?: string[];
}

export enum MessagePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5,
  EMERGENCY = 6
}

export interface EncryptionInfo {
  algorithm: string;
  keyId: string;
  iv: string;
  isEncrypted: boolean;
  encryptedFields: string[];
}

// ============================================================================
// CRISIS-SPECIFIC MESSAGE TYPES
// ============================================================================

export interface CrisisMessageData {
  content: string;
  messageType: CrisisMessageType;
  crisisLevel: number;
  riskAssessment?: RiskAssessment;
  interventions?: Intervention[];
  resources?: Resource[];
  attachments?: Attachment[];
  location?: GeographicLocation;
}

export enum CrisisMessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  LOCATION = 'location',
  RESOURCE = 'resource',
  ASSESSMENT = 'assessment',
  INTERVENTION = 'intervention',
  ESCALATION = 'escalation'
}

export interface RiskAssessment {
  level: number;
  factors: RiskFactor[];
  immediateThreats: string[];
  protectiveFactors: string[];
  recommendations: string[];
  assessedBy: string;
  assessedAt: Date;
  confidence: number;
}

export interface RiskFactor {
  type: string;
  severity: number;
  description: string;
  isActive: boolean;
}

export interface Intervention {
  id: string;
  type: string;
  description: string;
  implementedBy: string;
  timestamp: Date;
  effectiveness?: number;
  followUpRequired: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  phoneNumber?: string;
  isEmergency: boolean;
  availability: string;
  language: string;
}

export enum ResourceType {
  HOTLINE = 'hotline',
  WEBSITE = 'website',
  ARTICLE = 'article',
  VIDEO = 'video',
  AUDIO = 'audio',
  APP = 'app',
  BOOK = 'book',
  SERVICE = 'service'
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  isEncrypted: boolean;
  scannedForViruses: boolean;
  uploadedBy: string;
  uploadedAt: Date;
}

// ============================================================================
// EMERGENCY ALERT TYPES
// ============================================================================

export interface EmergencyAlertData {
  alertType: EmergencyAlertType;
  severity: EmergencySeverity;
  location: GeographicLocation;
  description: string;
  affectedUsers: string[];
  responseRequired: boolean;
  escalationLevel: number;
  estimatedTimeToRespond: number;
  emergencyServices?: EmergencyService[];
  contactInfo?: EmergencyContact[];
}

export enum EmergencyAlertType {
  SUICIDE_ATTEMPT = 'suicide_attempt',
  SELF_HARM = 'self_harm',
  VIOLENCE_THREAT = 'violence_threat',
  MEDICAL_EMERGENCY = 'medical_emergency',
  MENTAL_HEALTH_CRISIS = 'mental_health_crisis',
  SUBSTANCE_ABUSE = 'substance_abuse',
  DOMESTIC_VIOLENCE = 'domestic_violence',
  CHILD_ENDANGERMENT = 'child_endangerment',
  SYSTEM_FAILURE = 'system_failure'
}

export enum EmergencySeverity {
  LOW = 1,
  MODERATE = 2,
  HIGH = 3,
  SEVERE = 4,
  CRITICAL = 5,
  LIFE_THREATENING = 6
}

export interface EmergencyService {
  type: string;
  name: string;
  phoneNumber: string;
  location: GeographicLocation;
  estimatedArrival?: number;
  status: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
  hasBeenNotified: boolean;
}

// ============================================================================
// VOLUNTEER AND TETHER TYPES
// ============================================================================

export interface VolunteerStatusData {
  volunteerId: string;
  status: VolunteerStatus;
  availability: VolunteerAvailability;
  currentWorkload: number;
  maxCapacity: number;
  specializations: string[];
  location?: GeographicLocation;
  responseTime: number;
  rating: number;
  wellnessScore: number;
}

export enum VolunteerStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  AWAY = 'away',
  BREAK = 'break',
  OFFLINE = 'offline',
  EMERGENCY = 'emergency'
}

export interface VolunteerAvailability {
  isAvailable: boolean;
  availableUntil?: Date;
  nextAvailableAt?: Date;
  timeZone: string;
  workingHours: WorkingHours[];
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TetherConnectionData {
  connectionId: string;
  primaryUserId: string;
  tetherUserId: string;
  connectionType: TetherConnectionType;
  trustLevel: number;
  lastHeartbeat: Date;
  connectionStrength: number;
  emergencyProtocol: TetherEmergencyProtocol;
  permissions: TetherPermission[];
}

export enum TetherConnectionType {
  FAMILY = 'family',
  FRIEND = 'friend',
  PARTNER = 'partner',
  THERAPIST = 'therapist',
  SUPPORT_PERSON = 'support_person',
  EMERGENCY_CONTACT = 'emergency_contact'
}

export interface TetherEmergencyProtocol {
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
  messageTemplate?: string;
}

export interface TetherPermission {
  action: string;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// CONNECTION AND ROOM MANAGEMENT
// ============================================================================

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  participants: RoomParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  isEncrypted: boolean;
  crisisLevel?: number;
  metadata: RoomMetadata;
  createdAt: Date;
  expiresAt?: Date;
}

export enum RoomType {
  CRISIS_SESSION = 'crisis_session',
  VOLUNTEER_CHAT = 'volunteer_chat',
  SUPERVISOR_ROOM = 'supervisor_room',
  EMERGENCY_RESPONSE = 'emergency_response',
  TRAINING_SESSION = 'training_session',
  SUPPORT_GROUP = 'support_group',
  TETHER_CONNECTION = 'tether_connection'
}

export interface RoomParticipant {
  userId: string;
  role: UserRole;
  joinedAt: Date;
  permissions: RoomPermission[];
  isActive: boolean;
  lastActivity: Date;
}

export interface RoomPermission {
  action: string;
  granted: boolean;
}

export interface RoomMetadata {
  sessionId?: string;
  crisisType?: string;
  urgencyLevel?: number;
  recordingEnabled: boolean;
  moderatorId?: string;
  tags: string[];
}

// ============================================================================
// SYSTEM AND HEALTH MONITORING
// ============================================================================

export interface SystemHealthData {
  timestamp: Date;
  serverStatus: ServerStatus;
  connectionStats: ConnectionStats;
  performanceMetrics: PerformanceMetrics;
  errorRates: ErrorRates;
  resourceUsage: ResourceUsage;
}

export interface ServerStatus {
  isHealthy: boolean;
  uptime: number;
  version: string;
  region: string;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  connectionsPerSecond: number;
  disconnectionsPerSecond: number;
  avgConnectionDuration: number;
  connectionsByRole: Record<UserRole, number>;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  messageLatency: number;
  throughputPerSecond: number;
  queueLength: number;
  processedMessages: number;
  failedMessages: number;
}

export interface ErrorRates {
  connectionErrors: number;
  messageErrors: number;
  authenticationErrors: number;
  systemErrors: number;
  errorRate: number;
}

export interface ResourceUsage {
  memoryUsed: number;
  memoryTotal: number;
  cpuUsage: number;
  diskUsage: number;
  networkBandwidth: number;
  databaseConnections: number;
}

// ============================================================================
// EVENT HANDLERS AND CALLBACKS
// ============================================================================

export interface WebSocketEventHandlers {
  onConnect?: (connectionInfo: WebSocketConnectionInfo) => void;
  onDisconnect?: (reason: string, code: number) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: WebSocketError) => void;
  onReconnect?: (attempt: number) => void;
  onHeartbeat?: (timestamp: Date) => void;
  onAuthenticated?: (userId: string) => void;
  onRoomJoined?: (room: Room) => void;
  onRoomLeft?: (roomId: string) => void;
  onCrisisAlert?: (alert: EmergencyAlertData) => void;
  onEmergencyBroadcast?: (broadcast: EmergencyBroadcast) => void;
  onVolunteerStatusChange?: (status: VolunteerStatusData) => void;
  onTetherUpdate?: (connection: TetherConnectionData) => void;
  onSystemHealth?: (health: SystemHealthData) => void;
}

export interface EmergencyBroadcast {
  id: string;
  type: EmergencyAlertType;
  severity: EmergencySeverity;
  message: string;
  affectedRegions: string[];
  expiresAt: Date;
  actionRequired: boolean;
  instructions: string[];
}

export interface WebSocketError {
  code: string;
  message: string;
  timestamp: Date;
  context?: any;
  stack?: string;
  recoverable: boolean;
}

// ============================================================================
// AUTHENTICATION AND SECURITY
// ============================================================================

export interface AuthenticationData {
  token: string;
  refreshToken?: string;
  userId: string;
  role: UserRole;
  permissions: string[];
  sessionId?: string;
  expiresAt: Date;
  mfaRequired?: boolean;
}

export interface SecurityContext {
  isEncrypted: boolean;
  encryptionLevel: EncryptionLevel;
  rateLimitStatus: RateLimitStatus;
  ipWhitelisted: boolean;
  requiresMFA: boolean;
  lastSecurityCheck: Date;
  suspiciousActivity: boolean;
}

export enum EncryptionLevel {
  NONE = 0,
  BASIC = 1,
  STANDARD = 2,
  HIGH = 3,
  MAXIMUM = 4
}

export interface RateLimitStatus {
  messagesThisSecond: number;
  messagesThisMinute: number;
  bytesThisSecond: number;
  isLimited: boolean;
  resetAt: Date;
  warningsIssued: number;
}

// ============================================================================
// ANALYTICS AND MONITORING
// ============================================================================

export interface WebSocketAnalytics {
  connectionId: string;
  userId?: string;
  sessionDuration: number;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  errors: number;
  reconnections: number;
  averageLatency: number;
  peakLatency: number;
  bandwidthUsage: number;
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  type: string;
  timestamp: Date;
  data: any;
  severity: string;
  category: string;
}

// ============================================================================
// MESSAGE QUEUE AND DELIVERY
// ============================================================================

export interface MessageQueue {
  messages: QueuedMessage[];
  maxSize: number;
  currentSize: number;
  processingRate: number;
  oldestMessage?: Date;
  newestMessage?: Date;
}

export interface QueuedMessage {
  message: WebSocketMessage;
  queuedAt: Date;
  attempts: number;
  nextRetryAt?: Date;
  priority: MessagePriority;
  expiresAt?: Date;
}

export interface DeliveryReceipt {
  messageId: string;
  deliveredAt: Date;
  acknowledgmentRequired: boolean;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  deliveryAttempts: number;
  latency: number;
}

// ============================================================================
// CRISIS INTERVENTION PROTOCOLS
// ============================================================================

export interface CrisisProtocol {
  id: string;
  name: string;
  triggerConditions: TriggerCondition[];
  actions: ProtocolAction[];
  escalationRules: EscalationRule[];
  requiredRoles: UserRole[];
  timeoutMinutes: number;
  isActive: boolean;
}

export interface TriggerCondition {
  type: string;
  condition: string;
  threshold: any;
  operator: string;
}

export interface ProtocolAction {
  type: string;
  description: string;
  parameters: Record<string, any>;
  required: boolean;
  order: number;
}

export interface EscalationRule {
  level: number;
  triggerAfterMinutes: number;
  actions: ProtocolAction[];
  notifyRoles: UserRole[];
  message: string;
}

// ============================================================================
// MOBILE AND OFFLINE SUPPORT
// ============================================================================

export interface OfflineMessage {
  message: WebSocketMessage;
  storedAt: Date;
  syncPriority: number;
  deviceId: string;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingMessages: number;
  syncInProgress: boolean;
  conflictsDetected: number;
}

export interface MobileConfiguration {
  backgroundSyncEnabled: boolean;
  pushNotificationsEnabled: boolean;
  offlineStorageLimit: number;
  syncInterval: number;
  batteryOptimization: boolean;
  dataUsageOptimization: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WebSocketState = 
  | 'connecting' 
  | 'connected' 
  | 'disconnecting' 
  | 'disconnected' 
  | 'reconnecting' 
  | 'error';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface NetworkInfo {
  type: string;
  speed: string;
  quality: ConnectionQuality;
  latency: number;
  bandwidth: number;
  packetLoss: number;
}

export interface ClientCapabilities {
  supportsEncryption: boolean;
  supportsCompression: boolean;
  supportsFileTransfer: boolean;
  supportsVoiceChat: boolean;
  supportsVideoChat: boolean;
  maxMessageSize: number;
  supportedFormats: string[];
}

// ============================================================================
// EXPORT CONSOLIDATED TYPES
// ============================================================================

export interface WebSocketClient {
  config: WebSocketConfig;
  state: WebSocketState;
  connectionInfo?: WebSocketConnectionInfo;
  eventHandlers: WebSocketEventHandlers;
  analytics: WebSocketAnalytics;
  messageQueue: MessageQueue;
  securityContext: SecurityContext;
  capabilities: ClientCapabilities;
  networkInfo: NetworkInfo;
}

export interface WebSocketServer {
  connections: Map<string, WebSocketConnectionInfo>;
  rooms: Map<string, Room>;
  messageQueues: Map<string, MessageQueue>;
  protocols: CrisisProtocol[];
  systemHealth: SystemHealthData;
  analytics: ServerAnalytics;
}

export interface ServerAnalytics {
  totalConnections: number;
  messagesProcessed: number;
  emergencyAlerts: number;
  crisisSessions: number;
  avgResponseTime: number;
  uptime: number;
  errorRate: number;
}

// Message type guards
export const isEmergencyMessage = (message: WebSocketMessage): boolean => {
  return message.priority >= MessagePriority.EMERGENCY ||
         message.type.includes('emergency') ||
         message.type.includes('crisis');
};

export const isCrisisMessage = (message: WebSocketMessage): boolean => {
  return message.type.includes('crisis') ||
         (message.metadata.crisisLevel !== undefined && message.metadata.crisisLevel > 3);
};

export const requiresImmediateAction = (message: WebSocketMessage): boolean => {
  return message.metadata.isUrgent || 
         message.priority >= MessagePriority.URGENT ||
         isEmergencyMessage(message);
};

// Utility functions for message handling
export const getMessagePriority = (messageType: MessageType): MessagePriority => {
  const emergencyTypes = [
    MessageType.EMERGENCY_ALERT,
    MessageType.EMERGENCY_RESPONSE,
    MessageType.EMERGENCY_ESCALATION,
    MessageType.EMERGENCY_BROADCAST
  ];
  
  const urgentTypes = [
    MessageType.CRISIS_ALERT,
    MessageType.CRISIS_ESCALATION,
    MessageType.TETHER_ALERT
  ];
  
  if (emergencyTypes.includes(messageType)) {
    return MessagePriority.EMERGENCY;
  }
  
  if (urgentTypes.includes(messageType)) {
    return MessagePriority.URGENT;
  }
  
  return MessagePriority.NORMAL;
};