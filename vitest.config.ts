import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/**', '.verify/**'],
    // Exercises are pure functions - no DOM needed.
    environment: 'node',
    // A hanging `await` in module 07 should fail, not freeze your terminal.
    testTimeout: 10_000,
    hookTimeout: 10_000,
    reporters: process.env['CI'] ? ['default', 'github-actions'] : ['default'],
  },
});
