'use client';

import React, { useState } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';
import RealTimeCrisisMonitor from '../../components/crisis/RealTimeCrisisMonitor';
import EmergencyEscalationManager from '../../components/crisis/EmergencyEscalationManager';
import VolunteerManagementPanel from '../../components/volunteers/VolunteerManagementPanel';
import SystemHealthDashboard from '../../components/monitoring/SystemHealthDashboard';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import UserManagementPanel from '../../components/users/UserManagementPanel';
import AuditLogViewer from '../../components/audit/AuditLogViewer';
import ResourceAllocationManager from '../../components/resources/ResourceAllocationManager';

type DashboardView = 
  | 'overview' 
  | 'crisis' 
  | 'escalation' 
  | 'volunteers' 
  | 'system' 
  | 'analytics' 
  | 'users' 
  | 'audit' 
  | 'resources';

export default function AdminDashboard() {
  const { store } = useAdminStore();
  const { stats, connectionStatus } = store;
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '🏠', color: 'blue' },
    { id: 'crisis', label: 'Crisis Monitor', icon: '🚨', color: 'red' },
    { id: 'escalation', label: 'Escalations', icon: '⚡', color: 'orange' },
    { id: 'volunteers', label: 'Volunteers', icon: '👥', color: 'green' },
    { id: 'system', label: 'System Health', icon: '💻', color: 'purple' },
    { id: 'analytics', label: 'Analytics', icon: '📊', color: 'indigo' },
    { id: 'users', label: 'Users', icon: '👤', color: 'cyan' },
    { id: 'audit', label: 'Audit Logs', icon: '📋', color: 'gray' },
    { id: 'resources', label: 'Resources', icon: '🎯', color: 'pink' }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'red': return 'bg-red-100 text-red-800 border-red-300';
        case 'orange': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'green': return 'bg-green-100 text-green-800 border-green-300';
        case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'cyan': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
        case 'pink': return 'bg-pink-100 text-pink-800 border-pink-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    }
    return 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
  };

  const renderContent = () => {
    switch (currentView) {
      case 'crisis':
        return <RealTimeCrisisMonitor />;
      case 'escalation':
        return <EmergencyEscalationManager />;
      case 'volunteers':
        return <VolunteerManagementPanel />;
      case 'system':
        return <SystemHealthDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagementPanel />;
      case 'audit':
        return <AuditLogViewer />;
      case 'resources':
        return <ResourceAllocationManager />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">🔗</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.activeSessions || 0}</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12% from last hour</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Online Volunteers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.onlineVolunteers || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">42 total volunteers</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.criticalAlerts || 0}</p>
                    <p className="text-xs text-red-600 mt-1">Requires immediate attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.averageResponseTime ? `${stats.averageResponseTime}s` : 'N/A'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">↓ 5s improvement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New volunteer Michael Chen logged in</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Crisis session SES456 escalated to Level 2</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">System backup completed successfully</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">High risk assessment detected in session SES789</p>
                    <p className="text-xs text-gray-500">22 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">📢</div>
                  <p className="text-sm font-medium text-gray-700">Broadcast Alert</p>
                </button>
                <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">👨‍⚕️</div>
                  <p className="text-sm font-medium text-gray-700">Call Supervisor</p>
                </button>
                <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-medium text-gray-700">Generate Report</p>
                </button>
                <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">🔧</div>
                  <p className="text-sm font-medium text-gray-700">System Settings</p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ASTRAL CORE Admin</h1>
              <p className="text-sm text-gray-500">Crisis Management Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-md h-screen sticky top-0">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Navigation
            </h2>
            <div className="space-y-1">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as DashboardView)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-colors ${
                    getColorClasses(item.color, currentView === item.id)
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="p-4 border-t border-gray-200">
            <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">
              Emergency Actions
            </h2>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-2">
              🚨 Emergency Broadcast
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              🔧 Maintenance Mode
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}