'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminStore } from '../providers/AdminProvider';

/**
 * SystemHealthMonitor Component - Advanced System Performance & Health Monitoring
 * 
 * Critical features for crisis intervention platform:
 * - Real-time infrastructure monitoring (CPU, Memory, Disk, Network)
 * - Service health tracking with automatic failover detection
 * - Crisis system availability monitoring
 * - Performance metrics and threshold alerting
 * - Predictive health analysis and warnings
 * - Emergency system status dashboard
 */
export default function SystemHealthMonitor({ className = '' }) {
  const { store, actions } = useAdminStore();
  const { systemHealth, connectionStatus } = store;
  
  // Local state for advanced monitoring
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [healthHistory, setHealthHistory] = useState([]);
  const [alertThresholds, setAlertThresholds] = useState({
    cpu: { warning: 70, critical: 85 },
    memory: { warning: 75, critical: 90 },
    disk: { warning: 80, critical: 95 },
    responseTime: { warning: 2000, critical: 5000 }
  });
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h'); // 5m, 15m, 1h, 6h, 24h
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [autoScale, setAutoScale] = useState(true);
  const [performanceMode, setPerformanceMode] = useState('normal'); // normal, high_load, crisis_mode
  
  // Refs for charts and monitoring
  const chartRef = useRef(null);
  const alertSoundRef = useRef(null);
  const healthCheckIntervalRef = useRef(null);
  
  // Advanced health assessment
  const assessSystemHealth = useCallback((health) => {
    if (!health) return 'unknown';
    
    const { infrastructure, services, metrics } = health;
    const criticalIssues = [];
    const warnings = [];
    
    // Infrastructure checks
    if (infrastructure.cpu_usage > alertThresholds.cpu.critical) {
      criticalIssues.push('Critical CPU usage');
    } else if (infrastructure.cpu_usage > alertThresholds.cpu.warning) {
      warnings.push('High CPU usage');
    }
    
    if (infrastructure.memory_usage > alertThresholds.memory.critical) {
      criticalIssues.push('Critical memory usage');
    } else if (infrastructure.memory_usage > alertThresholds.memory.warning) {
      warnings.push('High memory usage');
    }
    
    if (infrastructure.disk_usage > alertThresholds.disk.critical) {
      criticalIssues.push('Critical disk usage');
    } else if (infrastructure.disk_usage > alertThresholds.disk.warning) {
      warnings.push('High disk usage');
    }
    
    // Service checks
    const criticalServices = Object.entries(services).filter(([_, service]) => 
      service.status === 'down' || service.status === 'critical'
    );
    
    const degradedServices = Object.entries(services).filter(([_, service]) => 
      service.status === 'degraded'
    );
    
    if (criticalServices.length > 0) {
      criticalIssues.push(`${criticalServices.length} critical service(s)`);
    }
    
    if (degradedServices.length > 0) {
      warnings.push(`${degradedServices.length} degraded service(s)`);
    }
    
    // Response time checks
    if (metrics.average_response_time > alertThresholds.responseTime.critical) {
      criticalIssues.push('Critical response time');
    } else if (metrics.average_response_time > alertThresholds.responseTime.warning) {
      warnings.push('High response time');
    }
    
    if (criticalIssues.length > 0) return 'critical';
    if (warnings.length > 0) return 'warning';
    return 'healthy';
  }, [alertThresholds]);
  
  // Emergency system actions
  const handleEmergencyAction = useCallback(async (action) => {
    try {
      const response = await fetch('/api/admin/system/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action, // 'scale_up', 'failover', 'emergency_mode', 'restart_services'
          timestamp: new Date().toISOString(),
          adminId: 'current-admin-id'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Emergency action failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      alert(`Emergency action "${action}" initiated. Reference: ${result.referenceId}`);
      
    } catch (error) {
      console.error(`Emergency action "${action}" failed:`, error);
      alert(`Failed to execute emergency action. Please contact system administrators.`);
    }
  }, []);
  
  // Predictive health analysis
  const predictSystemIssues = useCallback(() => {
    if (healthHistory.length < 10) return [];
    
    const predictions = [];
    const recentHistory = healthHistory.slice(-10);
    
    // CPU trend analysis
    const cpuTrend = recentHistory.map(h => h.infrastructure?.cpu_usage || 0);
    const cpuIncrease = cpuTrend[cpuTrend.length - 1] - cpuTrend[0];
    if (cpuIncrease > 20) {
      predictions.push({
        type: 'cpu_overload',
        severity: 'warning',
        message: 'CPU usage trending upward rapidly',
        timeToIssue: '15-30 minutes'
      });
    }
    
    // Memory leak detection
    const memoryTrend = recentHistory.map(h => h.infrastructure?.memory_usage || 0);
    const memoryIncrease = memoryTrend[memoryTrend.length - 1] - memoryTrend[0];
    if (memoryIncrease > 15 && memoryTrend[memoryTrend.length - 1] > 70) {
      predictions.push({
        type: 'memory_leak',
        severity: 'critical',
        message: 'Potential memory leak detected',
        timeToIssue: '5-15 minutes'
      });
    }
    
    // Service degradation pattern
    const serviceIssues = recentHistory.filter(h => 
      Object.values(h.services || {}).some(service => 
        service.status === 'degraded' || service.error_rate > 5
      )
    );
    
    if (serviceIssues.length > 5) {
      predictions.push({
        type: 'service_instability',
        severity: 'warning',
        message: 'Multiple services showing instability',
        timeToIssue: '10-20 minutes'
      });
    }
    
    return predictions;
  }, [healthHistory]);
  
  // Auto-refresh with intelligent intervals
  useEffect(() => {
    if (typeof actions.refreshData !== 'function') return;
    
    const refreshHealth = async () => {
      try {
        await actions.refreshData();
        setLastUpdated(new Date());
        
        if (systemHealth) {
          setHealthHistory(prev => {
            const newHistory = [...prev, { ...systemHealth, timestamp: new Date() }];
            return newHistory.slice(-100); // Keep last 100 readings
          });
        }
      } catch (error) {
        console.error('Failed to refresh system health:', error);
      }
    };
    
    // Adaptive refresh rate based on system health
    const currentHealth = assessSystemHealth(systemHealth);
    let refreshInterval = 30000; // Default 30 seconds
    
    if (currentHealth === 'critical') {
      refreshInterval = 5000; // 5 seconds for critical issues
    } else if (currentHealth === 'warning') {
      refreshInterval = 15000; // 15 seconds for warnings
    }
    
    refreshHealth();
    const interval = setInterval(refreshHealth, refreshInterval);
    
    return () => clearInterval(interval);
  }, [actions, systemHealth, assessSystemHealth]);
  
  // Performance mode adjustments
  useEffect(() => {
    const currentHealth = assessSystemHealth(systemHealth);
    
    if (currentHealth === 'critical' && performanceMode !== 'crisis_mode') {
      setPerformanceMode('crisis_mode');
      if (autoScale) {
        handleEmergencyAction('emergency_mode');
      }
    } else if (currentHealth === 'warning' && performanceMode === 'normal') {
      setPerformanceMode('high_load');
    } else if (currentHealth === 'healthy' && performanceMode !== 'normal') {
      setPerformanceMode('normal');
    }
  }, [systemHealth, performanceMode, autoScale, assessSystemHealth, handleEmergencyAction]);
  
  // Audio alerts for critical issues
  useEffect(() => {
    const currentHealth = assessSystemHealth(systemHealth);
    if (currentHealth === 'critical' && alertSoundRef.current) {
      const audio = new Audio('/sounds/system-critical.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if audio fails
    }
  }, [systemHealth, assessSystemHealth]);
  
  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-300';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'down': return 'text-red-700 bg-red-200 border-red-400';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '🔴';
      case 'down': return '❌';
      default: return '❓';
    }
  };
  
  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const formatBytes = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  if (!systemHealth) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const currentHealth = assessSystemHealth(systemHealth);
  const predictions = predictSystemIssues();
  const criticalServices = Object.entries(systemHealth.services).filter(([_, service]) => 
    service.status === 'down' || service.status === 'critical'
  );
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg border ${currentHealth === 'critical' ? 'border-red-500' : currentHealth === 'warning' ? 'border-yellow-500' : 'border-gray-200'} ${className}`}
      role="region"
      aria-label="System Health Monitoring Dashboard"
    >
      {/* Header */}
      <div className={`p-6 rounded-t-lg ${
        currentHealth === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' :
        currentHealth === 'warning' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white' :
        'bg-gradient-to-r from-green-600 to-green-700 text-white'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">System Health Monitor</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentHealth === 'critical' ? 'bg-red-200 text-red-900' :
              currentHealth === 'warning' ? 'bg-yellow-200 text-yellow-900' :
              'bg-green-200 text-green-900'
            }`}>
              {currentHealth.toUpperCase()}
            </span>
            {performanceMode !== 'normal' && (
              <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded-full text-xs font-bold">
                {performanceMode.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 text-sm ${connectionStatus === 'connected' ? 'text-green-200' : 'text-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{connectionStatus === 'connected' ? 'Live' : 'Offline'}</span>
            </div>
            <div className="text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Critical Alerts Section */}
        {(currentHealth === 'critical' || criticalServices.length > 0) && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg" role="alert">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">🚨</span>
                <div>
                  <h3 className="text-red-800 font-bold text-lg">Critical System Issues</h3>
                  <p className="text-red-700">
                    System requires immediate attention. {criticalServices.length} critical services affected.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEmergencyAction('failover')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  🔄 Failover
                </button>
                <button
                  onClick={() => handleEmergencyAction('scale_up')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  📈 Scale Up
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Predictive Alerts */}
        {predictions.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <h3 className="text-yellow-800 font-bold text-lg mb-2">Predictive Alerts</h3>
            <div className="space-y-2">
              {predictions.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                  <div>
                    <span className="font-medium text-yellow-800">{prediction.message}</span>
                    <span className="text-yellow-600 text-sm ml-2">ETA: {prediction.timeToIssue}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    prediction.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {prediction.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Infrastructure Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* CPU Usage */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">CPU Usage</div>
              <span className={`text-xs px-2 py-1 rounded ${
                systemHealth.infrastructure.cpu_usage > alertThresholds.cpu.critical ? 'bg-red-200 text-red-800' :
                systemHealth.infrastructure.cpu_usage > alertThresholds.cpu.warning ? 'bg-yellow-200 text-yellow-800' :
                'bg-green-200 text-green-800'
              }`}>
                {systemHealth.infrastructure.cpu_usage > alertThresholds.cpu.critical ? 'CRITICAL' :
                 systemHealth.infrastructure.cpu_usage > alertThresholds.cpu.warning ? 'WARNING' : 'NORMAL'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {systemHealth.infrastructure.cpu_usage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getMetricColor(systemHealth.infrastructure.cpu_usage, alertThresholds.cpu)}`}
                style={{ width: `${Math.min(systemHealth.infrastructure.cpu_usage, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Cores: {systemHealth.infrastructure.cpu_cores || 'N/A'} | Load: {systemHealth.infrastructure.cpu_load || 'N/A'}
            </div>
          </div>
          
          {/* Memory Usage */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Memory Usage</div>
              <span className={`text-xs px-2 py-1 rounded ${
                systemHealth.infrastructure.memory_usage > alertThresholds.memory.critical ? 'bg-red-200 text-red-800' :
                systemHealth.infrastructure.memory_usage > alertThresholds.memory.warning ? 'bg-yellow-200 text-yellow-800' :
                'bg-green-200 text-green-800'
              }`}>
                {systemHealth.infrastructure.memory_usage > alertThresholds.memory.critical ? 'CRITICAL' :
                 systemHealth.infrastructure.memory_usage > alertThresholds.memory.warning ? 'WARNING' : 'NORMAL'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {systemHealth.infrastructure.memory_usage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getMetricColor(systemHealth.infrastructure.memory_usage, alertThresholds.memory)}`}
                style={{ width: `${Math.min(systemHealth.infrastructure.memory_usage, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Used: {formatBytes(systemHealth.infrastructure.memory_used || 0)} / {formatBytes(systemHealth.infrastructure.memory_total || 0)}
            </div>
          </div>
          
          {/* Disk Usage */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Disk Usage</div>
              <span className={`text-xs px-2 py-1 rounded ${
                systemHealth.infrastructure.disk_usage > alertThresholds.disk.critical ? 'bg-red-200 text-red-800' :
                systemHealth.infrastructure.disk_usage > alertThresholds.disk.warning ? 'bg-yellow-200 text-yellow-800' :
                'bg-green-200 text-green-800'
              }`}>
                {systemHealth.infrastructure.disk_usage > alertThresholds.disk.critical ? 'CRITICAL' :
                 systemHealth.infrastructure.disk_usage > alertThresholds.disk.warning ? 'WARNING' : 'NORMAL'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {systemHealth.infrastructure.disk_usage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getMetricColor(systemHealth.infrastructure.disk_usage, alertThresholds.disk)}`}
                style={{ width: `${Math.min(systemHealth.infrastructure.disk_usage, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Free: {formatBytes(systemHealth.infrastructure.disk_free || 0)} | I/O: {systemHealth.infrastructure.disk_io || 'N/A'}
            </div>
          </div>
          
          {/* Network & Uptime */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 font-medium mb-2">Network & Uptime</div>
            <div className="space-y-2">
              <div>
                <div className="text-lg font-bold text-gray-800">
                  {formatUptime(systemHealth.metrics.system_uptime)}
                </div>
                <div className="text-xs text-gray-500">System Uptime</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">
                  {systemHealth.infrastructure.network_latency?.toFixed(0) || 0}ms
                </div>
                <div className="text-xs text-gray-500">Network Latency</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">
                  {formatBytes(systemHealth.infrastructure.network_throughput || 0)}/s
                </div>
                <div className="text-xs text-gray-500">Network Throughput</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Services Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Critical Services</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
              </button>
              <button
                onClick={() => handleEmergencyAction('restart_services')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
              >
                🔄 Restart Services
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(systemHealth.services).map(([serviceName, service]) => (
              <div key={serviceName} className={`border rounded-lg p-4 ${service.status === 'healthy' ? 'border-green-200 bg-green-50' : service.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800 capitalize">
                    {serviceName.replace(/_/g, ' ')}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)} {service.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Response:</span>
                    <div className={`font-medium ${service.response_time > 2000 ? 'text-red-600' : service.response_time > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {service.response_time}ms
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Error Rate:</span>
                    <div className={`font-medium ${service.error_rate > 5 ? 'text-red-600' : service.error_rate > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {service.error_rate.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {showAdvancedMetrics && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Uptime:</span>
                        <div className="font-medium">{service.uptime ? formatUptime(service.uptime) : 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Requests:</span>
                        <div className="font-medium">{service.requests_per_minute || 0}/min</div>
                      </div>
                      <div>
                        <span className="text-gray-500">CPU:</span>
                        <div className="font-medium">{service.cpu_usage || 0}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Memory:</span>
                        <div className="font-medium">{formatBytes(service.memory_usage || 0)}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  Last Check: {new Date(service.last_check).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Crisis System Metrics */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-lg font-medium text-blue-800 mb-4">Crisis Platform Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{systemHealth.metrics.active_sessions}</div>
              <div className="text-sm text-blue-700">Active Crisis Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{systemHealth.metrics.total_volunteers_online}</div>
              <div className="text-sm text-green-700">Volunteers Online</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{systemHealth.metrics.average_response_time.toFixed(0)}ms</div>
              <div className="text-sm text-purple-700">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{systemHealth.metrics.crisis_alerts || 0}</div>
              <div className="text-sm text-orange-700">Active Crisis Alerts</div>
            </div>
          </div>
        </div>
        
        {/* System Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-800 mb-4">System Controls</h4>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={autoScale} 
                onChange={(e) => setAutoScale(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-scaling enabled</span>
            </label>
            
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
            </select>
            
            <button
              onClick={() => handleEmergencyAction('maintenance_mode')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🔧 Maintenance Mode
            </button>
            
            <button
              onClick={() => window.open('/admin/system/logs', '_blank')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              📋 View Logs
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center space-x-4">
            <span>Performance Mode: <strong>{performanceMode.replace('_', ' ')}</strong></span>
            <span>Health Score: <strong>{currentHealth}</strong></span>
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
              onClick={() => window.open('/admin/system/dashboard', '_blank')}
              className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
            >
              📊 Full Dashboard
            </button>
          </div>
        </div>
      </div>
      
      {/* Audio alert element */}
      <audio ref={alertSoundRef} preload="auto">
        <source src="/sounds/system-critical.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}