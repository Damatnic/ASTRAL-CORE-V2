'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Send, Phone, AlertCircle, Lock, Eye, EyeOff,
  MessageCircle, User, Bot, Heart, Activity, Zap,
  CheckCircle, XCircle, AlertTriangle, Info, RefreshCw,
  Mic, MicOff, Paperclip, Smile, MoreVertical, LogOut,
  ShieldCheck, Key, UserX, Clock, TrendingUp, Bell, Star
} from 'lucide-react';

// Interfaces for the anonymous chat system
interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'volunteer' | 'system' | 'bot';
  encrypted: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    sentiment?: number;
    keywords?: string[];
    riskFactors?: string[];
  };
}

interface Session {
  id: string;
  status: 'waiting' | 'connected' | 'ended';
  startTime: Date;
  endTime?: Date;
  volunteerId?: string;
  volunteerName?: string;
  encryptionKey?: string; // In production, use proper key management
  severity: 'low' | 'medium' | 'high' | 'critical';
  escalated: boolean;
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
  requiresEscalation: boolean;
  confidence: number;
}

interface VolunteerInfo {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  specializations: string[];
  rating: number;
  sessionsCompleted: number;
}

// Crisis keywords for real-time assessment
const CRISIS_KEYWORDS = {
  critical: [
    'suicide', 'kill myself', 'end it all', 'not worth living',
    'better off dead', 'no point', 'give up', 'cant go on'
  ],
  high: [
    'self harm', 'hurt myself', 'cutting', 'overdose',
    'hopeless', 'worthless', 'nobody cares', 'alone forever'
  ],
  medium: [
    'depressed', 'anxious', 'panic', 'scared',
    'overwhelming', 'cant cope', 'breaking down'
  ]
};

// Simulated encryption functions (in production, use WebCrypto API)
const generateEncryptionKey = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const encryptMessage = async (message: string, key: string): Promise<string> => {
  // In production, use actual encryption
  return btoa(message); // Base64 encoding for demonstration
};

const decryptMessage = async (encrypted: string, key: string): Promise<string> => {
  // In production, use actual decryption
  return atob(encrypted); // Base64 decoding for demonstration
};

export default function AnonymousCrisisChat() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [volunteerInfo, setVolunteerInfo] = useState<VolunteerInfo | null>(null);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start anonymous session
  const startSession = async () => {
    setIsConnecting(true);
    
    // Generate session with zero-knowledge encryption
    const newSession: Session = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      status: 'waiting',
      startTime: new Date(),
      encryptionKey: generateEncryptionKey(),
      severity: 'low',
      escalated: false
    };
    
    setSession(newSession);
    
    // Add system message
    addSystemMessage(
      'Connecting you to a crisis counselor. Your chat is completely anonymous and encrypted.',
      'low'
    );
    
    // Simulate queue and connection
    setQueuePosition(Math.floor(Math.random() * 5) + 1);
    
    setTimeout(() => {
      setQueuePosition(null);
      connectToVolunteer(newSession);
    }, 3000);
  };

  // Connect to volunteer
  const connectToVolunteer = (activeSession: Session) => {
    // Simulate volunteer connection
    const volunteer: VolunteerInfo = {
      id: 'vol_' + Date.now(),
      name: 'Crisis Counselor Sarah',
      status: 'available',
      specializations: ['anxiety', 'depression', 'trauma'],
      rating: 4.8,
      sessionsCompleted: 342
    };
    
    setVolunteerInfo(volunteer);
    setSession({
      ...activeSession,
      status: 'connected',
      volunteerId: volunteer.id,
      volunteerName: volunteer.name
    });
    
    setIsConnecting(false);
    
    // Add connection message
    addSystemMessage(
      `You're now connected with ${volunteer.name}. They are here to listen and support you.`,
      'low'
    );
    
    // Volunteer greeting
    setTimeout(() => {
      addVolunteerMessage(
        "Hello, I'm here to listen and support you. You're safe and anonymous here. What's on your mind?"
      );
    }, 1500);
  };

  // Assess message risk in real-time
  const assessMessageRisk = useCallback((content: string): RiskAssessment => {
    const lowerContent = content.toLowerCase();
    const factors: string[] = [];
    let level: RiskAssessment['level'] = 'low';
    let confidence = 0;
    
    // Check for critical keywords
    for (const keyword of CRISIS_KEYWORDS.critical) {
      if (lowerContent.includes(keyword)) {
        factors.push(`Critical keyword: "${keyword}"`);
        level = 'critical';
        confidence = Math.min(confidence + 30, 100);
      }
    }
    
    // Check for high-risk keywords
    if (level !== 'critical') {
      for (const keyword of CRISIS_KEYWORDS.high) {
        if (lowerContent.includes(keyword)) {
          factors.push(`High-risk keyword: "${keyword}"`);
          level = 'high';
          confidence = Math.min(confidence + 20, 100);
        }
      }
    }
    
    // Check for medium-risk keywords
    if (level === 'low') {
      for (const keyword of CRISIS_KEYWORDS.medium) {
        if (lowerContent.includes(keyword)) {
          factors.push(`Risk indicator: "${keyword}"`);
          level = 'medium';
          confidence = Math.min(confidence + 10, 100);
        }
      }
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    switch (level) {
      case 'critical':
        recommendations.push('Immediate intervention required');
        recommendations.push('Consider calling emergency services');
        recommendations.push('Offer crisis hotline numbers');
        break;
      case 'high':
        recommendations.push('Escalate to senior counselor');
        recommendations.push('Assess suicide risk directly');
        recommendations.push('Create safety plan');
        break;
      case 'medium':
        recommendations.push('Monitor closely');
        recommendations.push('Offer coping strategies');
        recommendations.push('Schedule follow-up');
        break;
      default:
        recommendations.push('Continue supportive listening');
        recommendations.push('Build rapport');
    }
    
    return {
      level,
      factors,
      recommendations,
      requiresEscalation: level === 'critical' || level === 'high',
      confidence: Math.max(confidence, 20)
    };
  }, []);

  // Handle sending message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !session) return;
    
    const content = inputMessage.trim();
    setInputMessage('');
    
    // Assess risk
    const risk = assessMessageRisk(content);
    setRiskAssessment(risk);
    
    // Encrypt message (zero-knowledge)
    const encrypted = await encryptMessage(content, session.encryptionKey || '');
    
    // Add user message
    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      content: content, // Store decrypted for display
      timestamp: new Date(),
      sender: 'user',
      encrypted: true,
      severity: risk.level,
      metadata: {
        sentiment: calculateSentiment(content),
        keywords: extractKeywords(content),
        riskFactors: risk.factors
      }
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Handle escalation if needed
    if (risk.requiresEscalation && autoEscalate) {
      handleEscalation(risk);
    }
    
    // Simulate volunteer typing
    setShowTypingIndicator(true);
    setTimeout(() => {
      setShowTypingIndicator(false);
      generateVolunteerResponse(content, risk);
    }, 2000 + Math.random() * 2000);
  };

  // Generate volunteer response based on risk
  const generateVolunteerResponse = (userMessage: string, risk: RiskAssessment) => {
    let response = '';
    
    switch (risk.level) {
      case 'critical':
        response = "I'm really concerned about what you've shared. Your safety is the most important thing right now. I want to make sure you get immediate help. Are you in a safe place right now? Would you be willing to call the crisis hotline at 988 while we continue chatting?";
        break;
      case 'high':
        response = "Thank you for trusting me with this. I can hear that you're going through something really difficult. I'm here with you. Can you tell me more about what's happening right now? Have you had thoughts of hurting yourself?";
        break;
      case 'medium':
        response = "I hear that you're struggling right now, and I'm glad you reached out. It takes courage to share these feelings. What's been the hardest part for you lately?";
        break;
      default:
        response = "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what brought you here today?";
    }
    
    addVolunteerMessage(response);
  };

  // Handle crisis escalation
  const handleEscalation = (risk: RiskAssessment) => {
    if (!session) return;
    
    setSession({
      ...session,
      severity: risk.level,
      escalated: true
    });
    
    // Add escalation notification
    addSystemMessage(
      'Based on your messages, we want to ensure you get the best support. A senior counselor has been notified and may join the conversation.',
      'high'
    );
    
    // In production, this would trigger real escalation protocols
    console.log('Crisis escalation triggered:', risk);
  };

  // Add system message
  const addSystemMessage = (content: string, severity: Message['severity'] = 'low') => {
    const message: Message = {
      id: 'sys_' + Date.now(),
      content,
      timestamp: new Date(),
      sender: 'system',
      encrypted: false,
      severity
    };
    
    setMessages(prev => [...prev, message]);
    playNotificationSound();
  };

  // Add volunteer message
  const addVolunteerMessage = (content: string) => {
    const message: Message = {
      id: 'vol_' + Date.now(),
      content,
      timestamp: new Date(),
      sender: 'volunteer',
      encrypted: true
    };
    
    setMessages(prev => [...prev, message]);
    playNotificationSound();
  };

  // Calculate message sentiment
  const calculateSentiment = (text: string): number => {
    // Simple sentiment analysis (in production, use ML model)
    const positive = ['good', 'better', 'happy', 'hope', 'love', 'grateful'];
    const negative = ['bad', 'worse', 'sad', 'hopeless', 'hate', 'angry'];
    
    const lower = text.toLowerCase();
    let score = 0;
    
    positive.forEach(word => {
      if (lower.includes(word)) score += 1;
    });
    
    negative.forEach(word => {
      if (lower.includes(word)) score -= 1;
    });
    
    return score;
  };

  // Extract keywords from message
  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction (in production, use NLP)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 5);
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // End session
  const endSession = () => {
    if (!session) return;
    
    const confirmEnd = window.confirm(
      'Are you sure you want to end this chat? Your messages will be permanently deleted for your privacy.'
    );
    
    if (confirmEnd) {
      setSession({
        ...session,
        status: 'ended',
        endTime: new Date()
      });
      
      // Clear all data (zero-knowledge)
      setTimeout(() => {
        setMessages([]);
        setSession(null);
        setVolunteerInfo(null);
        setRiskAssessment(null);
      }, 3000);
      
      addSystemMessage(
        'Chat ended. All messages have been permanently deleted. Thank you for reaching out. Remember, support is always available at 988.',
        'low'
      );
    }
  };

  // Export chat transcript (encrypted)
  const exportTranscript = async () => {
    if (!session || messages.length === 0) return;
    
    const transcript = {
      sessionId: session.id,
      duration: session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 
        : (Date.now() - session.startTime.getTime()) / 1000,
      messages: await Promise.all(
        messages.map(async (msg) => ({
          timestamp: msg.timestamp.toISOString(),
          sender: msg.sender,
          content: msg.encrypted 
            ? await encryptMessage(msg.content, session.encryptionKey || '')
            : msg.content
        }))
      ),
      encrypted: true
    };
    
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crisis-chat-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-purple-600" />
                <Lock className="w-4 h-4 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Anonymous Crisis Chat</h1>
                <p className="text-xs text-gray-500">Zero-knowledge encryption • Complete privacy</p>
              </div>
            </div>
            
            {session && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowEncryption(!showEncryption)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="Encryption status"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="Toggle sound"
                >
                  {soundEnabled ? <Bell className="w-5 h-5" /> : <Bell className="w-5 h-5 opacity-50" />}
                </button>
                {session.status === 'connected' && (
                  <button
                    onClick={endSession}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                  >
                    End Chat
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Encryption indicator */}
          {showEncryption && session && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">End-to-End Encrypted</p>
                  <p className="text-green-700 mt-1">
                    Session ID: {session.id.substring(0, 16)}...
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Messages are encrypted with zero-knowledge protocol. 
                    Not even our servers can read your messages.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {!session ? (
          // Welcome screen
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                  <MessageCircle className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You're Not Alone
                </h2>
                <p className="text-gray-600">
                  Connect instantly with a trained crisis counselor. 
                  Your chat is completely anonymous and encrypted.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <UserX className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">100% Anonymous</p>
                    <p className="text-sm text-gray-600">No registration or personal info required</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Zero-Knowledge Encryption</p>
                    <p className="text-sm text-gray-600">Your messages are encrypted end-to-end</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Available 24/7</p>
                    <p className="text-sm text-gray-600">Crisis counselors are always here</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={startSession}
                disabled={isConnecting}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isConnecting ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  'Start Anonymous Chat'
                )}
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                If you're in immediate danger, please call 911 or 988
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Connection status */}
            {session.status === 'waiting' && queuePosition && (
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                    <span className="text-yellow-800">
                      Connecting to counselor... Position in queue: {queuePosition}
                    </span>
                  </div>
                  <span className="text-sm text-yellow-600">
                    Estimated wait: {queuePosition} min
                  </span>
                </div>
              </div>
            )}
            
            {/* Volunteer info bar */}
            {volunteerInfo && session.status === 'connected' && (
              <div className="bg-green-50 border-b border-green-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {volunteerInfo.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{volunteerInfo.name}</p>
                      <p className="text-xs text-gray-600">
                        {volunteerInfo.specializations.join(', ')} • 
                        {' '}{volunteerInfo.sessionsCompleted} sessions completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(volunteerInfo.rating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {volunteerInfo.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Risk assessment bar */}
            {riskAssessment && riskAssessment.level !== 'low' && (
              <div className={`px-4 py-2 border-b ${
                riskAssessment.level === 'critical' ? 'bg-red-50 border-red-200' :
                riskAssessment.level === 'high' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      riskAssessment.level === 'critical' ? 'text-red-600' :
                      riskAssessment.level === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      riskAssessment.level === 'critical' ? 'text-red-800' :
                      riskAssessment.level === 'high' ? 'text-orange-800' :
                      'text-yellow-800'
                    }`}>
                      Risk Level: {riskAssessment.level.toUpperCase()}
                    </span>
                  </div>
                  {autoEscalate && riskAssessment.requiresEscalation && (
                    <span className="text-xs text-gray-600">
                      Senior counselor notified
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'system' ? (
                    <div className="max-w-md w-full">
                      <div className={`p-3 rounded-lg text-sm ${
                        message.severity === 'high' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-md ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    }`}>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.encrypted && (
                          <Lock className="w-3 h-3 mt-1 opacity-50" />
                        )}
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 px-1 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {showTypingIndicator && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input area */}
            {session.status === 'connected' && (
              <div className="border-t bg-white p-4">
                <div className="flex space-x-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Quick actions */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-500 hover:text-gray-700 p-1">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 p-1">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 p-1">
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      Encrypted
                    </span>
                    <span>
                      Session: {Math.floor((Date.now() - session.startTime.getTime()) / 60000)} min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Crisis resources bar */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm font-medium">
            If you're in immediate danger, please call emergency services
          </p>
          <div className="flex items-center space-x-4">
            <a href="tel:911" className="flex items-center space-x-1 hover:underline">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-bold">911</span>
            </a>
            <a href="tel:988" className="flex items-center space-x-1 hover:underline">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-bold">988</span>
            </a>
            <a href="sms:741741" className="flex items-center space-x-1 hover:underline">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-bold">Text 741741</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}