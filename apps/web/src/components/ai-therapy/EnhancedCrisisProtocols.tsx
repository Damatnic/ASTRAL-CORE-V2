'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Phone,
  Heart,
  Shield,
  MapPin,
  Clock,
  User,
  MessageSquare,
  ExternalLink,
  FileText,
  Download,
  Share2,
  CheckCircle,
  X,
  Plus,
  Edit3,
  Save,
  Trash2,
  Star,
  Zap,
  Users,
  Brain,
  Activity,
  Navigation
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CrisisProtocolsProps {
  crisisLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical'
  userId?: string
  sessionId?: string
  therapistId?: string
  location?: GeolocationPosition
  onResourceAccess: (resourceType: string, resourceId: string) => void
  onSafetyPlanCreate?: (safetyPlan: SafetyPlan) => void
  className?: string
}

interface CrisisResource {
  id: string
  name: string
  type: 'hotline' | 'chat' | 'text' | 'local' | 'emergency' | 'app' | 'website'
  contact: string
  description: string
  availability: string
  languages: string[]
  specializations: string[]
  urgent: boolean
  location?: {
    city?: string
    state?: string
    country: string
  }
}

interface SafetyPlan {
  id: string
  userId: string
  createdAt: string
  lastUpdated: string
  warningSignsPersonal: string[]
  warningSignsEnvironmental: string[]
  copingStrategies: CopingStrategy[]
  supportContacts: SupportContact[]
  professionalContacts: ProfessionalContact[]
  environmentSafety: string[]
  emergencyContacts: EmergencyContact[]
  personalMessage: string
}

interface CopingStrategy {
  id: string
  description: string
  type: 'breathing' | 'mindfulness' | 'physical' | 'creative' | 'social' | 'other'
  effectiveness: number // 1-10 rating
  timeRequired: number // minutes
  accessibility: 'always' | 'home' | 'public' | 'with-others'
}

interface SupportContact {
  id: string
  name: string
  relationship: string
  phone?: string
  available: string
  topics: string[]
}

interface ProfessionalContact {
  id: string
  name: string
  role: string
  phone: string
  emergency: boolean
  specialty: string
}

interface EmergencyContact {
  id: string
  name: string
  phone: string
  type: 'hotline' | 'local' | 'personal'
}

export default function EnhancedCrisisProtocols({
  crisisLevel,
  userId,
  sessionId,
  therapistId,
  location,
  onResourceAccess,
  onSafetyPlanCreate,
  className
}: CrisisProtocolsProps) {
  const [activeTab, setActiveTab] = useState<'immediate' | 'resources' | 'safety-plan' | 'local'>('immediate')
  const [userLocation, setUserLocation] = useState<string>('')
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan | null>(null)
  const [isCreatingSafetyPlan, setIsCreatingSafetyPlan] = useState(false)
  const [selectedResources, setSelectedResources] = useState<string[]>([])

  // Crisis resources database
  const crisisResources: CrisisResource[] = [
    {
      id: '988-lifeline',
      name: '988 Suicide & Crisis Lifeline',
      type: 'hotline',
      contact: '988',
      description: 'Free, confidential crisis support 24/7. Formerly National Suicide Prevention Lifeline.',
      availability: '24/7',
      languages: ['English', 'Spanish'],
      specializations: ['Suicide prevention', 'Crisis intervention', 'Mental health support'],
      urgent: true,
      location: { country: 'United States' }
    },
    {
      id: 'crisis-text-line',
      name: 'Crisis Text Line',
      type: 'text',
      contact: 'Text HOME to 741741',
      description: 'Free crisis counseling via text message. Trained crisis counselors available 24/7.',
      availability: '24/7',
      languages: ['English', 'Spanish'],
      specializations: ['Crisis intervention', 'Text-based support', 'Teen support'],
      urgent: true,
      location: { country: 'United States' }
    },
    {
      id: 'emergency-911',
      name: 'Emergency Services',
      type: 'emergency',
      contact: '911',
      description: 'Emergency medical, fire, and police services for immediate life-threatening situations.',
      availability: '24/7',
      languages: ['English', 'Translation services available'],
      specializations: ['Medical emergency', 'Police response', 'Fire emergency'],
      urgent: true,
      location: { country: 'United States' }
    },
    {
      id: 'trans-lifeline',
      name: 'Trans Lifeline',
      type: 'hotline',
      contact: '877-565-8860',
      description: 'Crisis hotline for transgender individuals, run by transgender people.',
      availability: '24/7',
      languages: ['English', 'Spanish'],
      specializations: ['Transgender support', 'LGBTQ+ crisis', 'Identity support'],
      urgent: false,
      location: { country: 'United States' }
    },
    {
      id: 'trevor-project',
      name: 'The Trevor Project',
      type: 'hotline',
      contact: '1-866-488-7386',
      description: 'Crisis intervention and suicide prevention for LGBTQ+ youth.',
      availability: '24/7',
      languages: ['English', 'Spanish'],
      specializations: ['LGBTQ+ youth', 'Suicide prevention', 'Teen crisis'],
      urgent: false,
      location: { country: 'United States' }
    },
    {
      id: 'samhsa-helpline',
      name: 'SAMHSA National Helpline',
      type: 'hotline',
      contact: '1-800-662-4357',
      description: 'Treatment referral and information service for mental health and substance use disorders.',
      availability: '24/7',
      languages: ['English', 'Spanish'],
      specializations: ['Substance abuse', 'Mental health treatment', 'Referrals'],
      urgent: false,
      location: { country: 'United States' }
    },
    {
      id: 'domestic-violence-hotline',
      name: 'National Domestic Violence Hotline',
      type: 'hotline',
      contact: '1-800-799-7233',
      description: 'Support for domestic violence survivors and their families.',
      availability: '24/7',
      languages: ['English', 'Spanish', '200+ languages via translation'],
      specializations: ['Domestic violence', 'Safety planning', 'Abuse support'],
      urgent: false,
      location: { country: 'United States' }
    },
    {
      id: 'rainn-hotline',
      name: 'RAINN National Sexual Assault Hotline',
      type: 'hotline',
      contact: '1-800-656-4673',
      description: 'Support for survivors of sexual assault and their loved ones.',
      availability: '24/7',
      languages: ['English', 'Spanish'],
      specializations: ['Sexual assault', 'Trauma support', 'PTSD'],
      urgent: false,
      location: { country: 'United States' }
    }
  ]

  // Get location-based resources
  useEffect(() => {
    if (location) {
      // In a real implementation, this would use reverse geocoding
      setUserLocation('Local area resources available')
    }
  }, [location])

  const getCrisisLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCrisisMessage = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          title: 'Critical Crisis Detected',
          message: 'Immediate professional help is strongly recommended. Please contact emergency services or crisis hotlines right now.',
          action: 'Get Help Immediately'
        }
      case 'high':
        return {
          title: 'High Crisis Level',
          message: 'You appear to be in significant distress. Professional crisis support is recommended within the next few hours.',
          action: 'Contact Crisis Support'
        }
      case 'moderate':
        return {
          title: 'Moderate Crisis Level',
          message: 'You may be experiencing notable distress. Consider reaching out to crisis resources or trusted supports.',
          action: 'Consider Getting Support'
        }
      case 'low':
        return {
          title: 'Low Crisis Level',
          message: 'Some signs of distress detected. Review coping strategies and support resources.',
          action: 'Review Support Options'
        }
      default:
        return {
          title: 'Crisis Support Available',
          message: 'Crisis resources are always available if you need them.',
          action: 'View Resources'
        }
    }
  }

  const handleResourceClick = (resource: CrisisResource) => {
    onResourceAccess(resource.type, resource.id)
    setSelectedResources(prev => [...prev, resource.id])

    // Analytics tracking would go here
    console.log(`Crisis resource accessed: ${resource.name}`)
  }

  const handleEmergencyCall = (number: string) => {
    // In a real app, this would trigger appropriate actions
    window.open(`tel:${number}`)
  }

  const crisisInfo = getCrisisMessage(crisisLevel)

  const ResourceCard = ({ resource }: { resource: CrisisResource }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-200 cursor-pointer",
        resource.urgent && "border-red-200 bg-red-50",
        selectedResources.includes(resource.id) && "ring-2 ring-blue-500"
      )}
      onClick={() => handleResourceClick(resource)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            resource.urgent ? "bg-red-100" : "bg-blue-100"
          )}>
            {resource.type === 'hotline' && <Phone className={cn("h-5 w-5", resource.urgent ? "text-red-600" : "text-blue-600")} />}
            {resource.type === 'text' && <MessageSquare className={cn("h-5 w-5", resource.urgent ? "text-red-600" : "text-blue-600")} />}
            {resource.type === 'emergency' && <AlertTriangle className="h-5 w-5 text-red-600" />}
            {resource.type === 'chat' && <Users className={cn("h-5 w-5", resource.urgent ? "text-red-600" : "text-blue-600")} />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{resource.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {resource.specializations.slice(0, 2).map((spec) => (
                <span key={spec} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
        {resource.urgent && (
          <div className="flex items-center space-x-1 text-red-600">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-medium">Urgent</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{resource.availability}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{resource.languages.length} languages</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEmergencyCall(resource.contact.replace(/[^\d]/g, ''))
            }}
            className={cn(
              "px-3 py-1 rounded text-sm font-medium transition-colors",
              resource.urgent
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {resource.type === 'text' ? 'Text Now' : 'Call Now'}
          </button>
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  )

  const SafetyPlanSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Personal Safety Plan</h3>
            <p className="text-blue-800 text-sm">
              A safety plan is a personalized list of coping strategies and resources to use during a crisis. 
              It helps you recognize warning signs and know exactly what to do when you need support.
            </p>
          </div>
        </div>
      </div>

      {!safetyPlan && !isCreatingSafetyPlan && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Safety Plan Created</h3>
          <p className="text-gray-600 mb-4">
            Creating a safety plan can help you prepare for difficult moments and know exactly what to do.
          </p>
          <button
            onClick={() => setIsCreatingSafetyPlan(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Safety Plan</span>
          </button>
        </div>
      )}

      {isCreatingSafetyPlan && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create Your Safety Plan</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Warning Signs (How do you know when you're starting to feel crisis?)
              </label>
              <textarea
                placeholder="e.g., trouble sleeping, feeling overwhelmed, isolating from friends..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coping Strategies (What helps you feel better?)
              </label>
              <textarea
                placeholder="e.g., deep breathing, calling a friend, taking a walk, listening to music..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support People (Who can you reach out to?)
              </label>
              <textarea
                placeholder="e.g., Name: Mom, Phone: (555) 123-4567, Available: Evenings and weekends..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment Safety (How can you make your space safer?)
              </label>
              <textarea
                placeholder="e.g., remove or secure harmful items, ask someone to stay with me..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message to Future Self
              </label>
              <textarea
                placeholder="Write yourself an encouraging message for when you're struggling..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Save safety plan logic here
                  setIsCreatingSafetyPlan(false)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Safety Plan</span>
              </button>
              <button
                onClick={() => setIsCreatingSafetyPlan(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      {/* Crisis Level Alert */}
      <div className={cn("rounded-lg border p-4 mb-6", getCrisisLevelColor(crisisLevel))}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{crisisInfo.title}</h2>
            <p className="mb-4">{crisisInfo.message}</p>
            
            {(crisisLevel === 'critical' || crisisLevel === 'high') && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleEmergencyCall('988')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call 988 Now</span>
                </button>
                <button
                  onClick={() => handleEmergencyCall('911')}
                  className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center space-x-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency 911</span>
                </button>
                <button
                  onClick={() => window.open('sms:741741?body=HOME')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Text Crisis Line</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'immediate', label: 'Immediate Help', icon: Heart },
            { id: 'resources', label: 'Crisis Resources', icon: Phone },
            { id: 'safety-plan', label: 'Safety Plan', icon: Shield },
            { id: 'local', label: 'Local Support', icon: MapPin }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'immediate' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crisisResources.filter(r => r.urgent).map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">What to Do Right Now</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Find a safe, quiet space if possible</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Take slow, deep breaths</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Remove access to harmful items if relevant</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Reach out to a crisis hotline or trusted person</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Remember: This feeling will pass</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crisisResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'safety-plan' && <SafetyPlanSection />}

          {activeTab === 'local' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Local Crisis Resources</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      {userLocation || 'Enable location services to find crisis resources near you.'}
                    </p>
                    {!location && (
                      <button
                        onClick={() => {
                          navigator.geolocation?.getCurrentPosition((pos) => {
                            // Handle location in real app
                            setUserLocation('Location services enabled - finding local resources...')
                          })
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Find Local Resources</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Local Emergency Rooms</h4>
                  <p className="text-sm text-gray-600 mb-3">24/7 emergency psychiatric care</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>Find Nearest ER</span>
                  </button>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Crisis Centers</h4>
                  <p className="text-sm text-gray-600 mb-3">Local walk-in crisis support</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>Find Crisis Centers</span>
                  </button>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Mobile Crisis Teams</h4>
                  <p className="text-sm text-gray-600 mb-3">Crisis professionals who come to you</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>Find Mobile Teams</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}