/**
 * Jest test setup for AI Therapy package
 */

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now())
} as any;

// Mock console to reduce noise in tests
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Setup test environment
beforeAll(() => {
  // Initialize any global test setup
});

afterAll(() => {
  // Cleanup global test resources
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Type definitions for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}