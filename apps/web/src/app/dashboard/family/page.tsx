'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Heart, Users, AlertTriangle, TrendingUp, Calendar,
  MessageCircle, BookOpen, Shield, Phone, Clock,
  ChevronRight, Bell, Info, CheckCircle, Eye
} from 'lucide-react';

interface LovedOneUpdate {
  id: string;
  name: string;
  relationship: string;
  lastActive: string;
  moodTrend: 'improving' | 'stable' | 'concerning';
  safetyStatus: 'safe' | 'monitored' | 'alert';
  recentActivity: string;
  permissionLevel: 'full' | 'limited' | 'emergency-only';
}

export default function FamilyDashboard() {
  const { data: session } = useSession();
  const [selectedPerson, setSelectedPerson] = useState<string>('');

  const lovedOnes: LovedOneUpdate[] = [
    {
      id: '1',
      name: 'Alex',
      relationship: 'Son/Daughter',
      lastActive: '2 hours ago',
      moodTrend: 'improving',
      safetyStatus: 'safe',
      recentActivity: 'Completed therapy session',
      permissionLevel: 'full'
    },
    {
      id: '2',
      name: 'Jordan',
      relationship: 'Spouse',
      lastActive: '1 day ago',
      moodTrend: 'stable',
      safetyStatus: 'safe',
      recentActivity: 'Used mindfulness tools',
      permissionLevel: 'limited'
    },
    {
      id: '3',
      name: 'Casey',
      relationship: 'Sibling',
      lastActive: '3 days ago',
      moodTrend: 'concerning',
      safetyStatus: 'monitored',
      recentActivity: 'Missed scheduled check-in',
      permissionLevel: 'emergency-only'
    }
  ];

  const familyResources = [
    {
      title: 'Understanding Depression',
      category: 'Education',
      readTime: '5 min',
      description: 'Learn about symptoms, causes, and treatment options'
    },
    {
      title: 'How to Support Someone in Crisis',
      category: 'Crisis Support',
      readTime: '8 min',
      description: 'Essential skills for helping during mental health emergencies'
    },
    {
      title: 'Family Communication Strategies',
      category: 'Relationships',
      readTime: '6 min',
      description: 'Effective ways to talk about mental health'
    },
    {
      title: 'Setting Healthy Boundaries',
      category: 'Self-Care',
      readTime: '7 min',
      description: 'Protecting your own mental health while supporting others'
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      case 'concerning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSafetyColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50';
      case 'monitored': return 'text-yellow-600 bg-yellow-50';
      case 'alert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'full': return <Eye className="w-4 h-4" />;
      case 'limited': return <Shield className="w-4 h-4" />;
      case 'emergency-only': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                Family Support Center
              </h1>
              <p className="text-gray-600">Supporting your loved ones' mental health journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Emergency Resources
              </button>
              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Banner */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-yellow-800 font-medium">Casey hasn't checked in for 3 days</p>
              <p className="text-yellow-700 text-sm">Consider reaching out or using emergency contact protocols.</p>
            </div>
            <button className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200">
              Take Action
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lovedOnes.length}</p>
              <p className="text-sm text-gray-600">Loved Ones</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600">Safe Status</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-600">Improving</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-600">Recent Activity</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loved Ones Status */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Loved Ones Status</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage Access
              </button>
            </div>
            <div className="space-y-4">
              {lovedOnes.map((person) => (
                <div key={person.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{person.name}</p>
                        <p className="text-sm text-gray-600">{person.relationship}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(person.moodTrend)}`}>
                        {person.moodTrend}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSafetyColor(person.safetyStatus)}`}>
                        {person.safetyStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-700">{person.recentActivity}</p>
                      <p className="text-gray-500">Last active: {person.lastActive}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center text-gray-500">
                        {getPermissionIcon(person.permissionLevel)}
                        <span className="ml-1 text-xs">{person.permissionLevel}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
                <Phone className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-700">Crisis Support</p>
                  <p className="text-xs text-red-600">24/7 emergency help</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-700">Send Check-in</p>
                  <p className="text-xs text-blue-600">Reach out to loved ones</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                <BookOpen className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-700">Learn More</p>
                  <p className="text-xs text-green-600">Educational resources</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
                <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-700">Schedule Support</p>
                  <p className="text-xs text-purple-600">Family counseling</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Educational Resources */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Family Resources & Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyResources.map((resource, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{resource.title}</h4>
                  <span className="text-xs text-gray-500">{resource.readTime}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                    {resource.category}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Read →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Support & Privacy Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔒 Privacy Protection</h4>
              <p className="text-sm text-blue-700">
                All information is shared with explicit consent and follows strict privacy guidelines.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">👨‍👩‍👧‍👦 Family Support</h4>
              <p className="text-sm text-green-700">
                Access family therapy resources and support groups in your area.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📞 Emergency Contacts</h4>
              <p className="text-sm text-purple-700">
                988 Suicide & Crisis Lifeline • 911 for emergencies • Local crisis centers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}