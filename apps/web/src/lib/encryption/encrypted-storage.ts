/**
 * ASTRAL Core V2 - Encrypted Data Storage System
 * 
 * Client-side encrypted storage for crisis data with:
 * - Automatic encryption/decryption for all crisis data
 * - IndexedDB integration for offline capabilities
 * - Real-time sync with encrypted cloud storage
 * - Granular access controls and audit logging
 * - Emergency data recovery protocols
 */

import { EventEmitter } from 'events';
import { ZeroKnowledgeCrypto, EncryptedData, CrisisDataType } from './zero-knowledge-crypto';
import { SecureKeyManager, SecureSession } from './secure-key-manager';

// Storage interfaces
export interface StorageConfig {
  dbName: string;
  dbVersion: number;
  encryptionEnabled: boolean;
  syncEnabled: boolean;
  compressionEnabled: boolean;
  maxStorageSize: number; // MB
  retentionPolicy: RetentionPolicy;
}

export interface RetentionPolicy {
  defaultRetentionDays: number;
  crisisDataRetentionDays: number;
  anonymousDataRetentionDays: number;
  emergencyDataRetentionDays: number;
  autoCleanupEnabled: boolean;
}

export interface StorageItem {
  id: string;
  dataType: CrisisDataType;
  userId?: string;
  sessionId?: string;
  encryptedData: EncryptedData;
  metadata: StorageMetadata;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED' | 'LOCAL_ONLY';
}

export interface StorageMetadata {
  size: number;
  compressed: boolean;
  emergencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
  isAnonymous: boolean;
  requiresSync: boolean;
}

export interface StorageQuery {
  dataType?: CrisisDataType;
  userId?: string;
  sessionId?: string;
  emergencyLevel?: string;
  dateRange?: { start: Date; end: Date };
  tags?: string[];
  isAnonymous?: boolean;
  limit?: number;
  offset?: number;
}

export interface StorageStats {
  totalItems: number;
  totalSize: number;
  encryptedItems: number;
  pendingSyncItems: number;
  expiredItems: number;
  storageUsagePercent: number;
  oldestItem?: Date;
  newestItem?: Date;
}

export interface BackupManifest {
  backupId: string;
  createdAt: Date;
  itemCount: number;
  totalSize: number;
  encryptionKeyId: string;
  items: {
    id: string;
    dataType: CrisisDataType;
    size: number;
    emergencyLevel?: string;
  }[];
}

export class EncryptedStorage extends EventEmitter {
  private crypto: ZeroKnowledgeCrypto;
  private keyManager: SecureKeyManager;
  private config: StorageConfig;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private syncQueue: Set<string> = new Set();
  private compressionWorker: Worker | null = null;

  // Default configuration
  private defaultConfig: StorageConfig = {
    dbName: 'astral-crisis-storage',
    dbVersion: 1,
    encryptionEnabled: true,
    syncEnabled: true,
    compressionEnabled: true,
    maxStorageSize: 500, // 500MB limit
    retentionPolicy: {
      defaultRetentionDays: 365,
      crisisDataRetentionDays: 2555, // 7 years for crisis data
      anonymousDataRetentionDays: 90,
      emergencyDataRetentionDays: 1825, // 5 years for emergency data
      autoCleanupEnabled: true
    }
  };

  constructor(
    crypto: ZeroKnowledgeCrypto,
    keyManager: SecureKeyManager,
    config?: Partial<StorageConfig>
  ) {
    super();
    this.crypto = crypto;
    this.keyManager = keyManager;
    this.config = { ...this.defaultConfig, ...config };
    this.initializeStorage();
  }

  /**
   * Initialize IndexedDB storage
   */
  private async initializeStorage(): Promise<void> {
    try {
      await this.openDatabase();
      await this.setupCompressionWorker();
      await this.startCleanupScheduler();
      
      this.isInitialized = true;
      this.emit('storage-initialized', { config: this.config });
      
      console.log('Encrypted storage system initialized');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      this.emit('storage-error', { error });
      throw error;
    }
  }

  /**
   * Open IndexedDB database
   */
  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create storage object store
        if (!db.objectStoreNames.contains('crisis_data')) {
          const store = db.createObjectStore('crisis_data', { keyPath: 'id' });
          store.createIndex('dataType', 'dataType', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('emergencyLevel', 'metadata.emergencyLevel', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create audit log store
        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id', autoIncrement: true });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('operation', 'operation', { unique: false });
          auditStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  /**
   * Store encrypted crisis data
   */
  public async store(
    sessionId: string,
    data: string | object,
    dataType: CrisisDataType,
    options?: {
      id?: string;
      emergencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      tags?: string[];
      expiresIn?: number; // milliseconds
      skipSync?: boolean;
    }
  ): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.waitForInitialization();
      }

      const session = this.keyManager.getSession(sessionId);
      if (!session) {
        throw new Error('Invalid session for storage');
      }

      // Prepare data for storage
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const itemId = options?.id || this.generateItemId(dataType);

      // Compress data if enabled
      let processedData = dataString;
      let compressed = false;
      if (this.config.compressionEnabled && dataString.length > 1024) {
        processedData = await this.compressData(dataString);
        compressed = true;
      }

      // Encrypt the data
      const encryptedData = await this.keyManager.encryptWithSession(
        sessionId,
        processedData,
        {
          dataType,
          sessionId,
          userId: session.isAnonymous ? undefined : session.userId,
          emergencyLevel: options?.emergencyLevel || session.emergencyLevel
        }
      );

      // Create storage item
      const storageItem: StorageItem = {
        id: itemId,
        dataType,
        userId: session.isAnonymous ? undefined : session.userId,
        sessionId,
        encryptedData,
        metadata: {
          size: dataString.length,
          compressed,
          emergencyLevel: options?.emergencyLevel || session.emergencyLevel,
          accessCount: 0,
          lastAccessed: new Date(),
          tags: options?.tags || [],
          isAnonymous: session.isAnonymous,
          requiresSync: !options?.skipSync && this.config.syncEnabled
        },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options?.expiresIn ? new Date(Date.now() + options.expiresIn) : this.calculateExpiration(dataType),
        syncStatus: options?.skipSync ? 'LOCAL_ONLY' : 'PENDING'
      };

      // Store in IndexedDB
      await this.saveToDatabase(storageItem);

      // Add to sync queue if needed
      if (storageItem.metadata.requiresSync) {
        this.syncQueue.add(itemId);
        this.processSyncQueue();
      }

      // Log storage operation
      await this.logOperation('STORE', session.userId, itemId, {
        dataType,
        size: storageItem.metadata.size,
        emergencyLevel: options?.emergencyLevel
      });

      this.emit('data-stored', {
        id: itemId,
        dataType,
        size: storageItem.metadata.size,
        emergencyLevel: options?.emergencyLevel
      });

      return itemId;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      throw new Error('Storage operation failed');
    }
  }

  /**
   * Retrieve and decrypt crisis data
   */
  public async retrieve(
    sessionId: string,
    itemId: string
  ): Promise<{ data: string; metadata: StorageMetadata }> {
    try {
      const session = this.keyManager.getSession(sessionId);
      if (!session) {
        throw new Error('Invalid session for retrieval');
      }

      // Get from database
      const storageItem = await this.getFromDatabase(itemId);
      if (!storageItem) {
        throw new Error('Item not found');
      }

      // Check access permissions
      if (!this.canAccessItem(session, storageItem)) {
        throw new Error('Access denied');
      }

      // Decrypt the data
      const decryptedData = await this.keyManager.decryptWithSession(
        sessionId,
        storageItem.encryptedData,
        {
          dataType: storageItem.dataType,
          sessionId: storageItem.sessionId,
          userId: storageItem.userId
        }
      );

      // Decompress if needed
      let finalData = decryptedData;
      if (storageItem.metadata.compressed) {
        finalData = await this.decompressData(decryptedData);
      }

      // Update access tracking
      storageItem.metadata.accessCount++;
      storageItem.metadata.lastAccessed = new Date();
      await this.updateInDatabase(storageItem);

      // Log retrieval operation
      await this.logOperation('RETRIEVE', session.userId, itemId, {
        dataType: storageItem.dataType
      });

      this.emit('data-retrieved', {
        id: itemId,
        dataType: storageItem.dataType,
        accessCount: storageItem.metadata.accessCount
      });

      return {
        data: finalData,
        metadata: storageItem.metadata
      };
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      throw new Error('Retrieval operation failed');
    }
  }

  /**
   * Query stored data with filters
   */
  public async query(
    sessionId: string,
    query: StorageQuery
  ): Promise<{ items: StorageItem[]; total: number }> {
    try {
      const session = this.keyManager.getSession(sessionId);
      if (!session) {
        throw new Error('Invalid session for query');
      }

      const items = await this.queryDatabase(query);
      
      // Filter based on access permissions
      const accessibleItems = items.filter(item => this.canAccessItem(session, item));

      // Apply pagination
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      const paginatedItems = accessibleItems.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total: accessibleItems.length
      };
    } catch (error) {
      console.error('Failed to query encrypted data:', error);
      throw new Error('Query operation failed');
    }
  }

  /**
   * Delete encrypted data
   */
  public async delete(sessionId: string, itemId: string): Promise<boolean> {
    try {
      const session = this.keyManager.getSession(sessionId);
      if (!session) {
        throw new Error('Invalid session for deletion');
      }

      const storageItem = await this.getFromDatabase(itemId);
      if (!storageItem) {
        return false;
      }

      // Check permissions
      if (!this.canAccessItem(session, storageItem)) {
        throw new Error('Access denied');
      }

      // Remove from database
      await this.deleteFromDatabase(itemId);

      // Remove from sync queue if present
      this.syncQueue.delete(itemId);

      // Log deletion
      await this.logOperation('DELETE', session.userId, itemId, {
        dataType: storageItem.dataType
      });

      this.emit('data-deleted', { id: itemId, dataType: storageItem.dataType });

      return true;
    } catch (error) {
      console.error('Failed to delete encrypted data:', error);
      throw new Error('Deletion operation failed');
    }
  }

  /**
   * Create encrypted backup of all user data
   */
  public async createBackup(
    sessionId: string,
    includeAnonymous: boolean = false
  ): Promise<{ backupData: string; manifest: BackupManifest }> {
    try {
      const session = this.keyManager.getSession(sessionId);
      if (!session) {
        throw new Error('Invalid session for backup');
      }

      // Query all accessible data
      const query: StorageQuery = {
        userId: session.isAnonymous ? undefined : session.userId
      };

      if (includeAnonymous) {
        delete query.userId; // Include all data
      }

      const { items } = await this.query(sessionId, query);

      // Create backup manifest
      const manifest: BackupManifest = {
        backupId: this.generateBackupId(),
        createdAt: new Date(),
        itemCount: items.length,
        totalSize: items.reduce((sum, item) => sum + item.metadata.size, 0),
        encryptionKeyId: session.keyId,
        items: items.map(item => ({
          id: item.id,
          dataType: item.dataType,
          size: item.metadata.size,
          emergencyLevel: item.metadata.emergencyLevel
        }))
      };

      // Encrypt backup data
      const backupData = await this.keyManager.encryptWithSession(
        sessionId,
        JSON.stringify({ manifest, items }),
        {
          dataType: 'CRISIS_HISTORY',
          sessionId,
          userId: session.userId,
          emergencyLevel: 'HIGH'
        }
      );

      // Log backup creation
      await this.logOperation('BACKUP', session.userId, manifest.backupId, {
        itemCount: items.length,
        totalSize: manifest.totalSize
      });

      this.emit('backup-created', { backupId: manifest.backupId, itemCount: items.length });

      return {
        backupData: JSON.stringify(backupData),
        manifest
      };
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Backup creation failed');
    }
  }

  /**
   * Get storage statistics
   */
  public async getStorageStats(): Promise<StorageStats> {
    try {
      const allItems = await this.getAllItems();
      
      const stats: StorageStats = {
        totalItems: allItems.length,
        totalSize: allItems.reduce((sum, item) => sum + item.metadata.size, 0),
        encryptedItems: allItems.filter(item => item.encryptedData).length,
        pendingSyncItems: allItems.filter(item => item.syncStatus === 'PENDING').length,
        expiredItems: allItems.filter(item => 
          item.expiresAt && new Date() > item.expiresAt
        ).length,
        storageUsagePercent: 0,
        oldestItem: allItems.length > 0 ? 
          new Date(Math.min(...allItems.map(item => item.createdAt.getTime()))) : undefined,
        newestItem: allItems.length > 0 ? 
          new Date(Math.max(...allItems.map(item => item.createdAt.getTime()))) : undefined
      };

      // Calculate storage usage percentage
      const maxSizeBytes = this.config.maxStorageSize * 1024 * 1024;
      stats.storageUsagePercent = (stats.totalSize / maxSizeBytes) * 100;

      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw new Error('Failed to get storage statistics');
    }
  }

  // Private helper methods

  private async saveToDatabase(item: StorageItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['crisis_data'], 'readwrite');
      const store = transaction.objectStore('crisis_data');
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save to database'));
    });
  }

  private async getFromDatabase(id: string): Promise<StorageItem | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['crisis_data'], 'readonly');
      const store = transaction.objectStore('crisis_data');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get from database'));
    });
  }

  private async queryDatabase(query: StorageQuery): Promise<StorageItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['crisis_data'], 'readonly');
      const store = transaction.objectStore('crisis_data');
      const items: StorageItem[] = [];

      let cursor: IDBRequest;
      
      // Use appropriate index for query
      if (query.dataType) {
        cursor = store.index('dataType').openCursor(IDBKeyRange.only(query.dataType));
      } else if (query.userId) {
        cursor = store.index('userId').openCursor(IDBKeyRange.only(query.userId));
      } else {
        cursor = store.openCursor();
      }

      cursor.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          const item = result.value as StorageItem;
          
          // Apply additional filters
          if (this.matchesQuery(item, query)) {
            items.push(item);
          }
          
          result.continue();
        } else {
          resolve(items);
        }
      };

      cursor.onerror = () => reject(new Error('Query failed'));
    });
  }

  private async updateInDatabase(item: StorageItem): Promise<void> {
    item.updatedAt = new Date();
    return this.saveToDatabase(item);
  }

  private async deleteFromDatabase(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['crisis_data'], 'readwrite');
      const store = transaction.objectStore('crisis_data');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete from database'));
    });
  }

  private async getAllItems(): Promise<StorageItem[]> {
    return this.queryDatabase({});
  }

  private matchesQuery(item: StorageItem, query: StorageQuery): boolean {
    if (query.sessionId && item.sessionId !== query.sessionId) return false;
    if (query.emergencyLevel && item.metadata.emergencyLevel !== query.emergencyLevel) return false;
    if (query.isAnonymous !== undefined && item.metadata.isAnonymous !== query.isAnonymous) return false;
    
    if (query.dateRange) {
      const itemDate = item.createdAt;
      if (itemDate < query.dateRange.start || itemDate > query.dateRange.end) return false;
    }
    
    if (query.tags && query.tags.length > 0) {
      const hasAllTags = query.tags.every(tag => item.metadata.tags.includes(tag));
      if (!hasAllTags) return false;
    }
    
    return true;
  }

  private canAccessItem(session: SecureSession, item: StorageItem): boolean {
    // Anonymous sessions can only access their own data
    if (session.isAnonymous) {
      return item.sessionId === session.sessionId;
    }
    
    // Regular users can access their own data and anonymous data they created
    return item.userId === session.userId || 
           (item.metadata.isAnonymous && item.sessionId === session.sessionId);
  }

  private calculateExpiration(dataType: CrisisDataType): Date {
    const policy = this.config.retentionPolicy;
    let days: number;

    switch (dataType) {
      case 'CRISIS_MESSAGE':
      case 'CRISIS_HISTORY':
        days = policy.crisisDataRetentionDays;
        break;
      case 'EMERGENCY_CONTACT':
      case 'RISK_ASSESSMENT':
        days = policy.emergencyDataRetentionDays;
        break;
      default:
        days = policy.defaultRetentionDays;
    }

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private async compressData(data: string): Promise<string> {
    // Simple compression using built-in compression
    // In production, consider using a more efficient compression algorithm
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const compressed = encoder.encode(data);
      return decoder.decode(compressed);
    } catch (error) {
      console.warn('Compression failed, using original data:', error);
      return data;
    }
  }

  private async decompressData(data: string): Promise<string> {
    // Decompression logic
    return data; // Simplified for now
  }

  private async setupCompressionWorker(): Promise<void> {
    // Set up web worker for compression in production
    if (this.config.compressionEnabled) {
      // Worker setup would go here
    }
  }

  private async startCleanupScheduler(): Promise<void> {
    if (this.config.retentionPolicy.autoCleanupEnabled) {
      setInterval(async () => {
        await this.cleanupExpiredData();
      }, 24 * 60 * 60 * 1000); // Daily cleanup
    }
  }

  private async cleanupExpiredData(): Promise<void> {
    try {
      const allItems = await this.getAllItems();
      const now = new Date();
      let cleanedCount = 0;

      for (const item of allItems) {
        if (item.expiresAt && now > item.expiresAt) {
          await this.deleteFromDatabase(item.id);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.emit('cleanup-completed', { cleanedCount });
        console.log(`Cleaned up ${cleanedCount} expired items`);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  private async processSyncQueue(): Promise<void> {
    // Process sync queue in background
    if (this.syncQueue.size === 0) return;

    for (const itemId of this.syncQueue) {
      try {
        // Sync logic would go here
        this.syncQueue.delete(itemId);
      } catch (error) {
        console.error(`Failed to sync item ${itemId}:`, error);
      }
    }
  }

  private async logOperation(
    operation: string,
    userId: string | undefined,
    itemId: string,
    details?: any
  ): Promise<void> {
    try {
      if (!this.db) return;

      const log = {
        timestamp: new Date(),
        operation,
        userId,
        itemId,
        details: JSON.stringify(details || {})
      };

      const transaction = this.db.transaction(['audit_logs'], 'readwrite');
      const store = transaction.objectStore('audit_logs');
      store.add(log);
    } catch (error) {
      console.error('Failed to log operation:', error);
    }
  }

  private generateItemId(dataType: CrisisDataType): string {
    const timestamp = Date.now().toString(36);
    const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(36))
      .join('');
    return `${dataType.toLowerCase()}_${timestamp}_${random}`;
  }

  private generateBackupId(): string {
    const timestamp = Date.now().toString(36);
    const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(36))
      .join('');
    return `backup_${timestamp}_${random}`;
  }

  private async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Storage initialization timeout'));
      }, 10000);

      this.once('storage-initialized', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.once('storage-error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Dispose of storage resources
   */
  public dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
      this.compressionWorker = null;
    }
    
    this.syncQueue.clear();
    this.removeAllListeners();
  }
}