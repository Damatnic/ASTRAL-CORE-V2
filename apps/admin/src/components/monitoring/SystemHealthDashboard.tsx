'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: { timestamp: Date; value: number }[];
}

interface ServiceHealth {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastChecked: Date;
  incidents: {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }[];
}

interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  queries: {
    total: number;
    slow: number;
    failed: number;
    averageTime: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  replication: {
    lag: number;
    status: 'synced' | 'lagging' | 'error';
  };
}

export default function SystemHealthDashboard() {
  const { socket } = useAdminStore();
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<SystemMetric | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize with mock data
  useEffect(() => {
    const mockMetrics: SystemMetric[] = [
      {
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          value: 40 + Math.random() * 20
        }))
      },
      {
        name: 'Memory Usage',
        value: 68,
        unit: '%',
        status: 'warning',
        trend: 'up',
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          value: 50 + i * 0.9
        }))
      },
      {
        name: 'Disk I/O',
        value: 120,
        unit: 'MB/s',
        status: 'healthy',
        trend: 'down',
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          value: 100 + Math.random() * 50
        }))
      },
      {
        name: 'Network Latency',
        value: 12,
        unit: 'ms',
        status: 'healthy',
        trend: 'stable',
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          value: 10 + Math.random() * 5
        }))
      },
      {
        name: 'API Response Time',
        value: 245,
        unit: 'ms',
        status: 'healthy',
        trend: 'down',
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          value: 200 + Math.random() * 100
        }))
      },
      {
        name: 'Error Rate',
        value: 0.5,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (20 - i) * 60000),
          value: Math.random() * 2
        }))
      }
    ];

    const mockServices: ServiceHealth[] = [
      {
        name: 'Web Server',
        status: 'operational',
        uptime: 99.99,
        responseTime: 45,
        errorRate: 0.01,
        lastChecked: new Date(),
        incidents: []
      },
      {
        name: 'WebSocket Server',
        status: 'operational',
        uptime: 99.95,
        responseTime: 8,
        errorRate: 0.02,
        lastChecked: new Date(),
        incidents: []
      },
      {
        name: 'Database',
        status: 'operational',
        uptime: 99.98,
        responseTime: 12,
        errorRate: 0.001,
        lastChecked: new Date(),
        incidents: []
      },
      {
        name: 'Redis Cache',
        status: 'operational',
        uptime: 100,
        responseTime: 2,
        errorRate: 0,
        lastChecked: new Date(),
        incidents: []
      },
      {
        name: 'Email Service',
        status: 'degraded',
        uptime: 98.5,
        responseTime: 850,
        errorRate: 1.5,
        lastChecked: new Date(),
        incidents: [
          {
            id: 'INC001',
            severity: 'medium',
            message: 'Increased latency in email delivery',
            timestamp: new Date(Date.now() - 30 * 60000),
            resolved: false
          }
        ]
      },
      {
        name: 'SMS Gateway',
        status: 'operational',
        uptime: 99.9,
        responseTime: 120,
        errorRate: 0.1,
        lastChecked: new Date(),
        incidents: []
      },
      {
        name: 'Authentication Service',
        status: 'operational',
        uptime: 100,
        responseTime: 35,
        errorRate: 0,
        lastChecked: new Date(),
        incidents: []
      },
      {
        name: 'File Storage',
        status: 'operational',
        uptime: 99.99,
        responseTime: 65,
        errorRate: 0.01,
        lastChecked: new Date(),
        incidents: []
      }
    ];

    const mockDbMetrics: DatabaseMetrics = {
      connections: {
        active: 45,
        idle: 15,
        max: 100
      },
      queries: {
        total: 125432,
        slow: 23,
        failed: 2,
        averageTime: 12.5
      },
      storage: {
        used: 45.6,
        total: 100,
        percentage: 45.6
      },
      replication: {
        lag: 0.5,
        status: 'synced'
      }
    };

    setMetrics(mockMetrics);
    setServices(mockServices);
    setDbMetrics(mockDbMetrics);
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMetricsUpdate = (data: SystemMetric[]) => {
      setMetrics(data);
      setLastUpdate(new Date());
    };

    const handleServiceUpdate = (data: ServiceHealth[]) => {
      setServices(data);
    };

    const handleDbMetricsUpdate = (data: DatabaseMetrics) => {
      setDbMetrics(data);
    };

    socket.on('system:metrics', handleMetricsUpdate);
    socket.on('system:services', handleServiceUpdate);
    socket.on('system:database', handleDbMetricsUpdate);

    return () => {
      socket.off('system:metrics', handleMetricsUpdate);
      socket.off('system:services', handleServiceUpdate);
      socket.off('system:database', handleDbMetricsUpdate);
    };
  }, [socket]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would trigger a refresh from the server
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational': return 'text-green-600';
      case 'warning':
      case 'degraded': return 'text-yellow-600';
      case 'critical':
      case 'outage': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational': return 'bg-green-100';
      case 'warning':
      case 'degraded': return 'bg-yellow-100';
      case 'critical':
      case 'outage': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const overallHealth = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    const outageServices = services.filter(s => s.status === 'outage').length;

    if (criticalCount > 0 || outageServices > 0) return 'critical';
    if (warningCount > 0 || degradedServices > 0) return 'warning';
    return 'healthy';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Monitor</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time system performance and service status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </select>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-6 ${getStatusBgColor(overallHealth())}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-3xl ${getStatusColor(overallHealth())}`}>
              {overallHealth() === 'healthy' ? '✓' : overallHealth() === 'warning' ? '⚠' : '✕'}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${getStatusColor(overallHealth())}`}>
                System Status: {overallHealth().toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                {overallHealth() === 'healthy' 
                  ? 'All systems operational' 
                  : overallHealth() === 'warning'
                  ? 'Some services experiencing issues'
                  : 'Critical issues detected'}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map(metric => (
          <div
            key={metric.name}
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedMetric(metric)}
          >
            <div className="text-xs text-gray-500 mb-1">{metric.name}</div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}
              </span>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <span className={`text-sm ${
                metric.trend === 'up' ? 'text-red-500' : 
                metric.trend === 'down' ? 'text-green-500' : 
                'text-gray-500'
              }`}>
                {getTrendIcon(metric.trend)}
              </span>
              <div className="flex-1 h-8">
                <svg className="w-full h-full" viewBox="0 0 100 30">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-400"
                    points={metric.history.slice(-10).map((h, i) => 
                      `${i * 11},${30 - (h.value / Math.max(...metric.history.map(h => h.value)) * 25)}`
                    ).join(' ')}
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map(service => (
            <div
              key={service.name}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{service.name}</span>
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'operational' ? 'bg-green-500' :
                  service.status === 'degraded' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Uptime:</span>
                  <span className="ml-1 font-medium">{formatUptime(service.uptime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Response:</span>
                  <span className="ml-1 font-medium">{service.responseTime}ms</span>
                </div>
                <div>
                  <span className="text-gray-500">Errors:</span>
                  <span className="ml-1 font-medium">{service.errorRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Checked:</span>
                  <span className="ml-1 font-medium">
                    {new Date(service.lastChecked).toLocaleTimeString().slice(0, 5)}
                  </span>
                </div>
              </div>
              {service.incidents.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <span className="font-medium text-yellow-800">
                    {service.incidents.length} incident(s)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Database Metrics */}
      {dbMetrics && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Connections */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Connections</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(dbMetrics.connections.active / dbMetrics.connections.max) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {dbMetrics.connections.active}/{dbMetrics.connections.max}
                </span>
              </div>
            </div>

            {/* Query Performance */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Avg Query Time</div>
              <div className="text-xl font-bold text-gray-900">{dbMetrics.queries.averageTime}ms</div>
            </div>

            {/* Storage */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Storage Used</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dbMetrics.storage.percentage > 80 ? 'bg-red-500' :
                      dbMetrics.storage.percentage > 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${dbMetrics.storage.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{dbMetrics.storage.percentage}%</span>
              </div>
            </div>

            {/* Replication */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Replication</div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  dbMetrics.replication.status === 'synced' ? 'bg-green-500' :
                  dbMetrics.replication.status === 'lagging' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {dbMetrics.replication.status} ({dbMetrics.replication.lag}s lag)
                </span>
              </div>
            </div>
          </div>

          {/* Query Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Queries:</span>
              <span className="ml-2 font-medium">{dbMetrics.queries.total.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Slow Queries:</span>
              <span className="ml-2 font-medium text-yellow-600">{dbMetrics.queries.slow}</span>
            </div>
            <div>
              <span className="text-gray-500">Failed Queries:</span>
              <span className="ml-2 font-medium text-red-600">{dbMetrics.queries.failed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metric Detail Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedMetric.name}</h3>
                  <p className="text-sm text-gray-600">Historical performance data</p>
                </div>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-bold ${getStatusColor(selectedMetric.status)}`}>
                    {selectedMetric.value}
                  </span>
                  <span className="text-lg text-gray-500">{selectedMetric.unit}</span>
                  <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(selectedMetric.status)} ${getStatusColor(selectedMetric.status)}`}>
                    {selectedMetric.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-48 mb-4">
                <svg className="w-full h-full" viewBox="0 0 400 150">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-500"
                    points={selectedMetric.history.map((h, i) => 
                      `${i * (400 / selectedMetric.history.length)},${150 - (h.value / Math.max(...selectedMetric.history.map(h => h.value)) * 140)}`
                    ).join(' ')}
                  />
                </svg>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}