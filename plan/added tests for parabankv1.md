# Version 1 (v1.0): ParaBank REST API Test Case Generation & Initial Playwright Test Suite

## 1. Overview & Objective
Initial phase of establishing automated testing for the **ParaBank Banking Platform** based on the official Swagger / OpenAPI specification:
- **Swagger Documentation URL**: `https://parabank.parasoft.com/parabank/api-docs/index.html`
- **Application Base URL**: `https://parabank.parasoft.com/parabank/services/bank`

The goal was to analyze all available microservices, generate a complete REST API test case matrix, and implement an automated Playwright test suite with high test coverage.

---

## 2. User Prompts & Triggers
1. *"use the swageer link, check how we can start the api tersting and write thye testcases. https://parabank.parasoft.com/parabank/api-docs/index.html"*
2. *"https://parabank.parasoft.com/parabank/api-docs/index.html this is swageerr url and we have multiple services. but testcases are created less, it's not covered fully."*

---

## 3. Scope & Services Discovered
Analysis of the Swagger specification identified 8 core banking microservices:
1. **Accounts Service** (`/accounts`): Account detail retrieval, balance checks, transactions listing, deposit, transfer, and withdraw.
2. **Customers Service** (`/customers`): Customer profiles, address update, customer account lookup.
3. **Transactions Service** (`/transactions`): Filter by account, date range, transaction type, and amount.
4. **Loans Service** (`/requestLoan`): Application submission, down payment ratios, credit score checks.
5. **Positions Service** (`/positions`): Portfolio stock holdings, trading (buy/sell).
6. **JMS Service** (`/sendJmsMessage`): Message broker submission and queue monitoring.
7. **BillPay Service** (`/billpay`): Automated external payee payments.
8. **Admin / Misc Service** (`/initializeDB`, `/cleanDB`, `/setParameter`): Database initialization and system parameter adjustments.

---

## 4. Key Deliverables & Changes Created

### A. Test Case Generation Matrix
- **File**: `api-test-case-generation/output/ParaBank_REST_API_Test_Cases.md`
- **Content**:
  - Detailed positive, negative, boundary, and edge test scenarios for all 8 microservices.
  - Pre-requisites, request payloads, headers, query parameters, expected status codes, response schemas, and assertion criteria.

### B. Automated Test Suite
- **File**: `api-test-case-generation/tests/api/parabank.spec.ts`
- **Content**:
  - 23 end-to-end automated API tests implemented in Playwright + TypeScript.
  - End-to-end test scenarios:
    - Customer profile verification
    - Account balance query and validation
    - Inter-account funds transfer workflow
    - Bill payment execution
    - Transaction history search with multiple query filters
    - Loan request approval and denial checks
    - Security headers (HSTS, Content-Type, X-Content-Type-Options)
    - Response time latency SLA checks (< 2500ms)
    - Error handling (400 Bad Request, 404 Not Found, 401 Unauthorized)

### C. Execution & Verification
- Tests executed against live endpoints:
  ```bash
  npx playwright test tests/api/parabank.spec.ts
  ```
- **Result**: All 23 tests executed and passed cleanly.
