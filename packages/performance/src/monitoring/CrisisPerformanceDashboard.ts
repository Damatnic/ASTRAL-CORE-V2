/**
 * ASTRAL_CORE 2.0 CRISIS PERFORMANCE DASHBOARD
 * 
 * REAL-TIME MONITORING FOR LIFE-CRITICAL SYSTEMS
 * 
 * CRITICAL TARGETS MONITORED:
 * - Crisis response time: <200ms
 * - WebSocket connection: <100ms  
 * - Volunteer matching: <5 seconds
 * - Database queries: <50ms
 * - Emergency escalation: <30 seconds
 * 
 * FEATURES:
 * - Real-time metrics collection and visualization
 * - Automated alerting for _performance degradation
 * - Crisis severity-based monitoring
 * - Load balancing metrics
 * - System health scoring
 * - Emergency override capabilities
 */

import { EventEmitter } from 'events';
// import { performance } from "perf_hooks";
import { WebSocket, WebSocketServer } from 'ws';

interface CrisisMetrics {
  timestamp: number;
  responseTime: {
    crisis: number; // ms
    websocket: number; // ms
    volunteer: number; // ms
    database: number; // ms
    escalation: number; // ms
  };
  throughput: {
    connectionsPerSecond: number;
    messagesPerSecond: number;
    matchesPerSecond: number;
    queriesPerSecond: number;
  };
  system: {
    cpuUsage: number; // %
    memoryUsage: number; // MB
    activeConnections: number;
    queuedRequests: number;
  };
  crisis: {
    activeSessions: number;
    criticalSessions: number;
    volunteerUtilization: number; // %
    averageSeverity: number;
    escalationRate: number; // %
  };
  targets: {
    crisisResponseMet: boolean;
    websocketLatencyMet: boolean;
    volunteerMatchingMet: boolean;
    databaseQueryMet: boolean;
    escalationTimeMet: boolean;
  };
  health: {
    overall: 'OPTIMAL' | 'GOOD' | 'DEGRADED' | 'CRITICAL';
    score: number; // 0-100
    bottlenecks: string[];
  };
}

interface Alert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
  escalated: boolean;
}

interface PerformanceThresholds {
  crisis: {
    responseTimeMs: number;
    critical: number;
  };
  websocket: {
    latencyMs: number;
    critical: number;
  };
  volunteer: {
    matchingMs: number;
    critical: number;
  };
  database: {
    queryMs: number;
    critical: number;
  };
  system: {
    cpuPercent: number;
    memoryMB: number;
    connectionLimit: number;
  };
}

export class CrisisPerformanceDashboard extends EventEmitter {
  private static instance: CrisisPerformanceDashboard;
  
  // Real-time metrics storage
  private currentMetrics: CrisisMetrics;
  private metricsHistory: CrisisMetrics[] = [];
  private alerts: Map<string, Alert> = new Map();
  private activeAlerts: Set<string> = new Set();
  
  // WebSocket server for real-time dashboard updates
  private wsServer?: WebSocketServer;
  private connectedClients: Set<WebSocket> = new Set();
  
  // Performance thresholds for crisis platform
  private readonly thresholds: PerformanceThresholds = {
    crisis: {
      responseTimeMs: 200,
      critical: 500
    },
    websocket: {
      latencyMs: 100,
      critical: 250
    },
    volunteer: {
      matchingMs: 5000,
      critical: 15000
    },
    database: {
      queryMs: 50,
      critical: 200
    },
    system: {
      cpuPercent: 80,
      memoryMB: 1024,
      connectionLimit: 10000
    }
  };
  
  // Timers for data collection
  private metricsTimer?: NodeJS.Timeout;
  private alertTimer?: NodeJS.Timeout;
  private historyTimer?: NodeJS.Timeout;
  
  // Performance data buffers for efficient calculation
  private responseTimeBuffer = new Float32Array(100);
  private throughputBuffer = new Uint32Array(60);
  private bufferIndex = 0;
  
  private constructor() {
    super();
    this.initializeDashboard();
    this.currentMetrics = this.createEmptyMetrics();
  }

  public static getInstance(): CrisisPerformanceDashboard {
    if (!CrisisPerformanceDashboard.instance) {
      CrisisPerformanceDashboard.instance = new CrisisPerformanceDashboard();
    }
    return CrisisPerformanceDashboard.instance;
  }

  private initializeDashboard(): void {
    console.log('📊 CRISIS Performance Dashboard initializing...');
    
    this.startMetricsCollection();
    this.startAlertMonitoring();
    this.startHistoryManagement();
    
    console.log('✅ CRISIS Performance Dashboard ready for real-time monitoring');
  }

  /**
   * Start WebSocket server for real-time dashboard
   */
  async startRealtimeServer(port: number = 8081): Promise<void> {
    this.wsServer = new WebSocketServer({ 
      port,
      perMessageDeflate: false // Disable compression for lower latency
    });
    
    this.wsServer.on('connection', (ws: WebSocket) => {
      this.connectedClients.add(ws);
      console.log(`📱 Dashboard client connected (${this.connectedClients.size} total)`);
      
      // Send initial metrics
      this.sendMetricsToClient(ws, this.currentMetrics);
      
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error: unknown) {
          console.error('❌ Invalid client message:', error);
        }
      });
      
      ws.on('close', () => {
        this.connectedClients.delete(ws);
        console.log(`📱 Dashboard client disconnected (${this.connectedClients.size} total)`);
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket client error:', error);
        this.connectedClients.delete(ws);
      });
    });
    
    console.log(`🌐 Real-time dashboard server started on port ${port}`);
  }

  /**
   * Record crisis response _performance
   */
  recordCrisisResponse(responseTimeMs: number, severity: number, wasEscalated: boolean = false): void {
    this.currentMetrics.responseTime.crisis = responseTimeMs;
    this.updateResponseTimeBuffer(responseTimeMs);
    
    // Check thresholds and create alerts
    if (responseTimeMs > this.thresholds.crisis.critical) {
      this.createAlert({
        severity: 'CRITICAL',
        type: 'CRISIS_RESPONSE_SLOW',
        message: `Crisis response time ${responseTimeMs}ms exceeds critical threshold`,
        metric: 'crisis.responseTime',
        value: responseTimeMs,
        threshold: this.thresholds.crisis.critical
      });
    } else if (responseTimeMs > this.thresholds.crisis.responseTimeMs) {
      this.createAlert({
        severity: 'HIGH',
        type: 'CRISIS_RESPONSE_DEGRADED',
        message: `Crisis response time ${responseTimeMs}ms exceeds target`,
        metric: 'crisis.responseTime',
        value: responseTimeMs,
        threshold: this.thresholds.crisis.responseTimeMs
      });
    }
    
    // Update targets
    this.currentMetrics.targets.crisisResponseMet = responseTimeMs <= this.thresholds.crisis.responseTimeMs;
    
    this.emit('crisis-response-recorded', { responseTimeMs, severity, wasEscalated });
  }

  /**
   * Record WebSocket _performance
   */
  recordWebSocketLatency(latencyMs: number, messageType: string = 'general'): void {
    this.currentMetrics.responseTime.websocket = latencyMs;
    
    if (latencyMs > this.thresholds.websocket.critical) {
      this.createAlert({
        severity: 'CRITICAL',
        type: 'WEBSOCKET_LATENCY_CRITICAL',
        message: `WebSocket latency ${latencyMs}ms is critically high`,
        metric: 'websocket.latency',
        value: latencyMs,
        threshold: this.thresholds.websocket.critical
      });
    }
    
    this.currentMetrics.targets.websocketLatencyMet = latencyMs <= this.thresholds.websocket.latencyMs;
    
    this.emit('websocket-latency-recorded', { latencyMs, messageType });
  }

  /**
   * Record volunteer matching _performance
   */
  recordVolunteerMatching(matchingTimeMs: number, success: boolean, queueSize: number): void {
    this.currentMetrics.responseTime.volunteer = matchingTimeMs;
    
    if (!success || matchingTimeMs > this.thresholds.volunteer.critical) {
      this.createAlert({
        severity: success ? 'HIGH' : 'CRITICAL',
        type: 'VOLUNTEER_MATCHING_SLOW',
        message: `Volunteer matching took ${matchingTimeMs}ms ${success ? '' : '(FAILED)'}`,
        metric: 'volunteer.matching',
        value: matchingTimeMs,
        threshold: this.thresholds.volunteer.matchingMs
      });
    }
    
    this.currentMetrics.targets.volunteerMatchingMet = matchingTimeMs <= this.thresholds.volunteer.matchingMs;
    
    this.emit('volunteer-matching-recorded', { matchingTimeMs, success, queueSize });
  }

  /**
   * Record database query _performance
   */
  recordDatabaseQuery(queryTimeMs: number, queryType: string, isCritical: boolean = false): void {
    this.currentMetrics.responseTime.database = queryTimeMs;
    
    const threshold = isCritical ? this.thresholds.database.queryMs : this.thresholds.database.queryMs * 2;
    
    if (queryTimeMs > threshold) {
      this.createAlert({
        severity: isCritical ? 'HIGH' : 'MEDIUM',
        type: 'DATABASE_QUERY_SLOW',
        message: `${queryType} query took ${queryTimeMs}ms (critical: ${isCritical})`,
        metric: 'database.query',
        value: queryTimeMs,
        threshold
      });
    }
    
    this.currentMetrics.targets.databaseQueryMet = queryTimeMs <= this.thresholds.database.queryMs;
    this.currentMetrics.throughput.queriesPerSecond++;
    
    this.emit('database-query-recorded', { queryTimeMs, queryType, isCritical });
  }

  /**
   * Record emergency escalation
   */
  recordEmergencyEscalation(escalationTimeMs: number, reason: string): void {
    this.currentMetrics.responseTime.escalation = escalationTimeMs;
    
    if (escalationTimeMs > 30000) { // 30 seconds
      this.createAlert({
        severity: 'CRITICAL',
        type: 'ESCALATION_SLOW',
        message: `Emergency escalation took ${escalationTimeMs}ms (reason: ${reason})`,
        metric: 'emergency.escalation',
        value: escalationTimeMs,
        threshold: 30000
      });
    }
    
    this.currentMetrics.targets.escalationTimeMet = escalationTimeMs <= 30000;
    this.currentMetrics.crisis.escalationRate = 
      (this.currentMetrics.crisis.escalationRate * 0.95) + 0.05; // Increase escalation rate
    
    this.emit('escalation-recorded', { escalationTimeMs, reason });
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics(metrics: {
    cpuUsage: number;
    memoryUsageMB: number;
    activeConnections: number;
    queuedRequests: number;
  }): void {
    Object.assign(this.currentMetrics.system, {
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsageMB,
      activeConnections: metrics.activeConnections,
      queuedRequests: metrics.queuedRequests
    });
    
    // Check system thresholds
    if (metrics.cpuUsage > this.thresholds.system.cpuPercent) {
      this.createAlert({
        severity: 'HIGH',
        type: 'HIGH_CPU_USAGE',
        message: `CPU usage ${metrics.cpuUsage}% exceeds threshold`,
        metric: 'system.cpu',
        value: metrics.cpuUsage,
        threshold: this.thresholds.system.cpuPercent
      });
    }
    
    if (metrics.memoryUsageMB > this.thresholds.system.memoryMB) {
      this.createAlert({
        severity: 'HIGH',
        type: 'HIGH_MEMORY_USAGE',
        message: `Memory usage ${metrics.memoryUsageMB}MB exceeds threshold`,
        metric: 'system.memory',
        value: metrics.memoryUsageMB,
        threshold: this.thresholds.system.memoryMB
      });
    }
    
    this.emit('system-metrics-updated', metrics);
  }

  /**
   * Update crisis-specific metrics
   */
  updateCrisisMetrics(metrics: {
    activeSessions: number;
    criticalSessions: number;
    volunteerUtilization: number;
    averageSeverity: number;
  }): void {
    Object.assign(this.currentMetrics.crisis, metrics);
    
    // Alert on high critical session count
    if (metrics.criticalSessions > 10) {
      this.createAlert({
        severity: 'CRITICAL',
        type: 'HIGH_CRITICAL_SESSIONS',
        message: `${metrics.criticalSessions} critical crisis sessions active`,
        metric: 'crisis.critical',
        value: metrics.criticalSessions,
        threshold: 10
      });
    }
    
    // Alert on low volunteer utilization during high demand
    if (metrics.activeSessions > 20 && metrics.volunteerUtilization < 0.3) {
      this.createAlert({
        severity: 'HIGH',
        type: 'LOW_VOLUNTEER_UTILIZATION',
        message: `Low volunteer utilization (${(metrics.volunteerUtilization * 100).toFixed(1)}%) during high demand`,
        metric: 'crisis.utilization',
        value: metrics.volunteerUtilization,
        threshold: 0.3
      });
    }
    
    this.emit('crisis-metrics-updated', metrics);
  }

  /**
   * Get current real-time metrics
   */
  getCurrentMetrics(): CrisisMetrics {
    // Update health score
    this.currentMetrics.health = this.calculateHealthScore();
    this.currentMetrics.timestamp = Date.now();
    
    return { ...this.currentMetrics };
  }

  /**
   * Get historical metrics for trends
   */
  getHistoricalMetrics(timeRangeMs: number = 3600000): CrisisMetrics[] {
    const cutoffTime = Date.now() - timeRangeMs;
    return this.metricsHistory.filter(m => m.timestamp >= cutoffTime);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => this.activeAlerts.has(alert.id))
      .sort((a, b) => {
        // Sort by severity, then by timestamp
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const aSeverity = severityOrder[a.severity];
        const bSeverity = severityOrder[b.severity];
        
        if (aSeverity !== bSeverity) {
          return aSeverity - bSeverity;
        }
        
        return b.timestamp - a.timestamp; // Newest first
      });
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    this.activeAlerts.delete(alertId);
    
    console.log(`✅ Alert ${alertId} acknowledged by ${acknowledgedBy}`);
    
    this.emit('alert-acknowledged', { alertId, acknowledgedBy });
    this.broadcastToClients('alert-acknowledged', { alertId, acknowledgedBy });
    
    return true;
  }

  /**
   * Force emergency override (bypass normal thresholds)
   */
  triggerEmergencyOverride(reason: string, triggeredBy: string): void {
    console.log(`🚨 EMERGENCY OVERRIDE TRIGGERED: ${reason} (by: ${triggeredBy})`);
    
    const alert: Alert = {
      id: `emergency-${Date.now()}`,
      severity: 'CRITICAL',
      type: 'EMERGENCY_OVERRIDE',
      message: `Emergency override activated: ${reason}`,
      metric: 'system.override',
      value: 1,
      threshold: 0,
      timestamp: Date.now(),
      acknowledged: false,
      escalated: true
    };
    
    this.alerts.set(alert.id, alert);
    this.activeAlerts.add(alert.id);
    
    this.emit('emergency-override', { reason, triggeredBy, alertId: alert.id });
    this.broadcastToClients('emergency-override', alert);
  }

  // PRIVATE METHODS

  private createEmptyMetrics(): CrisisMetrics {
    return {
      timestamp: Date.now(),
      responseTime: {
        crisis: 0,
        websocket: 0,
        volunteer: 0,
        database: 0,
        escalation: 0
      },
      throughput: {
        connectionsPerSecond: 0,
        messagesPerSecond: 0,
        matchesPerSecond: 0,
        queriesPerSecond: 0
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        activeConnections: 0,
        queuedRequests: 0
      },
      crisis: {
        activeSessions: 0,
        criticalSessions: 0,
        volunteerUtilization: 0,
        averageSeverity: 5,
        escalationRate: 0
      },
      targets: {
        crisisResponseMet: true,
        websocketLatencyMet: true,
        volunteerMatchingMet: true,
        databaseQueryMet: true,
        escalationTimeMet: true
      },
      health: {
        overall: 'OPTIMAL',
        score: 100,
        bottlenecks: []
      }
    };
  }

  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      this.collectSystemMetrics();
      this.broadcastCurrentMetrics();
    }, 1000); // Update every second
  }

  private startAlertMonitoring(): void {
    this.alertTimer = setInterval(() => {
      this.processAlerts();
    }, 5000); // Check every 5 seconds
  }

  private startHistoryManagement(): void {
    this.historyTimer = setInterval(() => {
      this.saveMetricsToHistory();
      this.cleanupOldHistory();
    }, 10000); // Save every 10 seconds
  }

  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Update system metrics
    this.updateSystemMetrics({
      cpuUsage: this.calculateCPUPercentage(cpuUsage),
      memoryUsageMB: memUsage.heapUsed / 1024 / 1024,
      activeConnections: this.connectedClients.size,
      queuedRequests: 0 // This would come from queue manager
    });
  }

  private calculateCPUPercentage(cpuUsage: NodeJS.CpuUsage): number {
    // This is a simplified calculation
    // In production, you'd track previous measurements for accurate percentage
    return ((cpuUsage.user + cpuUsage.system) / 1000000) % 100;
  }

  private updateResponseTimeBuffer(responseTime: number): void {
    this.responseTimeBuffer[this.bufferIndex] = responseTime;
    this.bufferIndex = (this.bufferIndex + 1) % this.responseTimeBuffer.length;
  }

  private calculateHealthScore(): CrisisMetrics['health'] {
    let score = 100;
    const bottlenecks: string[] = [];
    
    // Check each _performance target
    if (!this.currentMetrics.targets.crisisResponseMet) {
      score -= 25;
      bottlenecks.push('Crisis Response Time');
    }
    
    if (!this.currentMetrics.targets.websocketLatencyMet) {
      score -= 20;
      bottlenecks.push('WebSocket Latency');
    }
    
    if (!this.currentMetrics.targets.volunteerMatchingMet) {
      score -= 20;
      bottlenecks.push('Volunteer Matching');
    }
    
    if (!this.currentMetrics.targets.databaseQueryMet) {
      score -= 15;
      bottlenecks.push('Database Performance');
    }
    
    if (!this.currentMetrics.targets.escalationTimeMet) {
      score -= 10;
      bottlenecks.push('Emergency Escalation');
    }
    
    // System resource penalties
    if (this.currentMetrics.system.cpuUsage > this.thresholds.system.cpuPercent) {
      score -= 10;
      bottlenecks.push('High CPU Usage');
    }
    
    if (this.currentMetrics.system.memoryUsage > this.thresholds.system.memoryMB) {
      score -= 10;
      bottlenecks.push('High Memory Usage');
    }
    
    // Determine overall health
    let overall: 'OPTIMAL' | 'GOOD' | 'DEGRADED' | 'CRITICAL';
    if (score >= 90) overall = 'OPTIMAL';
    else if (score >= 70) overall = 'GOOD';
    else if (score >= 50) overall = 'DEGRADED';
    else overall = 'CRITICAL';
    
    return {
      overall,
      score: Math.max(0, score),
      bottlenecks
    };
  }

  private createAlert(alertData: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: string;
    message: string;
    metric: string;
    value: number;
    threshold: number;
  }): void {
    const alert: Alert = {
      id: `${alertData.type}-${Date.now()}`,
      ...alertData,
      timestamp: Date.now(),
      acknowledged: false,
      escalated: false
    };
    
    // Check if similar alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      a => a.type === alert.type && this.activeAlerts.has(a.id) && !a.acknowledged
    );
    
    if (existingAlert) {
      // Update existing alert
      existingAlert.value = alert.value;
      existingAlert.timestamp = alert.timestamp;
      return;
    }
    
    this.alerts.set(alert.id, alert);
    this.activeAlerts.add(alert.id);
    
    console.log(`🚨 ALERT [${alert.severity}]: ${alert.message}`);
    
    this.emit('alert-created', alert);
    this.broadcastToClients('alert-created', alert);
  }

  private processAlerts(): void {
    const now = Date.now();
    
    for (const alertId of this.activeAlerts) {
      const alert = this.alerts.get(alertId);
      if (!alert) continue;
      
      // Auto-escalate critical alerts after 1 minute
      if (alert.severity === 'CRITICAL' && !alert.escalated && 
          (now - alert.timestamp) > 60000) {
        alert.escalated = true;
        console.log(`🚨 ESCALATED: Alert ${alert.id} escalated to emergency contacts`);
        
        this.emit('alert-escalated', alert);
        this.broadcastToClients('alert-escalated', alert);
      }
      
      // Auto-resolve alerts after 5 minutes if acknowledged
      if (alert.acknowledged && (now - alert.timestamp) > 300000) {
        this.activeAlerts.delete(alertId);
        console.log(`✅ RESOLVED: Alert ${alert.id} auto-resolved`);
        
        this.emit('alert-resolved', { alertId });
        this.broadcastToClients('alert-resolved', { alertId });
      }
    }
  }

  private saveMetricsToHistory(): void {
    const currentSnapshot = this.getCurrentMetrics();
    this.metricsHistory.push(currentSnapshot);
  }

  private cleanupOldHistory(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // Keep 24 hours
    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp >= cutoffTime);
  }

  private broadcastCurrentMetrics(): void {
    const metrics = this.getCurrentMetrics();
    this.broadcastToClients('metrics-update', metrics);
  }

  private broadcastToClients(event: string, data: any): void {
    const message = JSON.stringify({ event, data, timestamp: Date.now() });
    
    this.connectedClients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN = 1
        try {
          client.send(message);
        } catch (error: unknown) {
          console.error('❌ Failed to send to client:', error);
          this.connectedClients.delete(client);
        }
      }
    });
  }

  private sendMetricsToClient(client: WebSocket, metrics: CrisisMetrics): void {
    const message = JSON.stringify({
      event: 'initial-metrics',
      data: metrics,
      timestamp: Date.now()
    });
    
    try {
      client.send(message);
    } catch (error: unknown) {
      console.error('❌ Failed to send initial metrics:', error);
    }
  }

  private handleClientMessage(client: WebSocket, data: any): void {
    switch (data.action) {
      case 'acknowledge-alert':
        if (data.alertId && data.user) {
          this.acknowledgeAlert(data.alertId, data.user);
        }
        break;
        
      case 'emergency-override':
        if (data.reason && data.user) {
          this.triggerEmergencyOverride(data.reason, data.user);
        }
        break;
        
      case 'get-historical':
        const timeRange = data.timeRange || 3600000;
        const historical = this.getHistoricalMetrics(timeRange);
        client.send(JSON.stringify({
          event: 'historical-data',
          data: historical,
          timestamp: Date.now()
        }));
        break;
        
      default:
        console.warn('❓ Unknown client action:', data.action);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Crisis Performance Dashboard...');
    
    // Clear timers
    if (this.metricsTimer) clearInterval(this.metricsTimer);
    if (this.alertTimer) clearInterval(this.alertTimer);
    if (this.historyTimer) clearInterval(this.historyTimer);
    
    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }
    
    // Report final status
    console.log('📊 Final Dashboard Status:');
    console.log(`   Active Alerts: ${this.activeAlerts.size}`);
    console.log(`   Connected Clients: ${this.connectedClients.size}`);
    console.log(`   Health Score: ${this.currentMetrics.health.score}`);
    
    this.removeAllListeners();
    
    console.log('✅ Crisis Performance Dashboard shutdown complete');
  }
}

export type { CrisisMetrics, Alert, PerformanceThresholds };