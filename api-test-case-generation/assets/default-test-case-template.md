# Default Test Case Document Template

Use this format for all test case deliverables. This structure provides a master summary index followed by detailed individual test cases grouped by module.

---

## Document Overview

- **Application Name**: `<Application Name>`
- **Application Type**: `<Web App / Mobile App / API Service / Desktop App>`
- **Target Environment**: `<env>` (`<URL or deployment target>`)
- **Automation Framework**: `<Framework with language>` (e.g., Playwright with TypeScript & POM)
- **Document Version**: `<X.Y.Z>`
- **Scope**: `<Brief description of testing scope and modules covered>`

---

## Test Execution Matrix & Summary

| Test Case ID | Test Summary | Module | Priority | Severity | Test Type | Automation Status | Automated Test Spec |
|---|---|---|---|---|---|---|---|
| `TC-<MOD>-01` | `<Brief one-line summary>` | `<Module Name>` | `P1/P2/P3` | `Critical/Major/Minor` | `Smoke/Sanity/Functional/Negative/E2E/Regression/UI-UX/Data-Driven/Resilience` | `Automated/Planned/Manual` | `<spec file path or N/A>` |

---

## Detailed Test Cases

### Module N: `<Module Name>`

#### TC-`<MOD>`-XX: `<Descriptive Test Title>`
- **Test Objective**: `<Clear statement of what this test validates>`
- **Priority**: `<P1 (High) / P2 (Medium) / P3 (Low)>` | **Severity**: `<Critical / Major / Minor>` | **Test Type**: `<Smoke / Sanity / Functional / Negative / E2E / Regression / UI-UX / Data-Driven / Resilience / Boundary / Security / Permission>`
- **Preconditions**: `<Required state before step 1 — user role, navigation, data, auth>`
- **Test Steps**:
  1. `<Concrete action 1>`
  2. `<Concrete action 2>`
  3. `<Verification action>`
- **Expected Results**:
  1. `<Specific, observable outcome 1>`
  2. `<Specific, observable outcome 2>`
- **Automated Mapping**: `<spec file path>` *(include only when automation exists or is planned)*

---

## Field Guidance

- `Test Case ID`: Unique stable ID using pattern `TC-<MODULE_CODE>-<NN>`. Examples: `TC-UI-01`, `API-BOOK-01`, `DB-USR-01`.
- `Test Summary`: One-line summary of the test objective for the index table.
- `Module`: The functional module, screen, or component under test.
- `Test Objective`: Clear statement starting with a verb (Verify, Validate, Ensure, Confirm). One objective per test case.
- `Priority`: **P1 (High)** = core path / blocker. **P2 (Medium)** = important but not blocking. **P3 (Low)** = cosmetic / minor.
- `Severity`: **Critical** = system crash, data loss, security flaw. **Major** = core feature failure. **Minor** = edge case or cosmetic.
- `Test Type`: Use categories: `Smoke`, `Sanity`, `Functional`, `Negative`, `E2E`, `Regression`, `UI/UX`, `Data-Driven`, `Resilience`, `Boundary`, `Security`, `Permission`, `Schema Validation`, `CRUD`, `Integration`.
- `Preconditions`: State required before execution — user role, logged-in status, existing data, navigation path, cart state.
- `Test Steps`: Numbered, concrete, executable actions. Each step should be one user action or verification.
- `Expected Results`: Numbered, specific, observable outcomes. Avoid "works correctly" — state exact messages, URLs, element states, or data values.
- `Automation Status`: `Automated` = test script exists and runs. `Planned` = planned for automation. `Manual` = manual-only execution.
- `Automated Test Spec`: File path to the automation spec file (e.g., `tests/web/products.spec.ts`). Write `N/A` if manual-only.
