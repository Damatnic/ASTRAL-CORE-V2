'use client';

/**
 * Gamified Mood Tracker Component
 * ASTRAL CORE V2 Mental Health Platform
 * 
 * Features:
 * - Original mood tracking functionality
 * - Integrated gamification elements
 * - XP rewards for mood logging
 * - Achievement progress tracking
 * - Mental health appropriate design
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Smile, Frown, Meh, Heart, Brain, TrendingUp, TrendingDown,
  Calendar, Clock, Award, Target, Activity, Sun, Moon,
  Cloud, CloudRain, Coffee, Pill, Users, Home, Briefcase,
  Star, Zap, Trophy, Sparkles, CheckCircle, Gift
} from 'lucide-react';

// Import gamification components
import { useGamification } from '../contexts/GamificationContextStub';
import { useMoodEntries } from '../contexts/DataPersistenceContext';
import { LevelBadge, ProgressBar, AchievementBadge } from './gamification/Stub';
import { calculateActivityXP } from '@/lib/db';
import { type MoodEntry as StoredMoodEntry } from '../lib/data-persistence';

// Use the MoodEntry type from data-persistence
type MoodEntry = StoredMoodEntry;

interface MoodPattern {
  pattern: string;
  description: string;
  recommendation: string;
  severity: 'positive' | 'neutral' | 'concerning';
}

const MOOD_COLORS = {
  1: '#7f1d1d', // Dark red
  2: '#991b1b',
  3: '#b91c1c',
  4: '#dc2626',
  5: '#f59e0b', // Yellow
  6: '#84cc16',
  7: '#22c55e',
  8: '#10b981',
  9: '#06b6d4',
  10: '#3b82f6', // Blue
};

const EMOTION_COLORS = {
  happy: '#fbbf24',
  sad: '#60a5fa',
  anxious: '#f87171',
  angry: '#fb923c',
  calm: '#86efac',
  energetic: '#c084fc',
};

// XP rewards for different mood tracking activities
const MOOD_XP_REWARDS = {
  mood_entry: 25,
  detailed_emotions: 15,
  triggers_identified: 10,
  activities_logged: 10,
  notes_written: 5,
  consecutive_day: 10,
  weekly_consistency: 50,
  self_reflection: 20,
};

export default function MoodTrackerGamified() {
  const { data: session } = useSession();
  const { state, actions, theme } = useGamification();
  const { 
    moodEntries, 
    saveMoodEntry, 
    loadMoodEntries, 
    isLoading: moodDataLoading,
    error: moodDataError 
  } = useMoodEntries();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [currentMood, setCurrentMood] = useState(5);
  const [currentEmotions, setCurrentEmotions] = useState({
    happy: 5,
    sad: 3,
    anxious: 4,
    angry: 2,
    calm: 6,
    energetic: 5,
  });
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [entryNotes, setEntryNotes] = useState('');
  const [patterns, setPatterns] = useState<MoodPattern[]>([]);
  const [showXPReward, setShowXPReward] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const triggers = [
    { id: 'work', label: 'Work Stress', icon: Briefcase },
    { id: 'relationship', label: 'Relationships', icon: Heart },
    { id: 'health', label: 'Health Issues', icon: Activity },
    { id: 'sleep', label: 'Poor Sleep', icon: Moon },
    { id: 'finance', label: 'Financial', icon: TrendingDown },
    { id: 'social', label: 'Social Events', icon: Users },
  ];

  const activities = [
    { id: 'exercise', label: 'Exercise', icon: Activity },
    { id: 'meditation', label: 'Meditation', icon: Brain },
    { id: 'social', label: 'Socializing', icon: Users },
    { id: 'creative', label: 'Creative Work', icon: Sun },
    { id: 'nature', label: 'Nature Walk', icon: Cloud },
    { id: 'therapy', label: 'Therapy', icon: Heart },
  ];

  // Load real mood data from database
  useEffect(() => {
    const loadMoodData = async () => {
      if (!session?.user?.id) {
        return;
      }

      try {
        // Load mood entries from database (context handles caching and offline support)
        await loadMoodEntries({ limit: 100 });
        
        // Analyze patterns when data is loaded
        if (moodEntries.length > 0) {
          // Convert timestamp to date for compatibility
          const entriesWithDates = moodEntries.map(entry => ({
            ...entry,
            date: new Date((entry as any).timestamp || entry.date)
          }));
          analyzePatterns(entriesWithDates);
        }
      } catch (error) {
        console.error('Failed to load mood data:', error);
      }
    };

    loadMoodData();
  }, [session?.user?.id, loadMoodEntries]);

  // Analyze patterns when mood entries change
  useEffect(() => {
    if (moodEntries.length > 0) {
      const entriesWithDates = moodEntries.map(entry => ({
        ...entry,
        date: new Date((entry as any).timestamp || entry.date)
      }));
      analyzePatterns(entriesWithDates);
    }
  }, [moodEntries]);

  // This function is no longer needed as we load real data

  const analyzePatterns = (entries: MoodEntry[]) => {
    if (entries.length < 3) {
      setPatterns([]);
      return;
    }

    const detectedPatterns: MoodPattern[] = [];
    const recentEntries = entries.slice(-7); // Last 7 entries
    
    // Analyze mood trends
    if (recentEntries.length >= 3) {
      const moods = recentEntries.map(entry => entry.mood);
      const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
      const trend = moods[moods.length - 1] - moods[0];
      
      if (trend > 1) {
        detectedPatterns.push({
          pattern: 'Mood Improvement',
          description: 'Your mood has been improving over recent entries',
          recommendation: 'Continue with your current self-care practices',
          severity: 'positive',
        });
      } else if (trend < -1) {
        detectedPatterns.push({
          pattern: 'Mood Decline',
          description: 'Your mood has been declining in recent entries',
          recommendation: 'Consider reaching out for support or adjusting your routine',
          severity: 'concerning',
        });
      }
      
      if (avgMood < 4) {
        detectedPatterns.push({
          pattern: 'Low Mood Period',
          description: 'You\'ve been experiencing lower moods recently',
          recommendation: 'Focus on self-care activities and consider professional support',
          severity: 'concerning',
        });
      }
    }
    
    // Analyze common triggers
    const allTriggers = entries.flatMap(entry => entry.triggers);
    const triggerCounts = allTriggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonTrigger = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostCommonTrigger && mostCommonTrigger[1] >= 3) {
      detectedPatterns.push({
        pattern: `${mostCommonTrigger[0]} Impact`,
        description: `${mostCommonTrigger[0]} appears to be a frequent trigger`,
        recommendation: `Consider strategies to manage ${mostCommonTrigger[0]}-related stress`,
        severity: 'neutral',
      });
    }
    
    setPatterns(detectedPatterns);
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 4) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const calculateMoodEntryXP = () => {
    let totalXP = MOOD_XP_REWARDS.mood_entry;
    
    // Bonus for detailed emotion rating
    const emotionVariance = Object.values(currentEmotions).reduce((sum, val) => sum + Math.abs(val - 5), 0);
    if (emotionVariance > 10) {
      totalXP += MOOD_XP_REWARDS.detailed_emotions;
    }
    
    // Bonus for identifying triggers
    if (selectedTriggers.length > 0) {
      totalXP += MOOD_XP_REWARDS.triggers_identified;
    }
    
    // Bonus for logging activities
    if (selectedActivities.length > 0) {
      totalXP += MOOD_XP_REWARDS.activities_logged;
    }
    
    // Bonus for writing notes
    if (entryNotes.trim().length > 20) {
      totalXP += MOOD_XP_REWARDS.notes_written;
    }
    
    // Bonus for consistency (consecutive days)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const hasYesterdayEntry = moodEntries.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      yesterday.setHours(0, 0, 0, 0);
      return entryDate.getTime() === yesterday.getTime();
    });
    
    if (hasYesterdayEntry) {
      totalXP += MOOD_XP_REWARDS.consecutive_day;
    }
    
    return totalXP;
  };

  const handleSaveMoodEntry = async () => {
    if (!session?.user?.id) {
      setDataError('No active session found');
      return;
    }

    try {
      const xpEarned = calculateMoodEntryXP();
      
      const newEntry: MoodEntry = {
        id: `mood_${Date.now()}`,
        date: new Date(),
        mood: currentMood,
        emotions: currentEmotions,
        triggers: selectedTriggers,
        activities: selectedActivities,
        sleepHours: 7,
        notes: entryNotes,
      };
      
      // Save to database (context handles offline support and local state updates)
      const success = await saveMoodEntry(newEntry);
      if (!success) {
        throw new Error('Failed to save mood entry');
      }
      
      // Award XP through gamification system
      await actions.awardXP(xpEarned, 'Mood entry logged', {
        mood: currentMood,
        emotionsLogged: Object.keys(currentEmotions).length,
        triggersIdentified: selectedTriggers.length,
        activitiesLogged: selectedActivities.length,
        notesWritten: entryNotes.length > 0,
      });
      
      // Log activity for achievement tracking
      await actions.logActivity({
        userId: session.user.id,
        type: 'mood_log',
        xpEarned,
        pointsEarned: Math.floor(xpEarned / 2),
        description: 'Logged daily mood and emotions',
        metadata: { mood: currentMood, detailLevel: 'comprehensive' },
      });
      
      // Show XP reward animation
      setLastXPGain(xpEarned);
      setShowXPReward(true);
      setTimeout(() => setShowXPReward(false), 3000);
      
      setShowNewEntry(false);
      
      // Reset form
      setCurrentMood(5);
      setCurrentEmotions({
        happy: 5,
        sad: 3,
        anxious: 4,
        angry: 2,
        calm: 6,
        energetic: 5,
      });
      setSelectedTriggers([]);
      setSelectedActivities([]);
      setEntryNotes('');
      setDataError(null);
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      setDataError('Failed to save mood entry. Please try again.');
    }
  };

  // Prepare data for charts
  const chartData = moodEntries.slice(-7).map(entry => ({
    date: entry.date.toLocaleDateString('en-US', { weekday: 'short' }),
    mood: entry.mood,
    happy: entry.emotions.happy,
    anxious: entry.emotions.anxious,
    calm: entry.emotions.calm,
  }));

  const emotionData = Object.entries(EMOTION_COLORS).map(([emotion, color]) => ({
    name: emotion,
    value: moodEntries.slice(-7).reduce((sum, entry) => 
      sum + entry.emotions[emotion as keyof typeof entry.emotions], 0
    ) / 7,
    fill: color,
  }));

  const radarData = Object.keys(currentEmotions).map(emotion => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    current: currentEmotions[emotion as keyof typeof currentEmotions],
    average: 5,
  }));

  // Show loading state
  if (isLoading || !state.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <p className="text-gray-600 text-lg">
            {isLoading ? 'Loading your mood data...' : 'Loading your wellness journey...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Error</h2>
          <p className="text-gray-600 mb-6">{dataError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Simplified, Calming Header */}
        <motion.div
          className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl shadow-xl p-6 mb-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-3">How are you feeling today?</h1>
            <p className="text-slate-200 mb-6">
              Taking a moment to check in with yourself is a positive step. Your feelings are valid.
            </p>
            <button
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center space-x-2 mx-auto"
            >
              <Heart className="w-5 h-5" />
              <span>{showNewEntry ? 'Close Check-in' : 'Start Check-in'}</span>
            </button>
            
            {/* Simple Progress Indicator */}
            {moodEntries.length > 0 && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-200">
                    {moodEntries.filter(e => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(e.date) >= weekAgo;
                    }).length} check-ins this week
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* XP Reward Animation */}
        <AnimatePresence>
          {showXPReward && (
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">+{lastXPGain} XP</div>
                    <div className="text-sm opacity-90">Great job tracking your mood!</div>
                  </div>
                  <Gift className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional Progress Section - Progressive Disclosure */}
        {moodEntries.length > 2 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <details className="bg-white rounded-xl p-4 shadow-lg">
              <summary className="cursor-pointer text-lg font-semibold text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2">
                View your progress & achievements
                <span className="text-sm font-normal text-gray-500 ml-2">(optional)</span>
              </summary>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">This Week</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {moodEntries.filter(e => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(e.date) >= weekAgo;
                    }).length}
                  </div>
                  <p className="text-sm text-gray-600">check-ins completed</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Streak</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {state.user.stats?.currentStreak || 0}
                  </div>
                  <p className="text-sm text-gray-600">days in a row</p>
                </div>
              </div>
              
              {/* Gamification Details - Hidden Even Deeper */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
                  View gamification details
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <LevelBadge
                      level={state.user.level}
                      currentXP={state.user.currentLevelXP}
                      nextLevelXP={state.user.nextLevelXP}
                      totalXP={state.user.totalXP}
                      size="small"
                      variant="gaming"
                      animated={false}
                    />
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{state.user.totalXP.toLocaleString()} XP total</span>
                      <span>{(state.user.stats?.pointsEarned || 0).toLocaleString()} points</span>
                    </div>
                  </div>
                </div>
              </details>
            </details>
          </motion.div>
        )}

        {/* New Entry Form */}
        <AnimatePresence>
          {showNewEntry && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">How are you feeling right now?</h2>
                <p className="text-gray-600">Take your time. There are no wrong answers.</p>
              </div>
              
              {/* Mood Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Overall Mood</span>
                  <div className="flex items-center space-x-2">
                    {getMoodIcon(currentMood)}
                    <span className="text-2xl font-bold" style={{ color: MOOD_COLORS[currentMood as keyof typeof MOOD_COLORS] }}>
                      {currentMood}/10
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Essential Details - Progressive Disclosure */}
              <details className="mb-6">
                <summary className="cursor-pointer text-gray-600 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2">
                  Add more details (optional)
                </summary>
                
                {/* Emotions Grid */}
                <div className="mb-6 mt-4">
                  <p className="text-gray-600 mb-3">Rate specific emotions (1-10)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(currentEmotions).map(([emotion, value]) => (
                      <div key={emotion} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="capitalize text-sm text-gray-700">{emotion}</span>
                          <span className="text-sm font-semibold" style={{ color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] }}>
                            {value}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={value}
                          onChange={(e) => setCurrentEmotions({
                            ...currentEmotions,
                            [emotion]: Number(e.target.value)
                          })}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{ background: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Triggers */}
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">What might have influenced your mood?</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {triggers.map(trigger => (
                      <button
                        key={trigger.id}
                        onClick={() => setSelectedTriggers(
                          selectedTriggers.includes(trigger.id)
                            ? selectedTriggers.filter(t => t !== trigger.id)
                            : [...selectedTriggers, trigger.id]
                        )}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                          selectedTriggers.includes(trigger.id)
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <trigger.icon className="w-4 h-4" />
                        <span className="text-sm">{trigger.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">What activities did you do today?</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {activities.map(activity => (
                      <button
                        key={activity.id}
                        onClick={() => setSelectedActivities(
                          selectedActivities.includes(activity.id)
                            ? selectedActivities.filter(a => a !== activity.id)
                            : [...selectedActivities, activity.id]
                        )}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                          selectedActivities.includes(activity.id)
                            ? 'border-green-400 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <activity.icon className="w-4 h-4" />
                        <span className="text-sm">{activity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="text-gray-600 block mb-3">Anything else you'd like to note?</label>
                  <textarea
                    value={entryNotes}
                    onChange={(e) => setEntryNotes(e.target.value)}
                    placeholder="What's on your mind? How was your day?"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </details>

              <motion.button
                onClick={handleSaveMoodEntry}
                className="w-full py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Save My Check-in</span>
              </motion.button>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                You're taking care of your mental health. That's something to be proud of.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Grid - Only show if we have data */}
        {moodEntries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mood Trend */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Mood Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#3b82f6" 
                    fill="#93c5fd" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Emotion Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Emotion Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Mood Journey</h3>
            <p className="text-gray-600 mb-6">Track your first mood entry to see insights and patterns over time.</p>
            <button
              onClick={() => setShowNewEntry(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2 mx-auto"
            >
              <Target className="w-5 h-5" />
              <span>Log Your First Mood</span>
            </button>
          </div>
        )}

        {/* Recent Entries with XP Display */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Recent Entries</h3>
          {moodEntries.length > 0 ? (
            <div className="space-y-3">
              {moodEntries.slice(-5).reverse().map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getMoodIcon(entry.mood)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {entry.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mood: {entry.mood}/10{entry.sleepHours ? ` • Sleep: ${entry.sleepHours.toFixed(1)}h` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs font-medium">+{MOOD_XP_REWARDS.mood_entry} XP</span>
                    </div>
                    {entry.triggers.length > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {entry.triggers.length} triggers
                      </span>
                    )}
                    {entry.activities.length > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {entry.activities.length} activities
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No mood entries yet</p>
              <p className="text-sm text-gray-400 mt-1">Start tracking to see your history here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}