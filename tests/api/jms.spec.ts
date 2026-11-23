import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Service 8: JMS Message Service Operations API Tests', () => {

  test('API-JMS-01: Start JMS message listener service @master @sanity @api', async ({ request }) => {
    const response = await test.step('Send POST /startupJmsListener', async () => {
      return await request.post(Routes.url(Routes.STARTUP_JMS), {
        headers: { Accept: 'application/json' },
      });
    });

    await test.step('Verify JMS listener started', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-JMS-02: Start JMS listener when already running (idempotency) @master @regression @api', async ({ request }) => {
    const response = await test.step('Send second POST /startupJmsListener', async () => {
      return await request.post(Routes.url(Routes.STARTUP_JMS), {
        headers: { Accept: 'application/json' },
      });
    });

    await test.step('Verify response status is 200 or 204', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-JMS-03: Shutdown JMS message listener service @master @sanity @api', async ({ request }) => {
    const response = await test.step('Send POST /shutdownJmsListener', async () => {
      return await request.post(Routes.url(Routes.SHUTDOWN_JMS), {
        headers: { Accept: 'application/json' },
      });
    });

    await test.step('Verify JMS listener shut down', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-JMS-04: Shutdown JMS listener when already stopped (idempotency) @master @regression @api', async ({ request }) => {
    const response = await test.step('Send second POST /shutdownJmsListener', async () => {
      return await request.post(Routes.url(Routes.SHUTDOWN_JMS), {
        headers: { Accept: 'application/json' },
      });
    });

    await test.step('Verify response status is 200 or 204', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });
});
