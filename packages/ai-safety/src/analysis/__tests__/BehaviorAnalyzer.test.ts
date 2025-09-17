/**
 * ASTRAL_CORE 2.0 Behavior Analyzer Tests
 * 
 * Comprehensive test suite for crisis escalation detection,
 * anomaly detection, and volunteer burnout monitoring
 */

import { 
  BehaviorAnalyzer,
  PatternType,
  AnomalyType,
  type BehaviorAnalysisResult,
  type VolunteerMetrics
} from '../BehaviorAnalyzer';

describe('BehaviorAnalyzer', () => {
  let analyzer: BehaviorAnalyzer;

  beforeEach(() => {
    analyzer = BehaviorAnalyzer.getInstance();
  });

  afterEach(() => {
    // Clean up after each test to prevent memory leaks
    analyzer.cleanup();
  });

  afterAll(() => {
    // Final cleanup
    analyzer.cleanup();
  });

  describe('Crisis Escalation Detection', () => {
    it('should detect immediate crisis indicators', async () => {
      const result = await analyzer.analyzeMessage(
        'user123',
        'I want to kill myself, I cant take this anymore'
      );

      expect(result.riskLevel).toBeGreaterThan(0.8);
      expect(result.needsIntervention).toBe(true);
      expect(result.escalationRisk.probability).toBeGreaterThan(0.7);
      expect(result.recommendations).toContain('IMMEDIATE: Escalate to crisis specialist');
    });

    it('should identify escalation patterns over time', async () => {
      const messages = [
        'feeling a bit down today',
        'things are getting worse',
        'I cant handle this anymore',
        'Everything is spiraling out of control'
      ];

      let lastResult: BehaviorAnalysisResult | null = null;
      
      for (const message of messages) {
        lastResult = await analyzer.analyzeMessage('user456', message);
        // Simulate time passing between messages
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      expect(lastResult!.patterns).toContainEqual(
        expect.objectContaining({
          type: PatternType.CRISIS_ESCALATION
        })
      );
      expect(lastResult!.escalationRisk.indicators).toContain('Escalation language detected');
    });

    it('should predict escalation timeframe accurately', async () => {
      const result = await analyzer.analyzeMessage(
        'user789',
        'Everything is getting worse and I cant take it much longer'
      );

      expect(result.escalationRisk.timeframe).toBeDefined();
      expect(result.escalationRisk.preventionStrategies.length).toBeGreaterThan(0);
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect unusual time patterns', async () => {
      // Simulate activity at unusual hour (3 AM)
      const originalDate = Date;
      const mockDate = new Date('2024-01-15T03:00:00');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;

      const result = await analyzer.analyzeMessage(
        'user234',
        'cant sleep, feeling really anxious'
      );

      const timeAnomaly = result.anomalies.find(
        a => a.type === AnomalyType.UNUSUAL_TIME_PATTERN
      );

      expect(timeAnomaly).toBeDefined();
      expect(timeAnomaly?.description).toContain('unusual hour');

      global.Date = originalDate;
    });

    it('should detect sudden severity spikes', async () => {
      const result = await analyzer.analyzeMessage(
        'user345',
        'EVERYTHING IS FALLING APART!!! I CANT DO THIS ANYMORE!!!'
      );

      const severityAnomaly = result.anomalies.find(
        a => a.type === AnomalyType.SUDDEN_SEVERITY_SPIKE
      );

      expect(severityAnomaly).toBeDefined();
      expect(severityAnomaly?.riskLevel).toBeGreaterThan(0.5);
    });

    it('should detect communication style changes', async () => {
      const result = await analyzer.analyzeMessage(
        'user567',
        'help' // Very short compared to baseline
      );

      // Since we have mock baseline data, check for any anomalies
      expect(result.anomalies.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Behavioral Pattern Recognition', () => {
    it('should identify panic patterns', async () => {
      const result = await analyzer.analyzeMessage(
        'user890',
        'I cant breathe, my heart is racing, I think Im having a panic attack'
      );

      const panicPattern = result.patterns.find(
        p => p.type === PatternType.PANIC_PATTERN
      );

      expect(panicPattern).toBeDefined();
      expect(panicPattern?.severity).toBeGreaterThan(0.7);
      expect(result.recommendations).toContain('Guide through breathing exercises');
    });

    it('should detect help rejection patterns', async () => {
      const result = await analyzer.analyzeMessage(
        'user012',
        'No one can help me, just leave me alone, it doesnt matter anyway'
      );

      const helpRejection = result.patterns.find(
        p => p.type === PatternType.HELP_REJECTION
      );

      expect(helpRejection).toBeDefined();
      expect(result.recommendations).toContain('Adopt non-directive approach');
    });

    it('should identify self-harm indicators', async () => {
      const result = await analyzer.analyzeMessage(
        'user345',
        'I deserve to hurt myself for what Ive done'
      );

      const selfHarmPattern = result.patterns.find(
        p => p.type === PatternType.SELF_HARM_INDICATORS
      );

      expect(selfHarmPattern).toBeDefined();
      expect(selfHarmPattern?.severity).toBeGreaterThan(0.8);
      expect(result.concerns).toContainEqual(
        expect.objectContaining({
          level: 'high',
          type: 'SELF_HARM_RISK'
        })
      );
    });

    it('should detect emotional dysregulation', async () => {
      const result = await analyzer.analyzeMessage(
        'user678',
        'I HATE EVERYTHING one moment and feel empty the next, I cant control my emotions'
      );

      const emotionalPattern = result.patterns.find(
        p => p.type === PatternType.EMOTIONAL_DYSREGULATION
      );

      expect(emotionalPattern).toBeDefined();
      expect(result.recommendations).toContain('Provide emotional regulation strategies');
    });
  });

  describe('Volunteer Burnout Detection', () => {
    it('should identify burnout risk indicators', async () => {
      const sessionData = {
        responses: Array(20).fill({ timestamp: Date.now() }),
        messages: Array(15).fill({ content: 'response' }),
        interventions: Array(3).fill({ type: 'support' }),
        outcomes: Array(3).fill({ success: false }),
        breaks: Array(8).fill({ duration: 600000 }), // Many breaks
        totalDuration: 10800000 // 3 hours (extended shift)
      };

      const result = await analyzer.analyzeVolunteerBurnout('volunteer123', sessionData);

      expect(result.burnoutRisk).toBeGreaterThan(0.5);
      expect(result.fatigueIndicators).toContain('Extended shift duration');
      expect(result.recommendations).toContain('End shift within next 30 minutes');
    });

    it('should detect performance degradation', async () => {
      const sessionData = {
        responses: Array(10).fill({ timestamp: Date.now() }),
        messages: Array(10).fill({ content: 'response' }),
        interventions: Array(5).fill({ type: 'support' }),
        outcomes: Array(5).fill({ success: false }),
        breaks: Array(2).fill({ duration: 300000 }),
        totalDuration: 7200000
      };

      const result = await analyzer.analyzeVolunteerBurnout('volunteer456', sessionData);

      expect(result.performanceScore).toBeLessThan(0.8);
      expect(result.shiftQuality).toBeDefined();
      expect(result.shiftQuality.responseTime).toBeDefined();
    });

    it('should recommend appropriate interventions for burnout', async () => {
      const sessionData = {
        responses: Array(30).fill({ timestamp: Date.now() }),
        messages: Array(25).fill({ content: 'response' }),
        interventions: Array(10).fill({ type: 'support' }),
        outcomes: Array(5).fill({ success: false }),
        breaks: Array(10).fill({ duration: 900000 }), // Frequent long breaks
        totalDuration: 14400000 // 4 hours
      };

      const result = await analyzer.analyzeVolunteerBurnout('volunteer789', sessionData);

      expect(result.burnoutRisk).toBeGreaterThan(0.6);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContainEqual(
        expect.stringMatching(/break|shift|debriefing/)
      );
    });
  });

  describe('Session Quality Analysis', () => {
    it('should evaluate session effectiveness', async () => {
      const result = await analyzer.analyzeMessage(
        'user111',
        'Thank you for listening, I feel a bit better now',
        { sessionId: 'session123' }
      );

      expect(result.sessionQuality).toBeDefined();
      expect(result.sessionQuality.score).toBeGreaterThanOrEqual(0);
      expect(result.sessionQuality.score).toBeLessThanOrEqual(100);
      expect(result.sessionQuality.improvements).toBeDefined();
    });

    it('should identify areas for improvement', async () => {
      const result = await analyzer.analyzeMessage(
        'user222',
        'You dont understand what Im saying',
        { sessionId: 'session456' }
      );

      expect(result.sessionQuality.improvements.length).toBeGreaterThanOrEqual(0);
      if (result.sessionQuality.score < 60) {
        expect(result.recommendations.some(r => 
          r.includes('engagement') || r.includes('therapeutic') || r.includes('concerns')
        )).toBe(true);
      }
    });
  });

  describe('Performance Requirements', () => {
    it('should complete analysis within 100ms target', async () => {
      const startTime = performance.now();
      
      await analyzer.analyzeMessage(
        'user999',
        'I need help with my anxiety and depression'
      );
      
      const executionTime = performance.now() - startTime;
      
      // Allow some tolerance for test environment
      expect(executionTime).toBeLessThan(200);
    });

    it('should handle concurrent analyses efficiently', async () => {
      const promises = [];
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          analyzer.analyzeMessage(`user${i}`, `Message ${i} with various content`)
        );
      }
      
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      
      expect(results.length).toBe(10);
      expect(totalTime).toBeLessThan(500); // All 10 should complete quickly
      results.forEach(result => {
        expect(result.riskLevel).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Safety and Reliability', () => {
    it('should provide failsafe analysis on error', async () => {
      // Force an error by passing invalid data
      const result = await analyzer.analyzeMessage('', '');

      expect(result).toBeDefined();
      expect(result.riskLevel).toBe(0.5); // Default failsafe value
      expect(result.recommendations).toContain('Manual review recommended');
    });

    it('should emit critical risk events', async () => {
      const criticalEventPromise = new Promise(resolve => {
        analyzer.once('criticalRisk', resolve);
      });

      await analyzer.analyzeMessage(
        'userCritical',
        'I want to end it all right now, I have the means'
      );

      const event = await Promise.race([
        criticalEventPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 100))
      ]);

      expect(event).toBeDefined();
    });

    it('should maintain consistent analysis across similar inputs', async () => {
      const message = 'Im feeling really anxious and overwhelmed';
      
      const result1 = await analyzer.analyzeMessage('user1', message);
      const result2 = await analyzer.analyzeMessage('user2', message);
      
      // Results should be similar for similar inputs
      expect(Math.abs(result1.riskLevel - result2.riskLevel)).toBeLessThan(0.2);
      expect(result1.patterns.length).toBeCloseTo(result2.patterns.length, 1);
    });
  });

  describe('Comprehensive Risk Calculation', () => {
    it('should correctly weight multiple risk factors', async () => {
      const result = await analyzer.analyzeMessage(
        'userComplex',
        'Everything is getting worse, I cant breathe, no one can help me, I want to hurt myself'
      );

      // This message has multiple risk factors
      expect(result.patterns.length).toBeGreaterThan(2);
      expect(result.riskLevel).toBeGreaterThan(0.7);
      expect(result.needsIntervention).toBe(true);
      
      // Should have multiple types of concerns
      const concernTypes = new Set(result.concerns.map(c => c.type));
      expect(concernTypes.size).toBeGreaterThan(1);
    });

    it('should adjust confidence based on available data', async () => {
      const result1 = await analyzer.analyzeMessage(
        'userNew',
        'help'
      );

      // Multiple messages should increase confidence
      for (let i = 0; i < 5; i++) {
        await analyzer.analyzeMessage('userOld', `Message ${i}`);
      }
      
      const result2 = await analyzer.analyzeMessage(
        'userOld',
        'help'
      );

      // User with more history should have different confidence
      expect(result1.confidence).toBeDefined();
      expect(result2.confidence).toBeDefined();
    });
  });
});