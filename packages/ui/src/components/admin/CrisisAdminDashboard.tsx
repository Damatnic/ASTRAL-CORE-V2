import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, AlertTriangle, Users, Phone, MessageSquare, Heart,
  Shield, Zap, Clock, TrendingUp, TrendingDown, Eye, EyeOff,
  Play, Pause, SkipForward, Volume2, VolumeX, Maximize2,
  Settings, Download, RefreshCw, Filter, Search, Bell,
  MapPin, Calendar, BarChart3, PieChart, LineChart, Database
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Admin dashboard for crisis intervention oversight - FREE for all admins
interface CrisisSession {
  id: string;
  clientId: string;
  volunteerId?: string;
  status: 'waiting' | 'active' | 'escalated' | 'resolved' | 'critical';
  urgencyLevel: 'low' | 'moderate' | 'high' | 'immediate';
  startTime: Date;
  duration: number; // in minutes
  messageCount: number;
  lastActivity: Date;
  emotionalState: string;
  interventionLevel: number; // 1-5
  location?: string; // General region only for safety
  isMonitored: boolean;
}

interface Volunteer {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline' | 'break';
  currentSessions: number;
  maxSessions: number;
  responseTime: number; // average in seconds
  sessionsToday: number;
  rating: number;
  specializations: string[];
  shiftEnd?: Date;
  lastActive: Date;
}

interface SystemMetrics {
  activeSessions: number;
  waitingClients: number;
  availableVolunteers: number;
  averageWaitTime: number; // seconds
  averageResponseTime: number; // seconds
  sessionsToday: number;
  escalationsToday: number;
  systemLoad: number; // percentage
  uptime: number; // percentage
}

interface CrisisAdminDashboardProps {
  userId: string;
  onSessionIntervene?: (sessionId: string) => void;
  onEmergencyEscalate?: (sessionId: string) => void;
  className?: string;
}

export const CrisisAdminDashboard: React.FC<CrisisAdminDashboardProps> = ({
  userId,
  onSessionIntervene,
  onEmergencyEscalate,
  className,
}) => {
  const [sessions, setSessions] = useState<CrisisSession[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeSessions: 0,
    waitingClients: 0,
    availableVolunteers: 0,
    averageWaitTime: 0,
    averageResponseTime: 0,
    sessionsToday: 0,
    escalationsToday: 0,
    systemLoad: 0,
    uptime: 99.9,
  });

  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [monitoringMode, setMonitoringMode] = useState<'overview' | 'detailed'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [filterCritical, setFilterCritical] = useState(false);
  const refreshInterval = useRef<NodeJS.Timeout>();

  // Simulate real-time data
  useEffect(() => {
    // Generate sample data
    const sampleSessions: CrisisSession[] = [
      {
        id: 'session-1',
        clientId: 'client-001',
        volunteerId: 'vol-123',
        status: 'critical',
        urgencyLevel: 'immediate',
        startTime: new Date(Date.now() - 300000), // 5 minutes ago
        duration: 5,
        messageCount: 23,
        lastActivity: new Date(Date.now() - 30000),
        emotionalState: 'crisis',
        interventionLevel: 5,
        location: 'Northeast US',
        isMonitored: true,
      },
      {
        id: 'session-2',
        clientId: 'client-002',
        status: 'waiting',
        urgencyLevel: 'high',
        startTime: new Date(Date.now() - 120000), // 2 minutes ago
        duration: 2,
        messageCount: 0,
        lastActivity: new Date(Date.now() - 120000),
        emotionalState: 'distressed',
        interventionLevel: 1,
        location: 'West Coast',
        isMonitored: false,
      },
      {
        id: 'session-3',
        clientId: 'client-003',
        volunteerId: 'vol-456',
        status: 'active',
        urgencyLevel: 'moderate',
        startTime: new Date(Date.now() - 900000), // 15 minutes ago
        duration: 15,
        messageCount: 47,
        lastActivity: new Date(Date.now() - 10000),
        emotionalState: 'anxious',
        interventionLevel: 3,
        location: 'Midwest',
        isMonitored: false,
      },
    ];

    const sampleVolunteers: Volunteer[] = [
      {
        id: 'vol-123',
        name: 'Sarah Thompson',
        status: 'busy',
        currentSessions: 2,
        maxSessions: 3,
        responseTime: 15,
        sessionsToday: 8,
        rating: 4.9,
        specializations: ['Crisis Intervention', 'Suicide Prevention'],
        shiftEnd: new Date(Date.now() + 7200000), // 2 hours
        lastActive: new Date(Date.now() - 30000),
      },
      {
        id: 'vol-456',
        name: 'Michael Chen',
        status: 'busy',
        currentSessions: 1,
        maxSessions: 4,
        responseTime: 22,
        sessionsToday: 6,
        rating: 4.8,
        specializations: ['LGBTQ+ Support', 'Trauma'],
        shiftEnd: new Date(Date.now() + 3600000), // 1 hour
        lastActive: new Date(Date.now() - 10000),
      },
      {
        id: 'vol-789',
        name: 'Emily Rodriguez',
        status: 'available',
        currentSessions: 0,
        maxSessions: 3,
        responseTime: 8,
        sessionsToday: 4,
        rating: 4.7,
        specializations: ['Youth Support', 'Eating Disorders'],
        shiftEnd: new Date(Date.now() + 5400000), // 1.5 hours
        lastActive: new Date(Date.now() - 60000),
      },
    ];

    const sampleMetrics: SystemMetrics = {
      activeSessions: sampleSessions.filter(s => s.status === 'active' || s.status === 'critical').length,
      waitingClients: sampleSessions.filter(s => s.status === 'waiting').length,
      availableVolunteers: sampleVolunteers.filter(v => v.status === 'available').length,
      averageWaitTime: 45,
      averageResponseTime: 18,
      sessionsToday: 127,
      escalationsToday: 8,
      systemLoad: 67,
      uptime: 99.9,
    };

    setSessions(sampleSessions);
    setVolunteers(sampleVolunteers);
    setMetrics(sampleMetrics);
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        // Update timestamps and simulate changes
        setSessions(prev => prev.map(session => ({
          ...session,
          duration: Math.round((Date.now() - session.startTime.getTime()) / 60000),
        })));
      }, 5000);
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  // Sound alerts for critical sessions
  useEffect(() => {
    const criticalSessions = sessions.filter(s => s.status === 'critical' || s.urgencyLevel === 'immediate');
    if (soundAlerts && criticalSessions.length > 0) {
      // Play alert sound (simplified)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // High pitch for urgency
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, [sessions, soundAlerts]);

  const getStatusColor = (status: CrisisSession['status']) => {
    switch (status) {
      case 'critical': return 'bg-red-600 text-white';
      case 'escalated': return 'bg-orange-600 text-white';
      case 'active': return 'bg-blue-600 text-white';
      case 'waiting': return 'bg-yellow-600 text-white';
      case 'resolved': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getUrgencyColor = (level: CrisisSession['urgencyLevel']) => {
    switch (level) {
      case 'immediate': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  const filteredSessions = filterCritical 
    ? sessions.filter(s => s.status === 'critical' || s.urgencyLevel === 'immediate')
    : sessions;

  return (
    <div className={cn('space-y-6 p-6 bg-gray-50 min-h-screen', className)}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crisis Admin Dashboard</h1>
              <p className="text-gray-600">FREE 24/7 Crisis Monitoring & Management</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              )}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              {autoRefresh ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                soundAlerts ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              )}
              title={soundAlerts ? 'Sound alerts ON' : 'Sound alerts OFF'}
            >
              {soundAlerts ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setFilterCritical(!filterCritical)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filterCritical ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              )}
            >
              {filterCritical ? 'Show All' : 'Critical Only'}
            </button>

            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.activeSessions}</div>
            <div className="text-xs text-red-600">Active Sessions</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{metrics.waitingClients}</div>
            <div className="text-xs text-yellow-600">Waiting</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.availableVolunteers}</div>
            <div className="text-xs text-green-600">Available</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.averageWaitTime}s</div>
            <div className="text-xs text-blue-600">Avg Wait</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.averageResponseTime}s</div>
            <div className="text-xs text-purple-600">Response</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{metrics.sessionsToday}</div>
            <div className="text-xs text-indigo-600">Today</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.escalationsToday}</div>
            <div className="text-xs text-orange-600">Escalated</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{metrics.uptime}%</div>
            <div className="text-xs text-gray-600">Uptime</div>
          </div>
        </div>
      </div>

      {/* Active Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              'bg-white rounded-xl shadow-lg p-6 transition-all cursor-pointer hover:shadow-xl',
              session.status === 'critical' && 'ring-2 ring-red-500 animate-pulse',
              selectedSession === session.id && 'ring-2 ring-blue-500'
            )}
            onClick={() => setSelectedSession(session.id)}
          >
            {/* Session Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(session.status))}>
                  {session.status.toUpperCase()}
                </span>
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getUrgencyColor(session.urgencyLevel))}>
                  {session.urgencyLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {session.isMonitored && <Eye className="w-4 h-4 text-blue-600" />}
                <span className="text-xs text-gray-500">Level {session.interventionLevel}</span>
              </div>
            </div>

            {/* Session Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium">{session.duration} min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messages:</span>
                <span className="text-sm font-medium">{session.messageCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Emotional State:</span>
                <span className={cn(
                  'text-sm font-medium capitalize',
                  session.emotionalState === 'crisis' ? 'text-red-600' :
                  session.emotionalState === 'distressed' ? 'text-orange-600' :
                  session.emotionalState === 'anxious' ? 'text-yellow-600' :
                  'text-green-600'
                )}>
                  {session.emotionalState}
                </span>
              </div>

              {session.volunteerId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Volunteer:</span>
                  <span className="text-sm font-medium">
                    {volunteers.find(v => v.id === session.volunteerId)?.name || 'Unknown'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">{session.location || 'Unknown'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Activity:</span>
                <span className="text-sm font-medium">
                  {Math.round((Date.now() - session.lastActivity.getTime()) / 1000)}s ago
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
              {session.status === 'waiting' && (
                <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Assign Volunteer
                </button>
              )}
              
              {(session.status === 'active' || session.status === 'critical') && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSessionIntervene) onSessionIntervene(session.id);
                    }}
                    className="flex-1 py-2 px-3 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Intervene
                  </button>
                  
                  {session.urgencyLevel === 'immediate' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEmergencyEscalate) onEmergencyEscalate(session.id);
                      }}
                      className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      911 Escalate
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Crisis Indicator */}
            {session.status === 'critical' && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">IMMEDIATE ATTENTION REQUIRED</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Volunteer Status Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.map((volunteer) => (
            <div key={volunteer.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">{volunteer.name}</span>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  volunteer.status === 'available' ? 'bg-green-100 text-green-600' :
                  volunteer.status === 'busy' ? 'bg-yellow-100 text-yellow-600' :
                  volunteer.status === 'break' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {volunteer.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sessions:</span>
                  <span>{volunteer.currentSessions}/{volunteer.maxSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span>{volunteer.responseTime}s avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span>{volunteer.rating}/5 ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today:</span>
                  <span>{volunteer.sessionsToday} sessions</span>
                </div>
                {volunteer.shiftEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shift Ends:</span>
                    <span>{new Date(volunteer.shiftEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.systemLoad}%</div>
            <div className="text-sm text-gray-600">System Load</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.uptime}%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">24/7</div>
            <div className="text-sm text-gray-600">FREE Service</div>
          </div>
        </div>
      </div>

      {/* Free Platform Notice */}
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-sm text-green-700 font-medium">
          🎯 All admin tools are 100% FREE • No premium features • Life-saving access for everyone
        </p>
      </div>
    </div>
  );
};

export default CrisisAdminDashboard;