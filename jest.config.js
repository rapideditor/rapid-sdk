module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/*.{js}', '!**/node_modules/**'],
  coverageDirectory: '<rootDir>/.coverage',
  transform: {
    '^.+\\.jsx?$': '<rootDir>/babel-jest-wrapper.js'
  },
  setupFilesAfterEnv: ['jest-extended'],
  verbose: true
};
