/**
 * ASTRAL_CORE 2.0 Zero-Knowledge Encryption Types
 */
export interface SessionKeys {
    /** AES-256 encryption key derived from session token */
    encryptionKey: Buffer;
    /** Unique salt for key derivation */
    salt: Buffer;
    /** Session token (public identifier) */
    sessionToken: string;
    /** When keys were created */
    createdAt: Date;
    /** Last time keys were used */
    lastUsed: Date;
}
export interface EncryptionResult {
    /** Hex-encoded encrypted data */
    encryptedData: string;
    /** Hex-encoded authentication tag */
    authTag: string;
    /** Hex-encoded initialization vector */
    iv: string;
    /** Hex-encoded salt for key derivation */
    salt: string;
    /** ISO timestamp of encryption */
    timestamp: string;
}
export interface DecryptionContext {
    /** Session token for key lookup */
    sessionToken: string;
    /** Whether to allow key re-derivation */
    allowKeyRecovery: boolean;
    /** Maximum age for key recovery (ms) */
    maxRecoveryAge?: number;
}
export interface EncryptionStats {
    /** Number of active sessions with keys */
    activeSessions: number;
    /** Oldest session timestamp */
    oldestSession: Date | null;
    /** Estimated memory usage in KB */
    memoryUsageKB: number;
    /** Number of encryption operations in last minute */
    operationsPerMinute: number;
    /** Average encryption time */
    averageEncryptionTimeMs: number;
    /** Average decryption time */
    averageDecryptionTimeMs: number;
}
export type EncryptionAlgorithm = 'aes-256-gcm';
export type HashAlgorithm = 'sha256' | 'sha512';
export type KeyDerivationFunction = 'pbkdf2';
//# sourceMappingURL=encryption.types.d.ts.map