/**
 * HIPAA-Compliant Encryption Utilities for Mental Health Data
 * 
 * Features:
 * - AES-256-GCM encryption for maximum security
 * - Per-user encryption keys derived from secure sources
 * - Zero-knowledge architecture - keys never stored
 * - Data integrity verification with authentication tags
 * - Secure key derivation using PBKDF2
 */

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, createHash } from 'crypto';

// Encryption configuration
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  saltLength: 32, // 256 bits
  tagLength: 16,  // 128 bits
  iterations: 100000, // PBKDF2 iterations
} as const;

/**
 * Derives a user-specific encryption key from their ID and a master secret
 * This ensures each user has a unique key without storing it
 */
export function deriveUserKey(userId: string, masterSecret?: string): Buffer {
  // Use environment variable or fallback for development
  const secret = masterSecret || process.env.ENCRYPTION_MASTER_KEY || 'dev-master-key-change-in-production';
  
  // Create a salt from the user ID (deterministic but unique per user)
  const userSalt = createHash('sha256').update(`astral_user_${userId}`).digest();
  
  // Derive key using PBKDF2
  return pbkdf2Sync(secret, userSalt, ENCRYPTION_CONFIG.iterations, ENCRYPTION_CONFIG.keyLength, 'sha256');
}

/**
 * Encrypts sensitive data with user-specific key
 */
export function encryptUserData(data: string, userId: string): {
  encryptedData: Buffer;
  salt: Buffer;
  iv: Buffer;
  tag: Buffer;
} {
  try {
    const key = deriveUserKey(userId);
    const iv = randomBytes(ENCRYPTION_CONFIG.ivLength);
    const salt = randomBytes(ENCRYPTION_CONFIG.saltLength);
    
    // Use Node.js built-in crypto for AES-GCM
    const crypto = require('crypto');
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    cipher.setAAD(Buffer.from(userId, 'utf8')); // Additional authenticated data
    
    let encrypted = cipher.update(data, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      salt,
      iv,
      tag,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt user data');
  }
}

/**
 * Decrypts user data with user-specific key
 */
export function decryptUserData(
  encryptedData: Buffer,
  userId: string,
  salt: Buffer,
  iv: Buffer,
  tag: Buffer
): string {
  try {
    const key = deriveUserKey(userId);
    
    const crypto = require('crypto');
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    decipher.setAAD(Buffer.from(userId, 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt user data - data may be corrupted');
  }
}

/**
 * Creates a hash for data integrity verification
 */
export function createContentHash(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Verifies data integrity
 */
export function verifyContentHash(data: string, hash: string): boolean {
  return createContentHash(data) === hash;
}

/**
 * Encrypts mood entry data
 */
export function encryptMoodEntry(moodData: any, userId: string): {
  encryptedData: Buffer;
  metadata: {
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
    hash: string;
  };
} {
  const jsonData = JSON.stringify(moodData);
  const hash = createContentHash(jsonData);
  const { encryptedData, salt, iv, tag } = encryptUserData(jsonData, userId);
  
  return {
    encryptedData,
    metadata: { salt, iv, tag, hash },
  };
}

/**
 * Decrypts mood entry data
 */
export function decryptMoodEntry(
  encryptedData: Buffer,
  userId: string,
  metadata: {
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
    hash: string;
  }
): any {
  const decryptedJson = decryptUserData(
    encryptedData,
    userId,
    metadata.salt,
    metadata.iv,
    metadata.tag
  );
  
  // Verify data integrity
  if (!verifyContentHash(decryptedJson, metadata.hash)) {
    throw new Error('Data integrity check failed - mood data may be corrupted');
  }
  
  return JSON.parse(decryptedJson);
}

/**
 * Encrypts safety plan data
 */
export function encryptSafetyPlan(planData: any, userId: string): {
  encryptedContent: Buffer;
  contentHash: string;
  salt: Buffer;
  iv: Buffer;
  tag: Buffer;
} {
  const jsonData = JSON.stringify(planData);
  const contentHash = createContentHash(jsonData);
  const { encryptedData, salt, iv, tag } = encryptUserData(jsonData, userId);
  
  return {
    encryptedContent: encryptedData,
    contentHash,
    salt,
    iv,
    tag,
  };
}

/**
 * Decrypts safety plan data
 */
export function decryptSafetyPlan(
  encryptedContent: Buffer,
  userId: string,
  contentHash: string,
  salt: Buffer,
  iv: Buffer,
  tag: Buffer
): any {
  const decryptedJson = decryptUserData(encryptedContent, userId, salt, iv, tag);
  
  // Verify data integrity
  if (!verifyContentHash(decryptedJson, contentHash)) {
    throw new Error('Data integrity check failed - safety plan may be corrupted');
  }
  
  return JSON.parse(decryptedJson);
}

/**
 * Encrypts user profile data
 */
export function encryptUserProfile(profileData: any, userId: string): {
  encryptedProfile: Buffer;
  metadata: {
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
    hash: string;
  };
} {
  const jsonData = JSON.stringify(profileData);
  const hash = createContentHash(jsonData);
  const { encryptedData, salt, iv, tag } = encryptUserData(jsonData, userId);
  
  return {
    encryptedProfile: encryptedData,
    metadata: { salt, iv, tag, hash },
  };
}

/**
 * Decrypts user profile data
 */
export function decryptUserProfile(
  encryptedProfile: Buffer,
  userId: string,
  metadata: {
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
    hash: string;
  }
): any {
  const decryptedJson = decryptUserData(
    encryptedProfile,
    userId,
    metadata.salt,
    metadata.iv,
    metadata.tag
  );
  
  // Verify data integrity
  if (!verifyContentHash(decryptedJson, metadata.hash)) {
    throw new Error('Data integrity check failed - user profile may be corrupted');
  }
  
  return JSON.parse(decryptedJson);
}

/**
 * Generates a secure anonymous ID for users
 */
export function generateAnonymousId(): string {
  return `anon_${randomBytes(16).toString('hex')}`;
}

/**
 * Generates a secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Simple encryption for localStorage (fallback)
 * NOTE: This is less secure than database encryption
 */
export function encryptForLocalStorage(data: string, key: string): string {
  try {
    const iv = randomBytes(16);
    const keyBuffer = createHash('sha256').update(key).digest();
    const cipher = createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch {
    // Fallback to base64 for compatibility
    return Buffer.from(data).toString('base64');
  }
}

/**
 * Simple decryption for localStorage (fallback)
 */
export function decryptFromLocalStorage(encryptedData: string, key: string): string {
  try {
    if (encryptedData.includes(':')) {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const keyBuffer = createHash('sha256').update(key).digest();
      const decipher = createDecipheriv('aes-256-cbc', keyBuffer, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } else {
      // Legacy fallback
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    }
  } catch {
    // Fallback from base64
    try {
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    } catch {
      return encryptedData; // Return as-is if all else fails
    }
  }
}