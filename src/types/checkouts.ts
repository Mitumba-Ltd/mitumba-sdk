/** An amount in a currency's minor units (cents for KES). */
export interface CheckoutMoney {
  currency: string
  minor_units: number
}

export interface CreateCheckoutInput {
  /** One of the buyer's saved addresses. */
  address_id: string
  /** One per buyer intent, 8 to 128 characters. A retry with the same key returns the same checkout. */
  idempotency_key: string
  /** Exactly one per shop being ordered from: the delivery quote picked for that shop. */
  deliveries: Array<{ store_id: string; quote_id: string }>
  /**
   * The cart lines to order, by listing id (1 to 200). Every other line stays in the cart, and
   * `deliveries` covers only the shops of these lines. Omitted: the whole cart.
   */
  listing_ids?: string[]
}

export type CheckoutState = 'awaiting_payment' | 'paid' | 'expired' | 'cancelled'

/** One shop's order within a checkout. */
export interface CheckoutShopOrder {
  order_id: string
  store_id: string
  items_total: CheckoutMoney
  delivery_fee: CheckoutMoney
  /** The buyer protection fee (BPF) on this shop's order; zero when none. */
  bpf: CheckoutMoney
  /** What the buyer pays for this shop's order: items + delivery + BPF. */
  total: CheckoutMoney
}

/** One cart submission, holding one order per shop. */
export interface Checkout {
  id: string
  invoice_number: string
  status: CheckoutState
  market_code: string
  items_total: CheckoutMoney
  delivery_total: CheckoutMoney
  /** The BPF across every shop's order; zero when none. */
  bpf_total: CheckoutMoney
  /** What the buyer pays: items + delivery + BPF. */
  total: CheckoutMoney
  /** Payment due-by (ISO 8601). */
  due_at: string
  created_at: string
  orders: CheckoutShopOrder[]
}

export interface CreateCheckoutResponse {
  checkout: Checkout
  order_ids: string[]
  count: number
}

export interface GetCheckoutResponse {
  checkout: Checkout
}

/** `checkouts.cancel` answers the cancelled checkout. */
export type CancelCheckoutResponse = GetCheckoutResponse

/**
 * Why a cancel was refused: `checkout_payment_in_progress` (409) while a payment prompt is in flight,
 * `checkout_not_cancellable` (409) once the checkout is paid or expired, `not_found` (404) otherwise.
 */
export type CancelCheckoutRefusalCode = 'checkout_payment_in_progress' | 'checkout_not_cancellable' | 'not_found'

/** Why a checkout was refused: the error body, keyed by `error`. */
export type CheckoutRefusal =
  | { error: 'invalid_input' | 'empty_cart' | 'cannot_buy_own' | 'invalid_deliveries' | 'invalid_selection' }
  | { error: 'address_not_found' }
  | { error: 'idempotency_conflict' }
  | { error: 'listing_unavailable'; listings: Array<{ listing_id: string; available: number }> }
  | { error: 'mixed_market_cart' | 'market_not_active' }
  | { error: 'checkout_payment_in_progress'; checkout_id: string }
  | { error: 'delivery_quote_rejected'; store_id: string | null; reason: string }
  | { error: 'address_region_invalid' }
  | { error: 'delivery_required'; store_ids: string[] }
  | { error: 'delivery_quotes_unavailable' }

export type CheckoutRefusalCode = CheckoutRefusal['error']
