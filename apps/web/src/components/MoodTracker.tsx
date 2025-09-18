'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Smile, Frown, Meh, Heart, Brain, TrendingUp, TrendingDown,
  Calendar, Clock, Award, Target, Activity, Sun, Moon,
  Cloud, CloudRain, Coffee, Pill, Users, Home, Briefcase
} from 'lucide-react';

interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 1-10 scale
  emotions: {
    happy: number;
    sad: number;
    anxious: number;
    angry: number;
    calm: number;
    energetic: number;
  };
  triggers: string[];
  activities: string[];
  sleepHours: number;
  notes: string;
  weather?: string;
  medication?: boolean;
  socialInteraction?: number;
}

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

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
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
  const [patterns, setPatterns] = useState<MoodPattern[]>([]);

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

  useEffect(() => {
    loadMoodData();
  }, []);

  useEffect(() => {
    analyzePatterns();
  }, [moodEntries]);

  const loadMoodData = async () => {
    try {
      // Load mood data from localStorage
      const storedEntries = localStorage.getItem('astral_mood_entries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        setMoodEntries(entries.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        })));
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
      setMoodEntries([]);
    }
  };

  const saveMoodData = (entries: MoodEntry[]) => {
    try {
      localStorage.setItem('astral_mood_entries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving mood data:', error);
    }
  };

  const analyzePatterns = () => {
    if (moodEntries.length === 0) {
      setPatterns([]);
      return;
    }

    const patterns: MoodPattern[] = [];
    
    // Analyze mood trends over time
    if (moodEntries.length >= 7) {
      const recentMoods = moodEntries.slice(-7).map(entry => entry.mood);
      const trend = recentMoods[recentMoods.length - 1] - recentMoods[0];
      
      if (trend > 2) {
        patterns.push({
          pattern: 'Weekly Improvement',
          description: 'Your mood has been improving over the past week',
          recommendation: 'Keep up the positive momentum with current activities',
          severity: 'positive'
        });
      } else if (trend < -2) {
        patterns.push({
          pattern: 'Declining Trend',
          description: 'Your mood has been declining recently',
          recommendation: 'Consider reaching out for support or trying new coping strategies',
          severity: 'concerning'
        });
      }
    }

    // Analyze activity correlations
    const activitiesWithMood = moodEntries.filter(entry => entry.activities.length > 0);
    if (activitiesWithMood.length >= 3) {
      const activityMoodMap: Record<string, number[]> = {};
      
      activitiesWithMood.forEach(entry => {
        entry.activities.forEach(activityId => {
          if (!activityMoodMap[activityId]) {
            activityMoodMap[activityId] = [];
          }
          activityMoodMap[activityId].push(entry.mood);
        });
      });

      Object.entries(activityMoodMap).forEach(([activityId, moods]) => {
        if (moods.length >= 2) {
          const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
          const activity = activities.find(a => a.id === activityId);
          
          if (activity && avgMood >= 7) {
            patterns.push({
              pattern: 'Activity Correlation',
              description: `${activity.label} sessions are associated with better mood`,
              recommendation: `Consider incorporating more ${activity.label.toLowerCase()} into your routine`,
              severity: 'positive'
            });
          }
        }
      });
    }

    setPatterns(patterns);
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 4) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const saveMoodEntry = () => {
    const newEntry: MoodEntry = {
      id: `mood_${Date.now()}`,
      date: new Date(),
      mood: currentMood,
      emotions: currentEmotions,
      triggers: selectedTriggers,
      activities: selectedActivities,
      sleepHours: 7,
      notes: '',
    };
    
    const updatedEntries = [...moodEntries, newEntry];
    setMoodEntries(updatedEntries);
    saveMoodData(updatedEntries);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
              <p className="text-gray-600 mt-1">Monitor your emotional well-being over time</p>
            </div>
            <button
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Log Mood
            </button>
          </div>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">How are you feeling today?</h2>
            
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

            {/* Emotions Grid */}
            <div className="mb-6">
              <p className="text-gray-600 mb-3">Rate your emotions (1-10)</p>
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
              <p className="text-gray-600 mb-3">What triggered these feelings?</p>
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
                        ? 'border-red-500 bg-red-50 text-red-700'
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
              <p className="text-gray-600 mb-3">What activities did you do?</p>
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
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <activity.icon className="w-4 h-4" />
                    <span className="text-sm">{activity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveMoodEntry}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Save Entry
            </button>
          </div>
        )}

        {/* Charts Grid */}
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

          {/* Emotion Radar */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Emotion Balance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="emotion" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Average" dataKey="average" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Patterns & Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Patterns & Insights</h3>
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    pattern.severity === 'positive' ? 'border-green-500 bg-green-50' :
                    pattern.severity === 'concerning' ? 'border-red-500 bg-red-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{pattern.pattern}</p>
                      <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                      <p className="text-sm font-medium mt-2 text-gray-700">
                        💡 {pattern.recommendation}
                      </p>
                    </div>
                    {pattern.severity === 'positive' && <TrendingUp className="w-5 h-5 text-green-600" />}
                    {pattern.severity === 'concerning' && <TrendingDown className="w-5 h-5 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Recent Entries</h3>
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
                      Mood: {entry.mood}/10 • Sleep: {entry.sleepHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </div>
  );
}