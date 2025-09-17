/**
 * ASTRAL_CORE 2.0 Analytics Engine
 * Core analytics processing and event management system
 */

import {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsQuery,
  AnalyticsResult,
  AnalyticsMetadata,
  CrisisAnalyticsData,
  UserBehaviorData,
  SystemHealthData,
  AnalyticsMetric
} from '../types/analytics.types';

export interface AnalyticsEngineConfig {
  batchSize: number;
  flushInterval: number; // milliseconds
  retentionDays: number;
  enableRealTimeProcessing: boolean;
  storageBackend: 'memory' | 'database' | 'elasticsearch';
  encryptionEnabled: boolean;
}

export class AnalyticsEngine {
  private config: AnalyticsEngineConfig;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(config: Partial<AnalyticsEngineConfig> = {}) {
    this.config = {
      batchSize: 100,
      flushInterval: 5000, // 5 seconds
      retentionDays: 90,
      enableRealTimeProcessing: true,
      storageBackend: 'database',
      encryptionEnabled: true,
      ...config
    };

    this.startFlushTimer();
  }

  /**
   * Track a single analytics event
   */
  async trackEvent(
    type: AnalyticsEventType,
    data: Record<string, any>,
    metadata?: Partial<AnalyticsMetadata>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      data,
      metadata: {
        ...this.getDefaultMetadata(),
        ...metadata
      }
    };

    // Add to buffer
    this.eventBuffer.push(event);

    // Process immediately if real-time processing is enabled
    if (this.config.enableRealTimeProcessing) {
      await this.processEvent(event);
    }

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Track multiple events in batch
   */
  async trackEvents(events: Omit<AnalyticsEvent, 'id' | 'timestamp'>[]): Promise<void> {
    const processedEvents = events.map(event => ({
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      metadata: {
        ...this.getDefaultMetadata(),
        ...event.metadata
      }
    }));

    this.eventBuffer.push(...processedEvents);

    if (this.config.enableRealTimeProcessing) {
      await Promise.all(processedEvents.map(event => this.processEvent(event)));
    }

    if (this.eventBuffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Query analytics data
   */
  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const startTime = Date.now();

    try {
      // Validate query
      this.validateQuery(query);

      // Execute query based on storage backend
      const events = await this.executeQuery(query);

      // Process aggregations if requested
      const aggregations = query.aggregation ? 
        await this.processAggregations(events, query) : 
        undefined;

      const executionTime = Date.now() - startTime;

      return {
        events,
        aggregations,
        totalCount: events.length,
        query,
        executionTime
      };
    } catch (error) {
      console.error('Analytics query failed:', error);
      throw new Error(`Analytics query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track crisis-specific analytics
   */
  async trackCrisisEvent(
    sessionId: string,
    eventType: AnalyticsEventType,
    crisisData: Partial<CrisisAnalyticsData>
  ): Promise<void> {
    await this.trackEvent(eventType, {
      sessionId,
      ...crisisData,
      category: 'crisis'
    });
  }

  /**
   * Track user behavior analytics
   */
  async trackUserBehavior(
    userId: string,
    behaviorData: Partial<UserBehaviorData>
  ): Promise<void> {
    await this.trackEvent(AnalyticsEventType.USER_LOGIN, {
      userId,
      ...behaviorData,
      category: 'user_behavior'
    });
  }

  /**
   * Track system health metrics
   */
  async trackSystemHealth(healthData: SystemHealthData): Promise<void> {
    await this.trackEvent(AnalyticsEventType.PERFORMANCE_METRIC, {
      ...healthData,
      category: 'system_health'
    });
  }

  /**
   * Get analytics summary for dashboard
   */
  async getDashboardSummary(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    crisisEvents: number;
    activeUsers: number;
    systemHealth: 'good' | 'warning' | 'critical';
    topEvents: { type: AnalyticsEventType; count: number }[];
  }> {
    const query: AnalyticsQuery = {
      startDate: timeRange.start,
      endDate: timeRange.end,
      aggregation: {
        groupBy: ['type'],
        metrics: [AnalyticsMetric.COUNT],
        timeInterval: 'hour'
      }
    };

    const result = await this.query(query);
    
    // Process results for dashboard
    const totalEvents = result.totalCount;
    const crisisEvents = result.events?.filter(e => 
      e.type.includes('crisis') || e.type.includes('emergency')
    ).length || 0;

    const activeUsers = new Set(
      result.events?.map(e => e.userId).filter(Boolean)
    ).size;

    const systemHealth = this.calculateSystemHealth(result.events || []);
    
    const topEvents = result.aggregations?.slice(0, 5).map(agg => ({
      type: agg.groupKey.type as AnalyticsEventType,
      count: agg.metrics.count || 0
    })) || [];

    return {
      totalEvents,
      crisisEvents,
      activeUsers,
      systemHealth,
      topEvents
    };
  }

  /**
   * Flush buffered events to storage
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.eventBuffer.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const eventsToProcess = [...this.eventBuffer];
      this.eventBuffer = [];

      await this.persistEvents(eventsToProcess);
      
      console.log(`Flushed ${eventsToProcess.length} analytics events`);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...this.eventBuffer);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Cleanup old events based on retention policy
   */
  async cleanup(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    try {
      await this.deleteEventsBefore(cutoffDate);
      console.log(`Cleaned up analytics events older than ${this.config.retentionDays} days`);
    } catch (error) {
      console.error('Failed to cleanup old analytics events:', error);
    }
  }

  /**
   * Shutdown the analytics engine
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining events
    await this.flush();
  }

  // Private methods

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        console.error('Scheduled flush failed:', error);
      });
    }, this.config.flushInterval);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultMetadata(): AnalyticsMetadata {
    return {
      userAgent: 'ASTRAL_CORE/2.0',
      device: {
        type: 'desktop',
        os: 'unknown',
        browser: 'unknown'
      }
    };
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    // Real-time processing logic
    if (this.isCriticalEvent(event)) {
      await this.handleCriticalEvent(event);
    }

    // Update real-time metrics
    await this.updateRealTimeMetrics(event);
  }

  private isCriticalEvent(event: AnalyticsEvent): boolean {
    return event.type === AnalyticsEventType.EMERGENCY_ESCALATION ||
           event.type === AnalyticsEventType.SYSTEM_ERROR ||
           (event.data.severity && event.data.severity === 'critical');
  }

  private async handleCriticalEvent(event: AnalyticsEvent): Promise<void> {
    // Immediate processing for critical events
    console.warn('Critical analytics event detected:', event);
    
    // Could trigger alerts, notifications, etc.
    if (event.type === AnalyticsEventType.EMERGENCY_ESCALATION) {
      // Handle emergency escalation analytics
      await this.trackEmergencyMetrics(event);
    }
  }

  private async trackEmergencyMetrics(event: AnalyticsEvent): Promise<void> {
    // Track emergency response metrics
    const responseTime = event.data.responseTime || 0;
    const escalationLevel = event.data.escalationLevel || 'unknown';
    
    // Update emergency response statistics
    console.log(`Emergency response tracked: ${responseTime}ms, level: ${escalationLevel}`);
  }

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    // Update real-time dashboards, counters, etc.
    // This could publish to WebSocket connections, update Redis counters, etc.
  }

  private validateQuery(query: AnalyticsQuery): void {
    if (!query.startDate || !query.endDate) {
      throw new Error('Query must include start and end dates');
    }

    if (query.startDate > query.endDate) {
      throw new Error('Start date must be before end date');
    }

    const maxQueryRange = 90 * 24 * 60 * 60 * 1000; // 90 days
    if (query.endDate.getTime() - query.startDate.getTime() > maxQueryRange) {
      throw new Error('Query range cannot exceed 90 days');
    }
  }

  private async executeQuery(query: AnalyticsQuery): Promise<AnalyticsEvent[]> {
    // This would be implemented based on the storage backend
    // For now, return empty array as placeholder
    return [];
  }

  private async processAggregations(events: AnalyticsEvent[], query: AnalyticsQuery): Promise<any[]> {
    // Process aggregations based on query
    return [];
  }

  private calculateSystemHealth(events: AnalyticsEvent[]): 'good' | 'warning' | 'critical' {
    const errorEvents = events.filter(e => e.type === AnalyticsEventType.SYSTEM_ERROR);
    const errorRate = errorEvents.length / Math.max(events.length, 1);

    if (errorRate > 0.1) return 'critical';
    if (errorRate > 0.05) return 'warning';
    return 'good';
  }

  private async persistEvents(events: AnalyticsEvent[]): Promise<void> {
    // Implement based on storage backend
    switch (this.config.storageBackend) {
      case 'database':
        await this.persistToDatabase(events);
        break;
      case 'elasticsearch':
        await this.persistToElasticsearch(events);
        break;
      case 'memory':
        // For testing/development
        break;
    }
  }

  private async persistToDatabase(events: AnalyticsEvent[]): Promise<void> {
    // Database persistence implementation
    console.log(`Persisting ${events.length} events to database`);
  }

  private async persistToElasticsearch(events: AnalyticsEvent[]): Promise<void> {
    // Elasticsearch persistence implementation
    console.log(`Persisting ${events.length} events to Elasticsearch`);
  }

  private async deleteEventsBefore(cutoffDate: Date): Promise<void> {
    // Cleanup implementation based on storage backend
    console.log(`Deleting events before ${cutoffDate.toISOString()}`);
  }
}