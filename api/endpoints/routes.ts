/**
 * ParaBank REST API Centralized Routes
 * Base URL: https://parabank.parasoft.com/parabank/services/bank
 * Swagger: https://parabank.parasoft.com/parabank/api-docs/index.html
 */
export const Routes = {
  BASE_URL: process.env.API_BASE_URL || 'https://parabank.parasoft.com/parabank/services/bank',

  url(endpoint: string, params?: Record<string, string | number>): string {
    let clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        clean = clean.replace(`{${key}}`, encodeURIComponent(String(value)));
      }
    }
    return `${this.BASE_URL}${clean}`;
  },

  // ==========================================
  // Service 1: Database Operations
  // ==========================================
  INITIALIZE_DB: '/initializeDB',
  CLEAN_DB: '/cleanDB',

  // ==========================================
  // Service 2: Misc Operations (Auth & Settings)
  // ==========================================
  LOGIN: '/login/{username}/{password}',
  SET_PARAMETER: '/setParameter/{name}/{value}',

  // ==========================================
  // Service 3: Customers Operations
  // ==========================================
  GET_CUSTOMER: '/customers/{customerId}',
  UPDATE_CUSTOMER: '/customers/update/{customerId}',
  GET_CUSTOMER_ACCOUNTS: '/customers/{customerId}/accounts',
  CREATE_ACCOUNT: '/createAccount',

  // ==========================================
  // Service 4: Accounts Operations
  // ==========================================
  GET_ACCOUNT: '/accounts/{accountId}',
  DEPOSIT: '/deposit',
  WITHDRAW: '/withdraw',
  TRANSFER: '/transfer',
  BILL_PAY: '/billpay',

  // ==========================================
  // Service 5: Transactions Operations
  // ==========================================
  GET_ACCOUNT_TRANSACTIONS: '/accounts/{accountId}/transactions',
  GET_TRANSACTION: '/transactions/{transactionId}',
  FILTER_TRANSACTIONS_BY_AMOUNT: '/accounts/{accountId}/transactions/amount/{amount}',
  FILTER_TRANSACTIONS_BY_MONTH_TYPE: '/accounts/{accountId}/transactions/month/{month}/type/{type}',
  FILTER_TRANSACTIONS_BY_DATE_RANGE: '/accounts/{accountId}/transactions/fromDate/{from}/toDate/{to}',
  FILTER_TRANSACTIONS_BY_DATE: '/accounts/{accountId}/transactions/onDate/{onDate}',

  // ==========================================
  // Service 6: Loans Operations
  // ==========================================
  REQUEST_LOAN: '/requestLoan',

  // ==========================================
  // Service 7: Positions Operations (Stock Trading)
  // ==========================================
  BUY_POSITION: '/customers/{customerId}/buyPosition',
  SELL_POSITION: '/customers/{customerId}/sellPosition',
  GET_POSITION: '/positions/{positionId}',
  GET_POSITION_HISTORY: '/positions/{positionId}/{startDate}/{endDate}',
  GET_CUSTOMER_POSITIONS: '/customers/{customerId}/positions',

  // ==========================================
  // Service 8: JMS Message Service
  // ==========================================
  STARTUP_JMS: '/startupJmsListener',
  SHUTDOWN_JMS: '/shutdownJmsListener',
};
