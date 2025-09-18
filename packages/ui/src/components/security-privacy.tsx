'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Input } from './base';
import { ScreenReaderOnly, LiveRegion } from './accessibility';
import { ToastNotification } from './notifications';
import { designTokens } from '../design-system';

// Security Types
interface EncryptionStatus {
  level: 'none' | 'basic' | 'enhanced' | 'military';
  protocol: string;
  keyStrength: number;
  isActive: boolean;
  lastUpdated: Date;
}

interface PrivacySettings {
  dataRetention: 'minimal' | 'standard' | 'extended';
  shareAnalytics: boolean;
  allowTracking: boolean;
  secureMode: boolean;
  anonymousMode: boolean;
  locationSharing: 'never' | 'emergency' | 'always';
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'access' | 'data_export' | 'permission_change' | 'suspicious_activity';
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  location?: string;
  ipAddress?: string;
}

interface DataHandlingIndicator {
  dataType: 'personal' | 'crisis' | 'medical' | 'location' | 'communication';
  encryptionLevel: 'basic' | 'enhanced' | 'military';
  retentionPeriod: string;
  accessLevel: 'restricted' | 'volunteer' | 'admin' | 'system';
  complianceStandards: string[];
}

// Encryption Status Indicator Component
interface EncryptionIndicatorProps {
  status: EncryptionStatus;
  className?: string;
}

export const EncryptionIndicator: React.FC<EncryptionIndicatorProps> = ({
  status,
  className = ''
}) => {
  const getEncryptionColor = (level: EncryptionStatus['level']) => {
    switch (level) {
      case 'none': return 'text-red-600 bg-red-50 border-red-200';
      case 'basic': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'enhanced': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'military': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEncryptionIcon = (level: EncryptionStatus['level']) => {
    switch (level) {
      case 'none': return '🔓';
      case 'basic': return '🔐';
      case 'enhanced': return '🔒';
      case 'military': return '🛡️';
      default: return '❓';
    }
  };

  const getEncryptionLabel = (level: EncryptionStatus['level']) => {
    switch (level) {
      case 'none': return 'No Encryption';
      case 'basic': return 'Basic Encryption';
      case 'enhanced': return 'Enhanced Encryption';
      case 'military': return 'Military-Grade';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getEncryptionColor(status.level)} ${className}`}>
      <span className="text-lg" role="img" aria-label={`${getEncryptionLabel(status.level)} status`}>
        {getEncryptionIcon(status.level)}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {getEncryptionLabel(status.level)}
        </span>
        <span className="text-xs opacity-75">
          {status.protocol} • {status.keyStrength}-bit
        </span>
      </div>
      <div className={`w-2 h-2 rounded-full ${status.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
    </div>
  );
};

// Secure Communication Interface Component
interface SecureCommunicationProps {
  recipientName: string;
  encryptionStatus: EncryptionStatus;
  onSendMessage: (message: string, priority: 'normal' | 'urgent' | 'emergency') => void;
  className?: string;
}

export const SecureCommunication: React.FC<SecureCommunicationProps> = ({
  recipientName,
  encryptionStatus,
  onSendMessage,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsEncrypting(true);
    
    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSendMessage(message, priority);
    setMessage('');
    setIsEncrypting(false);
  };

  const getPriorityColor = (p: typeof priority) => {
    switch (p) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-yellow-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
    }
  };

  return (
    <Card className={className}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Secure Communication
            </h3>
            <p className="text-sm text-gray-600">
              Encrypted message to {recipientName}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <EncryptionIndicator status={encryptionStatus} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityDetails(!showSecurityDetails)}
              className="text-xs"
            >
              Security Details
            </Button>
          </div>
        </div>
        
        {showSecurityDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Protocol:</span>
                <span className="ml-2 text-gray-600">{encryptionStatus.protocol}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Key Strength:</span>
                <span className="ml-2 text-gray-600">{encryptionStatus.keyStrength}-bit</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 ${encryptionStatus.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {encryptionStatus.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">
                  {encryptionStatus.lastUpdated.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Priority
          </label>
          <div className="flex space-x-2">
            {(['normal', 'urgent', 'emergency'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  priority === p 
                    ? getPriorityColor(p)
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Message Input */}
        <div>
          <label htmlFor="secure-message" className="block text-sm font-medium text-gray-700 mb-2">
            Encrypted Message
          </label>
          <textarea
            id="secure-message"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your secure message here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isEncrypting}
          />
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Messages are automatically encrypted using {encryptionStatus.protocol}</span>
            <span>{message.length}/2000</span>
          </div>
        </div>
        
        {/* Send Button */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setMessage('')}
            disabled={isEncrypting}
          >
            Clear
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isEncrypting}
            className="flex items-center space-x-2"
          >
            {isEncrypting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Encrypting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Send Encrypted</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Privacy Controls Component
interface PrivacyControlsProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
  className?: string;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  settings,
  onSettingsChange,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Privacy Controls</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage how your data is handled and shared
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Privacy Mode:</span>
            <Badge 
              variant={settings.secureMode ? 'success' : 'warning'}
              className="flex items-center space-x-1"
            >
              <span>{settings.secureMode ? '🔒' : '🔓'}</span>
              <span>{settings.secureMode ? 'Secure' : 'Standard'}</span>
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Primary Privacy Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Secure Mode</label>
              <p className="text-xs text-gray-600">Enhanced encryption and privacy protection</p>
            </div>
            <button
              onClick={() => updateSetting('secureMode', !settings.secureMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.secureMode ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.secureMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Anonymous Mode</label>
              <p className="text-xs text-gray-600">Hide identifying information when possible</p>
            </div>
            <button
              onClick={() => updateSetting('anonymousMode', !settings.anonymousMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.anonymousMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.anonymousMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {/* Data Retention */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Data Retention Policy
          </label>
          <div className="space-y-2">
            {(['minimal', 'standard', 'extended'] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="dataRetention"
                  value={option}
                  checked={settings.dataRetention === option}
                  onChange={() => updateSetting('dataRetention', option)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 capitalize">{option}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {option === 'minimal' && '(30 days)'}
                  {option === 'standard' && '(90 days)'}
                  {option === 'extended' && '(1 year)'}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Location Sharing */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Location Sharing
          </label>
          <div className="space-y-2">
            {(['never', 'emergency', 'always'] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="locationSharing"
                  value={option}
                  checked={settings.locationSharing === option}
                  onChange={() => updateSetting('locationSharing', option)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 capitalize">{option}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {option === 'never' && '(Maximum privacy)'}
                  {option === 'emergency' && '(Crisis situations only)'}
                  {option === 'always' && '(All interactions)'}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Advanced Settings Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-900">Advanced Privacy Settings</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Share Analytics</label>
                  <p className="text-xs text-gray-600">Help improve the platform with anonymous usage data</p>
                </div>
                <button
                  onClick={() => updateSetting('shareAnalytics', !settings.shareAnalytics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.shareAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.shareAnalytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Allow Tracking</label>
                  <p className="text-xs text-gray-600">Enable session tracking for support purposes</p>
                </div>
                <button
                  onClick={() => updateSetting('allowTracking', !settings.allowTracking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allowTracking ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allowTracking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Security Event Log Component
interface SecurityEventLogProps {
  events: SecurityEvent[];
  onResolveEvent: (eventId: string) => void;
  className?: string;
}

export const SecurityEventLog: React.FC<SecurityEventLogProps> = ({
  events,
  onResolveEvent,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');

  const filteredEvents = events.filter(event => {
    if (filter === 'unresolved') return !event.resolved;
    if (filter === 'critical') return event.severity === 'critical';
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    }
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security Event Log</h3>
            <p className="text-sm text-gray-600 mt-1">
              Monitor security events and suspicious activities
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="unresolved">Unresolved</option>
                <option value="critical">Critical Only</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">By Time</option>
                <option value="severity">By Severity</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {sortedEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No security events found</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div key={event.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-lg" role="img" aria-label={`${event.severity} severity`}>
                    {getSeverityIcon(event.severity)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={`text-xs ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500 capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">
                      {event.description}
                    </p>
                    
                    {(event.location || event.ipAddress) && (
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {event.location && (
                          <span>📍 {event.location}</span>
                        )}
                        {event.ipAddress && (
                          <span>🌐 {event.ipAddress}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {event.resolved ? (
                    <Badge variant="success" className="text-xs">
                      Resolved
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolveEvent(event.id)}
                      className="text-xs"
                    >
                      Mark Resolved
                    </Button>
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

// Data Handling Indicators Component
interface DataHandlingIndicatorsProps {
  indicators: DataHandlingIndicator[];
  className?: string;
}

export const DataHandlingIndicators: React.FC<DataHandlingIndicatorsProps> = ({
  indicators,
  className = ''
}) => {
  const getDataTypeIcon = (type: DataHandlingIndicator['dataType']) => {
    switch (type) {
      case 'personal': return '👤';
      case 'crisis': return '🚨';
      case 'medical': return '🏥';
      case 'location': return '📍';
      case 'communication': return '💬';
    }
  };

  const getEncryptionBadgeColor = (level: DataHandlingIndicator['encryptionLevel']) => {
    switch (level) {
      case 'basic': return 'bg-yellow-100 text-yellow-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'military': return 'bg-green-100 text-green-800';
    }
  };

  const getAccessLevelColor = (level: DataHandlingIndicator['accessLevel']) => {
    switch (level) {
      case 'restricted': return 'bg-red-100 text-red-800';
      case 'volunteer': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Data Protection Status</h3>
        <p className="text-sm text-gray-600 mt-1">
          Current data handling and encryption status for different data types
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {indicators.map((indicator, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg" role="img" aria-label={`${indicator.dataType} data`}>
                    {getDataTypeIcon(indicator.dataType)}
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {indicator.dataType} Data
                  </span>
                </div>
                
                <Badge className={`text-xs ${getEncryptionBadgeColor(indicator.encryptionLevel)}`}>
                  {indicator.encryptionLevel.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Retention:</span>
                  <span className="text-gray-900">{indicator.retentionPeriod}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Access Level:</span>
                  <Badge className={`text-xs ${getAccessLevelColor(indicator.accessLevel)}`}>
                    {indicator.accessLevel.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <span className="text-gray-600 text-xs">Compliance:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {indicator.complianceStandards.map((standard, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {standard}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Main Security Dashboard Component
interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  className = ''
}) => {
  // Mock data - would come from API
  const [encryptionStatus] = useState<EncryptionStatus>({
    level: 'enhanced',
    protocol: 'AES-256-GCM',
    keyStrength: 256,
    isActive: true,
    lastUpdated: new Date()
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataRetention: 'standard',
    shareAnalytics: false,
    allowTracking: false,
    secureMode: true,
    anonymousMode: false,
    locationSharing: 'emergency'
  });

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: 'evt-1',
      type: 'login',
      description: 'Successful login from new device',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: 'medium',
      resolved: false,
      location: 'New York, NY',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'evt-2',
      type: 'suspicious_activity',
      description: 'Multiple failed login attempts detected',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      severity: 'high',
      resolved: true,
      ipAddress: '203.0.113.45'
    },
    {
      id: 'evt-3',
      type: 'data_export',
      description: 'Crisis data exported for analysis',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      severity: 'low',
      resolved: true
    }
  ]);

  const [dataIndicators] = useState<DataHandlingIndicator[]>([
    {
      dataType: 'personal',
      encryptionLevel: 'enhanced',
      retentionPeriod: '90 days',
      accessLevel: 'restricted',
      complianceStandards: ['GDPR', 'HIPAA', 'SOC2']
    },
    {
      dataType: 'crisis',
      encryptionLevel: 'military',
      retentionPeriod: '1 year',
      accessLevel: 'volunteer',
      complianceStandards: ['HIPAA', 'SOC2', 'ISO27001']
    },
    {
      dataType: 'medical',
      encryptionLevel: 'military',
      retentionPeriod: '7 years',
      accessLevel: 'restricted',
      complianceStandards: ['HIPAA', 'FDA', 'ISO27001']
    },
    {
      dataType: 'location',
      encryptionLevel: 'enhanced',
      retentionPeriod: '30 days',
      accessLevel: 'system',
      complianceStandards: ['GDPR', 'CCPA']
    }
  ]);

  const handleSendMessage = (message: string, priority: 'normal' | 'urgent' | 'emergency') => {
    console.log('Sending encrypted message:', { message, priority });
    // Implementation would handle secure message sending
  };

  const handleResolveEvent = (eventId: string) => {
    console.log('Resolving security event:', eventId);
    // Implementation would mark event as resolved
  };

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Security and Privacy Dashboard">
      <ScreenReaderOnly>
        <h1>Security and Privacy Management Dashboard</h1>
      </ScreenReaderOnly>
      
      <LiveRegion>
        Security dashboard loaded with current encryption and privacy status
      </LiveRegion>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security & Privacy</h1>
          <p className="text-gray-600">Manage encryption, privacy settings, and security monitoring</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <EncryptionIndicator status={encryptionStatus} />
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Security Audit</span>
          </Button>
        </div>
      </div>

      {/* Main Security Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Secure Communication */}
        <SecureCommunication
          recipientName="Crisis Coordinator"
          encryptionStatus={encryptionStatus}
          onSendMessage={handleSendMessage}
        />
        
        {/* Privacy Controls */}
        <PrivacyControls
          settings={privacySettings}
          onSettingsChange={setPrivacySettings}
        />
      </div>

      {/* Data Protection Status */}
      <DataHandlingIndicators indicators={dataIndicators} />

      {/* Security Event Log */}
      <SecurityEventLog
        events={securityEvents}
        onResolveEvent={handleResolveEvent}
      />
    </div>
  );
};

export default SecurityDashboard;