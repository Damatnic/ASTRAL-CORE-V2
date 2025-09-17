'use client';
import React from 'react';
import { useAdminStore } from '../providers/AdminProvider';
import AlertsPanel from '../components/AlertsPanel';
import CrisisSessionsTable from '../components/CrisisSessionsTable';
import SystemHealthMonitor from '../components/SystemHealthMonitor';
import VolunteerStatusGrid from '../components/VolunteerStatusGrid';
export default function AdminDashboard() {
    const { store } = useAdminStore();
    const { stats, connectionStatus, isLoading } = store;
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ASTRAL CORE Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Crisis intervention management system</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🔗</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.activeSessions || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Online Volunteers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.onlineVolunteers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⚠️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Alerts</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.criticalAlerts || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⏱️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.averageResponseTime ? `${stats.averageResponseTime}s` : 'N/A'}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Crisis Sessions */}
            <section>
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Crisis Sessions</h2>
                  <p className="mt-1 text-sm text-gray-500">Monitor and manage active crisis intervention sessions</p>
                </div>
                <div className="p-6">
                  <CrisisSessionsTable />
                </div>
              </div>
            </section>

            {/* System Health */}
            <section>
              <SystemHealthMonitor />
            </section>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Alerts Panel */}
            <section>
              <AlertsPanel />
            </section>

            {/* Volunteer Status */}
            <section>
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Volunteer Status</h2>
                  <p className="mt-1 text-sm text-gray-500">Monitor volunteer availability and performance</p>
                </div>
                <div className="p-6">
                  <VolunteerStatusGrid />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Emergency Actions Footer */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-800">Emergency Actions</h3>
              <p className="mt-1 text-sm text-red-600">Critical system controls and emergency procedures</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors" onClick={() => alert('Emergency broadcast system would be activated')}>
                🚨 Emergency Broadcast
              </button>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors" onClick={() => alert('System maintenance mode would be enabled')}>
                🔧 Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>);
}
//# sourceMappingURL=page.jsx.map