'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminStore } from '../providers/AdminProvider';

/**
 * AlertsPanel Component - Real-time Crisis Alert Management
 * 
 * Critical features for crisis intervention:
 * - Real-time emergency alerts with audio notifications
 * - 911/988 emergency action buttons
 * - Crisis escalation workflows
 * - Automatic severity-based sorting
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Error handling and retry mechanisms
 */
export default function AlertsPanel({ className = '' }) {
  const { store, actions } = useAdminStore();
  const { alerts = [], connectionStatus } = store;
  
  // Local state for UI management
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDismissed, setShowDismissed] = useState(false);
  const [sortOrder, setSortOrder] = useState('priority'); // priority, time, category
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [lastAlertSound, setLastAlertSound] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState({});
  
  // Refs for accessibility and audio
  const alertSoundRef = useRef(null);
  const previousAlertsRef = useRef(new Set());
  const emergencyActionsRef = useRef(null);
  
  // Audio notification system
  const playAlertSound = useCallback((priority) => {
    if (isPlayingAudio) return;
    
    // Use different audio for different priority levels
    const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;
    if (!audioContext) return;
    
    const frequency = priority === 'critical' ? 800 : priority === 'emergency' ? 600 : 400;
    const duration = priority === 'critical' ? 2000 : 1000;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
    
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), duration);
  }, [isPlayingAudio]);
  
  // Emergency action handlers
  const handleEmergencyCall = useCallback(async (type, alertId) => {
    try {
      const alert = alerts.find(a => a.alert_id === alertId);
      if (!alert) return;
      
      const response = await fetch('/api/admin/emergency-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type,
          alertId,
          alert,
          timestamp: new Date().toISOString(),
          adminId: 'current-admin-id' // Should come from auth context
        })
      });
      
      if (!response.ok) {
        throw new Error(`Emergency action failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Show confirmation and next steps
      alert(`${type === '911' ? 'Emergency Services (911)' : 'Suicide Prevention Lifeline (988)'} contacted for alert ${alertId}. Reference ID: ${result.referenceId}`);
      
      // Mark alert as escalated
      await actions.escalateAlert(alertId, type);
      
    } catch (error) {
      console.error(`Failed to initiate ${type} emergency action:`, error);
      alert(`Failed to contact ${type}. Please retry or use backup emergency procedures.`);
    }
  }, [alerts, actions]);
  
  // Crisis escalation with multiple levels
  const handleCrisisEscalation = useCallback(async (alertId, escalationLevel = 'supervisor') => {
    try {
      const response = await fetch('/api/admin/crisis/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          escalationLevel, // supervisor, crisis_team, emergency_services
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Escalation failed');
      }
      
      await actions.escalateAlert(alertId);
    } catch (error) {
      console.error('Crisis escalation failed:', error);
      // Retry mechanism
      const attempts = retryAttempts[alertId] || 0;
      if (attempts < 3) {
        setRetryAttempts(prev => ({ ...prev, [alertId]: attempts + 1 }));
        setTimeout(() => handleCrisisEscalation(alertId, escalationLevel), 2000);
      }
    }
  }, [actions, retryAttempts]);
  
  // Bulk actions for multiple alerts
  const handleBulkAction = useCallback(async (action) => {
    const alertIds = Array.from(selectedAlerts);
    if (alertIds.length === 0) return;
    
    try {
      await Promise.all(alertIds.map(id => {
        switch (action) {
          case 'dismiss':
            return actions.dismissAlert(id);
          case 'escalate':
            return handleCrisisEscalation(id);
          default:
            return Promise.resolve();
        }
      }));
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [selectedAlerts, actions, handleCrisisEscalation]);
  
  // Auto-refresh with exponential backoff on errors
  useEffect(() => {
    if (typeof actions.fetchAlerts !== 'function') return;
    
    let interval;
    let refreshDelay = 3000; // Start with 3 seconds
    
    const refreshAlerts = async () => {
      try {
        await actions.fetchAlerts();
        refreshDelay = 3000; // Reset delay on success
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        refreshDelay = Math.min(refreshDelay * 2, 30000); // Exponential backoff, max 30s
      }
    };
    
    refreshAlerts();
    interval = setInterval(refreshAlerts, refreshDelay);
    
    return () => clearInterval(interval);
  }, [actions]);
  
  // Detect new critical alerts and play sound
  useEffect(() => {
    const currentAlertIds = new Set(alerts.filter(a => a.status === 'active').map(a => a.alert_id));
    const newAlerts = alerts.filter(alert => 
      !previousAlertsRef.current.has(alert.alert_id) && 
      alert.status === 'active' && 
      (alert.priority === 'critical' || alert.priority === 'emergency')
    );
    
    if (newAlerts.length > 0) {
      const highestPriority = newAlerts.find(a => a.priority === 'critical') ? 'critical' : 'emergency';
      playAlertSound(highestPriority);
    }
    
    previousAlertsRef.current = currentAlertIds;
  }, [alerts, playAlertSound]);
  
  // Utility functions for display
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-800 bg-red-200 border-red-500 shadow-red-200';
      case 'emergency': return 'text-red-700 bg-red-100 border-red-400 shadow-red-100';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-400 shadow-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-400 shadow-yellow-100';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-400 shadow-blue-100';
      default: return 'text-gray-700 bg-gray-100 border-gray-400 shadow-gray-100';
    }
  };
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'emergency': return '🆘';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'system': return '🖥️';
      case 'security': return '🔒';
      case 'crisis': return '🆘';
      case 'volunteer': return '👥';
      case 'performance': return '⚡';
      case 'safety': return '🛡️';
      case 'medical': return '🏥';
      default: return '📢';
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return alertTime.toLocaleDateString();
  };
  
  // Filter and sort alerts
  const filteredAndSortedAlerts = alerts
    .filter(alert => {
      if (!showDismissed && alert.status === 'dismissed') return false;
      if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && alert.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'priority':
          const priorityOrder = { critical: 0, emergency: 1, high: 2, medium: 3, low: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'time':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  
  const getAlertCounts = () => {
    const active = alerts.filter(a => a.status === 'active');
    return {
      total: active.length,
      critical: active.filter(a => a.priority === 'critical').length,
      emergency: active.filter(a => a.priority === 'emergency').length,
      high: active.filter(a => a.priority === 'high').length,
      medium: active.filter(a => a.priority === 'medium').length,
      low: active.filter(a => a.priority === 'low').length,
    };
  };
  
  const counts = getAlertCounts();
  const hasEmergencyAlerts = counts.critical > 0 || counts.emergency > 0;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg border ${hasEmergencyAlerts ? 'border-red-500 shadow-red-200' : 'border-gray-200'} ${className}`}
      role="region"
      aria-label="Crisis Alert Management Panel"
    >
      {/* Header with Connection Status */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Crisis Alert Center</h2>
            {hasEmergencyAlerts && (
              <span className="animate-pulse bg-yellow-400 text-red-900 px-2 py-1 rounded-full text-xs font-bold">
                EMERGENCY
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 text-sm ${connectionStatus === 'connected' ? 'text-green-200' : 'text-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{connectionStatus === 'connected' ? 'Live' : 'Offline'}</span>
            </div>
            <div className="text-sm">
              {counts.total} active alert{counts.total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Emergency Alert Summary */}
        {hasEmergencyAlerts && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg" role="alert">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">🚨</span>
                <div>
                  <h3 className="text-red-800 font-bold text-lg">Emergency Alerts Active</h3>
                  <p className="text-red-700">
                    {counts.critical} critical, {counts.emergency} emergency alerts require immediate attention
                  </p>
                </div>
              </div>
              <div className="flex space-x-2" ref={emergencyActionsRef}>
                <button
                  onClick={() => handleEmergencyCall('911', 'bulk')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Contact Emergency Services (911)"
                >
                  📞 911
                </button>
                <button
                  onClick={() => handleEmergencyCall('988', 'bulk')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Contact Suicide Prevention Lifeline (988)"
                >
                  📞 988
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Alert Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-sm font-medium">Total</div>
            <div className="text-2xl font-bold text-gray-800">{counts.total}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 text-sm font-medium">Critical</div>
            <div className="text-2xl font-bold text-red-800">{counts.critical}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 text-sm font-medium">Emergency</div>
            <div className="text-2xl font-bold text-red-700">{counts.emergency}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-orange-600 text-sm font-medium">High</div>
            <div className="text-2xl font-bold text-orange-800">{counts.high}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-yellow-600 text-sm font-medium">Medium</div>
            <div className="text-2xl font-bold text-yellow-800">{counts.medium}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 text-sm font-medium">Low</div>
            <div className="text-2xl font-bold text-blue-800">{counts.low}</div>
          </div>
        </div>
        
        {/* Controls and Filters */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="crisis">Crisis</option>
            <option value="security">Security</option>
            <option value="system">System</option>
            <option value="volunteer">Volunteer</option>
            <option value="performance">Performance</option>
            <option value="safety">Safety</option>
            <option value="medical">Medical</option>
          </select>
          
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Sort alerts"
          >
            <option value="priority">Sort by Priority</option>
            <option value="time">Sort by Time</option>
            <option value="category">Sort by Category</option>
          </select>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={showDismissed} 
              onChange={(e) => setShowDismissed(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show dismissed</span>
          </label>
          
          {selectedAlerts.size > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('dismiss')}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Dismiss Selected ({selectedAlerts.size})
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
        
        {/* Alerts List */}
        <div className="space-y-4 max-h-96 overflow-y-auto" role="list">
          {filteredAndSortedAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-medium mb-2">All Clear</h3>
              <p className="text-gray-600">
                {showDismissed 
                  ? 'No alerts match your current filters.' 
                  : 'No active alerts at this time. System is running normally.'}
              </p>
            </div>
          ) : (
            filteredAndSortedAlerts.map((alert) => (
              <div 
                key={alert.alert_id} 
                className={`border-l-4 p-4 rounded-r-md shadow-sm ${getPriorityColor(alert.priority)} ${alert.status === 'dismissed' ? 'opacity-60' : ''} ${alert.priority === 'critical' ? 'animate-pulse' : ''}`}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setExpandedAlert(expandedAlert === alert.alert_id ? null : alert.alert_id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert.alert_id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedAlerts);
                          if (e.target.checked) {
                            newSelected.add(alert.alert_id);
                          } else {
                            newSelected.delete(alert.alert_id);
                          }
                          setSelectedAlerts(newSelected);
                        }}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select alert ${alert.alert_id}`}
                      />
                      <span className="text-xl mr-2" aria-hidden="true">
                        {getPriorityIcon(alert.priority)}
                      </span>
                      <span className="text-sm mr-2" aria-hidden="true">
                        {getCategoryIcon(alert.category)}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg">{alert.title}</h3>
                      <span className={`ml-3 inline-flex px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mb-3 text-base font-medium">{alert.message}</p>
                    
                    {alert.details && expandedAlert === alert.alert_id && (
                      <div className="bg-white bg-opacity-70 p-3 rounded text-sm mb-3 border border-gray-200">
                        <strong>Details:</strong> {alert.details}
                      </div>
                    )}
                    
                    {alert.actions && alert.actions.length > 0 && expandedAlert === alert.alert_id && (
                      <div className="mb-3">
                        <strong className="text-sm font-bold">Recommended Actions:</strong>
                        <ul className="text-sm list-disc list-inside ml-2 mt-1">
                          {alert.actions.map((action, index) => (
                            <li key={index} className="mb-1">{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Category: <strong>{alert.category}</strong></span>
                        <span>Created: <strong>{formatTimestamp(alert.created_at)}</strong></span>
                        {alert.source && (
                          <span>Source: <strong>{alert.source}</strong></span>
                        )}
                      </div>
                      <button
                        onClick={() => setExpandedAlert(expandedAlert === alert.alert_id ? null : alert.alert_id)}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        {expandedAlert === alert.alert_id ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {alert.status === 'active' && (
                    <div className="flex flex-col gap-2 ml-4">
                      {(alert.priority === 'critical' || alert.priority === 'emergency') && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEmergencyCall('911', alert.alert_id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Contact Emergency Services (911)"
                          >
                            📞 911
                          </button>
                          <button
                            onClick={() => handleEmergencyCall('988', alert.alert_id)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Contact Suicide Prevention Lifeline (988)"
                          >
                            📞 988
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => actions.dismissAlert(alert.alert_id)}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Dismiss
                      </button>
                      {alert.priority !== 'critical' && (
                        <button
                          onClick={() => handleCrisisEscalation(alert.alert_id)}
                          className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer with Auto-refresh Status */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div>
            Auto-refreshing every 3 seconds
            {connectionStatus !== 'connected' && (
              <span className="text-red-600 ml-2">
                ⚠️ Connection issues detected
              </span>
            )}
          </div>
          <button
            onClick={actions.refreshData}
            className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
            disabled={typeof actions.refreshData !== 'function'}
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}