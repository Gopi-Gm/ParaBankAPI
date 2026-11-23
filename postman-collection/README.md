# 📮 ParaBank Postman API Collection & Manual Testing Guide

A dedicated, standalone **Postman API Collection** and **Environment Configuration** for manual API testing of the **ParaBank Banking Platform**.

> [!NOTE]
> This directory is completely decoupled from the Playwright test automation framework. It is designed specifically for **manual API testing, exploratory testing, and user journey validation using the Postman desktop application or Postman Web**.

---

## 📂 Directory Contents

| File | Purpose | Description |
| :--- | :--- | :--- |
| **`ParaBank_API_Collection.json`** | Postman Collection (v2.1.0) | Complete collection of 37+ requests organized into an **End-to-End API Chaining Workflow** and individual **8 Microservice Folders**. |
| **`ParaBank.postman_environment.json`** | Postman Environment | Pre-configured environment variables (Base URL, credentials, transaction amounts, and dynamic runtime variables). |
| **`README.md`** | Testing Documentation | Step-by-step import guide, variable guide, and API chaining reference. |

---

## 🚀 Quick Start: How to Import into Postman

### Step 1: Open Postman
Launch the **Postman Desktop Application** (or access [Postman Web](https://web.postman.co/)).

### Step 2: Import the Collection and Environment
1. In the top-left corner of Postman, click the **Import** button.
2. Drag and drop (or browse and select) both files from this directory:
   - `postman-collection/ParaBank_API_Collection.json`
   - `postman-collection/ParaBank.postman_environment.json`
3. Click **Import**.

### Step 3: Select the Active Environment
1. In the top-right corner of Postman, click the **Environment Dropdown** (defaults to *"No Environment"*).
2. Select **`ParaBank QA Environment`**.

> [!IMPORTANT]
> Always ensure **`ParaBank QA Environment`** is selected before sending requests. All endpoints use parameterized URLs such as `{{baseUrl}}/login/{{username}}/{{password}}`.

---

## 🌍 Environment Variables Reference

The collection uses environment variables defined in `ParaBank.postman_environment.json`:

### 1. Static Configuration Variables
| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `https://parabank.parasoft.com/parabank/services/bank` | Target ParaBank REST base URL |
| `username` | `john` | Valid customer username |
| `password` | `demo` | Valid customer password (masked secret) |
| `depositAmount` | `200.00` | Sample monetary deposit amount |
| `withdrawAmount` | `25.00` | Sample monetary withdrawal amount |
| `transferAmount` | `50.00` | Sample intra-bank transfer amount |
| `billPayAmount` | `40.00` | Sample utility bill payment amount |
| `loanAmount` | `1000` | Requested loan principal amount |
| `downPayment` | `250` | Loan down-payment amount (25% qualifying threshold) |
| `stockSymbol` | `MSFT` | Stock ticker symbol for trading |
| `stockName` | `Microsoft Corp` | Stock company name |
| `stockShares` | `5` | Number of shares to purchase |
| `stockPrice` | `320.00` | Price per share |

### 2. Dynamic Chained Variables (Populated at Runtime)
These variables start with default initial values and are **automatically extracted and updated** as you execute requests in the chaining sequence:

| Variable Name | Initial Value | Set By Request | Chained Into Downstream Requests |
| :--- | :--- | :--- | :--- |
| `customerId` | `12212` | `02 - Customer Login` | Customer profile lookup, account lookup, loan request, stock buy/sell |
| `primaryAccountId` | `12345` | `04 - Get Customer Accounts` | Source funding account, transfer target, loan requests |
| `secondaryAccountId`| `12456` | `04 - Get Customer Accounts` | Alternative transfer target |
| `newAccountId` | *(empty)* | `05 - Create New Savings Account` | New account verification, deposits, transfers, bill payments, loans, stock trades |
| `transactionId` | *(empty)* | `10 - Get Account Transactions` | Single transaction deep lookup (`/transactions/{{transactionId}}`) |
| `positionId` | *(empty)* | `14 - Buy Stock Position` | Stock position deep lookup (`/positions/{{positionId}}`), sell position |
| `loanAccountId` | *(empty)* | `13 - Request Loan` | Loan account verification |

---

## 🔗 How API Chaining Works in Postman

API Chaining enables multi-step business transactions without copying and pasting IDs between requests. 

Every chained request includes a lightweight JavaScript snippet in its **Tests** tab. When you click **Send**, Postman:
1. Validates HTTP response status and structure.
2. Extracts identifiers from the JSON response body.
3. Automatically updates the active Postman Environment using `pm.environment.set(...)`.

```
                  ┌─────────────────────────────────────────┐
                  │ 01. POST /initializeDB (Clean State)    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 02. GET /login/john/demo                │
                  │     └─► pm.environment.set(customerId)  │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 04. GET /customers/{{customerId}}/accts │
                  │     └─► pm.environment.set(primaryAcct) │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 05. POST /createAccount                 │
                  │     └─► pm.environment.set(newAccountId)│
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 07. POST /deposit into {{newAccountId}} │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 08. POST /transfer                      │
                  │     {{newAccountId}} ➔ {{primaryAcct}}   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 09. POST /billpay from {{newAccountId}} │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 10. GET /accounts/{{newAccountId}}/txns │
                  │     └─► pm.environment.set(txnId)       │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 11. GET /transactions/{{txnId}}         │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 13. POST /requestLoan for $1000         │
                  │     └─► pm.environment.set(loanAcctId)  │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 14. POST /buyPosition (MSFT stock)      │
                  │     └─► pm.environment.set(positionId)  │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ 15. GET /positions/{{positionId}}       │
                  │ 16. POST /sellPosition {{positionId}}   │
                  └─────────────────────────────────────────┘
```

---

## 📋 The 19 Chaining Requests in Sequence

The folder **`00 - End-to-End API Chaining Workflow`** contains 19 requests designed to run sequentially:

| # | Request Name | Method & Endpoint | Description & Chaining Behavior |
| :-: | :--- | :--- | :--- |
| **01** | `Initialize Database Baseline` | `POST /initializeDB` | Resets the in-memory database to a clean, known state. |
| **02** | `Customer Login` | `GET /login/{{username}}/{{password}}` | Authenticates and sets `customerId` (`12212`). |
| **03** | `Get Customer Profile` | `GET /customers/{{customerId}}` | Inquires profile using the chained `{{customerId}}`. |
| **04** | `Get Customer Accounts` | `GET /customers/{{customerId}}/accounts` | Inquires accounts and sets `primaryAccountId` and `secondaryAccountId`. |
| **05** | `Create New Savings Account` | `POST /createAccount` | Creates a new savings account and sets `newAccountId`. |
| **06** | `Verify New Account Details` | `GET /accounts/{{newAccountId}}` | Confirms account was created with type `SAVINGS`. |
| **07** | `Deposit Funds into New Account` | `POST /deposit` | Deposits `{{depositAmount}}` ($200) into `{{newAccountId}}`. |
| **08** | `Transfer Funds` | `POST /transfer` | Transfers `{{transferAmount}}` ($50) from `{{newAccountId}}` to `{{primaryAccountId}}`. |
| **09** | `Bill Payment from New Account` | `POST /billpay` | Submits utility bill payment ($40) with Payee JSON payload from `{{newAccountId}}`. |
| **10** | `Get Account Transactions` | `GET /accounts/{{newAccountId}}/transactions` | Inquires transaction history and sets `transactionId`. |
| **11** | `Inquire Transaction Details by ID` | `GET /transactions/{{transactionId}}` | Inquires specific transaction using chained `{{transactionId}}`. |
| **12** | `Filter Transactions by Amount` | `GET /accounts/{{newAccountId}}/transactions/amount/{{transferAmount}}` | Verifies transaction filtering by exact amount ($50). |
| **13** | `Request Loan with 25% Down Payment`| `POST /requestLoan` | Submits $1000 loan with $250 down payment; sets `loanAccountId` if approved. |
| **14** | `Buy Stock Position` | `POST /customers/{{customerId}}/buyPosition` | Buys 5 shares of MSFT at $320; sets `positionId`. |
| **15** | `Get Position Details by ID` | `GET /positions/{{positionId}}` | Verifies position using chained `{{positionId}}`. |
| **16** | `Sell Stock Position Shares` | `POST /customers/{{customerId}}/sellPosition` | Sells 2 shares of MSFT from `{{positionId}}`. |
| **17** | `Startup JMS Message Listener` | `POST /startupJmsListener` | Starts JMS queue message broker listener. |
| **18** | `Shutdown JMS Message Listener` | `POST /shutdownJmsListener` | Shuts down JMS listener cleanly. |
| **19** | `Clean Database (Reset)` | `POST /cleanDB` | Restores database to baseline at completion. |

---

## 🎮 How to Test Manually

### Option A: Step-by-Step Manual Execution (Exploratory Testing)
1. Expand the folder **`00 - End-to-End API Chaining Workflow`** in the left sidebar.
2. Click on **`01 - Initialize Database Baseline`** and click **Send**.
3. Click on **`02 - Customer Login (Chains: customerId)`** and click **Send**.
4. In the top-right corner, click the **Environment Quick Look (Eye Icon 👁️)**. Notice how `customerId` is now updated with the returned ID!
5. Continue sending requests in numerical order. Watch variables such as `newAccountId`, `transactionId`, and `positionId` automatically populate in your environment.
6. Check the **Test Results** tab on each response to see automated assertions pass.

### Option B: Automated Collection Runner (In Postman)
1. In Postman's sidebar, hover over the folder **`00 - End-to-End API Chaining Workflow`** (or the top-level collection).
2. Click the **`...`** (three dots) menu and select **Run folder**.
3. In the Runner tab:
   - Ensure **`ParaBank QA Environment`** is selected.
   - **Set Delay to 1200ms** (or 1000ms): The public ParaBank server is behind Cloudflare WAF; introducing a 1-second delay prevents HTTP 429 rate limits.
   - Ensure all 19 requests are checked.
4. Click **Run ParaBank REST API Collection**.
5. Observe the live runner dashboard executing each request and verifying all assertions.

---

## 🏛️ Individual Microservice Folders (Endpoint Catalog)

In addition to the chaining workflow, the collection contains organized folders for all **8 ParaBank Microservices** for ad-hoc manual testing of specific endpoints:

- **`01 - Database Operations`**: `/initializeDB`, `/cleanDB`
- **`02 - Misc Operations`**: `/login/{user}/{pass}`, invalid login, `/setParameter`
- **`03 - Customers Operations`**: `/customers/{id}`, `/customers/update/{id}`, `/customers/{id}/accounts`
- **`04 - Accounts Operations`**: `/accounts/{id}`, `/createAccount` (Checking & Savings), `/deposit`, `/withdraw`, `/transfer`, `/billpay`
- **`05 - Transactions Operations`**: Inquiries by account, by ID, filtering by amount and month/type
- **`06 - Loans Operations`**: Loan approvals and down-payment rejections
- **`07 - Positions Operations`**: Stock purchases, customer portfolios, position details, and selling
- **`08 - JMS Messaging`**: JMS broker listener lifecycle

---

## 💡 Tips & Best Practices

- **Cloudflare Rate Limiting**: If you receive `HTTP 429 Too Many Requests` or `Cloudflare Error 1015`, wait 30 seconds and run request `01 - Initialize Database Baseline` to resume.
- **Inspect Chained Variables**: Click the **Environment Quick Look** (eye icon 👁️ in top-right) anytime to view the current values of `newAccountId`, `transactionId`, and `positionId`.
- **Reset State**: Whenever you want a fresh start, execute `01 - Initialize Database Baseline` or `19 - Clean Database (Reset)`.
