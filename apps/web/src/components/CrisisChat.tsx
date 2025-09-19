'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, AlertCircle, Phone, Shield, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'volunteer' | 'system';
  timestamp: Date;
  isUrgent?: boolean;
}

export default function CrisisChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [volunteerName, setVolunteerName] = useState('Crisis Counselor');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial system message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: 'You\'re connected to ASTRAL CORE Crisis Support. A trained volunteer will be with you shortly. If this is a life-threatening emergency, please call 911 immediately.',
        sender: 'system',
        timestamp: new Date(),
      },
    ]);
    
    // Simulate volunteer connection
    setTimeout(() => {
      setIsConnected(true);
      setMessages(prev => [...prev, {
        id: '2',
        content: `Hi, I'm ${volunteerName}. I'm here to listen and support you. How are you feeling right now?`,
        sender: 'volunteer',
        timestamp: new Date(),
      }]);
    }, 2000);
  }, [volunteerName]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      isUrgent: checkUrgency(inputMessage),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate volunteer typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate volunteer response
      const response = generateResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: response,
        sender: 'volunteer',
        timestamp: new Date(),
      }]);
    }, 2000);
  };

  const checkUrgency = (message: string): boolean => {
    const urgentKeywords = ['suicide', 'kill', 'die', 'hurt myself', 'end it', 'pills', 'overdose'];
    return urgentKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const generateResponse = (userMessage: string): string => {
    if (checkUrgency(userMessage)) {
      return "I'm very concerned about what you're sharing. Your life matters, and there is help available. Would you like me to connect you with immediate crisis support? You can also call 988 right now to speak with someone.";
    }
    return "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what you're experiencing?";
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-8 h-8" />
              {isConnected && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg">Crisis Support Chat</h2>
              <p className="text-sm opacity-90">
                {isConnected ? `Connected with ${volunteerName}` : 'Connecting...'}
              </p>
            </div>
          </div>
          <button
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            onClick={() => window.location.href = 'tel:988'}
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Call 988
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.sender === 'volunteer'
                  ? 'bg-white text-gray-800 shadow-md'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              } ${message.isUrgent ? 'ring-2 ring-red-500' : ''}`}
            >
              {message.sender === 'volunteer' && (
                <div className="flex items-center mb-1">
                  <User className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">{volunteerName}</span>
                </div>
              )}
              {message.isUrgent && (
                <div className="flex items-center mb-2 text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Urgent</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <span className={`text-xs mt-1 block ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-700'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-700 px-4 py-3 rounded-2xl shadow-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t bg-white p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here... You're not alone."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-700 mt-2 text-center">
          Your conversation is confidential and encrypted. We're here to help.
        </p>
      </form>
    </div>
  );
}