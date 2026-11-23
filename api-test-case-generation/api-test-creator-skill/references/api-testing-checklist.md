# API Testing Checklist

Use this checklist when designing and verifying automated REST API test suites.

---

## 1. HTTP Status Code Validation
- [ ] **200 OK:** Successful GET, PUT, or PATCH request returning data.
- [ ] **201 Created:** Successful POST resource creation (returns location header or ID).
- [ ] **204 No Content:** Successful DELETE or PUT with empty response body.
- [ ] **400 Bad Request:** Malformed JSON body, missing mandatory field, invalid data types.
- [ ] **401 Unauthorized:** Missing, expired, or invalid authentication credentials/token.
- [ ] **403 Forbidden:** Authenticated user lacks permission to access/modify resource.
- [ ] **404 Not Found:** Endpoint URL does not exist or resource ID not found.
- [ ] **405 Method Not Allowed:** Using GET on POST-only endpoint.
- [ ] **409 Conflict:** Attempting to create a duplicate unique entity.
- [ ] **422 Unprocessable Entity:** Syntactically valid JSON failing business validation rules.
- [ ] **429 Too Many Requests:** Rate limit / throttling threshold exceeded.
- [ ] **500 Internal Server Error:** Verify server handles unexpected crashes gracefully without leaking stack traces.

## 2. Response Headers & Security
- [ ] **Content-Type:** Asserts correct MIME type (e.g. `application/json; charset=utf-8`).
- [ ] **Security Headers:** Verify presence of `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`.
- [ ] **CORS Headers:** `Access-Control-Allow-Origin` headers behave according to environment policy.
- [ ] **Sensitive Data Leakage:** Ensure tokens, passwords, database errors, and system internal paths are never exposed in error responses.

## 3. Data Integrity & Schema Validation
- [ ] **Schema Conformance:** Response body conforms to JSON Schema (validating datatypes, required properties, enums, array structures).
- [ ] **Field Boundaries:** Boundary testing on numeric amounts, string lengths, date boundaries.
- [ ] **Date/Time Standard:** ISO-8601 formatting (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- [ ] **Null vs. Empty vs. Omitted:** Consistent handling of null fields, empty arrays `[]`, and empty objects `{}`.

## 4. Query Parameters, Pagination & Sorting
- [ ] **Filtering:** Filter by single and combined criteria (e.g. `?status=active&category=electronics`).
- [ ] **Pagination:** Page number, page limit, total records count, and handling `page=99999` (empty array response).
- [ ] **Sorting:** Ascending and descending sort by multiple fields (`?sort=createdAt:desc`).
- [ ] **Search:** Fuzzy search, exact match, case sensitivity, and special character sanitization.

## 5. Performance & Reliability
- [ ] **Response Time SLA:** Response latency falls within acceptable thresholds (e.g. < 500ms for read, < 1500ms for mutation).
- [ ] **Idempotency:** Repeating identical GET, PUT, or DELETE calls produces identical resulting state.
- [ ] **Concurrent Requests:** Verify data integrity under simultaneous modifications to the same entity.
