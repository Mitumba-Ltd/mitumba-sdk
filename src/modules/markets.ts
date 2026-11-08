import { APIClient } from '../client'
import type { MarketRegionsResponse, MarketsResponse, RequestOptions } from '../types'

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

  /**
   * The first-level regions of one market, e.g. Kenya's 47 counties, with the market's label for
   * them (`County` / `Counties`). Use this for every county or region picker, and send the
   * returned `name` back to the API: it is the canonical spelling the platform stores.
   *
   * `code` is an ISO 3166-1 alpha-2 market code (`"KE"`); it is uppercased before sending.
   * Public and cacheable. An unknown market rejects with a 404 rather than resolving empty.
   */
  async regions(code: string, options?: RequestOptions): Promise<MarketRegionsResponse> {
    const marketCode = encodeURIComponent(code.trim().toUpperCase())
    return this.client.get<MarketRegionsResponse>(`/markets/${marketCode}/regions`, undefined, options)
  }
}
