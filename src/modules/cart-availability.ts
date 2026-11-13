import type { CartItem, CartLineAvailability } from '../types'

type AvailabilityFields = Pick<CartItem, 'status' | 'quantity' | 'available_quantity'>

/** Whether a cart line can be bought now. See {@link CartLineAvailability}. */
export function cartLineAvailability(item: AvailabilityFields): CartLineAvailability {
  if (item.status === 'sold') return 'sold'
  if (item.status !== 'active') return 'unavailable'
  if (item.available_quantity <= 0) return 'reserved'
  if (item.available_quantity < item.quantity) return 'limited'
  return 'available'
}

/** True when the line can be checked out, possibly at a lower quantity (`limited`). */
export function isCartLineBuyable(item: AvailabilityFields): boolean {
  const availability = cartLineAvailability(item)
  return availability === 'available' || availability === 'limited'
}

export interface CartPartition<T extends AvailabilityFields> {
  /** Lines that can be bought exactly as they are. */
  buyable: T[]
  /** Lines with fewer units left than in the cart: lower the quantity to `available_quantity`. */
  limited: T[]
  /** Lines that cannot be bought now: sold, withdrawn, or reserved by other buyers. */
  unavailable: T[]
}

/**
 * Split a cart for checkout. Checkout refuses a cart holding any line it cannot sell in full, so
 * `limited` and `unavailable` lines must be fixed (lowered or removed) before checking out.
 */
export function partitionCart<T extends AvailabilityFields>(items: readonly T[]): CartPartition<T> {
  const partition: CartPartition<T> = { buyable: [], limited: [], unavailable: [] }
  for (const item of items) {
    const availability = cartLineAvailability(item)
    if (availability === 'available') partition.buyable.push(item)
    else if (availability === 'limited') partition.limited.push(item)
    else partition.unavailable.push(item)
  }
  return partition
}
