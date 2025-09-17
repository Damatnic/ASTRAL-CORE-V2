'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, MessageCircle, Clock, Award, TrendingUp, 
  AlertCircle, Shield, Heart, Phone, Video, 
  BarChart3, Star, CheckCircle, XCircle 
} from 'lucide-react';
import { storeData, retrieveData } from '../lib/data-persistence';

interface ActiveSession {
  id: string;
  userName: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  status: 'waiting' | 'active' | 'escalated';
  lastMessage: string;
  timestamp: Date;
}

interface VolunteerStats {
  totalSessions: number;
  activeToday: number;
  averageRating: number;
  hoursVolunteered: number;
  peopleHelped: number;
  certificationsEarned: number;
}

export default function VolunteerDashboard() {
  const { data: session, status } = useSession();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [stats, setStats] = useState<VolunteerStats>({
    totalSessions: 0,
    activeToday: 0,
    averageRating: 0,
    hoursVolunteered: 0,
    peopleHelped: 0,
    certificationsEarned: 0,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize volunteer data
  useEffect(() => {
    const initializeVolunteerData = async () => {
      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (!session?.user || !session.user.isVolunteer) {
        setError('Volunteer authentication required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const volunteerId = session.user.id;
        
        // Load volunteer stats from localStorage
        const savedStats = retrieveData<VolunteerStats>('volunteer_stats', volunteerId);
        if (savedStats) {
          setStats(savedStats);
        }
        
        // Load volunteer availability status
        const savedAvailability = retrieveData<boolean>('volunteer_availability', volunteerId);
        if (savedAvailability !== null) {
          setIsAvailable(savedAvailability);
        }
        
        // Active sessions would normally come from a real-time system
        // For now, we'll start with an empty list (no mock data)
        setActiveSessions([]);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize volunteer data:', err);
        setError('Failed to load volunteer dashboard');
        setIsLoading(false);
      }
    };

    initializeVolunteerData();
  }, [session, status]);

  // Save availability status when it changes
  useEffect(() => {
    if (session?.user?.id && status === 'authenticated') {
      storeData('volunteer_availability', isAvailable, session.user.id);
    }
  }, [isAvailable, session?.user?.id, status]);

  const getUrgencyColor = (level: string) => {
    switch(level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <MessageCircle className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'escalated': return <AlertCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600 text-lg">Loading volunteer dashboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (!session?.user || !session.user.isVolunteer || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {error || 'This dashboard is only accessible to verified crisis volunteers.'}
          </p>
          <button 
            onClick={() => window.location.href = '/auth/signin'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Sign In as Volunteer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Crisis Counselor</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                  isAvailable 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {isAvailable ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Available</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Unavailable</span>
                  </>
                )}
              </button>
              
              <button className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              
              <button className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold">{stats.peopleHelped}</span>
            </div>
            <p className="text-sm text-gray-600">People Helped</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold">{stats.hoursVolunteered}</span>
            </div>
            <p className="text-sm text-gray-600">Hours Volunteered</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.averageRating}</span>
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold">{stats.totalSessions}</span>
            </div>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold">{stats.activeToday}</span>
            </div>
            <p className="text-sm text-gray-600">Active Today</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-pink-600" />
              <span className="text-2xl font-bold">{stats.certificationsEarned}</span>
            </div>
            <p className="text-sm text-gray-600">Certifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Sessions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Active Sessions</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {activeSessions.length} Active
              </span>
            </div>
            
{activeSessions.length > 0 ? (
              <div className="space-y-3">
                {activeSessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedSession === session.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-gray-900">{session.userName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(session.urgencyLevel)}`}>
                            {session.urgencyLevel.toUpperCase()}
                          </span>
                          <span className="flex items-center space-x-1 text-gray-500 text-sm">
                            {getStatusIcon(session.status)}
                            <span>{session.status}</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{session.lastMessage}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {session.duration} minutes ago
                          </span>
                          
                          <div className="flex space-x-2">
                            {session.urgencyLevel === 'critical' && (
                              <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                                Escalate
                              </button>
                            )}
                            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                              Join Session
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {isAvailable ? (
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isAvailable ? 'Ready to Help' : 'Currently Unavailable'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isAvailable 
                    ? 'No active crisis sessions at the moment. You\'ll be notified when someone needs support.' 
                    : 'Mark yourself as available to start receiving crisis intervention requests.'}
                </p>
                {!isAvailable && (
                  <button
                    onClick={() => setIsAvailable(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2 mx-auto"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Become Available</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions & Resources */}
          <div className="space-y-6">
            {/* Emergency Resources */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Emergency Resources
              </h3>
              
              <div className="space-y-3">
                <button className="w-full p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">Crisis Escalation Protocol</span>
                  <AlertCircle className="w-5 h-5" />
                </button>
                
                <button className="w-full p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">Contact Supervisor</span>
                  <Phone className="w-5 h-5" />
                </button>
                
                <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">Professional Referrals</span>
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Your Performance
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Session Completion</span>
                    <span className="font-semibold text-blue-600">Good</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">User Satisfaction</span>
                    <span className="font-semibold text-purple-600">Outstanding</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                New Training Available
              </h3>
              <p className="text-indigo-100 text-sm mb-4">
                Advanced Crisis De-escalation Techniques
              </p>
              <button className="w-full bg-white text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                Start Training
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}