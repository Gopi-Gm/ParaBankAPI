# Version 3 (v3.0): Enterprise Modular Framework Architecture (Playwright + TypeScript)

## 1. Overview & Objective
In Version 3, the root framework was re-architected into a multi-layered, enterprise-grade REST API automation framework modeled after the reference blueprint `Framework-Step-By-Step.md` and production patterns from `Playwright_Opencart_AI`.

The monolithic test files were decomposed into dedicated microservice spec files, centralized routing, compiled AJV JSON schema validators, environment variable isolation, and custom rate-limiting mitigation.

---

## 2. User Prompts & Triggers
1. *"@[d:\ParaBank\Framework-Step-By-Step.md] Use the Framework-Step-By-Step.md document as a reference and implement only the Playwright API Testing Module. Leave the UI and database modules unchanged. Ensure that all required components are added and that everything is properly balanced and integrated with the existing framework."*
2. *"use this terstcases and add the playwright tests and remove alreday added testcases.@[d:\ParaBank\qa-test-case-generation\output\ParaBank_REST_API_Test_Cases.md]"*
3. *"run the api tests"*
4. *"run the tests"*

---

## 3. Structural & Architectural Enhancements

### A. Centralized Route Catalog (`api/endpoints/routes.ts`)
- Replaced hardcoded URL strings with strongly-typed endpoint constants:
  - `ROUTES.ACCOUNTS` (query, balance, transfer, deposit, withdraw)
  - `ROUTES.CUSTOMERS` (details, update)
  - `ROUTES.TRANSACTIONS` (by ID, by date range, by amount, by type)
  - `ROUTES.LOANS` (request loan)
  - `ROUTES.POSITIONS` (portfolio, buy/sell)
  - `ROUTES.JMS` (send message)
  - `ROUTES.BILLPAY` (submit payment)
  - `ROUTES.ADMIN` (initializeDB, cleanDB, parameters)

### B. Contract Validation with AJV (`api/schemas/` & `tests/api/schemas.spec.ts`)
- Added Draft-07 JSON Schemas:
  - `customer_schema.json`
  - `account_schema.json`
  - `transaction_schema.json`
  - `loan_schema.json`
  - `position_schema.json`
  - `billpay_schema.json`
- Integrated AJV validator to enforce strict API response contract adherence.

### C. Auto-Pacing Fixture & Rate-Limit Shield (`fixtures/apiFixture.ts`)
- **Problem**: Public demo server sits behind Cloudflare WAF which throttles rapid bursts (HTTP 429 / Error 1015).
- **Solution**: Implemented custom `apiFixture.ts` that automatically introduces an 800ms inter-test pause, ensuring smooth sequential test execution without WAF tripping.

### D. Single-Worker Safe Execution (`playwright.config.ts`)
- Configured `workers: 1` and `fullyParallel: false` to ensure atomic state transitions across tests (e.g. transfer followed by balance verification).

### E. Microservice Spec Files (`tests/api/`)
Created 9 dedicated test specifications:
1. `accounts.spec.ts` (11 tests: creation, balance check, deposit, withdraw, transfer)
2. `customers.spec.ts` (customer detail lookup, update profile)
3. `transactions.spec.ts` (transaction search by date, amount, type)
4. `loans.spec.ts` (loan application approval and down-payment rules)
5. `positions.spec.ts` (stock portfolio and share transactions)
6. `jms.spec.ts` (message broker connectivity)
7. `misc.spec.ts` (database reset and configuration parameters)
8. `schemas.spec.ts` (full AJV contract compliance verification)
9. `security-performance.spec.ts` (IDOR checks, security headers, response time < 2000ms SLA)

---

## 4. Verification & Outcome
- Ran full regression suite:
  ```bash
  npm run test:api
  ```
- All test suites passing reliably with detailed reporting and zero rate-limiting failures.
