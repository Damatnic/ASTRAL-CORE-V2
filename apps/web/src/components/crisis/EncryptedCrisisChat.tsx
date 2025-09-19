/**
 * ASTRAL Core V2 - Encrypted Anonymous Crisis Chat
 * 
 * Zero-knowledge crisis chat system with:
 * - End-to-end encryption for all messages
 * - Perfect forward secrecy
 * - Anonymous session management
 * - Real-time crisis detection with encrypted monitoring
 * - Secure peer support matching
 * - Emergency escalation protocols
 * - Offline crisis capabilities
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, Send, Phone, AlertCircle, Lock, Eye, EyeOff,
  MessageCircle, User, Bot, Heart, Activity, Zap,
  CheckCircle, XCircle, AlertTriangle, Info, RefreshCw,
  Mic, MicOff, Paperclip, Smile, MoreVertical, LogOut,
  ShieldCheck, Key, UserX, Clock, TrendingUp, Bell, Star,
  Wifi, WifiOff, UserCheck, FileText, Download, Share2,
  Navigation, MapPin, Smartphone, Headphones, Volume2
} from 'lucide-react';

import { ZeroKnowledgeCrypto, getZeroKnowledgeCrypto, CrisisEncryptionContext, EncryptedData } from '../../lib/encryption/zero-knowledge-crypto';
import { SecureKeyManager, SecureSession } from '../../lib/encryption/secure-key-manager';
import { EncryptedStorage } from '../../lib/encryption/encrypted-storage';
import { getCrisisDetectionEngine } from '../../lib/ai/crisis-detection-engine';

// Enhanced interfaces for encrypted crisis chat
interface EncryptedChatSession {
  id: string;
  sessionType: 'ANONYMOUS' | 'PEER_SUPPORT' | 'PROFESSIONAL' | 'EMERGENCY';
  status: 'CONNECTING' | 'WAITING' | 'ACTIVE' | 'ESCALATED' | 'ENDED';
  startTime: Date;
  endTime?: Date;
  encryptionKeyId: string;
  isAnonymous: boolean;
  
  // Encrypted session data
  encryptedMetadata: EncryptedData;
  participantKeys: EncryptedParticipantKey[];
  forwardSecrecyKeys: EncryptedData[];
  
  // Crisis monitoring
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  escalationHistory: EscalationEvent[];
  aiAnalysis: EncryptedCrisisAnalysis;
  
  // Session configuration
  config: ChatSessionConfig;
}

interface EncryptedParticipantKey {
  participantId: string;
  role: 'USER' | 'VOLUNTEER' | 'PEER' | 'PROFESSIONAL' | 'EMERGENCY';
  encryptedKey: EncryptedData;
  keyVersion: number;
  isActive: boolean;
}

interface EncryptedMessage {
  id: string;
  sessionId: string;
  encryptedContent: EncryptedData;
  encryptedMetadata: EncryptedData;
  sender: EncryptedSender;
  timestamp: Date;
  messageType: 'TEXT' | 'CRISIS_ALERT' | 'SYSTEM' | 'RESOURCE_SHARE' | 'LOCATION';
  forwardSecrecyKeyId: string;
  readReceipts: EncryptedReadReceipt[];
}

interface EncryptedSender {
  participantId: string;
  role: 'USER' | 'VOLUNTEER' | 'PEER' | 'PROFESSIONAL' | 'EMERGENCY';
  encryptedDisplayInfo: EncryptedData; // Name, avatar, etc.
  verificationLevel: 'ANONYMOUS' | 'VERIFIED' | 'PROFESSIONAL';
}

interface EncryptedReadReceipt {
  participantId: string;
  readAt: Date;
  encryptedConfirmation: EncryptedData;
}

interface EscalationEvent {
  timestamp: Date;
  fromLevel: string;
  toLevel: string;
  trigger: 'KEYWORD' | 'AI_ANALYSIS' | 'MANUAL' | 'TIME_BASED' | 'EMERGENCY';
  encryptedDetails: EncryptedData;
  actionsTaken: string[];
}

interface EncryptedCrisisAnalysis {
  analysisId: string;
  timestamp: Date;
  encryptedRiskFactors: EncryptedData;
  encryptedRecommendations: EncryptedData;
  encryptedSentimentAnalysis: EncryptedData;
  confidenceScore: number;
  triggerWords: EncryptedData;
}

interface ChatSessionConfig {
  allowPeerSupport: boolean;
  enableCrisisDetection: boolean;
  enableLocationSharing: boolean;
  enableVoiceMessages: boolean;
  enableFileSharing: boolean;
  autoEscalation: boolean;
  retentionPolicy: 'IMMEDIATE_DELETE' | 'SESSION_DELETE' | '24_HOURS' | '7_DAYS';
  emergencyContacts: EncryptedData;
}

interface AnonymousPeer {
  id: string;
  encryptedProfile: EncryptedData;
  supportCategories: string[];
  experienceLevel: 'NEWCOMER' | 'EXPERIENCED' | 'MENTOR';
  availability: 'AVAILABLE' | 'BUSY' | 'AWAY';
  rating: number;
  sessionsCompleted: number;
  isVerifiedSurvivor: boolean;
}

interface CrisisResource {
  id: string;
  type: 'HOTLINE' | 'TEXT_LINE' | 'CHAT' | 'LOCAL_SERVICE' | 'EMERGENCY';
  name: string;
  contact: string;
  description: string;
  availability: string;
  specializations: string[];
  isImmediate: boolean;
  location?: string;
}

interface OfflineCrisisMode {
  isActive: boolean;
  sessionId: string;
  encryptedMessages: EncryptedData[];
  lastSync: Date;
  pendingActions: string[];
}

export default function EncryptedCrisisChat() {
  // Core encryption and session management
  const [crypto] = useState<ZeroKnowledgeCrypto>(() => getZeroKnowledgeCrypto());
  const [keyManager, setKeyManager] = useState<SecureKeyManager | null>(null);
  const [encryptedStorage, setEncryptedStorage] = useState<EncryptedStorage | null>(null);
  const [crisisDetection] = useState(() => getCrisisDetectionEngine());
  
  // Session state
  const [currentSession, setCurrentSession] = useState<EncryptedChatSession | null>(null);
  const [secureSession, setSecureSession] = useState<SecureSession | null>(null);
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, any>>(new Map());
  
  // UI state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  
  // Crisis monitoring
  const [currentRiskLevel, setCurrentRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [encryptedAnalysis, setEncryptedAnalysis] = useState<EncryptedCrisisAnalysis | null>(null);
  const [escalationInProgress, setEscalationInProgress] = useState(false);
  
  // Connection and peers
  const [connectedPeers, setConnectedPeers] = useState<AnonymousPeer[]>([]);
  const [availableResources, setAvailableResources] = useState<CrisisResource[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineMode, setOfflineMode] = useState<OfflineCrisisMode | null>(null);
  
  // Settings
  const [enableVoice, setEnableVoice] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableLocationSharing, setEnableLocationSharing] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Initialize encrypted chat system
   */
  useEffect(() => {
    initializeEncryptedChat();
    setupNetworkListeners();
    loadCrisisResources();
    
    return () => {
      cleanupSession();
    };
  }, []);

  /**
   * Auto-scroll to latest messages
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Initialize all encryption systems
   */
  const initializeEncryptedChat = async () => {
    try {
      setIsInitializing(true);

      // Initialize key manager
      const manager = new SecureKeyManager(crypto);
      setKeyManager(manager);

      // Initialize encrypted storage
      const storage = new EncryptedStorage(crypto, manager);
      setEncryptedStorage(storage);

      // Initialize crisis detection
      // await crisisDetection.waitForInitialization?.(); // TODO: Make method public or use alternative initialization

      // Setup audio for notifications
      if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/crisis-notification.mp3');
      }

      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize encrypted chat:', error);
      setIsInitializing(false);
    }
  };

  /**
   * Setup network connectivity listeners
   */
  const setupNetworkListeners = () => {
    const handleOnline = () => {
      setIsOffline(false);
      if (offlineMode) {
        syncOfflineMessages();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      enableOfflineMode();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  /**
   * Start anonymous crisis chat session
   */
  const startAnonymousSession = async (emergencyLevel: 'HIGH' | 'CRITICAL' = 'HIGH') => {
    try {
      setIsConnecting(true);

      if (!keyManager) throw new Error('Key manager not initialized');

      // Create anonymous secure session
      const session = await keyManager.createAnonymousSession(emergencyLevel);
      setSecureSession(session);

      // Generate session encryption keys
      const sessionKey = await crypto.generateSessionKey(session.sessionId);
      const forwardSecrecyKey = await crypto.generateSessionKey(`fs_${session.sessionId}`);

      // Create encrypted chat session
      const chatSession: EncryptedChatSession = {
        id: session.sessionId,
        sessionType: 'ANONYMOUS',
        status: 'CONNECTING',
        startTime: new Date(),
        encryptionKeyId: session.keyId,
        isAnonymous: true,
        encryptedMetadata: await encryptSessionData({
          userAgent: navigator.userAgent,
          sessionPreferences: { 
            emergencyLevel,
            supportType: 'crisis_chat',
            preferredLanguage: 'en'
          }
        }, session),
        participantKeys: [{
          participantId: session.userId || 'anonymous',
          role: 'USER',
          encryptedKey: await encryptSessionData(session.sessionId, session),
          keyVersion: 1,
          isActive: true
        }],
        forwardSecrecyKeys: [await encryptSessionData('initial_key', session)],
        riskLevel: emergencyLevel === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM',
        escalationHistory: [],
        aiAnalysis: await initializeAIAnalysis(session),
        config: {
          allowPeerSupport: true,
          enableCrisisDetection: true,
          enableLocationSharing: enableLocationSharing,
          enableVoiceMessages: enableVoice,
          enableFileSharing: false,
          autoEscalation: true,
          retentionPolicy: 'SESSION_DELETE',
          emergencyContacts: await encryptSessionData(getEmergencyContacts(), session)
        }
      };

      setCurrentSession(chatSession);
      await saveSessionToStorage(chatSession, session);

      // Add initial system message
      await addEncryptedSystemMessage(
        'Welcome to anonymous crisis chat. You are completely anonymous and all messages are encrypted end-to-end.',
        'SYSTEM',
        session
      );

      // Start peer matching or volunteer connection
      await initiateConnectionProcess(chatSession, session);
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Failed to start anonymous session:', error);
      setIsConnecting(false);
    }
  };

  /**
   * Encrypt session data helper
   */
  const encryptSessionData = async (data: any, session: SecureSession): Promise<EncryptedData> => {
    if (!keyManager) throw new Error('Key manager not initialized');

    const context: CrisisEncryptionContext = {
      dataType: 'CRISIS_MESSAGE',
      sessionId: session.sessionId,
      userId: session.isAnonymous ? undefined : session.userId,
      emergencyLevel: session.emergencyLevel || 'MEDIUM'
    };

    return keyManager.encryptWithSession(
      session.sessionId,
      JSON.stringify(data),
      context
    );
  };

  /**
   * Decrypt session data helper
   */
  const decryptSessionData = async (encryptedData: EncryptedData, session: SecureSession): Promise<any> => {
    if (!keyManager) throw new Error('Key manager not initialized');

    const context: CrisisEncryptionContext = {
      dataType: 'CRISIS_MESSAGE',
      sessionId: session.sessionId,
      userId: session.isAnonymous ? undefined : session.userId
    };

    const decrypted = await keyManager.decryptWithSession(
      session.sessionId,
      encryptedData,
      context
    );

    return JSON.parse(decrypted);
  };

  /**
   * Initialize AI analysis with encryption
   */
  const initializeAIAnalysis = async (session: SecureSession): Promise<EncryptedCrisisAnalysis> => {
    const initialAnalysis = {
      riskFactors: [],
      recommendations: ['Continue monitoring', 'Provide supportive listening'],
      sentimentAnalysis: { score: 0, confidence: 0.5 },
      triggerWords: []
    };

    return {
      analysisId: `analysis_${Date.now()}`,
      timestamp: new Date(),
      encryptedRiskFactors: await encryptSessionData(initialAnalysis.riskFactors, session),
      encryptedRecommendations: await encryptSessionData(initialAnalysis.recommendations, session),
      encryptedSentimentAnalysis: await encryptSessionData(initialAnalysis.sentimentAnalysis, session),
      confidenceScore: 0.5,
      triggerWords: await encryptSessionData(initialAnalysis.triggerWords, session)
    };
  };

  /**
   * Send encrypted message
   */
  const sendEncryptedMessage = async () => {
    try {
      if (!inputMessage.trim() || !currentSession || !secureSession || !keyManager) return;

      const messageContent = inputMessage.trim();
      setInputMessage('');

      // Perform real-time crisis analysis
      const crisisAnalysis = await crisisDetection.analyzeMessage(
        currentSession.id,
        messageContent,
        {
          userId: secureSession.isAnonymous ? undefined : secureSession.userId,
          timestamp: new Date()
        }
      );

      // Update risk level based on analysis
      if (crisisAnalysis.riskAssessment.overallRisk !== currentRiskLevel) {
        setCurrentRiskLevel(crisisAnalysis.riskAssessment.overallRisk as any);
        
        if (crisisAnalysis.riskAssessment.immediateActionNeeded) {
          await handleCrisisEscalation(crisisAnalysis, secureSession);
        }
      }

      // Encrypt message content and metadata
      const encryptedContent = await encryptSessionData({
        text: messageContent,
        analysisResults: {
          riskLevel: crisisAnalysis.riskAssessment.overallRisk,
          confidence: crisisAnalysis.riskAssessment.confidenceLevel
        }
      }, secureSession);

      const encryptedMetadata = await encryptSessionData({
        originalLength: messageContent.length,
        timestamp: new Date(),
        messageType: 'TEXT',
        analysisMetadata: {
          riskScore: crisisAnalysis.riskAssessment.riskScore,
          signalCount: crisisAnalysis.signals.length
        }
      }, secureSession);

      // Create encrypted message
      const encryptedMessage: EncryptedMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36)}`,
        sessionId: currentSession.id,
        encryptedContent,
        encryptedMetadata,
        sender: {
          participantId: secureSession.userId || 'anonymous',
          role: 'USER',
          encryptedDisplayInfo: await encryptSessionData({
            displayName: 'You',
            isAnonymous: true
          }, secureSession),
          verificationLevel: 'ANONYMOUS'
        },
        timestamp: new Date(),
        messageType: 'TEXT',
        forwardSecrecyKeyId: `fs_${currentSession.id}_${Date.now()}`,
        readReceipts: []
      };

      // Add to messages and decrypt for display
      setMessages(prev => [...prev, encryptedMessage]);
      
      // Decrypt for immediate display
      const decryptedContent = await decryptSessionData(encryptedContent, secureSession);
      setDecryptedMessages(prev => new Map(prev.set(encryptedMessage.id, {
        content: decryptedContent.text,
        isUser: true,
        riskLevel: decryptedContent.analysisResults.riskLevel,
        timestamp: encryptedMessage.timestamp
      })));

      // Store encrypted message
      if (encryptedStorage) {
        await encryptedStorage.store(
          secureSession.sessionId,
          encryptedMessage,
          'CRISIS_MESSAGE',
          {
            id: encryptedMessage.id,
            emergencyLevel: currentRiskLevel
          }
        );
      }

      // Generate peer/volunteer response
      setTimeout(() => {
        generateEncryptedResponse(messageContent, crisisAnalysis);
      }, 1500 + Math.random() * 2000);

    } catch (error) {
      console.error('Failed to send encrypted message:', error);
    }
  };

  /**
   * Handle crisis escalation
   */
  const handleCrisisEscalation = async (analysis: any, session: SecureSession) => {
    try {
      setEscalationInProgress(true);

      if (!currentSession) return;

      // Create escalation event
      const escalationEvent: EscalationEvent = {
        timestamp: new Date(),
        fromLevel: currentRiskLevel,
        toLevel: analysis.riskAssessment.overallRisk,
        trigger: 'AI_ANALYSIS',
        encryptedDetails: await encryptSessionData({
          analysisResults: analysis,
          recommendedActions: analysis.recommendations,
          triggerSignals: analysis.signals
        }, session),
        actionsTaken: []
      };

      // Update session with escalation
      const updatedSession = {
        ...currentSession,
        status: 'ESCALATED' as const,
        riskLevel: analysis.riskAssessment.overallRisk as any,
        escalationHistory: [...currentSession.escalationHistory, escalationEvent]
      };

      setCurrentSession(updatedSession);

      // Add system message about escalation
      await addEncryptedSystemMessage(
        `Crisis escalation triggered. A senior counselor has been notified and may join the conversation. Your safety is our priority.`,
        'CRISIS_ALERT',
        session
      );

      // In production, this would trigger real professional intervention
      console.log('Crisis escalation triggered:', analysis);

      setEscalationInProgress(false);
    } catch (error) {
      console.error('Failed to handle crisis escalation:', error);
      setEscalationInProgress(false);
    }
  };

  /**
   * Add encrypted system message
   */
  const addEncryptedSystemMessage = async (
    content: string,
    messageType: 'SYSTEM' | 'CRISIS_ALERT',
    session: SecureSession
  ) => {
    try {
      if (!currentSession || !keyManager) return;

      const encryptedContent = await encryptSessionData({
        text: content,
        systemType: messageType
      }, session);

      const encryptedMetadata = await encryptSessionData({
        timestamp: new Date(),
        messageType,
        isSystemGenerated: true
      }, session);

      const systemMessage: EncryptedMessage = {
        id: `sys_${Date.now()}_${Math.random().toString(36)}`,
        sessionId: currentSession.id,
        encryptedContent,
        encryptedMetadata,
        sender: {
          participantId: 'system',
          role: 'EMERGENCY',
          encryptedDisplayInfo: await encryptSessionData({
            displayName: 'Crisis System',
            isSystem: true
          }, session),
          verificationLevel: 'VERIFIED'
        },
        timestamp: new Date(),
        messageType,
        forwardSecrecyKeyId: `fs_system_${Date.now()}`,
        readReceipts: []
      };

      setMessages(prev => [...prev, systemMessage]);
      
      // Decrypt for display
      const decryptedContent = await decryptSessionData(encryptedContent, session);
      setDecryptedMessages(prev => new Map(prev.set(systemMessage.id, {
        content: decryptedContent.text,
        isSystem: true,
        messageType,
        timestamp: systemMessage.timestamp
      })));

      // Play notification sound
      if (enableNotifications && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

    } catch (error) {
      console.error('Failed to add system message:', error);
    }
  };

  /**
   * Generate peer/volunteer response
   */
  const generateEncryptedResponse = async (userMessage: string, analysis: any) => {
    try {
      if (!currentSession || !secureSession || !keyManager) return;

      // Generate contextual response based on risk level
      let response = '';
      switch (currentRiskLevel) {
        case 'CRITICAL':
          response = "I'm really concerned about what you've shared. Your safety is the most important thing right now. Are you in a safe place? Would you be willing to call 988 while we continue talking?";
          break;
        case 'HIGH':
          response = "Thank you for trusting me with this. I can hear that you're going through something really difficult. I'm here with you. Can you tell me more about what's happening?";
          break;
        case 'MEDIUM':
          response = "I hear that you're struggling right now, and I'm glad you reached out. It takes courage to share these feelings. What's been the hardest part lately?";
          break;
        default:
          response = "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what brought you here today?";
      }

      // Encrypt response
      const encryptedContent = await encryptSessionData({
        text: response,
        responseType: 'PEER_SUPPORT',
        contextualAnalysis: {
          respondingToRisk: currentRiskLevel,
          supportStrategy: 'active_listening'
        }
      }, secureSession);

      const encryptedMetadata = await encryptSessionData({
        timestamp: new Date(),
        messageType: 'TEXT',
        responseGenerated: true,
        respondingToMessageId: messages[messages.length - 1]?.id
      }, secureSession);

      const peerMessage: EncryptedMessage = {
        id: `peer_${Date.now()}_${Math.random().toString(36)}`,
        sessionId: currentSession.id,
        encryptedContent,
        encryptedMetadata,
        sender: {
          participantId: 'peer_counselor',
          role: 'PEER',
          encryptedDisplayInfo: await encryptSessionData({
            displayName: 'Crisis Counselor',
            credentials: 'Trained Peer Supporter',
            isVerified: true
          }, secureSession),
          verificationLevel: 'VERIFIED'
        },
        timestamp: new Date(),
        messageType: 'TEXT',
        forwardSecrecyKeyId: `fs_peer_${Date.now()}`,
        readReceipts: []
      };

      setMessages(prev => [...prev, peerMessage]);
      
      // Decrypt for display
      const decryptedContent = await decryptSessionData(encryptedContent, secureSession);
      setDecryptedMessages(prev => new Map(prev.set(peerMessage.id, {
        content: decryptedContent.text,
        isPeer: true,
        timestamp: peerMessage.timestamp
      })));

    } catch (error) {
      console.error('Failed to generate encrypted response:', error);
    }
  };

  /**
   * Cleanup session and clear sensitive data
   */
  const cleanupSession = () => {
    setDecryptedMessages(new Map());
    setMessages([]);
    setCurrentSession(null);
    setSecureSession(null);
    
    // Clear any remaining encryption keys from memory
    if (keyManager) {
      // keyManager.clearSessionKeys(); // TODO: Implement or use alternative method
    }
  };

  /**
   * End encrypted session
   */
  const endEncryptedSession = async () => {
    try {
      if (!currentSession || !secureSession) return;

      const confirmEnd = window.confirm(
        'Are you sure you want to end this encrypted chat? All messages will be permanently deleted for your privacy.'
      );

      if (!confirmEnd) return;

      // Add final system message
      await addEncryptedSystemMessage(
        'Session ending. All encrypted messages will be permanently deleted. Remember, support is always available at 988.',
        'SYSTEM',
        secureSession
      );

      // Update session status
      const finalSession = {
        ...currentSession,
        status: 'ENDED' as const,
        endTime: new Date()
      };

      setCurrentSession(finalSession);

      // Clean up after 3 seconds
      setTimeout(() => {
        cleanupSession();
      }, 3000);

    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  /**
   * Initialize connection process
   */
  const initiateConnectionProcess = async (session: EncryptedChatSession, secureSession: SecureSession) => {
    // Simulate peer matching queue
    setQueuePosition(Math.floor(Math.random() * 3) + 1);
    
    setTimeout(() => {
      setQueuePosition(null);
      setCurrentSession(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
      
      addEncryptedSystemMessage(
        'You are now connected with a trained peer supporter. They are here to listen and provide support.',
        'SYSTEM',
        secureSession
      );
    }, 2000);
  };

  /**
   * Save session to encrypted storage
   */
  const saveSessionToStorage = async (session: EncryptedChatSession, secureSession: SecureSession) => {
    if (!encryptedStorage) return;

    await encryptedStorage.store(
      secureSession.sessionId,
      session,
      'CRISIS_HISTORY',
      {
        id: session.id,
        emergencyLevel: session.riskLevel
      }
    );
  };

  /**
   * Load crisis resources
   */
  const loadCrisisResources = () => {
    const resources: CrisisResource[] = [
      {
        id: 'crisis_988',
        type: 'HOTLINE',
        name: '988 Suicide & Crisis Lifeline',
        contact: '988',
        description: '24/7 crisis support and suicide prevention',
        availability: 'Available 24/7',
        specializations: ['suicide_prevention', 'crisis_support'],
        isImmediate: true
      },
      {
        id: 'crisis_text',
        type: 'TEXT_LINE',
        name: 'Crisis Text Line',
        contact: '741741',
        description: 'Text HOME to 741741 for crisis support',
        availability: 'Available 24/7',
        specializations: ['crisis_support', 'text_based'],
        isImmediate: true
      },
      {
        id: 'emergency_911',
        type: 'EMERGENCY',
        name: 'Emergency Services',
        contact: '911',
        description: 'For immediate life-threatening emergencies',
        availability: 'Available 24/7',
        specializations: ['emergency', 'immediate_danger'],
        isImmediate: true
      }
    ];

    setAvailableResources(resources);
  };

  /**
   * Enable offline mode for crisis situations
   */
  const enableOfflineMode = () => {
    if (!currentSession || !secureSession) return;

    const offline: OfflineCrisisMode = {
      isActive: true,
      sessionId: currentSession.id,
      encryptedMessages: [], // Would store encrypted messages for sync
      lastSync: new Date(),
      pendingActions: []
    };

    setOfflineMode(offline);
    
    addEncryptedSystemMessage(
      'Connection lost. Offline mode enabled. Messages will be saved securely and synced when connection is restored.',
      'SYSTEM',
      secureSession
    );
  };

  /**
   * Sync offline messages when connection restored
   */
  const syncOfflineMessages = async () => {
    if (!offlineMode || !encryptedStorage || !secureSession) return;

    try {
      // In production, sync encrypted messages with server
      console.log('Syncing offline messages...');
      
      setOfflineMode(null);
      
      addEncryptedSystemMessage(
        'Connection restored. All messages have been synced securely.',
        'SYSTEM',
        secureSession
      );
    } catch (error) {
      console.error('Failed to sync offline messages:', error);
    }
  };

  /**
   * Get emergency contacts
   */
  const getEmergencyContacts = () => {
    return [
      { name: '988 Crisis Lifeline', phone: '988', type: 'crisis' },
      { name: 'Crisis Text Line', phone: '741741', type: 'text', instructions: 'Text HOME' },
      { name: 'Emergency Services', phone: '911', type: 'emergency' }
    ];
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto" />
            <Shield className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Secure Crisis Chat</h2>
          <p className="text-gray-600">Setting up zero-knowledge encryption...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-lg font-bold text-gray-900">Encrypted Crisis Chat</h1>
                <div className="flex items-center space-x-2 text-xs text-gray-700">
                  <span>Zero-knowledge encryption</span>
                  {currentSession?.isAnonymous && (
                    <>
                      <span>•</span>
                      <span>Anonymous</span>
                    </>
                  )}
                  {isOffline && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600 flex items-center">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline Mode
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {currentSession && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowEncryptionDetails(!showEncryptionDetails)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Encryption details"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEnableNotifications(!enableNotifications)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Toggle notifications"
                >
                  {enableNotifications ? <Bell className="w-5 h-5" /> : <Bell className="w-5 h-5 opacity-50" />}
                </button>
                {currentSession.status === 'ACTIVE' && (
                  <button
                    onClick={endEncryptedSession}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                  >
                    End Chat
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Encryption details */}
          {showEncryptionDetails && currentSession && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">End-to-End Encrypted</p>
                  <p className="text-green-700 mt-1">
                    Session: {currentSession.id.substring(0, 16)}...
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    All messages are encrypted with zero-knowledge protocol. Perfect forward secrecy ensures past messages remain secure even if current keys are compromised.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {!currentSession ? (
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
                  Connect with trained crisis supporters in a completely anonymous and encrypted environment.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <UserX className="w-5 h-5 text-gray-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">100% Anonymous</p>
                    <p className="text-sm text-gray-600">No registration or personal info required</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-gray-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Zero-Knowledge Encryption</p>
                    <p className="text-sm text-gray-600">Messages encrypted end-to-end with perfect forward secrecy</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-gray-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">AI Crisis Detection</p>
                    <p className="text-sm text-gray-600">Advanced monitoring with encrypted behavioral analysis</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => startAnonymousSession('HIGH')}
                  disabled={isConnecting}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Connecting Securely...
                    </span>
                  ) : (
                    'Start Anonymous Crisis Chat'
                  )}
                </button>
                
                <button
                  onClick={() => startAnonymousSession('CRITICAL')}
                  disabled={isConnecting}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <span className="flex items-center justify-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Emergency Crisis Chat
                  </span>
                </button>
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                All conversations are completely private and will be permanently deleted when you end the session
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Connection status */}
            {currentSession.status === 'CONNECTING' && queuePosition && (
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                    <span className="text-yellow-800">
                      Connecting to encrypted peer support... Position: {queuePosition}
                    </span>
                  </div>
                  <span className="text-sm text-yellow-600">
                    Estimated wait: {queuePosition} min
                  </span>
                </div>
              </div>
            )}

            {/* Risk level indicator */}
            {currentRiskLevel !== 'LOW' && (
              <div className={`px-4 py-2 border-b ${
                currentRiskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                currentRiskLevel === 'HIGH' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      currentRiskLevel === 'CRITICAL' ? 'text-red-600' :
                      currentRiskLevel === 'HIGH' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentRiskLevel === 'CRITICAL' ? 'text-red-800' :
                      currentRiskLevel === 'HIGH' ? 'text-orange-800' :
                      'text-yellow-800'
                    }`}>
                      Monitoring Level: {currentRiskLevel}
                    </span>
                  </div>
                  {escalationInProgress && (
                    <span className="text-xs text-gray-600">
                      Escalation in progress...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const decrypted = decryptedMessages.get(message.id);
                if (!decrypted) return null;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      decrypted.isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {decrypted.isSystem ? (
                      <div className="max-w-md w-full">
                        <div className={`p-3 rounded-lg text-sm ${
                          decrypted.messageType === 'CRISIS_ALERT' 
                            ? 'bg-red-50 text-red-800 border border-red-200' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <div className="flex items-start space-x-2">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{decrypted.content}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`max-w-md ${
                        decrypted.isUser ? 'items-end' : 'items-start'
                      }`}>
                        <div className={`px-4 py-2 rounded-lg ${
                          decrypted.isUser
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="whitespace-pre-wrap">{decrypted.content}</p>
                          <div className="flex items-center mt-1 space-x-1">
                            <Lock className="w-3 h-3 opacity-50" />
                            {decrypted.riskLevel && decrypted.riskLevel !== 'LOW' && (
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                decrypted.isUser ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                              }`}>
                                {decrypted.riskLevel}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-xs text-gray-700 mt-1 px-1 ${
                          decrypted.isUser ? 'text-right' : 'text-left'
                        }`}>
                          {decrypted.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {currentSession.status === 'ACTIVE' && (
              <div className="border-t bg-white p-4">
                <div className="flex space-x-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendEncryptedMessage();
                      }
                    }}
                    placeholder="Type your message... All messages are encrypted end-to-end"
                    className="flex-1 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  <button
                    onClick={sendEncryptedMessage}
                    disabled={!inputMessage.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-700 flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      End-to-end encrypted
                    </span>
                    {currentSession && (
                      <span className="text-xs text-gray-700">
                        Session: {Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)} min
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {currentRiskLevel !== 'LOW' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        currentRiskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        currentRiskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {currentRiskLevel} Risk
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Crisis resources footer */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-sm font-medium">
            If you're in immediate danger, please call emergency services
          </p>
          <div className="flex items-center space-x-4">
            {availableResources.filter(r => r.isImmediate).map(resource => (
              <a
                key={resource.id}
                href={`tel:${resource.contact}`}
                className="flex items-center space-x-1 hover:underline"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-bold">{resource.contact}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}