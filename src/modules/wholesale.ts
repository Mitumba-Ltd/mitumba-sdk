import { APIClient } from '../client'
import type {
  WholesaleStore, WholesaleDepot, Bale, BaleDetail, BaleFeedItem,
  CreateBaleInput, SaveWholesaleStoreInput, AddDepotInput, WholesaleFeedParams,
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

  // ── Feed ──

  /** Browse the wholesale bale feed (public). */
  async wholesaleFeed(params?: WholesaleFeedParams, options?: RequestOptions): Promise<{ data: BaleFeedItem[]; limit: number; offset: number }> {
    return this.client.get<{ data: BaleFeedItem[]; limit: number; offset: number }>(
      '/listings/wholesale/feed',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }
}
