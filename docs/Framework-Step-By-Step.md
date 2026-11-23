# 🏦 ParaBank REST API Playwright + TypeScript Automation Framework

# Step-By-Step Guide

## Building an Enterprise REST API Automation Framework with Playwright and TypeScript

### Introduction

This guide walks you step by step through setting up a complete automated REST API testing framework using **Playwright**, **TypeScript**, and **AJV JSON Schema Validation** for the **ParaBank Banking Platform** (`https://parabank.parasoft.com/parabank/services/bank`). It also details how an AI coding agent (such as Antigravity, Claude Code, GitHub Copilot, or Cursor) can be leveraged to generate configuration, endpoint definitions, schemas, utilities, and tests.

The framework is engineered specifically for testing stateful banking microservices, incorporating sequential single-worker execution to prevent race conditions and an automatic test pacing fixture to avoid Cloudflare WAF burst rate limits (HTTP 429 / Error 1015).

---

## How to Read This Document

- **PROMPT** sections contain text you can copy and paste into your AI coding agent (Antigravity, Claude Code, Cursor, Copilot).
- **Code** sections contain file contents or commands to execute in your terminal.
- **Note** sections call out important warnings, rate-limiting guards, and API subtleties.
- **Why this matters** sections explain the design rationale behind each architectural layer.

---

# Glossary: Key Terms Used in This Guide

| Term | What it means |
| :--- | :--- |
| **Node.js** | The JavaScript/TypeScript runtime required to run Playwright and npm dependencies. |
| **npm** | Node Package Manager, used to install libraries and manage project test scripts. |
| **Playwright** | A unified testing engine by Microsoft. In this framework, Playwright's `APIRequestContext` (`request`) context provides high-speed, lightweight HTTP/REST validation. |
| **TypeScript** | Typed superset of JavaScript providing compile-time type safety, IDE autocompletion, and maintainability. |
| **AJV (Another JSON Schema Validator)** | Ultra-fast JSON schema validator used to enforce strict contract compliance against draft-07 JSON schemas. |
| **Cloudflare WAF / Burst Guard** | Public demo endpoints (like Parasoft ParaBank) restrict traffic to ~60 req/min. The custom pacing fixture in `fixtures/apiFixture.ts` prevents rate-limit errors. |
| **Fixtures (`fixtures/`)** | Reusable test setup and teardown hooks. In this framework, `apiFixture.ts` extends Playwright test with automatic inter-test delay pacing. |
| **Routes Constant (`api/endpoints/`)** | A centralized catalog of all REST URI paths, eliminating hardcoded URLs in test specifications. |
| **Allure Report** | Rich interactive HTML test reporting framework displaying step timelines, charts, and attachments. |
| **CI/CD** | Automated pipeline (GitHub Actions / Jenkins) executing regression suites on push or scheduled triggers. |
| **Docker** | Containerization tool packaging tests and dependencies for isolated, reproducible execution across environments. |
| **`.env` file** | Environment file isolating base URLs, customer credentials, and bank account numbers from git. |

---

# Prerequisites

Before building the framework, ensure the following tools are installed:

1. **Node.js (LTS version 18 or higher)** — https://nodejs.org/
2. **Visual Studio Code** — https://code.visualstudio.com/
3. **AI Coding Agent** — Antigravity, Claude Code, Cursor, or GitHub Copilot.

---

## Initialize Playwright Project

Open a terminal in your project root:

```powershell
npm init playwright@latest
```

Choose the following options when prompted:
- **Do you want to use TypeScript or JavaScript?** → `TypeScript`
- **Where to put your end-to-end tests?** → `tests`
- **Add a GitHub Actions workflow? (Y/n)** → `true`
- **Install Playwright browsers?** → `false` *(Browsers are not required for headless REST API testing, saving disk space)*

---

## Install Framework Dependencies

Create a batch script named `env_setup.bat` in the project root:

```bat
npm install dotenv
npm install @faker-js/faker
npm install luxon
npm install ajv csv-parse xlsx
npm install allure-playwright
npm install -D @types/node
```

Execute `env_setup.bat` to install all dependencies.

### Dependency Breakdown:
- `dotenv`: Loads environment configurations from `.env`.
- `@faker-js/faker`: Generates synthetic customer names, addresses, and transaction amounts.
- `ajv`: Compiles JSON schemas to validate API response payloads.
- `allure-playwright`: Generates rich Allure execution reports.
- `luxon`, `csv-parse`, `xlsx`: Utilities for date formatting and data-driven testing.

---

# Step by Step: Building the Framework

Follow these 13 steps in order to construct the complete ParaBank REST API framework.

---

## Step 1 — Create Project Folder Structure

> **Why this matters:** A structured architecture cleanly separates route constants, schema contracts, fixtures, test specifications, and reporting.

### PROMPT — Copy/Paste to Your AI Agent

```text
Create the required folder and file structure for the ParaBank REST API Playwright + TypeScript automation framework.

Requirements:
- Target root: ParaBank
- api/
  - endpoints/routes.ts: Centralized endpoint constants for all 8 ParaBank services
  - schemas/: AJV JSON schema definitions
- fixtures/
  - apiFixture.ts: Playwright test fixture with automatic Cloudflare WAF pacing delay
- tests/api/: Dedicated test suites covering Accounts, Customers, Transactions, Loans, Positions, Misc/Auth, JMS, Schemas, Security/Performance
- utils/: Custom reporters, synthetic data generators, and data readers
- Configuration files: playwright.config.ts, tsconfig.json, .env.example, .gitignore
```

### Target Structure:

```
ParaBank/
├── .env                          # Local environment variables & secrets
├── .env.example                  # Sanitized template for environment configuration
├── .gitignore                    # Git exclusions
├── package.json                  # Scripts and dependencies
├── playwright.config.ts          # Central Playwright runner configuration
├── tsconfig.json                 # TypeScript compiler options
│
├── api/
│   ├── endpoints/
│   │   └── routes.ts             # Route catalog for 8 ParaBank microservices
│   └── schemas/                  # AJV JSON response validation schemas
│       ├── account_schema.json
│       ├── billpay_schema.json
│       ├── customer_schema.json
│       ├── loan_schema.json
│       ├── position_schema.json
│       └── transaction_schema.json
│
├── fixtures/
│   └── apiFixture.ts             # Test runner with auto-pacing Cloudflare guard
│
├── tests/
│   └── api/                      # 8-service REST API test specifications
│       ├── accounts.spec.ts
│       ├── customers.spec.ts
│       ├── jms.spec.ts
│       ├── loans.spec.ts
│       ├── misc.spec.ts
│       ├── positions.spec.ts
│       ├── schemas.spec.ts
│       ├── security-performance.spec.ts
│       └── transactions.spec.ts
│
├── testdata/                     # External JSON/CSV test data
├── utils/
│   ├── CustomReporter.ts         # Real-time styled HTML dashboard reporter
│   ├── DataReader.ts             # JSON, CSV, and XLSX file reader
│   ├── dataGenerator.ts          # Faker-backed synthetic test data generator
│   └── helper.ts                 # Formatting & calculation utilities
├── reports/                      # Standard Playwright & JUnit reports
└── allure-results/               # Raw Allure test result artifacts
```

---

## Step 2 — Configuration Files

### 1. `playwright.config.ts`

Configure Playwright specifically for ParaBank REST API execution. Note the **single worker** and **`fullyParallel: false`** configuration, which prevents race conditions against live bank account balances and database resets:

```ts
import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ override: true });

export default defineConfig({
  timeout: 60 * 1000,
  testDir: "./tests",
  fullyParallel: false, // Sequential execution prevents race conditions against live stateful demo bank
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker avoids database reset collision and WAF triggers
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "reports" }],
    ["junit", { outputFile: "reports/results.xml" }],
    ["./utils/CustomReporter.ts"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],
  use: {
    baseURL: process.env.API_BASE_URL || "https://parabank.parasoft.com/parabank/services/bank",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "Accept": "application/json, text/plain, */*",
    },
  },
});
```

### 2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "lib": ["ES2022"],
    "moduleResolution": "node16",
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": false,
    "outDir": "dist"
  },
  "include": ["playwright.config.ts", "api/**/*.ts", "fixtures/**/*.ts", "tests/**/*.ts", "utils/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. `.env.example` and `.env`

Create `.env.example`:

```ini
# 🌍 ENVIRONMENT
APP_ENV=qa

### 🔌 PARABANK REST API CONFIGURATION ###
API_BASE_URL=https://parabank.parasoft.com/parabank/services/bank
PARABANK_USERNAME=john
PARABANK_PASSWORD=demo
CUSTOMER_ID=12212
PRIMARY_ACCOUNT_ID=12345
SECONDARY_ACCOUNT_ID=12456
LOAN_PROVIDER=funds
```

Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

---

## Step 3 — Centralized Routes (`api/endpoints/routes.ts`)

> **Why this matters:** Centralizing endpoints prevents route drift and facilitates easy environment or path updates across test suites.

```ts
/**
 * ParaBank REST API Centralized Routes
 * Base URL: https://parabank.parasoft.com/parabank/services/bank
 * Swagger: https://parabank.parasoft.com/parabank/api-docs/index.html
 */
export const Routes = {
  BASE_URL: process.env.API_BASE_URL || 'https://parabank.parasoft.com/parabank/services/bank',

  url(endpoint: string): string {
    const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.BASE_URL}${clean}`;
  },

  // Service 1: Database Operations
  INITIALIZE_DB: '/initializeDB',
  CLEAN_DB: '/cleanDB',

  // Service 2: Misc Operations (Auth & Settings)
  LOGIN: '/login/{username}/{password}',
  SET_PARAMETER: '/setParameter/{name}/{value}',

  // Service 3: Customers Operations
  GET_CUSTOMER: '/customers/{customerId}',
  UPDATE_CUSTOMER: '/customers/update/{customerId}',
  GET_CUSTOMER_ACCOUNTS: '/customers/{customerId}/accounts',
  CREATE_ACCOUNT: '/createAccount',

  // Service 4: Accounts Operations
  GET_ACCOUNT: '/accounts/{accountId}',
  DEPOSIT: '/deposit',
  WITHDRAW: '/withdraw',
  TRANSFER: '/transfer',
  BILL_PAY: '/billpay',

  // Service 5: Transactions Operations
  GET_ACCOUNT_TRANSACTIONS: '/accounts/{accountId}/transactions',
  GET_TRANSACTION: '/transactions/{transactionId}',
  FILTER_TRANSACTIONS_BY_AMOUNT: '/accounts/{accountId}/transactions/amount/{amount}',
  FILTER_TRANSACTIONS_BY_MONTH_TYPE: '/accounts/{accountId}/transactions/month/{month}/type/{type}',
  FILTER_TRANSACTIONS_BY_DATE_RANGE: '/accounts/{accountId}/transactions/fromDate/{from}/toDate/{to}',
  FILTER_TRANSACTIONS_BY_DATE: '/accounts/{accountId}/transactions/onDate/{onDate}',

  // Service 6: Loans Operations
  REQUEST_LOAN: '/requestLoan',

  // Service 7: Positions Operations (Stock Trading)
  BUY_POSITION: '/customers/{customerId}/buyPosition',
  SELL_POSITION: '/customers/{customerId}/sellPosition',
  GET_POSITION: '/positions/{positionId}',
  GET_POSITION_HISTORY: '/positions/{positionId}/{startDate}/{endDate}',
  GET_CUSTOMER_POSITIONS: '/customers/{customerId}/positions',

  // Service 8: JMS Message Service
  STARTUP_JMS: '/startupJmsListener',
  SHUTDOWN_JMS: '/shutdownJmsListener',
};
```

---

## Step 4 — Contract Validation Schemas (`api/schemas/`)

Define AJV draft-07 JSON schemas for each response object model:

- `account_schema.json`: Validates `id`, `customerId`, `type` (`CHECKING`, `SAVINGS`, `LOAN`), and float `balance`.
- `customer_schema.json`: Enforces `firstName`, `lastName`, `address`, `ssn`, and phone strings.
- `transaction_schema.json`: Validates `id`, `accountId`, `type`, `date`, and monetary `amount`.
- `loan_schema.json`: Validates `responseDate`, `loanProviderName`, boolean `approved`, and optional `accountId`.
- `position_schema.json`: Validates stock `positionId`, `name`, `shares`, and purchase price.
- `billpay_schema.json`: Validates payment acknowledgement structure and payee transaction details.

---

## Step 5 — Cloudflare WAF Pacing Fixture (`fixtures/apiFixture.ts`)

> **Why this matters:** ParaBank's shared live environment is protected by Cloudflare rate limiters. Firing unthrottled API requests results in `HTTP 429` / `Cloudflare 1015`. This fixture automatically injects controlled inter-test pacing.

```ts
import { test as base, expect } from '@playwright/test';

/**
 * Custom Playwright test fixture that enforces automatic request pacing.
 * Public shared demo servers (like ParaBank on Parasoft) are protected by Cloudflare WAF
 * with strict burst rate limiting (Cloudflare Error 1015 / HTTP 429).
 * This fixture adds an automatic delay after each test to maintain a sustainable request rate.
 */
export const test = base.extend<{ pacing: void }>({
  pacing: [
    async ({}, use) => {
      await use();
      // Delay 1200ms locally (2000ms in CI) to stay safely below Cloudflare's rate limit
      const delayMs = process.env.CI ? 2000 : 1200;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    },
    { auto: true },
  ],
});

export { expect };
```

---

## Step 6 — Utilities & Test Data Generation (`utils/`)

Implement reusable utilities in `utils/`:
1. `CustomReporter.ts`: Generates a real-time standalone HTML execution dashboard with pass/fail metrics.
2. `dataGenerator.ts`: Faker-powered generation for customer profiles, random transfer amounts, payee details, and loan requests.
3. `DataReader.ts`: Reads external test data from JSON, CSV, and XLSX.
4. `helper.ts`: Handles date formatting, currency parsing, and common assertions.

---

## Step 7 — Implement Test Suites (`tests/api/`)

Organize test specifications by business domain in `tests/api/`:

| Spec File | Services & Test Cases Covered |
| :--- | :--- |
| `accounts.spec.ts` | Retrieve account, invalid account IDs, create SAVINGS/LOAN accounts, deposit, withdraw, transfer between accounts, bill pay with JSON/XML payloads. |
| `customers.spec.ts` | Profile retrieval by ID, non-existent customer handling, customer KYC updates, retrieve all accounts under customer, account creation. |
| `transactions.spec.ts` | Complete transaction listing, lookup by transaction ID, filter by amount, month/type, date range, exact date, and invalid date parameters. |
| `loans.spec.ts` | Loan qualification: 20% down payment approval, insufficient down payment rejection, zero down payment, non-existent account handling, LoanResponse schema validation. |
| `positions.spec.ts` | Stock trading: Buy stock position, list customer positions, query position by ID, sell position, query historical prices, negative share validation. |
| `misc.spec.ts` | Customer login with valid/invalid credentials, SQL injection attack verification, runtime system parameter configuration (`loanProvider`, `loanProcessor`). |
| `jms.spec.ts` | Startup and shutdown of JMS message queue listener service with idempotency validation. |
| `schemas.spec.ts` | AJV contract validation across all 6 core JSON schemas (`account`, `billpay`, `customer`, `loan`, `position`, `transaction`). |
| `security-performance.spec.ts` | Insecure Direct Object Reference (IDOR) checks, security response header compliance, inquiry SLA latency (<1000ms), and transaction write SLA latency (<1500ms). |

### Example Test Implementation:

```ts
import { test, expect } from '../../fixtures/apiFixture';
import { Routes } from '../../api/endpoints/routes';

test.describe('ParaBank Accounts Service @api @master', () => {
  test('API-ACCT-01: Retrieve single account details by valid Account ID @sanity', async ({ request }) => {
    const accountId = process.env.PRIMARY_ACCOUNT_ID || '12345';
    const response = await request.get(Routes.url(Routes.GET_ACCOUNT.replace('{accountId}', accountId)));

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id', Number(accountId));
    expect(body).toHaveProperty('customerId');
    expect(body).toHaveProperty('type');
    expect(typeof body.balance).toBe('number');
  });
});
```

---

## Step 8 — Custom NPM Scripts in `package.json`

Add custom scripts to `package.json` for running tagged test suites:

```json
"scripts": {
  "test:api": "playwright test --grep @api",
  "test:master": "playwright test --grep @master",
  "test:sanity": "playwright test --grep @sanity",
  "test:regression": "playwright test --grep @regression",
  "test:security": "playwright test --grep @security",
  "test:perf": "playwright test --grep @perf",
  "test:schema": "playwright test --grep @schema"
}
```

---

## Step 9 — Executing Tests & Generating Reports

### Run Commands:

```powershell
# Run the complete master test suite
npm run test:master

# Run smoke/sanity tests
npm run test:sanity

# Run contract schema tests
npm run test:schema

# Run security & SLA performance tests
npm run test:security
npm run test:perf
```

### View Reports:

```powershell
# Open Playwright HTML Report
npx playwright show-report reports

# Serve Allure Report
npx allure serve allure-results
```

---

## Step 10 — Git Version Control

Commit your project to GitHub:

```powershell
git init
git add .
git commit -m "feat: complete ParaBank REST API Playwright TypeScript framework"
git branch -M main
git remote add origin https://github.com/<USERNAME>/parabank-api-playwright.git
git push -u origin main
```

---

## Step 11 — CI/CD with GitHub Actions (`.github/workflows/playwright.yml`)

Create `.github/workflows/playwright.yml`:

```yaml
name: 🏦 ParaBank REST API Automation Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch:
    inputs:
      suite:
        description: "Test Suite"
        required: true
        type: choice
        default: "test:master"
        options:
          - test:master
          - test:sanity
          - test:regression
          - test:schema
          - test:security
          - test:perf

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4

      - name: 🟢 Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: 📦 Install Dependencies
        run: npm ci

      - name: ⚙️ Setup Environment
        run: cp .env.example .env

      - name: 🧪 Run ParaBank API Tests
        run: npm run ${{ github.event.inputs.suite || 'test:master' }}
        env:
          CI: "1"

      - name: 📊 Upload Playwright HTML Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: reports/
          retention-days: 14

      - name: 📋 Upload Custom HTML Dashboard
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: custom-report
          path: custom-report/
          retention-days: 14

      - name: 📈 Upload Allure Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-results
          path: allure-results/
          retention-days: 14
```

---

## Step 12 — Docker Containerization

Containerize the execution to run in isolated microVMs or CI agents:

### `Dockerfile`

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p reports custom-report allure-results

ENV CI=true

ENTRYPOINT ["npm", "run"]
CMD ["test:master"]
```

### `docker-compose.yml`

```yaml
services:
  parabank-tests:
    build: .
    container_name: parabank-api-automation
    volumes:
      - ./reports:/app/reports
      - ./custom-report:/app/custom-report
      - ./allure-results:/app/allure-results
    environment:
      - CI=1
      - API_BASE_URL=https://parabank.parasoft.com/parabank/services/bank
    command: ["test:master"]
```

Run tests in Docker:
```powershell
docker compose up --build
```

---

## Step 13 — Enterprise Jenkins Pipeline

### `Jenkinsfile` (Windows / Linux Compatible)

```groovy
pipeline {
  agent any
  tools {
    nodejs 'NodeJS-20'
  }
  parameters {
    choice(
      name: 'TEST_SUITE',
      choices: ['test:master', 'test:sanity', 'test:regression', 'test:schema', 'test:security', 'test:perf'],
      description: 'Select ParaBank API test suite to execute'
    )
  }
  environment {
    CI = '1'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Setup Environment') {
      steps {
        sh 'cp .env.example .env'
      }
    }
    stage('Execute Tests') {
      steps {
        sh "npm run ${params.TEST_SUITE}"
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'reports/**,custom-report/**,allure-results/**', allowEmptyArchive: true
      junit testResults: 'reports/results.xml', allowEmptyResults: true
      allure results: [[path: 'allure-results']]
    }
  }
}
```

---

## Summary of Completed Framework Capabilities

With this framework:
1. **Full API Coverage**: 8 microservices thoroughly validated with end-to-end CRUD flows.
2. **Contract Enforced**: JSON schemas validate every payload structure against draft-07 standards.
3. **Flake & Rate-Limit Immune**: Single-worker execution and inter-test pacing completely mitigate Cloudflare WAF blocks.
4. **Non-Functional Tested**: Automated IDOR vulnerability tests, security headers, and latency SLA checks.
5. **CI/CD Ready**: Ready to plug into GitHub Actions, Jenkins, or Docker pipelines with unified reporting.
