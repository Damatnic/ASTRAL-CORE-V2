/**
 * ASTRAL_CORE 2.0 - Global Test Setup
 * Life-critical testing setup for mental health crisis intervention platform
 */

import '@testing-library/jest-dom';
import 'jest-environment-jsdom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
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
  })),
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 2 * 86400).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock WebSocket for real-time features
class MockWebSocket {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = WebSocket.CONNECTING;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send(data: string) {
    // Mock sending data
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
}

global.WebSocket = MockWebSocket as any;

// Mock Socket.IO client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connected: true,
    id: 'mock-socket-id',
  })),
}));

// Mock crypto for secure operations
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-1234567890'),
    randomBytes: jest.fn((size: number) => Buffer.alloc(size, 'test')),
    createHash: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(() => 'mock-hash'),
    })),
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
    },
  },
});

// Mock Intersection Observer for accessibility tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock ResizeObserver for responsive tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock geolocation for location-based features
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100,
        },
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock MediaQuery for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
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

// Mock local storage for session management
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  },
});

// Mock session storage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  },
});

// Mock TensorFlow.js for AI testing
jest.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: jest.fn(() => Promise.resolve({
    predict: jest.fn(() => ({
      dataSync: jest.fn(() => [0.1, 0.2, 0.3, 0.4]), // Mock prediction
    })),
  })),
  tensor: jest.fn(() => ({
    dispose: jest.fn(),
    dataSync: jest.fn(() => [0.5]),
  })),
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(),
    predict: jest.fn(),
  })),
  layers: {
    dense: jest.fn(),
    dropout: jest.fn(),
  },
}));

// Mock performance API for performance tests
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
});

// Crisis-specific test utilities
export const mockCrisisSession = {
  id: 'crisis-session-123',
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
    ipHash: 'mock-ip-hash',
    deviceFingerprint: 'mock-fingerprint',
    referralSource: 'direct',
    userAgent: 'test-agent',
  },
};

export const mockEmergencyContact = {
  id: 'emergency-contact-123',
  userId: 'user-123',
  name: 'Test Emergency Contact',
  phone: '+1-555-0123',
  email: 'emergency@example.com',
  relationship: 'family',
  isPrimary: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSafetyPlan = {
  id: 'safety-plan-123',
  userId: 'user-123',
  templateType: 'standard',
  version: 1,
  steps: {
    warningSignsStep: {
      personalSigns: ['feeling isolated', 'sleep changes'],
      completed: true,
    },
    copingStrategiesStep: {
      internalStrategies: ['deep breathing', 'meditation'],
      completed: true,
    },
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Setup test console to capture errors
const originalError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalError;
});

// Global test timeout for crisis scenarios
jest.setTimeout(30000);