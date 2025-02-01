module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "/node_modules/",   // Commonly ignored by default
    "/dist/",           // Example of skipping the `dist` directory
    "/build/",          // Example of skipping the `build` directory
  ],
};