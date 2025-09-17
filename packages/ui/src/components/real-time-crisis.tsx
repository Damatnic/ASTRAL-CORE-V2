import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Button, Input, Badge, Alert } from './base';
import { StatusIndicator, CrisisScale } from './crisis-intervention';

// Enhanced Crisis Chat Interface
export interface EnhancedCrisisChatProps {
  sessionId: string;
  messages: {
    id: string;
    content: string;
    sender: 'client' | 'volunteer' | 'system';
    timestamp: Date;
    urgencyLevel?: 1 | 2 | 3 | 4 | 5;
    isEncrypted?: boolean;
  }[];
  currentUser: 'client' | 'volunteer';
  connectionStatus: 'connecting' | 'connected' | 'volunteer_assigned' | 'emergency' | 'disconnected';
  volunteerInfo?: {
    name: string;
    specializations: string[];
    responseTime: number;
  };
  onSendMessage: (message: string, urgencyLevel?: number) => void;
  onEmergencyEscalation: () => void;
  onEndSession: () => void;
  isTyping?: boolean;
  className?: string;
}

export const EnhancedCrisisChat: React.FC<EnhancedCrisisChatProps> = ({
  sessionId,
  messages,
  currentUser,
  connectionStatus,
  volunteerInfo,
  onSendMessage,
  onEmergencyEscalation,
  onEndSession,
  isTyping = false,
  className
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when connected
  useEffect(() => {
    if (connectionStatus === 'connected' || connectionStatus === 'volunteer_assigned') {
      inputRef.current?.focus();
    }
  }, [connectionStatus]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage.trim(), urgencyLevel);
    setNewMessage('');
    setUrgencyLevel(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageSeverityStyle = (urgency?: number) => {
    if (!urgency || urgency <= 2) return 'border-l-gray-300';
    if (urgency === 3) return 'border-l-warning-400';
    return 'border-l-crisis-500';
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={cn('flex flex-col h-full bg-white rounded-lg shadow-sm border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Crisis Support Chat</h2>
          <div className="flex items-center space-x-4 mt-1">
            <StatusIndicator
              status={connectionStatus}
              responseTime={volunteerInfo?.responseTime}
            />
            {volunteerInfo && (
              <div className="text-sm text-gray-600">
                with {volunteerInfo.name}
                {volunteerInfo.specializations.length > 0 && (
                  <span className="ml-2">
                    ({volunteerInfo.specializations.join(', ')})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="crisis"
            size="sm"
            onClick={() => setShowEmergencyConfirm(true)}
            className="animate-pulse"
          >
            🆘 Emergency
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEndSession}
          >
            End Chat
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.sender === currentUser ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg border-l-4',
                message.sender === currentUser
                  ? 'bg-primary-500 text-white border-l-primary-700'
                  : message.sender === 'system'
                  ? 'bg-gray-100 text-gray-800 border-l-gray-400'
                  : 'bg-gray-50 text-gray-900',
                message.sender !== currentUser && getMessageSeverityStyle(message.urgencyLevel)
              )}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm">{message.content}</p>
                {message.urgencyLevel && message.urgencyLevel > 2 && (
                  <Badge
                    variant={message.urgencyLevel >= 4 ? 'crisis' : 'warning'}
                    size="sm"
                    className="ml-2 flex-shrink-0"
                  >
                    {message.urgencyLevel === 5 ? 'Emergency' : 
                     message.urgencyLevel === 4 ? 'Critical' : 'High'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-75">
                  {formatTime(message.timestamp)}
                </span>
                {message.isEncrypted && (
                  <span className="text-xs opacity-75">🔒</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 border-l-4 border-l-gray-300">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {volunteerInfo?.name || 'Volunteer'} is typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="border-t p-4 space-y-3">
        {/* Urgency Level Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 flex-shrink-0">Message urgency:</span>
          <CrisisScale
            currentLevel={urgencyLevel}
            onLevelChange={setUrgencyLevel}
            showLabels={false}
            className="flex-1"
          />
        </div>

        {/* Input and Send */}
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              connectionStatus === 'connected' || connectionStatus === 'volunteer_assigned'
                ? 'Type your message...'
                : 'Connecting to volunteer...'
            }
            disabled={connectionStatus !== 'connected' && connectionStatus !== 'volunteer_assigned'}
            className="flex-1"
            size="lg"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || (connectionStatus !== 'connected' && connectionStatus !== 'volunteer_assigned')}
            variant={urgencyLevel >= 4 ? 'crisis' : 'primary'}
            size="lg"
          >
            Send
          </Button>
        </div>

        {/* Connection Status Messages */}
        {connectionStatus === 'connecting' && (
          <Alert variant="default">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
              <span>Connecting you to a crisis volunteer...</span>
            </div>
          </Alert>
        )}
        
        {connectionStatus === 'disconnected' && (
          <Alert variant="warning" title="Connection Lost">
            We're trying to reconnect you. Your messages are being saved.
          </Alert>
        )}
      </div>

      {/* Emergency Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-crisis-800 mb-3">
              🚨 Emergency Escalation
            </h3>
            <p className="text-gray-700 mb-4">
              This will immediately escalate your case to emergency protocols and may involve contacting emergency services. Are you in immediate danger?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="crisis"
                onClick={() => {
                  onEmergencyEscalation();
                  setShowEmergencyConfirm(false);
                }}
                className="flex-1"
              >
                Yes, Emergency
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmergencyConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Real-time Crisis Dashboard for Volunteers
export interface CrisisDashboardProps {
  activeSessions: {
    id: string;
    clientId: string;
    urgencyLevel: 1 | 2 | 3 | 4 | 5;
    duration: number; // in minutes
    lastActivity: Date;
    status: 'waiting' | 'active' | 'escalated';
  }[];
  volunteerStats: {
    sessionsToday: number;
    averageResponseTime: number;
    specializations: string[];
    rating: number;
  };
  onAcceptSession: (sessionId: string) => void;
  onEscalateSession: (sessionId: string) => void;
  className?: string;
}

export const CrisisDashboard: React.FC<CrisisDashboardProps> = ({
  activeSessions,
  volunteerStats,
  onAcceptSession,
  onEscalateSession,
  className
}) => {
  const [sortBy, setSortBy] = useState<'urgency' | 'duration' | 'activity'>('urgency');

  const sortedSessions = [...activeSessions].sort((a, b) => {
    switch (sortBy) {
      case 'urgency':
        return b.urgencyLevel - a.urgencyLevel;
      case 'duration':
        return b.duration - a.duration;
      case 'activity':
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      default:
        return 0;
    }
  });

  const getUrgencyColor = (level: number) => {
    if (level >= 4) return 'bg-crisis-100 border-crisis-300';
    if (level === 3) return 'bg-warning-100 border-warning-300';
    return 'bg-gray-50 border-gray-200';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getLastActivityText = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary-600">
            {volunteerStats.sessionsToday}
          </div>
          <div className="text-sm text-gray-600">Sessions Today</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-success-600">
            {volunteerStats.averageResponseTime}s
          </div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-warning-600">
            {activeSessions.filter(s => s.urgencyLevel >= 4).length}
          </div>
          <div className="text-sm text-gray-600">Critical Cases</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-700">
            {volunteerStats.rating.toFixed(1)} ⭐
          </div>
          <div className="text-sm text-gray-600">Your Rating</div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Crisis Sessions ({activeSessions.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="urgency">Urgency</option>
              <option value="duration">Duration</option>
              <option value="activity">Last Activity</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'p-4 border-l-4 transition-colors hover:bg-gray-50',
                getUrgencyColor(session.urgencyLevel)
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={session.urgencyLevel >= 4 ? 'crisis' : session.urgencyLevel === 3 ? 'warning' : 'default'}
                      size="sm"
                    >
                      Level {session.urgencyLevel}
                    </Badge>
                    
                    <Badge
                      variant={session.status === 'escalated' ? 'crisis' : session.status === 'active' ? 'success' : 'default'}
                      size="sm"
                    >
                      {session.status}
                    </Badge>
                    
                    <span className="text-sm text-gray-600">
                      Duration: {formatDuration(session.duration)}
                    </span>
                    
                    <span className="text-sm text-gray-600">
                      Last activity: {getLastActivityText(session.lastActivity)}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-600">
                    Session ID: {session.id}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {session.urgencyLevel >= 4 && (
                    <Button
                      variant="crisis"
                      size="sm"
                      onClick={() => onEscalateSession(session.id)}
                    >
                      Escalate
                    </Button>
                  )}
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAcceptSession(session.id)}
                  >
                    {session.status === 'waiting' ? 'Accept' : 'Join'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {sortedSessions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No active crisis sessions at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};