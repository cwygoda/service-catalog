import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', '.svelte-kit/**', 'node_modules/**'],
    environment: 'jsdom',
    setupFiles: ['src/lib/vitest-setup.ts'],
  },
  resolve: {
    alias: {
      $lib: resolve(import.meta.dirname, 'src/lib'),
      '$app/environment': resolve(import.meta.dirname, 'src/lib/__mocks__/app-environment.ts'),
      '$app/state': resolve(import.meta.dirname, 'src/lib/__mocks__/app-state.ts'),
    },
  },
});
