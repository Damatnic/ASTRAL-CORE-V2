'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Input } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { LineChart, BarChart } from './data-visualization';
import { designTokens } from '../design-system';

// Performance Types
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
    packetsLost: number;
  };
  storage: {
    used: number;
    total: number;
    iops: number;
    throughput: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'network' | 'storage' | 'response_time' | 'error_rate';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  threshold: number;
  currentValue: number;
  recommendation?: string;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  endpoint: string;
  dependencies: string[];
}

interface ResponseTimeMetrics {
  endpoint: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestCount: number;
  errorCount: number;
  successRate: number;
  trendData: {
    timestamp: Date;
    responseTime: number;
    requests: number;
    errors: number;
  }[];
}

interface LoadMetrics {
  concurrent_users: number;
  requests_per_second: number;
  peak_load: number;
  load_distribution: {
    region: string;
    load: number;
    percentage: number;
  }[];
  capacity_usage: number;
}

// Real-time Metrics Display Component
interface RealTimeMetricsProps {
  metrics: SystemMetrics;
  className?: string;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  metrics,
  className = ''
}) => {
  const getStatusColor = (percentage: number, type: 'cpu' | 'memory' | 'storage') => {
    if (type === 'cpu' || type === 'storage') {
      if (percentage > 90) return 'text-red-600 bg-red-50';
      if (percentage > 75) return 'text-yellow-600 bg-yellow-50';
      return 'text-green-600 bg-green-50';
    } else { // memory
      if (percentage > 85) return 'text-red-600 bg-red-50';
      if (percentage > 70) return 'text-yellow-600 bg-yellow-50';
      return 'text-green-600 bg-green-50';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNetworkSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* CPU Metrics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚡</span>
            <span className="font-medium text-gray-900">CPU</span>
          </div>
          <Badge className={`text-xs ${getStatusColor(metrics.cpu.usage, 'cpu')}`}>
            {metrics.cpu.usage}%
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Usage:</span>
            <span className="font-medium">{metrics.cpu.usage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cores:</span>
            <span className="font-medium">{metrics.cpu.cores}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Temp:</span>
            <span className="font-medium">{metrics.cpu.temperature}°C</span>
          </div>
          
          {/* CPU Load Visualization */}
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-1">Load per Core</div>
            <div className="flex space-x-1">
              {metrics.cpu.load.map((load, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded h-2">
                  <div 
                    className={`h-full rounded transition-all ${
                      load > 90 ? 'bg-red-500' : 
                      load > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(load, 100)}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Memory Metrics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💾</span>
            <span className="font-medium text-gray-900">Memory</span>
          </div>
          <Badge className={`text-xs ${getStatusColor(metrics.memory.percentage, 'memory')}`}>
            {metrics.memory.percentage}%
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Used:</span>
            <span className="font-medium">{formatBytes(metrics.memory.used)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">{formatBytes(metrics.memory.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium">{formatBytes(metrics.memory.available)}</span>
          </div>
          
          {/* Memory Usage Bar */}
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-1">Usage</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  metrics.memory.percentage > 85 ? 'bg-red-500' : 
                  metrics.memory.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${metrics.memory.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Metrics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌐</span>
            <span className="font-medium text-gray-900">Network</span>
          </div>
          <Badge className={`text-xs ${
            metrics.network.latency > 100 ? 'text-red-600 bg-red-50' :
            metrics.network.latency > 50 ? 'text-yellow-600 bg-yellow-50' :
            'text-green-600 bg-green-50'
          }`}>
            {metrics.network.latency}ms
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Inbound:</span>
            <span className="font-medium">{formatNetworkSpeed(metrics.network.inbound)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Outbound:</span>
            <span className="font-medium">{formatNetworkSpeed(metrics.network.outbound)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Packet Loss:</span>
            <span className={`font-medium ${
              metrics.network.packetsLost > 1 ? 'text-red-600' : 'text-green-600'
            }`}>
              {metrics.network.packetsLost.toFixed(2)}%
            </span>
          </div>
          
          {/* Network Activity Indicator */}
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-1">Activity</div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs">↓ In</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs">Out ↑</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Storage Metrics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💿</span>
            <span className="font-medium text-gray-900">Storage</span>
          </div>
          <Badge className={`text-xs ${getStatusColor((metrics.storage.used / metrics.storage.total) * 100, 'storage')}`}>
            {((metrics.storage.used / metrics.storage.total) * 100).toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Used:</span>
            <span className="font-medium">{formatBytes(metrics.storage.used)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">{formatBytes(metrics.storage.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">IOPS:</span>
            <span className="font-medium">{metrics.storage.iops.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Throughput:</span>
            <span className="font-medium">{formatNetworkSpeed(metrics.storage.throughput)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Service Health Monitor Component
interface ServiceHealthMonitorProps {
  services: ServiceHealth[];
  className?: string;
}

export const ServiceHealthMonitor: React.FC<ServiceHealthMonitorProps> = ({
  services,
  className = ''
}) => {
  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'down': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      case 'maintenance': return '🔧';
    }
  };

  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return '99.9%+';
    return `${uptime.toFixed(2)}%`;
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Health</h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time status of critical system services
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Healthy: </span>
              <span className="font-medium text-green-600">
                {services.filter(s => s.status === 'healthy').length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Issues: </span>
              <span className="font-medium text-red-600">
                {services.filter(s => s.status === 'down' || s.status === 'degraded').length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg" role="img" aria-label={`${service.status} status`}>
                    {getStatusIcon(service.status)}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-xs text-gray-600">{service.endpoint}</p>
                  </div>
                </div>
                
                <Badge className={`text-xs ${getStatusColor(service.status)}`}>
                  {service.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Uptime:</span>
                  <div className="font-medium text-gray-900">
                    {formatUptime(service.uptime)}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Response:</span>
                  <div className={`font-medium ${
                    service.responseTime > 1000 ? 'text-red-600' :
                    service.responseTime > 500 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {service.responseTime}ms
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Error Rate:</span>
                  <div className={`font-medium ${
                    service.errorRate > 5 ? 'text-red-600' :
                    service.errorRate > 1 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {service.errorRate.toFixed(2)}%
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">Last Check:</span>
                  <div className="font-medium text-gray-900 text-xs">
                    {service.lastCheck.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              {service.dependencies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-600">Dependencies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.dependencies.map((dep, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Performance Alerts Component
interface PerformanceAlertsProps {
  alerts: PerformanceAlert[];
  onResolveAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  className?: string;
}

export const PerformanceAlerts: React.FC<PerformanceAlertsProps> = ({
  alerts,
  onResolveAlert,
  onDismissAlert,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'unresolved'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'critical') return alert.severity === 'critical';
    if (filter === 'unresolved') return !alert.resolved;
    return true;
  });

  const getSeverityColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  const getTypeIcon = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'cpu': return '⚡';
      case 'memory': return '💾';
      case 'network': return '🌐';
      case 'storage': return '💿';
      case 'response_time': return '⏱️';
      case 'error_rate': return '❌';
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
            <p className="text-sm text-gray-600 mt-1">
              System alerts and performance recommendations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical Only</option>
              <option value="unresolved">Unresolved</option>
            </select>
            
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{alerts.filter(a => a.severity === 'critical' && !a.resolved).length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>{alerts.filter(a => a.severity === 'warning' && !a.resolved).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-4 block">✨</span>
            <p>No performance alerts</p>
            <p className="text-sm">All systems are running optimally</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 ${alert.resolved ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg" role="img" aria-label={`${alert.severity} alert`}>
                      {getSeverityIcon(alert.severity)}
                    </span>
                    <span className="text-sm" role="img" aria-label={`${alert.type} metric`}>
                      {getTypeIcon(alert.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>Threshold: {alert.threshold}</span>
                      <span>Current: {alert.currentValue}</span>
                    </div>
                    
                    {alert.recommendation && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                        💡 <strong>Recommendation:</strong> {alert.recommendation}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {alert.resolved ? (
                    <Badge variant="success" className="text-xs">
                      Resolved
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-xs"
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onResolveAlert(alert.id)}
                        className="text-xs"
                      >
                        Resolve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

// Response Time Analytics Component
interface ResponseTimeAnalyticsProps {
  metrics: ResponseTimeMetrics[];
  className?: string;
}

export const ResponseTimeAnalytics: React.FC<ResponseTimeAnalyticsProps> = ({
  metrics,
  className = ''
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(metrics[0]?.endpoint || '');
  
  const selectedMetric = metrics.find(m => m.endpoint === selectedEndpoint) || metrics[0];
  
  const chartData = selectedMetric?.trendData.map(d => ({
    time: d.timestamp.toLocaleTimeString(),
    responseTime: d.responseTime,
    requests: d.requests,
    errors: d.errors
  })) || [];

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Response Time Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              API endpoint performance and response time trends
            </p>
          </div>
          
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metrics.map((metric) => (
              <option key={metric.endpoint} value={metric.endpoint}>
                {metric.endpoint}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedMetric && (
        <>
          {/* Key Metrics */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedMetric.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-600">Average Response</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedMetric.p95ResponseTime}ms
                </div>
                <div className="text-sm text-gray-600">95th Percentile</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedMetric.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {selectedMetric.requestCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
            </div>
          </div>
          
          {/* Response Time Chart */}
          <div className="p-6">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Response Time Trend</h4>
            </div>
            <LineChart
              data={chartData}
              xKey="time"
              yKey="responseTime"
              color={designTokens.colors.primary.main}
              height={200}
            />
          </div>
        </>
      )}
    </Card>
  );
};

// Load Distribution Component
interface LoadDistributionProps {
  loadMetrics: LoadMetrics;
  className?: string;
}

export const LoadDistribution: React.FC<LoadDistributionProps> = ({
  loadMetrics,
  className = ''
}) => {
  const chartData = loadMetrics.load_distribution.map(item => ({
    region: item.region,
    load: item.load,
    percentage: item.percentage
  }));

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Load Distribution</h3>
        <p className="text-sm text-gray-600 mt-1">
          Current system load across regions and capacity usage
        </p>
      </div>
      
      <div className="p-6">
        {/* Load Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {loadMetrics.concurrent_users.toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">Concurrent Users</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {loadMetrics.requests_per_second.toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Requests/Second</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {loadMetrics.capacity_usage}%
            </div>
            <div className="text-sm text-orange-800">Capacity Usage</div>
          </div>
        </div>
        
        {/* Regional Load Distribution */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Regional Load Distribution</h4>
          <BarChart
            data={chartData}
            xKey="region"
            yKey="load"
            height={200}
          />
          
          {/* Load Details */}
          <div className="mt-4 space-y-2">
            {loadMetrics.load_distribution.map((region, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{region.region}</span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    {region.load.toLocaleString()} requests/sec
                  </span>
                  <span className="font-medium text-gray-900">
                    {region.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main Performance Dashboard Component
interface PerformanceMonitoringDashboardProps {
  className?: string;
}

export const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  className = ''
}) => {
  // Mock data - would come from API
  const [systemMetrics] = useState<SystemMetrics>({
    cpu: {
      usage: 67.5,
      cores: 8,
      temperature: 42,
      load: [45, 72, 38, 89, 56, 91, 23, 67]
    },
    memory: {
      used: 12884901888, // 12GB
      total: 17179869184, // 16GB
      available: 4294967296, // 4GB
      percentage: 75
    },
    network: {
      inbound: 52428800, // 50MB/s
      outbound: 26214400, // 25MB/s
      latency: 23,
      packetsLost: 0.02
    },
    storage: {
      used: 549755813888, // 512GB
      total: 1099511627776, // 1TB
      iops: 8500,
      throughput: 209715200 // 200MB/s
    }
  });

  const [services] = useState<ServiceHealth[]>([
    {
      name: 'Crisis API',
      status: 'healthy',
      uptime: 99.97,
      responseTime: 145,
      errorRate: 0.02,
      lastCheck: new Date(),
      endpoint: '/api/crisis',
      dependencies: ['Database', 'Auth Service']
    },
    {
      name: 'Volunteer Matching',
      status: 'healthy',
      uptime: 99.89,
      responseTime: 89,
      errorRate: 0.15,
      lastCheck: new Date(Date.now() - 30000),
      endpoint: '/api/volunteers',
      dependencies: ['Database', 'ML Engine']
    },
    {
      name: 'Real-time Chat',
      status: 'degraded',
      uptime: 98.52,
      responseTime: 1240,
      errorRate: 2.8,
      lastCheck: new Date(Date.now() - 45000),
      endpoint: '/ws/chat',
      dependencies: ['WebSocket Gateway', 'Redis']
    },
    {
      name: 'Analytics Engine',
      status: 'maintenance',
      uptime: 95.3,
      responseTime: 0,
      errorRate: 0,
      lastCheck: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endpoint: '/api/analytics',
      dependencies: ['Data Warehouse', 'ML Pipeline']
    }
  ]);

  const [alerts] = useState<PerformanceAlert[]>([
    {
      id: 'alert-1',
      type: 'response_time',
      severity: 'critical',
      message: 'Real-time Chat service response time exceeded 1000ms threshold',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false,
      threshold: 1000,
      currentValue: 1240,
      recommendation: 'Scale WebSocket gateway instances and check Redis connection pool'
    },
    {
      id: 'alert-2',
      type: 'cpu',
      severity: 'warning',
      message: 'CPU usage on core-4 consistently above 85%',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      resolved: false,
      threshold: 85,
      currentValue: 89,
      recommendation: 'Consider load balancing or vertical scaling for compute-intensive operations'
    },
    {
      id: 'alert-3',
      type: 'memory',
      severity: 'info',
      message: 'Memory usage trending upward, consider monitoring for leaks',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: true,
      threshold: 80,
      currentValue: 75
    }
  ]);

  const [responseMetrics] = useState<ResponseTimeMetrics[]>([
    {
      endpoint: '/api/crisis',
      averageResponseTime: 145,
      p95ResponseTime: 320,
      p99ResponseTime: 890,
      requestCount: 15420,
      errorCount: 3,
      successRate: 99.98,
      trendData: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
        responseTime: Math.random() * 200 + 100,
        requests: Math.floor(Math.random() * 100) + 500,
        errors: Math.floor(Math.random() * 5)
      }))
    },
    {
      endpoint: '/api/volunteers',
      averageResponseTime: 89,
      p95ResponseTime: 180,
      p99ResponseTime: 450,
      requestCount: 8920,
      errorCount: 13,
      successRate: 99.85,
      trendData: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
        responseTime: Math.random() * 100 + 50,
        requests: Math.floor(Math.random() * 80) + 300,
        errors: Math.floor(Math.random() * 3)
      }))
    }
  ]);

  const [loadMetrics] = useState<LoadMetrics>({
    concurrent_users: 2847,
    requests_per_second: 1250,
    peak_load: 3200,
    capacity_usage: 68,
    load_distribution: [
      { region: 'US-East', load: 425, percentage: 34 },
      { region: 'US-West', load: 312, percentage: 25 },
      { region: 'EU-Central', load: 298, percentage: 24 },
      { region: 'Asia-Pacific', load: 215, percentage: 17 }
    ]
  });

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolving alert:', alertId);
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
  };

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Performance Monitoring Dashboard">
      <ScreenReaderOnly>
        <h1>Performance Monitoring Dashboard</h1>
      </ScreenReaderOnly>
      
      <LiveRegion>
        Performance dashboard loaded with real-time system metrics
      </LiveRegion>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600">Real-time system health, performance metrics, and optimization insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Live Monitoring</span>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Metrics</span>
          </Button>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <RealTimeMetrics metrics={systemMetrics} />

      {/* Performance Alerts */}
      <PerformanceAlerts
        alerts={alerts}
        onResolveAlert={handleResolveAlert}
        onDismissAlert={handleDismissAlert}
      />

      {/* Service Health and Response Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ServiceHealthMonitor services={services} />
        <ResponseTimeAnalytics metrics={responseMetrics} />
      </div>

      {/* Load Distribution */}
      <LoadDistribution loadMetrics={loadMetrics} />
    </div>
  );
};

export default PerformanceMonitoringDashboard;