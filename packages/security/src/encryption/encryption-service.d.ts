/**
 * End-to-End Encryption Service
 * HIPAA-compliant encryption for PHI/PII data
 * Implements AES-256-GCM encryption with key management
 */
export interface EncryptedData {
    ciphertext: string;
    iv: string;
    authTag: string;
    salt: string;
    algorithm: string;
    keyDerivation: string;
}
export interface KeyPair {
    publicKey: string;
    privateKey: string;
}
export declare class EncryptionService {
    private static readonly ALGORITHM;
    private static readonly KEY_LENGTH;
    private static readonly IV_LENGTH;
    private static readonly SALT_LENGTH;
    private static readonly TAG_LENGTH;
    private static readonly PBKDF2_ITERATIONS;
    private static readonly RSA_KEY_SIZE;
    private masterKey;
    private keyCache;
    constructor();
    /**
     * Initialize master key for encryption
     */
    private initializeMasterKey;
    /**
     * Encrypt sensitive data (PHI/PII)
     */
    encryptData(plaintext: string, additionalData?: string): EncryptedData;
    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData: EncryptedData, additionalData?: string): string;
    /**
     * Encrypt field-level data for database storage
     */
    encryptField(value: any, fieldName: string): string;
    /**
     * Decrypt field-level data from database
     */
    decryptField(encryptedValue: string, fieldName: string): any;
    /**
     * Generate RSA key pair for asymmetric encryption
     */
    generateKeyPair(): KeyPair;
    /**
     * Encrypt data with RSA public key
     */
    encryptWithPublicKey(plaintext: string, publicKeyPem: string): string;
    /**
     * Decrypt data with RSA private key
     */
    decryptWithPrivateKey(ciphertext: string, privateKeyPem: string): string;
    /**
     * Hash sensitive data (one-way encryption)
     */
    hashData(data: string, salt?: string): string;
    /**
     * Verify hashed data
     */
    verifyHash(data: string, hashedData: string): boolean;
    /**
     * Encrypt data for client-side storage
     */
    encryptForClient(data: any, password: string): string;
    /**
     * Decrypt data from client-side storage
     */
    decryptFromClient(encryptedData: string, password: string): any;
    /**
     * Generate secure random token
     */
    generateSecureToken(length?: number): string;
    /**
     * Derive key from master key and salt
     */
    private deriveKey;
    /**
     * Rotate encryption keys
     */
    rotateKeys(data: any[], decryptField: string, encryptField: string): Promise<any[]>;
    /**
     * Secure delete - overwrite memory
     */
    secureDelete(buffer: Buffer): void;
}
//# sourceMappingURL=encryption-service.d.ts.map