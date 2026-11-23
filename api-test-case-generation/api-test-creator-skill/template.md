# API Test Case Template

Use this format for all API test case deliverables. The document provides a master Test Execution Matrix followed by detailed test cases grouped by module/resource.

---

## Document Overview

- **Application Name**: `<API Service Name>`
- **Application Type**: `<REST API / GraphQL / gRPC>`
- **Base URL**: `<env>` (`<Base URL>`)
- **Authentication**: `<Bearer Token / API Key / Cookie / Basic Auth>`
- **Automation Framework**: `<Framework>` (e.g., Playwright with TypeScript)
- **Document Version**: `<X.Y.Z>`
- **Scope**: `<API testing scope — endpoints, CRUD operations, auth, error handling>`

---

## Test Execution Matrix & Summary

| Test Case ID | Test Summary | Module / Resource | Priority | Severity | Test Type | Automation Status | Automated Test Spec |
|---|---|---|---|---|---|---|---|
| `API-<MOD>-01` | `<Brief one-line summary>` | `<Resource>` | `P1/P2/P3` | `Critical/Major/Minor` | `Smoke/Functional/Negative/E2E/Boundary/Security/Schema/Performance/Regression` | `Automated/Planned/Manual` | `<spec file path or N/A>` |

---

## Detailed API Test Cases

### Module N: `<Resource / Endpoint Group>`

#### API-`<MOD>`-XX: `<Descriptive Test Title>`
- **Test Objective**: `<Clear statement of what this API test validates>`
- **Priority**: `<P1 (High) / P2 (Medium) / P3 (Low)>` | **Severity**: `<Critical / Major / Minor>` | **Test Type**: `<Functional / Negative / Boundary / Security / Schema Validation / Performance / E2E / Regression>`
- **Endpoint**: `<HTTP_METHOD> <path>` (e.g., `POST /api/v1/bookings`)
- **Preconditions**: `<Auth state, dependent resources, seed data>`
- **Request Details**:
  - **Headers**: `<Content-Type, Authorization, etc.>`
  - **Body**: `<JSON payload or N/A>`
  - **Query Params**: `<parameters or N/A>`
- **Test Steps**:
  1. `<Send request or setup action>`
  2. `<Observe response>`
  3. `<Verification step>`
- **Expected Results**:
  1. `<HTTP status code>`
  2. `<Response body assertions — field values, structure>`
  3. `<Response header checks, timing SLA>`
- **Automated Mapping**: `<spec file path>` *(include only when automation exists or is planned)*

---

## Column & Field Standards

| Field | Rules |
|---|---|
| **Test Case ID** | Pattern: `API-<MODULE_CODE>-<NN>`. Example: `API-BOOK-01`, `API-AUTH-03`. |
| **Test Summary** | One-line summary for the index table. |
| **Module / Resource** | API resource group: Authentication, Bookings, Users, Orders, etc. |
| **Test Objective** | Starts with a verb. Single API behavior per test case. |
| **Endpoint** | `HTTP_METHOD /path` with path parameters shown. |
| **Priority** | **P1** = core CRUD / auth. **P2** = error handling / edge. **P3** = performance / cosmetic. |
| **Severity** | **Critical** = auth bypass / data loss. **Major** = wrong response. **Minor** = formatting. |
| **Test Type** | `Functional`, `Negative`, `Boundary`, `Security`, `Schema Validation`, `Performance`, `E2E`, `Regression`. |
| **Request Details** | Full request spec: headers, body, query params. |
| **Test Steps** | Numbered actions: send request, observe response, verify. |
| **Expected Results** | Numbered: HTTP status, body assertions, header checks, timing. |

---

## Supplementary Sections

1. **Document Overview** — API context, base URL, authentication scheme.
2. **Test Execution Matrix & Summary** — Master index of all test cases.
3. **Detailed Test Cases** — Grouped by resource/endpoint with full specifications.
4. **Assumptions & Open Questions** — Missing endpoint details or undefined error responses.
5. **Missing / Unclear API Specifications** — Gaps in the provided API documentation.
