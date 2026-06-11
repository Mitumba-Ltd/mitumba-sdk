import { APIClient } from '../client'
import type { CreateReviewInput, Review, RequestOptions } from '../types'

export class ReviewsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List reviews for a store (public).
   */
  async list(storeId: string, page?: number, options?: RequestOptions): Promise<{ data: Review[]; total: number; avg_rating: number; page: number }> {
    return this.client.get<{ data: Review[]; total: number; avg_rating: number; page: number }>(
      `/listings/stores/${storeId}/reviews`,
      page !== undefined ? { page } : undefined,
      options
    )
  }

  /**
   * Create a review for a store (authenticated).
   */
  async create(storeId: string, input: CreateReviewInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>(`/listings/stores/${storeId}/reviews`, input, options)
  }
}
