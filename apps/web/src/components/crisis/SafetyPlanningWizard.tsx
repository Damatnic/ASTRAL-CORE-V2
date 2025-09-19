'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Heart,
  Phone,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Save,
  Lock,
  Unlock,
  Plus,
  Trash2,
  User,
  Home,
  Zap,
  Brain,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CrisisEncryption, CryptoManager, SecureStorage } from '@/lib/crypto'

interface SafetyPlan {
  id: string
  userId: string
  personalStrengths: string[]
  copingStrategies: string[]
  socialSupports: string[]
  professionalContacts: Array<{
    name: string
    relationship: string
    phone: string
    available24h: boolean
  }>
  environmentalSafety: {
    removedItems: string[]
    safeSpaces: string[]
    restrictions: string[]
  }
  warningSignsPersonal: string[]
  warningSignsSocial: string[]
  crisisTriggers: string[]
  emergencyContacts: Array<{
    name: string
    relationship: string
    phone: string
    priority: number
  }>
  emergencyServices: {
    crisis988: boolean
    police911: boolean
    localCrisisCenter: string
    nearestER: string
  }
  dailySafetySteps: string[]
  isEncrypted: boolean
  encryptionHash?: string
  lastUpdated: Date
}

interface SafetyPlanningWizardProps {
  userId: string
  onComplete: (plan: SafetyPlan) => void
  existingPlan?: SafetyPlan
}

export default function SafetyPlanningWizard({ 
  userId, 
  onComplete, 
  existingPlan 
}: SafetyPlanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isEncrypted, setIsEncrypted] = useState(true)
  const [encryptionPassword, setEncryptionPassword] = useState('')
  const [userKey, setUserKey] = useState<CryptoKey | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const [safetyPlan, setSafetyPlan] = useState<Partial<SafetyPlan>>({
    id: existingPlan?.id || crypto.randomUUID(),
    userId,
    personalStrengths: existingPlan?.personalStrengths || [],
    copingStrategies: existingPlan?.copingStrategies || [],
    socialSupports: existingPlan?.socialSupports || [],
    professionalContacts: existingPlan?.professionalContacts || [],
    environmentalSafety: existingPlan?.environmentalSafety || {
      removedItems: [],
      safeSpaces: [],
      restrictions: []
    },
    warningSignsPersonal: existingPlan?.warningSignsPersonal || [],
    warningSignsSocial: existingPlan?.warningSignsSocial || [],
    crisisTriggers: existingPlan?.crisisTriggers || [],
    emergencyContacts: existingPlan?.emergencyContacts || [],
    emergencyServices: existingPlan?.emergencyServices || {
      crisis988: true,
      police911: true,
      localCrisisCenter: '',
      nearestER: ''
    },
    dailySafetySteps: existingPlan?.dailySafetySteps || [],
    isEncrypted: true,
    lastUpdated: new Date()
  })

  const totalSteps = 8

  const stepTitles = [
    'Personal Strengths',
    'Coping Strategies', 
    'Social Support',
    'Professional Contacts',
    'Environmental Safety',
    'Warning Signs',
    'Emergency Contacts',
    'Daily Safety Plan'
  ]

  // Initialize encryption on component mount
  useEffect(() => {
    const initializeEncryption = async () => {
      if (existingPlan && !encryptionPassword) {
        // For existing plans, we need the password to decrypt
        return
      }
      
      if (encryptionPassword) {
        try {
          // Try to get existing key or create new one
          let key = await SecureStorage.getUserKey(userId, encryptionPassword)
          if (!key) {
            key = await CryptoManager.generateKey()
            await SecureStorage.storeUserKey(userId, encryptionPassword, key)
          }
          setUserKey(key)
        } catch (error) {
          console.error('Encryption initialization failed:', error)
        }
      }
    }

    initializeEncryption()
  }, [encryptionPassword, userId, existingPlan])

  const addToList = (listKey: string, value: string) => {
    if (!value.trim()) return
    
    setSafetyPlan(prev => ({
      ...prev,
      [listKey]: [...((prev as any)[listKey] as string[] || []), value.trim()]
    }))
  }

  const removeFromList = (listKey: string, index: number) => {
    setSafetyPlan(prev => ({
      ...prev,
      [listKey]: ((prev as any)[listKey] as string[])?.filter((_, i) => i !== index) || []
    }))
  }

  const addContact = (type: 'professionalContacts' | 'emergencyContacts', contact: any) => {
    setSafetyPlan(prev => ({
      ...prev,
      [type]: [...(prev[type] as any[] || []), contact]
    }))
  }

  const removeContact = (type: 'professionalContacts' | 'emergencyContacts', index: number) => {
    setSafetyPlan(prev => ({
      ...prev,
      [type]: (prev[type] as any[])?.filter((_, i) => i !== index) || []
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const savePlan = async () => {
    try {
      const completedPlan: SafetyPlan = {
        ...safetyPlan as SafetyPlan,
        lastUpdated: new Date()
      }

      if (isEncrypted && userKey) {
        // Encrypt the plan before saving
        const encryptedData = await CrisisEncryption.encryptSafetyPlan(completedPlan, userKey)
        await SecureStorage.storeEncryptedData(`safety_plan_${userId}`, encryptedData, userKey)
      }

      onComplete(completedPlan)
    } catch (error) {
      console.error('Failed to save safety plan:', error)
    }
  }

  // Show encryption setup if no password provided
  if (isEncrypted && !encryptionPassword) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Secure Safety Plan
            </h2>
            <p className="text-gray-600">
              Your safety plan will be encrypted for maximum privacy. 
              Choose a strong password to protect your personal information.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encryption Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a strong password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-700 hover:text-gray-900"
                >
                  {showPassword ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                Use at least 8 characters with a mix of letters, numbers, and symbols.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="encryption-consent"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="encryption-consent" className="text-sm text-gray-700">
                I understand that this password cannot be recovered if lost
              </label>
            </div>

            <button
              onClick={() => encryptionPassword.length >= 8 && setCurrentStep(1)}
              disabled={encryptionPassword.length < 8}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Begin Safety Planning
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Safety Planning Wizard</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Step {currentStep} of {totalSteps}</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-lg font-medium text-blue-600">
            {stepTitles[currentStep - 1]}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step content will be rendered here based on currentStep */}
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {currentStep === totalSteps ? (
            <button
              onClick={savePlan}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Safety Plan</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Personal Strengths</h3>
              <p className="text-gray-600">
                Identify your personal strengths, skills, and positive qualities that help you cope with difficult times.
              </p>
            </div>

            <ListBuilder
              items={safetyPlan.personalStrengths || []}
              placeholder="e.g., I'm resilient, I have good problem-solving skills..."
              onAdd={(value) => addToList('personalStrengths', value)}
              onRemove={(index) => removeFromList('personalStrengths', index)}
            />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Examples of Personal Strengths:</h4>
              <ul className="text-sm text-blue-800 grid grid-cols-2 gap-1">
                <li>• Resilience and perseverance</li>
                <li>• Creativity and imagination</li>
                <li>• Sense of humor</li>
                <li>• Problem-solving abilities</li>
                <li>• Compassion for others</li>
                <li>• Determination to improve</li>
              </ul>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Brain className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Coping Strategies</h3>
              <p className="text-gray-600">
                List healthy ways you cope with stress and difficult emotions.
              </p>
            </div>

            <ListBuilder
              items={safetyPlan.copingStrategies || []}
              placeholder="e.g., Deep breathing exercises, listening to music..."
              onAdd={(value) => addToList('copingStrategies', value)}
              onRemove={(index) => removeFromList('copingStrategies', index)}
            />

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Healthy Coping Strategies:</h4>
              <ul className="text-sm text-purple-800 grid grid-cols-2 gap-1">
                <li>• Deep breathing exercises</li>
                <li>• Physical exercise or walking</li>
                <li>• Journaling or writing</li>
                <li>• Creative activities (art, music)</li>
                <li>• Meditation or mindfulness</li>
                <li>• Taking a warm bath</li>
              </ul>
            </div>
          </div>
        )

      // Additional steps would continue here...
      // For brevity, I'll show the final step

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Daily Safety Steps</h3>
              <p className="text-gray-600">
                Create a daily routine that supports your mental health and wellbeing.
              </p>
            </div>

            <ListBuilder
              items={safetyPlan.dailySafetySteps || []}
              placeholder="e.g., Take medication as prescribed, check in with a friend..."
              onAdd={(value) => addToList('dailySafetySteps', value)}
              onRemove={(index) => removeFromList('dailySafetySteps', index)}
            />

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Daily Safety Plan Complete!</h4>
              <p className="text-sm text-green-800">
                Your safety plan will be securely encrypted and stored. You can access and update it anytime.
              </p>
            </div>
          </div>
        )

      default:
        return <div>Step content for step {currentStep}</div>
    }
  }
}

// Helper component for building lists
function ListBuilder({ 
  items, 
  placeholder, 
  onAdd, 
  onRemove 
}: {
  items: string[]
  placeholder: string
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <span className="flex-1">{item}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}