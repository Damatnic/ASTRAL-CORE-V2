import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, TrendingUp, Heart, Brain, Activity, Moon,
  Sun, Cloud, CloudRain, Zap, Coffee, Smile, Meh, Frown,
  Star, Target, Award, BarChart3, Plus, ChevronRight,
  CheckCircle, AlertCircle, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  sleep: number; // hours
  notes?: string;
  activities: string[];
  triggers?: string[];
  copingStrategies?: string[];
  gratitude?: string[];
}

interface MoodTrackerProps {
  onMoodSubmit?: (entry: MoodEntry) => void;
  className?: string;
}

interface WellnessInsight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  action?: string;
}

const MOOD_LEVELS = [
  { value: 1, label: 'Terrible', emoji: '😭', color: 'text-red-600' },
  { value: 2, label: 'Very Bad', emoji: '😢', color: 'text-red-500' },
  { value: 3, label: 'Bad', emoji: '😞', color: 'text-red-400' },
  { value: 4, label: 'Not Great', emoji: '😕', color: 'text-orange-500' },
  { value: 5, label: 'Okay', emoji: '😐', color: 'text-yellow-500' },
  { value: 6, label: 'Decent', emoji: '🙂', color: 'text-yellow-400' },
  { value: 7, label: 'Good', emoji: '😊', color: 'text-green-400' },
  { value: 8, label: 'Great', emoji: '😄', color: 'text-green-500' },
  { value: 9, label: 'Amazing', emoji: '😁', color: 'text-green-600' },
  { value: 10, label: 'Perfect', emoji: '🤩', color: 'text-green-700' }
];

const ACTIVITIES = [
  'Exercise', 'Reading', 'Music', 'Social time', 'Work', 'Meditation',
  'Outdoor time', 'Cooking', 'Gaming', 'Creative work', 'Learning',
  'Volunteering', 'Therapy', 'Support group', 'Self-care'
];

const COMMON_TRIGGERS = [
  'Work stress', 'Relationships', 'Money worries', 'Health concerns',
  'Social media', 'News', 'Weather', 'Sleep issues', 'Isolation',
  'Conflict', 'Overwhelm', 'Uncertainty'
];

const COPING_STRATEGIES = [
  'Deep breathing', 'Meditation', 'Exercise', 'Talking to friend',
  'Journaling', 'Music', 'Walking', 'Hot shower', 'Reading',
  'Creative activity', 'Professional help', 'Support group'
];

// Generate sample data for demonstration
const generateSampleData = (): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    entries.push({
      id: `entry-${i}`,
      date: date.toISOString().split('T')[0],
      mood: Math.floor(Math.random() * 4) + 4 + Math.floor(Math.random() * 4), // 4-10 range
      energy: Math.floor(Math.random() * 4) + 3 + Math.floor(Math.random() * 4), // 3-9 range
      stress: Math.floor(Math.random() * 6) + 2, // 2-8 range
      sleep: Math.random() * 3 + 6, // 6-9 hours
      activities: ACTIVITIES.slice(0, Math.floor(Math.random() * 4) + 1),
      triggers: Math.random() > 0.7 ? COMMON_TRIGGERS.slice(0, Math.floor(Math.random() * 2) + 1) : [],
      copingStrategies: Math.random() > 0.5 ? COPING_STRATEGIES.slice(0, Math.floor(Math.random() * 3) + 1) : []
    });
  }
  
  return entries;
};

const MoodScale: React.FC<{
  value: number;
  onChange: (value: number) => void;
  label: string;
  type: 'mood' | 'energy' | 'stress';
}> = ({ value, onChange, label, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'mood': return <Heart className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'stress': return <Brain className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    if (type === 'stress') {
      return value <= 3 ? 'text-green-500' : value <= 6 ? 'text-yellow-500' : 'text-red-500';
    }
    return value <= 3 ? 'text-red-500' : value <= 6 ? 'text-yellow-500' : 'text-green-500';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn('p-2 rounded-lg', getColor())}>{getIcon()}</div>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className={cn('text-2xl font-bold', getColor())}>{value}</span>
      </div>
      
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 h-8 rounded transition-all',
              value >= level
                ? type === 'stress'
                  ? level <= 3 ? 'bg-green-500' : level <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  : level <= 3 ? 'bg-red-500' : level <= 6 ? 'bg-yellow-500' : 'bg-green-500'
                : 'bg-gray-200 hover:bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  );
};

const WellnessChart: React.FC<{ entries: MoodEntry[] }> = ({ entries }) => {
  const recent7Days = entries.slice(-7);
  const maxValue = 10;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Trend</h3>
      
      <div className="h-48 flex items-end justify-between space-x-2">
        {recent7Days.map((entry, index) => {
          const moodHeight = (entry.mood / maxValue) * 100;
          const energyHeight = (entry.energy / maxValue) * 100;
          const stressHeight = (entry.stress / maxValue) * 100;
          
          return (
            <div key={entry.id} className="flex-1 flex flex-col items-center space-y-2">
              <div className="flex space-x-1 h-32 items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${moodHeight}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="w-3 bg-blue-500 rounded-t"
                  title={`Mood: ${entry.mood}`}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${energyHeight}%` }}
                  transition={{ delay: index * 0.1 + 0.05 }}
                  className="w-3 bg-yellow-500 rounded-t"
                  title={`Energy: ${entry.energy}`}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${stressHeight}%` }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  className="w-3 bg-red-500 rounded-t"
                  title={`Stress: ${entry.stress}`}
                />
              </div>
              <span className="text-xs text-gray-600">
                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center space-x-4 mt-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Mood</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Energy</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Stress</span>
        </div>
      </div>
    </div>
  );
};

const InsightCard: React.FC<{ insight: WellnessInsight }> = ({ insight }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'neutral': return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'neutral': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={cn('p-4 rounded-lg border', getBgColor())}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{insight.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
          {insight.action && (
            <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
              {insight.action} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  onMoodSubmit,
  className
}) => {
  const [entries, setEntries] = useState<MoodEntry[]>(generateSampleData());
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<MoodEntry>>({
    mood: 5,
    energy: 5,
    stress: 5,
    sleep: 7,
    activities: [],
    triggers: [],
    copingStrategies: [],
    gratitude: []
  });

  // Generate insights based on recent data
  const getInsights = (): WellnessInsight[] => {
    const recent7 = entries.slice(-7);
    const insights: WellnessInsight[] = [];

    // Mood trend
    const avgMood = recent7.reduce((sum, entry) => sum + entry.mood, 0) / recent7.length;
    const moodTrend = recent7.length >= 2 ? recent7[recent7.length - 1].mood - recent7[recent7.length - 2].mood : 0;

    if (avgMood >= 7) {
      insights.push({
        type: 'positive',
        title: 'Great Mood Streak!',
        description: 'Your mood has been consistently good this week. Keep up the great work!',
        action: 'See what\'s working'
      });
    } else if (avgMood <= 4) {
      insights.push({
        type: 'warning',
        title: 'Mood Support Needed',
        description: 'Your mood has been lower than usual. Consider reaching out for support.',
        action: 'View crisis resources'
      });
    }

    // Stress levels
    const avgStress = recent7.reduce((sum, entry) => sum + entry.stress, 0) / recent7.length;
    if (avgStress >= 7) {
      insights.push({
        type: 'warning',
        title: 'High Stress Detected',
        description: 'Your stress levels have been elevated. Try some breathing exercises.',
        action: 'Try breathing exercise'
      });
    }

    // Sleep patterns
    const avgSleep = recent7.reduce((sum, entry) => sum + entry.sleep, 0) / recent7.length;
    if (avgSleep < 6) {
      insights.push({
        type: 'warning',
        title: 'Sleep Improvement Needed',
        description: 'You\'re averaging less than 6 hours of sleep. This affects mood and energy.',
        action: 'Sleep tips'
      });
    } else if (avgSleep >= 7.5) {
      insights.push({
        type: 'positive',
        title: 'Excellent Sleep Habits',
        description: 'You\'re getting great sleep! This supports your mental health.',
      });
    }

    return insights;
  };

  const handleSubmitEntry = () => {
    const newEntry: MoodEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mood: currentEntry.mood || 5,
      energy: currentEntry.energy || 5,
      stress: currentEntry.stress || 5,
      sleep: currentEntry.sleep || 7,
      notes: currentEntry.notes,
      activities: currentEntry.activities || [],
      triggers: currentEntry.triggers || [],
      copingStrategies: currentEntry.copingStrategies || [],
      gratitude: currentEntry.gratitude || []
    };

    setEntries(prev => [...prev, newEntry]);
    onMoodSubmit?.(newEntry);
    setShowNewEntry(false);
    setCurrentEntry({
      mood: 5,
      energy: 5,
      stress: 5,
      sleep: 7,
      activities: [],
      triggers: [],
      copingStrategies: [],
      gratitude: []
    });
  };

  const insights = getInsights();
  const todayEntry = entries.find(entry => entry.date === new Date().toISOString().split('T')[0]);

  return (
    <div className={cn('max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wellness Dashboard</h1>
        <p className="text-lg text-gray-600">
          Track your mood, energy, and wellness patterns
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Mood', value: todayEntry?.mood || 'Not logged', icon: Heart, color: 'text-blue-500' },
          { label: 'Energy Level', value: todayEntry?.energy || 'Not logged', icon: Zap, color: 'text-yellow-500' },
          { label: 'Stress Level', value: todayEntry?.stress || 'Not logged', icon: Brain, color: 'text-red-500' },
          { label: 'Sleep (hrs)', value: todayEntry?.sleep?.toFixed(1) || 'Not logged', icon: Moon, color: 'text-purple-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <stat.icon className={cn('w-5 h-5', stat.color)} />
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Chart and Quick Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WellnessChart entries={entries} />
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Entry</h3>
            {!todayEntry && (
              <button
                onClick={() => setShowNewEntry(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Mood</span>
              </button>
            )}
          </div>
          
          {todayEntry ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mood</span>
                <span className="text-2xl">{MOOD_LEVELS[todayEntry.mood - 1]?.emoji}</span>
              </div>
              <div className="text-sm text-gray-600">
                Energy: {todayEntry.energy}/10 • Stress: {todayEntry.stress}/10
              </div>
              {todayEntry.activities.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Activities: </span>
                  <span>{todayEntry.activities.join(', ')}</span>
                </div>
              )}
            </div>
          ) : !showNewEntry ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No entry for today yet</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewEntry(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Log Today's Mood</h2>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Mood Scales */}
                <MoodScale
                  value={currentEntry.mood || 5}
                  onChange={(value) => setCurrentEntry(prev => ({ ...prev, mood: value }))}
                  label="How are you feeling?"
                  type="mood"
                />
                
                <MoodScale
                  value={currentEntry.energy || 5}
                  onChange={(value) => setCurrentEntry(prev => ({ ...prev, energy: value }))}
                  label="Energy Level"
                  type="energy"
                />
                
                <MoodScale
                  value={currentEntry.stress || 5}
                  onChange={(value) => setCurrentEntry(prev => ({ ...prev, stress: value }))}
                  label="Stress Level"
                  type="stress"
                />

                {/* Sleep */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hours of Sleep Last Night
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={currentEntry.sleep || 7}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, sleep: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Activities */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Activities Today (Select all that apply)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ACTIVITIES.map(activity => (
                      <label key={activity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={currentEntry.activities?.includes(activity) || false}
                          onChange={(e) => {
                            const activities = currentEntry.activities || [];
                            if (e.target.checked) {
                              setCurrentEntry(prev => ({ 
                                ...prev, 
                                activities: [...activities, activity] 
                              }));
                            } else {
                              setCurrentEntry(prev => ({ 
                                ...prev, 
                                activities: activities.filter(a => a !== activity) 
                              }));
                            }
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{activity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={currentEntry.notes || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="How was your day? Any thoughts or reflections..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowNewEntry(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitEntry}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodTracker;