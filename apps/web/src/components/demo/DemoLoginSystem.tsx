'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Heart,
  Shield,
  Stethoscope,
  UserCheck,
  Crown,
  Eye,
  Lock,
  Unlock,
  PlayCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Star,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'

interface DemoAccount {
  id: string
  name: string
  role: 'patient' | 'therapist' | 'crisis_counselor' | 'admin' | 'family_member' | 'researcher'
  email: string
  password: string
  description: string
  features: string[]
  dataProfile: {
    moodHistory?: boolean
    crisisEvents?: boolean
    therapySessions?: boolean
    safetyPlan?: boolean
    medications?: boolean
    emergencyContacts?: boolean
  }
  avatar: string
  status: 'stable' | 'at_risk' | 'crisis' | 'recovering' | 'professional'
  lastLogin?: Date
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'patient_stable',
    name: 'Alex Chen',
    role: 'patient',
    email: 'alex.demo@astralcore.com',
    password: 'demo2024!',
    description: 'University student managing anxiety and stress. Regularly uses self-help tools and has completed several therapy sessions.',
    features: [
      'Complete self-help toolkit access',
      'AI therapy with Dr. Aria',
      'Mood tracking history',
      'Safety plan configured',
      'Emergency contacts set up'
    ],
    dataProfile: {
      moodHistory: true,
      therapySessions: true,
      safetyPlan: true,
      emergencyContacts: true
    },
    avatar: '👨‍🎓',
    status: 'stable'
  },
  {
    id: 'patient_at_risk',
    name: 'Sam Rodriguez',
    role: 'patient',
    email: 'sam.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Recent graduate experiencing depression and anxiety. Has elevated risk indicators and active crisis monitoring.',
    features: [
      'Enhanced crisis monitoring',
      'Regular therapy sessions with Dr. Sage',
      'Medication tracking',
      'Family involvement in care',
      'Professional follow-up protocols'
    ],
    dataProfile: {
      moodHistory: true,
      crisisEvents: true,
      therapySessions: true,
      safetyPlan: true,
      medications: true,
      emergencyContacts: true
    },
    avatar: '👩‍💼',
    status: 'at_risk'
  },
  {
    id: 'patient_crisis',
    name: 'Jordan Kim',
    role: 'patient',
    email: 'jordan.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Currently in crisis intervention mode. Demonstrates active crisis detection, safety planning, and emergency response protocols.',
    features: [
      'Active crisis intervention',
      'Immediate safety planning',
      'Emergency contact activation',
      'Professional crisis support',
      'Real-time monitoring'
    ],
    dataProfile: {
      moodHistory: true,
      crisisEvents: true,
      therapySessions: true,
      safetyPlan: true,
      medications: true,
      emergencyContacts: true
    },
    avatar: '⚠️',
    status: 'crisis'
  },
  {
    id: 'therapist_licensed',
    name: 'Dr. Emily Watson',
    role: 'therapist',
    email: 'therapist.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Licensed clinical psychologist with access to patient dashboards, session management, and crisis intervention tools.',
    features: [
      'Patient dashboard access',
      'Session management tools',
      'Crisis alert system',
      'Progress analytics',
      'Treatment planning'
    ],
    dataProfile: {
      moodHistory: true,
      crisisEvents: true,
      therapySessions: true,
      safetyPlan: true
    },
    avatar: '👩‍⚕️',
    status: 'professional'
  },
  {
    id: 'crisis_counselor',
    name: 'Mike Chen',
    role: 'crisis_counselor',
    email: 'crisis.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Crisis intervention specialist with 24/7 access to emergency protocols, crisis chat, and immediate response tools.',
    features: [
      'Crisis dashboard 24/7 access',
      'Emergency response protocols',
      'Anonymous crisis chat',
      'Risk assessment tools',
      'Emergency contact systems'
    ],
    dataProfile: {
      crisisEvents: true,
      safetyPlan: true,
      emergencyContacts: true
    },
    avatar: '🚨',
    status: 'professional'
  },
  {
    id: 'family_member',
    name: 'Lisa Chen (Parent)',
    role: 'family_member',
    email: 'family.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Family member with limited access to wellness indicators and crisis alerts for their loved one.',
    features: [
      'Wellness check indicators',
      'Crisis alert notifications',
      'Emergency contact access',
      'Family resources',
      'Support group access'
    ],
    dataProfile: {
      crisisEvents: true,
      emergencyContacts: true
    },
    avatar: '👩‍👧‍👦',
    status: 'stable'
  },
  {
    id: 'admin_platform',
    name: 'Platform Administrator',
    role: 'admin',
    email: 'admin.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Platform administrator with access to system analytics, user management, and platform configuration.',
    features: [
      'System analytics dashboard',
      'User management',
      'Platform configuration',
      'Security monitoring',
      'Performance metrics'
    ],
    dataProfile: {
      moodHistory: true,
      crisisEvents: true,
      therapySessions: true,
      safetyPlan: true,
      medications: true,
      emergencyContacts: true
    },
    avatar: '⚙️',
    status: 'professional'
  },
  {
    id: 'researcher',
    name: 'Dr. Research Analysis',
    role: 'researcher',
    email: 'research.demo@astralcore.com',
    password: 'demo2024!',
    description: 'Research scientist with access to anonymized population data and outcome analytics.',
    features: [
      'Anonymized population analytics',
      'Outcome research tools',
      'Statistical dashboards',
      'Intervention effectiveness',
      'Trend analysis'
    ],
    dataProfile: {
      moodHistory: true,
      crisisEvents: true,
      therapySessions: true
    },
    avatar: '🔬',
    status: 'professional'
  }
]

interface DemoLoginSystemProps {
  onAccountSelect: (account: DemoAccount) => void
  showIntro?: boolean
}

export default function DemoLoginSystem({ onAccountSelect, showIntro = true }: DemoLoginSystemProps) {
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount | null>(null)
  const [showAllAccounts, setShowAllAccounts] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (account: DemoAccount) => {
    setIsLoggingIn(true)
    try {
      // Use NextAuth signIn with credentials
      const result = await signIn('credentials', {
        email: account.email,
        password: account.password,
        redirect: false
      })

      if (result?.ok) {
        onAccountSelect(account)
      } else {
        console.error('Demo login failed:', result?.error)
      }
    } catch (error) {
      console.error('Demo login error:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800 border-green-200'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'crisis': return 'bg-red-100 text-red-800 border-red-200'
      case 'recovering': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'professional': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return <User className="w-5 h-5" />
      case 'therapist': return <Stethoscope className="w-5 h-5" />
      case 'crisis_counselor': return <Shield className="w-5 h-5" />
      case 'family_member': return <Heart className="w-5 h-5" />
      case 'admin': return <Crown className="w-5 h-5" />
      case 'researcher': return <Eye className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  const featuredAccounts = DEMO_ACCOUNTS.filter(account => 
    ['patient_stable', 'patient_crisis', 'therapist_licensed', 'crisis_counselor'].includes(account.id)
  )

  const displayAccounts = showAllAccounts ? DEMO_ACCOUNTS : featuredAccounts

  return (
    <div className="max-w-6xl mx-auto p-6">
      {showIntro && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <PlayCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">ASTRAL Core V2 Demo</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience our comprehensive mental health crisis intervention platform through different user perspectives. 
            Each demo account provides access to role-specific features and demonstrates real-world usage scenarios.
          </p>
        </div>
      )}

      {/* Account Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Demo Account</h2>
          <button
            onClick={() => setShowAllAccounts(!showAllAccounts)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAllAccounts ? 'Show Featured Only' : 'Show All Accounts'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {displayAccounts.map((account) => (
            <DemoAccountCard
              key={account.id}
              account={account}
              isSelected={selectedAccount?.id === account.id}
              onSelect={() => setSelectedAccount(account)}
              onLogin={() => handleLogin(account)}
              isLoggingIn={isLoggingIn}
              getRoleIcon={getRoleIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Demo Security Notice</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Demo accounts contain synthetic data for demonstration purposes only</li>
              <li>• All user interactions are encrypted and secure</li>
              <li>• Crisis scenarios are simulated and do not represent real emergencies</li>
              <li>• Professional features require appropriate licensing in production</li>
              <li>• Full HIPAA compliance and security features active in production environment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Account Detail Modal */}
      <AnimatePresence>
        {selectedAccount && (
          <DemoAccountModal
            account={selectedAccount}
            onClose={() => setSelectedAccount(null)}
            onLogin={() => handleLogin(selectedAccount)}
            isLoggingIn={isLoggingIn}
            getStatusColor={getStatusColor}
            getRoleIcon={getRoleIcon}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Demo Account Card Component
function DemoAccountCard({
  account,
  isSelected,
  onSelect,
  onLogin,
  isLoggingIn,
  getRoleIcon,
  getStatusColor
}: {
  account: DemoAccount
  isSelected: boolean
  onSelect: () => void
  onLogin: () => void
  isLoggingIn: boolean
  getRoleIcon: (role: string) => React.ReactNode
  getStatusColor: (status: string) => string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 transition-all",
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{account.avatar}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            <div className="flex items-center space-x-2">
              {getRoleIcon(account.role)}
              <span className="text-sm text-gray-600 capitalize">{account.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium border",
          getStatusColor(account.status)
        )}>
          {account.status.replace('_', ' ')}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{account.description}</p>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
          <div className="space-y-1">
            {account.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-600">{feature}</span>
              </div>
            ))}
            {account.features.length > 3 && (
              <div className="text-xs text-gray-500">
                +{account.features.length - 3} more features
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLogin()
            }}
            disabled={isLoggingIn}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isLoggingIn ? 'Logging in...' : 'Quick Login'}
          </button>
          <button
            onClick={onSelect}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Demo Account Modal Component
function DemoAccountModal({
  account,
  onClose,
  onLogin,
  isLoggingIn,
  getStatusColor,
  getRoleIcon
}: {
  account: DemoAccount
  onClose: () => void
  onLogin: () => void
  isLoggingIn: boolean
  getStatusColor: (status: string) => string
  getRoleIcon: (role: string) => React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{account.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{account.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(account.role)}
                    <span className="text-gray-600 capitalize">{account.role.replace('_', ' ')}</span>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getStatusColor(account.status)
                  )}>
                    {account.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About This Account</h3>
              <p className="text-gray-600">{account.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Available Features</h3>
              <div className="grid grid-cols-1 gap-2">
                {account.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Data Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(account.dataProfile).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    {value ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Login Credentials</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Email: <code className="bg-white px-2 py-1 rounded">{account.email}</code></div>
                <div>Password: <code className="bg-white px-2 py-1 rounded">{account.password}</code></div>
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoggingIn ? 'Logging in...' : `Login as ${account.name}`}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}