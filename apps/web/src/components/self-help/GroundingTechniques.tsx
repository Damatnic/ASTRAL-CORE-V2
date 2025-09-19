'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Anchor,
  Eye,
  Hand,
  Ear,
  Zap,
  Snowflake,
  Activity,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Star,
  Volume2,
  Heart,
  Brain,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Evidence-based grounding techniques
const GROUNDING_TECHNIQUES = {
  fiveForOne: {
    name: '5-4-3-2-1 Technique',
    description: 'Engage all five senses to return to the present',
    type: 'sensory',
    category: 'panic_attack',
    duration: 5,
    evidenceLevel: 'high',
    steps: [
      { sense: 'sight', count: 5, icon: Eye, instruction: 'Look around and name 5 things you can see' },
      { sense: 'touch', count: 4, icon: Hand, instruction: 'Notice 4 things you can touch' },
      { sense: 'hearing', count: 3, icon: Ear, instruction: 'Listen for 3 things you can hear' },
      { sense: 'smell', count: 2, icon: '👃', instruction: 'Identify 2 things you can smell' },
      { sense: 'taste', count: 1, icon: '👅', instruction: 'Notice 1 thing you can taste' }
    ],
    benefits: ['Reduces panic attacks', 'Grounds during dissociation', 'Quick anxiety relief'],
    bestFor: ['Panic attacks', 'Dissociation', 'Overwhelming anxiety']
  },
  tipp: {
    name: 'TIPP Technique',
    description: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation',
    type: 'physical',
    category: 'crisis',
    duration: 10,
    evidenceLevel: 'high',
    steps: [
      { 
        phase: 'temperature',
        icon: Snowflake,
        instruction: 'Apply cold water to face, hold ice cubes, or splash cold water on wrists',
        duration: 30,
        explanation: 'Activates the dive response, quickly calming your nervous system'
      },
      {
        phase: 'intense',
        icon: Zap,
        instruction: 'Do jumping jacks, run in place, or do pushups for 30 seconds',
        duration: 30,
        explanation: 'Burns off stress hormones and releases endorphins'
      },
      {
        phase: 'paced',
        icon: Activity,
        instruction: 'Slow your breathing - exhale longer than you inhale',
        duration: 60,
        explanation: 'Activates parasympathetic nervous system'
      },
      {
        phase: 'paired',
        icon: Hand,
        instruction: 'Tense and relax muscle groups progressively',
        duration: 180,
        explanation: 'Releases physical tension and promotes relaxation'
      }
    ],
    benefits: ['Intense crisis intervention', 'Stops self-harm urges', 'Rapid mood regulation'],
    bestFor: ['Crisis situations', 'Self-harm urges', 'Intense emotional distress'],
    contraindications: ['Heart conditions', 'Eating disorders (cold water)']
  },
  bodyScan: {
    name: 'Body Scan',
    description: 'Progressive awareness of physical sensations',
    type: 'mental',
    category: 'anxiety',
    duration: 15,
    evidenceLevel: 'high',
    steps: [
      { part: 'feet', instruction: 'Focus on your toes, notice any sensations' },
      { part: 'legs', instruction: 'Move attention up your legs, feeling weight and temperature' },
      { part: 'torso', instruction: 'Notice your breathing, chest rising and falling' },
      { part: 'arms', instruction: 'Feel your arms resting, hands touching surfaces' },
      { part: 'head', instruction: 'Notice tension in jaw, eyes, forehead' }
    ],
    benefits: ['Reduces anxiety', 'Improves body awareness', 'Promotes relaxation'],
    bestFor: ['General anxiety', 'Stress relief', 'Mindfulness practice']
  },
  categories: {
    name: 'Category Grounding',
    description: 'Mental grounding through categorization',
    type: 'mental',
    category: 'overwhelm',
    duration: 8,
    evidenceLevel: 'moderate',
    categories: [
      'Animals that start with each letter of the alphabet',
      'Colors you can see around you',
      'Countries you\'d like to visit',
      'Your favorite foods',
      'Movies you\'ve enjoyed',
      'Books you\'ve read',
      'People you care about',
      'Happy memories'
    ],
    benefits: ['Engages logical thinking', 'Distracts from overwhelming thoughts', 'Builds cognitive flexibility'],
    bestFor: ['Racing thoughts', 'Overwhelm', 'Rumination']
  },
  physicalGrounding: {
    name: 'Physical Grounding',
    description: 'Use physical sensations to anchor yourself',
    type: 'physical',
    category: 'dissociation',
    duration: 5,
    evidenceLevel: 'moderate',
    techniques: [
      { name: 'Rubber band', instruction: 'Snap a rubber band on your wrist gently' },
      { name: 'Ice cube', instruction: 'Hold an ice cube in your hand' },
      { name: 'Texture focus', instruction: 'Feel different textures around you' },
      { name: 'Pressure points', instruction: 'Press firmly on your palm or thigh' },
      { name: 'Wall push', instruction: 'Push against a wall with your palms' }
    ],
    benefits: ['Reconnects mind and body', 'Stops dissociation', 'Immediate grounding'],
    bestFor: ['Dissociation', 'Depersonalization', 'Feeling disconnected']
  },
  breathing54321: {
    name: 'Grounding Breath',
    description: 'Combine breathing with sensory awareness',
    type: 'movement',
    category: 'flashback',
    duration: 6,
    evidenceLevel: 'high',
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 6
    },
    visualCues: [
      'Breathe in stability and strength',
      'Hold your center and balance',
      'Breathe out fear and tension',
      'Feel your feet on the ground',
      'You are safe in this moment'
    ],
    benefits: ['Combines breath and grounding', 'Trauma-informed', 'Builds safety'],
    bestFor: ['Flashbacks', 'Trauma responses', 'Building safety']
  }
}

type TechniqueKey = keyof typeof GROUNDING_TECHNIQUES

interface GroundingSession {
  techniqueId: string
  duration: number
  completionRate: number
  severityBefore?: number
  severityAfter?: number
  stepsCompleted: string[]
  timestamp: Date
}

export default function GroundingTechniques() {
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueKey>('fiveForOne')
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [sessionTime, setSessionTime] = useState(0)
  const [severityBefore, setSeverityBefore] = useState<number | null>(null)
  const [severityAfter, setSeverityAfter] = useState<number | null>(null)
  const [sessions, setSessions] = useState<GroundingSession[]>([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const technique = GROUNDING_TECHNIQUES[selectedTechnique]

  // Initialize audio for guided instructions
  useEffect(() => {
    if (typeof window !== 'undefined' && audioEnabled) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [audioEnabled])

  // Timer for technique sessions
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  // Start technique session
  const startTechnique = () => {
    setIsActive(true)
    setCurrentStep(0)
    setStepProgress(0)
    setCompletedSteps([])
    setSessionTime(0)
  }

  // Complete current step
  const completeStep = () => {
    const stepId = getCurrentStepId()
    if (stepId && !completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId])
    }

    if (selectedTechnique === 'fiveForOne') {
      const steps = (technique as any).steps
      if (steps && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setStepProgress(0)
      } else {
        endSession()
      }
    } else if (selectedTechnique === 'tipp') {
      const steps = (technique as any).steps
      if (steps && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setStepProgress(0)
      } else {
        endSession()
      }
    } else {
      // For other techniques, just mark as complete
      endSession()
    }
  }

  // End session
  const endSession = () => {
    setIsActive(false)
    
    const session: GroundingSession = {
      techniqueId: selectedTechnique,
      duration: sessionTime,
      completionRate: completedSteps.length / getTotalSteps(),
      severityBefore: severityBefore ?? undefined,
      severityAfter: severityAfter ?? undefined,
      stepsCompleted: completedSteps,
      timestamp: new Date()
    }
    
    setSessions(prev => [session, ...prev])
    
    // Reset state
    setCurrentStep(0)
    setStepProgress(0)
    setSessionTime(0)
  }

  // Get current step ID for tracking
  const getCurrentStepId = () => {
    if (selectedTechnique === 'fiveForOne') {
      return (technique as any).steps?.[currentStep]?.sense
    } else if (selectedTechnique === 'tipp') {
      return (technique as any).steps?.[currentStep]?.phase
    }
    return selectedTechnique
  }

  // Get total steps for completion calculation
  const getTotalSteps = () => {
    if (selectedTechnique === 'fiveForOne') {
      return (technique as any).steps?.length || 1
    } else if (selectedTechnique === 'tipp') {
      return (technique as any).steps?.length || 1
    }
    return 1
  }

  // Render current step content
  const renderCurrentStep = () => {
    if (selectedTechnique === 'fiveForOne') {
      const steps = (technique as any).steps
      const step = steps?.[currentStep]
      const IconComponent = step?.icon as React.ComponentType<{ className?: string }>
      
      return (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            {typeof step.icon === 'string' ? (
              <span className="text-6xl">{step.icon}</span>
            ) : (
              <IconComponent className="w-16 h-16 text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {step.count} Things You Can {step.sense}
            </h3>
            <p className="text-lg text-gray-600">{step.instruction}</p>
          </div>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {Array.from({ length: step.count }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold",
                  i < stepProgress
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 text-gray-600"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <button
            onClick={() => setStepProgress(Math.min(stepProgress + 1, step.count))}
            disabled={stepProgress >= step.count}
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-all",
              stepProgress >= step.count
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            Found One
          </button>
          {stepProgress >= step.count && (
            <button
              onClick={completeStep}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 mx-auto"
            >
              <CheckCircle className="w-5 h-5" />
              Next Step
            </button>
          )}
        </div>
      )
    }

    if (selectedTechnique === 'tipp') {
      const steps = (technique as any).steps
      const step = steps?.[currentStep]
      const IconComponent = step?.icon as React.ComponentType<{ className?: string }>
      
      return (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <IconComponent className="w-16 h-16 text-purple-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
              {step.phase}
            </h3>
            <p className="text-lg text-gray-600 mb-2">{step.instruction}</p>
            <p className="text-sm text-gray-700 italic">{step.explanation}</p>
          </div>
          <div className="w-32 h-32 mx-auto relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                stroke="#8B5CF6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={377}
                strokeDashoffset={377 * (1 - stepProgress / step.duration!)}
                strokeLinecap="round"
                animate={{ strokeDashoffset: 377 * (1 - stepProgress / step.duration!) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {Math.max(0, step.duration! - stepProgress)}s
              </span>
            </div>
          </div>
          <button
            onClick={completeStep}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 mx-auto"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Step
          </button>
        </div>
      )
    }

    // Default for other techniques
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <Anchor className="w-16 h-16 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {technique.name}
          </h3>
          <p className="text-lg text-gray-600">{technique.description}</p>
        </div>
        <button
          onClick={completeStep}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto"
        >
          <CheckCircle className="w-5 h-5" />
          Mark Complete
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Anchor className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Grounding Techniques</h2>
              <p className="text-gray-600">Return to the present moment safely</p>
            </div>
          </div>
          {/* Crisis level indicator */}
          {severityBefore && severityBefore >= 8 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              <Heart className="w-4 h-4" />
              <span className="font-medium">High Distress Detected</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technique Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">Choose Technique</h3>
            <div className="space-y-2">
              {Object.entries(GROUNDING_TECHNIQUES).map(([key, tech]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (!isActive) {
                      setSelectedTechnique(key as TechniqueKey)
                    }
                  }}
                  disabled={isActive}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    selectedTechnique === key
                      ? "bg-indigo-50 border-2 border-indigo-500"
                      : "border-2 border-gray-200 hover:border-gray-300",
                    isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{tech.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{tech.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          tech.type === 'sensory' && "bg-blue-100 text-blue-700",
                          tech.type === 'physical' && "bg-red-100 text-red-700",
                          tech.type === 'mental' && "bg-green-100 text-green-700",
                          tech.type === 'movement' && "bg-purple-100 text-purple-700"
                        )}>
                          {tech.type}
                        </span>
                        <span className="text-xs text-gray-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tech.duration}min
                        </span>
                        <div className="flex">
                          {Array.from({ length: 3 }, (_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                tech.evidenceLevel === 'high' || 
                                (tech.evidenceLevel === 'moderate' && i < 2) ||
                                (tech.evidenceLevel === 'low' && i < 1)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedTechnique === key && (
                      <ChevronRight className="w-4 h-4 text-indigo-500 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Check */}
          {!isActive && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-3">Current Distress Level</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Calm</span>
                  <span>Overwhelming</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityBefore || 5}
                  onChange={(e) => setSeverityBefore(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center text-lg font-bold text-gray-800">
                  {severityBefore || 5}/10
                </div>
                {severityBefore && severityBefore >= 8 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      High distress detected. Consider TIPP technique for immediate relief.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technique Info */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">About This Technique</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Best For</h4>
                <ul className="space-y-1">
                  {technique.bestFor?.map((use, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Benefits</h4>
                <ul className="space-y-1">
                  {technique.benefits?.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              {'contraindications' in technique && technique.contraindications && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Caution</h4>
                  <p className="text-sm text-yellow-700">
                    Not recommended for: {technique.contraindications?.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Technique Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-8 min-h-[500px]">
            {!isActive ? (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center">
                  <Anchor className="w-20 h-20 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {technique.name}
                  </h3>
                  <p className="text-xl text-gray-600 mb-4">{technique.description}</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ~{technique.duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="w-4 h-4" />
                      {technique.evidenceLevel} evidence
                    </span>
                  </div>
                </div>
                <button
                  onClick={startTechnique}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2 mx-auto text-lg font-semibold"
                >
                  <Play className="w-6 h-6" />
                  Start Grounding
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Step {currentStep + 1} of {getTotalSteps()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')} elapsed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsActive(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((currentStep + (stepProgress / (selectedTechnique === 'fiveForOne' ? (technique as any).steps?.[currentStep]?.count || 1 : 1))) / getTotalSteps()) * 100}%` 
                    }}
                  />
                </div>

                {/* Current Step */}
                {renderCurrentStep()}
              </div>
            )}
          </div>

          {/* Session History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Sessions
            </h3>
            {sessions.length === 0 ? (
              <p className="text-gray-700 text-center py-8">
                Complete your first grounding technique to see your progress
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {GROUNDING_TECHNIQUES[session.techniqueId as TechniqueKey]?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Completion</p>
                        <p className="font-medium">{Math.round(session.completionRate * 100)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{Math.round(session.duration / 60)}min</p>
                      </div>
                      {session.severityAfter && session.severityBefore && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Distress</p>
                          <p className="font-medium flex items-center gap-1">
                            {session.severityBefore} → {session.severityAfter}
                            {session.severityAfter < session.severityBefore && (
                              <Award className="w-4 h-4 text-green-500" />
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