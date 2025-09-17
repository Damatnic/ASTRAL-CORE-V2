/**
 * ASTRAL_CORE 2.0 - Crisis-Specific Test Setup
 * Life-critical crisis intervention testing utilities
 */

import { CrisisSessionManager } from '@astralcore/crisis';

// Crisis test utilities
export const createMockCrisisSession = (overrides = {}) => ({
  id: 'crisis-session-test-123',
  type: 'anonymous_chat' as const,
  status: 'active' as const,
  severity: 'medium' as const,
  participants: [],
  startTime: new Date(),
  lastActivity: new Date(),
  messageCount: 0,
  riskFlags: [],
  emergencyEscalations: 0,
  encrypted: true,
  confidential: true,
  metadata: {
    ipHash: 'test-ip-hash',
    deviceFingerprint: 'test-fingerprint',
    referralSource: 'direct',
    userAgent: 'test-agent',
  },
  ...overrides,
});

export const createMockVolunteer = (overrides = {}) => ({
  id: 'volunteer-test-123',
  type: 'volunteer' as const,
  role: 'crisis_responder' as const,
  anonymous: false,
  encrypted: true,
  joinedAt: new Date(),
  lastActivity: new Date(),
  permissions: [
    'send_message',
    'view_history',
    'escalate_crisis',
    'request_supervisor',
  ],
  ...overrides,
});

export const createMockCrisisMessage = (overrides = {}) => ({
  id: 'message-test-123',
  sessionId: 'crisis-session-test-123',
  senderId: 'user-test-123',
  content: 'I need help with my anxiety',
  messageType: 'text' as const,
  riskLevel: 'low' as const,
  timestamp: new Date(),
  encrypted: true,
  validated: true,
  flagged: false,
  ...overrides,
});

// Crisis severity levels for testing
export const CRISIS_SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Crisis risk assessment keywords for testing
export const CRISIS_KEYWORDS = {
  LOW_RISK: ['stressed', 'worried', 'anxious', 'sad'],
  MEDIUM_RISK: ['depressed', 'hopeless', 'worthless', 'overwhelmed'],
  HIGH_RISK: ['suicide', 'self-harm', 'kill myself', 'end it all'],
  CRITICAL_RISK: ['gun', 'pills', 'bridge', 'tonight', 'goodbye'],
};

// Mock crisis detection responses
export const mockCrisisDetection = {
  lowRisk: {
    riskLevel: 'low',
    confidence: 0.2,
    triggers: ['stressed'],
    recommendations: ['breathing exercises', 'grounding techniques'],
  },
  mediumRisk: {
    riskLevel: 'medium',
    confidence: 0.6,
    triggers: ['depressed', 'hopeless'],
    recommendations: ['connect with counselor', 'safety planning'],
  },
  highRisk: {
    riskLevel: 'high',
    confidence: 0.85,
    triggers: ['suicide', 'self-harm'],
    recommendations: ['immediate intervention', 'emergency contact'],
  },
  criticalRisk: {
    riskLevel: 'critical',
    confidence: 0.95,
    triggers: ['gun', 'tonight'],
    recommendations: ['emergency services', 'crisis hotline'],
  },
};

// Performance benchmarks for crisis systems
export const CRISIS_PERFORMANCE_BENCHMARKS = {
  MESSAGE_PROCESSING_MS: 50,
  RISK_DETECTION_MS: 100,
  SESSION_CREATION_MS: 200,
  EMERGENCY_ESCALATION_MS: 500,
  VOLUNTEER_MATCHING_MS: 1000,
};

// Setup mock crisis session manager for tests
export const setupCrisisSessionManager = () => {
  const manager = new CrisisSessionManager({
    maxSessionDuration: 30 * 60 * 1000, // 30 minutes for tests
    autoEscalationThreshold: 2, // Lower threshold for testing
    encryptionRequired: false, // Disabled for testing
    anonymousSessionsAllowed: true,
    maxConcurrentSessions: 10,
  });

  return manager;
};

// Cleanup after crisis tests
export const cleanupCrisisTests = () => {
  // Reset any global crisis state
  jest.clearAllMocks();
  
  // Clear any test sessions
  if (global.testCrisisManager) {
    global.testCrisisManager.destroy();
    delete global.testCrisisManager;
  }
};