module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
