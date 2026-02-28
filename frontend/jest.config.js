export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: ['**/src/**/*.test.js?(x)'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  transform: {
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    '^.+\\.(css|less|scss|sass)$': 'babel-jest',
  },
  
  // Don't transform node_modules except for specific packages
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@babel)/)',
  ],
  
  moduleNameMapper: {
    '^axios$': 'axios',
    '\\.(css|less|scss|sass)$': '<rootDir>/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/mocks/fileMock.js'
  }
};
