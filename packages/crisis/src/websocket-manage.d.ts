import { CrisisMessage } from './types';
export interface CrisisWebSocketConfig {
    sessionId: string;
    volunteerId?: string;
    clientId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    encryption: boolean;
    maxConnections: number;
}
export declare class CrisisWebSocketManager {
    private static instance;
    private connections;
    private connectionPools;
    private messageQueue;
    private heartbeatInterval;
    private constructor();
    static getInstance(): CrisisWebSocketManager;
    createConnection(config: CrisisWebSocketConfig): Promise<string>;
    sendMessage(sessionId: string, message: CrisisMessage): Promise<boolean>;
    closeConnection(connectionId: string): Promise<void>;
    private establishWebSocketConnection;
    private getActiveConnection;
    private queueMessage;
    private setupConnectionHandlers;
    private startHeartbeat;
    private handleIncomingMessage;
    private handleConnectionClosed;
    private buildWebSocketUrl;
    /**
     * Get performance metrics for monitoring
     */
    getPerformanceMetrics(): {
        totalConnections: number;
        activeConnections: number;
        messagesSent: number;
        messagesReceived: number;
        errorRate: number;
        averageLatency: number;
        averageHandshakeTime: number;
        averageMessageDelivery: number;
        messageSuccessRate: number;
        currentLoad: number;
        messageQueueSize: number;
        retryQueueSize: number;
    };
}
export declare const crisisWebSocketManager: CrisisWebSocketManager;
//# sourceMappingURL=websocket-manage.d.ts.map