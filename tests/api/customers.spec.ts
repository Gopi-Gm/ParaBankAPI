import { test, expect } from '../../fixtures/apiFixture';
import { Account } from '../../api/services/AccountsApi';
import { Customer } from '../../api/services/CustomersApi';
import { Helper } from '../../utils/helper';

test.describe('Service 3: Customers Operations API Tests', () => {
  const { customerId, firstName, lastName } = Helper.getCustomerDetails();
  const { username, password } = Helper.getLoginDetails();
  const { primaryAccountId } = Helper.getAccountDetails();

  test('API-CUST-01: Retrieve customer profile by valid ID (12212) @master @sanity @api', async ({ customersApi }) => {
    const response = await test.step(`Send GET /customers/${customerId}`, async () => {
      return await customersApi.getCustomer(customerId);
    });

    await test.step('Verify customer details match expected profile', async () => {
      expect(response.status()).toBe(200);
      const body: Customer = await response.json();
      expect(body.id).toBe(customerId);
      expect(body.firstName).toBe(firstName);
      expect(body.phoneNumber).toBe('310-447-4121');
    });
  });

  test('API-CUST-02: Retrieve customer details with non-existent ID @master @regression @api', async ({ customersApi }) => {
    const response = await test.step('Send GET /customers/99999999', async () => {
      return await customersApi.getCustomer(99999999);
    });

    await test.step('Verify error status is returned', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-CUST-03: Retrieve customer with invalid negative/zero ID @master @regression @api', async ({ customersApi }) => {
    const response = await test.step('Send GET /customers/-1', async () => {
      return await customersApi.getCustomer(-1);
    });

    await test.step('Verify client error status is returned', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-CUST-04: Update customer profile with complete valid fields @master @sanity @api', async ({ customersApi }) => {
    const response = await test.step('Send POST update customer details', async () => {
      return await customersApi.updateCustomer(customerId, {
        firstName,
        lastName,
        street: '1431 Main St',
        city: 'Beverly Hills',
        state: 'CA',
        zipCode: '90210',
        phoneNumber: '310-447-4121',
        ssn: '622-11-9999',
        username,
        password,
      });
    });

    await test.step('Verify status is 200/204', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-CUST-05: Update customer profile with special characters in address @master @regression @api', async ({ customersApi }) => {
    const response = await test.step('Send POST update with special characters', async () => {
      return await customersApi.updateCustomer(customerId, {
        firstName,
        lastName,
        street: '1431 Main St #4B & Suite 2',
        city: 'Beverly Hills',
        state: 'CA',
        zipCode: '90210',
        phoneNumber: '310-447-4121',
        ssn: '622-11-9999',
        username,
        password,
      });
    });

    await test.step('Verify update accepts sanitized inputs', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });

  test('API-CUST-07: Retrieve all accounts for customer @master @sanity @api', async ({ customersApi }) => {
    const response = await test.step(`Send GET /customers/${customerId}/accounts`, async () => {
      return await customersApi.getCustomerAccounts(customerId);
    });

    await test.step('Verify non-empty account array is returned', async () => {
      expect(response.status()).toBe(200);
      const accounts: Account[] = await response.json();
      expect(Array.isArray(accounts)).toBeTruthy();
      expect(accounts.length).toBeGreaterThan(0);
    });
  });

  test('API-CUST-08: Create account under customer @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /createAccount', async () => {
      return await accountsApi.createAccount(customerId, 0, primaryAccountId);
    });

    await test.step('Verify new checking account created', async () => {
      expect(response.status()).toBe(200);
      const newAcct: Account = await response.json();
      expect(newAcct).toHaveProperty('id');
      expect(newAcct.type).toBe('CHECKING');
    });
  });
});
