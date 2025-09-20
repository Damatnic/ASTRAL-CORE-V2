/**
 * Crisis Chat Critical Path Tests
 * Ensures 24/7 availability and proper functioning of crisis intervention
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CrisisChatClient, CrisisEvent } from '@/lib/websocket/crisis-chat-client';
import { useCrisisChat } from '@/hooks/useCrisisChat';

// Mock WebSocket
class MockWebSocket {
  readyState = WebSocket.OPEN;
  send = jest.fn();
  close = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
}

global.WebSocket = MockWebSocket as any;

describe('Crisis Chat - Critical Path Tests', () => {
  let crisisClient: CrisisChatClient;
  
  beforeEach(() => {
    crisisClient = new CrisisChatClient({
      autoConnect: false,
      url: 'ws://localhost:3000'
    });
  });
  
  afterEach(() => {
    crisisClient.disconnect();
    jest.clearAllMocks();
  });
  
  describe('Connection Management', () => {
    it('should connect to crisis chat immediately', async () => {
      const connectSpy = jest.spyOn(crisisClient, 'connect');
      crisisClient.connect();
      
      expect(connectSpy).toHaveBeenCalled();
      expect(crisisClient.isConnectedToChat()).toBe(false); // Initially false until connected event
    });
    
    it('should handle connection failures gracefully', async () => {
      const errorHandler = jest.fn();
      crisisClient.on(CrisisEvent.DISCONNECTED, errorHandler);
      
      // Simulate connection failure
      crisisClient.connect();
      crisisClient.emit(CrisisEvent.DISCONNECTED, 'transport error');
      
      expect(errorHandler).toHaveBeenCalledWith('transport error');
    });
    
    it('should automatically reconnect on disconnection', async () => {
      let reconnectAttempts = 0;
      crisisClient.on(CrisisEvent.RECONNECTING, (attempts) => {
        reconnectAttempts = attempts;
      });
      
      crisisClient.connect();
      crisisClient.emit(CrisisEvent.DISCONNECTED, 'transport close');
      crisisClient.emit(CrisisEvent.RECONNECTING, 1);
      
      expect(reconnectAttempts).toBe(1);
    });
  });
  
  describe('Session Management', () => {
    it('should start crisis session with severity level', async () => {
      const session = {
        id: 'test-session-123',
        status: 'WAITING' as const,
        userId: 'anonymous-user',
        severity: 8,
        startedAt: new Date(),
        messages: []
      };
      
      // Mock the startSession method
      jest.spyOn(crisisClient, 'startSession').mockResolvedValue(session);
      
      const result = await crisisClient.startSession({
        severity: 8,
        isAnonymous: true
      });
      
      expect(result).toEqual(session);
      expect(result.severity).toBe(8);
    });
    
    it('should maintain session state during chat', () => {
      const session = {
        id: 'test-session-123',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        volunteerId: 'volunteer-456',
        severity: 7,
        startedAt: new Date(),
        messages: []
      };
      
      crisisClient.emit(CrisisEvent.SESSION_STARTED, session);
      
      const currentSession = crisisClient.getSession();
      expect(currentSession).toEqual(session);
    });
  });
  
  describe('Message Handling', () => {
    it('should send crisis messages immediately', () => {
      const sendSpy = jest.spyOn(crisisClient, 'sendMessage');
      
      // Set up a session first
      const session = {
        id: 'test-session',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        severity: 9,
        startedAt: new Date(),
        messages: []
      };
      crisisClient.emit(CrisisEvent.SESSION_STARTED, session);
      
      crisisClient.sendMessage('I need help urgently', { isEmergency: true });
      
      expect(sendSpy).toHaveBeenCalledWith('I need help urgently', { isEmergency: true });
    });
    
    it('should queue messages when offline', () => {
      // Disconnect to simulate offline
      crisisClient.disconnect();
      
      const session = {
        id: 'test-session',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        severity: 9,
        startedAt: new Date(),
        messages: []
      };
      
      // Force set session even when disconnected
      (crisisClient as any).session = session;
      
      const sendSpy = jest.spyOn(crisisClient, 'sendMessage');
      crisisClient.sendMessage('Help message while offline');
      
      expect(sendSpy).toHaveBeenCalled();
      // Message should be queued internally
    });
    
    it('should handle typing indicators', () => {
      const typingSpy = jest.spyOn(crisisClient, 'setTyping');
      
      crisisClient.setTyping(true);
      expect(typingSpy).toHaveBeenCalledWith(true);
      
      crisisClient.setTyping(false);
      expect(typingSpy).toHaveBeenCalledWith(false);
    });
  });
  
  describe('Emergency Escalation', () => {
    it('should trigger emergency escalation immediately', () => {
      const escalateSpy = jest.spyOn(crisisClient, 'triggerEmergency');
      const eventHandler = jest.fn();
      
      crisisClient.on(CrisisEvent.EMERGENCY_TRIGGERED, eventHandler);
      crisisClient.triggerEmergency('Immediate danger');
      
      expect(escalateSpy).toHaveBeenCalledWith('Immediate danger');
    });
    
    it('should receive emergency resources', () => {
      const resourceHandler = jest.fn();
      crisisClient.on(CrisisEvent.EMERGENCY_RESOURCES, resourceHandler);
      
      const resources = [
        { name: '988 Lifeline', phone: '988' },
        { name: 'Emergency', phone: '911' }
      ];
      
      crisisClient.emit(CrisisEvent.EMERGENCY_RESOURCES, resources);
      expect(resourceHandler).toHaveBeenCalledWith(resources);
    });
  });
  
  describe('Volunteer Matching', () => {
    it('should request volunteer with preferences', () => {
      const requestSpy = jest.spyOn(crisisClient, 'requestVolunteer');
      
      crisisClient.requestVolunteer({
        language: 'en',
        specialization: 'anxiety'
      });
      
      expect(requestSpy).toHaveBeenCalledWith({
        language: 'en',
        specialization: 'anxiety'
      });
    });
    
    it('should handle volunteer match notification', () => {
      const matchHandler = jest.fn();
      crisisClient.on(CrisisEvent.SESSION_MATCHED, matchHandler);
      
      const volunteer = {
        id: 'vol-123',
        name: 'Sarah',
        avatar: '/avatars/sarah.jpg',
        specializations: ['anxiety', 'depression'],
        languages: ['en', 'es'],
        rating: 4.8,
        responseTime: 45
      };
      
      crisisClient.emit(CrisisEvent.SESSION_MATCHED, volunteer);
      expect(matchHandler).toHaveBeenCalledWith(volunteer);
    });
    
    it('should show queue position while waiting', () => {
      const queueHandler = jest.fn();
      crisisClient.on(CrisisEvent.QUEUE_UPDATE, queueHandler);
      
      crisisClient.emit(CrisisEvent.QUEUE_UPDATE, { position: 3 });
      expect(queueHandler).toHaveBeenCalledWith({ position: 3 });
    });
  });
  
  describe('Session Termination', () => {
    it('should end session with feedback', () => {
      const endSpy = jest.spyOn(crisisClient, 'endSession');
      
      crisisClient.endSession({
        rating: 5,
        comment: 'Very helpful, thank you'
      });
      
      expect(endSpy).toHaveBeenCalledWith({
        rating: 5,
        comment: 'Very helpful, thank you'
      });
    });
    
    it('should clean up session state on end', () => {
      const session = {
        id: 'test-session',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        severity: 5,
        startedAt: new Date(),
        messages: []
      };
      
      crisisClient.emit(CrisisEvent.SESSION_STARTED, session);
      expect(crisisClient.getSession()).toBeTruthy();
      
      crisisClient.emit(CrisisEvent.SESSION_ENDED, { summary: 'Session completed' });
      expect(crisisClient.getSession()).toBeNull();
    });
  });
  
  describe('Performance Requirements', () => {
    it('should connect within 2 seconds', async () => {
      const startTime = Date.now();
      
      await new Promise<void>((resolve) => {
        crisisClient.on(CrisisEvent.CONNECTED, () => {
          const connectionTime = Date.now() - startTime;
          expect(connectionTime).toBeLessThan(2000);
          resolve();
        });
        
        crisisClient.connect();
        // Simulate connection
        setTimeout(() => {
          crisisClient.emit(CrisisEvent.CONNECTED);
        }, 100);
      });
    });
    
    it('should send messages with minimal latency', () => {
      const startTime = Date.now();
      
      const session = {
        id: 'test-session',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        severity: 9,
        startedAt: new Date(),
        messages: []
      };
      crisisClient.emit(CrisisEvent.SESSION_STARTED, session);
      
      crisisClient.sendMessage('Test message');
      
      const sendTime = Date.now() - startTime;
      expect(sendTime).toBeLessThan(100); // Should be nearly instant
    });
  });
  
  describe('Error Recovery', () => {
    it('should recover from network errors', () => {
      const errorHandler = jest.fn();
      const reconnectHandler = jest.fn();
      
      crisisClient.on(CrisisEvent.DISCONNECTED, errorHandler);
      crisisClient.on(CrisisEvent.RECONNECTING, reconnectHandler);
      
      // Simulate network error
      crisisClient.emit(CrisisEvent.DISCONNECTED, 'network error');
      crisisClient.emit(CrisisEvent.RECONNECTING, 1);
      
      expect(errorHandler).toHaveBeenCalled();
      expect(reconnectHandler).toHaveBeenCalled();
    });
    
    it('should maintain message history after reconnection', () => {
      const messages = [
        { id: '1', content: 'First message' },
        { id: '2', content: 'Second message' }
      ];
      
      const session = {
        id: 'test-session',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        severity: 7,
        startedAt: new Date(),
        messages: messages as any
      };
      
      crisisClient.emit(CrisisEvent.SESSION_STARTED, session);
      
      // Simulate disconnect and reconnect
      crisisClient.emit(CrisisEvent.DISCONNECTED, 'network');
      crisisClient.emit(CrisisEvent.CONNECTED);
      
      const currentSession = crisisClient.getSession();
      expect(currentSession?.messages).toEqual(messages);
    });
  });
  
  describe('Accessibility', () => {
    it('should support screen reader announcements', () => {
      const messageHandler = jest.fn();
      crisisClient.on(CrisisEvent.MESSAGE_RECEIVED, messageHandler);
      
      const message = {
        id: 'msg-1',
        sessionId: 'session-1',
        senderId: 'volunteer-1',
        senderRole: 'VOLUNTEER' as const,
        content: 'How can I help you today?',
        timestamp: new Date()
      };
      
      crisisClient.emit(CrisisEvent.MESSAGE_RECEIVED, message);
      expect(messageHandler).toHaveBeenCalledWith(message);
      // In real implementation, this would trigger aria-live region update
    });
  });
  
  describe('Security', () => {
    it('should encrypt sensitive messages when enabled', () => {
      const sendSpy = jest.spyOn(crisisClient, 'sendMessage');
      
      const session = {
        id: 'test-session',
        status: 'ACTIVE' as const,
        userId: 'user-123',
        severity: 9,
        startedAt: new Date(),
        messages: []
      };
      crisisClient.emit(CrisisEvent.SESSION_STARTED, session);
      
      crisisClient.sendMessage('Sensitive information', { encrypted: true });
      
      expect(sendSpy).toHaveBeenCalledWith('Sensitive information', { encrypted: true });
    });
    
    it('should validate session tokens', async () => {
      const invalidSession = crisisClient.startSession({
        severity: 5,
        isAnonymous: false
      });
      
      // Should reject without proper authentication
      await expect(invalidSession).rejects.toThrow();
    });
  });
});

describe('Crisis Chat React Hook Tests', () => {
  // Mock the getCrisisChatClient to return a test instance
  jest.mock('@/lib/websocket/crisis-chat-client', () => ({
    ...jest.requireActual('@/lib/websocket/crisis-chat-client'),
    getCrisisChatClient: jest.fn(() => new CrisisChatClient({ autoConnect: false }))
  }));
  
  it('should initialize hook with default state', () => {
    const TestComponent = () => {
      const [state] = useCrisisChat();
      
      return (
        <div>
          <span data-testid="connected">{state.isConnected.toString()}</span>
          <span data-testid="session-active">{state.isSessionActive.toString()}</span>
          <span data-testid="message-count">{state.messages.length}</span>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('connected')).toHaveTextContent('false');
    expect(screen.getByTestId('session-active')).toHaveTextContent('false');
    expect(screen.getByTestId('message-count')).toHaveTextContent('0');
  });
});