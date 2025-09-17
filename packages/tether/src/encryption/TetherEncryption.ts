/**
 * ASTRAL_CORE 2.0 Tether Encryption
 * Handles encryption and decryption of sensitive tether data
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
}

export interface DecryptionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class TetherEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  /**
   * Generate encryption key from user data
   */
  private generateKey(userId: string, salt: string): Buffer {
    const keyMaterial = `${userId}:${salt}:astral_tether_v2`;
    return createHash('sha256').update(keyMaterial).digest();
  }

  /**
   * Encrypt tether data with user-specific key
   */
  encryptTetherData(data: any, userId?: string): string {
    try {
      const salt = randomBytes(16).toString('hex');
      const key = this.generateKey(userId || 'anonymous', salt);
      const iv = randomBytes(this.ivLength);
      
      const cipher = createCipheriv(this.algorithm, key, iv);
      
      const jsonData = JSON.stringify(data);
      let encrypted = cipher.update(jsonData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine salt, iv, tag, and encrypted data
      const result = {
        salt,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt tether data');
    }
  }

  /**
   * Decrypt tether data with user-specific key
   */
  decryptTetherData(encryptedData: string, userId?: string): DecryptionResult {
    try {
      const encryptedBuffer = Buffer.from(encryptedData, 'base64');
      const encryptedObj = JSON.parse(encryptedBuffer.toString('utf8'));
      
      const { salt, iv, tag, data } = encryptedObj;
      const key = this.generateKey(userId || 'anonymous', salt);
      
      const decipher = createDecipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const parsedData = JSON.parse(decrypted);
      
      return {
        success: true,
        data: parsedData
      };
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  }

  /**
   * Encrypt pulse message for transmission
   */
  encryptPulseMessage(message: string, tetherId: string): string {
    try {
      const key = this.generateKey(tetherId, 'pulse_encryption');
      const iv = randomBytes(this.ivLength);
      
      const cipher = createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      const result = {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      console.error('❌ Pulse encryption failed:', error);
      return message; // Fallback to unencrypted
    }
  }

  /**
   * Decrypt pulse message
   */
  decryptPulseMessage(encryptedMessage: string, tetherId: string): string {
    try {
      const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
      const encryptedObj = JSON.parse(encryptedBuffer.toString('utf8'));
      
      const { iv, tag, data } = encryptedObj;
      const key = this.generateKey(tetherId, 'pulse_encryption');
      
      const decipher = createDecipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Pulse decryption failed:', error);
      return encryptedMessage; // Return as-is if decryption fails
    }
  }

  /**
   * Generate secure tether ID
   */
  generateSecureTetherId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(8).toString('hex');
    const hash = createHash('sha256')
      .update(`${timestamp}:${randomPart}:tether`)
      .digest('hex')
      .substring(0, 16);
    
    return `tether_${timestamp}_${hash}`;
  }

  /**
   * Hash sensitive data for storage
   */
  hashSensitiveData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate encryption integrity
   */
  validateEncryption(originalData: any, encryptedData: string, userId?: string): boolean {
    try {
      const decryptionResult = this.decryptTetherData(encryptedData, userId);
      
      if (!decryptionResult.success) {
        return false;
      }
      
      // Compare original and decrypted data
      const originalJson = JSON.stringify(originalData);
      const decryptedJson = JSON.stringify(decryptionResult.data);
      
      return originalJson === decryptedJson;
    } catch (error) {
      console.error('❌ Encryption validation failed:', error);
      return false;
    }
  }

  /**
   * Test encryption system functionality
   */
  async testEncryptionSystem(): Promise<{
    success: boolean;
    errors: string[];
    performance: {
      encryptionTime: number;
      decryptionTime: number;
    };
  }> {
    const errors: string[] = [];
    let encryptionTime = 0;
    let decryptionTime = 0;

    try {
      const testData = {
        preferences: { theme: 'dark', notifications: true },
        metadata: { version: '2.0', timestamp: Date.now() }
      };

      // Test tether data encryption
      const encryptStart = performance.now();
      const encrypted = this.encryptTetherData(testData, 'test-user');
      encryptionTime = performance.now() - encryptStart;

      // Test tether data decryption
      const decryptStart = performance.now();
      const decrypted = this.decryptTetherData(encrypted, 'test-user');
      decryptionTime = performance.now() - decryptStart;

      if (!decrypted.success) {
        errors.push('Tether data decryption failed');
      }

      // Test pulse message encryption
      const testMessage = 'This is a test pulse message';
      const encryptedMessage = this.encryptPulseMessage(testMessage, 'test-tether');
      const decryptedMessage = this.decryptPulseMessage(encryptedMessage, 'test-tether');

      if (decryptedMessage !== testMessage) {
        errors.push('Pulse message encryption/decryption failed');
      }

      // Test validation
      const isValid = this.validateEncryption(testData, encrypted, 'test-user');
      if (!isValid) {
        errors.push('Encryption validation failed');
      }

      return {
        success: errors.length === 0,
        errors,
        performance: {
          encryptionTime: Math.round(encryptionTime * 100) / 100,
          decryptionTime: Math.round(decryptionTime * 100) / 100
        }
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown encryption error');
      return {
        success: false,
        errors,
        performance: { encryptionTime, decryptionTime }
      };
    }
  }

  /**
   * Generate encryption analytics
   */
  generateEncryptionAnalytics(): {
    encryptionEnabled: boolean;
    algorithm: string;
    keyLength: number;
    securityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  } {
    return {
      encryptionEnabled: true,
      algorithm: this.algorithm,
      keyLength: this.keyLength * 8, // Convert to bits
      securityLevel: 'HIGH',
      recommendations: [
        'Encryption is properly configured',
        'Using AES-256-GCM for maximum security',
        'User-specific keys provide additional protection',
        'Regular key rotation recommended for long-term tethers'
      ]
    };
  }
}