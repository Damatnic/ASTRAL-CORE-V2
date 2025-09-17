import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, Phone, Video, Paperclip, Smile, AlertCircle, 
  Heart, Shield, User, Bot, Clock, CheckCheck, Check 
} from 'lucide-react';
import { useEmotionTheme } from '../../providers/EmotionThemeProvider';
import { tokens } from '../../design-tokens/tokens';
import { cn } from '../../lib/utils';

// Message types and interfaces
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'volunteer' | 'bot' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  emotionalTone?: 'crisis' | 'distressed' | 'anxious' | 'calm' | 'hopeful';
  metadata?: {
    urgencyScore?: number;
    interventionSuggested?: boolean;
    escalationRequired?: boolean;
  };
}

interface Participant {
  id: string;
  name: string;
  role: 'client' | 'volunteer' | 'counselor' | 'supervisor';
  status: 'online' | 'away' | 'busy' | 'offline';
  avatar?: string;
  specializations?: string[];
  responseTime?: number; // Average in seconds
}

interface ChatSession {
  id: string;
  startTime: Date;
  participants: Participant[];
  status: 'active' | 'waiting' | 'escalated' | 'resolved';
  urgencyLevel: 'immediate' | 'high' | 'moderate' | 'low';
  interventionType?: 'peer' | 'volunteer' | 'professional' | 'emergency';
}

interface CrisisChatInterfaceProps {
  session?: ChatSession;
  onSendMessage?: (message: string) => void;
  onEscalate?: () => void;
  onEndSession?: () => void;
  className?: string;
}

export const CrisisChatInterface: React.FC<CrisisChatInterfaceProps> = ({
  session,
  onSendMessage,
  onEscalate,
  onEndSession,
  className,
}) => {
  const { 
    emotionalState, 
    urgencyLevel, 
    theme, 
    detectEmotionalState, 
    updateEmotionalState,
    getInterventionRecommendation 
  } = useEmotionTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect emotion from input and provide real-time feedback
  useEffect(() => {
    if (inputValue.length > 10) {
      const detected = detectEmotionalState(inputValue);
      if (detected !== emotionalState) {
        updateEmotionalState(detected);
        if (detected === 'crisis' || detected === 'distressed') {
          setShowEmotionFeedback(true);
        }
      }
    }
  }, [inputValue, detectEmotionalState, emotionalState, updateEmotionalState]);

  // Handle message sending
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      emotionalTone: emotionalState as any,
      metadata: {
        urgencyScore: urgencyLevel === 'immediate' ? 10 : 
                     urgencyLevel === 'high' ? 7 : 
                     urgencyLevel === 'moderate' ? 5 : 2,
      },
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setShowEmotionFeedback(false);

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    if (onSendMessage) {
      onSendMessage(inputValue);
    }

    // Simulate volunteer response
    setTimeout(() => {
      setTypingIndicator('Sarah (Crisis Volunteer)');
      setTimeout(() => {
        setTypingIndicator(null);
        const volunteerResponse: Message = {
          id: `msg-${Date.now()}-volunteer`,
          content: getAutomatedResponse(emotionalState),
          sender: 'volunteer',
          timestamp: new Date(),
          status: 'delivered',
        };
        setMessages(prev => [...prev, volunteerResponse]);
      }, 2000);
    }, 1500);
  }, [inputValue, emotionalState, urgencyLevel, onSendMessage]);

  // Get automated response based on emotional state
  const getAutomatedResponse = (state: string): string => {
    const responses = {
      crisis: "I can see you're going through something really difficult right now. Your safety is my top priority. Would you like me to connect you with immediate professional support?",
      distressed: "I hear how overwhelmed you're feeling. You're not alone in this. Let's work through this together. What's happening right now?",
      anxious: "It sounds like you're dealing with a lot of anxiety. That can be really challenging. Would you like to try some grounding techniques together?",
      depressed: "Thank you for reaching out. Depression can make everything feel heavy. I'm here to listen and support you. How long have you been feeling this way?",
      calm: "I'm glad you're here. How can I support you today?",
      hopeful: "It's wonderful to hear some hope in your words. What's been helping you feel this way?",
      neutral: "Thank you for connecting. I'm here to listen and support you. What brings you here today?",
    };
    return responses[state as keyof typeof responses] || responses.neutral;
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Notify server that user is typing
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Notify server that user stopped typing
    }, 1000);
  };

  // Message status icon
  const MessageStatus: React.FC<{ status: Message['status'] }> = ({ status }) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden',
      theme.layout.simplified && 'simplified-chat',
      className
    )}>
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold">Crisis Support Chat</h3>
              <p className="text-xs text-blue-100">
                {session?.participants.find(p => p.role === 'volunteer')?.name || 'Connecting to volunteer...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Start voice call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Start video call"
            >
              <Video className="w-5 h-5" />
            </button>
            {urgencyLevel === 'immediate' && (
              <button
                onClick={onEscalate}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full text-sm font-medium transition-colors"
                aria-label="Escalate to emergency services"
              >
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Escalate
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus !== 'connected' && (
          <div className="mt-2 text-xs text-blue-100 flex items-center">
            {connectionStatus === 'connecting' ? (
              <>
                <span className="animate-pulse">Connecting...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Connection lost. Reconnecting...
              </>
            )}
          </div>
        )}
      </div>

      {/* Emotion Feedback Bar */}
      {showEmotionFeedback && emotionalState === 'crisis' && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">
                We're here to help. Your safety is our priority.
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors"
                onClick={() => window.location.href = 'tel:988'}
              >
                Call 988
              </button>
              <button
                className="text-xs bg-white text-red-600 border border-red-300 px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
                onClick={onEscalate}
              >
                Get Immediate Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Welcome to Crisis Support</p>
            <p className="text-sm">You're not alone. We're here to listen and help.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-3',
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.sender === 'system'
                    ? 'bg-gray-100 text-gray-600 italic'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {message.sender !== 'user' && (
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === 'bot' ? (
                      <Bot className="w-4 h-4 text-gray-500" />
                    ) : (
                      <User className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-xs font-medium text-gray-500">
                      {message.sender === 'volunteer' ? 'Crisis Volunteer' : 'System'}
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn(
                    'text-xs',
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  )}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.sender === 'user' && (
                    <MessageStatus status={message.status} />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingIndicator && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm">{typingIndicator} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-3">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message... (Press Enter to send)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              aria-label="Message input"
            />
            
            {/* Emotion Indicator */}
            {inputValue.length > 10 && (
              <div className={cn(
                'absolute right-2 top-3 text-xs px-2 py-1 rounded-full',
                emotionalState === 'crisis' ? 'bg-red-100 text-red-600' :
                emotionalState === 'distressed' ? 'bg-orange-100 text-orange-600' :
                emotionalState === 'anxious' ? 'bg-purple-100 text-purple-600' :
                emotionalState === 'calm' ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              )}>
                {emotionalState}
              </div>
            )}
          </div>

          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={cn(
              'p-3 rounded-xl transition-all',
              inputValue.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Responses */}
        {messages.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInputValue("I need someone to talk to")}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              I need someone to talk to
            </button>
            <button
              onClick={() => setInputValue("I'm feeling overwhelmed")}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              I'm feeling overwhelmed
            </button>
            <button
              onClick={() => setInputValue("I'm having thoughts of self-harm")}
              className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-full text-red-700 transition-colors"
            >
              I'm in crisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisChatInterface;