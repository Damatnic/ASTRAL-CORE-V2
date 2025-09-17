/**
 * ASTRAL_CORE 2.0 Tether Heartbeat Monitor
 * Monitors tether connection health and detects disconnections
 */

export interface HeartbeatStatus {
  tetherId: string;
  isActive: boolean;
  lastHeartbeat: Date;
  missedBeats: number;
  averageLatency: number;
  connectionQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
  nextExpectedBeat: Date;
}

export interface ConnectionHealth {
  tetherId: string;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNSTABLE' | 'DISCONNECTED';
  metrics: {
    uptime: number; // percentage
    averageLatency: number; // milliseconds
    packetLoss: number; // percentage
    jitter: number; // milliseconds
  };
  issues: string[];
  recommendations: string[];
}

export class TetherHeartbeatMonitor {
  private monitoredTethers: Map<string, HeartbeatStatus> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private latencyHistory: Map<string, number[]> = new Map();
  private connectionMetrics: Map<string, ConnectionHealth> = new Map();

  /**
   * Start monitoring a tether connection
   */
  async startMonitoring(tetherId: string, intervalSeconds: number = 30): Promise<void> {
    try {
      // Initialize heartbeat status
      const status: HeartbeatStatus = {
        tetherId,
        isActive: true,
        lastHeartbeat: new Date(),
        missedBeats: 0,
        averageLatency: 0,
        connectionQuality: 'EXCELLENT',
        nextExpectedBeat: new Date(Date.now() + intervalSeconds * 1000)
      };

      this.monitoredTethers.set(tetherId, status);
      this.latencyHistory.set(tetherId, []);

      // Start heartbeat interval
      const interval = setInterval(async () => {
        await this.checkHeartbeat(tetherId);
      }, intervalSeconds * 1000);

      this.heartbeatIntervals.set(tetherId, interval);

      console.log(`💓 Started heartbeat monitoring for tether: ${tetherId} (${intervalSeconds}s interval)`);
    } catch (error) {
      console.error('❌ Failed to start heartbeat monitoring:', error);
    }
  }

  /**
   * Stop monitoring a tether connection
   */
  stopMonitoring(tetherId: string): void {
    const interval = this.heartbeatIntervals.get(tetherId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(tetherId);
    }

    this.monitoredTethers.delete(tetherId);
    this.latencyHistory.delete(tetherId);
    this.connectionMetrics.delete(tetherId);

    console.log(`💔 Stopped heartbeat monitoring for tether: ${tetherId}`);
  }

  /**
   * Record heartbeat response
   */
  recordHeartbeat(tetherId: string, latency: number): void {
    const status = this.monitoredTethers.get(tetherId);
    if (!status) return;

    const now = new Date();
    status.lastHeartbeat = now;
    status.missedBeats = 0; // Reset missed beats counter
    status.nextExpectedBeat = new Date(now.getTime() + 30000); // Next expected in 30s

    // Update latency history
    const history = this.latencyHistory.get(tetherId) || [];
    history.push(latency);
    
    // Keep only last 50 measurements
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.latencyHistory.set(tetherId, history);

    // Calculate average latency
    status.averageLatency = history.reduce((sum, lat) => sum + lat, 0) / history.length;

    // Update connection quality
    status.connectionQuality = this.calculateConnectionQuality(status.averageLatency, status.missedBeats);

    this.monitoredTethers.set(tetherId, status);

    // Update connection health metrics
    this.updateConnectionHealth(tetherId);
  }

  /**
   * Check for missed heartbeats
   */
  private async checkHeartbeat(tetherId: string): Promise<void> {
    const status = this.monitoredTethers.get(tetherId);
    if (!status) return;

    const now = Date.now();
    const timeSinceLastBeat = now - status.lastHeartbeat.getTime();
    const expectedInterval = 30000; // 30 seconds

    if (timeSinceLastBeat > expectedInterval * 1.5) { // 50% tolerance
      status.missedBeats++;
      status.connectionQuality = this.calculateConnectionQuality(status.averageLatency, status.missedBeats);
      
      this.monitoredTethers.set(tetherId, status);

      console.warn(`⚠️ Missed heartbeat for tether ${tetherId} (${status.missedBeats} missed)`);

      // Trigger alerts for excessive missed beats
      if (status.missedBeats >= 3) {
        await this.handleConnectionIssue(tetherId, 'EXCESSIVE_MISSED_BEATS');
      }
    }
  }

  /**
   * Calculate connection quality based on latency and missed beats
   */
  private calculateConnectionQuality(
    averageLatency: number, 
    missedBeats: number
  ): 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL' {
    if (missedBeats >= 5) return 'CRITICAL';
    if (missedBeats >= 3 || averageLatency > 2000) return 'POOR';
    if (missedBeats >= 1 || averageLatency > 1000) return 'GOOD';
    return 'EXCELLENT';
  }

  /**
   * Handle connection issues
   */
  private async handleConnectionIssue(tetherId: string, issueType: string): Promise<void> {
    console.error(`🔴 Connection issue detected for tether ${tetherId}: ${issueType}`);

    // In a real implementation, this would:
    // 1. Attempt reconnection
    // 2. Notify users of connection issues
    // 3. Switch to backup communication methods
    // 4. Log issue for analysis

    const status = this.monitoredTethers.get(tetherId);
    if (status && status.missedBeats >= 5) {
      console.error(`🔴 CRITICAL: Tether ${tetherId} may be disconnected`);
      // Could trigger emergency protocols here
    }
  }

  /**
   * Update connection health metrics
   */
  private updateConnectionHealth(tetherId: string): void {
    const status = this.monitoredTethers.get(tetherId);
    const history = this.latencyHistory.get(tetherId) || [];
    
    if (!status || history.length === 0) return;

    // Calculate uptime (percentage of successful heartbeats)
    const totalExpectedBeats = Math.floor((Date.now() - status.lastHeartbeat.getTime()) / 30000) + history.length;
    const successfulBeats = history.length;
    const uptime = totalExpectedBeats > 0 ? (successfulBeats / totalExpectedBeats) * 100 : 100;

    // Calculate packet loss
    const packetLoss = Math.max(0, 100 - uptime);

    // Calculate jitter (latency variation)
    const avgLatency = status.averageLatency;
    const jitter = history.length > 1 
      ? Math.sqrt(history.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / history.length)
      : 0;

    // Determine overall health
    let overallHealth: ConnectionHealth['overallHealth'] = 'HEALTHY';
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (status.missedBeats >= 5) {
      overallHealth = 'DISCONNECTED';
      issues.push('Connection lost');
      recommendations.push('Attempt reconnection');
    } else if (status.missedBeats >= 3 || uptime < 80) {
      overallHealth = 'UNSTABLE';
      issues.push('Frequent disconnections');
      recommendations.push('Check network stability');
    } else if (avgLatency > 2000 || jitter > 500) {
      overallHealth = 'DEGRADED';
      issues.push('High latency or jitter');
      recommendations.push('Optimize network connection');
    }

    const health: ConnectionHealth = {
      tetherId,
      overallHealth,
      metrics: {
        uptime: Math.round(uptime * 100) / 100,
        averageLatency: Math.round(avgLatency),
        packetLoss: Math.round(packetLoss * 100) / 100,
        jitter: Math.round(jitter)
      },
      issues,
      recommendations
    };

    this.connectionMetrics.set(tetherId, health);
  }

  /**
   * Get heartbeat status for a tether
   */
  getHeartbeatStatus(tetherId: string): HeartbeatStatus | undefined {
    return this.monitoredTethers.get(tetherId);
  }

  /**
   * Get connection health for a tether
   */
  getConnectionHealth(tetherId: string): ConnectionHealth | undefined {
    return this.connectionMetrics.get(tetherId);
  }

  /**
   * Get all monitored tethers
   */
  getAllMonitoredTethers(): HeartbeatStatus[] {
    return Array.from(this.monitoredTethers.values());
  }

  /**
   * Get tethers with connection issues
   */
  getTethersWithIssues(): ConnectionHealth[] {
    return Array.from(this.connectionMetrics.values())
      .filter(health => health.overallHealth !== 'HEALTHY')
      .sort((a, b) => {
        const healthOrder = { DISCONNECTED: 4, UNSTABLE: 3, DEGRADED: 2, HEALTHY: 1 };
        return healthOrder[b.overallHealth] - healthOrder[a.overallHealth];
      });
  }

  /**
   * Generate monitoring analytics
   */
  generateMonitoringAnalytics(): {
    totalMonitored: number;
    healthyConnections: number;
    degradedConnections: number;
    unstableConnections: number;
    disconnectedConnections: number;
    averageLatency: number;
    averageUptime: number;
    systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  } {
    const allHealth = Array.from(this.connectionMetrics.values());
    const totalMonitored = allHealth.length;

    const healthCounts = {
      healthy: allHealth.filter(h => h.overallHealth === 'HEALTHY').length,
      degraded: allHealth.filter(h => h.overallHealth === 'DEGRADED').length,
      unstable: allHealth.filter(h => h.overallHealth === 'UNSTABLE').length,
      disconnected: allHealth.filter(h => h.overallHealth === 'DISCONNECTED').length
    };

    const averageLatency = totalMonitored > 0
      ? allHealth.reduce((sum, h) => sum + h.metrics.averageLatency, 0) / totalMonitored
      : 0;

    const averageUptime = totalMonitored > 0
      ? allHealth.reduce((sum, h) => sum + h.metrics.uptime, 0) / totalMonitored
      : 100;

    // Determine system health
    let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    const unhealthyPercentage = totalMonitored > 0 
      ? ((healthCounts.degraded + healthCounts.unstable + healthCounts.disconnected) / totalMonitored) * 100
      : 0;

    if (unhealthyPercentage > 30 || healthCounts.disconnected > 5) {
      systemHealth = 'CRITICAL';
    } else if (unhealthyPercentage > 15 || healthCounts.disconnected > 2) {
      systemHealth = 'DEGRADED';
    }

    return {
      totalMonitored,
      healthyConnections: healthCounts.healthy,
      degradedConnections: healthCounts.degraded,
      unstableConnections: healthCounts.unstable,
      disconnectedConnections: healthCounts.disconnected,
      averageLatency: Math.round(averageLatency),
      averageUptime: Math.round(averageUptime * 100) / 100,
      systemHealth
    };
  }

  /**
   * Perform health check on all monitored tethers
   */
  async performHealthCheck(): Promise<{
    healthy: string[];
    issues: string[];
    critical: string[];
  }> {
    const healthy: string[] = [];
    const issues: string[] = [];
    const critical: string[] = [];

    for (const [tetherId, status] of this.monitoredTethers.entries()) {
      const health = this.connectionMetrics.get(tetherId);
      
      if (!health) continue;

      switch (health.overallHealth) {
        case 'HEALTHY':
          healthy.push(tetherId);
          break;
        case 'DEGRADED':
        case 'UNSTABLE':
          issues.push(tetherId);
          break;
        case 'DISCONNECTED':
          critical.push(tetherId);
          break;
      }
    }

    return { healthy, issues, critical };
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    totalTethers: number;
    activeTethers: number;
    averageLatency: number;
    connectionIssues: number;
    uptimePercentage: number;
  } {
    const totalTethers = this.monitoredTethers.size;
    const activeTethers = Array.from(this.monitoredTethers.values())
      .filter(status => status.isActive).length;

    const allLatencies = Array.from(this.latencyHistory.values()).flat();
    const averageLatency = allLatencies.length > 0
      ? allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length
      : 0;

    const connectionIssues = Array.from(this.connectionMetrics.values())
      .filter(health => health.overallHealth !== 'HEALTHY').length;

    const allUptime = Array.from(this.connectionMetrics.values())
      .map(health => health.metrics.uptime);
    const uptimePercentage = allUptime.length > 0
      ? allUptime.reduce((sum, uptime) => sum + uptime, 0) / allUptime.length
      : 100;

    return {
      totalTethers,
      activeTethers,
      averageLatency: Math.round(averageLatency),
      connectionIssues,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100
    };
  }

  /**
   * Cleanup monitoring for inactive tethers
   */
  cleanupInactiveTethers(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [tetherId, status] of this.monitoredTethers.entries()) {
      if (status.lastHeartbeat.getTime() < cutoffTime) {
        this.stopMonitoring(tetherId);
        console.log(`🧹 Cleaned up inactive tether monitoring: ${tetherId}`);
      }
    }
  }

  /**
   * Test heartbeat system functionality
   */
  async testHeartbeatSystem(): Promise<{
    success: boolean;
    latency: number;
    errors: string[];
  }> {
    const startTime = performance.now();
    const errors: string[] = [];

    try {
      const testTetherId = 'test-tether-heartbeat';
      
      // Start monitoring
      await this.startMonitoring(testTetherId, 1); // 1 second for testing
      
      // Simulate heartbeat
      this.recordHeartbeat(testTetherId, 50);
      
      // Check status
      const status = this.getHeartbeatStatus(testTetherId);
      if (!status || !status.isActive) {
        errors.push('Heartbeat status not properly initialized');
      }

      // Check health
      const health = this.getConnectionHealth(testTetherId);
      if (!health) {
        errors.push('Connection health not properly tracked');
      }

      // Cleanup
      this.stopMonitoring(testTetherId);

      const latency = performance.now() - startTime;
      
      return {
        success: errors.length === 0,
        latency,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        latency: performance.now() - startTime,
        errors
      };
    }
  }
}