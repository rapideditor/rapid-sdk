module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/*.{js}', '!**/node_modules/**'],
  coverageDirectory: '.coverage',
  roots: ['packages/']
};
