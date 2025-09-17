'use client';

/**
 * Comprehensive Gamification Demo Component
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Showcases all gamification features:
 * - Xbox/PlayStation-style components
 * - Achievement system with rarities
 * - Challenge system
 * - Progress visualization
 * - Mental health appropriate design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Target, Zap, Heart, Brain, Shield, Crown,
  Users, Activity, Sparkles, Award, CheckCircle, Play, Gift
} from 'lucide-react';

import { useGamification } from '../../contexts/GamificationContext';
import GamificationDashboard from './GamificationDashboard';
import AchievementBadge from './AchievementBadge';
import ProgressBar from './ProgressBar';
import LevelBadge from './LevelBadge';
import ChallengeCard from './ChallengeCard';
import { Achievement, Challenge } from '@astralcore/shared/types/gamification';

interface DemoSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function DemoSection({ title, description, children }: DemoSectionProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function GamificationDemo() {
  const { state, actions, theme } = useGamification();
  const [selectedDemo, setSelectedDemo] = useState<string>('overview');

  // Sample achievements for demo
  const sampleAchievements: Achievement[] = [
    {
      id: 'first_mood_log',
      title: 'First Steps',
      description: 'Log your first mood entry',
      category: 'self-care',
      rarity: 'common',
      icon: '🌱',
      iconColor: theme.colors.success,
      xpReward: 50,
      pointsReward: 25,
      requirements: [
        {
          type: 'count',
          target: 1,
          metric: 'moodEntries',
        },
      ],
      isHidden: false,
      completed: true,
      unlockedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'week_streak',
      title: 'Consistency Champion',
      description: 'Maintain a 7-day wellness streak',
      category: 'growth',
      rarity: 'uncommon',
      icon: '🔥',
      iconColor: theme.colors.warning,
      xpReward: 150,
      pointsReward: 75,
      requirements: [
        {
          type: 'streak',
          target: 7,
          metric: 'consecutiveDays',
        },
      ],
      isHidden: false,
      completed: false,
      progress: 65,
    },
    {
      id: 'mindfulness_master',
      title: 'Mindfulness Master',
      description: 'Complete 30 meditation sessions',
      category: 'wellness',
      rarity: 'rare',
      icon: '🧘',
      iconColor: theme.colors.accent,
      xpReward: 300,
      pointsReward: 150,
      requirements: [
        {
          type: 'count',
          target: 30,
          metric: 'meditation_session',
        },
      ],
      isHidden: false,
      completed: false,
      progress: 40,
    },
    {
      id: 'community_helper',
      title: 'Community Guardian',
      description: 'Help 10 community members',
      category: 'community',
      rarity: 'epic',
      icon: '🤝',
      iconColor: theme.colors.primary,
      xpReward: 500,
      pointsReward: 250,
      requirements: [
        {
          type: 'count',
          target: 10,
          metric: 'community_help',
        },
      ],
      isHidden: false,
      completed: false,
      progress: 20,
    },
    {
      id: 'legendary_warrior',
      title: 'Wellness Warrior',
      description: 'Reach level 50 with sustained wellness habits',
      category: 'milestone',
      rarity: 'legendary',
      icon: '👑',
      iconColor: theme.colors.rarities.legendary,
      xpReward: 1000,
      pointsReward: 500,
      requirements: [
        {
          type: 'level',
          target: 50,
          metric: 'level',
        },
      ],
      isHidden: false,
      completed: false,
      progress: 10,
    },
    {
      id: 'hidden_achievement',
      title: 'Mystery Achievement',
      description: 'A hidden achievement waiting to be discovered',
      category: 'special',
      rarity: 'rare',
      icon: '❓',
      iconColor: theme.colors.text,
      xpReward: 200,
      pointsReward: 100,
      requirements: [
        {
          type: 'custom',
          target: 1,
          metric: 'secret_action',
        },
      ],
      isHidden: true,
      completed: false,
    },
  ];

  // Sample challenges for demo
  const sampleChallenges: Challenge[] = [
    {
      id: 'daily_mindfulness',
      title: '5-Minute Mindfulness',
      description: 'Practice mindfulness for 5 minutes today',
      type: 'daily',
      difficulty: 'easy',
      status: 'active',
      icon: '🧘',
      iconColor: theme.colors.success,
      xpReward: 50,
      pointsReward: 25,
      requirements: [
        {
          type: 'action',
          action: 'meditation_session',
          target: 1,
          description: 'Complete a 5-minute mindfulness session',
          progress: 0,
        },
      ],
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      category: 'wellness',
      progress: 75,
    },
    {
      id: 'weekly_mood_tracking',
      title: 'Weekly Mood Awareness',
      description: 'Log your mood for 5 out of 7 days this week',
      type: 'weekly',
      difficulty: 'medium',
      status: 'active',
      icon: '📊',
      iconColor: theme.colors.primary,
      xpReward: 150,
      pointsReward: 75,
      requirements: [
        {
          type: 'count',
          target: 5,
          description: 'Log mood for 5 days',
          progress: 3,
        },
      ],
      startDate: new Date(Date.now() - 3 * 86400000),
      endDate: new Date(Date.now() + 4 * 86400000),
      category: 'self-care',
      progress: 60,
    },
    {
      id: 'gratitude_marathon',
      title: 'Gratitude Marathon',
      description: 'Write gratitude entries for 21 consecutive days',
      type: 'monthly',
      difficulty: 'hard',
      status: 'available',
      icon: '🙏',
      iconColor: theme.colors.warning,
      xpReward: 300,
      pointsReward: 150,
      requirements: [
        {
          type: 'frequency',
          target: 21,
          description: 'Daily gratitude entries for 21 days',
          progress: 0,
        },
      ],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      category: 'growth',
      progress: 0,
    },
  ];

  const demoSections = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'progress', label: 'Progress Bars', icon: Zap },
    { id: 'levels', label: 'Level System', icon: Star },
    { id: 'dashboard', label: 'Full Dashboard', icon: Crown },
  ];

  const renderAchievementsDemo = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Achievement Rarity System</h3>
        <p className="text-gray-600 text-sm mb-4">
          Achievements come in different rarities with increasing visual effects and rewards.
          Mental health appropriate messaging focuses on personal growth rather than competition.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {sampleAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="medium"
            showProgress={true}
            showDescription={true}
            animate={true}
          />
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Rarity Levels:</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Common</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Uncommon</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Rare</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Epic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Legendary</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChallengesDemo = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Mental Health Challenges</h3>
        <p className="text-gray-600 text-sm mb-4">
          Wellness challenges designed to encourage healthy habits without creating pressure.
          Focus on personal growth and self-care rather than competition.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            size="medium"
            showProgress={true}
            showParticipants={false}
            onActivate={() => console.log('Activated:', challenge.id)}
            onComplete={() => console.log('Completed:', challenge.id)}
          />
        ))}
      </div>
    </div>
  );

  const renderProgressDemo = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Xbox/PlayStation-Style Progress Bars</h3>
        <p className="text-gray-600 text-sm mb-4">
          Gaming-inspired progress visualization with smooth animations and visual effects.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Gaming Variant</h4>
          <ProgressBar
            value={75}
            max={100}
            label="Daily Wellness Goal"
            description="Complete wellness activities to reach your daily goal"
            color={theme.colors.primary}
            variant="gaming"
            size="large"
            showPercentage={true}
            showValue={true}
            animated={true}
            showIcon={true}
            icon={Target}
          />
        </div>

        <div>
          <h4 className="font-medium mb-3">Neon Variant</h4>
          <ProgressBar
            value={60}
            max={100}
            label="Mood Tracking Streak"
            color={theme.colors.accent}
            variant="neon"
            size="medium"
            animated={true}
          />
        </div>

        <div>
          <h4 className="font-medium mb-3">Gradient Variant</h4>
          <ProgressBar
            value={40}
            max={100}
            label="Achievement Progress"
            color={theme.colors.success}
            variant="gradient"
            size="medium"
            animated={true}
          />
        </div>

        <div>
          <h4 className="font-medium mb-3">Small Discrete Steps</h4>
          <ProgressBar
            value={3}
            max={5}
            label="Weekly Challenge Progress"
            color={theme.colors.warning}
            variant="gaming"
            size="small"
            animated={true}
          />
        </div>
      </div>
    </div>
  );

  const renderLevelsDemo = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Level System</h3>
        <p className="text-gray-600 text-sm mb-4">
          Mental health themed progression system with meaningful level names and rewards.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <LevelBadge
            level={1}
            currentXP={150}
            nextLevelXP={200}
            size="medium"
            variant="default"
            animated={true}
          />
          <p className="text-sm text-gray-600 mt-2">Default Style</p>
        </div>

        <div className="text-center">
          <LevelBadge
            level={state.user?.level || 5}
            currentXP={state.user?.currentLevelXP || 400}
            nextLevelXP={state.user?.nextLevelXP || 600}
            totalXP={state.user?.totalXP || 2500}
            size="medium"
            variant="gaming"
            animated={true}
          />
          <p className="text-sm text-gray-600 mt-2">Gaming Style</p>
        </div>

        <div className="text-center">
          <LevelBadge
            level={55}
            currentXP={1200}
            nextLevelXP={1500}
            size="medium"
            variant="prestige"
            animated={true}
          />
          <p className="text-sm text-gray-600 mt-2">Prestige Style</p>
        </div>

        <div className="text-center">
          <LevelBadge
            level={12}
            currentXP={800}
            nextLevelXP={1000}
            size="small"
            variant="minimal"
            animated={true}
          />
          <p className="text-sm text-gray-600 mt-2">Minimal Style</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Level Themes:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-green-600">Levels 1-10: Seedling</div>
            <div className="text-gray-600">Beginning your wellness journey</div>
          </div>
          <div>
            <div className="font-medium text-blue-600">Levels 11-20: Sprout</div>
            <div className="text-gray-600">Growing in self-awareness</div>
          </div>
          <div>
            <div className="font-medium text-purple-600">Levels 21-30: Sapling</div>
            <div className="text-gray-600">Developing healthy habits</div>
          </div>
          <div>
            <div className="font-medium text-yellow-600">Levels 31-40: Tree</div>
            <div className="text-gray-600">Rooted in self-care practices</div>
          </div>
          <div>
            <div className="font-medium text-red-600">Levels 41-50: Oak</div>
            <div className="text-gray-600">Strong and resilient</div>
          </div>
          <div>
            <div className="font-medium text-pink-600">Levels 51+: Redwood</div>
            <div className="text-gray-600">Towering in wisdom and peace</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8" />
            <span className="text-2xl font-bold">{sampleAchievements.filter(a => a.completed).length}</span>
          </div>
          <div className="text-sm opacity-90">Achievements Unlocked</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" />
            <span className="text-2xl font-bold">{sampleChallenges.filter(c => c.status === 'active').length}</span>
          </div>
          <div className="text-sm opacity-90">Active Challenges</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8" />
            <span className="text-2xl font-bold">{state.user?.level || 5}</span>
          </div>
          <div className="text-sm opacity-90">Current Level</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8" />
            <span className="text-2xl font-bold">{state.user?.totalXP?.toLocaleString() || '2,500'}</span>
          </div>
          <div className="text-sm opacity-90">Total XP Earned</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          <div className="space-y-2">
            {sampleAchievements.filter(a => a.completed).slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
                <div className="text-xs text-green-600 font-medium">+{achievement.xpReward} XP</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
          <div className="space-y-2">
            {sampleChallenges.filter(c => c.status === 'active').map((challenge) => (
              <div key={challenge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{challenge.title}</div>
                  <div className="text-xs text-gray-600 mb-1">{challenge.description}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium">{challenge.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ASTRAL CORE V2 Gamification System
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Xbox/PlayStation-Style Mental Health Gaming Elements
          </p>
          <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4" />
            <span>Designed for mental health and wellness</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-wrap justify-center gap-2 bg-white rounded-2xl p-2 shadow-lg">
            {demoSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedDemo(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  selectedDemo === section.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDemo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedDemo === 'overview' && (
              <DemoSection
                title="System Overview"
                description="Complete gamification system designed specifically for mental health and wellness."
              >
                {renderOverview()}
              </DemoSection>
            )}

            {selectedDemo === 'achievements' && (
              <DemoSection
                title="Achievement System"
                description="Rarity-based achievement system with mental health appropriate messaging and visual effects."
              >
                {renderAchievementsDemo()}
              </DemoSection>
            )}

            {selectedDemo === 'challenges' && (
              <DemoSection
                title="Challenge System"
                description="Wellness challenges designed to encourage healthy habits without creating pressure."
              >
                {renderChallengesDemo()}
              </DemoSection>
            )}

            {selectedDemo === 'progress' && (
              <DemoSection
                title="Progress Visualization"
                description="Gaming-inspired progress bars with smooth animations and visual effects."
              >
                {renderProgressDemo()}
              </DemoSection>
            )}

            {selectedDemo === 'levels' && (
              <DemoSection
                title="Level Progression System"
                description="Mental health themed level system with meaningful progression and rewards."
              >
                {renderLevelsDemo()}
              </DemoSection>
            )}

            {selectedDemo === 'dashboard' && (
              <DemoSection
                title="Complete Dashboard"
                description="Full Xbox/PlayStation-style dashboard integrating all gamification elements."
              >
                <div className="bg-gray-900 rounded-2xl overflow-hidden">
                  <GamificationDashboard />
                </div>
              </DemoSection>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 p-6 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-2">Mental Health First Design</h3>
          <p className="text-gray-600 text-sm mb-4">
            All gamification elements are designed with mental health best practices in mind:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>No competitive pressure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Privacy-first social features</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>Focus on personal growth</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}