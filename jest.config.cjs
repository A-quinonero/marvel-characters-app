// jest.config.cjs
const nextJest = require("next/jest");

const createJestConfig = nextJest({ 
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./" 
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  
  // Test environment
  testEnvironment: "jest-environment-jsdom",
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    // Handle image imports
    "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  
  // Roots for test files
  roots: ["<rootDir>/src"],
  
  // Test match patterns
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)", 
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  
  // Transform files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  
  // Coverage collection
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.tsx",
    "!src/app/**", // Exclude Next.js app directory files
    "!src/**/*.stories.{js,jsx,ts,tsx}",
  ],
  
  // Module directories
  modulePaths: ["<rootDir>/"],
  
  // Test timeout
  testTimeout: 10000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);