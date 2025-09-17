'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface CrisisAlert {
  id: string;
  sessionId: string;
  type: 'suicide_risk' | 'self_harm' | 'violence' | 'panic' | 'psychotic' | 'substance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  message: string;
  clientId: string;
  volunteerId?: string;
  status: 'new' | 'acknowledged' | 'escalated' | 'resolved';
  riskIndicators: string[];
  suggestedActions: string[];
}

interface LiveMetrics {
  activeCrises: number;
  criticalSessions: number;
  averageResponseTime: number;
  escalationRate: number;
  resolutionRate: number;
  volunteerUtilization: number;
}

export default function RealTimeCrisisMonitor() {
  const { store, socket } = useAdminStore();
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeCrises: 0,
    criticalSessions: 0,
    averageResponseTime: 0,
    escalationRate: 0,
    resolutionRate: 0,
    volunteerUtilization: 0
  });
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // WebSocket event handlers for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleCrisisAlert = (data: CrisisAlert) => {
      setAlerts(prev => [data, ...prev].slice(0, 50)); // Keep last 50 alerts
      
      // Auto-play sound for critical alerts
      if (data.severity === 'critical') {
        playAlertSound();
      }
    };

    const handleMetricsUpdate = (data: LiveMetrics) => {
      setMetrics(data);
    };

    socket.on('crisis:alert', handleCrisisAlert);
    socket.on('metrics:update', handleMetricsUpdate);

    return () => {
      socket.off('crisis:alert', handleCrisisAlert);
      socket.off('metrics:update', handleMetricsUpdate);
    };
  }, [socket]);

  const playAlertSound = () => {
    // Create a simple beep sound for critical alerts
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleEscalate = useCallback((alertId: string) => {
    if (!socket) return;
    
    socket.emit('crisis:escalate', { alertId });
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'escalated' } : a
    ));
  }, [socket]);

  const handleAcknowledge = useCallback((alertId: string) => {
    if (!socket) return;
    
    socket.emit('crisis:acknowledge', { alertId });
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'acknowledged' } : a
    ));
  }, [socket]);

  const handleResolve = useCallback((alertId: string) => {
    if (!socket) return;
    
    socket.emit('crisis:resolve', { alertId });
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'resolved' } : a
    ));
  }, [socket]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'suicide_risk': return '🚨';
      case 'self_harm': return '⚠️';
      case 'violence': return '👊';
      case 'panic': return '😰';
      case 'psychotic': return '🌀';
      case 'substance': return '💊';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Live Indicator */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Crisis Monitor</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm text-gray-600">LIVE</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-red-800">{metrics.activeCrises}</div>
          <div className="text-sm text-red-600 mt-1">Active Crises</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-orange-800">{metrics.criticalSessions}</div>
          <div className="text-sm text-orange-600 mt-1">Critical Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-800">{metrics.averageResponseTime}s</div>
          <div className="text-sm text-blue-600 mt-1">Avg Response</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-yellow-800">{metrics.escalationRate}%</div>
          <div className="text-sm text-yellow-600 mt-1">Escalation Rate</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-800">{metrics.resolutionRate}%</div>
          <div className="text-sm text-green-600 mt-1">Resolution Rate</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-purple-800">{metrics.volunteerUtilization}%</div>
          <div className="text-sm text-purple-600 mt-1">Volunteer Utilization</div>
        </div>
      </div>

      {/* Crisis Alerts Stream */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Crisis Alert Stream</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🛡️</div>
              <p>No active crisis alerts at this time</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    alert.status === 'new' ? 'bg-red-50' : ''
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getAlertTypeIcon(alert.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`}></span>
                          <span className="font-semibold text-gray-900">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            Session: {alert.sessionId}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{alert.message}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {alert.riskIndicators.map((indicator, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                            >
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex space-x-2">
                        {alert.status === 'new' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledge(alert.id);
                              }}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEscalate(alert.id);
                              }}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Escalate
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(alert.id);
                            }}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status === 'escalated' && (
                          <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Escalated
                          </span>
                        )}
                        {alert.status === 'resolved' && (
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Crisis Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Alert Type</label>
                  <p className="mt-1 text-lg">{selectedAlert.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Severity</label>
                  <p className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedAlert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      selectedAlert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedAlert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-gray-900">{selectedAlert.message}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Risk Indicators</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAlert.riskIndicators.map((indicator, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Suggested Actions</label>
                  <ul className="mt-2 space-y-1">
                    {selectedAlert.suggestedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedAlert.status === 'new' && (
                    <>
                      <button
                        onClick={() => {
                          handleAcknowledge(selectedAlert.id);
                          setSelectedAlert(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => {
                          handleEscalate(selectedAlert.id);
                          setSelectedAlert(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Escalate Immediately
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}