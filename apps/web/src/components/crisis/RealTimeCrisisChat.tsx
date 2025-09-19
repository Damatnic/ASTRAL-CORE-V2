'use client';

/**
 * ASTRAL_CORE 2.0 Real-Time Crisis Chat Component
 * 
 * Features:
 * - Real-time messaging with Socket.io
 * - AI-powered crisis detection
 * - Volunteer matching
 * - Live severity monitoring
 * - Emergency escalation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, AlertCircle, Phone, Heart, Shield, 
  User, Bot, Clock, MapPin, AlertTriangle,
  CheckCircle, XCircle, Activity
} from 'lucide-react';
import { getCrisisDetectionEngine } from '@/lib/ai/crisis-detection-engine';
import { format } from 'date-fns';
import { useSmartScroll, useNewMessageIndicator } from '@/hooks/useSmartScroll';
import { NewMessagesIndicator, ChatNavigationHelper } from '@/components/chat/NewMessagesIndicator';
import { useAccessibility } from '@/components/accessibility/AccessibilityEnhancer';

// Types
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: 'USER' | 'VOLUNTEER' | 'PROFESSIONAL' | 'SYSTEM';
  timestamp: Date;
  sentiment?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  aiAnalysis?: {
    signals: Array<{ type: string; severity: number; confidence: number }>;
    recommendations?: string[];
  };
}

interface Volunteer {
  id: string;
  name: string;
  status: 'MATCHING' | 'CONNECTED' | 'DISCONNECTED';
  matchScore?: number;
  specializations?: string[];
  responseTime?: number;
}

interface CrisisMetrics {
  severity: number;
  sentiment: number;
  responseTime: number;
  messagesExchanged: number;
  escalationRisk: number;
}

interface RealTimeCrisisChatProps {
  sessionId: string;
  userId?: string;
  initialSeverity?: number;
  onEscalation?: (severity: number) => void;
  onEnd?: (outcome: string) => void;
}

export default function RealTimeCrisisChat({
  sessionId,
  userId,
  initialSeverity = 5,
  onEscalation,
  onEnd
}: RealTimeCrisisChatProps) {
  // State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [metrics, setMetrics] = useState<CrisisMetrics>({
    severity: initialSeverity,
    sentiment: 0,
    responseTime: 0,
    messagesExchanged: 0,
    escalationRisk: 0
  });
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [aiEngine, setAiEngine] = useState<ReturnType<typeof getCrisisDetectionEngine> | null>(null);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Accessibility
  const { settings, announceToScreenReader } = useAccessibility();

  // Smart scrolling with crisis message priority
  const {
    containerRef,
    scrollTargetRef,
    isAtBottom,
    scrollToBottom,
    forceScrollToBottom
  } = useSmartScroll(messages, {
    forceScrollOnCrisis: true,
    respectReducedMotion: true,
    bottomThreshold: 100
  });

  // New message indicator
  const {
    unreadCount,
    showIndicator,
    clearIndicator
  } = useNewMessageIndicator(isAtBottom, messages);

  // Check for crisis messages in unread
  const hasCrisisMessages = messages
    .slice(-unreadCount)
    .some(msg => msg.riskLevel === 'CRITICAL' || msg.riskLevel === 'HIGH');
  
  // Initialize Socket.io and AI engine
  useEffect(() => {
    // Initialize AI engine
    const engine = getCrisisDetectionEngine();
    setAiEngine(engine);
    
    // Initialize Socket.io connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: userId || 'anonymous',
        sessionId
      },
      transports: ['websocket', 'polling']
    });
    
    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to crisis support');
      setConnectionStatus('connected');
      setIsConnecting(false);
      
      // Start crisis session
      newSocket.emit('crisis:start', {
        severity: initialSeverity,
        isEmergency: initialSeverity >= 8,
        languages: ['en'],
        anonymousId: userId || `anon_${Date.now()}`
      });
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from crisis support');
      setConnectionStatus('disconnected');
    });
    
    newSocket.on('volunteer:matched', (data) => {
      setVolunteer({
        id: data.volunteerId,
        name: 'Crisis Counselor',
        status: 'MATCHING',
        matchScore: data.matchScore,
        responseTime: data.estimatedResponseTime
      });
      
      addSystemMessage(`A crisis counselor has been matched and will join shortly (ETA: ${data.estimatedResponseTime}s)`);
    });
    
    newSocket.on('volunteer:joined', (data) => {
      setVolunteer(prev => prev ? {
        ...prev,
        name: data.volunteerName || 'Crisis Counselor',
        status: 'CONNECTED'
      } : null);
      
      addSystemMessage(`${data.volunteerName || 'Crisis counselor'} has joined the chat`);
    });
    
    newSocket.on('crisis:message', async (data) => {
      const message: Message = {
        id: data.messageId,
        content: data.content,
        senderId: data.senderId,
        senderRole: data.senderRole,
        timestamp: new Date(data.timestamp)
      };
      
      // Analyze message with AI if from user
      if (data.senderRole === 'USER' && aiEngine) {
        try {
          const analysis = await aiEngine.analyzeMessage(sessionId, data.content);
          message.aiAnalysis = {
            signals: analysis.signals,
            recommendations: analysis.recommendations.map(r => r.description)
          };
          message.riskLevel = analysis.riskAssessment.overallRisk;
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            severity: Math.max(prev.severity, 
              analysis.signals.reduce((max, s) => Math.max(max, s.severity), 0)),
            escalationRisk: analysis.riskAssessment.riskScore / 100,
            messagesExchanged: prev.messagesExchanged + 1
          }));
          
          // Check for escalation
          if (analysis.riskAssessment.immediateActionNeeded) {
            handleCrisisEscalation(analysis.riskAssessment.riskScore);
          }
        } catch (error) {
          console.error('AI analysis error:', error);
        }
      }
      
      setMessages(prev => [...prev, message]);
    });
    
    newSocket.on('crisis:escalated', (data) => {
      const escalationMessage = 
        `Crisis escalated to severity ${data.newSeverity}. ` +
        (data.professionalAssigned ? 'A professional has been notified. ' : '') +
        (data.emergencyServicesNotified ? 'Emergency services have been contacted.' : '');
      
      addSystemMessage(escalationMessage);
      announceToScreenReader(escalationMessage);
      
      setMetrics(prev => ({ ...prev, severity: data.newSeverity }));
      setShowEmergencyOptions(true);
      
      // Force scroll for escalated crisis
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);
    });
    
    newSocket.on('participant:disconnected', (data) => {
      if (data.role === 'VOLUNTEER') {
        setVolunteer(prev => prev ? { ...prev, status: 'DISCONNECTED' } : null);
        addSystemMessage('The crisis counselor has disconnected. Finding a replacement...');
      }
    });
    
    newSocket.on('metrics:update', (data) => {
      // Update real-time metrics from server
      console.log('Metrics update:', data);
    });
    
    setSocket(newSocket);
    
    // Cleanup
    return () => {
      newSocket.disconnect();
      if (aiEngine) {
        aiEngine.dispose();
      }
    };
  }, [sessionId, userId, initialSeverity]);
  
  // Get user location for emergencies
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);
  
  // Helper functions
  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: `system_${Date.now()}`,
      content,
      senderId: 'system',
      senderRole: 'SYSTEM',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !socket || connectionStatus !== 'connected') return;
    
    const messageContent = inputMessage.trim();
    setInputMessage('');
    
    // Add message to UI immediately
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      senderId: userId || 'user',
      senderRole: 'USER',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempMessage]);
    
    // Analyze with AI before sending
    if (aiEngine) {
      try {
        const analysis = await aiEngine.analyzeMessage(sessionId, messageContent, {
          userId,
          timestamp: new Date(),
          previousMessages: messages.slice(-5).map(m => m.content)
        });
        
        // Update temp message with analysis
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...msg,
                aiAnalysis: {
                  signals: analysis.signals,
                  recommendations: analysis.recommendations.map(r => r.description)
                },
                riskLevel: analysis.riskAssessment.overallRisk
              }
            : msg
        ));
        
        // Send to server with analysis metadata
        socket.emit('crisis:message', {
          content: messageContent,
          severity: Math.max(
            metrics.severity,
            analysis.signals.reduce((max, s) => Math.max(max, s.severity), 0)
          ),
          isEmergency: analysis.riskAssessment.immediateActionNeeded
        });
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          messagesExchanged: prev.messagesExchanged + 1,
          sentiment: analysis.signals.find(s => s.type === 'SENTIMENT')?.severity || prev.sentiment
        }));
        
      } catch (error) {
        console.error('Failed to analyze message:', error);
        // Send anyway
        socket.emit('crisis:message', { content: messageContent });
      }
    } else {
      // Send without analysis
      socket.emit('crisis:message', { content: messageContent });
    }
  };
  
  const handleTyping = () => {
    if (!socket) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start');
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop');
    }, 1000);
  };
  
  const handleCrisisEscalation = (newSeverity: number) => {
    if (!socket) return;
    
    socket.emit('crisis:escalate', {
      severityIncrease: newSeverity - metrics.severity,
      reason: 'AI detected high risk indicators',
      location
    });
    
    if (onEscalation) {
      onEscalation(newSeverity);
    }
  };
  
  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };
  
  const handleEndChat = () => {
    if (!socket) return;
    
    socket.emit('crisis:end', {
      outcome: 'USER_ENDED',
      followUpScheduled: false
    });
    
    if (onEnd) {
      onEnd('USER_ENDED');
    }
  };
  
  // Render functions
  const renderMessage = (message: Message) => {
    const isUser = message.senderRole === 'USER';
    const isSystem = message.senderRole === 'SYSTEM';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isSystem ? 'w-full' : ''}`}>
          {isSystem ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-700">{message.content}</p>
            </div>
          ) : (
            <div className={`${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-lg p-4 shadow-sm`}>
              {!isUser && (
                <div className="flex items-center mb-2">
                  <div className={`w-6 h-6 rounded-full ${
                    message.senderRole === 'VOLUNTEER' ? 'bg-green-500' : 'bg-purple-500'
                  } flex items-center justify-center mr-2`}>
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {message.senderRole === 'VOLUNTEER' ? volunteer?.name : 'Professional'}
                  </span>
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.aiAnalysis && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} />
                    <span className="text-xs">AI Analysis</span>
                  </div>
                  
                  {message.riskLevel && (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-2 ${
                      message.riskLevel === 'CRITICAL' ? 'bg-red-600' :
                      message.riskLevel === 'HIGH' ? 'bg-orange-500' :
                      message.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      <AlertCircle size={12} />
                      Risk: {message.riskLevel}
                    </div>
                  )}
                  
                  {message.aiAnalysis.signals.length > 0 && (
                    <div className="text-xs opacity-80">
                      Detected: {message.aiAnalysis.signals.map(s => s.type).join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {format(message.timestamp, 'HH:mm')}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };
  
  const renderMetricsBar = () => (
    <div className="bg-white border-b p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Severity Indicator */}
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className={
              metrics.severity >= 8 ? 'text-red-500' :
              metrics.severity >= 6 ? 'text-orange-500' :
              metrics.severity >= 4 ? 'text-yellow-500' :
              'text-green-500'
            } />
            <span className="text-sm font-medium">
              Severity: {metrics.severity}/10
            </span>
          </div>
          
          {/* Sentiment Indicator */}
          <div className="flex items-center gap-2">
            <Heart size={16} className={
              metrics.sentiment < -0.5 ? 'text-red-500' :
              metrics.sentiment < 0 ? 'text-orange-500' :
              'text-green-500'
            } />
            <span className="text-sm">
              Mood: {
                metrics.sentiment < -0.5 ? 'Very Low' :
                metrics.sentiment < 0 ? 'Low' :
                metrics.sentiment > 0.5 ? 'Good' :
                'Neutral'
              }
            </span>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <Activity size={16} className={
              connectionStatus === 'connected' ? 'text-green-500' :
              connectionStatus === 'connecting' ? 'text-yellow-500 animate-pulse' :
              'text-red-500'
            } />
            <span className="text-sm">
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
          
          {/* Volunteer Status */}
          {volunteer && (
            <div className="flex items-center gap-2">
              <User size={16} className={
                volunteer.status === 'CONNECTED' ? 'text-green-500' :
                volunteer.status === 'MATCHING' ? 'text-yellow-500' :
                'text-gray-700'
              } />
              <span className="text-sm">
                {volunteer.status === 'CONNECTED' ? volunteer.name :
                 volunteer.status === 'MATCHING' ? 'Finding counselor...' :
                 'Counselor disconnected'}
              </span>
            </div>
          )}
        </div>
        
        {/* Emergency Options */}
        {(metrics.severity >= 8 || showEmergencyOptions) && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmergencyCall}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <Phone size={14} />
              Call 911
            </button>
            
            <button
              onClick={() => socket?.emit('emergency:notify', { 
                contacts: [],
                message: 'Crisis situation - immediate help needed',
                location 
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <Shield size={14} />
              Notify Contacts
            </button>
          </div>
        )}
      </div>
      
      {/* Escalation Risk Bar */}
      {metrics.escalationRisk > 0.5 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Escalation Risk</span>
            <span>{(metrics.escalationRisk * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                metrics.escalationRisk > 0.8 ? 'bg-red-500' :
                metrics.escalationRisk > 0.6 ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${metrics.escalationRisk * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Metrics Bar */}
      {renderMetricsBar()}
      
      {/* Messages Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4"
        data-chat-container
        role="log"
        aria-live="polite"
        aria-label="Crisis chat conversation"
      >
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && volunteer?.status === 'CONNECTED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: settings.reducedMotion ? 0.1 : 0.3
            }}
            className="flex items-center gap-2 text-gray-700 text-sm ml-4"
            aria-live="polite"
            aria-label={`${volunteer.name} is typing`}
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
            <span>{volunteer.name} is typing...</span>
            <span className="sr-only">{volunteer.name} is typing a message</span>
          </motion.div>
        )}
        
        <div ref={scrollTargetRef} aria-hidden="true" />
      </div>
      
      {/* New Messages Indicator */}
      <NewMessagesIndicator
        show={showIndicator}
        unreadCount={unreadCount}
        onScrollToBottom={() => {
          scrollToBottom();
          clearIndicator();
        }}
        hasCrisisMessages={hasCrisisMessages}
        bottomOffset={140}
      />

      {/* Chat Navigation Helper */}
      <ChatNavigationHelper />
      
      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              connectionStatus === 'connected' 
                ? "Type your message... You're safe here."
                : "Connecting to crisis support..."
            }
            disabled={connectionStatus !== 'connected'}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            I need immediate help
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            I'm feeling overwhelmed
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Just need someone to talk to
          </button>
        </div>
        
        {/* End Chat Option */}
        <div className="flex justify-center mt-3">
          <button
            onClick={handleEndChat}
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            End Chat Session
          </button>
        </div>
      </div>
    </div>
  );
}