import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  CrisisChatClient, 
  CrisisMessage, 
  CrisisSession, 
  Volunteer,
  CrisisEvent,
  getCrisisChatClient
} from '@/lib/websocket/crisis-chat-client';

// Hook state interface
interface CrisisChatState {
  // Connection state
  isConnected: boolean;
  isReconnecting: boolean;
  connectionError: Error | null;
  
  // Session state
  session: CrisisSession | null;
  isSessionActive: boolean;
  queuePosition: number | null;
  
  // Messages
  messages: CrisisMessage[];
  unreadCount: number;
  
  // Volunteer state
  volunteer: Volunteer | null;
  volunteerTyping: boolean;
  
  // Emergency state
  isEmergency: boolean;
  emergencyResources: any[];
  
  // Metrics
  metrics: {
    averageWaitTime?: number;
    volunteersOnline?: number;
    activeSessions?: number;
  };
}

// Hook actions interface
interface CrisisChatActions {
  // Connection
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Session
  startSession: (data: {
    severity: number;
    isAnonymous?: boolean;
    language?: string;
    topic?: string;
  }) => Promise<void>;
  endSession: (feedback?: { rating?: number; comment?: string }) => void;
  
  // Messaging
  sendMessage: (content: string, options?: { isEmergency?: boolean }) => void;
  setTyping: (isTyping: boolean) => void;
  markMessagesAsRead: () => void;
  
  // Emergency
  triggerEmergency: (reason: string) => void;
  
  // Volunteer
  requestVolunteer: (preferences?: { language?: string; specialization?: string }) => void;
}

// Custom hook for crisis chat
export function useCrisisChat(config?: {
  autoConnect?: boolean;
  sessionId?: string;
  token?: string;
}): [CrisisChatState, CrisisChatActions] {
  const clientRef = useRef<CrisisChatClient | null>(null);
  
  // State management
  const [state, setState] = useState<CrisisChatState>({
    // Connection
    isConnected: false,
    isReconnecting: false,
    connectionError: null,
    
    // Session
    session: null,
    isSessionActive: false,
    queuePosition: null,
    
    // Messages
    messages: [],
    unreadCount: 0,
    
    // Volunteer
    volunteer: null,
    volunteerTyping: false,
    
    // Emergency
    isEmergency: false,
    emergencyResources: [],
    
    // Metrics
    metrics: {},
  });
  
  // Initialize client
  useEffect(() => {
    const client = getCrisisChatClient({
      autoConnect: config?.autoConnect !== false,
      auth: {
        token: config?.token,
        sessionId: config?.sessionId,
      },
    });
    
    clientRef.current = client;
    
    // Setup event listeners
    const handleConnected = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        connectionError: null,
      }));
    };
    
    const handleDisconnected = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
      }));
    };
    
    const handleReconnecting = (attempts: number) => {
      setState(prev => ({
        ...prev,
        isReconnecting: true,
      }));
    };
    
    const handleSessionStarted = (session: CrisisSession) => {
      setState(prev => ({
        ...prev,
        session,
        isSessionActive: true,
        messages: session.messages || [],
      }));
    };
    
    const handleSessionMatched = (volunteer: Volunteer) => {
      setState(prev => ({
        ...prev,
        volunteer,
        queuePosition: null,
      }));
    };
    
    const handleSessionEnded = () => {
      setState(prev => ({
        ...prev,
        session: null,
        isSessionActive: false,
        volunteer: null,
        messages: [],
      }));
    };
    
    const handleMessageReceived = (message: CrisisMessage) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
        unreadCount: prev.unreadCount + 1,
      }));
      
      // Play notification sound if available
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/sounds/message-notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {
            // Ignore audio play errors (e.g., autoplay policy)
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    };
    
    const handleVolunteerTyping = ({ isTyping }: { userId: string; isTyping: boolean }) => {
      setState(prev => ({
        ...prev,
        volunteerTyping: isTyping,
      }));
    };
    
    const handleEmergencyTriggered = (data: any) => {
      setState(prev => ({
        ...prev,
        isEmergency: true,
      }));
    };
    
    const handleEmergencyResources = (resources: any[]) => {
      setState(prev => ({
        ...prev,
        emergencyResources: resources,
      }));
    };
    
    const handleQueueUpdate = ({ position }: { position: number }) => {
      setState(prev => ({
        ...prev,
        queuePosition: position,
      }));
    };
    
    const handleMetricsUpdate = (metrics: any) => {
      setState(prev => ({
        ...prev,
        metrics: {
          averageWaitTime: metrics.averageResponseTime,
          volunteersOnline: metrics.volunteersOnline,
          activeSessions: metrics.activeCrises,
        },
      }));
    };
    
    // Attach listeners
    client.on(CrisisEvent.CONNECTED, handleConnected);
    client.on(CrisisEvent.DISCONNECTED, handleDisconnected);
    client.on(CrisisEvent.RECONNECTING, handleReconnecting);
    client.on(CrisisEvent.SESSION_STARTED, handleSessionStarted);
    client.on(CrisisEvent.SESSION_MATCHED, handleSessionMatched);
    client.on(CrisisEvent.SESSION_ENDED, handleSessionEnded);
    client.on(CrisisEvent.MESSAGE_RECEIVED, handleMessageReceived);
    client.on(CrisisEvent.VOLUNTEER_TYPING, handleVolunteerTyping);
    client.on(CrisisEvent.EMERGENCY_TRIGGERED, handleEmergencyTriggered);
    client.on(CrisisEvent.EMERGENCY_RESOURCES, handleEmergencyResources);
    client.on(CrisisEvent.QUEUE_UPDATE, handleQueueUpdate);
    client.on(CrisisEvent.METRICS_UPDATE, handleMetricsUpdate);
    
    // Cleanup
    return () => {
      client.removeAllListeners();
      if (config?.autoConnect === false) {
        client.disconnect();
      }
    };
  }, [config?.autoConnect, config?.sessionId, config?.token]);
  
  // Action handlers
  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);
  
  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);
  
  const reconnect = useCallback(() => {
    clientRef.current?.reconnect();
  }, []);
  
  const startSession = useCallback(async (data: {
    severity: number;
    isAnonymous?: boolean;
    language?: string;
    topic?: string;
  }) => {
    try {
      const session = await clientRef.current?.startSession(data);
      if (session) {
        setState(prev => ({
          ...prev,
          session,
          isSessionActive: true,
          messages: [],
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        connectionError: error as Error,
      }));
      throw error;
    }
  }, []);
  
  const endSession = useCallback((feedback?: { rating?: number; comment?: string }) => {
    clientRef.current?.endSession(feedback);
  }, []);
  
  const sendMessage = useCallback((content: string, options?: { isEmergency?: boolean }) => {
    clientRef.current?.sendMessage(content, options);
  }, []);
  
  const setTyping = useCallback((isTyping: boolean) => {
    clientRef.current?.setTyping(isTyping);
  }, []);
  
  const markMessagesAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: 0,
    }));
  }, []);
  
  const triggerEmergency = useCallback((reason: string) => {
    clientRef.current?.triggerEmergency(reason);
    setState(prev => ({
      ...prev,
      isEmergency: true,
    }));
  }, []);
  
  const requestVolunteer = useCallback((preferences?: { 
    language?: string; 
    specialization?: string;
  }) => {
    clientRef.current?.requestVolunteer(preferences);
  }, []);
  
  // Return state and actions
  const actions: CrisisChatActions = {
    connect,
    disconnect,
    reconnect,
    startSession,
    endSession,
    sendMessage,
    setTyping,
    markMessagesAsRead,
    triggerEmergency,
    requestVolunteer,
  };
  
  return [state, actions];
}

// Export types for external use
export type { CrisisChatState, CrisisChatActions };