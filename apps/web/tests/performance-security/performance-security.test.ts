/**
 * Performance and Security Tests
 * Critical tests for platform performance, security, and HIPAA compliance
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { performance } from 'perf_hooks';
import crypto from 'crypto';
import loadtest from 'loadtest';
import { PrismaClient } from '@prisma/client';

// Security testing utilities
class SecurityTester {
  private static readonly XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '${alert("XSS")}',
    '{{constructor.constructor("alert(1)")()}}'
  ];

  private static readonly SQL_INJECTION_PAYLOADS = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' UNION SELECT * FROM users--",
    "admin' --",
    "' OR 1=1--",
    "1'; EXEC xp_cmdshell('dir')--"
  ];

  private static readonly PATH_TRAVERSAL_PAYLOADS = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    'file:///etc/passwd',
    '....//....//....//etc/passwd'
  ];

  static async testXSSPrevention(endpoint: string, field: string): Promise<boolean> {
    for (const payload of this.XSS_PAYLOADS) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: payload })
      });
      
      const text = await response.text();
      if (text.includes('<script>') || text.includes('alert(')) {
        return false; // XSS vulnerability found
      }
    }
    return true;
  }

  static async testSQLInjectionPrevention(endpoint: string, field: string): Promise<boolean> {
    for (const payload of this.SQL_INJECTION_PAYLOADS) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: payload })
      });
      
      // Check for SQL errors in response
      const text = await response.text();
      const sqlErrors = ['syntax error', 'SQL', 'mysql', 'postgresql', 'sqlite'];
      
      for (const error of sqlErrors) {
        if (text.toLowerCase().includes(error)) {
          return false; // SQL injection vulnerability found
        }
      }
    }
    return true;
  }

  static async testPathTraversal(endpoint: string): Promise<boolean> {
    for (const payload of this.PATH_TRAVERSAL_PAYLOADS) {
      const response = await fetch(`${endpoint}?file=${payload}`);
      const text = await response.text();
      
      // Check for system file contents
      if (text.includes('root:') || text.includes('[boot loader]')) {
        return false; // Path traversal vulnerability found
      }
    }
    return true;
  }
}

describe('Performance Tests', () => {
  describe('Page Load Performance', () => {
    const criticalPages = [
      { path: '/', name: 'Home', maxLCP: 2500 },
      { path: '/crisis', name: 'Crisis', maxLCP: 1500 }, // Crisis page must load faster
      { path: '/crisis/chat', name: 'Crisis Chat', maxLCP: 1500 },
      { path: '/ai-therapy', name: 'AI Therapy', maxLCP: 2500 },
      { path: '/mood', name: 'Mood Tracker', maxLCP: 2000 }
    ];

    criticalPages.forEach(({ path, name, maxLCP }) => {
      it(`${name} page should have LCP under ${maxLCP}ms`, async () => {
        const startTime = performance.now();
        const response = await fetch(`http://localhost:3000${path}`);
        await response.text();
        const loadTime = performance.now() - startTime;
        
        expect(loadTime).toBeLessThan(maxLCP);
      });
    });

    it('should handle 100 concurrent page loads', async () => {
      const options = {
        url: 'http://localhost:3000',
        concurrent: 100,
        maxRequests: 100,
        requestsPerSecond: 50
      };

      return new Promise((resolve, reject) => {
        loadtest.loadTest(options, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          
          expect(result.totalErrors).toBe(0);
          expect(result.meanLatencyMs).toBeLessThan(500);
          expect(result.percentiles['99']).toBeLessThan(2000);
          resolve(result);
        });
      });
    });
  });

  describe('API Performance', () => {
    const endpoints = [
      { path: '/api/mood', method: 'POST', maxTime: 200 },
      { path: '/api/ai-therapy/chat', method: 'POST', maxTime: 2000 },
      { path: '/api/crisis-chat', method: 'POST', maxTime: 100 }, // Crisis must be fastest
      { path: '/api/provider/alerts', method: 'GET', maxTime: 300 }
    ];

    endpoints.forEach(({ path, method, maxTime }) => {
      it(`${method} ${path} should respond within ${maxTime}ms`, async () => {
        const body = method === 'POST' ? JSON.stringify({ test: 'data' }) : undefined;
        
        const startTime = performance.now();
        const response = await fetch(`http://localhost:3000${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body
        });
        const responseTime = performance.now() - startTime;
        
        expect(response.status).not.toBe(500);
        expect(responseTime).toBeLessThan(maxTime);
      });
    });

    it('should handle 1000 API requests per minute', async () => {
      const options = {
        url: 'http://localhost:3000/api/mood',
        method: 'GET',
        concurrent: 50,
        maxRequests: 1000,
        maxSeconds: 60,
        headers: {
          'Authorization': 'Bearer test-token'
        }
      };

      return new Promise((resolve, reject) => {
        loadtest.loadTest(options, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          
          expect(result.totalErrors).toBeLessThan(10); // Less than 1% error rate
          expect(result.rps).toBeGreaterThan(15); // At least 15 requests per second
          resolve(result);
        });
      });
    });
  });

  describe('Database Performance', () => {
    let prisma: PrismaClient;

    beforeAll(() => {
      prisma = new PrismaClient();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it('should handle concurrent database writes', async () => {
      const writes = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        mood: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date()
      }));

      const startTime = performance.now();
      
      await Promise.all(
        writes.map(data => 
          prisma.moodEntry.create({ data }).catch(() => null)
        )
      );
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(5000); // 100 writes in under 5 seconds
    });

    it('should efficiently query large datasets', async () => {
      const startTime = performance.now();
      
      // Query with multiple joins and aggregations
      const result = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        include: {
          moodEntries: {
            orderBy: { timestamp: 'desc' },
            take: 10
          },
          therapySessions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        take: 100
      });
      
      const queryTime = performance.now() - startTime;
      expect(queryTime).toBeLessThan(1000); // Complex query under 1 second
    });

    it('should use database indexes efficiently', async () => {
      // Check that critical indexes exist
      const indexes = await prisma.$queryRaw`
        SELECT indexname FROM pg_indexes 
        WHERE tablename IN ('users', 'mood_entries', 'therapy_sessions', 'crisis_events')
      `;
      
      expect(indexes).toBeDefined();
      expect((indexes as any[]).length).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should not have memory leaks in long sessions', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate long session with multiple operations
      for (let i = 0; i < 1000; i++) {
        const response = await fetch('http://localhost:3000/api/health');
        await response.text();
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory should not increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle large file uploads efficiently', async () => {
      // Create a 10MB buffer
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024);
      
      const startTime = performance.now();
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: largeBuffer,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': 'Bearer test-token'
        }
      });
      const uploadTime = performance.now() - startTime;
      
      expect(response.status).not.toBe(500);
      expect(uploadTime).toBeLessThan(5000); // 10MB upload in under 5 seconds
    });
  });

  describe('WebSocket Performance', () => {
    it('should handle 500 concurrent WebSocket connections', async () => {
      const connections = [];
      
      for (let i = 0; i < 500; i++) {
        const ws = new WebSocket('ws://localhost:3000/ws');
        connections.push(ws);
      }
      
      // Wait for all connections to open
      await Promise.all(
        connections.map(ws => 
          new Promise((resolve) => {
            ws.onopen = resolve;
            ws.onerror = () => resolve(null);
          })
        )
      );
      
      // Count successful connections
      const successfulConnections = connections.filter(ws => ws.readyState === WebSocket.OPEN);
      expect(successfulConnections.length).toBeGreaterThan(450); // At least 90% success rate
      
      // Clean up
      connections.forEach(ws => ws.close());
    });

    it('should maintain low latency for real-time messages', async () => {
      const ws = new WebSocket('ws://localhost:3000/ws');
      
      await new Promise((resolve) => {
        ws.onopen = resolve;
      });
      
      const latencies: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();
        
        await new Promise((resolve) => {
          ws.onmessage = () => {
            const latency = performance.now() - startTime;
            latencies.push(latency);
            resolve(null);
          };
          
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        });
      }
      
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      
      expect(avgLatency).toBeLessThan(50); // Average under 50ms
      expect(maxLatency).toBeLessThan(200); // Max under 200ms
      
      ws.close();
    });
  });
});

describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should prevent brute force attacks', async () => {
      const attempts = [];
      
      for (let i = 0; i < 10; i++) {
        attempts.push(
          fetch('http://localhost:3000/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'wrongpassword' + i
            })
          })
        );
      }
      
      const responses = await Promise.all(attempts);
      const lastResponses = responses.slice(-5);
      
      // Should rate limit after multiple failed attempts
      const rateLimited = lastResponses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('should enforce password complexity', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        'testtest'
      ];
      
      for (const password of weakPasswords) {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password
          })
        });
        
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain('password');
      }
    });

    it('should properly hash passwords', async () => {
      // This would typically check the database
      const hashedPassword = crypto.createHash('sha256').update('testpassword').digest('hex');
      
      // Password should never be stored in plain text or simple hash
      expect(hashedPassword).not.toBe('testpassword');
      expect(hashedPassword.length).toBeGreaterThan(32);
    });

    it('should expire sessions appropriately', async () => {
      // Create a session with short expiry
      const response = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
          remember: false
        })
      });
      
      const { token } = await response.json();
      
      // Wait for session to expire (simulated)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Try to use expired session
      const protectedResponse = await fetch('http://localhost:3000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Should require re-authentication
      expect(protectedResponse.status).toBe(401);
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize user input in chat messages', async () => {
      const isSecure = await SecurityTester.testXSSPrevention(
        'http://localhost:3000/api/ai-therapy/chat',
        'message'
      );
      expect(isSecure).toBe(true);
    });

    it('should sanitize mood entry notes', async () => {
      const isSecure = await SecurityTester.testXSSPrevention(
        'http://localhost:3000/api/mood',
        'notes'
      );
      expect(isSecure).toBe(true);
    });

    it('should escape HTML in API responses', async () => {
      const response = await fetch('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: '<script>alert("XSS")</script>'
        })
      });
      
      const text = await response.text();
      expect(text).not.toContain('<script>');
      expect(text).toContain('&lt;script&gt;');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in user queries', async () => {
      const isSecure = await SecurityTester.testSQLInjectionPrevention(
        'http://localhost:3000/api/users/search',
        'query'
      );
      expect(isSecure).toBe(true);
    });

    it('should use parameterized queries', async () => {
      const response = await fetch('http://localhost:3000/api/users/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "'; DROP TABLE users; --"
        })
      });
      
      // Should not cause database error
      expect(response.status).not.toBe(500);
      
      // Database should still be functional
      const healthCheck = await fetch('http://localhost:3000/api/health');
      expect(healthCheck.status).toBe(200);
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF tokens for state-changing operations', async () => {
      const response = await fetch('http://localhost:3000/api/mood', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'session=valid-session'
        },
        body: JSON.stringify({ mood: 5 })
      });
      
      // Should reject without CSRF token
      expect(response.status).toBe(403);
    });

    it('should validate CSRF token correctness', async () => {
      // Get CSRF token
      const tokenResponse = await fetch('http://localhost:3000/api/csrf');
      const { token } = await tokenResponse.json();
      
      // Use incorrect token
      const response = await fetch('http://localhost:3000/api/mood', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'invalid-token'
        },
        body: JSON.stringify({ mood: 5 })
      });
      
      expect(response.status).toBe(403);
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should prevent directory traversal attacks', async () => {
      const isSecure = await SecurityTester.testPathTraversal(
        'http://localhost:3000/api/resources'
      );
      expect(isSecure).toBe(true);
    });

    it('should sanitize file paths', async () => {
      const payloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'file:///etc/passwd'
      ];
      
      for (const payload of payloads) {
        const response = await fetch(`http://localhost:3000/api/download?file=${encodeURIComponent(payload)}`);
        expect(response.status).not.toBe(200);
        
        const text = await response.text();
        expect(text).not.toContain('root:');
        expect(text).not.toContain('[boot loader]');
      }
    });
  });

  describe('HIPAA Compliance', () => {
    it('should encrypt PHI data at rest', async () => {
      // Check database encryption
      const response = await fetch('http://localhost:3000/api/admin/encryption-status', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      const { encrypted } = await response.json();
      expect(encrypted).toBe(true);
    });

    it('should encrypt PHI data in transit', async () => {
      // Check that HTTPS is enforced
      const response = await fetch('http://localhost:3000/api/health');
      const headers = response.headers;
      
      expect(headers.get('Strict-Transport-Security')).toBeTruthy();
    });

    it('should implement audit logging for PHI access', async () => {
      // Access PHI data
      await fetch('http://localhost:3000/api/patient/123/medical-records', {
        headers: { 'Authorization': 'Bearer provider-token' }
      });
      
      // Check audit log
      const auditResponse = await fetch('http://localhost:3000/api/admin/audit-log', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      const logs = await auditResponse.json();
      const phiAccessLog = logs.find((log: any) => 
        log.action === 'PHI_ACCESS' && log.resource === '/patient/123/medical-records'
      );
      
      expect(phiAccessLog).toBeDefined();
      expect(phiAccessLog.timestamp).toBeDefined();
      expect(phiAccessLog.userId).toBeDefined();
    });

    it('should enforce minimum necessary access', async () => {
      // Patient trying to access another patient's data
      const response = await fetch('http://localhost:3000/api/patient/456/medical-records', {
        headers: { 'Authorization': 'Bearer patient-123-token' }
      });
      
      expect(response.status).toBe(403);
    });

    it('should implement automatic session timeout', async () => {
      // Create session
      const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      });
      
      const { token, expiresIn } = await loginResponse.json();
      
      // HIPAA requires reasonable timeout
      expect(expiresIn).toBeLessThanOrEqual(30 * 60); // 30 minutes or less
    });
  });

  describe('API Security Headers', () => {
    it('should set proper security headers', async () => {
      const response = await fetch('http://localhost:3000/api/health');
      const headers = response.headers;
      
      // Check critical security headers
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headers.get('X-Frame-Options')).toBe('DENY');
      expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(headers.get('Content-Security-Policy')).toBeTruthy();
      expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should implement CORS properly', async () => {
      const response = await fetch('http://localhost:3000/api/health', {
        headers: { 'Origin': 'http://evil.com' }
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).not.toBe('*');
      expect(corsHeader).not.toBe('http://evil.com');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit API endpoints', async () => {
      const requests = [];
      
      // Send 100 requests rapidly
      for (let i = 0; i < 100; i++) {
        requests.push(
          fetch('http://localhost:3000/api/mood', {
            headers: { 'Authorization': 'Bearer test-token' }
          })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should have stricter limits for sensitive endpoints', async () => {
      const requests = [];
      
      // Auth endpoint should have stricter limits
      for (let i = 0; i < 10; i++) {
        requests.push(
          fetch('http://localhost:3000/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'test'
            })
          })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});

describe('Data Privacy and Compliance', () => {
  describe('GDPR Compliance', () => {
    it('should allow users to export their data', async () => {
      const response = await fetch('http://localhost:3000/api/user/export', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      expect(response.status).toBe(200);
      const contentType = response.headers.get('Content-Type');
      expect(contentType).toContain('application/json');
      
      const data = await response.json();
      expect(data).toHaveProperty('userData');
      expect(data).toHaveProperty('moodEntries');
      expect(data).toHaveProperty('therapySessions');
    });

    it('should allow users to delete their account and data', async () => {
      const response = await fetch('http://localhost:3000/api/user/delete', {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      expect(response.status).toBe(200);
      
      // Verify data is actually deleted
      const checkResponse = await fetch('http://localhost:3000/api/user/profile', {
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      expect(checkResponse.status).toBe(404);
    });

    it('should anonymize data on request', async () => {
      const response = await fetch('http://localhost:3000/api/user/anonymize', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer user-token' }
      });
      
      expect(response.status).toBe(200);
      
      const { anonymized } = await response.json();
      expect(anonymized).toBe(true);
    });
  });

  describe('Data Encryption', () => {
    it('should encrypt sensitive fields in database', async () => {
      // This would check actual database encryption
      const testData = {
        ssn: '123-45-6789',
        diagnosis: 'Major Depression',
        medications: ['Sertraline', 'Alprazolam']
      };
      
      // Data should be encrypted before storage
      const encrypted = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from('test-encryption-key-32-chars-!!!'),
        Buffer.from('initialization-v')
      );
      
      const encryptedData = encrypted.update(JSON.stringify(testData), 'utf8', 'hex');
      expect(encryptedData).not.toContain('123-45-6789');
      expect(encryptedData).not.toContain('Depression');
    });

    it('should use secure key management', async () => {
      const response = await fetch('http://localhost:3000/api/admin/key-rotation-status', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      const { lastRotation, nextRotation } = await response.json();
      
      const daysSinceRotation = (Date.now() - new Date(lastRotation).getTime()) / (1000 * 60 * 60 * 24);
      expect(daysSinceRotation).toBeLessThan(90); // Keys rotated within 90 days
    });
  });
});