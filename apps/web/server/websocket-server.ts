import { Server } from 'socket.io';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

interface Session {
  roomId: string;
  userId: string;
  volunteerId?: string;
  status: 'waiting' | 'active' | 'escalated' | 'closed';
  urgencyLevel: number;
  createdAt: Date;
  messages: Message[];
}

interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'volunteer' | 'system';
  metadata?: any;
}

interface Volunteer {
  id: string;
  socketId: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  activeRooms: string[];
  specialties: string[];
}

class CrisisWebSocketServer {
  private io: SocketIOServer;
  private sessions: Map<string, Session> = new Map();
  private volunteers: Map<string, Volunteer> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private waitingQueue: string[] = []; // roomIds waiting for volunteers

  constructor(port: number = 3001) {
    const httpServer = createServer();
    
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
    
    httpServer.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`);
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`New connection: ${socket.id}`);
      
      // Authentication
      const token = socket.handshake.auth.token;
      const userId = this.authenticateUser(token);
      
      if (userId) {
        this.userSockets.set(userId, socket.id);
        socket.data.userId = userId;
      }

      // Handle room joining
      socket.on('join_room', async (data: { roomId: string; userType: string }) => {
        const { roomId, userType } = data;
        
        socket.join(roomId);
        
        if (userType === 'user') {
          // Create new session
          const session: Session = {
            roomId,
            userId: socket.data.userId || `anonymous_${socket.id}`,
            status: 'waiting',
            urgencyLevel: 5,
            createdAt: new Date(),
            messages: [],
          };
          
          this.sessions.set(roomId, session);
          this.waitingQueue.push(roomId);
          
          // Send system message
          this.sendSystemMessage(roomId, 'You\'ve been connected to crisis support. A volunteer will be with you shortly.');
          
          // Try to match with available volunteer
          this.matchVolunteer(roomId);
          
          socket.emit('room_joined', session);
        } else if (userType === 'volunteer') {
          const session = this.sessions.get(roomId);
          if (session && session.status === 'waiting') {
            session.volunteerId = socket.data.userId;
            session.status = 'active';
            
            // Remove from waiting queue
            const queueIndex = this.waitingQueue.indexOf(roomId);
            if (queueIndex > -1) {
              this.waitingQueue.splice(queueIndex, 1);
            }
            
            // Notify both parties
            this.io.to(roomId).emit('volunteer_joined', {
              roomId,
              volunteerId: session.volunteerId,
              volunteerName: `Counselor ${session.volunteerId}`,
            });
            
            this.sendSystemMessage(roomId, 'A crisis counselor has joined the chat.');
          }
        }
      });

      // Handle messages
      socket.on('send_message', (data: Partial<Message>) => {
        const { roomId, content, metadata } = data;
        
        if (!roomId || !content) return;
        
        const session = this.sessions.get(roomId);
        if (!session) return;
        
        const message: Message = {
          id: this.generateId(),
          roomId,
          userId: socket.data.userId || socket.id,
          content,
          timestamp: new Date(),
          type: session.volunteerId === socket.data.userId ? 'volunteer' : 'user',
          metadata,
        };
        
        session.messages.push(message);
        
        // Check for crisis keywords
        if (this.detectCrisisKeywords(content)) {
          this.handleCrisisDetection(roomId, content);
        }
        
        // Broadcast to room
        this.io.to(roomId).emit('message', message);
      });

      // Handle typing indicator
      socket.on('typing_indicator', (data: { roomId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('typing', {
          roomId: data.roomId,
          userId: socket.data.userId || socket.id,
          isTyping: data.isTyping,
        });
      });

      // Handle volunteer request
      socket.on('request_volunteer', (data: { urgencyLevel: number; category?: string }) => {
        const roomId = this.generateRoomId();
        socket.emit('room_created', { roomId });
        
        // Auto-join the room
        socket.emit('join_room', { roomId, userType: 'user' });
      });

      // Handle emergency escalation
      socket.on('escalate_emergency', (data: { roomId: string; reason: string }) => {
        const session = this.sessions.get(data.roomId);
        if (session) {
          session.status = 'escalated';
          
          // Notify all in room
          this.io.to(data.roomId).emit('escalation_triggered', {
            roomId: data.roomId,
            reason: data.reason,
          });
          
          // Send emergency resources
          socket.emit('emergency_resources', {
            phone: '988',
            text: '741741',
            localEmergency: '911',
          });
          
          this.sendSystemMessage(
            data.roomId,
            'This conversation has been escalated. Emergency resources have been provided. If you\'re in immediate danger, please call 911.'
          );
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Disconnected: ${socket.id}`);
        
        // Clean up user socket mapping
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            break;
          }
        }
        
        // Handle volunteer disconnection
        for (const [volunteerId, volunteer] of this.volunteers.entries()) {
          if (volunteer.socketId === socket.id) {
            volunteer.status = 'offline';
            
            // Notify active rooms
            volunteer.activeRooms.forEach(roomId => {
              this.sendSystemMessage(
                roomId,
                'Your counselor has disconnected. We\'re connecting you with another volunteer.'
              );
              
              const session = this.sessions.get(roomId);
              if (session) {
                session.status = 'waiting';
                session.volunteerId = undefined;
                this.waitingQueue.push(roomId);
                this.matchVolunteer(roomId);
              }
            });
            
            break;
          }
        }
      });

      // Leave room
      socket.on('leave_room', (data: { roomId: string }) => {
        socket.leave(data.roomId);
        
        const session = this.sessions.get(data.roomId);
        if (session && session.userId === socket.data.userId) {
          session.status = 'closed';
          this.io.to(data.roomId).emit('room_closed', data.roomId);
        }
      });
    });
  }

  private authenticateUser(token: string | undefined): string | null {
    // TODO: Implement actual authentication
    if (!token) return null;
    
    // For now, return a mock user ID
    return `user_${token.substring(0, 8)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateRoomId(): string {
    return `room_${this.generateId()}`;
  }

  private sendSystemMessage(roomId: string, content: string) {
    const message: Message = {
      id: this.generateId(),
      roomId,
      userId: 'system',
      content,
      timestamp: new Date(),
      type: 'system',
    };
    
    const session = this.sessions.get(roomId);
    if (session) {
      session.messages.push(message);
    }
    
    this.io.to(roomId).emit('message', message);
  }

  private detectCrisisKeywords(content: string): boolean {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'self harm', 'hurt myself', 'overdose', 'pills',
      'jump off', 'hang myself', 'cut myself', 'weapon',
      'no reason to live', 'better off dead', 'goodbye forever'
    ];
    
    const lowerContent = content.toLowerCase();
    return crisisKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private handleCrisisDetection(roomId: string, content: string) {
    const session = this.sessions.get(roomId);
    if (!session) return;
    
    // Increase urgency level
    session.urgencyLevel = 10;
    
    // Notify volunteer
    this.io.to(roomId).emit('crisis_alert', {
      roomId,
      content,
      urgencyLevel: 10,
      timestamp: new Date(),
    });
    
    // Send immediate support message
    this.sendSystemMessage(
      roomId,
      '⚠️ We\'re very concerned about what you\'re sharing. Your life matters and help is available right now. Please consider calling 988 or 911 if you\'re in immediate danger.'
    );
  }

  private async matchVolunteer(roomId: string) {
    // Find available volunteer
    const availableVolunteer = Array.from(this.volunteers.values()).find(
      v => v.status === 'available' && v.activeRooms.length < 3
    );
    
    if (availableVolunteer) {
      // Notify volunteer
      const volunteerSocket = this.io.sockets.sockets.get(availableVolunteer.socketId);
      if (volunteerSocket) {
        volunteerSocket.emit('new_session_available', {
          roomId,
          urgencyLevel: this.sessions.get(roomId)?.urgencyLevel,
        });
      }
    } else {
      // No volunteers available, keep in queue
      setTimeout(() => {
        const session = this.sessions.get(roomId);
        if (session && session.status === 'waiting') {
          this.sendSystemMessage(
            roomId,
            'All counselors are currently helping others. You\'re in queue and will be connected soon. If this is an emergency, please call 988.'
          );
        }
      }, 30000); // Send message after 30 seconds of waiting
    }
  }

  // Admin methods
  public getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  public getWaitingQueue(): string[] {
    return this.waitingQueue;
  }

  public getVolunteers(): Volunteer[] {
    return Array.from(this.volunteers.values());
  }

  public getMetrics() {
    return {
      activeSessions: this.getActiveSessions().length,
      waitingInQueue: this.waitingQueue.length,
      availableVolunteers: Array.from(this.volunteers.values()).filter(v => v.status === 'available').length,
      totalMessages: Array.from(this.sessions.values()).reduce((acc, s) => acc + s.messages.length, 0),
    };
  }
}

// Initialize server if running directly
if (require.main === module) {
  const port = parseInt(process.env.WEBSOCKET_PORT || '3001');
  new CrisisWebSocketServer(port);
}

export default CrisisWebSocketServer;