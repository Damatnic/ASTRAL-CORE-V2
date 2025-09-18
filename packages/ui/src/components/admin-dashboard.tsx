'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Progress } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { designTokens } from '../design-system';

// Admin Dashboard Types
interface CrisisOverview {
  id: string;
  clientId: string;
  volunteerId?: string;
  status: 'active' | 'pending' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  lastUpdate: Date;
  category: string;
  location?: string;
}

interface VolunteerStatus {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  currentCases: number;
  specializations: string[];
  rating: number;
  responseTime: number;
}

interface SystemMetrics {
  activeCrises: number;
  availableVolunteers: number;
  averageResponseTime: number;
  resolutionRate: number;
  criticalAlerts: number;
}

interface AdminDashboardProps {
  className?: string;
  refreshInterval?: number;
}

// Crisis Overview Table Component
interface CrisisOverviewTableProps {
  crises: CrisisOverview[];
  onCrisisSelect: (crisis: CrisisOverview) => void;
  onEscalate: (crisisId: string) => void;
  onAssignVolunteer: (crisisId: string, volunteerId: string) => void;
}

export const CrisisOverviewTable: React.FC<CrisisOverviewTableProps> = ({
  crises,
  onCrisisSelect,
  onEscalate,
  onAssignVolunteer
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return designTokens.colors.crisis.critical;
      case 'high': return designTokens.colors.crisis.high;
      case 'medium': return designTokens.colors.crisis.medium;
      default: return designTokens.colors.crisis.low;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return designTokens.colors.status.success;
      case 'pending': return designTokens.colors.status.warning;
      case 'escalated': return designTokens.colors.crisis.critical;
      default: return designTokens.colors.neutral.medium;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Active Crises</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor and manage ongoing crisis interventions
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Active crises overview">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volunteer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {crises.map((crisis) => (
              <tr 
                key={crisis.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onCrisisSelect(crisis)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCrisisSelect(crisis);
                  }
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{crisis.id.slice(-6)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(crisis.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="custom"
                    className="text-white font-medium"
                    style={{ backgroundColor: getPriorityColor(crisis.priority) }}
                  >
                    {crisis.priority.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="custom"
                    className="text-white font-medium"
                    style={{ backgroundColor: getStatusColor(crisis.status) }}
                  >
                    {crisis.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {crisis.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {crisis.volunteerId ? (
                    <span className="text-green-600">Assigned</span>
                  ) : (
                    <span className="text-red-600">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEscalate(crisis.id);
                    }}
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    Escalate
                  </Button>
                  {!crisis.volunteerId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // This would open a volunteer selection modal
                        onAssignVolunteer(crisis.id, 'volunteer-123');
                      }}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      Assign
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Volunteer Management Component
interface VolunteerManagementProps {
  volunteers: VolunteerStatus[];
  onVolunteerSelect: (volunteer: VolunteerStatus) => void;
  onStatusChange: (volunteerId: string, status: VolunteerStatus['status']) => void;
}

export const VolunteerManagement: React.FC<VolunteerManagementProps> = ({
  volunteers,
  onVolunteerSelect,
  onStatusChange
}) => {
  const getStatusColor = (status: VolunteerStatus['status']) => {
    switch (status) {
      case 'available': return designTokens.colors.status.success;
      case 'busy': return designTokens.colors.status.warning;
      default: return designTokens.colors.neutral.medium;
    }
  };

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Volunteer Status</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor volunteer availability and workload
        </p>
      </div>
      
      <div className="p-6 space-y-4">
        {volunteers.map((volunteer) => (
          <div
            key={volunteer.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onVolunteerSelect(volunteer)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onVolunteerSelect(volunteer);
              }
            }}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="font-medium text-gray-900">{volunteer.name}</div>
                <Badge
                  variant="custom"
                  className="text-white text-xs"
                  style={{ backgroundColor: getStatusColor(volunteer.status) }}
                >
                  {volunteer.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Cases:</span> {volunteer.currentCases}
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {volunteer.rating}/5
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {volunteer.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="ml-4 space-x-2">
              <select
                value={volunteer.status}
                onChange={(e) => onStatusChange(volunteer.id, e.target.value as VolunteerStatus['status'])}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Change status for ${volunteer.name}`}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// System Metrics Overview Component
interface SystemMetricsOverviewProps {
  metrics: SystemMetrics;
  className?: string;
}

export const SystemMetricsOverview: React.FC<SystemMetricsOverviewProps> = ({
  metrics,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${className}`}>
      <Card className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Active Crises</p>
            <p className="text-3xl font-bold text-red-600">{metrics.activeCrises}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Available Volunteers</p>
            <p className="text-3xl font-bold text-green-600">{metrics.availableVolunteers}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.averageResponseTime}m</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
            <p className="text-3xl font-bold text-purple-600">{metrics.resolutionRate}%</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
            <p className="text-3xl font-bold text-orange-600">{metrics.criticalAlerts}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13 3L4 14h7v7l9-11h-7V3z" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Real-time Activity Feed Component
interface ActivityFeedItem {
  id: string;
  type: 'crisis_started' | 'crisis_resolved' | 'volunteer_assigned' | 'escalation' | 'system_alert';
  message: string;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  className = ''
}) => {
  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'crisis_started':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'crisis_resolved':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'volunteer_assigned':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'escalation':
        return (
          <div className="p-2 bg-orange-100 rounded-full">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Activity Feed</h2>
        <p className="text-sm text-gray-600 mt-1">
          Real-time system events and updates
        </p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex space-x-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Main Admin Dashboard Component
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  className = '',
  refreshInterval = 30000
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeCrises: 0,
    availableVolunteers: 0,
    averageResponseTime: 0,
    resolutionRate: 0,
    criticalAlerts: 0
  });

  const [crises, setCrises] = useState<CrisisOverview[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerStatus[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: SystemMetrics = {
      activeCrises: 7,
      availableVolunteers: 12,
      averageResponseTime: 3.2,
      resolutionRate: 94,
      criticalAlerts: 2
    };

    const mockCrises: CrisisOverview[] = [
      {
        id: 'crisis-001',
        clientId: 'client-123',
        volunteerId: 'volunteer-456',
        status: 'active',
        priority: 'high',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
        category: 'Mental Health',
        location: 'New York, NY'
      },
      {
        id: 'crisis-002',
        clientId: 'client-456',
        status: 'pending',
        priority: 'critical',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
        category: 'Domestic Violence',
        location: 'Los Angeles, CA'
      }
    ];

    const mockVolunteers: VolunteerStatus[] = [
      {
        id: 'volunteer-001',
        name: 'Sarah Johnson',
        status: 'available',
        currentCases: 2,
        specializations: ['Mental Health', 'Crisis Counseling'],
        rating: 4.9,
        responseTime: 2.1
      },
      {
        id: 'volunteer-002',
        name: 'Michael Chen',
        status: 'busy',
        currentCases: 3,
        specializations: ['Domestic Violence', 'Emergency Response'],
        rating: 4.7,
        responseTime: 1.8
      }
    ];

    const mockActivities: ActivityFeedItem[] = [
      {
        id: 'activity-001',
        type: 'crisis_started',
        message: 'New crisis reported in Los Angeles, CA - Domestic Violence category',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        priority: 'critical'
      },
      {
        id: 'activity-002',
        type: 'volunteer_assigned',
        message: 'Sarah Johnson assigned to crisis #crisis-001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      }
    ];

    setMetrics(mockMetrics);
    setCrises(mockCrises);
    setVolunteers(mockVolunteers);
    setActivities(mockActivities);
    setLastUpdate(new Date());
  }, []);

  const handleCrisisSelect = useCallback((crisis: CrisisOverview) => {
    console.log('Selected crisis:', crisis);
    // This would navigate to crisis detail view
  }, []);

  const handleEscalate = useCallback((crisisId: string) => {
    console.log('Escalating crisis:', crisisId);
    // This would trigger escalation process
  }, []);

  const handleAssignVolunteer = useCallback((crisisId: string, volunteerId: string) => {
    console.log('Assigning volunteer:', { crisisId, volunteerId });
    // This would assign volunteer to crisis
  }, []);

  const handleVolunteerSelect = useCallback((volunteer: VolunteerStatus) => {
    console.log('Selected volunteer:', volunteer);
    // This would navigate to volunteer detail view
  }, []);

  const handleVolunteerStatusChange = useCallback((volunteerId: string, status: VolunteerStatus['status']) => {
    console.log('Changing volunteer status:', { volunteerId, status });
    setVolunteers(prev => 
      prev.map(v => v.id === volunteerId ? { ...v, status } : v)
    );
  }, []);

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Admin Dashboard">
      <ScreenReaderOnly>
        <h1>Crisis Management Admin Dashboard</h1>
      </ScreenReaderOnly>
      
      <LiveRegion>
        Last updated: {lastUpdate.toLocaleTimeString()}
      </LiveRegion>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crisis Management Dashboard</h1>
          <p className="text-gray-600">Monitor and coordinate crisis intervention activities</p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setLastUpdate(new Date())}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <SystemMetricsOverview metrics={metrics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crisis Overview - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <CrisisOverviewTable
            crises={crises}
            onCrisisSelect={handleCrisisSelect}
            onEscalate={handleEscalate}
            onAssignVolunteer={handleAssignVolunteer}
          />
        </div>

        {/* Activity Feed - Takes up 1 column */}
        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Volunteer Management */}
      <VolunteerManagement
        volunteers={volunteers}
        onVolunteerSelect={handleVolunteerSelect}
        onStatusChange={handleVolunteerStatusChange}
      />
    </div>
  );
};

export default AdminDashboard;