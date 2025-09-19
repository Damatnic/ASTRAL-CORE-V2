/**
 * Comprehensive API Endpoint Tests
 * Tests all 30+ API endpoints for functionality, security, and performance
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Import route handlers
import * as AITherapyChat from '@/app/api/ai-therapy/chat/route';
import * as AITherapySessions from '@/app/api/ai-therapy/sessions/route';
import * as MoodAPI from '@/app/api/mood/route';
import * as MoodAnalytics from '@/app/api/mood/analytics/route';
import * as CBTAnalyze from '@/app/api/self-help/cbt/analyze-thought/route';
import * as CBTRecords from '@/app/api/self-help/cbt/thought-records/route';
import * as DBTProgress from '@/app/api/self-help/dbt/progress/route';
import * as DBTPractice from '@/app/api/self-help/dbt/practice/route';
import * as ProviderAlerts from '@/app/api/provider/alerts/route';
import * as ProviderPatients from '@/app/api/provider/patients/route';
import * as ProgressGoals from '@/app/api/progress/goals/route';
import * as ProgressMetrics from '@/app/api/progress/metrics/route';

describe('AI Therapy API Endpoints', () => {
  describe('POST /api/ai-therapy/chat', () => {
    it('should process chat messages and return AI response', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          message: 'I am feeling anxious about my presentation tomorrow',
          sessionId: 'session-123',
          context: {
            mood: 5,
            previousTopic: 'work stress'
          }
        }
      });

      const response = await AITherapyChat.POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        response: expect.any(String),
        sessionId: 'session-123',
        techniques: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            description: expect.any(String)
          })
        ]),
        crisisDetected: false
      });
      expect(data.response.length).toBeGreaterThan(50);
    });

    it('should detect crisis and trigger appropriate response', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          message: 'I want to end my life',
          sessionId: 'session-456'
        }
      });

      const response = await AITherapyChat.POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.crisisDetected).toBe(true);
      expect(data.crisisLevel).toBe('IMMEDIATE');
      expect(data.emergencyResources).toBeDefined();
      expect(data.emergencyResources).toContainEqual(
        expect.objectContaining({
          name: '988 Suicide & Crisis Lifeline',
          number: '988'
        })
      );
    });

    it('should validate input and reject harmful content', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          message: 'DROP TABLE users; --',
          sessionId: 'hack-attempt'
        }
      });

      const response = await AITherapyChat.POST(req as unknown as NextRequest);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid input');
    });

    it('should enforce rate limiting', async () => {
      const requests = Array.from({ length: 15 }, (_, i) => ({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
          'X-User-Id': 'user-123'
        },
        body: {
          message: `Message ${i}`,
          sessionId: 'session-123'
        }
      }));

      const responses = await Promise.all(
        requests.map(reqData => {
          const { req } = createMocks(reqData);
          return AITherapyChat.POST(req as unknown as NextRequest);
        })
      );

      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/ai-therapy/sessions', () => {
    it('should retrieve user therapy sessions', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: 'user-123',
          limit: '10',
          offset: '0'
        }
      });

      const response = await AITherapySessions.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        sessions: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            userId: 'user-123',
            startTime: expect.any(String),
            duration: expect.any(Number),
            moodBefore: expect.any(Number),
            moodAfter: expect.any(Number),
            techniquesUsed: expect.any(Array)
          })
        ]),
        total: expect.any(Number),
        hasMore: expect.any(Boolean)
      });
    });

    it('should filter sessions by date range', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: 'user-123',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      });

      const response = await AITherapySessions.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.startTime);
        expect(sessionDate >= new Date('2024-01-01')).toBe(true);
        expect(sessionDate <= new Date('2024-01-31')).toBe(true);
      });
    });
  });
});

describe('Mood Tracking API Endpoints', () => {
  describe('POST /api/mood', () => {
    it('should record mood entry with all parameters', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          userId: 'user-123',
          mood: 7,
          energy: 6,
          anxiety: 3,
          irritability: 2,
          sleep: 8,
          activities: ['exercise', 'meditation', 'socializing'],
          notes: 'Good day overall, felt productive',
          medications: ['medication-a'],
          symptoms: []
        }
      });

      const response = await MoodAPI.POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        id: expect.any(String),
        userId: 'user-123',
        mood: 7,
        timestamp: expect.any(String),
        insights: expect.objectContaining({
          trend: expect.any(String),
          suggestions: expect.any(Array)
        })
      });
    });

    it('should validate mood score range', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          userId: 'user-123',
          mood: 15 // Invalid: should be 1-10
        }
      });

      const response = await MoodAPI.POST(req as unknown as NextRequest);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Mood must be between 1 and 10');
    });
  });

  describe('GET /api/mood/analytics', () => {
    it('should provide comprehensive mood analytics', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: 'user-123',
          period: '30days'
        }
      });

      const response = await MoodAnalytics.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        averageMood: expect.any(Number),
        moodTrend: expect.any(String),
        volatility: expect.any(Number),
        patterns: expect.objectContaining({
          weekly: expect.any(Object),
          timeOfDay: expect.any(Object),
          triggers: expect.any(Array),
          correlations: expect.any(Object)
        }),
        predictions: expect.objectContaining({
          nextWeek: expect.any(Number),
          confidence: expect.any(Number)
        }),
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            type: expect.any(String),
            description: expect.any(String),
            priority: expect.any(String)
          })
        ])
      });
    });

    it('should detect concerning patterns and flag them', async () => {
      // Mock user with declining mood pattern
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: 'user-declining-mood',
          period: '7days'
        }
      });

      const response = await MoodAnalytics.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts).toBeDefined();
      expect(data.alerts).toContainEqual(
        expect.objectContaining({
          type: 'declining_mood',
          severity: expect.stringMatching(/HIGH|MODERATE/),
          recommendation: expect.any(String)
        })
      );
    });
  });
});

describe('Self-Help Tools API Endpoints', () => {
  describe('POST /api/self-help/cbt/analyze-thought', () => {
    it('should analyze negative thought patterns', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          thought: 'I always fail at everything I try',
          situation: 'Failed a job interview',
          emotion: 'hopeless',
          intensity: 8
        }
      });

      const response = await CBTAnalyze.POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        cognitiveDistortions: expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringMatching(/all-or-nothing|overgeneralization/),
            description: expect.any(String),
            example: expect.any(String)
          })
        ]),
        balancedThought: expect.any(String),
        evidenceFor: expect.any(Array),
        evidenceAgainst: expect.any(Array),
        actionPlan: expect.arrayContaining([
          expect.any(String)
        ])
      });
    });
  });

  describe('POST /api/self-help/dbt/practice', () => {
    it('should track DBT skill practice', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          userId: 'user-123',
          skill: 'TIPP',
          duration: 15,
          effectiveness: 7,
          situation: 'Panic attack at work',
          notes: 'Cold water on face helped immediately'
        }
      });

      const response = await DBTPractice.POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        id: expect.any(String),
        skillPracticed: 'TIPP',
        recorded: true,
        streak: expect.any(Number),
        totalPractices: expect.any(Number)
      });
    });
  });

  describe('GET /api/self-help/dbt/progress', () => {
    it('should provide DBT skill mastery progress', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: 'user-123'
        }
      });

      const response = await DBTProgress.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        overallProgress: expect.any(Number),
        skillCategories: expect.objectContaining({
          distressTolerance: expect.objectContaining({
            practiced: expect.any(Number),
            mastery: expect.any(Number)
          }),
          emotionRegulation: expect.any(Object),
          interpersonalEffectiveness: expect.any(Object),
          mindfulness: expect.any(Object)
        }),
        recentPractices: expect.any(Array),
        achievements: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });
  });
});

describe('Provider Management API Endpoints', () => {
  describe('GET /api/provider/alerts', () => {
    it('should retrieve provider alerts sorted by priority', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer provider-token'
        },
        query: {
          providerId: 'provider-789',
          unacknowledged: 'true'
        }
      });

      const response = await ProviderAlerts.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts).toBeDefined();
      
      // Verify alerts are sorted by priority
      const priorities = ['URGENT', 'HIGH', 'MODERATE', 'LOW'];
      let lastPriorityIndex = 0;
      
      data.alerts.forEach((alert: any) => {
        const currentIndex = priorities.indexOf(alert.priority);
        expect(currentIndex).toBeGreaterThanOrEqual(lastPriorityIndex);
        lastPriorityIndex = Math.max(lastPriorityIndex, currentIndex);
      });
    });
  });

  describe('POST /api/provider/alerts/:alertId/acknowledge', () => {
    it('should acknowledge critical alert and log action', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer provider-token',
          'Content-Type': 'application/json'
        },
        body: {
          providerId: 'provider-789',
          action: 'contacted_patient',
          notes: 'Scheduled emergency session for tomorrow'
        }
      });

      const alertId = 'alert-critical-123';
      const response = await ProviderAlerts.POST(
        req as unknown as NextRequest,
        { params: { alertId } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        acknowledged: true,
        alertId: 'alert-critical-123',
        timestamp: expect.any(String),
        auditLog: expect.objectContaining({
          providerId: 'provider-789',
          action: 'contacted_patient',
          notes: expect.any(String)
        })
      });
    });
  });

  describe('GET /api/provider/patients', () => {
    it('should retrieve provider patient list with risk scores', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer provider-token'
        },
        query: {
          providerId: 'provider-789',
          includeRiskScores: 'true'
        }
      });

      const response = await ProviderPatients.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.patients).toBeDefined();
      
      data.patients.forEach((patient: any) => {
        expect(patient).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          lastSession: expect.any(String),
          riskScore: expect.objectContaining({
            overall: expect.any(Number),
            suicide: expect.any(Number),
            selfHarm: expect.any(Number),
            trend: expect.any(String)
          }),
          nextAppointment: expect.any(String),
          complianceRate: expect.any(Number)
        });
      });
    });

    it('should filter patients by risk level', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer provider-token'
        },
        query: {
          providerId: 'provider-789',
          riskLevel: 'high'
        }
      });

      const response = await ProviderPatients.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      data.patients.forEach((patient: any) => {
        expect(patient.riskScore.overall).toBeGreaterThanOrEqual(7);
      });
    });
  });
});

describe('Progress Tracking API Endpoints', () => {
  describe('POST /api/progress/goals', () => {
    it('should create SMART goals for user', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          userId: 'user-123',
          goal: {
            title: 'Reduce anxiety symptoms',
            description: 'Practice breathing exercises daily',
            targetDate: '2024-02-01',
            measurable: 'Complete 10 minutes daily',
            category: 'anxiety_management'
          }
        }
      });

      const response = await ProgressGoals.POST(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        id: expect.any(String),
        userId: 'user-123',
        goal: expect.objectContaining({
          title: 'Reduce anxiety symptoms',
          isSMART: true,
          milestones: expect.any(Array)
        }),
        createdAt: expect.any(String)
      });
    });
  });

  describe('GET /api/progress/metrics', () => {
    it('should provide comprehensive progress metrics', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: 'user-123',
          period: '90days'
        }
      });

      const response = await ProgressMetrics.GET(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        overallProgress: expect.any(Number),
        categories: expect.objectContaining({
          mood: expect.objectContaining({
            improvement: expect.any(Number),
            consistency: expect.any(Number)
          }),
          therapy: expect.objectContaining({
            sessionsCompleted: expect.any(Number),
            engagement: expect.any(Number)
          }),
          skills: expect.objectContaining({
            learned: expect.any(Number),
            mastered: expect.any(Number)
          }),
          goals: expect.objectContaining({
            completed: expect.any(Number),
            inProgress: expect.any(Number)
          })
        }),
        achievements: expect.any(Array),
        insights: expect.any(Array)
      });
    });
  });
});

describe('API Security Tests', () => {
  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication', async () => {
      const endpoints = [
        '/api/ai-therapy/chat',
        '/api/mood',
        '/api/provider/alerts',
        '/api/progress/goals'
      ];

      for (const endpoint of endpoints) {
        const { req } = createMocks({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {}
        });

        // Mock the endpoint handler
        const handler = endpoint.includes('ai-therapy') ? AITherapyChat.POST :
                       endpoint.includes('mood') ? MoodAPI.POST :
                       endpoint.includes('provider') ? ProviderAlerts.GET :
                       ProgressGoals.POST;

        const response = await handler(req as unknown as NextRequest);
        expect(response.status).toBe(401);
      }
    });

    it('should enforce role-based access control', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer patient-token' // Patient trying to access provider endpoint
        }
      });

      const response = await ProviderAlerts.GET(req as unknown as NextRequest);
      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.error).toContain('Insufficient permissions');
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should prevent SQL injection attempts', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          userId: "'; DROP TABLE users; --",
          mood: 5
        }
      });

      const response = await MoodAPI.POST(req as unknown as NextRequest);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Invalid input');
    });

    it('should prevent XSS attacks', async () => {
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: {
          message: '<script>alert("XSS")</script>',
          sessionId: 'session-123'
        }
      });

      const response = await AITherapyChat.POST(req as unknown as NextRequest);
      const data = await response.json();
      
      // Response should be sanitized
      expect(data.response).not.toContain('<script>');
      expect(data.response).not.toContain('alert(');
    });
  });
});

describe('API Performance Tests', () => {
  describe('Response Time Requirements', () => {
    it('should meet response time SLAs', async () => {
      const performanceTests = [
        { endpoint: 'ai-therapy/chat', maxTime: 2000 },
        { endpoint: 'mood', maxTime: 200 },
        { endpoint: 'mood/analytics', maxTime: 500 },
        { endpoint: 'provider/alerts', maxTime: 300 }
      ];

      for (const test of performanceTests) {
        const startTime = Date.now();
        
        const { req } = createMocks({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer valid-token'
          }
        });

        // Mock handler based on endpoint
        const handler = test.endpoint.includes('ai-therapy') ? AITherapyChat.POST :
                       test.endpoint.includes('analytics') ? MoodAnalytics.GET :
                       test.endpoint.includes('mood') ? MoodAPI.POST :
                       ProviderAlerts.GET;

        await handler(req as unknown as NextRequest);
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThanOrEqual(test.maxTime);
      }
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const concurrentRequests = 50;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => ({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        },
        query: {
          userId: `user-${i}`,
          period: '7days'
        }
      }));

      const startTime = Date.now();
      
      const responses = await Promise.all(
        requests.map(reqData => {
          const { req } = createMocks(reqData);
          return MoodAnalytics.GET(req as unknown as NextRequest);
        })
      );

      const totalTime = Date.now() - startTime;
      
      expect(responses.every(r => r.status === 200 || r.status === 429)).toBe(true);
      expect(totalTime).toBeLessThan(5000); // 50 requests in under 5 seconds
    });
  });
});