module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/worker/**/*.test.js', '**/worker/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'babel-jest',
  },
};
