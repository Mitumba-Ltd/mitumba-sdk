export type BaleGrade = 'Cream' | 'A' | 'B' | 'C'
export type BaleType = 'original' | 'sorted'

export interface WholesaleStore {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  logo_url: string | null
  origins: string[]
  verified: boolean
}

export interface WholesaleDepot {
  id: string
  name: string
  address: string | null
  city_id: string | null
  is_primary: boolean
}

export interface Bale {
  id: string
  store_id: string
  seller_id: string
  title: string
  category: string
  grade: BaleGrade
  bale_type: BaleType
  weight_kg: number
  origin: string | null
  est_pieces: number | null
  price_kes: number
  moq: number
  mix: string | null
  description: string | null
  city_id: string | null
  status: 'draft' | 'active' | 'sold_out'
  created_at: string
}

export interface BaleDetail extends Bale {
  images: string[]
  store: { name: string; slug: string; verified: boolean; sti: number | null }
}

export interface CreateBaleInput {
  title: string
  category: string
  grade: BaleGrade
  bale_type?: BaleType
  weight_kg: number
  origin?: string
  est_pieces?: number
  price_kes: number
  moq?: number
  mix?: string
  description?: string
  city_id?: string
  status?: 'draft' | 'active' | 'sold_out'
}

export interface WholesaleFeedParams {
  q?: string
  category?: string
  grade?: BaleGrade
  origin?: string
  city_id?: string
  limit?: number
  offset?: number
}

export interface BaleFeedItem extends Bale {
  image_url: string | null
  store: { name: string; slug: string; verified: boolean; sti: number | null }
}

export interface SaveWholesaleStoreInput {
  name: string
  tagline?: string
  description?: string
  logo_url?: string
  origins?: string[]
}

export interface AddDepotInput {
  name: string
  address?: string
  city_id?: string
  is_primary?: boolean
}

// ── Bale Orders ──

export const BALE_ORDER_STATUSES = ['pending_payment', 'paid', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled'] as const
export type BaleOrderStatus = typeof BALE_ORDER_STATUSES[number]

export type BaleFulfillment = 'pickup' | 'courier'

export interface BaleOrder {
  id: string
  bale_id: string
  buyer_id: string
  seller_id: string
  store_id: string
  title: string
  grade: string
  origin: string | null
  image_url: string | null
  qty: number
  unit_kes: number
  total_kes: number
  fulfillment: BaleFulfillment
  freight_kes: number | null
  status: BaleOrderStatus
  city_id: string | null
  buyer_name: string | null
  store_name: string | null
  created_at: string
}

export interface BaleOrderEvent {
  actor: string
  old_status: string | null
  new_status: string
  note: string | null
  created_at: string
}

export interface CreateBaleOrderInput {
  bale_id: string
  qty?: number
  fulfillment: BaleFulfillment
}
