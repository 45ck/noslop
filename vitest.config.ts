import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: process.env['CI'] ? ['verbose', 'junit'] : ['default'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/application/ports/**/*.ts',
        // CLI entry: integration-tested via process spawn, not unit tests
        'src/presentation/cli.ts',
        // Real I/O adapters: tested indirectly via in-memory counterparts
        'src/infrastructure/adapters/node-filesystem.ts',
        // Pack declarations: pure data, exercised by use-case tests
        'src/domain/packs/*.ts',
      ],
      thresholds: {
        // Global thresholds — high bar forces agents to write thorough tests
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
        // Per-layer gates — domain/application are strictest
        'src/domain/**': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
        'src/application/**': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
        'src/infrastructure/**': {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
        'src/presentation/**': {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
