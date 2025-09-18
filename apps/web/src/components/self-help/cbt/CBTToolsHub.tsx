'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Users,
  Pause,
  Play
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
      situation: currentRecord.situation || '',
      automaticThought: currentRecord.automaticThought || '',
      emotion: currentRecord.emotion || '',
      emotionIntensity: currentRecord.emotionIntensity || 5,
      evidence: currentRecord.evidence || '',
      alternativeThought: currentRecord.alternativeThought || '',
      newEmotion: currentRecord.newEmotion || '',
      newEmotionIntensity: currentRecord.newEmotionIntensity || 5,
      cognitiveDistortions: currentRecord.cognitiveDistortions || []
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

// Behavioral Activation Interface
interface BehavioralActivationInterfaceProps {
  activities: BehavioralActivity[]
  onSave: (activity: BehavioralActivity) => void
  onClose: () => void
}

function BehavioralActivationInterface({ activities, onSave, onClose }: BehavioralActivationInterfaceProps) {
  const [currentActivity, setCurrentActivity] = useState<Partial<BehavioralActivity>>({
    activity: '',
    plannedDate: new Date(),
    anticipatedMood: 5,
    notes: '',
    completed: false
  })
  const [viewMode, setViewMode] = useState<'plan' | 'review'>('plan')
  const [selectedActivity, setSelectedActivity] = useState<BehavioralActivity | null>(null)

  const ACTIVITY_SUGGESTIONS = [
    { category: 'Physical', activities: ['Take a walk', 'Do yoga', 'Exercise at gym', 'Dance to music', 'Garden', 'Clean house'] },
    { category: 'Social', activities: ['Call a friend', 'Meet for coffee', 'Join a group', 'Video chat family', 'Volunteer', 'Attend event'] },
    { category: 'Creative', activities: ['Draw or paint', 'Write in journal', 'Play music', 'Craft project', 'Cook new recipe', 'Photography'] },
    { category: 'Learning', activities: ['Read a book', 'Take online course', 'Learn new skill', 'Watch documentary', 'Practice language', 'Research hobby'] },
    { category: 'Self-Care', activities: ['Take a bath', 'Meditate', 'Get massage', 'Do skincare', 'Rest and nap', 'Practice breathing'] },
    { category: 'Achievement', activities: ['Organize space', 'Complete project', 'Learn new skill', 'Fix something', 'Plan future goals', 'Celebrate progress'] }
  ]

  const handleSave = async () => {
    const activity: BehavioralActivity = {
      id: Date.now().toString(),
      activity: currentActivity.activity || '',
      plannedDate: currentActivity.plannedDate || new Date(),
      anticipatedMood: currentActivity.anticipatedMood || 5,
      notes: currentActivity.notes || '',
      completed: false
    }

    try {
      const response = await fetch('/api/self-help/cbt/behavioral-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      })

      if (response.ok) {
        onSave(activity)
        setCurrentActivity({
          activity: '',
          plannedDate: new Date(),
          anticipatedMood: 5,
          notes: '',
          completed: false
        })
      }
    } catch (error) {
      console.error('Error saving activity:', error)
    }
  }

  const handleComplete = async (activity: BehavioralActivity, actualMood: number, enjoyment: number, mastery: number) => {
    try {
      const response = await fetch(`/api/self-help/cbt/behavioral-activation/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          actualDate: new Date(),
          actualMood,
          enjoyment,
          mastery
        })
      })

      if (response.ok) {
        // Refresh activities list
        window.location.reload()
      }
    } catch (error) {
      console.error('Error completing activity:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Behavioral Activation Scheduler</h2>
          <p className="text-gray-600">Plan activities to improve mood and build momentum</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => setViewMode('plan')}
          className={cn(
            "px-4 py-2 rounded-l-lg border",
            viewMode === 'plan' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
          )}
        >
          Plan Activity
        </button>
        <button
          onClick={() => setViewMode('review')}
          className={cn(
            "px-4 py-2 rounded-r-lg border-l-0 border",
            viewMode === 'review' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
          )}
        >
          Review Activities ({activities.length})
        </button>
      </div>

      {viewMode === 'plan' && (
        <div className="space-y-6">
          {/* Activity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What activity would you like to plan?
            </label>
            <input
              type="text"
              value={currentActivity.activity}
              onChange={(e) => setCurrentActivity(prev => ({ ...prev, activity: e.target.value }))}
              placeholder="e.g., Take a 20-minute walk in the park"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Activity Suggestions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Need ideas? Try these activities:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACTIVITY_SUGGESTIONS.map((category) => (
                <div key={category.category} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                  <div className="space-y-1">
                    {category.activities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => setCurrentActivity(prev => ({ ...prev, activity }))}
                        className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When do you plan to do this?
            </label>
            <input
              type="datetime-local"
              value={currentActivity.plannedDate?.toISOString().slice(0, 16)}
              onChange={(e) => setCurrentActivity(prev => ({ 
                ...prev, 
                plannedDate: new Date(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Anticipated Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you think this will affect your mood? ({currentActivity.anticipatedMood}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentActivity.anticipatedMood}
              onChange={(e) => setCurrentActivity(prev => ({ 
                ...prev, 
                anticipatedMood: Number(e.target.value) 
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Much worse</span>
              <span>No change</span>
              <span>Much better</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes or reminders
            </label>
            <textarea
              value={currentActivity.notes}
              onChange={(e) => setCurrentActivity(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional thoughts, preparation needed, or motivation..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!currentActivity.activity?.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Schedule Activity
          </button>
        </div>
      )}

      {viewMode === 'review' && (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activities planned yet. Switch to "Plan Activity" to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.activity}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        Planned: {new Date(activity.plannedDate).toLocaleDateString()} at{' '}
                        {new Date(activity.plannedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {activity.notes && (
                        <p className="text-sm text-gray-600 mt-2">{activity.notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Expected mood impact: {activity.anticipatedMood}/10</span>
                        {activity.completed && activity.actualMood && (
                          <span className="text-green-600">
                            Actual: {activity.actualMood}/10
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!activity.completed ? (
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completion Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">How did it go?</h3>
              <p className="text-gray-600 mb-4">"{selectedActivity.activity}"</p>
              
              <CompletionForm
                activity={selectedActivity}
                onComplete={handleComplete}
                onCancel={() => setSelectedActivity(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Completion Form Component
function CompletionForm({ 
  activity, 
  onComplete, 
  onCancel 
}: { 
  activity: BehavioralActivity
  onComplete: (activity: BehavioralActivity, actualMood: number, enjoyment: number, mastery: number) => void
  onCancel: () => void 
}) {
  const [actualMood, setActualMood] = useState(5)
  const [enjoyment, setEnjoyment] = useState(5)
  const [mastery, setMastery] = useState(5)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How did this affect your mood? ({actualMood}/10)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={actualMood}
          onChange={(e) => setActualMood(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How much did you enjoy it? ({enjoyment}/10)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={enjoyment}
          onChange={(e) => setEnjoyment(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sense of accomplishment? ({mastery}/10)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={mastery}
          onChange={(e) => setMastery(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onComplete(activity, actualMood, enjoyment, mastery)}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Save & Complete
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Exposure Tracker Interface
interface ExposureTrackerInterfaceProps {
  tasks: ExposureTask[]
  onSave: (task: ExposureTask) => void
  onClose: () => void
}

function ExposureTrackerInterface({ tasks, onSave, onClose }: ExposureTrackerInterfaceProps) {
  const [currentTask, setCurrentTask] = useState<Partial<ExposureTask>>({
    fear: '',
    exposureActivity: '',
    anxietyBefore: 5,
    anxietyDuring: 5,
    anxietyAfter: 5,
    duration: 15,
    notes: '',
    completed: false
  })
  const [viewMode, setViewMode] = useState<'plan' | 'track' | 'review'>('plan')
  const [activeTask, setActiveTask] = useState<ExposureTask | null>(null)
  const [exposureTimer, setExposureTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const COMMON_FEARS = [
    'Public speaking',
    'Social interactions',
    'Elevators/enclosed spaces',
    'Heights',
    'Flying',
    'Driving',
    'Medical procedures',
    'Meeting new people',
    'Crowds',
    'Phone calls',
    'Job interviews',
    'Eating in public',
    'Using public restrooms',
    'Being the center of attention'
  ]

  const EXPOSURE_LEVELS = [
    { level: 1, description: 'Very mild - barely noticeable anxiety' },
    { level: 2, description: 'Mild - slight discomfort but manageable' },
    { level: 3, description: 'Moderate - noticeable anxiety but bearable' },
    { level: 4, description: 'High - significant anxiety, challenging' },
    { level: 5, description: 'Very high - intense anxiety, very difficult' }
  ]

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setExposureTimer(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerRunning])

  const handleSave = async () => {
    const task: ExposureTask = {
      id: Date.now().toString(),
      fear: currentTask.fear || '',
      exposureActivity: currentTask.exposureActivity || '',
      anxietyBefore: currentTask.anxietyBefore || 5,
      anxietyDuring: currentTask.anxietyDuring || 5,
      anxietyAfter: currentTask.anxietyAfter || 5,
      date: new Date(),
      duration: exposureTimer > 0 ? Math.floor(exposureTimer / 60) : currentTask.duration || 15,
      notes: currentTask.notes || '',
      completed: false
    }

    try {
      const response = await fetch('/api/self-help/cbt/exposures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })

      if (response.ok) {
        onSave(task)
        setCurrentTask({
          fear: '',
          exposureActivity: '',
          anxietyBefore: 5,
          anxietyDuring: 5,
          anxietyAfter: 5,
          duration: 15,
          notes: '',
          completed: false
        })
        setExposureTimer(0)
        setViewMode('plan')
      }
    } catch (error) {
      console.error('Error saving exposure task:', error)
    }
  }

  const startExposureTimer = () => {
    setIsTimerRunning(true)
    setViewMode('track')
  }

  const stopExposureTimer = () => {
    setIsTimerRunning(false)
  }

  const completeExposure = async () => {
    stopExposureTimer()
    await handleSave()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exposure Therapy Tracker</h2>
          <p className="text-gray-600">Systematic desensitization for anxiety and phobias</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => setViewMode('plan')}
          className={cn(
            "px-4 py-2 rounded-l-lg border",
            viewMode === 'plan' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
          )}
        >
          Plan Exposure
        </button>
        <button
          onClick={() => setViewMode('track')}
          disabled={!currentTask.fear || !currentTask.exposureActivity}
          className={cn(
            "px-4 py-2 border-l-0 border",
            viewMode === 'track' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300",
            (!currentTask.fear || !currentTask.exposureActivity) && "opacity-50 cursor-not-allowed"
          )}
        >
          Track Exposure
        </button>
        <button
          onClick={() => setViewMode('review')}
          className={cn(
            "px-4 py-2 rounded-r-lg border-l-0 border",
            viewMode === 'review' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
          )}
        >
          Review ({tasks.length})
        </button>
      </div>

      {viewMode === 'plan' && (
        <div className="space-y-6">
          {/* Fear/Anxiety Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What fear or anxiety do you want to work on?
            </label>
            <input
              type="text"
              value={currentTask.fear}
              onChange={(e) => setCurrentTask(prev => ({ ...prev, fear: e.target.value }))}
              placeholder="e.g., Speaking in public, Heights, Social situations"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Common Fear Suggestions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Common fears to work on:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_FEARS.map((fear) => (
                <button
                  key={fear}
                  onClick={() => setCurrentTask(prev => ({ ...prev, fear }))}
                  className="p-2 text-sm text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {fear}
                </button>
              ))}
            </div>
          </div>

          {/* Exposure Activity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific exposure activity
            </label>
            <textarea
              value={currentTask.exposureActivity}
              onChange={(e) => setCurrentTask(prev => ({ ...prev, exposureActivity: e.target.value }))}
              placeholder="Describe exactly what you'll do for this exposure. Be specific about the situation, duration, and any safety measures."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Before Anxiety Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current anxiety level about this activity (1-10)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={currentTask.anxietyBefore}
                onChange={(e) => setCurrentTask(prev => ({ 
                  ...prev, 
                  anxietyBefore: Number(e.target.value) 
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>No anxiety (1)</span>
                <span className="font-medium text-lg text-gray-900">{currentTask.anxietyBefore}/10</span>
                <span>Extreme anxiety (10)</span>
              </div>
            </div>
          </div>

          {/* Planned Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={currentTask.duration}
              onChange={(e) => setCurrentTask(prev => ({ ...prev, duration: Number(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Safety Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Safety Guidelines</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Start with lower anxiety levels (3-6) before attempting higher ones</li>
              <li>• Have a safety plan and support person if needed</li>
              <li>• Stop if anxiety becomes overwhelming (9-10 level)</li>
              <li>• Work with a therapist for severe phobias or trauma</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={startExposureTimer}
              disabled={!currentTask.fear?.trim() || !currentTask.exposureActivity?.trim()}
              className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Timer className="w-5 h-5" />
              Start Exposure
            </button>
            <button
              onClick={handleSave}
              disabled={!currentTask.fear?.trim() || !currentTask.exposureActivity?.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Plan
            </button>
          </div>
        </div>
      )}

      {viewMode === 'track' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Exposure in Progress</h3>
            <p className="text-gray-600 mb-4">"{currentTask.exposureActivity}"</p>
            
            {/* Timer Display */}
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
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={377}
                  strokeDashoffset={377 * (1 - exposureTimer / ((currentTask.duration || 15) * 60))}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {formatTime(exposureTimer)}
                </span>
                <span className="text-sm text-gray-600">
                  / {currentTask.duration}min
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Anxiety Tracking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How anxious do you feel RIGHT NOW? ({currentTask.anxietyDuring}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentTask.anxietyDuring}
              onChange={(e) => setCurrentTask(prev => ({ 
                ...prev, 
                anxietyDuring: Number(e.target.value) 
              }))}
              className="w-full"
            />
            <div className="text-center mt-2">
              <span className={cn(
                "text-lg font-bold",
                (currentTask.anxietyDuring || 0) <= 3 ? "text-green-600" :
                (currentTask.anxietyDuring || 0) <= 6 ? "text-yellow-600" :
                "text-red-600"
              )}>
                {(currentTask.anxietyDuring || 0) <= 3 ? "Manageable" :
                 (currentTask.anxietyDuring || 0) <= 6 ? "Moderate" :
                 "High"}
              </span>
            </div>
          </div>

          {/* Emergency Stop */}
          {(currentTask.anxietyDuring || 0) >= 9 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">High Anxiety Detected</h4>
              <p className="text-sm text-red-800 mb-3">
                Your anxiety is very high. Consider stopping if it becomes overwhelming.
              </p>
              <button
                onClick={stopExposureTimer}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Emergency Stop
              </button>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {isTimerRunning ? (
              <button
                onClick={stopExposureTimer}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            ) : (
              <button
                onClick={() => setIsTimerRunning(true)}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
            )}
            
            <button
              onClick={() => {
                // Ask for final anxiety level before completing
                const anxietyAfter = window.prompt("How anxious do you feel now that it's over? (1-10)")
                if (anxietyAfter) {
                  setCurrentTask(prev => ({ ...prev, anxietyAfter: Number(anxietyAfter) }))
                  setTimeout(completeExposure, 100)
                }
              }}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
          </div>
        </div>
      )}

      {viewMode === 'review' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No exposure exercises completed yet. Start with planning an exposure!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.fear}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.exposureActivity}</p>
                    </div>
                    {task.completed && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-medium text-red-700">Before</div>
                      <div className="text-lg font-bold text-red-800">{task.anxietyBefore}/10</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-medium text-yellow-700">During</div>
                      <div className="text-lg font-bold text-yellow-800">{task.anxietyDuring}/10</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-700">After</div>
                      <div className="text-lg font-bold text-green-800">{task.anxietyAfter}/10</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <span>Duration: {task.duration} minutes</span>
                    <span>{new Date(task.date).toLocaleDateString()}</span>
                    <span className={cn(
                      "font-medium",
                      task.anxietyAfter < task.anxietyBefore ? "text-green-600" :
                      task.anxietyAfter === task.anxietyBefore ? "text-yellow-600" :
                      "text-red-600"
                    )}>
                      {task.anxietyAfter < task.anxietyBefore ? "↓ Improved" :
                       task.anxietyAfter === task.anxietyBefore ? "→ Same" :
                       "↑ Increased"}
                    </span>
                  </div>
                  
                  {task.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{task.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}