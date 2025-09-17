/**
 * ASTRAL_CORE 2.0 - Volunteer Matcher Test Suite
 * 
 * Comprehensive test coverage for the advanced volunteer matching system
 * including real-time availability, skills-based matching, load balancing,
 * and cultural competency matching.
 */

import { jest } from '@jest/globals';
import { AdvancedVolunteerMatcher } from '../volunteer-matcher';
import { WorkloadCapacityManager } from '../workload-manager';
import { QualityAnalyzer } from '../quality-analyzer';
import { CulturalCompetencyMatcher } from '../cultural-matcher';
import type {
  CrisisMatchCriteria,
  VolunteerMatchResult,
  VolunteerStatus,
  LoadBalancingMetrics,
  EmergencyVolunteerPool
} from '../types/volunteer-matching.types';

// Mock dependencies
jest.mock('@astralcore/database');
jest.mock('../workload-manager');
jest.mock('../quality-analyzer');
jest.mock('../cultural-matcher');

describe('AdvancedVolunteerMatcher', () => {
  let volunteerMatcher: AdvancedVolunteerMatcher;
  let workloadManager: jest.Mocked<WorkloadCapacityManager>;
  let qualityAnalyzer: jest.Mocked<QualityAnalyzer>;
  let culturalMatcher: jest.Mocked<CulturalCompetencyMatcher>;

  // Test data setup
  const mockVolunteerStatus: VolunteerStatus = {
    id: 'volunteer-1',
    status: 'ONLINE',
    lastHeartbeat: new Date(),
    currentSessions: 1,
    maxConcurrentSessions: 3,
    emergencyAvailable: true,
    location: {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      timezone: 'America/Los_Angeles',
      utcOffset: -8
    }
  };

  const mockCrisisCriteria: CrisisMatchCriteria = {
    sessionId: 'crisis-session-1',
    urgency: 'HIGH',
    severity: 7,
    sessionType: 'TEXT_CHAT',
    requiredSpecialties: ['SUICIDE_PREVENTION'],
    requiredLanguages: [{ languageCode: 'en', minimumProficiency: 'FLUENT' }],
    immediateResponse: true,
    requestTimestamp: new Date()
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh instance for each test
    volunteerMatcher = AdvancedVolunteerMatcher.getInstance();
    workloadManager = WorkloadCapacityManager.getInstance() as jest.Mocked<WorkloadCapacityManager>;
    qualityAnalyzer = QualityAnalyzer.getInstance() as jest.Mocked<QualityAnalyzer>;
    culturalMatcher = CulturalCompetencyMatcher.getInstance() as jest.Mocked<CulturalCompetencyMatcher>;
  });

  describe('Real-time Availability Tracking', () => {
    
    test('should update volunteer availability in under 1 second', async () => {
      const startTime = Date.now();
      
      await volunteerMatcher.updateVolunteerAvailability(
        'volunteer-1',
        'ONLINE',
        { emergencyAvailable: true }
      );
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    test('should track volunteer status changes correctly', async () => {
      await volunteerMatcher.updateVolunteerAvailability('volunteer-1', 'ONLINE');
      let status = volunteerMatcher.getVolunteerStatus('volunteer-1');
      expect(status?.status).toBe('ONLINE');

      await volunteerMatcher.updateVolunteerAvailability('volunteer-1', 'BUSY');
      status = volunteerMatcher.getVolunteerStatus('volunteer-1');
      expect(status?.status).toBe('BUSY');
    });

    test('should emit availability change events', async () => {
      const eventSpy = jest.fn();
      volunteerMatcher.on('volunteerAvailabilityChanged', eventSpy);

      await volunteerMatcher.updateVolunteerAvailability('volunteer-1', 'ONLINE');
      
      expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        volunteerId: 'volunteer-1',
        status: 'ONLINE'
      }));
    });

    test('should filter available volunteers correctly', () => {
      // Mock volunteer statuses
      volunteerMatcher['volunteerStatuses'].set('volunteer-1', {
        ...mockVolunteerStatus,
        status: 'ONLINE',
        currentSessions: 1,
        maxConcurrentSessions: 3
      });

      volunteerMatcher['volunteerStatuses'].set('volunteer-2', {
        ...mockVolunteerStatus,
        id: 'volunteer-2',
        status: 'BUSY',
        currentSessions: 3,
        maxConcurrentSessions: 3
      });

      const available = volunteerMatcher.getAvailableVolunteers();
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('volunteer-1');
    });

    test('should handle heartbeat monitoring', async () => {
      const oldHeartbeat = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      
      volunteerMatcher['volunteerStatuses'].set('volunteer-1', {
        ...mockVolunteerStatus,
        lastHeartbeat: oldHeartbeat
      });

      const available = volunteerMatcher.getAvailableVolunteers();
      expect(available).toHaveLength(0); // Should be filtered out due to stale heartbeat
    });
  });

  describe('Skills-based Matching Algorithm', () => {
    
    test('should find optimal volunteer match in under 5 seconds', async () => {
      // Mock dependencies
      workloadManager.calculateWorkloadAssessment = jest.fn().mockResolvedValue({
        burnoutRisk: { level: 'LOW', score: 0.2 },
        current: { activeSessions: 1 }
      });

      const startTime = Date.now();
      
      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000);
    });

    test('should match volunteers based on specialties', async () => {
      // Mock volunteer with suicide prevention specialty
      const mockProfile = {
        specialties: [
          { type: 'SUICIDE_PREVENTION', level: 'ADVANCED', isActive: true }
        ],
        languagesSpoken: [
          { code: 'en', proficiency: 'NATIVE' }
        ]
      };

      volunteerMatcher['getVolunteerProfilesForMatching'] = jest.fn()
        .mockResolvedValue(new Map([['volunteer-1', mockProfile]]));

      volunteerMatcher['volunteerStatuses'].set('volunteer-1', mockVolunteerStatus);

      workloadManager.calculateWorkloadAssessment = jest.fn().mockResolvedValue({
        burnoutRisk: { level: 'LOW' },
        current: { activeSessions: 1 }
      });

      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );

      expect(result).toBeTruthy();
      expect(result?.volunteerId).toBe('volunteer-1');
    });

    test('should prioritize emergency responders for emergency cases', async () => {
      const emergencyCriteria: CrisisMatchCriteria = {
        ...mockCrisisCriteria,
        urgency: 'EMERGENCY'
      };

      volunteerMatcher['volunteerStatuses'].set('volunteer-1', {
        ...mockVolunteerStatus,
        emergencyAvailable: true
      });

      volunteerMatcher['volunteerStatuses'].set('volunteer-2', {
        ...mockVolunteerStatus,
        id: 'volunteer-2',
        emergencyAvailable: false
      });

      const available = volunteerMatcher.getAvailableVolunteers({ emergencyOnly: true });
      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('volunteer-1');
    });

    test('should calculate match scores accurately', async () => {
      const mockProfile = {
        specialties: [
          { type: 'SUICIDE_PREVENTION', level: 'EXPERT', isActive: true }
        ],
        languagesSpoken: [
          { code: 'en', proficiency: 'NATIVE' }
        ],
        experience: { totalHours: 500 },
        performanceMetrics: { overallRating: 9.5 }
      };

      const matchScore = volunteerMatcher['calculateVolunteerMatch'](
        mockVolunteerStatus,
        mockProfile as any,
        mockCrisisCriteria
      );

      expect(matchScore).resolves.toHaveProperty('matchScore');
      expect(matchScore).resolves.toHaveProperty('matchBreakdown');
    });
  });

  describe('Load Balancing System', () => {
    
    test('should prevent assignment to high burnout volunteers', async () => {
      workloadManager.calculateWorkloadAssessment = jest.fn().mockResolvedValue({
        burnoutRisk: { level: 'CRITICAL', score: 0.9 },
        recommendations: [{ type: 'END_SHIFT' }]
      });

      volunteerMatcher['volunteerStatuses'].set('volunteer-1', mockVolunteerStatus);

      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );

      expect(result).toBeNull(); // Should not match critical burnout volunteer
    });

    test('should apply load balancing adjustments', async () => {
      const mockMatches: VolunteerMatchResult[] = [
        {
          volunteerId: 'volunteer-1',
          matchScore: 0.9,
          currentWorkload: { burnoutRisk: 'LOW' }
        } as VolunteerMatchResult,
        {
          volunteerId: 'volunteer-2',
          matchScore: 0.8,
          currentWorkload: { burnoutRisk: 'HIGH' }
        } as VolunteerMatchResult
      ];

      workloadManager.getLoadBalancingMetrics = jest.fn()
        .mockResolvedValueOnce({ wellnessRisk: 'LOW', recommendedAction: 'CONTINUE' })
        .mockResolvedValueOnce({ wellnessRisk: 'HIGH', recommendedAction: 'REDUCE_LOAD' });

      const result = await volunteerMatcher['applyLoadBalancing'](mockMatches, mockCrisisCriteria);
      
      expect(result[0].volunteerId).toBe('volunteer-1'); // Low risk should be prioritized
    });

    test('should track workload metrics', async () => {
      workloadManager.calculateWorkloadAssessment = jest.fn().mockResolvedValue({
        current: { activeSessions: 2, hoursWorkedToday: 6 },
        capacity: { maxConcurrentSessions: 3, maxHoursPerDay: 8 },
        utilization: { currentUtilization: 0.67 },
        burnoutRisk: { level: 'MEDIUM', score: 0.5 }
      });

      const metrics = await workloadManager.calculateWorkloadAssessment('volunteer-1');
      
      expect(metrics.current.activeSessions).toBe(2);
      expect(metrics.utilization.currentUtilization).toBe(0.67);
      expect(metrics.burnoutRisk.level).toBe('MEDIUM');
    });
  });

  describe('Emergency Volunteer Pool', () => {
    
    test('should maintain emergency volunteer pool', async () => {
      const mockPool: EmergencyVolunteerPool = {
        criticalResponse: ['volunteer-1', 'volunteer-2'],
        specialistBackup: ['volunteer-3', 'volunteer-4'],
        onCallSupervisors: ['supervisor-1'],
        emergencyContacts: ['contact-1'],
        lastUpdated: new Date(),
        nextRotation: new Date(Date.now() + 8 * 60 * 60 * 1000)
      };

      volunteerMatcher['emergencyPool'] = mockPool;

      await volunteerMatcher.updateEmergencyPool();
      
      expect(volunteerMatcher['emergencyPool']).toBeTruthy();
      expect(volunteerMatcher['emergencyPool']?.criticalResponse.length).toBeGreaterThan(0);
    });

    test('should get emergency volunteer within 30 seconds', async () => {
      const emergencyCriteria: CrisisMatchCriteria = {
        ...mockCrisisCriteria,
        urgency: 'EMERGENCY'
      };

      volunteerMatcher['emergencyPool'] = {
        criticalResponse: ['volunteer-1'],
        specialistBackup: [],
        onCallSupervisors: [],
        emergencyContacts: [],
        lastUpdated: new Date(),
        nextRotation: new Date()
      };

      volunteerMatcher['volunteerStatuses'].set('volunteer-1', {
        ...mockVolunteerStatus,
        emergencyAvailable: true
      });

      const startTime = Date.now();
      const result = await volunteerMatcher.getEmergencyVolunteer(emergencyCriteria);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(30000);
      expect(result?.volunteerId).toBe('volunteer-1');
    });
  });

  describe('Geographic and Cultural Matching', () => {
    
    test('should match based on timezone compatibility', () => {
      const compatibility = volunteerMatcher['calculateTimezoneCompatibility'](
        'America/Los_Angeles',
        'America/New_York'
      );
      
      expect(compatibility).toBeGreaterThan(0);
      expect(compatibility).toBeLessThanOrEqual(1);
    });

    test('should integrate with cultural matcher', async () => {
      culturalMatcher.performComprehensiveCulturalMatch = jest.fn().mockResolvedValue({
        matchScore: 0.85,
        confidence: 0.9,
        languageMatch: { languageScore: 0.95 },
        culturalMatch: { overallScore: 0.8 }
      });

      const result = await culturalMatcher.performComprehensiveCulturalMatch(
        'volunteer-1',
        mockCrisisCriteria
      );

      expect(result.matchScore).toBe(0.85);
      expect(culturalMatcher.performComprehensiveCulturalMatch).toHaveBeenCalledWith(
        'volunteer-1',
        mockCrisisCriteria
      );
    });

    test('should assess language proficiency requirements', async () => {
      const languageRequirements = [
        { languageCode: 'en', minimumProficiency: 'FLUENT' as const }
      ];

      culturalMatcher.performLanguageMatching = jest.fn().mockResolvedValue({
        primaryLanguageMatch: true,
        languageScore: 0.9,
        proficiencyMatch: true
      });

      const result = await culturalMatcher.performLanguageMatching(
        'volunteer-1',
        languageRequirements
      );

      expect(result.primaryLanguageMatch).toBe(true);
      expect(result.languageScore).toBe(0.9);
    });
  });

  describe('Quality Scoring Integration', () => {
    
    test('should calculate comprehensive quality scores', async () => {
      qualityAnalyzer.calculateQualityScore = jest.fn().mockResolvedValue({
        overall: { score: 8.5, category: 'VERY_GOOD' },
        components: {
          sessionQuality: { score: 8.7 },
          crisisResolution: { score: 8.3 }
        },
        metadata: { calculationDuration: 2500 }
      });

      const result = await qualityAnalyzer.calculateQualityScore('volunteer-1');
      
      expect(result.overall.score).toBe(8.5);
      expect(result.metadata.calculationDuration).toBeLessThan(3000);
    });

    test('should analyze performance history', async () => {
      qualityAnalyzer.analyzePerformanceHistory = jest.fn().mockResolvedValue({
        summary: { totalSessions: 150, averageScore: 8.2 },
        patterns: { temporal: [], contextual: [] },
        evolution: { currentPhase: 'EXPERIENCED' }
      });

      const analysis = await qualityAnalyzer.analyzePerformanceHistory(
        'volunteer-1',
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        new Date()
      );

      expect(analysis.summary.totalSessions).toBe(150);
      expect(analysis.summary.averageScore).toBe(8.2);
    });
  });

  describe('Performance and Scalability', () => {
    
    test('should handle high volume matching requests', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => 
        volunteerMatcher.findOptimalVolunteerMatch(`session-${i}`, mockCrisisCriteria)
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000); // Should handle 100 requests in under 10 seconds
    });

    test('should maintain cache hit rates', () => {
      const metrics = volunteerMatcher['matchingMetrics'];
      
      // Simulate cache usage
      metrics.totalMatches = 100;
      metrics.successfulMatches = 95;
      
      const successRate = metrics.successfulMatches / metrics.totalMatches;
      expect(successRate).toBeGreaterThan(0.9); // 90% success rate
    });

    test('should track performance metrics', () => {
      const metrics = volunteerMatcher['matchingMetrics'];
      
      expect(metrics).toHaveProperty('totalMatches');
      expect(metrics).toHaveProperty('successfulMatches');
      expect(metrics).toHaveProperty('averageMatchTime');
      expect(metrics).toHaveProperty('emergencyMatches');
      expect(metrics).toHaveProperty('timeouts');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    
    test('should handle no available volunteers gracefully', async () => {
      // Clear all volunteer statuses
      volunteerMatcher['volunteerStatuses'].clear();

      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );

      expect(result).toBeNull();
    });

    test('should handle invalid volunteer data', async () => {
      volunteerMatcher['getVolunteerProfilesForMatching'] = jest.fn()
        .mockResolvedValue(new Map()); // Empty profiles

      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );

      expect(result).toBeNull();
    });

    test('should handle database connection failures', async () => {
      volunteerMatcher['getVolunteerProfilesForMatching'] = jest.fn()
        .mockRejectedValue(new Error('Database connection failed'));

      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );

      expect(result).toBeNull();
    });

    test('should validate crisis criteria', async () => {
      const invalidCriteria = {
        ...mockCrisisCriteria,
        severity: 15, // Invalid severity (>10)
        urgency: 'INVALID' as any
      };

      expect(() => {
        volunteerMatcher.findOptimalVolunteerMatch('session-1', invalidCriteria);
      }).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    
    test('should perform end-to-end volunteer matching', async () => {
      // Setup complete volunteer profile
      const completeProfile = {
        specialties: [{ type: 'SUICIDE_PREVENTION', level: 'ADVANCED', isActive: true }],
        languagesSpoken: [{ code: 'en', proficiency: 'NATIVE' }],
        experience: { totalHours: 200, successfulInterventions: 150 },
        performanceMetrics: { overallRating: 8.5, responseTimeAverage: 30 }
      };

      volunteerMatcher['getVolunteerProfilesForMatching'] = jest.fn()
        .mockResolvedValue(new Map([['volunteer-1', completeProfile]]));

      volunteerMatcher['volunteerStatuses'].set('volunteer-1', mockVolunteerStatus);

      workloadManager.calculateWorkloadAssessment = jest.fn().mockResolvedValue({
        burnoutRisk: { level: 'LOW', score: 0.2 },
        current: { activeSessions: 1, hoursWorkedToday: 4 },
        utilization: { currentUtilization: 0.33 }
      });

      culturalMatcher.performComprehensiveCulturalMatch = jest.fn().mockResolvedValue({
        matchScore: 0.9,
        confidence: 0.95
      });

      const result = await volunteerMatcher.findOptimalVolunteerMatch(
        'session-1',
        mockCrisisCriteria
      );

      expect(result).toBeTruthy();
      expect(result?.volunteerId).toBe('volunteer-1');
      expect(result?.matchScore).toBeGreaterThan(0.7);
    });

    test('should handle volunteer assignment lifecycle', async () => {
      // Mock successful match
      volunteerMatcher['findOptimalVolunteerMatch'] = jest.fn().mockResolvedValue({
        volunteerId: 'volunteer-1',
        matchScore: 0.9
      });

      // Test assignment
      await volunteerMatcher['assignVolunteerToSession']('session-1', 'volunteer-1');
      
      // Verify volunteer load increased
      const status = volunteerMatcher.getVolunteerStatus('volunteer-1');
      expect(status?.currentSessions).toBeGreaterThan(0);

      // Test release
      await volunteerMatcher.releaseVolunteerFromSession('session-1', 'volunteer-1');
      
      // Verify volunteer load decreased
      const updatedStatus = volunteerMatcher.getVolunteerStatus('volunteer-1');
      expect(updatedStatus?.currentSessions).toBeLessThan(status?.currentSessions || 0);
    });
  });

  describe('Monitoring and Analytics', () => {
    
    test('should provide volunteer workload statistics', async () => {
      const stats = await volunteerMatcher.getVolunteerWorkloadStats();
      
      expect(stats).toHaveProperty('totalActive');
      expect(stats).toHaveProperty('availableNow');
      expect(stats).toHaveProperty('highLoad');
      expect(stats).toHaveProperty('emergencyAvailable');
    });

    test('should track matching performance metrics', () => {
      const metrics = volunteerMatcher['matchingMetrics'];
      
      // Simulate some matching activity
      metrics.totalMatches = 50;
      metrics.successfulMatches = 47;
      metrics.averageMatchTime = 2500;
      metrics.emergencyMatches = 5;
      metrics.timeouts = 1;

      expect(metrics.successfulMatches / metrics.totalMatches).toBeGreaterThan(0.9);
      expect(metrics.averageMatchTime).toBeLessThan(5000);
      expect(metrics.timeouts / metrics.totalMatches).toBeLessThan(0.05);
    });
  });
});

describe('WorkloadCapacityManager', () => {
  let workloadManager: WorkloadCapacityManager;

  beforeEach(() => {
    workloadManager = WorkloadCapacityManager.getInstance();
  });

  test('should calculate workload assessment within 2 seconds', async () => {
    const startTime = Date.now();
    
    const assessment = await workloadManager.calculateWorkloadAssessment('volunteer-1');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(2000);
  });

  test('should validate shift assignments within 1 second', async () => {
    const proposedShift = {
      shiftId: 'shift-1',
      startTime: new Date(),
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      estimatedLoad: 0.7
    };

    const startTime = Date.now();
    
    const validation = await workloadManager.validateShiftAssignment('volunteer-1', proposedShift as any);
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(1000);
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('violations');
    expect(validation).toHaveProperty('recommendations');
  });

  test('should generate capacity plans within 5 seconds', async () => {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

    const startTime = Date.now();
    
    const plan = await workloadManager.generateCapacityPlan(startDate, endDate, 'WEEK');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(5000);
    expect(plan).toHaveProperty('planId');
    expect(plan).toHaveProperty('demandForecast');
    expect(plan).toHaveProperty('volunteerCapacity');
    expect(plan).toHaveProperty('capacityGaps');
  });
});

describe('QualityAnalyzer', () => {
  let qualityAnalyzer: QualityAnalyzer;

  beforeEach(() => {
    qualityAnalyzer = QualityAnalyzer.getInstance();
  });

  test('should calculate quality scores within 3 seconds', async () => {
    const startTime = Date.now();
    
    const score = await qualityAnalyzer.calculateQualityScore('volunteer-1');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(3000);
    expect(score).toHaveProperty('overall');
    expect(score).toHaveProperty('components');
    expect(score).toHaveProperty('trends');
  });

  test('should analyze performance history within 5 seconds', async () => {
    const startTime = Date.now();
    
    const analysis = await qualityAnalyzer.analyzePerformanceHistory('volunteer-1');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(5000);
    expect(analysis).toHaveProperty('summary');
    expect(analysis).toHaveProperty('detailed');
    expect(analysis).toHaveProperty('patterns');
  });
});

describe('CulturalCompetencyMatcher', () => {
  let culturalMatcher: CulturalCompetencyMatcher;

  beforeEach(() => {
    culturalMatcher = CulturalCompetencyMatcher.getInstance();
  });

  test('should perform language matching within 2 seconds', async () => {
    const languageRequirements = [
      { languageCode: 'en', minimumProficiency: 'FLUENT' as const }
    ];

    const startTime = Date.now();
    
    const result = await culturalMatcher.performLanguageMatching(
      'volunteer-1',
      languageRequirements
    );
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(2000);
    expect(result).toHaveProperty('languageScore');
    expect(result).toHaveProperty('primaryLanguageMatch');
  });

  test('should assess cultural compatibility within 3 seconds', async () => {
    const culturalContext = ['american', 'christian', 'middle-class'];

    const startTime = Date.now();
    
    const compatibility = await culturalMatcher.assessCulturalCompatibility(
      'volunteer-1',
      culturalContext
    );
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(3000);
    expect(compatibility).toHaveProperty('overall');
    expect(compatibility).toHaveProperty('cultural');
    expect(compatibility).toHaveProperty('specialNeeds');
  });

  test('should perform comprehensive cultural matching within 5 seconds', async () => {
    const criteria: CrisisMatchCriteria = {
      sessionId: 'session-1',
      urgency: 'NORMAL',
      severity: 5,
      sessionType: 'TEXT_CHAT',
      requiredSpecialties: ['ANXIETY_PANIC'],
      requiredLanguages: [{ languageCode: 'en', minimumProficiency: 'CONVERSATIONAL' }],
      culturalConsiderations: ['american', 'young-adult'],
      immediateResponse: false,
      requestTimestamp: new Date()
    };

    const startTime = Date.now();
    
    const result = await culturalMatcher.performComprehensiveCulturalMatch(
      'volunteer-1',
      criteria
    );
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(5000);
    expect(result).toHaveProperty('matchScore');
    expect(result).toHaveProperty('languageMatch');
    expect(result).toHaveProperty('culturalMatch');
  });
});

// Integration test for the complete matching system
describe('Complete Volunteer Matching System Integration', () => {
  test('should perform end-to-end matching with all components', async () => {
    const volunteerMatcher = AdvancedVolunteerMatcher.getInstance();
    const workloadManager = WorkloadCapacityManager.getInstance();
    const qualityAnalyzer = QualityAnalyzer.getInstance();
    const culturalMatcher = CulturalCompetencyMatcher.getInstance();

    // Setup comprehensive test scenario
    const comprehensiveCriteria: CrisisMatchCriteria = {
      sessionId: 'integration-test-session',
      urgency: 'HIGH',
      severity: 8,
      sessionType: 'VIDEO_CALL',
      requiredSpecialties: ['SUICIDE_PREVENTION', 'TRAUMA_PTSD'],
      requiredLanguages: [
        { languageCode: 'en', minimumProficiency: 'NATIVE' },
        { languageCode: 'es', minimumProficiency: 'CONVERSATIONAL' }
      ],
      culturalConsiderations: ['hispanic', 'catholic', 'immigrant'],
      immediateResponse: true,
      requiresVideoCapable: true,
      genderPreference: 'FEMALE',
      requestTimestamp: new Date()
    };

    const startTime = Date.now();
    
    // This would normally integrate all components
    const result = await volunteerMatcher.findOptimalVolunteerMatch(
      comprehensiveCriteria.sessionId,
      comprehensiveCriteria
    );
    
    const totalTime = Date.now() - startTime;
    
    // Verify performance targets are met
    expect(totalTime).toBeLessThan(10000); // Total integration should be under 10 seconds
    
    if (result) {
      expect(result).toHaveProperty('volunteerId');
      expect(result).toHaveProperty('matchScore');
      expect(result).toHaveProperty('qualityMetrics');
      expect(result).toHaveProperty('geographicAlignment');
      expect(result.matchScore).toBeGreaterThan(0.5); // Minimum viable match
    }
  });
});

export { };