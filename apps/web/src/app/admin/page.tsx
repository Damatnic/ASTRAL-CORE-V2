'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, AlertCircle, TrendingUp, Clock, Shield,
  MessageSquare, Phone, Video, BarChart3, Settings, Database,
  Heart, Zap, Globe, Server, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

interface SystemMetrics {
  activeSessions: number;
  waitingQueue: number;
  availableVolunteers: number;
  totalUsers: number;
  responseTime: number;
  uptime: number;
  criticalAlerts: number;
}

interface SessionData {
  id: string;
  userId: string;
  volunteerId?: string;
  status: 'waiting' | 'active' | 'escalated' | 'closed';
  duration: number;
  urgencyLevel: number;
  messages: number;
  lastActivity: Date;
}

interface VolunteerMetrics {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  activeSessions: number;
  totalHandled: number;
  avgResponseTime: number;
  rating: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeSessions: 47,
    waitingQueue: 12,
    availableVolunteers: 23,
    totalUsers: 1284,
    responseTime: 18,
    uptime: 99.97,
    criticalAlerts: 2,
  });

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerMetrics[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'sessions' | 'volunteers' | 'analytics' | 'settings'>('overview');

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeSessions: Math.max(0, prev.activeSessions + Math.floor(Math.random() * 5 - 2)),
        waitingQueue: Math.max(0, prev.waitingQueue + Math.floor(Math.random() * 3 - 1)),
        responseTime: Math.max(10, prev.responseTime + Math.floor(Math.random() * 5 - 2)),
      }));
    }, 5000);

    // Load mock data
    loadMockData();

    return () => clearInterval(interval);
  }, []);

  const loadMockData = () => {
    const mockSessions: SessionData[] = Array.from({ length: 10 }, (_, i) => ({
      id: `session_${i + 1}`,
      userId: `user_${Math.random().toString(36).substring(7)}`,
      volunteerId: Math.random() > 0.3 ? `volunteer_${Math.floor(Math.random() * 10)}` : undefined,
      status: ['waiting', 'active', 'escalated', 'closed'][Math.floor(Math.random() * 4)] as any,
      duration: Math.floor(Math.random() * 60),
      urgencyLevel: Math.floor(Math.random() * 10) + 1,
      messages: Math.floor(Math.random() * 50),
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
    }));

    const mockVolunteers: VolunteerMetrics[] = Array.from({ length: 15 }, (_, i) => ({
      id: `volunteer_${i + 1}`,
      name: `Counselor ${i + 1}`,
      status: ['available', 'busy', 'offline'][Math.floor(Math.random() * 3)] as any,
      activeSessions: Math.floor(Math.random() * 5),
      totalHandled: Math.floor(Math.random() * 100) + 20,
      avgResponseTime: Math.floor(Math.random() * 30) + 10,
      rating: Math.random() * 2 + 3,
    }));

    setSessions(mockSessions);
    setVolunteers(mockVolunteers);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'escalated': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'available': return 'text-green-600';
      case 'busy': return 'text-orange-600';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold">{metrics.activeSessions}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Active Sessions</h3>
          <p className="text-sm text-gray-500 mt-1">Currently in progress</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold">{metrics.waitingQueue}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Waiting Queue</h3>
          <p className="text-sm text-gray-500 mt-1">Users waiting for support</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold">{metrics.availableVolunteers}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Available Volunteers</h3>
          <p className="text-sm text-gray-500 mt-1">Ready to help</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-3xl font-bold">{metrics.criticalAlerts}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Critical Alerts</h3>
          <p className="text-sm text-gray-500 mt-1">Require immediate attention</p>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            System Health
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Server Uptime</span>
                <span className="font-semibold text-green-600">{metrics.uptime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics.uptime}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Response Time</span>
                <span className="font-semibold text-blue-600">{metrics.responseTime}s avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${100 - metrics.responseTime}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Load</span>
                <span className="font-semibold text-orange-600">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span className="font-semibold text-purple-600">43%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '43%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Recent Alerts
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Critical: High-risk session detected</p>
                <p className="text-xs text-red-700">Session #4821 - Immediate intervention required</p>
                <p className="text-xs text-red-600 mt-1">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900">Warning: Queue time exceeding threshold</p>
                <p className="text-xs text-orange-700">12 users waiting &gt; 5 minutes</p>
                <p className="text-xs text-orange-600 mt-1">8 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900">Notice: Volunteer shift change</p>
                <p className="text-xs text-yellow-700">5 volunteers going offline in 30 minutes</p>
                <p className="text-xs text-yellow-600 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Live Activity Feed
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  {['New session started', 'Volunteer joined session', 'Session escalated', 'User connected'][i % 4]}
                </span>
              </div>
              <span className="text-xs text-gray-400">{i * 2 + 1} min ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSessions = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-bold">Active Sessions Management</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map(session => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {session.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.volunteerId || 'Waiting...'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      session.urgencyLevel >= 8 ? 'bg-red-500' :
                      session.urgencyLevel >= 5 ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">{session.urgencyLevel}/10</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.duration}m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.messages}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                  <button className="text-red-600 hover:text-red-900">Intervene</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">ASTRAL CORE Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">System Online</span>
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'sessions', 'volunteers', 'analytics', 'settings'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  selectedView === view
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {view}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'sessions' && renderSessions()}
        {selectedView === 'volunteers' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Volunteer Management</h3>
            <p className="text-gray-600">Volunteer management interface coming soon...</p>
          </div>
        )}
        {selectedView === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Analytics & Reporting</h3>
            <p className="text-gray-600">Detailed analytics dashboard coming soon...</p>
          </div>
        )}
        {selectedView === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">System Settings</h3>
            <p className="text-gray-600">System configuration interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}