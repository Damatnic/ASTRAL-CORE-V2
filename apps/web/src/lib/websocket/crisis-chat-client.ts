import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

// Crisis chat message types
export interface CrisisMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: 'USER' | 'VOLUNTEER' | 'PROFESSIONAL';
  content: string;
  timestamp: Date;
  severity?: number;
  isEmergency?: boolean;
  encrypted?: boolean;
}

// Crisis session state
export interface CrisisSession {
  id: string;
  status: 'WAITING' | 'MATCHED' | 'ACTIVE' | 'ESCALATED' | 'RESOLVED';
  userId: string;
  volunteerId?: string;
  severity: number;
  startedAt: Date;
  messages: CrisisMessage[];
}

// Volunteer info
export interface Volunteer {
  id: string;
  name: string;
  avatar?: string;
  specializations: string[];
  languages: string[];
  rating: number;
  responseTime: number; // Average response time in seconds
}

// Real-time events
export enum CrisisEvent {
  // Connection events
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  
  // Session events
  SESSION_STARTED = 'session:started',
  SESSION_MATCHED = 'session:matched',
  SESSION_ESCALATED = 'session:escalated',
  SESSION_ENDED = 'session:ended',
  
  // Message events
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_SENT = 'message:sent',
  MESSAGE_TYPING = 'message:typing',
  
  // Volunteer events
  VOLUNTEER_JOINED = 'volunteer:joined',
  VOLUNTEER_LEFT = 'volunteer:left',
  VOLUNTEER_TYPING = 'volunteer:typing',
  
  // Emergency events
  EMERGENCY_TRIGGERED = 'emergency:triggered',
  EMERGENCY_RESOURCES = 'emergency:resources',
  
  // System events
  QUEUE_UPDATE = 'queue:update',
  METRICS_UPDATE = 'metrics:update',
}

// Crisis chat client configuration
interface CrisisChatConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
  auth?: {
    token?: string;
    sessionId?: string;
  };
}

export class CrisisChatClient extends EventEmitter {
  private socket: Socket | null = null;
  private config: CrisisChatConfig;
  private session: CrisisSession | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private messageQueue: CrisisMessage[] = [];
  private typingTimer: NodeJS.Timeout | null = null;
  
  constructor(config: CrisisChatConfig = {}) {
    super();
    
    this.config = {
      url: config.url || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
      autoConnect: config.autoConnect !== false,
      reconnection: config.reconnection !== false,
      reconnectionAttempts: config.reconnectionAttempts || 5,
      reconnectionDelay: config.reconnectionDelay || 1000,
      timeout: config.timeout || 20000,
      auth: config.auth || {},
    };
    
    if (this.config.autoConnect) {
      this.connect();
    }
  }
  
  // Connect to WebSocket server
  connect(): void {
    if (this.socket?.connected) {
      console.log('Already connected to crisis chat');
      return;
    }
    
    this.socket = io(this.config.url!, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      timeout: this.config.timeout,
      auth: this.config.auth,
    });
    
    this.setupEventListeners();
  }
  
  // Setup WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit(CrisisEvent.CONNECTED);
      
      // Send queued messages
      this.flushMessageQueue();
    });
    
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emit(CrisisEvent.DISCONNECTED, reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Crisis chat connection error:', error);
      this.reconnectAttempts++;
      this.emit(CrisisEvent.RECONNECTING, this.reconnectAttempts);
    });
    
    // Session events
    this.socket.on('session:created', (session: CrisisSession) => {
      this.session = session;
      this.emit(CrisisEvent.SESSION_STARTED, session);
    });
    
    this.socket.on('session:matched', (volunteer: Volunteer) => {
      if (this.session) {
        this.session.status = 'MATCHED';
        this.session.volunteerId = volunteer.id;
      }
      this.emit(CrisisEvent.SESSION_MATCHED, volunteer);
    });
    
    this.socket.on('session:escalated', (data: any) => {
      if (this.session) {
        this.session.status = 'ESCALATED';
      }
      this.emit(CrisisEvent.SESSION_ESCALATED, data);
    });
    
    this.socket.on('session:ended', (summary: any) => {
      this.session = null;
      this.emit(CrisisEvent.SESSION_ENDED, summary);
    });
    
    // Message events
    this.socket.on('message', (message: CrisisMessage) => {
      if (this.session) {
        this.session.messages.push(message);
      }
      this.emit(CrisisEvent.MESSAGE_RECEIVED, message);
    });
    
    this.socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      this.emit(CrisisEvent.VOLUNTEER_TYPING, data);
    });
    
    // Emergency events
    this.socket.on('emergency:alert', (data: any) => {
      this.emit(CrisisEvent.EMERGENCY_TRIGGERED, data);
    });
    
    this.socket.on('emergency:resources', (resources: any[]) => {
      this.emit(CrisisEvent.EMERGENCY_RESOURCES, resources);
    });
    
    // Metrics updates
    this.socket.on('metrics', (metrics: any) => {
      this.emit(CrisisEvent.METRICS_UPDATE, metrics);
    });
    
    // Queue updates
    this.socket.on('queue:position', (position: number) => {
      this.emit(CrisisEvent.QUEUE_UPDATE, { position });
    });
  }
  
  // Start a crisis session
  async startSession(data: {
    severity: number;
    isAnonymous?: boolean;
    language?: string;
    topic?: string;
  }): Promise<CrisisSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to crisis chat'));
        return;
      }
      
      this.socket.emit('session:start', data, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.session = response.session;
          resolve(response.session);
        }
      });
    });
  }
  
  // Send a message
  sendMessage(content: string, options: {
    isEmergency?: boolean;
    encrypted?: boolean;
  } = {}): void {
    if (!this.session) {
      console.error('No active session');
      return;
    }
    
    const message: CrisisMessage = {
      id: this.generateId(),
      sessionId: this.session.id,
      senderId: this.session.userId,
      senderRole: 'USER',
      content,
      timestamp: new Date(),
      isEmergency: options.isEmergency,
      encrypted: options.encrypted,
    };
    
    if (this.socket?.connected) {
      this.socket.emit('message:send', message, (ack: any) => {
        if (!ack.error) {
          this.emit(CrisisEvent.MESSAGE_SENT, message);
        }
      });
    } else {
      // Queue message for sending when reconnected
      this.messageQueue.push(message);
    }
  }
  
  // Send typing indicator
  setTyping(isTyping: boolean): void {
    if (!this.socket?.connected || !this.session) return;
    
    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    
    this.socket.emit('typing', { isTyping });
    
    // Auto-stop typing after 3 seconds
    if (isTyping) {
      this.typingTimer = setTimeout(() => {
        this.setTyping(false);
      }, 3000);
    }
  }
  
  // Request volunteer match
  requestVolunteer(preferences?: {
    language?: string;
    specialization?: string;
  }): void {
    if (!this.socket?.connected || !this.session) return;
    
    this.socket.emit('volunteer:request', {
      sessionId: this.session.id,
      preferences,
    });
  }
  
  // Trigger emergency escalation
  triggerEmergency(reason: string): void {
    if (!this.socket?.connected || !this.session) return;
    
    this.socket.emit('emergency:trigger', {
      sessionId: this.session.id,
      reason,
      timestamp: new Date(),
    });
  }
  
  // End the session
  endSession(feedback?: {
    rating?: number;
    comment?: string;
  }): void {
    if (!this.socket?.connected || !this.session) return;
    
    this.socket.emit('session:end', {
      sessionId: this.session.id,
      feedback,
    });
    
    this.session = null;
  }
  
  // Get current session
  getSession(): CrisisSession | null {
    return this.session;
  }
  
  // Check connection status
  isConnectedToChat(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
  
  // Disconnect from server
  disconnect(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.session = null;
    this.messageQueue = [];
  }
  
  // Reconnect to server
  reconnect(): void {
    this.disconnect();
    this.connect();
  }
  
  // Private utility methods
  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message.content, {
          isEmergency: message.isEmergency,
          encrypted: message.encrypted,
        });
      }
    }
  }
}

// Export singleton instance for easy use
let crisisChatInstance: CrisisChatClient | null = null;

export function getCrisisChatClient(config?: CrisisChatConfig): CrisisChatClient {
  if (!crisisChatInstance) {
    crisisChatInstance = new CrisisChatClient(config);
  }
  return crisisChatInstance;
}

export default CrisisChatClient;