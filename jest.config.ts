import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "node",
      preset: "ts-jest",
      testEnvironment: "node",
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      testMatch: ["**/__tests__/**/*.test.ts"],
    },
    {
      displayName: "jsdom",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      testMatch: ["**/__tests__/**/*.test.tsx"],
      setupFilesAfterEnv: ["@testing-library/jest-dom"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
      },
    },
  ],
};

export default config;
