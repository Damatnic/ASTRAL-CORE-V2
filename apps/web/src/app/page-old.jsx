'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  Heart, Users, Clock, Shield, Phone, MessageCircle, User,
  Brain, Calendar, TrendingUp, Target, Activity, Star,
  Zap, Trophy, ChevronRight, BarChart3, Smile, BookOpen,
  Settings, Bell, PlusCircle, CheckCircle, AlertCircle
} from 'lucide-react';

// Lazy load heavy components for performance  
const GamificationDashboard = React.lazy(() => import('../components/gamification/Stub').then(m => ({ default: m.GamificationDashboard })));
const MoodTrackerGamified = React.lazy(() => import('../components/MoodTrackerGamified'));
const SafetyPlanner = React.lazy(() => import('../components/SafetyPlanner'));
const GamificationProvider = React.lazy(() => import('../contexts/GamificationContextStub').then(module => ({ default: module.GamificationProvider })));

// Quick action cards for the dashboard
const getQuickActions = (userRole) => {
  const baseActions = [
    {
      id: 'mood-checkin',
      title: 'Mood Check-in',
      description: 'Track how you\'re feeling today',
      icon: Smile,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      href: '/mood-tracker',
      xpReward: 25
    },
    {
      id: 'safety-plan',
      title: 'Safety Plan',
      description: 'Review your personal safety plan',
      icon: Shield,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      href: '/safety-planner',
      xpReward: 20
    },
    {
      id: 'wellness-goals',
      title: 'Wellness Goals',
      description: 'Check your daily progress',
      icon: Target,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      href: '/goals',
      xpReward: 15
    }
  ];

  if (userRole === 'volunteer') {
    baseActions.push({
      id: 'volunteer-dashboard',
      title: 'Volunteer Center',
      description: 'Access volunteer tools and training',
      icon: Users,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      href: '/volunteer',
      xpReward: 0
    });
  }

  if (userRole === 'therapist') {
    baseActions.push({
      id: 'therapist-portal',
      title: 'Therapist Portal',
      description: 'Manage clients and resources',
      icon: BookOpen,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600',
      href: '/therapist',
      xpReward: 0
    });
  }

  return baseActions;
};
// Loading component for Suspense fallbacks
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <motion.div
          className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ action, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-6 rounded-2xl shadow-lg bg-gradient-to-br ${action.gradient} text-white hover:shadow-xl transition-all duration-300 text-left group w-full`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors`}>
          <action.icon className="w-6 h-6" />
        </div>
        {action.xpReward > 0 && (
          <div className="flex items-center space-x-1 bg-yellow-400/20 rounded-full px-2 py-1">
            <Zap className="w-3 h-3 text-yellow-300" />
            <span className="text-xs font-medium">+{action.xpReward}</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold mb-2">{action.title}</h3>
      <p className="text-sm opacity-90 mb-4">{action.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Get started</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
}

// Dashboard Stats Widget
function DashboardStats({ user }) {
  const stats = [
    {
      label: 'Current Level',
      value: user?.level || 1,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Current Streak',
      value: `${user?.stats?.currentStreak || 0} days`,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Total XP',
      value: (user?.totalXP || 0).toLocaleString(),
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Achievements',
      value: user?.stats?.achievementsUnlocked || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`p-4 rounded-xl ${stat.bgColor} border border-gray-200`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const { startOnboarding, isFirstVisit } = useOnboarding();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate loading for smooth experience
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine user role and personalization
  const user = session?.user;
  const userRole = user?.isVolunteer ? 'volunteer' : user?.isTherapist ? 'therapist' : 'user';
  const isAuthenticated = !!session && status === 'authenticated';
  const quickActions = getQuickActions(userRole);

  // Get personalized greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Wellness Seeker';
    if (user.isAnonymous) return 'Wellness Seeker';
    if (user.isVolunteer) return `Volunteer ${user.name || 'Helper'}`;
    if (user.isTherapist) return `Dr. ${user.name || 'Professional'}`;
    return user.name || 'Wellness Warrior';
  };

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    if (action.href) {
      window.location.href = action.href;
    } else {
      setSelectedWidget(action.id);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" role="main" aria-label="ASTRAL CORE Mental Health Dashboard">
      {/* Emergency Crisis Banner - Always Visible for Safety */}
      <div className="bg-red-600 text-white py-2 px-4 text-center relative" role="alert" aria-live="polite" aria-atomic="true">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm font-medium">
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            CRISIS SUPPORT AVAILABLE 24/7
          </span>
          <a 
            href="tel:988" 
            className="bg-white text-red-600 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 min-h-[32px] inline-flex items-center" 
            aria-label="Call 988 Crisis Hotline immediately"
          >
            <Phone className="w-3 h-3 mr-1" />
            Call 988 Now
          </a>
          <a 
            href="sms:741741" 
            className="bg-white text-red-600 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 min-h-[32px] inline-flex items-center" 
            aria-label="Text HOME to 741741 Crisis Text Line"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Text 741741
          </a>
        </div>
      </div>
      
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-12 focus:left-0 bg-red-600 text-white px-4 py-2 z-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
        Skip to main content
      </a>

      {/* Main Dashboard Content */}
      <div id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingSpinner message="Loading your wellness dashboard..." />
        ) : (
          <>
            {/* Simplified Welcome Header - Less Overwhelming */}
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              aria-labelledby="welcome-heading"
            >
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                <div className="text-center max-w-2xl mx-auto">
                  <h1 id="welcome-heading" className="text-2xl md:text-3xl font-bold mb-3">
                    {getGreeting()}, {getUserDisplayName()}
                  </h1>
                  <p className="text-slate-200 text-lg mb-6">
                    {isAuthenticated 
                      ? "You're safe here. Take one step at a time." 
                      : "Welcome. You're taking an important step for your wellbeing."}
                  </p>
                  
                  {/* Welcome message with onboarding option */}
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {isAuthenticated && user && (
                      <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-200">Your wellness journey is active</span>
                      </div>
                    )}
                    
                    {/* Onboarding restart button for returning users */}
                    {!isFirstVisit && (
                      <button
                        onClick={() => startOnboarding('general')}
                        className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-600"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Take the Tour</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* User Stats - Only for authenticated users */}
            {isAuthenticated && (
              <Suspense fallback={<LoadingSpinner message="Loading your progress..." />}>
                <GamificationProvider>
                  <motion.section 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    aria-labelledby="stats-heading"
                  >
                    <h2 id="stats-heading" className="text-2xl font-bold text-gray-900 mb-4">Your Progress</h2>
                    <DashboardStats user={user} />
                  </motion.section>
                </GamificationProvider>
              </Suspense>
            )}

            {/* Essential Actions - Simplified and Prioritized */}
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              aria-labelledby="actions-heading"
            >
              <div className="text-center mb-8">
                <h2 id="actions-heading" className="text-2xl font-bold text-gray-900 mb-3">How can we help you today?</h2>
                <p className="text-gray-600 max-w-lg mx-auto">Choose what feels right for you right now. You can explore more tools later.</p>
              </div>
              
              {/* Primary Actions - Most Important First */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {quickActions.slice(0, 2).map((action) => (
                  <QuickActionCard 
                    key={action.id} 
                    action={action} 
                    onClick={() => handleQuickAction(action)}
                  />
                ))}
              </div>
              
              {/* Secondary Actions - Progressive Disclosure */}
              {isAuthenticated && (
                <details className="bg-gray-50 rounded-2xl p-6">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2">
                    More wellness tools
                    <span className="text-sm font-normal text-gray-700 ml-2">(optional)</span>
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {quickActions.slice(2).map((action) => (
                      <div key={action.id} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${action.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                            <action.icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{action.title}</h3>
                            <p className="text-sm text-gray-600 truncate">{action.description}</p>
                          </div>
                          <button 
                            onClick={() => handleQuickAction(action)}
                            className="text-gray-600 hover:text-gray-600 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              
              {/* Anonymous user gentle call-to-action */}
              {!isAuthenticated && (
                <div className="text-center mt-8">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-6 py-3 text-blue-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Want to track your progress?</span>
                    <a 
                      href="/auth/signin" 
                      className="text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      Sign in
                    </a>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Simplified Progress & Wellness Goals - Optional, Less Overwhelming */}
            {isAuthenticated && (
              <motion.section 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                aria-labelledby="progress-heading"
              >
                <details className="bg-white rounded-2xl shadow-lg p-6">
                  <summary className="cursor-pointer text-xl font-bold text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2">
                    <span id="progress-heading">Your Progress & Goals</span>
                    <span className="text-sm font-normal text-gray-700 ml-2">(when you're ready)</span>
                  </summary>
                  
                  {/* Simple Daily Goal */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smile className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Today's check-in</span>
                          <p className="text-sm text-gray-600">How are you feeling?</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleQuickAction({id: 'mood-checkin'})}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Check in
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Summary - Hidden by Default */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-lg font-semibold text-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
                      View achievements & wellness streak
                    </summary>
                    <div className="mt-4">
                      <Suspense fallback={<LoadingSpinner message="Loading your achievements..." />}>
                        <GamificationProvider>
                          <div className="h-64 overflow-hidden">
                            <GamificationDashboard />
                          </div>
                        </GamificationProvider>
                      </Suspense>
                    </div>
                  </details>
                </details>
              </motion.section>
            )}

            {/* Crisis Resources - Always Available */}
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              aria-labelledby="resources-heading"
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <h2 id="resources-heading" className="text-xl font-bold text-red-900 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
                  Crisis Support - Always Available
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <a
                    href="tel:988"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">988 Crisis Lifeline</p>
                      <p className="text-sm text-gray-600">24/7 crisis support</p>
                    </div>
                    <Phone className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href="sms:741741"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">Crisis Text Line</p>
                      <p className="text-sm text-gray-600">Text HOME to 741741</p>
                    </div>
                    <MessageCircle className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href="tel:911"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">Emergency Services</p>
                      <p className="text-sm text-gray-600">Call 911</p>
                    </div>
                    <Phone className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </div>

      {/* Modal for Expanded Widgets */}
      <AnimatePresence>
        {selectedWidget && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWidget(null)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedWidget === 'mood-tracker' && 'Mood Tracker'}
                    {selectedWidget === 'safety-plan' && 'Safety Planner'}
                  </h3>
                  <button
                    onClick={() => setSelectedWidget(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  {selectedWidget === 'mood-tracker' && isAuthenticated && (
                    <GamificationProvider>
                      <MoodTrackerGamified />
                    </GamificationProvider>
                  )}
                  {selectedWidget === 'safety-plan' && <SafetyPlanner />}
                </Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>);
}