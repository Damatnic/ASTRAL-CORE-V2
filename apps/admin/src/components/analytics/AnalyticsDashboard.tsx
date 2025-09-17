'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface AnalyticsData {
  sessions: {
    total: number;
    successful: number;
    escalated: number;
    abandoned: number;
    averageDuration: number;
    byHour: { hour: number; count: number }[];
    byDay: { day: string; count: number }[];
    byOutcome: { outcome: string; count: number; percentage: number }[];
  };
  users: {
    total: number;
    new: number;
    returning: number;
    active: number;
    demographics: {
      ageGroups: { group: string; count: number }[];
      locations: { location: string; count: number }[];
    };
  };
  volunteers: {
    total: number;
    active: number;
    performance: {
      topPerformers: { id: string; name: string; score: number; sessions: number }[];
      averageRating: number;
      averageResponseTime: number;
    };
  };
  crisis: {
    types: { type: string; count: number; percentage: number }[];
    severityDistribution: { severity: string; count: number }[];
    resolutionTimes: { range: string; count: number }[];
    trends: { date: string; count: number }[];
  };
}

export default function AnalyticsDashboard() {
  const { socket } = useAdminStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [selectedChart, setSelectedChart] = useState<'sessions' | 'crisis' | 'volunteers' | 'users'>('sessions');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');

  // Mock data for demonstration
  useEffect(() => {
    const mockAnalytics: AnalyticsData = {
      sessions: {
        total: 1234,
        successful: 1045,
        escalated: 89,
        abandoned: 100,
        averageDuration: 28.5,
        byHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(20 + Math.random() * 80)
        })),
        byDay: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          day,
          count: Math.floor(100 + Math.random() * 200)
        })),
        byOutcome: [
          { outcome: 'Resolved', count: 845, percentage: 68.5 },
          { outcome: 'Escalated', count: 89, percentage: 7.2 },
          { outcome: 'Referred', count: 200, percentage: 16.2 },
          { outcome: 'Abandoned', count: 100, percentage: 8.1 }
        ]
      },
      users: {
        total: 5432,
        new: 234,
        returning: 5198,
        active: 1823,
        demographics: {
          ageGroups: [
            { group: '13-17', count: 543 },
            { group: '18-24', count: 1234 },
            { group: '25-34', count: 1876 },
            { group: '35-44', count: 1098 },
            { group: '45-54', count: 456 },
            { group: '55+', count: 225 }
          ],
          locations: [
            { location: 'United States', count: 3245 },
            { location: 'Canada', count: 876 },
            { location: 'United Kingdom', count: 543 },
            { location: 'Australia', count: 432 },
            { location: 'Other', count: 336 }
          ]
        }
      },
      volunteers: {
        total: 156,
        active: 42,
        performance: {
          topPerformers: [
            { id: 'VOL001', name: 'Sarah Johnson', score: 95, sessions: 245 },
            { id: 'VOL002', name: 'Michael Chen', score: 93, sessions: 512 },
            { id: 'VOL003', name: 'Emily Rodriguez', score: 91, sessions: 189 },
            { id: 'VOL004', name: 'David Williams', score: 89, sessions: 334 },
            { id: 'VOL005', name: 'Lisa Thompson', score: 87, sessions: 156 }
          ],
          averageRating: 4.6,
          averageResponseTime: 45
        }
      },
      crisis: {
        types: [
          { type: 'Anxiety', count: 456, percentage: 37 },
          { type: 'Depression', count: 345, percentage: 28 },
          { type: 'Suicidal Ideation', count: 123, percentage: 10 },
          { type: 'Trauma/PTSD', count: 98, percentage: 8 },
          { type: 'Relationship Issues', count: 87, percentage: 7 },
          { type: 'Substance Abuse', count: 65, percentage: 5 },
          { type: 'Other', count: 60, percentage: 5 }
        ],
        severityDistribution: [
          { severity: 'Low', count: 456 },
          { severity: 'Medium', count: 543 },
          { severity: 'High', count: 189 },
          { severity: 'Critical', count: 46 }
        ],
        resolutionTimes: [
          { range: '0-15 min', count: 234 },
          { range: '15-30 min', count: 456 },
          { range: '30-60 min', count: 345 },
          { range: '60+ min', count: 199 }
        ],
        trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(30 + Math.random() * 20)
        }))
      }
    };
    setAnalytics(mockAnalytics);
  }, [dateRange]);

  const handleExport = (format: string) => {
    // In production, this would generate and download the report
    alert(`Exporting analytics report in ${format.toUpperCase()} format...`);
  };

  const renderBarChart = (data: { label: string; value: number }[], color: string = 'blue') => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
      <div className="flex items-end space-x-2 h-48">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="relative w-full">
              <div
                className={`bg-${color}-500 rounded-t transition-all duration-300 hover:bg-${color}-600`}
                style={{ height: `${(item.value / maxValue) * 180}px` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {item.value}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">{item.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = (data: { label: string; value: number; color: string }[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -cumulativePercentage;
            cumulativePercentage += percentage;

            return (
              <circle
                key={idx}
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke={item.color}
                strokeWidth="20%"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive system analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          
          {/* Export Button */}
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export Report
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block">
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📊 Export as CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📄 Export as PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📈 Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-800">{analytics.sessions.total}</div>
          <div className="text-sm text-blue-600">Total Sessions</div>
          <div className="text-xs text-blue-500 mt-1">
            {((analytics.sessions.successful / analytics.sessions.total) * 100).toFixed(1)}% success rate
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-800">{analytics.users.active}</div>
          <div className="text-sm text-green-600">Active Users</div>
          <div className="text-xs text-green-500 mt-1">
            +{analytics.users.new} new this period
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-purple-800">{analytics.volunteers.active}</div>
          <div className="text-sm text-purple-600">Active Volunteers</div>
          <div className="text-xs text-purple-500 mt-1">
            {analytics.volunteers.performance.averageRating} avg rating
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-orange-800">{analytics.sessions.averageDuration}m</div>
          <div className="text-sm text-orange-600">Avg Duration</div>
          <div className="text-xs text-orange-500 mt-1">
            {analytics.volunteers.performance.averageResponseTime}s response time
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['sessions', 'crisis', 'volunteers', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedChart(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedChart === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Chart Content */}
      <div className="space-y-6">
        {selectedChart === 'sessions' && (
          <>
            {/* Sessions by Hour */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions by Hour</h3>
              <div className="overflow-x-auto">
                {renderBarChart(
                  analytics.sessions.byHour.map(h => ({ 
                    label: `${h.hour}:00`, 
                    value: h.count 
                  })).slice(0, 12),
                  'blue'
                )}
              </div>
            </div>

            {/* Sessions by Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Outcomes</h3>
                {renderPieChart(
                  analytics.sessions.byOutcome.map(o => ({
                    label: o.outcome,
                    value: o.count,
                    color: o.outcome === 'Resolved' ? '#10b981' :
                           o.outcome === 'Escalated' ? '#ef4444' :
                           o.outcome === 'Referred' ? '#3b82f6' : '#6b7280'
                  }))
                )}
                <div className="mt-4 space-y-2">
                  {analytics.sessions.byOutcome.map(outcome => (
                    <div key={outcome.outcome} className="flex justify-between text-sm">
                      <span className="text-gray-600">{outcome.outcome}</span>
                      <span className="font-medium">{outcome.count} ({outcome.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Distribution</h3>
                {renderBarChart(
                  analytics.sessions.byDay.map(d => ({ 
                    label: d.day, 
                    value: d.count 
                  })),
                  'green'
                )}
              </div>
            </div>
          </>
        )}

        {selectedChart === 'crisis' && (
          <>
            {/* Crisis Types */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crisis Types Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {analytics.crisis.types.map(type => (
                    <div key={type.type} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{type.type}</span>
                        <span className="font-medium">{type.count} ({type.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Severity Distribution</h4>
                  {renderBarChart(
                    analytics.crisis.severityDistribution.map(s => ({
                      label: s.severity,
                      value: s.count
                    })),
                    'red'
                  )}
                </div>
              </div>
            </div>

            {/* Crisis Trends */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Crisis Trend</h3>
              <div className="h-48">
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-500"
                    points={analytics.crisis.trends.map((t, i) => 
                      `${i * (800 / analytics.crisis.trends.length)},${200 - (t.count / Math.max(...analytics.crisis.trends.map(t => t.count)) * 180)}`
                    ).join(' ')}
                  />
                </svg>
              </div>
            </div>
          </>
        )}

        {selectedChart === 'volunteers' && (
          <>
            {/* Top Performers */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Volunteers</h3>
              <div className="space-y-3">
                {analytics.volunteers.performance.topPerformers.map((volunteer, idx) => (
                  <div key={volunteer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-yellow-500' :
                        idx === 1 ? 'bg-gray-400' :
                        idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{volunteer.name}</div>
                        <div className="text-sm text-gray-600">{volunteer.sessions} sessions completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{volunteer.score}</div>
                      <div className="text-xs text-gray-600">Performance Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteer Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.volunteers.performance.averageRating}
                </div>
                <div className="text-sm text-gray-600 mt-1">Average Rating</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {analytics.volunteers.performance.averageResponseTime}s
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {((analytics.volunteers.active / analytics.volunteers.total) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Active Rate</div>
              </div>
            </div>
          </>
        )}

        {selectedChart === 'users' && (
          <>
            {/* User Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
                {renderBarChart(
                  analytics.users.demographics.ageGroups.map(g => ({
                    label: g.group,
                    value: g.count
                  })),
                  'purple'
                )}
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <div className="space-y-2">
                  {analytics.users.demographics.locations.map(loc => (
                    <div key={loc.location} className="flex justify-between items-center">
                      <span className="text-gray-700">{loc.location}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(loc.count / analytics.users.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{loc.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Metrics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{analytics.users.total}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.users.new}</div>
                  <div className="text-sm text-gray-600">New Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{analytics.users.returning}</div>
                  <div className="text-sm text-gray-600">Returning Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{analytics.users.active}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}