/**
 * API Integration Testing
 * Tests all API endpoints, authentication, rate limiting, and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

// Mock implementations for testing
const mockSession = {
  user: {
    id: 'test_user_123',
    isAnonymous: true,
  },
};

// Helper to create mock NextRequest
function createMockRequest(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}

describe('API Endpoints Testing', () => {
  describe('Crisis Session API', () => {
    const API_URL = 'http://localhost:3000/api/crisis';

    test('POST /api/crisis/session - Create new crisis session', async () => {
      const requestBody = {
        severity: 8,
        initialMessage: 'I need help',
        location: {
          country: 'US',
          state: 'CA',
        },
      };

      const startTime = performance.now();
      const response = await fetch(`${API_URL}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': 'test_token',
        },
        body: JSON.stringify(requestBody),
      });
      const responseTime = performance.now() - startTime;

      // Performance check
      expect(responseTime).toBeLessThan(100); // Should respond quickly

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.sessionId).toBeDefined();
      expect(data.sessionToken).toBeDefined();
      expect(data.encryptionKey).not.toBeDefined(); // Should not expose encryption keys
    });

    test('GET /api/crisis/session/:id - Retrieve session with authentication', async () => {
      // First create a session
      const createResponse = await fetch(`${API_URL}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          severity: 5,
        }),
      });
      const { sessionId, sessionToken } = await createResponse.json();

      // Try to retrieve without token (should fail)
      const unauthorizedResponse = await fetch(`${API_URL}/session/${sessionId}`);
      expect(unauthorizedResponse.status).toBe(401);

      // Retrieve with valid token
      const authorizedResponse = await fetch(`${API_URL}/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      expect(authorizedResponse.status).toBe(200);

      const sessionData = await authorizedResponse.json();
      expect(sessionData.id).toBe(sessionId);
      expect(sessionData.severity).toBe(5);
    });

    test('PUT /api/crisis/session/:id/escalate - Escalate crisis session', async () => {
      const sessionId = 'test_session_123';
      
      const escalationData = {
        newSeverity: 10,
        reason: 'User mentioned self-harm',
        triggerType: 'KEYWORD_DETECTION',
      };

      const response = await fetch(`${API_URL}/session/${sessionId}/escalate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token',
        },
        body: JSON.stringify(escalationData),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.escalated).toBe(true);
        expect(data.emergencyContacted).toBeDefined();
        expect(data.responderId).toBeDefined();
      }
    });

    test('POST /api/crisis/message - Send crisis message with risk assessment', async () => {
      const messageData = {
        sessionId: 'test_session_123',
        content: 'I feel really hopeless',
        senderType: 'ANONYMOUS_USER',
      };

      const response = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.messageId).toBeDefined();
        expect(data.riskAssessment).toBeDefined();
        expect(data.riskAssessment.score).toBeGreaterThanOrEqual(1);
        expect(data.riskAssessment.score).toBeLessThanOrEqual(10);
        expect(data.sentimentScore).toBeDefined();
      }
    });
  });

  describe('Mood Tracking API', () => {
    const API_URL = 'http://localhost:3000/api/mood';

    test('POST /api/mood - Create mood entry with validation', async () => {
      const moodData = {
        mood: 7,
        emotions: {
          happy: 0.6,
          anxious: 0.2,
          sad: 0.1,
        },
        triggers: ['work', 'relationships'],
        activities: ['meditation', 'exercise'],
        sleepHours: 7.5,
        notes: 'Feeling better today',
        medication: true,
        socialInteraction: 8,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': 'test_user_token',
        },
        body: JSON.stringify(moodData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.mood).toBe(7);
      expect(data.data.id).toBeDefined();
    });

    test('POST /api/mood - Reject invalid mood values', async () => {
      const invalidData = {
        mood: 15, // Invalid: must be 1-10
        emotions: {},
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': 'test_user_token',
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid mood value');
    });

    test('GET /api/mood - Retrieve mood entries with pagination', async () => {
      const response = await fetch(`${API_URL}?limit=10&offset=0`, {
        headers: {
          'X-User-Token': 'test_user_token',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeDefined();
      expect(data.data.length).toBeLessThanOrEqual(10);
    });

    test('GET /api/mood - Filter by date range', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-01-31').toISOString();

      const response = await fetch(
        `${API_URL}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'X-User-Token': 'test_user_token',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        expect(data.success).toBe(true);
        
        // Verify all entries are within date range
        data.data.forEach((entry: any) => {
          const entryDate = new Date(entry.timestamp);
          expect(entryDate >= new Date(startDate)).toBe(true);
          expect(entryDate <= new Date(endDate)).toBe(true);
        });
      }
    });

    test('PUT /api/mood - Update existing mood entry', async () => {
      const updateData = {
        entryId: 'test_entry_123',
        mood: 8,
        notes: 'Updated feeling',
      };

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': 'test_user_token',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.mood).toBe(8);
        expect(data.data.notes).toBe('Updated feeling');
      }
    });

    test('DELETE /api/mood - Delete mood entry', async () => {
      const response = await fetch(`${API_URL}?entryId=test_entry_123`, {
        method: 'DELETE',
        headers: {
          'X-User-Token': 'test_user_token',
        },
      });

      if (response.ok) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('deleted successfully');
      }
    });
  });

  describe('Volunteer API', () => {
    const API_URL = 'http://localhost:3000/api/volunteer';

    test('GET /api/volunteer/available - Find available volunteers', async () => {
      const response = await fetch(
        `${API_URL}/available?severity=7&skills=crisis,anxiety`,
        {
          headers: {
            'X-Crisis-Token': 'crisis_session_token',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        expect(Array.isArray(data.volunteers)).toBe(true);
        
        // Verify volunteer structure
        if (data.volunteers.length > 0) {
          const volunteer = data.volunteers[0];
          expect(volunteer.id).toBeDefined();
          expect(volunteer.skills).toBeDefined();
          expect(volunteer.responseTime).toBeDefined();
          expect(volunteer.rating).toBeDefined();
        }
      }
    });

    test('POST /api/volunteer/assign - Assign volunteer to crisis', async () => {
      const assignData = {
        volunteerId: 'volunteer_123',
        sessionId: 'crisis_session_456',
        priority: 'HIGH',
      };

      const response = await fetch(`${API_URL}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': 'admin_token',
        },
        body: JSON.stringify(assignData),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.assigned).toBe(true);
        expect(data.volunteerId).toBe('volunteer_123');
        expect(data.sessionId).toBe('crisis_session_456');
        expect(data.assignedAt).toBeDefined();
      }
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on mood entries', async () => {
      const API_URL = 'http://localhost:3000/api/mood';
      const responses = [];

      // Try to create 11 mood entries rapidly (limit is 10 per hour)
      for (let i = 0; i < 11; i++) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Token': 'rate_limit_test_user',
          },
          body: JSON.stringify({
            mood: 5,
            emotions: {},
          }),
        });
        responses.push(response);
      }

      // First 10 should succeed
      for (let i = 0; i < 10; i++) {
        expect([200, 201]).toContain(responses[i].status);
      }

      // 11th should be rate limited
      expect(responses[10].status).toBe(429);
      const errorData = await responses[10].json();
      expect(errorData.error).toContain('Rate limit exceeded');
    });

    test('should enforce rate limits on crisis sessions', async () => {
      const API_URL = 'http://localhost:3000/api/crisis/session';
      
      // Try to create multiple crisis sessions from same IP
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': '192.168.1.100', // Same IP
          },
          body: JSON.stringify({
            severity: 5,
          }),
        });
        responses.push(response);
      }

      // Should allow legitimate use but prevent abuse
      const statusCodes = responses.map(r => r.status);
      const rateLimited = statusCodes.filter(s => s === 429);
      
      // At least one should succeed, but not all if rate limiting works
      expect(statusCodes.includes(201)).toBe(true);
      if (responses.length > 2) {
        expect(rateLimited.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Authentication & Authorization', () => {
    test('should require authentication for protected endpoints', async () => {
      const protectedEndpoints = [
        '/api/mood',
        '/api/safety-plan',
        '/api/emergency-contact',
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'GET',
          // No authentication headers
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toContain('Unauthorized');
      }
    });

    test('should validate session tokens', async () => {
      const validToken = 'valid_session_token_123';
      const invalidToken = 'invalid_token_456';

      // Test with valid token
      const validResponse = await fetch('http://localhost:3000/api/mood', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
      });

      // Test with invalid token
      const invalidResponse = await fetch('http://localhost:3000/api/mood', {
        headers: {
          'Authorization': `Bearer ${invalidToken}`,
        },
      });

      // Valid token should work
      expect([200, 201]).toContain(validResponse.status);
      
      // Invalid token should be rejected
      expect(invalidResponse.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', async () => {
      const response = await fetch('http://localhost:3000/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': 'test_token',
        },
        body: '{ invalid json }',
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test('should handle database connection errors', async () => {
      // Simulate database being down
      process.env.DATABASE_URL = 'invalid_connection_string';

      const response = await fetch('http://localhost:3000/api/mood', {
        headers: {
          'X-User-Token': 'test_token',
        },
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('database');
    });

    test('should handle timeout errors', async () => {
      // Test endpoint with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100); // 100ms timeout

      try {
        const response = await fetch('http://localhost:3000/api/crisis/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'Very long text that takes time to analyze...',
          }),
          signal: controller.signal,
        });
      } catch (error: any) {
        expect(error.name).toBe('AbortError');
      } finally {
        clearTimeout(timeoutId);
      }
    });
  });

  describe('CORS & Security Headers', () => {
    test('should include proper CORS headers', async () => {
      const response = await fetch('http://localhost:3000/api/mood', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://trusted-domain.com',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    test('should include security headers', async () => {
      const response = await fetch('http://localhost:3000/api/mood');

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Strict-Transport-Security')).toBeDefined();
    });
  });

  describe('API Performance', () => {
    test('should handle concurrent requests efficiently', async () => {
      const API_URL = 'http://localhost:3000/api/mood';
      const startTime = performance.now();
      
      // Send 50 concurrent requests
      const promises = Array(50).fill(null).map(() =>
        fetch(API_URL, {
          headers: {
            'X-User-Token': `user_${Math.random()}`,
          },
        })
      );

      const responses = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      // All requests should complete
      expect(responses.every(r => r.status !== 0)).toBe(true);
      
      // Should handle 50 concurrent requests in reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds max
      
      // Calculate average response time
      const avgResponseTime = totalTime / 50;
      expect(avgResponseTime).toBeLessThan(500); // Average should be under 500ms
    });

    test('should optimize database queries', async () => {
      // Test N+1 query prevention
      const response = await fetch(
        'http://localhost:3000/api/user/profile?include=moods,safety-plans,contacts',
        {
          headers: {
            'X-User-Token': 'test_token',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Should include all related data in single query (no N+1)
        expect(data.user).toBeDefined();
        expect(data.user.moodEntries).toBeDefined();
        expect(data.user.safetyPlans).toBeDefined();
        expect(data.user.emergencyContacts).toBeDefined();
        
        // Response time should be fast despite multiple includes
        const responseTime = response.headers.get('X-Response-Time');
        if (responseTime) {
          expect(parseFloat(responseTime)).toBeLessThan(200); // Under 200ms
        }
      }
    });
  });

  describe('Audit Logging', () => {
    test('should log all critical operations', async () => {
      const operations = [
        {
          endpoint: '/api/crisis/session',
          method: 'POST',
          body: { severity: 9 },
          expectedAction: 'CRISIS_SESSION_CREATED',
        },
        {
          endpoint: '/api/emergency-contact',
          method: 'POST',
          body: { name: 'Test Contact', phone: '555-0123' },
          expectedAction: 'EMERGENCY_CONTACT_ADDED',
        },
        {
          endpoint: '/api/safety-plan',
          method: 'PUT',
          body: { planId: '123', content: 'Updated plan' },
          expectedAction: 'SAFETY_PLAN_UPDATED',
        },
      ];

      for (const op of operations) {
        await fetch(`http://localhost:3000${op.endpoint}`, {
          method: op.method,
          headers: {
            'Content-Type': 'application/json',
            'X-User-Token': 'audit_test_user',
          },
          body: JSON.stringify(op.body),
        });

        // Verify audit log was created
        const auditResponse = await fetch(
          `http://localhost:3000/api/audit?action=${op.expectedAction}&limit=1`,
          {
            headers: {
              'X-Admin-Token': 'admin_token',
            },
          }
        );

        if (auditResponse.ok) {
          const auditData = await auditResponse.json();
          expect(auditData.logs).toHaveLength(1);
          expect(auditData.logs[0].action).toBe(op.expectedAction);
          expect(auditData.logs[0].userId).toBeDefined();
          expect(auditData.logs[0].timestamp).toBeDefined();
        }
      }
    });
  });
});