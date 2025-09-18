/**
 * Critical Performance Monitoring Service
 * 
 * This service monitors all critical metrics for the mental health crisis platform
 * to ensure zero downtime and optimal response times during emergencies.
 */

import { EventEmitter } from 'events';
import * as promClient from 'prom-client';
import { performance, PerformanceObserver } from 'perf_hooks';
import * as os from 'os';
import * as v8 from 'v8';
import logger from '../utils/logger';
import { AlertManager } from '../alerts/alert-manager';

export interface PerformanceMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  response: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  database: {
    queryTime: number;
    connectionPool: {
      active: number;
      idle: number;
      waiting: number;
    };
  };
  websocket: {
    connections: number;
    latency: number;
    messageRate: number;
  };
  crisis: {
    activeEmergencies: number;
    escalationTime: number;
    responseTime: number;
  };
}

export class PerformanceMonitor extends EventEmitter {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, any> = new Map();
  private register: promClient.Registry;
  private alertManager: AlertManager;
  private performanceObserver?: PerformanceObserver;
  
  // Critical metrics collectors
  private httpDuration!: promClient.Histogram;
  private dbQueryDuration!: promClient.Histogram;
  private wsLatency!: promClient.Histogram;
  private crisisResponseTime!: promClient.Histogram;
  private memoryUsage!: promClient.Gauge;
  private cpuUsage!: promClient.Gauge;
  private activeConnections!: promClient.Gauge;
  private errorRate!: promClient.Counter;
  
  // Performance thresholds for crisis platform
  private readonly THRESHOLDS = {
    CRISIS_API_RESPONSE: 200, // ms
    EMERGENCY_ESCALATION: 30000, // 30s
    WEBSOCKET_LATENCY: 100, // ms
    DATABASE_QUERY: 50, // ms
    PAGE_LOAD: 2000, // 2s
    MEMORY_USAGE: 0.85, // 85% threshold
    CPU_USAGE: 0.80, // 80% threshold
    ERROR_RATE: 0.01 // 1% error rate threshold
  };

  private constructor() {
    super();
    this.register = new promClient.Registry();
    this.alertManager = AlertManager.getInstance();
    this.initializeMetrics();
    this.startMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMetrics(): void {
    // HTTP request duration histogram
    this.httpDuration = new promClient.Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status_code', 'crisis_level'],
      buckets: [10, 25, 50, 100, 200, 500, 1000, 2000, 5000]
    });

    // Database query duration
    this.dbQueryDuration = new promClient.Histogram({
      name: 'db_query_duration_ms',
      help: 'Duration of database queries in ms',
      labelNames: ['operation', 'table', 'critical'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000]
    });

    // WebSocket latency
    this.wsLatency = new promClient.Histogram({
      name: 'websocket_latency_ms',
      help: 'WebSocket message latency in ms',
      labelNames: ['event_type', 'priority'],
      buckets: [10, 25, 50, 100, 250, 500, 1000]
    });

    // Crisis response time
    this.crisisResponseTime = new promClient.Histogram({
      name: 'crisis_response_time_ms',
      help: 'Time to respond to crisis events in ms',
      labelNames: ['severity', 'type', 'escalated'],
      buckets: [100, 500, 1000, 5000, 10000, 30000, 60000]
    });

    // Memory usage gauge
    this.memoryUsage = new promClient.Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type']
    });

    // CPU usage gauge
    this.cpuUsage = new promClient.Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      labelNames: ['core']
    });

    // Active connections gauge
    this.activeConnections = new promClient.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type']
    });

    // Error rate counter
    this.errorRate = new promClient.Counter({
      name: 'error_total',
      help: 'Total number of errors',
      labelNames: ['type', 'severity', 'component']
    });

    // Register all metrics
    this.register.registerMetric(this.httpDuration);
    this.register.registerMetric(this.dbQueryDuration);
    this.register.registerMetric(this.wsLatency);
    this.register.registerMetric(this.crisisResponseTime);
    this.register.registerMetric(this.memoryUsage);
    this.register.registerMetric(this.cpuUsage);
    this.register.registerMetric(this.activeConnections);
    this.register.registerMetric(this.errorRate);

    // Set up default metrics
    promClient.collectDefaultMetrics({ register: this.register });
  }

  private startMonitoring(): void {
    // Monitor system resources every second
    setInterval(() => this.collectSystemMetrics(), 1000);
    
    // Monitor heap statistics every 5 seconds
    setInterval(() => this.collectHeapStatistics(), 5000);
    
    // Check for memory leaks every minute
    setInterval(() => this.checkMemoryLeaks(), 60000);
    
    // Performance observer for async operations
    this.setupPerformanceObserver();
  }

  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Update memory metrics
    this.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);
    
    // Calculate CPU usage
    const cpuPercent = this.calculateCPUPercentage(cpuUsage);
    this.cpuUsage.set({ core: 'total' }, cpuPercent);
    
    // Check thresholds and alert if necessary
    this.checkThresholds({
      memory: memUsage.heapUsed / memUsage.heapTotal,
      cpu: cpuPercent
    });
  }

  private collectHeapStatistics(): void {
    const heapStats = v8.getHeapStatistics();
    const heapSpaceStats = v8.getHeapSpaceStatistics();
    
    // Store detailed heap information for leak detection
    this.metrics.set('heap_statistics', {
      timestamp: Date.now(),
      total_heap_size: heapStats.total_heap_size,
      used_heap_size: heapStats.used_heap_size,
      heap_size_limit: heapStats.heap_size_limit,
      malloced_memory: heapStats.malloced_memory,
      peak_malloced_memory: heapStats.peak_malloced_memory,
      spaces: heapSpaceStats
    });
  }

  private checkMemoryLeaks(): void {
    const history = this.getMetricHistory('heap_statistics', 10);
    if (history.length < 10) return;
    
    // Calculate memory growth rate
    const growthRate = this.calculateMemoryGrowthRate(history);
    
    if (growthRate > 0.05) { // 5% growth per minute
      this.alertManager.triggerAlert({
        severity: 'medium',
        type: 'memory_leak',
        message: `Potential memory leak detected. Growth rate: ${(growthRate * 100).toFixed(2)}%/min`,
        details: {
          current_heap: history[history.length - 1].used_heap_size,
          growth_rate: growthRate
        }
      });
    }
  }

  private setupPerformanceObserver(): void {
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          this.processMeasurement(entry);
        }
      }
    });
    
    this.performanceObserver.observe({ 
      entryTypes: ['measure', 'mark'] 
    });
  }

  private processMeasurement(entry: PerformanceEntry): void {
    const duration = entry.duration;
    const name = entry.name;
    
    // Process different types of measurements
    if (name.startsWith('crisis-')) {
      this.crisisResponseTime.observe(
        { 
          severity: this.extractLabel(name, 'severity'),
          type: this.extractLabel(name, 'type'),
          escalated: this.extractLabel(name, 'escalated')
        }, 
        duration
      );
      
      // Alert if crisis response exceeds threshold
      if (duration > this.THRESHOLDS.EMERGENCY_ESCALATION) {
        this.alertManager.triggerCriticalAlert({
          type: 'crisis_response_delay',
          duration,
          threshold: this.THRESHOLDS.EMERGENCY_ESCALATION,
          entry: name
        });
      }
    }
  }

  public recordHTTPRequest(params: {
    method: string;
    route: string;
    statusCode: number;
    duration: number;
    crisisLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  }): void {
    const { method, route, statusCode, duration, crisisLevel = 'none' } = params;
    
    this.httpDuration.observe(
      { 
        method, 
        route, 
        status_code: statusCode.toString(),
        crisis_level: crisisLevel
      }, 
      duration
    );
    
    // Alert for slow crisis API responses
    if (crisisLevel !== 'none' && duration > this.THRESHOLDS.CRISIS_API_RESPONSE) {
      this.alertManager.triggerAlert({
        severity: 'high',
        type: 'slow_crisis_api',
        message: `Crisis API response exceeded threshold: ${duration}ms`,
        details: { method, route, statusCode, duration, crisisLevel }
      });
    }
  }

  public recordDatabaseQuery(params: {
    operation: string;
    table: string;
    duration: number;
    critical: boolean;
  }): void {
    const { operation, table, duration, critical } = params;
    
    this.dbQueryDuration.observe(
      { operation, table, critical: critical.toString() },
      duration
    );
    
    // Alert for slow critical queries
    if (critical && duration > this.THRESHOLDS.DATABASE_QUERY) {
      this.alertManager.triggerAlert({
        severity: 'high',
        type: 'slow_db_query',
        message: `Critical database query exceeded threshold: ${duration}ms`,
        details: { operation, table, duration }
      });
    }
  }

  public recordWebSocketLatency(params: {
    eventType: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    latency: number;
  }): void {
    const { eventType, priority, latency } = params;
    
    this.wsLatency.observe(
      { event_type: eventType, priority },
      latency
    );
    
    // Alert for high latency on critical messages
    if (priority === 'critical' && latency > this.THRESHOLDS.WEBSOCKET_LATENCY) {
      this.alertManager.triggerAlert({
        severity: 'critical',
        type: 'websocket_latency',
        message: `Critical WebSocket message latency exceeded: ${latency}ms`,
        details: { eventType, priority, latency }
      });
    }
  }

  public recordError(params: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    component: string;
    error?: Error;
  }): void {
    const { type, severity, component, error } = params;
    
    this.errorRate.inc({ type, severity, component });
    
    // Log error details
    logger.error('Performance error recorded', {
      type,
      severity,
      component,
      error: error?.message,
      stack: error?.stack
    });
    
    // Trigger alert for critical errors
    if (severity === 'critical') {
      this.alertManager.triggerCriticalAlert({
        type: 'critical_error',
        component,
        error: error?.message
      });
    }
  }

  public getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  public getCurrentMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    const loadAvg = os.loadavg();
    
    return {
      timestamp: Date.now(),
      cpu: {
        usage: this.metrics.get('cpu_usage') || 0,
        loadAverage: loadAvg
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      response: this.getResponseMetrics(),
      database: this.getDatabaseMetrics(),
      websocket: this.getWebSocketMetrics(),
      crisis: this.getCrisisMetrics()
    };
  }

  private getResponseMetrics(): any {
    // Calculate response time percentiles from histogram
    return {
      p50: this.metrics.get('response_p50') || 0,
      p95: this.metrics.get('response_p95') || 0,
      p99: this.metrics.get('response_p99') || 0,
      average: this.metrics.get('response_avg') || 0
    };
  }

  private getDatabaseMetrics(): any {
    return {
      queryTime: this.metrics.get('db_query_avg') || 0,
      connectionPool: {
        active: this.metrics.get('db_connections_active') || 0,
        idle: this.metrics.get('db_connections_idle') || 0,
        waiting: this.metrics.get('db_connections_waiting') || 0
      }
    };
  }

  private getWebSocketMetrics(): any {
    return {
      connections: this.metrics.get('ws_connections') || 0,
      latency: this.metrics.get('ws_latency_avg') || 0,
      messageRate: this.metrics.get('ws_message_rate') || 0
    };
  }

  private getCrisisMetrics(): any {
    return {
      activeEmergencies: this.metrics.get('crisis_active') || 0,
      escalationTime: this.metrics.get('crisis_escalation_avg') || 0,
      responseTime: this.metrics.get('crisis_response_avg') || 0
    };
  }

  private calculateCPUPercentage(cpuUsage: NodeJS.CpuUsage): number {
    const previousCPU = this.metrics.get('previous_cpu') || cpuUsage;
    const previousTime = this.metrics.get('previous_time') || Date.now();
    
    const currentTime = Date.now();
    const timeDiff = currentTime - previousTime;
    const userDiff = cpuUsage.user - previousCPU.user;
    const systemDiff = cpuUsage.system - previousCPU.system;
    
    this.metrics.set('previous_cpu', cpuUsage);
    this.metrics.set('previous_time', currentTime);
    
    if (timeDiff === 0) return 0;
    
    const totalCPU = (userDiff + systemDiff) / 1000; // Convert to ms
    return (totalCPU / timeDiff) * 100;
  }

  private calculateMemoryGrowthRate(history: any[]): number {
    if (history.length < 2) return 0;
    
    const first = history[0];
    const last = history[history.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 60000; // Convert to minutes
    
    if (timeDiff === 0) return 0;
    
    const memoryGrowth = (last.used_heap_size - first.used_heap_size) / first.used_heap_size;
    return memoryGrowth / timeDiff;
  }

  private checkThresholds(details: { memory: number; cpu: number }): void {
    if (details.memory > this.THRESHOLDS.MEMORY_USAGE) {
      this.alertManager.triggerAlert({
        severity: 'high',
        type: 'high_memory_usage',
        message: `Memory usage exceeded threshold: ${(details.memory * 100).toFixed(2)}%`,
        threshold: this.THRESHOLDS.MEMORY_USAGE
      });
    }
    
    if (details.cpu > this.THRESHOLDS.CPU_USAGE * 100) {
      this.alertManager.triggerAlert({
        severity: 'high',
        type: 'high_cpu_usage',
        message: `CPU usage exceeded threshold: ${details.cpu.toFixed(2)}%`,
        threshold: this.THRESHOLDS.CPU_USAGE * 100
      });
    }
  }

  private getMetricHistory(key: string, count: number): any[] {
    const history = this.metrics.get(`${key}_history`) || [];
    return history.slice(-count);
  }

  private extractLabel(name: string, label: string): string {
    const regex = new RegExp(`${label}:([^-]+)`);
    const match = name.match(regex);
    return match ? match[1] : 'unknown';
  }

  public startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  public endMeasure(name: string): void {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  public destroy(): void {
    this.performanceObserver?.disconnect();
    this.removeAllListeners();
  }
}
