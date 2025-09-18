'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Heart,
  Brain,
  Shield,
  Users,
  Activity,
  AlertTriangle,
  Settings,
  BarChart3,
  MessageCircle,
  Calendar,
  FileText,
  Phone,
  Clock,
  Zap,
  Eye,
  Lock,
  UserCheck,
  Stethoscope,
  Crown,
  Home,
  LogOut,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

interface DashboardRoute {
  id: string
  name: string
  path: string
  icon: React.ReactNode
  description: string
  roles: string[]
  badge?: string
  priority: number
}

interface RoleConfig {
  role: string
  name: string
  color: string
  avatar: string
  defaultRoute: string
  features: string[]
}

const DASHBOARD_ROUTES: DashboardRoute[] = [
  // Patient Routes
  {
    id: 'patient_home',
    name: 'My Dashboard',
    path: '/dashboard/patient',
    icon: <Home className="w-5 h-5" />,
    description: 'Personal wellness overview and quick access tools',
    roles: ['patient'],
    priority: 1
  },
  {
    id: 'crisis_tools',
    name: 'Crisis Support',
    path: '/crisis',
    icon: <Shield className="w-5 h-5" />,
    description: 'Immediate crisis intervention and safety resources',
    roles: ['patient'],
    badge: '24/7',
    priority: 2
  },
  {
    id: 'self_help',
    name: 'Self-Help Tools',
    path: '/self-help',
    icon: <Brain className="w-5 h-5" />,
    description: 'Comprehensive toolkit for mental wellness',
    roles: ['patient'],
    priority: 3
  },
  {
    id: 'ai_therapy',
    name: 'AI Therapy',
    path: '/ai-therapy',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Conversational therapy with AI specialists',
    roles: ['patient'],
    priority: 4
  },
  {
    id: 'mood_tracking',
    name: 'Mood Tracking',
    path: '/mood-tracking',
    icon: <Activity className="w-5 h-5" />,
    description: 'Track and analyze your emotional wellbeing',
    roles: ['patient'],
    priority: 5
  },
  {
    id: 'safety_plan',
    name: 'Safety Plan',
    path: '/safety-plan',
    icon: <FileText className="w-5 h-5" />,
    description: 'Personal safety planning and crisis preparation',
    roles: ['patient'],
    priority: 6
  },

  // Therapist Routes
  {
    id: 'therapist_dashboard',
    name: 'Therapist Dashboard',
    path: '/dashboard/therapist',
    icon: <Stethoscope className="w-5 h-5" />,
    description: 'Patient overview and session management',
    roles: ['therapist'],
    priority: 1
  },
  {
    id: 'patient_list',
    name: 'My Patients',
    path: '/therapist/patients',
    icon: <Users className="w-5 h-5" />,
    description: 'Patient roster and care management',
    roles: ['therapist'],
    priority: 2
  },
  {
    id: 'session_management',
    name: 'Sessions',
    path: '/therapist/sessions',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Schedule and manage therapy sessions',
    roles: ['therapist'],
    priority: 3
  },
  {
    id: 'crisis_alerts',
    name: 'Crisis Alerts',
    path: '/therapist/alerts',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Monitor patient crisis indicators and alerts',
    roles: ['therapist', 'crisis_counselor'],
    badge: 'Live',
    priority: 4
  },
  {
    id: 'progress_analytics',
    name: 'Progress Analytics',
    path: '/therapist/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Patient progress tracking and outcomes',
    roles: ['therapist'],
    priority: 5
  },

  // Crisis Counselor Routes
  {
    id: 'crisis_dashboard',
    name: 'Crisis Center',
    path: '/dashboard/crisis-counselor',
    icon: <Shield className="w-5 h-5" />,
    description: 'Real-time crisis monitoring and intervention',
    roles: ['crisis_counselor'],
    badge: '24/7',
    priority: 1
  },
  {
    id: 'active_crises',
    name: 'Active Crises',
    path: '/crisis/active',
    icon: <Zap className="w-5 h-5" />,
    description: 'Current crisis situations requiring attention',
    roles: ['crisis_counselor'],
    priority: 2
  },
  {
    id: 'crisis_chat',
    name: 'Crisis Chat',
    path: '/crisis/chat',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Anonymous crisis support chat system',
    roles: ['crisis_counselor'],
    priority: 3
  },
  {
    id: 'emergency_protocols',
    name: 'Emergency Protocols',
    path: '/crisis/protocols',
    icon: <Phone className="w-5 h-5" />,
    description: 'Emergency response procedures and contacts',
    roles: ['crisis_counselor'],
    priority: 4
  },

  // Family Member Routes
  {
    id: 'family_dashboard',
    name: 'Family Dashboard',
    path: '/dashboard/family',
    icon: <Heart className="w-5 h-5" />,
    description: 'Wellness overview for your loved one',
    roles: ['family_member'],
    priority: 1
  },
  {
    id: 'wellness_indicators',
    name: 'Wellness Check',
    path: '/family/wellness',
    icon: <Activity className="w-5 h-5" />,
    description: 'Monitor general wellness indicators',
    roles: ['family_member'],
    priority: 2
  },
  {
    id: 'family_resources',
    name: 'Family Resources',
    path: '/family/resources',
    icon: <FileText className="w-5 h-5" />,
    description: 'Educational resources and support materials',
    roles: ['family_member'],
    priority: 3
  },

  // Admin Routes
  {
    id: 'admin_dashboard',
    name: 'Admin Dashboard',
    path: '/dashboard/admin',
    icon: <Crown className="w-5 h-5" />,
    description: 'Platform administration and management',
    roles: ['admin'],
    priority: 1
  },
  {
    id: 'user_management',
    name: 'User Management',
    path: '/admin/users',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Manage platform users and permissions',
    roles: ['admin'],
    priority: 2
  },
  {
    id: 'system_analytics',
    name: 'System Analytics',
    path: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Platform usage and performance metrics',
    roles: ['admin'],
    priority: 3
  },
  {
    id: 'platform_settings',
    name: 'Platform Settings',
    path: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'Configure platform settings and features',
    roles: ['admin'],
    priority: 4
  },

  // Researcher Routes
  {
    id: 'research_dashboard',
    name: 'Research Dashboard',
    path: '/dashboard/researcher',
    icon: <Eye className="w-5 h-5" />,
    description: 'Anonymized research data and analytics',
    roles: ['researcher'],
    priority: 1
  },
  {
    id: 'population_analytics',
    name: 'Population Data',
    path: '/research/population',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Anonymized population mental health trends',
    roles: ['researcher'],
    priority: 2
  },
  {
    id: 'outcome_research',
    name: 'Outcome Research',
    path: '/research/outcomes',
    icon: <Activity className="w-5 h-5" />,
    description: 'Treatment effectiveness and intervention outcomes',
    roles: ['researcher'],
    priority: 3
  }
]

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  patient: {
    role: 'patient',
    name: 'Patient',
    color: 'blue',
    avatar: '👤',
    defaultRoute: '/dashboard/patient',
    features: ['Self-help tools', 'AI therapy', 'Crisis support', 'Progress tracking']
  },
  therapist: {
    role: 'therapist',
    name: 'Therapist',
    color: 'green',
    avatar: '👩‍⚕️',
    defaultRoute: '/dashboard/therapist',
    features: ['Patient management', 'Session tools', 'Crisis monitoring', 'Analytics']
  },
  crisis_counselor: {
    role: 'crisis_counselor',
    name: 'Crisis Counselor',
    color: 'red',
    avatar: '🚨',
    defaultRoute: '/dashboard/crisis-counselor',
    features: ['Crisis intervention', 'Emergency protocols', 'Anonymous chat', '24/7 monitoring']
  },
  family_member: {
    role: 'family_member',
    name: 'Family Member',
    color: 'pink',
    avatar: '👨‍👩‍👧‍👦',
    defaultRoute: '/dashboard/family',
    features: ['Wellness indicators', 'Crisis alerts', 'Family resources', 'Support access']
  },
  admin: {
    role: 'admin',
    name: 'Administrator',
    color: 'purple',
    avatar: '⚙️',
    defaultRoute: '/dashboard/admin',
    features: ['User management', 'System analytics', 'Platform configuration', 'Security monitoring']
  },
  researcher: {
    role: 'researcher',
    name: 'Researcher',
    color: 'indigo',
    avatar: '🔬',
    defaultRoute: '/dashboard/researcher',
    features: ['Population analytics', 'Outcome research', 'Trend analysis', 'Statistical tools']
  }
}

interface RoleBasedDashboardProps {
  userRole: string
  currentPath: string
  onNavigate: (path: string) => void
}

export default function RoleBasedDashboard({ 
  userRole, 
  currentPath, 
  onNavigate 
}: RoleBasedDashboardProps) {
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.patient
  const availableRoutes = DASHBOARD_ROUTES
    .filter(route => route.roles.includes(userRole))
    .sort((a, b) => a.priority - b.priority)

  useEffect(() => {
    loadRecentActivity()
  }, [userRole])

  const loadRecentActivity = async () => {
    try {
      const response = await fetch(`/api/dashboard/activity?role=${userRole}`)
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "bg-white shadow-lg transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{roleConfig.avatar}</div>
            {isSidebarOpen && (
              <div>
                <h2 className="font-semibold text-gray-900">{roleConfig.name}</h2>
                <p className="text-sm text-gray-600">{session?.user?.name || 'Demo User'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            {availableRoutes.map((route) => (
              <button
                key={route.id}
                onClick={() => onNavigate(route.path)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left",
                  currentPath === route.path
                    ? `bg-${roleConfig.color}-100 text-${roleConfig.color}-700 border border-${roleConfig.color}-200`
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {route.icon}
                {isSidebarOpen && (
                  <>
                    <span className="flex-1 font-medium">{route.name}</span>
                    {route.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        route.badge === '24/7' && "bg-red-100 text-red-700",
                        route.badge === 'Live' && "bg-green-100 text-green-700"
                      )}>
                        {route.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              {isSidebarOpen && <span>Toggle Sidebar</span>}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1 mb-1">
                <Lock className="w-3 h-3" />
                <span>Secure Session</span>
              </div>
              <div>Role: {roleConfig.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {availableRoutes.find(r => r.path === currentPath)?.name || 'Dashboard'}
              </h1>
              <p className="text-gray-600">
                {availableRoutes.find(r => r.path === currentPath)?.description || 'Welcome to your dashboard'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                `bg-${roleConfig.color}-100 text-${roleConfig.color}-800`
              )}>
                {roleConfig.name}
              </div>

              {/* Crisis Alert (for relevant roles) */}
              {['patient', 'therapist', 'crisis_counselor'].includes(userRole) && (
                <button className="relative p-2 text-gray-600 hover:text-red-600 transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </button>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                {userRole === 'patient' && (
                  <button 
                    onClick={() => onNavigate('/crisis')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Crisis Support
                  </button>
                )}
                
                {userRole === 'crisis_counselor' && (
                  <button 
                    onClick={() => onNavigate('/crisis/chat')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Crisis Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <DashboardContent 
            userRole={userRole} 
            currentPath={currentPath}
            onNavigate={onNavigate}
            recentActivity={recentActivity}
          />
        </div>
      </div>
    </div>
  )
}

// Dashboard Content Component
function DashboardContent({ 
  userRole, 
  currentPath, 
  onNavigate, 
  recentActivity 
}: {
  userRole: string
  currentPath: string
  onNavigate: (path: string) => void
  recentActivity: any[]
}) {
  const roleConfig = ROLE_CONFIGS[userRole]

  // Quick stats based on role
  const getQuickStats = () => {
    switch (userRole) {
      case 'patient':
        return [
          { label: 'Days Active', value: '14', icon: <Clock className="w-4 h-4" /> },
          { label: 'Mood Average', value: '7.2', icon: <Heart className="w-4 h-4" /> },
          { label: 'Tools Used', value: '8', icon: <Brain className="w-4 h-4" /> },
          { label: 'Sessions', value: '12', icon: <MessageCircle className="w-4 h-4" /> }
        ]
      case 'therapist':
        return [
          { label: 'Active Patients', value: '24', icon: <Users className="w-4 h-4" /> },
          { label: 'Sessions Today', value: '6', icon: <Calendar className="w-4 h-4" /> },
          { label: 'Crisis Alerts', value: '2', icon: <AlertTriangle className="w-4 h-4" /> },
          { label: 'Avg Improvement', value: '+15%', icon: <BarChart3 className="w-4 h-4" /> }
        ]
      case 'crisis_counselor':
        return [
          { label: 'Active Crises', value: '3', icon: <Zap className="w-4 h-4" /> },
          { label: 'Chats Today', value: '18', icon: <MessageCircle className="w-4 h-4" /> },
          { label: 'Response Time', value: '< 2min', icon: <Clock className="w-4 h-4" /> },
          { label: 'Resolution Rate', value: '94%', icon: <CheckCircle className="w-4 h-4" /> }
        ]
      default:
        return []
    }
  }

  const quickStats = getQuickStats()

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-3xl">{roleConfig.avatar}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome to your {roleConfig.name} Dashboard
            </h2>
            <p className="text-gray-600">
              {userRole === 'patient' && "Your mental wellness journey starts here. Access tools and support tailored for your needs."}
              {userRole === 'therapist' && "Manage your practice and support your patients with comprehensive tools and insights."}
              {userRole === 'crisis_counselor' && "Provide life-saving crisis intervention with real-time monitoring and response tools."}
              {userRole === 'family_member' && "Stay connected with your loved one's wellness journey while respecting their privacy."}
              {userRole === 'admin' && "Oversee platform operations and ensure optimal performance for all users."}
              {userRole === 'researcher' && "Access anonymized data to advance mental health research and improve outcomes."}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {quickStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${roleConfig.color}-100 text-${roleConfig.color}-600`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DASHBOARD_ROUTES
            .filter(route => route.roles.includes(userRole))
            .slice(0, 6)
            .map((route) => (
              <button
                key={route.id}
                onClick={() => onNavigate(route.path)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left"
              >
                {route.icon}
                <div>
                  <p className="font-medium text-gray-900">{route.name}</p>
                  <p className="text-sm text-gray-600">{route.description}</p>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-600">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}