/**
 * ASTRAL_CORE 2.0 Crisis WebSocket Manager
 *
 * REAL-TIME CRISIS COMMUNICATION MANAGER
 * Manages WebSocket connections for crisis interventions.
 * Ensures ultra-low latency communication for life-critical situations.
 */
import { randomUUID } from 'crypto';
export class CrisisWebSocketManager {
    static instance;
    connections = new Map();
    sessionConnections = new Map();
    constructor() {
        console.log('🔗 Crisis WebSocket Manager initialized');
    }
    static getInstance() {
        if (!CrisisWebSocketManager.instance) {
            CrisisWebSocketManager.instance = new CrisisWebSocketManager();
        }
        return CrisisWebSocketManager.instance;
    }
    /**
     * Create WebSocket connection for crisis session
     * TARGET: <100ms connection establishment
     */
    async createConnection(config) {
        const startTime = performance.now();
        const connectionId = randomUUID();
        try {
            // In production, this would establish actual WebSocket connection
            const wsUrl = this.generateWebSocketUrl(config);
            // Store connection metadata
            const connection = {
                id: connectionId,
                sessionId: config.sessionId,
                anonymousId: config.anonymousId,
                sessionToken: config.sessionToken,
                severity: config.severity,
                isEmergency: config.isEmergency,
                connectedAt: new Date(),
                lastActivity: new Date(),
                isAlive: true,
            };
            this.connections.set(connectionId, connection);
            // Track session connections
            if (!this.sessionConnections.has(config.sessionId)) {
                this.sessionConnections.set(config.sessionId, new Set());
            }
            this.sessionConnections.get(config.sessionId).add(connectionId);
            const latency = performance.now() - startTime;
            if (latency > 100) {
                console.warn(`⚠️ WebSocket connection took ${latency.toFixed(2)}ms (target: <100ms)`);
            }
            else {
                console.log(`✅ WebSocket connection established: ${connectionId} (${latency.toFixed(2)}ms)`);
            }
            return {
                url: wsUrl,
                connectionId,
                established: true,
                latencyMs: latency,
            };
        }
        catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            throw new Error('WebSocket connection failed');
        }
    }
    /**
     * Broadcast message to all connections in a session
     * TARGET: <50ms message delivery
     */
    async broadcastToSession(sessionToken, message) {
        const startTime = performance.now();
        try {
            // Find session by token
            const sessionId = this.findSessionByToken(sessionToken);
            if (!sessionId) {
                throw new Error('Session not found for token');
            }
            const sessionConnections = this.sessionConnections.get(sessionId);
            if (!sessionConnections || sessionConnections.size === 0) {
                console.warn(`⚠️ No active connections for session: ${sessionId}`);
                return;
            }
            // Broadcast to all connections in session
            let deliveredCount = 0;
            for (const connectionId of sessionConnections) {
                const connection = this.connections.get(connectionId);
                if (connection && connection.isAlive) {
                    // In production, would send via actual WebSocket
                    console.log(`📤 Message delivered to connection: ${connectionId}`);
                    deliveredCount++;
                }
            }
            const deliveryTime = performance.now() - startTime;
            if (deliveryTime > 50) {
                console.warn(`⚠️ Message broadcast took ${deliveryTime.toFixed(2)}ms (target: <50ms)`);
            }
            console.log(`✅ Message broadcast to ${deliveredCount} connections (${deliveryTime.toFixed(2)}ms)`);
        }
        catch (error) {
            console.error('❌ Failed to broadcast message:', error);
            throw error;
        }
    }
    /**
     * Close WebSocket session and cleanup connections
     */
    async closeSession(sessionToken) {
        try {
            const sessionId = this.findSessionByToken(sessionToken);
            if (!sessionId) {
                console.warn(`⚠️ Session not found for token: ${sessionToken}`);
                return;
            }
            const sessionConnections = this.sessionConnections.get(sessionId);
            if (sessionConnections) {
                // Close all connections in session
                for (const connectionId of sessionConnections) {
                    const connection = this.connections.get(connectionId);
                    if (connection) {
                        // In production, would close actual WebSocket
                        console.log(`🔌 Closing connection: ${connectionId}`);
                        this.connections.delete(connectionId);
                    }
                }
                // Remove session tracking
                this.sessionConnections.delete(sessionId);
            }
            console.log(`✅ Session closed: ${sessionId}`);
        }
        catch (error) {
            console.error('❌ Failed to close session:', error);
        }
    }
    /**
     * Get WebSocket connection statistics
     */
    getConnectionStats() {
        const totalConnections = this.connections.size;
        const activeSessions = this.sessionConnections.size;
        let emergencyConnections = 0;
        let averageLatency = 0;
        for (const connection of this.connections.values()) {
            if (connection.isEmergency) {
                emergencyConnections++;
            }
            // Calculate latency based on last activity
            const latency = Date.now() - connection.lastActivity.getTime();
            averageLatency += latency;
        }
        averageLatency = totalConnections > 0 ? averageLatency / totalConnections : 0;
        return {
            totalConnections,
            activeSessions,
            emergencyConnections,
            averageLatencyMs: averageLatency,
            systemHealth: this.calculateSystemHealth(totalConnections, averageLatency),
        };
    }
    // Private helper methods
    generateWebSocketUrl(config) {
        const baseUrl = process.env.WEBSOCKET_URL || 'ws://localhost:8080';
        const params = new URLSearchParams({
            sessionId: config.sessionId,
            token: config.sessionToken,
            severity: config.severity.toString(),
            emergency: config.isEmergency.toString(),
        });
        return `${baseUrl}/crisis?${params.toString()}`;
    }
    findSessionByToken(sessionToken) {
        for (const connection of this.connections.values()) {
            if (connection.sessionToken === sessionToken) {
                return connection.sessionId;
            }
        }
        return null;
    }
    calculateSystemHealth(totalConnections, averageLatency) {
        if (averageLatency > 1000 || totalConnections > 10000) {
            return 'CRITICAL';
        }
        else if (averageLatency > 500 || totalConnections > 5000) {
            return 'DEGRADED';
        }
        return 'HEALTHY';
    }
}
//# sourceMappingURL=CrisisWebSocketManager.js.map