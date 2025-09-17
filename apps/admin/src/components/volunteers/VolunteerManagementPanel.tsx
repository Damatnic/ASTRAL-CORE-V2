'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'break';
  availability: 'available' | 'in_session' | 'unavailable';
  specializations: string[];
  languages: string[];
  rating: number;
  sessionsToday: number;
  totalSessions: number;
  averageSessionDuration: number;
  lastActive: Date;
  currentSessionId?: string;
  shifts: {
    day: string;
    start: string;
    end: string;
  }[];
  certifications: {
    name: string;
    expiryDate: Date;
    verified: boolean;
  }[];
  performance: {
    responseTime: number;
    resolutionRate: number;
    clientSatisfaction: number;
    escalationRate: number;
  };
}

interface Assignment {
  volunteerId: string;
  sessionId: string;
  clientId: string;
  assignedAt: Date;
  priority: 'high' | 'medium' | 'low';
  matchScore: number;
  reason: string;
}

export default function VolunteerManagementPanel() {
  const { socket } = useAdminStore();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'busy'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [pendingSession, setPendingSession] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockVolunteers: Volunteer[] = [
      {
        id: 'VOL001',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '555-0101',
        status: 'online',
        availability: 'available',
        specializations: ['Anxiety', 'Depression', 'Trauma'],
        languages: ['English', 'Spanish'],
        rating: 4.8,
        sessionsToday: 3,
        totalSessions: 245,
        averageSessionDuration: 35,
        lastActive: new Date(),
        shifts: [
          { day: 'Monday', start: '09:00', end: '17:00' },
          { day: 'Tuesday', start: '09:00', end: '17:00' },
          { day: 'Wednesday', start: '09:00', end: '17:00' },
          { day: 'Thursday', start: '09:00', end: '17:00' },
          { day: 'Friday', start: '09:00', end: '17:00' }
        ],
        certifications: [
          { name: 'Crisis Intervention', expiryDate: new Date('2025-12-31'), verified: true },
          { name: 'Mental Health First Aid', expiryDate: new Date('2025-06-30'), verified: true }
        ],
        performance: {
          responseTime: 45,
          resolutionRate: 85,
          clientSatisfaction: 4.7,
          escalationRate: 5
        }
      },
      {
        id: 'VOL002',
        name: 'Michael Chen',
        email: 'michael.c@example.com',
        phone: '555-0102',
        status: 'busy',
        availability: 'in_session',
        specializations: ['PTSD', 'Addiction', 'Grief'],
        languages: ['English', 'Mandarin'],
        rating: 4.9,
        sessionsToday: 5,
        totalSessions: 512,
        averageSessionDuration: 42,
        lastActive: new Date(),
        currentSessionId: 'SES456',
        shifts: [
          { day: 'Monday', start: '14:00', end: '22:00' },
          { day: 'Tuesday', start: '14:00', end: '22:00' },
          { day: 'Wednesday', start: '14:00', end: '22:00' },
          { day: 'Thursday', start: '14:00', end: '22:00' },
          { day: 'Friday', start: '14:00', end: '22:00' }
        ],
        certifications: [
          { name: 'Trauma-Informed Care', expiryDate: new Date('2025-09-30'), verified: true },
          { name: 'Suicide Prevention', expiryDate: new Date('2025-11-30'), verified: true }
        ],
        performance: {
          responseTime: 30,
          resolutionRate: 92,
          clientSatisfaction: 4.9,
          escalationRate: 3
        }
      },
      {
        id: 'VOL003',
        name: 'Emily Rodriguez',
        email: 'emily.r@example.com',
        phone: '555-0103',
        status: 'online',
        availability: 'available',
        specializations: ['Youth', 'Family', 'Relationships'],
        languages: ['English', 'French'],
        rating: 4.6,
        sessionsToday: 2,
        totalSessions: 189,
        averageSessionDuration: 38,
        lastActive: new Date(Date.now() - 10 * 60000),
        shifts: [
          { day: 'Saturday', start: '10:00', end: '18:00' },
          { day: 'Sunday', start: '10:00', end: '18:00' }
        ],
        certifications: [
          { name: 'Child & Adolescent Counseling', expiryDate: new Date('2025-08-31'), verified: true }
        ],
        performance: {
          responseTime: 60,
          resolutionRate: 78,
          clientSatisfaction: 4.5,
          escalationRate: 8
        }
      },
      {
        id: 'VOL004',
        name: 'David Williams',
        email: 'david.w@example.com',
        phone: '555-0104',
        status: 'break',
        availability: 'unavailable',
        specializations: ['Veterans', 'PTSD', 'Depression'],
        languages: ['English'],
        rating: 4.7,
        sessionsToday: 4,
        totalSessions: 334,
        averageSessionDuration: 40,
        lastActive: new Date(Date.now() - 30 * 60000),
        shifts: [
          { day: 'Monday', start: '18:00', end: '02:00' },
          { day: 'Tuesday', start: '18:00', end: '02:00' },
          { day: 'Wednesday', start: '18:00', end: '02:00' }
        ],
        certifications: [
          { name: 'Military & Veterans Counseling', expiryDate: new Date('2025-07-31'), verified: true }
        ],
        performance: {
          responseTime: 50,
          resolutionRate: 88,
          clientSatisfaction: 4.6,
          escalationRate: 6
        }
      },
      {
        id: 'VOL005',
        name: 'Lisa Thompson',
        email: 'lisa.t@example.com',
        phone: '555-0105',
        status: 'offline',
        availability: 'unavailable',
        specializations: ['Eating Disorders', 'Body Image', 'Self-Esteem'],
        languages: ['English', 'German'],
        rating: 4.5,
        sessionsToday: 0,
        totalSessions: 156,
        averageSessionDuration: 45,
        lastActive: new Date(Date.now() - 24 * 60 * 60000),
        shifts: [
          { day: 'Thursday', start: '08:00', end: '16:00' },
          { day: 'Friday', start: '08:00', end: '16:00' }
        ],
        certifications: [
          { name: 'Eating Disorder Specialist', expiryDate: new Date('2025-05-31'), verified: true }
        ],
        performance: {
          responseTime: 55,
          resolutionRate: 80,
          clientSatisfaction: 4.4,
          escalationRate: 7
        }
      }
    ];
    setVolunteers(mockVolunteers);
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleVolunteerStatusUpdate = (data: { id: string; status: Volunteer['status'] }) => {
      setVolunteers(prev => prev.map(vol => 
        vol.id === data.id ? { ...vol, status: data.status } : vol
      ));
    };

    const handleNewAssignment = (data: Assignment) => {
      setAssignments(prev => [data, ...prev]);
    };

    socket.on('volunteer:status', handleVolunteerStatusUpdate);
    socket.on('assignment:new', handleNewAssignment);

    return () => {
      socket.off('volunteer:status', handleVolunteerStatusUpdate);
      socket.off('assignment:new', handleNewAssignment);
    };
  }, [socket]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'busy': return 'bg-yellow-500';
      case 'break': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_session': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMatchScore = (volunteer: Volunteer, sessionRequirements: any) => {
    // Simplified matching algorithm
    let score = 0;
    
    // Availability
    if (volunteer.availability === 'available') score += 30;
    
    // Performance metrics
    score += (volunteer.performance.resolutionRate / 100) * 20;
    score += (volunteer.performance.clientSatisfaction / 5) * 20;
    score += Math.max(0, 20 - volunteer.performance.escalationRate);
    
    // Experience
    score += Math.min(10, volunteer.totalSessions / 50);
    
    return Math.round(score);
  };

  const handleAssignVolunteer = (volunteerId: string, sessionId: string) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (!volunteer || !socket) return;

    const assignment: Assignment = {
      volunteerId,
      sessionId,
      clientId: 'CLIENT' + Math.random().toString(36).substr(2, 9),
      assignedAt: new Date(),
      priority: 'high',
      matchScore: calculateMatchScore(volunteer, {}),
      reason: 'Manual assignment by administrator'
    };

    socket.emit('assignment:create', assignment);
    setAssignments(prev => [assignment, ...prev]);
    setShowAssignmentModal(false);
    setPendingSession(null);

    // Update volunteer status
    setVolunteers(prev => prev.map(v => 
      v.id === volunteerId 
        ? { ...v, status: 'busy' as const, availability: 'in_session' as const, currentSessionId: sessionId }
        : v
    ));
  };

  const filteredVolunteers = volunteers.filter(vol => {
    const matchesFilter = filterStatus === 'all' || vol.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const onlineVolunteers = volunteers.filter(v => v.status === 'online').length;
  const availableVolunteers = volunteers.filter(v => v.availability === 'available').length;
  const inSessionVolunteers = volunteers.filter(v => v.availability === 'in_session').length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Management</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and assign crisis intervention volunteers</p>
        </div>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{onlineVolunteers}</div>
            <div className="text-xs text-gray-600">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{availableVolunteers}</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{inSessionVolunteers}</div>
            <div className="text-xs text-gray-600">In Session</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="busy">Busy</option>
        </select>
        <button
          onClick={() => setShowAssignmentModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quick Assign
        </button>
      </div>

      {/* Volunteer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVolunteers.map(volunteer => (
          <div
            key={volunteer.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedVolunteer(volunteer)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(volunteer.status)}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                  <p className="text-xs text-gray-500">{volunteer.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(volunteer.availability)}`}>
                {volunteer.availability.replace('_', ' ')}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <span className="text-gray-500">Today:</span>
                <span className="ml-1 font-medium">{volunteer.sessionsToday} sessions</span>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>
                <span className="ml-1 font-medium">{volunteer.totalSessions}</span>
              </div>
              <div>
                <span className="text-gray-500">Rating:</span>
                <span className="ml-1 font-medium">⭐ {volunteer.rating}</span>
              </div>
              <div>
                <span className="text-gray-500">Avg Duration:</span>
                <span className="ml-1 font-medium">{volunteer.averageSessionDuration}m</span>
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1 mb-3">
              {volunteer.specializations.slice(0, 3).map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {spec}
                </span>
              ))}
              {volunteer.specializations.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{volunteer.specializations.length - 3}
                </span>
              )}
            </div>

            {/* Languages */}
            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-3">
              <span>🌐</span>
              <span>{volunteer.languages.join(', ')}</span>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500">Response</div>
                <div className="text-sm font-medium">{volunteer.performance.responseTime}s</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Resolution</div>
                <div className="text-sm font-medium">{volunteer.performance.resolutionRate}%</div>
              </div>
            </div>

            {/* Current Session Indicator */}
            {volunteer.currentSessionId && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <span className="font-medium">In Session:</span> {volunteer.currentSessionId}
              </div>
            )}

            {/* Action Buttons */}
            {volunteer.availability === 'available' && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignVolunteer(volunteer.id, 'SES' + Date.now());
                  }}
                  className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Assign
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle sending message
                  }}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Message
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Volunteer Detail Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedVolunteer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedVolunteer.email} • {selectedVolunteer.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">{selectedVolunteer.performance.responseTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolution Rate</span>
                      <span className="font-medium">{selectedVolunteer.performance.resolutionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client Satisfaction</span>
                      <span className="font-medium">⭐ {selectedVolunteer.performance.clientSatisfaction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Escalation Rate</span>
                      <span className="font-medium">{selectedVolunteer.performance.escalationRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                  <div className="space-y-2">
                    {selectedVolunteer.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{cert.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cert.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cert.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Schedule</h4>
                  <div className="space-y-1">
                    {selectedVolunteer.shifts.map((shift, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{shift.day}:</span>
                        <span className="ml-2 text-gray-600">{shift.start} - {shift.end}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Statistics */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Session Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessions Today</span>
                      <span className="font-medium">{selectedVolunteer.sessionsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sessions</span>
                      <span className="font-medium">{selectedVolunteer.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Duration</span>
                      <span className="font-medium">{selectedVolunteer.averageSessionDuration} min</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedVolunteer.availability === 'available' && (
                  <button
                    onClick={() => {
                      handleAssignVolunteer(selectedVolunteer.id, 'SES' + Date.now());
                      setSelectedVolunteer(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Assign to Session
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}