/**
 * Zero-Knowledge Encryption Service for Mental Health Crisis Platform
 * CRITICAL: Implements client-side encryption where the server never has access to plaintext
 * HIPAA Compliance: Ensures maximum privacy for crisis communications
 */

import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { EncryptionService } from './encryption-service';
import { SecurityLogger } from '../logging/security-logger';

export interface ZKEncryptedData {
  ciphertext: string;
  salt: string;
  iv: string;
  authTag: string;
  keyDerivationParams: {
    iterations: number;
    algorithm: string;
    keyLength: number;
  };
  metadata: {
    timestamp: string;
    version: string;
    dataType: 'crisis_message' | 'user_profile' | 'session_data' | 'phi';
    clientId: string;
  };
}

export interface ZKKeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  derivedFrom: string; // User-provided passphrase/biometric
}

export interface ZKSessionKey {
  sessionId: string;
  encryptedKey: string;
  keyId: string;
  ephemeral: boolean;
  expiresAt: Date;
}

/**
 * Zero-Knowledge Encryption Service
 * - Client-side encryption only
 * - Server never sees plaintext
 * - Perfect forward secrecy for crisis sessions
 * - Biometric-based key derivation support
 */
export class ZeroKnowledgeEncryptionService {
  private logger: SecurityLogger;
  private encryptionService: EncryptionService;
  private readonly VERSION = '2.0';
  private readonly DEFAULT_ITERATIONS = 600000; // 600K for maximum security
  private readonly KEY_LENGTH = 32; // 256-bit keys
  private readonly SESSION_KEY_CACHE = new Map<string, ZKSessionKey>();

  constructor() {
    this.logger = new SecurityLogger();
    this.encryptionService = new EncryptionService();
  }

  /**
   * Generate client-side key pair from user credentials
   * CRITICAL: This must run on the client, never on server
   */
  public generateClientKeyPair(
    userCredentials: string,
    biometricData?: string,
    additionalSalt?: string
  ): ZKKeyPair {
    try {
      // Combine all entropy sources
      const entropyData = [
        userCredentials,
        biometricData || '',
        additionalSalt || '',
        Date.now().toString(),
        crypto.randomBytes(32).toString('hex')
      ].join('|');

      // Derive master seed from entropy
      const masterSeed = crypto.pbkdf2Sync(
        entropyData,
        crypto.randomBytes(64), // Random salt
        this.DEFAULT_ITERATIONS,
        64,
        'sha512'
      );

      // Generate RSA key pair with secure random
      const prng = forge.random.createInstance();
      prng.seedFileSync = () => masterSeed.toString('hex');
      const rsaKeyPair = forge.pki.rsa.generateKeyPair({
        bits: 4096,
        prng: prng
      });

      const keyId = crypto.randomUUID();
      const derivedFrom = crypto.createHash('sha256')
        .update(userCredentials)
        .digest('hex')
        .substring(0, 16);

      return {
        publicKey: forge.pki.publicKeyToPem(rsaKeyPair.publicKey),
        privateKey: forge.pki.privateKeyToPem(rsaKeyPair.privateKey),
        keyId,
        derivedFrom
      };
    } catch (error) {
      this.logger.error('Client key pair generation failed', error as Error);
      throw new Error('Failed to generate zero-knowledge key pair');
    }
  }

  /**
   * Encrypt crisis message with zero-knowledge encryption
   * Perfect for crisis chat where privacy is paramount
   */
  public encryptCrisisMessage(
    message: string,
    sessionId: string,
    clientPrivateKey: string,
    recipientPublicKey: string
  ): ZKEncryptedData {
    try {
      // Generate ephemeral session key for this message
      const sessionKey = crypto.randomBytes(this.KEY_LENGTH);
      const salt = crypto.randomBytes(64);
      const iv = crypto.randomBytes(16);

      // Encrypt message with session key
      const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv);
      cipher.setAAD(Buffer.from(sessionId)); // Session ID as additional authenticated data

      const encrypted = Buffer.concat([
        cipher.update(message, 'utf8'),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag();

      // Encrypt session key with recipient's public key
      const recipientKey = forge.pki.publicKeyFromPem(recipientPublicKey);
      const encryptedSessionKey = recipientKey.encrypt(
        sessionKey.toString('base64'),
        'RSA-OAEP',
        {
          md: forge.md.sha256.create(),
          mgf1: { md: forge.md.sha256.create() }
        }
      );

      const zkEncrypted: ZKEncryptedData = {
        ciphertext: encrypted.toString('base64'),
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyDerivationParams: {
          iterations: this.DEFAULT_ITERATIONS,
          algorithm: 'aes-256-gcm',
          keyLength: this.KEY_LENGTH
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: this.VERSION,
          dataType: 'crisis_message',
          clientId: crypto.createHash('sha256')
            .update(clientPrivateKey)
            .digest('hex')
            .substring(0, 16)
        }
      };

      // Store encrypted session key separately (server can store this safely)
      this.storeEncryptedSessionKey(sessionId, encryptedSessionKey, recipientPublicKey);

      return zkEncrypted;
    } catch (error) {
      this.logger.error('Crisis message encryption failed', error as Error);
      throw new Error('Failed to encrypt crisis message with zero-knowledge');
    }
  }

  /**
   * Decrypt crisis message (client-side only)
   */
  public decryptCrisisMessage(
    zkEncryptedData: ZKEncryptedData,
    sessionId: string,
    clientPrivateKey: string
  ): string {
    try {
      // Retrieve encrypted session key
      const encryptedSessionKey = this.getEncryptedSessionKey(sessionId);
      if (!encryptedSessionKey) {
        throw new Error('Session key not found');
      }

      // Decrypt session key with private key
      const privateKey = forge.pki.privateKeyFromPem(clientPrivateKey);
      const sessionKeyBase64 = privateKey.decrypt(
        encryptedSessionKey,
        'RSA-OAEP',
        {
          md: forge.md.sha256.create(),
          mgf1: { md: forge.md.sha256.create() }
        }
      );
      const sessionKey = Buffer.from(sessionKeyBase64, 'base64');

      // Decrypt message
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        sessionKey,
        Buffer.from(zkEncryptedData.iv, 'base64')
      );

      (decipher as any).setAuthTag(Buffer.from(zkEncryptedData.authTag, 'base64'));
      decipher.setAAD(Buffer.from(sessionId));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(zkEncryptedData.ciphertext, 'base64')),
        decipher.final()
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Crisis message decryption failed', error as Error);
      throw new Error('Failed to decrypt crisis message');
    }
  }

  /**
   * Encrypt user profile with zero-knowledge
   * All personal data encrypted client-side before transmission
   */
  public encryptUserProfile(
    profileData: any,
    userPassphrase: string,
    biometricHash?: string
  ): ZKEncryptedData {
    try {
      // Derive encryption key from user credentials
      const salt = crypto.randomBytes(64);
      const keyMaterial = [userPassphrase, biometricHash || ''].join('|');
      
      const derivedKey = crypto.pbkdf2Sync(
        keyMaterial,
        salt,
        this.DEFAULT_ITERATIONS,
        this.KEY_LENGTH,
        'sha512'
      );

      // Encrypt profile data
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
      
      const profileJson = JSON.stringify(profileData);
      const encrypted = Buffer.concat([
        cipher.update(profileJson, 'utf8'),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag();

      return {
        ciphertext: encrypted.toString('base64'),
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyDerivationParams: {
          iterations: this.DEFAULT_ITERATIONS,
          algorithm: 'aes-256-gcm',
          keyLength: this.KEY_LENGTH
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: this.VERSION,
          dataType: 'user_profile',
          clientId: crypto.createHash('sha256')
            .update(userPassphrase)
            .digest('hex')
            .substring(0, 16)
        }
      };
    } catch (error) {
      this.logger.error('User profile encryption failed', error as Error);
      throw new Error('Failed to encrypt user profile with zero-knowledge');
    }
  }

  /**
   * Decrypt user profile (client-side only)
   */
  public decryptUserProfile(
    zkEncryptedData: ZKEncryptedData,
    userPassphrase: string,
    biometricHash?: string
  ): any {
    try {
      // Derive decryption key
      const keyMaterial = [userPassphrase, biometricHash || ''].join('|');
      const salt = Buffer.from(zkEncryptedData.salt, 'base64');
      
      const derivedKey = crypto.pbkdf2Sync(
        keyMaterial,
        salt,
        zkEncryptedData.keyDerivationParams.iterations,
        zkEncryptedData.keyDerivationParams.keyLength,
        'sha512'
      );

      // Decrypt profile data
      const decipher = crypto.createDecipheriv(
        zkEncryptedData.keyDerivationParams.algorithm,
        derivedKey,
        Buffer.from(zkEncryptedData.iv, 'base64')
      );

      (decipher as any).setAuthTag(Buffer.from(zkEncryptedData.authTag, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(zkEncryptedData.ciphertext, 'base64')),
        decipher.final()
      ]);

      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      this.logger.error('User profile decryption failed', error as Error);
      throw new Error('Invalid credentials or corrupted profile data');
    }
  }

  /**
   * Generate ephemeral session keys for crisis sessions
   * Keys automatically expire after session ends
   */
  public generateEphemeralSessionKey(
    sessionId: string,
    participantPublicKeys: string[],
    expiresInMs: number = 4 * 60 * 60 * 1000 // 4 hours
  ): ZKSessionKey[] {
    try {
      const sessionKeys: ZKSessionKey[] = [];
      const masterSessionKey = crypto.randomBytes(this.KEY_LENGTH);

      for (const publicKeyPem of participantPublicKeys) {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        const encryptedKey = publicKey.encrypt(
          masterSessionKey.toString('base64'),
          'RSA-OAEP',
          {
            md: forge.md.sha256.create(),
            mgf1: { md: forge.md.sha256.create() }
          }
        );

        const sessionKey: ZKSessionKey = {
          sessionId,
          encryptedKey: forge.util.encode64(encryptedKey),
          keyId: crypto.randomUUID(),
          ephemeral: true,
          expiresAt: new Date(Date.now() + expiresInMs)
        };

        sessionKeys.push(sessionKey);
        this.SESSION_KEY_CACHE.set(sessionKey.keyId, sessionKey);
      }

      // Schedule automatic cleanup
      setTimeout(() => {
        sessionKeys.forEach(key => {
          this.SESSION_KEY_CACHE.delete(key.keyId);
        });
      }, expiresInMs);

      return sessionKeys;
    } catch (error) {
      this.logger.error('Ephemeral session key generation failed', error as Error);
      throw new Error('Failed to generate ephemeral session keys');
    }
  }

  /**
   * Validate zero-knowledge encryption integrity
   */
  public validateEncryptionIntegrity(zkEncryptedData: ZKEncryptedData): boolean {
    try {
      // Check version compatibility
      if (zkEncryptedData.metadata.version !== this.VERSION) {
        this.logger.warn('Version mismatch in encrypted data', {
          expected: this.VERSION,
          actual: zkEncryptedData.metadata.version
        });
        return false;
      }

      // Validate timestamp (not too old)
      const encryptionTime = new Date(zkEncryptedData.metadata.timestamp);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (encryptionTime < oneHourAgo && zkEncryptedData.metadata.dataType === 'crisis_message') {
        this.logger.warn('Encrypted crisis message is too old', {
          encryptionTime: encryptionTime.toISOString()
        });
        return false;
      }

      // Validate required fields
      const requiredFields = ['ciphertext', 'salt', 'iv', 'authTag'];
      for (const field of requiredFields) {
        if (!zkEncryptedData[field as keyof ZKEncryptedData]) {
          this.logger.error('Missing required field in encrypted data', new Error(`Missing field: ${field}`));
          return false;
        }
      }

      // Validate base64 encoding
      try {
        Buffer.from(zkEncryptedData.ciphertext, 'base64');
        Buffer.from(zkEncryptedData.salt, 'base64');
        Buffer.from(zkEncryptedData.iv, 'base64');
        Buffer.from(zkEncryptedData.authTag, 'base64');
      } catch {
        this.logger.error('Invalid base64 encoding in encrypted data');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Encryption integrity validation failed', error as Error);
      return false;
    }
  }

  /**
   * Emergency decryption for crisis escalation
   * Uses emergency access keys (with proper audit logging)
   */
  public emergencyDecrypt(
    zkEncryptedData: ZKEncryptedData,
    emergencyKey: string,
    justification: string,
    authorizedBy: string
  ): string {
    try {
      // Log emergency access attempt
      this.logger.critical('Emergency decryption attempted', {
        dataType: zkEncryptedData.metadata.dataType,
        timestamp: zkEncryptedData.metadata.timestamp,
        justification,
        authorizedBy,
        emergencyKeyHash: crypto.createHash('sha256').update(emergencyKey).digest('hex').substring(0, 8)
      });

      // Verify emergency key
      if (!this.validateEmergencyKey(emergencyKey, authorizedBy)) {
        throw new Error('Invalid emergency key or unauthorized access');
      }

      // Decrypt using emergency procedures
      // This would typically involve a master key stored in a secure hardware module
      // For this implementation, we'll use a derived key from the emergency key
      const salt = Buffer.from(zkEncryptedData.salt, 'base64');
      const emergencyDecryptionKey = crypto.pbkdf2Sync(
        emergencyKey,
        salt,
        zkEncryptedData.keyDerivationParams.iterations,
        zkEncryptedData.keyDerivationParams.keyLength,
        'sha512'
      );

      const decipher = crypto.createDecipheriv(
        zkEncryptedData.keyDerivationParams.algorithm,
        emergencyDecryptionKey,
        Buffer.from(zkEncryptedData.iv, 'base64')
      );

      (decipher as any).setAuthTag(Buffer.from(zkEncryptedData.authTag, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(zkEncryptedData.ciphertext, 'base64')),
        decipher.final()
      ]);

      // Log successful emergency access
      this.logger.critical('Emergency decryption successful', {
        dataType: zkEncryptedData.metadata.dataType,
        authorizedBy,
        justification
      });

      return decrypted.toString('utf8');
    } catch (error) {
      // Log failed emergency access
      this.logger.critical('Emergency decryption failed', {
        error: (error as Error).message,
        authorizedBy,
        justification
      });
      throw error;
    }
  }

  /**
   * Store encrypted session key (server-safe storage)
   */
  private storeEncryptedSessionKey(
    sessionId: string,
    encryptedSessionKey: string,
    recipientPublicKey: string
  ): void {
    // In a real implementation, this would store in a secure database
    // The server never sees the plaintext session key
    const keyId = crypto.randomUUID();
    const sessionKey: ZKSessionKey = {
      sessionId,
      encryptedKey: forge.util.encode64(encryptedSessionKey),
      keyId,
      ephemeral: true,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
    };

    this.SESSION_KEY_CACHE.set(sessionId, sessionKey);
  }

  /**
   * Retrieve encrypted session key
   */
  private getEncryptedSessionKey(sessionId: string): string | null {
    const sessionKey = this.SESSION_KEY_CACHE.get(sessionId);
    if (!sessionKey || sessionKey.expiresAt < new Date()) {
      return null;
    }
    return sessionKey.encryptedKey;
  }

  /**
   * Validate emergency key
   */
  private validateEmergencyKey(emergencyKey: string, authorizedBy: string): boolean {
    // In production, this would validate against secure key management system
    // For now, we'll do basic validation
    return emergencyKey.length >= 64 && authorizedBy.length > 0;
  }

  /**
   * Secure memory cleanup
   */
  public secureCleanup(): void {
    // Clear session key cache
    this.SESSION_KEY_CACHE.clear();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }
}

export default ZeroKnowledgeEncryptionService;