/**
 * End-to-End Encryption Service
 * HIPAA-compliant encryption for PHI/PII data
 * Implements AES-256-GCM encryption with key management
 */
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import CryptoJS from 'crypto-js';
export class EncryptionService {
    static ALGORITHM = 'aes-256-gcm';
    static KEY_LENGTH = 32; // 256 bits
    static IV_LENGTH = 16; // 128 bits
    static SALT_LENGTH = 64; // 512 bits
    static TAG_LENGTH = 16; // 128 bits
    static PBKDF2_ITERATIONS = 100000;
    static RSA_KEY_SIZE = 4096;
    masterKey;
    keyCache = new Map();
    constructor() {
        // Initialize master key from environment or generate new one
        this.masterKey = this.initializeMasterKey();
    }
    /**
     * Initialize master key for encryption
     */
    initializeMasterKey() {
        const envKey = process.env.ENCRYPTION_MASTER_KEY;
        if (envKey) {
            // Decode base64 encoded key from environment
            return Buffer.from(envKey, 'base64');
        }
        else {
            // Generate new master key (should be stored securely)
            const newKey = crypto.randomBytes(EncryptionService.KEY_LENGTH);
            console.warn('Generated new master key. Store this securely:', newKey.toString('base64'));
            return newKey;
        }
    }
    /**
     * Encrypt sensitive data (PHI/PII)
     */
    encryptData(plaintext, additionalData) {
        try {
            // Generate random salt and IV
            const salt = crypto.randomBytes(EncryptionService.SALT_LENGTH);
            const iv = crypto.randomBytes(EncryptionService.IV_LENGTH);
            // Derive key from master key and salt
            const key = this.deriveKey(this.masterKey, salt);
            // Create cipher
            const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, key, iv);
            // Add additional authenticated data if provided
            if (additionalData) {
                cipher.setAAD(Buffer.from(additionalData, 'utf8'));
            }
            // Encrypt data
            const encrypted = Buffer.concat([
                cipher.update(plaintext, 'utf8'),
                cipher.final()
            ]);
            // Get authentication tag
            const authTag = cipher.getAuthTag();
            return {
                ciphertext: encrypted.toString('base64'),
                iv: iv.toString('base64'),
                authTag: authTag.toString('base64'),
                salt: salt.toString('base64'),
                algorithm: EncryptionService.ALGORITHM,
                keyDerivation: 'PBKDF2'
            };
        }
        catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData, additionalData) {
        try {
            // Decode from base64
            const salt = Buffer.from(encryptedData.salt, 'base64');
            const iv = Buffer.from(encryptedData.iv, 'base64');
            const authTag = Buffer.from(encryptedData.authTag, 'base64');
            const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
            // Derive key from master key and salt
            const key = this.deriveKey(this.masterKey, salt);
            // Create decipher
            const decipher = crypto.createDecipheriv(EncryptionService.ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);
            // Add additional authenticated data if provided
            if (additionalData) {
                decipher.setAAD(Buffer.from(additionalData, 'utf8'));
            }
            // Decrypt data
            const decrypted = Buffer.concat([
                decipher.update(ciphertext),
                decipher.final()
            ]);
            return decrypted.toString('utf8');
        }
        catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    /**
     * Encrypt field-level data for database storage
     */
    encryptField(value, fieldName) {
        if (value === null || value === undefined) {
            return value;
        }
        const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
        const encrypted = this.encryptData(plaintext, fieldName);
        // Combine encrypted data into single string for storage
        return JSON.stringify(encrypted);
    }
    /**
     * Decrypt field-level data from database
     */
    decryptField(encryptedValue, fieldName) {
        if (!encryptedValue) {
            return encryptedValue;
        }
        try {
            const encrypted = JSON.parse(encryptedValue);
            const decrypted = this.decryptData(encrypted, fieldName);
            // Try to parse as JSON, otherwise return as string
            try {
                return JSON.parse(decrypted);
            }
            catch {
                return decrypted;
            }
        }
        catch (error) {
            throw new Error(`Field decryption failed: ${error.message}`);
        }
    }
    /**
     * Generate RSA key pair for asymmetric encryption
     */
    generateKeyPair() {
        const keypair = forge.pki.rsa.generateKeyPair({
            bits: EncryptionService.RSA_KEY_SIZE,
            e: 0x10001
        });
        return {
            publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
            privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
        };
    }
    /**
     * Encrypt data with RSA public key
     */
    encryptWithPublicKey(plaintext, publicKeyPem) {
        try {
            const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
            const encrypted = publicKey.encrypt(plaintext, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha256.create()
                }
            });
            return forge.util.encode64(encrypted);
        }
        catch (error) {
            throw new Error(`RSA encryption failed: ${error.message}`);
        }
    }
    /**
     * Decrypt data with RSA private key
     */
    decryptWithPrivateKey(ciphertext, privateKeyPem) {
        try {
            const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
            const encrypted = forge.util.decode64(ciphertext);
            const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha256.create()
                }
            });
            return decrypted;
        }
        catch (error) {
            throw new Error(`RSA decryption failed: ${error.message}`);
        }
    }
    /**
     * Hash sensitive data (one-way encryption)
     */
    hashData(data, salt) {
        const actualSalt = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(data, actualSalt, EncryptionService.PBKDF2_ITERATIONS, 64, 'sha512');
        return `${actualSalt}:${hash.toString('hex')}`;
    }
    /**
     * Verify hashed data
     */
    verifyHash(data, hashedData) {
        const [salt, hash] = hashedData.split(':');
        const verifyHash = crypto.pbkdf2Sync(data, salt, EncryptionService.PBKDF2_ITERATIONS, 64, 'sha512');
        return hash === verifyHash.toString('hex');
    }
    /**
     * Encrypt data for client-side storage
     */
    encryptForClient(data, password) {
        const jsonString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonString, password).toString();
    }
    /**
     * Decrypt data from client-side storage
     */
    decryptFromClient(encryptedData, password) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, password);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decrypted);
        }
        catch (error) {
            throw new Error('Invalid password or corrupted data');
        }
    }
    /**
     * Generate secure random token
     */
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('base64url');
    }
    /**
     * Derive key from master key and salt
     */
    deriveKey(masterKey, salt) {
        const cacheKey = `${masterKey.toString('base64')}:${salt.toString('base64')}`;
        if (this.keyCache.has(cacheKey)) {
            return this.keyCache.get(cacheKey);
        }
        const derivedKey = crypto.pbkdf2Sync(masterKey, salt, EncryptionService.PBKDF2_ITERATIONS, EncryptionService.KEY_LENGTH, 'sha256');
        // Cache derived key for performance
        this.keyCache.set(cacheKey, derivedKey);
        // Limit cache size
        if (this.keyCache.size > 100) {
            const firstKey = this.keyCache.keys().next().value;
            if (firstKey) {
                this.keyCache.delete(firstKey);
            }
        }
        return derivedKey;
    }
    /**
     * Rotate encryption keys
     */
    async rotateKeys(data, decryptField, encryptField) {
        const newMasterKey = crypto.randomBytes(EncryptionService.KEY_LENGTH);
        const results = [];
        for (const item of data) {
            // Decrypt with old key
            const decrypted = this.decryptField(item[decryptField], decryptField);
            // Update master key
            const oldKey = this.masterKey;
            this.masterKey = newMasterKey;
            // Encrypt with new key
            const encrypted = this.encryptField(decrypted, encryptField);
            // Restore old key for next iteration
            this.masterKey = oldKey;
            results.push({
                ...item,
                [encryptField]: encrypted
            });
        }
        // Update master key permanently
        this.masterKey = newMasterKey;
        console.log('New master key:', newMasterKey.toString('base64'));
        return results;
    }
    /**
     * Secure delete - overwrite memory
     */
    secureDelete(buffer) {
        crypto.randomFillSync(buffer);
        buffer.fill(0);
    }
}
//# sourceMappingURL=encryption-service.js.map