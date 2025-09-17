'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'access' | 'modification' | 'deletion' | 'security' | 'system' | 'clinical';
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  hipaaRelevant: boolean;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export default function AuditLogViewer() {
  const { socket } = useAdminStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | AuditLog['category']>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | AuditLog['severity']>('all');
  const [showHipaaOnly, setShowHipaaOnly] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: 'LOG001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        userId: 'USR002',
        userName: 'Sarah Johnson',
        userRole: 'counselor',
        action: 'Accessed patient record',
        category: 'access',
        resource: 'Patient Record',
        resourceId: 'PAT123',
        details: 'Viewed patient mental health assessment for crisis session',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120.0',
        location: 'New York, NY',
        severity: 'info',
        hipaaRelevant: true,
        sessionId: 'SES456',
        metadata: {
          patientId: 'PAT123',
          accessReason: 'Active crisis session',
          dataViewed: ['assessment', 'history', 'medications']
        }
      },
      {
        id: 'LOG002',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        userId: 'USR001',
        userName: 'System Administrator',
        userRole: 'admin',
        action: 'Modified user permissions',
        category: 'modification',
        resource: 'User Account',
        resourceId: 'USR003',
        details: 'Updated volunteer permissions to include crisis session management',
        ipAddress: '10.0.0.1',
        userAgent: 'Firefox/121.0',
        location: 'Los Angeles, CA',
        severity: 'warning',
        hipaaRelevant: false,
        metadata: {
          permissionsAdded: ['sessions.manage'],
          permissionsRemoved: [],
          approvedBy: 'USR001'
        }
      },
      {
        id: 'LOG003',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        userId: 'USR003',
        userName: 'Michael Chen',
        userRole: 'volunteer',
        action: 'Emergency escalation initiated',
        category: 'clinical',
        resource: 'Crisis Session',
        resourceId: 'SES789',
        details: 'Escalated session due to immediate suicide risk',
        ipAddress: '172.16.0.50',
        userAgent: 'Safari/17.0',
        location: 'Chicago, IL',
        severity: 'critical',
        hipaaRelevant: true,
        sessionId: 'SES789',
        metadata: {
          escalationLevel: 3,
          reason: 'Immediate suicide risk with plan',
          notifiedParties: ['emergency_services', 'clinical_supervisor']
        }
      },
      {
        id: 'LOG004',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        userId: 'SYSTEM',
        userName: 'System',
        userRole: 'system',
        action: 'Automatic backup completed',
        category: 'system',
        resource: 'Database',
        details: 'Nightly database backup completed successfully',
        ipAddress: 'localhost',
        userAgent: 'System Process',
        severity: 'info',
        hipaaRelevant: true,
        metadata: {
          backupSize: '2.3GB',
          duration: '5m 23s',
          encrypted: true,
          storageLocation: 'secure-backup-s3'
        }
      },
      {
        id: 'LOG005',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        userId: 'USR004',
        userName: 'John Doe',
        userRole: 'user',
        action: 'Failed login attempt',
        category: 'security',
        resource: 'Authentication',
        details: 'Multiple failed login attempts detected',
        ipAddress: '203.0.113.42',
        userAgent: 'Chrome/119.0',
        location: 'Unknown',
        severity: 'warning',
        hipaaRelevant: false,
        metadata: {
          attemptCount: 3,
          accountLocked: false,
          suspiciousActivity: true
        }
      },
      {
        id: 'LOG006',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: 'USR002',
        userName: 'Sarah Johnson',
        userRole: 'counselor',
        action: 'Exported patient data',
        category: 'access',
        resource: 'Patient Records',
        details: 'Exported session transcripts for clinical review',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120.0',
        location: 'New York, NY',
        severity: 'warning',
        hipaaRelevant: true,
        metadata: {
          recordCount: 5,
          exportFormat: 'PDF',
          encryptionApplied: true,
          approvalId: 'APR234'
        }
      },
      {
        id: 'LOG007',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        userId: 'USR001',
        userName: 'System Administrator',
        userRole: 'admin',
        action: 'Deleted inactive user account',
        category: 'deletion',
        resource: 'User Account',
        resourceId: 'USR999',
        details: 'Removed account due to 180 days of inactivity per policy',
        ipAddress: '10.0.0.1',
        userAgent: 'Firefox/121.0',
        location: 'Los Angeles, CA',
        severity: 'warning',
        hipaaRelevant: true,
        metadata: {
          reason: 'Inactivity policy',
          dataRetention: 'Archived for 7 years',
          approvalTicket: 'TKT567'
        }
      },
      {
        id: 'LOG008',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        userId: 'USR003',
        userName: 'Michael Chen',
        userRole: 'volunteer',
        action: 'Updated patient notes',
        category: 'modification',
        resource: 'Session Notes',
        resourceId: 'NOTE456',
        details: 'Added post-session observations and recommendations',
        ipAddress: '172.16.0.50',
        userAgent: 'Safari/17.0',
        location: 'Chicago, IL',
        severity: 'info',
        hipaaRelevant: true,
        sessionId: 'SES456',
        metadata: {
          changeType: 'addition',
          charactersAdded: 245,
          reviewRequired: true
        }
      }
    ];

    // Generate more logs for demonstration
    for (let i = 9; i <= 50; i++) {
      mockLogs.push({
        id: `LOG${i.toString().padStart(3, '0')}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        userId: `USR00${(i % 5) + 1}`,
        userName: ['Sarah Johnson', 'System Administrator', 'Michael Chen', 'John Doe', 'Emily Rodriguez'][i % 5],
        userRole: ['counselor', 'admin', 'volunteer', 'user', 'volunteer'][i % 5],
        action: [
          'Viewed patient record',
          'Modified settings',
          'Started session',
          'Logged in',
          'Updated profile'
        ][i % 5],
        category: ['access', 'modification', 'clinical', 'security', 'system'][i % 5] as AuditLog['category'],
        resource: ['Patient Record', 'Settings', 'Session', 'Authentication', 'Profile'][i % 5],
        details: `Routine ${['access', 'modification', 'clinical', 'security', 'system'][i % 5]} activity`,
        ipAddress: `192.168.${i % 255}.${(i * 2) % 255}`,
        userAgent: 'Chrome/120.0',
        severity: i % 10 === 0 ? 'warning' : 'info',
        hipaaRelevant: i % 3 === 0
      });
    }

    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // User filter
    if (userFilter) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(userFilter.toLowerCase()) ||
        log.userId.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === filterSeverity);
    }

    // HIPAA filter
    if (showHipaaOnly) {
      filtered = filtered.filter(log => log.hipaaRelevant);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, dateRange, searchTerm, userFilter, filterCategory, filterSeverity, showHipaaOnly]);

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getSeverityColor = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'error': return 'text-orange-700 bg-orange-100';
      case 'warning': return 'text-yellow-700 bg-yellow-100';
      case 'info': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: AuditLog['category']) => {
    switch (category) {
      case 'access': return '👁️';
      case 'modification': return '✏️';
      case 'deletion': return '🗑️';
      case 'security': return '🔒';
      case 'system': return '⚙️';
      case 'clinical': return '🏥';
      default: return '📋';
    }
  };

  const exportLogs = (format: 'csv' | 'json') => {
    const dataToExport = showHipaaOnly 
      ? filteredLogs.filter(log => log.hipaaRelevant)
      : filteredLogs;

    if (format === 'csv') {
      const headers = ['Timestamp', 'User', 'Role', 'Action', 'Category', 'Resource', 'Details', 'IP Address', 'Severity', 'HIPAA Relevant'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(log => [
          new Date(log.timestamp).toISOString(),
          log.userName,
          log.userRole,
          `"${log.action}"`,
          log.category,
          log.resource,
          `"${log.details}"`,
          log.ipAddress,
          log.severity,
          log.hipaaRelevant ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log Viewer</h2>
          <p className="text-sm text-gray-600 mt-1">HIPAA-compliant system audit trail</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showHipaaOnly}
              onChange={(e) => setShowHipaaOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">HIPAA Only</span>
          </label>
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export Logs
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block">
              <button
                onClick={() => exportLogs('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📊 Export as CSV
              </button>
              <button
                onClick={() => exportLogs('json')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                📄 Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          placeholder="Filter by user..."
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="access">Access</option>
          <option value="modification">Modification</option>
          <option value="deletion">Deletion</option>
          <option value="security">Security</option>
          <option value="system">System</option>
          <option value="clinical">Clinical</option>
        </select>
        
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="flex items-center space-x-4 mb-6">
        <label className="text-sm text-gray-700">Date Range:</label>
        <input
          type="datetime-local"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="datetime-local"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setDateRange({ start: '', end: '' })}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HIPAA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                    <div className="text-xs text-gray-500">{log.userRole}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{log.action}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg mr-1">{getCategoryIcon(log.category)}</span>
                  <span className="text-sm text-gray-600">{log.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.resource}</div>
                  {log.resourceId && (
                    <div className="text-xs text-gray-500">{log.resourceId}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.hipaaRelevant && (
                    <span className="text-green-600" title="HIPAA Relevant">🔒</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          {[...Array(Math.min(5, totalPages))].map((_, idx) => {
            const pageNum = currentPage - 2 + idx;
            if (pageNum > 0 && pageNum <= totalPages) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Log ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.userName} ({selectedLog.userRole})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Action</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Details</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedLog.details}
                  </p>
                </div>

                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Additional Metadata</label>
                    <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                    {selectedLog.severity.toUpperCase()}
                  </span>
                  {selectedLog.hipaaRelevant && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      🔒 HIPAA Relevant
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
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