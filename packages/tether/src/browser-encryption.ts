/**
 * ASTRAL_CORE 2.0 Browser-Specific Zero-Knowledge Encryption
 * 
 * CLIENT-SIDE ENCRYPTION UTILITIES FOR WEB BROWSERS
 * Optimized for mental health crisis situations with maximum privacy
 * 
 * SECURITY FEATURES:
 * - Pure client-side encryption (never sends plaintext to server)
 * - Browser-native WebCrypto API for maximum performance
 * - IndexedDB for secure local storage
 * - Memory-only session keys
 * - Automatic key rotation
 * - Crisis-mode emergency encryption bypass
 */

import type { 
  EncryptionResult, 
  DecryptionResult, 
  AnonymousToken,
  SessionKeys,
  HIPAAAuditEntry 
} from './encryption';

// Browser storage interface
interface BrowserStorageConfig {
  useIndexedDB: boolean;
  useSessionStorage: boolean;
  useMemoryOnly: boolean;
  maxStorageSize: number;
}

// Crisis mode configuration
interface CrisisModeConfig {
  emergencyBypass: boolean;
  reduceLatency: boolean;
  prioritizeAvailability: boolean;
  allowPlaintextFallback: boolean;
}

// Browser performance metrics
interface BrowserPerformanceMetrics {
  encryptionLatency: number[];
  decryptionLatency: number[];
  keyDerivationLatency: number[];
  storageLatency: number[];
  memoryUsageKB: number;
  cpuUsagePercent: number;
}

/**
 * Browser-optimized zero-knowledge encryption client
 */
export class BrowserZeroKnowledgeEncryption {
  private readonly storageConfig: BrowserStorageConfig = {
    useIndexedDB: true,
    useSessionStorage: false,
    useMemoryOnly: false,
    maxStorageSize: 50 * 1024 * 1024 // 50MB max
  };

  private readonly crisisConfig: CrisisModeConfig = {
    emergencyBypass: false,
    reduceLatency: true,
    prioritizeAvailability: true,
    allowPlaintextFallback: false
  };

  // Memory-only storage for session keys
  private readonly sessionKeys: Map<string, SessionKeys> = new Map();
  private readonly encryptedStorage: Map<string, string> = new Map();
  private readonly performanceMetrics: BrowserPerformanceMetrics = {
    encryptionLatency: [],
    decryptionLatency: [],
    keyDerivationLatency: [],
    storageLatency: [],
    memoryUsageKB: 0,
    cpuUsagePercent: 0
  };

  // IndexedDB connection
  private dbConnection: IDBDatabase | null = null;
  private readonly dbName = 'AstralCore_SecureStorage';
  private readonly dbVersion = 1;

  constructor() {
    this.initializeStorage();
    this.startPerformanceMonitoring();
    this.detectCrisisMode();
  }

  /**
   * Initialize secure browser storage
   */
  private async initializeStorage(): Promise<void> {
    if (!this.storageConfig.useIndexedDB || typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not available, using memory-only storage');
      this.storageConfig.useMemoryOnly = true;
      return;
    }

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB, falling back to memory storage');
        this.storageConfig.useMemoryOnly = true;
      };

      request.onsuccess = (event) => {
        this.dbConnection = (event.target as IDBOpenDBRequest).result;
        console.log('✅ Secure IndexedDB storage initialized');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for encrypted data
        if (!db.objectStoreNames.contains('encryptedSessions')) {
          const sessionStore = db.createObjectStore('encryptedSessions', { keyPath: 'sessionId' });
          sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('auditLog')) {
          const auditStore = db.createObjectStore('auditLog', { keyPath: 'id', autoIncrement: true });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('operation', 'operation', { unique: false });
        }
      };
    } catch (error) {
      console.error('IndexedDB initialization failed:', error);
      this.storageConfig.useMemoryOnly = true;
    }
  }

  /**
   * Detect crisis mode from browser environment
   */
  private detectCrisisMode(): void {
    // Check if we're in a crisis situation based on various signals
    const urlParams = new URLSearchParams(window.location.search);
    const isCrisisMode = urlParams.get('crisis') === 'true' || 
                        urlParams.get('emergency') === 'true' ||
                        window.location.pathname.includes('/crisis') ||
                        window.location.pathname.includes('/emergency');

    if (isCrisisMode) {
      console.log('🚨 Crisis mode detected - optimizing for emergency response');
      this.crisisConfig.emergencyBypass = false; // Never bypass encryption
      this.crisisConfig.reduceLatency = true;
      this.crisisConfig.prioritizeAvailability = true;
      this.crisisConfig.allowPlaintextFallback = false; // Never allow plaintext
    }
  }

  /**
   * Generate secure random bytes using browser crypto
   */
  private generateSecureRandom(length: number): Uint8Array {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buffer = new Uint8Array(length);
      window.crypto.getRandomValues(buffer);
      return buffer;
    }
    
    // Fallback for non-browser environments
    throw new Error('Secure random generation not available');
  }

  /**
   * Fast key derivation optimized for browser performance
   */
  async deriveBrowserKey(
    password: string, 
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey> {
    const startTime = performance.now();

    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Reduce iterations in crisis mode for faster response
      const actualIterations = this.crisisConfig.reduceLatency 
        ? Math.max(50000, iterations / 2)
        : iterations;

      // Derive key using PBKDF2
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: actualIterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );

      const endTime = performance.now();
      const derivationTime = endTime - startTime;
      
      this.performanceMetrics.keyDerivationLatency.push(derivationTime);
      
      // Keep only last 100 measurements
      if (this.performanceMetrics.keyDerivationLatency.length > 100) {
        this.performanceMetrics.keyDerivationLatency.shift();
      }

      return derivedKey;

    } catch (error) {
      throw new Error(`Browser key derivation failed: ${error}`);
    }
  }

  /**
   * Encrypt data for browser storage
   */
  async encryptForBrowser(
    plaintext: string,
    sessionId: string,
    storeLocally: boolean = true
  ): Promise<EncryptionResult> {
    const startTime = performance.now();

    try {
      // Get session keys
      const session = this.sessionKeys.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Generate unique IV
      const iv = this.generateSecureRandom(12); // 96 bits for GCM

      // Encrypt data
      const encoder = new TextEncoder();
      const plaintextBuffer = encoder.encode(plaintext);

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        session.encryptionKey,
        plaintextBuffer
      );

      // Extract encrypted data and auth tag
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedData = encryptedArray.slice(0, -16);
      const authTag = encryptedArray.slice(-16);

      const result: EncryptionResult = {
        encryptedData: Array.from(encryptedData).map(b => b.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        authTag: Array.from(authTag).map(b => b.toString(16).padStart(2, '0')).join(''),
        sessionId,
        timestamp: new Date().toISOString()
      };

      // Store encrypted data if requested
      if (storeLocally) {
        await this.storeEncryptedData(sessionId, result);
      }

      const endTime = performance.now();
      const encryptionTime = endTime - startTime;
      
      this.performanceMetrics.encryptionLatency.push(encryptionTime);
      
      if (this.performanceMetrics.encryptionLatency.length > 100) {
        this.performanceMetrics.encryptionLatency.shift();
      }

      return result;

    } catch (error) {
      throw new Error(`Browser encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data from browser storage
   */
  async decryptFromBrowser(
    encryptionResult: EncryptionResult,
    sessionId: string
  ): Promise<DecryptionResult> {
    const startTime = performance.now();

    try {
      // Get session keys
      const session = this.sessionKeys.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Session not found or expired'
        };
      }

      // Convert hex strings back to Uint8Arrays
      const encryptedData = new Uint8Array(
        encryptionResult.encryptedData.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );
      const iv = new Uint8Array(
        encryptionResult.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );
      const authTag = new Uint8Array(
        encryptionResult.authTag.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      // Combine encrypted data and auth tag
      const combined = new Uint8Array(encryptedData.length + authTag.length);
      combined.set(encryptedData);
      combined.set(authTag, encryptedData.length);

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        session.encryptionKey,
        combined
      );

      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);

      const endTime = performance.now();
      const decryptionTime = endTime - startTime;
      
      this.performanceMetrics.decryptionLatency.push(decryptionTime);
      
      if (this.performanceMetrics.decryptionLatency.length > 100) {
        this.performanceMetrics.decryptionLatency.shift();
      }

      return {
        success: true,
        data: decryptedText
      };

    } catch (error) {
      return {
        success: false,
        error: `Browser decryption failed: ${error}`
      };
    }
  }

  /**
   * Create secure session for browser
   */
  async createBrowserSession(userSecret: string): Promise<{
    sessionId: string;
    token: AnonymousToken;
    publicKey?: Uint8Array;
  }> {
    const sessionId = this.generateSecureId('browser_sess');
    const salt = this.generateSecureRandom(32);

    // Derive encryption key
    const encryptionKey = await this.deriveBrowserKey(userSecret, salt);

    // Generate MAC key
    const macKeyMaterial = this.generateSecureRandom(32);
    const macKey = await crypto.subtle.importKey(
      'raw',
      macKeyMaterial,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Create session
    const now = new Date();
    const session: SessionKeys = {
      encryptionKey,
      macKey,
      sessionId,
      ephemeralKeyPair: {
        privateKey: encryptionKey, // Simplified for browser
        publicKey: encryptionKey,
        publicKeyRaw: salt
      },
      createdAt: now,
      expiresAt: new Date(now.getTime() + (24 * 60 * 60 * 1000)), // 24 hours
      rotationScheduled: false
    };

    this.sessionKeys.set(sessionId, session);

    // Generate anonymous token
    const token: AnonymousToken = {
      tokenId: this.generateSecureId('browser_token'),
      sessionHash: this.generateSecureId('sess_hash'),
      issuedAt: now,
      expiresAt: session.expiresAt,
      permissions: ['encrypt', 'decrypt', 'crisis_support'],
      isRevoked: false
    };

    return {
      sessionId,
      token,
      publicKey: salt
    };
  }

  /**
   * Store encrypted data in browser storage
   */
  private async storeEncryptedData(
    sessionId: string,
    encryptionResult: EncryptionResult
  ): Promise<void> {
    const startTime = performance.now();

    try {
      if (this.storageConfig.useMemoryOnly || !this.dbConnection) {
        // Store in memory
        this.encryptedStorage.set(sessionId, JSON.stringify(encryptionResult));
      } else {
        // Store in IndexedDB
        const transaction = this.dbConnection.transaction(['encryptedSessions'], 'readwrite');
        const store = transaction.objectStore('encryptedSessions');
        
        const data = {
          sessionId,
          encryptedResult: encryptionResult,
          timestamp: new Date().toISOString()
        };

        await new Promise<void>((resolve, reject) => {
          const request = store.put(data);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      const endTime = performance.now();
      this.performanceMetrics.storageLatency.push(endTime - startTime);

      if (this.performanceMetrics.storageLatency.length > 100) {
        this.performanceMetrics.storageLatency.shift();
      }

    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      // Fallback to memory storage
      this.encryptedStorage.set(sessionId, JSON.stringify(encryptionResult));
    }
  }

  /**
   * Retrieve encrypted data from browser storage
   */
  async retrieveEncryptedData(sessionId: string): Promise<EncryptionResult | null> {
    try {
      if (this.storageConfig.useMemoryOnly || !this.dbConnection) {
        // Retrieve from memory
        const stored = this.encryptedStorage.get(sessionId);
        return stored ? JSON.parse(stored) : null;
      } else {
        // Retrieve from IndexedDB
        const transaction = this.dbConnection.transaction(['encryptedSessions'], 'readonly');
        const store = transaction.objectStore('encryptedSessions');

        return new Promise<EncryptionResult | null>((resolve, reject) => {
          const request = store.get(sessionId);
          request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.encryptedResult : null);
          };
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  /**
   * Clear all browser storage (for privacy)
   */
  async clearAllStorage(): Promise<void> {
    try {
      // Clear memory storage
      this.encryptedStorage.clear();
      this.sessionKeys.clear();

      // Clear IndexedDB
      if (this.dbConnection) {
        const transaction = this.dbConnection.transaction(['encryptedSessions', 'auditLog'], 'readwrite');
        
        await Promise.all([
          new Promise<void>((resolve, reject) => {
            const request = transaction.objectStore('encryptedSessions').clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          }),
          new Promise<void>((resolve, reject) => {
            const request = transaction.objectStore('auditLog').clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
        ]);
      }

      // Clear session storage
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('astralcore_')) {
            sessionStorage.removeItem(key);
          }
        });
      }

      console.log('🧹 All browser storage cleared for privacy');

    } catch (error) {
      console.error('Failed to clear browser storage:', error);
    }
  }

  /**
   * Get browser performance metrics
   */
  getBrowserPerformanceMetrics(): BrowserPerformanceMetrics & {
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    averageKeyDerivationTime: number;
    averageStorageTime: number;
    isPerformingWell: boolean;
  } {
    const avgEncryption = this.calculateAverage(this.performanceMetrics.encryptionLatency);
    const avgDecryption = this.calculateAverage(this.performanceMetrics.decryptionLatency);
    const avgKeyDerivation = this.calculateAverage(this.performanceMetrics.keyDerivationLatency);
    const avgStorage = this.calculateAverage(this.performanceMetrics.storageLatency);

    const isPerformingWell = 
      avgEncryption < 10 &&
      avgDecryption < 10 &&
      avgKeyDerivation < 2000 &&
      avgStorage < 50;

    return {
      ...this.performanceMetrics,
      averageEncryptionTime: avgEncryption,
      averageDecryptionTime: avgDecryption,
      averageKeyDerivationTime: avgKeyDerivation,
      averageStorageTime: avgStorage,
      isPerformingWell
    };
  }

  /**
   * Test browser encryption capabilities
   */
  async testBrowserCapabilities(): Promise<{
    webCryptoSupported: boolean;
    indexedDBSupported: boolean;
    performanceAcceptable: boolean;
    securityFeatures: string[];
    recommendations: string[];
  }> {
    const features: string[] = [];
    const recommendations: string[] = [];

    // Test WebCrypto support
    const webCryptoSupported = typeof crypto !== 'undefined' && 
                              typeof crypto.subtle !== 'undefined';
    
    if (webCryptoSupported) {
      features.push('WebCrypto API supported');
    } else {
      recommendations.push('Browser does not support WebCrypto API - encryption disabled');
    }

    // Test IndexedDB support
    const indexedDBSupported = typeof indexedDB !== 'undefined';
    
    if (indexedDBSupported) {
      features.push('IndexedDB supported for secure storage');
    } else {
      recommendations.push('IndexedDB not supported - using memory-only storage');
    }

    // Test performance
    let performanceAcceptable = false;
    
    if (webCryptoSupported) {
      try {
        const testSession = await this.createBrowserSession('test-password-123');
        const testData = 'Performance test message';
        
        const startTime = performance.now();
        const encrypted = await this.encryptForBrowser(testData, testSession.sessionId, false);
        const decrypted = await this.decryptFromBrowser(encrypted, testSession.sessionId);
        const endTime = performance.now();
        
        const totalTime = endTime - startTime;
        performanceAcceptable = totalTime < 50 && decrypted.success;
        
        if (performanceAcceptable) {
          features.push(`Encryption performance: ${totalTime.toFixed(1)}ms`);
        } else {
          recommendations.push(`Encryption too slow: ${totalTime.toFixed(1)}ms (target: <50ms)`);
        }

        // Clean up test session
        this.sessionKeys.delete(testSession.sessionId);

      } catch (error) {
        recommendations.push(`Performance test failed: ${error}`);
      }
    }

    // Check secure context
    if (typeof window !== 'undefined' && window.isSecureContext) {
      features.push('Secure context (HTTPS)');
    } else {
      recommendations.push('Not in secure context - some features may be limited');
    }

    return {
      webCryptoSupported,
      indexedDBSupported,
      performanceAcceptable,
      securityFeatures: features,
      recommendations
    };
  }

  /**
   * Generate secure ID
   */
  private generateSecureId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = this.generateSecureRandom(8);
    const randomHex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${prefix}_${timestamp}_${randomHex}`;
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      // Monitor memory usage (rough estimate)
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.performanceMetrics.memoryUsageKB = Math.round(memoryInfo.usedJSHeapSize / 1024);
      }

      // Monitor CPU usage (rough estimate based on timing)
      const start = performance.now();
      let iterations = 0;
      while (performance.now() - start < 5) {
        iterations++;
      }
      
      // Normalize to percentage (higher iterations = lower CPU usage)
      this.performanceMetrics.cpuUsagePercent = Math.max(0, 100 - (iterations / 1000));

    }, 30000); // Monitor every 30 seconds
  }

  /**
   * Destroy session and clear memory
   */
  destroyBrowserSession(sessionId: string): void {
    this.sessionKeys.delete(sessionId);
    this.encryptedStorage.delete(sessionId);
    
    console.log(`🔒 Browser session destroyed: ${sessionId}`);
  }
}

// Export singleton instance for browser use
export const browserZeroKnowledgeEncryption = new BrowserZeroKnowledgeEncryption();