/**
 * HIPAA-Compliant Encryption Utilities for Astral Core V2
 * 
 * Implements AES-256-GCM encryption for sensitive data
 * Zero-knowledge architecture for crisis sessions
 * Client-side encryption for privacy protection
 */

import { randomBytes, createCipheriv, createDecipheriv, scrypt, createHash } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Type definitions
interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
  tag: string;
  algorithm: string;
  timestamp: string;
}

interface EncryptionKey {
  key: Buffer;
  salt: Buffer;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Encryption class for handling sensitive data
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private keyCache: Map<string, EncryptionKey> = new Map();
  
  private constructor() {}
  
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }
  
  /**
   * Derive encryption key from password
   */
  async deriveKey(password: string, salt?: Buffer): Promise<EncryptionKey> {
    const keySalt = salt || randomBytes(SALT_LENGTH);
    const key = (await scryptAsync(password, keySalt, KEY_LENGTH)) as Buffer;
    
    return {
      key,
      salt: keySalt,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
    };
  }
  
  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string, password: string): Promise<EncryptedData> {
    try {
      // Generate random salt and IV
      const salt = randomBytes(SALT_LENGTH);
      const iv = randomBytes(IV_LENGTH);
      
      // Derive key from password
      const { key } = await this.deriveKey(password, salt);
      
      // Create cipher
      const cipher = createCipheriv(ALGORITHM, key, iv);
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final(),
      ]);
      
      // Get auth tag
      const tag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted.toString('base64'),
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        algorithm: ALGORITHM,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }
  
  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
      // Parse encrypted components
      const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
      const salt = Buffer.from(encryptedData.salt, 'base64');
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const tag = Buffer.from(encryptedData.tag, 'base64');
      
      // Derive key from password
      const { key } = await this.deriveKey(password, salt);
      
      // Create decipher
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
  
  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('base64url');
  }
  
  /**
   * Hash sensitive data (one-way)
   */
  hashData(data: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(data + actualSalt)
      .digest('hex');
    return `${hash}:${actualSalt}`;
  }
  
  /**
   * Verify hashed data
   */
  verifyHash(data: string, hashedData: string): boolean {
    const [hash, salt] = hashedData.split(':');
    const testHash = createHash('sha256')
      .update(data + salt)
      .digest('hex');
    return hash === testHash;
  }
  
  /**
   * Clear key cache (for security)
   */
  clearKeyCache(): void {
    this.keyCache.clear();
  }
}

/**
 * Client-side encryption for crisis sessions
 */
export class CrisisSessionEncryption {
  private sessionKey: string | null = null;
  private encryptionService: EncryptionService;
  
  constructor() {
    this.encryptionService = EncryptionService.getInstance();
  }
  
  /**
   * Initialize session with ephemeral key
   */
  async initializeSession(): Promise<string> {
    // Generate ephemeral session key
    this.sessionKey = this.encryptionService.generateSecureToken(32);
    
    // Return public session ID (not the key itself)
    const sessionId = createHash('sha256')
      .update(this.sessionKey)
      .digest('hex');
    
    return sessionId;
  }
  
  /**
   * Encrypt message for crisis session
   */
  async encryptMessage(message: string): Promise<EncryptedData | null> {
    if (!this.sessionKey) {
      throw new Error('Session not initialized');
    }
    
    return this.encryptionService.encrypt(message, this.sessionKey);
  }
  
  /**
   * Decrypt message from crisis session
   */
  async decryptMessage(encryptedData: EncryptedData): Promise<string> {
    if (!this.sessionKey) {
      throw new Error('Session not initialized');
    }
    
    return this.encryptionService.decrypt(encryptedData, this.sessionKey);
  }
  
  /**
   * Destroy session and clear keys
   */
  destroySession(): void {
    this.sessionKey = null;
    this.encryptionService.clearKeyCache();
  }
}

/**
 * Field-level encryption for database
 */
export class FieldEncryption {
  private encryptionService: EncryptionService;
  private masterKey: string;
  
  constructor(masterKey: string) {
    this.encryptionService = EncryptionService.getInstance();
    this.masterKey = masterKey;
  }
  
  /**
   * Encrypt field for database storage
   */
  async encryptField(fieldValue: any): Promise<string> {
    const data = JSON.stringify(fieldValue);
    const encrypted = await this.encryptionService.encrypt(data, this.masterKey);
    return JSON.stringify(encrypted);
  }
  
  /**
   * Decrypt field from database
   */
  async decryptField(encryptedField: string): Promise<any> {
    const encrypted = JSON.parse(encryptedField) as EncryptedData;
    const decrypted = await this.encryptionService.decrypt(encrypted, this.masterKey);
    return JSON.parse(decrypted);
  }
  
  /**
   * Encrypt multiple fields
   */
  async encryptFields(fields: Record<string, any>): Promise<Record<string, string>> {
    const encrypted: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(fields)) {
      encrypted[key] = await this.encryptField(value);
    }
    
    return encrypted;
  }
  
  /**
   * Decrypt multiple fields
   */
  async decryptFields(encryptedFields: Record<string, string>): Promise<Record<string, any>> {
    const decrypted: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(encryptedFields)) {
      decrypted[key] = await this.decryptField(value);
    }
    
    return decrypted;
  }
}

/**
 * Browser-based encryption utilities (for client-side use)
 */
export class BrowserEncryption {
  private static isWebCryptoAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.crypto && 
           window.crypto.subtle !== undefined;
  }
  
  /**
   * Encrypt data using Web Crypto API
   */
  static async encryptInBrowser(data: string, password: string): Promise<string> {
    if (!this.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API not available');
    }
    
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    
    // Generate salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    // Encrypt data
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(data)
    );
    
    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }
  
  /**
   * Decrypt data using Web Crypto API
   */
  static async decryptInBrowser(encryptedData: string, password: string): Promise<string> {
    if (!this.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API not available');
    }
    
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Derive key from password
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    // Decrypt data
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return dec.decode(decrypted);
  }
  
  /**
   * Generate cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    if (!this.isWebCryptoAvailable()) {
      throw new Error('Web Crypto API not available');
    }
    
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();

// Export default encryption functions
export const encrypt = (data: string, password: string) => 
  encryptionService.encrypt(data, password);

export const decrypt = (encryptedData: EncryptedData, password: string) => 
  encryptionService.decrypt(encryptedData, password);

export const generateToken = (length?: number) => 
  encryptionService.generateSecureToken(length);

export const hashPassword = (password: string) => 
  encryptionService.hashData(password);

export const verifyPassword = (password: string, hash: string) => 
  encryptionService.verifyHash(password, hash);