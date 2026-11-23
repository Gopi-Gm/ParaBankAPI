import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Service 2: Misc Operations (Auth & Settings) API Tests', () => {

  test('API-MISC-01: Customer login with valid credentials (john/demo) @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.LOGIN.replace('{username}', 'john').replace('{password}', 'demo'));

    const response = await test.step('Send GET login with john/demo', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify status is 200 and customer profile is returned', async () => {
      expect([200, 204]).toContain(response.status());
      const body = await response.json();
      expect(body.id).toBe(12212);
      expect(body.firstName).toBe('John');
      expect(body.lastName).toBe('Smith');
      expect(body.address.city).toBe('Beverly Hills');
    });
  });

  test('API-MISC-02: Customer login with invalid password @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.LOGIN.replace('{username}', 'john').replace('{password}', 'invalid_password'));

    const response = await test.step('Send GET login with invalid password', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify status is 400 Bad Request', async () => {
      expect(response.status()).toBe(400);
      const errorText = await response.text();
      expect(errorText).toContain('Invalid username and/or password');
    });
  });

  test('API-MISC-03: Customer login with non-existent username @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.LOGIN.replace('{username}', 'non_existent_user_9999').replace('{password}', 'demo'));

    const response = await test.step('Send GET login with non-existent user', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify status is 400 Bad Request', async () => {
      expect(response.status()).toBe(400);
    });
  });

  test('API-MISC-05: SQL injection attempt in login path parameters @master @regression @api @security', async ({ request }) => {
    const sqlInjectionPayload = encodeURIComponent("' OR 1=1 --");
    const url = Routes.url(Routes.LOGIN.replace('{username}', sqlInjectionPayload).replace('{password}', 'test'));

    const response = await test.step('Send GET login with SQL injection payload', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify request fails safely without disclosing SQL stack trace', async () => {
      expect([400, 403, 404, 500]).toContain(response.status());
      const bodyText = await response.text();
      expect(bodyText.toLowerCase()).not.toContain('sql syntax');
      expect(bodyText.toLowerCase()).not.toContain('hibernateexception');
    });
  });

  test('API-MISC-06: Set valid system runtime parameter (loanProcessor) @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.SET_PARAMETER.replace('{name}', 'loanProcessor').replace('{value}', 'funds'));

    const response = await test.step('Send POST /setParameter/loanProcessor/funds', async () => {
      return await request.post(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify parameter set successfully', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-MISC-07: Set parameter with custom value @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.SET_PARAMETER.replace('{name}', 'loanProvider').replace('{value}', 'ParaBank'));

    const response = await test.step('Send POST /setParameter/loanProvider/ParaBank', async () => {
      return await request.post(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify status code 200 or 204', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });
});
