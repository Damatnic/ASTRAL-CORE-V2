'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart,
  BookOpen,
  Wind,
  Anchor,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelfHelpStats {
  moodEntries: number
  averageMood: number
  moodTrend: 'improving' | 'declining' | 'stable'
  journalEntries: number
  writingStreak: number
  breathingSessions: number
  groundingSessions: number
  recentActivity: Array<{
    type: string
    timestamp: Date
    improvement?: number
  }>
  recommendations: string[]
  crisisRisk: 'low' | 'medium' | 'high'
}

interface QuickAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  estimatedTime: string
  urgency: 'low' | 'medium' | 'high'
  color: string
  action: () => void
}

export default function SelfHelpWidget() {
  const [stats, setStats] = useState<SelfHelpStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadSelfHelpStats()
  }, [])

  const loadSelfHelpStats = async () => {
    try {
      setIsLoading(true)
      
      // Load data from multiple endpoints in parallel
      const [moodRes, journalRes, breathingRes, groundingRes] = await Promise.allSettled([
        fetch('/api/self-help/mood?days=7&patterns=true'),
        fetch('/api/self-help/journal?limit=5'),
        fetch('/api/self-help/breathing?sessions=true'),
        fetch('/api/self-help/grounding?sessions=true')
      ])

      let moodData: any = null, journalData: any = null, breathingData: any = null, groundingData: any = null

      if (moodRes.status === 'fulfilled' && moodRes.value.ok) {
        moodData = await moodRes.value.json()
      }
      if (journalRes.status === 'fulfilled' && journalRes.value.ok) {
        journalData = await journalRes.value.json()
      }
      if (breathingRes.status === 'fulfilled' && breathingRes.value.ok) {
        breathingData = await breathingRes.value.json()
      }
      if (groundingRes.status === 'fulfilled' && groundingRes.value.ok) {
        groundingData = await groundingRes.value.json()
      }

      // Compile stats
      const compiledStats: SelfHelpStats = {
        moodEntries: moodData?.data?.length || 0,
        averageMood: moodData?.stats?.averageMood || 5,
        moodTrend: moodData?.stats?.moodTrend || 'stable',
        journalEntries: journalData?.stats?.totalEntries || 0,
        writingStreak: journalData?.stats?.writingStreak || 0,
        breathingSessions: breathingData?.data?.stats?.totalSessions || 0,
        groundingSessions: groundingData?.data?.stats?.totalSessions || 0,
        recentActivity: compileRecentActivity(moodData, journalData, breathingData, groundingData),
        recommendations: generateRecommendations(moodData, journalData, breathingData, groundingData),
        crisisRisk: assessCrisisRisk(moodData)
      }

      setStats(compiledStats)
    } catch (error) {
      console.error('Error loading self-help stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const compileRecentActivity = (mood: any, journal: any, breathing: any, grounding: any) => {
    const activities: Array<{
      type: string;
      timestamp: Date;
      improvement?: number;
    }> = []
    
    // Add mood entries
    if (mood?.data) {
      mood.data.slice(0, 3).forEach((entry: any) => {
        activities.push({
          type: 'mood',
          timestamp: new Date(entry.timestamp),
          improvement: entry.mood >= 7 ? 1 : entry.mood <= 3 ? -1 : 0
        })
      })
    }

    // Add journal entries
    if (journal?.data) {
      journal.data.slice(0, 2).forEach((entry: any) => {
        activities.push({
          type: 'journal',
          timestamp: new Date(entry.createdAt)
        })
      })
    }

    // Add breathing sessions
    if (breathing?.data?.sessions) {
      breathing.data.sessions.slice(0, 2).forEach((session: any) => {
        const improvement = session.moodAfter && session.moodBefore 
          ? session.moodAfter - session.moodBefore 
          : 0
        activities.push({
          type: 'breathing',
          timestamp: new Date(session.startedAt),
          improvement
        })
      })
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)
  }

  const generateRecommendations = (mood: any, journal: any, breathing: any, grounding: any): string[] => {
    const recs = []
    
    // Check mood patterns
    if (mood?.stats?.averageMood < 5) {
      recs.push('Your mood has been low - try breathing exercises or grounding techniques')
    }
    
    if (mood?.patterns?.type === 'decline') {
      recs.push('Consider journaling to process your emotions and thoughts')
    }

    // Check activity levels
    if ((journal?.stats?.totalEntries || 0) === 0) {
      recs.push('Start journaling to track your mental health journey')
    }

    if ((breathing?.data?.stats?.totalSessions || 0) === 0) {
      recs.push('Try a 5-minute breathing exercise to reduce stress')
    }

    // Check streaks
    if ((journal?.stats?.writingStreak || 0) >= 7) {
      recs.push('Great job maintaining your journaling streak!')
    }

    // Default recommendations
    if (recs.length === 0) {
      recs.push('Keep up your self-care routine')
      recs.push('Try exploring a new wellness technique')
    }

    return recs.slice(0, 3)
  }

  const assessCrisisRisk = (moodData: any): 'low' | 'medium' | 'high' => {
    if (!moodData?.data || moodData.data.length === 0) return 'low'
    
    const recentMoods = moodData.data.slice(0, 3).map((entry: any) => entry.mood)
    const avgRecentMood = recentMoods.reduce((sum: number, mood: number) => sum + mood, 0) / recentMoods.length
    
    if (avgRecentMood <= 3) return 'high'
    if (avgRecentMood <= 5) return 'medium'
    return 'low'
  }

  const quickActions: QuickAction[] = [
    {
      id: 'mood-check',
      name: 'Quick Mood Check',
      description: 'Log your current mood',
      icon: Heart,
      estimatedTime: '1 min',
      urgency: stats?.crisisRisk === 'high' ? 'high' : 'low',
      color: 'text-red-500',
      action: () => window.location.href = '/self-help#mood'
    },
    {
      id: 'breathing',
      name: 'Calm Breathing',
      description: '4-7-8 breathing exercise',
      icon: Wind,
      estimatedTime: '3 min',
      urgency: stats?.crisisRisk === 'high' ? 'high' : stats?.crisisRisk === 'medium' ? 'medium' : 'low',
      color: 'text-blue-500',
      action: () => window.location.href = '/self-help#breathing'
    },
    {
      id: 'grounding',
      name: '5-4-3-2-1 Grounding',
      description: 'Return to the present moment',
      icon: Anchor,
      estimatedTime: '5 min',
      urgency: stats?.crisisRisk === 'high' ? 'high' : 'medium',
      color: 'text-emerald-500',
      action: () => window.location.href = '/self-help#grounding'
    },
    {
      id: 'journal',
      name: 'Quick Journal',
      description: 'Write down your thoughts',
      icon: BookOpen,
      estimatedTime: '10 min',
      urgency: 'low',
      color: 'text-indigo-500',
      action: () => window.location.href = '/self-help#journal'
    }
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Self-Help Tools</h3>
          <p className="text-gray-600 mb-4">Start your wellness journey today</p>
          <Link 
            href="/self-help"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Self-Help Tools
            </h3>
            <p className="text-sm text-gray-600 mt-1">Your wellness toolkit</p>
          </div>
          
          {/* Crisis Risk Indicator */}
          {stats.crisisRisk !== 'low' && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
              stats.crisisRisk === 'high' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            )}>
              <AlertCircle className="w-4 h-4" />
              {stats.crisisRisk === 'high' ? 'Needs Attention' : 'Check In'}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Mood</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {stats.averageMood.toFixed(1)}/10
              </span>
              {stats.moodTrend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {stats.moodTrend === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">Journal Streak</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {stats.writingStreak} {stats.writingStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {stats.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {stats.recommendations.slice(0, isExpanded ? 3 : 2).map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
            {stats.recommendations.length > 2 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showQuickActions ? 'Hide' : 'Show All'}
            </button>
          </div>
          
          <div className="space-y-2">
            {quickActions
              .filter(action => 
                showQuickActions || 
                action.urgency === 'high' || 
                (action.urgency === 'medium' && stats.crisisRisk !== 'low')
              )
              .slice(0, showQuickActions ? 4 : 2)
              .map((action) => {
                const IconComponent = action.icon
                return (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left",
                      action.urgency === 'high' ? "border-red-200 bg-red-50 hover:border-red-300" :
                      action.urgency === 'medium' ? "border-yellow-200 bg-yellow-50 hover:border-yellow-300" :
                      "border-gray-200 bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={cn("w-5 h-5", action.color)} />
                      <div>
                        <div className="font-medium text-gray-900">{action.name}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {action.estimatedTime}
                    </div>
                  </motion.button>
                )
              })}
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {activity.type === 'mood' && <Heart className="w-4 h-4 text-red-500" />}
                    {activity.type === 'journal' && <BookOpen className="w-4 h-4 text-indigo-500" />}
                    {activity.type === 'breathing' && <Wind className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'grounding' && <Anchor className="w-4 h-4 text-emerald-500" />}
                    <span className="text-gray-600 capitalize">{activity.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.improvement !== undefined && activity.improvement > 0 && (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-gray-500">
                      {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                        Math.floor((activity.timestamp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                        'day'
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View All Link */}
        <div className="pt-4 border-t border-gray-100">
          <Link 
            href="/self-help"
            className="flex items-center justify-center gap-2 w-full py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Tools
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}