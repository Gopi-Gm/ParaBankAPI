import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Base API client providing shared HTTP helpers and automatic HTTP 429 retry/backoff
 * to handle Cloudflare WAF burst rate limits on public ParaBank demo servers.
 */
export class BaseApi {
  constructor(protected readonly request: APIRequestContext) {}

  /**
   * Executes an API call with exponential backoff when the server responds with HTTP 429.
   */
  protected async withRetry(fn: () => Promise<APIResponse>, retries = 2): Promise<APIResponse> {
    let response = await fn();
    for (let attempt = 0; attempt < retries && response.status() === 429; attempt++) {
      const delayMs = 1500 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      response = await fn();
    }
    return response;
  }

  protected get(url: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
    return this.withRetry(() => this.request.get(url, options));
  }

  protected post(url: string, options?: Parameters<APIRequestContext['post']>[1]): Promise<APIResponse> {
    return this.withRetry(() => this.request.post(url, options));
  }
}
