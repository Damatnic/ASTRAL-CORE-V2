'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, Phone, AlertTriangle, Heart, Shield, 
  User, Bot, Clock, CheckCircle, AlertCircle,
  Loader2, HelpCircle, ChevronDown, Mic, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'volunteer' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isUrgent?: boolean;
}

interface VolunteerInfo {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'offline';
  responseTime: string;
  specialties: string[];
  avatar?: string;
}

// Crisis Assessment Component
const CrisisAssessment: React.FC<{ onComplete: (level: string) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [urgency, setUrgency] = useState<string>('');
  
  const questions = [
    {
      id: 'safety',
      question: 'Are you safe right now?',
      options: [
        { value: 'yes', label: 'Yes, I\'m safe', level: 'low' },
        { value: 'unsure', label: 'I\'m not sure', level: 'medium' },
        { value: 'no', label: 'No, I need immediate help', level: 'crisis' }
      ]
    },
    {
      id: 'support',
      question: 'What kind of support would help you most?',
      options: [
        { value: 'talk', label: 'Someone to talk to', level: 'low' },
        { value: 'coping', label: 'Coping strategies', level: 'medium' },
        { value: 'emergency', label: 'Emergency intervention', level: 'crisis' }
      ]
    }
  ];
  
  const currentQuestion = questions[step];
  
  const handleAnswer = (option: any) => {
    if (option.level === 'crisis') {
      onComplete('crisis');
      return;
    }
    
    if (step < questions.length - 1) {
      setStep(step + 1);
      setUrgency(option.level);
    } else {
      onComplete(urgency || option.level);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Quick Check-In</h3>
          <span className="text-sm text-gray-700">Step {step + 1} of {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
        <div className="space-y-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                option.level === 'crisis' 
                  ? 'border-red-200 hover:border-red-500 hover:bg-red-50' 
                  : 'border-gray-200'
              }`}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Skip to emergency */}
      <div className="text-center">
        <button
          onClick={() => onComplete('crisis')}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          I need immediate help →
        </button>
      </div>
    </motion.div>
  );
};

// Quick Response Buttons
const QuickResponses: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => {
  const responses = [
    'I\'m feeling overwhelmed',
    'I need someone to talk to',
    'I\'m having anxiety',
    'I\'m feeling sad',
    'I need coping strategies',
    'Just checking in'
  ];
  
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-t">
      {responses.map((response) => (
        <button
          key={response}
          onClick={() => onSelect(response)}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm hover:bg-blue-50 hover:border-blue-500 transition-colors"
        >
          {response}
        </button>
      ))}
    </div>
  );
};

// Message Component
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {!isSystem && (
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {isUser ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Heart className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        )}
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {isSystem && (
            <div className="flex items-center gap-1 text-xs text-gray-700 mb-1">
              <Bot className="w-3 h-3" />
              <span>System</span>
            </div>
          )}
          
          <div className={`rounded-2xl px-4 py-2 ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : isSystem 
                ? 'bg-gray-100 text-gray-700 italic'
                : 'bg-white border border-gray-200 text-gray-900'
          } ${message.isUrgent ? 'ring-2 ring-red-500' : ''}`}>
            {message.content}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {isUser && message.status && (
              <span className="text-xs text-gray-600">
                {message.status === 'read' && <CheckCircle className="w-3 h-3 text-blue-500" />}
                {message.status === 'delivered' && <CheckCircle className="w-3 h-3 text-gray-600" />}
                {message.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Crisis Chat Component
export default function OptimizedCrisisChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [volunteer, setVolunteer] = useState<VolunteerInfo | null>(null);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle assessment completion
  const handleAssessmentComplete = (level: string) => {
    setUrgencyLevel(level);
    setAssessmentComplete(true);
    
    if (level === 'crisis') {
      // Immediate crisis response
      setMessages([{
        id: Date.now().toString(),
        content: '🚨 Connecting you to crisis support immediately. A trained counselor will be with you in moments.',
        sender: 'system',
        timestamp: new Date(),
        isUrgent: true
      }]);
      connectToVolunteer(true);
    } else {
      // Regular connection
      setMessages([{
        id: Date.now().toString(),
        content: 'Thank you for checking in. Connecting you with a volunteer...',
        sender: 'system',
        timestamp: new Date()
      }]);
      connectToVolunteer(false);
    }
  };
  
  // Connect to volunteer
  const connectToVolunteer = (urgent: boolean) => {
    setIsConnecting(true);
    
    // Simulate connection (replace with real WebSocket/API)
    setTimeout(() => {
      const newVolunteer: VolunteerInfo = {
        id: '1',
        name: urgent ? 'Crisis Counselor Sarah' : 'Peer Support Alex',
        status: 'online',
        responseTime: urgent ? '< 1 min' : '2-3 mins',
        specialties: urgent 
          ? ['Crisis Intervention', 'Suicide Prevention', 'Trauma']
          : ['Anxiety', 'Depression', 'Stress Management']
      };
      
      setVolunteer(newVolunteer);
      setIsConnecting(false);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Hi, I'm ${newVolunteer.name}. I'm here to support you. How are you feeling right now?`,
        sender: 'volunteer',
        timestamp: new Date()
      }]);
    }, urgent ? 1000 : 3000);
  };
  
  // Send message
  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 500);
    
    // Simulate volunteer typing
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate volunteer response
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: 'Thank you for sharing that with me. I hear that you\'re going through a difficult time.',
          sender: 'volunteer',
          timestamp: new Date()
        }]);
      }, 2000);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="font-semibold text-gray-900">Crisis Support Chat</h1>
                <p className="text-xs text-gray-700">Confidential & Free</p>
              </div>
            </div>
            
            {volunteer && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{volunteer.name}</p>
                  <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
                <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-64px)]">
        {/* Assessment or Messages */}
        {!assessmentComplete ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <CrisisAssessment onComplete={handleAssessmentComplete} />
          </div>
        ) : (
          <>
            {/* Connection Status */}
            {isConnecting && (
              <div className="bg-blue-50 border-b border-blue-200 p-3">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">
                    {urgencyLevel === 'crisis' 
                      ? 'Prioritizing your connection...' 
                      : 'Connecting you to a volunteer...'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm">{volunteer?.name} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick Responses */}
            {volunteer && !inputValue && (
              <QuickResponses onSelect={setInputValue} />
            )}
            
            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <button className="p-2 text-gray-700 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <button className="p-2 text-gray-700 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Safety Notice */}
              <p className="text-xs text-gray-700 mt-2 text-center">
                Your safety is our priority. In immediate danger? Call 911 or 988.
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Floating Emergency Button */}
      <a
        href="tel:988"
        className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all hover:scale-110 z-50"
        aria-label="Call 988 Crisis Hotline"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}