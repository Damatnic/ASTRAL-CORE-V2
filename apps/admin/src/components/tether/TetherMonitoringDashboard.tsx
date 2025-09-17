/**
 * ASTRAL_CORE 2.0 - Real-time Tether Monitoring Dashboard
 * 
 * LIFE-CRITICAL MONITORING INTERFACE FOR CRISIS COUNSELORS
 * Provides real-time visibility into user safety, missed heartbeats, and emergency situations.
 * This dashboard can save lives by enabling rapid response to user distress.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  AlertTriangle, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Activity,
  Shield,
  Zap,
  Bell,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';

interface TetherConnection {
  id: string;
  seekerId: string;
  supporterId: string;
  strength: number;
  lastPulse: Date;
  missedPulses: number;
  emergencyActive: boolean;
  status: 'HEALTHY' | 'WARNING' | 'ALERT' | 'EMERGENCY' | 'CRITICAL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastActivity: Date;
  pulseInterval: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  seeker?: {
    anonymousId: string;
    lastSeen: Date;
    wellnessScore?: number;
  };
  supporter?: {
    id: string;
    name: string;
    status: string;
    emergencyCapable: boolean;
  };
}

interface EmergencyAlert {
  id: string;
  type: 'MISSED_HEARTBEAT' | 'MISSED_CHECKIN' | 'EMERGENCY_SIGNAL' | 'WELLNESS_DECLINE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId: string;
  tetherId?: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  responderName?: string;
  timeToAcknowledge?: number; // seconds
  escalationLevel: number;
}

interface DashboardStats {
  totalTethers: number;
  activeTethers: number;
  emergencyTethers: number;
  missedHeartbeats: number;
  averageResponseTime: number;
  availableResponders: number;
  escalationsToday: number;
  livesProtected: number;
}

const TetherMonitoringDashboard: React.FC = () => {
  const [tethers, setTethers] = useState<TetherConnection[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTethers: 0,
    activeTethers: 0,
    emergencyTethers: 0,
    missedHeartbeats: 0,
    averageResponseTime: 0,
    availableResponders: 0,
    escalationsToday: 0,
    livesProtected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTether, setSelectedTether] = useState<TetherConnection | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'EMERGENCY' | 'WARNING' | 'HEALTHY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Real-time data fetching
  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch tether connections
      const tethersResponse = await fetch('/api/admin/tether/monitoring');
      const tethersData = await tethersResponse.json();
      
      // Fetch emergency alerts
      const alertsResponse = await fetch('/api/admin/tether/alerts');
      const alertsData = await alertsResponse.json();
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/tether/stats');
      const statsData = await statsResponse.json();

      if (tethersData.success) {
        setTethers(tethersData.tethers || []);
      }
      
      if (alertsData.success) {
        setEmergencyAlerts(alertsData.alerts || []);
      }
      
      if (statsData.success) {
        setStats(statsData.stats);
      }

      setLastUpdate(new Date());
      setIsLoading(false);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchDashboardData();
    
    if (isAutoRefresh) {
      const interval = setInterval(fetchDashboardData, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, isAutoRefresh]);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'TETHER_UPDATE') {
        setTethers(prev => prev.map(tether => 
          tether.id === data.tetherId ? { ...tether, ...data.updates } : tether
        ));
      } else if (data.type === 'EMERGENCY_ALERT') {
        setEmergencyAlerts(prev => [data.alert, ...prev.slice(0, 49)]); // Keep last 50
      } else if (data.type === 'STATS_UPDATE') {
        setStats(data.stats);
      }
    };

    return () => ws.close();
  }, []);

  // Filter and search tethers
  const filteredTethers = tethers.filter(tether => {
    const matchesFilter = filterStatus === 'ALL' || 
      (filterStatus === 'EMERGENCY' && (tether.status === 'EMERGENCY' || tether.status === 'CRITICAL')) ||
      (filterStatus === 'WARNING' && tether.status === 'WARNING') ||
      (filterStatus === 'HEALTHY' && tether.status === 'HEALTHY');
    
    const matchesSearch = searchQuery === '' || 
      tether.seekerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tether.supporter?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  // Acknowledge emergency alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/admin/tether/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'Current User' })
      });
      
      setEmergencyAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  // Escalate emergency
  const escalateEmergency = async (tetherId: string) => {
    try {
      await fetch(`/api/admin/tether/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tetherId, escalationType: 'MANUAL' })
      });
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to escalate emergency:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'EMERGENCY': return 'text-red-500 bg-red-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get risk level color
  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'CRITICAL': return 'text-red-700 bg-red-200';
      case 'HIGH': return 'text-orange-700 bg-orange-200';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-200';
      case 'LOW': return 'text-green-700 bg-green-200';
      default: return 'text-gray-700 bg-gray-200';
    }
  };

  // Format time since last activity
  const formatTimeSince = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading monitoring dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3 animate-pulse" />
              Tether Monitoring Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring of user safety and emergency interventions
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {formatTimeSince(lastUpdate)}
            </div>
            
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                isAutoRefresh 
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh
            </button>
            
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tethers</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeTethers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>{stats.totalTethers} total connections</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emergency Active</p>
              <p className="text-3xl font-bold text-red-600">{stats.emergencyTethers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Zap className="h-4 w-4 mr-1 text-orange-500" />
            <span>{stats.escalationsToday} escalations today</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-green-600">{stats.averageResponseTime}s</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Shield className="h-4 w-4 mr-1 text-blue-500" />
            <span>{stats.availableResponders} responders available</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lives Protected</p>
              <p className="text-3xl font-bold text-purple-600">{stats.livesProtected}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
            <span>Since platform launch</span>
          </div>
        </motion.div>
      </div>

      {/* Emergency Alerts */}
      {emergencyAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 text-red-500 mr-2" />
            Emergency Alerts ({emergencyAlerts.filter(a => !a.acknowledged).length} unacknowledged)
          </h2>
          
          <div className="space-y-3">
            {emergencyAlerts.slice(0, 5).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.acknowledged ? 'bg-gray-50 border-gray-400' : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                      alert.severity === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                      alert.severity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {alert.severity}
                    </div>
                    <span className="font-medium text-gray-900">{alert.message}</span>
                    <span className="text-sm text-gray-500">
                      {formatTimeSince(alert.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    
                    {alert.tetherId && (
                      <button
                        onClick={() => escalateEmergency(alert.tetherId!)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="WARNING">Warning</option>
              <option value="HEALTHY">Healthy</option>
            </select>
          </div>
          
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tethers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredTethers.length} of {tethers.length} tethers
        </div>
      </div>

      {/* Tethers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTethers.map((tether) => (
            <motion.div
              key={tether.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                tether.emergencyActive ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedTether(tether)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      tether.emergencyActive ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Heart className={`h-5 w-5 ${
                        tether.emergencyActive ? 'text-red-600 animate-pulse' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Tether #{tether.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Strength: {Math.round(tether.strength * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tether.status)}`}>
                      {tether.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(tether.riskLevel)}`}>
                      {tether.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Pulse Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Pulse:</span>
                    <span className="text-sm font-medium">{formatTimeSince(tether.lastPulse)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Missed Pulses:</span>
                    <span className={`text-sm font-medium ${
                      tether.missedPulses > 5 ? 'text-red-600' : 
                      tether.missedPulses > 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {tether.missedPulses}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pulse Interval:</span>
                    <span className="text-sm font-medium">{tether.pulseInterval}s</span>
                  </div>

                  {tether.seeker?.wellnessScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wellness Score:</span>
                      <span className={`text-sm font-medium ${
                        tether.seeker.wellnessScore <= 3 ? 'text-red-600' :
                        tether.seeker.wellnessScore <= 6 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {tether.seeker.wellnessScore}/10
                      </span>
                    </div>
                  )}
                </div>

                {/* Supporter Info */}
                {tether.supporter && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Supporter:</span>
                        <span className="text-sm font-medium">{tether.supporter.name}</span>
                      </div>
                      {tether.supporter.emergencyCapable && (
                        <Shield className="h-4 w-4 text-green-600" title="Emergency Capable" />
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {tether.location && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Location available</span>
                      <span className="text-xs text-gray-500">
                        (±{tether.location.accuracy}m)
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Details
                  </button>
                  
                  {tether.emergencyActive && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        escalateEmergency(tether.id);
                      }}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Escalate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTethers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tethers found</h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== 'ALL' 
              ? 'Try adjusting your filters or search query.'
              : 'No active tether connections at this time.'
            }
          </p>
        </div>
      )}

      {/* Tether Details Modal */}
      <AnimatePresence>
        {selectedTether && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTether(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Tether Details: #{selectedTether.id.slice(-8)}
                  </h2>
                  <button
                    onClick={() => setSelectedTether(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                </div>

                {/* Detailed tether information would go here */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Connection Status</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded ${getStatusColor(selectedTether.status)}`}>
                          {selectedTether.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`ml-2 px-2 py-1 rounded ${getRiskColor(selectedTether.riskLevel)}`}>
                          {selectedTether.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* More detailed information would be displayed here */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TetherMonitoringDashboard;