import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/acceptance/**/*.test.ts'],
    testTimeout: 300_000,
    hookTimeout: 300_000,
    coverage: { enabled: false },
    fileParallelism: false,
  },
});
