export const GARMENT_TYPES = [
  'top',
  'bottom',
  'shoes',
  'accessory',
  'dress',
  'outerwear',
  'bag',
  'kids',
] as const

export type GarmentType = typeof GARMENT_TYPES[number]

export interface VAZIOutfitItem {
  listing_id: string
  garment_type: GarmentType
  price_kes: number
  seller_id: string
  seller_sti: number
  seller_city: string
  image_url: string | null
  is_seed: boolean
  final_score: number
}

export interface VAZIOutfit {
  id: string
  name: string
  items: VAZIOutfitItem[]
  total_price_kes: number
  sellers_count: number
  is_multi_city: boolean
  assembled_at: string // ISO timestamp
}

export interface VaziFeedParams {
  limit?: number
  offset?: number
}

export interface VaziFeedResponse {
  outfits: VAZIOutfit[]
  total: number
  limit: number
  offset: number
}
