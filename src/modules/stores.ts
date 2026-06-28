import { APIClient } from '../client'
import type { CreateStoreInput, UpdateStoreInput, StoreStats, StoreSettings, StoreAnalytics, Listing, Store, FollowedStore, RequestOptions } from '../types'

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
   * Get stores the authenticated user follows.
   */
  async getFollowing(params?: { page?: number }, options?: RequestOptions): Promise<{ data: FollowedStore[]; page: number; page_size: number }> {
    return this.client.get<{ data: FollowedStore[]; page: number; page_size: number }>(
      '/listings/stores/following',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
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

  /**
   * Get store settings.
   */
  async getSettings(storeId: string, options?: RequestOptions): Promise<StoreSettings> {
    return this.client.get<StoreSettings>(`/listings/stores/${storeId}/settings`, undefined, options)
  }

  /**
   * Update store settings (partial).
   */
  async updateSettings(storeId: string, input: Partial<StoreSettings>, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/listings/stores/${storeId}/settings`, input, options)
  }

  /**
   * Get store analytics.
   */
  async getAnalytics(storeId: string, period?: 'daily' | 'weekly' | 'monthly', options?: RequestOptions): Promise<StoreAnalytics> {
    return this.client.get<StoreAnalytics>(
      `/listings/stores/${storeId}/analytics`,
      period ? { period } : undefined,
      options
    )
  }

  /**
   * Upload a store logo image.
   */
  async uploadLogo(storeId: string, file: Blob, options?: RequestOptions): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ url: string }>(`/listings/stores/${storeId}/logo`, formData, options)
  }

  /**
   * Upload a store banner image.
   */
  async uploadBanner(storeId: string, file: Blob, options?: RequestOptions): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ url: string }>(`/listings/stores/${storeId}/banner`, formData, options)
  }
}
