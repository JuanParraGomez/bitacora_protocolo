import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // The compatibility database is intentionally shared by browser scenarios;
  // serial execution prevents one scenario from overwriting another's index.
  workers: 1,
  timeout: 15_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3005',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
});
