'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Calendar, Clock, User, Video, Phone, MessageSquare,
  FileText, TrendingUp, DollarSign, Star, CheckCircle,
  AlertCircle, ChevronLeft, ChevronRight, Plus, Edit,
  Trash2, Search, Filter, Download, Settings
} from 'lucide-react';
import { storeData, retrieveData } from '../lib/data-persistence';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'discharged';
  riskLevel: 'low' | 'medium' | 'high';
  lastSession: Date;
  nextAppointment?: Date;
  diagnosis: string[];
  treatmentPlan: string;
  notes: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  duration: number;
  type: 'initial' | 'follow-up' | 'crisis' | 'group';
  mode: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  billing?: {
    amount: number;
    insurance: boolean;
    paid: boolean;
  };
}

interface TherapistProfile {
  id: string;
  name: string;
  title: string;
  license: string;
  specializations: string[];
  availability: {
    [key: string]: { start: string; end: string }[];
  };
  rating: number;
  totalPatients: number;
  sessionsThisMonth: number;
}

export default function TherapistPortal() {
  const { data: session, status } = useSession();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'patients' | 'appointments' | 'reports' | 'profile'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize therapist data from session
  useEffect(() => {
    const initializeTherapistData = async () => {
      if (status === 'loading') {
        setIsLoading(true);
        return;
      }

      if (!session?.user || !session.user.isTherapist) {
        setError('Therapist authentication required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const therapistId = session.user.id;
        
        // Try to load existing therapist profile
        let profile = retrieveData<TherapistProfile>('therapist_profile', therapistId);
        
        // If no profile exists, create a new one
        if (!profile) {
          profile = {
            id: therapistId,
            name: session.user.name || 'Dr. Professional',
            title: 'Licensed Mental Health Professional',
            license: session.user.licenseId || 'LIC-' + therapistId.slice(-6).toUpperCase(),
            specializations: ['General Practice'],
            availability: {
              monday: [{ start: '09:00', end: '17:00' }],
              tuesday: [{ start: '09:00', end: '17:00' }],
              wednesday: [{ start: '09:00', end: '17:00' }],
              thursday: [{ start: '09:00', end: '17:00' }],
              friday: [{ start: '09:00', end: '15:00' }],
            },
            rating: 0,
            totalPatients: 0,
            sessionsThisMonth: 0,
          };
          
          // Save the new profile
          storeData('therapist_profile', profile, therapistId);
        }

        setTherapistProfile(profile);
        
        // Load patients and appointments
        const savedPatients = retrieveData<Patient[]>('patients', therapistId) || [];
        const savedAppointments = retrieveData<Appointment[]>('appointments', therapistId) || [];
        
        setPatients(savedPatients);
        setAppointments(savedAppointments);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize therapist data:', err);
        setError('Failed to load therapist portal');
        setIsLoading(false);
      }
    };

    initializeTherapistData();
  }, [session, status]);

  // This function is no longer needed as we load real data

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold">{patients.length}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Active Patients</h3>
          <p className="text-sm text-gray-500 mt-1">{patients.length > 0 ? 'Current caseload' : 'No patients yet'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold">{appointments.length}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Upcoming Sessions</h3>
          <p className="text-sm text-gray-500 mt-1">{appointments.length > 0 ? 'This week' : 'No appointments scheduled'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold">{therapistProfile?.rating && therapistProfile.rating > 0 ? `${therapistProfile.rating.toFixed(1)}` : 'N/A'}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Average Rating</h3>
          <p className="text-sm text-gray-500 mt-1">{therapistProfile?.rating && therapistProfile.rating > 0 ? 'Patient feedback' : 'No ratings yet'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold">{therapistProfile?.sessionsThisMonth || 0}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Sessions This Month</h3>
          <p className="text-sm text-gray-500 mt-1">{(therapistProfile?.sessionsThisMonth || 0) > 0 ? 'Professional activity' : 'Getting started'}</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
          <button
            onClick={() => setShowNewAppointment(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </button>
        </div>

        <div className="space-y-3">
          {appointments.filter(apt => {
            const today = new Date();
            return apt.date.toDateString() === today.toDateString();
          }).length > 0 ? (
            appointments.filter(apt => {
              const today = new Date();
              return apt.date.toDateString() === today.toDateString();
            }).map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {appointment.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500">{appointment.duration} min</p>
                  </div>
                  <div className="w-px h-12 bg-gray-300" />
                  <div>
                    <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.type} • {appointment.mode}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {appointment.mode === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                  {appointment.mode === 'phone' && <Phone className="w-4 h-4 text-green-600" />}
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
              <p className="text-sm text-gray-400 mt-1">Schedule a session to see it here</p>
            </div>
          )}
        </div>
      </div>

      {/* High-Risk Patients Alert */}
      {patients.filter(p => p.riskLevel === 'high').length > 0 ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            High-Risk Patients Requiring Attention
          </h3>
          <div className="space-y-3">
            {patients.filter(p => p.riskLevel === 'high').map(patient => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{patient.name}</p>
                  <p className="text-sm text-red-600">Last session: {patient.lastSession.toLocaleDateString()}</p>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Contact Now
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Patient Wellness Status
          </h3>
          <div className="text-center py-4">
            <p className="text-green-800 font-medium">No high-risk patients requiring immediate attention</p>
            <p className="text-sm text-green-600 mt-1">All patients appear to be in stable condition</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderPatients = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.length > 0 ? (
              patients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800' :
                      patient.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {patient.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{patient.diagnosis[0]}</p>
                    {patient.diagnosis.length > 1 && (
                      <p className="text-xs text-gray-500">+{patient.diagnosis.length - 1} more</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {patient.nextAppointment ? (
                      <p className="text-sm text-gray-900">{patient.nextAppointment.toLocaleDateString()}</p>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-900 text-sm">Schedule</button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No patients added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first patient to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Appointment Calendar</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simple Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="aspect-square border rounded-lg p-2 hover:bg-gray-50 cursor-pointer relative"
            >
              <span className="text-sm text-gray-700">{(i % 31) + 1}</span>
              {i === 15 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          {appointments.map(appointment => (
            <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {appointment.date.getDate()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.date.toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div>
                  <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-600">
                    {appointment.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • 
                    {appointment.duration} min • {appointment.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {appointment.mode === 'video' && (
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center">
                    <Video className="w-4 h-4 mr-1" />
                    Join
                  </button>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600 text-lg">Loading therapist portal...</p>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (!session?.user || !session.user.isTherapist || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {error || 'This portal is only accessible to licensed therapists.'}
          </p>
          <button 
            onClick={() => window.location.href = '/auth/signin'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Sign In as Therapist
          </button>
        </div>
      </div>
    );
  }

  if (!therapistProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600 text-lg">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Therapist Portal</h1>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Professional
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold">{therapistProfile.rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${therapistProfile.name}&background=3B82F6&color=fff`}
                  alt={therapistProfile.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-gray-700">{therapistProfile.name}</span>
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['dashboard', 'patients', 'appointments', 'reports', 'profile'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  selectedView === view
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {view}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'dashboard' && renderDashboard()}
        {selectedView === 'patients' && renderPatients()}
        {selectedView === 'appointments' && renderAppointments()}
        {selectedView === 'reports' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Clinical Reports</h3>
            <p className="text-gray-600">Treatment outcomes and progress reports coming soon...</p>
          </div>
        )}
        {selectedView === 'profile' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Professional Profile</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{therapistProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License</p>
                <p className="font-semibold">{therapistProfile.license}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specializations</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {therapistProfile.specializations.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}