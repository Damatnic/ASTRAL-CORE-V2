'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  Bot,
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  Phone,
  Users,
  Heart,
  ExternalLink,
  Shield,
  Info,
  Zap,
  Award,
  Globe,
  MessageSquare,
  User,
  RefreshCw,
  Eye,
  BookOpen,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  aiTherapistProfiles, 
  AITherapistProfile,
  validateTherapistCompatibility,
  getRecommendedTherapists,
  getAvailableSpecialties 
} from './EnhancedTherapistProfiles'
import AIDisclosureFramework from './AIDisclosureFramework'

interface TherapistSelectionProps {
  onTherapistSelect: (therapist: AITherapistProfile) => void
  onCancel?: () => void
  userNeeds?: string[]
  crisisLevel?: 'none' | 'low' | 'moderate' | 'high' | 'critical'
  showDisclosure?: boolean
  className?: string
}

interface FilterOptions {
  specialties: string[]
  approaches: string[]
  conversationStyles: string[]
  crisisSupport: boolean | null
  researchSupport: string[]
}

export default function TherapistSelectionInterface({
  onTherapistSelect,
  onCancel,
  userNeeds = [],
  crisisLevel = 'none',
  showDisclosure = true,
  className
}: TherapistSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTherapist, setSelectedTherapist] = useState<AITherapistProfile | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonTherapists, setComparisonTherapists] = useState<AITherapistProfile[]>([])
  const [showDisclosureModal, setShowDisclosureModal] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    specialties: [],
    approaches: [],
    conversationStyles: [],
    crisisSupport: null,
    researchSupport: []
  })

  // Get recommended therapists based on user needs
  const recommendedTherapists = useMemo(() => {
    return getRecommendedTherapists(userNeeds, crisisLevel)
  }, [userNeeds, crisisLevel])

  // Filter and search therapists
  const filteredTherapists = useMemo(() => {
    let results = [...aiTherapistProfiles]

    // Search filter
    if (searchQuery) {
      results = results.filter(therapist =>
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        therapist.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Specialty filter
    if (filters.specialties.length > 0) {
      results = results.filter(therapist =>
        therapist.specialties.some(specialty =>
          filters.specialties.some(filterSpecialty =>
            specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
          )
        )
      )
    }

    // Crisis support filter
    if (filters.crisisSupport !== null) {
      results = results.filter(therapist => therapist.availability.crisisSupport === filters.crisisSupport)
    }

    // Research support filter
    if (filters.researchSupport.length > 0) {
      results = results.filter(therapist =>
        filters.researchSupport.includes(therapist.evidenceBase.researchSupport)
      )
    }

    // Conversation style filter
    if (filters.conversationStyles.length > 0) {
      results = results.filter(therapist =>
        filters.conversationStyles.includes(therapist.conversationStyle)
      )
    }

    return results
  }, [searchQuery, filters])

  const handleTherapistClick = (therapist: AITherapistProfile) => {
    setSelectedTherapist(therapist)
    if (showDisclosure) {
      setShowDisclosureModal(true)
    } else {
      onTherapistSelect(therapist)
    }
  }

  const handleDisclosureAccept = () => {
    if (selectedTherapist) {
      onTherapistSelect(selectedTherapist)
    }
    setShowDisclosureModal(false)
  }

  const handleDisclosureDecline = () => {
    setSelectedTherapist(null)
    setShowDisclosureModal(false)
  }

  const addToComparison = (therapist: AITherapistProfile) => {
    if (comparisonTherapists.length < 3 && !comparisonTherapists.find(t => t.id === therapist.id)) {
      setComparisonTherapists(prev => [...prev, therapist])
      setShowComparison(true)
    }
  }

  const removeFromComparison = (therapistId: string) => {
    setComparisonTherapists(prev => prev.filter(t => t.id !== therapistId))
    if (comparisonTherapists.length <= 1) {
      setShowComparison(false)
    }
  }

  const getCompatibilityInfo = (therapist: AITherapistProfile) => {
    return validateTherapistCompatibility(therapist.id, userNeeds, crisisLevel)
  }

  const TherapistCard = ({ therapist, isRecommended = false }: { therapist: AITherapistProfile, isRecommended?: boolean }) => {
    const compatibility = getCompatibilityInfo(therapist)
    const IconComponent = therapist.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group",
          isRecommended && "ring-2 ring-blue-500 ring-opacity-50",
          compatibility.compatibilityScore >= 70 && "border-green-200",
          compatibility.warnings.length > 0 && "border-amber-200"
        )}
        onClick={() => handleTherapistClick(therapist)}
      >
        {/* AI Badge */}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
            <Bot className="h-3 w-3" />
            <span>AI</span>
          </div>
        </div>

        {isRecommended && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
              <Star className="h-3 w-3" />
              <span>Recommended</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
              `bg-gradient-to-br ${therapist.gradient}`
            )}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{therapist.name}</h3>
                {therapist.availability.crisisSupport && (
                  <Shield className="h-4 w-4 text-red-500" title="Crisis Support Available" />
                )}
              </div>
              <p className="text-gray-600 font-medium">{therapist.title}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  therapist.evidenceBase.researchSupport === 'high' 
                    ? "bg-green-100 text-green-800"
                    : therapist.evidenceBase.researchSupport === 'moderate'
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                )}>
                  {therapist.evidenceBase.researchSupport} evidence
                </div>
                <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {therapist.conversationStyle}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                addToComparison(therapist)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
              title="Add to comparison"
            >
              <Target className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Compatibility Score */}
          {userNeeds.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Compatibility</span>
                <span className={cn(
                  "text-sm font-bold",
                  compatibility.compatibilityScore >= 70 ? "text-green-600" :
                  compatibility.compatibilityScore >= 50 ? "text-yellow-600" : "text-red-600"
                )}>
                  {compatibility.compatibilityScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    compatibility.compatibilityScore >= 70 ? "bg-green-500" :
                    compatibility.compatibilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${compatibility.compatibilityScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Warnings */}
          {compatibility.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  {compatibility.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-amber-700">{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{therapist.description}</p>

          {/* Specialties */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-1">
              {therapist.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                >
                  {specialty}
                </span>
              ))}
              {therapist.specialties.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{therapist.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Languages & Availability */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{therapist.availability.languages.join(', ')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{therapist.availability.sessionTypes.length} session types</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Available 24/7</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t flex space-x-2">
            <button
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium transition-colors",
                `bg-gradient-to-r ${therapist.gradient} text-white hover:opacity-90`
              )}
              onClick={(e) => {
                e.stopPropagation()
                handleTherapistClick(therapist)
              }}
            >
              Start Session
            </button>
            <button
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Show detailed view
              }}
            >
              <Info className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={cn("max-w-7xl mx-auto p-6", className)}>
      {/* AI Disclosure Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Bot className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">AI Therapy Assistants (2025)</h3>
            <p className="text-blue-700 text-sm mb-2">
              These are artificial intelligence systems, not human therapists. They provide supportive conversations 
              and evidence-based techniques but cannot replace professional mental health care.
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-600">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>Crisis: 988 Suicide Lifeline</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Find Human Therapists</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your AI Therapy Assistant</h1>
        <p className="text-gray-600">
          Select an AI assistant that matches your needs. Each has specialized training in different therapeutic approaches.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or approach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-3 border rounded-lg flex items-center space-x-2 transition-colors",
              showFilters 
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "border-gray-200 hover:bg-gray-50"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crisis Support</label>
                  <select
                    value={filters.crisisSupport === null ? '' : filters.crisisSupport.toString()}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      crisisSupport: e.target.value === '' ? null : e.target.value === 'true'
                    }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">All</option>
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Research Support</label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !filters.researchSupport.includes(e.target.value)) {
                        setFilters(prev => ({
                          ...prev,
                          researchSupport: [...prev.researchSupport, e.target.value]
                        }))
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Select evidence level...</option>
                    <option value="high">High Evidence</option>
                    <option value="moderate">Moderate Evidence</option>
                    <option value="emerging">Emerging Evidence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conversation Style</label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !filters.conversationStyles.includes(e.target.value)) {
                        setFilters(prev => ({
                          ...prev,
                          conversationStyles: [...prev.conversationStyles, e.target.value]
                        }))
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Select style...</option>
                    <option value="directive">Directive</option>
                    <option value="collaborative">Collaborative</option>
                    <option value="supportive">Supportive</option>
                    <option value="exploratory">Exploratory</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      specialties: [],
                      approaches: [],
                      conversationStyles: [],
                      crisisSupport: null,
                      researchSupport: []
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(filters.researchSupport.length > 0 || filters.conversationStyles.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {filters.researchSupport.map((level) => (
                    <span
                      key={level}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center space-x-1"
                    >
                      <span>{level} evidence</span>
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          researchSupport: prev.researchSupport.filter(r => r !== level)
                        }))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {filters.conversationStyles.map((style) => (
                    <span
                      key={style}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center space-x-1"
                    >
                      <span>{style}</span>
                      <button
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          conversationStyles: prev.conversationStyles.filter(s => s !== style)
                        }))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Crisis Alert */}
      {crisisLevel !== 'none' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Crisis Support Needed</h3>
              <p className="text-red-700 text-sm mb-3">
                We've detected you may need immediate support. While our AI assistants can help, 
                please consider contacting human crisis support for the best care.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <a href="tel:988" className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                  <Phone className="h-4 w-4" />
                  <span>988 Suicide & Crisis Lifeline</span>
                </a>
                <span className="text-red-600">|</span>
                <span className="text-red-600">Text HOME to 741741</span>
                <span className="text-red-600">|</span>
                <span className="text-red-600">Call 911 for emergency</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Panel */}
      <AnimatePresence>
        {showComparison && comparisonTherapists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-white border rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Compare Therapists</h3>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonTherapists.map((therapist) => (
                <div key={therapist.id} className="border rounded-lg p-3 relative">
                  <button
                    onClick={() => removeFromComparison(therapist.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="text-center mb-2">
                    <h4 className="font-semibold">{therapist.name}</h4>
                    <p className="text-sm text-gray-600">{therapist.title}</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Style:</span> {therapist.conversationStyle}
                    </div>
                    <div>
                      <span className="font-medium">Crisis:</span> {therapist.availability.crisisSupport ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Evidence:</span> {therapist.evidenceBase.researchSupport}
                    </div>
                    {userNeeds.length > 0 && (
                      <div>
                        <span className="font-medium">Match:</span> {getCompatibilityInfo(therapist).compatibilityScore}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-8">
        {/* Recommended Section */}
        {userNeeds.length > 0 && recommendedTherapists.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span>Recommended for You</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedTherapists.slice(0, 3).map((therapist) => (
                <TherapistCard key={therapist.id} therapist={therapist} isRecommended />
              ))}
            </div>
          </div>
        )}

        {/* All Therapists */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            All AI Therapy Assistants ({filteredTherapists.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find the right match.</p>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="mt-8 text-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel Selection
          </button>
        </div>
      )}

      {/* AI Disclosure Modal */}
      {showDisclosureModal && selectedTherapist && (
        <AIDisclosureFramework
          type={crisisLevel !== 'none' ? 'crisis' : 'full'}
          therapistName={selectedTherapist.name}
          onAccept={handleDisclosureAccept}
          onDecline={handleDisclosureDecline}
          mandatory={true}
          showComprehensionTest={true}
        />
      )}
    </div>
  )
}