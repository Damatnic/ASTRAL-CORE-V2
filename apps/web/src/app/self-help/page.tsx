'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  BookOpen,
  Wind,
  Anchor,
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Import self-help components
import MoodTrackerEnhanced from '@/components/self-help/MoodTrackerEnhanced'
import JournalModule from '@/components/self-help/JournalModule'
import BreathingExercises from '@/components/self-help/BreathingExercises'
import GroundingTechniques from '@/components/self-help/GroundingTechniques'
import CrisisRapidRelief from '@/components/self-help/CrisisRapidRelief'
import MindfulnessHub from '@/components/self-help/MindfulnessHub'
import CBTToolsHub from '@/components/self-help/cbt/CBTToolsHub'
import DBTSkillsHub from '@/components/self-help/dbt/DBTSkillsHub'

const SELF_HELP_TOOLS = [
  {
    id: 'crisis-relief',
    name: 'Crisis Rapid Relief',
    description: 'Emergency techniques for immediate emotional crisis support',
    icon: Sparkles,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    benefits: ['Immediate relief', 'Crisis intervention', 'Safety techniques'],
    timeEstimate: '1-5 minutes',
    evidenceLevel: 'High',
    category: 'crisis'
  },
  {
    id: 'mood',
    name: 'Mood Tracking',
    description: 'Track emotions and identify patterns with AI insights',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    benefits: ['Pattern recognition', 'Crisis detection', 'Progress tracking'],
    timeEstimate: '2-5 minutes',
    evidenceLevel: 'High',
    category: 'tracking'
  },
  {
    id: 'journal',
    name: 'Secure Journaling',
    description: 'Private, encrypted journaling with guided prompts',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    benefits: ['Emotional processing', 'Reflection', 'Growth tracking'],
    timeEstimate: '10-30 minutes',
    evidenceLevel: 'High',
    category: 'reflection'
  },
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    description: 'Evidence-based breathing techniques for calm and focus',
    icon: Wind,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    benefits: ['Anxiety reduction', 'Stress relief', 'Focus improvement'],
    timeEstimate: '3-15 minutes',
    evidenceLevel: 'High',
    category: 'intervention'
  },
  {
    id: 'grounding',
    name: 'Grounding Techniques',
    description: 'Return to the present moment during distress',
    icon: Anchor,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    benefits: ['Crisis management', 'Panic relief', 'Dissociation help'],
    timeEstimate: '3-10 minutes',
    evidenceLevel: 'High',
    category: 'crisis'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness & Meditation',
    description: 'Guided meditation sessions for peace and clarity',
    icon: Target,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    benefits: ['Reduces stress', 'Improves focus', 'Emotional balance'],
    timeEstimate: '5-20 minutes',
    evidenceLevel: 'High',
    category: 'mindfulness'
  },
  {
    id: 'cbt-tools',
    name: 'CBT Tools',
    description: 'Cognitive Behavioral Therapy techniques for thought patterns',
    icon: TrendingUp,
    color: 'from-green-500 to-blue-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    benefits: ['Changes negative thoughts', 'Improves mood', 'Builds coping skills'],
    timeEstimate: '10-30 minutes',
    evidenceLevel: 'High',
    category: 'therapy'
  },
  {
    id: 'dbt-skills',
    name: 'DBT Skills',
    description: 'Dialectical Behavior Therapy skills for emotional regulation',
    icon: Activity,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    benefits: ['Distress tolerance', 'Emotion regulation', 'Interpersonal skills'],
    timeEstimate: '15-45 minutes',
    evidenceLevel: 'High',
    category: 'therapy'
  }
]

interface UserStats {
  moodEntries: number
  journalEntries: number
  breathingSessions: number
  groundingSessions: number
  currentStreak: number
  totalXP: number
  level: number
  recentMood?: number
  wellnessScore: number
}

export default function SelfHelpPage() {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    moodEntries: 0,
    journalEntries: 0,
    breathingSessions: 0,
    groundingSessions: 0,
    currentStreak: 0,
    totalXP: 0,
    level: 1,
    wellnessScore: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<string[]>([])

  // Load user stats and recommendations
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // Load stats from various endpoints
      const [moodResponse, journalResponse, breathingResponse, groundingResponse] = await Promise.allSettled([
        fetch('/api/self-help/mood?days=30&patterns=true'),
        fetch('/api/self-help/journal?limit=1'),
        fetch('/api/self-help/breathing?sessions=true'),
        fetch('/api/self-help/grounding?sessions=true')
      ])

      // Process responses
      let stats: Partial<UserStats> = {}
      
      if (moodResponse.status === 'fulfilled' && moodResponse.value.ok) {
        const moodData = await moodResponse.value.json()
        stats.moodEntries = moodData.data?.length || 0
        stats.recentMood = moodData.stats?.averageMood || undefined
      }

      if (journalResponse.status === 'fulfilled' && journalResponse.value.ok) {
        const journalData = await journalResponse.value.json()
        stats.journalEntries = journalData.stats?.totalEntries || 0
        stats.currentStreak = journalData.stats?.writingStreak || 0
      }

      if (breathingResponse.status === 'fulfilled' && breathingResponse.value.ok) {
        const breathingData = await breathingResponse.value.json()
        stats.breathingSessions = breathingData.data?.stats?.totalSessions || 0
      }

      if (groundingResponse.status === 'fulfilled' && groundingResponse.value.ok) {
        const groundingData = await groundingResponse.value.json()
        stats.groundingSessions = groundingData.data?.stats?.totalSessions || 0
      }

      // Calculate wellness score
      const totalActivities = (stats.moodEntries || 0) + (stats.journalEntries || 0) + 
                             (stats.breathingSessions || 0) + (stats.groundingSessions || 0)
      stats.wellnessScore = Math.min(100, totalActivities * 2)

      // Generate recommendations
      const recs = generateRecommendations(stats)
      setRecommendations(recs)
      
      setUserStats(prev => ({ ...prev, ...stats }))
      
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate personalized recommendations
  const generateRecommendations = (stats: Partial<UserStats>): string[] => {
    const recs = []
    
    if ((stats.moodEntries || 0) === 0) {
      recs.push('Start by tracking your mood to identify patterns')
    }
    
    if ((stats.currentStreak || 0) === 0) {
      recs.push('Try journaling to process your thoughts and emotions')
    }
    
    if ((stats.breathingSessions || 0) === 0) {
      recs.push('Practice breathing exercises for 5 minutes to reduce stress')
    }
    
    if (stats.recentMood && stats.recentMood < 5) {
      recs.push('Your recent mood is low - consider grounding techniques or talking to someone')
    }
    
    if ((stats.currentStreak || 0) >= 7) {
      recs.push('Amazing! You have a great journaling streak going')
    }
    
    if (recs.length === 0) {
      recs.push('You\'re doing great! Keep up your self-care routine')
      recs.push('Try exploring a new technique to expand your toolkit')
    }
    
    return recs.slice(0, 3)
  }

  // Render active tool component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'crisis-relief':
        return <CrisisRapidRelief />
      case 'mood':
        return <MoodTrackerEnhanced />
      case 'journal':
        return <JournalModule />
      case 'breathing':
        return <BreathingExercises />
      case 'grounding':
        return <GroundingTechniques />
      case 'mindfulness':
        return <MindfulnessHub />
      case 'cbt-tools':
        return <CBTToolsHub />
      case 'dbt-skills':
        return <DBTSkillsHub />
      default:
        return null
    }
  }

  if (activeTab) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Self-Help Tools
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {SELF_HELP_TOOLS.find(tool => tool.id === activeTab)?.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Active Component */}
        <div className="pb-8">
          {renderActiveComponent()}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Self-Help Tools</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Evidence-based tools to support your mental health journey. Track your progress, 
              build resilience, and develop coping skills at your own pace.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Personal Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Wellness Score */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Wellness Score</h3>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {userStats.wellnessScore}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${userStats.wellnessScore}%` }}
              />
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">This Month</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mood entries</span>
                <span className="font-medium">{userStats.moodEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Journal entries</span>
                <span className="font-medium">{userStats.journalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Breathing sessions</span>
                <span className="font-medium">{userStats.breathingSessions}</span>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Current Streak</h3>
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {userStats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">
              {userStats.currentStreak === 1 ? 'day' : 'days'} of journaling
            </div>
          </div>

          {/* Recent Mood */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Mood</h3>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {userStats.recentMood ? `${userStats.recentMood.toFixed(1)}/10` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {userStats.recentMood 
                ? userStats.recentMood >= 7 ? 'Feeling good' : userStats.recentMood >= 4 ? 'Moderate' : 'Needs attention'
                : 'Start tracking'
              }
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Personalized Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Self-Help Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SELF_HELP_TOOLS.map((tool, index) => {
            const IconComponent = tool.icon
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg cursor-pointer group",
                  tool.borderColor
                )}
                onClick={() => setActiveTab(tool.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      tool.bgColor
                    )}>
                      <IconComponent className={cn("w-6 h-6", tool.textColor)} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4" />
                      {tool.timeEstimate}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600">{tool.description}</p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Benefits:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tool.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              tool.bgColor,
                              tool.textColor
                            )}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Level */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Evidence:</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                tool.evidenceLevel === 'High' ||
                                (tool.evidenceLevel === 'Moderate' && i < 3) ||
                                (tool.evidenceLevel === 'Emerging' && i < 2)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 group-hover:text-gray-700 transition-colors">
                        Try now →
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Stats Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Your Progress Overview
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Mood Tracked', value: userStats.moodEntries, color: 'text-red-600' },
                { label: 'Journal Entries', value: userStats.journalEntries, color: 'text-indigo-600' },
                { label: 'Breathing Sessions', value: userStats.breathingSessions, color: 'text-blue-600' },
                { label: 'Grounding Sessions', value: userStats.groundingSessions, color: 'text-emerald-600' }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={cn("text-2xl font-bold", stat.color)}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">New to self-help tools?</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Start with mood tracking to establish a baseline</li>
                <li>• Try the 4-7-8 breathing exercise for immediate relief</li>
                <li>• Use the 5-4-3-2-1 grounding technique during stress</li>
                <li>• Journal regularly to process emotions and track progress</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">In crisis or high distress?</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Use TIPP technique for immediate crisis relief</li>
                <li>• Try grounding techniques to return to the present</li>
                <li>• Consider reaching out to crisis support if needed</li>
                <li>• Remember: you're not alone, and help is available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}