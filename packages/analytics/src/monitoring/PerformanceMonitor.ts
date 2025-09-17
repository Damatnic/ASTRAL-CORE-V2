/**
 * ASTRAL_CORE 2.0 Performance Monitor
 * Real-time performance monitoring and alerting system
 */

import {
  PerformanceMetric,
  PerformanceUnit,
  PerformanceCategory,
  PerformanceThreshold,
  PerformanceAlert,
  AlertLevel,
  SystemPerformanceSnapshot,
  WebSocketPerformanceMetrics,
  DatabasePerformanceMetrics,
  CrisisInterventionMetrics,
  PerformanceMonitorConfig,
  AlertChannel
} from '../types/performance.types';

export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: PerformanceMonitorConfig) {
    this.config = config;
    
    if (config.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: PerformanceUnit,
    category: PerformanceCategory,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      name,
      value,
      unit,
      timestamp: new Date(),
      category,
      tags,
      threshold: this.config.thresholds[name]
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // Check thresholds and generate alerts
    this.checkThresholds(metric);

    // Cleanup old metrics
    this.cleanupOldMetrics(name);
  }

  /**
   * Record response time metric
   */
  recordResponseTime(endpoint: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric(
      `response_time_${endpoint}`,
      duration,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.RESPONSE_TIME,
      { endpoint, ...tags }
    );
  }

  /**
   * Record crisis intervention metrics
   */
  recordCrisisMetrics(metrics: CrisisInterventionMetrics): void {
    this.recordMetric(
      'crisis_response_time',
      metrics.averageResponseTime,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.CRISIS_INTERVENTION
    );

    this.recordMetric(
      'crisis_escalation_time',
      metrics.escalationTime,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.CRISIS_INTERVENTION
    );

    this.recordMetric(
      'volunteer_assignment_time',
      metrics.volunteerAssignmentTime,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.CRISIS_INTERVENTION
    );

    this.recordMetric(
      'crisis_success_rate',
      metrics.successRate,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.CRISIS_INTERVENTION
    );

    this.recordMetric(
      'emergency_response_time',
      metrics.emergencyResponseTime,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.CRISIS_INTERVENTION
    );
  }

  /**
   * Record WebSocket performance metrics
   */
  recordWebSocketMetrics(metrics: WebSocketPerformanceMetrics): void {
    this.recordMetric(
      'websocket_connection_time',
      metrics.connectionTime,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.WEBSOCKET
    );

    this.recordMetric(
      'websocket_message_latency',
      metrics.messageLatency,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.WEBSOCKET
    );

    this.recordMetric(
      'websocket_active_connections',
      metrics.activeConnections,
      PerformanceUnit.COUNT,
      PerformanceCategory.WEBSOCKET
    );

    this.recordMetric(
      'websocket_error_rate',
      metrics.errorRate,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.WEBSOCKET
    );
  }

  /**
   * Record database performance metrics
   */
  recordDatabaseMetrics(metrics: DatabasePerformanceMetrics): void {
    this.recordMetric(
      'database_query_time',
      metrics.queryTime,
      PerformanceUnit.MILLISECONDS,
      PerformanceCategory.DATABASE
    );

    this.recordMetric(
      'database_active_connections',
      metrics.activeConnections,
      PerformanceUnit.COUNT,
      PerformanceCategory.DATABASE
    );

    this.recordMetric(
      'database_cache_hit_ratio',
      metrics.cacheHitRatio,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.DATABASE
    );
  }

  /**
   * Get system performance snapshot
   */
  async getSystemSnapshot(): Promise<SystemPerformanceSnapshot> {
    // This would integrate with system monitoring tools
    // For now, return mock data
    return {
      timestamp: new Date(),
      cpu: {
        usage: Math.random() * 100,
        loadAverage: [1.2, 1.5, 1.8]
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
   * Get metrics for a specific name
   */
  getMetrics(name: string, limit?: number): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    return limit ? metrics.slice(-limit) : metrics;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get performance summary for dashboard
   */
  getPerformanceSummary(): {
    averageResponseTime: number;
    errorRate: number;
    activeAlerts: number;
    systemHealth: 'good' | 'warning' | 'critical';
  } {
    const responseTimeMetrics = this.getAllMetricsByCategory(PerformanceCategory.RESPONSE_TIME);
    const averageResponseTime = this.calculateAverage(responseTimeMetrics);

    const errorMetrics = this.getAllMetricsByCategory(PerformanceCategory.ERROR_RATE);
    const errorRate = this.calculateAverage(errorMetrics);

    const activeAlerts = this.getActiveAlerts().length;
    const systemHealth = this.calculateSystemHealth();

    return {
      averageResponseTime,
      errorRate,
      activeAlerts,
      systemHealth
    };
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        console.error('Failed to collect system metrics:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Collect system-level metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    const snapshot = await this.getSystemSnapshot();

    this.recordMetric(
      'system_cpu_usage',
      snapshot.cpu.usage,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.RESOURCE_USAGE
    );

    this.recordMetric(
      'system_memory_usage',
      snapshot.memory.percentage,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.RESOURCE_USAGE
    );

    this.recordMetric(
      'system_disk_usage',
      snapshot.disk.percentage,
      PerformanceUnit.PERCENTAGE,
      PerformanceCategory.RESOURCE_USAGE
    );
  }

  /**
   * Check metric against thresholds and generate alerts
   */
  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold) return;

    let alertLevel: AlertLevel | null = null;
    let message = '';

    if (metric.value >= metric.threshold.critical) {
      alertLevel = AlertLevel.CRITICAL;
      message = `Critical threshold exceeded for ${metric.name}: ${metric.value}${metric.unit}`;
    } else if (metric.value >= metric.threshold.warning) {
      alertLevel = AlertLevel.WARNING;
      message = `Warning threshold exceeded for ${metric.name}: ${metric.value}${metric.unit}`;
    }

    if (alertLevel) {
      this.generateAlert(metric, alertLevel, message);
    }
  }

  /**
   * Generate a performance alert
   */
  private generateAlert(metric: PerformanceMetric, level: AlertLevel, message: string): void {
    const alert: PerformanceAlert = {
      id: this.generateAlertId(),
      metricId: metric.id,
      level,
      message,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);

    // Send notifications if alerting is enabled
    if (this.config.alerting.enabled) {
      this.sendAlertNotifications(alert);
    }

    console.warn(`Performance Alert [${level}]: ${message}`);
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alert: PerformanceAlert): Promise<void> {
    for (const channel of this.config.alerting.channels) {
      try {
        await this.sendNotification(channel, alert);
      } catch (error) {
        console.error(`Failed to send alert via ${channel}:`, error);
      }
    }
  }

  /**
   * Send notification via specific channel
   */
  private async sendNotification(channel: AlertChannel, alert: PerformanceAlert): Promise<void> {
    switch (channel) {
      case AlertChannel.EMAIL:
        // Email notification implementation
        console.log(`Email alert sent: ${alert.message}`);
        break;
      case AlertChannel.SLACK:
        // Slack notification implementation
        console.log(`Slack alert sent: ${alert.message}`);
        break;
      case AlertChannel.WEBHOOK:
        // Webhook notification implementation
        console.log(`Webhook alert sent: ${alert.message}`);
        break;
      case AlertChannel.SMS:
        // SMS notification implementation
        console.log(`SMS alert sent: ${alert.message}`);
        break;
      case AlertChannel.PUSH_NOTIFICATION:
        // Push notification implementation
        console.log(`Push notification sent: ${alert.message}`);
        break;
    }
  }

  /**
   * Calculate system health based on current metrics
   */
  private calculateSystemHealth(): 'good' | 'warning' | 'critical' {
    const criticalAlerts = this.alerts.filter(a => 
      a.level === AlertLevel.CRITICAL && !a.acknowledged
    ).length;

    const warningAlerts = this.alerts.filter(a => 
      a.level === AlertLevel.WARNING && !a.acknowledged
    ).length;

    if (criticalAlerts > 0) return 'critical';
    if (warningAlerts > 2) return 'warning';
    return 'good';
  }

  /**
   * Get all metrics by category
   */
  private getAllMetricsByCategory(category: PerformanceCategory): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];
    
    for (const metricList of this.metrics.values()) {
      allMetrics.push(...metricList.filter(m => m.category === category));
    }

    return allMetrics;
  }

  /**
   * Calculate average value from metrics
   */
  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Cleanup old metrics based on retention policy
   */
  private cleanupOldMetrics(name: string): void {
    const metrics = this.metrics.get(name);
    if (!metrics) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const filteredMetrics = metrics.filter(m => m.timestamp > cutoffDate);
    this.metrics.set(name, filteredMetrics);
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the performance monitor
   */
  shutdown(): void {
    this.stopMonitoring();
  }
}

/**
 * Performance monitoring utility functions
 */
export class PerformanceUtils {
  /**
   * Measure execution time of a function
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>,
    metricName: string,
    monitor: PerformanceMonitor,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      monitor.recordMetric(
        metricName,
        duration,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.RESPONSE_TIME,
        tags
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      monitor.recordMetric(
        `${metricName}_error`,
        duration,
        PerformanceUnit.MILLISECONDS,
        PerformanceCategory.ERROR_RATE,
        { ...tags, error: 'true' }
      );
      
      throw error;
    }
  }

  /**
   * Create a performance decorator for methods
   */
  static performanceDecorator(metricName: string, monitor: PerformanceMonitor) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        return PerformanceUtils.measureExecutionTime(
          () => originalMethod.apply(this, args),
          `${metricName}_${propertyKey}`,
          monitor,
          { class: target.constructor.name, method: propertyKey }
        );
      };

      return descriptor;
    };
  }

  /**
   * Monitor memory usage
   */
  static monitorMemoryUsage(monitor: PerformanceMonitor): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      
      monitor.recordMetric(
        'memory_heap_used',
        memUsage.heapUsed,
        PerformanceUnit.BYTES,
        PerformanceCategory.RESOURCE_USAGE
      );

      monitor.recordMetric(
        'memory_heap_total',
        memUsage.heapTotal,
        PerformanceUnit.BYTES,
        PerformanceCategory.RESOURCE_USAGE
      );

      monitor.recordMetric(
        'memory_external',
        memUsage.external,
        PerformanceUnit.BYTES,
        PerformanceCategory.RESOURCE_USAGE
      );
    }
  }
}