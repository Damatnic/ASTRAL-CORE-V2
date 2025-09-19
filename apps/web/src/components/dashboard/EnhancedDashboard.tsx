'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, Heart, Brain, Users, Shield,
  Calendar, Clock, Target, Award, Star, Zap, AlertCircle, CheckCircle,
  BarChart3, PieChart, LineChart, ArrowRight, Plus, Settings, Bell,
  Filter, Download, RefreshCw, Eye, EyeOff, ChevronDown, ChevronRight
} from 'lucide-react';
import { 
  SmartRecommendations, 
  PersonalizedContentFeed, 
  AdaptiveDashboardLayout,
  usePersonalization 
} from '@/components/personalization/AdaptiveUI';

// Enhanced dashboard with real-time analytics and personalization
interface DashboardProps {
  userRole: 'patient' | 'therapist' | 'volunteer' | 'admin';
  userId: string;
}

interface DashboardMetrics {
  wellness: {
    currentScore: number;
    trend: 'improving' | 'stable' | 'declining';
    weeklyChange: number;
    streakDays: number;
  };
  activities: {
    completedToday: number;
    weeklyGoal: number;
    favoriteActivity: string;
    totalMinutes: number;
  };
  connections: {
    supportSessions: number;
    peerConnections: number;
    lastSession: Date | null;
    nextAppointment: Date | null;
  };
  progress: {
    goalsCompleted: number;
    totalGoals: number;
    milestones: number;
    badgesEarned: number;
  };
}

export default function EnhancedDashboard({ userRole, userId }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivateMode, setShowPrivateMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'wellness']));
  const { data: personalizationData } = usePersonalization();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [userId, selectedTimeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/${userRole}/${userId}?timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default empty state
      setMetrics({
        wellness: { currentScore: 0, trend: 'stable', weeklyChange: 0, streakDays: 0 },
        activities: { completedToday: 0, weeklyGoal: 7, favoriteActivity: 'None', totalMinutes: 0 },
        connections: { supportSessions: 0, peerConnections: 0, lastSession: null, nextAppointment: null },
        progress: { goalsCompleted: 0, totalGoals: 0, milestones: 0, badgesEarned: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Activity;
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <AdaptiveDashboardLayout>
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              Here's how you're doing on your wellness journey
            </p>
          </div>

          {/* Dashboard Controls */}
          <div className="flex items-center space-x-4">
            {/* Privacy Toggle */}
            <button
              onClick={() => setShowPrivateMode(!showPrivateMode)}
              className={`p-2 rounded-lg transition-colors ${
                showPrivateMode 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle private mode"
            >
              {showPrivateMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Timeframe Selector */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadDashboardData}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Wellness Score"
            value={showPrivateMode ? "••" : metrics?.wellness.currentScore.toString() || "0"}
            suffix="/100"
            trend={metrics?.wellness.trend || 'stable'}
            change={showPrivateMode ? 0 : metrics?.wellness.weeklyChange || 0}
            icon={Heart}
            color="bg-gradient-to-r from-pink-500 to-rose-500"
          />
          
          <StatsCard
            title="Daily Activities"
            value={showPrivateMode ? "•" : metrics?.activities.completedToday.toString() || "0"}
            suffix={`/${metrics?.activities.weeklyGoal || 7}`}
            trend="stable"
            change={0}
            icon={Activity}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          
          <StatsCard
            title="Support Sessions"
            value={showPrivateMode ? "•" : metrics?.connections.supportSessions.toString() || "0"}
            suffix=" this week"
            trend="stable"
            change={0}
            icon={Users}
            color="bg-gradient-to-r from-purple-500 to-violet-500"
          />
          
          <StatsCard
            title="Streak Days"
            value={showPrivateMode ? "••" : metrics?.wellness.streakDays.toString() || "0"}
            suffix=" days"
            trend="improving"
            change={metrics?.wellness.streakDays || 0}
            icon={Zap}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wellness Overview */}
            <DashboardSection
              title="Wellness Overview"
              icon={Heart}
              isExpanded={expandedSections.has('wellness')}
              onToggle={() => toggleSection('wellness')}
            >
              <WellnessChart 
                data={metrics?.wellness} 
                timeframe={selectedTimeframe}
                showPrivate={showPrivateMode}
              />
            </DashboardSection>

            {/* Recent Activities */}
            <DashboardSection
              title="Recent Activities"
              icon={Activity}
              isExpanded={expandedSections.has('activities')}
              onToggle={() => toggleSection('activities')}
            >
              <RecentActivities 
                userId={userId}
                showPrivate={showPrivateMode}
              />
            </DashboardSection>

            {/* Progress Tracking */}
            <DashboardSection
              title="Progress & Goals"
              icon={Target}
              isExpanded={expandedSections.has('progress')}
              onToggle={() => toggleSection('progress')}
            >
              <ProgressTracking 
                progress={metrics?.progress}
                showPrivate={showPrivateMode}
              />
            </DashboardSection>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Smart Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
              <SmartRecommendations />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickActionButton
                  href="/mood-gamified"
                  icon={Heart}
                  label="Log Mood"
                  description="Track how you're feeling"
                  color="bg-pink-500"
                />
                <QuickActionButton
                  href="/crisis"
                  icon={Shield}
                  label="Crisis Support"
                  description="Get immediate help"
                  color="bg-red-500"
                />
                <QuickActionButton
                  href="/self-help"
                  icon={Brain}
                  label="Self-Help Tools"
                  description="Coping strategies"
                  color="bg-purple-500"
                />
              </div>
            </div>

            {/* Personalized Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
              <PersonalizedContentFeed />
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Upcoming
              </h3>
              <UpcomingEvents 
                nextAppointment={metrics?.connections.nextAppointment}
                showPrivate={showPrivateMode}
              />
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Achievements
              </h3>
              <AchievementsList 
                badges={metrics?.progress.badgesEarned || 0}
                showPrivate={showPrivateMode}
              />
            </div>
          </div>
        </div>
      </AdaptiveDashboardLayout>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, suffix, trend, change, icon: Icon, color }: any) {
  const TrendIcon = getTrendIcon(trend);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center ${getTrendColor(trend)}`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">
            {change > 0 ? '+' : ''}{change}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        <span className="text-sm text-gray-700 font-normal">{suffix}</span>
      </div>
    </motion.div>
  );
}

// Dashboard Section Component
function DashboardSection({ title, icon: Icon, isExpanded, onToggle, children }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 mr-3 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        {isExpanded ? 
          <ChevronDown className="w-5 h-5 text-gray-700" /> : 
          <ChevronRight className="w-5 h-5 text-gray-700" />
        }
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ href, icon: Icon, label, description, color }: any) {
  return (
    <a
      href={href}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className={`p-2 rounded-lg ${color} text-white group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="ml-3 flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-900" />
    </a>
  );
}

// Wellness Chart Component
function WellnessChart({ data, timeframe, showPrivate }: any) {
  if (showPrivate) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-700">
        <div className="text-center">
          <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Private mode enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center text-gray-700">
        <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Wellness chart visualization</p>
        <p className="text-sm">Score: {data?.currentScore || 0}/100</p>
      </div>
    </div>
  );
}

// Recent Activities Component
function RecentActivities({ userId, showPrivate }: any) {
  const activities = [
    { name: 'Mood Check-in', time: '2 hours ago', type: 'mood' },
    { name: 'Breathing Exercise', time: '5 hours ago', type: 'exercise' },
    { name: 'Journal Entry', time: '1 day ago', type: 'journal' },
  ];

  if (showPrivate) {
    return (
      <div className="text-center text-gray-700 py-8">
        <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Activities hidden in private mode</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{activity.name}</p>
            <p className="text-sm text-gray-700">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Progress Tracking Component
function ProgressTracking({ progress, showPrivate }: any) {
  if (showPrivate) {
    return (
      <div className="text-center text-gray-700 py-8">
        <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Progress hidden in private mode</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">
          {progress?.goalsCompleted || 0}
        </div>
        <div className="text-sm text-gray-600">Goals Completed</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {progress?.milestones || 0}
        </div>
        <div className="text-sm text-gray-600">Milestones</div>
      </div>
    </div>
  );
}

// Upcoming Events Component
function UpcomingEvents({ nextAppointment, showPrivate }: any) {
  if (showPrivate) {
    return (
      <div className="text-center text-gray-700 py-4">
        <EyeOff className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Events hidden</p>
      </div>
    );
  }

  if (!nextAppointment) {
    return (
      <div className="text-center text-gray-700 py-4">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
        <Clock className="w-5 h-5 text-blue-500 mr-3" />
        <div>
          <p className="font-medium text-gray-900">Therapy Session</p>
          <p className="text-sm text-gray-700">Tomorrow at 2:00 PM</p>
        </div>
      </div>
    </div>
  );
}

// Achievements List Component
function AchievementsList({ badges, showPrivate }: any) {
  if (showPrivate) {
    return (
      <div className="text-center text-gray-700 py-4">
        <EyeOff className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Achievements hidden</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
        <Award className="w-5 h-5 text-yellow-500 mr-3" />
        <div>
          <p className="font-medium text-gray-900">7-Day Streak</p>
          <p className="text-sm text-gray-700">Completed daily check-ins</p>
        </div>
      </div>
      <div className="text-center text-gray-700 py-2">
        <p className="text-sm">{badges} total badges earned</p>
      </div>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-10"></div>
            </div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-12 bg-gray-300 rounded w-12 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getTrendColor(trend: string) {
  switch (trend) {
    case 'improving': return 'text-green-600';
    case 'declining': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving': return TrendingUp;
    case 'declining': return TrendingDown;
    default: return Activity;
  }
}
