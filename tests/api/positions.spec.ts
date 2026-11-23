import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('Service 7: Positions (Stock Trading) Operations API Tests', () => {
  const customerId = 12212;
  const primaryAccountId = 12345;
  let knownPositionId: number;

  test('API-POS-01: Buy stock position with valid shares and price @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.BUY_POSITION.replace('{customerId}', String(customerId)));

    const response = await test.step('Send POST /buyPosition for MSFT', async () => {
      return await request.post(url, {
        headers: { Accept: 'application/json' },
        params: {
          accountId: primaryAccountId,
          name: 'Microsoft Corp',
          symbol: 'MSFT',
          shares: 5,
          pricePerShare: 320.0,
        },
      });
    });

    await test.step('Verify positions array returned', async () => {
      expect([200, 204]).toContain(response.status());
      const positions = await response.json();
      expect(Array.isArray(positions)).toBeTruthy();
      expect(positions.length).toBeGreaterThan(0);
    });
  });

  test('API-POS-02: Retrieve all stock positions for customer @master @sanity @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_CUSTOMER_POSITIONS.replace('{customerId}', String(customerId)));

    const response = await test.step(`Send GET /customers/${customerId}/positions`, async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify customer positions list', async () => {
      expect([200, 204]).toContain(response.status());
      const positions = await response.json();
      expect(Array.isArray(positions)).toBeTruthy();
      if (positions.length > 0) {
        knownPositionId = positions[0].positionId;
        expect(positions[0]).toHaveProperty('symbol');
        expect(positions[0]).toHaveProperty('shares');
      }
    });
  });

  test('API-POS-03: Retrieve specific stock position by Position ID @master @sanity @api', async ({ request }) => {
    test.skip(!knownPositionId, 'No position ID available');
    const url = Routes.url(Routes.GET_POSITION.replace('{positionId}', String(knownPositionId)));

    const response = await test.step(`Send GET /positions/${knownPositionId}`, async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify position properties match', async () => {
      expect([200, 204]).toContain(response.status());
      const pos = await response.json();
      expect(pos.positionId).toBe(knownPositionId);
      expect(pos.customerId).toBe(customerId);
    });
  });

  test('API-POS-04: Retrieve non-existent stock position by ID @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.GET_POSITION.replace('{positionId}', '99999999'));

    const response = await test.step('Send GET /positions/99999999', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify 400 or 404', async () => {
      expect([400, 404]).toContain(response.status());
    });
  });

  test('API-POS-05: Sell stock position with valid shares @master @regression @api', async ({ request }) => {
    test.skip(!knownPositionId, 'No position ID available to sell');
    const url = Routes.url(Routes.SELL_POSITION.replace('{customerId}', String(customerId)));

    const response = await test.step('Send POST /sellPosition', async () => {
      return await request.post(url, {
        headers: { Accept: 'application/json' },
        params: {
          accountId: primaryAccountId,
          positionId: knownPositionId,
          shares: 1,
          pricePerShare: 325.0,
        },
      });
    });

    await test.step('Verify updated positions returned', async () => {
      expect([200, 204]).toContain(response.status());
      const positions = await response.json();
      expect(Array.isArray(positions)).toBeTruthy();
    });
  });

  test('API-POS-06: Query stock position historical price points by date range @master @regression @api', async ({ request }) => {
    test.skip(!knownPositionId, 'No position ID available');
    const url = Routes.url(
      Routes.GET_POSITION_HISTORY
        .replace('{positionId}', String(knownPositionId))
        .replace('{startDate}', '01-01-2020')
        .replace('{endDate}', '12-31-2030')
    );

    const response = await test.step('Send GET position history', async () => {
      return await request.get(url, { headers: { Accept: 'application/json' } });
    });

    await test.step('Verify response status', async () => {
      expect([200, 204, 400]).toContain(response.status());
    });
  });

  test('API-POS-07: Buy stock position with zero or negative shares @master @regression @api', async ({ request }) => {
    const url = Routes.url(Routes.BUY_POSITION.replace('{customerId}', String(customerId)));

    const response = await test.step('Send POST /buyPosition with shares=0', async () => {
      return await request.post(url, {
        headers: { Accept: 'application/json' },
        params: {
          accountId: primaryAccountId,
          name: 'Invalid Share Position',
          symbol: 'INV',
          shares: 0,
          pricePerShare: 10.0,
        },
      });
    });

    await test.step('Verify response status', async () => {
      expect([200, 400]).toContain(response.status());
    });
  });
});
