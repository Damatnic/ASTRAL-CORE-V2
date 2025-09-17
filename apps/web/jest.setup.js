/**
 * ASTRAL_CORE 2.0 - Web App Test Setup
 * 
 * CRISIS-CRITICAL TESTING FOUNDATION
 * This file sets up the testing environment for the web application.
 * Every test could represent a life saved.
 */

// Import testing libraries
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock environment variables for testing
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_CRISIS_WEBSOCKET_URL: 'ws://localhost:3001',
  NEXT_PUBLIC_EMERGENCY_HOTLINE: '988',
  NEXT_PUBLIC_RESPONSE_TIME_TARGET: '200',
  NEXT_PUBLIC_ENCRYPTION_ENABLED: 'true',
  NEXT_PUBLIC_ANONYMITY_ENFORCED: 'true',
};

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver for responsive component tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock crypto API for encryption tests
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      generateKey: jest.fn().mockResolvedValue({
        type: 'secret',
        algorithm: { name: 'AES-GCM' }
      }),
      encrypt: jest.fn().mockImplementation(async (algorithm, key, data) => {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
        return new Uint8Array([...bytes].map(b => b ^ 0x42));
      }),
      decrypt: jest.fn().mockImplementation(async (algorithm, key, data) => {
        return new Uint8Array([...data].map(b => b ^ 0x42));
      }),
      importKey: jest.fn().mockResolvedValue({ type: 'secret' }),
      exportKey: jest.fn().mockResolvedValue(new Uint8Array(32)),
    }
  };
}

// Mock fetch for API testing
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  fetch.mockClear();
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Crisis-specific test utilities
global.createMockCrisisSession = () => ({
  id: 'test-session-' + Date.now(),
  userId: 'anonymous-user-' + Math.random().toString(36).substr(2, 9),
  severity: 'HIGH',
  responseTime: 150,
  encrypted: true,
  anonymous: true,
  startedAt: new Date().toISOString(),
});

global.createMockVolunteer = (overrides = {}) => ({
  id: 'volunteer-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Volunteer',
  status: 'AVAILABLE',
  specializations: ['crisis', 'anxiety', 'depression'],
  responseTime: 45,
  rating: 4.8,
  sessionsCompleted: 127,
  ...overrides,
});

global.createMockMessage = (content, sender = 'user') => ({
  id: 'msg-' + Date.now(),
  content,
  sender,
  timestamp: new Date().toISOString(),
  encrypted: true,
  delivered: true,
  read: false,
});

// Performance monitoring for tests
global.measureTestPerformance = async (name, fn) => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (duration > 200) {
    console.warn(`⚠️ Performance Warning: ${name} took ${duration.toFixed(2)}ms (target: <200ms)`);
  }
  
  return { result, duration };
};

// Accessibility testing helpers
global.checkAccessibility = (container) => {
  const issues = [];
  
  // Check for alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });
  
  // Check for aria labels on buttons
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.textContent && !button.getAttribute('aria-label')) {
      issues.push('Button missing accessible label');
    }
  });
  
  // Check for form labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const label = container.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      issues.push(`Form element missing label: ${input.name || input.type}`);
    }
  });
  
  return issues;
};

// Crisis scenario test helpers
global.simulateCrisisFlow = async () => {
  const session = global.createMockCrisisSession();
  const volunteer = global.createMockVolunteer();
  const messages = [
    global.createMockMessage('I need help', 'user'),
    global.createMockMessage('I\'m here to help. You\'re safe.', 'volunteer'),
  ];
  
  return {
    session,
    volunteer,
    messages,
    escalate: jest.fn(),
    endSession: jest.fn(),
  };
};

// Socket.io mock for real-time testing
global.mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => global.mockSocket),
}));

console.log('🏥 ASTRAL_CORE 2.0 Web App Test Environment Ready');
console.log('💝 Testing crisis intervention web interface');
console.log('🎯 Targets: <200ms response, AAA accessibility, 100% anonymity');