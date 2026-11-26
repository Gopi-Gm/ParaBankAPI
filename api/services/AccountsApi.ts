import { APIResponse } from '@playwright/test';
import { Routes } from '../endpoints/routes';
import { BaseApi } from './BaseApi';

export interface Account {
  id: number;
  customerId: number;
  type: 'CHECKING' | 'SAVINGS' | 'LOAN';
  balance: number;
}

export interface Payee {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phoneNumber: string;
  accountNumber: number;
}

export interface BillPayResult {
  payeeName: string;
  amount: number;
  accountId: number;
}

/**
 * Service client for ParaBank Account & Payment operations.
 */
export class AccountsApi extends BaseApi {
  getAccount(accountId: number | string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.GET_ACCOUNT, { accountId }));
  }

  createAccount(customerId: number, newAccountType: number, fromAccountId: number): Promise<APIResponse> {
    return this.post(Routes.url(Routes.CREATE_ACCOUNT), {
      params: { customerId, newAccountType, fromAccountId },
    });
  }

  deposit(accountId: number, amount: number): Promise<APIResponse> {
    return this.post(Routes.url(Routes.DEPOSIT), {
      params: { accountId, amount },
    });
  }

  withdraw(accountId: number, amount: number): Promise<APIResponse> {
    return this.post(Routes.url(Routes.WITHDRAW), {
      params: { accountId, amount },
    });
  }

  transfer(fromAccountId: number, toAccountId: number, amount: number): Promise<APIResponse> {
    return this.post(Routes.url(Routes.TRANSFER), {
      params: { fromAccountId, toAccountId, amount },
    });
  }

  billPay(
    accountId: number,
    amount: number,
    payee: Payee,
    headers: Record<string, string> = { 'Content-Type': 'application/json' },
  ): Promise<APIResponse> {
    return this.post(Routes.url(Routes.BILL_PAY), {
      headers,
      params: { accountId, amount },
      data: payee,
    });
  }
}
