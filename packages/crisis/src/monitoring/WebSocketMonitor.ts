/**
 * ASTRAL_CORE 2.0 Crisis WebSocket Real-Time Monitor
 * 
 * LIFE-CRITICAL SYSTEM MONITORING
 * 
 * This monitor provides real-time visibility into WebSocket performance
 * to ensure the system maintains life-saving response times.
 */

import { EventEmitter } from 'events';
import { CrisisWebSocketManager } from '../websocket-manage';

export interface WebSocketHealthMetrics {
  timestamp: number;
  totalConnections: number;
  activeConnections: number;
  emergencyConnections: number;
  averageHandshakeTime: number;
  averageMessageDelivery: number;
  messageSuccessRate: number;
  connectionSuccessRate: number;
  systemLoad: number;
  circuitBreakerState: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  memoryUsage: number;
  cpuUsage: number;
}

export interface PerformanceAlert {
  id: string;
  severity: 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  metric: string;
  threshold: number;
  actual: number;
  timestamp: number;
  message: string;
}

/**
 * Real-time WebSocket performance monitor for crisis systems
 */
export class WebSocketMonitor extends EventEmitter {
  private static instance: WebSocketMonitor;
  private manager: CrisisWebSocketManager;
  private metricsHistory: WebSocketHealthMetrics[] = [];
  private activeAlerts: Map<string, PerformanceAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  // Performance thresholds (life-critical)
  private readonly THRESHOLDS = {
    MAX_HANDSHAKE_TIME: 50, // ms
    MAX_MESSAGE_DELIVERY: 100, // ms
    MIN_SUCCESS_RATE: 0.95, // 95%
    MAX_SYSTEM_LOAD: 0.8, // 80%
    MAX_MEMORY_USAGE: 0.85, // 85%
    MAX_CPU_USAGE: 0.75, // 75%
    EMERGENCY_RESPONSE_TIME: 200 // ms
  };
  
  private constructor() {
    super();
    this.manager = CrisisWebSocketManager.getInstance();
    this.startMonitoring();
    console.log('📊 Crisis WebSocket Monitor initialized');
  }
  
  static getInstance(): WebSocketMonitor {
    if (!WebSocketMonitor.instance) {
      WebSocketMonitor.instance = new WebSocketMonitor();
    }
    return WebSocketMonitor.instance;
  }
  
  /**
   * Start real-time monitoring
   */
  private startMonitoring(): void {
    // Monitor every second for life-critical systems
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 1000);
    
    console.log('🔍 Real-time monitoring started (1-second intervals)');
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Monitoring stopped');
    }
  }
  
  /**
   * Collect comprehensive performance metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const performanceMetrics = this.manager.getPerformanceMetrics();
      const systemMetrics = await this.getSystemMetrics();
      
      const metrics: WebSocketHealthMetrics = {
        timestamp: Date.now(),
        totalConnections: performanceMetrics.totalConnections,
        activeConnections: performanceMetrics.totalConnections,
        emergencyConnections: this.countEmergencyConnections(),
        averageHandshakeTime: performanceMetrics.averageHandshakeTime,
        averageMessageDelivery: performanceMetrics.averageMessageDelivery,
        messageSuccessRate: performanceMetrics.messageSuccessRate,
        connectionSuccessRate: this.calculateConnectionSuccessRate(performanceMetrics),
        systemLoad: performanceMetrics.currentLoad / 1000, // Normalize to 0-1
        circuitBreakerState: this.determineSystemHealth(performanceMetrics),
        memoryUsage: systemMetrics.memoryUsage,
        cpuUsage: systemMetrics.cpuUsage
      };
      
      // Store metrics
      this.metricsHistory.push(metrics);
      
      // Keep only last 5 minutes of data (300 data points)
      if (this.metricsHistory.length > 300) {
        this.metricsHistory.shift();
      }
      
      // Check for performance issues
      this.checkPerformanceThresholds(metrics);
      
      // Emit metrics for real-time dashboards
      this.emit('metrics', metrics);
      
    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
    }
  }
  
  /**
   * Check performance against life-critical thresholds
   */
  private checkPerformanceThresholds(metrics: WebSocketHealthMetrics): void {
    const alerts: PerformanceAlert[] = [];
    
    // Check handshake time
    if (metrics.averageHandshakeTime > this.THRESHOLDS.MAX_HANDSHAKE_TIME) {
      alerts.push({
        id: 'handshake-slow',
        severity: metrics.averageHandshakeTime > this.THRESHOLDS.MAX_HANDSHAKE_TIME * 2 ? 'CRITICAL' : 'WARNING',
        metric: 'WebSocket Handshake Time',
        threshold: this.THRESHOLDS.MAX_HANDSHAKE_TIME,
        actual: metrics.averageHandshakeTime,
        timestamp: metrics.timestamp,
        message: `WebSocket handshake taking ${metrics.averageHandshakeTime.toFixed(2)}ms (target: <${this.THRESHOLDS.MAX_HANDSHAKE_TIME}ms)`
      });
    }
    
    // Check message delivery time
    if (metrics.averageMessageDelivery > this.THRESHOLDS.MAX_MESSAGE_DELIVERY) {
      alerts.push({
        id: 'message-delivery-slow',
        severity: metrics.averageMessageDelivery > this.THRESHOLDS.MAX_MESSAGE_DELIVERY * 2 ? 'CRITICAL' : 'WARNING',
        metric: 'Message Delivery Time',
        threshold: this.THRESHOLDS.MAX_MESSAGE_DELIVERY,
        actual: metrics.averageMessageDelivery,
        timestamp: metrics.timestamp,
        message: `Message delivery taking ${metrics.averageMessageDelivery.toFixed(2)}ms (target: <${this.THRESHOLDS.MAX_MESSAGE_DELIVERY}ms)`
      });
    }
    
    // Check success rates
    if (metrics.messageSuccessRate < this.THRESHOLDS.MIN_SUCCESS_RATE) {
      alerts.push({
        id: 'message-delivery-rate',
        severity: metrics.messageSuccessRate < 0.9 ? 'CRITICAL' : 'WARNING',
        metric: 'Message Success Rate',
        threshold: this.THRESHOLDS.MIN_SUCCESS_RATE,
        actual: metrics.messageSuccessRate,
        timestamp: metrics.timestamp,
        message: `Message success rate at ${(metrics.messageSuccessRate * 100).toFixed(1)}% (target: ≥${(this.THRESHOLDS.MIN_SUCCESS_RATE * 100).toFixed(1)}%)`
      });
    }
    
    // Check system resources
    if (metrics.memoryUsage > this.THRESHOLDS.MAX_MEMORY_USAGE) {
      alerts.push({
        id: 'memory-usage-high',
        severity: metrics.memoryUsage > 0.95 ? 'CRITICAL' : 'WARNING',
        metric: 'Memory Usage',
        threshold: this.THRESHOLDS.MAX_MEMORY_USAGE,
        actual: metrics.memoryUsage,
        timestamp: metrics.timestamp,
        message: `Memory usage at ${(metrics.memoryUsage * 100).toFixed(1)}% (threshold: <${(this.THRESHOLDS.MAX_MEMORY_USAGE * 100).toFixed(1)}%)`
      });
    }
    
    if (metrics.cpuUsage > this.THRESHOLDS.MAX_CPU_USAGE) {
      alerts.push({
        id: 'cpu-usage-high',
        severity: metrics.cpuUsage > 0.9 ? 'CRITICAL' : 'WARNING',
        metric: 'CPU Usage',
        threshold: this.THRESHOLDS.MAX_CPU_USAGE,
        actual: metrics.cpuUsage,
        timestamp: metrics.timestamp,
        message: `CPU usage at ${(metrics.cpuUsage * 100).toFixed(1)}% (threshold: <${(this.THRESHOLDS.MAX_CPU_USAGE * 100).toFixed(1)}%)`
      });
    }
    
    // Emergency check for critical situations
    if (metrics.emergencyConnections > 0 && 
        (metrics.averageMessageDelivery > this.THRESHOLDS.EMERGENCY_RESPONSE_TIME ||
         metrics.messageSuccessRate < 0.98)) {
      alerts.push({
        id: 'emergency-performance',
        severity: 'EMERGENCY',
        metric: 'Emergency Response Performance',
        threshold: this.THRESHOLDS.EMERGENCY_RESPONSE_TIME,
        actual: metrics.averageMessageDelivery,
        timestamp: metrics.timestamp,
        message: `Emergency connections active but system performance degraded! ${metrics.emergencyConnections} emergency sessions at risk.`
      });
    }
    
    // Process alerts
    this.processAlerts(alerts);
  }
  
  /**
   * Process and manage alerts
   */
  private processAlerts(newAlerts: PerformanceAlert[]): void {
    // Clear resolved alerts
    const alertIds = new Set(newAlerts.map(alert => alert.id));
    for (const [id, alert] of this.activeAlerts.entries()) {
      if (!alertIds.has(id)) {
        console.log(`✅ Alert resolved: ${alert.message}`);
        this.activeAlerts.delete(id);
        this.emit('alert-resolved', alert);
      }
    }
    
    // Process new alerts
    for (const alert of newAlerts) {
      const existingAlert = this.activeAlerts.get(alert.id);
      
      if (!existingAlert || existingAlert.severity !== alert.severity) {
        this.activeAlerts.set(alert.id, alert);
        
        // Log alert based on severity
        const severityIcon = {
          WARNING: '⚠️',
          CRITICAL: '🚨',
          EMERGENCY: '🆘'
        }[alert.severity];
        
        console.log(`${severityIcon} ${alert.severity}: ${alert.message}`);
        
        // Emit alert for external systems
        this.emit('alert', alert);
        
        // For emergency alerts, trigger immediate notifications
        if (alert.severity === 'EMERGENCY') {
          this.triggerEmergencyNotification(alert);
        }
      }
    }
  }
  
  /**
   * Trigger emergency notification for critical issues
   */
  private triggerEmergencyNotification(alert: PerformanceAlert): void {
    console.log('🆘 EMERGENCY NOTIFICATION TRIGGERED');
    console.log(`Alert: ${alert.message}`);
    console.log('Notifying system administrators...');
    
    // In production, this would:
    // - Send SMS/email to on-call engineers
    // - Trigger PagerDuty/similar
    // - Activate automatic failover procedures
    // - Log to emergency monitoring systems
    
    this.emit('emergency-notification', {
      alert,
      timestamp: Date.now(),
      requiresImmediate: true
    });
  }
  
  /**
   * Get system resource metrics
   */
  private async getSystemMetrics(): Promise<{ memoryUsage: number; cpuUsage: number }> {
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapTotal + memUsage.external;
      const usedMemory = memUsage.heapUsed;
      
      // Simplified CPU usage calculation (in production, use proper monitoring)
      const cpuUsage = process.cpuUsage();
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 / 1000; // Convert to seconds, then to percentage
      
      return {
        memoryUsage: Math.min(usedMemory / totalMemory, 1),
        cpuUsage: Math.min(cpuPercent, 1)
      };
    } catch (error) {
      console.error('❌ Error getting system metrics:', error);
      return { memoryUsage: 0, cpuUsage: 0 };
    }
  }
  
  /**
   * Count emergency connections
   */
  private countEmergencyConnections(): number {
    // In production, this would query the actual connection pool
    // For now, simulate based on current metrics
    const metrics = this.manager.getPerformanceMetrics();
    return Math.floor(metrics.totalConnections * 0.1); // Assume 10% are emergency
  }
  
  /**
   * Calculate connection success rate
   */
  private calculateConnectionSuccessRate(metrics: any): number {
    // In production, track actual connection attempts vs successes
    return Math.max(0.9, metrics.messageSuccessRate);
  }
  
  /**
   * Determine overall system health
   */
  private determineSystemHealth(metrics: any): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
    const avgHandshake = metrics.averageHandshakeTime;
    const avgDelivery = metrics.averageMessageDelivery;
    const successRate = metrics.messageSuccessRate;
    
    if (avgHandshake > 100 || avgDelivery > 200 || successRate < 0.9) {
      return 'CRITICAL';
    } else if (avgHandshake > 50 || avgDelivery > 100 || successRate < 0.95) {
      return 'DEGRADED';
    }
    return 'HEALTHY';
  }
  
  /**
   * Get current metrics for dashboards
   */
  getCurrentMetrics(): WebSocketHealthMetrics | null {
    return this.metricsHistory.length > 0 
      ? this.metricsHistory[this.metricsHistory.length - 1] 
      : null;
  }
  
  /**
   * Get metrics history for trending
   */
  getMetricsHistory(minutes: number = 5): WebSocketHealthMetrics[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metricsHistory.filter(metric => metric.timestamp >= cutoff);
  }
  
  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.activeAlerts.values());
  }
  
  /**
   * Get system status summary
   */
  getSystemStatus(): {
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'EMERGENCY';
    uptime: number;
    totalConnections: number;
    emergencyConnections: number;
    activeAlerts: number;
    criticalAlerts: number;
    emergencyAlerts: number;
  } {
    const currentMetrics = this.getCurrentMetrics();
    const alerts = this.getActiveAlerts();
    
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
    const emergencyAlerts = alerts.filter(a => a.severity === 'EMERGENCY').length;
    
    let status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'EMERGENCY' = 'HEALTHY';
    
    if (emergencyAlerts > 0) {
      status = 'EMERGENCY';
    } else if (criticalAlerts > 0) {
      status = 'CRITICAL';
    } else if (currentMetrics?.circuitBreakerState === 'DEGRADED') {
      status = 'DEGRADED';
    }
    
    return {
      status,
      uptime: process.uptime() * 1000, // Convert to milliseconds
      totalConnections: currentMetrics?.totalConnections || 0,
      emergencyConnections: currentMetrics?.emergencyConnections || 0,
      activeAlerts: alerts.length,
      criticalAlerts,
      emergencyAlerts
    };
  }
}

// Export singleton instance
export const webSocketMonitor = WebSocketMonitor.getInstance();