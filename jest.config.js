module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/background.ts', // Integration code - requires complex Chrome API mocking
    '!src/content.ts', // Integration code - requires DOM mocking
    '!src/popup.tsx', // UI code - requires complex React/DOM mocking
    '!src/popup-legacy.tsx', // Legacy UI backup - not actively used
    // '!src/components/**', // UI components - now testing PromptCard
    '!src/lib/**', // Component utilities - covered by component E2E tests
    '!src/styles/**', // CSS files - not applicable for Jest coverage
    '!src/types/**', // Type definitions only
    '!src/utils/logger.ts', // Complex logging utility - will test on dev branch
    '!src/utils/queueProcessor.ts', // Complex queue processor - will test on dev branch
    '!src/utils/promptActions.ts', // Complex action handler - will test on dev branch
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
