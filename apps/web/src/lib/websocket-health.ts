/**
 * ASTRAL CORE V2 - Enhanced WebSocket Health Monitoring
 * Production-ready WebSocket management with Vercel edge compatibility
 */

import React from 'react';

// Declare EdgeRuntime for Vercel edge environment
declare const EdgeRuntime: string | undefined;

interface WebSocketHealth {
  status: 'connected' | 'disconnected' | 'error' | 'timeout' | 'reconnecting';
  latency?: number;
  lastSeen?: Date;
  reconnectAttempts?: number;
  connectionId?: string;
  errorMessage?: string;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
}

export class WebSocketMonitor {
  private static instance: WebSocketMonitor;
  private connections = new Map<string, WebSocketHealth>();
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    averageLatency: 0,
    errorRate: 0,
    uptime: Date.now()
  };
  private healthCheckInterval?: NodeJS.Timeout;

  static getInstance(): WebSocketMonitor {
    if (!this.instance) {
      this.instance = new WebSocketMonitor();
    }
    return this.instance;
  }

  async checkConnection(url: string, timeout = 5000): Promise<WebSocketHealth> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      // Check if we can connect in Vercel edge environment
      const isVercelEdge = typeof EdgeRuntime !== 'undefined';
      
      if (isVercelEdge) {
        // Use alternative connection checking for edge runtime
        resolve(this.checkEdgeCompatibleConnection(url, timeout));
        return;
      }

      const ws = new WebSocket(url);
      
      const timeoutId = setTimeout(() => {
        ws.close();
        const health: WebSocketHealth = { 
          status: 'timeout', 
          connectionId,
          errorMessage: `Connection timeout after ${timeout}ms`
        };
        this.connections.set(url, health);
        resolve(health);
      }, timeout);

      ws.onopen = () => {
        const latency = Date.now() - startTime;
        clearTimeout(timeoutId);
        
        const health: WebSocketHealth = { 
          status: 'connected', 
          latency, 
          lastSeen: new Date(),
          connectionId,
          reconnectAttempts: 0
        };
        
        this.connections.set(url, health);
        this.updateMetrics(health);
        
        // Send ping to verify connection quality
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') {
              const roundTripTime = Date.now() - data.timestamp;
              health.latency = roundTripTime;
              this.connections.set(url, health);
            }
          } catch (error) {
            console.warn('WebSocket message parsing error:', error);
          }
        };
        
        ws.close();
        resolve(health);
      };

      ws.onerror = (error) => {
        clearTimeout(timeoutId);
        const health: WebSocketHealth = { 
          status: 'error',
          connectionId,
          errorMessage: 'WebSocket connection error',
          lastSeen: new Date()
        };
        this.connections.set(url, health);
        this.updateMetrics(health);
        resolve(health);
      };
    });
  }

  private async checkEdgeCompatibleConnection(url: string, timeout: number): Promise<WebSocketHealth> {
    // For Vercel edge functions, use HTTP-based health check
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url.replace('ws://', 'http://').replace('wss://', 'https://') + '/health', {
        signal: controller.signal,
        method: 'HEAD'
      });
      
      clearTimeout(timeoutId);
      
      return {
        status: response.ok ? 'connected' : 'error',
        latency: Date.now() - Date.now(), // Approximate
        lastSeen: new Date(),
        connectionId: `edge_${Date.now()}`
      };
    } catch (error) {
      return {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Edge connection failed',
        connectionId: `edge_${Date.now()}`
      };
    }
  }

  getConnectionStatus(url: string): WebSocketHealth | undefined {
    return this.connections.get(url);
  }

  getAllConnections(): Map<string, WebSocketHealth> {
    return new Map(this.connections);
  }

  getMetrics(): ConnectionMetrics {
    this.calculateCurrentMetrics();
    return { ...this.metrics };
  }

  private updateMetrics(health: WebSocketHealth): void {
    this.metrics.totalConnections++;
    
    if (health.status === 'connected') {
      this.metrics.activeConnections++;
    }
    
    if (health.latency) {
      // Update rolling average latency
      this.metrics.averageLatency = (this.metrics.averageLatency + health.latency) / 2;
    }
    
    if (health.status === 'error' || health.status === 'timeout') {
      this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalConnections;
    }
  }

  private calculateCurrentMetrics(): void {
    const connections = Array.from(this.connections.values());
    const activeCount = connections.filter(c => c.status === 'connected').length;
    const errorCount = connections.filter(c => c.status === 'error' || c.status === 'timeout').length;
    
    this.metrics.activeConnections = activeCount;
    this.metrics.errorRate = connections.length > 0 ? errorCount / connections.length : 0;
    this.metrics.uptime = Date.now() - this.metrics.uptime;
  }

  startHealthChecking(urls: string[], interval = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      console.log('🔄 Running WebSocket health checks...');
      
      const checks = urls.map(url => this.checkConnection(url));
      const results = await Promise.allSettled(checks);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const health = result.value;
          console.log(`WebSocket ${urls[index]}: ${health.status} (${health.latency}ms)`);
        } else {
          console.error(`WebSocket ${urls[index]} health check failed:`, result.reason);
        }
      });
      
      // Emit health check event for monitoring
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('websocket-health-check', {
          detail: { metrics: this.getMetrics(), timestamp: new Date() }
        }));
      }
    }, interval);
  }

  stopHealthChecking(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  // Crisis-specific WebSocket testing
  async testCrisisWebSocket(baseUrl: string): Promise<boolean> {
    const crisisEndpoints = [
      `${baseUrl}/crisis`,
      `${baseUrl}/emergency`,
      `${baseUrl}/volunteer-matching`
    ];

    try {
      const results = await Promise.all(
        crisisEndpoints.map(url => this.checkConnection(url, 3000))
      );

      const allHealthy = results.every(result => result.status === 'connected');
      
      if (allHealthy) {
        console.log('✅ All crisis WebSocket endpoints are healthy');
      } else {
        console.warn('⚠️ Some crisis WebSocket endpoints have issues');
      }

      return allHealthy;
    } catch (error) {
      console.error('❌ Crisis WebSocket testing failed:', error);
      return false;
    }
  }

  // Generate health report for monitoring
  generateHealthReport(): string {
    const metrics = this.getMetrics();
    const connections = Array.from(this.connections.entries());
    
    return `
🌐 WebSocket Health Report
========================
Total Connections: ${metrics.totalConnections}
Active Connections: ${metrics.activeConnections}
Average Latency: ${metrics.averageLatency.toFixed(2)}ms
Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%
Uptime: ${(metrics.uptime / 1000 / 60).toFixed(2)} minutes

Connection Details:
${connections.map(([url, health]) => 
  `• ${url}: ${health.status} ${health.latency ? `(${health.latency}ms)` : ''}`
).join('\n')}
`;
  }
}

// Export singleton instance
export const wsMonitor = WebSocketMonitor.getInstance();

// React hook for WebSocket health monitoring
export function useWebSocketHealth(urls: string[]) {
  const [health, setHealth] = React.useState<Map<string, WebSocketHealth>>(new Map());
  const [metrics, setMetrics] = React.useState<ConnectionMetrics | null>(null);

  React.useEffect(() => {
    const monitor = WebSocketMonitor.getInstance();
    
    // Initial health check
    const checkHealth = async () => {
      const results = new Map<string, WebSocketHealth>();
      
      for (const url of urls) {
        const result = await monitor.checkConnection(url);
        results.set(url, result);
      }
      
      setHealth(results);
      setMetrics(monitor.getMetrics());
    };

    checkHealth();
    monitor.startHealthChecking(urls);

    // Listen for health check events
    const handleHealthCheck = (event: CustomEvent) => {
      setMetrics(event.detail.metrics);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('websocket-health-check', handleHealthCheck as EventListener);
    }

    return () => {
      monitor.stopHealthChecking();
      if (typeof window !== 'undefined') {
        window.removeEventListener('websocket-health-check', handleHealthCheck as EventListener);
      }
    };
  }, [urls]);

  return { health, metrics };
}