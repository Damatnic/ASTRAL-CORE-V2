'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  AlertTriangle, Phone, Clock, Users, TrendingUp,
  MessageSquare, Shield, Heart, CheckCircle, XCircle,
  ChevronRight, Filter, MoreVertical, Zap
} from 'lucide-react';

interface CrisisAlert {
  id: string;
  patientName: string;
  riskLevel: 'critical' | 'high' | 'medium';
  timestamp: string;
  status: 'active' | 'in-progress' | 'resolved';
  triggerType: string;
  lastContact?: string;
  assignedTo?: string;
}

export default function CrisisCounselorDashboard() {
  const { data: session } = useSession();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'in-progress' | 'resolved'>('active');

  const currentStats = {
    activeAlerts: 7,
    totalToday: 23,
    avgResponseTime: '3.2 min',
    resolutionRate: 92,
    onlineStaff: 12
  };

  const crisisAlerts: CrisisAlert[] = [
    {
      id: '1',
      patientName: 'Emergency Contact #4472',
      riskLevel: 'critical',
      timestamp: '2 min ago',
      status: 'active',
      triggerType: 'Suicide ideation detected',
      assignedTo: 'Available'
    },
    {
      id: '2',
      patientName: 'Michael Rodriguez',
      riskLevel: 'critical',
      timestamp: '15 min ago',
      status: 'in-progress',
      triggerType: 'Crisis keywords + emotional escalation',
      assignedTo: 'Dr. Sarah Chen',
      lastContact: '5 min ago'
    },
    {
      id: '3',
      patientName: 'Anonymous User #8834',
      riskLevel: 'high',
      timestamp: '1 hour ago',
      status: 'in-progress',
      triggerType: 'Self-harm indicators',
      assignedTo: 'counselor.mike',
      lastContact: '20 min ago'
    },
    {
      id: '4',
      patientName: 'Jamie Wilson',
      riskLevel: 'high',
      timestamp: '2 hours ago',
      status: 'resolved',
      triggerType: 'Panic attack + hopelessness',
      assignedTo: 'Dr. Emma Thompson',
      lastContact: '1 hour ago'
    },
    {
      id: '5',
      patientName: 'Taylor Brown',
      riskLevel: 'medium',
      timestamp: '3 hours ago',
      status: 'resolved',
      triggerType: 'Anxiety spike',
      assignedTo: 'counselor.alex',
      lastContact: '2 hours ago'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const filteredAlerts = crisisAlerts.filter(alert => 
    activeFilter === 'all' || alert.status === activeFilter
  );

  const quickActions = [
    { title: 'Crisis Hotline', icon: Phone, color: 'bg-red-600', count: '2 waiting' },
    { title: 'Emergency Chat', icon: MessageSquare, color: 'bg-orange-600', count: '5 active' },
    { title: 'Safety Plans', icon: Shield, color: 'bg-blue-600', count: '12 pending' },
    { title: 'Follow-ups', icon: Heart, color: 'bg-green-600', count: '8 due' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                Crisis Response Center
              </h1>
              <p className="text-gray-600">Welcome, {session?.user?.name || 'Crisis Counselor'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online & Available</span>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Take Emergency Call
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Banner */}
        <div className="mb-6 bg-red-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-6 h-6 mr-3 animate-pulse" />
              <div>
                <p className="font-bold">7 Active Crisis Alerts</p>
                <p className="text-red-100 text-sm">1 Critical • 2 High Priority • 4 Medium Priority</p>
              </div>
            </div>
            <button className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-50 font-medium">
              View All Alerts
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span className="text-lg font-bold text-red-600">!</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentStats.activeAlerts}</p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentStats.totalToday}</p>
              <p className="text-sm text-gray-600">Today's Cases</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentStats.avgResponseTime}</p>
              <p className="text-sm text-gray-600">Avg Response</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentStats.resolutionRate}%</p>
              <p className="text-sm text-gray-600">Resolution Rate</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{currentStats.onlineStaff}</p>
              <p className="text-sm text-gray-600">Staff Online</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <action.icon className="w-8 h-8 mb-2" />
              <p className="font-semibold text-sm mb-1">{action.title}</p>
              <p className="text-xs opacity-90">{action.count}</p>
            </button>
          ))}
        </div>

        {/* Crisis Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Crisis Alerts</h3>
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['all', 'active', 'in-progress', 'resolved'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${
                      activeFilter === filter
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter.replace('-', ' ')}
                  </button>
                ))}
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-600">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 hover:shadow-md transition-all cursor-pointer ${
                  alert.status === 'active' ? 'border-red-500 bg-red-50' :
                  alert.status === 'in-progress' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskColor(alert.riskLevel)}`}>
                        {alert.riskLevel.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(alert.status)}`}>
                        {getStatusIcon(alert.status)}
                        <span className="ml-1 capitalize">{alert.status.replace('-', ' ')}</span>
                      </span>
                      <span className="text-sm text-gray-600">{alert.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{alert.patientName}</p>
                        <p className="text-sm text-gray-700">{alert.triggerType}</p>
                        {alert.assignedTo && (
                          <p className="text-xs text-gray-600 mt-1">
                            Assigned to: {alert.assignedTo}
                            {alert.lastContact && ` • Last contact: ${alert.lastContact}`}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.status === 'active' && (
                          <button className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">
                            Take Case
                          </button>
                        )}
                        {alert.status === 'in-progress' && (
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                            Continue
                          </button>
                        )}
                        <button className="p-1 text-gray-600 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Links */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">🚨 Immediate Danger</h4>
              <p className="text-sm text-red-700 mb-2">For active suicide attempts or immediate threats</p>
              <button className="text-red-600 font-semibold text-sm hover:underline">
                Call 911 • Text 911 • Emergency Protocols
              </button>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🆘 Crisis Support</h4>
              <p className="text-sm text-blue-700 mb-2">24/7 crisis intervention and support</p>
              <button className="text-blue-600 font-semibold text-sm hover:underline">
                988 Lifeline • Crisis Text Line • Local Resources
              </button>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📋 Protocols</h4>
              <p className="text-sm text-green-700 mb-2">Standard procedures and guidelines</p>
              <button className="text-green-600 font-semibold text-sm hover:underline">
                Safety Planning • De-escalation • Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}