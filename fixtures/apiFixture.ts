import { test as base, expect } from '@playwright/test';

/**
 * Custom Playwright test fixture that enforces automatic request pacing.
 * Public shared demo servers (like ParaBank on Parasoft) are protected by Cloudflare WAF
 * with strict burst rate limiting (Cloudflare Error 1015 / HTTP 429).
 * This fixture adds an automatic delay after each test to maintain a smooth, sustainable request rate.
 */
export const test = base.extend<{ pacing: void }>({
  pacing: [
    async ({}, use) => {
      await use();
      // Delay 1200ms between tests to stay safely below Cloudflare's 60 req/min rate limit
      const delayMs = process.env.CI ? 2000 : 1200;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    },
    { auto: true },
  ],
});

export { expect };
