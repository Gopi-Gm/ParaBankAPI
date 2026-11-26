import { test as base, expect } from '@playwright/test';
import { AccountsApi } from '../api/services/AccountsApi';
import { AdminApi } from '../api/services/AdminApi';
import { CustomersApi } from '../api/services/CustomersApi';
import { TransactionsApi } from '../api/services/TransactionsApi';

/**
 * Resolves the post-test pacing delay in milliseconds.
 * Skips pacing for local ParaBank instances unless API_PACING_MS is explicitly set.
 */
function getPacingDelayMs(): number {
  const configured = process.env.API_PACING_MS;
  if (configured !== undefined && configured !== '') {
    const parsed = Number(configured);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  const baseUrl = process.env.API_BASE_URL || '';
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    return 0;
  }

  return process.env.CI ? 2000 : 1200;
}

type ApiFixtures = {
  pacing: void;
  accountsApi: AccountsApi;
  customersApi: CustomersApi;
  transactionsApi: TransactionsApi;
  adminApi: AdminApi;
};

/**
 * Custom Playwright test fixture that enforces automatic request pacing
 * and exposes typed ParaBank API service clients.
 * Public shared demo servers (like ParaBank on Parasoft) are protected by Cloudflare WAF
 * with strict burst rate limiting (Cloudflare Error 1015 / HTTP 429).
 * This fixture adds an automatic delay after each test to maintain a smooth, sustainable request rate.
 */
export const test = base.extend<ApiFixtures>({
  pacing: [
    async ({}, use) => {
      await use();
      const delayMs = getPacingDelayMs();
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    },
    { auto: true },
  ],

  accountsApi: async ({ request }, use) => {
    await use(new AccountsApi(request));
  },

  customersApi: async ({ request }, use) => {
    await use(new CustomersApi(request));
  },

  transactionsApi: async ({ request }, use) => {
    await use(new TransactionsApi(request));
  },

  adminApi: async ({ request }, use) => {
    await use(new AdminApi(request));
  },
});

export { expect };
