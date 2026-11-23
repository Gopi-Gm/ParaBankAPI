# Root Cause Analysis (RCA) Report Template

Use this format for every failure analysis. The report starts with a document overview and a failure index, followed by one detailed RCA per distinct failure signature.

---

## Document Overview

- **Application Name**: `<Application Name>`
- **Test Layer(s)**: `<UI / API / DB / Mixed>`
- **Target Environment**: `<env>` (`<baseURL or connection target>`)
- **Build / Commit**: `<commit SHA or release>`
- **Test Run**: `<run ID, date/time, browser, worker count>`
- **Document Version**: `<X.Y.Z>`
- **Scope**: `<failed tests or modules covered by this analysis>`

---

## Failure Index

| RCA ID | Test ID | Layer | Failure Summary | Classification | Confidence | Owner |
|---|---|---|---|---|---|---|
| `RCA-UI-01` | `TC-UI-14` | `UI` | `<one-line symptom>` | `product defect` | `High` | `product` |
| `RCA-API-01` | `API-ORD-07` | `API` | `<one-line symptom>` | `test defect` | `Medium` | `test` |
| `RCA-DB-01` | `DB-USR-04` | `DB` | `<one-line symptom>` | `environment` | `High` | `infra` |

---

## Detailed Root Cause Analysis

### RCA-`<LAYER>`-`<NN>`: `<Short failure title>`

- **Test**: `<test id>` — `<test title>` (`<spec file>:<line>`)
- **Affected Tests**: `<additional test IDs sharing this cause, or N/A>`
- **Layer**: `UI | API | DB` → `<downstream layer if applicable>`
- **Environment**: `<env>` / `<baseURL>` / `<browser>` / `<commit>`
- **Status / Retries**: `<failed | timedOut | interrupted | flaky>` after `<N>` retries
- **Classification**: `product defect | test defect | environment | test data | flaky/timing | requirement gap | tooling/config`
- **Symptom**: `<what the assertion reported, quoted exactly>`
- **Expected vs Actual**: `<expected>` vs `<actual>`

#### Root Cause

`<One specific, falsifiable sentence naming the mechanism.>`

#### Evidence

| # | Artifact / Source | Observation | Proves |
|---|---|---|---|
| 1 | `<trace.zip path>` | `<what the trace shows at the failing step>` | `<the mechanism>` |
| 2 | `<HTTP exchange or SQLSTATE>` | `<status/headers/body or error code>` | `<the mechanism>` |
| 3 | `<console/screenshot path>` | `<exact message>` | `<the mechanism>` |

#### Hypotheses Considered

| Hypothesis | Expected Evidence If True | Observed | Verdict |
|---|---|---|---|
| `<product defect>` | `<evidence>` | `<evidence>` | `confirmed / rejected` |
| `<test defect>` | `<evidence>` | `<evidence>` | `confirmed / rejected` |
| `<environment/data>` | `<evidence>` | `<evidence>` | `confirmed / rejected` |

#### Ruled Out

- `<hypothesis>` — `<why the evidence eliminates it>`

#### Recommended Fix

- **Fix**: `<smallest correct change>`
- **Owner**: `<product / test / infra / data>`
- **Files / Components**: `<paths or services, if known>`
- **Risk**: `<regression or side effects to watch>`

#### Verification

```bash
<exact command or request/SQL that proves the fix>
```

- **Pass Criteria**: `<expected result after the fix>`

#### Confidence

`High | Medium | Low` — `<reason and any missing evidence>`

#### Prevention

- `<test, contract, fixture, monitoring, or coverage gap to close>`

---

## Missing Evidence

List anything that could change the conclusion:

- `<artifact not provided>`
- `<environment or data state unknown>`
- `<reproduction not attempted>`

---

## Field Standards

| Field | Rules |
|---|---|
| **RCA ID** | Pattern: `RCA-<LAYER>-<NN>`. Examples: `RCA-UI-01`, `RCA-API-03`, `RCA-DB-02`. Stable and sequential per layer. |
| **Test ID** | Must match the automation test ID (`TC-UI-01`, `API-<MOD>-01`, `DB-<MOD>-01`). |
| **Layer** | The layer where the assertion failed; list downstream layers separately. |
| **Classification** | One of: product defect, test defect, environment, test data, flaky/timing, requirement gap, tooling/config. |
| **Symptom** | Exact assertion/error text. Do not paraphrase. |
| **Root Cause** | One mechanism, not a list of symptoms. Must be falsifiable. |
| **Evidence** | Every row cites a real artifact, status code, SQLSTATE, selector, or stack frame. |
| **Hypotheses** | At least three, covering product, test, and environment/data. |
| **Confidence** | High = reproduced + direct evidence; Medium = indirect but consistent; Low = circumstantial or incomplete. |
| **Owner** | product, test, infra, or data — the team that should fix it. |
| **Verification** | A command or step that fails before the fix and passes after it. |
| **Prevention** | The gap that allowed the failure or the late detection. |

---

## Reporting Rules

1. One RCA per distinct failure signature; group duplicates under `Affected Tests`.
2. Redact secrets, tokens, cookies, account numbers, and PII.
3. Do not propose a fix until the evidence table is complete.
4. If confidence is Low, label the conclusion a **hypothesis** and list the missing evidence.
5. Report the layer where the assertion failed as primary; downstream layers are contributing factors.
