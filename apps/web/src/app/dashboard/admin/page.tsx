'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Shield, Users, Activity, AlertTriangle, TrendingUp,
  Server, Database, Lock, Eye, Settings, Download,
  BarChart3, PieChart, Monitor, Bell, Clock
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: string | number;
  change: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'analytics' | 'system'>('overview');

  const systemMetrics: SystemMetric[] = [
    { name: 'Active Users', value: 1247, change: 12.3, status: 'good', icon: Users },
    { name: 'Crisis Interventions', value: 23, change: -15.2, status: 'warning', icon: AlertTriangle },
    { name: 'System Uptime', value: '99.9%', change: 0.1, status: 'good', icon: Server },
    { name: 'Data Encryption', value: '100%', change: 0, status: 'good', icon: Lock },
    { name: 'Response Time', value: '1.2s', change: -8.5, status: 'good', icon: Activity },
    { name: 'Security Alerts', value: 2, change: -50, status: 'warning', icon: Shield }
  ];

  const recentAlerts = [
    {
      id: '1',
      type: 'security',
      severity: 'medium',
      message: 'Unusual login pattern detected from IP 192.168.1.100',
      timestamp: '15 minutes ago',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'system',
      severity: 'low',
      message: 'Database backup completed successfully',
      timestamp: '2 hours ago',
      status: 'resolved'
    },
    {
      id: '3',
      type: 'crisis',
      severity: 'high',
      message: 'Crisis intervention response time exceeded threshold',
      timestamp: '4 hours ago',
      status: 'escalated'
    }
  ];

  const userStats = {
    totalUsers: 1247,
    activeToday: 892,
    newRegistrations: 34,
    therapists: 156,
    crisisCounselors: 23,
    familyMembers: 445
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                ASTRAL Core Administration
              </h1>
              <p className="text-gray-600">System management and monitoring dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">All Systems Operational</span>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'system', label: 'System', icon: Server }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-8 h-8 text-blue-600" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.name}</p>
                <p className={`text-xs mt-1 ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Bar */}
        <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">2 Security Alerts Require Attention</p>
              <p className="text-yellow-700 text-sm">Review recent security events and unusual activity patterns.</p>
            </div>
            <button className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200">
              Review Alerts
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Total Users</p>
                  <p className="text-sm text-gray-600">Registered accounts</p>
                </div>
                <span className="text-xl font-bold text-blue-600">{userStats.totalUsers}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Active Today</p>
                  <p className="text-sm text-gray-600">Daily active users</p>
                </div>
                <span className="text-xl font-bold text-green-600">{userStats.activeToday}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">New Registrations</p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                </div>
                <span className="text-xl font-bold text-purple-600">{userStats.newRegistrations}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-600">{userStats.therapists}</p>
                  <p className="text-sm text-blue-700">Therapists</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-red-600">{userStats.crisisCounselors}</p>
                  <p className="text-sm text-red-700">Crisis Counselors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{alert.type}</span>
                      <span className="text-xs text-gray-700">{alert.timestamp}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      alert.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrative Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-700">User Management</span>
            </button>
            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <span className="font-medium text-green-700">Security Settings</span>
            </button>
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Download className="w-6 h-6 text-purple-600 mr-3" />
              <span className="font-medium text-purple-700">Export Data</span>
            </button>
            <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Settings className="w-6 h-6 text-orange-600 mr-3" />
              <span className="font-medium text-orange-700">System Config</span>
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health & Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🟢 Server Status</h4>
              <p className="text-sm text-green-700 mb-2">All servers operational</p>
              <div className="text-xs text-green-600">
                • API: 99.9% uptime<br/>
                • Database: Healthy<br/>
                • CDN: Optimized
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔒 Security Status</h4>
              <p className="text-sm text-blue-700 mb-2">All systems secure</p>
              <div className="text-xs text-blue-600">
                • SSL certificates valid<br/>
                • Encryption active<br/>
                • Firewall operational
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📊 Performance</h4>
              <p className="text-sm text-purple-700 mb-2">System performing well</p>
              <div className="text-xs text-purple-600">
                • Response time: 1.2s<br/>
                • Memory usage: 45%<br/>
                • CPU usage: 23%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}