import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Service 3: Customers Operations API Tests', () => {
  const customerId = 12212;

  test('API-CUST-01: Retrieve customer profile by valid ID (12212) @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER.replace('{customerId}', String(customerId)));

    const response = await test.step(`Send GET /customers/${customerId}`, async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify customer details match expected profile', async () => {
      expect([200, 204]).toContain(response.status());
      const body = await response.json();
      expect(body.id).toBe(customerId);
      expect(body.firstName).toBe('John');
      expect(body.phoneNumber).toBe('310-447-4121');
    });
  });

  test('API-CUST-02: Retrieve customer details with non-existent ID @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER.replace('{customerId}', '99999999'));

    const response = await test.step('Send GET /customers/99999999', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify error status is returned', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-CUST-03: Retrieve customer with invalid negative/zero ID @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER.replace('{customerId}', '-1'));

    const response = await test.step('Send GET /customers/-1', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify client error status is returned', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-CUST-04: Update customer profile with complete valid fields @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.UPDATE_CUSTOMER.replace('{customerId}', String(customerId)));

    const response = await test.step('Send POST update customer details', async () => {
      return await request.post(url, {
        headers: { Accept: 'application/json' },
        params: {
          firstName: 'John',
          lastName: 'Smith',
          street: '1431 Main St',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210',
          phoneNumber: '310-447-4121',
          ssn: '622-11-9999',
          username: 'john',
          password: 'demo',
        },
      });
    });

    await test.step('Verify status is 200/204', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-CUST-05: Update customer profile with special characters in address @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.UPDATE_CUSTOMER.replace('{customerId}', String(customerId)));

    const response = await test.step('Send POST update with special characters', async () => {
      return await request.post(url, {
        headers: { Accept: 'application/json' },
        params: {
          firstName: 'John',
          lastName: 'Smith',
          street: '1431 Main St #4B & Suite 2',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210',
          phoneNumber: '310-447-4121',
          ssn: '622-11-9999',
          username: 'john',
          password: 'demo',
        },
      });
    });

    await test.step('Verify update accepts sanitized inputs', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-CUST-07: Retrieve all accounts for customer @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER_ACCOUNTS.replace('{customerId}', String(customerId)));

    const response = await test.step(`Send GET /customers/${customerId}/accounts`, async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify non-empty account array is returned', async () => {
      expect([200, 204]).toContain(response.status());
      const accounts = await response.json();
      expect(Array.isArray(accounts)).toBeTruthy();
      expect(accounts.length).toBeGreaterThan(0);
    });
  });

  test('API-CUST-08: Create account under customer @master @regression @api', async ({ request }) => {
    const response = await test.step('Send POST /createAccount', async () => {
      return await request.post(Routes.url(Routes.CREATE_ACCOUNT), {
        headers: { Accept: 'application/json' },
        params: {
          customerId: customerId,
          newAccountType: 0, // CHECKING
          fromAccountId: 12345,
        },
      });
    });

    await test.step('Verify new checking account created', async () => {
      expect([200, 204]).toContain(response.status());
      const newAcct = await response.json();
      expect(newAcct).toHaveProperty('id');
      expect(newAcct.type).toBe('CHECKING');
    });
  });
});
