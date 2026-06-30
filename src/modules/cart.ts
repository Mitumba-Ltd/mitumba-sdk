import { APIClient } from '../client'
import type { CartItem, RequestOptions } from '../types'

export class CartModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List items in the cart.
   */
  async list(options?: RequestOptions): Promise<{ data: CartItem[] }> {
    return this.client.get<{ data: CartItem[] }>('/listings/cart', undefined, options)
  }

  /**
   * Add a listing to the cart.
   */
  async add(listingId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/listings/cart/${listingId}`, undefined, options)
  }

  /**
   * Remove a listing from the cart.
   */
  async remove(listingId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/listings/cart/${listingId}`, undefined, options)
  }

  /**
   * Update the quantity of a cart item.
   */
  async updateQuantity(listingId: string, quantity: number, options?: RequestOptions): Promise<{ ok: true; quantity: number }> {
    return this.client.patch<{ ok: true; quantity: number }>(`/listings/cart/${listingId}`, { quantity }, options)
  }

  /**
   * Checkout the cart — creates orders grouped by store and clears the cart.
   */
  async checkout(options?: RequestOptions): Promise<{ order_ids: string[]; count: number }> {
    return this.client.post<{ order_ids: string[]; count: number }>('/orders/checkout', undefined, options)
  }
}
