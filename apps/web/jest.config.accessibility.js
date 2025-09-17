/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Phase 4: UI Accessibility Tests',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/jest.setup.ts'],
  testMatch: [
    '<rootDir>/tests/phase4-*.test.tsx',
  ],
  coverageDirectory: '<rootDir>/coverage/accessibility',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};