/**
 * ASTRAL_CORE 2.0 Crisis WebSocket Manager
 *
 * REAL-TIME CRISIS COMMUNICATION MANAGER
 * Manages WebSocket connections for crisis interventions.
 * Ensures ultra-low latency communication for life-critical situations.
 */
export interface WebSocketConnectionConfig {
    sessionId: string;
    anonymousId: string;
    sessionToken: string;
    severity: number;
    isEmergency: boolean;
}
export interface WebSocketConnectionResult {
    url: string;
    connectionId: string;
    established: boolean;
    latencyMs: number;
}
export declare class CrisisWebSocketManager {
    private static instance;
    private connections;
    private sessionConnections;
    private constructor();
    static getInstance(): CrisisWebSocketManager;
    /**
     * Create WebSocket connection for crisis session
     * TARGET: <100ms connection establishment
     */
    createConnection(config: WebSocketConnectionConfig): Promise<WebSocketConnectionResult>;
    /**
     * Broadcast message to all connections in a session
     * TARGET: <50ms message delivery
     */
    broadcastToSession(sessionToken: string, message: {
        messageId: string;
        senderType: string;
        timestamp: Date;
        encrypted: boolean;
        severity?: number;
    }): Promise<void>;
    /**
     * Close WebSocket session and cleanup connections
     */
    closeSession(sessionToken: string): Promise<void>;
    /**
     * Get WebSocket connection statistics
     */
    getConnectionStats(): {
        totalConnections: number;
        activeSessions: number;
        emergencyConnections: number;
        averageLatencyMs: number;
        systemHealth: "CRITICAL" | "DEGRADED" | "HEALTHY";
    };
    private generateWebSocketUrl;
    private findSessionByToken;
    private calculateSystemHealth;
}
//# sourceMappingURL=CrisisWebSocketManager.d.ts.map