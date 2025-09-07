import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 180000, // 3 minutes for long-running generation tests
    hookTimeout: 30000,  // 30 seconds for setup/teardown
  },
});