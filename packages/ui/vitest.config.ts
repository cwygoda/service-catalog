import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    globals: true,
    include: ['src/lib/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      '$app/environment': resolve(__dirname, 'src/lib/__mocks__/app-environment.ts'),
      '$app/state': resolve(__dirname, 'src/lib/__mocks__/app-state.ts'),
    },
  },
});
