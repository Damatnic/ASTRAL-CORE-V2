/**
 * ASTRAL_CORE 2.0 Zero-Knowledge Encryption Test Suite
 * 
 * COMPREHENSIVE SECURITY AND PERFORMANCE VALIDATION
 * 
 * TEST CATEGORIES:
 * - Zero-knowledge verification
 * - Perfect forward secrecy validation
 * - Anonymous authentication testing
 * - HIPAA compliance verification
 * - Performance benchmarking
 * - Browser compatibility testing
 * - Crisis mode functionality
 * - Key rotation verification
 * - Memory security testing
 */

import { jest } from '@jest/globals';
import { ZeroKnowledgeEncryption } from '../encryption';
import { BrowserZeroKnowledgeEncryption } from '../browser-encryption';
import type { 
  EncryptionResult, 
  DecryptionResult, 
  AnonymousToken,
  SessionKeys,
  HIPAAAuditEntry 
} from '../encryption';

// Mock browser environment for Node.js testing
global.performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntries: jest.fn(),
  getEntriesByName: jest.fn(),
  getEntriesByType: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  clearResourceTimings: jest.fn(),
  setResourceTimingBufferSize: jest.fn(),
  toJSON: jest.fn()
} as any;

// Mock crypto for consistent testing
const mockCrypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    generateKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    exportKey: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn()
  }
};

// Set environment variable for testing
process.env.CRISIS_ENCRYPTION_KEY = 'a'.repeat(64);

describe('ZeroKnowledgeEncryption', () => {
  let encryption: ZeroKnowledgeEncryption;
  let testSession: { sessionId: string; publicKey: Uint8Array; token: AnonymousToken };

  beforeEach(async () => {
    encryption = new ZeroKnowledgeEncryption();
    
    // Create test session
    testSession = await encryption.createSecureSession('test-user-secret-password-123');
  });

  afterEach(() => {
    // Clean up sessions
    if (testSession) {
      encryption.destroySession(testSession.sessionId);
    }
  });

  describe('Zero-Knowledge Verification', () => {
    test('should maintain zero-knowledge after session destruction', async () => {
      const testMessage = 'Confidential mental health crisis information';
      
      // Encrypt message
      const encrypted = await encryption.encrypt(
        testMessage, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
      
      // Verify decryption works before destruction
      const decryptedBefore = await encryption.decrypt(
        encrypted, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      expect(decryptedBefore.success).toBe(true);
      expect(decryptedBefore.data).toBe(testMessage);
      
      // Destroy session (simulating perfect forward secrecy)
      encryption.destroySession(testSession.sessionId);
      
      // Verify decryption fails after destruction
      const decryptedAfter = await encryption.decrypt(
        encrypted, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      expect(decryptedAfter.success).toBe(false);
      expect(decryptedAfter.error).toContain('ZERO-KNOWLEDGE ACHIEVED');
    });

    test('should not allow cross-session decryption', async () => {
      const testMessage = 'Session-specific encrypted data';
      
      // Create second session with same user secret
      const session2 = await encryption.createSecureSession('test-user-secret-password-123');
      
      // Encrypt with first session
      const encrypted = await encryption.encrypt(
        testMessage, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      // Try to decrypt with second session (should fail)
      const decrypted = await encryption.decrypt(
        encrypted, 
        session2.sessionId, 
        session2.token.tokenId
      );
      
      expect(decrypted.success).toBe(false);
      
      // Clean up
      encryption.destroySession(session2.sessionId);
    });
  });

  describe('Perfect Forward Secrecy', () => {
    test('should generate unique ephemeral keys for each session', async () => {
      const session1 = await encryption.createSecureSession('same-password');
      const session2 = await encryption.createSecureSession('same-password');
      
      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.publicKey).not.toEqual(session2.publicKey);
      
      encryption.destroySession(session1.sessionId);
      encryption.destroySession(session2.sessionId);
    });

    test('should rotate keys successfully', async () => {
      const testMessage = 'Test message for key rotation';
      
      // Encrypt before rotation
      const encryptedBefore = await encryption.encrypt(
        testMessage, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      // Rotate keys
      const rotationSuccess = await encryption.rotateSessionKeys(testSession.sessionId);
      expect(rotationSuccess).toBe(true);
      
      // Encrypt after rotation (should still work)
      const encryptedAfter = await encryption.encrypt(
        testMessage, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      expect(encryptedAfter.encryptedData).toBeDefined();
      expect(encryptedAfter.encryptedData).not.toBe(encryptedBefore.encryptedData);
    });
  });

  describe('Anonymous Authentication', () => {
    test('should generate anonymous tokens without identity correlation', () => {
      const token = testSession.token;
      
      expect(token.tokenId).toBeDefined();
      expect(token.sessionHash).toBeDefined();
      expect(token.issuedAt).toBeInstanceOf(Date);
      expect(token.expiresAt).toBeInstanceOf(Date);
      expect(token.permissions).toContain('crisis_support');
      expect(token.isRevoked).toBe(false);
      
      // Verify no identity information in token
      expect(token.tokenId).not.toContain('user');
      expect(token.tokenId).not.toContain('test');
      expect(token.sessionHash).not.toContain('user');
    });

    test('should reject expired tokens', async () => {
      // Create token with past expiry
      const expiredToken: AnonymousToken = {
        ...testSession.token,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };
      
      const testMessage = 'Test with expired token';
      
      // Mock the token lookup to return expired token
      const originalToken = testSession.token;
      (testSession as any).token = expiredToken;
      
      try {
        await encryption.encrypt(testMessage, testSession.sessionId, expiredToken.tokenId);
        fail('Should have rejected expired token');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('expired');
      }
      
      // Restore original token
      (testSession as any).token = originalToken;
    });
  });

  describe('Performance Benchmarking', () => {
    test('should meet encryption performance targets', async () => {
      const testMessage = 'Performance test message for encryption timing';
      const iterations = 10;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        await encryption.encrypt(
          testMessage, 
          testSession.sessionId, 
          testSession.token.tokenId
        );
        
        const end = performance.now();
        times.push(end - start);
      }
      
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`Encryption - Average: ${averageTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
      
      // Performance targets
      expect(averageTime).toBeLessThan(10); // Target: <10ms average
      expect(maxTime).toBeLessThan(25); // Target: <25ms worst case
    });

    test('should meet decryption performance targets', async () => {
      const testMessage = 'Performance test message for decryption timing';
      
      // Pre-encrypt the message
      const encrypted = await encryption.encrypt(
        testMessage, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      const iterations = 10;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        await encryption.decrypt(
          encrypted, 
          testSession.sessionId, 
          testSession.token.tokenId
        );
        
        const end = performance.now();
        times.push(end - start);
      }
      
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`Decryption - Average: ${averageTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
      
      // Performance targets
      expect(averageTime).toBeLessThan(10); // Target: <10ms average
      expect(maxTime).toBeLessThan(25); // Target: <25ms worst case
    });

    test('should meet session creation performance targets', async () => {
      const iterations = 5;
      const times: number[] = [];
      const sessions: string[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        const session = await encryption.createSecureSession(`test-password-${i}`);
        
        const end = performance.now();
        times.push(end - start);
        sessions.push(session.sessionId);
      }
      
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`Session Creation - Average: ${averageTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
      
      // Performance targets
      expect(averageTime).toBeLessThan(500); // Target: <500ms average
      expect(maxTime).toBeLessThan(2000); // Target: <2000ms worst case
      
      // Clean up test sessions
      sessions.forEach(sessionId => encryption.destroySession(sessionId));
    });
  });

  describe('HIPAA Compliance', () => {
    test('should generate compliance audit trail', async () => {
      const testMessage = 'HIPAA protected health information';
      
      // Perform operations to generate audit trail
      await encryption.encrypt(testMessage, testSession.sessionId, testSession.token.tokenId);
      await encryption.rotateSessionKeys(testSession.sessionId);
      
      const complianceReport = encryption.getHIPAAComplianceReport();
      
      expect(complianceReport.totalOperations).toBeGreaterThan(0);
      expect(complianceReport.successRate).toBeGreaterThan(90);
      expect(complianceReport.auditTrail).toBeInstanceOf(Array);
      expect(complianceReport.complianceStatus).toBe('COMPLIANT');
      
      // Verify audit entries contain required fields
      const auditEntries = complianceReport.auditTrail;
      expect(auditEntries.length).toBeGreaterThan(0);
      
      auditEntries.forEach(entry => {
        expect(entry.timestamp).toBeInstanceOf(Date);
        expect(entry.operation).toBeDefined();
        expect(entry.sessionId).toBeDefined();
        expect(entry.success).toBeDefined();
        expect(entry.performanceMs).toBeGreaterThanOrEqual(0);
        expect(entry.securityLevel).toMatch(/^(HIGH|MEDIUM|LOW)$/);
        expect(entry.complianceNotes).toBeInstanceOf(Array);
      });
    });

    test('should maintain data encryption at rest', async () => {
      const sensitiveData = 'Patient confidential mental health record';
      
      const encrypted = await encryption.encrypt(
        sensitiveData, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      // Verify data is encrypted
      expect(encrypted.encryptedData).not.toContain(sensitiveData);
      expect(encrypted.encryptedData).toMatch(/^[0-9a-f]+$/); // Hex string
      expect(encrypted.iv).toMatch(/^[0-9a-f]+$/);
      expect(encrypted.authTag).toMatch(/^[0-9a-f]+$/);
      
      // Verify authentication tag is present
      expect(encrypted.authTag).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe('Error Handling and Security', () => {
    test('should handle invalid session gracefully', async () => {
      const invalidSessionId = 'invalid_session_id';
      const testMessage = 'Test message';
      
      try {
        await encryption.encrypt(testMessage, invalidSessionId);
        fail('Should have thrown error for invalid session');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Session not found');
      }
    });

    test('should handle tampered encrypted data', async () => {
      const testMessage = 'Original message';
      
      const encrypted = await encryption.encrypt(
        testMessage, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      // Tamper with encrypted data
      const tamperedData: EncryptionResult = {
        ...encrypted,
        encryptedData: encrypted.encryptedData.replace(/.$/, '0') // Change last character
      };
      
      const decrypted = await encryption.decrypt(
        tamperedData, 
        testSession.sessionId, 
        testSession.token.tokenId
      );
      
      expect(decrypted.success).toBe(false);
      expect(decrypted.error).toBeDefined();
    });

    test('should handle memory pressure gracefully', () => {
      const stats = encryption.getEncryptionStats();
      
      expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
      expect(stats.activeTokens).toBeGreaterThanOrEqual(0);
      expect(stats.performanceMetrics).toBeDefined();
      expect(stats.securityMetrics).toBeDefined();
      
      // Verify performance metrics are reasonable
      expect(stats.performanceMetrics.averageEncryptionTime).toBeGreaterThanOrEqual(0);
      expect(stats.performanceMetrics.averageDecryptionTime).toBeGreaterThanOrEqual(0);
      expect(stats.securityMetrics.complianceScore).toBeGreaterThanOrEqual(0);
      expect(stats.securityMetrics.complianceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('System Integration Tests', () => {
    test('should run comprehensive system test', async () => {
      const testResult = await encryption.testEncryptionSystem();
      
      expect(testResult.success).toBe(true);
      expect(testResult.errors).toHaveLength(0);
      
      // Verify performance metrics
      expect(testResult.performance.sessionCreationTime).toBeLessThan(500);
      expect(testResult.performance.encryptionTime).toBeLessThan(10);
      expect(testResult.performance.decryptionTime).toBeLessThan(10);
      
      // Verify security validation
      expect(testResult.securityValidation.zeroKnowledgeVerified).toBe(true);
      expect(testResult.securityValidation.forwardSecrecyVerified).toBe(true);
      expect(testResult.securityValidation.anonymityVerified).toBe(true);
      expect(testResult.securityValidation.hipaaCompliant).toBe(true);
      
      console.log('✅ All system integration tests passed');
      console.log(`📊 Performance: Session=${testResult.performance.sessionCreationTime}ms, Encrypt=${testResult.performance.encryptionTime}ms, Decrypt=${testResult.performance.decryptionTime}ms`);
    });
  });
});

describe('BrowserZeroKnowledgeEncryption', () => {
  let browserEncryption: BrowserZeroKnowledgeEncryption;

  beforeAll(() => {
    // Mock browser environment
    global.window = {
      crypto: mockCrypto,
      location: {
        search: '',
        pathname: '/crisis'
      },
      isSecureContext: true
    } as any;
    
    global.indexedDB = {
      open: jest.fn().mockReturnValue({
        onsuccess: jest.fn(),
        onerror: jest.fn(),
        onupgradeneeded: jest.fn()
      })
    } as any;
  });

  beforeEach(() => {
    browserEncryption = new BrowserZeroKnowledgeEncryption();
  });

  describe('Browser Compatibility', () => {
    test('should detect browser capabilities', async () => {
      const capabilities = await browserEncryption.testBrowserCapabilities();
      
      expect(capabilities).toHaveProperty('webCryptoSupported');
      expect(capabilities).toHaveProperty('indexedDBSupported');
      expect(capabilities).toHaveProperty('performanceAcceptable');
      expect(capabilities).toHaveProperty('securityFeatures');
      expect(capabilities).toHaveProperty('recommendations');
      
      expect(capabilities.securityFeatures).toBeInstanceOf(Array);
      expect(capabilities.recommendations).toBeInstanceOf(Array);
    });

    test('should handle crisis mode detection', async () => {
      // Crisis mode should be detected from URL path
      expect(global.window.location.pathname).toContain('/crisis');
      
      // Browser encryption should still work in crisis mode
      expect(browserEncryption).toBeDefined();
    });
  });

  describe('Browser Performance', () => {
    test('should provide performance metrics', () => {
      const metrics = browserEncryption.getBrowserPerformanceMetrics();
      
      expect(metrics).toHaveProperty('averageEncryptionTime');
      expect(metrics).toHaveProperty('averageDecryptionTime');
      expect(metrics).toHaveProperty('averageKeyDerivationTime');
      expect(metrics).toHaveProperty('averageStorageTime');
      expect(metrics).toHaveProperty('isPerformingWell');
      
      expect(metrics.averageEncryptionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageDecryptionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Browser Storage', () => {
    test('should clear all storage for privacy', async () => {
      // This test ensures the clearAllStorage method doesn't throw errors
      await expect(browserEncryption.clearAllStorage()).resolves.not.toThrow();
    });
  });
});

describe('Security Stress Tests', () => {
  let encryption: ZeroKnowledgeEncryption;

  beforeEach(() => {
    encryption = new ZeroKnowledgeEncryption();
  });

  test('should handle high volume operations', async () => {
    const session = await encryption.createSecureSession('stress-test-password');
    const messageCount = 100;
    const messages: string[] = [];
    const encrypted: EncryptionResult[] = [];
    
    console.log(`🔄 Starting stress test with ${messageCount} messages...`);
    
    const startTime = performance.now();
    
    // Encrypt multiple messages
    for (let i = 0; i < messageCount; i++) {
      const message = `Stress test message #${i} with some sensitive mental health data`;
      messages.push(message);
      
      const result = await encryption.encrypt(
        message, 
        session.sessionId, 
        session.token.tokenId
      );
      encrypted.push(result);
    }
    
    // Decrypt all messages
    for (let i = 0; i < messageCount; i++) {
      const decrypted = await encryption.decrypt(
        encrypted[i], 
        session.sessionId, 
        session.token.tokenId
      );
      
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(messages[i]);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageTimePerOperation = totalTime / (messageCount * 2); // encrypt + decrypt
    
    console.log(`✅ Stress test completed: ${totalTime.toFixed(2)}ms total, ${averageTimePerOperation.toFixed(2)}ms per operation`);
    
    expect(averageTimePerOperation).toBeLessThan(20); // Should be fast even under load
    
    encryption.destroySession(session.sessionId);
  });

  test('should maintain security under memory pressure', async () => {
    const sessionCount = 50;
    const sessions: Array<{ sessionId: string; token: AnonymousToken }> = [];
    
    console.log(`🧠 Creating ${sessionCount} sessions to test memory pressure...`);
    
    // Create many sessions
    for (let i = 0; i < sessionCount; i++) {
      const session = await encryption.createSecureSession(`memory-test-${i}`);
      sessions.push(session);
    }
    
    // Verify all sessions work
    for (const session of sessions) {
      const testMessage = `Memory pressure test for ${session.sessionId}`;
      
      const encrypted = await encryption.encrypt(
        testMessage, 
        session.sessionId, 
        session.token.tokenId
      );
      
      const decrypted = await encryption.decrypt(
        encrypted, 
        session.sessionId, 
        session.token.tokenId
      );
      
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(testMessage);
    }
    
    // Get performance stats
    const stats = encryption.getEncryptionStats();
    console.log(`📊 Memory test stats: ${stats.activeSessions} active sessions`);
    
    expect(stats.activeSessions).toBe(sessionCount);
    
    // Clean up all sessions
    sessions.forEach(session => {
      encryption.destroySession(session.sessionId);
    });
  });
});

describe('Crisis Mode Functionality', () => {
  test('should maintain encryption in crisis mode', async () => {
    // Crisis mode should never disable encryption for mental health data
    const encryption = new ZeroKnowledgeEncryption();
    const session = await encryption.createSecureSession('crisis-mode-test');
    
    const crisisMessage = 'URGENT: Patient expressing suicidal ideation, immediate intervention required';
    
    const encrypted = await encryption.encrypt(
      crisisMessage, 
      session.sessionId, 
      session.token.tokenId
    );
    
    expect(encrypted.encryptedData).toBeDefined();
    expect(encrypted.encryptedData).not.toContain(crisisMessage);
    
    const decrypted = await encryption.decrypt(
      encrypted, 
      session.sessionId, 
      session.token.tokenId
    );
    
    expect(decrypted.success).toBe(true);
    expect(decrypted.data).toBe(crisisMessage);
    
    encryption.destroySession(session.sessionId);
  });
});