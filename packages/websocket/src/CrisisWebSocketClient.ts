/**
 * ASTRAL_CORE 2.0 - Crisis WebSocket Client
 * 
 * LIFE-CRITICAL CLIENT CONNECTION MANAGER
 * This client manages real-time connections for crisis intervention.
 * Handles reconnection, message queuing, and emergency escalation.
 */

import { EventEmitter } from 'events';
import { CrisisMessage, EmergencyAlert } from './CrisisWebSocketServer';

export interface ConnectionConfig {
  serverUrl: string;
  sessionId: string;
  userType: 'ANONYMOUS_USER' | 'VOLUNTEER' | 'ADMIN';
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  latency: number;
  reconnectCount: number;
  lastConnected?: Date;
  lastError?: string;
}

export class CrisisWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<ConnectionConfig>;
  private state: ConnectionState;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private messageQueue: any[] = [];
  private connectionId: string | null = null;
  private isIntentionalDisconnect: boolean = false;

  constructor(config: ConnectionConfig) {
    super();
    
    this.config = {
      reconnectAttempts: 10,
      reconnectDelay: 2000,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      ...config,
    };

    this.state = {
      status: 'disconnected',
      latency: 0,
      reconnectCount: 0,
    };
  }

  public async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    this.setState({ status: 'connecting' });
    this.isIntentionalDisconnect = false;

    try {
      await this.establishConnection();
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.setState({ 
        status: 'error', 
        lastError: error instanceof Error ? error.message : 'Connection failed' 
      });
      this.emit('error', error);
      this.scheduleReconnect();
    }
  }

  private async establishConnection(): Promise<void> {
    const wsUrl = this.buildWebSocketUrl();
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        this.ws?.close();
        reject(new Error('Connection timeout'));
      }, 10000); // 10 second timeout

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('🔗 Crisis WebSocket connected');
        
        this.setState({ 
          status: 'connected', 
          lastConnected: new Date(),
          reconnectCount: 0 
        });
        
        this.startHeartbeat();
        this.flushMessageQueue();
        this.emit('connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        this.handleDisconnection(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        this.emit('error', error);
        reject(error);
      };
    });
  }

  private buildWebSocketUrl(): string {
    const url = new URL(this.config.serverUrl);
    url.searchParams.set('sessionId', this.config.sessionId);
    url.searchParams.set('userType', this.config.userType);
    url.searchParams.set('timestamp', Date.now().toString());
    return url.toString();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private processMessage(message: any): void {
    const messageType = message.type;

    switch (messageType) {
      case 'connection_established':
        this.connectionId = message.data.connectionId;
        console.log(`✅ Connection established: ${this.connectionId}`);
        break;

      case 'crisis_message':
        this.handleCrisisMessage(message.data);
        break;

      case 'typing_indicator':
        this.emit('typing_indicator', message.data);
        break;

      case 'emergency_alert':
        this.handleEmergencyAlert(message.data);
        break;

      case 'heartbeat_response':
        this.handleHeartbeatResponse(message.data);
        break;

      case 'participant_joined':
      case 'participant_left':
        this.emit('participant_update', message);
        break;

      case 'volunteer_status_update':
        this.emit('volunteer_status', message.data);
        break;

      case 'server_shutdown':
        console.warn('Server is shutting down:', message.data.message);
        this.emit('server_shutdown', message.data);
        break;

      case 'error':
        console.error('Server error:', message.data.message);
        this.emit('server_error', message.data);
        break;

      default:
        console.warn(`Unknown message type: ${messageType}`);
    }
  }

  private handleCrisisMessage(messageData: CrisisMessage): void {
    console.log('💬 Received crisis message:', messageData.id);
    this.emit('crisis_message', messageData);

    // Auto-scroll and focus management for accessibility
    if (messageData.urgencyLevel === 'emergency') {
      this.emit('emergency_message', messageData);
    }
  }

  private handleEmergencyAlert(alertData: EmergencyAlert): void {
    console.log('🚨 EMERGENCY ALERT:', alertData.id, alertData.level);
    
    // Trigger browser notifications if permitted
    this.showEmergencyNotification(alertData);
    
    this.emit('emergency_alert', alertData);
  }

  private handleHeartbeatResponse(data: any): void {
    const now = Date.now();
    const serverTime = data.serverTime;
    const latency = now - serverTime;
    
    this.setState({ latency });
    
    // Log high latency for monitoring
    if (latency > 1000) {
      console.warn(`High latency detected: ${latency}ms`);
    }
  }

  private handleDisconnection(event: CloseEvent): void {
    console.log(`🔌 WebSocket disconnected: ${event.code} - ${event.reason}`);
    
    this.stopHeartbeat();
    this.ws = null;
    this.connectionId = null;

    if (this.isIntentionalDisconnect) {
      this.setState({ status: 'disconnected' });
      this.emit('disconnected', { intentional: true });
      return;
    }

    // Auto-reconnect for unintentional disconnections
    if (event.code !== 1000) { // Not a normal closure
      this.setState({ status: 'reconnecting' });
      this.emit('disconnected', { intentional: false, code: event.code, reason: event.reason });
      this.scheduleReconnect();
    } else {
      this.setState({ status: 'disconnected' });
      this.emit('disconnected', { intentional: true });
    }
  }

  private scheduleReconnect(): void {
    if (this.state.reconnectCount >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setState({ status: 'error', lastError: 'Max reconnection attempts reached' });
      this.emit('max_reconnect_attempts');
      return;
    }

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.state.reconnectCount), // Exponential backoff
      30000 // Max 30 seconds
    );

    console.log(`Reconnecting in ${delay}ms... (attempt ${this.state.reconnectCount + 1}/${this.config.reconnectAttempts})`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.state.reconnectCount++;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendHeartbeat(): void {
    this.send({
      type: 'heartbeat',
      timestamp: Date.now(),
    });
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendImmediate(message);
    }
  }

  private showEmergencyNotification(alert: EmergencyAlert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Crisis Emergency Alert', {
        body: alert.message,
        icon: '/crisis-icon.png',
        tag: 'crisis-emergency',
        requireInteraction: true,
        silent: false,
      });
    }
  }

  // Public API Methods

  public sendCrisisMessage(content: string, urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'medium'): void {
    const message = {
      type: 'crisis_message',
      content,
      urgencyLevel,
      timestamp: Date.now(),
      isEncrypted: true, // All crisis messages should be encrypted
    };

    this.send(message);
  }

  public sendTypingIndicator(isTyping: boolean): void {
    this.send({
      type: 'typing_indicator',
      isTyping,
      timestamp: Date.now(),
    });
  }

  public escalateEmergency(level: 'HIGH' | 'CRITICAL' | 'IMMEDIATE', message: string): void {
    console.log(`🚨 Escalating emergency: ${level}`);
    
    const emergencyMessage = {
      type: 'emergency_escalation',
      level,
      message,
      timestamp: Date.now(),
    };

    this.send(emergencyMessage, true); // High priority
  }

  public updateVolunteerStatus(status: string, availabilityLevel: number): void {
    if (this.config.userType !== 'VOLUNTEER') {
      console.warn('Only volunteers can update status');
      return;
    }

    this.send({
      type: 'volunteer_status',
      status,
      availabilityLevel,
      timestamp: Date.now(),
    });
  }

  private send(message: any, highPriority: boolean = false): void {
    if (this.state.status === 'connected') {
      this.sendImmediate(message);
    } else {
      this.queueMessage(message, highPriority);
    }
  }

  private sendImmediate(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.queueMessage(message);
    }
  }

  private queueMessage(message: any, highPriority: boolean = false): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      console.warn('Message queue full, dropping oldest message');
      this.messageQueue.shift();
    }

    if (highPriority) {
      this.messageQueue.unshift(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  public disconnect(): void {
    console.log('🔌 Intentionally disconnecting WebSocket');
    
    this.isIntentionalDisconnect = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
  }

  public getState(): ConnectionState {
    return { ...this.state };
  }

  public isConnected(): boolean {
    return this.state.status === 'connected';
  }

  public getLatency(): number {
    return this.state.latency;
  }

  private setState(newState: Partial<ConnectionState>): void {
    this.state = { ...this.state, ...newState };
    this.emit('state_change', this.state);
  }

  // Request browser notification permission for emergency alerts
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

export default CrisisWebSocketClient;