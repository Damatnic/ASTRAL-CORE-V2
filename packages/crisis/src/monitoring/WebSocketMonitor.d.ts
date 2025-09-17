/**
 * ASTRAL_CORE 2.0 Crisis WebSocket Real-Time Monitor
 *
 * LIFE-CRITICAL SYSTEM MONITORING
 *
 * This monitor provides real-time visibility into WebSocket performance
 * to ensure the system maintains life-saving response times.
 */
import { EventEmitter } from 'events';
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
export declare class WebSocketMonitor extends EventEmitter {
    private static instance;
    private manager;
    private metricsHistory;
    private activeAlerts;
    private monitoringInterval;
    private readonly THRESHOLDS;
    private constructor();
    static getInstance(): WebSocketMonitor;
    /**
     * Start real-time monitoring
     */
    private startMonitoring;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Collect comprehensive performance metrics
     */
    private collectMetrics;
    /**
     * Check performance against life-critical thresholds
     */
    private checkPerformanceThresholds;
    /**
     * Process and manage alerts
     */
    private processAlerts;
    /**
     * Trigger emergency notification for critical issues
     */
    private triggerEmergencyNotification;
    /**
     * Get system resource metrics
     */
    private getSystemMetrics;
    /**
     * Count emergency connections
     */
    private countEmergencyConnections;
    /**
     * Calculate connection success rate
     */
    private calculateConnectionSuccessRate;
    /**
     * Determine overall system health
     */
    private determineSystemHealth;
    /**
     * Get current metrics for dashboards
     */
    getCurrentMetrics(): WebSocketHealthMetrics | null;
    /**
     * Get metrics history for trending
     */
    getMetricsHistory(minutes?: number): WebSocketHealthMetrics[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): PerformanceAlert[];
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
    };
}
export declare const webSocketMonitor: WebSocketMonitor;
//# sourceMappingURL=WebSocketMonitor.d.ts.map