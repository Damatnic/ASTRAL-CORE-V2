'use client';

/**
 * ASTRAL_CORE 2.0 Crisis Analytics Dashboard
 * 
 * Features:
 * - Real-time crisis metrics monitoring
 * - Volunteer performance analytics
 * - Crisis intervention outcome tracking
 * - System health monitoring
 * - AI model performance metrics
 */

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, Users, TrendingUp, Clock, AlertTriangle,
  Heart, Brain, Shield, Zap, Server, Database,
  Cpu, HardDrive, Globe, CheckCircle, XCircle,
  RefreshCw, Download, Filter, Calendar
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { getCrisisDetectionEngine } from '@/lib/ai/crisis-detection-engine';

// Types
interface RealTimeMetrics {
  timestamp: Date;
  activeCrises: number;
  volunteersOnline: number;
  professionalsOnline: number;
  averageResponseTime: number;
  averageSeverity: number;
  escalationRate: number;
  resolutionRate: number;
  criticalSessions: number;
}

interface VolunteerMetrics {
  volunteerId: string;
  name: string;
  sessionsHandled: number;
  averageRating: number;
  averageResponseTime: number;
  specializations: string[];
  successRate: number;
  escalations: number;
}

interface OutcomeMetrics {
  totalSessions: number;
  successfulResolutions: number;
  escalationsToEmergency: number;
  averageDuration: number;
  followUpRate: number;
  satisfactionScore: number;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  databaseResponseTime: number;
  webSocketConnections: number;
  errorRate: number;
  uptime: number;
}

interface AIPerformance {
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  averageLatency: number;
  processedMessages: number;
  criticalDetections: number;
}

interface TimeSeriesData {
  time: string;
  value: number;
}

export default function CrisisAnalyticsDashboard() {
  // State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    timestamp: new Date(),
    activeCrises: 0,
    volunteersOnline: 0,
    professionalsOnline: 0,
    averageResponseTime: 0,
    averageSeverity: 0,
    escalationRate: 0,
    resolutionRate: 0,
    criticalSessions: 0
  });
  
  const [historicalData, setHistoricalData] = useState<TimeSeriesData[]>([]);
  const [severityDistribution, setSeverityDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [volunteerMetrics, setVolunteerMetrics] = useState<VolunteerMetrics[]>([]);
  const [outcomeMetrics, setOutcomeMetrics] = useState<OutcomeMetrics>({
    totalSessions: 0,
    successfulResolutions: 0,
    escalationsToEmergency: 0,
    averageDuration: 0,
    followUpRate: 0,
    satisfactionScore: 0
  });
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    databaseResponseTime: 0,
    webSocketConnections: 0,
    errorRate: 0,
    uptime: 0
  });
  
  const [aiPerformance, setAiPerformance] = useState<AIPerformance>({
    accuracy: 0,
    falsePositiveRate: 0,
    falseNegativeRate: 0,
    averageLatency: 0,
    processedMessages: 0,
    criticalDetections: 0
  });
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'crises' | 'response' | 'severity'>('crises');
  
  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  
  // Initialize Socket and data
  useEffect(() => {
    // Initialize Socket.io
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        role: 'MONITOR',
        token: 'monitor_token'
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Analytics dashboard connected');
      newSocket.emit('monitor:subscribe', { metrics: 'all' });
    });
    
    newSocket.on('metrics:update', (data) => {
      updateRealTimeMetrics(data);
    });
    
    newSocket.on('system:health', (data) => {
      setSystemHealth(data);
    });
    
    setSocket(newSocket);
    
    // Initialize AI performance metrics
    const aiEngine = getCrisisDetectionEngine();
    if (aiEngine) {
      const metrics = aiEngine.getPerformanceMetrics();
      setAiPerformance(prev => ({
        ...prev,
        accuracy: metrics.accuracy,
        averageLatency: metrics.averageLatency,
        processedMessages: metrics.processedMessages
      }));
    }
    
    // Load initial data
    loadHistoricalData();
    loadVolunteerMetrics();
    loadOutcomeMetrics();
    
    return () => {
      newSocket.disconnect();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);
  
  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadHistoricalData();
        loadVolunteerMetrics();
        loadOutcomeMetrics();
      }, 5000); // Refresh every 5 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, timeRange]);
  
  // Helper functions
  const updateRealTimeMetrics = (data: any) => {
    setRealTimeMetrics(prev => ({
      ...prev,
      ...data,
      timestamp: new Date()
    }));
    
    // Update historical data
    setHistoricalData(prev => {
      const newData = [...prev];
      newData.push({
        time: format(new Date(), 'HH:mm:ss'),
        value: data[selectedMetric] || 0
      });
      
      // Keep only last 100 data points
      if (newData.length > 100) {
        newData.shift();
      }
      
      return newData;
    });
  };
  
  const loadHistoricalData = () => {
    // Generate mock historical data based on time range
    const dataPoints = timeRange === '1h' ? 60 : 
                      timeRange === '24h' ? 24 : 
                      timeRange === '7d' ? 7 : 30;
    
    const data: TimeSeriesData[] = [];
    const now = new Date();
    
    for (let i = dataPoints; i >= 0; i--) {
      let time: string;
      if (timeRange === '1h') {
        time = format(new Date(now.getTime() - i * 60000), 'HH:mm');
      } else if (timeRange === '24h') {
        time = format(new Date(now.getTime() - i * 3600000), 'HH:00');
      } else {
        time = format(subDays(now, i), 'MMM dd');
      }
      
      data.push({
        time,
        value: Math.floor(Math.random() * 50) + 10
      });
    }
    
    setHistoricalData(data);
    
    // Update severity distribution
    setSeverityDistribution([
      { name: 'Low (1-3)', value: 35 },
      { name: 'Medium (4-6)', value: 40 },
      { name: 'High (7-8)', value: 20 },
      { name: 'Critical (9-10)', value: 5 }
    ]);
  };
  
  const loadVolunteerMetrics = () => {
    // Mock volunteer data
    setVolunteerMetrics([
      {
        volunteerId: 'vol_1',
        name: 'Sarah Mitchell',
        sessionsHandled: 127,
        averageRating: 4.8,
        averageResponseTime: 45,
        specializations: ['Anxiety', 'Depression'],
        successRate: 92,
        escalations: 3
      },
      {
        volunteerId: 'vol_2',
        name: 'Michael Chen',
        sessionsHandled: 98,
        averageRating: 4.6,
        averageResponseTime: 52,
        specializations: ['Trauma', 'PTSD'],
        successRate: 88,
        escalations: 5
      },
      {
        volunteerId: 'vol_3',
        name: 'Emily Rodriguez',
        sessionsHandled: 156,
        averageRating: 4.9,
        averageResponseTime: 38,
        specializations: ['Youth', 'Family'],
        successRate: 94,
        escalations: 2
      }
    ]);
  };
  
  const loadOutcomeMetrics = () => {
    // Mock outcome data
    setOutcomeMetrics({
      totalSessions: 1247,
      successfulResolutions: 1089,
      escalationsToEmergency: 23,
      averageDuration: 42,
      followUpRate: 67,
      satisfactionScore: 4.5
    });
  };
  
  const exportData = () => {
    const data = {
      realTimeMetrics,
      historicalData,
      volunteerMetrics,
      outcomeMetrics,
      systemHealth,
      aiPerformance,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crisis-analytics-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    a.click();
  };
  
  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  
  // Render functions
  const renderRealTimeMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <Users className="text-blue-500" size={20} />
          <span className={`text-xs px-2 py-1 rounded ${
            realTimeMetrics.activeCrises > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {realTimeMetrics.activeCrises > 50 ? 'High' : 'Normal'}
          </span>
        </div>
        <div className="text-2xl font-bold">{realTimeMetrics.activeCrises}</div>
        <div className="text-sm text-gray-600">Active Crises</div>
        <div className="mt-2 text-xs text-gray-500">
          {realTimeMetrics.criticalSessions} critical
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <Clock className="text-green-500" size={20} />
          <TrendingUp className={`${
            realTimeMetrics.averageResponseTime < 60 ? 'text-green-500' : 'text-red-500'
          }`} size={16} />
        </div>
        <div className="text-2xl font-bold">
          {realTimeMetrics.averageResponseTime.toFixed(1)}s
        </div>
        <div className="text-sm text-gray-600">Avg Response Time</div>
        <div className="mt-2 text-xs text-gray-500">
          Target: &lt;60s
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="text-yellow-500" size={20} />
          <span className="text-xs font-medium">
            {(realTimeMetrics.escalationRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-2xl font-bold">
          {realTimeMetrics.averageSeverity.toFixed(1)}/10
        </div>
        <div className="text-sm text-gray-600">Avg Severity</div>
        <div className="mt-2 text-xs text-gray-500">
          Escalation rate: {(realTimeMetrics.escalationRate * 100).toFixed(1)}%
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="text-green-500" size={20} />
          <span className="text-xs font-medium text-green-700">
            {(realTimeMetrics.resolutionRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-2xl font-bold">
          {realTimeMetrics.volunteersOnline + realTimeMetrics.professionalsOnline}
        </div>
        <div className="text-sm text-gray-600">Support Staff Online</div>
        <div className="mt-2 text-xs text-gray-500">
          {realTimeMetrics.volunteersOnline} volunteers, {realTimeMetrics.professionalsOnline} professionals
        </div>
      </motion.div>
    </div>
  );
  
  const renderHistoricalChart = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Crisis Activity Trends</h3>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="crises">Active Crises</option>
            <option value="response">Response Time</option>
            <option value="severity">Severity Level</option>
          </select>
          
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === range 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={historicalData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
  
  const renderSeverityDistribution = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={severityDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {severityDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
  
  const renderVolunteerPerformance = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Top Volunteer Performance</h3>
      
      <div className="space-y-3">
        {volunteerMetrics.map(volunteer => (
          <div key={volunteer.volunteerId} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium">{volunteer.name}</h4>
                <div className="text-xs text-gray-500">
                  {volunteer.specializations.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Heart className="text-red-500" size={14} />
                <span className="text-sm font-medium">{volunteer.averageRating}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Sessions:</span>
                <span className="ml-1 font-medium">{volunteer.sessionsHandled}</span>
              </div>
              <div>
                <span className="text-gray-500">Success:</span>
                <span className="ml-1 font-medium">{volunteer.successRate}%</span>
              </div>
              <div>
                <span className="text-gray-500">Response:</span>
                <span className="ml-1 font-medium">{volunteer.averageResponseTime}s</span>
              </div>
              <div>
                <span className="text-gray-500">Escalations:</span>
                <span className="ml-1 font-medium">{volunteer.escalations}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${volunteer.successRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderOutcomeMetrics = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Intervention Outcomes</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {((outcomeMetrics.successfulResolutions / outcomeMetrics.totalSessions) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {outcomeMetrics.averageDuration}min
          </div>
          <div className="text-sm text-gray-600">Avg Duration</div>
        </div>
        
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {outcomeMetrics.followUpRate}%
          </div>
          <div className="text-sm text-gray-600">Follow-up Rate</div>
        </div>
        
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {outcomeMetrics.satisfactionScore}/5
          </div>
          <div className="text-sm text-gray-600">Satisfaction</div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-700">Emergency Escalations</span>
          <span className="font-bold text-red-700">{outcomeMetrics.escalationsToEmergency}</span>
        </div>
        <div className="text-xs text-red-600 mt-1">
          {((outcomeMetrics.escalationsToEmergency / outcomeMetrics.totalSessions) * 100).toFixed(2)}% of total sessions
        </div>
      </div>
    </div>
  );
  
  const renderSystemHealth = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">System Health</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-blue-500" />
            <span className="text-sm">CPU Usage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{systemHealth.cpuUsage}%</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  systemHealth.cpuUsage > 80 ? 'bg-red-500' : 
                  systemHealth.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemHealth.cpuUsage}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-purple-500" />
            <span className="text-sm">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{systemHealth.memoryUsage}%</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  systemHealth.memoryUsage > 80 ? 'bg-red-500' : 
                  systemHealth.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemHealth.memoryUsage}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-green-500" />
            <span className="text-sm">Network Latency</span>
          </div>
          <span className="text-sm font-medium">{systemHealth.networkLatency}ms</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-orange-500" />
            <span className="text-sm">DB Response</span>
          </div>
          <span className="text-sm font-medium">{systemHealth.databaseResponseTime}ms</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            <span className="text-sm">WebSocket Connections</span>
          </div>
          <span className="text-sm font-medium">{systemHealth.webSocketConnections}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm">Error Rate</span>
          </div>
          <span className={`text-sm font-medium ${
            systemHealth.errorRate > 1 ? 'text-red-600' : 'text-green-600'
          }`}>
            {systemHealth.errorRate.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">System Uptime</span>
          <span className="text-sm font-medium">
            {Math.floor(systemHealth.uptime / 86400)}d {Math.floor((systemHealth.uptime % 86400) / 3600)}h
          </span>
        </div>
      </div>
    </div>
  );
  
  const renderAIPerformance = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">AI Model Performance</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 border rounded-lg">
          <Brain className="text-purple-500 mx-auto mb-2" size={24} />
          <div className="text-xl font-bold">{(aiPerformance.accuracy * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Accuracy</div>
        </div>
        
        <div className="text-center p-3 border rounded-lg">
          <Zap className="text-yellow-500 mx-auto mb-2" size={24} />
          <div className="text-xl font-bold">{aiPerformance.averageLatency.toFixed(1)}ms</div>
          <div className="text-xs text-gray-600">Avg Latency</div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Processed Messages</span>
          <span className="font-medium">{aiPerformance.processedMessages.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Critical Detections</span>
          <span className="font-medium text-red-600">{aiPerformance.criticalDetections}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">False Positive Rate</span>
          <span className="font-medium">{(aiPerformance.falsePositiveRate * 100).toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">False Negative Rate</span>
          <span className="font-medium">{(aiPerformance.falseNegativeRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Crisis Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring and analytics for crisis intervention platform
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>
      
      {/* Real-time Metrics */}
      {renderRealTimeMetrics()}
      
      {/* Historical Chart */}
      {renderHistoricalChart()}
      
      {/* Grid Layout for Other Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderSeverityDistribution()}
        {renderVolunteerPerformance()}
        {renderOutcomeMetrics()}
        {renderSystemHealth()}
        {renderAIPerformance()}
      </div>
    </div>
  );
}