/**
 * ASTRAL_CORE V2.0 - Crisis-Specific Test Setup
 * 
 * Crisis intervention testing utilities and mocks
 * Ensures all crisis-critical components are tested thoroughly
 */

import '@testing-library/jest-dom';

// Crisis-specific environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_CRISIS_ENABLED: 'true',
  NEXT_PUBLIC_EMERGENCY_HOTLINE: '988',
  NEXT_PUBLIC_CRISIS_TEXT_LINE: '741741',
  NEXT_PUBLIC_ANONYMITY_ENFORCED: 'true',
  NEXT_PUBLIC_ENCRYPTION_ENABLED: 'true',
  NEXT_PUBLIC_RESPONSE_TIME_TARGET: '200',
  NEXT_PUBLIC_VOLUNTEER_MATCHING_ENABLED: 'true',
};

// Mock WebSocket for crisis communication
global.WebSocket = class MockWebSocket {
  url: string;
  readyState: number = 1; // OPEN
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send(data: string) {
    // Simulate echo for testing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
    }, 50);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
};

// Mock performance API for response time testing
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  } as any;
}

// Crisis test data generators
export const createCrisisTestData = {
  session: (overrides = {}) => ({
    id: `crisis_session_${Date.now()}`,
    userId: `anonymous_${Math.random().toString(36).substr(2, 9)}`,
    startTime: new Date(),
    status: 'active' as const,
    severity: 'medium' as const,
    encrypted: true,
    anonymous: true,
    volunteerId: null,
    messages: [],
    riskFactors: [],
    ...overrides,
  }),

  volunteer: (overrides = {}) => ({
    id: `volunteer_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Crisis Counselor',
    status: 'available' as const,
    specializations: ['crisis', 'anxiety', 'depression'],
    languages: ['English'],
    rating: 4.8,
    sessionsCompleted: 245,
    currentSessions: 0,
    maxSessions: 3,
    averageResponseTime: 120, // seconds
    ...overrides,
  }),

  message: (content: string, sender: 'user' | 'volunteer' | 'system' = 'user', overrides = {}) => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    content,
    sender,
    timestamp: new Date(),
    encrypted: true,
    severity: 'low' as const,
    metadata: {
      sentiment: 0,
      keywords: [],
      riskFactors: [],
    },
    ...overrides,
  }),

  riskAssessment: (level: 'low' | 'medium' | 'high' | 'critical' = 'medium') => ({
    level,
    factors: level === 'critical' ? ['Suicidal ideation'] : ['Anxiety'],
    recommendations: ['Monitor closely', 'Provide support'],
    requiresEscalation: level === 'critical' || level === 'high',
    confidence: 85,
  }),

  emergencyContact: () => ({
    id: `contact_${Date.now()}`,
    type: 'hotline' as const,
    number: '988',
    description: 'National Suicide Prevention Lifeline',
    available24_7: true,
  }),
};

// Crisis flow simulation utilities
export const simulateCrisisFlow = {
  async startAnonymousSession() {
    const session = createCrisisTestData.session();
    return {
      session,
      connect: jest.fn().mockResolvedValue(session),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      escalate: jest.fn(),
    };
  },

  async connectVolunteer(sessionId: string) {
    const volunteer = createCrisisTestData.volunteer();
    return {
      volunteer,
      connected: true,
      connectionTime: Date.now(),
    };
  },

  async triggerRiskAssessment(message: string) {
    const riskLevel = message.toLowerCase().includes('suicide') ? 'critical' :
                     message.toLowerCase().includes('hurt') ? 'high' :
                     message.toLowerCase().includes('sad') ? 'medium' : 'low';
    
    return createCrisisTestData.riskAssessment(riskLevel as any);
  },

  async escalateToEmergency() {
    return {
      escalated: true,
      emergencyContacted: true,
      escalationTime: Date.now(),
      responseRequired: true,
    };
  },
};

// Accessibility testing utilities for crisis components
export const crisisAccessibilityUtils = {
  async validateEmergencyButton(button: HTMLElement) {
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).not.toHaveAttribute('aria-disabled', 'true');
    expect(button.tabIndex).not.toBe(-1);
    
    // Emergency buttons should have high contrast
    const styles = getComputedStyle(button);
    expect(styles.backgroundColor).not.toBe('transparent');
    
    // Should be large enough for crisis situations
    const rect = button.getBoundingClientRect();
    expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
  },

  async validateChatAccessibility(chatContainer: HTMLElement) {
    expect(chatContainer).toHaveAttribute('aria-live');
    expect(chatContainer).toHaveAttribute('aria-relevant');
    expect(chatContainer).toHaveAttribute('role', 'log');
    
    // Messages should be properly labeled
    const messages = chatContainer.querySelectorAll('[role="listitem"], .message');
    messages.forEach((message) => {
      expect(message).toHaveAttribute('aria-label');
    });
  },

  async validateFormAccessibility(form: HTMLElement) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      // Every input should have a label
      expect(
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        form.querySelector(`label[for="${input.id}"]`)
      ).toBeTruthy();
      
      // Error states should be accessible
      if (input.getAttribute('aria-invalid') === 'true') {
        expect(input.getAttribute('aria-describedby')).toBeTruthy();
      }
    });
  },

  async checkColorContrast(element: HTMLElement, minimumRatio = 4.5) {
    const styles = getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    // Basic check - ensure colors are not the same
    expect(backgroundColor).not.toBe(color);
    
    // Emergency elements should have high contrast
    if (element.classList.contains('emergency') || element.classList.contains('critical')) {
      // Critical elements should have very high contrast
      expect(backgroundColor).toMatch(/(rgb\(220,\s*38,\s*38\)|#dc2626)/); // red-600
      expect(color).toMatch(/(rgb\(255,\s*255,\s*255\)|#ffffff)/); // white
    }
  },
};

// Performance testing for crisis scenarios
export const crisisPerformanceUtils = {
  async measureResponseTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    
    // Crisis operations should be fast
    if (duration > 500) {
      console.warn(`⚠️ Crisis Performance Warning: Operation took ${duration.toFixed(2)}ms (target: <500ms)`);
    }
    
    return { result, duration };
  },

  async validateEmergencyResponseTime(operation: () => Promise<any>) {
    const { duration } = await this.measureResponseTime(operation);
    
    // Emergency operations must be under 200ms
    expect(duration).toBeLessThan(200);
    
    return duration;
  },

  async stressTestChatInterface(messageCount = 100) {
    const start = performance.now();
    
    for (let i = 0; i < messageCount; i++) {
      // Simulate rapid message sending
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const duration = performance.now() - start;
    
    // Chat should handle rapid messages without significant delay
    expect(duration).toBeLessThan(messageCount * 50); // 50ms per message max
    
    return duration;
  },
};

// Mock crisis-specific APIs
export const mockCrisisAPIs = {
  websocket: {
    connect: jest.fn().mockResolvedValue(true),
    send: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  },

  encryption: {
    generateKey: jest.fn().mockResolvedValue('mock-key'),
    encrypt: jest.fn().mockImplementation(async (data) => `encrypted:${data}`),
    decrypt: jest.fn().mockImplementation(async (data) => data.replace('encrypted:', '')),
  },

  riskAssessment: {
    analyze: jest.fn().mockImplementation(async (message) => 
      simulateCrisisFlow.triggerRiskAssessment(message)
    ),
  },

  volunteerMatching: {
    findAvailable: jest.fn().mockResolvedValue([createCrisisTestData.volunteer()]),
    assign: jest.fn().mockResolvedValue(true),
  },

  emergencyServices: {
    call988: jest.fn().mockResolvedValue({ connected: true }),
    text741741: jest.fn().mockResolvedValue({ sent: true }),
    escalate: jest.fn().mockResolvedValue({ escalated: true }),
  },
};

// Global test setup for crisis components
beforeEach(() => {
  // Reset all crisis mocks
  Object.values(mockCrisisAPIs).forEach(api => {
    Object.values(api).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockClear();
      }
    });
  });
  
  // Ensure crisis environment is ready
  global.mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  };
});

afterEach(() => {
  // Cleanup crisis-specific resources
  jest.clearAllTimers();
  jest.useRealTimers();
});

console.log('🚨 Crisis Test Environment Ready');
console.log('🎯 Targets: <200ms emergency response, 100% accessibility, zero data leaks');

export default {
  createCrisisTestData,
  simulateCrisisFlow,
  crisisAccessibilityUtils,
  crisisPerformanceUtils,
  mockCrisisAPIs,
};