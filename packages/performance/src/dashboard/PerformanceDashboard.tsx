/**
 * Performance Dashboard Component
 * 
 * Real-time performance monitoring dashboard for the crisis platform.
 */

import React, { useState, useEffect, useCallback } from 'react';

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  resolved: boolean;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Connect to performance WebSocket
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/performance`);
    
    ws.onopen = () => {
      setWsStatus('connected');
      console.log('Connected to performance monitoring');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'metrics') {
        updateMetrics(data.metrics);
      } else if (data.type === 'alert') {
        addAlert(data.alert);
      }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      console.log('Disconnected from performance monitoring');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/performance/metrics');
        const data = await response.json();
        updateMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const updateMetrics = useCallback((data: any) => {
    const newMetrics: PerformanceMetric[] = [
      {
        label: 'Crisis API Response',
        value: data.response?.p95 || 0,
        unit: 'ms',
        threshold: 200,
        status: getStatus(data.response?.p95 || 0, 200, 500)
      },
      {
        label: 'WebSocket Latency',
        value: data.websocket?.latency || 0,
        unit: 'ms',
        threshold: 100,
        status: getStatus(data.websocket?.latency || 0, 100, 200)
      },
      {
        label: 'Database Query Time',
        value: data.database?.queryTime || 0,
        unit: 'ms',
        threshold: 50,
        status: getStatus(data.database?.queryTime || 0, 50, 100)
      },
      {
        label: 'CPU Usage',
        value: data.cpu?.usage || 0,
        unit: '%',
        threshold: 80,
        status: getStatus(data.cpu?.usage || 0, 80, 90)
      },
      {
        label: 'Memory Usage',
        value: ((data.memory?.used || 0) / (data.memory?.total || 1)) * 100,
        unit: '%',
        threshold: 85,
        status: getStatus(((data.memory?.used || 0) / (data.memory?.total || 1)) * 100, 85, 95)
      },
      {
        label: 'Active Emergencies',
        value: data.crisis?.activeEmergencies || 0,
        unit: '',
        threshold: 100,
        status: getStatus(data.crisis?.activeEmergencies || 0, 100, 200)
      }
    ];

    setMetrics(newMetrics);
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
  }, []);

  const getStatus = (value: number, warning: number, critical: number): 'good' | 'warning' | 'critical' => {
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#991b1b';
      default: return '#6b7280';
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/performance/alerts/${alertId}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, resolved: true } : a
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Performance Monitoring Dashboard
        </h1>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ 
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: wsStatus === 'connected' ? '#065f46' : '#7c2d12',
            color: wsStatus === 'connected' ? '#10b981' : '#f59e0b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {wsStatus === 'connected' ? '● Live' : '○ Disconnected'}
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: autoRefresh ? '#1e40af' : '#1e293b',
              color: '#e2e8f0',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {metrics.map((metric, index) => (
          <div key={index} style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            border: `2px solid ${getStatusColor(metric.status)}20`,
            transition: 'all 0.3s'
          }}>
            <div style={{ 
              fontSize: '14px',
              color: '#94a3b8',
              marginBottom: '8px'
            }}>
              {metric.label}
            </div>
            
            <div style={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              color: getStatusColor(metric.status),
              marginBottom: '8px'
            }}>
              {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
              <span style={{ fontSize: '18px', marginLeft: '4px' }}>
                {metric.unit}
              </span>
            </div>
            
            <div style={{ 
              fontSize: '12px',
              color: '#64748b'
            }}>
              Threshold: {metric.threshold}{metric.unit}
            </div>
            
            {/* Progress bar */}
            <div style={{
              marginTop: '12px',
              height: '4px',
              backgroundColor: '#334155',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%`,
                height: '100%',
                backgroundColor: getStatusColor(metric.status),
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#1e293b'
      }}>
        <h2 style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Active Alerts
        </h2>
        
        <div style={{ 
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {alerts.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              color: '#64748b',
              padding: '40px'
            }}>
              No active alerts
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} style={{
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                opacity: alert.resolved ? 0.5 : 1
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: `${getSeverityColor(alert.severity)}20`,
                        color: getSeverityColor(alert.severity),
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </span>
                      
                      <span style={{ 
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div style={{ 
                      fontSize: '14px',
                      color: '#e2e8f0'
                    }}>
                      {alert.message}
                    </div>
                  </div>
                  
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#334155',
                        color: '#e2e8f0',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;