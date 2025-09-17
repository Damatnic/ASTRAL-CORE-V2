/**
 * HIPAA-Compliant Encrypted Audit Storage System
 * 
 * Provides secure, encrypted storage for audit logs with:
 * - AES-256-GCM encryption
 * - Key rotation capabilities
 * - Tamper detection
 * - Compression for efficient storage
 * - Backup and recovery mechanisms
 */

import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { SecurityLogger } from './logging/security-logger';
import { HIPAAAuditEvent } from './audit-logger';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface EncryptedStorageOptions {
  storageRoot: string;
  encryptionKey?: Buffer;
  compressionEnabled?: boolean;
  maxFileSize?: number;
  backupEnabled?: boolean;
  keyRotationDays?: number;
}

export interface StorageMetadata {
  version: string;
  encryptionAlgorithm: string;
  compressionAlgorithm?: string;
  keyVersion: number;
  createdAt: Date;
  lastModified: Date;
  eventCount: number;
  fileSize: number;
  checksum: string;
}

export interface EncryptedContainer {
  metadata: StorageMetadata;
  iv: Buffer;
  authTag: Buffer;
  data: Buffer;
  signature: string;
}

export class HIPAAEncryptedStorage {
  private logger: SecurityLogger;
  private storageRoot: string;
  private encryptionKey: Buffer;
  private currentKeyVersion: number = 1;
  private compressionEnabled: boolean;
  private maxFileSize: number;
  private backupEnabled: boolean;
  private keyRotationDays: number;
  
  // Storage paths
  private readonly dataPath: string;
  private readonly backupPath: string;
  private readonly keysPath: string;
  private readonly metadataPath: string;
  
  // Encryption configuration
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly HASH_ALGORITHM = 'sha512';
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly IV_LENGTH = 16;  // 128 bits
  private readonly TAG_LENGTH = 16; // 128 bits

  constructor(options: EncryptedStorageOptions) {
    this.logger = new SecurityLogger();
    this.storageRoot = options.storageRoot;
    this.compressionEnabled = options.compressionEnabled ?? true;
    this.maxFileSize = options.maxFileSize ?? 50 * 1024 * 1024; // 50MB
    this.backupEnabled = options.backupEnabled ?? true;
    this.keyRotationDays = options.keyRotationDays ?? 90;
    
    // Initialize paths
    this.dataPath = path.join(this.storageRoot, 'data');
    this.backupPath = path.join(this.storageRoot, 'backup');
    this.keysPath = path.join(this.storageRoot, 'keys');
    this.metadataPath = path.join(this.storageRoot, 'metadata');
    
    // Initialize encryption key
    this.encryptionKey = options.encryptionKey || this.loadOrGenerateKey();
    
    this.initializeStorage();
  }

  /**
   * Initialize storage directory structure
   */
  private async initializeStorage(): Promise<void> {
    try {
      const directories = [
        this.storageRoot,
        this.dataPath,
        this.backupPath,
        this.keysPath,
        this.metadataPath
      ];

      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
      }

      // Load current key version
      await this.loadKeyVersion();
      
      this.logger.info('HIPAA encrypted storage initialized', {
        storageRoot: this.storageRoot,
        compressionEnabled: this.compressionEnabled,
        keyVersion: this.currentKeyVersion
      });

    } catch (error) {
      this.logger.error('Failed to initialize encrypted storage', error as Error);
      throw error;
    }
  }

  /**
   * Store encrypted audit events
   */
  public async storeEvents(
    events: HIPAAAuditEvent[],
    filename?: string
  ): Promise<string> {
    try {
      if (events.length === 0) {
        throw new Error('No events to store');
      }

      // Generate filename if not provided
      const fileName = filename || this.generateFileName(events[0].timestamp);
      const filePath = path.join(this.dataPath, fileName);

      // Serialize events
      const eventData = JSON.stringify(events);
      let dataBuffer = Buffer.from(eventData, 'utf8');

      // Compress if enabled
      if (this.compressionEnabled) {
        dataBuffer = Buffer.from(await gzip(dataBuffer));
      }

      // Create metadata
      const metadata: StorageMetadata = {
        version: '2.0.0',
        encryptionAlgorithm: this.ENCRYPTION_ALGORITHM,
        compressionAlgorithm: this.compressionEnabled ? 'gzip' : undefined,
        keyVersion: this.currentKeyVersion,
        createdAt: new Date(),
        lastModified: new Date(),
        eventCount: events.length,
        fileSize: dataBuffer.length,
        checksum: this.calculateChecksum(dataBuffer)
      };

      // Encrypt data
      const encryptedContainer = await this.encryptData(dataBuffer, metadata);
      
      // Store encrypted container
      await this.writeEncryptedContainer(filePath, encryptedContainer);
      
      // Store metadata separately
      await this.storeMetadata(fileName, metadata);

      // Create backup if enabled
      if (this.backupEnabled) {
        await this.createBackup(fileName, encryptedContainer);
      }

      this.logger.audit('Audit events stored successfully', {
        fileName,
        eventCount: events.length,
        fileSize: dataBuffer.length,
        compressed: this.compressionEnabled,
        keyVersion: this.currentKeyVersion
      });

      return fileName;

    } catch (error) {
      this.logger.error('Failed to store audit events', error as Error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt audit events
   */
  public async retrieveEvents(filename: string): Promise<HIPAAAuditEvent[]> {
    try {
      const filePath = path.join(this.dataPath, filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`Audit file not found: ${filename}`);
      }

      // Load encrypted container
      const encryptedContainer = await this.readEncryptedContainer(filePath);
      
      // Verify integrity
      await this.verifyContainerIntegrity(encryptedContainer);
      
      // Decrypt data
      let dataBuffer = await this.decryptData(encryptedContainer);
      
      // Decompress if needed
      if (encryptedContainer.metadata.compressionAlgorithm === 'gzip') {
        dataBuffer = await gunzip(dataBuffer);
      }

      // Parse events
      const eventData = dataBuffer.toString('utf8');
      const events = JSON.parse(eventData) as HIPAAAuditEvent[];

      // Convert timestamp strings back to Date objects
      events.forEach(event => {
        event.timestamp = new Date(event.timestamp);
      });

      this.logger.audit('Audit events retrieved successfully', {
        fileName: filename,
        eventCount: events.length,
        keyVersion: encryptedContainer.metadata.keyVersion
      });

      return events;

    } catch (error) {
      this.logger.error('Failed to retrieve audit events', error as Error);
      throw error;
    }
  }

  /**
   * List available audit files
   */
  public async listAuditFiles(): Promise<Array<{
    filename: string;
    metadata: StorageMetadata;
    size: number;
    modified: Date;
  }>> {
    try {
      const files = await fs.readdir(this.dataPath);
      const auditFiles = files.filter(file => file.endsWith('.audit'));
      
      const fileInfo = await Promise.all(
        auditFiles.map(async (filename) => {
          const filePath = path.join(this.dataPath, filename);
          const stats = await fs.stat(filePath);
          const metadata = await this.loadMetadata(filename);
          
          return {
            filename,
            metadata,
            size: stats.size,
            modified: stats.mtime
          };
        })
      );

      return fileInfo.sort((a, b) => b.modified.getTime() - a.modified.getTime());

    } catch (error) {
      this.logger.error('Failed to list audit files', error as Error);
      throw error;
    }
  }

  /**
   * Verify integrity of stored audit file
   */
  public async verifyFileIntegrity(filename: string): Promise<{
    isValid: boolean;
    errors: string[];
    metadata: StorageMetadata;
  }> {
    const errors: string[] = [];
    
    try {
      const filePath = path.join(this.dataPath, filename);
      const encryptedContainer = await this.readEncryptedContainer(filePath);
      
      // Verify metadata
      const metadata = encryptedContainer.metadata;
      
      // Verify signature
      const expectedSignature = this.generateContainerSignature(encryptedContainer);
      if (encryptedContainer.signature !== expectedSignature) {
        errors.push('Container signature verification failed');
      }
      
      // Verify data integrity
      try {
        const decryptedData = await this.decryptData(encryptedContainer);
        const actualChecksum = this.calculateChecksum(decryptedData);
        
        if (actualChecksum !== metadata.checksum) {
          errors.push('Data checksum verification failed');
        }
      } catch (error) {
        errors.push(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Check if backup exists and matches
      if (this.backupEnabled) {
        try {
          const backupPath = path.join(this.backupPath, filename);
          const backupContainer = await this.readEncryptedContainer(backupPath);
          
          if (JSON.stringify(encryptedContainer) !== JSON.stringify(backupContainer)) {
            errors.push('Backup file does not match primary file');
          }
        } catch (error) {
          errors.push(`Backup verification failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        metadata
      };

    } catch (error) {
      errors.push(`File integrity check failed: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        isValid: false,
        errors,
        metadata: {} as StorageMetadata
      };
    }
  }

  /**
   * Rotate encryption keys
   */
  public async rotateEncryptionKey(): Promise<void> {
    try {
      const oldKeyVersion = this.currentKeyVersion;
      const oldKey = this.encryptionKey;
      
      // Generate new key
      this.currentKeyVersion++;
      this.encryptionKey = crypto.randomBytes(this.KEY_LENGTH);
      
      // Store new key
      await this.storeKey(this.currentKeyVersion, this.encryptionKey);
      
      // Re-encrypt all existing files with new key
      const files = await this.listAuditFiles();
      
      for (const fileInfo of files) {
        if (fileInfo.metadata.keyVersion < this.currentKeyVersion) {
          await this.reencryptFile(fileInfo.filename, oldKey, this.encryptionKey);
        }
      }
      
      this.logger.audit('Encryption key rotated successfully', {
        oldKeyVersion,
        newKeyVersion: this.currentKeyVersion,
        reencryptedFiles: files.length
      });

    } catch (error) {
      this.logger.error('Key rotation failed', error as Error);
      throw error;
    }
  }

  /**
   * Check if key rotation is needed
   */
  public async checkKeyRotationNeeded(): Promise<boolean> {
    try {
      const keyMetadata = await this.loadKeyMetadata(this.currentKeyVersion);
      if (!keyMetadata) return true;
      
      const daysSinceCreation = (Date.now() - keyMetadata.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation >= this.keyRotationDays;
      
    } catch (error) {
      this.logger.warn('Failed to check key rotation status', { error });
      return true; // Err on the side of caution
    }
  }

  /**
   * Create secure backup of audit file
   */
  public async createBackup(filename: string, container?: EncryptedContainer): Promise<void> {
    try {
      const sourcePath = path.join(this.dataPath, filename);
      const backupPath = path.join(this.backupPath, filename);
      
      if (container) {
        // Use provided container
        await this.writeEncryptedContainer(backupPath, container);
      } else {
        // Copy existing file
        const existingContainer = await this.readEncryptedContainer(sourcePath);
        await this.writeEncryptedContainer(backupPath, existingContainer);
      }
      
      this.logger.audit('Backup created successfully', { filename });

    } catch (error) {
      this.logger.error('Failed to create backup', error as Error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  public async restoreFromBackup(filename: string): Promise<void> {
    try {
      const backupPath = path.join(this.backupPath, filename);
      const dataPath = path.join(this.dataPath, filename);
      
      // Verify backup integrity first
      const backupContainer = await this.readEncryptedContainer(backupPath);
      await this.verifyContainerIntegrity(backupContainer);
      
      // Copy backup to data directory
      await this.writeEncryptedContainer(dataPath, backupContainer);
      
      this.logger.audit('File restored from backup', { filename });

    } catch (error) {
      this.logger.error('Failed to restore from backup', error as Error);
      throw error;
    }
  }

  /**
   * Cleanup old audit files based on retention policy
   */
  public async cleanupOldFiles(retentionDays: number): Promise<{
    deletedFiles: string[];
    archivedFiles: string[];
  }> {
    try {
      const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
      const files = await this.listAuditFiles();
      
      const deletedFiles: string[] = [];
      const archivedFiles: string[] = [];
      
      for (const fileInfo of files) {
        if (fileInfo.metadata.createdAt < cutoffDate) {
          // Archive before deletion
          await this.archiveFile(fileInfo.filename);
          archivedFiles.push(fileInfo.filename);
          
          // Delete from active storage
          await this.deleteFile(fileInfo.filename);
          deletedFiles.push(fileInfo.filename);
        }
      }
      
      this.logger.audit('Cleanup completed', {
        retentionDays,
        deletedFiles: deletedFiles.length,
        archivedFiles: archivedFiles.length
      });
      
      return { deletedFiles, archivedFiles };

    } catch (error) {
      this.logger.error('Cleanup failed', error as Error);
      throw error;
    }
  }

  // Private helper methods

  private async encryptData(data: Buffer, metadata: StorageMetadata): Promise<EncryptedContainer> {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    const container: EncryptedContainer = {
      metadata,
      iv,
      authTag,
      data: encrypted,
      signature: ''
    };
    
    // Generate signature for tamper detection
    container.signature = this.generateContainerSignature(container);
    
    return container;
  }

  private async decryptData(container: EncryptedContainer): Promise<Buffer> {
    // Load the correct key version
    const key = await this.loadKey(container.metadata.keyVersion);
    
    const decipher = crypto.createDecipheriv(
      this.ENCRYPTION_ALGORITHM,
      key,
      container.iv
    );
    
    decipher.setAuthTag(container.authTag);
    
    return Buffer.concat([
      decipher.update(container.data),
      decipher.final()
    ]);
  }

  private generateContainerSignature(container: Omit<EncryptedContainer, 'signature'>): string {
    const signatureData = Buffer.concat([
      Buffer.from(JSON.stringify(container.metadata)),
      container.iv,
      container.authTag,
      container.data
    ]);
    
    return crypto
      .createHmac(this.HASH_ALGORITHM, this.encryptionKey)
      .update(signatureData)
      .digest('hex');
  }

  private async verifyContainerIntegrity(container: EncryptedContainer): Promise<void> {
    const expectedSignature = this.generateContainerSignature(container);
    
    if (container.signature !== expectedSignature) {
      throw new Error('Container signature verification failed - possible tampering detected');
    }
  }

  private calculateChecksum(data: Buffer): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  private generateFileName(timestamp: Date): string {
    const dateStr = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toISOString().split('T')[1].replace(/[:.]/g, '-');
    return `audit_${dateStr}_${timeStr}.audit`;
  }

  private async writeEncryptedContainer(filePath: string, container: EncryptedContainer): Promise<void> {
    const containerData = JSON.stringify({
      metadata: container.metadata,
      iv: container.iv.toString('base64'),
      authTag: container.authTag.toString('base64'),
      data: container.data.toString('base64'),
      signature: container.signature
    });
    
    await fs.writeFile(filePath, containerData, 'utf8');
  }

  private async readEncryptedContainer(filePath: string): Promise<EncryptedContainer> {
    const containerData = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(containerData);
    
    return {
      metadata: parsed.metadata,
      iv: Buffer.from(parsed.iv, 'base64'),
      authTag: Buffer.from(parsed.authTag, 'base64'),
      data: Buffer.from(parsed.data, 'base64'),
      signature: parsed.signature
    };
  }

  private async storeMetadata(filename: string, metadata: StorageMetadata): Promise<void> {
    const metadataFile = path.join(this.metadataPath, `${filename}.meta`);
    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  }

  private async loadMetadata(filename: string): Promise<StorageMetadata> {
    const metadataFile = path.join(this.metadataPath, `${filename}.meta`);
    const data = await fs.readFile(metadataFile, 'utf8');
    const metadata = JSON.parse(data);
    
    // Convert date strings back to Date objects
    metadata.createdAt = new Date(metadata.createdAt);
    metadata.lastModified = new Date(metadata.lastModified);
    
    return metadata;
  }

  private loadOrGenerateKey(): Buffer {
    const keyPath = path.join(this.keysPath, 'current.key');
    
    try {
      // Try to load existing key
      const keyData = require('fs').readFileSync(keyPath);
      return keyData;
    } catch {
      // Generate new key
      const newKey = crypto.randomBytes(this.KEY_LENGTH);
      
      // Store it securely
      require('fs').mkdirSync(this.keysPath, { recursive: true });
      require('fs').writeFileSync(keyPath, newKey);
      require('fs').chmodSync(keyPath, 0o600); // Read/write for owner only
      
      this.logger.warn('Generated new encryption key for HIPAA audit storage');
      return newKey;
    }
  }

  private async loadKeyVersion(): Promise<void> {
    try {
      const versionFile = path.join(this.keysPath, 'version.json');
      const data = await fs.readFile(versionFile, 'utf8');
      const versionInfo = JSON.parse(data);
      this.currentKeyVersion = versionInfo.currentVersion || 1;
    } catch {
      this.currentKeyVersion = 1;
      await this.saveKeyVersion();
    }
  }

  private async saveKeyVersion(): Promise<void> {
    const versionFile = path.join(this.keysPath, 'version.json');
    const versionInfo = {
      currentVersion: this.currentKeyVersion,
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(versionFile, JSON.stringify(versionInfo, null, 2));
  }

  private async storeKey(version: number, key: Buffer): Promise<void> {
    const keyFile = path.join(this.keysPath, `key_v${version}.key`);
    const keyMetaFile = path.join(this.keysPath, `key_v${version}.meta`);
    
    await fs.writeFile(keyFile, key);
    
    const metadata = {
      version,
      createdAt: new Date(),
      algorithm: this.ENCRYPTION_ALGORITHM,
      keyLength: key.length
    };
    
    await fs.writeFile(keyMetaFile, JSON.stringify(metadata, null, 2));
    await this.saveKeyVersion();
  }

  private async loadKey(version: number): Promise<Buffer> {
    if (version === this.currentKeyVersion) {
      return this.encryptionKey;
    }
    
    const keyFile = path.join(this.keysPath, `key_v${version}.key`);
    return await fs.readFile(keyFile);
  }

  private async loadKeyMetadata(version: number): Promise<any> {
    const keyMetaFile = path.join(this.keysPath, `key_v${version}.meta`);
    
    try {
      const data = await fs.readFile(keyMetaFile, 'utf8');
      const metadata = JSON.parse(data);
      metadata.createdAt = new Date(metadata.createdAt);
      return metadata;
    } catch {
      return null;
    }
  }

  private async reencryptFile(filename: string, oldKey: Buffer, newKey: Buffer): Promise<void> {
    const filePath = path.join(this.dataPath, filename);
    
    // Read with old key
    const originalEncryptionKey = this.encryptionKey;
    this.encryptionKey = oldKey;
    
    const container = await this.readEncryptedContainer(filePath);
    const decryptedData = await this.decryptData(container);
    
    // Re-encrypt with new key
    this.encryptionKey = newKey;
    container.metadata.keyVersion = this.currentKeyVersion;
    container.metadata.lastModified = new Date();
    
    const newContainer = await this.encryptData(decryptedData, container.metadata);
    await this.writeEncryptedContainer(filePath, newContainer);
    
    // Restore current key
    this.encryptionKey = originalEncryptionKey;
  }

  private async archiveFile(filename: string): Promise<void> {
    const archivePath = path.join(this.storageRoot, 'archive');
    await fs.mkdir(archivePath, { recursive: true });
    
    const sourcePath = path.join(this.dataPath, filename);
    const destPath = path.join(archivePath, filename);
    
    await fs.copyFile(sourcePath, destPath);
  }

  private async deleteFile(filename: string): Promise<void> {
    const dataFile = path.join(this.dataPath, filename);
    const backupFile = path.join(this.backupPath, filename);
    const metadataFile = path.join(this.metadataPath, `${filename}.meta`);
    
    const filesToDelete = [dataFile, backupFile, metadataFile];
    
    for (const file of filesToDelete) {
      try {
        await fs.unlink(file);
      } catch {
        // File might not exist, continue
      }
    }
  }
}

export default HIPAAEncryptedStorage;