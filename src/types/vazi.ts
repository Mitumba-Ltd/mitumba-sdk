export interface VAZIOutfitItem {
  id: string
  title: string
  price: number
  imageUrl: string
}

export interface VAZIOutfit {
  id: string
  name: string
  items: VAZIOutfitItem[]
  total_price: number
  webm_url: string | null
  mp4_url: string | null
  has_video: boolean
  item_count: number
}

export interface VaziFeedParams {
  limit?: number
  offset?: number
  featuring?: string
}

export interface VAZIOutfitDetailItem {
  id: string
  title: string
  price: number
  condition: string
  size: string | null
  store_name: string | null
  store_slug: string | null
  image_url: string | null
}

export interface VAZIOutfitDetail {
  id: string
  name: string
  total_price: number
  webm_url: string | null
  store_name: string | null
  store_slug: string | null
  items: VAZIOutfitDetailItem[]
}

export interface VaziFeedResponse {
  outfits: VAZIOutfit[]
  total: number
  limit: number
  offset: number
}
