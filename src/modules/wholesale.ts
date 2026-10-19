import { APIClient } from '../client'
import type {
  WholesaleStore, WholesaleDepot, Bale, BaleDetail, BaleFeedItem,
  CreateBaleInput, SaveWholesaleStoreInput, AddDepotInput, WholesaleFeedParams,
  BaleOrder, BaleOrderEvent, BaleOrderStatus, CreateBaleOrderInput,
  BaleImageUploadResult, WholesaleAnalytics, PresignImageResponse,
  RequestOptions,
} from '../types'

export class WholesaleModule {
  constructor(private readonly client: APIClient) {}

  // ── Wholesale Store ──

  /** Get the current user's wholesale store and depots. */
  async getWholesaleStore(options?: RequestOptions): Promise<{ store: WholesaleStore | null; depots?: WholesaleDepot[] }> {
    return this.client.get<{ store: WholesaleStore | null; depots?: WholesaleDepot[] }>('/listings/wholesale/store', undefined, options)
  }

  /** Create or update the wholesale store (bale_seller only). */
  async saveWholesaleStore(input: SaveWholesaleStoreInput, options?: RequestOptions): Promise<{ id: string; verified?: boolean }> {
    return this.client.post<{ id: string; verified?: boolean }>('/listings/wholesale/store', input, options)
  }

  /** Add a depot to the wholesale store. */
  async addDepot(input: AddDepotInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/listings/wholesale/store/depots', input, options)
  }

  /** Remove a depot. */
  async removeDepot(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/listings/wholesale/store/depots/${id}`, undefined, options)
  }

  // ── Bales ──

  /** Create a bale listing (requires verified wholesale store). */
  async createBale(input: CreateBaleInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/listings/bales', input, options)
  }

  /** Get a bale by ID (public). */
  async getBale(id: string, options?: RequestOptions): Promise<BaleDetail> {
    return this.client.get<BaleDetail>(`/listings/bales/${id}`, undefined, options)
  }

  /** Update a bale. */
  async updateBale(id: string, input: Partial<CreateBaleInput>, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.patch<{ ok: true }>(`/listings/bales/${id}`, input, options)
  }

  /** Soft-delete a bale. */
  async removeBale(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/listings/bales/${id}`, undefined, options)
  }

  /** Get all bales for the current user's wholesale store. */
  async myBales(options?: RequestOptions): Promise<{ data: Bale[] }> {
    return this.client.get<{ data: Bale[] }>('/listings/wholesale/mine/bales', undefined, options)
  }

  // ── Bale Images ──

  /**
   * Presign a bale image upload slot (requires the owning wholesale store).
   *
   * @param baleId - The bale to attach the image to
   * @param index - The slot index; slot 0 is the cover
   * @returns The storage key and image id for the slot
   * @throws {APIError} On network or server errors
   */
  async presignBaleImage(baleId: string, index: number, options?: RequestOptions): Promise<PresignImageResponse> {
    return this.client.post<PresignImageResponse>(`/listings/bales/${baleId}/images/presign`, { index }, options)
  }

  /**
   * Upload a bale image file directly. Uses multipart/form-data. Slot 0 is the cover.
   *
   * @param baleId - The bale to attach the image to
   * @param file - The image file as a `Blob` (React Native passes a `{ uri, name, type }` part)
   * @param index - The slot index; slot 0 is the cover
   * @returns The storage key, image id, and public URL
   * @throws {APIError} On network or server errors
   */
  async uploadBaleImage(baleId: string, file: Blob, index: number, options?: RequestOptions): Promise<BaleImageUploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('index', String(index))
    return this.client.post<BaleImageUploadResult>(`/listings/bales/${baleId}/images/upload`, formData, options)
  }

  // ── Feed ──

  /** Browse the wholesale bale feed (public). */
  async wholesaleFeed(params?: WholesaleFeedParams, options?: RequestOptions): Promise<{ data: BaleFeedItem[]; limit: number; offset: number }> {
    return this.client.get<{ data: BaleFeedItem[]; limit: number; offset: number }>(
      '/listings/wholesale/feed',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  // ── Bale Orders ──

  /** Create a bale order (buyer). */
  async createBaleOrder(input: CreateBaleOrderInput, options?: RequestOptions): Promise<{ id: string; total_kes: number }> {
    return this.client.post<{ id: string; total_kes: number }>('/listings/bale-orders', input, options)
  }

  /** Get the buyer's bale orders. */
  async myBaleOrders(options?: RequestOptions): Promise<{ data: BaleOrder[] }> {
    return this.client.get<{ data: BaleOrder[] }>('/listings/bale-orders/mine', undefined, options)
  }

  /** Get incoming bale orders (seller). */
  async incomingBaleOrders(options?: RequestOptions): Promise<{ data: BaleOrder[] }> {
    return this.client.get<{ data: BaleOrder[] }>('/listings/wholesale/orders', undefined, options)
  }

  /** Get a bale order by ID with event timeline. */
  async getBaleOrder(id: string, options?: RequestOptions): Promise<BaleOrder & { events: BaleOrderEvent[] }> {
    return this.client.get<BaleOrder & { events: BaleOrderEvent[] }>(`/listings/bale-orders/${id}`, undefined, options)
  }

  /** Transition a bale order status. */
  async transitionBaleOrder(id: string, action: 'confirm' | 'dispatch' | 'deliver' | 'receive', options?: RequestOptions): Promise<{ ok: true; status: BaleOrderStatus }> {
    return this.client.post<{ ok: true; status: BaleOrderStatus }>(`/listings/bale-orders/${id}/transition`, { action }, options)
  }

  // ── Analytics ──

  /**
   * Get performance analytics for the current user's wholesale store (bale_seller only).
   *
   * The wholesale store is resolved server-side from the session, so no store id is passed — the
   * same way `getWholesaleStore`, `myBales`, and `incomingBaleOrders` work.
   *
   * @param period - Optional granularity; defaults to the server's default window
   * @returns Revenue series, order breakdown, top bales, and totals
   * @throws {APIError} On network or server errors
   *
   * @example
   * ```typescript
   * const analytics = await sdk.wholesale.getAnalytics('weekly')
   * ```
   */
  async getAnalytics(period?: 'daily' | 'weekly' | 'monthly', options?: RequestOptions): Promise<WholesaleAnalytics> {
    return this.client.get<WholesaleAnalytics>('/listings/wholesale/analytics', period ? { period } : undefined, options)
  }
}
