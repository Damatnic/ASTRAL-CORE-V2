'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Heart,
  Wind,
  Anchor,
  Shield,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Activity,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CrisisAlert {
  id: string
  severity: number // 1-10 scale
  trigger: 'mood_pattern' | 'journal_content' | 'self_assessment' | 'breathing_session' | 'grounding_session'
  timestamp: Date
  context: {
    mood?: number
    emotions?: string[]
    triggers?: string[]
    content?: string
    improvement?: number
  }
  resolved: boolean
  interventionsUsed: string[]
}

interface InterventionStep {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  estimatedTime: number // minutes
  effectiveness: 'immediate' | 'short-term' | 'long-term'
  required: boolean
  completed: boolean
}

const CRISIS_INTERVENTIONS = {
  immediate: [
    {
      id: 'grounding-5421',
      name: '5-4-3-2-1 Grounding',
      description: 'Engage your senses to return to the present moment',
      icon: Anchor,
      estimatedTime: 3,
      effectiveness: 'immediate' as const,
      required: true,
      completed: false
    },
    {
      id: 'breathing-478',
      name: '4-7-8 Breathing',
      description: 'Calm your nervous system with controlled breathing',
      icon: Wind,
      estimatedTime: 5,
      effectiveness: 'immediate' as const,
      required: true,
      completed: false
    }
  ],
  support: [
    {
      id: 'crisis-chat',
      name: 'Crisis Chat',
      description: 'Connect with a trained volunteer immediately',
      icon: MessageCircle,
      estimatedTime: 15,
      effectiveness: 'short-term' as const,
      required: false,
      completed: false
    },
    {
      id: 'crisis-hotline',
      name: '988 Suicide & Crisis Lifeline',
      description: 'Call for immediate professional support',
      icon: Phone,
      estimatedTime: 20,
      effectiveness: 'short-term' as const,
      required: false,
      completed: false
    }
  ],
  followUp: [
    {
      id: 'mood-check',
      name: 'Follow-up Mood Check',
      description: 'Track how you\'re feeling after interventions',
      icon: Heart,
      estimatedTime: 2,
      effectiveness: 'long-term' as const,
      required: true,
      completed: false
    },
    {
      id: 'safety-plan',
      name: 'Review Safety Plan',
      description: 'Update your personalized safety plan',
      icon: Shield,
      estimatedTime: 10,
      effectiveness: 'long-term' as const,
      required: false,
      completed: false
    }
  ]
}

export default function CrisisIntegration() {
  const [activeAlert, setActiveAlert] = useState<CrisisAlert | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [interventionSteps, setInterventionSteps] = useState<InterventionStep[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [moodBefore, setMoodBefore] = useState<number | null>(null)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const [showMoodCheck, setShowMoodCheck] = useState(false)

  // Listen for crisis events from other self-help tools
  useEffect(() => {
    const handleCrisisEvent = (event: CustomEvent) => {
      const { trigger, severity, context } = event.detail
      
      const alert: CrisisAlert = {
        id: `crisis-${Date.now()}`,
        severity,
        trigger,
        timestamp: new Date(),
        context,
        resolved: false,
        interventionsUsed: []
      }
      
      initiateCrisisIntervention(alert)
    }

    window.addEventListener('crisis-detected', handleCrisisEvent as EventListener)
    
    return () => {
      window.removeEventListener('crisis-detected', handleCrisisEvent as EventListener)
    }
  }, [])

  // Initialize crisis intervention protocol
  const initiateCrisisIntervention = (alert: CrisisAlert) => {
    setActiveAlert(alert)
    setSessionStartTime(new Date())
    setCurrentStep(0)
    
    // Build intervention plan based on severity and trigger
    const steps = buildInterventionPlan(alert)
    setInterventionSteps(steps)
    
    // Request initial mood rating
    setShowMoodCheck(true)
    
    // Log crisis event
    logCrisisEvent(alert)
  }

  // Build personalized intervention plan
  const buildInterventionPlan = (alert: CrisisAlert): InterventionStep[] => {
    const plan: InterventionStep[] = []
    
    // Always start with immediate interventions for high severity
    if (alert.severity >= 7) {
      plan.push(...CRISIS_INTERVENTIONS.immediate)
    }
    
    // Add support options based on severity and trigger
    if (alert.severity >= 8 || alert.trigger === 'journal_content') {
      plan.push(...CRISIS_INTERVENTIONS.support)
    } else if (alert.severity >= 6) {
      // Add crisis chat as option for moderate severity
      plan.push(CRISIS_INTERVENTIONS.support[0])
    }
    
    // Always include follow-up steps
    plan.push(...CRISIS_INTERVENTIONS.followUp)
    
    return plan.map(step => ({ ...step, completed: false }))
  }

  // Complete current intervention step
  const completeStep = async (stepId: string) => {
    setInterventionSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    )
    
    // Record intervention usage
    if (activeAlert) {
      const updatedAlert = {
        ...activeAlert,
        interventionsUsed: [...activeAlert.interventionsUsed, stepId]
      }
      setActiveAlert(updatedAlert)
      
      // Log intervention completion
      await logInterventionCompletion(stepId, updatedAlert)
    }
    
    // Move to next step
    const nextIncompleteStep = interventionSteps.findIndex(step => 
      !step.completed && step.id !== stepId
    )
    
    if (nextIncompleteStep !== -1) {
      setCurrentStep(nextIncompleteStep)
    } else {
      // All steps completed, show final mood check
      setShowMoodCheck(true)
    }
  }

  // Handle crisis hotline call
  const callCrisisHotline = () => {
    // In a real implementation, this would:
    // 1. Log the call attempt
    // 2. Provide local crisis resources
    // 3. Connect to appropriate services
    
    window.open('tel:988', '_self')
    completeStep('crisis-hotline')
  }

  // Handle crisis chat connection
  const startCrisisChat = () => {
    // Connect to existing crisis chat system
    window.location.href = '/crisis-chat'
    completeStep('crisis-chat')
  }

  // Handle grounding technique
  const startGroundingTechnique = () => {
    // Navigate to grounding with crisis context
    window.location.href = '/self-help?tool=grounding&crisis=true'
    completeStep('grounding-5421')
  }

  // Handle breathing exercise
  const startBreathingExercise = () => {
    // Navigate to breathing with crisis context
    window.location.href = '/self-help?tool=breathing&crisis=true'
    completeStep('breathing-478')
  }

  // Complete mood check
  const completeMoodCheck = async (mood: number) => {
    if (moodBefore === null) {
      setMoodBefore(mood)
      setShowMoodCheck(false)
    } else {
      setMoodAfter(mood)
      
      // Calculate improvement
      const improvement = mood - moodBefore
      
      // Complete crisis session
      await completeCrisisSession(improvement)
    }
  }

  // Complete crisis intervention session
  const completeCrisisSession = async (improvement: number) => {
    if (!activeAlert || !sessionStartTime) return
    
    const sessionData = {
      alertId: activeAlert.id,
      duration: Date.now() - sessionStartTime.getTime(),
      interventionsUsed: activeAlert.interventionsUsed,
      moodBefore,
      moodAfter,
      improvement,
      resolved: improvement >= 0 // Consider resolved if mood improved or stayed same
    }
    
    try {
      // Save crisis session
      await fetch('/api/crisis-intervention/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
      
      // Update alert as resolved
      setActiveAlert(prev => prev ? { ...prev, resolved: true } : null)
      
      // Schedule follow-up if needed
      if (improvement < 2) {
        scheduleFollowUp()
      }
      
      // Clear crisis state after delay
      setTimeout(() => {
        setActiveAlert(null)
        setInterventionSteps([])
        setCurrentStep(0)
        setMoodBefore(null)
        setMoodAfter(null)
        setShowMoodCheck(false)
      }, 5000)
      
    } catch (error) {
      console.error('Error completing crisis session:', error)
    }
  }

  // Log crisis event
  const logCrisisEvent = async (alert: CrisisAlert) => {
    try {
      await fetch('/api/crisis-intervention/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      })
    } catch (error) {
      console.error('Error logging crisis event:', error)
    }
  }

  // Log intervention completion
  const logInterventionCompletion = async (stepId: string, alert: CrisisAlert) => {
    try {
      await fetch('/api/crisis-intervention/intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: alert.id,
          interventionId: stepId,
          timestamp: new Date(),
          context: alert.context
        })
      })
    } catch (error) {
      console.error('Error logging intervention:', error)
    }
  }

  // Schedule follow-up check
  const scheduleFollowUp = () => {
    // In a real implementation, this would:
    // 1. Schedule notifications for follow-up
    // 2. Create reminders for self-care
    // 3. Suggest professional support
    console.log('Follow-up scheduled')
  }

  // Render current step
  const renderCurrentStep = () => {
    if (interventionSteps.length === 0) return null
    
    const step = interventionSteps[currentStep]
    if (!step) return null
    
    const IconComponent = step.icon
    
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <IconComponent className="w-16 h-16 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{step.name}</h3>
          <p className="text-gray-600 mb-4">{step.description}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700 mb-4">
            <Clock className="w-4 h-4" />
            <span>~{step.estimatedTime} minutes</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {step.id === 'grounding-5421' && (
            <button
              onClick={startGroundingTechnique}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Start Grounding Exercise
            </button>
          )}
          
          {step.id === 'breathing-478' && (
            <button
              onClick={startBreathingExercise}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Breathing Exercise
            </button>
          )}
          
          {step.id === 'crisis-chat' && (
            <button
              onClick={startCrisisChat}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Connect to Crisis Support
            </button>
          )}
          
          {step.id === 'crisis-hotline' && (
            <button
              onClick={callCrisisHotline}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Call 988 Crisis Lifeline
            </button>
          )}
          
          {step.id === 'mood-check' && (
            <button
              onClick={() => setShowMoodCheck(true)}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Check Your Mood
            </button>
          )}
          
          {step.id === 'safety-plan' && (
            <button
              onClick={() => {
                window.location.href = '/safety-plan'
                completeStep('safety-plan')
              }}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Review Safety Plan
            </button>
          )}
          
          {!step.required && (
            <button
              onClick={() => completeStep(step.id)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Skip This Step
            </button>
          )}
        </div>
      </div>
    )
  }

  // Don't render if no active crisis
  if (!activeAlert) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Crisis Support</h2>
                  <p className="text-sm text-gray-600">
                    We detected you might need immediate support
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {interventionSteps.length}
              </span>
              <span className="text-sm text-gray-700">
                {interventionSteps.filter(s => s.completed).length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentStep + 1) / interventionSteps.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {showMoodCheck ? (
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 text-purple-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    How are you feeling right now?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {moodBefore === null 
                      ? 'This helps us understand your current state'
                      : 'Let\'s see how the interventions helped'
                    }
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Very Low</span>
                    <span>Very High</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => completeMoodCheck(i + 1)}
                        className={cn(
                          "aspect-square rounded-lg border-2 transition-all font-bold",
                          "hover:border-blue-500 hover:bg-blue-50",
                          "border-gray-300 text-gray-700"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeAlert.resolved ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Crisis Support Complete
                  </h3>
                  <p className="text-gray-600">
                    {moodAfter && moodBefore && moodAfter > moodBefore
                      ? `Great job! Your mood improved from ${moodBefore} to ${moodAfter}.`
                      : 'Remember that seeking help is a sign of strength.'
                    }
                  </p>
                  {moodAfter && moodBefore && moodAfter <= moodBefore && (
                    <p className="text-orange-600 mt-2">
                      Consider reaching out to a mental health professional for ongoing support.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </div>

          {/* Emergency Actions */}
          {!activeAlert.resolved && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  If you're in immediate danger:
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => window.open('tel:911', '_self')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Call 911
                  </button>
                  <button
                    onClick={() => window.open('tel:988', '_self')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Call 988
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}