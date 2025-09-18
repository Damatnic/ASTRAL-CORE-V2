'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Shield,
  Heart,
  Phone,
  MapPin,
  Clock,
  Brain,
  Activity,
  Zap,
  Eye,
  Lock,
  Users,
  MessageCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CrisisEncryption, SecureStorage } from '@/lib/crypto'

interface CrisisIndicator {
  type: 'behavioral' | 'verbal' | 'emotional' | 'environmental'
  severity: 1 | 2 | 3 | 4 | 5 // 1=low, 5=immediate danger
  indicator: string
  detected: boolean
  timestamp?: Date
}

interface CrisisAssessment {
  id: string
  userId: string
  timestamp: Date
  indicators: CrisisIndicator[]
  riskLevel: 'low' | 'moderate' | 'high' | 'severe' | 'imminent'
  interventionTaken: string[]
  followUpRequired: boolean
  professionalNotified: boolean
  encrypted: boolean
}

interface CrisisDetectionEngineProps {
  userId: string
  onCrisisDetected: (assessment: CrisisAssessment) => void
  onInterventionRequired: (type: 'immediate' | 'urgent' | 'followup') => void
}

export default function CrisisDetectionEngine({
  userId,
  onCrisisDetected,
  onInterventionRequired
}: CrisisDetectionEngineProps) {
  const [currentAssessment, setCurrentAssessment] = useState<CrisisAssessment | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [sessionData, setSessionData] = useState<any>({})
  const [userKey, setUserKey] = useState<CryptoKey | null>(null)

  // Crisis indicators database
  const crisisIndicators: CrisisIndicator[] = [
    // Behavioral indicators
    { type: 'behavioral', severity: 5, indicator: 'Direct suicide threat or plan', detected: false },
    { type: 'behavioral', severity: 4, indicator: 'Giving away possessions', detected: false },
    { type: 'behavioral', severity: 4, indicator: 'Sudden calmness after period of distress', detected: false },
    { type: 'behavioral', severity: 3, indicator: 'Increased substance use', detected: false },
    { type: 'behavioral', severity: 3, indicator: 'Reckless or risky behavior', detected: false },
    { type: 'behavioral', severity: 3, indicator: 'Withdrawal from social connections', detected: false },
    { type: 'behavioral', severity: 2, indicator: 'Sleep disturbances', detected: false },
    { type: 'behavioral', severity: 2, indicator: 'Changes in appetite', detected: false },

    // Verbal indicators
    { type: 'verbal', severity: 5, indicator: 'Talking about wanting to die or kill themselves', detected: false },
    { type: 'verbal', severity: 4, indicator: 'Expressing feeling trapped or in unbearable pain', detected: false },
    { type: 'verbal', severity: 4, indicator: 'Talking about being a burden to others', detected: false },
    { type: 'verbal', severity: 3, indicator: 'Feeling hopeless or having no reason to live', detected: false },
    { type: 'verbal', severity: 3, indicator: 'Expressing feeling empty or meaningless', detected: false },
    { type: 'verbal', severity: 2, indicator: 'Talking about feeling overwhelmed', detected: false },

    // Emotional indicators
    { type: 'emotional', severity: 4, indicator: 'Severe depression or mood swings', detected: false },
    { type: 'emotional', severity: 4, indicator: 'Intense anxiety or panic attacks', detected: false },
    { type: 'emotional', severity: 3, indicator: 'Rage or uncontrolled anger', detected: false },
    { type: 'emotional', severity: 3, indicator: 'Feelings of humiliation or shame', detected: false },
    { type: 'emotional', severity: 2, indicator: 'Persistent sadness or irritability', detected: false },

    // Environmental indicators
    { type: 'environmental', severity: 4, indicator: 'Recent significant loss or trauma', detected: false },
    { type: 'environmental', severity: 3, indicator: 'Relationship problems or breakup', detected: false },
    { type: 'environmental', severity: 3, indicator: 'Job loss or financial crisis', detected: false },
    { type: 'environmental', severity: 2, indicator: 'Legal troubles', detected: false },
    { type: 'environmental', severity: 2, indicator: 'Social isolation', detected: false }
  ]

  // Initialize crisis monitoring
  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [userId])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    
    // Start real-time assessment
    const assessmentInterval = setInterval(() => {
      performCrisisAssessment()
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(assessmentInterval)
    }
  }, [userId])

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const performCrisisAssessment = async () => {
    try {
      // Gather current session data
      const currentIndicators = await analyzeCurrentSession()
      
      // Calculate risk level
      const riskLevel = calculateRiskLevel(currentIndicators)
      
      // Create assessment
      const assessment: CrisisAssessment = {
        id: crypto.randomUUID(),
        userId,
        timestamp: new Date(),
        indicators: currentIndicators,
        riskLevel,
        interventionTaken: [],
        followUpRequired: riskLevel !== 'low',
        professionalNotified: riskLevel === 'severe' || riskLevel === 'imminent',
        encrypted: true
      }

      // Trigger intervention if needed
      if (riskLevel === 'imminent' || riskLevel === 'severe') {
        await triggerImmediateIntervention(assessment)
        onInterventionRequired('immediate')
      } else if (riskLevel === 'high') {
        await triggerUrgentIntervention(assessment)
        onInterventionRequired('urgent')
      } else if (riskLevel === 'moderate') {
        onInterventionRequired('followup')
      }

      // Store encrypted assessment
      if (userKey) {
        await storeEncryptedAssessment(assessment)
      }

      setCurrentAssessment(assessment)
      onCrisisDetected(assessment)

    } catch (error) {
      console.error('Crisis assessment failed:', error)
    }
  }

  const analyzeCurrentSession = async (): Promise<CrisisIndicator[]> => {
    // This would integrate with various data sources:
    // - User input analysis
    // - Behavioral pattern recognition
    // - Session interaction patterns
    // - Self-reported mood and symptoms
    
    const detectedIndicators: CrisisIndicator[] = []
    
    // Example: Check session data for indicators
    if (sessionData.moodScore && sessionData.moodScore <= 2) {
      const indicator = crisisIndicators.find(i => 
        i.indicator.includes('depression') && i.type === 'emotional'
      )
      if (indicator) {
        detectedIndicators.push({
          ...indicator,
          detected: true,
          timestamp: new Date()
        })
      }
    }

    // Check for verbal indicators in text input
    if (sessionData.recentInput) {
      const suicidalKeywords = [
        'kill myself', 'end my life', 'suicide', 'better off dead',
        'want to die', 'can\'t go on', 'no point living'
      ]
      
      const inputLower = sessionData.recentInput.toLowerCase()
      for (const keyword of suicidalKeywords) {
        if (inputLower.includes(keyword)) {
          const indicator = crisisIndicators.find(i => 
            i.severity === 5 && i.type === 'verbal'
          )
          if (indicator) {
            detectedIndicators.push({
              ...indicator,
              detected: true,
              timestamp: new Date()
            })
          }
          break
        }
      }
    }

    // Additional analysis would happen here
    // - Typing pattern analysis
    // - Response time analysis
    // - Tool usage patterns
    // - Historical trend analysis

    return detectedIndicators
  }

  const calculateRiskLevel = (indicators: CrisisIndicator[]): CrisisAssessment['riskLevel'] => {
    const detectedIndicators = indicators.filter(i => i.detected)
    
    if (detectedIndicators.length === 0) return 'low'
    
    const maxSeverity = Math.max(...detectedIndicators.map(i => i.severity))
    const totalSeverity = detectedIndicators.reduce((sum, i) => sum + i.severity, 0)
    const severityFiveCount = detectedIndicators.filter(i => i.severity === 5).length
    
    // Immediate danger - any severity 5 indicator
    if (severityFiveCount > 0) return 'imminent'
    
    // Severe risk - multiple high severity indicators
    if (maxSeverity >= 4 && detectedIndicators.length >= 2) return 'severe'
    
    // High risk - single high severity or multiple moderate
    if (maxSeverity >= 4 || totalSeverity >= 9) return 'high'
    
    // Moderate risk - some concerning indicators
    if (totalSeverity >= 5 || detectedIndicators.length >= 3) return 'moderate'
    
    return 'low'
  }

  const triggerImmediateIntervention = async (assessment: CrisisAssessment) => {
    // Log intervention
    assessment.interventionTaken.push('immediate_intervention_triggered')
    
    // Show crisis intervention interface
    showCrisisInterface(assessment)
    
    // Notify emergency contacts (if configured)
    await notifyEmergencyContacts(assessment)
    
    // Log crisis event
    await logCrisisEvent(assessment, 'immediate')
  }

  const triggerUrgentIntervention = async (assessment: CrisisAssessment) => {
    assessment.interventionTaken.push('urgent_intervention_triggered')
    
    // Show urgent support options
    showUrgentSupportInterface(assessment)
    
    // Schedule follow-up
    await scheduleFollowUp(assessment, 'urgent')
    
    await logCrisisEvent(assessment, 'urgent')
  }

  const showCrisisInterface = (assessment: CrisisAssessment) => {
    // This would trigger the crisis intervention UI
    // - Safety planning quick access
    // - Emergency contact buttons
    // - 988 Suicide & Crisis Lifeline
    // - Professional chat/call options
    // - Immediate coping tools
  }

  const showUrgentSupportInterface = (assessment: CrisisAssessment) => {
    // Show elevated support options
    // - Enhanced self-help tools
    // - Professional resource recommendations
    // - Check-in scheduling
  }

  const notifyEmergencyContacts = async (assessment: CrisisAssessment) => {
    try {
      // This would integrate with the user's safety plan
      // to notify designated emergency contacts
      console.log('Emergency contacts would be notified')
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error)
    }
  }

  const scheduleFollowUp = async (assessment: CrisisAssessment, priority: string) => {
    // Schedule automated check-ins
    const followUpData = {
      assessmentId: assessment.id,
      scheduledFor: new Date(Date.now() + (priority === 'urgent' ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
      priority
    }
    
    // Store follow-up reminder
    if (userKey) {
      await SecureStorage.storeEncryptedData(
        `followup_${assessment.id}`, 
        followUpData, 
        userKey
      )
    }
  }

  const logCrisisEvent = async (assessment: CrisisAssessment, type: string) => {
    const eventLog = {
      type: 'crisis_event',
      subtype: type,
      assessmentId: assessment.id,
      riskLevel: assessment.riskLevel,
      timestamp: new Date(),
      indicators: assessment.indicators.filter(i => i.detected).map(i => ({
        type: i.type,
        severity: i.severity,
        indicator: i.indicator
      }))
    }

    // Store encrypted event log
    if (userKey) {
      await SecureStorage.storeEncryptedData(
        `crisis_log_${Date.now()}`,
        eventLog,
        userKey
      )
    }

    // Send to analytics (anonymized)
    await sendAnonymizedCrisisData(eventLog)
  }

  const storeEncryptedAssessment = async (assessment: CrisisAssessment) => {
    if (!userKey) return

    try {
      const encryptedData = await CrisisEncryption.encryptCrisisSession(assessment, userKey)
      await SecureStorage.storeEncryptedData(
        `assessment_${assessment.id}`,
        encryptedData,
        userKey
      )
    } catch (error) {
      console.error('Failed to store encrypted assessment:', error)
    }
  }

  const sendAnonymizedCrisisData = async (eventLog: any) => {
    // Send anonymized data for population-level crisis analysis
    const anonymizedData = {
      riskLevel: eventLog.riskLevel,
      indicatorTypes: eventLog.indicators.map((i: any) => i.type),
      severityDistribution: eventLog.indicators.reduce((acc: any, i: any) => {
        acc[i.severity] = (acc[i.severity] || 0) + 1
        return acc
      }, {}),
      timestamp: eventLog.timestamp
    }

    try {
      await fetch('/api/analytics/crisis-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anonymizedData)
      })
    } catch (error) {
      console.error('Failed to send anonymized crisis data:', error)
    }
  }

  // Update session data from external sources
  const updateSessionData = useCallback((data: any) => {
    setSessionData((prev: any) => ({ ...prev, ...data }))
  }, [])

  return (
    <div className="crisis-detection-engine">
      {/* Crisis monitoring status indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-full text-sm",
          isMonitoring 
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-gray-100 text-gray-600 border border-gray-200"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          <span>Crisis Monitoring {isMonitoring ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {/* Crisis alert interface */}
      <AnimatePresence>
        {currentAssessment && currentAssessment.riskLevel !== 'low' && (
          <CrisisAlertInterface 
            assessment={currentAssessment}
            onDismiss={() => setCurrentAssessment(null)}
          />
        )}
      </AnimatePresence>

      {/* Development/testing interface */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
          <h4 className="font-medium text-gray-900 mb-2">Crisis Detection Debug</h4>
          <div className="space-y-2 text-sm">
            <div>Status: {isMonitoring ? 'Monitoring' : 'Stopped'}</div>
            <div>Current Risk: {currentAssessment?.riskLevel || 'Unknown'}</div>
            <div>Indicators: {currentAssessment?.indicators.filter(i => i.detected).length || 0}</div>
          </div>
          <button
            onClick={() => performCrisisAssessment()}
            className="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Test Assessment
          </button>
        </div>
      )}
    </div>
  )
}

// Crisis alert interface component
function CrisisAlertInterface({ 
  assessment, 
  onDismiss 
}: { 
  assessment: CrisisAssessment
  onDismiss: () => void 
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'imminent': return 'bg-red-600 border-red-600 text-white'
      case 'severe': return 'bg-red-500 border-red-500 text-white'
      case 'high': return 'bg-orange-500 border-orange-500 text-white'
      case 'moderate': return 'bg-yellow-500 border-yellow-500 text-white'
      default: return 'bg-blue-500 border-blue-500 text-white'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'imminent':
      case 'severe':
        return <AlertTriangle className="w-6 h-6" />
      case 'high':
        return <Shield className="w-6 h-6" />
      default:
        return <Heart className="w-6 h-6" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className={cn(
          "flex items-center space-x-3 p-4 rounded-lg mb-6",
          getRiskColor(assessment.riskLevel)
        )}>
          {getRiskIcon(assessment.riskLevel)}
          <div>
            <h3 className="font-bold text-lg">
              {assessment.riskLevel === 'imminent' && 'Immediate Crisis Detected'}
              {assessment.riskLevel === 'severe' && 'Severe Risk Assessment'}
              {assessment.riskLevel === 'high' && 'High Risk Detected'}
              {assessment.riskLevel === 'moderate' && 'Moderate Concern'}
            </h3>
            <p className="text-sm opacity-90">
              Crisis support resources are available 24/7
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {assessment.riskLevel === 'imminent' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Immediate Help Available</h4>
              <div className="space-y-2">
                <a 
                  href="tel:988" 
                  className="flex items-center space-x-2 text-red-800 hover:text-red-900"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 988 - Suicide & Crisis Lifeline</span>
                </a>
                <a 
                  href="sms:741741" 
                  className="flex items-center space-x-2 text-red-800 hover:text-red-900"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Text HOME to 741741 - Crisis Text Line</span>
                </a>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Shield className="w-4 h-4" />
              <span>Safety Plan</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Activity className="w-4 h-4" />
              <span>Coping Tools</span>
            </button>
          </div>

          <button 
            onClick={onDismiss}
            className="w-full p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            I'm Safe Right Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}