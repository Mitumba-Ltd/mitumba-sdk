import { APIClient } from '../client'
import type { PaginatedResponse, SearchParams, SearchResult, SearchHistoryItem, SaveSearchInput, TrendingTerm, RequestOptions } from '../types'

export class SearchModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Perform a full-text search with optional filters.
   */
  async query(params: SearchParams, options?: RequestOptions): Promise<PaginatedResponse<SearchResult>> {
    return this.client.get<PaginatedResponse<SearchResult>>(
      '/search', 
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * Get trending search terms.
   */
  async trending(params?: { city_id?: string }, options?: RequestOptions): Promise<{ terms: TrendingTerm[] }> {
    return this.client.get<{ terms: TrendingTerm[] }>(
      '/search/trending',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * Get the user's search history.
   */
  async getHistory(options?: RequestOptions): Promise<{ data: SearchHistoryItem[] }> {
    return this.client.get<{ data: SearchHistoryItem[] }>('/search/history', undefined, options)
  }

  /**
   * Save a search query to history.
   */
  async saveHistory(input: SaveSearchInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/search/history', input, options)
  }
}
