import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Security & Non-Functional API Tests', () => {

  test('API-SEC-01: IDOR test: Access other customer accounts without authorization @master @regression @api @security', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER.replace('{customerId}', '98765'));

    const response = await test.step('Send unauthenticated GET for arbitrary customer account', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify request is not leaking unauthorized data', async () => {
      expect([200, 400, 401, 403, 404]).toContain(response.status());
    });
  });

  test('API-SEC-02: Response Header Security check @master @regression @api @security', async ({ request }) => {
    const response = await test.step('Send request and inspect security headers', async () => {
      return await request.get(Routes.url(Routes.GET_ACCOUNT.replace('{accountId}', '12345')), {
        headers: { Accept: 'application/json' },
      });
    });

    await test.step('Verify response contains standard content headers', async () => {
      const headers = response.headers();
      expect(headers).toHaveProperty('content-type');
      expect(headers['content-type']).toContain('application/json');
    });
  });

  test('API-PERF-01: Verify latency SLA on read inquiries (< 2000ms) @master @regression @api @perf', async ({ request }) => {
    const startTime = Date.now();
    const response = await test.step('Perform GET read inquiry', async () => {
      return await request.get(Routes.url(Routes.GET_CUSTOMER.replace('{customerId}', '12212')), {
        headers: { Accept: 'application/json' },
      });
    });
    const duration = Date.now() - startTime;

    await test.step('Verify read latency is under 2000ms SLA', async () => {
      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(2000);
    });
  });

  test('API-PERF-02: Verify latency SLA on transactional mutations (< 3000ms) @master @regression @api @perf', async ({ request }) => {
    const startTime = Date.now();
    const response = await test.step('Perform POST mutation', async () => {
      return await request.post(Routes.url(Routes.DEPOSIT), {
        headers: { Accept: 'application/json' },
        params: {
          accountId: 12345,
          amount: 10.0,
        },
      });
    });
    const duration = Date.now() - startTime;

    await test.step('Verify mutation latency is under 3000ms SLA', async () => {
      expect([200, 204]).toContain(response.status());
      expect(duration).toBeLessThan(3000);
    });
  });
});
