'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminStore } from '../providers/AdminProvider';

/**
 * CrisisSessionsTable Component - Live Crisis Session Monitoring & Management
 * 
 * Critical features for crisis intervention:
 * - Real-time session monitoring with WebSocket updates
 * - Emergency escalation to 911/988
 * - Crisis risk assessment and intervention triggers
 * - Volunteer assignment and session management
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Advanced filtering and sorting capabilities
 */
export default function CrisisSessionsTable({ className = '' }) {
  const { store, actions } = useAdminStore();
  const { crisisSessions = [], volunteers = [], connectionStatus } = store;
  
  // Local state for UI management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState('all');
  const [sortBy, setSortBy] = useState('risk_score'); // risk_score, duration, created_at, priority
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [expandedSession, setExpandedSession] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Refs for emergency actions and accessibility
  const emergencyModalRef = useRef(null);
  const tableRef = useRef(null);
  const audioAlertRef = useRef(null);
  
  // Emergency action handlers
  const handleEmergencyEscalation = useCallback(async (sessionId, escalationType) => {
    try {
      const session = crisisSessions.find(s => s.session_id === sessionId);
      if (!session) return;
      
      const response = await fetch('/api/admin/emergency/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          escalationType, // '911', '988', 'crisis_team', 'supervisor'
          session,
          timestamp: new Date().toISOString(),
          adminId: 'current-admin-id' // Should come from auth context
        })
      });
      
      if (!response.ok) {
        throw new Error(`Emergency escalation failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Show confirmation
      alert(`Emergency escalation initiated for session ${sessionId}. Reference: ${result.referenceId}`);
      
      // Update session status
      await actions.updateSessionStatus(sessionId, 'escalated');
      
    } catch (error) {
      console.error(`Failed to escalate session ${sessionId}:`, error);
      alert(`Failed to escalate session. Please try again or use backup procedures.`);
    }
  }, [crisisSessions, actions]);
  
  // Crisis intervention actions
  const handleCrisisIntervention = useCallback(async (sessionId, interventionType) => {
    try {
      const response = await fetch('/api/admin/crisis/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          interventionType, // 'wellness_check', 'supervisor_alert', 'immediate_response'
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Crisis intervention failed');
      }
      
      await actions.refreshData();
    } catch (error) {
      console.error('Crisis intervention failed:', error);
    }
  }, [actions]);
  
  // Volunteer assignment
  const handleVolunteerAssignment = useCallback(async (sessionId, volunteerId) => {
    try {
      const response = await fetch('/api/admin/sessions/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, volunteerId })
      });
      
      if (!response.ok) {
        throw new Error('Volunteer assignment failed');
      }
      
      await actions.refreshData();
    } catch (error) {
      console.error('Volunteer assignment failed:', error);
    }
  }, [actions]);
  
  // Bulk actions
  const handleBulkAction = useCallback(async (action) => {
    const sessionIds = Array.from(selectedSessions);
    if (sessionIds.length === 0) return;
    
    try {
      await Promise.all(sessionIds.map(id => {
        switch (action) {
          case 'escalate':
            return handleCrisisIntervention(id, 'supervisor_alert');
          case 'wellness_check':
            return handleCrisisIntervention(id, 'wellness_check');
          default:
            return Promise.resolve();
        }
      }));
      setSelectedSessions(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [selectedSessions, handleCrisisIntervention]);
  
  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || typeof actions.fetchCrisisSessions !== 'function') return;
    
    const refreshSessions = async () => {
      try {
        await actions.fetchCrisisSessions();
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to refresh crisis sessions:', error);
      }
    };
    
    refreshSessions();
    const interval = setInterval(refreshSessions, 5000); // Refresh every 5 seconds for critical data
    
    return () => clearInterval(interval);
  }, [actions, autoRefresh]);
  
  // Audio alerts for high-risk sessions
  useEffect(() => {
    const highRiskSessions = crisisSessions.filter(s => 
      s.risk_score >= 80 && s.status === 'active'
    );
    
    if (highRiskSessions.length > 0 && audioAlertRef.current) {
      // Play audio alert for high-risk sessions
      const audio = new Audio('/sounds/crisis-alert.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if audio fails
    }
  }, [crisisSessions]);
  
  // Utility functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-800 bg-red-200 border-red-500';
      case 'emergency': return 'text-red-700 bg-red-100 border-red-400';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-400';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-400';
      case 'low': return 'text-green-700 bg-green-100 border-green-400';
      default: return 'text-gray-700 bg-gray-100 border-gray-400';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'waiting': return 'text-yellow-700 bg-yellow-100';
      case 'escalated': return 'text-red-700 bg-red-100';
      case 'resolved': return 'text-blue-700 bg-blue-100';
      case 'closed': return 'text-gray-700 bg-gray-100';
      case 'emergency': return 'text-red-800 bg-red-200';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  const getRiskColor = (riskScore) => {
    if (riskScore >= 90) return 'text-red-800 bg-red-200';
    if (riskScore >= 80) return 'text-red-700 bg-red-100';
    if (riskScore >= 60) return 'text-orange-700 bg-orange-100';
    if (riskScore >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-green-700 bg-green-100';
  };
  
  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const getAvailableVolunteers = () => {
    return volunteers.filter(v => v.status === 'online' && !v.current_session_id);
  };
  
  // Filter and sort sessions
  const filteredAndSortedSessions = crisisSessions
    .filter(session => {
      const matchesSearch = searchTerm === '' ||
        session.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.volunteer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.client_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || session.priority === filterPriority;
      const matchesRisk = filterRiskLevel === 'all' || 
        (filterRiskLevel === 'critical' && session.risk_score >= 80) ||
        (filterRiskLevel === 'high' && session.risk_score >= 60 && session.risk_score < 80) ||
        (filterRiskLevel === 'medium' && session.risk_score >= 40 && session.risk_score < 60) ||
        (filterRiskLevel === 'low' && session.risk_score < 40);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesRisk;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'risk_score':
          aVal = a.risk_score || 0;
          bVal = b.risk_score || 0;
          break;
        case 'duration':
          aVal = a.duration || 0;
          bVal = b.duration || 0;
          break;
        case 'created_at':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case 'priority':
          const priorityOrder = { critical: 0, emergency: 1, high: 2, medium: 3, low: 4 };
          aVal = priorityOrder[a.priority] || 5;
          bVal = priorityOrder[b.priority] || 5;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  
  const getSessionCounts = () => {
    return {
      total: crisisSessions.length,
      active: crisisSessions.filter(s => s.status === 'active').length,
      escalated: crisisSessions.filter(s => s.status === 'escalated').length,
      highRisk: crisisSessions.filter(s => s.risk_score >= 80).length,
      critical: crisisSessions.filter(s => s.priority === 'critical').length
    };
  };
  
  const counts = getSessionCounts();
  const hasEmergencySessions = counts.escalated > 0 || counts.highRisk > 0;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg border ${hasEmergencySessions ? 'border-red-500' : 'border-gray-200'} ${className}`}
      role="region"
      aria-label="Crisis Sessions Monitoring Table"
    >
      {/* Header */}
      <div className={`p-6 rounded-t-lg ${hasEmergencySessions ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Live Crisis Sessions</h2>
            {hasEmergencySessions && (
              <span className="animate-pulse bg-yellow-400 text-red-900 px-2 py-1 rounded-full text-xs font-bold">
                HIGH RISK
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 text-sm ${connectionStatus === 'connected' ? 'text-green-200' : 'text-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{connectionStatus === 'connected' ? 'Live' : 'Offline'}</span>
            </div>
            <div className="text-sm">
              {filteredAndSortedSessions.length} of {crisisSessions.length} sessions
            </div>
            <div className="text-sm">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Emergency Summary */}
        {hasEmergencySessions && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg" role="alert">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">🚨</span>
                <div>
                  <h3 className="text-red-800 font-bold text-lg">High-Risk Sessions Active</h3>
                  <p className="text-red-700">
                    {counts.highRisk} high-risk sessions, {counts.escalated} escalated sessions require immediate attention
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleBulkAction('escalate')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                🚨 Mass Escalation
              </button>
            </div>
          </div>
        )}
        
        {/* Session Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-sm font-medium">Total</div>
            <div className="text-2xl font-bold text-gray-800">{counts.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-green-600 text-sm font-medium">Active</div>
            <div className="text-2xl font-bold text-green-800">{counts.active}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 text-sm font-medium">High Risk</div>
            <div className="text-2xl font-bold text-red-800">{counts.highRisk}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 text-sm font-medium">Escalated</div>
            <div className="text-2xl font-bold text-red-700">{counts.escalated}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-orange-600 text-sm font-medium">Critical</div>
            <div className="text-2xl font-bold text-orange-800">{counts.critical}</div>
          </div>
        </div>
        
        {/* Controls and Filters */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex-1 min-w-64">
            <input 
              type="text" 
              placeholder="Search by session ID, volunteer, or client..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search sessions"
            />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="escalated">Escalated</option>
            <option value="emergency">Emergency</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="emergency">Emergency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select 
            value={filterRiskLevel} 
            onChange={(e) => setFilterRiskLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by risk level"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Risk (80+)</option>
            <option value="high">High Risk (60-79)</option>
            <option value="medium">Medium Risk (40-59)</option>
            <option value="low">Low Risk (0-39)</option>
          </select>
          
          <select 
            value={`${sortBy}-${sortOrder}`} 
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort sessions"
          >
            <option value="risk_score-desc">Risk Score (High to Low)</option>
            <option value="risk_score-asc">Risk Score (Low to High)</option>
            <option value="duration-desc">Duration (Longest)</option>
            <option value="duration-asc">Duration (Shortest)</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="priority-asc">Priority (High to Low)</option>
          </select>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          
          {selectedSessions.size > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('wellness_check')}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Wellness Check ({selectedSessions.size})
              </button>
              <button
                onClick={() => handleBulkAction('escalate')}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Escalate Selected
              </button>
            </div>
          )}
        </div>
        
        {/* Sessions Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-200" role="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSessions(new Set(filteredAndSortedSessions.map(s => s.session_id)));
                      } else {
                        setSelectedSessions(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session & Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Assessment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium mb-2">No Sessions Found</h3>
                    <p>
                      {searchTerm ? 'No sessions match your search criteria.' : 'There are currently no crisis sessions in the system.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedSessions.map((session) => (
                  <tr 
                    key={session.session_id} 
                    className={`hover:bg-gray-50 ${session.risk_score >= 80 ? 'bg-red-50' : ''} ${session.status === 'escalated' ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSessions.has(session.session_id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedSessions);
                          if (e.target.checked) {
                            newSelected.add(session.session_id);
                          } else {
                            newSelected.delete(session.session_id);
                          }
                          setSelectedSessions(newSelected);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select session ${session.session_id}`}
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {session.session_id}
                          {session.risk_score >= 90 && (
                            <span className="ml-2 text-red-600 animate-pulse">🚨</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">Client: {session.client_id}</div>
                        {session.session_type && (
                          <div className="text-xs text-gray-400">{session.session_type}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(session.priority)}`}>
                          {session.priority}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {session.risk_score}
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              session.risk_score >= 90 ? 'bg-red-600' :
                              session.risk_score >= 80 ? 'bg-red-500' :
                              session.risk_score >= 60 ? 'bg-orange-500' :
                              session.risk_score >= 40 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(session.risk_score, 100)}%` }}
                          ></div>
                        </div>
                        <div className={`ml-2 text-xs font-bold ${getRiskColor(session.risk_score)}`}>
                          {session.risk_score >= 80 ? 'CRITICAL' : 
                           session.risk_score >= 60 ? 'HIGH' :
                           session.risk_score >= 40 ? 'MEDIUM' : 'LOW'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {session.volunteer_name ? (
                          <>
                            <div className="font-medium text-gray-900 text-sm">{session.volunteer_name}</div>
                            <div className="text-sm text-gray-500">{session.volunteer_id}</div>
                          </>
                        ) : (
                          <div className="text-gray-400 italic text-sm">
                            Unassigned
                            {getAvailableVolunteers().length > 0 && (
                              <button
                                onClick={() => setExpandedSession(expandedSession === session.session_id ? null : session.session_id)}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                              >
                                Assign
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(session.duration || 0)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(session.created_at)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        {(session.risk_score >= 80 || session.priority === 'critical') && (
                          <>
                            <button
                              onClick={() => handleEmergencyEscalation(session.session_id, '911')}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs font-bold"
                              title="Emergency Services (911)"
                            >
                              911
                            </button>
                            <button
                              onClick={() => handleEmergencyEscalation(session.session_id, '988')}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs font-bold"
                              title="Suicide Prevention Lifeline (988)"
                            >
                              988
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleCrisisIntervention(session.session_id, 'wellness_check')}
                          className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs"
                          title="Wellness Check"
                        >
                          Check
                        </button>
                        <button
                          onClick={() => handleCrisisIntervention(session.session_id, 'supervisor_alert')}
                          className="text-orange-600 hover:text-orange-900 bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-xs"
                          title="Alert Supervisor"
                        >
                          Alert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Volunteer Assignment Modal */}
        {expandedSession && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Assign Volunteer to Session {expandedSession}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {getAvailableVolunteers().slice(0, 6).map(volunteer => (
                <button
                  key={volunteer.volunteer_id}
                  onClick={() => {
                    handleVolunteerAssignment(expandedSession, volunteer.volunteer_id);
                    setExpandedSession(null);
                  }}
                  className="text-left p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 text-sm"
                >
                  <div className="font-medium">{volunteer.name}</div>
                  <div className="text-gray-500 text-xs">
                    {volunteer.specialties?.slice(0, 2).join(', ')} | Score: {volunteer.performance_score}%
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setExpandedSession(null)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Cancel
            </button>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center space-x-4">
            <span>
              Auto-refresh: {autoRefresh ? 'ON (5s)' : 'OFF'}
            </span>
            {connectionStatus !== 'connected' && (
              <span className="text-red-600">
                ⚠️ Connection issues detected
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={actions.refreshData}
              className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
              disabled={typeof actions.refreshData !== 'function'}
            >
              🔄 Refresh Now
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
            >
              {autoRefresh ? '⏸️ Pause' : '▶️ Resume'} Auto-refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Audio alert element */}
      <audio ref={audioAlertRef} preload="auto">
        <source src="/sounds/crisis-alert.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}