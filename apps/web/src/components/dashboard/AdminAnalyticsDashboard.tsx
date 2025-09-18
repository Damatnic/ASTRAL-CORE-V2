'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Users, Shield,
  AlertTriangle, CheckCircle, Clock, Heart, Brain, Phone,
  MessageCircle, Eye, Filter, Download, RefreshCw, Calendar,
  MapPin, Star, Zap, Target, Award, Settings, Bell, Search
} from 'lucide-react';

interface SystemMetrics {
  crisis: {
    activeSessions: number;
    totalToday: number;
    averageResponseTime: number;
    resolutionRate: number;
    criticalAlerts: number;
    trend: 'up' | 'down' | 'stable';
  };
  users: {
    activeUsers: number;
    newRegistrations: number;
    retentionRate: number;
    averageSessionDuration: number;
    peakHours: string[];
  };
  volunteers: {
    onlineNow: number;
    totalActive: number;
    averageRating: number;
    burnoutRisk: number;
    trainingCompleted: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    dataProcessed: number;
    securityIncidents: number;
  };
}

interface CrisisAnalytics {
  severityDistribution: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    percentage: number;
  }>;
  outcomeStats: Array<{
    outcome: string;
    count: number;
    successRate: number;
  }>;
  responseTimeDistribution: Array<{
    timeRange: string;
    count: number;
  }>;
  geographicData: Array<{
    region: string;
    sessions: number;
    successRate: number;
  }>;
}

export default function AdminAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [analytics, setAnalytics] = useState<CrisisAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [activeTab, setActiveTab] = useState<'overview' | 'crisis' | 'users' | 'volunteers' | 'system'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    // Auto-refresh every 30 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadAnalyticsData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTimeRange, autoRefresh]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [metricsResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/admin/metrics?timeRange=${selectedTimeRange}`),
        fetch(`/api/admin/analytics?timeRange=${selectedTimeRange}`)
      ]);

      if (metricsResponse.ok && analyticsResponse.ok) {
        const [metricsData, analyticsData] = await Promise.all([
          metricsResponse.json(),
          analyticsResponse.json()
        ]);
        
        setMetrics(metricsData);
        setAnalytics(analyticsData);
      } else {
        // Set empty states on error
        setMetrics({
          crisis: { activeSessions: 0, totalToday: 0, averageResponseTime: 0, resolutionRate: 0, criticalAlerts: 0, trend: 'stable' },
          users: { activeUsers: 0, newRegistrations: 0, retentionRate: 0, averageSessionDuration: 0, peakHours: [] },
          volunteers: { onlineNow: 0, totalActive: 0, averageRating: 0, burnoutRisk: 0, trainingCompleted: 0 },
          system: { uptime: 0, responseTime: 0, errorRate: 0, dataProcessed: 0, securityIncidents: 0 }
        });
        setAnalytics({
          severityDistribution: [],
          outcomeStats: [],
          responseTimeDistribution: [],
          geographicData: []
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/admin/export?timeRange=${selectedTimeRange}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `astral-analytics-${selectedTimeRange}-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ASTRAL CORE Analytics
            </h1>
            <p className="text-gray-600">
              Real-time insights into platform performance and crisis intervention effectiveness
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Critical Alerts Bar */}
        {metrics && metrics.crisis.criticalAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3" />
              <span className="font-semibold">
                {metrics.crisis.criticalAlerts} Critical Alert{metrics.crisis.criticalAlerts !== 1 ? 's' : ''} Active
              </span>
            </div>
            <button className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors">
              View Details
            </button>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'crisis', label: 'Crisis Management', icon: AlertTriangle },
              { id: 'users', label: 'User Analytics', icon: Users },
              { id: 'volunteers', label: 'Volunteer Performance', icon: Heart },
              { id: 'system', label: 'System Health', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab key="overview" metrics={metrics} analytics={analytics} />
          )}
          {activeTab === 'crisis' && (
            <CrisisTab key="crisis" metrics={metrics?.crisis} analytics={analytics} />
          )}
          {activeTab === 'users' && (
            <UsersTab key="users" metrics={metrics?.users} />
          )}
          {activeTab === 'volunteers' && (
            <VolunteersTab key="volunteers" metrics={metrics?.volunteers} />
          )}
          {activeTab === 'system' && (
            <SystemTab key="system" metrics={metrics?.system} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ metrics, analytics }: { metrics: SystemMetrics | null; analytics: CrisisAnalytics | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Crisis Sessions"
          value={metrics?.crisis.activeSessions || 0}
          change={metrics?.crisis.trend === 'up' ? 12 : metrics?.crisis.trend === 'down' ? -5 : 0}
          icon={AlertTriangle}
          color="bg-red-500"
          critical={metrics ? metrics.crisis.activeSessions > 10 : false}
        />
        
        <MetricCard
          title="Active Users"
          value={metrics?.users.activeUsers || 0}
          change={8}
          icon={Users}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Volunteers Online"
          value={metrics?.volunteers.onlineNow || 0}
          change={3}
          icon={Heart}
          color="bg-green-500"
        />
        
        <MetricCard
          title="System Uptime"
          value={`${metrics?.system.uptime || 0}%`}
          change={0}
          icon={Activity}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Crisis Severity Distribution
          </h3>
          <CrisisSeverityChart data={analytics?.severityDistribution || []} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-500" />
            Response Time Distribution
          </h3>
          <ResponseTimeChart data={analytics?.responseTimeDistribution || []} />
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-500" />
          Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PerformanceIndicator
            label="Crisis Resolution Rate"
            value={metrics?.crisis.resolutionRate || 0}
            target={95}
            unit="%"
          />
          <PerformanceIndicator
            label="Average Response Time"
            value={metrics?.crisis.averageResponseTime || 0}
            target={60}
            unit="sec"
            inverse={true}
          />
          <PerformanceIndicator
            label="User Retention Rate"
            value={metrics?.users.retentionRate || 0}
            target={80}
            unit="%"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Crisis Tab Component
function CrisisTab({ metrics, analytics }: { metrics: any; analytics: CrisisAnalytics | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Crisis Outcomes</h3>
          <div className="space-y-4">
            {analytics?.outcomeStats.map((outcome, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{outcome.outcome}</span>
                <div className="text-right">
                  <div className="font-bold">{outcome.count}</div>
                  <div className="text-sm text-gray-500">{outcome.successRate}% success</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
          <div className="space-y-4">
            {analytics?.geographicData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">{region.region}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{region.sessions}</div>
                  <div className="text-sm text-gray-500">{region.successRate}% success</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Users Tab Component
function UsersTab({ metrics }: { metrics: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-4 text-blue-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.activeUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-4 text-green-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.newRegistrations || 0}
          </div>
          <div className="text-sm text-gray-600">New Registrations</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-4 text-purple-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(metrics?.averageSessionDuration || 0)}m
          </div>
          <div className="text-sm text-gray-600">Avg Session</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-4 text-orange-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.retentionRate || 0}%
          </div>
          <div className="text-sm text-gray-600">Retention Rate</div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Peak Usage Hours</h3>
        <div className="flex flex-wrap gap-2">
          {metrics?.peakHours?.map((hour: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {hour}
            </span>
          )) || <span className="text-gray-500">No data available</span>}
        </div>
      </div>
    </motion.div>
  );
}

// Volunteers Tab Component
function VolunteersTab({ metrics }: { metrics: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Heart className="w-8 h-8 mx-auto mb-4 text-green-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.onlineNow || 0}
          </div>
          <div className="text-sm text-gray-600">Online Now</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-4 text-blue-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.totalActive || 0}
          </div>
          <div className="text-sm text-gray-600">Total Active</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.averageRating?.toFixed(1) || '0.0'}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-orange-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.burnoutRisk || 0}%
          </div>
          <div className="text-sm text-gray-600">Burnout Risk</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Award className="w-8 h-8 mx-auto mb-4 text-purple-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.trainingCompleted || 0}
          </div>
          <div className="text-sm text-gray-600">Training Complete</div>
        </div>
      </div>
    </motion.div>
  );
}

// System Tab Component
function SystemTab({ metrics }: { metrics: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Activity className="w-8 h-8 mx-auto mb-4 text-green-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.uptime || 0}%
          </div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-4 text-blue-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.responseTime || 0}ms
          </div>
          <div className="text-sm text-gray-600">Response Time</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.errorRate || 0}%
          </div>
          <div className="text-sm text-gray-600">Error Rate</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-4 text-purple-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {(metrics?.dataProcessed || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Data Processed</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Shield className="w-8 h-8 mx-auto mb-4 text-orange-500" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics?.securityIncidents || 0}
          </div>
          <div className="text-sm text-gray-600">Security Incidents</div>
        </div>
      </div>
    </motion.div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon: Icon, color, critical = false }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg p-6 ${critical ? 'ring-2 ring-red-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== 0 && (
          <div className={`flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="text-sm font-medium">{Math.abs(change)}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {critical && (
        <div className="mt-2 text-sm text-red-600 font-medium">
          Requires attention
        </div>
      )}
    </motion.div>
  );
}

// Performance Indicator Component
function PerformanceIndicator({ label, value, target, unit, inverse = false }: any) {
  const percentage = inverse 
    ? Math.max(0, Math.min(100, ((target - value) / target) * 100))
    : Math.min(100, (value / target) * 100);
  
  const isGood = inverse ? value <= target : value >= target;
  
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-gray-900 mb-2">{label}</div>
      <div className="text-3xl font-bold mb-2">
        {value}{unit}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isGood ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-sm text-gray-600">
        Target: {target}{unit}
      </div>
    </div>
  );
}

// Chart Components (simplified for now)
function CrisisSeverityChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Crisis severity distribution chart</p>
        <p className="text-sm">{data.length} severity levels tracked</p>
      </div>
    </div>
  );
}

function ResponseTimeChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Response time distribution</p>
        <p className="text-sm">{data.length} time ranges tracked</p>
      </div>
    </div>
  );
}

// Loading Skeleton
function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-96"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-10"></div>
              <div className="h-10 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="bg-white rounded-xl shadow-lg mb-8 p-1">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-300 rounded w-32"></div>
              ))}
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-12 bg-gray-300 rounded w-12 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
