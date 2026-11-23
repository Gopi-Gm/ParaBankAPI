import { test, expect } from '@playwright/test';

/**
 * ParaBank REST API Automated Test Suite (Full 8 Services Coverage)
 * Swagger UI: https://parabank.parasoft.com/parabank/api-docs/index.html
 * Base URL: https://parabank.parasoft.com/parabank/services/bank
 *
 * Covered Services:
 * 1. Database
 * 2. Misc
 * 3. Customers
 * 4. Accounts
 * 5. Transactions
 * 6. Loans
 * 7. Positions
 * 8. JMS
 */

const BASE_URL = 'https://parabank.parasoft.com/parabank/services/bank';

test.describe('ParaBank REST API Complete 8-Service Test Suite', () => {
  let customerId: number = 12212;
  let primaryAccountId: number;
  let secondaryAccountId: number;
  let knownTransactionId: number;
  let knownPositionId: number;

  test.beforeAll(async ({ request }) => {
    // 1. DATABASE SERVICE: Initialize database
    const initRes = await request.post(`${BASE_URL}/initializeDB`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(initRes.status());
  });

  // ==========================================
  // SERVICE 2: MISC (AUTH & SETTINGS)
  // ==========================================
  test('API-MISC-01: Login with valid credentials (john/demo)', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/login/john/demo`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBe(12212);
    expect(body.firstName).toBe('John');
    expect(body.lastName).toBe('Smith');
    expect(body.address.city).toBe('Beverly Hills');
    customerId = body.id;
  });

  test('API-MISC-02: Login with invalid password returns 400', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/login/john/invalid_password`, {
      headers: { Accept: 'application/json' },
    });
    expect(res.status()).toBe(400);
    const errorText = await res.text();
    expect(errorText).toContain('Invalid username and/or password');
  });

  test('API-MISC-06: Set runtime parameter (loanProcessor)', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/setParameter/loanProcessor/funds`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
  });

  // ==========================================
  // SERVICE 3: CUSTOMERS
  // ==========================================
  test('API-CUST-01: Retrieve customer details by Customer ID', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/customers/${customerId}`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const body = await res.json();
    expect(body.id).toBe(customerId);
    expect(body.firstName).toBe('John');
    expect(body.phoneNumber).toBe('310-447-4121');
  });

  test('API-CUST-04: Update customer contact details', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/customers/update/${customerId}`, {
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
    expect([200, 204]).toContain(res.status());
  });

  // ==========================================
  // SERVICE 4: ACCOUNTS
  // ==========================================
  test('API-ACCT-01: Retrieve customer accounts list', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/customers/${customerId}/accounts`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const accounts = await res.json();
    expect(Array.isArray(accounts)).toBeTruthy();
    expect(accounts.length).toBeGreaterThan(0);

    primaryAccountId = accounts[0].id;
    secondaryAccountId = accounts.length > 1 ? accounts[1].id : accounts[0].id;
  });

  test('API-ACCT-02: Retrieve specific account by Account ID', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accounts/${primaryAccountId}`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const account = await res.json();
    expect(account.id).toBe(primaryAccountId);
    expect(['CHECKING', 'SAVINGS', 'LOAN']).toContain(account.type);
  });

  test('API-ACCT-04: Create a new Savings account', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/createAccount`, {
      headers: { Accept: 'application/json' },
      params: {
        customerId: customerId,
        newAccountType: 1, // SAVINGS
        fromAccountId: primaryAccountId,
      },
    });
    expect([200, 204]).toContain(res.status());
    const newAcct = await res.json();
    expect(newAcct).toHaveProperty('id');
    expect(newAcct.type).toBe('SAVINGS');
  });

  test('API-ACCT-08: Deposit funds into primary account', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/deposit`, {
      headers: { Accept: 'application/json' },
      params: {
        accountId: primaryAccountId,
        amount: 200.0,
      },
    });
    expect([200, 204]).toContain(res.status());
    const msg = await res.text();
    expect(msg).toContain('Successfully deposited');
  });

  test('API-ACCT-10: Withdraw funds from account', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/withdraw`, {
      headers: { Accept: 'application/json' },
      params: {
        accountId: primaryAccountId,
        amount: 15.0,
      },
    });
    expect([200, 204]).toContain(res.status());
    const msg = await res.text();
    expect(msg).toContain('Successfully withdrew');
  });

  test('API-ACCT-12: Transfer funds between accounts', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/transfer`, {
      headers: { Accept: 'application/json' },
      params: {
        fromAccountId: primaryAccountId,
        toAccountId: secondaryAccountId,
        amount: 30.0,
      },
    });
    expect([200, 204]).toContain(res.status());
    const msg = await res.text();
    expect(msg).toContain('Successfully transferred');
  });

  test('API-ACCT-15: Bill Pay with JSON Payee body', async ({ request }) => {
    const payee = {
      name: 'Pacific Gas & Electric',
      address: {
        street: '77 Beale St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
      },
      phoneNumber: '800-743-5000',
      accountNumber: 11223344,
    };

    const res = await request.post(`${BASE_URL}/billpay`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        accountId: primaryAccountId,
        amount: 55.75,
      },
      data: payee,
    });
    expect([200, 204]).toContain(res.status());
    const result = await res.json();
    expect(result.accountId).toBe(primaryAccountId);
    expect(result.amount).toBe(55.75);
    expect(result.payeeName).toBe(payee.name);
  });

  // ==========================================
  // SERVICE 5: TRANSACTIONS
  // ==========================================
  test('API-TXN-01: Retrieve all transactions for an account', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accounts/${primaryAccountId}/transactions`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const txns = await res.json();
    expect(Array.isArray(txns)).toBeTruthy();
    if (txns.length > 0) {
      knownTransactionId = txns[0].id;
    }
  });

  test('API-TXN-02: Retrieve specific transaction by ID', async ({ request }) => {
    test.skip(!knownTransactionId, 'No transaction ID available from previous test');
    const res = await request.get(`${BASE_URL}/transactions/${knownTransactionId}`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const txn = await res.json();
    expect(txn.id).toBe(knownTransactionId);
    expect(txn.accountId).toBe(primaryAccountId);
  });

  test('API-TXN-04: Filter transactions by exact amount', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accounts/12345/transactions/amount/1000`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const txns = await res.json();
    expect(Array.isArray(txns)).toBeTruthy();
    if (txns.length > 0) {
      expect(txns[0].amount).toBe(1000.0);
    }
  });

  test('API-TXN-06: Filter transactions by Month and Type', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/accounts/12345/transactions/month/All/type/All`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const txns = await res.json();
    expect(Array.isArray(txns)).toBeTruthy();
  });

  // ==========================================
  // SERVICE 6: LOANS
  // ==========================================
  test('API-LOAN-01: Request a loan with qualified down payment', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/requestLoan`, {
      headers: { Accept: 'application/json' },
      params: {
        customerId: customerId,
        amount: 800,
        downPayment: 200,
        fromAccountId: primaryAccountId,
      },
    });
    expect([200, 204]).toContain(res.status());
    const loanRes = await res.json();
    expect(loanRes).toHaveProperty('loanProviderName');
    expect(loanRes).toHaveProperty('approved');
    expect(typeof loanRes.approved).toBe('boolean');
  });

  // ==========================================
  // SERVICE 7: POSITIONS (STOCK TRADING)
  // ==========================================
  test('API-POS-01: Buy stock position for customer', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/customers/${customerId}/buyPosition`, {
      headers: { Accept: 'application/json' },
      params: {
        accountId: primaryAccountId,
        name: 'Microsoft Corp',
        symbol: 'MSFT',
        shares: 5,
        pricePerShare: 320.0,
      },
    });
    expect([200, 204]).toContain(res.status());
    const positions = await res.json();
    expect(Array.isArray(positions)).toBeTruthy();
    expect(positions.length).toBeGreaterThan(0);
  });

  test('API-POS-02: Retrieve all stock positions for customer', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/customers/${customerId}/positions`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const positions = await res.json();
    expect(Array.isArray(positions)).toBeTruthy();
    if (positions.length > 0) {
      knownPositionId = positions[0].positionId;
      expect(positions[0]).toHaveProperty('symbol');
      expect(positions[0]).toHaveProperty('shares');
    }
  });

  test('API-POS-03: Retrieve specific stock position by ID', async ({ request }) => {
    test.skip(!knownPositionId, 'No position ID available');
    const res = await request.get(`${BASE_URL}/positions/${knownPositionId}`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
    const pos = await res.json();
    expect(pos.positionId).toBe(knownPositionId);
    expect(pos.customerId).toBe(customerId);
  });

  // ==========================================
  // SERVICE 8: JMS MESSAGE SERVICE
  // ==========================================
  test('API-JMS-01: Start JMS message listener service', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/startupJmsListener`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
  });

  test('API-JMS-03: Shutdown JMS message listener service', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/shutdownJmsListener`, {
      headers: { Accept: 'application/json' },
    });
    expect([200, 204]).toContain(res.status());
  });
});
