'use client';

/**
 * Xbox/PlayStation-Style Gamification Dashboard
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Console-inspired design with cards and tabs
 * - Smooth animations and transitions
 * - Mental health appropriate messaging
 * - Accessibility-first implementation
 * - Progress visualization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Users,
  Activity,
  Heart,
  Brain,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Settings,
  Bell,
} from 'lucide-react';
import { useGamification } from '../../contexts/GamificationContext';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
}

const DASHBOARD_TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Activity,
    color: '#0078D4',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    color: '#28A745',
    gradient: 'from-green-600 to-green-800',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: Target,
    color: '#FF6B6B',
    gradient: 'from-red-600 to-red-800',
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    color: '#8B5CF6',
    gradient: 'from-purple-600 to-purple-800',
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    color: '#F59E0B',
    gradient: 'from-yellow-600 to-yellow-800',
  },
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  animate?: boolean;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon: Icon, color, gradient, animate = true, onClick }: StatCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white cursor-pointer group`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ rotate: 10 }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </div>

        <div className="space-y-1">
          <motion.div
            className="text-3xl font-bold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {value}
          </motion.div>
          <div className="text-sm opacity-90">{title}</div>
          {subtitle && (
            <div className="text-xs opacity-75">{subtitle}</div>
          )}
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </div>
    </motion.div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color: string;
  showText?: boolean;
  animate?: boolean;
}

function ProgressBar({ value, max, label, color, showText = true, animate = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      {showText && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">{label}</span>
          <span className="text-gray-400">{value} / {max}</span>
        </div>
      )}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

interface LevelBadgeProps {
  level: number;
  xp: number;
  nextLevelXP: number;
  animate?: boolean;
}

function LevelBadge({ level, xp, nextLevelXP, animate = true }: LevelBadgeProps) {
  const progress = (xp / nextLevelXP) * 100;

  return (
    <motion.div
      className="relative"
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="relative w-24 h-24 mx-auto">
        {/* Outer ring */}
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgb(55, 65, 81)"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#levelGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
          </defs>
        </svg>

        {/* Level number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-2xl font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            {level}
          </motion.div>
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      <div className="text-center mt-2">
        <div className="text-sm text-gray-300">Level {level}</div>
        <div className="text-xs text-gray-500">{xp} / {nextLevelXP} XP</div>
      </div>
    </motion.div>
  );
}

export default function GamificationDashboard() {
  const { state, actions, theme } = useGamification();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for smooth animations
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!state.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <p className="text-white text-lg">Loading your wellness journey...</p>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {state.user?.displayName || 'Wellness Warrior'}!
        </h1>
        <p className="text-gray-300 text-lg">
          Your mental health journey continues with strength and courage
        </p>
      </motion.div>

      {/* Level badge */}
      <div className="flex justify-center">
        <LevelBadge
          level={state.user?.level || 1}
          xp={state.user?.currentLevelXP || 0}
          nextLevelXP={state.user?.nextLevelXP || 100}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Streak"
          value={state.user?.stats?.currentStreak || 0}
          subtitle="days of self-care"
          icon={Zap}
          color={theme.colors.primary}
          gradient="from-blue-600 to-blue-800"
          onClick={() => setActiveTab('progress')}
        />
        <StatCard
          title="Total XP"
          value={(state.user?.totalXP || 0).toLocaleString()}
          subtitle="experience points"
          icon={Star}
          color={theme.colors.success}
          gradient="from-green-600 to-green-800"
        />
        <StatCard
          title="Achievements"
          value={state.user?.stats?.achievementsUnlocked || 0}
          subtitle="milestones reached"
          icon={Award}
          color={theme.colors.warning}
          gradient="from-yellow-600 to-yellow-800"
          onClick={() => setActiveTab('achievements')}
        />
        <StatCard
          title="Wellness Score"
          value="85%"
          subtitle="overall wellbeing"
          icon={Heart}
          color={theme.colors.accent}
          gradient="from-cyan-600 to-cyan-800"
        />
      </div>

      {/* Recent activity */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {state.recentActivity.slice(0, 3).map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{activity.description}</p>
                  <p className="text-gray-400 text-xs">
                    {activity.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-semibold">+{activity.xpEarned} XP</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily goals progress */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-400" />
          Today's Wellness Goals
        </h3>
        <div className="space-y-4">
          <ProgressBar
            value={1}
            max={3}
            label="Mood Check-ins"
            color={theme.colors.primary}
          />
          <ProgressBar
            value={2}
            max={2}
            label="Mindfulness Minutes"
            color={theme.colors.success}
          />
          <ProgressBar
            value={0}
            max={1}
            label="Safety Plan Review"
            color={theme.colors.warning}
          />
        </div>
      </motion.div>
    </div>
  );

  const renderAchievementsTab = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">Your Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Achievement cards would go here */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">First Steps</h3>
          <p className="text-gray-400 text-sm mb-4">Complete your first mood entry</p>
          <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full inline-block">
            Unlocked
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderChallengesTab = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">Active Challenges</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenge cards would go here */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">7-Day Mindfulness</h3>
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Active</div>
          </div>
          <p className="text-gray-400 text-sm mb-4">Practice mindfulness for 7 consecutive days</p>
          <ProgressBar
            value={3}
            max={7}
            label="Progress"
            color={theme.colors.primary}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Wellness Dashboard</h1>
                <p className="text-gray-400">Your mental health journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'achievements' && renderAchievementsTab()}
            {activeTab === 'challenges' && renderChallengesTab()}
            {activeTab === 'progress' && (
              <div className="text-white text-center py-20">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-400">Coming soon - detailed progress analytics</p>
              </div>
            )}
            {activeTab === 'community' && (
              <div className="text-white text-center py-20">
                <Users className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-semibold mb-2">Community Features</h3>
                <p className="text-gray-400">Coming soon - anonymous peer support</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}