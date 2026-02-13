import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**', 'src/adapters/**', 'src/shared/**'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
      thresholds: {
        'src/core/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@adapters': resolve(__dirname, 'src/adapters'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
});
