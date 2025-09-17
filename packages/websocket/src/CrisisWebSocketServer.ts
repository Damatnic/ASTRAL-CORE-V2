/**
 * ASTRAL_CORE 2.0 - Crisis WebSocket Server
 * 
 * LIFE-CRITICAL REAL-TIME COMMUNICATION
 * This WebSocket server handles real-time communication for crisis interventions.
 * Every message could be the difference between life and death - ultra-low latency required.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';

export interface CrisisConnection {
  id: string;
  ws: WebSocket;
  sessionId: string;
  userType: 'ANONYMOUS_USER' | 'VOLUNTEER' | 'ADMIN';
  connectedAt: Date;
  lastActivity: Date;
  isAlive: boolean;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    region?: string;
  };
}

export interface CrisisMessage {
  id: string;
  sessionId: string;
  content: string;
  senderType: 'user' | 'volunteer' | 'system';
  timestamp: Date;
  isEncrypted: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
  messageType: 'text' | 'typing' | 'system' | 'emergency';
}

export interface EmergencyAlert {
  id: string;
  sessionId: string;
  level: 'HIGH' | 'CRITICAL' | 'IMMEDIATE';
  message: string;
  timestamp: Date;
  triggerType: 'USER_REQUEST' | 'AI_DETECTED' | 'VOLUNTEER_ESCALATED' | 'SYSTEM_AUTO';
}

export class CrisisWebSocketServer extends EventEmitter {
  private wss: WebSocketServer;
  private connections: Map<string, CrisisConnection> = new Map();
  private sessionConnections: Map<string, Set<string>> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private port: number;
  private isRunning: boolean = false;

  constructor(port: number = 8080) {
    super();
    this.port = port;
    this.wss = new WebSocketServer({ port: this.port });
    this.setupWebSocketServer();
    this.startHeartbeat();
    this.startMetricsCollection();
  }

  private setupWebSocketServer(): void {
    console.log(`🚀 ASTRAL_CORE Crisis WebSocket Server starting on port ${this.port}`);
    
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server Error:', error);
      this.emit('error', error);
    });

    this.wss.on('listening', () => {
      this.isRunning = true;
      console.log('✅ Crisis WebSocket Server is running');
      console.log('🏥 Ready to handle life-critical real-time communication');
      this.emit('ready');
    });
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    const userType = url.searchParams.get('userType') as CrisisConnection['userType'] || 'ANONYMOUS_USER';

    if (!sessionId) {
      console.warn('Connection rejected: No session ID provided');
      ws.close(4000, 'Session ID required');
      return;
    }

    const connectionId = randomUUID();
    const connection: CrisisConnection = {
      id: connectionId,
      ws,
      sessionId,
      userType,
      connectedAt: new Date(),
      lastActivity: new Date(),
      isAlive: true,
      metadata: {
        userAgent: request.headers['user-agent'],
        ipAddress: request.socket.remoteAddress,
        region: request.headers['cf-ipcountry'] as string, // Cloudflare header
      },
    };

    // Store connection
    this.connections.set(connectionId, connection);
    
    // Track session connections
    if (!this.sessionConnections.has(sessionId)) {
      this.sessionConnections.set(sessionId, new Set());
    }
    this.sessionConnections.get(sessionId)!.add(connectionId);

    console.log(`🔗 Crisis connection established: ${connectionId} (session: ${sessionId}, type: ${userType})`);
    
    // Set up connection handlers
    this.setupConnectionHandlers(connection);
    
    // Send connection confirmation
    this.sendToConnection(connectionId, {
      type: 'connection_established',
      data: {
        connectionId,
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
      },
    });

    // Notify session about new connection
    this.broadcastToSession(sessionId, {
      type: 'participant_joined',
      data: {
        userType,
        timestamp: new Date().toISOString(),
      },
    }, connectionId); // Exclude the new connection itself

    this.emit('connection', connection);
  }

  private setupConnectionHandlers(connection: CrisisConnection): void {
    const { ws, id: connectionId, sessionId } = connection;

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(connectionId, message);
      } catch (error) {
        console.error('Invalid message format:', error);
        this.sendError(connectionId, 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`🔌 Connection closed: ${connectionId} (code: ${code}, reason: ${reason.toString()})`);
      this.handleDisconnection(connectionId);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`Connection error for ${connectionId}:`, error);
      this.handleDisconnection(connectionId);
    });

    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      connection.isAlive = true;
      connection.lastActivity = new Date();
    });
  }

  private handleMessage(connectionId: string, message: any): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.lastActivity = new Date();

    switch (message.type) {
      case 'crisis_message':
        this.handleCrisisMessage(connection, message);
        break;
        
      case 'typing_indicator':
        this.handleTypingIndicator(connection, message);
        break;
        
      case 'emergency_escalation':
        this.handleEmergencyEscalation(connection, message);
        break;
        
      case 'heartbeat':
        this.handleHeartbeat(connection);
        break;
        
      case 'volunteer_status':
        this.handleVolunteerStatus(connection, message);
        break;
        
      default:
        console.warn(`Unknown message type: ${message.type}`);
        this.sendError(connectionId, 'Unknown message type');
    }
  }

  private handleCrisisMessage(connection: CrisisConnection, message: any): void {
    const { sessionId } = connection;
    
    // Create crisis message
    const crisisMessage: CrisisMessage = {
      id: randomUUID(),
      sessionId,
      content: message.content,
      senderType: connection.userType === 'VOLUNTEER' ? 'volunteer' : 'user',
      timestamp: new Date(),
      isEncrypted: message.isEncrypted || false,
      urgencyLevel: message.urgencyLevel || 'medium',
      messageType: 'text',
    };

    console.log(`💬 Crisis message: ${crisisMessage.id} (session: ${sessionId})`);

    // Broadcast to all session participants
    this.broadcastToSession(sessionId, {
      type: 'crisis_message',
      data: crisisMessage,
    });

    // Emit for external processing (database storage, AI analysis, etc.)
    this.emit('crisis_message', crisisMessage, connection);

    // Check for emergency keywords and auto-escalate if needed
    this.checkForEmergencyEscalation(crisisMessage, connection);
  }

  private handleTypingIndicator(connection: CrisisConnection, message: any): void {
    const { sessionId, userType } = connection;
    
    // Broadcast typing indicator to other session participants
    this.broadcastToSession(sessionId, {
      type: 'typing_indicator',
      data: {
        userType,
        isTyping: message.isTyping,
        timestamp: new Date().toISOString(),
      },
    }, connection.id); // Exclude sender
  }

  private handleEmergencyEscalation(connection: CrisisConnection, message: any): void {
    const { sessionId } = connection;
    
    const emergencyAlert: EmergencyAlert = {
      id: randomUUID(),
      sessionId,
      level: message.level || 'HIGH',
      message: message.message || 'Emergency escalation requested',
      timestamp: new Date(),
      triggerType: 'USER_REQUEST',
    };

    console.log(`🚨 EMERGENCY ESCALATION: ${emergencyAlert.id} (session: ${sessionId}, level: ${emergencyAlert.level})`);

    // Immediate broadcast to all session participants
    this.broadcastToSession(sessionId, {
      type: 'emergency_alert',
      data: emergencyAlert,
      priority: 'IMMEDIATE',
    });

    // Broadcast to all volunteers for immediate response
    this.broadcastToUserType('VOLUNTEER', {
      type: 'emergency_alert',
      data: emergencyAlert,
      priority: 'IMMEDIATE',
    });

    // Emit for external emergency processing
    this.emit('emergency_escalation', emergencyAlert, connection);
  }

  private handleHeartbeat(connection: CrisisConnection): void {
    this.sendToConnection(connection.id, {
      type: 'heartbeat_response',
      data: {
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
        latency: Date.now() - connection.lastActivity.getTime(),
      },
    });
  }

  private handleVolunteerStatus(connection: CrisisConnection, message: any): void {
    if (connection.userType !== 'VOLUNTEER') {
      this.sendError(connection.id, 'Unauthorized: Not a volunteer');
      return;
    }

    // Broadcast volunteer status to relevant sessions
    const status = {
      volunteerId: connection.id,
      status: message.status,
      availabilityLevel: message.availabilityLevel,
      timestamp: new Date().toISOString(),
    };

    this.emit('volunteer_status_update', status, connection);
  }

  private checkForEmergencyEscalation(message: CrisisMessage, connection: CrisisConnection): void {
    const emergencyKeywords = [
      'kill myself', 'end my life', 'suicide', 'kill me', 
      'dying', 'dead', 'hurt myself', 'end it all',
      'bridge', 'pills', 'gun', 'rope', 'knife',
      'tonight', 'right now', 'immediately', 'can\'t wait'
    ];

    const content = message.content.toLowerCase();
    const foundKeywords = emergencyKeywords.filter(keyword => content.includes(keyword));

    if (foundKeywords.length > 0) {
      // Auto-escalate based on AI detection
      const autoAlert: EmergencyAlert = {
        id: randomUUID(),
        sessionId: message.sessionId,
        level: foundKeywords.some(k => ['tonight', 'right now', 'immediately'].includes(k)) ? 'IMMEDIATE' : 'HIGH',
        message: `Auto-detected emergency keywords: ${foundKeywords.join(', ')}`,
        timestamp: new Date(),
        triggerType: 'AI_DETECTED',
      };

      console.log(`🤖 AUTO-ESCALATION TRIGGERED: ${autoAlert.id} (keywords: ${foundKeywords.join(', ')})`);

      this.handleEmergencyEscalation(connection, {
        level: autoAlert.level,
        message: autoAlert.message,
      });
    }
  }

  private handleDisconnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const { sessionId } = connection;

    // Remove from connections
    this.connections.delete(connectionId);

    // Remove from session connections
    const sessionConns = this.sessionConnections.get(sessionId);
    if (sessionConns) {
      sessionConns.delete(connectionId);
      if (sessionConns.size === 0) {
        this.sessionConnections.delete(sessionId);
      }
    }

    // Notify other session participants
    this.broadcastToSession(sessionId, {
      type: 'participant_left',
      data: {
        userType: connection.userType,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`👋 Connection disconnected: ${connectionId}`);
    this.emit('disconnection', connection);
  }

  private sendToConnection(connectionId: string, message: any): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${connectionId}:`, error);
      this.handleDisconnection(connectionId);
      return false;
    }
  }

  private broadcastToSession(sessionId: string, message: any, excludeConnectionId?: string): number {
    const sessionConnections = this.sessionConnections.get(sessionId);
    if (!sessionConnections) return 0;

    let sentCount = 0;
    for (const connectionId of sessionConnections) {
      if (connectionId === excludeConnectionId) continue;
      
      if (this.sendToConnection(connectionId, message)) {
        sentCount++;
      }
    }

    return sentCount;
  }

  private broadcastToUserType(userType: CrisisConnection['userType'], message: any): number {
    let sentCount = 0;
    
    for (const connection of this.connections.values()) {
      if (connection.userType === userType) {
        if (this.sendToConnection(connection.id, message)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  private sendError(connectionId: string, errorMessage: string): void {
    this.sendToConnection(connectionId, {
      type: 'error',
      data: {
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const deadConnections: string[] = [];

      for (const [connectionId, connection] of this.connections.entries()) {
        if (!connection.isAlive) {
          deadConnections.push(connectionId);
          continue;
        }

        connection.isAlive = false;
        connection.ws.ping();
      }

      // Clean up dead connections
      for (const connectionId of deadConnections) {
        console.log(`💀 Cleaning up dead connection: ${connectionId}`);
        this.handleDisconnection(connectionId);
      }
    }, 30000); // 30 seconds
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = {
        totalConnections: this.connections.size,
        activeSessions: this.sessionConnections.size,
        connectionsByType: {
          anonymous: Array.from(this.connections.values()).filter(c => c.userType === 'ANONYMOUS_USER').length,
          volunteers: Array.from(this.connections.values()).filter(c => c.userType === 'VOLUNTEER').length,
          admins: Array.from(this.connections.values()).filter(c => c.userType === 'ADMIN').length,
        },
        averageLatency: this.calculateAverageLatency(),
        timestamp: new Date().toISOString(),
      };

      this.emit('metrics', metrics);
    }, 60000); // Every minute
  }

  private calculateAverageLatency(): number {
    const connections = Array.from(this.connections.values());
    if (connections.length === 0) return 0;

    const now = Date.now();
    const totalLatency = connections.reduce((sum, conn) => 
      sum + (now - conn.lastActivity.getTime()), 0);
    
    return totalLatency / connections.length;
  }

  public getConnectionStats(): any {
    return {
      isRunning: this.isRunning,
      totalConnections: this.connections.size,
      activeSessions: this.sessionConnections.size,
      port: this.port,
      uptime: process.uptime(),
      connectionsByType: {
        anonymous: Array.from(this.connections.values()).filter(c => c.userType === 'ANONYMOUS_USER').length,
        volunteers: Array.from(this.connections.values()).filter(c => c.userType === 'VOLUNTEER').length,
        admins: Array.from(this.connections.values()).filter(c => c.userType === 'ADMIN').length,
      },
    };
  }

  public async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Crisis WebSocket Server...');
    
    // Clear intervals
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);

    // Close all connections gracefully
    for (const connection of this.connections.values()) {
      this.sendToConnection(connection.id, {
        type: 'server_shutdown',
        data: {
          message: 'Server is shutting down. Please reconnect.',
          timestamp: new Date().toISOString(),
        },
      });
      connection.ws.close(1001, 'Server shutdown');
    }

    // Close the server
    return new Promise((resolve) => {
      this.wss.close(() => {
        this.isRunning = false;
        console.log('✅ Crisis WebSocket Server shutdown complete');
        resolve();
      });
    });
  }
}

export default CrisisWebSocketServer;