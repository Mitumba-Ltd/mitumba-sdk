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
  buyer_phone: string | null
  // Buyer's default delivery address
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
