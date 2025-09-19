'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Brain,
  Heart,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Zap,
  Target,
  Award,
  AlertTriangle,
  Download,
  Share,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Glass } from '@/components/design-system/ProductionGlassSystem';

interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  sleep: number; // Hours
  activities: string[];
  triggers: string[];
  notes: string;
  location?: string;
  weather?: string;
}

interface MoodInsight {
  type: 'pattern' | 'trigger' | 'improvement' | 'concern';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
}

interface MoodStats {
  averageMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  bestDay: string;
  worstDay: string;
  totalEntries: number;
  streakDays: number;
  commonTriggers: string[];
  moodVariability: number;
}

const MOOD_ICONS = {
  1: '😔', 2: '😞', 3: '😕', 4: '😐', 5: '😊',
  6: '😃', 7: '😄', 8: '😁', 9: '🤩', 10: '🥳'
};

const SAMPLE_MOOD_DATA: MoodEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    mood: 6,
    energy: 7,
    anxiety: 4,
    sleep: 7.5,
    activities: ['exercise', 'work', 'social'],
    triggers: [],
    notes: 'Good day overall, productive at work'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    mood: 4,
    energy: 5,
    anxiety: 7,
    sleep: 6,
    activities: ['work'],
    triggers: ['deadline pressure', 'poor sleep'],
    notes: 'Stressful day with tight deadlines'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    mood: 7,
    energy: 8,
    anxiety: 3,
    sleep: 8,
    activities: ['exercise', 'therapy', 'hobbies'],
    triggers: [],
    notes: 'Great therapy session, feeling motivated'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    mood: 8,
    energy: 8,
    anxiety: 2,
    sleep: 8.5,
    activities: ['exercise', 'social', 'hobbies', 'mindfulness'],
    triggers: [],
    notes: 'Amazing day! Felt connected and energized'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    mood: 5,
    energy: 6,
    anxiety: 5,
    sleep: 7,
    activities: ['work', 'social'],
    triggers: ['conflict with friend'],
    notes: 'Had a disagreement with friend, feeling unsettled'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    mood: 7,
    energy: 7,
    anxiety: 3,
    sleep: 7.5,
    activities: ['exercise', 'therapy', 'work'],
    triggers: [],
    notes: 'Better day, worked through yesterday\'s issues'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    mood: 6,
    energy: 6,
    anxiety: 4,
    sleep: 7,
    activities: ['work', 'hobbies'],
    triggers: [],
    notes: 'Steady day, feeling balanced'
  }
];

export default function MoodAnalyticsPage() {
  const [moodData, setMoodData] = useState<MoodEntry[]>(SAMPLE_MOOD_DATA);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'patterns' | 'insights'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'energy' | 'anxiety' | 'sleep'>('mood');

  // Calculate mood statistics
  const calculateStats = (): MoodStats => {
    const moods = moodData.map(entry => entry.mood);
    const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    
    // Calculate trend (simple linear regression)
    const trend = calculateTrend(moods);
    const moodTrend = trend > 0.1 ? 'improving' : trend < -0.1 ? 'declining' : 'stable';
    
    // Find best and worst days
    const sortedByMood = [...moodData].sort((a, b) => b.mood - a.mood);
    const bestDay = sortedByMood[0]?.timestamp.toLocaleDateString() || 'N/A';
    const worstDay = sortedByMood[sortedByMood.length - 1]?.timestamp.toLocaleDateString() || 'N/A';
    
    // Calculate mood variability (standard deviation)
    const variance = moods.reduce((acc, mood) => acc + Math.pow(mood - averageMood, 2), 0) / moods.length;
    const moodVariability = Math.sqrt(variance);
    
    // Common triggers
    const allTriggers = moodData.flatMap(entry => entry.triggers);
    const triggerCounts = allTriggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger]) => trigger);

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      moodTrend,
      bestDay,
      worstDay,
      totalEntries: moodData.length,
      streakDays: calculateStreak(),
      commonTriggers,
      moodVariability: Math.round(moodVariability * 10) / 10
    };
  };

  const calculateTrend = (values: number[]): number => {
    const n = values.length;
    const sumX = values.reduce((acc, _, i) => acc + i, 0);
    const sumY = values.reduce((acc, val) => acc + val, 0);
    const sumXY = values.reduce((acc, val, i) => acc + i * val, 0);
    const sumXX = values.reduce((acc, _, i) => acc + i * i, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  };

  const calculateStreak = (): number => {
    // Calculate consecutive days with entries (simplified)
    return moodData.length;
  };

  const generateInsights = (): MoodInsight[] => {
    const stats = calculateStats();
    const insights: MoodInsight[] = [];

    // Mood trend insight
    if (stats.moodTrend === 'improving') {
      insights.push({
        type: 'improvement',
        title: 'Positive Mood Trend',
        description: `Your mood has been improving over the past ${timeRange}. Keep up the great work!`,
        severity: 'low',
        actionable: true,
        recommendations: [
          'Continue current strategies that are working',
          'Track what activities contribute to good days',
          'Consider sharing your progress with your support network'
        ]
      });
    } else if (stats.moodTrend === 'declining') {
      insights.push({
        type: 'concern',
        title: 'Declining Mood Pattern',
        description: `Your mood has been declining recently. This may indicate a need for additional support.`,
        severity: 'high',
        actionable: true,
        recommendations: [
          'Consider reaching out to a mental health professional',
          'Review potential triggers or stressors',
          'Implement additional coping strategies',
          'Connect with your support network'
        ]
      });
    }

    // Sleep correlation
    const sleepMoodCorrelation = calculateCorrelation(
      moodData.map(d => d.sleep),
      moodData.map(d => d.mood)
    );

    if (sleepMoodCorrelation > 0.6) {
      insights.push({
        type: 'pattern',
        title: 'Sleep Strongly Affects Your Mood',
        description: `There's a strong correlation between your sleep and mood. Better sleep tends to lead to better mood.`,
        severity: 'medium',
        actionable: true,
        recommendations: [
          'Prioritize consistent sleep schedule',
          'Aim for 7-9 hours of sleep nightly',
          'Create a relaxing bedtime routine',
          'Limit screen time before bed'
        ]
      });
    }

    // Common triggers
    if (stats.commonTriggers.length > 0) {
      insights.push({
        type: 'trigger',
        title: 'Identified Mood Triggers',
        description: `Your most common triggers are: ${stats.commonTriggers.join(', ')}`,
        severity: 'medium',
        actionable: true,
        recommendations: [
          'Develop coping strategies for these specific triggers',
          'Consider avoiding or modifying trigger situations when possible',
          'Practice mindfulness when encountering triggers',
          'Discuss trigger management with a therapist'
        ]
      });
    }

    // High variability warning
    if (stats.moodVariability > 2.5) {
      insights.push({
        type: 'pattern',
        title: 'High Mood Variability',
        description: `Your mood shows significant day-to-day variation, which may indicate emotional instability.`,
        severity: 'high',
        actionable: true,
        recommendations: [
          'Focus on mood stabilization techniques',
          'Consider mood tracking apps for better pattern recognition',
          'Discuss mood swings with a healthcare provider',
          'Implement daily mindfulness or meditation practice'
        ]
      });
    }

    return insights;
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const stats = calculateStats();
  const insights = generateInsights();

  const chartData = moodData.map(entry => ({
    date: entry.timestamp.toLocaleDateString(),
    mood: entry.mood,
    energy: entry.energy,
    anxiety: entry.anxiety,
    sleep: entry.sleep
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Crisis Alert Bar */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="mr-2">🚨</span>
        In crisis? Call 988 (Suicide & Crisis Lifeline) immediately
        <a href="tel:988" className="ml-3 underline font-bold">Call 988</a>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Glass variant="light" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Mood Analytics
                </h1>
                <p className="text-gray-700 dark:text-gray-600">
                  Comprehensive insights into your mental health patterns
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="quarter">Past Quarter</option>
                <option value="year">Past Year</option>
              </select>
              
              <button className="p-2 text-gray-600 hover:text-purple-600 border border-gray-300 rounded-lg hover:border-purple-300">
                <Download className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-purple-600 border border-gray-300 rounded-lg hover:border-purple-300">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Glass>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Glass variant="light" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Mood</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageMood}/10</p>
                <div className="flex items-center mt-1">
                  {stats.moodTrend === 'improving' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : stats.moodTrend === 'declining' ? (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    stats.moodTrend === 'improving' ? 'text-green-600' :
                    stats.moodTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stats.moodTrend}
                  </span>
                </div>
              </div>
              <div className="text-3xl">
                {MOOD_ICONS[Math.round(stats.averageMood) as keyof typeof MOOD_ICONS]}
              </div>
            </div>
          </Glass>

          <Glass variant="light" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tracking Streak</p>
                <p className="text-2xl font-bold text-green-600">{stats.streakDays}</p>
                <p className="text-sm text-gray-700">days</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </Glass>

          <Glass variant="light" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mood Stability</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.moodVariability < 1.5 ? 'High' : 
                   stats.moodVariability < 2.5 ? 'Medium' : 'Low'}
                </p>
                <p className="text-sm text-gray-700">variability: {stats.moodVariability}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </Glass>

          <Glass variant="light" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalEntries}</p>
                <p className="text-sm text-gray-700">this {timeRange}</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </Glass>
        </div>

        {/* Navigation Tabs */}
        <Glass variant="light" className="mb-8 p-1">
          <div className="flex space-x-1">
            {(['overview', 'trends', 'patterns', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </Glass>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Mood Chart */}
              <Glass variant="light" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Mood Trends</h2>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="mood">Mood</option>
                    <option value="energy">Energy</option>
                    <option value="anxiety">Anxiety</option>
                    <option value="sleep">Sleep</option>
                  </select>
                </div>
                
                {/* Simple line chart representation */}
                <div className="h-64 flex items-end justify-between space-x-2">
                  {chartData.map((data, index) => {
                    const value = data[selectedMetric];
                    const height = selectedMetric === 'sleep' ? (value / 10) * 100 : (value / 10) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          className={`w-full rounded-t-lg ${
                            selectedMetric === 'mood' ? 'bg-purple-500' :
                            selectedMetric === 'energy' ? 'bg-green-500' :
                            selectedMetric === 'anxiety' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ minHeight: '8px' }}
                        />
                        <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                          {data.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Glass>

              {/* Recent Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Glass variant="light" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Day</h3>
                  <div className="flex items-center space-x-3">
                    <Sun className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">{stats.bestDay}</p>
                      <p className="text-sm text-gray-600">
                        Mood: {Math.max(...moodData.map(d => d.mood))}/10
                      </p>
                    </div>
                  </div>
                </Glass>

                <Glass variant="light" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Focus</h3>
                  <div className="space-y-2">
                    {stats.commonTriggers.slice(0, 3).map((trigger, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-700">{trigger}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {insights.map((insight, index) => (
                <Glass key={index} variant="light" className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'improvement' ? 'bg-green-100' :
                      insight.type === 'concern' ? 'bg-red-100' :
                      insight.type === 'pattern' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {insight.type === 'improvement' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {insight.type === 'concern' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      {insight.type === 'pattern' && <BarChart3 className="w-5 h-5 text-blue-600" />}
                      {insight.type === 'trigger' && <Zap className="w-5 h-5 text-yellow-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                          insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{insight.description}</p>
                      
                      {insight.actionable && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                                <div className="w-1 h-1 bg-purple-500 rounded-full" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Glass>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Resources */}
        <Glass variant="medium" className="mt-8 p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Need Immediate Support?
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                If your mood tracking shows concerning patterns or you're experiencing thoughts of self-harm:
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:988"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Call 988 - Crisis Lifeline
                </a>
                <a
                  href="/crisis/chat"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Crisis Chat Support
                </a>
                <a
                  href="/crisis/safety-plan"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create Safety Plan
                </a>
              </div>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}