'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Star,
  Heart,
  Leaf,
  Sun,
  Moon,
  Wind,
  Mountain,
  Waves,
  CheckCircle,
  Timer,
  Award,
  BarChart3,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MeditationSession {
  id: string
  name: string
  description: string
  category: 'beginner' | 'intermediate' | 'advanced' | 'sleep' | 'anxiety' | 'focus' | 'compassion'
  duration: number // in minutes
  type: 'guided' | 'ambient' | 'breathing' | 'body-scan' | 'loving-kindness' | 'walking'
  narrator?: 'male' | 'female' | 'neutral'
  backgroundSound?: 'nature' | 'rain' | 'ocean' | 'silence' | 'bells' | 'forest'
  benefits: string[]
  instructions: string[]
  script?: Array<{
    time: number // seconds from start
    instruction: string
    tone?: 'gentle' | 'encouraging' | 'neutral'
  }>
  difficulty: 1 | 2 | 3 | 4 | 5
  popularity: number
  evidenceLevel: 'high' | 'moderate' | 'emerging'
}

interface UserProgress {
  totalSessions: number
  totalMinutes: number
  streak: number
  longestStreak: number
  completedSessions: string[]
  favoriteTypes: string[]
  averageRating: number
  lastSessionDate?: Date
}

interface SessionRating {
  sessionId: string
  rating: number
  beforeMood: number
  afterMood: number
  stressLevel: number
  focusLevel: number
  notes?: string
  timestamp: Date
}

const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: 'basic-breathing',
    name: 'Basic Breathing Meditation',
    description: 'Perfect introduction to mindfulness through focused breathing',
    category: 'beginner',
    duration: 5,
    type: 'breathing',
    narrator: 'neutral',
    backgroundSound: 'silence',
    benefits: ['Reduces anxiety', 'Improves focus', 'Calms nervous system'],
    instructions: [
      'Sit comfortably with your back straight',
      'Close your eyes or soften your gaze',
      'Focus on your natural breath',
      'When mind wanders, gently return to breath',
      'End with a moment of gratitude'
    ],
    script: [
      { time: 0, instruction: 'Find a comfortable position and close your eyes', tone: 'gentle' },
      { time: 30, instruction: 'Begin to notice your natural breathing rhythm', tone: 'neutral' },
      { time: 90, instruction: 'If thoughts arise, simply acknowledge them and return to your breath', tone: 'gentle' },
      { time: 180, instruction: 'Continue breathing naturally, feeling each inhale and exhale', tone: 'neutral' },
      { time: 270, instruction: 'Take a moment to appreciate this peaceful state you\'ve created', tone: 'encouraging' }
    ],
    difficulty: 1,
    popularity: 95,
    evidenceLevel: 'high'
  },
  {
    id: 'body-scan-deep',
    name: 'Progressive Body Scan',
    description: 'Deep relaxation through systematic body awareness',
    category: 'intermediate',
    duration: 15,
    type: 'body-scan',
    narrator: 'female',
    backgroundSound: 'nature',
    benefits: ['Releases physical tension', 'Increases body awareness', 'Promotes deep relaxation'],
    instructions: [
      'Lie down in a comfortable position',
      'Start with awareness of your toes',
      'Slowly move attention up through each body part',
      'Notice sensations without trying to change them',
      'End with whole-body awareness'
    ],
    script: [
      { time: 0, instruction: 'Lie down comfortably and close your eyes', tone: 'gentle' },
      { time: 60, instruction: 'Begin by bringing attention to your toes, noticing any sensations', tone: 'neutral' },
      { time: 180, instruction: 'Move your attention up to your feet and ankles', tone: 'gentle' },
      { time: 300, instruction: 'Continue scanning up through your legs, one part at a time', tone: 'neutral' },
      { time: 600, instruction: 'Notice your torso, feeling your chest rise and fall with each breath', tone: 'gentle' },
      { time: 750, instruction: 'Scan through your arms, shoulders, and neck', tone: 'neutral' },
      { time: 840, instruction: 'Finally, bring awareness to your whole body as one connected unit', tone: 'encouraging' }
    ],
    difficulty: 2,
    popularity: 88,
    evidenceLevel: 'high'
  },
  {
    id: 'loving-kindness',
    name: 'Loving-Kindness Meditation',
    description: 'Cultivate compassion for yourself and others',
    category: 'compassion',
    duration: 12,
    type: 'loving-kindness',
    narrator: 'female',
    backgroundSound: 'bells',
    benefits: ['Increases self-compassion', 'Improves relationships', 'Reduces negative emotions'],
    instructions: [
      'Start by sending loving wishes to yourself',
      'Extend compassion to loved ones',
      'Include neutral people in your life',
      'Send kindness to difficult people',
      'Radiate love to all beings everywhere'
    ],
    script: [
      { time: 0, instruction: 'Sit comfortably and place one hand on your heart', tone: 'gentle' },
      { time: 30, instruction: 'Begin by sending loving wishes to yourself: "May I be happy, may I be healthy"', tone: 'encouraging' },
      { time: 180, instruction: 'Bring to mind someone you love and send them the same wishes', tone: 'gentle' },
      { time: 360, instruction: 'Think of someone neutral and include them in your circle of compassion', tone: 'neutral' },
      { time: 540, instruction: 'If you feel ready, include someone challenging in your loving wishes', tone: 'gentle' },
      { time: 660, instruction: 'Expand your loving-kindness to all beings everywhere', tone: 'encouraging' }
    ],
    difficulty: 3,
    popularity: 76,
    evidenceLevel: 'high'
  },
  {
    id: 'anxiety-relief',
    name: 'Anxiety Relief Meditation',
    description: 'Gentle techniques to calm anxious thoughts and feelings',
    category: 'anxiety',
    duration: 8,
    type: 'guided',
    narrator: 'female',
    backgroundSound: 'ocean',
    benefits: ['Reduces anxiety symptoms', 'Calms racing thoughts', 'Creates sense of safety'],
    instructions: [
      'Focus on creating a sense of safety',
      'Use breath to anchor in the present',
      'Practice the RAIN technique for difficult emotions',
      'Visualize a peaceful, safe place',
      'End with affirmations of strength'
    ],
    script: [
      { time: 0, instruction: 'Find a safe, comfortable position and breathe naturally', tone: 'gentle' },
      { time: 45, instruction: 'Notice that in this moment, you are safe and supported', tone: 'encouraging' },
      { time: 120, instruction: 'If anxiety arises, acknowledge it gently: "I see you, anxiety"', tone: 'gentle' },
      { time: 240, instruction: 'Breathe into your heart center, imagining warm, healing light', tone: 'gentle' },
      { time: 360, instruction: 'Visualize yourself in your favorite peaceful place', tone: 'encouraging' },
      { time: 450, instruction: 'Remind yourself: "I am strong, I am capable, I can handle this"', tone: 'encouraging' }
    ],
    difficulty: 2,
    popularity: 92,
    evidenceLevel: 'high'
  },
  {
    id: 'focus-concentration',
    name: 'Focus & Concentration',
    description: 'Sharpen your mind for better focus and productivity',
    category: 'focus',
    duration: 10,
    type: 'guided',
    narrator: 'male',
    backgroundSound: 'silence',
    benefits: ['Improves concentration', 'Enhances mental clarity', 'Reduces mind wandering'],
    instructions: [
      'Choose a single point of focus',
      'Practice sustained attention',
      'Notice when mind wanders without judgment',
      'Gently return attention to focus point',
      'Build mental muscle through repetition'
    ],
    script: [
      { time: 0, instruction: 'Sit upright with alert, relaxed posture', tone: 'neutral' },
      { time: 30, instruction: 'Choose a single point of focus - perhaps your breath at the nostrils', tone: 'neutral' },
      { time: 120, instruction: 'When you notice your mind has wandered, simply return to your focus point', tone: 'encouraging' },
      { time: 300, instruction: 'Each time you return your attention is like doing a mental pushup', tone: 'encouraging' },
      { time: 480, instruction: 'Continue building this mental muscle of sustained attention', tone: 'neutral' },
      { time: 570, instruction: 'Take a moment to appreciate your practice and growing focus', tone: 'encouraging' }
    ],
    difficulty: 2,
    popularity: 84,
    evidenceLevel: 'high'
  },
  {
    id: 'sleep-preparation',
    name: 'Sleep Preparation',
    description: 'Gentle meditation to prepare mind and body for restful sleep',
    category: 'sleep',
    duration: 20,
    type: 'guided',
    narrator: 'female',
    backgroundSound: 'rain',
    benefits: ['Improves sleep quality', 'Reduces bedtime anxiety', 'Promotes relaxation'],
    instructions: [
      'Lie down in your bed',
      'Release the day\'s tensions',
      'Scan body for areas of holding',
      'Use visualization for peace',
      'Allow yourself to drift naturally'
    ],
    script: [
      { time: 0, instruction: 'Lie down comfortably and let your body sink into your bed', tone: 'gentle' },
      { time: 90, instruction: 'Take a moment to release any tension from the day', tone: 'gentle' },
      { time: 300, instruction: 'Scan through your body, letting each part become heavy and relaxed', tone: 'gentle' },
      { time: 600, instruction: 'Imagine yourself in a peaceful meadow under a starlit sky', tone: 'gentle' },
      { time: 900, instruction: 'Feel completely safe and supported as you prepare for sleep', tone: 'gentle' },
      { time: 1140, instruction: 'Allow your mind to become quiet and your body to rest deeply', tone: 'gentle' }
    ],
    difficulty: 1,
    popularity: 89,
    evidenceLevel: 'high'
  },
  {
    id: 'walking-meditation',
    name: 'Mindful Walking',
    description: 'Bring mindfulness to movement and daily activities',
    category: 'intermediate',
    duration: 7,
    type: 'walking',
    backgroundSound: 'forest',
    benefits: ['Integrates mindfulness into daily life', 'Grounds in physical sensations', 'Reduces restlessness'],
    instructions: [
      'Find a quiet path or space to walk',
      'Walk slower than normal',
      'Focus on sensations of each step',
      'Coordinate with breathing if helpful',
      'Be present with the journey'
    ],
    script: [
      { time: 0, instruction: 'Begin walking at a slower pace than usual', tone: 'neutral' },
      { time: 60, instruction: 'Notice the sensation of your feet touching the ground', tone: 'gentle' },
      { time: 180, instruction: 'Feel the movement of your legs and the shift of your weight', tone: 'neutral' },
      { time: 300, instruction: 'If your mind wanders, gently return attention to walking', tone: 'encouraging' },
      { time: 390, instruction: 'Appreciate this simple act of mindful movement', tone: 'encouraging' }
    ],
    difficulty: 2,
    popularity: 71,
    evidenceLevel: 'moderate'
  }
]

export default function MindfulnessHub() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSessions: 0,
    totalMinutes: 0,
    streak: 0,
    longestStreak: 0,
    completedSessions: [],
    favoriteTypes: [],
    averageRating: 0
  })
  const [currentScript, setCurrentScript] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [sessionRating, setSessionRating] = useState({
    rating: 5,
    beforeMood: 5,
    afterMood: 5,
    stressLevel: 5,
    focusLevel: 5,
    notes: ''
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)

  // Initialize audio and load progress
  useEffect(() => {
    if (typeof window !== 'undefined' && audioEnabled) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    loadUserProgress()
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [audioEnabled])

  // Session timer
  useEffect(() => {
    if (!isPlaying || !selectedSession) return

    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1
        
        // Update script based on time
        if (selectedSession.script) {
          const currentInstruction = selectedSession.script
            .reverse()
            .find(s => s.time <= newTime)
          if (currentInstruction) {
            setCurrentScript(currentInstruction.instruction)
          }
        }

        // Check if session is complete
        if (newTime >= selectedSession.duration * 60) {
          completeSession()
          return selectedSession.duration * 60
        }
        
        return newTime
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, selectedSession])

  const loadUserProgress = async () => {
    try {
      const response = await fetch('/api/self-help/mindfulness/progress')
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data.progress || {
          totalSessions: 0,
          totalMinutes: 0,
          streak: 0,
          longestStreak: 0,
          completedSessions: [],
          favoriteTypes: [],
          averageRating: 0
        })
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session)
    setCurrentTime(0)
    setCurrentScript(session.script?.[0]?.instruction || session.instructions[0])
    setSessionComplete(false)
    setIsPlaying(true)
    setIsPaused(false)
  }

  const pauseSession = () => {
    setIsPlaying(false)
    setIsPaused(true)
  }

  const resumeSession = () => {
    setIsPlaying(true)
    setIsPaused(false)
  }

  const stopSession = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setSelectedSession(null)
    setCurrentTime(0)
    setCurrentScript('')
  }

  const completeSession = async () => {
    setIsPlaying(false)
    setSessionComplete(true)
    setShowRating(true)

    if (selectedSession) {
      // Update local progress
      setUserProgress(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + selectedSession.duration,
        completedSessions: [...prev.completedSessions, selectedSession.id]
      }))

      // Save to backend
      try {
        await fetch('/api/self-help/mindfulness/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: selectedSession.id,
            duration: selectedSession.duration,
            completedAt: new Date()
          })
        })
      } catch (error) {
        console.error('Error saving session:', error)
      }
    }
  }

  const submitRating = async () => {
    if (!selectedSession) return

    const rating: SessionRating = {
      sessionId: selectedSession.id,
      ...sessionRating,
      timestamp: new Date()
    }

    try {
      await fetch('/api/self-help/mindfulness/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating)
      })
      
      await loadUserProgress()
      setShowRating(false)
      setSelectedSession(null)
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getFilteredSessions = (): MeditationSession[] => {
    if (selectedCategory === 'all') return MEDITATION_SESSIONS
    return MEDITATION_SESSIONS.filter(session => session.category === selectedCategory)
  }

  const categories = [
    { id: 'all', name: 'All Sessions', icon: Brain },
    { id: 'beginner', name: 'Beginner', icon: Leaf },
    { id: 'anxiety', name: 'Anxiety Relief', icon: Heart },
    { id: 'focus', name: 'Focus', icon: Target },
    { id: 'sleep', name: 'Sleep', icon: Moon },
    { id: 'compassion', name: 'Compassion', icon: Sun }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mindfulness & Meditation</h1>
              <p className="text-gray-600">Guided practices for inner peace and clarity</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Sessions</div>
              <div className="text-2xl font-bold text-purple-600">{userProgress.totalSessions}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Minutes Practiced</div>
              <div className="text-2xl font-bold text-purple-600">{userProgress.totalMinutes}</div>
            </div>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Active Session Player */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8"
          >
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSession.name}</h2>
                <p className="text-lg text-gray-600">{selectedSession.description}</p>
              </div>

              {/* Progress Circle */}
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#8B5CF6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={553}
                    strokeDashoffset={553 * (1 - currentTime / (selectedSession.duration * 60))}
                    strokeLinecap="round"
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-sm text-gray-600">
                    of {selectedSession.duration} min
                  </span>
                </div>
              </div>

              {/* Current Instruction */}
              {currentScript && (
                <div className="bg-white/70 rounded-lg p-6">
                  <p className="text-lg text-gray-800 font-medium leading-relaxed">
                    {currentScript}
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isPlaying ? (
                  <button
                    onClick={resumeSession}
                    className="flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-lg font-semibold"
                  >
                    <Play className="w-6 h-6" />
                    {isPaused ? 'Resume' : 'Start'}
                  </button>
                ) : (
                  <button
                    onClick={pauseSession}
                    className="flex items-center gap-2 px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-semibold"
                  >
                    <Pause className="w-6 h-6" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={stopSession}
                  className="flex items-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Stop
                </button>
                
                {sessionComplete && (
                  <button
                    onClick={() => setShowRating(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    Rate Session
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      {!selectedSession && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg transition-all",
                    selectedCategory === category.id
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sessions Grid */}
      {!selectedSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredSessions().map((session) => {
            const isCompleted = userProgress.completedSessions.includes(session.id)
            
            return (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-purple-200 transition-all"
                onClick={() => startSession(session)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{session.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: session.difficulty }, (_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {session.benefits.slice(0, 2).map((benefit) => (
                      <span
                        key={benefit}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      session.category === 'beginner' ? "bg-green-100 text-green-700" :
                      session.category === 'anxiety' ? "bg-red-100 text-red-700" :
                      session.category === 'focus' ? "bg-blue-100 text-blue-700" :
                      session.category === 'sleep' ? "bg-indigo-100 text-indigo-700" :
                      session.category === 'compassion' ? "bg-pink-100 text-pink-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {session.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-600 font-medium">Start</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Progress Dashboard */}
      {!selectedSession && userProgress.totalSessions > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Mindfulness Journey</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{userProgress.streak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{userProgress.longestStreak}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{userProgress.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg. Rating</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{Math.round(userProgress.totalMinutes / userProgress.totalSessions)}</div>
              <div className="text-sm text-gray-600">Avg. Session</div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl max-w-lg w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">How was your session?</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSessionRating(prev => ({ ...prev, rating }))}
                        className={cn(
                          "w-10 h-10 rounded-full",
                          sessionRating.rating >= rating ? "bg-yellow-400" : "bg-gray-200"
                        )}
                      >
                        <Star className="w-5 h-5 mx-auto text-white" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mood Before: {sessionRating.beforeMood}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sessionRating.beforeMood}
                      onChange={(e) => setSessionRating(prev => ({ 
                        ...prev, 
                        beforeMood: Number(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mood After: {sessionRating.afterMood}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sessionRating.afterMood}
                      onChange={(e) => setSessionRating(prev => ({ 
                        ...prev, 
                        afterMood: Number(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={sessionRating.notes}
                    onChange={(e) => setSessionRating(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="How did this session feel? Any insights or reflections?"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={submitRating}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Feedback
                  </button>
                  <button
                    onClick={() => {
                      setShowRating(false)
                      setSelectedSession(null)
                    }}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}