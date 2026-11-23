# Layer Evidence Checklist

Collect the artifacts for the layer where the assertion failed. Follow downstream layers only when the primary evidence points there.

## UI Failures

### Collect

- [ ] Playwright trace: `npx playwright show-trace test-results/<test>/trace.zip`
- [ ] Screenshot and video of the failure
- [ ] DOM / accessibility snapshot at the failing step
- [ ] Browser console messages (error, warning)
- [ ] Network waterfall with status codes and payloads
- [ ] Auth/session state (`storageState`, cookies, localStorage)
- [ ] Viewport, browser, device, zoom, and theme
- [ ] Test data and user role used
- [ ] Timing: animation, debounce, async request, `waitFor` state

### Ask

- Does the expected element exist in the DOM at all?
- Does the locator resolve to exactly one element, or is strict mode failing?
- Is the element hidden, detached, covered, or disabled at assertion time?
- Did the page finish loading data, or did the assertion race the request?
- Is `localStorage`/session state leaking between tests or workers?
- Did a third-party widget or feature flag change the UI?

### Common Causes

| Symptom | Likely Cause |
|---|---|
| `locator.click: element is not visible` | Element rendered later, covered by overlay, or wrong selector |
| `strict mode violation: resolved to N elements` | Locator too broad; scope to a test ID or role |
| `toBeDisabled()` timeout | Guard not applied, or button enabled until status loads |
| Passes in isolation, fails in suite | Storage/test-data collision, order dependency |
| Console `401/403` before failure | Expired token or wrong role fixture |

## API Failures

### Collect

- [ ] Full request: method, URL, headers, query, body
- [ ] Full response: status, headers, body, timing
- [ ] Correlation/request ID and server trace ID
- [ ] Auth token issue/expiry and scope
- [ ] OpenAPI/schema version and contract diff
- [ ] Rate-limit headers and retry-after
- [ ] Payload boundary values and content type
- [ ] Downstream service status if exposed
- [ ] Environment base URL and API version

### Ask

- Is the status code expected for this request, or is the assertion wrong?
- Is the response schema different from the contract (renamed/missing field)?
- Is the token expired, missing a scope, or from the wrong environment?
- Is the test data colliding with another test (unique constraint, duplicate create)?
- Did a rate limit, WAF, or gateway reject the request?
- Is the failure caused by a downstream DB/error surfaced as 500?

### Common Causes

| Symptom | Likely Cause |
|---|---|
| `401 Unauthorized` | Expired/invalid token, missing header, wrong environment |
| `403 Forbidden` | Role/scope mismatch or WAF rule |
| `422` on valid payload | Contract drift, required field added, type mismatch |
| `500` after a UI failure | Downstream DB/constraint error; trace the service log |
| Passes with Postman, fails in test | Header, auth, proxy, or serialization difference |
| Intermittent `429` | Rate limit; add pacing or isolate test data |

## DB Failures

### Collect

- [ ] Exact SQL and bound parameters
- [ ] SQLSTATE / vendor error code and message
- [ ] Constraint, index, and trigger definitions involved
- [ ] Transaction state, isolation level, and rollback behavior
- [ ] Migration version and applied migrations
- [ ] Seed/fixture state and row counts
- [ ] Referential integrity state (orphans, missing parents)
- [ ] DB user permissions and search path/schema
- [ ] Timing: locks, deadlocks, long-running transactions

### Ask

- Is the failure a constraint violation, a missing column/table, or a wrong result set?
- Was the migration applied to this environment?
- Is the fixture missing, stale, or shared with another test?
- Did the test leave an open transaction or uncommitted data?
- Is a trigger or cascade producing an unexpected side effect?
- Is the comparison affected by collation, timezone, precision, or NULL semantics?

### Common Causes

| SQLSTATE / Symptom | Likely Cause |
|---|---|
| `23505` unique violation | Duplicate fixture or missing cleanup |
| `23503` FK violation | Parent row missing or cascade order wrong |
| `23502` not-null violation | Fixture missing a required field |
| `42P01` undefined table | Migration not applied to the environment |
| `42703` undefined column | Schema drift or wrong migration version |
| `40001` serialization failure | Concurrent transaction; retry or isolate |
| `40P01` deadlock detected | Lock ordering issue or shared fixture |
| Wrong row count | Dirty data, missing teardown, or wrong filter |

## Cross-Layer Failures

When a UI failure is caused by an API or DB problem:

1. Confirm the layer where the assertion failed as **primary**.
2. Trace the request from the UI network log to the API, then to the DB error.
3. Report the downstream layer as a **contributing factor**, not a second root cause.
4. Verify the chain with timestamps: DB error → API 5xx → UI state.
5. Do not stop at the first error you see; stop at the first error that explains the assertion.

## Redaction Checklist

Before sharing artifacts:

- [ ] `Authorization`, `Cookie`, and `Set-Cookie` headers masked.
- [ ] API tokens, refresh tokens, and session IDs masked.
- [ ] Account numbers, card PANs, SSNs, emails, and names masked.
- [ ] Connection strings and passwords removed.
- [ ] Screenshots cropped or masked where PII is visible.
