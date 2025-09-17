/**
 * ASTRAL_CORE 2.0 - Crisis WebSocket React Hook
 * 
 * LIFE-CRITICAL REAL-TIME COMMUNICATION HOOK
 * This React hook provides easy access to real-time crisis communication.
 * Handles connection management, message handling, and emergency escalation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CrisisWebSocketClient, ConnectionConfig, ConnectionState } from '../CrisisWebSocketClient';
import { CrisisMessage, EmergencyAlert } from '../CrisisWebSocketServer';

export interface UseCrisisWebSocketOptions {
  sessionId: string;
  userType: 'ANONYMOUS_USER' | 'VOLUNTEER' | 'ADMIN';
  serverUrl?: string;
  autoConnect?: boolean;
  onMessage?: (message: CrisisMessage) => void;
  onEmergencyAlert?: (alert: EmergencyAlert) => void;
  onConnectionChange?: (state: ConnectionState) => void;
}

export interface CrisisWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  messages: CrisisMessage[];
  emergencyAlerts: EmergencyAlert[];
  error: string | null;
  latency: number;
}

export interface CrisisWebSocketActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (content: string, urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency') => void;
  sendTyping: (isTyping: boolean) => void;
  escalateEmergency: (level: 'HIGH' | 'CRITICAL' | 'IMMEDIATE', message: string) => void;
  updateVolunteerStatus: (status: string, availabilityLevel: number) => void;
  clearMessages: () => void;
  clearAlerts: () => void;
}

export function useCrisisWebSocket(options: UseCrisisWebSocketOptions): [CrisisWebSocketState, CrisisWebSocketActions] {
  const {
    sessionId,
    userType,
    serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
    autoConnect = true,
    onMessage,
    onEmergencyAlert,
    onConnectionChange,
  } = options;

  // State
  const [state, setState] = useState<CrisisWebSocketState>({
    isConnected: false,
    isConnecting: false,
    connectionState: {
      status: 'disconnected',
      latency: 0,
      reconnectCount: 0,
    },
    messages: [],
    emergencyAlerts: [],
    error: null,
    latency: 0,
  });

  // WebSocket client ref
  const clientRef = useRef<CrisisWebSocketClient | null>(null);
  const mountedRef = useRef(true);

  // Initialize WebSocket client
  useEffect(() => {
    const config: ConnectionConfig = {
      serverUrl,
      sessionId,
      userType,
      reconnectAttempts: 10,
      reconnectDelay: 2000,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
    };

    clientRef.current = new CrisisWebSocketClient(config);

    // Set up event listeners
    const client = clientRef.current;

    const handleConnected = () => {
      if (!mountedRef.current) return;
      console.log('🔗 Crisis WebSocket connected');
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        connectionState: client.getState(),
      }));

      // Request notification permission for emergency alerts
      client.requestNotificationPermission().catch(console.warn);
    };

    const handleDisconnected = (data: any) => {
      if (!mountedRef.current) return;
      console.log('🔌 Crisis WebSocket disconnected', data);
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: data.intentional ? false : true,
        connectionState: client.getState(),
      }));
    };

    const handleCrisisMessage = (message: CrisisMessage) => {
      if (!mountedRef.current) return;
      console.log('💬 Crisis message received:', message.id);
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));

      // Call external handler
      onMessage?.(message);

      // Handle emergency messages with special treatment
      if (message.urgencyLevel === 'emergency') {
        // Trigger browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Crisis Emergency Message', {
            body: message.content.substring(0, 100) + '...',
            icon: '/crisis-icon.png',
            tag: 'crisis-message',
            requireInteraction: true,
          });
        }

        // Emit screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = 'Emergency crisis message received';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }
    };

    const handleEmergencyAlert = (alert: EmergencyAlert) => {
      if (!mountedRef.current) return;
      console.log('🚨 Emergency alert received:', alert.id, alert.level);
      
      setState(prev => ({
        ...prev,
        emergencyAlerts: [...prev.emergencyAlerts, alert],
      }));

      // Call external handler
      onEmergencyAlert?.(alert);

      // Trigger browser notification for emergency alerts
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 ${alert.level} Emergency Alert`, {
          body: alert.message,
          icon: '/crisis-icon.png',
          tag: 'emergency-alert',
          requireInteraction: true,
          silent: false,
        });
      }

      // Play audio alert for emergency (if user has interacted with page)
      try {
        const audio = new Audio('/emergency-alert.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Audio play failed (probably no user interaction yet)
          console.log('Emergency audio alert blocked - requires user interaction');
        });
      } catch (error) {
        console.warn('Emergency audio alert failed:', error);
      }

      // Screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.textContent = `${alert.level} emergency alert: ${alert.message}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 3000);
    };

    const handleStateChange = (connectionState: ConnectionState) => {
      if (!mountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        connectionState,
        latency: connectionState.latency,
        isConnecting: connectionState.status === 'connecting' || connectionState.status === 'reconnecting',
      }));

      onConnectionChange?.(connectionState);
    };

    const handleError = (error: any) => {
      if (!mountedRef.current) return;
      console.error('Crisis WebSocket error:', error);
      
      setState(prev => ({
        ...prev,
        error: error.message || 'Connection error',
        isConnecting: false,
      }));
    };

    // Attach event listeners
    client.on('connected', handleConnected);
    client.on('disconnected', handleDisconnected);
    client.on('crisis_message', handleCrisisMessage);
    client.on('emergency_alert', handleEmergencyAlert);
    client.on('state_change', handleStateChange);
    client.on('error', handleError);

    // Auto-connect if requested
    if (autoConnect) {
      setState(prev => ({ ...prev, isConnecting: true }));
      client.connect().catch((error) => {
        console.error('Auto-connect failed:', error);
        setState(prev => ({
          ...prev,
          error: error.message,
          isConnecting: false,
        }));
      });
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      client.removeAllListeners();
      client.disconnect();
    };
  }, [sessionId, userType, serverUrl, autoConnect, onMessage, onEmergencyAlert, onConnectionChange]);

  // Actions
  const connect = useCallback(async () => {
    if (!clientRef.current) return;
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      await clientRef.current.connect();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (!clientRef.current) return;
    clientRef.current.disconnect();
  }, []);

  const sendMessage = useCallback((content: string, urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'medium') => {
    if (!clientRef.current || !state.isConnected) {
      console.warn('Cannot send message: not connected');
      return;
    }

    console.log(`📤 Sending crisis message: ${urgencyLevel} urgency`);
    clientRef.current.sendCrisisMessage(content, urgencyLevel);
  }, [state.isConnected]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!clientRef.current || !state.isConnected) return;
    clientRef.current.sendTypingIndicator(isTyping);
  }, [state.isConnected]);

  const escalateEmergency = useCallback((level: 'HIGH' | 'CRITICAL' | 'IMMEDIATE', message: string) => {
    if (!clientRef.current) {
      console.error('Cannot escalate: WebSocket client not available');
      return;
    }

    console.log(`🚨 Escalating emergency: ${level}`);
    clientRef.current.escalateEmergency(level, message);
  }, []);

  const updateVolunteerStatus = useCallback((status: string, availabilityLevel: number) => {
    if (!clientRef.current || userType !== 'VOLUNTEER') return;
    clientRef.current.updateVolunteerStatus(status, availabilityLevel);
  }, [userType]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  const clearAlerts = useCallback(() => {
    setState(prev => ({ ...prev, emergencyAlerts: [] }));
  }, []);

  const actions: CrisisWebSocketActions = {
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    escalateEmergency,
    updateVolunteerStatus,
    clearMessages,
    clearAlerts,
  };

  return [state, actions];
}

export default useCrisisWebSocket;