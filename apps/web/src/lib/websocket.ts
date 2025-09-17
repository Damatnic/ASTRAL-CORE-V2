import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'volunteer' | 'system' | 'bot';
  metadata?: {
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    sentiment?: number;
    keywords?: string[];
    escalated?: boolean;
  };
}

export interface Room {
  id: string;
  userId: string;
  volunteerId?: string;
  status: 'waiting' | 'active' | 'escalated' | 'closed';
  createdAt: Date;
  urgencyLevel: number;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
                  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://localhost:3001');

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      auth: {
        token: this.getAuthToken(),
      },
    });

    this.setupEventHandlers();
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('session_token');
    }
    return null;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('connection_failed', { error: error.message });
      }
    });

    // Message events
    this.socket.on('message', (data: Message) => {
      this.emit('message', data);
    });

    this.socket.on('typing', (data: TypingIndicator) => {
      this.emit('typing', data);
    });

    this.socket.on('room_joined', (room: Room) => {
      this.emit('room_joined', room);
    });

    this.socket.on('volunteer_joined', (data: { roomId: string; volunteerId: string; volunteerName: string }) => {
      this.emit('volunteer_joined', data);
    });

    this.socket.on('room_closed', (roomId: string) => {
      this.emit('room_closed', roomId);
    });

    this.socket.on('escalation_triggered', (data: { roomId: string; reason: string }) => {
      this.emit('escalation_triggered', data);
    });

    // Crisis-specific events
    this.socket.on('crisis_alert', (data: any) => {
      this.emit('crisis_alert', data);
    });

    this.socket.on('emergency_resources', (data: any) => {
      this.emit('emergency_resources', data);
    });
  }

  // Public methods
  public connect() {
    if (!this.socket || !this.socket.connected) {
      this.initialize();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinRoom(roomId: string, userType: 'user' | 'volunteer' = 'user') {
    if (!this.socket) return;
    
    this.socket.emit('join_room', {
      roomId,
      userType,
      timestamp: new Date(),
    });
  }

  public leaveRoom(roomId: string) {
    if (!this.socket) return;
    
    this.socket.emit('leave_room', {
      roomId,
      timestamp: new Date(),
    });
  }

  public sendMessage(roomId: string, content: string, metadata?: any) {
    if (!this.socket) return;

    const message: Partial<Message> = {
      roomId,
      content,
      timestamp: new Date(),
      metadata,
    };

    this.socket.emit('send_message', message);
  }

  public sendTypingIndicator(roomId: string, isTyping: boolean) {
    if (!this.socket) return;

    this.socket.emit('typing_indicator', {
      roomId,
      isTyping,
      timestamp: new Date(),
    });
  }

  public requestVolunteer(urgencyLevel: number, category?: string) {
    if (!this.socket) return;

    this.socket.emit('request_volunteer', {
      urgencyLevel,
      category,
      timestamp: new Date(),
    });
  }

  public escalateToEmergency(roomId: string, reason: string) {
    if (!this.socket) return;

    this.socket.emit('escalate_emergency', {
      roomId,
      reason,
      timestamp: new Date(),
    });
  }

  // Event subscription
  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  public off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Singleton instance
  private static instance: WebSocketService;

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
}

export default WebSocketService.getInstance();