import { APIClient } from '../client'
import type { VAZIOutfit, VaziFeedParams, VaziFeedResponse, RequestOptions } from '../types'

export class VaziModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Browse the AI-curated outfit feed.
   */
  async getFeed(params?: VaziFeedParams, options?: RequestOptions): Promise<VaziFeedResponse> {
    return this.client.get<VaziFeedResponse>(
      '/vazi/feed',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * Get a complete outfit built around a specific seed listing.
   */
  async getCompleteLook(listingId: string, options?: RequestOptions): Promise<{ outfits: VAZIOutfit[] }> {
    return this.client.get<{ outfits: VAZIOutfit[] }>(`/vazi/complete/${listingId}`, undefined, options)
  }
}
