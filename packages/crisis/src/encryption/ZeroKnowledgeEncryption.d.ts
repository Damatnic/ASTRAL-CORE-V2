/**
 * ASTRAL_CORE 2.0 Zero-Knowledge Encryption System
 *
 * SECURITY GUARANTEES:
 * - Per-session encryption keys (never reused)
 * - Perfect forward secrecy (keys destroyed after session)
 * - AES-256-GCM with authentication
 * - PBKDF2 key derivation with 100k iterations
 * - True zero-knowledge (server cannot decrypt after session ends)
 *
 * PERFORMANCE TARGETS:
 * - Key generation: <10ms
 * - Encryption/Decryption: <5ms
 * - Key derivation: <50ms (cached per session)
 */
import type { EncryptionResult, SessionKeys } from '../types/encryption.types';
export declare class ZeroKnowledgeEncryption {
    private readonly sessionKeys;
    private readonly masterSeed;
    constructor();
    /**
     * Generates a cryptographically secure session token
     * TARGET: <5ms execution time
     */
    generateSessionToken(): string;
    /**
     * Generates unique encryption keys for a session
     * Uses PBKDF2 key derivation for security
     * TARGET: <50ms execution time
     */
    generateSessionKeys(sessionToken: string): SessionKeys;
    /**
     * Encrypts message with session-specific key
     * Uses AES-256-GCM for authenticated encryption
     * TARGET: <5ms execution time
     */
    encrypt(plaintext: string, sessionToken: string): EncryptionResult;
    /**
     * Decrypts message with session-specific key
     * Only works if session keys are still in memory
     * TARGET: <5ms execution time
     */
    decrypt(encryptedData: string, sessionToken: string): string;
    /**
     * Generates message hash for integrity verification
     */
    generateMessageHash(message: string): string;
    /**
     * Verifies message integrity
     */
    verifyMessageHash(message: string, hash: string): boolean;
    /**
     * CRITICAL: Destroys session keys for perfect forward secrecy
     * Once called, session messages can NEVER be decrypted again
     */
    destroySessionKeys(sessionToken: string): void;
    /**
     * Gets session key info (for monitoring, no sensitive data)
     */
    getSessionInfo(sessionToken: string): {
        exists: boolean;
        lastUsed?: Date;
        age?: number;
    };
    /**
     * Gets encryption statistics for monitoring
     */
    getEncryptionStats(): {
        activeSessions: number;
        oldestSession: Date | null;
        memoryUsageKB: number;
    };
    /**
     * Cleanup expired session keys
     * Runs periodically to prevent memory leaks and ensure forward secrecy
     */
    private startSessionCleanup;
}
//# sourceMappingURL=ZeroKnowledgeEncryption.d.ts.map