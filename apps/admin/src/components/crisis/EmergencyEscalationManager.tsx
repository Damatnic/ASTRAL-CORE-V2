'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface EscalationCase {
  id: string;
  sessionId: string;
  clientId: string;
  volunteerId?: string;
  escalationLevel: 1 | 2 | 3; // 1=Supervisor, 2=Clinical Team, 3=Emergency Services
  reason: string;
  createdAt: Date;
  status: 'pending' | 'in_review' | 'contacted' | 'resolved' | 'transferred';
  priority: 'immediate' | 'urgent' | 'high' | 'standard';
  contactAttempts: number;
  notes: string[];
  emergencyContacts?: {
    name: string;
    relationship: string;
    phone: string;
    notified: boolean;
  }[];
  clinicalTeam?: {
    name: string;
    role: string;
    available: boolean;
  }[];
}

export default function EmergencyEscalationManager() {
  const { socket } = useAdminStore();
  const [escalations, setEscalations] = useState<EscalationCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<EscalationCase | null>(null);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review' | 'resolved'>('pending');

  // Mock data for demonstration
  useEffect(() => {
    // In production, this would fetch from the API
    const mockEscalations: EscalationCase[] = [
      {
        id: 'ESC001',
        sessionId: 'SES123',
        clientId: 'CLIENT456',
        volunteerId: 'VOL789',
        escalationLevel: 3,
        reason: 'Immediate suicide risk - has means and plan',
        createdAt: new Date(Date.now() - 5 * 60000),
        status: 'pending',
        priority: 'immediate',
        contactAttempts: 2,
        notes: [
          'Client expressed clear intent with specific plan',
          'Attempting to contact emergency contacts',
          'Local crisis team notified'
        ],
        emergencyContacts: [
          { name: 'John Doe', relationship: 'Spouse', phone: '555-0123', notified: true },
          { name: 'Jane Smith', relationship: 'Sister', phone: '555-0124', notified: false }
        ],
        clinicalTeam: [
          { name: 'Dr. Wilson', role: 'Psychiatrist', available: true },
          { name: 'Sarah Johnson', role: 'Crisis Counselor', available: true }
        ]
      },
      {
        id: 'ESC002',
        sessionId: 'SES124',
        clientId: 'CLIENT457',
        escalationLevel: 2,
        reason: 'Severe anxiety attack with dissociation',
        createdAt: new Date(Date.now() - 15 * 60000),
        status: 'in_review',
        priority: 'urgent',
        contactAttempts: 1,
        notes: [
          'Client experiencing severe panic symptoms',
          'Clinical team reviewing case'
        ]
      },
      {
        id: 'ESC003',
        sessionId: 'SES125',
        clientId: 'CLIENT458',
        volunteerId: 'VOL790',
        escalationLevel: 1,
        reason: 'Complex trauma case requiring supervisor guidance',
        createdAt: new Date(Date.now() - 30 * 60000),
        status: 'resolved',
        priority: 'high',
        contactAttempts: 1,
        notes: [
          'Supervisor provided guidance',
          'Volunteer continuing with additional support'
        ]
      }
    ];
    setEscalations(mockEscalations);
  }, []);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewEscalation = (data: EscalationCase) => {
      setEscalations(prev => [data, ...prev]);
      // Play alert sound for immediate priority
      if (data.priority === 'immediate') {
        playUrgentAlert();
      }
    };

    const handleEscalationUpdate = (data: { id: string; updates: Partial<EscalationCase> }) => {
      setEscalations(prev => prev.map(esc => 
        esc.id === data.id ? { ...esc, ...data.updates } : esc
      ));
    };

    socket.on('escalation:new', handleNewEscalation);
    socket.on('escalation:update', handleEscalationUpdate);

    return () => {
      socket.off('escalation:new', handleNewEscalation);
      socket.off('escalation:update', handleEscalationUpdate);
    };
  }, [socket]);

  const playUrgentAlert = () => {
    // Create urgent alert sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play three beeps
    oscillator.frequency.value = 1000;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleContactEmergencyServices = (caseId: string) => {
    // In production, this would trigger actual emergency protocols
    const confirmCall = window.confirm(
      'This will contact emergency services (911). Are you sure you want to proceed?'
    );
    
    if (confirmCall) {
      // Log the action
      console.log(`Emergency services contacted for case ${caseId}`);
      
      // Update the case status
      setEscalations(prev => prev.map(esc => 
        esc.id === caseId ? { ...esc, status: 'contacted' } : esc
      ));
      
      // In production, this would:
      // 1. Contact emergency services with client location
      // 2. Notify clinical team
      // 3. Log all actions for audit trail
      // 4. Send notifications to relevant parties
      
      alert('Emergency services have been contacted. Case has been logged.');
    }
  };

  const handleTransferToClinicianc = (caseId: string, clinicianName: string) => {
    setEscalations(prev => prev.map(esc => 
      esc.id === caseId ? { 
        ...esc, 
        status: 'transferred',
        notes: [...(esc.notes || []), `Transferred to ${clinicianName} at ${new Date().toLocaleTimeString()}`]
      } : esc
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'bg-red-600 text-white animate-pulse';
      case 'urgent': return 'bg-orange-600 text-white';
      case 'high': return 'bg-yellow-600 text-white';
      case 'standard': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEscalations = escalations.filter(esc => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return esc.status === 'resolved' || esc.status === 'transferred';
    return esc.status === filter;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emergency Escalation Queue</h2>
          <p className="text-sm text-gray-600 mt-1">Manage critical cases requiring immediate intervention</p>
        </div>
        <button
          onClick={() => setShowEscalationForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <span>🚨</span>
          <span>New Escalation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {(['all', 'pending', 'in_review', 'resolved'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              filter === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            <span className="ml-2 text-sm">
              ({escalations.filter(e => 
                tab === 'all' ? true :
                tab === 'resolved' ? e.status === 'resolved' || e.status === 'transferred' :
                e.status === tab
              ).length})
            </span>
          </button>
        ))}
      </div>

      {/* Escalation Cases */}
      <div className="space-y-4">
        {filteredEscalations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No {filter !== 'all' ? filter.replace('_', ' ') : ''} escalations</p>
          </div>
        ) : (
          filteredEscalations.map(escalation => (
            <div
              key={escalation.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(escalation.priority)}`}>
                    {escalation.priority.toUpperCase()}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">Case #{escalation.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(escalation.status)}`}>
                        {escalation.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Session: {escalation.sessionId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(escalation.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Level {escalation.escalationLevel} Escalation
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Reason for Escalation:</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{escalation.reason}</p>
              </div>

              {escalation.notes && escalation.notes.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {escalation.notes.map((note, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                {escalation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleContactEmergencyServices(escalation.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      📞 Contact 911
                    </button>
                    {escalation.clinicalTeam?.filter(m => m.available).map(member => (
                      <button
                        key={member.name}
                        onClick={() => handleTransferToClinicianc(escalation.id, member.name)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Transfer to {member.name}
                      </button>
                    ))}
                  </>
                )}
                <button
                  onClick={() => setSelectedCase(escalation)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  View Details
                </button>
              </div>

              {/* Emergency Contacts */}
              {escalation.emergencyContacts && escalation.emergencyContacts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Emergency Contacts:</p>
                  <div className="flex flex-wrap gap-2">
                    {escalation.emergencyContacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${
                          contact.notified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {contact.name} ({contact.relationship})
                        {contact.notified && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-3">Emergency Protocols</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
            <div className="text-2xl mb-1">🚨</div>
            <div className="text-xs font-medium text-red-800">Activate Crisis Team</div>
          </button>
          <button className="p-3 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
            <div className="text-2xl mb-1">📞</div>
            <div className="text-xs font-medium text-red-800">Emergency Services</div>
          </button>
          <button className="p-3 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
            <div className="text-2xl mb-1">🏥</div>
            <div className="text-xs font-medium text-red-800">Hospital Transfer</div>
          </button>
          <button className="p-3 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
            <div className="text-2xl mb-1">👨‍⚕️</div>
            <div className="text-xs font-medium text-red-800">Clinical Supervisor</div>
          </button>
        </div>
      </div>
    </div>
  );
}