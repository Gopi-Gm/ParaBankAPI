import { APIResponse } from '@playwright/test';
import { Routes } from '../endpoints/routes';
import { BaseApi } from './BaseApi';

/**
 * Service client for ParaBank Database, Auth, Parameter, and JMS operations.
 */
export class AdminApi extends BaseApi {
  initializeDb(): Promise<APIResponse> {
    return this.post(Routes.url(Routes.INITIALIZE_DB));
  }

  cleanDb(): Promise<APIResponse> {
    return this.post(Routes.url(Routes.CLEAN_DB));
  }

  login(username: string, password: string): Promise<APIResponse> {
    return this.get(Routes.url(Routes.LOGIN, { username, password }));
  }

  setParameter(name: string, value: string): Promise<APIResponse> {
    return this.post(Routes.url(Routes.SET_PARAMETER, { name, value }));
  }

  startupJms(): Promise<APIResponse> {
    return this.post(Routes.url(Routes.STARTUP_JMS));
  }

  shutdownJms(): Promise<APIResponse> {
    return this.post(Routes.url(Routes.SHUTDOWN_JMS));
  }
}
