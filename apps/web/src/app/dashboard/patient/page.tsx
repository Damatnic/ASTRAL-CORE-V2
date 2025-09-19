'use client';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Brain, Users, Shield, TrendingUp, 
  Calendar, Clock, Star, Award, Activity,
  MessageCircle, BookOpen, Phone, AlertTriangle
} from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: number;
  anxiety: number;
  energy: number;
  notes?: string;
}

interface HealthMetric {
  name: string;
  value: number;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentMood, setCurrentMood] = useState(7);
  const [showQuickMoodCheck, setShowQuickMoodCheck] = useState(false);

  const healthMetrics: HealthMetric[] = [
    { name: 'Mood Score', value: 7.2, change: 0.8, icon: Heart, color: 'text-pink-600' },
    { name: 'Anxiety Level', value: 4.1, change: -1.2, icon: Brain, color: 'text-blue-600' },
    { name: 'Energy Level', value: 6.8, change: 0.5, icon: Activity, color: 'text-green-600' },
    { name: 'Sleep Quality', value: 6.5, change: 0.3, icon: Clock, color: 'text-purple-600' }
  ];

  const recentActivities = [
    { type: 'therapy', title: 'AI Therapy Session with Dr. Aria', time: '2 hours ago', rating: 4 },
    { type: 'selfhelp', title: 'Completed Breathing Exercise', time: '5 hours ago', rating: 5 },
    { type: 'mood', title: 'Mood Check-in', time: 'Yesterday', rating: 3 },
    { type: 'learning', title: 'Read CBT Techniques Article', time: '2 days ago', rating: 4 }
  ];

  const upcomingGoals = [
    { title: 'Complete Daily Mood Check-in', progress: 85, due: 'Today' },
    { title: 'Practice Mindfulness (10 mins)', progress: 60, due: 'Today' },
    { title: 'Weekly Therapy Session', progress: 0, due: 'Tomorrow' },
    { title: 'Complete Anxiety Workbook Chapter', progress: 30, due: 'This week' }
  ];

  const quickActions = [
    { title: 'Crisis Support', icon: Phone, color: 'bg-red-600', textColor: 'text-white', route: '/crisis' },
    { title: 'AI Therapy', icon: MessageCircle, color: 'bg-blue-600', textColor: 'text-white', route: '/ai-therapy' },
    { title: 'Self-Help Tools', icon: BookOpen, color: 'bg-green-600', textColor: 'text-white', route: '/self-help' },
    { title: 'Safety Plan', icon: Shield, color: 'bg-purple-600', textColor: 'text-white', route: '/safety-plan' }
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleMoodSubmit = () => {
    // In a real app, this would save to the database
    console.log('Mood logged:', currentMood);
    setShowQuickMoodCheck(false);
    // Show success message or update UI
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session?.user?.name || 'Friend'}
              </h1>
              <p className="text-gray-600">How are you feeling today?</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQuickMoodCheck(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quick Mood Check
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crisis Alert Banner */}
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Need immediate help?</p>
              <p className="text-red-700 text-sm">Call 988 or click Crisis Support for immediate assistance.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.route)}
              className={`${action.color} ${action.textColor} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <action.icon className="w-8 h-8 mb-2 mx-auto" />
              <p className="font-semibold text-sm">{action.title}</p>
            </button>
          ))}
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <span className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < activity.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Goals */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Goals</h3>
            <div className="space-y-4">
              {upcomingGoals.map((goal, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900">{goal.title}</p>
                    <span className="text-sm text-gray-600">{goal.due}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{goal.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">7-Day Streak</p>
                <p className="text-sm text-gray-600">Daily mood check-ins</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Mood Improved</p>
                <p className="text-sm text-gray-600">+15% this week</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Therapy Sessions</p>
                <p className="text-sm text-gray-600">5 completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mood Check Modal */}
      {showQuickMoodCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 m-4 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling right now?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Mood (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Very Low</span>
                  <span className="font-medium">{currentMood}</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQuickMoodCheck(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoodSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Log Mood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}