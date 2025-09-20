'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  X,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Download,
  ExternalLink,
  User,
  Database,
  Lock,
  Trash2,
  Settings,
  HelpCircle,
  Info,
  Globe,
  Phone,
  Heart,
  Brain,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConsentWorkflowProps {
  onConsent: (consentData: ConsentData) => void
  onDecline: () => void
  therapistName?: string
  crisisLevel?: 'none' | 'low' | 'moderate' | 'high' | 'critical'
  className?: string
}

interface ConsentData {
  basicConsent: boolean
  dataProcessing: boolean
  researchParticipation: boolean
  performanceImprovement: boolean
  thirdPartySharing: boolean
  crisisDataSharing: boolean
  consentTimestamp: string
  readingTime: number
  consentVersion: string
  withdrawalAcknowledged: boolean
}

interface ConsentStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  required: boolean
  content: React.ReactNode
  minimumReadTime: number
}

export default function ConsentWorkflow({
  onConsent,
  onDecline,
  therapistName = 'AI Therapist',
  crisisLevel = 'none',
  className
}: ConsentWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [consentData, setConsentData] = useState<ConsentData>({
    basicConsent: false,
    dataProcessing: false,
    researchParticipation: false,
    performanceImprovement: true, // Default to true for service improvement
    thirdPartySharing: false,
    crisisDataSharing: false,
    consentTimestamp: '',
    readingTime: 0,
    consentVersion: '2025.1.0',
    withdrawalAcknowledged: false
  })
  const [stepReadingTimes, setStepReadingTimes] = useState<Record<string, number>>({})
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({})
  const [quizPassed, setQuizPassed] = useState(false)
  const stepStartTimeRef = useRef<number>(Date.now())

  const consentSteps: ConsentStep[] = [
    {
      id: 'introduction',
      title: 'Informed Consent Introduction',
      description: 'Understanding your rights and our responsibilities',
      icon: Shield,
      required: true,
      minimumReadTime: 30000, // 30 seconds
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Your Rights and Our Commitment</h3>
                <p className="text-blue-800 text-sm">
                  Before you begin therapy with <strong>{therapistName}</strong>, it's important that you understand 
                  your rights, how we protect your privacy, and what data we collect. This informed consent process 
                  ensures you have full control over your mental health journey.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">What You'll Learn:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Database className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Data Collection</h5>
                  <p className="text-sm text-gray-600">What information we collect and why</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Privacy Protection</h5>
                  <p className="text-sm text-gray-600">How we keep your data secure</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Eye className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Data Usage</h5>
                  <p className="text-sm text-gray-600">How your data helps improve our services</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-gray-800">Your Control</h5>
                  <p className="text-sm text-gray-600">How to manage your preferences</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Take Your Time</h4>
                <p className="text-amber-700 text-sm">
                  Please read each section carefully. We track reading time to ensure you have adequate time 
                  to understand each section before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'basic-consent',
      title: 'Basic AI Therapy Consent',
      description: 'Agreeing to AI therapy sessions and basic data collection',
      icon: Brain,
      required: true,
      minimumReadTime: 45000, // 45 seconds
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">AI Therapy Session Consent</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>I understand and consent to:</strong>
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Engaging in therapy sessions with {therapistName}, an AI system</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Collection of my conversation data for session continuity</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Mood tracking and basic mental health assessments</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Storage of session summaries for my personal progress tracking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Important Limitations</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• AI therapy cannot replace human professional care</li>
                  <li>• Sessions are not confidential in the same way as human therapy</li>
                  <li>• Crisis situations may require immediate human intervention</li>
                  <li>• AI responses may not always be appropriate or accurate</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="basic-consent"
              checked={consentData.basicConsent}
              onChange={(e) => setConsentData(prev => ({ ...prev, basicConsent: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="basic-consent" className="text-sm font-medium text-gray-900">
              I consent to AI therapy sessions and basic data collection as described above
            </label>
          </div>
        </div>
      )
    },

    {
      id: 'data-processing',
      title: 'Data Processing Consent',
      description: 'How we process and protect your personal information',
      icon: Database,
      required: true,
      minimumReadTime: 60000, // 60 seconds
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3">Data Processing Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-purple-800 mb-2">What Data We Collect:</h4>
                <ul className="space-y-1 text-sm text-purple-700 ml-4">
                  <li>• Conversation transcripts and session notes</li>
                  <li>• Mood ratings and mental health assessments</li>
                  <li>• Usage patterns and interaction timestamps</li>
                  <li>• Device information and IP address (for security)</li>
                  <li>• Crisis detection alerts and safety assessments</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-purple-800 mb-2">How We Protect Your Data:</h4>
                <ul className="space-y-1 text-sm text-purple-700 ml-4">
                  <li>• End-to-end encryption for all communications</li>
                  <li>• HIPAA-compliant data storage and handling</li>
                  <li>• Regular security audits and monitoring</li>
                  <li>• Access limited to authorized personnel only</li>
                  <li>• Automatic data retention limits (3 years maximum)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-purple-800 mb-2">Your Data Rights:</h4>
                <ul className="space-y-1 text-sm text-purple-700 ml-4">
                  <li>• Request a copy of your data at any time</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete your account and data</li>
                  <li>• Opt out of certain data uses</li>
                  <li>• File complaints with data protection authorities</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="data-processing"
              checked={consentData.dataProcessing}
              onChange={(e) => setConsentData(prev => ({ ...prev, dataProcessing: e.target.checked }))}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="data-processing" className="text-sm font-medium text-gray-900">
              I consent to the data processing practices described above
            </label>
          </div>
        </div>
      )
    },

    {
      id: 'optional-consents',
      title: 'Optional Data Uses',
      description: 'Choose how your data helps improve our services',
      icon: Settings,
      required: false,
      minimumReadTime: 45000, // 45 seconds
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Optional Consent Options</h3>
            <p className="text-sm text-green-800 mb-4">
              These are optional ways your anonymized data can help improve mental health AI for everyone. 
              You can change these preferences at any time in your settings.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-white border border-green-200 rounded">
                <input
                  type="checkbox"
                  id="research-participation"
                  checked={consentData.researchParticipation}
                  onChange={(e) => setConsentData(prev => ({ ...prev, researchParticipation: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="research-participation" className="text-sm font-medium text-gray-900 block mb-1">
                    Research Participation
                  </label>
                  <p className="text-xs text-gray-600">
                    Allow anonymized data to be used in mental health research studies. 
                    All personal identifiers are removed, and data is aggregated with other users.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-white border border-green-200 rounded">
                <input
                  type="checkbox"
                  id="performance-improvement"
                  checked={consentData.performanceImprovement}
                  onChange={(e) => setConsentData(prev => ({ ...prev, performanceImprovement: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="performance-improvement" className="text-sm font-medium text-gray-900 block mb-1">
                    AI Performance Improvement <span className="text-green-600">(Recommended)</span>
                  </label>
                  <p className="text-xs text-gray-600">
                    Help improve AI responses and therapeutic techniques through anonymized conversation analysis. 
                    This helps us provide better support for all users.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-white border border-red-200 rounded">
                <input
                  type="checkbox"
                  id="third-party-sharing"
                  checked={consentData.thirdPartySharing}
                  onChange={(e) => setConsentData(prev => ({ ...prev, thirdPartySharing: e.target.checked }))}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="third-party-sharing" className="text-sm font-medium text-gray-900 block mb-1">
                    Third-Party Research Sharing <span className="text-red-600">(Not Recommended)</span>
                  </label>
                  <p className="text-xs text-gray-600">
                    Allow sharing of anonymized data with approved research institutions. 
                    Data remains anonymized and is used solely for mental health research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      id: 'crisis-consent',
      title: 'Crisis Intervention Consent',
      description: 'Emergency data sharing for your safety',
      icon: Heart,
      required: true,
      minimumReadTime: 30000, // 30 seconds
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-3">Crisis Safety Protocols</h3>
                <p className="text-sm text-red-800 mb-4">
                  Your safety is our top priority. In crisis situations, we may need to share limited information 
                  with emergency services or crisis hotlines to ensure you receive appropriate help.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">When Crisis Data Sharing May Occur:</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• AI detects immediate suicide risk or self-harm intentions</li>
                <li>• User directly requests emergency assistance</li>
                <li>• Severe mental health crisis requiring immediate intervention</li>
                <li>• Legal obligation to report imminent danger</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">What Information May Be Shared:</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• Current crisis level and risk assessment</li>
                <li>• Contact information for emergency response</li>
                <li>• Recent conversation context related to crisis</li>
                <li>• Location data (if available and necessary)</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Crisis Resources Always Available:</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• 988 Suicide & Crisis Lifeline: 988</p>
                <p>• Crisis Text Line: Text HOME to 741741</p>
                <p>• Emergency Services: 911</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="crisis-data-sharing"
              checked={consentData.crisisDataSharing}
              onChange={(e) => setConsentData(prev => ({ ...prev, crisisDataSharing: e.target.checked }))}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="crisis-data-sharing" className="text-sm font-medium text-gray-900">
              I consent to limited data sharing in crisis situations for my safety
            </label>
          </div>
        </div>
      )
    },

    {
      id: 'withdrawal-rights',
      title: 'Withdrawal Rights',
      description: 'How to withdraw consent and manage your data',
      icon: Trash2,
      required: true,
      minimumReadTime: 30000, // 30 seconds
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Your Right to Withdraw</h3>
            <p className="text-sm text-gray-700 mb-4">
              You can withdraw your consent and stop using our services at any time. 
              Here's what happens when you exercise your withdrawal rights:
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Immediate Effects:</h4>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• AI therapy sessions will stop immediately</li>
                  <li>• No new data will be collected</li>
                  <li>• Account access will be suspended</li>
                  <li>• Automated data processing will cease</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Data Handling After Withdrawal:</h4>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• Personal data deleted within 30 days</li>
                  <li>• Anonymized research data may be retained</li>
                  <li>• Legal compliance data kept as required by law</li>
                  <li>• Crisis intervention records retained for safety</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">How to Withdraw:</h4>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• Use the "Delete Account" option in your settings</li>
                  <li>• Contact our support team at support@astralcore.com</li>
                  <li>• Send a written request to our data protection officer</li>
                  <li>• Call our privacy hotline: 1-800-PRIVACY</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="withdrawal-acknowledged"
              checked={consentData.withdrawalAcknowledged}
              onChange={(e) => setConsentData(prev => ({ ...prev, withdrawalAcknowledged: e.target.checked }))}
              className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
            />
            <label htmlFor="withdrawal-acknowledged" className="text-sm font-medium text-gray-900">
              I understand my right to withdraw consent and how to exercise it
            </label>
          </div>
        </div>
      )
    }
  ]

  // Update reading time for current step
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now()
      const readingTime = currentTime - stepStartTimeRef.current
      
      setStepReadingTimes(prev => ({
        ...prev,
        [consentSteps[currentStep].id]: readingTime
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentStep])

  // Reset reading time when step changes
  useEffect(() => {
    stepStartTimeRef.current = Date.now()
  }, [currentStep])

  const currentStepData = consentSteps[currentStep]
  const currentReadingTime = stepReadingTimes[currentStepData.id] || 0
  const hasReadEnough = currentReadingTime >= currentStepData.minimumReadTime

  const canProceedFromStep = () => {
    const step = consentSteps[currentStep]
    
    if (!hasReadEnough) return false
    
    switch (step.id) {
      case 'basic-consent':
        return consentData.basicConsent
      case 'data-processing':
        return consentData.dataProcessing
      case 'crisis-consent':
        return consentData.crisisDataSharing
      case 'withdrawal-rights':
        return consentData.withdrawalAcknowledged
      default:
        return true
    }
  }

  const isLastStep = currentStep === consentSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      // Show final quiz before completing
      setShowQuiz(true)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    const finalConsentData: ConsentData = {
      ...consentData,
      consentTimestamp: new Date().toISOString(),
      readingTime: Object.values(stepReadingTimes).reduce((sum, time) => sum + time, 0)
    }
    
    onConsent(finalConsentData)
  }

  const quizQuestions = [
    {
      id: 'ai-nature',
      question: 'What type of system will you be interacting with?',
      correct: 'An artificial intelligence system, not a human therapist'
    },
    {
      id: 'data-control',
      question: 'Can you delete your data at any time?',
      correct: 'Yes, I can request data deletion within 30 days'
    },
    {
      id: 'crisis-sharing',
      question: 'When might your data be shared in crisis situations?',
      correct: 'When there is immediate risk of suicide or self-harm'
    }
  ]

  const IconComponent = currentStepData.icon

  return (
    <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", className)}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3 mb-4">
            <IconComponent className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Informed Consent Process</h2>
              <p className="text-indigo-100">
                {currentStepData.title}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-indigo-100">
              <span>Step {currentStep + 1} of {consentSteps.length}</span>
              <span>
                Reading time: {Math.floor(currentReadingTime / 1000)}s 
                {!hasReadEnough && ` (min ${Math.floor(currentStepData.minimumReadTime / 1000)}s)`}
              </span>
            </div>
            <div className="w-full bg-indigo-500/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / consentSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!showQuiz ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <p className="text-gray-600">{currentStepData.description}</p>
                </div>
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Final Comprehension Check</h3>
              <p className="text-gray-600">
                Please answer these questions to confirm your understanding:
              </p>
              
              {quizQuestions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <p className="font-medium text-gray-800">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={question.id}
                        checked={quizAnswers[question.id] === true}
                        onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: true }))}
                        className="text-green-600"
                      />
                      <span>{question.correct}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={question.id}
                        checked={quizAnswers[question.id] === false}
                        onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: false }))}
                        className="text-red-600"
                      />
                      <span>No, this is incorrect</span>
                    </label>
                  </div>
                </div>
              ))}

              {Object.keys(quizAnswers).length === quizQuestions.length && 
               Object.values(quizAnswers).every(answer => answer === true) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Excellent! You've demonstrated understanding of the consent process.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && !showQuiz && (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!hasReadEnough && !showQuiz && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Please read for {Math.ceil((currentStepData.minimumReadTime - currentReadingTime) / 1000)}s more</span>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={onDecline}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Decline
                </button>
                
                {showQuiz ? (
                  <button
                    onClick={handleComplete}
                    disabled={!Object.values(quizAnswers).every(answer => answer === true)}
                    className={cn(
                      "px-6 py-2 rounded-lg transition-colors font-medium",
                      Object.values(quizAnswers).every(answer => answer === true)
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    Complete Consent Process
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceedFromStep()}
                    className={cn(
                      "flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors font-medium",
                      canProceedFromStep()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <span>{isLastStep ? "Review & Continue" : "Next"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}