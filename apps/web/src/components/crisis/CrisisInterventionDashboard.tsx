'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, AlertCircle, AlertTriangle, Users, Phone, Clock,
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  Shield, Heart, Brain, UserCheck, MessageCircle, Video,
  Bell, Settings, Filter, Search, Download, RefreshCw,
  ChevronRight, ChevronDown, MoreVertical, Zap, Target,
  CheckCircle, XCircle, Pause, Play, User, MapPin,
  Calendar, FileText, Database, Cpu, Wifi, WifiOff
} from 'lucide-react';

// Interfaces for crisis management
interface CrisisSession {
  id: string;
  userId: string;
  userName?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'waiting' | 'escalated' | 'resolved' | 'abandoned';
  severity: 'low' | 'medium' | 'high' | 'critical';
  volunteerId?: string;
  volunteerName?: string;
  messages: number;
  location?: string;
  riskFactors: string[];
  interventions: Intervention[];
  outcome?: SessionOutcome;
}

interface Intervention {
  id: string;
  type: 'message' | 'escalation' | 'resource' | 'emergency';
  timestamp: Date;
  description: string;
  effectiveness?: number;
}

interface SessionOutcome {
  resolved: boolean;
  referralMade: boolean;
  emergencyContacted: boolean;
  followUpScheduled: boolean;
  riskLevel: 'reduced' | 'unchanged' | 'increased';
}

interface Volunteer {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentSessions: number;
  maxSessions: number;
  specializations: string[];
  languages: string[];
  rating: number;
  sessionsToday: number;
  averageResponseTime: number; // in seconds
}

interface CrisisMetrics {
  activeSessions: number;
  waitingQueue: number;
  averageWaitTime: number;
  criticalCases: number;
  highRiskCases: number;
  mediumRiskCases: number;
  lowRiskCases: number;
  resolutionRate: number;
  escalationRate: number;
  averageSessionDuration: number;
  volunteersOnline: number;
  volunteersAvailable: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  sessionId?: string;
  acknowledged: boolean;
}

// Data loading functions
const loadCrisisSessions = async (): Promise<CrisisSession[]> => {
  try {
    // In a real app, this would fetch from an API
    // For now, return empty array - real sessions would come from WebSocket or API
    const response = await fetch('/api/crisis/sessions');
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading crisis sessions:', error);
    return [];
  }
};

const loadVolunteers = async (): Promise<Volunteer[]> => {
  try {
    // In a real app, this would fetch from an API
    const response = await fetch('/api/volunteers/status');
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading volunteers:', error);
    return [];
  }
};

export default function CrisisInterventionDashboard() {
  const [sessions, setSessions] = useState<CrisisSession[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [metrics, setMetrics] = useState<CrisisMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSession, setSelectedSession] = useState<CrisisSession | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize with mock data
  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh
    if (autoRefresh) {
      refreshTimer.current = setInterval(loadDashboardData, refreshInterval);
    }
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const loadDashboardData = async () => {
    try {
      // Load real data from APIs
      const [sessionsData, volunteersData] = await Promise.all([
        loadCrisisSessions(),
        loadVolunteers()
      ]);
      
      setSessions(sessionsData);
      setVolunteers(volunteersData);
      
      // Calculate metrics from real data
      const activeSessions = sessionsData.filter(s => s.status === 'active').length;
      const waitingQueue = sessionsData.filter(s => s.status === 'waiting').length;
      const criticalCases = sessionsData.filter(s => s.severity === 'critical').length;
      const highRiskCases = sessionsData.filter(s => s.severity === 'high').length;
      const mediumRiskCases = sessionsData.filter(s => s.severity === 'medium').length;
      const lowRiskCases = sessionsData.filter(s => s.severity === 'low').length;
      const resolvedSessions = sessionsData.filter(s => s.status === 'resolved').length;
      const escalatedSessions = sessionsData.filter(s => s.status === 'escalated').length;
      const volunteersOnline = volunteersData.filter(v => v.status !== 'offline').length;
      const volunteersAvailable = volunteersData.filter(v => v.status === 'available').length;
      
      // Calculate average wait time from actual waiting sessions
      const waitingSessions = sessionsData.filter(s => s.status === 'waiting');
      const averageWaitTime = waitingSessions.length > 0 
        ? waitingSessions.reduce((sum, session) => 
            sum + (Date.now() - session.startTime.getTime()), 0) / waitingSessions.length / 60000 // Convert to minutes
        : 0;
      
      // Calculate average session duration from completed sessions
      const completedSessions = sessionsData.filter(s => s.endTime);
      const averageSessionDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, session) => 
            sum + (session.endTime!.getTime() - session.startTime.getTime()), 0) / completedSessions.length / 60000 // Convert to minutes
        : 0;
      
      setMetrics({
        activeSessions,
        waitingQueue,
        averageWaitTime,
        criticalCases,
        highRiskCases,
        mediumRiskCases,
        lowRiskCases,
        resolutionRate: sessionsData.length > 0 ? resolvedSessions / sessionsData.length : 0,
        escalationRate: sessionsData.length > 0 ? escalatedSessions / sessionsData.length : 0,
        averageSessionDuration,
        volunteersOnline,
        volunteersAvailable
      });
      
      // Generate alerts for critical cases
      const newAlerts: Alert[] = sessionsData
        .filter(s => s.severity === 'critical' || s.status === 'escalated')
        .slice(0, 5)
        .map(s => ({
          id: `alert_${s.id}`,
          type: s.severity === 'critical' ? 'critical' : 'high' as const,
          title: s.severity === 'critical' ? 'Critical Risk Detected' : 'Session Escalated',
          description: `Session ${s.id} requires immediate attention`,
          timestamp: new Date(),
          sessionId: s.id,
          acknowledged: false
        }));
      
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty state on error
      setSessions([]);
      setVolunteers([]);
      setMetrics({
        activeSessions: 0,
        waitingQueue: 0,
        averageWaitTime: 0,
        criticalCases: 0,
        highRiskCases: 0,
        mediumRiskCases: 0,
        lowRiskCases: 0,
        resolutionRate: 0,
        escalationRate: 0,
        averageSessionDuration: 0,
        volunteersOnline: 0,
        volunteersAvailable: 0
      });
      setAlerts([]);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filterSeverity !== 'all' && session.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && session.status !== filterStatus) return false;
    if (searchQuery && !session.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.userName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Assign volunteer to session
  const assignVolunteer = (sessionId: string, volunteerId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, volunteerId, volunteerName: volunteers.find(v => v.id === volunteerId)?.name }
        : s
    ));
    
    setVolunteers(prev => prev.map(v =>
      v.id === volunteerId
        ? { ...v, currentSessions: v.currentSessions + 1, status: 'busy' as const }
        : v
    ));
  };

  // Escalate session
  const escalateSession = (sessionId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, status: 'escalated' as const, severity: 'critical' as const }
        : s
    ));
    
    // Add alert
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setAlerts(prev => [...prev, {
        id: `alert_escalate_${Date.now()}`,
        type: 'critical',
        title: 'Session Escalated',
        description: `Session ${sessionId} has been escalated to critical`,
        timestamp: new Date(),
        sessionId,
        acknowledged: false
      }]);
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Crisis Intervention Dashboard</h1>
                  <p className="text-sm text-gray-700">Real-time crisis monitoring and response coordination</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection status */}
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Live</span>
              </div>
              
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="text-sm">Auto-refresh</span>
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Bar */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">
                {alerts.filter(a => !a.acknowledged).length} Active Alerts
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {alerts.filter(a => !a.acknowledged).slice(0, 3).map(alert => (
                <div key={alert.id} className="bg-white rounded-lg px-3 py-1.5 flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'
                  }`} />
                  <span className="text-sm text-gray-900">{alert.title}</span>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="px-6 py-4 bg-white border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{metrics.activeSessions}</p>
              <p className="text-sm text-gray-700">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{metrics.waitingQueue}</p>
              <p className="text-sm text-gray-700">Waiting</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{metrics.criticalCases}</p>
              <p className="text-sm text-gray-700">Critical</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{metrics.highRiskCases}</p>
              <p className="text-sm text-gray-700">High Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {(metrics.resolutionRate * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-700">Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(metrics.averageWaitTime / 60)}m
              </p>
              <p className="text-sm text-gray-700">Avg Wait</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{metrics.volunteersAvailable}</p>
              <p className="text-sm text-gray-700">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{metrics.volunteersOnline}</p>
              <p className="text-sm text-gray-700">Online</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-240px)]">
        {/* Left Panel - Sessions */}
        <div className="flex-1 border-r bg-white overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="px-6 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sessions..."
                    className="pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="waiting">Waiting</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded ${view === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded ${view === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${
                    session.severity === 'critical' ? 'border-l-4 border-l-red-500' :
                    session.severity === 'high' ? 'border-l-4 border-l-orange-500' :
                    session.severity === 'medium' ? 'border-l-4 border-l-yellow-500' :
                    'border-l-4 border-l-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          session.status === 'active' ? 'bg-green-500 animate-pulse' :
                          session.status === 'waiting' ? 'bg-yellow-500' :
                          session.status === 'escalated' ? 'bg-red-500 animate-pulse' :
                          'bg-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900">
                          {session.userName || `User ${session.userId.slice(-4)}`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          session.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          session.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          session.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {session.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          session.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          session.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                          session.status === 'escalated' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor((Date.now() - session.startTime.getTime()) / 60000)}m
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {session.messages}
                        </span>
                        {session.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {session.location}
                          </span>
                        )}
                        {session.volunteerName && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {session.volunteerName}
                          </span>
                        )}
                      </div>
                      
                      {session.riskFactors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.riskFactors.slice(0, 3).map((factor, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {factor}
                            </span>
                          ))}
                          {session.riskFactors.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              +{session.riskFactors.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="w-96 bg-white overflow-hidden flex flex-col">
          {selectedSession ? (
            <>
              {/* Session Header */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">Session Details</h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Session ID</span>
                    <span className="text-sm font-medium">{selectedSession.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Duration</span>
                    <span className="text-sm font-medium">
                      {Math.floor((Date.now() - selectedSession.startTime.getTime()) / 60000)} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Messages</span>
                    <span className="text-sm font-medium">{selectedSession.messages}</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="px-6 py-4 border-b">
                <h3 className="font-medium text-gray-900 mb-3">Risk Assessment</h3>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${
                    selectedSession.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                    selectedSession.severity === 'high' ? 'bg-orange-50 border border-orange-200' :
                    selectedSession.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Severity Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedSession.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        selectedSession.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        selectedSession.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {selectedSession.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {selectedSession.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors</p>
                      <div className="space-y-1">
                        {selectedSession.riskFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-sm text-gray-700">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-b">
                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {!selectedSession.volunteerId && (
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center">
                      <UserCheck className="w-4 h-4 mr-1" />
                      Assign
                    </button>
                  )}
                  <button
                    onClick={() => escalateSession(selectedSession.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Escalate
                  </button>
                  <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </button>
                  <button className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Notes
                  </button>
                </div>
              </div>

              {/* Volunteer Assignment */}
              {!selectedSession.volunteerId && (
                <div className="px-6 py-4 flex-1 overflow-y-auto">
                  <h3 className="font-medium text-gray-900 mb-3">Available Volunteers</h3>
                  <div className="space-y-2">
                    {volunteers
                      .filter(v => v.status === 'available' && v.currentSessions < v.maxSessions)
                      .map(volunteer => (
                        <div
                          key={volunteer.id}
                          onClick={() => assignVolunteer(selectedSession.id, volunteer.id)}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{volunteer.name}</p>
                              <p className="text-xs text-gray-700">
                                {volunteer.specializations.join(', ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Heart
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(volunteer.rating)
                                        ? 'text-red-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-700 mt-1">
                                {volunteer.sessionsToday} sessions
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Session Outcome (if resolved) */}
              {selectedSession.outcome && (
                <div className="px-6 py-4">
                  <h3 className="font-medium text-gray-900 mb-3">Session Outcome</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Resolution</span>
                      <span className={`text-sm font-medium ${
                        selectedSession.outcome.resolved ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedSession.outcome.resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </div>
                    {selectedSession.outcome.referralMade && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Referral</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    {selectedSession.outcome.followUpScheduled && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Follow-up</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Risk Level</span>
                      <span className={`text-sm font-medium ${
                        selectedSession.outcome.riskLevel === 'reduced' ? 'text-green-600' :
                        selectedSession.outcome.riskLevel === 'increased' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedSession.outcome.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-700">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a session to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-gray-900 text-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <span>System Status: <span className="text-green-400">Operational</span></span>
            <span>Response Time: <span className="text-yellow-400">1.2s</span></span>
            <span>Server Load: <span className="text-green-400">42%</span></span>
          </div>
          <div className="text-sm text-gray-700">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}