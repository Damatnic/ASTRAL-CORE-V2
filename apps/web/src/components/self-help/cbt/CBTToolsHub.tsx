'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Brain,
  Calendar,
  TrendingUp,
  Eye,
  Target,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Save,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Timer,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CBTTool {
  id: string
  name: string
  description: string
  category: 'thought-record' | 'distortion-identifier' | 'behavioral-activation' | 'exposure-tracker' | 'triangle'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  benefits: string[]
  instructions: string[]
}

interface ThoughtRecord {
  id: string
  date: Date
  situation: string
  automaticThought: string
  emotion: string
  emotionIntensity: number
  evidence: string
  alternativeThought: string
  newEmotion: string
  newEmotionIntensity: number
  cognitiveDistortions: string[]
}

interface ExposureTask {
  id: string
  fear: string
  exposureActivity: string
  anxietyBefore: number
  anxietyDuring: number
  anxietyAfter: number
  date: Date
  duration: number
  notes: string
  completed: boolean
}

interface BehavioralActivity {
  id: string
  activity: string
  plannedDate: Date
  actualDate?: Date
  anticipatedMood: number
  actualMood?: number
  enjoyment?: number
  mastery?: number
  notes: string
  completed: boolean
}

const COGNITIVE_DISTORTIONS = [
  'All-or-Nothing Thinking',
  'Overgeneralization',
  'Mental Filter',
  'Disqualifying the Positive',
  'Jumping to Conclusions',
  'Magnification/Minimization',
  'Emotional Reasoning',
  'Should Statements',
  'Labeling',
  'Personalization'
]

const CBT_TOOLS: CBTTool[] = [
  {
    id: 'thought-record',
    name: 'Thought Record',
    description: 'Identify and challenge unhelpful thinking patterns',
    category: 'thought-record',
    difficulty: 'intermediate',
    estimatedTime: '15-20 minutes',
    benefits: [
      'Increases awareness of thinking patterns',
      'Reduces emotional intensity',
      'Develops balanced thinking',
      'Breaks cycle of negative thoughts'
    ],
    instructions: [
      'Identify the triggering situation',
      'Notice your automatic thoughts',
      'Rate your emotional intensity',
      'Examine evidence for and against the thought',
      'Develop a more balanced perspective',
      'Re-rate your emotional intensity'
    ]
  },
  {
    id: 'distortion-identifier',
    name: 'Cognitive Distortion Identifier',
    description: 'AI-assisted identification of thinking errors',
    category: 'distortion-identifier',
    difficulty: 'beginner',
    estimatedTime: '5-10 minutes',
    benefits: [
      'Quick identification of thinking errors',
      'Educational about cognitive patterns',
      'Builds self-awareness',
      'Provides immediate feedback'
    ],
    instructions: [
      'Write down your concerning thought',
      'Review AI suggestions for distortions',
      'Learn about identified patterns',
      'Practice alternative thinking',
      'Track patterns over time'
    ]
  },
  {
    id: 'behavioral-activation',
    name: 'Behavioral Activation Scheduler',
    description: 'Plan activities to improve mood and motivation',
    category: 'behavioral-activation',
    difficulty: 'beginner',
    estimatedTime: '10-15 minutes',
    benefits: [
      'Increases activity and engagement',
      'Improves mood through action',
      'Builds sense of accomplishment',
      'Breaks cycle of inactivity'
    ],
    instructions: [
      'Choose meaningful activities',
      'Schedule specific times',
      'Rate anticipated mood benefit',
      'Complete activities as planned',
      'Reflect on actual experience',
      'Adjust future planning'
    ]
  },
  {
    id: 'exposure-tracker',
    name: 'Exposure Therapy Tracker',
    description: 'Track anxiety exposure exercises and progress',
    category: 'exposure-tracker',
    difficulty: 'advanced',
    estimatedTime: '20-60 minutes',
    benefits: [
      'Systematic desensitization',
      'Reduces avoidance behaviors',
      'Builds confidence',
      'Provides progress tracking'
    ],
    instructions: [
      'Identify specific fear or anxiety',
      'Design gradual exposure exercise',
      'Rate anxiety before, during, after',
      'Complete exposure as planned',
      'Record observations and learnings',
      'Plan next exposure level'
    ]
  }
]

export default function CBTToolsHub() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([])
  const [exposureTasks, setExposureTasks] = useState<ExposureTask[]>([])
  const [behavioralActivities, setBehavioralActivities] = useState<BehavioralActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCBTData()
  }, [])

  const loadCBTData = async () => {
    try {
      setIsLoading(true)
      const [thoughtRes, exposureRes, behavioralRes] = await Promise.allSettled([
        fetch('/api/self-help/cbt/thought-records'),
        fetch('/api/self-help/cbt/exposures'),
        fetch('/api/self-help/cbt/behavioral-activation')
      ])

      if (thoughtRes.status === 'fulfilled' && thoughtRes.value.ok) {
        const data = await thoughtRes.value.json()
        setThoughtRecords(data.records || [])
      }
      if (exposureRes.status === 'fulfilled' && exposureRes.value.ok) {
        const data = await exposureRes.value.json()
        setExposureTasks(data.tasks || [])
      }
      if (behavioralRes.status === 'fulfilled' && behavioralRes.value.ok) {
        const data = await behavioralRes.value.json()
        setBehavioralActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error loading CBT data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CBT Therapeutic Tools</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Cognitive Behavioral Therapy tools for identifying and changing unhelpful thoughts and behaviors
        </p>
      </div>

      {/* Tools Grid */}
      {!selectedTool && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CBT_TOOLS.map((tool) => {
            let completedCount = 0
            let totalCount = 0

            switch (tool.category) {
              case 'thought-record':
                completedCount = thoughtRecords.length
                totalCount = thoughtRecords.length + 1
                break
              case 'exposure-tracker':
                completedCount = exposureTasks.filter(t => t.completed).length
                totalCount = exposureTasks.length
                break
              case 'behavioral-activation':
                completedCount = behavioralActivities.filter(a => a.completed).length
                totalCount = behavioralActivities.length
                break
            }

            return (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTool(tool.id)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all"
              >
                <div className="mb-4">
                  {tool.category === 'thought-record' && <FileText className="w-8 h-8 text-blue-600" />}
                  {tool.category === 'distortion-identifier' && <Brain className="w-8 h-8 text-purple-600" />}
                  {tool.category === 'behavioral-activation' && <Calendar className="w-8 h-8 text-green-600" />}
                  {tool.category === 'exposure-tracker' && <TrendingUp className="w-8 h-8 text-orange-600" />}
                  {tool.category === 'triangle' && <Target className="w-8 h-8 text-red-600" />}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    tool.difficulty === 'beginner' ? "bg-green-100 text-green-700" :
                    tool.difficulty === 'intermediate' ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {tool.difficulty}
                  </span>
                  <span className="text-gray-500">{tool.estimatedTime}</span>
                </div>

                {totalCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">{completedCount}/{totalCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Start New</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Tool Interfaces */}
      <AnimatePresence>
        {selectedTool === 'thought-record' && (
          <ThoughtRecordInterface
            records={thoughtRecords}
            onSave={(record) => {
              setThoughtRecords(prev => [...prev, record])
              loadCBTData()
            }}
            onClose={() => setSelectedTool(null)}
          />
        )}
        {selectedTool === 'distortion-identifier' && (
          <DistortionIdentifierInterface
            onClose={() => setSelectedTool(null)}
          />
        )}
        {selectedTool === 'behavioral-activation' && (
          <BehavioralActivationInterface
            activities={behavioralActivities}
            onSave={(activity) => {
              setBehavioralActivities(prev => [...prev, activity])
              loadCBTData()
            }}
            onClose={() => setSelectedTool(null)}
          />
        )}
        {selectedTool === 'exposure-tracker' && (
          <ExposureTrackerInterface
            tasks={exposureTasks}
            onSave={(task) => {
              setExposureTasks(prev => [...prev, task])
              loadCBTData()
            }}
            onClose={() => setSelectedTool(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Thought Record Interface Component
interface ThoughtRecordInterfaceProps {
  records: ThoughtRecord[]
  onSave: (record: ThoughtRecord) => void
  onClose: () => void
}

function ThoughtRecordInterface({ records, onSave, onClose }: ThoughtRecordInterfaceProps) {
  const [currentRecord, setCurrentRecord] = useState<Partial<ThoughtRecord>>({
    situation: '',
    automaticThought: '',
    emotion: '',
    emotionIntensity: 5,
    evidence: '',
    alternativeThought: '',
    newEmotion: '',
    newEmotionIntensity: 5,
    cognitiveDistortions: []
  })
  const [step, setStep] = useState(1)

  const handleSave = async () => {
    const record: ThoughtRecord = {
      id: Date.now().toString(),
      date: new Date(),
      ...currentRecord as ThoughtRecord
    }

    try {
      const response = await fetch('/api/self-help/cbt/thought-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })

      if (response.ok) {
        onSave(record)
        onClose()
      }
    } catch (error) {
      console.error('Error saving thought record:', error)
    }
  }

  const steps = [
    {
      title: 'Situation',
      description: 'What happened? Describe the situation objectively.',
      field: 'situation' as keyof ThoughtRecord
    },
    {
      title: 'Automatic Thought',
      description: 'What thought went through your mind?',
      field: 'automaticThought' as keyof ThoughtRecord
    },
    {
      title: 'Emotion & Intensity',
      description: 'What emotion did you feel and how intense was it?',
      field: 'emotion' as keyof ThoughtRecord
    },
    {
      title: 'Evidence',
      description: 'What evidence supports or contradicts your thought?',
      field: 'evidence' as keyof ThoughtRecord
    },
    {
      title: 'Alternative Thought',
      description: 'What\'s a more balanced way to think about this?',
      field: 'alternativeThought' as keyof ThoughtRecord
    },
    {
      title: 'New Emotion',
      description: 'How do you feel now with this new perspective?',
      field: 'newEmotion' as keyof ThoughtRecord
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thought Record</h2>
          <p className="text-gray-600">Step {step} of {steps.length}: {steps[step - 1].title}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(step / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Current Step */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{steps[step - 1].title}</h3>
          <p className="text-gray-600 mb-4">{steps[step - 1].description}</p>

          {(step === 3 || step === 6) ? (
            // Emotion and intensity steps
            <div className="space-y-4">
              <input
                type="text"
                placeholder={step === 3 ? "e.g., anxious, sad, angry..." : "How do you feel now?"}
                value={step === 3 ? currentRecord.emotion : currentRecord.newEmotion}
                onChange={(e) => setCurrentRecord(prev => ({
                  ...prev,
                  [step === 3 ? 'emotion' : 'newEmotion']: e.target.value
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity (1-10): {step === 3 ? currentRecord.emotionIntensity : currentRecord.newEmotionIntensity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={step === 3 ? currentRecord.emotionIntensity : currentRecord.newEmotionIntensity}
                  onChange={(e) => setCurrentRecord(prev => ({
                    ...prev,
                    [step === 3 ? 'emotionIntensity' : 'newEmotionIntensity']: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <textarea
              placeholder={`Enter ${steps[step - 1].title.toLowerCase()}...`}
              value={currentRecord[steps[step - 1].field] as string || ''}
              onChange={(e) => setCurrentRecord(prev => ({
                ...prev,
                [steps[step - 1].field]: e.target.value
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          )}
        </div>

        {/* Cognitive Distortions (shown on step 2) */}
        {step === 2 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Possible cognitive distortions (check any that apply):
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {COGNITIVE_DISTORTIONS.map((distortion) => (
                <label key={distortion} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={currentRecord.cognitiveDistortions?.includes(distortion) || false}
                    onChange={(e) => {
                      const distortions = currentRecord.cognitiveDistortions || []
                      if (e.target.checked) {
                        setCurrentRecord(prev => ({
                          ...prev,
                          cognitiveDistortions: [...distortions, distortion]
                        }))
                      } else {
                        setCurrentRecord(prev => ({
                          ...prev,
                          cognitiveDistortions: distortions.filter(d => d !== distortion)
                        }))
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{distortion}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          {step < steps.length ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Thought Record
            </button>
          )}
        </div>
      </div>

      {/* Recent Records */}
      {records.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Thought Records</h3>
          <div className="space-y-3">
            {records.slice(-3).map((record) => (
              <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900 font-medium">{record.situation}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{record.automaticThought}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{record.emotion}: {record.emotionIntensity}/10 → {record.newEmotionIntensity}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Distortion Identifier Interface
interface DistortionIdentifierInterfaceProps {
  onClose: () => void
}

function DistortionIdentifierInterface({ onClose }: DistortionIdentifierInterfaceProps) {
  const [thoughtText, setThoughtText] = useState('')
  const [identifiedDistortions, setIdentifiedDistortions] = useState<string[]>([])
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeThought = async () => {
    if (!thoughtText.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/self-help/cbt/analyze-thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought: thoughtText })
      })

      if (response.ok) {
        const data = await response.json()
        setIdentifiedDistortions(data.distortions || [])
        setAlternatives(data.alternatives || [])
      }
    } catch (error) {
      console.error('Error analyzing thought:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cognitive Distortion Identifier</h2>
          <p className="text-gray-600">AI-powered analysis of thinking patterns</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What thought is bothering you?
          </label>
          <textarea
            value={thoughtText}
            onChange={(e) => setThoughtText(e.target.value)}
            placeholder="e.g., 'I always mess everything up' or 'Nobody likes me'"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <button
            onClick={analyzeThought}
            disabled={!thoughtText.trim() || isAnalyzing}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Thought'}
          </button>
        </div>

        {identifiedDistortions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Identified Cognitive Distortions</h3>
            <div className="space-y-2">
              {identifiedDistortions.map((distortion, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-900">{distortion}</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {getDistortionDescription(distortion)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {alternatives.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Alternative Thoughts</h3>
            <div className="space-y-2">
              {alternatives.map((alternative, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-800">{alternative}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Helper function for distortion descriptions
function getDistortionDescription(distortion: string): string {
  const descriptions: Record<string, string> = {
    'All-or-Nothing Thinking': 'Seeing things in black and white categories',
    'Overgeneralization': 'Drawing broad conclusions from single events',
    'Mental Filter': 'Focusing only on negative details',
    'Disqualifying the Positive': 'Dismissing positive experiences as flukes',
    'Jumping to Conclusions': 'Making negative interpretations without evidence',
    'Magnification/Minimization': 'Exaggerating problems or minimizing positives',
    'Emotional Reasoning': 'Believing feelings reflect reality',
    'Should Statements': 'Using "should," "must," or "ought" statements',
    'Labeling': 'Assigning global negative labels to yourself or others',
    'Personalization': 'Taking responsibility for things outside your control'
  }
  return descriptions[distortion] || 'A common thinking pattern that may not be helpful'
}

// Behavioral Activation Interface (simplified for space)
interface BehavioralActivationInterfaceProps {
  activities: BehavioralActivity[]
  onSave: (activity: BehavioralActivity) => void
  onClose: () => void
}

function BehavioralActivationInterface({ activities, onSave, onClose }: BehavioralActivationInterfaceProps) {
  // Implementation would be similar to ThoughtRecord but focused on activity planning
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Behavioral Activation Scheduler</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">Plan meaningful activities to improve your mood and motivation</p>
      
      {/* Activity planning form would go here */}
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Activity planning interface coming soon</p>
      </div>
    </motion.div>
  )
}

// Exposure Tracker Interface (simplified for space)
interface ExposureTrackerInterfaceProps {
  tasks: ExposureTask[]
  onSave: (task: ExposureTask) => void
  onClose: () => void
}

function ExposureTrackerInterface({ tasks, onSave, onClose }: ExposureTrackerInterfaceProps) {
  // Implementation would focus on exposure therapy tracking
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Exposure Therapy Tracker</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">Track your anxiety exposure exercises and progress</p>
      
      {/* Exposure tracking form would go here */}
      <div className="text-center py-8">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Exposure tracking interface coming soon</p>
      </div>
    </motion.div>
  )
}