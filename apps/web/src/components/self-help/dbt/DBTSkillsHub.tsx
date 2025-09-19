'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Heart,
  Users,
  Brain,
  Target,
  Clock,
  CheckCircle,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DBTSkill {
  id: string
  category: 'distress-tolerance' | 'emotion-regulation' | 'interpersonal-effectiveness' | 'mindfulness'
  name: string
  acronym: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: string[]
  practiceScenarios: Array<{
    situation: string
    guidance: string
    expectedOutcome: string
  }>
  benefits: string[]
  contraindications?: string[]
  relatedSkills: string[]
}

interface UserProgress {
  skillId: string
  practiceCount: number
  lastPracticed: Date
  effectiveness: number // 1-10 scale
  notes: string[]
  mastery: 'learning' | 'practicing' | 'proficient' | 'teaching'
}

const DBT_CATEGORIES = [
  {
    id: 'distress-tolerance',
    name: 'Distress Tolerance',
    description: 'Skills for surviving crisis situations without making them worse',
    icon: Shield,
    color: 'text-red-600 bg-red-100',
    skills: ['TIPP', 'PLEASE', 'ACCEPTS', 'IMPROVE', 'Radical Acceptance']
  },
  {
    id: 'emotion-regulation',
    name: 'Emotion Regulation',
    description: 'Tools for understanding and managing difficult emotions',
    icon: Heart,
    color: 'text-pink-600 bg-pink-100',
    skills: ['PLEASE Skills', 'Opposite Action', 'STOP', 'Wise Mind', 'Emotion Surfing']
  },
  {
    id: 'interpersonal-effectiveness',
    name: 'Interpersonal Effectiveness',
    description: 'Communication skills for healthy relationships',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    skills: ['DEARMAN', 'GIVE', 'FAST', 'SET', 'Validation']
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present-moment awareness and acceptance practices',
    icon: Brain,
    color: 'text-purple-600 bg-purple-100',
    skills: ['Observe', 'Describe', 'Participate', 'One-mindfully', 'Wise Mind']
  }
]

const DBT_SKILLS: DBTSkill[] = [
  {
    id: 'tipp',
    category: 'distress-tolerance',
    name: 'TIPP',
    acronym: 'Temperature, Intense Exercise, Paced Breathing, Paired Muscle Relaxation',
    description: 'Fast-acting techniques to change body chemistry and reduce intense emotions',
    difficulty: 'beginner',
    estimatedTime: '5-15 minutes',
    steps: [
      'Temperature: Use cold water on face/hands or hold ice cubes',
      'Intense Exercise: Do jumping jacks, run in place, or intense movement for 10+ minutes',
      'Paced Breathing: Exhale longer than inhale (4 in, 6 out)',
      'Paired Muscle Relaxation: Tense and release muscle groups systematically'
    ],
    practiceScenarios: [
      {
        situation: 'Feeling overwhelmed before an important meeting',
        guidance: 'Start with cold water on wrists and face, then practice paced breathing',
        expectedOutcome: 'Reduced anxiety and clearer thinking within 2-3 minutes'
      },
      {
        situation: 'Anger rising during a conflict',
        guidance: 'Excuse yourself and do intense exercise for 10 minutes',
        expectedOutcome: 'Physical tension release and emotional regulation'
      }
    ],
    benefits: [
      'Rapid emotional regulation',
      'Activates parasympathetic nervous system',
      'Reduces fight-or-flight response',
      'Can be used anywhere'
    ],
    contraindications: [
      'Heart conditions (consult doctor before intense exercise)',
      'Eating disorders (be cautious with temperature techniques)'
    ],
    relatedSkills: ['PLEASE Skills', 'Paced Breathing', 'Progressive Muscle Relaxation']
  },
  {
    id: 'please',
    category: 'emotion-regulation',
    name: 'PLEASE Skills',
    acronym: 'Treat PhysicaL illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise',
    description: 'Taking care of your body to help regulate emotions',
    difficulty: 'beginner',
    estimatedTime: 'Ongoing daily practice',
    steps: [
      'Physical Illness: Treat any physical health issues promptly',
      'Eating: Maintain regular, balanced meals and avoid extreme hunger',
      'Substances: Avoid alcohol, drugs, and limit caffeine',
      'Sleep: Maintain consistent sleep schedule (7-9 hours)',
      'Exercise: Regular physical activity appropriate for your fitness level'
    ],
    practiceScenarios: [
      {
        situation: 'Feeling emotionally unstable throughout the week',
        guidance: 'Review each PLEASE component and identify what needs attention',
        expectedOutcome: 'Improved emotional baseline and resilience'
      },
      {
        situation: 'Preparing for a stressful period',
        guidance: 'Proactively strengthen PLEASE practices as prevention',
        expectedOutcome: 'Better ability to handle upcoming stress'
      }
    ],
    benefits: [
      'Reduces emotional vulnerability',
      'Improves overall mental health',
      'Creates stable foundation for other skills',
      'Prevents emotional crises'
    ],
    relatedSkills: ['TIPP', 'Mindfulness', 'Wise Mind']
  },
  {
    id: 'dearman',
    category: 'interpersonal-effectiveness',
    name: 'DEARMAN',
    acronym: 'Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate',
    description: 'Structured approach for asking for what you want or saying no effectively',
    difficulty: 'intermediate',
    estimatedTime: '10-20 minutes preparation',
    steps: [
      'Describe: State the facts objectively without judgment',
      'Express: Share your feelings and thoughts about the situation',
      'Assert: Ask clearly for what you want or say no directly',
      'Reinforce: Explain the benefits or consequences',
      'Mindful: Stay focused on your goal, ignore attacks or distractions',
      'Appear Confident: Use confident body language and tone',
      'Negotiate: Be willing to compromise when appropriate'
    ],
    practiceScenarios: [
      {
        situation: 'Asking your boss for a raise',
        guidance: 'Prepare each DEARMAN component in advance, practice confident delivery',
        expectedOutcome: 'Clear communication of your request with increased chance of success'
      },
      {
        situation: 'Setting boundaries with a friend who calls too often',
        guidance: 'Use gentle but firm language, focus on your needs not their behavior',
        expectedOutcome: 'Maintained friendship with healthier boundaries'
      }
    ],
    benefits: [
      'Increases effectiveness in getting needs met',
      'Reduces relationship conflicts',
      'Builds self-respect and confidence',
      'Improves communication skills'
    ],
    relatedSkills: ['GIVE', 'FAST', 'Validation']
  },
  {
    id: 'wise-mind',
    category: 'mindfulness',
    name: 'Wise Mind',
    acronym: 'Integration of Emotion Mind and Reasonable Mind',
    description: 'Finding the balanced perspective that considers both logic and emotion',
    difficulty: 'intermediate',
    estimatedTime: '10-15 minutes',
    steps: [
      'Notice Emotion Mind: Identify when emotions are driving decisions',
      'Notice Reasonable Mind: Recognize when logic dominates without feeling',
      'Find the Center: Breathe deeply and seek the space between extremes',
      'Ask Wise Mind: "What is the wisest response in this situation?"',
      'Trust the Answer: Act from this balanced, integrated perspective'
    ],
    practiceScenarios: [
      {
        situation: 'Deciding whether to end a relationship',
        guidance: 'Examine both emotional reactions and logical considerations',
        expectedOutcome: 'Decision that honors both heart and mind'
      },
      {
        situation: 'Facing a career change opportunity',
        guidance: 'Balance excitement/fear with practical considerations',
        expectedOutcome: 'Confident decision based on complete information'
      }
    ],
    benefits: [
      'Better decision-making',
      'Reduced regret and second-guessing',
      'Integration of all aspects of experience',
      'Increased self-trust'
    ],
    relatedSkills: ['Mindfulness', 'Observe', 'Describe']
  }
]

export default function DBTSkillsHub() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<DBTSkill | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [activeScenario, setActiveScenario] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserProgress()
  }, [])

  const loadUserProgress = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/self-help/dbt/progress')
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data.progress || [])
      }
    } catch (error) {
      console.error('Error loading DBT progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSkillProgress = (skillId: string): UserProgress | null => {
    return userProgress.find(p => p.skillId === skillId) || null
  }

  const startSkillPractice = async (skill: DBTSkill) => {
    try {
      const response = await fetch('/api/self-help/dbt/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: skill.id,
          action: 'start',
          timestamp: new Date()
        })
      })
      
      if (response.ok) {
        setSelectedSkill(skill)
        setActiveScenario(0)
      }
    } catch (error) {
      console.error('Error starting practice:', error)
    }
  }

  const completeSkillPractice = async (effectiveness: number, notes: string) => {
    if (!selectedSkill) return

    try {
      const response = await fetch('/api/self-help/dbt/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          action: 'complete',
          effectiveness,
          notes,
          timestamp: new Date()
        })
      })
      
      if (response.ok) {
        await loadUserProgress()
        setSelectedSkill(null)
      }
    } catch (error) {
      console.error('Error completing practice:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DBT Skills Training</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Dialectical Behavior Therapy skills for emotional regulation, distress tolerance, 
          interpersonal effectiveness, and mindfulness
        </p>
      </div>

      {/* Skill Categories */}
      {!selectedCategory && !selectedSkill && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DBT_CATEGORIES.map((category) => {
            const IconComponent = category.icon
            const completedSkills = DBT_SKILLS
              .filter(skill => skill.category === category.id)
              .filter(skill => {
                const progress = getSkillProgress(skill.id)
                return progress && progress.mastery !== 'learning'
              }).length
            
            const totalSkills = DBT_SKILLS.filter(skill => skill.category === category.id).length

            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all"
              >
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", category.color)}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{totalSkills} skills</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">{completedSkills}/{totalSkills}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(completedSkills / totalSkills) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Category Skills List */}
      {selectedCategory && !selectedSkill && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Categories
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {DBT_CATEGORIES.find(c => c.id === selectedCategory)?.name} Skills
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DBT_SKILLS
              .filter(skill => skill.category === selectedCategory)
              .map((skill) => {
                const progress = getSkillProgress(skill.id)
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                        <p className="text-sm text-gray-700 font-mono">{skill.acronym}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          skill.difficulty === 'beginner' ? "bg-green-100 text-green-700" :
                          skill.difficulty === 'intermediate' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {skill.difficulty}
                        </span>
                        {progress && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{progress.practiceCount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{skill.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4" />
                        {skill.estimatedTime}
                      </div>
                      <button
                        onClick={() => startSkillPractice(skill)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Practice
                      </button>
                    </div>

                    {progress && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Last practiced: {new Date(progress.lastPracticed).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">{progress.effectiveness}/10</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
          </div>
        </div>
      )}

      {/* Skill Practice Interface */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillPracticeInterface
            skill={selectedSkill}
            activeScenario={activeScenario}
            onScenarioChange={setActiveScenario}
            onComplete={completeSkillPractice}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface SkillPracticeInterfaceProps {
  skill: DBTSkill
  activeScenario: number
  onScenarioChange: (index: number) => void
  onComplete: (effectiveness: number, notes: string) => void
  onClose: () => void
}

function SkillPracticeInterface({ 
  skill, 
  activeScenario, 
  onScenarioChange, 
  onComplete, 
  onClose 
}: SkillPracticeInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [effectiveness, setEffectiveness] = useState(5)
  const [notes, setNotes] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    await onComplete(effectiveness, notes)
    setIsCompleting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{skill.name}</h2>
              <p className="text-gray-600">{skill.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Steps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
            <div className="space-y-3">
              {skill.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all cursor-pointer",
                    index === currentStep 
                      ? "border-blue-500 bg-blue-50" 
                      : index < currentStep 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-200 bg-gray-50"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                      index === currentStep 
                        ? "bg-blue-500 text-white" 
                        : index < currentStep 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-300 text-gray-600"
                    )}>
                      {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <p className="text-gray-700 flex-1">{step}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(skill.steps.length - 1, currentStep + 1))}
                disabled={currentStep === skill.steps.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Practice Scenarios */}
          {skill.practiceScenarios.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Scenarios</h3>
              <div className="space-y-4">
                {skill.practiceScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      index === activeScenario ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    )}
                    onClick={() => onScenarioChange(index)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">Scenario {index + 1}</h4>
                    <p className="text-gray-700 mb-2"><strong>Situation:</strong> {scenario.situation}</p>
                    <p className="text-gray-700 mb-2"><strong>Guidance:</strong> {scenario.guidance}</p>
                    <p className="text-gray-700"><strong>Expected Outcome:</strong> {scenario.expectedOutcome}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Reflection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How effective was this practice? (1-10)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={effectiveness}
                    onChange={(e) => setEffectiveness(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 w-8">{effectiveness}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did this skill work for you? What did you notice?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isCompleting ? 'Saving...' : 'Complete Practice'}
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}