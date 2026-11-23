import { test, expect } from '@playwright/test';

/**
 * End-to-End API Test Suite for Restful Booker API
 * Base URL: https://restful-booker.herokuapp.com
 * Covers: Authentication, CRUD lifecycle, Filtering, and Negative validation.
 */

test.describe('Restful Booker - API Automation Test Suite', () => {
  let authToken: string;
  let createdBookingId: number;

  const testBookingPayload = {
    firstname: 'Alex',
    lastname: 'Tester',
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-11-25',
      checkout: '2026-12-05',
    },
    additionalneeds: 'Late Checkout, High Floor',
  };

  // 1. Setup: Authenticate before running protected mutation tests
  test.beforeAll(async ({ request }) => {
    const authResponse = await request.post('/auth', {
      data: {
        username: 'admin',
        password: 'password123',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(authResponse.status()).toBe(200);
    const authData = await authResponse.json();
    expect(authData).toHaveProperty('token');
    authToken = authData.token;
    expect(authToken).toBeTruthy();
  });

  // 2. CREATE (POST /booking)
  test('POST /booking - should successfully create a new booking', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.post('/booking', {
      data: testBookingPayload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const responseDuration = Date.now() - startTime;
    expect(responseDuration).toBeLessThan(3000); // SLA check: < 3 seconds
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
    expect(typeof body.bookingid).toBe('number');
    expect(body.booking.firstname).toBe(testBookingPayload.firstname);
    expect(body.booking.lastname).toBe(testBookingPayload.lastname);
    expect(body.booking.totalprice).toBe(testBookingPayload.totalprice);
    expect(body.booking.depositpaid).toBe(testBookingPayload.depositpaid);
    expect(body.booking.bookingdates.checkin).toBe(testBookingPayload.bookingdates.checkin);

    createdBookingId = body.bookingid;
  });

  // 3. READ (GET /booking/{id})
  test('GET /booking/:id - should retrieve details of the created booking', async ({ request }) => {
    expect(createdBookingId).toBeDefined();

    const response = await request.get(`/booking/${createdBookingId}`, {
      headers: { Accept: 'application/json' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe(testBookingPayload.firstname);
    expect(body.lastname).toBe(testBookingPayload.lastname);
    expect(body.totalprice).toBe(testBookingPayload.totalprice);
  });

  // 4. QUERY FILTER (GET /booking?firstname=...)
  test('GET /booking?firstname=... - should query bookings by firstname filter', async ({ request }) => {
    const response = await request.get('/booking', {
      params: {
        firstname: testBookingPayload.firstname,
        lastname: testBookingPayload.lastname,
      },
      headers: { Accept: 'application/json' },
    });

    expect(response.status()).toBe(200);
    const bookings = await response.json();
    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);

    const matchesCreated = bookings.some((b: { bookingid: number }) => b.bookingid === createdBookingId);
    expect(matchesCreated).toBe(true);
  });

  // 5. UPDATE (PUT /booking/{id})
  test('PUT /booking/:id - should completely update an existing booking using auth token', async ({ request }) => {
    const updatedPayload = {
      ...testBookingPayload,
      firstname: 'Alex-Updated',
      totalprice: 320,
      additionalneeds: 'Airport Shuttle',
    };

    const response = await request.put(`/booking/${createdBookingId}`, {
      data: updatedPayload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Alex-Updated');
    expect(body.totalprice).toBe(320);
    expect(body.additionalneeds).toBe('Airport Shuttle');
  });

  // 6. PARTIAL UPDATE (PATCH /booking/{id})
  test('PATCH /booking/:id - should partially update booking fields', async ({ request }) => {
    const partialUpdate = {
      additionalneeds: 'VIP Suite, Complimentary Champagne',
    };

    const response = await request.patch(`/booking/${createdBookingId}`, {
      data: partialUpdate,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.additionalneeds).toBe('VIP Suite, Complimentary Champagne');
    expect(body.firstname).toBe('Alex-Updated'); // Preserves previous update
  });

  // 7. NEGATIVE: Unauthorized update attempt
  test('PUT /booking/:id - should reject update without auth token with 403 Forbidden', async ({ request }) => {
    const response = await request.put(`/booking/${createdBookingId}`, {
      data: testBookingPayload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    expect(response.status()).toBe(403);
  });

  // 8. DELETE (DELETE /booking/{id})
  test('DELETE /booking/:id - should delete booking with valid auth token', async ({ request }) => {
    const response = await request.delete(`/booking/${createdBookingId}`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${authToken}`,
      },
    });

    expect(response.status()).toBe(201); // Restful Booker returns 201 Created on DELETE
  });

  // 9. VERIFY DELETION (GET /booking/{id} returns 404)
  test('GET /booking/:id - should return 404 Not Found for deleted booking ID', async ({ request }) => {
    const response = await request.get(`/booking/${createdBookingId}`);
    expect(response.status()).toBe(404);
  });
});
