import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Service 5: Transactions Operations API Tests', () => {
  const primaryAccountId = 12345;
  let knownTransactionId: number;

  test.beforeAll(async ({ request }) => {
    // Ensure initial transaction exists
    await request.post(Routes.url(Routes.DEPOSIT), {
      headers: { Accept: 'application/json' },
      params: { accountId: primaryAccountId, amount: 100.0 },
    });
  });

  test('API-TXN-01: Retrieve complete transaction list for an account @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_ACCOUNT_TRANSACTIONS.replace('{accountId}', String(primaryAccountId)));

    const response = await test.step(`Send GET /accounts/${primaryAccountId}/transactions`, async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify transactions array', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
      if (txns.length > 0) {
        knownTransactionId = txns[0].id;
        expect(txns[0]).toHaveProperty('id');
        expect(txns[0]).toHaveProperty('type');
      }
    });
  });

  test('API-TXN-02: Retrieve transaction details by valid Transaction ID @master @sanity @api', async ({ request }) => {
    test.skip(!knownTransactionId, 'No transaction ID available');
    const url = Routes.url(Routes.GET_TRANSACTION.replace('{transactionId}', String(knownTransactionId)));

    const response = await test.step(`Send GET /transactions/${knownTransactionId}`, async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify transaction properties', async () => {
      expect([200, 204]).toContain(response.status());
      const txn = await response.json();
      expect(txn.id).toBe(knownTransactionId);
      expect(txn.accountId).toBe(primaryAccountId);
    });
  });

  test('API-TXN-03: Retrieve transaction details by non-existent Transaction ID @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_TRANSACTION.replace('{transactionId}', '99999999'));

    const response = await test.step('Send GET /transactions/99999999', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify error status returned', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-TXN-04: Filter transactions by exact monetary amount (/amount/{amount}) @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_AMOUNT
        .replace('{accountId}', String(primaryAccountId))
        .replace('{amount}', '1000')
    );

    const response = await test.step('Send GET transactions by amount', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify transactions filtered by amount', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
    });
  });

  test('API-TXN-05: Filter transactions by non-matching amount (returns empty list) @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_AMOUNT
        .replace('{accountId}', String(primaryAccountId))
        .replace('{amount}', '987654.32')
    );

    const response = await test.step('Send GET transactions with non-matching amount', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify empty array returned', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
      expect(txns.length).toBe(0);
    });
  });

  test('API-TXN-06: Filter transactions by Month and Type (/month/{month}/type/{type}) @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_MONTH_TYPE
        .replace('{accountId}', String(primaryAccountId))
        .replace('{month}', 'All')
        .replace('{type}', 'All')
    );

    const response = await test.step('Send GET transactions month=All, type=All', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify array returned', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
    });
  });

  test('API-TXN-07: Filter transactions for month=All and type=Debit @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_MONTH_TYPE
        .replace('{accountId}', String(primaryAccountId))
        .replace('{month}', 'All')
        .replace('{type}', 'Debit')
    );

    const response = await test.step('Send GET transactions month=All, type=Debit', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify all returned items are Debit', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
      txns.forEach((t: any) => expect(t.type).toBe('Debit'));
    });
  });

  test('API-TXN-08: Filter transactions by date range @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_DATE_RANGE
        .replace('{accountId}', String(primaryAccountId))
        .replace('{from}', '01-01-2020')
        .replace('{to}', '12-31-2030')
    );

    const response = await test.step('Send GET transactions by date range', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify response', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
    });
  });

  test('API-TXN-09: Filter transactions for specific date @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_DATE
        .replace('{accountId}', String(primaryAccountId))
        .replace('{onDate}', '01-01-2026')
    );

    const response = await test.step('Send GET transactions onDate', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify response array', async () => {
      expect([200, 204]).toContain(response.status());
      const txns = await response.json();
      expect(Array.isArray(txns)).toBeTruthy();
    });
  });

  test('API-TXN-10: Filter transactions with invalid date format string @master @regression @api', async ({ request }) => {
    const url = Routes.url(
      Routes.FILTER_TRANSACTIONS_BY_DATE
        .replace('{accountId}', String(primaryAccountId))
        .replace('{onDate}', 'invalid-date-format')
    );

    const response = await test.step('Send GET transactions with invalid date', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify 400 Bad Request or empty list', async () => {
      expect([200, 400, 404]).toContain(response.status());
    });
  });
});
