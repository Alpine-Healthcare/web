module.exports = {
    presets: ['ts-jest'],
    testEnvironment: 'node',
      moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1' // Example if you use path aliases
      },
      transform: {
        '^.+\\.tsx?$': 'ts-jest', // Ensure ts-jest is configured for TypeScript
      },
}
