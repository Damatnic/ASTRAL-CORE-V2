/**
 * ASTRAL_CORE 2.0 Crisis Chat Interface
 * 
 * LIFE-CRITICAL CHAT INTERFACE
 * This component handles the most sensitive conversations on the platform.
 * Designed for people in crisis with maximum accessibility and emotional safety.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Heart, 
  Shield, 
  Clock,
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CrisisChatMessage {
  id: string;
  content: string;
  senderType: 'user' | 'volunteer' | 'system';
  timestamp: Date;
  isEncrypted?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
}

interface CrisisChatProps {
  /** Chat session ID */
  sessionId: string;
  /** Whether user is anonymous */
  isAnonymous?: boolean;
  /** Initial messages */
  initialMessages?: CrisisChatMessage[];
  /** Volunteer information when connected */
  volunteer?: {
    id: string;
    name: string;
    specializations?: string[];
    responseTime?: number;
  };
  /** Connection status */
  connectionStatus: 'connecting' | 'connected' | 'volunteer_assigned' | 'disconnected';
  /** Callback for sending messages */
  onSendMessage: (message: string) => Promise<void>;
  /** Callback for emergency escalation */
  onEmergencyEscalation: () => void;
  /** Callback for ending chat */
  onEndChat: () => void;
  /** Show emergency resources */
  showEmergencyResources?: boolean;
  /** Response time target */
  responseTimeTarget?: number;
  /** WCAG compliance level */
  accessibilityLevel?: 'AA' | 'AAA';
}

export const CrisisChat: React.FC<CrisisChatProps> = ({
  sessionId,
  isAnonymous = true,
  initialMessages = [],
  volunteer,
  connectionStatus,
  onSendMessage,
  onEmergencyEscalation,
  onEndChat,
  showEmergencyResources = true,
  responseTimeTarget = 200,
  accessibilityLevel = 'AAA',
}) => {
  const [messages, setMessages] = useState<CrisisChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end' 
    });
  }, [messages]);
  
  // Focus input on mount for immediate interaction
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isSending) return;
    
    const message = inputMessage.trim();
    const messageId = crypto.randomUUID();
    
    // Add message to UI immediately for responsiveness
    const userMessage: CrisisChatMessage = {
      id: messageId,
      content: message,
      senderType: 'user',
      timestamp: new Date(),
      isEncrypted: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);
    
    try {
      await onSendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: CrisisChatMessage = {
        id: crypto.randomUUID(),
        content: 'Message failed to send. Your safety is our priority - please try again or call 988 if this is an emergency.',
        senderType: 'system',
        timestamp: new Date(),
        urgencyLevel: 'high',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, onSendMessage]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Emergency hotkey (Ctrl/Cmd + E)
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      handleEmergencyEscalation();
    }
  };
  
  const handleEmergencyEscalation = () => {
    setEmergencyMode(true);
    onEmergencyEscalation();
    
    // Add emergency message
    const emergencyMessage: CrisisChatMessage = {
      id: crypto.randomUUID(),
      content: '🚨 Emergency mode activated. A crisis specialist is being connected immediately.',
      senderType: 'system',
      timestamp: new Date(),
      urgencyLevel: 'emergency',
    };
    
    setMessages(prev => [...prev, emergencyMessage]);
  };
  
  // Message component with accessibility optimizations
  const ChatMessage: React.FC<{ message: CrisisChatMessage }> = ({ message }) => {
    const isUser = message.senderType === 'user';
    const isSystem = message.senderType === 'system';
    const isEmergency = message.urgencyLevel === 'emergency';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex w-full mb-4',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-[80%] rounded-2xl px-4 py-3 break-words',
            // High contrast colors for WCAG AAA compliance
            isUser && 'bg-blue-600 text-white ml-auto',
            isSystem && isEmergency && 'bg-red-100 text-red-900 border-2 border-red-400',
            isSystem && !isEmergency && 'bg-gray-100 text-gray-900 border border-gray-300',
            !isUser && !isSystem && 'bg-white text-gray-900 border border-gray-200 shadow-sm',
          )}
          role={isSystem ? 'alert' : 'log'}
          aria-live={isSystem ? 'assertive' : 'polite'}
        >
          {/* Message header for non-user messages */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-600">
              {isSystem ? (
                <>
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  <span>System Message</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
                  <span>{volunteer?.name || 'Crisis Volunteer'}</span>
                  {message.isEncrypted && (
                    <Lock className="w-3 h-3 text-green-600" aria-hidden="true" />
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Message content */}
          <div className={cn(
            'leading-relaxed',
            accessibilityLevel === 'AAA' && 'text-base', // Larger text for AAA
            isEmergency && 'font-semibold'
          )}>
            {message.content}
          </div>
          
          {/* Message timestamp */}
          <div className="mt-2 text-xs opacity-75">
            <time dateTime={message.timestamp.toISOString()}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </time>
            {message.isEncrypted && (
              <span className="ml-2 text-green-600" title="End-to-end encrypted">
                🔒
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Connection status indicator
  const ConnectionStatus: React.FC = () => (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg mb-4',
      connectionStatus === 'connected' && 'bg-green-100 text-green-800',
      connectionStatus === 'connecting' && 'bg-yellow-100 text-yellow-800',
      connectionStatus === 'volunteer_assigned' && 'bg-blue-100 text-blue-800',
      connectionStatus === 'disconnected' && 'bg-red-100 text-red-800'
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        connectionStatus === 'connected' && 'bg-green-500 animate-pulse',
        connectionStatus === 'connecting' && 'bg-yellow-500 animate-pulse',
        connectionStatus === 'volunteer_assigned' && 'bg-blue-500',
        connectionStatus === 'disconnected' && 'bg-red-500'
      )} />
      
      {connectionStatus === 'connecting' && 'Connecting to help...'}
      {connectionStatus === 'connected' && 'Connected - Help is available'}
      {connectionStatus === 'volunteer_assigned' && `Connected with ${volunteer?.name || 'crisis volunteer'}`}
      {connectionStatus === 'disconnected' && 'Connection lost - Reconnecting...'}
    </div>
  );
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header with emergency actions */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Heart className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Crisis Support Chat
              </h1>
              <p className="text-sm text-gray-600">
                {isAnonymous ? 'Anonymous & Encrypted' : 'Secure Connection'}
              </p>
            </div>
          </div>
          
          {/* Emergency escalation button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEmergencyEscalation}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              'bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-200',
              'transition-colors duration-200',
              emergencyMode && 'animate-pulse bg-red-700'
            )}
            aria-label="Emergency escalation - get immediate crisis intervention"
          >
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            {emergencyMode ? 'Emergency Active' : 'Emergency'}
          </motion.button>
        </div>
        
        <ConnectionStatus />
      </div>
      
      {/* Messages area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Crisis chat messages"
        aria-live="polite"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-gray-500 text-sm"
          >
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </div>
            <span>{volunteer?.name || 'Volunteer'} is typing...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="message-input" className="sr-only">
              Type your message (Press Enter to send, Ctrl+E for emergency)
            </label>
            <textarea
              ref={inputRef}
              id="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... You're not alone."
              className={cn(
                'w-full p-3 border border-gray-300 rounded-xl resize-none',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'placeholder-gray-500 text-gray-900',
                accessibilityLevel === 'AAA' && 'text-base min-h-[3rem]'
              )}
              rows={3}
              maxLength={2000}
              aria-describedby="message-help"
              disabled={connectionStatus === 'disconnected'}
            />
            <div id="message-help" className="mt-1 text-xs text-gray-500">
              Press Enter to send • Ctrl+E for emergency • All messages encrypted
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending || connectionStatus === 'disconnected'}
            className={cn(
              'flex items-center justify-center p-3 rounded-xl',
              'bg-blue-600 text-white hover:bg-blue-700',
              'focus:ring-4 focus:ring-blue-200 transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-w-[48px] min-h-[48px]' // Accessibility: minimum touch target
            )}
            aria-label={isSending ? 'Sending message...' : 'Send message'}
          >
            {isSending ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
          </motion.button>
        </div>
        
        {/* Emergency resources */}
        {showEmergencyResources && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">
              In immediate danger? Don't wait:
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <a
                href="tel:988"
                className="flex items-center gap-1 text-red-700 hover:text-red-900 underline focus:ring-2 focus:ring-red-500 rounded px-1"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                Call 988
              </a>
              <a
                href="sms:741741"
                className="flex items-center gap-1 text-red-700 hover:text-red-900 underline focus:ring-2 focus:ring-red-500 rounded px-1"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Text 741741
              </a>
              <a
                href="tel:911"
                className="flex items-center gap-1 text-red-700 hover:text-red-900 underline focus:ring-2 focus:ring-red-500 rounded px-1"
              >
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                Call 911
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};