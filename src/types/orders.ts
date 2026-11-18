export const ORDER_STATUSES = [
  'created',
  'payment_pending',
  'paid',
  'seller_confirmed',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'disputed',
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]

export interface OrderEvent {
  id: string
  order_id: string
  actor: string // user ID or 'system'
  old_status: string
  new_status: string
  note: string | null
  created_at: string
}

export interface DeliveryAddress {
  label: string
  line1: string
  city: string
  county: string
  phone: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  amount: number
  delivery_fee: number
  total: number
  status: OrderStatus
  city_id: string
  created_at: string
  updated_at: string
  // Joined listing details
  listing_title: string | null
  listing_image_url: string | null
  listing_condition: string | null
  listing_size: string | null
  // Joined buyer details
  buyer_name: string | null
  /**
   * The buyer's county. Not sensitive — always returned to both parties, including to the seller
   * before payment (with `buyer_name`) while `buyer_phone`/`delivery_address` are withheld.
   * (Mitumba-Ltd/mitumba#321)
   */
  buyer_county: string | null
  /**
   * The buyer's phone. Visible to the buyer at any status. Visible to the seller **only** while
   * they are handing the parcel over — statuses `paid`, `seller_confirmed`, `shipped`,
   * `delivered` — and `null` for the seller otherwise (before payment, and on `completed`,
   * `cancelled`, or `disputed`). Before payment a seller sees only `buyer_name` and the delivery
   * `county`. (Mitumba-Ltd/mitumba#321)
   */
  buyer_phone: string | null
  /**
   * The buyer's delivery address. Same visibility rule as `buyer_phone`: always visible to the
   * buyer; visible to the seller only during the `paid`→`delivered` handover window, `null`
   * otherwise. (Mitumba-Ltd/mitumba#321)
   */
  delivery_address: DeliveryAddress | null
  events?: OrderEvent[]
}

export interface CreateOrderInput {
  listing_id: string
}

export interface TransitionOrderInput {
  status: OrderStatus
  note?: string
}

export interface OrderHistoryParams {
  role?: 'buyer' | 'seller'
  store_id?: string
  page?: number
}

/** One line of an order, as previewed in order history. */
export interface OrderItemSummary {
  listing_id: string
  /** The listing's title, or `null` when the listing is gone. */
  title: string | null
  /** The listing's first photo, or `null` when it has none. */
  image_url: string | null
  quantity: number
}

/** An order as listed by `GET /orders/history`. */
export interface OrderHistoryEntry extends Order {
  /** The order's first four lines, in cart order. */
  items: OrderItemSummary[]
  /** Every unit in the order, across all its lines. */
  item_count: number
  /** The checkout this order belongs to, or `null` for an order placed outside a checkout. */
  checkout_id: string | null
  /** That checkout's invoice number. */
  invoice_number: string | null
  /** With `role: 'seller'`: what the order needs next, from the shop's side. */
  next_step?: ShopNextStep
}

/** Who an order is waiting on, from the shop's side. */
export type ShopHolder = 'shop' | 'courier' | 'buyer' | 'mitumba' | 'done'

/** The one next step of an order, from the shop's side. Open: an unknown step reads as waiting. */
export type KnownShopStep =
  | 'awaiting_payment'
  | 'confirm_available'
  | 'get_ready'
  | 'hand_over_counter'
  | 'drop_off'
  | 'await_collection'
  | 'mark_shipped'
  | 'in_transit'
  | 'buyer_window'
  | 'respond_dispute'
  | 'dispute_review'
  | 'parcel_problem'
  | 'completed'
  | 'cancelled'

export type ShopStep = KnownShopStep | (string & {})

export interface ShopNextStep {
  holder: ShopHolder
  step: ShopStep
  /** When the step must be done by (ISO 8601), or `null` when nothing is due. */
  deadline: string | null
}

/** A line of a settlement, signed, in minor units. */
export interface SettlementLine {
  /** e.g. `item`, `commission`, `commission_vat`, `deliver_for_me`, `counter_fare`. Open. */
  kind: string
  amount_minor: number
}

/** What the shop receives for an order. */
export interface ShopSettlement {
  currency: string
  lines: SettlementLine[]
  /** What the shop receives, in minor units. */
  receive_minor: number
  /** `true` once the payout exists and its lines are final; `false` for an estimate. */
  final: boolean
}

/** One line of an order, in full, on the shop's view of the order. */
export interface OrderItem {
  listing_id: string
  title: string | null
  image_url: string | null
  quantity: number
  /** The unit price, in whole units of the order's currency. */
  price: number
}

/** The fields the shop's view of an order adds (`GET /orders/:id` for the seller or a team member). */
export interface ShopOrderFields {
  items: OrderItem[]
  /** `null` for a cancelled order. */
  settlement: ShopSettlement | null
  next_step: ShopNextStep
}

/** Why the shop cancels a paid order. */
export type ShopCancelReason = 'sold_elsewhere' | 'damaged' | 'other'

export interface CancelOrderInput {
  reason: ShopCancelReason
  /** Shown to the buyer, up to 500 characters. */
  note?: string
}

export interface CancelOrderResult {
  order_id: string
  status: 'cancelled'
  /** What the buyer is owed back, in whole units. */
  refund: { id: string; amount: number; currency: string; status: 'pending' | 'sent' | 'failed' }
  /** When this cancellation paused the shop, the pause's end; otherwise `null`. */
  shop_paused_until: string | null
}

/** Which document an order has: its invoice while it awaits payment, its receipt once it is paid. */
export type OrderDocumentKind = 'invoice' | 'receipt'

/** An order's invoice or receipt, as a PDF. Every order of one checkout has the same document. */
export interface OrderDocument {
  kind: OrderDocumentKind
  /** The name to save it under, e.g. Mitumba-Receipt-RCT-20261110-C0FFEE00.pdf. */
  filename: string
  /** The PDF (application/pdf). */
  blob: Blob
}
