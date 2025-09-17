/**
 * ASTRAL_CORE 2.0 Zero-Knowledge Encryption Type Definitions
 * 
 * TYPE SAFETY FOR MAXIMUM SECURITY
 * All encryption operations are strongly typed to prevent security vulnerabilities
 */

// Core encryption interfaces
export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  authTag: string;
  sessionId: string;
  timestamp: string;
  keyRotationHint?: string;
}

export interface DecryptionResult {
  success: boolean;
  data?: string;
  error?: string;
  requiresKeyRotation?: boolean;
}

// Argon2id configuration for key derivation
export interface Argon2Config {
  timeCost: number;     // Number of iterations
  memoryCost: number;   // Memory usage in KB
  parallelism: number;  // Number of parallel threads
  hashLength: number;   // Output hash length in bytes
  saltLength: number;   // Salt length in bytes
}

// Encryption algorithm configuration
export interface EncryptionConfig {
  algorithm: string;           // AES-256-GCM
  keyLength: number;          // 256 bits
  ivLength: number;           // 96 bits for GCM
  tagLength: number;          // 128 bits for authentication
  sessionDuration: number;    // Session lifetime in milliseconds
}

// ECDH key pair for perfect forward secrecy
export interface ECDHKeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeyRaw: Uint8Array;
}

// Session keys with perfect forward secrecy
export interface SessionKeys {
  encryptionKey: CryptoKey;
  macKey: CryptoKey;
  sessionId: string;
  ephemeralKeyPair: ECDHKeyPair;
  createdAt: Date;
  expiresAt: Date;
  rotationScheduled: boolean;
}

// Anonymous authentication token
export interface AnonymousToken {
  tokenId: string;
  sessionHash: string;
  issuedAt: Date;
  expiresAt: Date;
  permissions: string[];
  isRevoked: boolean;
}

// HIPAA audit log entry
export interface HIPAAAuditEntry {
  timestamp: Date;
  operation: 'encrypt' | 'decrypt' | 'key_rotation' | 'session_create' | 'session_destroy';
  sessionId: string;
  dataSize: number;
  success: boolean;
  performanceMs: number;
  securityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  complianceNotes: string[];
}

// Browser-specific storage configuration
export interface BrowserStorageConfig {
  useIndexedDB: boolean;
  useSessionStorage: boolean;
  useMemoryOnly: boolean;
  maxStorageSize: number;
}

// Crisis mode configuration
export interface CrisisModeConfig {
  emergencyBypass: boolean;
  reduceLatency: boolean;
  prioritizeAvailability: boolean;
  allowPlaintextFallback: boolean;
}

// Performance metrics for monitoring
export interface BrowserPerformanceMetrics {
  encryptionLatency: number[];
  decryptionLatency: number[];
  keyDerivationLatency: number[];
  storageLatency: number[];
  memoryUsageKB: number;
  cpuUsagePercent: number;
}

// Encryption statistics
export interface EncryptionStats {
  activeSessions: number;
  activeTokens: number;
  oldestSession: Date | null;
  performanceMetrics: {
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    averageKeyDerivationTime: number;
  };
  securityMetrics: {
    keyRotationsToday: number;
    failedOperations: number;
    complianceScore: number;
  };
}

// HIPAA compliance report
export interface HIPAAComplianceReport {
  totalOperations: number;
  successRate: number;
  averagePerformance: number;
  securityBreaches: number;
  auditTrail: HIPAAAuditEntry[];
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

// Browser capabilities test result
export interface BrowserCapabilitiesResult {
  webCryptoSupported: boolean;
  indexedDBSupported: boolean;
  performanceAcceptable: boolean;
  securityFeatures: string[];
  recommendations: string[];
}

// Security validation result
export interface SecurityValidationResult {
  zeroKnowledgeVerified: boolean;
  forwardSecrecyVerified: boolean;
  anonymityVerified: boolean;
  hipaaCompliant: boolean;
}

// Performance test result
export interface PerformanceTestResult {
  sessionCreationTime: number;
  encryptionTime: number;
  decryptionTime: number;
  keyRotationTime: number;
}

// Comprehensive system test result
export interface SystemTestResult {
  success: boolean;
  errors: string[];
  performance: PerformanceTestResult;
  securityValidation: SecurityValidationResult;
}

// Session creation result
export interface SessionCreationResult {
  sessionId: string;
  publicKey: Uint8Array;
  token: AnonymousToken;
}

// Browser session creation result
export interface BrowserSessionResult {
  sessionId: string;
  token: AnonymousToken;
  publicKey?: Uint8Array;
}

// Key rotation result
export interface KeyRotationResult {
  success: boolean;
  newSessionId?: string;
  rotationTime: number;
  error?: string;
}

// Encryption operation context
export interface EncryptionContext {
  sessionId: string;
  tokenId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  crisisMode: boolean;
}

// Decryption operation context
export interface DecryptionContext {
  sessionId: string;
  tokenId?: string;
  verifyIntegrity: boolean;
  allowExpiredSession: boolean;
  timestamp: Date;
}

// Storage operation result
export interface StorageOperationResult {
  success: boolean;
  dataSize: number;
  storageType: 'memory' | 'indexeddb' | 'sessionstorage';
  operationTime: number;
  error?: string;
}

// Security policy configuration
export interface SecurityPolicy {
  requireStrongPasswords: boolean;
  enforceSessionTimeout: boolean;
  enableKeyRotation: boolean;
  auditAllOperations: boolean;
  blockSuspiciousActivity: boolean;
  requireSecureContext: boolean;
}

// Crisis intervention encryption config
export interface CrisisEncryptionConfig {
  prioritizeSpeed: boolean;
  enableEmergencyAccess: boolean;
  reduceKeyComplexity: boolean;
  allowPlaintextFallback: boolean;
  emergencyContactEncryption: boolean;
}

// Mental health data classification
export interface MentalHealthDataClassification {
  dataType: 'crisis_note' | 'therapy_session' | 'medication_info' | 'emergency_contact' | 'assessment_result';
  sensitivityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retentionPeriod: number; // Days
  encryptionRequired: boolean;
  auditRequired: boolean;
  emergencyAccess: boolean;
}

// Volunteer encryption permissions
export interface VolunteerEncryptionPermissions {
  canEncrypt: boolean;
  canDecrypt: boolean;
  canRotateKeys: boolean;
  canAccessAuditLog: boolean;
  canManageSessions: boolean;
  emergencyOverride: boolean;
  dataClassificationAccess: MentalHealthDataClassification['sensitivityLevel'][];
}

// Encryption service health status
export interface EncryptionServiceHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
  activeSessions: number;
  averageLatency: number;
  errorRate: number;
  lastHealthCheck: Date;
  issues: string[];
  recommendations: string[];
}

// Export all types
export type {
  // Core types already exported above
};

// Constants for encryption configuration
export const ENCRYPTION_CONSTANTS = {
  // Algorithm specifications
  ALGORITHM: 'AES-GCM' as const,
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 12,  // 96 bits for GCM
  TAG_LENGTH: 16, // 128 bits
  
  // Argon2id parameters
  ARGON2_TIME_COST: 4,
  ARGON2_MEMORY_COST: 65536, // 64MB
  ARGON2_PARALLELISM: 1,
  ARGON2_HASH_LENGTH: 32,
  ARGON2_SALT_LENGTH: 32,
  
  // Session management
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  KEY_ROTATION_INTERVAL: 23 * 60 * 60 * 1000, // 23 hours
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Performance targets (milliseconds)
  TARGET_ENCRYPTION_TIME: 10,
  TARGET_DECRYPTION_TIME: 10,
  TARGET_KEY_DERIVATION_TIME: 2000,
  TARGET_SESSION_CREATION_TIME: 500,
  TARGET_KEY_ROTATION_TIME: 100,
  
  // Security thresholds
  MAX_FAILED_OPERATIONS: 5,
  MIN_COMPLIANCE_SCORE: 95,
  MAX_SESSION_AGE_HOURS: 24,
  AUDIT_LOG_MAX_ENTRIES: 1000,
  
  // Browser storage limits
  MAX_STORAGE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_MEMORY_SESSIONS: 100,
  
  // Crisis mode settings
  CRISIS_REDUCED_ITERATIONS: 50000,
  CRISIS_MAX_LATENCY: 5, // 5ms max in crisis mode
  
  // HIPAA compliance
  HIPAA_AUDIT_RETENTION_DAYS: 2555, // 7 years
  HIPAA_ENCRYPTION_MINIMUM: 'AES-256',
  HIPAA_KEY_ROTATION_DAYS: 1
} as const;

// Type guards for runtime type checking
export const isEncryptionResult = (obj: any): obj is EncryptionResult => {
  return obj &&
    typeof obj.encryptedData === 'string' &&
    typeof obj.iv === 'string' &&
    typeof obj.authTag === 'string' &&
    typeof obj.sessionId === 'string' &&
    typeof obj.timestamp === 'string';
};

export const isDecryptionResult = (obj: any): obj is DecryptionResult => {
  return obj &&
    typeof obj.success === 'boolean' &&
    (obj.data === undefined || typeof obj.data === 'string') &&
    (obj.error === undefined || typeof obj.error === 'string');
};

export const isAnonymousToken = (obj: any): obj is AnonymousToken => {
  return obj &&
    typeof obj.tokenId === 'string' &&
    typeof obj.sessionHash === 'string' &&
    obj.issuedAt instanceof Date &&
    obj.expiresAt instanceof Date &&
    Array.isArray(obj.permissions) &&
    typeof obj.isRevoked === 'boolean';
};

export const isHIPAAAuditEntry = (obj: any): obj is HIPAAAuditEntry => {
  return obj &&
    obj.timestamp instanceof Date &&
    typeof obj.operation === 'string' &&
    typeof obj.sessionId === 'string' &&
    typeof obj.dataSize === 'number' &&
    typeof obj.success === 'boolean' &&
    typeof obj.performanceMs === 'number' &&
    ['HIGH', 'MEDIUM', 'LOW'].includes(obj.securityLevel) &&
    Array.isArray(obj.complianceNotes);
};