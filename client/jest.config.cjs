module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      { presets: ['@babel/preset-env', '@babel/preset-react'] },
    ],
  },
};
