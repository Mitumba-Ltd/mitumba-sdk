import { APIClient } from '../client'
import type { CreateReviewInput, Review, ReviewableOrder, RequestOptions } from '../types'

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

  /**
   * Get orders eligible for review (delivered/completed, not yet reviewed).
   */
  async getReviewableOrders(storeId: string, options?: RequestOptions): Promise<{ data: ReviewableOrder[] }> {
    return this.client.get<{ data: ReviewableOrder[] }>(`/listings/stores/${storeId}/reviews/eligible`, undefined, options)
  }
}
