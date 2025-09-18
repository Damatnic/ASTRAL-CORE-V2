'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Activity,
  Volume2,
  VolumeX,
  ChevronRight,
  Award,
  Clock,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Breathing techniques with evidence-based patterns
const BREATHING_EXERCISES = {
  fourSevenEight: {
    name: '4-7-8 Breathing',
    description: 'Reduces anxiety and helps with sleep',
    inhale: 4,
    hold: 7,
    exhale: 8,
    pause: 0,
    cycles: 4,
    difficulty: 'beginner',
    benefits: ['Reduces anxiety', 'Improves sleep', 'Lowers blood pressure'],
    instructions: [
      'Empty your lungs completely',
      'Inhale through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale through your mouth for 8 seconds',
      'Repeat for 4 cycles'
    ],
    contraindications: []
  },
  boxBreathing: {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs for focus and calm',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    cycles: 5,
    difficulty: 'beginner',
    benefits: ['Improves focus', 'Reduces stress', 'Enhances performance'],
    instructions: [
      'Sit comfortably with your back straight',
      'Inhale for 4 seconds',
      'Hold for 4 seconds',
      'Exhale for 4 seconds',
      'Hold empty for 4 seconds',
      'Visualize drawing a box with each phase'
    ],
    contraindications: []
  },
  coherent: {
    name: 'Coherent Breathing',
    description: 'Balances the nervous system',
    inhale: 5,
    hold: 0,
    exhale: 5,
    pause: 0,
    cycles: 10,
    difficulty: 'beginner',
    benefits: ['Heart rate variability', 'Emotional balance', 'Reduces depression'],
    instructions: [
      'Breathe in slowly for 5 seconds',
      'Breathe out slowly for 5 seconds',
      'Maintain a smooth, continuous flow',
      'Focus on your heart center'
    ],
    contraindications: []
  },
  bellyBreathing: {
    name: 'Belly Breathing',
    description: 'Activates the relaxation response',
    inhale: 4,
    hold: 2,
    exhale: 6,
    pause: 0,
    cycles: 8,
    difficulty: 'beginner',
    benefits: ['Activates parasympathetic nervous system', 'Reduces cortisol', 'Improves digestion'],
    instructions: [
      'Place one hand on your chest, one on your belly',
      'Inhale deeply through your nose, expanding your belly',
      'Hold briefly',
      'Exhale slowly, letting your belly fall',
      'Chest should remain relatively still'
    ],
    contraindications: []
  },
  alternateNostril: {
    name: 'Alternate Nostril',
    description: 'Balances left and right brain hemispheres',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 0,
    cycles: 6,
    difficulty: 'intermediate',
    benefits: ['Mental clarity', 'Reduces anxiety', 'Balances energy'],
    instructions: [
      'Close right nostril with thumb',
      'Inhale through left nostril',
      'Close both nostrils and hold',
      'Release right nostril and exhale',
      'Inhale through right nostril',
      'Switch and continue alternating'
    ],
    contraindications: []
  },
  fireBreath: {
    name: 'Fire Breath',
    description: 'Energizing and cleansing',
    inhale: 1,
    hold: 0,
    exhale: 1,
    pause: 0,
    cycles: 30,
    difficulty: 'advanced',
    benefits: ['Increases energy', 'Improves focus', 'Detoxifying'],
    instructions: [
      'Sit with spine straight',
      'Take quick, forceful exhales through nose',
      'Let inhales happen naturally',
      'Focus on rapid belly movements',
      'Stop if you feel dizzy'
    ],
    contraindications: ['Pregnancy', 'High blood pressure', 'Heart conditions']
  }
}

type ExerciseKey = keyof typeof BREATHING_EXERCISES

interface BreathingSession {
  exerciseId: string
  duration: number
  cyclesCompleted: number
  moodBefore?: number
  moodAfter?: number
  anxietyBefore?: number
  anxietyAfter?: number
  timestamp: Date
}

export default function BreathingExercises() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey>('fourSevenEight')
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [moodBefore, setMoodBefore] = useState<number | null>(null)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const [anxietyBefore, setAnxietyBefore] = useState<number | null>(null)
  const [anxietyAfter, setAnxietyAfter] = useState<number | null>(null)
  const [sessions, setSessions] = useState<BreathingSession[]>([])
  const [heartRate, setHeartRate] = useState(72)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const exercise = BREATHING_EXERCISES[selectedExercise]

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  // Play sound for phase transitions
  const playSound = useCallback((frequency: number, duration: number) => {
    if (!soundEnabled || !audioContext.current) return
    
    const oscillator = audioContext.current.createOscillator()
    const gainNode = audioContext.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.current.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.current.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration)
    
    oscillator.start(audioContext.current.currentTime)
    oscillator.stop(audioContext.current.currentTime + duration)
  }, [soundEnabled])

  // Calculate circle animation values
  const getCircleScale = () => {
    if (!isActive) return 1
    
    switch (currentPhase) {
      case 'inhale':
        return 1 + phaseProgress * 0.5 // Expand to 1.5x
      case 'hold':
        return 1.5 // Stay expanded
      case 'exhale':
        return 1.5 - phaseProgress * 0.5 // Contract back to 1x
      case 'pause':
        return 1 // Stay at normal size
      default:
        return 1
    }
  }

  // Start breathing exercise
  const startExercise = () => {
    setIsActive(true)
    setIsPaused(false)
    setCurrentPhase('inhale')
    setPhaseProgress(0)
    setCurrentCycle(0)
    setTotalTime(0)
    
    // Play start sound
    playSound(440, 0.2)
  }

  // Stop exercise
  const stopExercise = () => {
    setIsActive(false)
    setIsPaused(false)
    setCurrentPhase('inhale')
    setPhaseProgress(0)
    setCurrentCycle(0)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Show feedback modal if exercise was completed
    if (currentCycle > 0) {
      // Save session would happen here
    }
  }

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Main breathing timer logic
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }
    
    const updateInterval = 50 // Update every 50ms for smooth animation
    let elapsed = 0
    
    const phaseDurations = {
      inhale: exercise.inhale * 1000,
      hold: exercise.hold * 1000,
      exhale: exercise.exhale * 1000,
      pause: exercise.pause * 1000
    }
    
    const currentPhaseDuration = phaseDurations[currentPhase]
    
    intervalRef.current = setInterval(() => {
      elapsed += updateInterval
      setTotalTime(prev => prev + updateInterval / 1000)
      
      // Update phase progress
      const progress = currentPhaseDuration > 0 ? elapsed / currentPhaseDuration : 1
      setPhaseProgress(Math.min(progress, 1))
      
      // Simulate heart rate change
      if (currentPhase === 'inhale') {
        setHeartRate(prev => Math.min(prev + 0.1, 80))
      } else if (currentPhase === 'exhale') {
        setHeartRate(prev => Math.max(prev - 0.15, 65))
      }
      
      // Phase complete
      if (progress >= 1) {
        elapsed = 0
        
        // Determine next phase
        const phaseOrder: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale', 'hold', 'exhale', 'pause']
        const currentIndex = phaseOrder.indexOf(currentPhase)
        let nextIndex = currentIndex + 1
        
        // Skip phases with 0 duration
        while (nextIndex < phaseOrder.length && phaseDurations[phaseOrder[nextIndex]] === 0) {
          nextIndex++
        }
        
        if (nextIndex >= phaseOrder.length) {
          // Cycle complete
          const newCycle = currentCycle + 1
          setCurrentCycle(newCycle)
          
          if (newCycle >= exercise.cycles) {
            // Exercise complete
            stopExercise()
            playSound(880, 0.5) // Success sound
            return
          } else {
            // Start new cycle
            setCurrentPhase('inhale')
            playSound(523, 0.1) // Cycle complete sound
          }
        } else {
          setCurrentPhase(phaseOrder[nextIndex])
          
          // Play phase transition sounds
          if (phaseOrder[nextIndex] === 'inhale') {
            playSound(440, 0.1)
          } else if (phaseOrder[nextIndex] === 'exhale') {
            playSound(330, 0.1)
          }
        }
        
        setPhaseProgress(0)
      }
    }, updateInterval)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, currentPhase, currentCycle, exercise, playSound, stopExercise])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wind className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Breathing Exercises</h2>
              <p className="text-gray-600">Evidence-based techniques for calm and focus</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-gray-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">Choose Exercise</h3>
            <div className="space-y-2">
              {Object.entries(BREATHING_EXERCISES).map(([key, ex]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (!isActive) {
                      setSelectedExercise(key as ExerciseKey)
                    }
                  }}
                  disabled={isActive}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    selectedExercise === key
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "border-2 border-gray-200 hover:border-gray-300",
                    isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ex.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{ex.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          ex.difficulty === 'beginner' && "bg-green-100 text-green-700",
                          ex.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700",
                          ex.difficulty === 'advanced' && "bg-red-100 text-red-700"
                        )}>
                          {ex.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ex.cycles} cycles
                        </span>
                      </div>
                    </div>
                    {selectedExercise === key && (
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4" />
                Instructions
              </h3>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                showInstructions && "rotate-90"
              )} />
            </button>
            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <ol className="space-y-1">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-600 flex gap-2">
                        <span className="font-medium text-blue-600">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                  {exercise.contraindications && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Caution:</strong> Not recommended for{' '}
                        {exercise.contraindications.join(', ').toLowerCase()}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">Benefits</h3>
            <ul className="space-y-2">
              {exercise.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Breathing Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Breathing Circle */}
            <div className="relative flex items-center justify-center h-80">
              {/* Background circles */}
              <div className="absolute w-72 h-72 rounded-full border-2 border-gray-200" />
              <div className="absolute w-60 h-60 rounded-full border border-gray-100" />
              <div className="absolute w-48 h-48 rounded-full border border-gray-50" />
              
              {/* Animated breathing circle */}
              <motion.div
                animate={{
                  scale: getCircleScale(),
                  backgroundColor: currentPhase === 'inhale' ? '#3B82F6' :
                                 currentPhase === 'hold' ? '#8B5CF6' :
                                 currentPhase === 'exhale' ? '#10B981' :
                                 '#F59E0B'
                }}
                transition={{ duration: 0.3, ease: 'linear' }}
                className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-xl"
                style={{
                  background: `radial-gradient(circle, ${
                    currentPhase === 'inhale' ? '#60A5FA' :
                    currentPhase === 'hold' ? '#A78BFA' :
                    currentPhase === 'exhale' ? '#34D399' :
                    '#FBBF24'
                  }, ${
                    currentPhase === 'inhale' ? '#3B82F6' :
                    currentPhase === 'hold' ? '#8B5CF6' :
                    currentPhase === 'exhale' ? '#10B981' :
                    '#F59E0B'
                  })`
                }}
              >
                <div className="text-white text-center">
                  <div className="text-3xl font-bold capitalize">
                    {isActive ? currentPhase : 'Ready'}
                  </div>
                  {isActive && (
                    <div className="text-sm mt-1 opacity-90">
                      {Math.ceil((1 - phaseProgress) * 
                        (currentPhase === 'inhale' ? exercise.inhale :
                         currentPhase === 'hold' ? exercise.hold :
                         currentPhase === 'exhale' ? exercise.exhale :
                         exercise.pause))}s
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Progress ring */}
              {isActive && (
                <svg className="absolute w-80 h-80 -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="150"
                    stroke={
                      currentPhase === 'inhale' ? '#3B82F6' :
                      currentPhase === 'hold' ? '#8B5CF6' :
                      currentPhase === 'exhale' ? '#10B981' :
                      '#F59E0B'
                    }
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={942}
                    strokeDashoffset={942 * (1 - phaseProgress)}
                    strokeLinecap="round"
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </svg>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-sm text-gray-600">Cycle</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentCycle}/{exercise.cycles}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor(totalTime / 60)}:{String(Math.floor(totalTime % 60)).padStart(2, '0')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3" />
                  Heart Rate
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(heartRate)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-8">
              {!isActive ? (
                <button
                  onClick={startExercise}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Start Exercise
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-5 h-5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopExercise}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Stop
                  </button>
                </>
              )}
            </div>

            {/* Pattern visualization */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Breathing Pattern</span>
                <span className="text-xs text-gray-500">
                  {exercise.inhale}s in • {exercise.hold > 0 && `${exercise.hold}s hold • `}
                  {exercise.exhale}s out {exercise.pause > 0 && `• ${exercise.pause}s pause`}
                </span>
              </div>
              <div className="flex gap-1 h-8">
                <div 
                  className="bg-blue-500 rounded"
                  style={{ width: `${(exercise.inhale / (exercise.inhale + exercise.hold + exercise.exhale + exercise.pause)) * 100}%` }}
                />
                {exercise.hold > 0 && (
                  <div 
                    className="bg-purple-500 rounded"
                    style={{ width: `${(exercise.hold / (exercise.inhale + exercise.hold + exercise.exhale + exercise.pause)) * 100}%` }}
                  />
                )}
                <div 
                  className="bg-green-500 rounded"
                  style={{ width: `${(exercise.exhale / (exercise.inhale + exercise.hold + exercise.exhale + exercise.pause)) * 100}%` }}
                />
                {exercise.pause > 0 && (
                  <div 
                    className="bg-yellow-500 rounded"
                    style={{ width: `${(exercise.pause / (exercise.inhale + exercise.hold + exercise.exhale + exercise.pause)) * 100}%` }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-blue-600 font-medium">Inhale</span>
                {exercise.hold > 0 && <span className="text-xs text-purple-600 font-medium">Hold</span>}
                <span className="text-xs text-green-600 font-medium">Exhale</span>
                {exercise.pause > 0 && <span className="text-xs text-yellow-600 font-medium">Pause</span>}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Sessions
            </h3>
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Complete your first breathing exercise to see your progress
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{session.exerciseId}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{Math.round(session.duration / 60)}min</p>
                      </div>
                      {session.anxietyAfter && session.anxietyBefore && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Anxiety</p>
                          <p className="font-medium flex items-center gap-1">
                            {session.anxietyBefore} → {session.anxietyAfter}
                            {session.anxietyAfter < session.anxietyBefore && (
                              <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}