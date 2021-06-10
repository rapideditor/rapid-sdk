module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/built/*.cjs.js', '!**/node_modules/**'],
  coverageDirectory: '<rootDir>/.coverage',
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: [
    "**/tests/**/*.test.(ts|js)"
  ],
  setupFilesAfterEnv: ['jest-extended'],
  verbose: true
};
