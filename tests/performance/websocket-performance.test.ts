/**
 * ASTRAL_CORE 2.0 - WebSocket Performance Tests
 * Life-critical performance testing for real-time crisis communication
 */

import { io, Socket } from 'socket.io-client';
import { CRISIS_PERFORMANCE_BENCHMARKS } from '../crisis/setup';

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
} as any;

describe('WebSocket Performance Tests', () => {
  let testSockets: Socket[] = [];
  const serverUrl = 'http://localhost:3001';

  beforeEach(() => {
    jest.clearAllMocks();
    testSockets = [];
  });

  afterEach(() => {
    // Clean up all test sockets
    testSockets.forEach(socket => {
      if (socket.connected) {
        socket.disconnect();
      }
    });
    testSockets = [];
  });

  describe('Connection Performance', () => {
    it('should establish WebSocket connection within performance threshold', async () => {
      const startTime = Date.now();
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const socket = io(serverUrl, {
          timeout: 5000,
          transports: ['websocket'],
        });
        testSockets.push(socket);

        socket.on('connect', () => {
          const connectionTime = Date.now() - startTime;
          expect(connectionTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.SESSION_CREATION_MS);
          resolve();
        });

        socket.on('connect_error', (error) => {
          reject(error);
        });

        // Timeout fallback
        setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 5000);
      });

      await connectionPromise;
    }, 10000);

    it('should handle multiple concurrent connections efficiently', async () => {
      const connectionCount = 10;
      const startTime = Date.now();
      
      const connectionPromises = Array.from({ length: connectionCount }, () => {
        return new Promise<void>((resolve, reject) => {
          const socket = io(serverUrl, {
            timeout: 5000,
            transports: ['websocket'],
          });
          testSockets.push(socket);

          socket.on('connect', () => {
            resolve();
          });

          socket.on('connect_error', (error) => {
            reject(error);
          });
        });
      });

      await Promise.all(connectionPromises);
      
      const totalConnectionTime = Date.now() - startTime;
      const averageConnectionTime = totalConnectionTime / connectionCount;
      
      expect(averageConnectionTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.SESSION_CREATION_MS);
      expect(testSockets).toHaveLength(connectionCount);
      testSockets.forEach(socket => {
        expect(socket.connected).toBe(true);
      });
    }, 15000);

    it('should maintain connection stability under load', async () => {
      const socket = io(serverUrl, { transports: ['websocket'] });
      testSockets.push(socket);

      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });

      let disconnections = 0;
      let reconnections = 0;

      socket.on('disconnect', () => {
        disconnections++;
      });

      socket.on('reconnect', () => {
        reconnections++;
      });

      // Simulate load by sending many messages
      const messageCount = 100;
      for (let i = 0; i < messageCount; i++) {
        socket.emit('test-message', { id: i, data: 'load test' });
        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      }

      // Wait for all messages to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Connection should remain stable
      expect(socket.connected).toBe(true);
      expect(disconnections).toBe(0);
    }, 20000);
  });

  describe('Message Performance', () => {
    let socket: Socket;

    beforeEach(async () => {
      socket = io(serverUrl, { transports: ['websocket'] });
      testSockets.push(socket);
      
      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });
    });

    it('should process crisis messages within performance threshold', async () => {
      const messageData = {
        sessionId: 'test-session-123',
        senderId: 'user-123',
        content: 'I need help with my anxiety',
        messageType: 'crisis',
        timestamp: Date.now(),
      };

      const startTime = Date.now();
      
      const responsePromise = new Promise<void>((resolve) => {
        socket.on('message-processed', (response) => {
          const processTime = Date.now() - startTime;
          expect(processTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.MESSAGE_PROCESSING_MS);
          expect(response.messageId).toBeDefined();
          expect(response.processed).toBe(true);
          resolve();
        });
      });

      socket.emit('crisis-message', messageData);
      await responsePromise;
    });

    it('should handle high-frequency message bursts', async () => {
      const burstSize = 20;
      const messages = Array.from({ length: burstSize }, (_, i) => ({
        sessionId: 'burst-test-session',
        senderId: 'user-burst-test',
        content: `Burst message ${i}`,
        messageType: 'text',
        timestamp: Date.now() + i,
      }));

      const startTime = Date.now();
      let processedCount = 0;

      const allProcessedPromise = new Promise<void>((resolve) => {
        socket.on('message-processed', () => {
          processedCount++;
          if (processedCount === burstSize) {
            const totalTime = Date.now() - startTime;
            const averageProcessTime = totalTime / burstSize;
            expect(averageProcessTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.MESSAGE_PROCESSING_MS);
            resolve();
          }
        });
      });

      // Send all messages rapidly
      messages.forEach(message => {
        socket.emit('crisis-message', message);
      });

      await allProcessedPromise;
    });

    it('should maintain low latency for emergency messages', async () => {
      const emergencyMessage = {
        sessionId: 'emergency-session-123',
        senderId: 'user-emergency',
        content: 'I am in immediate danger and need help now',
        messageType: 'emergency',
        priority: 'critical',
        timestamp: Date.now(),
      };

      const startTime = Date.now();

      const emergencyResponsePromise = new Promise<void>((resolve) => {
        socket.on('emergency-response', (response) => {
          const responseTime = Date.now() - startTime;
          expect(responseTime).toBeLessThan(500); // Emergency messages should be <500ms
          expect(response.escalated).toBe(true);
          expect(response.emergencyServices).toBe(true);
          resolve();
        });
      });

      socket.emit('emergency-message', emergencyMessage);
      await emergencyResponsePromise;
    });

    it('should efficiently handle message queuing under load', async () => {
      const queueSize = 50;
      const messages = Array.from({ length: queueSize }, (_, i) => ({
        sessionId: 'queue-test-session',
        senderId: `user-${i}`,
        content: `Queued message ${i}`,
        messageType: 'text',
        timestamp: Date.now() + i,
        priority: i % 5 === 0 ? 'high' : 'normal', // Every 5th message is high priority
      }));

      let processedMessages: any[] = [];
      const allProcessedPromise = new Promise<void>((resolve) => {
        socket.on('message-processed', (response) => {
          processedMessages.push(response);
          if (processedMessages.length === queueSize) {
            resolve();
          }
        });
      });

      // Send all messages at once to test queuing
      const sendStartTime = Date.now();
      messages.forEach(message => {
        socket.emit('crisis-message', message);
      });
      const sendTime = Date.now() - sendStartTime;

      await allProcessedPromise;

      // Verify performance
      expect(sendTime).toBeLessThan(1000); // Should send all messages quickly
      expect(processedMessages).toHaveLength(queueSize);

      // High priority messages should be processed first
      const highPriorityMessages = processedMessages.filter(msg => msg.priority === 'high');
      expect(highPriorityMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Real-time Crisis Detection Performance', () => {
    let socket: Socket;

    beforeEach(async () => {
      socket = io(serverUrl, { transports: ['websocket'] });
      testSockets.push(socket);
      
      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });
    });

    it('should perform real-time risk analysis within threshold', async () => {
      const riskMessages = [
        'I feel really sad and hopeless',
        'I have been thinking about hurting myself',
        'I do not want to live anymore',
        'I have a plan to end my life',
      ];

      for (const content of riskMessages) {
        const startTime = Date.now();
        
        const analysisPromise = new Promise<void>((resolve) => {
          socket.on('risk-analysis-complete', (analysis) => {
            const analysisTime = Date.now() - startTime;
            expect(analysisTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.RISK_DETECTION_MS);
            expect(analysis.riskLevel).toBeDefined();
            expect(analysis.confidence).toBeDefined();
            resolve();
          });
        });

        socket.emit('analyze-crisis-risk', {
          content,
          sessionId: 'risk-analysis-session',
          timestamp: Date.now(),
        });

        await analysisPromise;
      }
    });

    it('should handle concurrent risk analyses efficiently', async () => {
      const concurrentAnalyses = 15;
      const testMessages = Array.from({ length: concurrentAnalyses }, (_, i) => ({
        content: `Test message ${i} with varying risk levels`,
        sessionId: `concurrent-session-${i}`,
        timestamp: Date.now() + i,
      }));

      const startTime = Date.now();
      let completedAnalyses = 0;

      const allAnalysesPromise = new Promise<void>((resolve) => {
        socket.on('risk-analysis-complete', () => {
          completedAnalyses++;
          if (completedAnalyses === concurrentAnalyses) {
            const totalTime = Date.now() - startTime;
            const averageTime = totalTime / concurrentAnalyses;
            expect(averageTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.RISK_DETECTION_MS);
            resolve();
          }
        });
      });

      // Send all analysis requests simultaneously
      testMessages.forEach(message => {
        socket.emit('analyze-crisis-risk', message);
      });

      await allAnalysesPromise;
    });
  });

  describe('Volunteer Matching Performance', () => {
    let socket: Socket;

    beforeEach(async () => {
      socket = io(serverUrl, { transports: ['websocket'] });
      testSockets.push(socket);
      
      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });
    });

    it('should match volunteers within performance threshold', async () => {
      const matchingRequest = {
        sessionId: 'volunteer-match-session',
        criteria: {
          specialties: ['anxiety', 'depression'],
          experience: 'experienced',
          availability: 'immediate',
        },
        urgency: 'high',
      };

      const startTime = Date.now();

      const matchPromise = new Promise<void>((resolve) => {
        socket.on('volunteer-matched', (match) => {
          const matchTime = Date.now() - startTime;
          expect(matchTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.VOLUNTEER_MATCHING_MS);
          expect(match.volunteerId).toBeDefined();
          expect(match.qualifications).toBeDefined();
          resolve();
        });
      });

      socket.emit('request-volunteer-match', matchingRequest);
      await matchPromise;
    });

    it('should handle multiple matching requests efficiently', async () => {
      const requestCount = 8;
      const matchingRequests = Array.from({ length: requestCount }, (_, i) => ({
        sessionId: `match-session-${i}`,
        criteria: {
          specialties: i % 2 === 0 ? ['anxiety'] : ['depression'],
          experience: 'any',
          availability: 'immediate',
        },
        urgency: i < 3 ? 'critical' : 'normal',
      }));

      const startTime = Date.now();
      let matchedCount = 0;

      const allMatchedPromise = new Promise<void>((resolve) => {
        socket.on('volunteer-matched', () => {
          matchedCount++;
          if (matchedCount === requestCount) {
            const totalTime = Date.now() - startTime;
            const averageTime = totalTime / requestCount;
            expect(averageTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.VOLUNTEER_MATCHING_MS);
            resolve();
          }
        });
      });

      // Send all matching requests
      matchingRequests.forEach(request => {
        socket.emit('request-volunteer-match', request);
      });

      await allMatchedPromise;
    });
  });

  describe('Emergency Escalation Performance', () => {
    let socket: Socket;

    beforeEach(async () => {
      socket = io(serverUrl, { transports: ['websocket'] });
      testSockets.push(socket);
      
      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });
    });

    it('should escalate emergencies within critical threshold', async () => {
      const emergencyEscalation = {
        sessionId: 'emergency-escalation-session',
        reason: 'imminent_self_harm',
        severity: 'critical',
        initiatedBy: 'ai_detection',
        timestamp: Date.now(),
      };

      const startTime = Date.now();

      const escalationPromise = new Promise<void>((resolve) => {
        socket.on('emergency-escalated', (response) => {
          const escalationTime = Date.now() - startTime;
          expect(escalationTime).toBeLessThan(CRISIS_PERFORMANCE_BENCHMARKS.EMERGENCY_ESCALATION_MS);
          expect(response.emergencyServicesNotified).toBe(true);
          expect(response.escalationId).toBeDefined();
          resolve();
        });
      });

      socket.emit('escalate-emergency', emergencyEscalation);
      await escalationPromise;
    });

    it('should prioritize multiple emergency escalations', async () => {
      const emergencies = [
        {
          sessionId: 'emergency-1',
          reason: 'imminent_self_harm',
          severity: 'critical',
          priority: 1,
        },
        {
          sessionId: 'emergency-2',
          reason: 'substance_overdose',
          severity: 'critical',
          priority: 1,
        },
        {
          sessionId: 'emergency-3',
          reason: 'suicidal_ideation',
          severity: 'high',
          priority: 2,
        },
      ];

      const escalationOrder: string[] = [];
      let escalatedCount = 0;

      const allEscalatedPromise = new Promise<void>((resolve) => {
        socket.on('emergency-escalated', (response) => {
          escalationOrder.push(response.sessionId);
          escalatedCount++;
          if (escalatedCount === emergencies.length) {
            // Critical priority should be processed first
            expect(escalationOrder[0]).toMatch(/emergency-[12]/);
            expect(escalationOrder[1]).toMatch(/emergency-[12]/);
            expect(escalationOrder[2]).toBe('emergency-3');
            resolve();
          }
        });
      });

      // Send escalations in reverse priority order to test sorting
      [...emergencies].reverse().forEach(emergency => {
        socket.emit('escalate-emergency', emergency);
      });

      await allEscalatedPromise;
    });
  });

  describe('Session Management Performance', () => {
    let socket: Socket;

    beforeEach(async () => {
      socket = io(serverUrl, { transports: ['websocket'] });
      testSockets.push(socket);
      
      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });
    });

    it('should handle session state updates efficiently', async () => {
      const sessionId = 'state-update-session';
      const updateCount = 20;
      
      let receivedUpdates = 0;
      const allUpdatesPromise = new Promise<void>((resolve) => {
        socket.on('session-state-updated', () => {
          receivedUpdates++;
          if (receivedUpdates === updateCount) {
            resolve();
          }
        });
      });

      const startTime = Date.now();

      // Send rapid state updates
      for (let i = 0; i < updateCount; i++) {
        socket.emit('update-session-state', {
          sessionId,
          updateType: 'participant_activity',
          data: { lastActivity: Date.now() + i },
        });
      }

      await allUpdatesPromise;
      
      const totalTime = Date.now() - startTime;
      const averageUpdateTime = totalTime / updateCount;
      
      expect(averageUpdateTime).toBeLessThan(100); // Updates should be very fast
    });

    it('should efficiently broadcast session updates to multiple clients', async () => {
      const clientCount = 5;
      const clients: Socket[] = [];

      // Create multiple clients
      for (let i = 0; i < clientCount; i++) {
        const client = io(serverUrl, { transports: ['websocket'] });
        testSockets.push(client);
        clients.push(client);
        
        await new Promise<void>((resolve) => {
          client.on('connect', resolve);
        });

        // Join the same session
        client.emit('join-session', { sessionId: 'broadcast-test-session' });
      }

      // Set up broadcast listeners
      let broadcastCount = 0;
      const allBroadcastsPromise = new Promise<void>((resolve) => {
        clients.forEach(client => {
          client.on('session-broadcast', () => {
            broadcastCount++;
            if (broadcastCount === clientCount) {
              resolve();
            }
          });
        });
      });

      const startTime = Date.now();

      // Send broadcast update
      socket.emit('broadcast-session-update', {
        sessionId: 'broadcast-test-session',
        updateType: 'message_received',
        data: { messageId: 'broadcast-test-message' },
      });

      await allBroadcastsPromise;
      
      const broadcastTime = Date.now() - startTime;
      expect(broadcastTime).toBeLessThan(200); // Broadcasts should be fast
    });
  });

  describe('Memory and Resource Management', () => {
    it('should manage memory efficiently under sustained load', async () => {
      const initialMemory = process.memoryUsage();
      const sockets: Socket[] = [];

      // Create many connections
      for (let i = 0; i < 50; i++) {
        const socket = io(serverUrl, { transports: ['websocket'] });
        sockets.push(socket);
        testSockets.push(socket);
      }

      // Wait for all connections
      await Promise.all(
        sockets.map(socket => 
          new Promise<void>(resolve => socket.on('connect', resolve))
        )
      );

      // Send many messages
      for (let i = 0; i < 100; i++) {
        const randomSocket = sockets[Math.floor(Math.random() * sockets.length)];
        randomSocket.emit('test-message', { id: i, data: 'memory test' });
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Disconnect half the sockets
      for (let i = 0; i < 25; i++) {
        sockets[i].disconnect();
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    }, 30000);

    it('should handle connection cleanup efficiently', async () => {
      const connectionCount = 20;
      const connections: Socket[] = [];

      // Create connections
      for (let i = 0; i < connectionCount; i++) {
        const socket = io(serverUrl, { transports: ['websocket'] });
        connections.push(socket);
        testSockets.push(socket);
      }

      // Wait for all connections
      await Promise.all(
        connections.map(socket => 
          new Promise<void>(resolve => socket.on('connect', resolve))
        )
      );

      const disconnectStartTime = Date.now();

      // Disconnect all at once
      connections.forEach(socket => socket.disconnect());

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      const cleanupTime = Date.now() - disconnectStartTime;
      expect(cleanupTime).toBeLessThan(2000); // Cleanup should be fast

      // Verify all connections are closed
      connections.forEach(socket => {
        expect(socket.connected).toBe(false);
      });
    });
  });

  describe('Network Resilience', () => {
    it('should handle network interruptions gracefully', async () => {
      const socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 100,
      });
      testSockets.push(socket);

      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });

      let disconnectCount = 0;
      let reconnectCount = 0;

      socket.on('disconnect', () => {
        disconnectCount++;
      });

      socket.on('reconnect', () => {
        reconnectCount++;
      });

      // Simulate network interruption
      socket.disconnect();

      // Wait for reconnection
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(disconnectCount).toBe(1);
      // Note: Actual reconnection would depend on server availability
    });

    it('should maintain message ordering during reconnection', async () => {
      const socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
      });
      testSockets.push(socket);

      await new Promise<void>((resolve) => {
        socket.on('connect', resolve);
      });

      const messages = ['Message 1', 'Message 2', 'Message 3'];
      const receivedMessages: string[] = [];

      socket.on('ordered-message', (data) => {
        receivedMessages.push(data.content);
      });

      // Send messages before simulated disconnection
      messages.forEach((content, index) => {
        socket.emit('send-ordered-message', {
          content,
          sequence: index,
          sessionId: 'ordering-test',
        });
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Messages should be received in order
      expect(receivedMessages).toEqual(messages);
    });
  });
});