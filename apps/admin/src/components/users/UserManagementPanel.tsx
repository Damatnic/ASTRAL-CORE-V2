'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../providers/AdminProvider';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'counselor' | 'volunteer' | 'user';
  status: 'active' | 'suspended' | 'pending' | 'deactivated';
  createdAt: Date;
  lastActive: Date;
  sessions: number;
  flags: {
    type: 'warning' | 'violation' | 'praise';
    message: string;
    date: Date;
  }[];
  permissions: string[];
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  riskScore: number;
  notes: string;
}

interface UserActivity {
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export default function UserManagementPanel() {
  const { socket } = useAdminStore();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 'USR001',
        email: 'admin@example.com',
        name: 'System Administrator',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastActive: new Date(),
        sessions: 0,
        flags: [],
        permissions: ['all'],
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: true,
        riskScore: 0,
        notes: 'Primary system administrator'
      },
      {
        id: 'USR002',
        email: 'sarah.counselor@example.com',
        name: 'Sarah Johnson',
        role: 'counselor',
        status: 'active',
        createdAt: new Date('2024-02-15'),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sessions: 245,
        flags: [
          { type: 'praise', message: 'Excellent crisis management', date: new Date('2024-12-01') }
        ],
        permissions: ['sessions.manage', 'users.view', 'reports.view'],
        twoFactorEnabled: true,
        emailVerified: true,
        phoneVerified: true,
        riskScore: 0,
        notes: 'Senior crisis counselor, specializes in trauma'
      },
      {
        id: 'USR003',
        email: 'michael.volunteer@example.com',
        name: 'Michael Chen',
        role: 'volunteer',
        status: 'active',
        createdAt: new Date('2024-03-20'),
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        sessions: 512,
        flags: [],
        permissions: ['sessions.view', 'sessions.participate'],
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 5,
        notes: 'Experienced volunteer, available weekday evenings'
      },
      {
        id: 'USR004',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-06-10'),
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
        sessions: 8,
        flags: [],
        permissions: ['profile.edit', 'sessions.create'],
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 15,
        notes: 'Regular user, multiple sessions'
      },
      {
        id: 'USR005',
        email: 'suspicious.user@example.com',
        name: 'Suspicious Account',
        role: 'user',
        status: 'suspended',
        createdAt: new Date('2024-11-01'),
        lastActive: new Date('2024-11-15'),
        sessions: 2,
        flags: [
          { type: 'warning', message: 'Inappropriate behavior reported', date: new Date('2024-11-14') },
          { type: 'violation', message: 'Terms of service violation', date: new Date('2024-11-15') }
        ],
        permissions: [],
        twoFactorEnabled: false,
        emailVerified: false,
        phoneVerified: false,
        riskScore: 85,
        notes: 'Account suspended due to policy violations'
      },
      {
        id: 'USR006',
        email: 'pending.volunteer@example.com',
        name: 'Emily Rodriguez',
        role: 'volunteer',
        status: 'pending',
        createdAt: new Date('2024-12-01'),
        lastActive: new Date('2024-12-01'),
        sessions: 0,
        flags: [],
        permissions: [],
        twoFactorEnabled: false,
        emailVerified: true,
        phoneVerified: false,
        riskScore: 10,
        notes: 'Pending background check and training completion'
      }
    ];

    const mockActivities: UserActivity[] = [
      {
        userId: 'USR002',
        action: 'Started crisis session',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120.0',
        location: 'New York, NY'
      },
      {
        userId: 'USR003',
        action: 'Logged in',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        ipAddress: '10.0.0.50',
        userAgent: 'Firefox/121.0',
        location: 'Los Angeles, CA'
      },
      {
        userId: 'USR004',
        action: 'Updated profile',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '172.16.0.25',
        userAgent: 'Safari/17.0',
        location: 'Chicago, IL'
      }
    ];

    setUsers(mockUsers);
    setActivities(mockActivities);
  }, []);

  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: 'USR' + Date.now(),
      email: userData.email || '',
      name: userData.name || '',
      role: userData.role || 'user',
      status: 'pending',
      createdAt: new Date(),
      lastActive: new Date(),
      sessions: 0,
      flags: [],
      permissions: getDefaultPermissions(userData.role || 'user'),
      twoFactorEnabled: false,
      emailVerified: false,
      phoneVerified: false,
      riskScore: 0,
      notes: ''
    };

    setUsers(prev => [newUser, ...prev]);
    setShowCreateModal(false);
  };

  const getDefaultPermissions = (role: User['role']): string[] => {
    switch (role) {
      case 'admin': return ['all'];
      case 'counselor': return ['sessions.manage', 'users.view', 'reports.view'];
      case 'volunteer': return ['sessions.view', 'sessions.participate'];
      case 'user': return ['profile.edit', 'sessions.create'];
      default: return [];
    }
  };

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    if (action === 'delete') {
      if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: action === 'suspend' ? 'suspended' : 'active' }
          : u
      ));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    if (bulkAction === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
        return;
      }
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
    } else {
      setUsers(prev => prev.map(u => 
        selectedUsers.includes(u.id)
          ? { ...u, status: bulkAction === 'suspend' ? 'suspended' : 'active' }
          : u
      ));
    }

    setSelectedUsers([]);
    setBulkAction(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'counselor': return 'bg-blue-100 text-blue-800';
      case 'volunteer': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'deactivated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Create User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="counselor">Counselor</option>
          <option value="volunteer">Volunteer</option>
          <option value="user">User</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setBulkAction('activate');
                handleBulkAction();
              }}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={() => {
                setBulkAction('suspend');
                handleBulkAction();
              }}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Suspend
            </button>
            <button
              onClick={() => {
                setBulkAction('delete');
                handleBulkAction();
              }}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsers.map(u => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sessions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(prev => [...prev, user.id]);
                      } else {
                        setSelectedUsers(prev => prev.filter(id => id !== user.id));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.sessions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getRiskColor(user.riskScore)}`}>
                      {user.riskScore}%
                    </span>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          user.riskScore >= 70 ? 'bg-red-500' :
                          user.riskScore >= 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(user.riskScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {user.emailVerified && (
                      <span className="text-green-500" title="Email verified">✉️</span>
                    )}
                    {user.phoneVerified && (
                      <span className="text-green-500" title="Phone verified">📱</span>
                    )}
                    {user.twoFactorEnabled && (
                      <span className="text-blue-500" title="2FA enabled">🔐</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastActive).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleUserAction(user.id, 'suspend')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(user.id, 'activate')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleUserAction(user.id, 'delete')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID</span>
                      <span className="font-medium">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-medium">{new Date(selectedUser.lastActive).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Security & Verification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verified</span>
                      <span className={selectedUser.emailVerified ? 'text-green-600' : 'text-red-600'}>
                        {selectedUser.emailVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone Verified</span>
                      <span className={selectedUser.phoneVerified ? 'text-green-600' : 'text-red-600'}>
                        {selectedUser.phoneVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2FA Enabled</span>
                      <span className={selectedUser.twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}>
                        {selectedUser.twoFactorEnabled ? '✓ Yes' : '⚠ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Score</span>
                      <span className={`font-medium ${getRiskColor(selectedUser.riskScore)}`}>
                        {selectedUser.riskScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {selectedUser.flags.length > 0 && (
                  <div className="col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Flags & Warnings</h4>
                    <div className="space-y-2">
                      {selectedUser.flags.map((flag, idx) => (
                        <div key={idx} className={`p-2 rounded-lg ${
                          flag.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          flag.type === 'violation' ? 'bg-red-50 border border-red-200' :
                          'bg-green-50 border border-green-200'
                        }`}>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              {flag.type === 'warning' ? '⚠️' : flag.type === 'violation' ? '🚫' : '👍'} {flag.message}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(flag.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.notes && (
                  <div className="col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedUser.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'suspend');
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'activate');
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Activate User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New User</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateUser({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  role: formData.get('role') as User['role']
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="counselor">Counselor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}