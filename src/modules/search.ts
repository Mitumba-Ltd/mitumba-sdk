import { APIClient } from '../client'
import type { PaginatedResponse, SearchParams, SearchResult, TrendingTerm, RequestOptions } from '../types'

export class SearchModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Perform a full-text search with optional filters.
   */
  async search(params: SearchParams, options?: RequestOptions): Promise<PaginatedResponse<SearchResult>> {
    return this.client.get<PaginatedResponse<SearchResult>>(
      '/search', 
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * Get trending search terms.
   */
  async getTrending(cityId?: string, options?: RequestOptions): Promise<{ terms: TrendingTerm[] }> {
    const params = cityId ? { city_id: cityId } : undefined
    return this.client.get<{ terms: TrendingTerm[] }>('/search/trending', params, options)
  }
}
