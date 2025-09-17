'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminStore } from '../providers/AdminProvider';

/**
 * VolunteerStatusGrid Component - Comprehensive Volunteer Management & Workload Monitoring
 * 
 * Critical features for crisis intervention platform:
 * - Real-time volunteer availability and status tracking
 * - Crisis session assignment and workload management
 * - Burnout prevention and wellness monitoring
 * - Emergency volunteer callout system
 * - Performance analytics and intervention triggers
 * - Accessibility compliance (WCAG 2.1 AA)
 */
export default function VolunteerStatusGrid({ className = '' }) {
  const { store, actions } = useAdminStore();
  const { volunteers = [], crisisSessions = [], connectionStatus } = store;
  
  // Local state for comprehensive management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterWorkload, setFilterWorkload] = useState('all');
  const [filterBurnoutRisk, setFilterBurnoutRisk] = useState('all');
  const [sortBy, setSortBy] = useState('availability'); // availability, performance, experience, workload, last_active
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedVolunteers, setSelectedVolunteers] = useState(new Set());
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, table, compact
  const [emergencyCallout, setEmergencyCallout] = useState(false);
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Refs for volunteer management
  const calloutModalRef = useRef(null);
  const assignmentQueueRef = useRef(null);
  const metricsRef = useRef(null);
  
  // Emergency volunteer callout system
  const handleEmergencyCallout = useCallback(async (calloutType = 'general') => {
    try {
      const availableVolunteers = volunteers.filter(v => 
        v.status === 'online' || v.status === 'break'
      );
      
      const response = await fetch('/api/admin/volunteers/emergency-callout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calloutType, // 'general', 'crisis', 'high_risk', 'mass_incident'
          targetVolunteers: availableVolunteers.map(v => v.volunteer_id),
          timestamp: new Date().toISOString(),
          adminId: 'current-admin-id'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Emergency callout failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      alert(`Emergency callout sent to ${result.notifiedVolunteers} volunteers. Response tracking ID: ${result.trackingId}`);
      
    } catch (error) {
      console.error('Emergency callout failed:', error);
      alert('Failed to send emergency callout. Please contact volunteers manually.');
    }
  }, [volunteers]);
  
  // Intelligent volunteer assignment
  const handleIntelligentAssignment = useCallback(async (sessionId, requirements = {}) => {
    try {
      const response = await fetch('/api/admin/volunteers/intelligent-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          requirements, // specialties, experience_level, availability_window
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Intelligent assignment failed');
      }
      
      const result = await response.json();
      if (result.recommendedVolunteer) {
        alert(`Recommended volunteer: ${result.recommendedVolunteer.name} (Match score: ${result.matchScore}%)`);
      } else {
        alert('No suitable volunteers available. Consider emergency callout.');
      }
      
    } catch (error) {
      console.error('Intelligent assignment failed:', error);
    }
  }, []);
  
  // Volunteer wellness intervention
  const handleWellnessIntervention = useCallback(async (volunteerId, interventionType) => {
    try {
      const response = await fetch('/api/admin/volunteers/wellness-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId,
          interventionType, // 'burnout_prevention', 'mandatory_break', 'wellness_check', 'support_meeting'
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Wellness intervention failed');
      }
      
      await actions.refreshData();
    } catch (error) {
      console.error('Wellness intervention failed:', error);
    }
  }, [actions]);
  
  // Bulk volunteer actions
  const handleBulkAction = useCallback(async (action) => {
    const volunteerIds = Array.from(selectedVolunteers);
    if (volunteerIds.length === 0) return;
    
    try {
      await Promise.all(volunteerIds.map(id => {
        switch (action) {
          case 'mandatory_break':
            return handleWellnessIntervention(id, 'mandatory_break');
          case 'wellness_check':
            return handleWellnessIntervention(id, 'wellness_check');
          case 'emergency_callout':
            return handleEmergencyCallout('selected');
          default:
            return Promise.resolve();
        }
      }));
      setSelectedVolunteers(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [selectedVolunteers, handleWellnessIntervention, handleEmergencyCallout]);
  
  // Auto-refresh volunteer data
  useEffect(() => {
    if (typeof actions.fetchVolunteers !== 'function') return;
    
    const refreshVolunteers = async () => {
      try {
        await actions.fetchVolunteers();
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to refresh volunteers:', error);
      }
    };
    
    refreshVolunteers();
    const interval = setInterval(refreshVolunteers, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [actions]);
  
  // Auto-assignment for urgent sessions
  useEffect(() => {
    if (!autoAssignment) return;
    
    const urgentSessions = crisisSessions.filter(s => 
      s.status === 'waiting' && 
      (s.priority === 'critical' || s.risk_score >= 80) &&
      !s.volunteer_id
    );
    
    urgentSessions.forEach(session => {
      handleIntelligentAssignment(session.session_id, {
        specialties: session.required_specialties || [],
        urgency: 'high'
      });
    });
  }, [crisisSessions, autoAssignment, handleIntelligentAssignment]);
  
  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-700 bg-green-100 border-green-300';
      case 'busy': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'break': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'offline': return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'training': return 'text-purple-700 bg-purple-100 border-purple-300';
      case 'emergency': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };
  
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getBurnoutRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getWorkloadColor = (workload) => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 70) return 'text-orange-600';
    if (workload >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const formatLastActive = (timestamp) => {
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  const calculateWorkload = (volunteer) => {
    const sessionsToday = volunteer.sessions_today || 0;
    const hoursToday = volunteer.hours_today || 0;
    const maxSessions = 8; // Configurable limit
    const maxHours = 8; // Configurable limit
    
    return Math.max(
      (sessionsToday / maxSessions) * 100,
      (hoursToday / maxHours) * 100
    );
  };
  
  const getAvailableSpecialties = () => {
    const allSpecialties = volunteers.reduce((acc, volunteer) => {
      (volunteer.specialties || []).forEach(specialty => acc.add(specialty));
      return acc;
    }, new Set());
    return Array.from(allSpecialties).sort();
  };
  
  // Filter and sort volunteers
  const filteredAndSortedVolunteers = volunteers
    .filter(volunteer => {
      const matchesSearch = searchTerm === '' ||
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.volunteer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || volunteer.status === filterStatus;
      const matchesSpecialty = filterSpecialty === 'all' || 
        volunteer.specialties?.includes(filterSpecialty);
      
      const workload = calculateWorkload(volunteer);
      const matchesWorkload = filterWorkload === 'all' ||
        (filterWorkload === 'high' && workload >= 70) ||
        (filterWorkload === 'medium' && workload >= 40 && workload < 70) ||
        (filterWorkload === 'low' && workload < 40);
      
      const matchesBurnout = filterBurnoutRisk === 'all' || 
        volunteer.burnout_risk === filterBurnoutRisk;
      
      return matchesSearch && matchesStatus && matchesSpecialty && matchesWorkload && matchesBurnout;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'availability':
          const statusOrder = { online: 0, break: 1, busy: 2, training: 3, offline: 4 };
          aVal = statusOrder[a.status] || 5;
          bVal = statusOrder[b.status] || 5;
          break;
        case 'performance':
          aVal = a.performance_score || 0;
          bVal = b.performance_score || 0;
          break;
        case 'experience':
          aVal = a.total_sessions || 0;
          bVal = b.total_sessions || 0;
          break;
        case 'workload':
          aVal = calculateWorkload(a);
          bVal = calculateWorkload(b);
          break;
        case 'last_active':
          aVal = new Date(a.last_active || 0);
          bVal = new Date(b.last_active || 0);
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  
  const getVolunteerCounts = () => {
    return {
      total: volunteers.length,
      online: volunteers.filter(v => v.status === 'online').length,
      available: volunteers.filter(v => v.status === 'online' && !v.current_session_id).length,
      busy: volunteers.filter(v => v.current_session_id).length,
      break: volunteers.filter(v => v.status === 'break').length,
      offline: volunteers.filter(v => v.status === 'offline').length,
      highRisk: volunteers.filter(v => v.burnout_risk === 'high' || v.burnout_risk === 'critical').length,
      overworked: volunteers.filter(v => calculateWorkload(v) >= 80).length
    };
  };
  
  const counts = getVolunteerCounts();
  const hasUrgentIssues = counts.highRisk > 0 || counts.overworked > 0;
  
  if (!volunteers.length) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium mb-2">No Volunteers</h3>
          <p>No volunteers are currently registered in the system.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg border ${hasUrgentIssues ? 'border-orange-500' : 'border-gray-200'} ${className}`}
      role="region"
      aria-label="Volunteer Status and Management Grid"
    >
      {/* Header */}
      <div className={`p-6 rounded-t-lg ${hasUrgentIssues ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Volunteer Management</h2>
            {hasUrgentIssues && (
              <span className="animate-pulse bg-yellow-400 text-orange-900 px-2 py-1 rounded-full text-xs font-bold">
                ATTENTION NEEDED
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 text-sm ${connectionStatus === 'connected' ? 'text-green-200' : 'text-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{connectionStatus === 'connected' ? 'Live' : 'Offline'}</span>
            </div>
            <div className="text-sm">
              {counts.available} available • {counts.busy} active
            </div>
            <div className="text-sm">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Urgent Issues Alert */}
        {hasUrgentIssues && (
          <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg" role="alert">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-orange-600 text-xl mr-2">⚠️</span>
                <div>
                  <h3 className="text-orange-800 font-bold text-lg">Volunteer Welfare Alert</h3>
                  <p className="text-orange-700">
                    {counts.highRisk} volunteer(s) at high burnout risk, {counts.overworked} overworked volunteers
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('wellness_check')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  🔍 Wellness Check
                </button>
                <button
                  onClick={() => handleEmergencyCallout('crisis')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  📢 Emergency Callout
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Volunteer Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-gray-600 text-sm font-medium">Total</div>
            <div className="text-xl font-bold text-gray-800">{counts.total}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-green-600 text-sm font-medium">Available</div>
            <div className="text-xl font-bold text-green-800">{counts.available}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-blue-600 text-sm font-medium">Online</div>
            <div className="text-xl font-bold text-blue-800">{counts.online}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-yellow-600 text-sm font-medium">Active</div>
            <div className="text-xl font-bold text-yellow-800">{counts.busy}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-purple-600 text-sm font-medium">On Break</div>
            <div className="text-xl font-bold text-purple-800">{counts.break}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-gray-600 text-sm font-medium">Offline</div>
            <div className="text-xl font-bold text-gray-800">{counts.offline}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-orange-600 text-sm font-medium">High Risk</div>
            <div className="text-xl font-bold text-orange-800">{counts.highRisk}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-red-600 text-sm font-medium">Overworked</div>
            <div className="text-xl font-bold text-red-800">{counts.overworked}</div>
          </div>
        </div>
        
        {/* Controls and Filters */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex-1 min-w-64">
            <input 
              type="text" 
              placeholder="Search by name, ID, or specialty..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search volunteers"
            />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="busy">Busy</option>
            <option value="break">On Break</option>
            <option value="offline">Offline</option>
            <option value="training">In Training</option>
            <option value="emergency">Emergency</option>
          </select>
          
          <select 
            value={filterSpecialty} 
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by specialty"
          >
            <option value="all">All Specialties</option>
            {getAvailableSpecialties().map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          
          <select 
            value={filterWorkload} 
            onChange={(e) => setFilterWorkload(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by workload"
          >
            <option value="all">All Workloads</option>
            <option value="high">High Workload (70%+)</option>
            <option value="medium">Medium Workload (40-69%)</option>
            <option value="low">Low Workload (0-39%)</option>
          </select>
          
          <select 
            value={filterBurnoutRisk} 
            onChange={(e) => setFilterBurnoutRisk(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by burnout risk"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
          
          <select 
            value={`${sortBy}-${sortOrder}`} 
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort volunteers"
          >
            <option value="availability-asc">Availability (Best)</option>
            <option value="performance-desc">Performance (High to Low)</option>
            <option value="workload-asc">Workload (Low to High)</option>
            <option value="experience-desc">Experience (Most)</option>
            <option value="last_active-desc">Recently Active</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="grid">Grid View</option>
              <option value="table">Table View</option>
              <option value="compact">Compact View</option>
            </select>
          </div>
          
          {selectedVolunteers.size > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('wellness_check')}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Wellness Check ({selectedVolunteers.size})
              </button>
              <button
                onClick={() => handleBulkAction('mandatory_break')}
                className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
              >
                Mandatory Break
              </button>
            </div>
          )}
        </div>
        
        {/* Management Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={autoAssignment} 
              onChange={(e) => setAutoAssignment(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-assignment enabled</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={showAdvancedMetrics} 
              onChange={(e) => setShowAdvancedMetrics(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show advanced metrics</span>
          </label>
          
          <button
            onClick={() => handleEmergencyCallout('general')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            📢 Emergency Callout
          </button>
          
          <button
            onClick={() => window.open('/admin/volunteers/analytics', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            📊 Analytics Dashboard
          </button>
        </div>
        
        {/* Volunteers Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedVolunteers.map((volunteer) => {
              const workload = calculateWorkload(volunteer);
              return (
                <div 
                  key={volunteer.volunteer_id} 
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    volunteer.burnout_risk === 'high' || volunteer.burnout_risk === 'critical' ? 'border-orange-300 bg-orange-50' :
                    workload >= 80 ? 'border-red-300 bg-red-50' :
                    volunteer.status === 'online' ? 'border-green-300 bg-green-50' :
                    'border-gray-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedVolunteers.has(volunteer.volunteer_id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedVolunteers);
                          if (e.target.checked) {
                            newSelected.add(volunteer.volunteer_id);
                          } else {
                            newSelected.delete(volunteer.volunteer_id);
                          }
                          setSelectedVolunteers(newSelected);
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select volunteer ${volunteer.name}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate text-sm">{volunteer.name}</h3>
                        <p className="text-xs text-gray-500">{volunteer.volunteer_id}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(volunteer.status)}`}>
                      {volunteer.status}
                    </span>
                  </div>
                  
                  {/* Current Session */}
                  {volunteer.current_session_id && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded text-xs border border-yellow-200">
                      <span className="font-medium text-yellow-800">Active Session:</span>
                      <div className="text-yellow-700">{volunteer.current_session_id}</div>
                      <div className="text-yellow-600">Duration: {volunteer.session_duration || '0m'}</div>
                    </div>
                  )}
                  
                  {/* Performance & Workload */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-gray-500">Performance:</span>
                      <div className={`font-medium ${getPerformanceColor(volunteer.performance_score || 0)}`}>
                        {volunteer.performance_score || 0}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Workload:</span>
                      <div className={`font-medium ${getWorkloadColor(workload)}`}>
                        {workload.toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Sessions:</span>
                      <div className="font-medium text-gray-900">{volunteer.total_sessions || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Today:</span>
                      <div className="font-medium text-gray-900">{volunteer.sessions_today || 0}</div>
                    </div>
                  </div>
                  
                  {/* Burnout Risk */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">Burnout Risk:</span>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${getBurnoutRiskColor(volunteer.burnout_risk || 'low')}`}>
                      {(volunteer.burnout_risk || 'low').toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Specialties */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">Specialties:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(volunteer.specialties || []).slice(0, 3).map((specialty, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                      {(volunteer.specialties?.length || 0) > 3 && (
                        <span className="text-xs text-gray-500">
                          +{(volunteer.specialties?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Advanced Metrics */}
                  {showAdvancedMetrics && (
                    <div className="mb-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Response Time:</span>
                          <div className="font-medium">{volunteer.avg_response_time || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Satisfaction:</span>
                          <div className="font-medium">{volunteer.client_satisfaction || 'N/A'}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Hours Today:</span>
                          <div className="font-medium">{volunteer.hours_today || 0}h</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Escalations:</span>
                          <div className="font-medium">{volunteer.escalations_today || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Last Active */}
                  <div className="text-xs text-gray-500 mb-3">
                    Last active: {formatLastActive(volunteer.last_active || new Date().toISOString())}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-1">
                    {volunteer.status === 'online' && !volunteer.current_session_id && (
                      <button 
                        className="flex-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        onClick={() => handleIntelligentAssignment('next-session', { preferredVolunteer: volunteer.volunteer_id })}
                      >
                        Assign
                      </button>
                    )}
                    {(volunteer.burnout_risk === 'high' || workload >= 80) && (
                      <button 
                        className="flex-1 text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                        onClick={() => handleWellnessIntervention(volunteer.volunteer_id, 'mandatory_break')}
                      >
                        Break
                      </button>
                    )}
                    <button 
                      className="flex-1 text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      onClick={() => window.open(`/admin/volunteers/${volunteer.volunteer_id}`, '_blank')}
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVolunteers(new Set(filteredAndSortedVolunteers.map(v => v.volunteer_id)));
                        } else {
                          setSelectedVolunteers(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volunteer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workload</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Burnout Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedVolunteers.map((volunteer) => {
                  const workload = calculateWorkload(volunteer);
                  return (
                    <tr key={volunteer.volunteer_id} className={`hover:bg-gray-50 ${
                      volunteer.burnout_risk === 'high' || workload >= 80 ? 'bg-orange-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVolunteers.has(volunteer.volunteer_id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedVolunteers);
                            if (e.target.checked) {
                              newSelected.add(volunteer.volunteer_id);
                            } else {
                              newSelected.delete(volunteer.volunteer_id);
                            }
                            setSelectedVolunteers(newSelected);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{volunteer.name}</div>
                          <div className="text-sm text-gray-500">{volunteer.volunteer_id}</div>
                          <div className="text-xs text-gray-400">
                            {(volunteer.specialties || []).slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(volunteer.status)}`}>
                          {volunteer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`font-medium ${getPerformanceColor(volunteer.performance_score || 0)}`}>
                          {volunteer.performance_score || 0}%
                        </div>
                        <div className="text-xs text-gray-500">{volunteer.total_sessions || 0} sessions</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`font-medium ${getWorkloadColor(workload)}`}>
                          {workload.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">{volunteer.sessions_today || 0} today</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getBurnoutRiskColor(volunteer.burnout_risk || 'low')}`}>
                          {(volunteer.burnout_risk || 'low').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {volunteer.current_session_id ? (
                          <div>
                            <div className="font-medium text-gray-900">{volunteer.current_session_id}</div>
                            <div className="text-xs text-gray-500">{volunteer.session_duration || '0m'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          {volunteer.status === 'online' && !volunteer.current_session_id && (
                            <button className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs">
                              Assign
                            </button>
                          )}
                          {(volunteer.burnout_risk === 'high' || workload >= 80) && (
                            <button 
                              onClick={() => handleWellnessIntervention(volunteer.volunteer_id, 'mandatory_break')}
                              className="text-orange-600 hover:text-orange-900 bg-orange-100 hover:bg-orange-200 px-2 py-1 rounded text-xs"
                            >
                              Break
                            </button>
                          )}
                          <button 
                            onClick={() => window.open(`/admin/volunteers/${volunteer.volunteer_id}`, '_blank')}
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Compact View
          <div className="space-y-2">
            {filteredAndSortedVolunteers.map((volunteer) => {
              const workload = calculateWorkload(volunteer);
              return (
                <div 
                  key={volunteer.volunteer_id} 
                  className={`flex items-center justify-between p-3 border rounded hover:bg-gray-50 ${
                    volunteer.burnout_risk === 'high' || workload >= 80 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.has(volunteer.volunteer_id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedVolunteers);
                        if (e.target.checked) {
                          newSelected.add(volunteer.volunteer_id);
                        } else {
                          newSelected.delete(volunteer.volunteer_id);
                        }
                        setSelectedVolunteers(newSelected);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`w-3 h-3 rounded-full ${
                      volunteer.status === 'online' ? 'bg-green-500' :
                      volunteer.status === 'busy' ? 'bg-yellow-500' :
                      volunteer.status === 'break' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}></span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{volunteer.name}</div>
                      <div className="text-xs text-gray-500">
                        {volunteer.status} • {volunteer.performance_score || 0}% • {workload.toFixed(0)}% workload
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {volunteer.current_session_id && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                    {(volunteer.burnout_risk === 'high' || workload >= 80) && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        At Risk
                      </span>
                    )}
                    <button className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200">
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredAndSortedVolunteers.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🔍</div>
            <p>No volunteers found matching your search criteria.</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center space-x-4">
            <span>Auto-assignment: <strong>{autoAssignment ? 'ON' : 'OFF'}</strong></span>
            <span>View: <strong>{viewMode}</strong></span>
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
              onClick={() => window.open('/admin/volunteers/export', '_blank')}
              className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
            >
              📊 Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}