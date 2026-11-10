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
