import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Brain, Smile, Frown, Meh, User, Bot, Volume2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { tokens } from '../../design-tokens/tokens';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'therapist' | 'system';
  timestamp: Date;
  emotion?: 'positive' | 'negative' | 'neutral';
  therapeutic_note?: string;
  exercises?: string[];
}

interface TherapeuticChatProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  onMessageFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful') => void;
  therapistName?: string;
  enableVoice?: boolean;
  enableEmotionTracking?: boolean;
  showTherapeuticNotes?: boolean;
  className?: string;
}

export const TherapeuticChat: React.FC<TherapeuticChatProps> = ({
  messages = [],
  onSendMessage,
  onMessageFeedback,
  therapistName = "Dr. Sarah",
  enableVoice = true,
  enableEmotionTracking = true,
  showTherapeuticNotes = false,
  className,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = () => {
    if (inputMessage.trim() && onSendMessage) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      setIsTyping(true);
      
      // Simulate therapist typing
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Emotion tracking colors
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  // Text-to-speech functionality
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full max-h-[600px] bg-white rounded-xl shadow-lg border border-gray-200",
      className
    )}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span 
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
              aria-label="Online status indicator"
            ></span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{therapistName}</h3>
            <p className="text-sm text-gray-600">AI Therapist • Online</p>
          </div>
        </div>

        {/* Emotion Tracker */}
        {enableEmotionTracking && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">How are you feeling?</span>
            <div className="flex space-x-1">
              {[
                { emotion: 'positive', icon: Smile, color: 'text-green-500' },
                { emotion: 'neutral', icon: Meh, color: 'text-yellow-500' },
                { emotion: 'negative', icon: Frown, color: 'text-red-500' },
              ].map(({ emotion, icon: Icon, color }) => (
                <button
                  key={emotion}
                  onClick={() => setCurrentEmotion(emotion as any)}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200 hover:bg-gray-100",
                    currentEmotion === emotion && "bg-gray-100 ring-2 ring-blue-500",
                    color
                  )}
                  aria-label={`Set emotion to ${emotion}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* Message Bubble */}
            <div className={cn(
              "flex items-start space-x-3",
              message.sender === 'user' ? "flex-row-reverse space-x-reverse" : ""
            )}>
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.sender === 'user' 
                  ? "bg-gradient-to-r from-green-500 to-blue-500" 
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              )}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl",
                message.sender === 'user'
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  : "bg-gray-100 text-gray-900 border border-gray-200"
              )}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Emotion Indicator */}
                {message.emotion && enableEmotionTracking && (
                  <div className={cn(
                    "inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full border text-xs",
                    getEmotionColor(message.emotion)
                  )}>
                    <Heart className="w-3 h-3" />
                    <span>{message.emotion}</span>
                  </div>
                )}

                {/* Therapeutic Note */}
                {message.therapeutic_note && showTherapeuticNotes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 italic">
                      💡 {message.therapeutic_note}
                    </p>
                  </div>
                )}

                {/* Message Actions */}
                {message.sender === 'therapist' && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex space-x-1">
                      {enableVoice && (
                        <button
                          onClick={() => speakMessage(message.content)}
                          className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                          aria-label="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(message.content)}
                        className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                        aria-label="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Feedback Buttons */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onMessageFeedback?.(message.id, 'helpful')}
                        className="p-1 text-gray-500 hover:text-green-500 transition-colors"
                        aria-label="Mark as helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMessageFeedback?.(message.id, 'not_helpful')}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Mark as not helpful"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Exercises */}
            {message.exercises && message.exercises.length > 0 && (
              <div className="ml-11 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Suggested exercises:</p>
                <div className="flex flex-wrap gap-2">
                  {message.exercises.map((exercise, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs border border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      {exercise}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32"
              rows={1}
              aria-label="Type your message to the therapist"
              aria-describedby="message-input-help"
              style={{ 
                fontSize: '16px', // Prevents zoom on iOS
                lineHeight: '1.5',
              }}
            />
            <div id="message-input-help" className="sr-only">
              Type your message and press Enter to send, or Shift+Enter for a new line
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 min-h-[48px] min-w-[48px]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              inputMessage.trim()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Responses */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "I'm feeling anxious",
            "I need help coping",
            "Can we do a breathing exercise?",
            "I had a difficult day",
          ].map((quickResponse, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(quickResponse)}
              className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              {quickResponse}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapeuticChat;