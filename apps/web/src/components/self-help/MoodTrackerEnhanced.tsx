'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  BarChart3,
  Brain,
  Sun,
  Cloud,
  CloudRain,
  Activity,
  Users,
  Pill,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Emotion wheel based on Plutchik's Wheel of Emotions
const EMOTION_WHEEL = {
  joy: {
    color: 'bg-yellow-500',
    emotions: ['happy', 'excited', 'grateful', 'content', 'optimistic', 'proud'],
    intensity: [3, 5, 4, 2, 3, 4]
  },
  trust: {
    color: 'bg-green-500', 
    emotions: ['secure', 'accepted', 'valued', 'appreciated', 'respected', 'admired'],
    intensity: [4, 3, 4, 3, 4, 5]
  },
  fear: {
    color: 'bg-purple-500',
    emotions: ['anxious', 'worried', 'scared', 'nervous', 'stressed', 'overwhelmed'],
    intensity: [3, 2, 5, 3, 4, 5]
  },
  surprise: {
    color: 'bg-orange-500',
    emotions: ['amazed', 'confused', 'shocked', 'startled', 'astonished', 'speechless'],
    intensity: [4, 2, 5, 3, 5, 4]
  },
  sadness: {
    color: 'bg-blue-500',
    emotions: ['lonely', 'disappointed', 'hurt', 'depressed', 'hopeless', 'grief'],
    intensity: [3, 2, 3, 5, 5, 5]
  },
  disgust: {
    color: 'bg-indigo-500',
    emotions: ['disapproval', 'disappointed', 'awful', 'revulsion', 'loathing', 'detesting'],
    intensity: [2, 3, 4, 5, 5, 5]
  },
  anger: {
    color: 'bg-red-500',
    emotions: ['frustrated', 'annoyed', 'angry', 'furious', 'hostile', 'rage'],
    intensity: [2, 2, 3, 5, 4, 5]
  },
  anticipation: {
    color: 'bg-pink-500',
    emotions: ['interested', 'curious', 'eager', 'hopeful', 'excited', 'vigilant'],
    intensity: [2, 2, 3, 3, 4, 4]
  }
}

// Trigger categories for pattern detection
const TRIGGER_CATEGORIES = [
  { id: 'work', label: 'Work/School', icon: '💼' },
  { id: 'relationships', label: 'Relationships', icon: '❤️' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'finance', label: 'Finances', icon: '💰' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'social', label: 'Social', icon: '👥' },
  { id: 'personal', label: 'Personal', icon: '🧘' },
  { id: 'environment', label: 'Environment', icon: '🌍' }
]

// Activity tracking options
const ACTIVITIES = [
  { id: 'exercise', label: 'Exercise', icon: '🏃' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' },
  { id: 'socializing', label: 'Socializing', icon: '👥' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
  { id: 'nature', label: 'Nature', icon: '🌳' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'rest', label: 'Rest', icon: '😴' }
]

interface MoodEntry {
  mood: number
  emotions: string[]
  triggers: string[]
  activities: string[]
  sleepHours?: number
  notes?: string
  weather?: string
  medication?: boolean
  socialInteraction?: number
  timestamp: Date
}

interface Pattern {
  type: 'improvement' | 'decline' | 'stable' | 'volatile'
  confidence: number
  insights: string[]
  recommendations: string[]
}

export default function MoodTrackerEnhanced() {
  const [currentMood, setCurrentMood] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [sleepHours, setSleepHours] = useState<number>(7)
  const [socialInteraction, setSocialInteraction] = useState<number>(5)
  const [medicationTaken, setMedicationTaken] = useState(false)
  const [notes, setNotes] = useState('')
  const [weather, setWeather] = useState<string>('sunny')
  const [showEmotionWheel, setShowEmotionWheel] = useState(false)
  const [patterns, setPatterns] = useState<Pattern | null>(null)
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Pattern detection algorithm
  const detectPatterns = useCallback((history: MoodEntry[]) => {
    if (history.length < 3) return null

    const recent = history.slice(-7)
    const moods = recent.map(e => e.mood)
    
    // Calculate trend
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length
    const firstHalf = moods.slice(0, Math.floor(moods.length / 2))
    const secondHalf = moods.slice(Math.floor(moods.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    // Calculate volatility
    const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - avgMood, 2), 0) / moods.length
    const volatility = Math.sqrt(variance)
    
    // Determine pattern type
    let type: Pattern['type'] = 'stable'
    let confidence = 0.7
    const insights: string[] = []
    const recommendations: string[] = []
    
    if (volatility > 2) {
      type = 'volatile'
      insights.push('Your mood has been fluctuating significantly')
      recommendations.push('Consider identifying and managing triggers')
      recommendations.push('Practice grounding techniques during mood swings')
    } else if (secondAvg - firstAvg > 1) {
      type = 'improvement'
      confidence = Math.min(0.9, 0.7 + (secondAvg - firstAvg) * 0.1)
      insights.push('Your mood has been improving recently')
      insights.push(`Average mood increased from ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)}`)
      recommendations.push('Continue activities that have been helping')
    } else if (firstAvg - secondAvg > 1) {
      type = 'decline'
      confidence = Math.min(0.9, 0.7 + (firstAvg - secondAvg) * 0.1)
      insights.push('Your mood has been declining')
      insights.push(`Average mood decreased from ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)}`)
      recommendations.push('Consider reaching out for support')
      recommendations.push('Review your self-care routine')
    } else {
      insights.push('Your mood has been relatively stable')
      recommendations.push('Maintain your current wellness practices')
    }
    
    // Analyze triggers
    const allTriggers = recent.flatMap(e => e.triggers)
    const triggerCounts = allTriggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    
    if (topTriggers.length > 0) {
      insights.push(`Common triggers: ${topTriggers.map(([t]) => t).join(', ')}`)
    }
    
    // Analyze helpful activities
    const goodMoodEntries = recent.filter(e => e.mood >= 7)
    const helpfulActivities = goodMoodEntries.flatMap(e => e.activities)
    const activityCounts = helpfulActivities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    
    if (topActivities.length > 0) {
      recommendations.push(`Continue: ${topActivities.map(([a]) => a).join(', ')}`)
    }
    
    return { type, confidence, insights, recommendations }
  }, [])

  // Save mood entry
  const saveMoodEntry = async () => {
    const entry: MoodEntry = {
      mood: currentMood,
      emotions: selectedEmotions,
      triggers: selectedTriggers,
      activities: selectedActivities,
      sleepHours,
      socialInteraction,
      medication: medicationTaken,
      notes,
      weather,
      timestamp: new Date()
    }
    
    try {
      const response = await fetch('/api/self-help/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
      
      if (response.ok) {
        const newHistory = [...moodHistory, entry]
        setMoodHistory(newHistory)
        
        // Detect patterns
        setIsAnalyzing(true)
        setTimeout(() => {
          const detectedPatterns = detectPatterns(newHistory)
          setPatterns(detectedPatterns)
          setIsAnalyzing(false)
        }, 1500)
        
        // Reset form
        setCurrentMood(5)
        setSelectedEmotions([])
        setSelectedTriggers([])
        setSelectedActivities([])
        setNotes('')
      }
    } catch (error) {
      console.error('Error saving mood entry:', error)
    }
  }

  // Toggle emotion selection
  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Pattern Alert */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mood Tracker</h2>
              <p className="text-gray-600">Track your emotions and identify patterns</p>
            </div>
          </div>
          {patterns && (
            <div className={cn(
              "px-4 py-2 rounded-lg flex items-center gap-2",
              patterns.type === 'improvement' && "bg-green-100 text-green-800",
              patterns.type === 'decline' && "bg-red-100 text-red-800",
              patterns.type === 'stable' && "bg-blue-100 text-blue-800",
              patterns.type === 'volatile' && "bg-yellow-100 text-yellow-800"
            )}>
              {patterns.type === 'improvement' && <TrendingUp className="w-4 h-4" />}
              {patterns.type === 'decline' && <TrendingDown className="w-4 h-4" />}
              {patterns.type === 'stable' && <Activity className="w-4 h-4" />}
              {patterns.type === 'volatile' && <AlertCircle className="w-4 h-4" />}
              <span className="font-medium capitalize">{patterns.type} Pattern</span>
            </div>
          )}
        </div>
      </div>

      {/* Mood Slider */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Terrible</span>
            <span className="text-2xl">{currentMood === 1 ? '😢' : currentMood === 10 ? '😊' : '😐'}</span>
            <span>Excellent</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={currentMood}
            onChange={(e) => setCurrentMood(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
            }}
          />
          <div className="text-center text-3xl font-bold text-gray-800">
            {currentMood}/10
          </div>
        </div>
      </div>

      {/* Emotion Wheel */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Your Emotions</h3>
          <button
            onClick={() => setShowEmotionWheel(!showEmotionWheel)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showEmotionWheel ? 'Hide' : 'Show'} Emotion Wheel
          </button>
        </div>
        
        <AnimatePresence>
          {showEmotionWheel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(EMOTION_WHEEL).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className={cn(
                      "text-white text-sm font-semibold px-3 py-1 rounded-lg text-center",
                      data.color
                    )}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div className="space-y-1">
                      {data.emotions.map((emotion) => (
                        <button
                          key={emotion}
                          onClick={() => toggleEmotion(emotion)}
                          className={cn(
                            "w-full text-xs px-2 py-1 rounded transition-all",
                            selectedEmotions.includes(emotion)
                              ? "bg-blue-100 text-blue-700 border-blue-300 border"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-wrap gap-2">
          {selectedEmotions.map((emotion) => (
            <span
              key={emotion}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
            >
              {emotion}
              <button
                onClick={() => toggleEmotion(emotion)}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">What triggered these feelings?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRIGGER_CATEGORIES.map((trigger) => (
            <button
              key={trigger.id}
              onClick={() => {
                setSelectedTriggers(prev =>
                  prev.includes(trigger.id)
                    ? prev.filter(t => t !== trigger.id)
                    : [...prev, trigger.id]
                )
              }}
              className={cn(
                "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                selectedTriggers.includes(trigger.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span className="text-2xl">{trigger.icon}</span>
              <span className="text-xs font-medium">{trigger.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">What activities did you do today?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity.id}
              onClick={() => {
                setSelectedActivities(prev =>
                  prev.includes(activity.id)
                    ? prev.filter(a => a !== activity.id)
                    : [...prev, activity.id]
                )
              }}
              className={cn(
                "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                selectedActivities.includes(activity.id)
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span className="text-2xl">{activity.icon}</span>
              <span className="text-xs font-medium">{activity.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Tracking */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        
        {/* Sleep */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Moon className="w-4 h-4" />
            Sleep Hours: {sleepHours}
          </label>
          <input
            type="range"
            min="0"
            max="12"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Social Interaction */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4" />
            Social Interaction: {socialInteraction}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={socialInteraction}
            onChange={(e) => setSocialInteraction(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        {/* Weather */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Weather</label>
          <div className="flex gap-2">
            {[
              { id: 'sunny', icon: <Sun className="w-5 h-5" />, label: 'Sunny' },
              { id: 'cloudy', icon: <Cloud className="w-5 h-5" />, label: 'Cloudy' },
              { id: 'rainy', icon: <CloudRain className="w-5 h-5" />, label: 'Rainy' }
            ].map((w) => (
              <button
                key={w.id}
                onClick={() => setWeather(w.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                  weather === w.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                {w.icon}
                <span className="text-sm">{w.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Medication */}
        <div className="flex items-center gap-3">
          <Pill className="w-4 h-4 text-gray-600" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={medicationTaken}
              onChange={(e) => setMedicationTaken(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Took medication today
            </span>
          </label>
        </div>
        
        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts or reflections about your day..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pattern Insights */}
      {patterns && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pattern Analysis</h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {Math.round(patterns.confidence * 100)}% confidence
            </span>
          </div>
          
          <div className="space-y-3">
            {patterns.insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Insights</h4>
                <ul className="space-y-1">
                  {patterns.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {patterns.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations</h4>
                <ul className="space-y-1">
                  {patterns.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <button
        onClick={saveMoodEntry}
        disabled={isAnalyzing}
        className={cn(
          "w-full py-4 rounded-xl font-semibold text-white transition-all",
          isAnalyzing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        )}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-5 h-5" />
            </motion.div>
            Analyzing Patterns...
          </span>
        ) : (
          'Save Mood Entry'
        )}
      </button>
    </div>
  )
}