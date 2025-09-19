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
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

const AI_THERAPISTS: AITherapist[] = [
  {
    id: 'aria',
    name: 'Dr. Aria',
    specialty: ['Cognitive Behavioral Therapy', 'Anxiety Disorders', 'Depression', 'Crisis Intervention'],
    personality: 'Compassionate, direct, solution-focused',
    avatar: '🧠',
    description: 'Dr. Aria specializes in evidence-based CBT techniques and crisis intervention. She provides practical, actionable strategies for managing anxiety, depression, and acute mental health crises.',
    approaches: ['CBT', 'Dialectical Behavior Therapy', 'Crisis Intervention', 'Mindfulness-Based Therapy'],
    bestFor: ['Anxiety', 'Depression', 'Panic Attacks', 'Crisis Situations', 'Cognitive Restructuring'],
    sessionsCompleted: 0,
    userRating: 4.9,
    availability: '24/7',
    features: ['Crisis Detection', 'Real-time Intervention', 'Safety Planning', 'Coping Strategy Development']
  },
  {
    id: 'sage',
    name: 'Dr. Sage',
    specialty: ['Trauma Therapy', 'PTSD', 'Mindfulness', 'Emotional Regulation'],
    personality: 'Gentle, patient, trauma-informed',
    avatar: '🌿',
    description: 'Dr. Sage offers trauma-informed care with a focus on mindfulness and emotional regulation. She creates a safe space for processing difficult experiences and building resilience.',
    approaches: ['EMDR', 'Trauma-Focused CBT', 'Mindfulness-Based Stress Reduction', 'Somatic Experiencing'],
    bestFor: ['PTSD', 'Trauma Recovery', 'Emotional Dysregulation', 'Stress Management', 'Mindfulness Training'],
    sessionsCompleted: 0,
    userRating: 4.8,
    availability: 'scheduled',
    features: ['Trauma-Informed Approach', 'Grounding Techniques', 'Mindfulness Exercises', 'Emotional Regulation']
  },
  {
    id: 'luna',
    name: 'Dr. Luna',
    specialty: ['Sleep Disorders', 'Mood Regulation', 'Circadian Rhythm', 'Wellness Coaching'],
    personality: 'Calming, nurturing, holistic',
    avatar: '🌙',
    description: 'Dr. Luna focuses on sleep health, mood regulation, and overall wellness. She helps establish healthy routines and addresses the connection between sleep and mental health.',
    approaches: ['Sleep Hygiene Therapy', 'Chronotherapy', 'Behavioral Sleep Medicine', 'Wellness Coaching'],
    bestFor: ['Insomnia', 'Sleep Disorders', 'Mood Instability', 'Wellness Optimization', 'Routine Building'],
    sessionsCompleted: 0,
    userRating: 4.7,
    availability: 'on-demand',
    features: ['Sleep Assessment', 'Circadian Optimization', 'Mood Tracking', 'Wellness Planning']
  }
]

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

  useEffect(() => {
    loadSessionHistory()
    loadUserPreferences()
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

      {/* Mood Check-in */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Mood Check-in</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">How are you feeling today?</span>
          <div className="flex-1 mx-4">
            <input
              type="range"
              min="1"
              max="10"
              value={currentMood}
              onChange={(e) => setCurrentMood(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <span className="text-lg font-bold text-gray-800 min-w-[3rem]">{currentMood}/10</span>
        </div>
      </div>

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