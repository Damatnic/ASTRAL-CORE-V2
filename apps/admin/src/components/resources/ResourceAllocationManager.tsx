'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface Resource {
  id: string;
  type: 'counselor' | 'volunteer' | 'room' | 'equipment' | 'license';
  name: string;
  status: 'available' | 'allocated' | 'maintenance' | 'unavailable';
  capacity: number;
  currentUsage: number;
  assignedTo?: string[];
  schedule?: {
    day: string;
    slots: { start: string; end: string; available: boolean }[];
  }[];
  cost?: number;
  priority: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

interface AllocationRequest {
  id: string;
  resourceId: string;
  requestedBy: string;
  purpose: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  notes?: string;
}

export default function ResourceAllocationManager() {
  const { socket } = useAdminStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<AllocationRequest[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [filterType, setFilterType] = useState<'all' | Resource['type']>('all');
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'requests' | 'schedule'>('overview');

  // Mock data
  useEffect(() => {
    const mockResources: Resource[] = [
      {
        id: 'RES001',
        type: 'counselor',
        name: 'Senior Crisis Counselors',
        status: 'available',
        capacity: 10,
        currentUsage: 7,
        assignedTo: ['SES123', 'SES124', 'SES125', 'SES126', 'SES127', 'SES128', 'SES129'],
        priority: 'high',
        metadata: {
          specializations: ['Trauma', 'Suicide Prevention', 'Substance Abuse'],
          averageSessionDuration: 45,
          successRate: 0.89
        }
      },
      {
        id: 'RES002',
        type: 'volunteer',
        name: 'Peer Support Volunteers',
        status: 'available',
        capacity: 25,
        currentUsage: 18,
        assignedTo: Array.from({ length: 18 }, (_, i) => `SES${200 + i}`),
        priority: 'medium',
        metadata: {
          trainingLevel: 'Basic',
          languages: ['English', 'Spanish', 'Mandarin'],
          availability: '24/7'
        }
      },
      {
        id: 'RES003',
        type: 'room',
        name: 'Virtual Crisis Rooms',
        status: 'available',
        capacity: 50,
        currentUsage: 32,
        priority: 'high',
        metadata: {
          features: ['Video', 'Audio', 'Text Chat', 'Screen Sharing'],
          maxParticipants: 4,
          encryptionLevel: 'AES-256'
        }
      },
      {
        id: 'RES004',
        type: 'equipment',
        name: 'Emergency Response Kits',
        status: 'available',
        capacity: 15,
        currentUsage: 3,
        priority: 'high',
        metadata: {
          contents: ['First Aid', 'Medications', 'Communication Devices'],
          lastInspection: '2024-12-01',
          nextMaintenanceDue: '2025-01-15'
        }
      },
      {
        id: 'RES005',
        type: 'license',
        name: 'Teletherapy Platform Licenses',
        status: 'available',
        capacity: 100,
        currentUsage: 78,
        cost: 50,
        priority: 'medium',
        metadata: {
          vendor: 'SecureHealth Pro',
          expiryDate: '2025-12-31',
          features: ['HIPAA Compliant', 'E2E Encryption', 'Session Recording']
        }
      },
      {
        id: 'RES006',
        type: 'counselor',
        name: 'Specialized Trauma Therapists',
        status: 'allocated',
        capacity: 5,
        currentUsage: 5,
        assignedTo: ['SES301', 'SES302', 'SES303', 'SES304', 'SES305'],
        priority: 'high',
        metadata: {
          certifications: ['EMDR', 'CBT', 'DBT'],
          waitlistCount: 12
        }
      },
      {
        id: 'RES007',
        type: 'room',
        name: 'Group Therapy Rooms',
        status: 'maintenance',
        capacity: 10,
        currentUsage: 0,
        priority: 'low',
        metadata: {
          maintenanceReason: 'System upgrade',
          estimatedCompletion: '2024-12-20',
          alternativeAvailable: true
        }
      }
    ];

    const mockRequests: AllocationRequest[] = [
      {
        id: 'REQ001',
        resourceId: 'RES001',
        requestedBy: 'Sarah Johnson',
        purpose: 'Emergency crisis intervention for high-risk client',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'urgent',
        notes: 'Client showing immediate suicide risk indicators'
      },
      {
        id: 'REQ002',
        resourceId: 'RES003',
        requestedBy: 'Michael Chen',
        purpose: 'Group support session for anxiety management',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25.5 * 60 * 60 * 1000),
        status: 'approved',
        priority: 'normal'
      },
      {
        id: 'REQ003',
        resourceId: 'RES005',
        requestedBy: 'Emily Rodriguez',
        purpose: 'Additional license for new volunteer onboarding',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 93 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'low',
        notes: 'Part of Q1 expansion plan'
      }
    ];

    setResources(mockResources);
    setRequests(mockRequests);
  }, []);

  const getUtilizationColor = (usage: number, capacity: number) => {
    const percentage = (usage / capacity) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'allocated': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium':
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    ));
    
    // Update resource allocation
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setResources(prev => prev.map(res => 
        res.id === request.resourceId 
          ? { ...res, currentUsage: Math.min(res.currentUsage + 1, res.capacity) }
          : res
      ));
    }
  };

  const handleDenyRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'denied' as const } : req
    ));
  };

  const handleOptimizeAllocation = () => {
    // Simulated optimization algorithm
    alert('Running resource optimization algorithm...\n\nOptimization complete:\n- Reallocated 3 idle resources\n- Improved utilization by 15%\n- Reduced wait times by 8 minutes average');
  };

  const filteredResources = resources.filter(res => 
    filterType === 'all' || res.type === filterType
  );

  const totalCapacity = resources.reduce((sum, res) => sum + res.capacity, 0);
  const totalUsage = resources.reduce((sum, res) => sum + res.currentUsage, 0);
  const overallUtilization = ((totalUsage / totalCapacity) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resource Allocation Manager</h2>
          <p className="text-sm text-gray-600 mt-1">Optimize and manage system resources</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleOptimizeAllocation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            🎯 Optimize Allocation
          </button>
          <button
            onClick={() => setShowAllocationForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + New Allocation
          </button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-800">{overallUtilization}%</div>
          <div className="text-sm text-blue-600">Overall Utilization</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-800">{totalCapacity}</div>
          <div className="text-sm text-green-600">Total Capacity</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-yellow-800">{totalUsage}</div>
          <div className="text-sm text-yellow-600">Currently Allocated</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-purple-800">{totalCapacity - totalUsage}</div>
          <div className="text-sm text-purple-600">Available</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'requests', 'schedule'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <>
          {/* Filter */}
          <div className="mb-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Resources</option>
              <option value="counselor">Counselors</option>
              <option value="volunteer">Volunteers</option>
              <option value="room">Rooms</option>
              <option value="equipment">Equipment</option>
              <option value="license">Licenses</option>
            </select>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedResource(resource)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Type: {resource.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                </div>

                {/* Utilization Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Utilization</span>
                    <span>{resource.currentUsage}/{resource.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${getUtilizationColor(resource.currentUsage, resource.capacity)}`}
                      style={{ width: `${(resource.currentUsage / resource.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(resource.priority)}`}>
                    {resource.priority} priority
                  </span>
                  {resource.cost && (
                    <span className="text-sm text-gray-600">${resource.cost}/unit</span>
                  )}
                </div>

                {/* Metadata Preview */}
                {resource.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {Object.entries(resource.metadata).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="text-xs text-gray-600">
                        <span className="font-medium">{key}:</span>{' '}
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No allocation requests at this time</p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'denied' ? 'bg-red-100 text-red-800' :
                        request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900">{request.purpose}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested by: {request.requestedBy}
                    </p>
                    <p className="text-sm text-gray-600">
                      Resource: {resources.find(r => r.id === request.resourceId)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {new Date(request.startTime).toLocaleString()} - {new Date(request.endTime).toLocaleString()}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                        {request.notes}
                      </p>
                    )}
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDenyRequest(request.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedTab === 'schedule' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Schedule</h3>
          <div className="grid grid-cols-8 gap-2 text-sm">
            <div className="font-medium text-gray-700">Resource</div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="font-medium text-gray-700 text-center">{day}</div>
            ))}
            
            {resources.slice(0, 5).map(resource => (
              <React.Fragment key={resource.id}>
                <div className="font-medium text-gray-900 truncate" title={resource.name}>
                  {resource.name}
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const utilization = Math.random() * 100;
                  return (
                    <div
                      key={day}
                      className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                        utilization > 80 ? 'bg-red-200 text-red-800' :
                        utilization > 60 ? 'bg-yellow-200 text-yellow-800' :
                        utilization > 40 ? 'bg-blue-200 text-blue-800' :
                        'bg-green-200 text-green-800'
                      }`}
                    >
                      {Math.round(utilization)}%
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-gray-600">Low Usage</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span className="text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span className="text-gray-600">High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-200 rounded"></div>
              <span className="text-gray-600">Critical</span>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedResource.name}</h3>
                  <p className="text-sm text-gray-600">Resource ID: {selectedResource.id}</p>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedResource.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedResource.status)}`}>
                      {selectedResource.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Capacity</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedResource.capacity} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Usage</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedResource.currentUsage} units</p>
                </div>
              </div>

              {/* Utilization Chart */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Utilization</label>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-6">
                  <div 
                    className={`h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      getUtilizationColor(selectedResource.currentUsage, selectedResource.capacity)
                    }`}
                    style={{ width: `${(selectedResource.currentUsage / selectedResource.capacity) * 100}%` }}
                  >
                    {((selectedResource.currentUsage / selectedResource.capacity) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {selectedResource.metadata && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Additional Information</label>
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                    {Object.entries(selectedResource.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedResource(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedResource(null);
                    setShowAllocationForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Allocate Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}