/**
 * ASTRAL_CORE 2.0 System Health Monitor
 * Comprehensive system health monitoring and alerting
 */

import { PerformanceMonitor } from './PerformanceMonitor';
import { AnalyticsEngine } from '../engines/AnalyticsEngine';
import {
  SystemPerformanceSnapshot,
  PerformanceUnit,
  PerformanceCategory,
  AlertLevel,
  PerformanceAlert
} from '../types/performance.types';
import { AnalyticsEventType } from '../types/analytics.types';

export interface SystemHealthConfig {
  monitoringInterval: number; // milliseconds
  healthCheckEndpoints: string[];
  alertThresholds: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    responseTime: number; // milliseconds
    errorRate: number; // percentage
  };
  enableAutoRecovery: boolean;
  retentionDays: number;
}

export interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
}

export class SystemHealthMonitor {
  private config: SystemHealthConfig;
  private performanceMonitor: PerformanceMonitor;
  private analyticsEngine: AnalyticsEngine;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthHistory: Map<string, HealthCheckResult[]> = new Map();

  constructor(
    config: SystemHealthConfig,
    performanceMonitor: PerformanceMonitor,
    analyticsEngine: AnalyticsEngine
  ) {
    this.config = config;
    this.performanceMonitor = performanceMonitor;
    this.analyticsEngine = analyticsEngine;

    this.startMonitoring();
  }

  /**
   * Start system health monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.config.monitoringInterval);

    console.log(`System health monitoring started (interval: ${this.config.monitoringInterval}ms)`);
  }

  /**
   * Stop system health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('System health monitoring stopped');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    system: SystemPerformanceSnapshot;
    endpoints: HealthCheckResult[];
    alerts: PerformanceAlert[];
  }> {
    const system = await this.getSystemSnapshot();
    const endpoints = await this.checkEndpoints();
    const alerts = this.generateHealthAlerts(system, endpoints);

    // Record system metrics
    await this.recordSystemMetrics(system);

    // Record endpoint metrics
    await this.recordEndpointMetrics(endpoints);

    // Determine overall health
    const overall = this.calculateOverallHealth(system, endpoints, alerts);

    // Track health status change
    await this.trackHealthStatusChange(overall);

    return {
      overall,
      system,
      endpoints,
      alerts
    };
  }

  /**
   * Get current system performance snapshot
   */
  async getSystemSnapshot(): Promise<SystemPerformanceSnapshot> {
    // This would integrate with actual system monitoring
    // For now, return simulated data
    return {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        loadAverage: [
          Math.random() * 2,
          Math.random() * 2,
          Math.random() * 2
        ]
      },
      memory: {
        used: Math.random() * 8000000000, // 8GB
        total: 8000000000,
        percentage: Math.random() * 100
      },
      disk: {
        used: Math.random() * 500000000000, // 500GB
        total: 1000000000000, // 1TB
        percentage: Math.random() * 100
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000
      },
      processes: {
        active: Math.floor(Math.random() * 200),
        total: Math.floor(Math.random() * 300)
      }
    };
  }

  /**
   * Check health of configured endpoints
   */
  async checkEndpoints(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    for (const endpoint of this.config.healthCheckEndpoints) {
      try {
        const result = await this.checkEndpoint(endpoint);
        results.push(result);
        
        // Store in history
        if (!this.healthHistory.has(endpoint)) {
          this.healthHistory.set(endpoint, []);
        }
        const history = this.healthHistory.get(endpoint)!;
        history.push(result);
        
        // Keep only recent history
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }
      } catch (error) {
        const result: HealthCheckResult = {
          endpoint,
          status: 'unhealthy',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Check individual endpoint health
   */
  private async checkEndpoint(endpoint: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simulate HTTP health check
      // In real implementation, this would make actual HTTP requests
      const responseTime = Math.random() * 1000; // 0-1000ms
      const statusCode = Math.random() > 0.1 ? 200 : 500; // 90% success rate

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (statusCode >= 200 && statusCode < 300 && responseTime < 500) {
        status = 'healthy';
      } else if (statusCode >= 200 && statusCode < 300 && responseTime < 2000) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        endpoint,
        status,
        responseTime,
        statusCode,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        endpoint,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate health alerts based on current metrics
   */
  private generateHealthAlerts(
    system: SystemPerformanceSnapshot,
    endpoints: HealthCheckResult[]
  ): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    // CPU alerts
    if (system.cpu.usage > this.config.alertThresholds.cpu) {
      alerts.push({
        id: this.generateAlertId(),
        metricId: 'system_cpu_usage',
        level: system.cpu.usage > this.config.alertThresholds.cpu * 1.5 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        message: `High CPU usage: ${system.cpu.usage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Memory alerts
    if (system.memory.percentage > this.config.alertThresholds.memory) {
      alerts.push({
        id: this.generateAlertId(),
        metricId: 'system_memory_usage',
        level: system.memory.percentage > this.config.alertThresholds.memory * 1.2 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        message: `High memory usage: ${system.memory.percentage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Disk alerts
    if (system.disk.percentage > this.config.alertThresholds.disk) {
      alerts.push({
        id: this.generateAlertId(),
        metricId: 'system_disk_usage',
        level: system.disk.percentage > this.config.alertThresholds.disk * 1.1 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        message: `High disk usage: ${system.disk.percentage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Endpoint alerts
    const unhealthyEndpoints = endpoints.filter(e => e.status === 'unhealthy');
    if (unhealthyEndpoints.length > 0) {
      alerts.push({
        id: this.generateAlertId(),
        metricId: 'endpoint_health',
        level: AlertLevel.CRITICAL,
        message: `${unhealthyEndpoints.length} endpoint(s) unhealthy: ${unhealthyEndpoints.map(e => e.endpoint).join(', ')}`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    const degradedEndpoints = endpoints.filter(e => e.status === 'degraded');
    if (degradedEndpoints.length > 0) {
      alerts.push({
        id: this.generateAlertId(),
        metricId: 'endpoint_health',
        level: AlertLevel.WARNING,
        message: `${degradedEndpoints.length} endpoint(s) degraded: ${degradedEndpoints.map(e => e.endpoint).join(', ')}`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    return alerts;
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(
    system: SystemPerformanceSnapshot,
    endpoints: HealthCheckResult[],
    alerts: PerformanceAlert[]
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const criticalAlerts = alerts.filter(a => a.level === AlertLevel.CRITICAL).length;
    const warningAlerts = alerts.filter(a => a.level === AlertLevel.WARNING).length;
    const unhealthyEndpoints = endpoints.filter(e => e.status === 'unhealthy').length;

    if (criticalAlerts > 0 || unhealthyEndpoints > 0) {
      return 'unhealthy';
    }

    if (warningAlerts > 0 || endpoints.some(e => e.status === 'degraded')) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Record system metrics
   */
  private async recordSystemMetrics(system: SystemPerformanceSnapshot): Promise<void> {
    // CPU metrics
    this.performanceMonitor.recordMetric(
      'system_cpu_usage',
      system.cpu.usage,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.RESOURCE_USAGE
    );

    // Memory metrics
    this.performanceMonitor.recordMetric(
      'system_memory_usage',
      system.memory.percentage,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.RESOURCE_USAGE
    );

    this.performanceMonitor.recordMetric(
      'system_memory_used',
      system.memory.used,
      PerformanceUnit.BYTES,
      PerformanceCategory.RESOURCE_USAGE
    );

    // Disk metrics
    this.performanceMonitor.recordMetric(
      'system_disk_usage',
      system.disk.percentage,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.RESOURCE_USAGE
    );

    // Network metrics
    this.performanceMonitor.recordMetric(
      'system_network_bytes_in',
      system.network.bytesIn,
      PerformanceUnit.BYTES,
      PerformanceCategory.RESOURCE_USAGE
    );

    this.performanceMonitor.recordMetric(
      'system_network_bytes_out',
      system.network.bytesOut,
      PerformanceUnit.BYTES,
      PerformanceCategory.RESOURCE_USAGE
    );

    // Process metrics
    this.performanceMonitor.recordMetric(
      'system_active_processes',
      system.processes.active,
      PerformanceUnit.COUNT,
      PerformanceCategory.RESOURCE_USAGE
    );
  }

  /**
   * Record endpoint health metrics
   */
  private async recordEndpointMetrics(endpoints: HealthCheckResult[]): Promise<void> {
    for (const endpoint of endpoints) {
      this.performanceMonitor.recordMetric(
        'endpoint_response_time',
        endpoint.responseTime,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.API,
        {
          endpoint: endpoint.endpoint,
          status: endpoint.status,
          statusCode: endpoint.statusCode?.toString() || 'unknown'
        }
      );

      // Track endpoint availability
      const availability = endpoint.status === 'healthy' ? 1 : 0;
      this.performanceMonitor.recordMetric(
        'endpoint_availability',
        availability,
        PerformanceUnit.COUNT,
        PerformanceCategory.API,
        { endpoint: endpoint.endpoint }
      );
    }
  }

  /**
   * Track health status changes
   */
  private async trackHealthStatusChange(currentStatus: 'healthy' | 'degraded' | 'unhealthy'): Promise<void> {
    await this.analyticsEngine.trackEvent(
      AnalyticsEventType.SYSTEM_ERROR,
      {
        healthStatus: currentStatus,
        timestamp: new Date(),
        category: 'system_health'
      }
    );
  }

  /**
   * Get health summary for dashboard
   */
  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    activeAlerts: number;
    endpointHealth: {
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
    systemMetrics: {
      cpu: number;
      memory: number;
      disk: number;
    };
  } {
    // Get recent performance data
    const cpuMetrics = this.performanceMonitor.getMetrics('system_cpu_usage', 1);
    const memoryMetrics = this.performanceMonitor.getMetrics('system_memory_usage', 1);
    const diskMetrics = this.performanceMonitor.getMetrics('system_disk_usage', 1);

    const activeAlerts = this.performanceMonitor.getActiveAlerts().length;

    // Calculate endpoint health distribution
    const endpointHealth = { healthy: 0, degraded: 0, unhealthy: 0 };
    for (const history of this.healthHistory.values()) {
      if (history.length > 0) {
        const latest = history[history.length - 1];
        endpointHealth[latest.status]++;
      }
    }

    // Calculate uptime (simplified)
    const uptime = 99.9; // This would be calculated from actual uptime data

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (endpointHealth.unhealthy > 0 || activeAlerts > 0) {
      status = 'unhealthy';
    } else if (endpointHealth.degraded > 0) {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      activeAlerts,
      endpointHealth,
      systemMetrics: {
        cpu: cpuMetrics[0]?.value || 0,
        memory: memoryMetrics[0]?.value || 0,
        disk: diskMetrics[0]?.value || 0
      }
    };
  }

  /**
   * Get endpoint health history
   */
  getEndpointHistory(endpoint: string, limit: number = 50): HealthCheckResult[] {
    const history = this.healthHistory.get(endpoint) || [];
    return history.slice(-limit);
  }

  /**
   * Trigger manual health check
   */
  async triggerHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    system: SystemPerformanceSnapshot;
    endpoints: HealthCheckResult[];
    alerts: PerformanceAlert[];
  }> {
    console.log('Manual health check triggered');
    return await this.performHealthCheck();
  }

  /**
   * Get system resource trends
   */
  getResourceTrends(hours: number = 24): {
    cpu: { timestamp: Date; value: number }[];
    memory: { timestamp: Date; value: number }[];
    disk: { timestamp: Date; value: number }[];
  } {
    const limit = Math.floor((hours * 60 * 60 * 1000) / this.config.monitoringInterval);

    const cpuMetrics = this.performanceMonitor.getMetrics('system_cpu_usage', limit);
    const memoryMetrics = this.performanceMonitor.getMetrics('system_memory_usage', limit);
    const diskMetrics = this.performanceMonitor.getMetrics('system_disk_usage', limit);

    return {
      cpu: cpuMetrics.map(m => ({ timestamp: m.timestamp, value: m.value })),
      memory: memoryMetrics.map(m => ({ timestamp: m.timestamp, value: m.value })),
      disk: diskMetrics.map(m => ({ timestamp: m.timestamp, value: m.value }))
    };
  }

  /**
   * Cleanup old health data
   */
  async cleanup(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    // Cleanup endpoint history
    for (const [endpoint, history] of this.healthHistory.entries()) {
      const filteredHistory = history.filter(h => h.timestamp > cutoffDate);
      this.healthHistory.set(endpoint, filteredHistory);
    }

    console.log(`Cleaned up health data older than ${this.config.retentionDays} days`);
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `health_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the health monitor
   */
  shutdown(): void {
    this.stopMonitoring();
  }
}

/**
 * Health monitoring utilities
 */
export class HealthUtils {
  /**
   * Check if system is under stress
   */
  static isSystemUnderStress(snapshot: SystemPerformanceSnapshot): boolean {
    return snapshot.cpu.usage > 80 || 
           snapshot.memory.percentage > 85 || 
           snapshot.disk.percentage > 90;
  }

  /**
   * Calculate system health score (0-100)
   */
  static calculateHealthScore(
    system: SystemPerformanceSnapshot,
    endpoints: HealthCheckResult[]
  ): number {
    let score = 100;

    // Deduct for high resource usage
    if (system.cpu.usage > 70) score -= (system.cpu.usage - 70) * 0.5;
    if (system.memory.percentage > 80) score -= (system.memory.percentage - 80) * 0.5;
    if (system.disk.percentage > 85) score -= (system.disk.percentage - 85) * 0.5;

    // Deduct for unhealthy endpoints
    const unhealthyCount = endpoints.filter(e => e.status === 'unhealthy').length;
    const degradedCount = endpoints.filter(e => e.status === 'degraded').length;
    
    score -= unhealthyCount * 20;
    score -= degradedCount * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get health status color for UI
   */
  static getHealthColor(status: 'healthy' | 'degraded' | 'unhealthy'): string {
    switch (status) {
      case 'healthy': return '#22c55e'; // green
      case 'degraded': return '#f59e0b'; // yellow
      case 'unhealthy': return '#ef4444'; // red
    }
  }
}