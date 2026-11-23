import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Service 6: Loans Operations API Tests', () => {
  const customerId = 12212;
  const primaryAccountId = 12345;

  test('API-LOAN-01: Request loan with qualified down payment (20%+) @master @sanity @api', async ({ request }) => {
    const response = await test.step('Send POST /requestLoan with 20%+ down payment', async () => {
      return await request.post(Routes.url(Routes.REQUEST_LOAN), {
        headers: { Accept: 'application/json' },
        params: {
          customerId: customerId,
          amount: 1000,
          downPayment: 250,
          fromAccountId: primaryAccountId,
        },
      });
    });

    await test.step('Verify LoanResponse is returned with boolean approved', async () => {
      expect([200, 204]).toContain(response.status());
      const loanRes = await response.json();
      expect(loanRes).toHaveProperty('approved');
      expect(typeof loanRes.approved).toBe('boolean');
      expect(loanRes).toHaveProperty('loanProviderName');
    });
  });

  test('API-LOAN-02: Request loan with insufficient down payment @master @regression @api', async ({ request }) => {
    const response = await test.step('Send POST /requestLoan with low down payment', async () => {
      return await request.post(Routes.url(Routes.REQUEST_LOAN), {
        headers: { Accept: 'application/json' },
        params: {
          customerId: customerId,
          amount: 50000,
          downPayment: 1,
          fromAccountId: primaryAccountId,
        },
      });
    });

    await test.step('Verify loan decision is returned', async () => {
      expect([200, 204]).toContain(response.status());
      const loanRes = await response.json();
      expect(loanRes).toHaveProperty('approved');
    });
  });

  test('API-LOAN-03: Request loan with zero down payment @master @regression @api', async ({ request }) => {
    const response = await test.step('Send POST /requestLoan with downPayment=0', async () => {
      return await request.post(Routes.url(Routes.REQUEST_LOAN), {
        headers: { Accept: 'application/json' },
        params: {
          customerId: customerId,
          amount: 500,
          downPayment: 0,
          fromAccountId: primaryAccountId,
        },
      });
    });

    await test.step('Verify response status', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-LOAN-04: Request loan with non-existent source account ID @master @regression @api', async ({ request }) => {
    const response = await test.step('Send POST /requestLoan with invalid fromAccountId', async () => {
      return await request.post(Routes.url(Routes.REQUEST_LOAN), {
        headers: { Accept: 'application/json' },
        params: {
          customerId: customerId,
          amount: 1000,
          downPayment: 250,
          fromAccountId: 99999999,
        },
      });
    });

    await test.step('Verify response status', async () => {
      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test('API-LOAN-05: Validate LoanResponse schema fields @master @regression @api', async ({ request }) => {
    const response = await test.step('Send POST /requestLoan', async () => {
      return await request.post(Routes.url(Routes.REQUEST_LOAN), {
        headers: { Accept: 'application/json' },
        params: {
          customerId: customerId,
          amount: 800,
          downPayment: 200,
          fromAccountId: primaryAccountId,
        },
      });
    });

    await test.step('Verify loan response fields structure', async () => {
      expect([200, 204]).toContain(response.status());
      const loanRes = await response.json();
      expect(loanRes).toHaveProperty('approved');
      expect(typeof loanRes.approved).toBe('boolean');
    });
  });
});
