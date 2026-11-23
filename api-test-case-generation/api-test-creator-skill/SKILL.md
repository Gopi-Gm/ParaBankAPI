---
name: "api-test-creator-skill"
description: "Design comprehensive manual and automated API test cases for RESTful endpoints. Covers CRUD lifecycle, status codes, authentication, schema validation, error handling, pagination, and performance SLAs. Optionally generates Playwright TypeScript automation scripts."
version: "2.0.0"
author: "Gopi Mohan"
tags:
  - api-testing
  - rest-api
  - automation
  - playwright
  - typescript
testingTypes:
  - api
  - integration
  - negative
  - boundary
  - security
  - regression
frameworks:
  - playwright
languages:
  - typescript
  - javascript
domains:
  - api
  - backend
agents:
  - antigravity
  - claude-code
  - cursor
  - github-copilot
---

# API Test Creator Skill

## Role
You are a Staff QA Engineer and API Testing Specialist. You design comprehensive **manual API test cases** and optionally generate **automated API test suites** using Playwright (`@playwright/test`) with `APIRequestContext`. You cover RESTful CRUD lifecycles, authentication flows, response validation, error handling, schema integrity, and performance SLAs.

## Instructions
When the user asks you to generate, review, or optimize API test cases:

### Manual API Test Case Generation
1. **Intake & API Specification Review:**
   - Ingest OpenAPI/Swagger docs, Postman collections, cURL commands, or endpoint specifications.
   - Identify base URLs, resource paths, HTTP methods, request/response schemas, headers, authentication schemes (Bearer, Basic Auth, API Key, Cookie), and query parameters.

2. **Apply Systematic API Test Design:**
   - **CRUD Lifecycle Coverage:** POST (Create) → GET (Read) → PUT (Full Update) → PATCH (Partial Update) → DELETE → GET (Verify 404).
   - **Status Code Validation:** Cover all relevant HTTP status codes (200, 201, 204, 400, 401, 403, 404, 405, 409, 422, 429, 500).
   - **Authentication & Authorization:** Valid tokens, expired tokens, missing tokens, wrong role tokens, revoked tokens.
   - **Request Payload Validation:** Missing required fields, extra fields, wrong data types, malformed JSON, empty body.
   - **Response Validation:** Schema conformance, field types, required properties, enums, nested objects, array structures.
   - **Query Parameters:** Filtering, pagination (page/limit/offset), sorting (asc/desc), search, and combinations.
   - **Performance SLA:** Response time assertions within acceptable thresholds.

3. **Ensure Full API Coverage:**
   - Consult `references/api-testing-checklist.md` for HTTP status codes, headers, security, schema, pagination, and performance checks.
   - Consult `references/boundary-edge-case-checklist.md` for numeric, string, date, and special character edge cases in payloads.

4. **Enforce Deduplication & Quality Rules:**
   - Adhere to `references/deduplication-rules.md`: No duplicate tests with cosmetically different payloads.
   - Each test case tests one distinct API behavior.

5. **Format Standardized API Test Cases:**
   - Use the template in `template.md`. The output document must follow the standard 2-tier structure:
     - **Document Overview** — API service name, type, base URL, authentication scheme, framework, version, scope.
     - **Test Execution Matrix & Summary** — Master index table: Test Case ID, Test Summary, Module / Resource, Priority, Severity, Test Type, Automation Status, Automated Test Spec.
     - **Detailed API Test Cases** — Grouped by **Module / Resource**, each test case containing:
       - **Test Case ID & Title:** e.g., `#### API-BOOK-01: Create Booking With Valid Payload`
       - **Test Objective:** Clear statement of API behavior being verified
       - **Priority | Severity | Test Type:** Single metadata line
       - **Endpoint:** `HTTP_METHOD /path`
       - **Preconditions:** Auth tokens, seed data, dependent API resources
       - **Request Details:** Headers, JSON Body, Query Parameters
       - **Test Steps:** Numbered request execution and verification steps
       - **Expected Results:** Numbered status code, response body assertions, headers, SLA
       - **Automated Mapping:** Spec file path (or N/A)
     - **Assumptions & Open Questions**
     - **Missing / Unclear API Specifications**

### Automated Test Script Generation (Playwright)
When the user explicitly asks for automation scripts:

1. **Use `request` fixture:** Pure API tests use `{ request }` from `@playwright/test` — no browser `page` fixture.
2. **Isolate Config:** Use `baseURL` from `playwright.config.ts` or `process.env.BASE_URL`.
3. **Dynamic Authentication:** Automate token generation in `beforeAll` hooks and inject into headers.
4. **CRUD Lifecycle:** Implement full entity lifecycles with deterministic test data and cleanup in `afterAll`.
5. **Assertions:** Status codes, response headers, payload field values, schema validation, response time SLAs.

## Context
- Manual test case template: `template.md` (in same directory).
- Automation config template: `templates/playwright.config.ts`.
- Working automation example: `examples/restful-booker.spec.ts`.
- API testing checklist: `references/api-testing-checklist.md`.
- Boundary checklist: `references/boundary-edge-case-checklist.md`.
- Deduplication rules: `references/deduplication-rules.md`.

## Example Output Format

### Test Execution Matrix & Summary
| Test Case ID | Test Summary | Module / Resource | Priority | Severity | Test Type | Automation Status | Automated Test Spec |
|---|---|---|---|---|---|---|---|
| **API-BOOK-01** | Create new booking with complete valid payload | Bookings | P1 | Critical | Functional | Automated | `tests/api/booking.spec.ts` |

### Detailed Test Cases (Grouped by Resource)
#### API-BOOK-01: Create New Booking With Complete Valid Payload
- **Test Objective**: Verify that POST /booking successfully creates a booking and returns 200 with generated booking ID.
- **Priority**: P1 (High) | **Severity**: Critical | **Test Type**: Functional
- **Endpoint**: `POST /booking`
- **Preconditions**: Base URL configured. Auth token generated if endpoint requires authorization.
- **Request Details**:
  - **Headers**: `Content-Type: application/json`, `Accept: application/json`
  - **Body**:
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "totalprice": 150,
      "depositpaid": true,
      "bookingdates": { "checkin": "2026-12-01", "checkout": "2026-12-10" }
    }
    ```
- **Test Steps**:
  1. Send `POST` request to `/booking` with valid booking payload.
  2. Inspect response status code and response time SLA.
  3. Validate JSON response schema and field values.
- **Expected Results**:
  1. HTTP Status code is `200 OK`.
  2. Response body contains numeric `bookingid > 0`.
  3. Response payload echoes `booking.firstname == "John"`.
  4. Response time is within SLA (< 2000ms).
- **Automated Mapping**: `tests/api/booking.spec.ts`

## Example Code Pattern (Automation)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Bookings API Suite', () => {
  let token: string;
  let bookingId: number;

  test.beforeAll(async ({ request }) => {
    const authResponse = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(authResponse.status()).toBe(200);
    token = (await authResponse.json()).token;
  });

  test('POST /booking - create booking', async ({ request }) => {
    const response = await request.post('/booking', {
      data: { firstname: 'John', lastname: 'Doe', totalprice: 150 },
    });
    expect(response.status()).toBe(200);
    bookingId = (await response.json()).bookingid;
    expect(bookingId).toBeGreaterThan(0);
  });
});
```

## Guardrails
- **No Flaky Tests:** Use explicit status assertions. No hardcoded waits or sleeps.
- **Credential Hygiene:** Never hardcode secrets or production tokens. Use environment variables.
- **No Hallucinated Endpoints:** Only test endpoints defined in the provided specification. Flag missing endpoints as open questions.
- **API Focus:** Test cases describe HTTP request/response behavior, not UI interactions.

## When to Use
- User asks: "write API test cases for these endpoints"
- User asks: "generate Playwright API tests for this Swagger spec"
- User asks: "create CRUD API test suite with auth and schema validation"
- User asks: "review API test coverage and find gaps"
- Automating CI/CD smoke, integration, or regression test packs
