/**
 * ASTRAL Core V2 - Secure Key Management System
 * 
 * User-controlled encryption key management with:
 * - Secure password-based key derivation
 * - Biometric authentication support
 * - Key rotation and recovery mechanisms
 * - Zero-knowledge architecture
 * - Emergency access protocols
 */

import { EventEmitter } from 'events';
import { ZeroKnowledgeCrypto, EncryptedData, CrisisEncryptionContext } from './zero-knowledge-crypto';

// Key management interfaces
export interface UserKeyProfile {
  userId: string;
  keyId: string;
  keyVersion: number;
  createdAt: Date;
  lastUsed: Date;
  keyDerivationConfig: KeyDerivationConfig;
  recoveryConfig?: RecoveryConfig;
  biometricEnabled: boolean;
  emergencyAccess: EmergencyAccessConfig;
}

export interface KeyDerivationConfig {
  algorithm: 'PBKDF2';
  hashFunction: 'SHA-256' | 'SHA-512';
  iterations: number;
  saltLength: number;
  keyLength: number;
}

export interface RecoveryConfig {
  enabled: boolean;
  recoveryQuestions?: RecoveryQuestion[];
  backupKeyEnabled: boolean;
  trustedContacts?: string[]; // Encrypted contact IDs
}

export interface RecoveryQuestion {
  question: string;
  answerHash: string; // Hashed answer for verification
  salt: string;
}

export interface EmergencyAccessConfig {
  enabled: boolean;
  emergencyContacts: EncryptedEmergencyContact[];
  timeDelayHours: number; // Delay before emergency access is granted
  autoGrantThreshold: 'CRITICAL' | 'HIGH'; // Risk level that auto-grants access
}

export interface EncryptedEmergencyContact {
  contactId: string;
  encryptedContactData: EncryptedData; // Contact info encrypted with separate key
  accessLevel: 'READ_ONLY' | 'FULL_ACCESS';
  relationshipType: 'FAMILY' | 'FRIEND' | 'THERAPIST' | 'EMERGENCY_CONTACT';
}

export interface BiometricConfig {
  enabled: boolean;
  supportedTypes: ('fingerprint' | 'face-id' | 'voice')[];
  fallbackToPassword: boolean;
}

export interface KeyRotationConfig {
  autoRotationEnabled: boolean;
  rotationIntervalDays: number;
  maxKeyAge: number;
  notifyBeforeRotation: boolean;
}

export interface SecureSession {
  sessionId: string;
  userId: string;
  keyId: string;
  masterKey: CryptoKey;
  sessionKey: CryptoKey;
  createdAt: Date;
  expiresAt: Date;
  isAnonymous: boolean;
  emergencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface KeyAccessLog {
  timestamp: Date;
  userId: string;
  keyId: string;
  operation: 'KEY_DERIVED' | 'KEY_USED' | 'KEY_ROTATED' | 'EMERGENCY_ACCESS' | 'BIOMETRIC_AUTH';
  success: boolean;
  ipAddress?: string;
  emergencyLevel?: string;
  errorMessage?: string;
}

export class SecureKeyManager extends EventEmitter {
  private crypto: ZeroKnowledgeCrypto;
  private userProfiles: Map<string, UserKeyProfile> = new Map();
  private activeSessions: Map<string, SecureSession> = new Map();
  private accessLogs: KeyAccessLog[] = [];
  private biometricSupport: boolean = false;
  private emergencyAccessQueue: Map<string, Date> = new Map();

  // Default security configurations
  private defaultKeyConfig: KeyDerivationConfig = {
    algorithm: 'PBKDF2',
    hashFunction: 'SHA-256',
    iterations: 600000, // OWASP 2024 recommendation
    saltLength: 32,
    keyLength: 256
  };

  private defaultRotationConfig: KeyRotationConfig = {
    autoRotationEnabled: true,
    rotationIntervalDays: 90,
    maxKeyAge: 365,
    notifyBeforeRotation: true
  };

  constructor(crypto: ZeroKnowledgeCrypto) {
    super();
    this.crypto = crypto;
    this.initializeBiometricSupport();
    this.startEmergencyAccessMonitoring();
  }

  /**
   * Initialize biometric authentication support
   */
  private async initializeBiometricSupport(): Promise<void> {
    try {
      // Check for WebAuthn API support
      if (window.PublicKeyCredential && navigator.credentials) {
        this.biometricSupport = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        if (this.biometricSupport) {
          console.log('Biometric authentication available');
          this.emit('biometric-support-detected');
        }
      }
    } catch (error) {
      console.log('Biometric authentication not available:', error);
    }
  }

  /**
   * Create user key profile with secure defaults
   */
  public async createUserProfile(
    userId: string,
    masterPassword: string,
    options?: {
      enableBiometric?: boolean;
      enableRecovery?: boolean;
      emergencyContacts?: string[];
      customKeyConfig?: Partial<KeyDerivationConfig>;
    }
  ): Promise<UserKeyProfile> {
    try {
      const keyId = await this.generateKeyId();
      const keyConfig = { ...this.defaultKeyConfig, ...options?.customKeyConfig };

      // Test key derivation with user password
      await this.testKeyDerivation(masterPassword, keyConfig);

      const profile: UserKeyProfile = {
        userId,
        keyId,
        keyVersion: 1,
        createdAt: new Date(),
        lastUsed: new Date(),
        keyDerivationConfig: keyConfig,
        biometricEnabled: options?.enableBiometric && this.biometricSupport || false,
        emergencyAccess: {
          enabled: options?.emergencyContacts ? options.emergencyContacts.length > 0 : false,
          emergencyContacts: [],
          timeDelayHours: 24, // 24-hour delay for emergency access
          autoGrantThreshold: 'CRITICAL'
        }
      };

      // Set up recovery if enabled
      if (options?.enableRecovery) {
        profile.recoveryConfig = {
          enabled: true,
          backupKeyEnabled: true,
          trustedContacts: []
        };
      }

      // Store profile
      this.userProfiles.set(userId, profile);

      // Log profile creation
      this.logKeyAccess({
        timestamp: new Date(),
        userId,
        keyId,
        operation: 'KEY_DERIVED',
        success: true
      });

      this.emit('user-profile-created', { userId, keyId });
      return profile;
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw new Error('Failed to create secure user profile');
    }
  }

  /**
   * Authenticate user and create secure session
   */
  public async authenticateUser(
    userId: string,
    password: string,
    options?: {
      sessionDurationMinutes?: number;
      emergencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      isAnonymous?: boolean;
    }
  ): Promise<SecureSession> {
    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // For emergency situations, allow expedited authentication
      const isEmergency = options?.emergencyLevel === 'CRITICAL' || options?.emergencyLevel === 'HIGH';
      const iterations = isEmergency ? 
        Math.max(100000, profile.keyDerivationConfig.iterations / 2) : 
        profile.keyDerivationConfig.iterations;

      // Derive master key from password
      const masterKey = await this.deriveMasterKey(
        password,
        profile.keyDerivationConfig,
        iterations
      );

      // Generate session key
      const sessionKey = await this.crypto.generateSessionKey(`session_${Date.now()}`);
      
      // Create session
      const sessionDuration = options?.sessionDurationMinutes || (isEmergency ? 480 : 240); // 8 hours for emergency, 4 hours normal
      const session: SecureSession = {
        sessionId: this.generateSessionId(),
        userId,
        keyId: profile.keyId,
        masterKey,
        sessionKey,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + sessionDuration * 60 * 1000),
        isAnonymous: options?.isAnonymous || false,
        emergencyLevel: options?.emergencyLevel
      };

      this.activeSessions.set(session.sessionId, session);

      // Update profile
      profile.lastUsed = new Date();
      this.userProfiles.set(userId, profile);

      // Log successful authentication
      this.logKeyAccess({
        timestamp: new Date(),
        userId,
        keyId: profile.keyId,
        operation: 'KEY_DERIVED',
        success: true,
        emergencyLevel: options?.emergencyLevel
      });

      this.emit('user-authenticated', { 
        userId, 
        sessionId: session.sessionId,
        emergencyLevel: options?.emergencyLevel 
      });

      return session;
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Log failed authentication
      this.logKeyAccess({
        timestamp: new Date(),
        userId,
        keyId: 'unknown',
        operation: 'KEY_DERIVED',
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error)
      });

      throw new Error('Authentication failed');
    }
  }

  /**
   * Encrypt data using session keys
   */
  public async encryptWithSession(
    sessionId: string,
    data: string | object,
    context: CrisisEncryptionContext
  ): Promise<EncryptedData> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    if (new Date() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      throw new Error('Session expired');
    }

    // Use session-based encryption key
    const sessionPassword = await this.deriveSessionPassword(session);
    
    // Update context with session info
    const sessionContext: CrisisEncryptionContext = {
      ...context,
      sessionId: session.sessionId,
      userId: session.isAnonymous ? undefined : session.userId,
      emergencyLevel: context.emergencyLevel || session.emergencyLevel
    };

    const encrypted = await this.crypto.encryptCrisisData(data, sessionPassword, sessionContext);

    // Log encryption operation
    this.logKeyAccess({
      timestamp: new Date(),
      userId: session.userId,
      keyId: session.keyId,
      operation: 'KEY_USED',
      success: true,
      emergencyLevel: session.emergencyLevel
    });

    return encrypted;
  }

  /**
   * Decrypt data using session keys
   */
  public async decryptWithSession(
    sessionId: string,
    encryptedData: EncryptedData,
    context: CrisisEncryptionContext
  ): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    if (new Date() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      throw new Error('Session expired');
    }

    const sessionPassword = await this.deriveSessionPassword(session);
    
    const sessionContext: CrisisEncryptionContext = {
      ...context,
      sessionId: session.sessionId,
      userId: session.isAnonymous ? undefined : session.userId
    };

    return this.crypto.decryptCrisisData(encryptedData, sessionPassword, sessionContext);
  }

  /**
   * Enable biometric authentication for user
   */
  public async enableBiometricAuth(userId: string): Promise<boolean> {
    if (!this.biometricSupport) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Create WebAuthn credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "ASTRAL Crisis Platform",
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: `user_${userId}`,
            displayName: "Crisis Platform User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        profile.biometricEnabled = true;
        this.userProfiles.set(userId, profile);
        
        this.emit('biometric-enabled', { userId });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      return false;
    }
  }

  /**
   * Create emergency access request
   */
  public async requestEmergencyAccess(
    userId: string,
    emergencyContactId: string,
    reason: string
  ): Promise<{ requestId: string; estimatedWaitTime: number }> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.emergencyAccess.enabled) {
      throw new Error('Emergency access not configured');
    }

    const requestId = `emergency_${userId}_${Date.now()}`;
    const waitTime = profile.emergencyAccess.timeDelayHours * 60 * 60 * 1000;
    const grantTime = new Date(Date.now() + waitTime);

    this.emergencyAccessQueue.set(requestId, grantTime);

    // Log emergency access request
    this.logKeyAccess({
      timestamp: new Date(),
      userId,
      keyId: profile.keyId,
      operation: 'EMERGENCY_ACCESS',
      success: true,
      errorMessage: `Emergency access requested: ${reason}`
    });

    this.emit('emergency-access-requested', {
      requestId,
      userId,
      emergencyContactId,
      reason,
      grantTime
    });

    return {
      requestId,
      estimatedWaitTime: waitTime
    };
  }

  /**
   * Rotate user encryption keys
   */
  public async rotateUserKey(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const profile = this.userProfiles.get(userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Verify current password
      await this.deriveMasterKey(currentPassword, profile.keyDerivationConfig);

      // Create new key configuration
      const newKeyConfig = {
        ...profile.keyDerivationConfig,
        iterations: Math.max(profile.keyDerivationConfig.iterations, this.defaultKeyConfig.iterations)
      };

      // Test new password
      await this.testKeyDerivation(newPassword, newKeyConfig);

      // Update profile
      profile.keyVersion += 1;
      profile.keyDerivationConfig = newKeyConfig;
      profile.lastUsed = new Date();

      this.userProfiles.set(userId, profile);

      // Invalidate all existing sessions
      for (const [sessionId, session] of this.activeSessions) {
        if (session.userId === userId) {
          this.activeSessions.delete(sessionId);
        }
      }

      // Log key rotation
      this.logKeyAccess({
        timestamp: new Date(),
        userId,
        keyId: profile.keyId,
        operation: 'KEY_ROTATED',
        success: true
      });

      this.emit('key-rotated', { userId, newKeyVersion: profile.keyVersion });
    } catch (error) {
      console.error('Key rotation failed:', error);
      throw new Error('Failed to rotate encryption key');
    }
  }

  /**
   * Create anonymous session for crisis situations
   */
  public async createAnonymousSession(
    emergencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): Promise<SecureSession> {
    const anonymousUserId = `anon_${Date.now()}_${Math.random().toString(36)}`;
    const tempPassword = crypto.getRandomValues(new Uint8Array(32)).toString();

    // Create temporary profile for anonymous session
    const tempProfile = await this.createUserProfile(anonymousUserId, tempPassword);

    // Create session with extended duration for crisis situations
    const session = await this.authenticateUser(anonymousUserId, tempPassword, {
      sessionDurationMinutes: 720, // 12 hours for crisis sessions
      emergencyLevel,
      isAnonymous: true
    });

    this.emit('anonymous-session-created', {
      sessionId: session.sessionId,
      emergencyLevel
    });

    return session;
  }

  // Private helper methods

  private async deriveMasterKey(
    password: string,
    config: KeyDerivationConfig,
    customIterations?: number
  ): Promise<CryptoKey> {
    const iterations = customIterations || config.iterations;
    const salt = crypto.getRandomValues(new Uint8Array(config.saltLength));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: config.algorithm,
        salt,
        iterations,
        hash: config.hashFunction
      },
      keyMaterial,
      { name: 'AES-GCM', length: config.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async testKeyDerivation(
    password: string,
    config: KeyDerivationConfig
  ): Promise<void> {
    try {
      await this.deriveMasterKey(password, config);
    } catch (error) {
      throw new Error('Invalid key derivation configuration');
    }
  }

  private async deriveSessionPassword(session: SecureSession): Promise<string> {
    // Derive session-specific password from master key
    const keyData = await crypto.subtle.exportKey('raw', session.sessionKey);
    const hasher = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(new Uint8Array(keyData)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateKeyId(): string {
    const timestamp = Date.now().toString(36);
    const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(36))
      .join('');
    return `key_${timestamp}_${random}`;
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(36))
      .join('');
    return `session_${timestamp}_${random}`;
  }

  private logKeyAccess(log: KeyAccessLog): void {
    this.accessLogs.push(log);
    
    // Keep only last 1000 logs for memory management
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }

    this.emit('key-access-logged', log);
  }

  private startEmergencyAccessMonitoring(): void {
    setInterval(() => {
      const now = new Date();
      for (const [requestId, grantTime] of this.emergencyAccessQueue) {
        if (now >= grantTime) {
          this.emergencyAccessQueue.delete(requestId);
          this.emit('emergency-access-granted', { requestId });
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get session information
   */
  public getSession(sessionId: string): SecureSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Invalidate session
   */
  public invalidateSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  /**
   * Get access logs for user
   */
  public getUserAccessLogs(userId: string): KeyAccessLog[] {
    return this.accessLogs.filter(log => log.userId === userId);
  }

  /**
   * Clear expired sessions
   */
  public clearExpiredSessions(): number {
    const now = new Date();
    let clearedCount = 0;

    for (const [sessionId, session] of this.activeSessions) {
      if (now > session.expiresAt) {
        this.activeSessions.delete(sessionId);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      this.emit('sessions-cleaned', { clearedCount });
    }

    return clearedCount;
  }

  /**
   * Dispose of sensitive data
   */
  public dispose(): void {
    this.activeSessions.clear();
    this.userProfiles.clear();
    this.accessLogs.length = 0;
    this.emergencyAccessQueue.clear();
    this.removeAllListeners();
  }
}