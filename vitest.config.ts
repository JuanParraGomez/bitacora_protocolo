import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~/': `${process.cwd()}/`,
      'app/': `${process.cwd()}/app/`,
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    include: [
      'tests/**/*.test.ts',
      'app/**/*.test.ts',
      'scripts/**/*.test.mjs',
    ],
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: false,
  },
});
