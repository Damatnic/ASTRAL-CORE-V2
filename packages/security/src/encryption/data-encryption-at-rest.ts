/**
 * Data Encryption at Rest Service
 * HIPAA-compliant encryption for stored PHI/PII data
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { EncryptionService } from './encryption-service';
import { SecurityLogger } from '../logging/security-logger';

export interface EncryptionConfig {
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
  saltLength?: number;
  iterations?: number;
  encryptionScope?: 'field' | 'document' | 'file';
  keyRotationInterval?: number;
  backupKeys?: boolean;
}

export interface EncryptedDocument {
  _id?: string;
  _encrypted: boolean;
  _encryptionVersion: number;
  _encryptedFields?: string[];
  _iv?: string;
  _authTag?: string;
  [key: string]: any;
}

export class DataEncryptionAtRest {
  private encryptionService: EncryptionService;
  private logger: SecurityLogger;
  private config: Required<EncryptionConfig>;
  private keyStore: Map<string, Buffer> = new Map();
  private currentKeyVersion: number = 1;
  private sensitiveFields: Set<string>;

  constructor(config: EncryptionConfig = {}) {
    this.encryptionService = new EncryptionService();
    this.logger = new SecurityLogger();
    this.config = this.initializeConfig(config);
    this.sensitiveFields = this.initializeSensitiveFields();
    this.initializeKeyRotation();
  }

  /**
   * Initialize encryption configuration
   */
  private initializeConfig(config: EncryptionConfig): Required<EncryptionConfig> {
    return {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      saltLength: 64,
      iterations: 100000,
      encryptionScope: 'field',
      keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
      backupKeys: true,
      ...config
    };
  }

  /**
   * Initialize sensitive fields that require encryption
   */
  private initializeSensitiveFields(): Set<string> {
    return new Set([
      // PHI fields
      'ssn',
      'socialSecurityNumber',
      'dateOfBirth',
      'dob',
      'medicalRecordNumber',
      'mrn',
      'diagnosis',
      'treatment',
      'medication',
      'medications',
      'allergies',
      'conditions',
      'procedures',
      'labResults',
      'vitalSigns',
      'mentalHealthNotes',
      'therapyNotes',
      'psychiatricHistory',
      
      // PII fields
      'email',
      'phone',
      'phoneNumber',
      'address',
      'streetAddress',
      'city',
      'state',
      'zipCode',
      'postalCode',
      'creditCard',
      'creditCardNumber',
      'cvv',
      'bankAccount',
      'bankAccountNumber',
      'routingNumber',
      'driversLicense',
      'passport',
      'taxId',
      
      // Mental health specific
      'sessionNotes',
      'assessmentResults',
      'treatmentPlan',
      'progressNotes',
      'dischargeNotes',
      'suicideRiskAssessment',
      'substanceUseHistory',
      'traumaHistory',
      'familyHistory',
      'psychometricResults'
    ]);
  }

  /**
   * Encrypt document/record before storage
   */
  public async encryptDocument(document: any): Promise<EncryptedDocument> {
    try {
      const encrypted: EncryptedDocument = {
        ...document,
        _encrypted: true,
        _encryptionVersion: this.currentKeyVersion,
        _encryptedFields: []
      };

      if (this.config.encryptionScope === 'document') {
        // Encrypt entire document
        const plaintext = JSON.stringify(document);
        const encryptedData = this.encryptionService.encryptData(plaintext);
        
        return {
          _id: document._id || document.id,
          _encrypted: true,
          _encryptionVersion: this.currentKeyVersion,
          _data: encryptedData
        };
      } else {
        // Encrypt individual fields
        for (const [key, value] of Object.entries(document)) {
          if (this.shouldEncryptField(key) && value !== null && value !== undefined) {
            encrypted[key] = this.encryptionService.encryptField(value, key);
            encrypted._encryptedFields!.push(key);
          }
        }
      }

      this.logger.logDataAccess(
        document.userId || 'system',
        'document',
        'encrypt',
        { documentId: document._id || document.id }
      );

      return encrypted;
    } catch (error) {
      this.logger.error('Document encryption failed', error as Error);
      throw error;
    }
  }

  /**
   * Decrypt document/record after retrieval
   */
  public async decryptDocument(encrypted: EncryptedDocument): Promise<any> {
    try {
      if (!encrypted._encrypted) {
        return encrypted;
      }

      let decrypted: any;

      if (encrypted._data) {
        // Decrypt entire document
        const decryptedData = this.encryptionService.decryptData(encrypted._data);
        decrypted = JSON.parse(decryptedData);
      } else {
        // Decrypt individual fields
        decrypted = { ...encrypted };
        delete decrypted._encrypted;
        delete decrypted._encryptionVersion;
        delete decrypted._encryptedFields;

        if (encrypted._encryptedFields) {
          for (const field of encrypted._encryptedFields) {
            if (encrypted[field]) {
              decrypted[field] = this.encryptionService.decryptField(
                encrypted[field],
                field
              );
            }
          }
        }
      }

      this.logger.logDataAccess(
        decrypted.userId || 'system',
        'document',
        'decrypt',
        { documentId: decrypted._id || decrypted.id }
      );

      return decrypted;
    } catch (error) {
      this.logger.error('Document decryption failed', error as Error);
      throw error;
    }
  }

  /**
   * Encrypt file before storage
   */
  public async encryptFile(filePath: string, outputPath?: string): Promise<string> {
    try {
      const input = fs.readFileSync(filePath);
      const encrypted = this.encryptionService.encryptData(input.toString('base64'));
      
      const encryptedPath = outputPath || `${filePath}.encrypted`;
      fs.writeFileSync(encryptedPath, JSON.stringify({
        ...encrypted,
        originalName: path.basename(filePath),
        encryptionVersion: this.currentKeyVersion,
        timestamp: new Date().toISOString()
      }));

      // Securely delete original file if requested
      if (outputPath === filePath) {
        this.secureDelete(filePath);
      }

      this.logger.info('File encrypted', {
        originalPath: filePath,
        encryptedPath
      });

      return encryptedPath;
    } catch (error) {
      this.logger.error('File encryption failed', error as Error);
      throw error;
    }
  }

  /**
   * Decrypt file after retrieval
   */
  public async decryptFile(encryptedPath: string, outputPath?: string): Promise<string> {
    try {
      const encryptedData = JSON.parse(fs.readFileSync(encryptedPath, 'utf8'));
      const decrypted = this.encryptionService.decryptData(encryptedData);
      
      const decryptedPath = outputPath || encryptedPath.replace('.encrypted', '');
      fs.writeFileSync(decryptedPath, Buffer.from(decrypted, 'base64'));

      this.logger.info('File decrypted', {
        encryptedPath,
        decryptedPath
      });

      return decryptedPath;
    } catch (error) {
      this.logger.error('File decryption failed', error as Error);
      throw error;
    }
  }

  /**
   * Check if field should be encrypted
   */
  private shouldEncryptField(fieldName: string): boolean {
    // Check exact match
    if (this.sensitiveFields.has(fieldName)) {
      return true;
    }

    // Check nested fields
    const parts = fieldName.split('.');
    for (let i = parts.length; i > 0; i--) {
      const partial = parts.slice(0, i).join('.');
      if (this.sensitiveFields.has(partial)) {
        return true;
      }
    }

    // Check patterns
    const lowerField = fieldName.toLowerCase();
    return (
      lowerField.includes('password') ||
      lowerField.includes('secret') ||
      lowerField.includes('token') ||
      lowerField.includes('key') ||
      lowerField.includes('ssn') ||
      lowerField.includes('credit') ||
      lowerField.includes('medical') ||
      lowerField.includes('health') ||
      lowerField.includes('therapy') ||
      lowerField.includes('psychiatric')
    );
  }

  /**
   * Add custom sensitive field
   */
  public addSensitiveField(fieldName: string): void {
    this.sensitiveFields.add(fieldName);
    this.logger.info('Sensitive field added', { fieldName });
  }

  /**
   * Remove sensitive field
   */
  public removeSensitiveField(fieldName: string): void {
    this.sensitiveFields.delete(fieldName);
    this.logger.info('Sensitive field removed', { fieldName });
  }

  /**
   * Bulk encrypt documents
   */
  public async bulkEncrypt(documents: any[]): Promise<EncryptedDocument[]> {
    const encrypted: EncryptedDocument[] = [];
    
    for (const doc of documents) {
      try {
        encrypted.push(await this.encryptDocument(doc));
      } catch (error) {
        this.logger.error('Bulk encryption failed for document', error as Error, {
          documentId: doc._id || doc.id
        });
      }
    }

    return encrypted;
  }

  /**
   * Bulk decrypt documents
   */
  public async bulkDecrypt(documents: EncryptedDocument[]): Promise<any[]> {
    const decrypted: any[] = [];
    
    for (const doc of documents) {
      try {
        decrypted.push(await this.decryptDocument(doc));
      } catch (error) {
        this.logger.error('Bulk decryption failed for document', error as Error, {
          documentId: doc._id || doc.id
        });
      }
    }

    return decrypted;
  }

  /**
   * Initialize key rotation
   */
  private initializeKeyRotation(): void {
    if (this.config.keyRotationInterval > 0) {
      setInterval(() => {
        this.rotateEncryptionKeys();
      }, this.config.keyRotationInterval);
    }
  }

  /**
   * Rotate encryption keys
   */
  public async rotateEncryptionKeys(): Promise<void> {
    try {
      const newVersion = this.currentKeyVersion + 1;
      
      // Backup current keys if enabled
      if (this.config.backupKeys) {
        await this.backupKeys();
      }

      // Generate new keys
      const newKey = crypto.randomBytes(this.config.keyLength);
      this.keyStore.set(`v${newVersion}`, newKey);
      
      // Update version
      this.currentKeyVersion = newVersion;

      this.logger.info('Encryption keys rotated', {
        newVersion,
        timestamp: new Date().toISOString()
      });

      // Re-encrypt existing data with new keys
      // This would typically be done as a background job
      this.emit('keys-rotated', { version: newVersion });
    } catch (error) {
      this.logger.error('Key rotation failed', error as Error);
      throw error;
    }
  }

  /**
   * Backup encryption keys
   */
  private async backupKeys(): Promise<void> {
    const backup = {
      version: this.currentKeyVersion,
      timestamp: new Date().toISOString(),
      keys: Array.from(this.keyStore.entries()).map(([version, key]) => ({
        version,
        key: key.toString('base64')
      }))
    };

    // Store backup securely (implement based on your infrastructure)
    const backupPath = path.join(
      process.cwd(),
      'keys',
      `backup-${Date.now()}.json`
    );

    // Ensure directory exists
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Encrypt backup before storing
    const encryptedBackup = this.encryptionService.encryptData(
      JSON.stringify(backup)
    );

    fs.writeFileSync(backupPath, JSON.stringify(encryptedBackup), {
      mode: 0o600 // Read/write for owner only
    });

    this.logger.info('Keys backed up', { backupPath });
  }

  /**
   * Restore keys from backup
   */
  public async restoreKeys(backupPath: string): Promise<void> {
    try {
      const encryptedBackup = JSON.parse(
        fs.readFileSync(backupPath, 'utf8')
      );

      const backup = JSON.parse(
        this.encryptionService.decryptData(encryptedBackup)
      );

      // Restore keys
      this.keyStore.clear();
      backup.keys.forEach((item: any) => {
        this.keyStore.set(item.version, Buffer.from(item.key, 'base64'));
      });

      this.currentKeyVersion = backup.version;

      this.logger.info('Keys restored from backup', {
        version: backup.version,
        timestamp: backup.timestamp
      });
    } catch (error) {
      this.logger.error('Key restoration failed', error as Error);
      throw error;
    }
  }

  /**
   * Securely delete file
   */
  private secureDelete(filePath: string): void {
    try {
      const size = fs.statSync(filePath).size;
      const buffer = crypto.randomBytes(size);
      
      // Overwrite with random data multiple times
      for (let i = 0; i < 3; i++) {
        fs.writeFileSync(filePath, buffer);
      }

      // Delete file
      fs.unlinkSync(filePath);

      this.logger.info('File securely deleted', { filePath });
    } catch (error) {
      this.logger.error('Secure delete failed', error as Error);
    }
  }

  /**
   * Get encryption metrics
   */
  public getMetrics(): any {
    return {
      currentKeyVersion: this.currentKeyVersion,
      sensitiveFieldsCount: this.sensitiveFields.size,
      keyStoreSize: this.keyStore.size,
      encryptionScope: this.config.encryptionScope,
      algorithm: this.config.algorithm
    };
  }

  /**
   * EventEmitter functionality for key rotation events
   */
  private emit(event: string, data: any): void {
    // Implement event emission if needed
    // This would typically integrate with your event system
  }
}