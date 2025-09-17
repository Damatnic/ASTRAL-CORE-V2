/**
 * ASTRAL_CORE 2.0 Crisis Analytics
 * Specialized analytics for crisis intervention monitoring
 */

import { AnalyticsEngine } from '../engines/AnalyticsEngine';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import {
  AnalyticsEventType,
  CrisisAnalyticsData
} from '../types/analytics.types';
import {
  PerformanceUnit,
  PerformanceCategory,
  CrisisInterventionMetrics
} from '../types/performance.types';

export interface CrisisAnalyticsConfig {
  trackResponseTimes: boolean;
  trackEscalations: boolean;
  trackVolunteerPerformance: boolean;
  alertThresholds: {
    responseTime: number; // milliseconds
    escalationRate: number; // percentage
    abandonmentRate: number; // percentage
  };
}

export class CrisisAnalytics {
  private analyticsEngine: AnalyticsEngine;
  private performanceMonitor: PerformanceMonitor;
  private config: CrisisAnalyticsConfig;

  constructor(
    analyticsEngine: AnalyticsEngine,
    performanceMonitor: PerformanceMonitor,
    config: CrisisAnalyticsConfig
  ) {
    this.analyticsEngine = analyticsEngine;
    this.performanceMonitor = performanceMonitor;
    this.config = config;
  }

  /**
   * Track crisis session start
   */
  async trackCrisisSessionStart(sessionId: string, data: {
    userId: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    initialKeywords?: string[];
    riskScore?: number;
  }): Promise<void> {
    const crisisData: Partial<CrisisAnalyticsData> = {
      sessionId,
      escalationLevel: data.urgencyLevel,
      keywordsDetected: data.initialKeywords || [],
      riskScore: data.riskScore || 0
    };

    await this.analyticsEngine.trackCrisisEvent(
      sessionId,
      AnalyticsEventType.CRISIS_SESSION_STARTED,
      crisisData
    );

    // Track performance metric
    if (this.config.trackResponseTimes) {
      this.performanceMonitor.recordMetric(
        'crisis_session_initiated',
        1,
        PerformanceUnit.COUNT,
        PerformanceCategory.CRISIS_INTERVENTION,
        { urgencyLevel: data.urgencyLevel }
      );
    }
  }

  /**
   * Track crisis session end
   */
  async trackCrisisSessionEnd(sessionId: string, data: {
    duration: number;
    outcome: 'resolved' | 'escalated' | 'transferred' | 'abandoned';
    volunteerRating?: number;
    userSatisfaction?: number;
    followUpRequired?: boolean;
  }): Promise<void> {
    const crisisData: Partial<CrisisAnalyticsData> = {
      sessionId,
      duration: data.duration,
      outcome: data.outcome
    };

    await this.analyticsEngine.trackCrisisEvent(
      sessionId,
      AnalyticsEventType.CRISIS_SESSION_ENDED,
      crisisData
    );

    // Track session duration
    this.performanceMonitor.recordMetric(
      'crisis_session_duration',
      data.duration,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.CRISIS_INTERVENTION,
      { outcome: data.outcome }
    );

    // Track outcome metrics
    this.performanceMonitor.recordMetric(
      `crisis_outcome_${data.outcome}`,
      1,
      PerformanceUnit.COUNT,
      PerformanceCategory.CRISIS_INTERVENTION
    );
  }

  /**
   * Track emergency escalation
   */
  async trackEmergencyEscalation(sessionId: string, data: {
    escalationTime: number;
    trigger: string;
    severity: 'high' | 'critical' | 'emergency';
    responseTime?: number;
    emergencyServicesContacted?: boolean;
  }): Promise<void> {
    const escalationLevel = data.severity === 'critical' ? 'high' : data.severity;
    const crisisData: Partial<CrisisAnalyticsData> = {
      sessionId,
      escalationLevel,
      responseTime: data.responseTime
    };

    await this.analyticsEngine.trackCrisisEvent(
      sessionId,
      AnalyticsEventType.EMERGENCY_ESCALATION,
      crisisData
    );

    // Track escalation metrics
    if (this.config.trackEscalations) {
      this.performanceMonitor.recordMetric(
        'emergency_escalation_time',
        data.escalationTime,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.CRISIS_INTERVENTION,
        { 
          severity: data.severity,
          trigger: data.trigger,
          emergencyServices: data.emergencyServicesContacted?.toString() || 'false'
        }
      );

      if (data.responseTime) {
        this.performanceMonitor.recordMetric(
          'emergency_response_time',
          data.responseTime,
          PerformanceUnit.MILLISECONDS,
          PerformanceCategory.CRISIS_INTERVENTION,
          { severity: data.severity }
        );
      }
    }
  }

  /**
   * Track volunteer assignment
   */
  async trackVolunteerAssignment(sessionId: string, data: {
    volunteerId: string;
    assignmentTime: number;
    matchScore: number;
    volunteerExperience: 'novice' | 'intermediate' | 'expert';
    specializations: string[];
  }): Promise<void> {
    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.VOLUNTEER_ASSIGNED,
      {
        sessionId,
        volunteerId: data.volunteerId,
        assignmentTime: data.assignmentTime,
        matchScore: data.matchScore,
        volunteerExperience: data.volunteerExperience,
        specializations: data.specializations
      }
    );

    // Track volunteer performance metrics
    if (this.config.trackVolunteerPerformance) {
      this.performanceMonitor.recordMetric(
        'volunteer_assignment_time',
        data.assignmentTime,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.CRISIS_INTERVENTION,
        { 
          experience: data.volunteerExperience,
          matchScore: data.matchScore.toString()
        }
      );
    }
  }

  /**
   * Track crisis keyword detection
   */
  async trackKeywordDetection(sessionId: string, data: {
    keywords: string[];
    riskScore: number;
    category: string;
    confidence: number;
  }): Promise<void> {
    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.CRISIS_SESSION_STARTED, // Using existing type
      {
        sessionId,
        keywordsDetected: data.keywords,
        riskScore: data.riskScore,
        category: data.category,
        confidence: data.confidence,
        eventSubtype: 'keyword_detection'
      }
    );

    // Track risk assessment metrics
    this.performanceMonitor.recordMetric(
      'crisis_risk_score',
      data.riskScore,
      PerformanceUnit.COUNT,
      PerformanceCategory.CRISIS_INTERVENTION,
      { 
        category: data.category,
        keywordCount: data.keywords.length.toString()
      }
    );
  }

  /**
   * Get crisis analytics summary
   */
  async getCrisisSummary(timeRange: { start: Date; end: Date }): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageResponseTime: number;
    escalationRate: number;
    resolutionRate: number;
    abandonmentRate: number;
    volunteerUtilization: number;
    topRiskFactors: { keyword: string; count: number }[];
  }> {
    const query = {
      eventTypes: [
        AnalyticsEventType.CRISIS_SESSION_STARTED,
        AnalyticsEventType.CRISIS_SESSION_ENDED,
        AnalyticsEventType.EMERGENCY_ESCALATION,
        AnalyticsEventType.VOLUNTEER_ASSIGNED
      ],
      startDate: timeRange.start,
      endDate: timeRange.end
    };

    const result = await this.analyticsEngine.query(query);
    const events = result.events || [];

    // Calculate metrics
    const sessionStartEvents = events.filter(e => e.type === AnalyticsEventType.CRISIS_SESSION_STARTED);
    const sessionEndEvents = events.filter(e => e.type === AnalyticsEventType.CRISIS_SESSION_ENDED);
    const escalationEvents = events.filter(e => e.type === AnalyticsEventType.EMERGENCY_ESCALATION);

    const totalSessions = sessionStartEvents.length;
    const activeSessions = totalSessions - sessionEndEvents.length;
    
    const responseTimes = sessionEndEvents
      .map(e => e.data.responseTime)
      .filter(rt => typeof rt === 'number');
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const escalationRate = totalSessions > 0 ? (escalationEvents.length / totalSessions) * 100 : 0;
    
    const resolvedSessions = sessionEndEvents.filter(e => e.data.outcome === 'resolved').length;
    const resolutionRate = totalSessions > 0 ? (resolvedSessions / totalSessions) * 100 : 0;
    
    const abandonedSessions = sessionEndEvents.filter(e => e.data.outcome === 'abandoned').length;
    const abandonmentRate = totalSessions > 0 ? (abandonedSessions / totalSessions) * 100 : 0;

    // Calculate volunteer utilization (placeholder)
    const volunteerUtilization = 75; // This would be calculated from volunteer data

    // Extract top risk factors
    const allKeywords: string[] = [];
    sessionStartEvents.forEach(event => {
      if (event.data.keywordsDetected) {
        allKeywords.push(...event.data.keywordsDetected);
      }
    });

    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRiskFactors = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      totalSessions,
      activeSessions,
      averageResponseTime,
      escalationRate,
      resolutionRate,
      abandonmentRate,
      volunteerUtilization,
      topRiskFactors
    };
  }

  /**
   * Get real-time crisis metrics
   */
  async getRealTimeMetrics(): Promise<CrisisInterventionMetrics> {
    // Get recent performance data
    const responseTimeMetrics = this.performanceMonitor.getMetrics('crisis_response_time', 100);
    const escalationMetrics = this.performanceMonitor.getMetrics('crisis_escalation_time', 100);
    const assignmentMetrics = this.performanceMonitor.getMetrics('volunteer_assignment_time', 100);
    const sessionMetrics = this.performanceMonitor.getMetrics('crisis_session_duration', 100);
    const successMetrics = this.performanceMonitor.getMetrics('crisis_success_rate', 100);
    const abandonmentMetrics = this.performanceMonitor.getMetrics('crisis_outcome_abandoned', 100);
    const emergencyMetrics = this.performanceMonitor.getMetrics('emergency_response_time', 100);

    return {
      averageResponseTime: this.calculateAverage(responseTimeMetrics.map(m => m.value)),
      escalationTime: this.calculateAverage(escalationMetrics.map(m => m.value)),
      volunteerAssignmentTime: this.calculateAverage(assignmentMetrics.map(m => m.value)),
      sessionDuration: this.calculateAverage(sessionMetrics.map(m => m.value)),
      successRate: this.calculateAverage(successMetrics.map(m => m.value)),
      abandonmentRate: this.calculateAverage(abandonmentMetrics.map(m => m.value)),
      emergencyResponseTime: this.calculateAverage(emergencyMetrics.map(m => m.value))
    };
  }

  /**
   * Generate crisis analytics report
   */
  async generateReport(timeRange: { start: Date; end: Date }): Promise<{
    summary: any;
    metrics: CrisisInterventionMetrics;
    recommendations: string[];
    alerts: string[];
  }> {
    const summary = await this.getCrisisSummary(timeRange);
    const metrics = await this.getRealTimeMetrics();
    
    const recommendations = this.generateRecommendations(summary, metrics);
    const alerts = this.generateAlerts(summary, metrics);

    return {
      summary,
      metrics,
      recommendations,
      alerts
    };
  }

  /**
   * Generate recommendations based on analytics
   */
  private generateRecommendations(summary: any, metrics: CrisisInterventionMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.averageResponseTime > this.config.alertThresholds.responseTime) {
      recommendations.push('Consider increasing volunteer capacity during peak hours');
    }

    if (summary.escalationRate > this.config.alertThresholds.escalationRate) {
      recommendations.push('Review crisis detection algorithms for early intervention');
    }

    if (summary.abandonmentRate > this.config.alertThresholds.abandonmentRate) {
      recommendations.push('Improve initial response time and volunteer training');
    }

    if (summary.volunteerUtilization > 90) {
      recommendations.push('Recruit additional volunteers to prevent burnout');
    }

    if (metrics.emergencyResponseTime > 30000) { // 30 seconds
      recommendations.push('Optimize emergency escalation protocols');
    }

    return recommendations;
  }

  /**
   * Generate alerts based on current metrics
   */
  private generateAlerts(summary: any, metrics: CrisisInterventionMetrics): string[] {
    const alerts: string[] = [];

    if (metrics.averageResponseTime > this.config.alertThresholds.responseTime * 2) {
      alerts.push(`CRITICAL: Response time is ${metrics.averageResponseTime}ms (threshold: ${this.config.alertThresholds.responseTime}ms)`);
    }

    if (summary.escalationRate > this.config.alertThresholds.escalationRate * 1.5) {
      alerts.push(`WARNING: Escalation rate is ${summary.escalationRate}% (threshold: ${this.config.alertThresholds.escalationRate}%)`);
    }

    if (summary.abandonmentRate > this.config.alertThresholds.abandonmentRate) {
      alerts.push(`WARNING: Abandonment rate is ${summary.abandonmentRate}% (threshold: ${this.config.alertThresholds.abandonmentRate}%)`);
    }

    if (summary.activeSessions > 50) {
      alerts.push(`INFO: High activity detected - ${summary.activeSessions} active crisis sessions`);
    }

    return alerts;
  }

  /**
   * Track volunteer performance in crisis situations
   */
  async trackVolunteerCrisisPerformance(volunteerId: string, data: {
    sessionId: string;
    responseTime: number;
    sessionDuration: number;
    outcome: 'resolved' | 'escalated' | 'transferred' | 'abandoned';
    userRating?: number;
    escalationRequired: boolean;
  }): Promise<void> {
    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.VOLUNTEER_ASSIGNED,
      {
        volunteerId,
        sessionId: data.sessionId,
        responseTime: data.responseTime,
        sessionDuration: data.sessionDuration,
        outcome: data.outcome,
        userRating: data.userRating,
        escalationRequired: data.escalationRequired,
        eventSubtype: 'performance_tracking'
      }
    );

    // Track individual volunteer metrics
    if (this.config.trackVolunteerPerformance) {
      this.performanceMonitor.recordMetric(
        'volunteer_crisis_response_time',
        data.responseTime,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.CRISIS_INTERVENTION,
        { 
          volunteerId,
          outcome: data.outcome,
          escalated: data.escalationRequired.toString()
        }
      );

      if (data.userRating) {
        this.performanceMonitor.recordMetric(
          'volunteer_user_rating',
          data.userRating,
          PerformanceUnit.COUNT,
          PerformanceCategory.USER_EXPERIENCE,
          { volunteerId }
        );
      }
    }
  }

  /**
   * Get crisis trends over time
   */
  async getCrisisTrends(timeRange: { start: Date; end: Date }, interval: 'hour' | 'day' | 'week'): Promise<{
    timeline: { timestamp: Date; count: number; averageResponseTime: number }[];
    trends: {
      sessionGrowth: number; // percentage
      responseTimeChange: number; // percentage
      escalationTrend: number; // percentage
    };
  }> {
    // This would implement time-series analysis
    // For now, return mock data structure
    const timeline: { timestamp: Date; count: number; averageResponseTime: number }[] = [];
    const trends = {
      sessionGrowth: 5.2, // 5.2% increase
      responseTimeChange: -3.1, // 3.1% improvement
      escalationTrend: 1.8 // 1.8% increase in escalations
    };

    return { timeline, trends };
  }

  /**
   * Calculate average from array of numbers
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get crisis hotspots (geographic or temporal patterns)
   */
  async getCrisisHotspots(timeRange: { start: Date; end: Date }): Promise<{
    geographic: { region: string; count: number; severity: number }[];
    temporal: { hour: number; count: number; averageSeverity: number }[];
  }> {
    // This would analyze geographic and temporal patterns
    // For now, return mock data structure
    return {
      geographic: [
        { region: 'North America', count: 45, severity: 6.2 },
        { region: 'Europe', count: 32, severity: 5.8 },
        { region: 'Asia Pacific', count: 28, severity: 6.5 }
      ],
      temporal: [
        { hour: 22, count: 15, averageSeverity: 7.2 }, // 10 PM
        { hour: 23, count: 18, averageSeverity: 7.8 }, // 11 PM
        { hour: 0, count: 12, averageSeverity: 8.1 },  // Midnight
        { hour: 1, count: 9, averageSeverity: 7.5 }    // 1 AM
      ]
    };
  }
}