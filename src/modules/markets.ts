import { APIClient } from '../client'
import type { MarketsResponse, RequestOptions } from '../types'

export class MarketsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List the platform's markets: the countries Mitumba operates in or plans to, with each
   * market's currency, locale, phone rules, region naming and payment rails.
   *
   * Public (no sign-in needed) and cacheable for a few minutes. Read this at runtime instead of
   * hardcoding a country, and pair it with the helpers exported from the package root
   * (`formatMoney`, `normalizePhone`, `findMarket`, ...).
   */
  async list(options?: RequestOptions): Promise<MarketsResponse> {
    return this.client.get<MarketsResponse>('/markets', undefined, options)
  }
}
