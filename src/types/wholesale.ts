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
