import { defineConfig } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration for API Test Automation Suite
 * Target SUT: ParaBank REST API (Parasoft)
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: path.join(__dirname, 'tests'),
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  /* Run tests sequentially to avoid state collision against demo bank */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.API_BASE_URL || 'https://parabank.parasoft.com/parabank/services/bank',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
});
