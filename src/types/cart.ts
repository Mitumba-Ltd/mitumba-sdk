import type { ListingStatus } from './listings'

export interface CartItem {
  listing_id: string
  title: string
  price: number
  condition: string
  size: string | null
  /** Units in the cart. */
  quantity: number
  /** The listing's status now. Only an `active` listing can be bought. */
  status: ListingStatus
  /** Units the listing has in total. */
  stock_quantity: number
  /** Units this buyer can have now: stock less units other buyers hold or bought. 0 when not active. */
  available_quantity: number
  store_id: string
  store_name: string
  store_slug: string
  image_url: string | null
  /**
   * @deprecated A flat legacy per-city fee, not a delivery price. Delivery is priced per shop at
   * checkout from the buyer's address (`POST /logistics/basket-quotes`).
   */
  delivery_fee: number
}

/**
 * Whether a cart line can be bought, as {@link cartLineAvailability} decides it.
 *
 * - `available`: every unit in the cart can be bought.
 * - `limited`: fewer units are left than the cart holds; `available_quantity` can still be bought.
 * - `reserved`: on sale, but every unit is held by other buyers' unpaid checkouts. It may come back.
 * - `sold`: sold out for good.
 * - `unavailable`: withdrawn by the seller (removed or back in draft).
 */
export type CartLineAvailability = 'available' | 'limited' | 'reserved' | 'sold' | 'unavailable'
