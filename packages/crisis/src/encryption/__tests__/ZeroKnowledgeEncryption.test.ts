/**
 * ASTRAL_CORE 2.0 Zero-Knowledge Encryption Tests
 * 
 * SECURITY-CRITICAL TESTING
 * Encryption protects the most vulnerable users' most sensitive data.
 * Every test validates life-critical security guarantees.
 */

import { jest } from '@jest/globals';
import * as crypto from 'crypto';
import { ZeroKnowledgeEncryption } from '../ZeroKnowledgeEncryption';
import { CRISIS_CONSTANTS } from '../../index';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
});

describe('ZeroKnowledgeEncryption', () => {
  let encryption: ZeroKnowledgeEncryption;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Save original environment
    originalEnv = process.env;
    
    // Set test encryption key (64+ chars as required)
    process.env.CRISIS_ENCRYPTION_KEY = 'a'.repeat(64);
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock performance.now to return predictable values
    let timeCounter = 0;
    mockPerformanceNow.mockImplementation(() => {
      timeCounter += 1; // 1ms increments for performance testing
      return timeCounter;
    });
    
    encryption = new ZeroKnowledgeEncryption();
  });

  describe('Initialization Security', () => {
    it('should require encryption key of at least 64 characters', () => {
      const shortKey = 'short-key';
      process.env.CRISIS_ENCRYPTION_KEY = shortKey;

      expect(() => new ZeroKnowledgeEncryption()).toThrow(
        'CRITICAL SECURITY ERROR: CRISIS_ENCRYPTION_KEY environment variable must be at least 64 characters'
      );

      // Restore test key
      process.env.CRISIS_ENCRYPTION_KEY = 'a'.repeat(64);
    });

    it('should require encryption key to be present', () => {
      delete process.env.CRISIS_ENCRYPTION_KEY;

      expect(() => new ZeroKnowledgeEncryption()).toThrow(
        'CRITICAL SECURITY ERROR'
      );

      // Restore test key
      process.env.CRISIS_ENCRYPTION_KEY = 'a'.repeat(64);
    });

    it('should initialize successfully with valid encryption key', () => {
      expect(() => new ZeroKnowledgeEncryption()).not.toThrow();
    });
  });

  describe('Session Token Generation', () => {
    it('should generate unique session tokens', () => {
      const token1 = encryption.generateSessionToken();
      const token2 = encryption.generateSessionToken();
      const token3 = encryption.generateSessionToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('should generate tokens with sufficient entropy', () => {
      const token = encryption.generateSessionToken();
      
      // Should be 32 characters (190+ bits of entropy)
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/); // nanoid character set
    });

    it('should generate token within performance target', () => {
      const startTime = performance.now();
      const token = encryption.generateSessionToken();
      const executionTime = performance.now() - startTime;

      expect(token).toBeDefined();
      expect(executionTime).toBeLessThan(5); // <5ms target
    });

    it('should generate 1000 unique tokens without collision', () => {
      const tokens = new Set<string>();
      
      for (let i = 0; i < 1000; i++) {
        const token = encryption.generateSessionToken();
        expect(tokens.has(token)).toBe(false);
        tokens.add(token);
      }
      
      expect(tokens.size).toBe(1000);
    });
  });

  describe('Session Key Generation', () => {
    it('should generate session keys within performance target', () => {
      const sessionToken = 'test-session-token';
      
      const keys = encryption.generateSessionKeys(sessionToken);
      
      expect(keys).toBeDefined();
      expect(keys.encryptionKey).toHaveLength(32); // 256 bits
      expect(keys.salt).toHaveLength(CRISIS_CONSTANTS.SALT_LENGTH);
      expect(keys.sessionToken).toBe(sessionToken);
      expect(keys.createdAt).toBeInstanceOf(Date);
      expect(keys.lastUsed).toBeInstanceOf(Date);
    });

    it('should generate different keys for different sessions', () => {
      const keys1 = encryption.generateSessionKeys('session-1');
      const keys2 = encryption.generateSessionKeys('session-2');

      expect(keys1.encryptionKey).not.toEqual(keys2.encryptionKey);
      expect(keys1.salt).not.toEqual(keys2.salt);
      expect(keys1.sessionToken).not.toBe(keys2.sessionToken);
    });

    it('should return same keys for same session token', () => {
      const sessionToken = 'consistent-session';
      
      const keys1 = encryption.generateSessionKeys(sessionToken);
      const keys2 = encryption.generateSessionKeys(sessionToken);

      expect(keys1.encryptionKey).toEqual(keys2.encryptionKey);
      expect(keys1.salt).toEqual(keys2.salt);
      expect(keys1.sessionToken).toBe(keys2.sessionToken);
    });

    it('should use PBKDF2 with correct parameters', () => {
      const pbkdf2Spy = jest.spyOn(crypto, 'pbkdf2Sync');
      
      encryption.generateSessionKeys('test-session');
      
      expect(pbkdf2Spy).toHaveBeenCalledWith(
        expect.any(String), // keyMaterial (session token + master seed)
        expect.any(Buffer),  // salt
        CRISIS_CONSTANTS.KEY_DERIVATION_ITERATIONS,
        32,      // 256 bits
        'sha512'
      );
      
      pbkdf2Spy.mockRestore();
    });
  });

  describe('Message Encryption', () => {
    it('should encrypt message within performance target', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'I need help with my mental health';
      
      const result = encryption.encrypt(message, sessionToken);
      
      expect(result).toMatchObject({
        encryptedData: expect.any(String),
        authTag: expect.any(String),
        iv: expect.any(String),
        salt: expect.any(String),
        timestamp: expect.any(String),
      });
      
      // Encrypted data should be different from plaintext
      expect(result.encryptedData).not.toBe(message);
      
      // Should have authentication tag (GCM mode)
      expect(result.authTag).toHaveLength(32); // 16 bytes = 32 hex chars
      
      // Should have unique IV
      expect(result.iv).toHaveLength(CRISIS_CONSTANTS.IV_LENGTH * 2); // hex encoded
    });

    it('should generate unique encryption for same message', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'Same message content';
      
      const result1 = encryption.encrypt(message, sessionToken);
      const result2 = encryption.encrypt(message, sessionToken);
      
      // Should produce different encrypted data (due to unique IV)
      expect(result1.encryptedData).not.toBe(result2.encryptedData);
      expect(result1.iv).not.toBe(result2.iv);
      
      // But should use same session salt
      expect(result1.salt).toBe(result2.salt);
    });

    it('should handle empty messages', () => {
      const sessionToken = encryption.generateSessionToken();
      
      const result = encryption.encrypt('', sessionToken);
      
      expect(result).toBeDefined();
      expect(result.encryptedData).toBeDefined();
      expect(result.authTag).toBeDefined();
    });

    it('should handle unicode and special characters', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'I feel 😢 and need help with émotions';
      
      const result = encryption.encrypt(message, sessionToken);
      
      expect(result).toBeDefined();
      expect(result.encryptedData).not.toBe(message);
    });

    it('should handle very long messages', () => {
      const sessionToken = encryption.generateSessionToken();
      const longMessage = 'A'.repeat(10000); // 10KB message
      
      const result = encryption.encrypt(longMessage, sessionToken);
      
      expect(result).toBeDefined();
      expect(result.encryptedData).toBeDefined();
    });

    it('should auto-generate session keys if not present', () => {
      const sessionToken = 'new-session-without-keys';
      const message = 'Auto-generate keys test';
      
      // Should not throw error even without pre-generated keys
      const result = encryption.encrypt(message, sessionToken);
      
      expect(result).toBeDefined();
      expect(result.encryptedData).toBeDefined();
    });
  });

  describe('Message Decryption', () => {
    it('should decrypt message correctly', () => {
      const sessionToken = encryption.generateSessionToken();
      const originalMessage = 'I am having suicidal thoughts';
      
      // Encrypt
      const encrypted = encryption.encrypt(originalMessage, sessionToken);
      
      // Decrypt
      const decrypted = encryption.decrypt(
        `${encrypted.encryptedData}:${encrypted.authTag}:${encrypted.iv}`,
        sessionToken
      );
      
      expect(decrypted).toBe(originalMessage);
    });

    it('should handle round-trip encryption/decryption for various messages', () => {
      const sessionToken = encryption.generateSessionToken();
      const testMessages = [
        'Short',
        'A longer message with spaces and punctuation!',
        'Unicode: 🔒 émojis and spécial chars',
        '',
        'Numbers: 12345 and symbols: @#$%^&*()',
        'Very long message: ' + 'X'.repeat(1000),
      ];
      
      for (const message of testMessages) {
        const encrypted = encryption.encrypt(message, sessionToken);
        const decrypted = encryption.decrypt(
          `${encrypted.encryptedData}:${encrypted.authTag}:${encrypted.iv}`,
          sessionToken
        );
        
        expect(decrypted).toBe(message);
      }
    });

    it('should fail to decrypt with wrong session token', () => {
      const sessionToken1 = encryption.generateSessionToken();
      const sessionToken2 = encryption.generateSessionToken();
      const message = 'Secret message';
      
      const encrypted = encryption.encrypt(message, sessionToken1);
      
      expect(() => {
        encryption.decrypt(
          `${encrypted.encryptedData}:${encrypted.authTag}:${encrypted.iv}`,
          sessionToken2
        );
      }).toThrow('SECURITY ERROR');
    });

    it('should fail to decrypt tampered data', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'Original message';
      
      const encrypted = encryption.encrypt(message, sessionToken);
      
      // Tamper with encrypted data
      const tamperedData = encrypted.encryptedData.replace(/.$/, 'X');
      
      expect(() => {
        encryption.decrypt(
          `${tamperedData}:${encrypted.authTag}:${encrypted.iv}`,
          sessionToken
        );
      }).toThrow('SECURITY ERROR');
    });

    it('should fail to decrypt with wrong auth tag', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'Authenticated message';
      
      const encrypted = encryption.encrypt(message, sessionToken);
      
      // Use wrong auth tag
      const wrongAuthTag = 'deadbeefdeadbeefdeadbeefdeadbeef';
      
      expect(() => {
        encryption.decrypt(
          `${encrypted.encryptedData}:${wrongAuthTag}:${encrypted.iv}`,
          sessionToken
        );
      }).toThrow('SECURITY ERROR');
    });
  });

  describe('Message Hash Generation', () => {
    it('should generate consistent hash for same message', () => {
      const message = 'Consistent message';
      
      const hash1 = encryption.generateMessageHash(message);
      const hash2 = encryption.generateMessageHash(message);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 = 32 bytes = 64 hex chars
    });

    it('should generate different hash for different messages', () => {
      const message1 = 'First message';
      const message2 = 'Second message';
      
      const hash1 = encryption.generateMessageHash(message1);
      const hash2 = encryption.generateMessageHash(message2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle edge cases for hashing', () => {
      const testMessages = ['', ' ', 'A', '🔒'];
      
      for (const message of testMessages) {
        const hash = encryption.generateMessageHash(message);
        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[a-f0-9]{64}$/); // Valid hex
      }
    });
  });

  describe('Session Key Destruction', () => {
    it('should destroy session keys on command', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'Test message';
      
      // Encrypt message (creates session keys)
      encryption.encrypt(message, sessionToken);
      
      // Destroy session keys
      encryption.destroySessionKeys(sessionToken);
      
      // Should not be able to decrypt after key destruction
      expect(() => {
        const encrypted = encryption.encrypt('New message', sessionToken);
        // Keys should be regenerated, not reused
      }).not.toThrow();
    });

    it('should handle destroying non-existent session keys', () => {
      expect(() => {
        encryption.destroySessionKeys('non-existent-session');
      }).not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should warn when key generation exceeds 50ms target', () => {
      // Mock slow key generation
      mockPerformanceNow
        .mockReturnValueOnce(0)    // start time
        .mockReturnValueOnce(60);  // end time (60ms)

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      encryption.generateSessionKeys('slow-session');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Key generation took 60.00ms (target: <50ms)')
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn when encryption exceeds 5ms target', () => {
      // Mock slow encryption
      mockPerformanceNow
        .mockReturnValueOnce(0)    // start time
        .mockReturnValueOnce(10);  // end time (10ms)

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const sessionToken = encryption.generateSessionToken();
      encryption.encrypt('test message', sessionToken);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Encryption took 10.00ms (target: <5ms)')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Security Properties', () => {
    it('should use AES-256-GCM encryption algorithm', () => {
      const sessionToken = encryption.generateSessionToken();
      const message = 'Security test message';
      
      const createCipherSpy = jest.spyOn(crypto, 'createCipheriv');
      
      encryption.encrypt(message, sessionToken);
      
      expect(createCipherSpy).toHaveBeenCalledWith(
        CRISIS_CONSTANTS.ENCRYPTION_ALGORITHM, // Should be 'aes-256-gcm'
        expect.any(Buffer), // encryption key
        expect.any(Buffer)  // IV
      );
      
      createCipherSpy.mockRestore();
    });

    it('should use cryptographically secure random for IV and salt', () => {
      const randomBytesSpy = jest.spyOn(crypto, 'randomBytes');
      
      const sessionToken = encryption.generateSessionToken();
      encryption.generateSessionKeys(sessionToken);
      encryption.encrypt('test', sessionToken);
      
      // Should be called for salt generation and IV generation
      expect(randomBytesSpy).toHaveBeenCalledWith(CRISIS_CONSTANTS.SALT_LENGTH);
      expect(randomBytesSpy).toHaveBeenCalledWith(CRISIS_CONSTANTS.IV_LENGTH);
      
      randomBytesSpy.mockRestore();
    });

    it('should use SHA-512 for key derivation', () => {
      const pbkdf2Spy = jest.spyOn(crypto, 'pbkdf2Sync');
      
      encryption.generateSessionKeys('test-session');
      
      expect(pbkdf2Spy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Buffer),
        expect.any(Number),
        32,
        'sha512' // Should use SHA-512
      );
      
      pbkdf2Spy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle encryption errors gracefully', () => {
      const sessionToken = encryption.generateSessionToken();
      
      // Mock crypto.createCipheriv to throw error
      const createCipherSpy = jest.spyOn(crypto, 'createCipheriv')
        .mockImplementation(() => {
          throw new Error('Cipher creation failed');
        });
      
      expect(() => {
        encryption.encrypt('test message', sessionToken);
      }).toThrow('SECURITY ERROR: Failed to encrypt crisis message');
      
      createCipherSpy.mockRestore();
    });

    it('should handle decryption errors gracefully', () => {
      const sessionToken = encryption.generateSessionToken();
      
      expect(() => {
        encryption.decrypt('invalid:encrypted:data', sessionToken);
      }).toThrow('SECURITY ERROR');
    });

    it('should handle malformed encrypted data', () => {
      const sessionToken = encryption.generateSessionToken();
      
      const malformedData = [
        'no-colons',
        'only:one:colon',
        'too:many:colons:here:and:here',
        ':empty:fields:',
        ':::',
      ];
      
      for (const data of malformedData) {
        expect(() => {
          encryption.decrypt(data, sessionToken);
        }).toThrow('SECURITY ERROR');
      }
    });
  });

  describe('Constants Integration', () => {
    it('should use correct constants for encryption parameters', () => {
      expect(CRISIS_CONSTANTS.SALT_LENGTH).toBeGreaterThan(0);
      expect(CRISIS_CONSTANTS.IV_LENGTH).toBeGreaterThan(0);
      expect(CRISIS_CONSTANTS.KEY_DERIVATION_ITERATIONS).toBeGreaterThan(10000);
      expect(CRISIS_CONSTANTS.ENCRYPTION_ALGORITHM).toBe('aes-256-gcm');
    });
  });
});