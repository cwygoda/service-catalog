import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
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
      $lib: resolve(__dirname, 'src/lib'),
      '$app/environment': resolve(__dirname, 'src/lib/__mocks__/app-environment.ts'),
      '$app/state': resolve(__dirname, 'src/lib/__mocks__/app-state.ts'),
    },
  },
});
