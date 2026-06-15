import { APIClient } from '../client'
import type { CreateStoreInput, UpdateStoreInput, StoreStats, Listing, Store, RequestOptions } from '../types'

export class StoresModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Get a store by its URL slug.
   */
  async getBySlug(slug: string, options?: RequestOptions): Promise<Store> {
    return this.client.get<Store>(`/listings/stores/${slug}`, undefined, options)
  }

  /**
   * Follow a store.
   */
  async follow(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/listings/stores/${storeId}/follow`, undefined, options)
  }

  /**
   * Unfollow a store.
   */
  async unfollow(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/listings/stores/${storeId}/follow`, options)
  }

  /**
   * Get paginated listings for a specific store.
   */
  async getListings(storeId: string, page?: number, options?: RequestOptions): Promise<{ data: Listing[] }> {
    return this.client.get<{ data: Listing[] }>(
      `/listings/stores/${storeId}/listings`,
      page !== undefined ? { page } : undefined,
      options
    )
  }

  /**
   * Get all stores owned by the authenticated user.
   */
  async getMyStores(options?: RequestOptions): Promise<{ data: Store[] }> {
    return this.client.get<{ data: Store[] }>('/listings/stores/mine', undefined, options)
  }

  /**
   * Create a new store.
   */
  async create(input: CreateStoreInput, options?: RequestOptions): Promise<{ id: string; slug: string }> {
    return this.client.post<{ id: string; slug: string }>('/listings/stores', input, options)
  }

  /**
   * Update a store's details.
   */
  async update(storeId: string, input: UpdateStoreInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/listings/stores/${storeId}`, input, options)
  }

  /**
   * Get store statistics.
   */
  async getStats(storeId: string, options?: RequestOptions): Promise<StoreStats> {
    return this.client.get<StoreStats>(`/listings/stores/${storeId}/stats`, undefined, options)
  }
}
