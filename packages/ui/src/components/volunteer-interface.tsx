'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Alert, Progress, Input } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { designTokens } from '../design-system';

// Volunteer Interface Types
interface VolunteerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline' | 'training';
  specializations: string[];
  certifications: string[];
  languages: string[];
  rating: number;
  totalCases: number;
  hoursVolunteered: number;
  joinDate: Date;
  lastActive: Date;
  availabilitySchedule: AvailabilitySlot[];
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  isRecurring: boolean;
}

interface CaseAssignment {
  id: string;
  crisisId: string;
  clientId: string;
  assignedAt: Date;
  status: 'pending' | 'active' | 'completed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedDuration?: number;
  actualDuration?: number;
  notes?: string;
  clientFeedback?: {
    rating: number;
    comment: string;
  };
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  progress: number; // 0-100
  completedAt?: Date;
  expiresAt?: Date;
  certification?: string;
  required: boolean;
}

// Volunteer Dashboard Component
interface VolunteerDashboardProps {
  volunteer: VolunteerProfile;
  onStatusChange: (status: VolunteerProfile['status']) => void;
  onProfileUpdate: (profile: Partial<VolunteerProfile>) => void;
  className?: string;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  volunteer,
  onStatusChange,
  onProfileUpdate,
  className = ''
}) => {
  const [quickStats, setQuickStats] = useState({
    activeCases: 0,
    pendingCases: 0,
    completedToday: 0,
    hoursThisWeek: 0
  });

  useEffect(() => {
    // Mock quick stats - would come from API
    setQuickStats({
      activeCases: 2,
      pendingCases: 1,
      completedToday: 3,
      hoursThisWeek: 12.5
    });
  }, []);

  const getStatusColor = (status: VolunteerProfile['status']) => {
    switch (status) {
      case 'available': return designTokens.colors.status.success;
      case 'busy': return designTokens.colors.status.warning;
      case 'training': return designTokens.colors.status.info;
      default: return designTokens.colors.neutral.medium;
    }
  };

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Volunteer Dashboard">
      <ScreenReaderOnly>
        <h1>Volunteer Dashboard for {volunteer.name}</h1>
      </ScreenReaderOnly>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {volunteer.name}</h1>
          <p className="text-gray-600">Ready to make a difference today?</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={volunteer.status}
              onChange={(e) => onStatusChange(e.target.value as VolunteerProfile['status'])}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: getStatusColor(volunteer.status) }}
              aria-label="Change availability status"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="training">In Training</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          <Badge
            variant="secondary"
            className="flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>{volunteer.rating}/5</span>
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-3xl font-bold text-blue-600">{quickStats.activeCases}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pending Cases</p>
              <p className="text-3xl font-bold text-orange-600">{quickStats.pendingCases}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-3xl font-bold text-green-600">{quickStats.completedToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Hours This Week</p>
              <p className="text-3xl font-bold text-purple-600">{quickStats.hoursThisWeek}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Case Management Component
interface CaseManagementProps {
  cases: CaseAssignment[];
  onCaseSelect: (caseId: string) => void;
  onCaseUpdate: (caseId: string, updates: Partial<CaseAssignment>) => void;
  onCaseComplete: (caseId: string, feedback: CaseAssignment['clientFeedback']) => void;
  className?: string;
}

export const CaseManagement: React.FC<CaseManagementProps> = ({
  cases,
  onCaseSelect,
  onCaseUpdate,
  onCaseComplete,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'pending' | 'completed'>('active');

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
      case 'completed': return designTokens.colors.neutral.medium;
      case 'escalated': return designTokens.colors.crisis.critical;
      default: return designTokens.colors.neutral.medium;
    }
  };

  const filteredCases = cases.filter(c => {
    switch (selectedTab) {
      case 'active': return c.status === 'active';
      case 'pending': return c.status === 'pending';
      case 'completed': return c.status === 'completed';
      default: return true;
    }
  });

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Case Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your assigned crisis intervention cases
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Case status tabs">
          {(['active', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-selected={selectedTab === tab}
              role="tab"
            >
              {tab} ({cases.filter(c => c.status === tab).length})
            </button>
          ))}
        </nav>
      </div>

      {/* Case List */}
      <div className="p-6">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No {selectedTab} cases</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onCaseSelect(caseItem.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCaseSelect(caseItem.id);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Case #{caseItem.id.slice(-6)} - {caseItem.category}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Assigned {new Date(caseItem.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge
                      variant="custom"
                      className="text-white text-xs"
                      style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
                    >
                      {caseItem.priority.toUpperCase()}
                    </Badge>
                    <Badge
                      variant="custom"
                      className="text-white text-xs"
                      style={{ backgroundColor: getStatusColor(caseItem.status) }}
                    >
                      {caseItem.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {caseItem.notes && (
                  <p className="text-sm text-gray-700 mb-3">{caseItem.notes}</p>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {caseItem.estimatedDuration && (
                      <span>Est. {caseItem.estimatedDuration}min</span>
                    )}
                    {caseItem.actualDuration && (
                      <span> • Actual: {caseItem.actualDuration}min</span>
                    )}
                  </div>
                  
                  {caseItem.status === 'active' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCaseUpdate(caseItem.id, { status: 'escalated' });
                        }}
                        className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      >
                        Escalate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCaseComplete(caseItem.id, { rating: 5, comment: '' });
                        }}
                        className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </div>

                {caseItem.clientFeedback && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Client Rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < caseItem.clientFeedback!.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {caseItem.clientFeedback.comment && (
                      <p className="text-sm text-gray-600 mt-1">"{caseItem.clientFeedback.comment}"</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// Availability Scheduler Component
interface AvailabilitySchedulerProps {
  schedule: AvailabilitySlot[];
  onScheduleUpdate: (schedule: AvailabilitySlot[]) => void;
  className?: string;
}

export const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({
  schedule,
  onScheduleUpdate,
  className = ''
}) => {
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const handleAddSlot = () => {
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isRecurring: true
    };
    setEditingSlot(newSlot);
    setIsAddingSlot(true);
  };

  const handleSaveSlot = (slot: AvailabilitySlot) => {
    if (isAddingSlot) {
      onScheduleUpdate([...schedule, slot]);
      setIsAddingSlot(false);
    } else {
      onScheduleUpdate(schedule.map(s => s.id === slot.id ? slot : s));
    }
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    onScheduleUpdate(schedule.filter(s => s.id !== slotId));
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return schedule.filter(slot => slot.dayOfWeek === dayOfWeek);
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Availability Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              Set your availability for crisis intervention volunteering
            </p>
          </div>
          <Button onClick={handleAddSlot} className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Slot</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map((day, index) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{day}</h3>
              
              <div className="space-y-2">
                {getScheduleForDay(index).map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <div className="text-sm">
                      <div className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {slot.isRecurring && (
                        <div className="text-gray-500">Weekly</div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSlot(slot)}
                        className="p-1"
                        aria-label={`Edit ${day} ${slot.startTime}-${slot.endTime} slot`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        aria-label={`Delete ${day} ${slot.startTime}-${slot.endTime} slot`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {getScheduleForDay(index).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No availability set
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isAddingSlot ? 'Add Availability Slot' : 'Edit Availability Slot'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={editingSlot.dayOfWeek}
                  onChange={(e) => setEditingSlot({
                    ...editingSlot,
                    dayOfWeek: parseInt(e.target.value)
                  })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={day} value={index}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={editingSlot.startTime}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      startTime: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={editingSlot.endTime}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      endTime: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingSlot.isRecurring}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      isRecurring: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Recurring weekly</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingSlot(null);
                  setIsAddingSlot(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveSlot(editingSlot)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAddingSlot ? 'Add Slot' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Training Progress Component
interface TrainingProgressProps {
  modules: TrainingModule[];
  onModuleStart: (moduleId: string) => void;
  onModuleContinue: (moduleId: string) => void;
  className?: string;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  modules,
  onModuleStart,
  onModuleContinue,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];

  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(m => m.category === selectedCategory);

  const getDifficultyColor = (difficulty: TrainingModule['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TrainingModule['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallProgress = modules.length > 0 
    ? Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length)
    : 0;

  const completedModules = modules.filter(m => m.status === 'completed').length;
  const requiredModules = modules.filter(m => m.required).length;
  const completedRequired = modules.filter(m => m.required && m.status === 'completed').length;

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Training Progress</h2>
            <p className="text-sm text-gray-600 mt-1">
              Continue your volunteer training and certifications
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">{completedModules}/{modules.length}</div>
            <div className="text-sm text-gray-600">Modules Completed</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">{completedRequired}/{requiredModules}</div>
            <div className="text-sm text-gray-600">Required Completed</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-semibold text-gray-900">
              {modules.filter(m => m.certification && m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Certifications Earned</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Training Modules */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredModules.map((module) => (
            <div key={module.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    {module.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{module.duration} minutes</span>
                    <Badge variant="secondary" className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(module.status)}>
                      {module.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="ml-4">
                  {module.status === 'not_started' && (
                    <Button
                      size="sm"
                      onClick={() => onModuleStart(module.id)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Start
                    </Button>
                  )}
                  {module.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => onModuleContinue(module.id)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Continue
                    </Button>
                  )}
                  {module.status === 'completed' && module.certification && (
                    <Badge variant="success" className="bg-green-100 text-green-800">
                      Certified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {module.progress > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              )}

              {/* Expiration Warning */}
              {module.expiresAt && module.status === 'completed' && (
                <Alert variant="default" className="mt-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm">
                      Certification expires {new Date(module.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default VolunteerDashboard;