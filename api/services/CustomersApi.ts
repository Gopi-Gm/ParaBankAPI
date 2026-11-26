import { APIResponse } from '@playwright/test';
import { Routes } from '../endpoints/routes';
import { BaseApi } from './BaseApi';

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  address: CustomerAddress;
  phoneNumber: string;
  ssn: string;
}

export interface UpdateCustomerParams {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
}

/**
 * Service client for ParaBank Customer operations.
 */
export class CustomersApi extends BaseApi {
  getCustomer(customerId: number | string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.GET_CUSTOMER, { customerId }));
  }

  updateCustomer(customerId: number | string, params: UpdateCustomerParams): Promise<APIResponse> {
    return this.post(Routes.url(Routes.UPDATE_CUSTOMER, { customerId }), {
      params: { ...params },
    });
  }

  getCustomerAccounts(customerId: number | string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.GET_CUSTOMER_ACCOUNTS, { customerId }));
  }
}
