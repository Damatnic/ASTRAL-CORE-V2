/**
 * Main Encryption Module Entry Point
 * Exports all encryption-related functionality for mental health data protection
 */

export * from './encryption/encryption-service';
export * from './encryption/data-encryption-at-rest';
export { EncryptionService as default } from './encryption/encryption-service';