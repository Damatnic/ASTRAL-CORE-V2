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
export declare const ENCRYPTION_CONFIG: {
    readonly algorithm: "aes-256-gcm";
    readonly keyLength: 32;
    readonly ivLength: 16;
    readonly saltLength: 32;
    readonly tagLength: 16;
    readonly iterations: 100000;
};
/**
 * Derives a user-specific encryption key from their ID and a master secret
 * This ensures each user has a unique key without storing it
 */
export declare function deriveUserKey(userId: string, masterSecret?: string): Buffer;
/**
 * Encrypts sensitive data with user-specific key
 */
export declare function encryptUserData(data: string, userId: string): {
    encryptedData: Buffer;
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
};
/**
 * Decrypts user data with user-specific key
 */
export declare function decryptUserData(encryptedData: Buffer, userId: string, salt: Buffer, iv: Buffer, tag: Buffer): string;
/**
 * Creates a hash for data integrity verification
 */
export declare function createContentHash(data: string): string;
/**
 * Verifies data integrity
 */
export declare function verifyContentHash(data: string, hash: string): boolean;
/**
 * Encrypts mood entry data
 */
export declare function encryptMoodEntry(moodData: any, userId: string): {
    encryptedData: Buffer;
    metadata: {
        salt: Buffer;
        iv: Buffer;
        tag: Buffer;
        hash: string;
    };
};
/**
 * Decrypts mood entry data
 */
export declare function decryptMoodEntry(encryptedData: Buffer, userId: string, metadata: {
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
    hash: string;
}): any;
/**
 * Encrypts safety plan data
 */
export declare function encryptSafetyPlan(planData: any, userId: string): {
    encryptedContent: Buffer;
    contentHash: string;
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
};
/**
 * Decrypts safety plan data
 */
export declare function decryptSafetyPlan(encryptedContent: Buffer, userId: string, contentHash: string, salt: Buffer, iv: Buffer, tag: Buffer): any;
/**
 * Encrypts user profile data
 */
export declare function encryptUserProfile(profileData: any, userId: string): {
    encryptedProfile: Buffer;
    metadata: {
        salt: Buffer;
        iv: Buffer;
        tag: Buffer;
        hash: string;
    };
};
/**
 * Decrypts user profile data
 */
export declare function decryptUserProfile(encryptedProfile: Buffer, userId: string, metadata: {
    salt: Buffer;
    iv: Buffer;
    tag: Buffer;
    hash: string;
}): any;
/**
 * Generates a secure anonymous ID for users
 */
export declare function generateAnonymousId(): string;
/**
 * Generates a secure session token
 */
export declare function generateSessionToken(): string;
/**
 * Simple encryption for localStorage (fallback)
 * NOTE: This is less secure than database encryption
 */
export declare function encryptForLocalStorage(data: string, key: string): string;
/**
 * Simple decryption for localStorage (fallback)
 */
export declare function decryptFromLocalStorage(encryptedData: string, key: string): string;
//# sourceMappingURL=encryption.d.ts.map