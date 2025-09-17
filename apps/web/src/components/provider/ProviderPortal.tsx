'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Shield,
  Download,
  Send,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Clock,
  Phone,
  Video,
  MessageSquare,
  Bell,
  Settings,
  User,
  Heart,
  Brain,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
  Share2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: Date
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  therapist: string
  lastSession: Date
  nextSession?: Date
  status: 'active' | 'inactive' | 'crisis' | 'discharged'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  consentForSharing: boolean
  privacySettings: {
    shareProgress: boolean
    shareCrisisAlerts: boolean
    shareGoals: boolean
    shareMoodData: boolean
  }
}

interface ProgressReport {
  patientId: string
  generatedDate: Date
  timeframe: string
  summary: {
    overallImprovement: number
    moodStability: number
    goalCompletion: number
    toolUsage: number
    riskFactors: string[]
    positiveFactors: string[]
  }
  moodData: {
    average: number
    trend: 'improving' | 'declining' | 'stable'
    lowestPoint: number
    highestPoint: number
    consistency: number
  }
  activityData: {
    completionRate: number
    favoriteTools: string[]
    mostEffectiveTools: string[]
    engagementLevel: number
  }
  goals: Array<{
    title: string
    progress: number
    status: string
    category: string
  }>
  crisisEvents: Array<{
    date: Date
    type: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
    notes?: string
  }>
  recommendations: string[]
}

interface CrisisAlert {
  id: string
  patientId: string
  patientName: string
  severity: 'medium' | 'high' | 'critical'
  type: 'mood-decline' | 'crisis-contact' | 'self-harm-indicators' | 'missed-sessions'
  triggeredAt: Date
  description: string
  actionTaken: boolean
  resolvedAt?: Date
  notes?: string
}

interface Communication {
  id: string
  patientId: string
  type: 'message' | 'note' | 'alert'
  subject: string
  content: string
  timestamp: Date
  priority: 'normal' | 'high' | 'urgent'
  read: boolean
  requiresResponse: boolean
}

export default function ProviderPortal() {
  const [activeTab, setActiveTab] = useState<'patients' | 'alerts' | 'reports' | 'communication'>('patients')
  const [patients, setPatients] = useState<Patient[]>([])
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProviderData()
  }, [])

  const loadProviderData = async () => {
    try {
      setIsLoading(true)
      const [patientsRes, alertsRes] = await Promise.allSettled([
        fetch('/api/provider/patients'),
        fetch('/api/provider/alerts')
      ])

      if (patientsRes.status === 'fulfilled' && patientsRes.value.ok) {
        const data = await patientsRes.value.json()
        setPatients(data.patients || [])
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
        const data = await alertsRes.value.json()
        setCrisisAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Error loading provider data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateProgressReport = async (patientId: string, timeframe: string) => {
    try {
      const response = await fetch('/api/provider/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, timeframe })
      })

      if (response.ok) {
        const report = await response.json()
        setSelectedReport(report)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/provider/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true })
      })

      if (response.ok) {
        setCrisisAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, actionTaken: true }
              : alert
          )
        )
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = !riskFilter || patient.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const unacknowledgedAlerts = crisisAlerts.filter(alert => !alert.actionTaken)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Portal</h1>
          <p className="text-gray-600">Secure access to patient progress and crisis management</p>
        </div>
        
        <div className="flex items-center gap-4">
          {unacknowledgedAlerts.length > 0 && (
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">{unacknowledgedAlerts.length} alerts</span>
            </div>
          )}
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-1">
        <div className="flex">
          {[
            { id: 'patients', name: 'Patients', icon: Users, count: patients.length },
            { id: 'alerts', name: 'Crisis Alerts', icon: AlertTriangle, count: unacknowledgedAlerts.length },
            { id: 'reports', name: 'Reports', icon: FileText },
            { id: 'communication', name: 'Communication', icon: MessageSquare }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center relative",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-xs",
                    activeTab === tab.id ? "bg-blue-400" : "bg-red-500 text-white"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'patients' && (
          <PatientsView
            key="patients"
            patients={filteredPatients}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
            onPatientSelect={setSelectedPatient}
            onGenerateReport={generateProgressReport}
          />
        )}
        {activeTab === 'alerts' && (
          <AlertsView
            key="alerts"
            alerts={crisisAlerts}
            onAcknowledge={acknowledgeAlert}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsView
            key="reports"
            patients={patients}
            selectedReport={selectedReport}
            onGenerateReport={generateProgressReport}
          />
        )}
        {activeTab === 'communication' && (
          <CommunicationView key="communication" />
        )}
      </AnimatePresence>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <PatientDetailModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onGenerateReport={generateProgressReport}
          />
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Patients View Component
interface PatientsViewProps {
  patients: Patient[]
  searchTerm: string
  onSearchChange: (term: string) => void
  riskFilter: string
  onRiskFilterChange: (filter: string) => void
  onPatientSelect: (patient: Patient) => void
  onGenerateReport: (patientId: string, timeframe: string) => void
}

function PatientsView({
  patients,
  searchTerm,
  onSearchChange,
  riskFilter,
  onRiskFilterChange,
  onPatientSelect,
  onGenerateReport
}: PatientsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={riskFilter}
            onChange={(e) => onRiskFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <motion.div
            key={patient.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all"
            onClick={() => onPatientSelect(patient)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                patient.riskLevel === 'critical' ? "bg-red-100 text-red-700" :
                patient.riskLevel === 'high' ? "bg-orange-100 text-orange-700" :
                patient.riskLevel === 'medium' ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              )}>
                {patient.riskLevel} risk
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last session: {new Date(patient.lastSession).toLocaleDateString()}
              </div>
              {patient.nextSession && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Next session: {new Date(patient.nextSession).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Consent: {patient.consentForSharing ? 'Granted' : 'Limited'}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  patient.status === 'active' ? "bg-green-100 text-green-700" :
                  patient.status === 'crisis' ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {patient.status}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onGenerateReport(patient.id, '30d')
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Report
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </motion.div>
  )
}

// Crisis Alerts View Component
interface AlertsViewProps {
  alerts: CrisisAlert[]
  onAcknowledge: (alertId: string) => void
}

function AlertsView({ alerts, onAcknowledge }: AlertsViewProps) {
  const unacknowledgedAlerts = alerts.filter(alert => !alert.actionTaken)
  const acknowledgedAlerts = alerts.filter(alert => alert.actionTaken)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Unacknowledged Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Urgent Alerts ({unacknowledgedAlerts.length})
          </h3>
          
          <div className="space-y-4">
            {unacknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-lg border-l-4",
                  alert.severity === 'critical' ? "border-red-500 bg-red-50" :
                  alert.severity === 'high' ? "border-orange-500 bg-orange-50" :
                  "border-yellow-500 bg-yellow-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{alert.patientName}</h4>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        alert.severity === 'critical' ? "bg-red-100 text-red-700" :
                        alert.severity === 'high' ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Type: {alert.type.replace('-', ' ')}</span>
                      <span>Triggered: {new Date(alert.triggeredAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Acknowledge
                    </button>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          
          <div className="space-y-3">
            {acknowledgedAlerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{alert.patientName}</h4>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {alert.resolvedAt ? 'Resolved' : 'Acknowledged'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active alerts</h3>
          <p className="text-gray-600">All patients are within normal parameters</p>
        </div>
      )}
    </motion.div>
  )
}

// Reports View Component (simplified)
function ReportsView({ patients, selectedReport, onGenerateReport }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Progress Reports</h3>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a patient to generate detailed progress reports</p>
        </div>
      </div>
    </motion.div>
  )
}

// Communication View Component (simplified)
function CommunicationView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Communication</h3>
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Secure messaging and communication tools coming soon</p>
        </div>
      </div>
    </motion.div>
  )
}

// Patient Detail Modal (simplified)
interface PatientDetailModalProps {
  patient: Patient
  onClose: () => void
  onGenerateReport: (patientId: string, timeframe: string) => void
}

function PatientDetailModal({ patient, onClose, onGenerateReport }: PatientDetailModalProps) {
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
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{patient.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <span className={cn(
                "inline-block px-2 py-1 rounded-full text-xs font-medium",
                patient.riskLevel === 'critical' ? "bg-red-100 text-red-700" :
                patient.riskLevel === 'high' ? "bg-orange-100 text-orange-700" :
                patient.riskLevel === 'medium' ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              )}>
                {patient.riskLevel}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={cn(
                "inline-block px-2 py-1 rounded-full text-xs font-medium",
                patient.status === 'active' ? "bg-green-100 text-green-700" :
                patient.status === 'crisis' ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {patient.status}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Share Progress Data</span>
                <span className={patient.privacySettings.shareProgress ? "text-green-600" : "text-red-600"}>
                  {patient.privacySettings.shareProgress ? "Allowed" : "Restricted"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Crisis Alerts</span>
                <span className={patient.privacySettings.shareCrisisAlerts ? "text-green-600" : "text-red-600"}>
                  {patient.privacySettings.shareCrisisAlerts ? "Allowed" : "Restricted"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onGenerateReport(patient.id, '30d')}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Generate 30-Day Report
            </button>
            <button
              onClick={() => onGenerateReport(patient.id, '90d')}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Generate 90-Day Report
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Report Detail Modal (simplified)
function ReportDetailModal({ report, onClose }: any) {
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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Progress Report</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Detailed progress report visualization would appear here</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}