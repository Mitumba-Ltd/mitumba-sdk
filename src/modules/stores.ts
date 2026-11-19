import { APIClient, APIError } from '../client'
import type {
  AddPayoutDestinationInput,
  CreateStoreInput,
  FollowedStore,
  Listing,
  PayoutDestinations,
  PayoutDestinationsState,
  RequestOptions,
  ShopEarnings,
  ShopPayout,
  ShopPayoutEntriesPage,
  ShopPayoutEntriesParams,
  Store,
  StoreAnalytics,
  StoreSettings,
  StoreStats,
  UpdateStoreInput,
} from '../types'

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
    return this.client.delete<{ ok: true }>(`/listings/stores/${storeId}/follow`, undefined, options)
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

  /**
   * Delete a store. Blocked if active orders, pending payouts, or open disputes exist.
   */
  async delete(storeId: string, options?: RequestOptions): Promise<{ ok: true } | { blocked: true; reasons: string[] }> {
    return this.client.delete<{ ok: true } | { blocked: true; reasons: string[] }>(`/listings/stores/${storeId}`, undefined, options)
  }

  /**
   * A shop's earnings: per currency, what is in escrow, on hold, awaiting approval, approved,
   * sending, sent, failed or a test, in minor units. The owner, or a team member who may read
   * earnings.
   *
   * Errors: 403 forbidden (a member whose role does not include earnings); 404 not_found.
   */
  async getEarnings(storeId: string, options?: RequestOptions): Promise<ShopEarnings> {
    return this.client.get<ShopEarnings>(`/orders/stores/${encodeURIComponent(storeId)}/earnings`, undefined, options)
  }

  /**
   * Each paid order's entitlement, newest first, 20 per page, optionally of one state.
   *
   * Errors: 400 invalid_input (unknown state); 403 forbidden; 404 not_found.
   */
  async getEarningsEntries(storeId: string, params?: ShopPayoutEntriesParams, options?: RequestOptions): Promise<ShopPayoutEntriesPage> {
    return this.client.get<ShopPayoutEntriesPage>(
      `/orders/stores/${encodeURIComponent(storeId)}/earnings/entries`,
      params as Record<string, string | number | boolean | undefined> | undefined,
      options,
    )
  }

  /**
   * One payout of the shop, with the settlement lines that explain it.
   *
   * Errors: 403 forbidden; 404 not_found.
   */
  async getPayout(storeId: string, payoutId: string, options?: RequestOptions): Promise<ShopPayout> {
    return this.client.get<ShopPayout>(
      `/orders/stores/${encodeURIComponent(storeId)}/payouts/${encodeURIComponent(payoutId)}`,
      undefined,
      options,
    )
  }

  /**
   * Where the shop is paid: its destinations, masked, with the methods and banks on offer. The
   * owner, or a team member who may read earnings.
   *
   * Errors: 403 store_forbidden.
   */
  async getPayoutDestinations(storeId: string, options?: RequestOptions): Promise<PayoutDestinations> {
    return this.client.get<PayoutDestinations>(`/listings/stores/${encodeURIComponent(storeId)}/payout-destinations`, undefined, options)
  }

  /**
   * Owner: add a payout destination. The shop's first applies at once; every later one, and a change
   * of default, 48 hours later. Needs a second factor used in the last 10 minutes.
   *
   * Errors: 400 invalid_input, or a `PayoutDestinationRejection` with `field`; 403 store_forbidden,
   * step_up_required; 409 method_unavailable, destination_exists, too_many_destinations.
   */
  async addPayoutDestination(storeId: string, input: AddPayoutDestinationInput, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.post<PayoutDestinationsState>(`/listings/stores/${encodeURIComponent(storeId)}/payout-destinations`, input, options)
  }

  /**
   * Owner: make a destination the default, 48 hours from now. Choosing the current default again
   * cancels any pending change. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required; 404 not_found.
   */
  async setDefaultPayoutDestination(storeId: string, destinationId: string, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.post<PayoutDestinationsState>(this.destinationPath(storeId, destinationId, '/default'), undefined, options)
  }

  /**
   * Owner: cancel a pending change of default to this destination. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required; 404 not_found; 409 no_pending_default.
   */
  async cancelPendingDefault(storeId: string, destinationId: string, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.delete<PayoutDestinationsState>(this.destinationPath(storeId, destinationId, '/default'), undefined, options)
  }

  /**
   * Owner: remove a destination, or cancel one still cooling off. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required; 404 not_found.
   */
  async removePayoutDestination(storeId: string, destinationId: string, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.delete<PayoutDestinationsState>(this.destinationPath(storeId, destinationId, ''), undefined, options)
  }

  private destinationPath(storeId: string, destinationId: string, suffix: string): string {
    return `/listings/stores/${encodeURIComponent(storeId)}/payout-destinations/${encodeURIComponent(destinationId)}${suffix}`
  }
}

/** Whether an error asks the caller to sign in again with a second factor before retrying. */
export function stepUpRequired(error: unknown): boolean {
  return error instanceof APIError && error.code === 'step_up_required'
}
