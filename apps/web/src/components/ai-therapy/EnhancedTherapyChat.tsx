'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Mic,
  MicOff,
  Heart,
  Brain,
  Shield,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Save,
  Lock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Settings,
  BookOpen,
  Target,
  Zap,
  Lightbulb,
  BarChart3,
  MessageSquare,
  User,
  Bot,
  VolumeX,
  Volume2,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Maximize2,
  Minimize2,
  FileText,
  Award,
  Eye,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAccessibility } from '@/components/accessibility/AccessibilityEnhancer'
import { useSmartScroll } from '@/hooks/useSmartScroll'
import NewMessagesIndicator from '@/components/chat/NewMessagesIndicator'

// Enhanced interfaces with comprehensive features
interface EnhancedTherapyMessage {
  id: string
  sender: 'user' | 'therapist' | 'system'
  content: string
  timestamp: Date
  type: 'text' | 'audio' | 'assessment' | 'intervention' | 'exercise' | 'insight' | 'technique'
  metadata?: {
    mood?: number
    technique?: string
    crisis_level?: number
    intervention_triggered?: boolean
    exercise_id?: string
    insight_type?: string
    techniques_suggested?: string[]
    risk_score?: number
    sentiment?: number
    emotions?: string[]
    confidence?: number
    personalization_applied?: boolean
  }
  audio?: {
    url?: string
    duration?: number
    transcript?: string
  }
  reactions?: {
    helpful?: boolean
    rating?: number
    feedback?: string
  }
  exercise?: {
    id: string
    name: string
    type: string
    progress?: number
    completed?: boolean
  }
}

interface EnhancedTherapySession {
  id: string
  therapistId: string
  userId: string
  startTime: Date
  endTime?: Date
  messages: EnhancedTherapyMessage[]
  assessments: {
    initial: { mood: number; anxiety: number; energy: number }
    current: { mood: number; anxiety: number; energy: number }
    final?: { mood: number; anxiety: number; energy: number }
  }
  interventions: string[]
  insights: any[]
  exercises: any[]
  techniques: string[]
  homework: any[]
  nextSteps: string[]
  sessionNotes: string
  goals: string[]
  breakthroughs: string[]
  riskLevel: string
  encrypted: boolean
  preferences: any
  analytics: {
    engagement: number
    effectiveness: number
    satisfaction: number
    progressMade: number
    timeActive: number
    wordsTyped: number
    techniquesUsed: string[]
    moodChanges: number[]
  }
  crisisProtocols?: {
    activated: boolean
    level: string
    actions: string[]
    timestamp?: Date
  }
}

interface EnhancedTherapyChatProps {
  therapistId: 'aria' | 'sage' | 'luna' | 'phoenix' | 'river' | 'kai' | 'harmony'
  userId: string
  sessionType: 'crisis' | 'scheduled' | 'check-in' | 'intensive'
  onSessionEnd: (session: EnhancedTherapySession) => void
  initialMood?: number
  sessionGoals?: string[]
  preferences?: any
}

import { ENHANCED_THERAPIST_PROFILES_FOR_CHAT } from '@/components/ai-therapy/EnhancedTherapistProfiles'

const ENHANCED_THERAPIST_PROFILES = ENHANCED_THERAPIST_PROFILES_FOR_CHAT

export default function EnhancedTherapyChat({ 
  therapistId, 
  userId, 
  sessionType, 
  onSessionEnd,
  initialMood = 5,
  sessionGoals = [],
  preferences = {}
}: EnhancedTherapyChatProps) {
  // Core session state
  const [session, setSession] = useState<EnhancedTherapySession>({
    id: crypto.randomUUID(),
    therapistId,
    userId,
    startTime: new Date(),
    messages: [],
    assessments: {
      initial: { mood: initialMood, anxiety: 5, energy: 5 },
      current: { mood: initialMood, anxiety: 5, energy: 5 }
    },
    interventions: [],
    insights: [],
    exercises: [],
    techniques: [],
    homework: [],
    nextSteps: [],
    sessionNotes: '',
    goals: sessionGoals,
    breakthroughs: [],
    riskLevel: 'low',
    encrypted: true,
    preferences,
    analytics: {
      engagement: 0,
      effectiveness: 0,
      satisfaction: 0,
      progressMade: 0,
      timeActive: 0,
      wordsTyped: 0,
      techniquesUsed: [],
      moodChanges: [initialMood]
    }
  })

  // UI state
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [showAssessment, setShowAssessment] = useState(sessionType === 'intensive')
  
  // Enhanced feature state
  const [showInsights, setShowInsights] = useState(false)
  const [showExercises, setShowExercises] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [currentTechnique, setCurrentTechnique] = useState<string | null>(null)
  const [sessionRating, setSessionRating] = useState<number | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const [showSafetyPlan, setShowSafetyPlan] = useState(false)
  const [messageReactions, setMessageReactions] = useState<Record<string, any>>({})
  const [exerciseInProgress, setExerciseInProgress] = useState<any>(null)
  const [personalization, setPersonalization] = useState<any>(null)
  const [realtimeInsights, setRealtimeInsights] = useState<any[]>([])

  // Refs and hooks
  const { settings, announceToScreenReader } = useAccessibility()
  const therapist = ENHANCED_THERAPIST_PROFILES[therapistId]
  const sessionTimer = useRef<number>(0)

  // Smart scrolling with enhanced features
  const {
    scrollRef,
    isAtBottom,
    hasNewMessages,
    userHasScrolled,
    scrollToBottom,
    forceScrollToBottom,
    scrollToTop,
    markMessagesRead
  } = useSmartScroll(session.messages, {
    forceScrollOnCrisis: true,
    respectReducedMotion: settings.reducedMotion,
    threshold: 100
  })

  // Check for crisis messages in new messages
  const hasCrisisMessages = hasNewMessages && session.messages
    .slice(-5)
    .some(msg => msg.type === 'intervention' || (msg.metadata?.crisis_level && msg.metadata.crisis_level >= 8))

  // Initialize session
  useEffect(() => {
    initializeSession()
    loadPersonalization()
    setupSessionTracking()
  }, [])

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      sessionTimer.current += 1
      updateSessionAnalytics('timeActive', sessionTimer.current)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const initializeSession = async () => {
    try {
      // Create session via API
      const response = await fetch('/api/ai-therapy/sessions/enhanced-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sessionData: {
            therapistId,
            sessionType,
            currentMood: initialMood,
            goals: sessionGoals,
            preferences,
            duration: sessionType === 'intensive' ? 60 : sessionType === 'check-in' ? 15 : 45
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(prev => ({ ...prev, id: data.session.id }))
        
        // Add therapist greeting
        addTherapistMessage(therapist.greeting, 'text', {
          personalization_applied: true,
          confidence: 1.0
        })
      }
    } catch (error) {
      console.error('Failed to initialize session:', error)
      toast.error('Failed to start session. Please try again.')
    }
  }

  const loadPersonalization = async () => {
    try {
      const response = await fetch(`/api/ai-therapy/personalization?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPersonalization(data.profile)
      }
    } catch (error) {
      console.error('Failed to load personalization:', error)
    }
  }

  const setupSessionTracking = () => {
    // Track user activity
    const trackActivity = () => {
      updateSessionAnalytics('engagement', session.analytics.engagement + 0.1)
    }

    document.addEventListener('click', trackActivity)
    document.addEventListener('keypress', trackActivity)

    return () => {
      document.removeEventListener('click', trackActivity)
      document.removeEventListener('keypress', trackActivity)
    }
  }

  const addTherapistMessage = useCallback((
    content: string, 
    type: EnhancedTherapyMessage['type'] = 'text', 
    metadata?: any,
    exercise?: any
  ) => {
    const message: EnhancedTherapyMessage = {
      id: crypto.randomUUID(),
      sender: 'therapist',
      content,
      timestamp: new Date(),
      type,
      metadata,
      exercise
    }

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    // Announce important messages to screen readers
    if (type === 'intervention' || metadata?.crisis_level >= 8) {
      announceToScreenReader(`Crisis intervention message: ${content}`)
    }

    return message.id
  }, [announceToScreenReader])

  const addUserMessage = useCallback((content: string, type: EnhancedTherapyMessage['type'] = 'text') => {
    const message: EnhancedTherapyMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content,
      timestamp: new Date(),
      type
    }

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      analytics: {
        ...prev.analytics,
        wordsTyped: prev.analytics.wordsTyped + content.split(' ').length
      }
    }))

    // Process message with enhanced AI
    setTimeout(() => {
      generateEnhancedAIResponse(content, message)
    }, 800)

    return message.id
  }, [])

  const generateEnhancedAIResponse = async (userInput: string, userMessage: EnhancedTherapyMessage) => {
    setIsTyping(true)

    try {
      // Use our advanced chat API
      const response = await fetch('/api/ai-therapy/chat/advanced-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: userInput,
          therapistId,
          messageType: userMessage.type,
          metadata: {
            sessionType,
            currentMood: session.assessments.current.mood,
            topics: session.goals,
            analytics: session.analytics,
            personalization
          }
        })
      })

      if (response.ok) {
        const data = await response.json()

        if (data.crisis) {
          await handleCrisisResponse(data)
        } else {
          await handleNormalResponse(data)
        }

        // Update session with insights and techniques
        if (data.insights?.length > 0) {
          setRealtimeInsights(prev => [...prev, ...data.insights])
        }

        if (data.techniques?.length > 0) {
          updateSessionAnalytics('techniquesUsed', data.techniques)
        }

        // Update analytics
        setSession(prev => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            effectiveness: data.sessionMetrics?.engagement || prev.analytics.effectiveness
          }
        }))

      } else {
        throw new Error('Failed to generate response')
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      addTherapistMessage(
        "I'm having trouble processing that right now. Could you try rephrasing that for me? I'm here to help.",
        'text',
        { confidence: 0.5 }
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleCrisisResponse = async (data: any) => {
    // Update session with crisis information
    setSession(prev => ({
      ...prev,
      crisisProtocols: {
        activated: true,
        level: data.urgencyLevel,
        actions: data.interventions || [],
        timestamp: new Date()
      },
      riskLevel: data.urgencyLevel,
      interventions: [...prev.interventions, ...data.interventions || []]
    }))

    // Add crisis intervention message
    addTherapistMessage(
      data.response,
      'intervention',
      {
        crisis_level: 10,
        intervention_triggered: true,
        confidence: 0.95
      }
    )

    // Show safety plan if available
    if (data.emergencyContacts) {
      setShowSafetyPlan(true)
    }

    // Force scroll to crisis message
    setTimeout(() => {
      forceScrollToBottom()
    }, 100)

    toast.error('Crisis support activated', {
      description: 'Immediate help resources are available',
      action: {
        label: 'View Resources',
        onClick: () => setShowSafetyPlan(true)
      }
    })
  }

  const handleNormalResponse = async (data: any) => {
    // Add AI response
    const messageId = addTherapistMessage(
      data.response,
      data.type || 'text',
      {
        techniques_suggested: data.techniques,
        sentiment: data.sentiment || 0,
        emotions: data.emotions || [],
        confidence: 0.8,
        personalization_applied: true
      }
    )

    // Handle exercises if suggested
    if (data.exercises?.length > 0) {
      setTimeout(() => {
        suggestExercise(data.exercises[0])
      }, 2000)
    }

    // Handle follow-up questions
    if (data.followUp?.length > 0) {
      setTimeout(() => {
        addTherapistMessage(
          data.followUp[0],
          'text',
          { technique: 'open_ended_questioning' }
        )
      }, 4000)
    }
  }

  const suggestExercise = async (exercise: any) => {
    const exerciseMessage = `Would you like to try an exercise that might help? I recommend "${exercise.name}" - it's a ${exercise.duration}-minute ${exercise.type} exercise that can help with what you're experiencing.`
    
    addTherapistMessage(
      exerciseMessage,
      'exercise',
      {
        exercise_id: exercise.type,
        technique: exercise.name
      },
      exercise
    )
  }

  const startExercise = async (exerciseId: string) => {
    try {
      const response = await fetch('/api/ai-therapy/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          exerciseId,
          sessionData: {
            sessionId: session.id,
            currentMood: session.assessments.current.mood,
            context: 'therapy_session'
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setExerciseInProgress(data.exercise)
        setCurrentTechnique(exerciseId)
        
        addTherapistMessage(
          `Great! Let's start the ${data.exercise.name}. ${data.guidance[0]}`,
          'exercise',
          { exercise_id: exerciseId }
        )

        toast.success('Exercise started', {
          description: `Beginning ${data.exercise.name}`
        })
      }
    } catch (error) {
      console.error('Failed to start exercise:', error)
      toast.error('Failed to start exercise')
    }
  }

  const completeExercise = async (exerciseId: string, results: any) => {
    try {
      const response = await fetch('/api/ai-therapy/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          exerciseId,
          results: {
            ...results,
            sessionId: session.id,
            duration: results.duration || 10,
            moodBefore: session.assessments.current.mood,
            moodAfter: results.moodAfter || session.assessments.current.mood + 1
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session with exercise results
        setSession(prev => ({
          ...prev,
          exercises: [...prev.exercises, data.completion],
          insights: [...prev.insights, ...data.insights],
          assessments: {
            ...prev.assessments,
            current: {
              ...prev.assessments.current,
              mood: results.moodAfter || prev.assessments.current.mood
            }
          }
        }))

        setExerciseInProgress(null)
        setCurrentTechnique(null)

        addTherapistMessage(
          `Excellent work completing that exercise! ${data.analysis.insights[0] || 'You should feel proud of practicing this skill.'}`,
          'text',
          { technique: 'positive_reinforcement' }
        )

        if (data.recommendations.nextSteps.length > 0) {
          setTimeout(() => {
            addTherapistMessage(
              data.recommendations.nextSteps[0],
              'text',
              { technique: 'homework_assignment' }
            )
          }, 2000)
        }

        toast.success('Exercise completed!', {
          description: 'Your progress has been recorded'
        })
      }
    } catch (error) {
      console.error('Failed to complete exercise:', error)
    }
  }

  const updateSessionAnalytics = (metric: string, value: any) => {
    setSession(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [metric]: Array.isArray((prev.analytics as any)[metric]) 
          ? [...(prev.analytics as any)[metric], value]
          : typeof value === 'number' 
            ? Math.min(value, 1)
            : value
      }
    }))
  }

  const sendMessage = () => {
    if (currentMessage.trim() && !sessionPaused) {
      addUserMessage(currentMessage.trim())
      setCurrentMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const endSession = async () => {
    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000)

    const finalSession = {
      ...session,
      endTime,
      analytics: {
        ...session.analytics,
        timeActive: sessionTimer.current
      }
    }

    try {
      // Complete session via API
      await fetch('/api/ai-therapy/sessions/enhanced-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          sessionData: {
            sessionId: session.id,
            duration,
            moodAfter: session.assessments.current.mood,
            anxietyAfter: session.assessments.current.anxiety,
            energyAfter: session.assessments.current.energy,
            rating: sessionRating,
            feedback: '',
            techniques: session.analytics.techniquesUsed,
            breakthroughs: session.breakthroughs,
            homework: session.homework
          }
        })
      })

      onSessionEnd(finalSession)
    } catch (error) {
      console.error('Failed to end session:', error)
      onSessionEnd(finalSession)
    }
  }

  const rateMessage = (messageId: string, helpful: boolean, rating?: number) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: { helpful, rating, timestamp: new Date() }
    }))

    toast.success('Thank you for the feedback!', {
      description: 'This helps improve the therapy experience'
    })
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    toast.info(voiceEnabled ? 'Voice disabled' : 'Voice enabled')
  }

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen)
    if (!fullScreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const downloadSession = async () => {
    try {
      const response = await fetch(`/api/ai-therapy/sessions/enhanced-route?action=export&format=json&sessionId=${session.id}`)
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `therapy-session-${session.id}.json`
        a.click()
        URL.revokeObjectURL(url)

        toast.success('Session exported successfully')
      }
    } catch (error) {
      console.error('Failed to export session:', error)
      toast.error('Failed to export session')
    }
  }

  return (
    <div className={cn(
      "flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900",
      fullScreen ? "fixed inset-0 z-50" : "h-screen max-h-screen"
    )}>
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="text-4xl animate-pulse">{therapist.avatar}</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {therapist.name}
              {session.crisisProtocols?.activated && (
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              )}
            </h2>
            <p className="text-sm text-gray-600">
              {sessionType} session • {therapist.style}
              {currentTechnique && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {currentTechnique}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Session Timer */}
          <div className="flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(sessionTimer.current / 60)}:{(sessionTimer.current % 60).toString().padStart(2, '0')}</span>
          </div>

          {/* Risk Level Indicator */}
          <div className={cn(
            "flex items-center space-x-1 text-sm px-3 py-1 rounded-full",
            session.riskLevel === 'critical' ? "bg-red-100 text-red-700" :
            session.riskLevel === 'high' ? "bg-orange-100 text-orange-700" :
            session.riskLevel === 'moderate' ? "bg-yellow-100 text-yellow-700" :
            "bg-green-100 text-green-700"
          )}>
            <Shield className="w-4 h-4" />
            <span>{session.riskLevel}</span>
          </div>

          {/* Feature Toggles */}
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showInsights ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
            )}
            title="Toggle Insights"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowExercises(!showExercises)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showExercises ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            )}
            title="Toggle Exercises"
          >
            <Target className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showAnalytics ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"
            )}
            title="Toggle Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleVoice}
            className={cn(
              "p-2 rounded-lg transition-colors",
              voiceEnabled ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            )}
            title="Toggle Voice"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={downloadSession}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export Session"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setSessionPaused(!sessionPaused)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sessionPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={endSession}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            data-chat-container
            role="log"
            aria-live="polite"
            aria-label="Therapy chat conversation"
          >
            <AnimatePresence>
              {session.messages.map((message) => (
                <motion.div
                  key={message.id}
                  id={`message-${message.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: settings.reducedMotion ? 0.1 : 0.3
                  }}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm relative group",
                    message.sender === 'user' 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : message.type === 'intervention'
                      ? "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 text-red-800"
                      : message.type === 'exercise'
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800"
                      : "bg-white border border-gray-200 text-gray-900 shadow-md",
                    settings.highContrast && message.type === 'intervention' && "border-4 border-red-600"
                  )}>
                    {/* Message Header */}
                    {message.sender === 'therapist' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl" aria-hidden="true">{therapist.avatar}</span>
                        <span className="text-sm font-medium">{therapist.name}</span>
                        {message.type === 'intervention' && (
                          <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
                        )}
                        {message.type === 'exercise' && (
                          <Target className="w-4 h-4 text-green-600" />
                        )}
                        {message.metadata?.confidence && (
                          <div className="text-xs opacity-70">
                            {Math.round(message.metadata.confidence * 100)}% confident
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Crisis Alert Header */}
                    {message.type === 'intervention' && (
                      <div 
                        className="flex items-center space-x-2 mb-3 p-2 bg-red-100 rounded-lg"
                        role="alert"
                        aria-label="Crisis intervention message"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-bold text-red-800">Crisis Support Activated</span>
                      </div>
                    )}

                    {/* Exercise Header */}
                    {message.type === 'exercise' && message.exercise && (
                      <div className="flex items-center space-x-2 mb-3 p-2 bg-green-100 rounded-lg">
                        <Target className="w-5 h-5 text-green-600" />
                        <div>
                          <span className="text-sm font-bold text-green-800">Exercise Suggestion</span>
                          <div className="text-xs text-green-600">{message.exercise.name}</div>
                        </div>
                        <button
                          onClick={() => startExercise(message.exercise!.id)}
                          className="ml-auto px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                    {/* Techniques Used */}
                    {message.metadata?.techniques_suggested && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.metadata.techniques_suggested.map((technique, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {technique}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message Reactions */}
                    {message.sender === 'therapist' && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => rateMessage(message.id, true)}
                            className={cn(
                              "p-1 rounded text-xs transition-colors",
                              messageReactions[message.id]?.helpful === true
                                ? "bg-green-100 text-green-700"
                                : "hover:bg-gray-100 text-gray-500"
                            )}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rateMessage(message.id, false)}
                            className={cn(
                              "p-1 rounded text-xs transition-colors",
                              messageReactions[message.id]?.helpful === false
                                ? "bg-red-100 text-red-700"
                                : "hover:bg-gray-100 text-gray-500"
                            )}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="text-xs opacity-70">
                          <time dateTime={message.timestamp.toISOString()}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </time>
                        </div>
                      </div>
                    )}

                    {/* Timestamp for user messages */}
                    {message.sender === 'user' && (
                      <div className="text-xs opacity-70 mt-2 text-right">
                        <time dateTime={message.timestamp.toISOString()}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: settings.reducedMotion ? 0.1 : 0.3
                }}
                className="flex justify-start"
                aria-live="polite"
                aria-label={`${therapist.name} is typing`}
              >
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-xs shadow-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl" aria-hidden="true">{therapist.avatar}</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="sr-only">{therapist.name} is typing</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* New Messages Indicator */}
          <NewMessagesIndicator
            show={hasNewMessages}
            messageCount={session.messages.length}
            onClick={() => {
              forceScrollToBottom()
              markMessagesRead()
            }}
            hasCrisisMessage={hasCrisisMessages}
          />

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
            {/* Exercise in Progress Indicator */}
            {exerciseInProgress && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Exercise in progress: {exerciseInProgress.name}
                  </span>
                </div>
                <button
                  onClick={() => completeExercise(exerciseInProgress.id, { moodAfter: session.assessments.current.mood + 1 })}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors"
                >
                  Complete
                </button>
              </div>
            )}

            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={sessionPaused ? "Session is paused..." : "Share what's on your mind..."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm bg-white/90 backdrop-blur-sm"
                  rows={3}
                  disabled={sessionPaused}
                />
              </div>
              
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "p-3 rounded-xl transition-colors shadow-sm",
                  isRecording ? "bg-red-600 text-white animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                disabled={sessionPaused}
                title="Voice input"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || sessionPaused}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>End-to-end encrypted</span>
                </div>
                {sessionPaused && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Pause className="w-3 h-3" />
                    <span>Session paused</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-green-600">
                  <Activity className="w-3 h-3" />
                  <span>{session.analytics.wordsTyped} words</span>
                </div>
              </div>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {(showInsights || showExercises || showAnalytics) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-gray-200 bg-white/80 backdrop-blur-sm overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                {/* Insights Panel */}
                {showInsights && (
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      Live Insights
                    </h3>
                    <div className="space-y-2">
                      {realtimeInsights.map((insight, idx) => (
                        <div key={idx} className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-sm font-medium text-purple-800">{insight}</div>
                        </div>
                      ))}
                      {realtimeInsights.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                          Insights will appear as the session progresses...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Exercises Panel */}
                {showExercises && (
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Exercises
                    </h3>
                    <div className="space-y-2">
                      {session.exercises.map((exercise, idx) => (
                        <div key={idx} className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-800">{exercise.name}</div>
                          <div className="text-xs text-blue-600">Completed • Score: {Math.round(exercise.score * 100)}%</div>
                        </div>
                      ))}
                      {session.exercises.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                          No exercises completed yet...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Analytics Panel */}
                {showAnalytics && (
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      Session Analytics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement</span>
                        <span className="text-sm font-medium">{Math.round(session.analytics.engagement * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Time Active</span>
                        <span className="text-sm font-medium">{Math.floor(session.analytics.timeActive / 60)}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Words Typed</span>
                        <span className="text-sm font-medium">{session.analytics.wordsTyped}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Techniques Used</span>
                        <span className="text-sm font-medium">{session.analytics.techniquesUsed.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Risk Level</span>
                        <span className={cn(
                          "text-sm font-medium",
                          session.riskLevel === 'critical' ? "text-red-600" :
                          session.riskLevel === 'high' ? "text-orange-600" :
                          session.riskLevel === 'moderate' ? "text-yellow-600" :
                          "text-green-600"
                        )}>
                          {session.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Crisis Safety Plan Modal */}
      <AnimatePresence>
        {showSafetyPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSafetyPlan(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6 text-red-600">
                <Shield className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Crisis Support Resources</h2>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-bold text-red-800 mb-2">Immediate Help</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700">988 Suicide & Crisis Lifeline</span>
                      <a href="tel:988" className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                        Call 988
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-700">Crisis Text Line</span>
                      <a href="sms:741741" className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                        Text HOME to 741741
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Safety Plan</h3>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Remove any means of self-harm from your immediate area</li>
                    <li>• Call a trusted friend or family member</li>
                    <li>• Go to a safe, public place</li>
                    <li>• Use grounding techniques (5-4-3-2-1 method)</li>
                    <li>• Remember: This feeling is temporary</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setShowSafetyPlan(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowSafetyPlan(false)
                      // Trigger a grounding exercise
                      startExercise('mindfulness-54321-grounding')
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Grounding Exercise
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Rating Modal */}
      <AnimatePresence>
        {sessionRating === null && session.messages.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-200 max-w-sm z-40"
          >
            <h3 className="font-semibold text-gray-900 mb-2">How is this session going?</h3>
            <div className="flex space-x-2 mb-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSessionRating(rating)}
                  className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <Star className={cn(
                    "w-6 h-6",
                    rating <= (sessionRating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
                  )} />
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setSessionRating(0)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Not now
              </button>
              <button
                onClick={() => setSessionRating(4)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Good session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}