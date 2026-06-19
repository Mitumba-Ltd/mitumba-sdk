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
}

export interface VaziFeedResponse {
  outfits: VAZIOutfit[]
  total: number
  limit: number
  offset: number
}
