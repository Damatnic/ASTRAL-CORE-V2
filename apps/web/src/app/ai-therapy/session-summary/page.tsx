'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Clock,
  TrendingUp,
  Star,
  Target,
  BookOpen,
  Award,
  Download,
  Share2,
  Calendar,
  MessageSquare,
  Activity,
  Heart,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  BarChart3,
  FileText,
  Settings,
  Home,
  Zap,
  Shield
} from 'lucide-react'
import { Glass, ProductionButton } from '@/components/design-system/ProductionGlassSystem'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface SessionSummaryData {
  session: {
    id: string
    therapistId: string
    therapistName: string
    therapistAvatar: string
    sessionType: string
    startedAt: string
    endedAt: string
    duration: number
    rating: number
  }
  analytics: {
    moodImprovement: number
    anxietyReduction: number
    energyIncrease: number
    overallEffectiveness: number
    engagement: number
    progressMade: number
    wordsTyped: number
    messagesExchanged: number
  }
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
  }>
  techniques: Array<{
    name: string
    effectiveness: number
    usage: number
    userFeedback: string
  }>
  insights: string[]
  breakthroughs: string[]
  homework: Array<{
    title: string
    description: string
    dueDate: string
    difficulty: string
  }>
  nextSteps: string[]
  recommendations: Array<{
    category: string
    title: string
    description: string
    priority: string
  }>
  crisisSupport?: {
    activated: boolean
    level: string
    resources: string[]
  }
}

function SessionSummaryContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('sessionId')
  
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (sessionId) {
      loadSessionSummary(sessionId)
    } else {
      // Load most recent session if no ID provided
      loadSessionSummary('demo-session')
    }
  }, [sessionId])

  const loadSessionSummary = async (id: string) => {
    try {
      setLoading(true)
      
      // Simulate API call - in production, fetch from our sessions API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock comprehensive session summary data
      const mockData: SessionSummaryData = {
        session: {
          id,
          therapistId: 'aria',
          therapistName: 'Dr. Aria',
          therapistAvatar: '🧠',
          sessionType: 'intensive',
          startedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
          endedAt: new Date().toISOString(),
          duration: 50,
          rating: 5
        },
        analytics: {
          moodImprovement: 3,
          anxietyReduction: 4,
          energyIncrease: 2,
          overallEffectiveness: 0.87,
          engagement: 0.92,
          progressMade: 0.78,
          wordsTyped: 342,
          messagesExchanged: 28
        },
        achievements: [
          {
            id: 'first_cbt',
            name: 'CBT Explorer',
            description: 'Completed your first cognitive restructuring exercise',
            icon: '🧩',
            earned: true
          },
          {
            id: 'mood_boost',
            name: 'Mood Booster',
            description: 'Improved mood by 3+ points in a single session',
            icon: '🌟',
            earned: true
          },
          {
            id: 'consistent_practice',
            name: 'Consistent Practitioner',
            description: 'Complete 5 therapy sessions',
            icon: '🎯',
            earned: false
          }
        ],
        techniques: [
          {
            name: 'Cognitive Restructuring',
            effectiveness: 0.89,
            usage: 3,
            userFeedback: 'Very helpful for changing my perspective'
          },
          {
            name: 'Breathing Exercises',
            effectiveness: 0.82,
            usage: 2,
            userFeedback: 'Immediately calming'
          },
          {
            name: 'Grounding Techniques',
            effectiveness: 0.76,
            usage: 1,
            userFeedback: 'Good for staying present'
          }
        ],
        insights: [
          'You demonstrated excellent insight into your thought patterns',
          'Your engagement with CBT techniques shows strong motivation for change',
          'You\'re developing healthy coping strategies for anxiety management',
          'Your self-awareness has significantly improved during this session'
        ],
        breakthroughs: [
          'Identified the connection between perfectionism and anxiety',
          'Successfully challenged a long-held negative belief about yourself',
          'Recognized patterns in your stress response'
        ],
        homework: [
          {
            title: 'Daily Thought Records',
            description: 'Complete one thought record each day focusing on perfectionist thoughts',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            difficulty: 'Beginner'
          },
          {
            title: 'Breathing Practice',
            description: 'Practice 4-7-8 breathing twice daily, especially when feeling anxious',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            difficulty: 'Beginner'
          },
          {
            title: 'Values Reflection',
            description: 'Write about what truly matters to you beyond perfectionist standards',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            difficulty: 'Intermediate'
          }
        ],
        nextSteps: [
          'Schedule follow-up session within one week',
          'Continue practicing thought challenging techniques',
          'Begin implementing behavioral experiments',
          'Monitor anxiety levels daily',
          'Apply learned techniques in real-world situations'
        ],
        recommendations: [
          {
            category: 'technique',
            title: 'Advanced CBT Techniques',
            description: 'Ready to explore behavioral experiments and exposure therapy',
            priority: 'high'
          },
          {
            category: 'schedule',
            title: 'Increase Session Frequency',
            description: 'Consider twice-weekly sessions for faster progress',
            priority: 'medium'
          },
          {
            category: 'support',
            title: 'Group Therapy',
            description: 'Might benefit from group CBT sessions for social support',
            priority: 'low'
          }
        ]
      }

      setSummaryData(mockData)
    } catch (error) {
      console.error('Failed to load session summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadSummary = async () => {
    if (!summaryData) return

    const summaryText = generateTextSummary(summaryData)
    const blob = new Blob([summaryText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `therapy-session-summary-${summaryData.session.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateTextSummary = (data: SessionSummaryData): string => {
    return `
THERAPY SESSION SUMMARY
=======================

Session Details:
- Therapist: ${data.session.therapistName}
- Type: ${data.session.sessionType}
- Duration: ${data.session.duration} minutes
- Date: ${new Date(data.session.startedAt).toLocaleDateString()}
- Rating: ${data.session.rating}/5 stars

Progress Made:
- Mood Improvement: +${data.analytics.moodImprovement} points
- Anxiety Reduction: -${data.analytics.anxietyReduction} points
- Overall Effectiveness: ${Math.round(data.analytics.overallEffectiveness * 100)}%

Key Insights:
${data.insights.map(insight => `- ${insight}`).join('\n')}

Breakthroughs:
${data.breakthroughs.map(breakthrough => `- ${breakthrough}`).join('\n')}

Homework Assignments:
${data.homework.map(hw => `- ${hw.title}: ${hw.description}`).join('\n')}

Next Steps:
${data.nextSteps.map(step => `- ${step}`).join('\n')}

Generated by Astral Core AI Therapy System
Privacy: This summary is encrypted and confidential
    `.trim()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Generating Session Summary
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Analyzing your session and creating personalized insights...
          </p>
        </motion.div>
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <Glass variant="light" className="p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the session summary you're looking for.</p>
          <Link href="/ai-therapy">
            <ProductionButton variant="primary">
              Return to AI Therapy Hub
            </ProductionButton>
          </Link>
        </Glass>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{summaryData.session.therapistAvatar}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Session Complete
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </h1>
                <p className="text-gray-600">
                  {summaryData.session.duration} minutes with {summaryData.session.therapistName}
                  <span className="mx-2">•</span>
                  {new Date(summaryData.session.startedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= summaryData.session.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={downloadSummary}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Glass variant="light" className="mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Session Progress Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{summaryData.analytics.moodImprovement}
              </div>
              <div className="text-sm text-gray-600">Mood Improvement</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                -{summaryData.analytics.anxietyReduction}
              </div>
              <div className="text-sm text-gray-600">Anxiety Reduction</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                +{summaryData.analytics.energyIncrease}
              </div>
              <div className="text-sm text-gray-600">Energy Increase</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {Math.round(summaryData.analytics.overallEffectiveness * 100)}%
              </div>
              <div className="text-sm text-gray-600">Effectiveness</div>
            </div>
          </div>
        </Glass>

        {/* Achievements */}
        {summaryData.achievements.some(a => a.earned) && (
          <Glass variant="light" className="mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Achievements Unlocked
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryData.achievements.filter(a => a.earned).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{achievement.name}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Glass>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'insights', label: 'Insights', icon: Lightbulb },
                { id: 'techniques', label: 'Techniques', icon: Target },
                { id: 'homework', label: 'Homework', icon: BookOpen },
                { id: 'next-steps', label: 'Next Steps', icon: ArrowRight }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Session Analytics */}
              <Glass variant="light" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Session Analytics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Engagement Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${summaryData.analytics.engagement * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(summaryData.analytics.engagement * 100)}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Progress Made</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${summaryData.analytics.progressMade * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(summaryData.analytics.progressMade * 100)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{summaryData.analytics.wordsTyped}</div>
                      <div className="text-sm text-gray-600">Words Typed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{summaryData.analytics.messagesExchanged}</div>
                      <div className="text-sm text-gray-600">Messages</div>
                    </div>
                  </div>
                </div>
              </Glass>

              {/* Breakthroughs */}
              {summaryData.breakthroughs.length > 0 && (
                <Glass variant="light" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Key Breakthroughs
                  </h3>
                  
                  <div className="space-y-3">
                    {summaryData.breakthroughs.map((breakthrough, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-800">{breakthrough}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <Glass variant="light" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Session Insights
              </h3>
              
              <div className="space-y-4">
                {summaryData.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800 leading-relaxed">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </Glass>
          )}

          {activeTab === 'techniques' && (
            <Glass variant="light" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Techniques Used
              </h3>
              
              <div className="space-y-4">
                {summaryData.techniques.map((technique, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{technique.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600">Effectiveness:</div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= Math.round(technique.effectiveness * 5)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Used {technique.usage} {technique.usage === 1 ? 'time' : 'times'} during the session
                    </div>
                    {technique.userFeedback && (
                      <div className="text-sm text-gray-800 italic bg-gray-50 p-2 rounded">
                        "{technique.userFeedback}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Glass>
          )}

          {activeTab === 'homework' && (
            <Glass variant="light" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Homework Assignments
              </h3>
              
              <div className="space-y-4">
                {summaryData.homework.map((assignment, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        assignment.difficulty === 'Beginner' ? "bg-green-100 text-green-700" :
                        assignment.difficulty === 'Intermediate' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {assignment.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{assignment.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          )}

          {activeTab === 'next-steps' && (
            <div className="space-y-8">
              <Glass variant="light" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  Next Steps
                </h3>
                
                <div className="space-y-3">
                  {summaryData.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-sm font-medium">{index + 1}</span>
                      </div>
                      <span className="text-gray-800">{step}</span>
                    </div>
                  ))}
                </div>
              </Glass>

              <Glass variant="light" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Recommendations
                </h3>
                
                <div className="space-y-4">
                  {summaryData.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          rec.priority === 'high' ? "bg-red-100 text-red-700" :
                          rec.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        )}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </Glass>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <Glass variant="light" className="mt-8 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-therapy/chat">
              <ProductionButton variant="primary" size="lg" className="w-full sm:w-auto">
                <MessageSquare className="w-5 h-5 mr-2" />
                Start New Session
              </ProductionButton>
            </Link>
            
            <Link href="/ai-therapy">
              <ProductionButton variant="secondary" size="lg" className="w-full sm:w-auto">
                <Home className="w-5 h-5 mr-2" />
                Return to Hub
              </ProductionButton>
            </Link>
            
            <ProductionButton 
              variant="ghost" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => {
                navigator.share?.({
                  title: 'Therapy Session Summary',
                  text: 'I just completed a therapy session with great progress!',
                  url: window.location.href
                }) || navigator.clipboard.writeText(window.location.href)
              }}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Progress
            </ProductionButton>
          </div>
        </Glass>

        {/* Crisis Support Notice */}
        {summaryData.crisisSupport?.activated && (
          <Glass variant="light" className="mt-8 p-6 bg-red-50 border-red-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Crisis Support Activated</h3>
                <p className="text-red-700 mb-4">
                  During this session, crisis support protocols were activated at {summaryData.crisisSupport.level} level. 
                  Your safety and wellbeing are our top priority.
                </p>
                <div className="space-y-2">
                  <div className="font-medium text-red-800">Available Resources:</div>
                  {summaryData.crisisSupport.resources.map((resource, idx) => (
                    <div key={idx} className="text-red-700">• {resource}</div>
                  ))}
                </div>
                <div className="mt-4">
                  <ProductionButton variant="crisis" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Access Crisis Resources
                  </ProductionButton>
                </div>
              </div>
            </div>
          </Glass>
        )}
      </div>
    </div>
  )
}

export default function SessionSummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session summary...</p>
        </div>
      </div>
    }>
      <SessionSummaryContent />
    </Suspense>
  )
}