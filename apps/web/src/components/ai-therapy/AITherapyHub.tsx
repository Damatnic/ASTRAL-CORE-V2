'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Heart,
  Star,
  MessageCircle,
  Calendar,
  BookOpen,
  Shield,
  Lock,
  Zap,
  Sparkles,
  User,
  Clock,
  Award,
  TrendingUp,
  Activity,
  CheckCircle,
  Send,
  AlertCircle,
  Wind,
  Headphones,
  FileText,
  HelpCircle,
  PenTool,
  Eye,
  Users,
  Smile,
  Frown,
  Meh,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AITherapist {
  id: string
  name: string
  specialty: string[]
  personality: string
  avatar: string
  description: string
  approaches: string[]
  bestFor: string[]
  sessionsCompleted: number
  userRating: number
  availability: '24/7' | 'scheduled' | 'on-demand'
  features: string[]
}

interface AITherapySession {
  id: string
  therapistId: string
  userId: string
  startTime: Date
  endTime?: Date
  sessionType: 'crisis' | 'scheduled' | 'check-in' | 'intensive'
  mood: {
    before: number
    after?: number
  }
  topics: string[]
  insights: string[]
  recommendations: string[]
  nextSessionSuggested?: Date
  encrypted: boolean
}

import { aiTherapistProfiles, convertToAITherapist } from '@/components/ai-therapy/EnhancedTherapistProfiles'

const AI_THERAPISTS: AITherapist[] = aiTherapistProfiles.map(convertToAITherapist)

interface AITherapyHubProps {
  userId: string
  onSessionStart: (therapist: AITherapist, sessionType: string) => void
}

export default function AITherapyHub({ userId, onSessionStart }: AITherapyHubProps) {
  const [selectedTherapist, setSelectedTherapist] = useState<AITherapist | null>(null)
  const [sessionHistory, setSessionHistory] = useState<AITherapySession[]>([])
  const [currentMood, setCurrentMood] = useState<number>(5)
  const [preferredTopics, setPreferredTopics] = useState<string[]>([])
  const [showScheduler, setShowScheduler] = useState(false)
  const [isLogMoodLoading, setIsLogMoodLoading] = useState(false)
  const [moodNotes, setMoodNotes] = useState('')
  const [moodHistory, setMoodHistory] = useState<any[]>([])
  const [showMoodHistory, setShowMoodHistory] = useState(false)
  const [showResources, setShowResources] = useState(false)
  const [activeResource, setActiveResource] = useState<string | null>(null)

  useEffect(() => {
    loadSessionHistory()
    loadUserPreferences()
    loadMoodHistory()
  }, [userId])

  const loadSessionHistory = async () => {
    try {
      const response = await fetch(`/api/ai-therapy/sessions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionHistory(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to load session history:', error)
    }
  }

  const loadUserPreferences = async () => {
    try {
      const response = await fetch(`/api/ai-therapy/preferences?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPreferredTopics(data.preferredTopics || [])
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    }
  }

  const loadMoodHistory = async () => {
    try {
      const response = await fetch('/api/mood?limit=7')
      if (response.ok) {
        const data = await response.json()
        setMoodHistory(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load mood history:', error)
    }
  }

  const logMood = async () => {
    setIsLogMoodLoading(true)
    try {
      const moodData = {
        mood: currentMood,
        notes: moodNotes,
        emotions: getMoodEmotions(currentMood),
        timestamp: new Date().toISOString()
      }

      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moodData)
      })

      if (response.ok) {
        toast.success('Mood logged successfully!', {
          description: `Your mood level of ${currentMood}/10 has been recorded.`
        })
        setMoodNotes('')
        await loadMoodHistory()
        
        // Show mood-based recommendations
        if (currentMood <= 3) {
          toast.warning('We noticed you\'re having a tough time', {
            description: 'Consider trying our crisis resources or breathing exercises',
            action: {
              label: 'View Resources',
              onClick: () => setShowResources(true)
            }
          })
        }
      } else {
        throw new Error('Failed to log mood')
      }
    } catch (error) {
      console.error('Error logging mood:', error)
      toast.error('Failed to log mood', {
        description: 'Please try again later'
      })
    } finally {
      setIsLogMoodLoading(false)
    }
  }

  const getMoodEmotions = (mood: number) => {
    if (mood <= 2) return { sad: true, anxious: true, overwhelmed: true }
    if (mood <= 4) return { worried: true, stressed: true, tired: true }
    if (mood <= 6) return { neutral: true, okay: true, stable: true }
    if (mood <= 8) return { content: true, calm: true, hopeful: true }
    return { happy: true, excited: true, energetic: true }
  }

  const getMoodIcon = (mood: number) => {
    if (mood <= 3) return <Frown className="w-5 h-5 text-red-500" />
    if (mood <= 6) return <Meh className="w-5 h-5 text-yellow-500" />
    return <Smile className="w-5 h-5 text-green-500" />
  }

  const getMoodLabel = (mood: number) => {
    if (mood <= 2) return 'Very Low'
    if (mood <= 4) return 'Low'
    if (mood <= 6) return 'Neutral'
    if (mood <= 8) return 'Good'
    return 'Excellent'
  }

  const startAISession = async (therapist: AITherapist, sessionType: string) => {
    try {
      const sessionData = {
        therapistId: therapist.id,
        sessionType,
        mood: { before: currentMood },
        topics: preferredTopics,
        timestamp: new Date()
      }

      const response = await fetch('/api/ai-therapy/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        onSessionStart(therapist, sessionType)
      }
    } catch (error) {
      console.error('Failed to start AI therapy session:', error)
    }
  }

  const getTherapistRecommendation = () => {
    // Simple recommendation logic based on mood and session history
    if (currentMood <= 3) {
      return AI_THERAPISTS.find(t => t.id === 'aria') // Crisis intervention specialist
    } else if (sessionHistory.some(s => s.topics.includes('trauma'))) {
      return AI_THERAPISTS.find(t => t.id === 'sage') // Trauma specialist
    } else if (preferredTopics.includes('sleep') || preferredTopics.includes('wellness')) {
      return AI_THERAPISTS.find(t => t.id === 'luna') // Wellness specialist
    }
    return AI_THERAPISTS[0] // Default to Dr. Aria
  }

  const recommendedTherapist = getTherapistRecommendation()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Therapy Hub</h1>
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with our AI therapy specialists for personalized mental health support, 
          available 24/7 with complete privacy and confidentiality.
        </p>
      </div>

      {/* Enhanced Mood Check-in with Submit */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Quick Mood Check-in
          </h3>
          <button
            onClick={() => setShowMoodHistory(!showMoodHistory)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <TrendingUp className="w-4 h-4" />
            {showMoodHistory ? 'Hide' : 'View'} History
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Mood Slider with Visual Feedback */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">How are you feeling right now?</span>
              <div className="flex items-center gap-2">
                {getMoodIcon(currentMood)}
                <span className="font-medium text-gray-900">{getMoodLabel(currentMood)}</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg" />
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentMood}
                onChange={(e) => setCurrentMood(Number(e.target.value))}
                className="relative w-full h-3 appearance-none cursor-pointer bg-transparent"
                style={{
                  background: 'transparent'
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">1</span>
              <span className="text-xs text-gray-500">5</span>
              <span className="text-xs text-gray-500">10</span>
            </div>
          </div>

          {/* Mood Notes */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Any notes about how you're feeling? (optional)</label>
            <textarea
              value={moodNotes}
              onChange={(e) => setMoodNotes(e.target.value)}
              placeholder="e.g., Feeling anxious about work, had trouble sleeping..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          {/* Submit Button and Current Mood Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-800">{currentMood}/10</span>
              {currentMood <= 3 && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Crisis resources available
                </span>
              )}
            </div>
            <button
              onClick={logMood}
              disabled={isLogMoodLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLogMoodLoading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Logging...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Log Mood
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mood History Visualization */}
        <AnimatePresence>
          {showMoodHistory && moodHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <h4 className="text-sm font-medium text-gray-700 mb-3">Last 7 Days</h4>
              <div className="flex gap-2">
                {moodHistory.map((entry, index) => (
                  <div key={index} className="flex-1 text-center">
                    <div 
                      className="h-20 bg-gray-100 rounded relative overflow-hidden"
                      title={`Mood: ${entry.mood}/10`}
                    >
                      <div 
                        className={cn(
                          "absolute bottom-0 left-0 right-0 transition-all",
                          entry.mood <= 3 ? "bg-red-400" :
                          entry.mood <= 6 ? "bg-yellow-400" :
                          "bg-green-400"
                        )}
                        style={{ height: `${entry.mood * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(entry.timestamp || entry.createdAt).toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Average mood: <span className="font-medium">
                  {(moodHistory.reduce((sum, e) => sum + e.mood, 0) / moodHistory.length).toFixed(1)}/10
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Therapeutic Resources Section */}
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Therapeutic Resources
          </h2>
          <span className="text-sm text-gray-600">Evidence-based tools for mental wellness</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Guided Meditation */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('meditation')}
            className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all group"
          >
            <Headphones className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Guided Meditation</h3>
            <p className="text-sm text-gray-600">Mindfulness & relaxation exercises</p>
            <ChevronRight className="w-4 h-4 text-purple-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Breathing Exercises */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('breathing')}
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all group"
          >
            <Wind className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Breathing Exercises</h3>
            <p className="text-sm text-gray-600">Calm anxiety & reduce stress</p>
            <ChevronRight className="w-4 h-4 text-blue-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* CBT Worksheets */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('cbt')}
            className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all group"
          >
            <FileText className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">CBT Tools</h3>
            <p className="text-sm text-gray-600">Cognitive behavioral worksheets</p>
            <ChevronRight className="w-4 h-4 text-green-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Crisis Coping */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('crisis')}
            className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:shadow-md transition-all group"
          >
            <Shield className="w-8 h-8 text-red-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Crisis Coping</h3>
            <p className="text-sm text-gray-600">Immediate relief techniques</p>
            <ChevronRight className="w-4 h-4 text-red-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Journaling Prompts */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('journaling')}
            className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:shadow-md transition-all group"
          >
            <PenTool className="w-8 h-8 text-yellow-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Journaling</h3>
            <p className="text-sm text-gray-600">Reflective writing prompts</p>
            <ChevronRight className="w-4 h-4 text-yellow-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Grounding Exercises */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('grounding')}
            className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:shadow-md transition-all group"
          >
            <Eye className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Grounding</h3>
            <p className="text-sm text-gray-600">5-4-3-2-1 technique & more</p>
            <ChevronRight className="w-4 h-4 text-indigo-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Progressive Muscle Relaxation */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('pmr')}
            className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:shadow-md transition-all group"
          >
            <Activity className="w-8 h-8 text-pink-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Muscle Relaxation</h3>
            <p className="text-sm text-gray-600">Progressive relaxation guide</p>
            <ChevronRight className="w-4 h-4 text-pink-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Mindfulness Activities */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveResource('mindfulness')}
            className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:shadow-md transition-all group"
          >
            <Brain className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Mindfulness</h3>
            <p className="text-sm text-gray-600">Present moment awareness</p>
            <ChevronRight className="w-4 h-4 text-teal-600 mt-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Resource Detail Modal */}
        <AnimatePresence>
          {activeResource && (
            <ResourceDetailModal
              resource={activeResource}
              onClose={() => setActiveResource(null)}
              currentMood={currentMood}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recommended Therapist */}
      {recommendedTherapist && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">{recommendedTherapist.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{recommendedTherapist.name}</h3>
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Recommended for you</span>
              </div>
              <p className="text-gray-600 mb-4">{recommendedTherapist.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {recommendedTherapist.bestFor.slice(0, 3).map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
              <button
                onClick={() => startAISession(recommendedTherapist, 'check-in')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Start Session with {recommendedTherapist.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All AI Therapists */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Our AI Therapy Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AI_THERAPISTS.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              therapist={therapist}
              onSelect={() => setSelectedTherapist(therapist)}
              onStartSession={(type) => startAISession(therapist, type)}
              isRecommended={therapist.id === recommendedTherapist?.id}
            />
          ))}
        </div>
      </div>

      {/* Session Types */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Session Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SessionTypeCard
            icon={<Zap className="w-6 h-6 text-red-500" />}
            title="Crisis Support"
            description="Immediate help during mental health crises"
            duration="Available 24/7"
            onStart={() => startAISession(AI_THERAPISTS[0], 'crisis')}
          />
          <SessionTypeCard
            icon={<Calendar className="w-6 h-6 text-blue-500" />}
            title="Scheduled Therapy"
            description="Regular therapy sessions at your convenience"
            duration="30-60 minutes"
            onStart={() => setShowScheduler(true)}
          />
          <SessionTypeCard
            icon={<Heart className="w-6 h-6 text-pink-500" />}
            title="Quick Check-in"
            description="Brief mood check and coping support"
            duration="5-15 minutes"
            onStart={() => startAISession(recommendedTherapist!, 'check-in')}
          />
          <SessionTypeCard
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            title="Intensive Session"
            description="Deep-dive therapy for complex issues"
            duration="60-90 minutes"
            onStart={() => startAISession(recommendedTherapist!, 'intensive')}
          />
        </div>
      </div>

      {/* Recent Sessions */}
      {sessionHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessionHistory.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {AI_THERAPISTS.find(t => t.id === session.therapistId)?.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {AI_THERAPISTS.find(t => t.id === session.therapistId)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.topics.join(', ')} • {session.sessionType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(session.startTime).toLocaleDateString()}
                  </p>
                  {session.mood.after && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span>Mood: {session.mood.before} → {session.mood.after}</span>
                      {session.mood.after > session.mood.before && (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Privacy & Confidentiality</h4>
            <p className="text-sm text-blue-800 mt-1">
              All AI therapy sessions are encrypted end-to-end. Your conversations are private and secure, 
              with no human access to session content. Our AI therapists follow strict confidentiality protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Therapist Detail Modal */}
      <AnimatePresence>
        {selectedTherapist && (
          <TherapistDetailModal
            therapist={selectedTherapist}
            onClose={() => setSelectedTherapist(null)}
            onStartSession={(type) => startAISession(selectedTherapist, type)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Therapist Card Component
function TherapistCard({ 
  therapist, 
  onSelect, 
  onStartSession, 
  isRecommended 
}: {
  therapist: AITherapist
  onSelect: () => void
  onStartSession: (type: string) => void
  isRecommended: boolean
}) {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer",
      isRecommended && "ring-2 ring-purple-500 ring-opacity-50"
    )}>
      {isRecommended && (
        <div className="flex items-center space-x-1 mb-3">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-purple-600 font-medium">Recommended</span>
        </div>
      )}
      
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{therapist.avatar}</div>
        <h3 className="text-xl font-semibold text-gray-900">{therapist.name}</h3>
        <p className="text-sm text-gray-600">{therapist.personality}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {therapist.specialty.slice(0, 2).map((spec, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Availability:</span>
          <span className="font-medium text-green-600">{therapist.availability}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Rating:</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-medium">{therapist.userRating}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onStartSession('check-in')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Quick Check-in
        </button>
        <button
          onClick={onSelect}
          className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Learn More
        </button>
      </div>
    </div>
  )
}

// Session Type Card Component
function SessionTypeCard({
  icon,
  title,
  description,
  duration,
  onStart
}: {
  icon: React.ReactNode
  title: string
  description: string
  duration: string
  onStart: () => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-3">
        {icon}
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-700">{duration}</span>
        <button
          onClick={onStart}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Start
        </button>
      </div>
    </div>
  )
}

// Resource Detail Modal Component
function ResourceDetailModal({
  resource,
  onClose,
  currentMood
}: {
  resource: string
  onClose: () => void
  currentMood: number
}) {
  const getResourceContent = () => {
    switch(resource) {
      case 'meditation':
        return {
          title: 'Guided Meditation',
          icon: <Headphones className="w-8 h-8 text-purple-600" />,
          exercises: [
            { name: 'Body Scan', duration: '10 min', description: 'Progressive relaxation through body awareness' },
            { name: 'Loving Kindness', duration: '15 min', description: 'Cultivate compassion for self and others' },
            { name: 'Mindful Breathing', duration: '5 min', description: 'Focus on breath to anchor presence' },
            { name: 'Visualization', duration: '20 min', description: 'Peaceful imagery for deep relaxation' },
            { name: 'Walking Meditation', duration: '10 min', description: 'Mindful movement and awareness' }
          ]
        }
      case 'breathing':
        return {
          title: 'Breathing Exercises',
          icon: <Wind className="w-8 h-8 text-blue-600" />,
          exercises: [
            { name: '4-7-8 Breathing', duration: '5 min', description: 'Reduces anxiety, helps with sleep' },
            { name: 'Box Breathing', duration: '4 min', description: 'Navy SEAL technique for calm focus' },
            { name: 'Coherent Breathing', duration: '10 min', description: 'Balance nervous system' },
            { name: 'Belly Breathing', duration: '5 min', description: 'Activate relaxation response' },
            { name: 'Alternate Nostril', duration: '7 min', description: 'Balance left and right brain' }
          ]
        }
      case 'cbt':
        return {
          title: 'CBT Worksheets & Tools',
          icon: <FileText className="w-8 h-8 text-green-600" />,
          exercises: [
            { name: 'Thought Record', duration: '15 min', description: 'Challenge negative thought patterns' },
            { name: 'Cognitive Restructuring', duration: '20 min', description: 'Reframe distorted thinking' },
            { name: 'Behavioral Activation', duration: '10 min', description: 'Plan mood-boosting activities' },
            { name: 'Problem Solving', duration: '25 min', description: 'Structured approach to challenges' },
            { name: 'Values Clarification', duration: '30 min', description: 'Identify what matters most' }
          ]
        }
      case 'crisis':
        return {
          title: 'Crisis Coping Techniques',
          icon: <Shield className="w-8 h-8 text-red-600" />,
          exercises: [
            { name: 'TIPP Technique', duration: 'Immediate', description: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation' },
            { name: 'STOP Method', duration: 'Immediate', description: 'Stop, Take a breath, Observe, Proceed mindfully' },
            { name: 'Crisis Survival Skills', duration: '5 min', description: 'Distraction and self-soothing strategies' },
            { name: 'Safety Planning', duration: '20 min', description: 'Create personalized crisis response plan' },
            { name: 'Radical Acceptance', duration: '10 min', description: 'Accept reality to reduce suffering' }
          ]
        }
      case 'journaling':
        return {
          title: 'Journaling Prompts',
          icon: <PenTool className="w-8 h-8 text-yellow-600" />,
          exercises: [
            { name: 'Gratitude Journal', duration: '10 min', description: 'List 3 things you\'re grateful for today' },
            { name: 'Emotion Exploration', duration: '15 min', description: 'What am I feeling and why?' },
            { name: 'Future Self Letter', duration: '20 min', description: 'Write to yourself one year from now' },
            { name: 'Stream of Consciousness', duration: '10 min', description: 'Write without stopping or editing' },
            { name: 'Daily Reflection', duration: '15 min', description: 'Review your day with compassion' }
          ]
        }
      case 'grounding':
        return {
          title: 'Grounding Exercises',
          icon: <Eye className="w-8 h-8 text-indigo-600" />,
          exercises: [
            { name: '5-4-3-2-1 Technique', duration: '5 min', description: '5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste' },
            { name: 'Mental Categories', duration: '3 min', description: 'Name items in a category (colors, animals, etc.)' },
            { name: 'Body Awareness', duration: '5 min', description: 'Notice physical sensations without judgment' },
            { name: 'Safe Place Visualization', duration: '10 min', description: 'Imagine a place where you feel completely safe' },
            { name: 'Object Focus', duration: '3 min', description: 'Describe an object in detail using all senses' }
          ]
        }
      case 'pmr':
        return {
          title: 'Progressive Muscle Relaxation',
          icon: <Activity className="w-8 h-8 text-pink-600" />,
          exercises: [
            { name: 'Full Body PMR', duration: '20 min', description: 'Systematic tension and release of all muscle groups' },
            { name: 'Quick PMR', duration: '5 min', description: 'Rapid relaxation for busy moments' },
            { name: 'Seated PMR', duration: '10 min', description: 'Office-friendly relaxation technique' },
            { name: 'Bedtime PMR', duration: '15 min', description: 'Prepare body and mind for sleep' },
            { name: 'Targeted PMR', duration: '7 min', description: 'Focus on areas of chronic tension' }
          ]
        }
      case 'mindfulness':
        return {
          title: 'Mindfulness Activities',
          icon: <Brain className="w-8 h-8 text-teal-600" />,
          exercises: [
            { name: 'Mindful Eating', duration: '10 min', description: 'Fully experience your food with all senses' },
            { name: 'Thought Clouds', duration: '5 min', description: 'Observe thoughts without attachment' },
            { name: 'Mindful Movement', duration: '15 min', description: 'Gentle stretches with awareness' },
            { name: 'Sound Meditation', duration: '10 min', description: 'Focus on ambient sounds around you' },
            { name: 'Loving Presence', duration: '10 min', description: 'Cultivate non-judgmental awareness' }
          ]
        }
      default:
        return null
    }
  }

  const content = getResourceContent()
  if (!content) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {content.icon}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentMood <= 3 ? 'Recommended for your current mood' : 'Select an exercise to begin'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Exercises List */}
          <div className="space-y-3">
            {content.exercises.map((exercise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  toast.info(`Starting: ${exercise.name}`, {
                    description: 'This feature will be fully implemented soon!'
                  })
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exercise.duration}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Tips for Success
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Find a quiet, comfortable space</li>
              <li>• Practice regularly for best results</li>
              <li>• Be patient and compassionate with yourself</li>
              {currentMood <= 3 && <li className="font-medium">• If you need immediate help, use our crisis resources</li>}
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Therapist Detail Modal Component
function TherapistDetailModal({
  therapist,
  onClose,
  onStartSession
}: {
  therapist: AITherapist
  onClose: () => void
  onStartSession: (type: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{therapist.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{therapist.name}</h2>
                <p className="text-gray-600">{therapist.personality}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{therapist.userRating} • {therapist.availability}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600">{therapist.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Therapeutic Approaches</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.approaches.map((approach, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {approach}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Best For</h3>
              <div className="grid grid-cols-2 gap-2">
                {therapist.bestFor.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {therapist.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Start a Session</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onStartSession('check-in')}
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Quick Check-in</span>
                </button>
                <button
                  onClick={() => onStartSession('scheduled')}
                  className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}