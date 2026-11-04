import { APIClient } from '../client'
import type { CreateReviewInput, ReviewableOrder, StoreReviewsPage, RequestOptions } from '../types'

export class ReviewsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List reviews for a store (public).
   */
  async list(storeId: string, page?: number, options?: RequestOptions): Promise<StoreReviewsPage> {
    return this.client.get<StoreReviewsPage>(
      `/listings/stores/${storeId}/reviews`,
      page !== undefined ? { page } : undefined,
      options
    )
  }

  /**
   * Create a review for a store (authenticated). `input.order_id` is required.
   *
   * @throws {APIError} `review_not_allowed` when the order is not the caller's delivered/completed
   *   purchase from this store, and `already_reviewed` when the order already has a review (one
   *   review per order, enforced atomically server-side).
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
