'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  Brain,
  Heart,
  Activity,
  Download,
  Share2,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Users,
  Lightbulb,
  ArrowRight,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressMetrics {
  mood: {
    current: number
    trend: 'improving' | 'declining' | 'stable'
    weeklyAverage: number
    monthlyAverage: number
    lowestPoint: number
    highestPoint: number
    consistency: number
  }
  activities: {
    completedToday: number
    weeklyGoal: number
    streaks: {
      current: number
      longest: number
    }
    favoriteActivities: Array<{
      name: string
      count: number
      effectiveness: number
    }>
  }
  skills: {
    dbtSkillsUsed: number
    cbtSessionsCompleted: number
    mostUsedSkill: string
    skillEffectiveness: Record<string, number>
    masteryLevels: Record<string, 'learning' | 'practicing' | 'proficient' | 'teaching'>
  }
  goals: Array<{
    id: string
    title: string
    category: 'mood' | 'activity' | 'skills' | 'social' | 'self-care'
    progress: number
    target: number
    deadline: Date
    status: 'on-track' | 'behind' | 'at-risk' | 'completed'
  }>
  insights: Array<{
    id: string
    type: 'pattern' | 'achievement' | 'suggestion' | 'warning'
    title: string
    description: string
    actionable: boolean
    priority: 'low' | 'medium' | 'high'
  }>
  milestones: Array<{
    id: string
    title: string
    description: string
    achievedDate: Date
    category: string
    impact: 'small' | 'medium' | 'large'
  }>
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill?: boolean
  }>
}

export default function ProgressDashboard() {
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'mood' | 'activities' | 'skills' | 'goals'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'mood' as const,
    target: 1,
    deadline: new Date()
  })

  useEffect(() => {
    loadProgressData()
  }, [selectedTimeframe])

  const loadProgressData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/progress/metrics?timeframe=${selectedTimeframe}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      const response = await fetch('/api/progress/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timeframe: selectedTimeframe,
          includeGraphs: true,
          format: 'pdf'
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `progress-report-${selectedTimeframe}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const createGoal = async () => {
    try {
      const response = await fetch('/api/progress/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          deadline: newGoal.deadline.toISOString()
        })
      })
      
      if (response.ok) {
        setShowGoalModal(false)
        setNewGoal({ title: '', category: 'mood', target: 1, deadline: new Date() })
        await loadProgressData()
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data Yet</h3>
          <p className="text-gray-600 mb-4">Start using self-help tools to see your progress</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Explore Tools
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
          <p className="text-gray-600">Track your mental health journey and celebrate wins</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-1">
        <div className="flex">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'mood', name: 'Mood', icon: Heart },
            { id: 'activities', name: 'Activities', icon: Activity },
            { id: 'skills', name: 'Skills', icon: Brain },
            { id: 'goals', name: 'Goals', icon: Target }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center",
                  selectedView === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <OverviewView key="overview" metrics={metrics} />
        )}
        {selectedView === 'mood' && (
          <MoodView key="mood" metrics={metrics} timeframe={selectedTimeframe} />
        )}
        {selectedView === 'activities' && (
          <ActivitiesView key="activities" metrics={metrics} />
        )}
        {selectedView === 'skills' && (
          <SkillsView key="skills" metrics={metrics} />
        )}
        {selectedView === 'goals' && (
          <GoalsView key="goals" metrics={metrics} onRefresh={loadProgressData} />
        )}
      </AnimatePresence>

      {/* Goal Creation Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <GoalCreationModal
            goal={newGoal}
            onGoalChange={setNewGoal}
            onSave={createGoal}
            onClose={() => setShowGoalModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Overview View Component
function OverviewView({ metrics }: { metrics: ProgressMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Mood"
          value={`${metrics.mood.current}/10`}
          trend={metrics.mood.trend}
          icon={Heart}
          color="text-red-600 bg-red-100"
          subtitle={`${metrics.mood.weeklyAverage.toFixed(1)} avg this week`}
        />
        
        <MetricCard
          title="Activities Today"
          value={`${metrics.activities.completedToday}/${metrics.activities.weeklyGoal}`}
          trend={metrics.activities.completedToday >= (metrics.activities.weeklyGoal / 7) ? 'improving' : 'declining'}
          icon={Activity}
          color="text-blue-600 bg-blue-100"
          subtitle={`${metrics.activities.streaks.current} day streak`}
        />
        
        <MetricCard
          title="Skills Practiced"
          value={metrics.skills.dbtSkillsUsed + metrics.skills.cbtSessionsCompleted}
          trend="improving"
          icon={Brain}
          color="text-purple-600 bg-purple-100"
          subtitle={`Most used: ${metrics.skills.mostUsedSkill}`}
        />
        
        <MetricCard
          title="Goals Progress"
          value={`${metrics.goals.filter(g => g.status === 'completed').length}/${metrics.goals.length}`}
          trend={metrics.goals.filter(g => g.status === 'on-track').length > metrics.goals.filter(g => g.status === 'behind').length ? 'improving' : 'stable'}
          icon={Target}
          color="text-green-600 bg-green-100"
          subtitle="goals completed"
        />
      </div>

      {/* AI Insights */}
      {metrics.insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          
          <div className="space-y-4">
            {metrics.insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "p-4 rounded-lg border-l-4",
                  insight.type === 'achievement' ? "border-green-500 bg-green-50" :
                  insight.type === 'warning' ? "border-red-500 bg-red-50" :
                  insight.type === 'suggestion' ? "border-blue-500 bg-blue-50" :
                  "border-gray-500 bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                  {insight.actionable && (
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Milestones */}
      {metrics.milestones.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Milestones</h3>
          </div>
          
          <div className="space-y-3">
            {metrics.milestones.slice(0, 5).map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  milestone.impact === 'large' ? "bg-yellow-500" :
                  milestone.impact === 'medium' ? "bg-yellow-400" :
                  "bg-yellow-300"
                )}>
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
                <span className="text-sm text-gray-700">
                  {new Date(milestone.achievedDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  trend?: 'improving' | 'declining' | 'stable'
  icon: React.ComponentType<{ className?: string }>
  color: string
  subtitle?: string
}

function MetricCard({ title, value, trend, icon: IconComponent, color, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <IconComponent className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1",
            trend === 'improving' ? "text-green-600" :
            trend === 'declining' ? "text-red-600" :
            "text-gray-600"
          )}>
            {trend === 'improving' && <TrendingUp className="w-4 h-4" />}
            {trend === 'declining' && <TrendingDown className="w-4 h-4" />}
            {trend === 'stable' && <div className="w-4 h-4 bg-current rounded-full" />}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-700 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

// Mood View Component (simplified for space)
function MoodView({ metrics, timeframe }: { metrics: ProgressMetrics; timeframe: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-700">Mood chart visualization would go here</p>
        </div>
      </div>
    </motion.div>
  )
}

// Other view components would follow similar patterns...
function ActivitiesView({ metrics }: { metrics: ProgressMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Analytics</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-700">Activity analytics would go here</p>
        </div>
      </div>
    </motion.div>
  )
}

function SkillsView({ metrics }: { metrics: ProgressMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Progress</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-700">Skills progress visualization would go here</p>
        </div>
      </div>
    </motion.div>
  )
}

function GoalsView({ metrics, onRefresh }: { metrics: ProgressMetrics; onRefresh: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.goals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{goal.title}</h3>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                goal.status === 'completed' ? "bg-green-100 text-green-700" :
                goal.status === 'on-track' ? "bg-blue-100 text-blue-700" :
                goal.status === 'behind' ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              )}>
                {goal.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}/{goal.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4" />
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Goal Creation Modal
interface GoalCreationModalProps {
  goal: any
  onGoalChange: (goal: any) => void
  onSave: () => void
  onClose: () => void
}

function GoalCreationModal({ goal, onGoalChange, onSave, onClose }: GoalCreationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Goal</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
            <input
              type="text"
              value={goal.title}
              onChange={(e) => onGoalChange({ ...goal, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Complete 5 breathing exercises per week"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={goal.category}
              onChange={(e) => onGoalChange({ ...goal, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="mood">Mood</option>
              <option value="activity">Activity</option>
              <option value="skills">Skills</option>
              <option value="social">Social</option>
              <option value="self-care">Self-care</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
            <input
              type="number"
              value={goal.target}
              onChange={(e) => onGoalChange({ ...goal, target: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              value={goal.deadline.toISOString().split('T')[0]}
              onChange={(e) => onGoalChange({ ...goal, deadline: new Date(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onSave}
            disabled={!goal.title.trim()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create Goal
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}