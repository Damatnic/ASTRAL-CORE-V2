'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, Calendar, Clock, TrendingUp, AlertTriangle,
  MessageCircle, FileText, Award, Brain, Heart,
  ChevronRight, Filter, Download, Settings
} from 'lucide-react';

interface PatientOverview {
  id: string;
  name: string;
  lastSession: string;
  riskLevel: 'low' | 'medium' | 'high';
  moodTrend: 'improving' | 'stable' | 'declining';
  nextAppointment?: string;
}

export default function TherapistDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'sessions' | 'reports'>('overview');

  const todayStats = {
    totalPatients: 32,
    scheduledSessions: 8,
    completedSessions: 5,
    crisisAlerts: 2,
    avgSessionRating: 4.6
  };

  const recentPatients: PatientOverview[] = [
    {
      id: '1',
      name: 'Alex Chen',
      lastSession: '2 hours ago',
      riskLevel: 'low',
      moodTrend: 'improving',
      nextAppointment: 'Tomorrow 2:00 PM'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      lastSession: '1 day ago',
      riskLevel: 'medium',
      moodTrend: 'stable',
      nextAppointment: 'Friday 10:00 AM'
    },
    {
      id: '3',
      name: 'Michael Rodriguez',
      lastSession: '3 days ago',
      riskLevel: 'high',
      moodTrend: 'declining',
      nextAppointment: 'Today 4:00 PM'
    },
    {
      id: '4',
      name: 'Emma Thompson',
      lastSession: '1 week ago',
      riskLevel: 'low',
      moodTrend: 'improving'
    }
  ];

  const upcomingSessions = [
    { time: '2:00 PM', patient: 'Alex Chen', type: 'Follow-up', duration: '50 min' },
    { time: '3:00 PM', patient: 'Jordan Smith', type: 'Initial Assessment', duration: '60 min' },
    { time: '4:00 PM', patient: 'Michael Rodriguez', type: 'Crisis Check-in', duration: '30 min' },
    { time: '5:00 PM', patient: 'Lisa Park', type: 'Therapy Session', duration: '50 min' }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Therapist Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, Dr. {session?.user?.name || 'Watson'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                New Session
              </button>
              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crisis Alerts */}
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-800 font-medium">2 Crisis Alerts Require Immediate Attention</p>
              <p className="text-red-700 text-sm">Michael Rodriguez and Jamie Wilson flagged for high-risk indicators.</p>
            </div>
            <button className="ml-auto bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">
              Review Alerts
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayStats.totalPatients}</p>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayStats.scheduledSessions}</p>
              <p className="text-sm text-gray-600">Today's Sessions</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayStats.completedSessions}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayStats.crisisAlerts}</p>
              <p className="text-sm text-gray-600">Crisis Alerts</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayStats.avgSessionRating}</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel} risk
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Last session: {patient.lastSession}</span>
                      <span className="mx-2">•</span>
                      <span>{getTrendIcon(patient.moodTrend)} {patient.moodTrend}</span>
                    </div>
                    {patient.nextAppointment && (
                      <p className="text-xs text-blue-600 mt-1">Next: {patient.nextAppointment}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage Schedule
              </button>
            </div>
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-16 text-center">
                    <p className="font-semibold text-gray-900">{session.time}</p>
                    <p className="text-xs text-gray-600">{session.duration}</p>
                  </div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium text-gray-900">{session.patient}</p>
                    <p className="text-sm text-gray-600">{session.type}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Calendar className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-700">Schedule Session</span>
            </button>
            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <span className="font-medium text-green-700">Write Notes</span>
            </button>
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
              <span className="font-medium text-purple-700">View Analytics</span>
            </button>
            <button className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <Download className="w-6 h-6 text-yellow-600 mr-3" />
              <span className="font-medium text-yellow-700">Export Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Alex Chen</span> completed AI therapy session with Dr. Aria
                </p>
                <p className="text-xs text-gray-600">2 hours ago • Session rated 4.5/5</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Michael Rodriguez</span> triggered crisis detection alert
                </p>
                <p className="text-xs text-gray-600">4 hours ago • Requires follow-up</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <Heart className="w-5 h-5 text-green-600 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Sarah Johnson</span> completed mood check-in
                </p>
                <p className="text-xs text-gray-600">6 hours ago • Mood score: 7/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}