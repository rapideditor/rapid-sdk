module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/built/cjs/*.js', '!**/node_modules/**'],
  coverageDirectory: '<rootDir>/.coverage',
  transform: {
    "^.+\\.(ts|tsx)$": "./node_modules/ts-jest/preprocessor.js"
  },
  testMatch: [
    "**/tests/**/*.test.(ts|js)"
  ],
  setupFilesAfterEnv: ['jest-extended'],
  verbose: true
};