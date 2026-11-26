import { test, expect } from '../../fixtures/apiFixture';
import { Account, BillPayResult, Payee } from '../../api/services/AccountsApi';
import { Helper } from '../../utils/helper';

test.describe('Service 4: Accounts Operations API Tests', () => {
  const { customerId } = Helper.getCustomerDetails();
  let { primaryAccountId, secondaryAccountId } = Helper.getAccountDetails();

  test.beforeAll(async ({ adminApi, customersApi }) => {
    await adminApi.initializeDb();

    const res = await customersApi.getCustomerAccounts(customerId);
    if (res.ok()) {
      const accounts: Account[] = await res.json();
      if (Array.isArray(accounts) && accounts.length > 0) {
        primaryAccountId = accounts[0].id;
        secondaryAccountId = accounts.length > 1 ? accounts[1].id : accounts[0].id;
      }
    }
  });

  test('API-ACCT-01: Retrieve single account details by valid Account ID @master @sanity @api', async ({ accountsApi }) => {
    const response = await test.step(`Send GET /accounts/${primaryAccountId}`, async () => {
      return await accountsApi.getAccount(primaryAccountId);
    });

    await test.step('Verify account details schema and values', async () => {
      expect(response.status()).toBe(200);
      const account: Account = await response.json();
      expect(account.id).toBe(primaryAccountId);
      expect(['CHECKING', 'SAVINGS', 'LOAN']).toContain(account.type);
    });
  });

  test('API-ACCT-02: Retrieve account details for non-existent Account ID @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send GET /accounts/99999999', async () => {
      return await accountsApi.getAccount(99999999);
    });

    await test.step('Verify 400 or 404 status', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-ACCT-03: Retrieve account with non-numeric Account ID @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send GET /accounts/invalid_alpha', async () => {
      return await accountsApi.getAccount('invalid_alpha');
    });

    await test.step('Verify 400 or 404 status', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-ACCT-04: Create new SAVINGS account @master @sanity @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /createAccount for SAVINGS', async () => {
      return await accountsApi.createAccount(customerId, 1, primaryAccountId);
    });

    await test.step('Verify new savings account created', async () => {
      expect(response.status()).toBe(200);
      const newAcct: Account = await response.json();
      expect(newAcct).toHaveProperty('id');
      expect(newAcct.type).toBe('SAVINGS');
    });
  });

  test('API-ACCT-05: Create new LOAN account @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /createAccount for LOAN', async () => {
      return await accountsApi.createAccount(customerId, 2, primaryAccountId);
    });

    await test.step('Verify new loan account created', async () => {
      expect(response.status()).toBe(200);
      const newAcct: Account = await response.json();
      expect(newAcct).toHaveProperty('id');
      expect(newAcct.type).toBe('LOAN');
    });
  });

  test('API-ACCT-07: Create account with invalid/unfunded fromAccountId @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /createAccount with invalid fromAccountId', async () => {
      return await accountsApi.createAccount(customerId, 1, 99999999);
    });

    await test.step('Verify error status returned', async () => {
      expect([400, 404, 500]).toContain(response.status());
    });
  });

  test('API-ACCT-08: Deposit valid positive monetary amount into account @master @sanity @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /deposit with $200', async () => {
      return await accountsApi.deposit(primaryAccountId, 200.0);
    });

    await test.step('Verify deposit message', async () => {
      expect(response.status()).toBe(200);
      const msg = await response.text();
      expect(msg).toContain('Successfully deposited');
    });
  });

  test('API-ACCT-09: Deposit zero or negative monetary amount @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /deposit with -50', async () => {
      return await accountsApi.deposit(primaryAccountId, -50.0);
    });

    await test.step('Verify response status', async () => {
      expect([200, 400]).toContain(response.status());
    });
  });

  test('API-ACCT-10: Withdraw valid amount within available balance @master @sanity @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /withdraw with $15', async () => {
      return await accountsApi.withdraw(primaryAccountId, 15.0);
    });

    await test.step('Verify withdrawal message', async () => {
      expect(response.status()).toBe(200);
      const msg = await response.text();
      expect(msg).toContain('Successfully withdrew');
    });
  });

  test('API-ACCT-12: Transfer funds between two distinct customer accounts @master @sanity @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /transfer with $30', async () => {
      return await accountsApi.transfer(primaryAccountId, secondaryAccountId, 30.0);
    });

    await test.step('Verify transfer message', async () => {
      expect(response.status()).toBe(200);
      const msg = await response.text();
      expect(msg).toContain('Successfully transferred');
    });
  });

  test('API-ACCT-13: Transfer funds where source and target accounts are identical @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /transfer to self', async () => {
      return await accountsApi.transfer(primaryAccountId, primaryAccountId, 10.0);
    });

    await test.step('Verify handled gracefully', async () => {
      expect([200, 400]).toContain(response.status());
    });
  });

  test('API-ACCT-14: Transfer zero or negative funds @master @regression @api', async ({ accountsApi }) => {
    const response = await test.step('Send POST /transfer with 0 amount', async () => {
      return await accountsApi.transfer(primaryAccountId, secondaryAccountId, 0);
    });

    await test.step('Verify status', async () => {
      expect([200, 400]).toContain(response.status());
    });
  });

  test('API-ACCT-15: Bill pay with valid Payee JSON payload @master @sanity @api', async ({ accountsApi }) => {
    const payee: Payee = {
      name: 'Acme Power Co',
      address: {
        street: '123 Grid Lane',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75001',
      },
      phoneNumber: '214-555-0100',
      accountNumber: 554433,
    };

    const response = await test.step('Send POST /billpay with Payee object', async () => {
      return await accountsApi.billPay(primaryAccountId, 60.0, payee);
    });

    await test.step('Verify BillPayResult object', async () => {
      expect(response.status()).toBe(200);
      const result: BillPayResult = await response.json();
      expect(result.accountId).toBe(primaryAccountId);
      expect(result.amount).toBe(60.0);
      expect(result.payeeName).toBe(payee.name);
    });
  });

  test('API-ACCT-16: Bill pay with XML format payload @master @regression @api', async ({ accountsApi }) => {
    const payee: Payee = {
      name: 'City Water Works',
      address: {
        street: '456 Reservoir St',
        city: 'Beverly Hills',
        state: 'CA',
        zipCode: '90210',
      },
      phoneNumber: '310-555-0199',
      accountNumber: 998877,
    };

    const response = await test.step('Send POST /billpay requesting XML', async () => {
      return await accountsApi.billPay(primaryAccountId, 45.0, payee, {
        'Content-Type': 'application/json',
        Accept: 'application/xml, text/xml',
      });
    });

    await test.step('Verify XML or success status returned', async () => {
      expect([200, 204]).toContain(response.status());
    });
  });
});
