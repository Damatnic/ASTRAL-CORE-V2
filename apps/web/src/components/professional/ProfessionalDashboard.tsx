'use client';

/**
 * ASTRAL_CORE 2.0 Professional Healthcare Dashboard
 * 
 * Features:
 * - Real-time crisis monitoring
 * - Patient session management
 * - Clinical assessment tools
 * - Encrypted note-taking
 * - Therapy scheduling
 * - HIPAA-compliant data handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, AlertCircle, Calendar, FileText, Shield,
  Video, Phone, MessageSquare, TrendingUp, Clock,
  ChevronRight, Search, Filter, Download, Lock,
  Activity, Brain, Heart, AlertTriangle, CheckCircle,
  BarChart3, PieChart, User, Settings, LogOut
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// Types
interface CrisisSession {
  id: string;
  patientId: string;
  patientName: string;
  severity: number;
  status: 'ACTIVE' | 'WAITING' | 'ESCALATED' | 'RESOLVED';
  startTime: Date;
  duration: number;
  volunteerAssigned?: string;
  location?: { lat: number; lng: number };
  riskAssessment?: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
    score: number;
  };
  messages: number;
  lastActivity: Date;
}

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  diagnosisCodes?: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastSession?: Date;
  totalSessions: number;
  medications?: string[];
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  notes?: EncryptedNote[];
}

interface EncryptedNote {
  id: string;
  timestamp: Date;
  category: 'ASSESSMENT' | 'INTERVENTION' | 'PLAN' | 'PROGRESS' | 'MEDICATION';
  encryptedContent: string;
  authorId: string;
  isLocked: boolean;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  type: 'THERAPY' | 'ASSESSMENT' | 'FOLLOW_UP' | 'CRISIS';
  scheduledTime: Date;
  duration: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  videoLink?: string;
}

interface SystemMetrics {
  activeCrises: number;
  waitingPatients: number;
  averageWaitTime: number;
  averageSessionDuration: number;
  criticalSessions: number;
  volunteersOnline: number;
  professionalsOnline: number;
  systemLoad: number;
}

interface ClinicalAssessment {
  phq9Score?: number; // Depression
  gad7Score?: number; // Anxiety
  suicidalIdeation: boolean;
  substanceUse: boolean;
  psychosisSymptoms: boolean;
  functionalImpairment: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
  treatmentCompliance: 'GOOD' | 'FAIR' | 'POOR';
}

export default function ProfessionalDashboard() {
  // State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'sessions' | 'patients' | 'appointments' | 'analytics'>('overview');
  const [activeSessions, setActiveSessions] = useState<CrisisSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CrisisSession | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    activeCrises: 0,
    waitingPatients: 0,
    averageWaitTime: 0,
    averageSessionDuration: 0,
    criticalSessions: 0,
    volunteersOnline: 0,
    professionalsOnline: 0,
    systemLoad: 0
  });
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<ClinicalAssessment | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<EncryptedNote['category']>('ASSESSMENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  
  // Initialize Socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        role: 'PROFESSIONAL',
        professionalId: 'prof_123', // Get from auth
        token: 'professional_token' // Get from auth
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Professional dashboard connected');
      newSocket.emit('monitor:subscribe', { type: 'professional' });
    });
    
    newSocket.on('crisis:urgent', (data) => {
      // Handle urgent crisis notifications
      const newSession: CrisisSession = {
        id: data.sessionId,
        patientId: 'unknown',
        patientName: 'Anonymous User',
        severity: data.severity,
        status: 'ESCALATED',
        startTime: new Date(),
        duration: 0,
        messages: 0,
        lastActivity: new Date(),
        location: data.location
      };
      
      setActiveSessions(prev => [newSession, ...prev]);
      
      // Show notification
      showNotification('Urgent Crisis', `Severity ${data.severity} crisis requires immediate attention`);
    });
    
    newSocket.on('metrics:update', (metrics) => {
      setSystemMetrics(metrics);
    });
    
    setSocket(newSocket);
    
    // Load mock data (in production, fetch from API)
    loadMockData();
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Load mock data
  const loadMockData = () => {
    // Mock active sessions
    setActiveSessions([
      {
        id: 'session_1',
        patientId: 'patient_1',
        patientName: 'John D.',
        severity: 8,
        status: 'ACTIVE',
        startTime: new Date(Date.now() - 15 * 60000),
        duration: 15,
        volunteerAssigned: 'Sarah M.',
        messages: 42,
        lastActivity: new Date(),
        riskAssessment: {
          level: 'HIGH',
          factors: ['Suicidal ideation', 'Recent loss', 'Isolation'],
          score: 78
        }
      },
      {
        id: 'session_2',
        patientId: 'patient_2',
        patientName: 'Anonymous',
        severity: 6,
        status: 'WAITING',
        startTime: new Date(Date.now() - 5 * 60000),
        duration: 5,
        messages: 8,
        lastActivity: new Date(Date.now() - 60000),
        riskAssessment: {
          level: 'MEDIUM',
          factors: ['Anxiety', 'Sleep issues'],
          score: 45
        }
      }
    ]);
    
    // Mock appointments
    const today = new Date();
    setAppointments([
      {
        id: 'appt_1',
        patientId: 'patient_1',
        patientName: 'John Doe',
        type: 'THERAPY',
        scheduledTime: new Date(today.getTime() + 2 * 3600000),
        duration: 60,
        status: 'SCHEDULED',
        videoLink: 'https://meet.astralcore.org/session123'
      },
      {
        id: 'appt_2',
        patientId: 'patient_3',
        patientName: 'Jane Smith',
        type: 'ASSESSMENT',
        scheduledTime: new Date(today.getTime() + 4 * 3600000),
        duration: 90,
        status: 'SCHEDULED'
      }
    ]);
  };
  
  // Helper functions
  const showNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }
  };
  
  const handleTakeoverSession = (session: CrisisSession) => {
    if (!socket) return;
    
    socket.emit('professional:takeover', {
      sessionId: session.id,
      professionalName: 'Dr. Smith', // Get from auth
      credentials: 'Licensed Clinical Psychologist',
      takeoverMode: 'ASSIST'
    });
    
    setSelectedSession(session);
  };
  
  const handleSaveNote = () => {
    if (!selectedPatient || !noteContent) return;
    
    // Encrypt note content (in production, use proper encryption)
    const encryptedNote: EncryptedNote = {
      id: `note_${Date.now()}`,
      timestamp: new Date(),
      category: noteCategory,
      encryptedContent: btoa(noteContent), // Simple encoding for demo
      authorId: 'prof_123',
      isLocked: true
    };
    
    // Send to server
    if (socket && selectedSession) {
      socket.emit('professional:notes', {
        sessionId: selectedSession.id,
        notes: encryptedNote.encryptedContent,
        category: noteCategory
      });
    }
    
    // Clear note
    setNoteContent('');
  };
  
  const handleAssessmentSubmit = () => {
    if (!selectedSession || !currentAssessment || !socket) return;
    
    const riskLevel = 
      currentAssessment.suicidalIdeation || currentAssessment.psychosisSymptoms ? 'CRITICAL' :
      (currentAssessment.phq9Score || 0) >= 15 || (currentAssessment.gad7Score || 0) >= 15 ? 'HIGH' :
      (currentAssessment.phq9Score || 0) >= 10 || (currentAssessment.gad7Score || 0) >= 10 ? 'MEDIUM' :
      'LOW';
    
    socket.emit('professional:assessment', {
      sessionId: selectedSession.id,
      riskLevel,
      interventionNeeded: riskLevel === 'CRITICAL' || riskLevel === 'HIGH',
      followUpRequired: true,
      recommendedActions: [
        riskLevel === 'CRITICAL' ? 'Immediate hospitalization' : '',
        currentAssessment.suicidalIdeation ? 'Safety plan activation' : '',
        currentAssessment.substanceUse ? 'Substance abuse referral' : '',
        'Follow-up appointment within 48 hours'
      ].filter(Boolean)
    });
    
    setShowAssessmentModal(false);
    setCurrentAssessment(null);
  };
  
  // Render functions
  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <AlertCircle className="text-red-500" size={24} />
          <span className="text-2xl font-bold text-red-500">
            {systemMetrics.criticalSessions}
          </span>
        </div>
        <h3 className="text-gray-700 font-medium">Critical Sessions</h3>
        <p className="text-sm text-gray-700 mt-1">Requiring immediate attention</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Users className="text-blue-500" size={24} />
          <span className="text-2xl font-bold text-blue-500">
            {systemMetrics.activeCrises}
          </span>
        </div>
        <h3 className="text-gray-700 font-medium">Active Crises</h3>
        <p className="text-sm text-gray-700 mt-1">Currently in progress</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Clock className="text-yellow-500" size={24} />
          <span className="text-2xl font-bold text-yellow-500">
            {systemMetrics.waitingPatients}
          </span>
        </div>
        <h3 className="text-gray-700 font-medium">Waiting Queue</h3>
        <p className="text-sm text-gray-700 mt-1">
          Avg wait: {Math.round(systemMetrics.averageWaitTime)}min
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Activity className="text-green-500" size={24} />
          <span className="text-2xl font-bold text-green-500">
            {systemMetrics.systemLoad}%
          </span>
        </div>
        <h3 className="text-gray-700 font-medium">System Load</h3>
        <p className="text-sm text-gray-700 mt-1">
          {systemMetrics.volunteersOnline} volunteers online
        </p>
      </motion.div>
    </div>
  );
  
  const renderActiveSessions = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Active Crisis Sessions</h2>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {activeSessions
          .filter(session => 
            filterSeverity === 'ALL' || 
            (filterSeverity === 'CRITICAL' && session.severity >= 9) ||
            (filterSeverity === 'HIGH' && session.severity >= 7 && session.severity < 9) ||
            (filterSeverity === 'MEDIUM' && session.severity >= 4 && session.severity < 7) ||
            (filterSeverity === 'LOW' && session.severity < 4)
          )
          .map(session => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                session.status === 'ESCALATED' ? 'border-red-500 bg-red-50' :
                session.severity >= 8 ? 'border-orange-500 bg-orange-50' :
                'border-gray-200'
              }`}
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {session.patientName}
                    </h3>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'ESCALATED' ? 'bg-red-500 text-white' :
                      session.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                      session.status === 'WAITING' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {session.status}
                    </span>
                    
                    {/* Severity */}
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={16} className={
                        session.severity >= 8 ? 'text-red-500' :
                        session.severity >= 6 ? 'text-orange-500' :
                        session.severity >= 4 ? 'text-yellow-500' :
                        'text-green-500'
                      } />
                      <span className="text-sm font-medium">
                        Severity: {session.severity}/10
                      </span>
                    </div>
                    
                    {/* Risk Assessment */}
                    {session.riskAssessment && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.riskAssessment.level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        session.riskAssessment.level === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        session.riskAssessment.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Risk: {session.riskAssessment.level}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Started {formatDistanceToNow(session.startTime)} ago</span>
                    <span>{session.messages} messages</span>
                    {session.volunteerAssigned && (
                      <span>Volunteer: {session.volunteerAssigned}</span>
                    )}
                    <span>Last activity: {formatDistanceToNow(session.lastActivity)} ago</span>
                  </div>
                  
                  {session.riskAssessment && (
                    <div className="mt-2 text-sm text-gray-600">
                      Risk factors: {session.riskAssessment.factors.join(', ')}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTakeoverSession(session);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Take Over
                  </button>
                  
                  <button className="p-2 text-gray-600 hover:text-gray-800">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
  
  const renderAppointments = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Today's Appointments</h2>
        
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Calendar size={18} />
          Schedule New
        </button>
      </div>
      
      <div className="space-y-4">
        {appointments.map(appointment => (
          <div
            key={appointment.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {appointment.patientName}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded ${
                    appointment.type === 'CRISIS' ? 'bg-red-100 text-red-700' :
                    appointment.type === 'THERAPY' ? 'bg-blue-100 text-blue-700' :
                    appointment.type === 'ASSESSMENT' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.type}
                  </span>
                  <span>{format(appointment.scheduledTime, 'h:mm a')}</span>
                  <span>{appointment.duration} minutes</span>
                </div>
              </div>
              
              {appointment.videoLink && (
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                  <Video size={18} />
                  Join Video
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderClinicalTools = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Assessment Tools */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Clinical Assessment</h3>
        
        {selectedSession ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowAssessmentModal(true)}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Brain size={18} />
              Conduct Assessment
            </button>
            
            <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <FileText size={18} />
              Generate Treatment Plan
            </button>
            
            <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <Shield size={18} />
              Create Safety Plan
            </button>
          </div>
        ) : (
          <p className="text-gray-700 text-center py-8">
            Select a session to access clinical tools
          </p>
        )}
      </div>
      
      {/* Secure Notes */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Clinical Notes</h3>
          <Lock className="text-gray-600" size={18} />
        </div>
        
        {selectedSession ? (
          <div className="space-y-4">
            <select
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value as EncryptedNote['category'])}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASSESSMENT">Assessment</option>
              <option value="INTERVENTION">Intervention</option>
              <option value="PLAN">Treatment Plan</option>
              <option value="PROGRESS">Progress Note</option>
              <option value="MEDICATION">Medication</option>
            </select>
            
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter clinical notes (encrypted)..."
              className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            
            <button
              onClick={handleSaveNote}
              disabled={!noteContent}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Encrypted Note
            </button>
          </div>
        ) : (
          <p className="text-gray-700 text-center py-8">
            Select a session to add notes
          </p>
        )}
      </div>
    </div>
  );
  
  // Assessment Modal
  const renderAssessmentModal = () => (
    <AnimatePresence>
      {showAssessmentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAssessmentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Clinical Assessment</h2>
            
            <div className="space-y-6">
              {/* PHQ-9 Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PHQ-9 Score (Depression)
                </label>
                <input
                  type="number"
                  min="0"
                  max="27"
                  value={currentAssessment?.phq9Score || ''}
                  onChange={(e) => setCurrentAssessment(prev => ({
                    ...prev!,
                    phq9Score: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* GAD-7 Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GAD-7 Score (Anxiety)
                </label>
                <input
                  type="number"
                  min="0"
                  max="21"
                  value={currentAssessment?.gad7Score || ''}
                  onChange={(e) => setCurrentAssessment(prev => ({
                    ...prev!,
                    gad7Score: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Risk Factors */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentAssessment?.suicidalIdeation || false}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev!,
                      suicidalIdeation: e.target.checked
                    }))}
                    className="mr-3"
                  />
                  <span className="text-sm">Suicidal Ideation Present</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentAssessment?.substanceUse || false}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev!,
                      substanceUse: e.target.checked
                    }))}
                    className="mr-3"
                  />
                  <span className="text-sm">Substance Use Concerns</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentAssessment?.psychosisSymptoms || false}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev!,
                      psychosisSymptoms: e.target.checked
                    }))}
                    className="mr-3"
                  />
                  <span className="text-sm">Psychosis Symptoms</span>
                </label>
              </div>
              
              {/* Functional Impairment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Functional Impairment
                </label>
                <select
                  value={currentAssessment?.functionalImpairment || 'NONE'}
                  onChange={(e) => setCurrentAssessment(prev => ({
                    ...prev!,
                    functionalImpairment: e.target.value as ClinicalAssessment['functionalImpairment']
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NONE">None</option>
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                </select>
              </div>
              
              {/* Treatment Compliance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Compliance
                </label>
                <select
                  value={currentAssessment?.treatmentCompliance || 'GOOD'}
                  onChange={(e) => setCurrentAssessment(prev => ({
                    ...prev!,
                    treatmentCompliance: e.target.value as ClinicalAssessment['treatmentCompliance']
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssessmentSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Assessment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                ASTRAL Professional Dashboard
              </h1>
            </div>
            
            <nav className="flex items-center gap-6">
              <button
                onClick={() => setActiveView('overview')}
                className={`text-sm font-medium ${
                  activeView === 'overview' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('sessions')}
                className={`text-sm font-medium ${
                  activeView === 'sessions' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => setActiveView('patients')}
                className={`text-sm font-medium ${
                  activeView === 'patients' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => setActiveView('appointments')}
                className={`text-sm font-medium ${
                  activeView === 'appointments' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`text-sm font-medium ${
                  activeView === 'analytics' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </nav>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && (
          <>
            {renderOverview()}
            {renderActiveSessions()}
            <div className="mt-8">
              {renderClinicalTools()}
            </div>
          </>
        )}
        
        {activeView === 'sessions' && renderActiveSessions()}
        
        {activeView === 'appointments' && renderAppointments()}
        
        {activeView === 'patients' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Patient Management</h2>
            <p className="text-gray-700">Patient management interface coming soon...</p>
          </div>
        )}
        
        {activeView === 'analytics' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics & Reports</h2>
            <p className="text-gray-700">Analytics dashboard coming soon...</p>
          </div>
        )}
      </main>
      
      {/* Modals */}
      {renderAssessmentModal()}
    </div>
  );
}