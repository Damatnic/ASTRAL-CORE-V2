'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Link2, Heart, Zap, Activity, Bell, MessageCircle,
  Users, Shield, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, XCircle, Clock, Calendar, BarChart3,
  Sparkles, Award, Target, Gift, Star, Smile,
  Frown, Meh, ThumbsUp, Coffee, Sun, Moon,
  Cloud, CloudRain, Wind, Flame, Droplets, Battery
} from 'lucide-react';

// Interfaces for the Tether system
interface TetherConnection {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  connectionStrength: number; // 0-100
  lastInteraction: Date;
  establishedDate: Date;
  status: 'active' | 'dormant' | 'at-risk' | 'broken';
  mutualSupport: boolean;
  sharedExperiences: string[];
  pulseHistory: Pulse[];
  mood: MoodState;
  checkInFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextCheckIn: Date;
  badges: Badge[];
  milestones: Milestone[];
}

interface Pulse {
  id: string;
  timestamp: Date;
  type: 'check-in' | 'emergency' | 'celebration' | 'support' | 'reminder';
  message?: string;
  mood?: MoodState;
  responded: boolean;
  responseTime?: number; // in minutes
  strength: number; // Impact on connection strength
}

interface MoodState {
  value: number; // 1-10
  emoji: string;
  label: string;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedDate: Date;
  connectionId: string;
  type: 'duration' | 'interaction' | 'support' | 'recovery';
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  atRiskConnections: number;
  averageStrength: number;
  totalPulsesSent: number;
  totalPulsesReceived: number;
  responseRate: number;
  averageResponseTime: number;
}

// Mock data generator
const generateMockConnections = (): TetherConnection[] => {
  const names = [
    'Alex Thompson', 'Sam Chen', 'Jordan Rivera', 'Taylor Kim',
    'Morgan Davis', 'Casey Johnson', 'Riley Martinez', 'Avery Brown'
  ];
  
  const experiences = [
    'Anxiety management', 'Depression support', 'Grief counseling',
    'Addiction recovery', 'PTSD support', 'Bipolar disorder',
    'Eating disorder recovery', 'Self-harm recovery'
  ];
  
  const moods: MoodState[] = [
    { value: 8, emoji: '😊', label: 'Great', trend: 'improving', lastUpdated: new Date() },
    { value: 6, emoji: '🙂', label: 'Good', trend: 'stable', lastUpdated: new Date() },
    { value: 5, emoji: '😐', label: 'Okay', trend: 'stable', lastUpdated: new Date() },
    { value: 3, emoji: '😔', label: 'Low', trend: 'declining', lastUpdated: new Date() },
    { value: 7, emoji: '😌', label: 'Peaceful', trend: 'improving', lastUpdated: new Date() }
  ];
  
  return names.map((name, index) => ({
    id: `tether_${index}`,
    userId: `user_${index}`,
    userName: name,
    connectionStrength: Math.floor(Math.random() * 60) + 40,
    lastInteraction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    establishedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    status: ['active', 'active', 'dormant', 'at-risk'][Math.floor(Math.random() * 4)] as any,
    mutualSupport: Math.random() > 0.3,
    sharedExperiences: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
      experiences[Math.floor(Math.random() * experiences.length)]
    ),
    pulseHistory: [],
    mood: moods[Math.floor(Math.random() * moods.length)],
    checkInFrequency: ['daily', 'weekly', 'biweekly', 'monthly'][Math.floor(Math.random() * 4)] as any,
    nextCheckIn: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    badges: [],
    milestones: []
  }));
};

// Mood presets
const MOOD_PRESETS = [
  { value: 10, emoji: '🤩', label: 'Amazing', color: 'text-green-600' },
  { value: 9, emoji: '😊', label: 'Great', color: 'text-green-500' },
  { value: 8, emoji: '🙂', label: 'Good', color: 'text-green-400' },
  { value: 7, emoji: '😌', label: 'Peaceful', color: 'text-blue-500' },
  { value: 6, emoji: '🙃', label: 'Okay', color: 'text-blue-400' },
  { value: 5, emoji: '😐', label: 'Neutral', color: 'text-gray-500' },
  { value: 4, emoji: '😕', label: 'Struggling', color: 'text-yellow-500' },
  { value: 3, emoji: '😔', label: 'Low', color: 'text-orange-500' },
  { value: 2, emoji: '😢', label: 'Sad', color: 'text-orange-600' },
  { value: 1, emoji: '😰', label: 'Crisis', color: 'text-red-600' }
];

export default function TetherConnection() {
  const [connections, setConnections] = useState<TetherConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<TetherConnection | null>(null);
  const [metrics, setMetrics] = useState<ConnectionMetrics | null>(null);
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [pulseType, setPulseType] = useState<Pulse['type']>('check-in');
  const [pulseMessage, setPulseMessage] = useState('');
  const [currentMood, setCurrentMood] = useState<MoodState>({
    value: 7,
    emoji: '😌',
    label: 'Peaceful',
    trend: 'stable',
    lastUpdated: new Date()
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'at-risk'>('all');
  const [sortBy, setSortBy] = useState<'strength' | 'recent' | 'name'>('strength');
  const pulseAnimation = useRef<NodeJS.Timeout | null>(null);

  // Initialize with mock data
  useEffect(() => {
    loadConnections();
    
    // Simulate incoming pulses
    const interval = setInterval(() => {
      simulateIncomingPulse();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadConnections = () => {
    const mockConnections = generateMockConnections();
    setConnections(mockConnections);
    calculateMetrics(mockConnections);
  };

  const calculateMetrics = (conns: TetherConnection[]) => {
    const active = conns.filter(c => c.status === 'active').length;
    const atRisk = conns.filter(c => c.status === 'at-risk').length;
    const avgStrength = conns.reduce((sum, c) => sum + c.connectionStrength, 0) / conns.length;
    
    setMetrics({
      totalConnections: conns.length,
      activeConnections: active,
      atRiskConnections: atRisk,
      averageStrength: Math.round(avgStrength),
      totalPulsesSent: Math.floor(Math.random() * 100) + 50,
      totalPulsesReceived: Math.floor(Math.random() * 100) + 40,
      responseRate: 0.85,
      averageResponseTime: 12
    });
  };

  const simulateIncomingPulse = () => {
    if (connections.length === 0) return;
    
    const randomConnection = connections[Math.floor(Math.random() * connections.length)];
    const pulseTypes: Pulse['type'][] = ['check-in', 'support', 'celebration'];
    const messages = [
      'Hey, just checking in! How are you today?',
      'Thinking of you! Hope you are doing well.',
      'Great job on your progress! Keep it up!',
      'Remember, you are not alone in this.',
      'Sending positive vibes your way!'
    ];
    
    const newPulse: Pulse = {
      id: `pulse_${Date.now()}`,
      timestamp: new Date(),
      type: pulseTypes[Math.floor(Math.random() * pulseTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      mood: {
        ...MOOD_PRESETS[Math.floor(Math.random() * MOOD_PRESETS.length)],
        trend: 'stable' as const,
        lastUpdated: new Date()
      },
      responded: false,
      strength: Math.floor(Math.random() * 10) + 5
    };
    
    setConnections(prev => prev.map(conn =>
      conn.id === randomConnection.id
        ? {
            ...conn,
            pulseHistory: [...conn.pulseHistory, newPulse],
            lastInteraction: new Date(),
            connectionStrength: Math.min(100, conn.connectionStrength + newPulse.strength)
          }
        : conn
    ));
    
    // Show notification (in production, use real notifications)
    console.log(`New pulse from ${randomConnection.userName}: ${newPulse.message}`);
  };

  const sendPulse = (connectionId: string) => {
    if (!pulseMessage && pulseType === 'check-in') return;
    
    const newPulse: Pulse = {
      id: `pulse_${Date.now()}`,
      timestamp: new Date(),
      type: pulseType,
      message: pulseMessage,
      mood: currentMood,
      responded: true,
      responseTime: 0,
      strength: pulseType === 'emergency' ? 20 : 10
    };
    
    setConnections(prev => prev.map(conn =>
      conn.id === connectionId
        ? {
            ...conn,
            pulseHistory: [...conn.pulseHistory, newPulse],
            lastInteraction: new Date(),
            connectionStrength: Math.min(100, conn.connectionStrength + newPulse.strength),
            status: 'active' as const
          }
        : conn
    ));
    
    setShowPulseModal(false);
    setPulseMessage('');
  };

  const getConnectionColor = (strength: number) => {
    if (strength >= 80) return 'from-green-400 to-emerald-600';
    if (strength >= 60) return 'from-blue-400 to-indigo-600';
    if (strength >= 40) return 'from-yellow-400 to-orange-600';
    return 'from-red-400 to-pink-600';
  };

  const getStatusIcon = (status: TetherConnection['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dormant':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'at-risk':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'broken':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // Filter and sort connections
  const filteredConnections = connections
    .filter(conn => {
      if (filter === 'active') return conn.status === 'active';
      if (filter === 'at-risk') return conn.status === 'at-risk';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'strength') return b.connectionStrength - a.connectionStrength;
      if (sortBy === 'recent') return b.lastInteraction.getTime() - a.lastInteraction.getTime();
      return a.userName.localeCompare(b.userName);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tether Connections</h1>
                <p className="text-sm text-gray-500">Persistent emotional support network</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1.5">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Mood:</span>
                <span className="text-lg">{currentMood.emoji}</span>
                <span className="text-sm text-gray-600">{currentMood.label}</span>
              </div>
              
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics.totalConnections}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metrics.activeConnections}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{metrics.atRiskConnections}</p>
                <p className="text-xs text-gray-500">At Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metrics.averageStrength}%</p>
                <p className="text-xs text-gray-500">Avg Strength</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{metrics.totalPulsesSent}</p>
                <p className="text-xs text-gray-500">Pulses Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">{metrics.totalPulsesReceived}</p>
                <p className="text-xs text-gray-500">Received</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {(metrics.responseRate * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime}m</p>
                <p className="text-xs text-gray-500">Avg Response</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Connections
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('at-risk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'at-risk'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              At Risk
            </button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="strength">Sort by Strength</option>
            <option value="recent">Sort by Recent</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Connections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredConnections.map(connection => (
            <div
              key={connection.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedConnection(connection)}
            >
              {/* Connection Strength Bar */}
              <div className="h-2 bg-gray-200">
                <div
                  className={`h-full bg-gradient-to-r ${getConnectionColor(connection.connectionStrength)} transition-all duration-500`}
                  style={{ width: `${connection.connectionStrength}%` }}
                />
              </div>
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {connection.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{connection.userName}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getStatusIcon(connection.status)}
                        <span className="text-xs text-gray-500">{connection.status}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl">{connection.mood.emoji}</span>
                </div>

                {/* Connection Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Strength</span>
                    <span className="font-medium text-gray-900">{connection.connectionStrength}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Contact</span>
                    <span className="font-medium text-gray-900">
                      {Math.floor((Date.now() - connection.lastInteraction.getTime()) / (1000 * 60 * 60))}h ago
                    </span>
                  </div>
                </div>

                {/* Shared Experiences */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {connection.sharedExperiences.slice(0, 2).map((exp, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {exp}
                    </span>
                  ))}
                  {connection.sharedExperiences.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{connection.sharedExperiences.length - 2}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnection(connection);
                      setShowPulseModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Send Pulse</span>
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Next Check-in */}
                {connection.nextCheckIn && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">Next check-in</span>
                      <span className="text-xs font-medium text-blue-700">
                        {new Date(connection.nextCheckIn).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Connection */}
        <div className="mt-6 text-center">
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-white border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">Add New Connection</span>
          </button>
        </div>
      </div>

      {/* Pulse Modal */}
      {showPulseModal && selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Send Pulse to {selectedConnection.userName}</h3>
            
            {/* Pulse Type */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Pulse Type</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPulseType('check-in')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    pulseType === 'check-in'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Check-in</span>
                </button>
                <button
                  onClick={() => setPulseType('support')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    pulseType === 'support'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Heart className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Support</span>
                </button>
                <button
                  onClick={() => setPulseType('celebration')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    pulseType === 'celebration'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Celebration</span>
                </button>
                <button
                  onClick={() => setPulseType('emergency')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    pulseType === 'emergency'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <span className="text-sm text-red-600">Emergency</span>
                </button>
              </div>
            </div>

            {/* Current Mood */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Current Mood</p>
              <div className="flex items-center justify-between">
                {MOOD_PRESETS.slice(0, 5).map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setCurrentMood({
                      value: mood.value,
                      emoji: mood.emoji,
                      label: mood.label,
                      trend: 'stable',
                      lastUpdated: new Date()
                    })}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${
                      currentMood.value === mood.value ? 'bg-gray-100 ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Message (Optional)</p>
              <textarea
                value={pulseMessage}
                onChange={(e) => setPulseMessage(e.target.value)}
                placeholder="Add a personal message..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            {/* Quick Messages */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Quick messages:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPulseMessage('Thinking of you!')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  Thinking of you!
                </button>
                <button
                  onClick={() => setPulseMessage('How are you today?')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  How are you?
                </button>
                <button
                  onClick={() => setPulseMessage('You got this!')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  You got this!
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => sendPulse(selectedConnection.id)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Send Pulse
              </button>
              <button
                onClick={() => {
                  setShowPulseModal(false);
                  setPulseMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Details Modal */}
      {selectedConnection && !showPulseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Connection Details</h3>
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Connection Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedConnection.userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{selectedConnection.userName}</h4>
                  <p className="text-gray-600">Connected since {selectedConnection.establishedDate.toLocaleDateString()}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(selectedConnection.status)}
                      <span className="text-sm">{selectedConnection.status}</span>
                    </span>
                    <span className="text-2xl">{selectedConnection.mood.emoji}</span>
                  </div>
                </div>
              </div>

              {/* Connection Strength */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Connection Strength</h5>
                <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getConnectionColor(selectedConnection.connectionStrength)} transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${selectedConnection.connectionStrength}%` }}
                  >
                    <span className="text-white text-xs font-bold">{selectedConnection.connectionStrength}%</span>
                  </div>
                </div>
              </div>

              {/* Shared Experiences */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Shared Experiences</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedConnection.sharedExperiences.map((exp, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Pulses */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Recent Pulses</h5>
                <div className="space-y-3">
                  {selectedConnection.pulseHistory.slice(-5).reverse().map(pulse => (
                    <div key={pulse.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <span className="text-xl">{pulse.mood?.emoji}</span>
                          <div>
                            <p className="text-sm text-gray-900">{pulse.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {pulse.timestamp.toLocaleString()} • {pulse.type}
                            </p>
                          </div>
                        </div>
                        {pulse.responded && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check-in Schedule */}
              <div className="mb-6">
                <h5 className="font-semibold mb-2">Check-in Schedule</h5>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">
                        {selectedConnection.checkInFrequency.charAt(0).toUpperCase() + selectedConnection.checkInFrequency.slice(1)} Check-ins
                      </p>
                      <p className="text-sm text-blue-700">
                        Next: {selectedConnection.nextCheckIn.toLocaleDateString()}
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}