import { APIClient } from '../client'
import type { WishlistListing, RequestOptions } from '../types'

export class WishlistsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List saved listings.
   */
  async list(options?: RequestOptions): Promise<{ data: WishlistListing[] }> {
    return this.client.get<{ data: WishlistListing[] }>('/listings/wishlists', undefined, options)
  }

  /**
   * Add a listing to the wishlist.
   */
  async add(listingId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/listings/wishlists/${listingId}`, undefined, options)
  }

  /**
   * Remove a listing from the wishlist.
   */
  async remove(listingId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/listings/wishlists/${listingId}`, undefined, options)
  }
}
