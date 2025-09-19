'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Zap,
  Wind,
  Anchor,
  Heart,
  Snowflake,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  Shield,
  Target,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CrisisTechnique {
  id: string
  name: string
  description: string
  category: 'immediate' | 'distraction' | 'soothing' | 'grounding'
  urgency: 'critical' | 'high' | 'moderate'
  duration: number // seconds
  steps: Array<{
    instruction: string
    duration?: number
    audio?: string
    visual?: string
  }>
  icon: React.ComponentType<{ className?: string }>
  color: string
  backgroundColor: string
  textColor: string
  effectiveness: number // 1-10 rating from research
  contraindications?: string[]
}

interface CrisisAssessment {
  severity: number // 1-10
  symptoms: string[]
  previousTechniques: string[]
  timeConstraint: 'immediate' | 'short' | 'extended'
  environment: 'private' | 'public' | 'workplace' | 'home'
}

const CRISIS_TECHNIQUES: CrisisTechnique[] = [
  {
    id: 'tipp-emergency',
    name: 'TIPP Emergency Protocol',
    description: 'Rapid neurological reset for intense emotional overwhelm',
    category: 'immediate',
    urgency: 'critical',
    duration: 180, // 3 minutes
    steps: [
      { 
        instruction: 'Hold ice cubes or run very cold water over hands and wrists for 30 seconds',
        duration: 30,
        visual: 'ice-visual'
      },
      { 
        instruction: 'Do 30 jumping jacks or run in place as fast as you can',
        duration: 30,
        visual: 'exercise-visual'
      },
      { 
        instruction: 'Breathe out longer than in: 4 counts in, 8 counts out. Repeat 10 times',
        duration: 120,
        audio: 'breath-guide',
        visual: 'breath-visual'
      }
    ],
    icon: Zap,
    color: 'from-red-500 to-orange-500',
    backgroundColor: 'bg-red-50',
    textColor: 'text-red-700',
    effectiveness: 9,
    contraindications: ['Heart conditions', 'Pregnancy (be gentle with cold)']
  },
  {
    id: 'butterfly-hug',
    name: 'Butterfly Hug',
    description: 'Self-soothing technique that activates bilateral stimulation',
    category: 'soothing',
    urgency: 'high',
    duration: 120,
    steps: [
      { 
        instruction: 'Cross your arms over your chest, hands on opposite shoulders',
        duration: 10,
        visual: 'butterfly-position'
      },
      { 
        instruction: 'Gently pat alternating hands on your shoulders, like butterfly wings',
        duration: 60,
        visual: 'butterfly-movement'
      },
      { 
        instruction: 'Breathe slowly and think: "I am safe, I am strong, this will pass"',
        duration: 50,
        audio: 'affirmation-guide'
      }
    ],
    icon: Heart,
    color: 'from-pink-500 to-purple-500',
    backgroundColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    effectiveness: 8
  },
  {
    id: 'box-breathing-crisis',
    name: 'Crisis Box Breathing',
    description: 'Structured breathing to regain control of panic response',
    category: 'immediate',
    urgency: 'critical',
    duration: 240,
    steps: [
      { 
        instruction: 'Sit or stand with your back straight. Focus only on counting.',
        duration: 10
      },
      { 
        instruction: 'Inhale for 4 counts, hold for 4, exhale for 4, hold empty for 4',
        duration: 230,
        audio: 'box-breath-guide',
        visual: 'box-visual'
      }
    ],
    icon: Wind,
    color: 'from-blue-500 to-cyan-500',
    backgroundColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    effectiveness: 9
  },
  {
    id: '54321-rapid',
    name: 'Rapid 5-4-3-2-1 Grounding',
    description: 'Fast sensory grounding for dissociation and panic',
    category: 'grounding',
    urgency: 'critical',
    duration: 120,
    steps: [
      { 
        instruction: 'Name 5 things you can see right now - say them out loud',
        duration: 20
      },
      { 
        instruction: 'Name 4 things you can physically touch - touch them',
        duration: 25
      },
      { 
        instruction: 'Name 3 things you can hear in this moment',
        duration: 25
      },
      { 
        instruction: 'Name 2 things you can smell',
        duration: 25
      },
      { 
        instruction: 'Name 1 thing you can taste',
        duration: 25
      }
    ],
    icon: Anchor,
    color: 'from-green-500 to-teal-500',
    backgroundColor: 'bg-green-50',
    textColor: 'text-green-700',
    effectiveness: 9
  },
  {
    id: 'stop-technique',
    name: 'STOP Technique',
    description: 'Interrupt destructive thought spirals immediately',
    category: 'immediate',
    urgency: 'critical',
    duration: 60,
    steps: [
      { 
        instruction: 'STOP - Say "STOP" out loud or in your mind',
        duration: 5
      },
      { 
        instruction: 'TAKE A BREATH - One deep, slow breath',
        duration: 10
      },
      { 
        instruction: 'OBSERVE - What do you notice in your body and mind right now?',
        duration: 20
      },
      { 
        instruction: 'PROCEED - Choose your next action mindfully',
        duration: 25
      }
    ],
    icon: Shield,
    color: 'from-yellow-500 to-orange-500',
    backgroundColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    effectiveness: 8
  },
  {
    id: 'progressive-muscle-rapid',
    name: 'Rapid Muscle Release',
    description: 'Quick tension release for physical anxiety symptoms',
    category: 'soothing',
    urgency: 'high',
    duration: 180,
    steps: [
      { 
        instruction: 'Tense face muscles for 5 seconds, then completely relax',
        duration: 10
      },
      { 
        instruction: 'Tense shoulders and arms for 5 seconds, then release',
        duration: 15
      },
      { 
        instruction: 'Tense chest and stomach for 5 seconds, then let go',
        duration: 15
      },
      { 
        instruction: 'Tense legs and feet for 5 seconds, then completely relax',
        duration: 15
      },
      { 
        instruction: 'Scan your whole body - notice the difference between tension and relaxation',
        duration: 125
      }
    ],
    icon: Activity,
    color: 'from-indigo-500 to-purple-500',
    backgroundColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    effectiveness: 7
  }
]

const CRISIS_RESOURCES = {
  immediate: [
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
    { name: 'National Suicide Prevention Lifeline', contact: '988', available: '24/7' },
    { name: 'Emergency Services', contact: '911', available: '24/7' }
  ],
  support: [
    { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', available: '24/7' },
    { name: 'Crisis Chat', contact: 'suicidepreventionlifeline.org/chat', available: '24/7' }
  ]
}

export default function CrisisRapidRelief() {
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [assessment, setAssessment] = useState<CrisisAssessment>({
    severity: 5,
    symptoms: [],
    previousTechniques: [],
    timeConstraint: 'immediate',
    environment: 'private'
  })
  const [selectedTechnique, setSelectedTechnique] = useState<CrisisTechnique | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completedTechniques, setCompletedTechniques] = useState<string[]>([])
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContext = useRef<AudioContext | null>(null)

  // Initialize audio context
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

  // Timer management
  useEffect(() => {
    if (!isActive || !selectedTechnique) return

    const currentStepData = selectedTechnique.steps[currentStep]
    const stepDuration = currentStepData?.duration || 10

    if (timeRemaining <= 0) {
      setTimeRemaining(stepDuration)
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next step or complete
          if (currentStep < selectedTechnique.steps.length - 1) {
            setCurrentStep(currentStep + 1)
            return selectedTechnique.steps[currentStep + 1]?.duration || 10
          } else {
            completeTechnique()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, currentStep, selectedTechnique, timeRemaining])

  // Get recommended techniques based on assessment
  const getRecommendedTechniques = (): CrisisTechnique[] => {
    if (!assessmentComplete) return CRISIS_TECHNIQUES.slice(0, 3)

    let recommended = [...CRISIS_TECHNIQUES]

    // Filter by urgency
    if (assessment.severity >= 8) {
      recommended = recommended.filter(t => t.urgency === 'critical')
    }

    // Filter by time constraint
    if (assessment.timeConstraint === 'immediate') {
      recommended = recommended.filter(t => t.duration <= 180)
    }

    // Filter by environment
    if (assessment.environment === 'public') {
      recommended = recommended.filter(t => !t.id.includes('exercise') && !t.id.includes('loud'))
    }

    // Sort by effectiveness
    recommended.sort((a, b) => b.effectiveness - a.effectiveness)

    return recommended.slice(0, 4)
  }

  const startTechnique = (technique: CrisisTechnique) => {
    setSelectedTechnique(technique)
    setCurrentStep(0)
    setTimeRemaining(technique.steps[0]?.duration || 10)
    setIsActive(true)
  }

  const pauseTechnique = () => {
    setIsActive(false)
  }

  const resumeTechnique = () => {
    setIsActive(true)
  }

  const stopTechnique = () => {
    setIsActive(false)
    setSelectedTechnique(null)
    setCurrentStep(0)
    setTimeRemaining(0)
  }

  const completeTechnique = () => {
    if (selectedTechnique) {
      setCompletedTechniques(prev => [...prev, selectedTechnique.id])
      
      // Save completion to backend
      fetch('/api/self-help/crisis/technique-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: selectedTechnique.id,
          severity: assessment.severity,
          completed: true,
          timestamp: new Date()
        })
      }).catch(console.error)
    }
    
    setIsActive(false)
    setSelectedTechnique(null)
    setCurrentStep(0)
    setTimeRemaining(0)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Emergency assessment
  if (!assessmentComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-red-900">Crisis Support Toolkit</h1>
              <p className="text-red-700">Immediate relief techniques for emotional emergencies</p>
            </div>
          </div>
          
          <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium mb-2">⚠️ If you are in immediate danger or having thoughts of self-harm:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.location.href = 'tel:988'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call 988
              </button>
              <button
                onClick={() => window.location.href = 'sms:741741&body=HOME'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Text HOME to 741741
              </button>
              <button
                onClick={() => setShowEmergencyContacts(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                More Resources
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Assessment</h2>
          <p className="text-gray-600 mb-6">Help us recommend the most effective techniques for your current situation</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current distress level (1 = calm, 10 = crisis)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={assessment.severity}
                  onChange={(e) => setAssessment(prev => ({ ...prev, severity: Number(e.target.value) }))}
                  className="flex-1 h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-bold text-gray-900 w-8">{assessment.severity}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">How much time do you have?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'immediate', label: 'Need help now', time: '< 3 min' },
                  { id: 'short', label: 'A few minutes', time: '3-10 min' },
                  { id: 'extended', label: 'Can take time', time: '> 10 min' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAssessment(prev => ({ ...prev, timeConstraint: option.id as any }))}
                    className={cn(
                      "p-4 rounded-lg border-2 text-center transition-all",
                      assessment.timeConstraint === option.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-700">{option.time}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Where are you?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'private', label: 'Private space' },
                  { id: 'public', label: 'Public place' },
                  { id: 'workplace', label: 'Work/school' },
                  { id: 'home', label: 'At home' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAssessment(prev => ({ ...prev, environment: option.id as any }))}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center transition-all",
                      assessment.environment === option.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setAssessmentComplete(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Get My Personalized Toolkit
            </button>
          </div>
        </div>

        {/* Emergency Contacts Modal */}
        <AnimatePresence>
          {showEmergencyContacts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowEmergencyContacts(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Emergency Resources</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Immediate Crisis Support</h4>
                    {CRISIS_RESOURCES.immediate.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg mb-2">
                        <div>
                          <div className="font-medium text-red-900">{resource.name}</div>
                          <div className="text-sm text-red-700">{resource.available}</div>
                        </div>
                        <button
                          onClick={() => window.location.href = `tel:${resource.contact.replace(/\D/g, '')}`}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        >
                          {resource.contact}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Support</h4>
                    {CRISIS_RESOURCES.support.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2">
                        <div>
                          <div className="font-medium text-blue-900">{resource.name}</div>
                          <div className="text-sm text-blue-700">{resource.available}</div>
                        </div>
                        <div className="text-sm text-blue-800">{resource.contact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowEmergencyContacts(false)}
                  className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with severity indicator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crisis Relief Toolkit</h1>
              <p className="text-gray-600">Personalized techniques for your current situation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-4 py-2 rounded-lg flex items-center gap-2",
              assessment.severity >= 8 ? "bg-red-100 text-red-800" :
              assessment.severity >= 6 ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            )}>
              <AlertTriangle className="w-4 h-4" />
              Severity: {assessment.severity}/10
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

      {/* Active Technique Interface */}
      <AnimatePresence>
        {selectedTechnique && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <selectedTechnique.icon className="w-16 h-16 text-blue-600" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedTechnique.name}</h2>
                <p className="text-lg text-gray-600">{selectedTechnique.description}</p>
              </div>

              {/* Current Step */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-sm text-blue-600 mb-2">
                  Step {currentStep + 1} of {selectedTechnique.steps.length}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  {selectedTechnique.steps[currentStep]?.instruction}
                </h3>
                
                {/* Timer Circle */}
                <div className="relative w-32 h-32 mx-auto mb-6">
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
                      stroke="#3B82F6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={377}
                      strokeDashoffset={377 * (1 - timeRemaining / (selectedTechnique.steps[currentStep]?.duration || 10))}
                      strokeLinecap="round"
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isActive ? (
                  <button
                    onClick={resumeTechnique}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    {currentStep === 0 && timeRemaining === (selectedTechnique.steps[0]?.duration || 10) ? 'Start' : 'Resume'}
                  </button>
                ) : (
                  <button
                    onClick={pauseTechnique}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={stopTechnique}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Stop & Choose Different
                </button>
                
                <button
                  onClick={completeTechnique}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-center gap-2">
                {selectedTechnique.steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full",
                      index < currentStep ? "bg-green-500" :
                      index === currentStep ? "bg-blue-500" :
                      "bg-gray-300"
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended Techniques */}
      {!selectedTechnique && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
            {getRecommendedTechniques().map((technique) => {
              const completed = completedTechniques.includes(technique.id)
              return (
                <motion.div
                  key={technique.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "bg-gradient-to-r p-6 rounded-xl shadow-lg cursor-pointer transition-all",
                    technique.color,
                    completed && "opacity-75"
                  )}
                  onClick={() => startTechnique(technique)}
                >
                  <div className="flex items-start justify-between text-white">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <technique.icon className="w-6 h-6" />
                        <h3 className="text-lg font-semibold">{technique.name}</h3>
                        {completed && <CheckCircle className="w-5 h-5" />}
                      </div>
                      <p className="text-gray-900 mb-3">{technique.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-900">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.ceil(technique.duration / 60)} min
                        </span>
                        <span className="px-2 py-1 bg-white/20 rounded-full">
                          {technique.urgency} priority
                        </span>
                        <span className="flex items-center gap-1">
                          ⭐ {technique.effectiveness}/10
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-4" />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Need Different Help?</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setAssessmentComplete(false)}
                className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <h3 className="font-semibold text-blue-900">Retake Assessment</h3>
                <p className="text-sm text-blue-700">Get new recommendations based on current state</p>
              </button>
              
              <button
                onClick={() => setShowEmergencyContacts(true)}
                className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <h3 className="font-semibold text-red-900">Emergency Contacts</h3>
                <p className="text-sm text-red-700">Access crisis hotlines and immediate support</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/self-help'}
                className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <h3 className="font-semibold text-green-900">Other Self-Help Tools</h3>
                <p className="text-sm text-green-700">Browse breathing exercises, journaling, and more</p>
              </button>
            </div>

            {/* Completed Techniques Summary */}
            {completedTechniques.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Completed Today</h3>
                <div className="flex flex-wrap gap-2">
                  {completedTechniques.map((id) => {
                    const technique = CRISIS_TECHNIQUES.find(t => t.id === id)
                    return technique ? (
                      <span key={id} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {technique.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}