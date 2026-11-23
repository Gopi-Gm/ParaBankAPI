# Sample RCA Reports

Worked examples for UI, API, and DB failures. Each report follows `template.md` and demonstrates a different classification so the agent does not default to "product bug".

---

## Example 1 — UI Product Defect

### RCA-UI-01: Frozen transfer button enabled due to status race

- **Test**: `TC-2.2` — Verify transfer functionality is disabled for frozen account (`tests/ui/multi-user-roles.spec.ts:84`)
- **Affected Tests**: `TC-2.2`
- **Layer**: `UI` → downstream `API`
- **Environment**: `qa` / `https://qaplayground.com` / `chromium` / `38ee519`
- **Status / Retries**: `failed` after `0` retries
- **Classification**: `product defect`
- **Symptom**: `expect(locator).toBeDisabled() failed` — button was enabled
- **Expected vs Actual**: Review Transfer disabled for `frozen_user` vs enabled

#### Root Cause

The Transfer page renders an enabled Review Transfer button before the account-status request resolves, and never re-disables it when the response reports `status: frozen`.

#### Evidence

| # | Artifact / Source | Observation | Proves |
|---|---|---|---|
| 1 | `test-results/.../trace.zip` | Button is enabled at assertion time; `GET /api/accounts` completes ~800 ms later | Assertion races the status request |
| 2 | `test-results/.../network` | `GET /api/accounts` → `200` `{"status":"frozen"}` | The backend correctly reports the frozen state |
| 3 | `tests/ui/multi-user-roles.spec.ts:102` | `expect(reviewTransferBtn).toBeDisabled()` timed out | The UI never applied the guard |

#### Hypotheses Considered

| Hypothesis | Expected Evidence If True | Observed | Verdict |
|---|---|---|---|
| Product defect — guard not applied after status load | Button remains enabled after `status: frozen` response | Trace shows enabled button after response | Confirmed |
| Test defect — wrong locator or user | Locator ambiguous or user not frozen | Single visible button; `frozen_user` account `status: frozen` | Rejected |
| Environment — API unavailable | 5xx/timeout on `/api/accounts` | `200` with correct payload | Rejected |

#### Ruled Out

- **Test defect** — `getByRole('button', { name: 'Review Transfer' })` resolves to one element, and the requirement says frozen accounts cannot transfer.
- **Environment** — Login and account fetch succeed; no 5xx or network error.

#### Recommended Fix

- **Fix**: Disable the button until the account request settles, and derive `disabled` from `account.status === 'frozen'` in the transfer form.
- **Owner**: `product`
- **Files / Components**: Transfer page/container and account-status hook.
- **Risk**: Ensure the button still enables for active accounts after the request resolves.

#### Verification

```bash
npx playwright test tests/ui/multi-user-roles.spec.ts -g "TC-2.2"
```

- **Pass Criteria**: Trace shows the button disabled immediately after the status response; test passes.

#### Confidence

`High` — deterministic reproduction with a direct trace and network artifact.

#### Prevention

- Add a test that asserts the button is disabled on first paint and remains disabled after the status request resolves.
- Add a component test for the `frozen` → `disabled` mapping.

---

## Example 2 — API Test Defect

### RCA-API-01: Order history assertion reads the wrong response field

- **Test**: `API-ORD-07` — Verify paginated order history returns 10 items (`tests/api/orders.spec.ts:63`)
- **Affected Tests**: `API-ORD-07`
- **Layer**: `API`
- **Environment**: `qa` / `https://api.qa.example.com/v2` / `node` / `a1b2c3d`
- **Status / Retries**: `failed` after `1` retry
- **Classification**: `test defect`
- **Symptom**: `TypeError: Cannot read properties of undefined (reading 'length')`
- **Expected vs Actual**: `body.items.length === 10` vs `items` is `undefined`

#### Root Cause

The test reads `body.items`, but API v2 returns the collection under `body.data`; the contract update renamed the field and the test was not updated.

#### Evidence

| # | Artifact / Source | Observation | Proves |
|---|---|---|---|
| 1 | `test-results/.../network` | `GET /v2/orders?limit=10` → `200` with `{"data":[...10 items...],"pagination":{...}}` | The endpoint works and returns 10 items |
| 2 | `tests/api/orders.spec.ts:63` | `expect(body.items.length).toBe(10)` | The assertion reads a non-existent field |
| 3 | OpenAPI `orders.yaml` | `OrderList.data` is the collection field | Contract confirms `data` |

#### Hypotheses Considered

| Hypothesis | Expected Evidence If True | Observed | Verdict |
|---|---|---|---|
| Test defect — stale response field | Response uses a different field name | Response has `data`, test reads `items` | Confirmed |
| Product defect — missing items | Response returns empty/missing collection | Response has 10 items under `data` | Rejected |
| Environment — wrong API version | 404/version mismatch | `200` from `/v2` | Rejected |

#### Ruled Out

- **Product defect** — the response contains exactly 10 items; only the field name differs.
- **Environment** — correct host, version, and auth; status `200`.

#### Recommended Fix

- **Fix**: Read `body.data.length` (or validate against the generated schema/type) instead of `body.items.length`.
- **Owner**: `test`
- **Files / Components**: `tests/api/orders.spec.ts`.
- **Risk**: Other tests may use the same stale field; run a schema-contract check.

#### Verification

```bash
npx playwright test tests/api/orders.spec.ts -g "API-ORD-07"
```

- **Pass Criteria**: Test passes; response schema validation confirms `data` is the collection field.

#### Confidence

`High` — direct response body and contract artifact.

#### Prevention

- Validate responses against the OpenAPI schema instead of hand-written field assertions.
- Add a contract test that fails when the response shape changes.

---

## Example 3 — DB Environment Issue

### RCA-DB-01: Migration not applied to the QA database

- **Test**: `DB-USR-04` — Deleting a user cascades to `user_roles` (`tests/db/users.spec.ts:88`)
- **Affected Tests**: `DB-USR-04`, `DB-USR-05`
- **Layer**: `DB`
- **Environment**: `qa` / `postgresql://qa-db.example.com:5432/userservice` / `psql 16` / `a1b2c3d`
- **Status / Retries**: `failed` after `0` retries
- **Classification**: `environment`
- **Symptom**: `ERROR: relation "user_roles" does not exist` (`SQLSTATE 42P01`)
- **Expected vs Actual**: Cascade delete succeeds vs table missing

#### Root Cause

Migration `20261120_create_user_roles` was not applied to the QA database, so the `user_roles` table and its cascade foreign key do not exist.

#### Evidence

| # | Artifact / Source | Observation | Proves |
|---|---|---|---|
| 1 | `tests/db/users.spec.ts:88` | `DELETE FROM users ...` fails with `42P01` | The target relation is missing |
| 2 | `schema_migrations` query | Latest applied migration is `20261118_add_users` | The new migration was never applied |
| 3 | `\d user_roles` | `Did not find any relation named "user_roles"` | Confirms the missing table |

#### Hypotheses Considered

| Hypothesis | Expected Evidence If True | Observed | Verdict |
|---|---|---|---|
| Environment — migration not applied | Migration table lacks the migration; relation missing | Migration absent; relation missing | Confirmed |
| Product defect — wrong cascade definition | Table exists but cascade missing | Table does not exist at all | Rejected |
| Test data — missing parent row | `23503` FK violation | `42P01` missing relation | Rejected |

#### Ruled Out

- **Product defect** — the migration file defines the table and cascade correctly; it was simply not deployed.
- **Test data** — the error is a missing relation, not a missing row.

#### Recommended Fix

- **Fix**: Apply pending migrations to QA as part of deployment, and add a pre-test migration check.
- **Owner**: `infra`
- **Files / Components**: CI deploy step / migration runner.
- **Risk**: Applying a migration to a shared environment; verify backup and rollback plan.

#### Verification

```bash
psql "$QA_DATABASE_URL" -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"
psql "$QA_DATABASE_URL" -c "\d user_roles"
npx playwright test tests/db/users.spec.ts -g "DB-USR-04"
```

- **Pass Criteria**: Migration `20261120_create_user_roles` is applied, the table exists, and the cascade test passes.

#### Confidence

`High` — direct SQLSTATE plus migration-state evidence.

#### Prevention

- Fail fast on startup if `schema_migrations` is behind the repository.
- Add a CI step that applies migrations to an ephemeral database before DB tests.

---

## Example 4 — UI Flaky / Test Isolation

### RCA-UI-02: Dashboard greeting fails only when the suite runs in parallel

- **Test**: `TC-6.2` — Verify admin dashboard access and personalized greeting (`tests/ui/multi-user-roles.spec.ts:298`)
- **Affected Tests**: `TC-6.2`, `TC-3.1`
- **Layer**: `UI`
- **Environment**: `qa` / `https://qaplayground.com` / `chromium` / `38ee519`
- **Status / Retries**: `flaky` — passes in isolation, fails with `workers > 1`
- **Classification**: `flaky/timing`
- **Symptom**: `expected "Welcome back, Admin"` but received `"Welcome back, Casey"`
- **Expected vs Actual**: Admin greeting vs another user's greeting

#### Root Cause

Tests share the same browser profile and `localStorage` auth key; a parallel worker overwrites the session, so the dashboard renders the previous worker's user.

#### Evidence

| # | Artifact / Source | Observation | Proves |
|---|---|---|---|
| 1 | `npx playwright test -g "TC-6.2"` | Passes with `--workers=1`, fails with `--workers=4` | Concurrency-dependent |
| 2 | `trace.zip` | `localStorage` `bank_session` contains `overdraft_user` during admin test | Session collision |
| 3 | `playwright.config.ts` | `workers: 1` comment cites localStorage collision | Known isolation gap |

#### Hypotheses Considered

| Hypothesis | Expected Evidence If True | Observed | Verdict |
|---|---|---|---|
| Flaky/timing — shared storage | Fails only in parallel; storage has wrong user | Reproduced; wrong session value | Confirmed |
| Product defect — wrong greeting | Greeting wrong for correct session | Session itself is wrong | Rejected |
| Test data — admin fixture missing | Login fails | Login succeeds as another user | Rejected |

#### Ruled Out

- **Product defect** — the app renders the user in the session; the session is wrong.
- **Test data** — credentials are valid; the wrong session is reused.

#### Recommended Fix

- **Fix**: Give each test an isolated `storageState`/context, or clear the auth key in `beforeEach` and keep `workers: 1` until isolation is proven.
- **Owner**: `test`
- **Files / Components**: `playwright.config.ts`, `tests/ui/*.spec.ts` setup.
- **Risk**: Parallelizing before isolation is fixed will reintroduce flakiness.

#### Verification

```bash
npx playwright test --workers=4
```

- **Pass Criteria**: Admin and overdraft tests both pass repeatedly with parallel workers.

#### Confidence

`High` — failure reproduces only under concurrency and the wrong session is visible in the trace.

#### Prevention

- Use per-test browser contexts with explicit `storageState`.
- Add a guard that asserts the logged-in user before each scenario.
