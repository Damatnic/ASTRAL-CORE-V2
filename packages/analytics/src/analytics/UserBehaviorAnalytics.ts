/**
 * ASTRAL_CORE 2.0 User Behavior Analytics
 * User interaction tracking and behavior analysis
 */

import { AnalyticsEngine } from '../engines/AnalyticsEngine';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import {
  AnalyticsEventType,
  UserBehaviorData
} from '../types/analytics.types';
import {
  PerformanceUnit,
  PerformanceCategory
} from '../types/performance.types';

export interface UserBehaviorConfig {
  trackPageViews: boolean;
  trackInteractions: boolean;
  trackSessionDuration: boolean;
  privacyMode: boolean;
  anonymizeData: boolean;
}

export class UserBehaviorAnalytics {
  private analyticsEngine: AnalyticsEngine;
  private performanceMonitor: PerformanceMonitor;
  private config: UserBehaviorConfig;
  private userSessions: Map<string, UserSession> = new Map();

  constructor(
    analyticsEngine: AnalyticsEngine,
    performanceMonitor: PerformanceMonitor,
    config: UserBehaviorConfig
  ) {
    this.analyticsEngine = analyticsEngine;
    this.performanceMonitor = performanceMonitor;
    this.config = config;
  }

  /**
   * Track user login
   */
  async trackUserLogin(userId: string, metadata?: {
    loginMethod: 'email' | 'google' | 'anonymous';
    deviceType: 'mobile' | 'tablet' | 'desktop';
    location?: string;
  }): Promise<void> {
    const sessionId = this.generateSessionId();
    
    // Start user session
    this.userSessions.set(userId, {
      sessionId,
      userId,
      startTime: new Date(),
      pageViews: 0,
      interactions: 0,
      lastActivity: new Date()
    });

    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.USER_LOGIN,
      {
        userId: this.config.anonymizeData ? this.anonymizeUserId(userId) : userId,
        sessionId,
        loginMethod: metadata?.loginMethod || 'unknown',
        deviceType: metadata?.deviceType || 'unknown',
        location: metadata?.location
      }
    );

    // Track login metric
    this.performanceMonitor.recordMetric(
      'user_login',
      1,
      PerformanceUnit.COUNT,
      PerformanceCategory.USER_EXPERIENCE,
      {
        method: metadata?.loginMethod || 'unknown',
        device: metadata?.deviceType || 'unknown'
      }
    );
  }

  /**
   * Track user logout
   */
  async trackUserLogout(userId: string): Promise<void> {
    const session = this.userSessions.get(userId);
    if (!session) return;

    const sessionDuration = Date.now() - session.startTime.getTime();

    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.USER_LOGOUT,
      {
        userId: this.config.anonymizeData ? this.anonymizeUserId(userId) : userId,
        sessionId: session.sessionId,
        sessionDuration,
        pageViews: session.pageViews,
        interactions: session.interactions
      }
    );

    // Track session metrics
    this.performanceMonitor.recordMetric(
      'user_session_duration',
      sessionDuration,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.USER_EXPERIENCE,
      {
        pageViews: session.pageViews.toString(),
        interactions: session.interactions.toString()
      }
    );

    // Remove session
    this.userSessions.delete(userId);
  }

  /**
   * Track page view
   */
  async trackPageView(userId: string, data: {
    page: string;
    referrer?: string;
    loadTime?: number;
  }): Promise<void> {
    if (!this.config.trackPageViews) return;

    const session = this.userSessions.get(userId);
    if (session) {
      session.pageViews++;
      session.lastActivity = new Date();
    }

    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.PAGE_VIEW,
      {
        userId: this.config.anonymizeData ? this.anonymizeUserId(userId) : userId,
        page: data.page,
        referrer: data.referrer,
        loadTime: data.loadTime,
        sessionId: session?.sessionId
      }
    );

    // Track page load performance
    if (data.loadTime) {
      this.performanceMonitor.recordMetric(
        'page_load_time',
        data.loadTime,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.USER_EXPERIENCE,
        { page: data.page }
      );
    }
  }

  /**
   * Track user interaction
   */
  async trackInteraction(userId: string, data: {
    type: 'click' | 'scroll' | 'form_submit' | 'search' | 'download';
    element: string;
    page: string;
    value?: string;
  }): Promise<void> {
    if (!this.config.trackInteractions) return;

    const session = this.userSessions.get(userId);
    if (session) {
      session.interactions++;
      session.lastActivity = new Date();
    }

    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.BUTTON_CLICK,
      {
        userId: this.config.anonymizeData ? this.anonymizeUserId(userId) : userId,
        interactionType: data.type,
        element: data.element,
        page: data.page,
        value: data.value,
        sessionId: session?.sessionId
      }
    );

    // Track interaction metrics
    this.performanceMonitor.recordMetric(
      'user_interaction',
      1,
      PerformanceUnit.COUNT,
      PerformanceCategory.USER_EXPERIENCE,
      {
        type: data.type,
        page: data.page,
        element: data.element
      }
    );
  }

  /**
   * Get user behavior summary
   */
  async getUserBehaviorSummary(timeRange: { start: Date; end: Date }): Promise<{
    totalUsers: number;
    activeUsers: number;
    averageSessionDuration: number;
    totalPageViews: number;
    totalInteractions: number;
    bounceRate: number;
    topPages: { page: string; views: number }[];
    topInteractions: { element: string; count: number }[];
  }> {
    const query = {
      eventTypes: [
        AnalyticsEventType.USER_LOGIN,
        AnalyticsEventType.USER_LOGOUT,
        AnalyticsEventType.PAGE_VIEW,
        AnalyticsEventType.BUTTON_CLICK
      ],
      startDate: timeRange.start,
      endDate: timeRange.end
    };

    const result = await this.analyticsEngine.query(query);
    const events = result.events || [];

    // Calculate metrics
    const loginEvents = events.filter(e => e.type === AnalyticsEventType.USER_LOGIN);
    const logoutEvents = events.filter(e => e.type === AnalyticsEventType.USER_LOGOUT);
    const pageViewEvents = events.filter(e => e.type === AnalyticsEventType.PAGE_VIEW);
    const interactionEvents = events.filter(e => e.type === AnalyticsEventType.BUTTON_CLICK);

    const totalUsers = new Set(loginEvents.map(e => e.userId)).size;
    const activeUsers = new Set(events.map(e => e.userId)).size;

    const sessionDurations = logoutEvents
      .map(e => e.data.sessionDuration)
      .filter(d => typeof d === 'number');
    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

    const totalPageViews = pageViewEvents.length;
    const totalInteractions = interactionEvents.length;

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionPageViews = new Map<string, number>();
    pageViewEvents.forEach(event => {
      const sessionId = event.data.sessionId;
      if (sessionId) {
        sessionPageViews.set(sessionId, (sessionPageViews.get(sessionId) || 0) + 1);
      }
    });

    const bouncedSessions = Array.from(sessionPageViews.values()).filter(views => views === 1).length;
    const bounceRate = sessionPageViews.size > 0 ? (bouncedSessions / sessionPageViews.size) * 100 : 0;

    // Top pages
    const pageCounts = pageViewEvents.reduce((acc, event) => {
      const page = event.data.page;
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Top interactions
    const interactionCounts = interactionEvents.reduce((acc, event) => {
      const element = event.data.element;
      acc[element] = (acc[element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topInteractions = Object.entries(interactionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([element, count]) => ({ element, count }));

    return {
      totalUsers,
      activeUsers,
      averageSessionDuration,
      totalPageViews,
      totalInteractions,
      bounceRate,
      topPages,
      topInteractions
    };
  }

  /**
   * Track user journey through crisis intervention
   */
  async trackCrisisUserJourney(userId: string, data: {
    stage: 'landing' | 'assessment' | 'matching' | 'conversation' | 'resolution';
    duration: number;
    outcome?: 'completed' | 'abandoned' | 'escalated';
    satisfaction?: number;
  }): Promise<void> {
    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.PAGE_VIEW,
      {
        userId: this.config.anonymizeData ? this.anonymizeUserId(userId) : userId,
        page: `crisis_${data.stage}`,
        duration: data.duration,
        outcome: data.outcome,
        satisfaction: data.satisfaction,
        eventSubtype: 'crisis_journey'
      }
    );

    // Track journey metrics
    this.performanceMonitor.recordMetric(
      `crisis_journey_${data.stage}`,
      data.duration,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.USER_EXPERIENCE,
      {
        outcome: data.outcome || 'in_progress',
        satisfaction: data.satisfaction?.toString() || 'unknown'
      }
    );
  }

  /**
   * Get user engagement metrics
   */
  getEngagementMetrics(): {
    activeSessions: number;
    averageSessionDuration: number;
    interactionsPerSession: number;
  } {
    const activeSessions = this.userSessions.size;
    
    const sessionDurations = Array.from(this.userSessions.values())
      .map(session => Date.now() - session.startTime.getTime());
    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 0;

    const totalInteractions = Array.from(this.userSessions.values())
      .reduce((sum, session) => sum + session.interactions, 0);
    const interactionsPerSession = activeSessions > 0 ? totalInteractions / activeSessions : 0;

    return {
      activeSessions,
      averageSessionDuration,
      interactionsPerSession
    };
  }

  /**
   * Cleanup inactive sessions
   */
  cleanupInactiveSessions(timeoutMinutes: number = 30): void {
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    
    for (const [userId, session] of this.userSessions.entries()) {
      if (session.lastActivity < cutoffTime) {
        // Track session timeout
        this.trackUserLogout(userId).catch(error => {
          console.error('Failed to track session timeout:', error);
        });
      }
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Anonymize user ID for privacy
   */
  private anonymizeUserId(userId: string): string {
    if (!this.config.anonymizeData) return userId;
    
    // Simple hash-based anonymization
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `anon_${Math.abs(hash)}`;
  }
}

interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  pageViews: number;
  interactions: number;
  lastActivity: Date;
}