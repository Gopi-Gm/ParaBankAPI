import { test, expect } from '../../fixtures/apiFixture';
import path from 'path';
import Ajv from 'ajv';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

test.describe('JSON Schema Validation API Tests', () => {
  const ajv = new Ajv({ allErrors: true });

  test('SCHEMA-01: Customer Schema Validation @master @regression @api @schema', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER.replace('{customerId}', '12212'));
    const response = await request.get(url, { headers: { Accept: 'application/json' } });
    expect([200, 204]).toContain(response.status());

    const body = await response.json();
    const schemaPath = path.resolve(__dirname, '../../api/schemas/customer_schema.json');
    const schema = DataProvider.readJson(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(body);
    if (!valid) console.error(validate.errors);
    expect(valid).toBeTruthy();
  });

  test('SCHEMA-02: Account Schema Validation @master @regression @api @schema', async ({ request }) => {
    const url = Routes.url(Routes.GET_ACCOUNT.replace('{accountId}', '12345'));
    const response = await request.get(url, { headers: { Accept: 'application/json' } });
    expect([200, 204]).toContain(response.status());

    const body = await response.json();
    const schemaPath = path.resolve(__dirname, '../../api/schemas/account_schema.json');
    const schema = DataProvider.readJson(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(body);
    if (!valid) console.error(validate.errors);
    expect(valid).toBeTruthy();
  });

  test('SCHEMA-03: Transaction Schema Validation @master @regression @api @schema', async ({ request }) => {
    const url = Routes.url(Routes.GET_ACCOUNT_TRANSACTIONS.replace('{accountId}', '12345'));
    const response = await request.get(url, { headers: { Accept: 'application/json' } });
    expect([200, 204]).toContain(response.status());

    const txns = await response.json();
    if (Array.isArray(txns) && txns.length > 0) {
      const schemaPath = path.resolve(__dirname, '../../api/schemas/transaction_schema.json');
      const schema = DataProvider.readJson(schemaPath);
      const validate = ajv.compile(schema);
      const valid = validate(txns[0]);
      if (!valid) console.error(validate.errors);
      expect(valid).toBeTruthy();
    }
  });

  test('SCHEMA-04: Loan Response Schema Validation @master @regression @api @schema', async ({ request }) => {
    const response = await request.post(Routes.url(Routes.REQUEST_LOAN), {
      headers: { Accept: 'application/json' },
      params: {
        customerId: 12212,
        amount: 800,
        downPayment: 200,
        fromAccountId: 12345,
      },
    });

    if (response.ok()) {
      const body = await response.json();
      const schemaPath = path.resolve(__dirname, '../../api/schemas/loan_schema.json');
      const schema = DataProvider.readJson(schemaPath);
      const validate = ajv.compile(schema);
      const valid = validate(body);
      if (!valid) console.error(validate.errors);
      expect(valid).toBeTruthy();
    } else {
      expect([200, 204, 500]).toContain(response.status());
    }
  });

  test('SCHEMA-05: Position Schema Validation @master @regression @api @schema', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER_POSITIONS.replace('{customerId}', '12212'));
    const response = await request.get(url, { headers: { Accept: 'application/json' } });
    expect([200, 204]).toContain(response.status());

    const positions = await response.json();
    if (Array.isArray(positions) && positions.length > 0) {
      const schemaPath = path.resolve(__dirname, '../../api/schemas/position_schema.json');
      const schema = DataProvider.readJson(schemaPath);
      const validate = ajv.compile(schema);
      const valid = validate(positions[0]);
      if (!valid) console.error(validate.errors);
      expect(valid).toBeTruthy();
    }
  });

  test('SCHEMA-06: BillPay Result Schema Validation @master @regression @api @schema', async ({ request }) => {
    const payee = {
      name: 'Electric Utility',
      address: {
        street: '100 Power Rd',
        city: 'Beverly Hills',
        state: 'CA',
        zipCode: '90210',
      },
      phoneNumber: '310-555-4321',
      accountNumber: 654321,
    };

    const response = await request.post(Routes.url(Routes.BILL_PAY), {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        accountId: 12345,
        amount: 25.0,
      },
      data: payee,
    });
    expect([200, 204]).toContain(response.status());

    const body = await response.json();
    const schemaPath = path.resolve(__dirname, '../../api/schemas/billpay_schema.json');
    const schema = DataProvider.readJson(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(body);
    if (!valid) console.error(validate.errors);
    expect(valid).toBeTruthy();
  });
});
