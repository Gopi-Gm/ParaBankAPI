# Sample Output

## Document Overview
- **Application Name**: ParaBank Core Services
- **Application Type**: REST API
- **Target Environment**: `staging` (`https://parabank.parasoft.com/parabank/services/bank`)
- **Automation Framework**: Playwright (APIRequestContext)
- **Document Version**: 1.0.0
- **Scope**: REST API endpoints — Customer management, Account services, and Transactions.

---

## Test Execution Matrix & Summary

| Test Case ID | Test Summary | Module | Priority | Severity | Test Type | Automation Status | Automated Test Spec |
|---|---|---|---|---|---|---|---|
| **API-CUST-01** | Retrieve customer details by valid Customer ID | Customers | P1 | Critical | Functional | Automated | `tests/api/parabank.spec.ts` |
| **API-CUST-02** | Retrieve customer with non-existent ID returns 404/400 | Customers | P2 | Major | Negative | Automated | `tests/api/parabank.spec.ts` |
| **API-ACCT-01** | Retrieve customer accounts list | Accounts | P1 | Critical | Functional | Automated | `tests/api/parabank.spec.ts` |
| **API-ACCT-02** | Transfer funds between two valid accounts | Accounts | P1 | Critical | Functional | Automated | `tests/api/parabank.spec.ts` |

---

## Detailed Test Cases

### Module 1: Customers API

#### API-CUST-01: Retrieve Customer Details by Valid Customer ID
- **Test Objective**: Verify that GET `/customers/{id}` returns correct customer profile data and HTTP 200.
- **Priority**: P1 (High) | **Severity**: Critical | **Test Type**: Functional
- **Preconditions**: Customer `12212` exists in the system.
- **Test Steps**:
  1. Send `GET /customers/12212` with header `Accept: application/json`.
- **Expected Results**:
  1. HTTP status code is 200 OK.
  2. Response body contains valid customer details matching ID `12212`.
  3. Response contains `id`, `firstName`, `lastName`, and address fields.
- **Automated Mapping**: `tests/api/parabank.spec.ts`

---

#### API-CUST-02: Retrieve Customer With Non-Existent ID
- **Test Objective**: Verify error handling when querying an invalid customer ID.
- **Priority**: P2 (Medium) | **Severity**: Major | **Test Type**: Negative
- **Preconditions**: None.
- **Test Steps**:
  1. Send `GET /customers/99999999` with header `Accept: application/json`.
- **Expected Results**:
  1. HTTP status code is 400 or 404.
  2. Error message clearly indicates customer was not found.
- **Automated Mapping**: `tests/api/parabank.spec.ts`

---

### Module 2: Accounts API

#### API-ACCT-01: Retrieve Customer Accounts List
- **Test Objective**: Verify that GET `/customers/{id}/accounts` returns all active accounts.
- **Priority**: P1 (High) | **Severity**: Critical | **Test Type**: Functional
- **Preconditions**: Customer `12212` exists.
- **Test Steps**:
  1. Send `GET /customers/12212/accounts` with header `Accept: application/json`.
- **Expected Results**:
  1. HTTP status code is 200 OK.
  2. Non-empty array of accounts is returned.
- **Automated Mapping**: `tests/api/parabank.spec.ts`
