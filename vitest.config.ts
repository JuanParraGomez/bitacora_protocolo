import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: [
      'tests/**/*.test.ts',
      'app/**/*.test.ts',
      'scripts/**/*.test.mjs',
    ],
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: false,
  },
});
