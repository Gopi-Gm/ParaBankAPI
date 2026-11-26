import { APIResponse } from '@playwright/test';
import { Routes } from '../endpoints/routes';
import { BaseApi } from './BaseApi';

/**
 * Service client for ParaBank Transaction inquiry and filtering operations.
 */
export class TransactionsApi extends BaseApi {
  getAccountTransactions(accountId: number | string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.GET_ACCOUNT_TRANSACTIONS, { accountId }));
  }

  getTransaction(transactionId: number | string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.GET_TRANSACTION, { transactionId }));
  }

  filterByAmount(accountId: number | string, amount: number | string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.FILTER_TRANSACTIONS_BY_AMOUNT, { accountId, amount }));
  }

  filterByMonthAndType(accountId: number | string, month: string, type: string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.FILTER_TRANSACTIONS_BY_MONTH_TYPE, { accountId, month, type }));
  }

  filterByDateRange(accountId: number | string, from: string, to: string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.FILTER_TRANSACTIONS_BY_DATE_RANGE, { accountId, from, to }));
  }

  filterByDate(accountId: number | string, onDate: string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.FILTER_TRANSACTIONS_BY_DATE, { accountId, onDate }));
  }
}
