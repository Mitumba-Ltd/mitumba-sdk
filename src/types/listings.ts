export const CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const
export type Condition = typeof CONDITIONS[number]

export const LISTING_STATUSES = ['draft', 'active', 'sold', 'removed'] as const
export type ListingStatus = typeof LISTING_STATUSES[number]

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  position: number
  created_at: string
}

export interface SellerProfile {
  id: string
  sti_score: number
  verification_status: string
  seller_type: 'individual' | 'bale'
}

export interface Listing {
  id: string
  seller_id: string
  title: string
  description: string | null
  category_id: string
  city_id: string
  price: number // KES integer
  condition: Condition
  status: ListingStatus
  photo_verified: boolean
  vazi_eligible: boolean
  created_at: string
  updated_at: string
  // Seller profile (joined)
  sti_score: number
  verification_status: string
  seller_type: 'individual' | 'bale'
  // Images (only present on GET /listings/:id, not in feed)
  images?: ListingImage[]
}

export interface ListingsFeedParams {
  city_id?: string
  category_id?: string
  min_price?: number
  max_price?: number
  condition?: Condition
  sort?: 'recency' | 'price_asc' | 'price_desc'
  page?: number
  page_size?: number
}

export interface CreateListingInput {
  store_id: string
  title: string
  description?: string
  category_id: string
  city_id: string
  price: number
  condition: Condition
  vazi_eligible?: boolean
}

export type UpdateListingInput = Partial<CreateListingInput>

export interface Category {
  id: string
  name: string
  slug: string
}

export interface City {
  id: string
  name: string
  delivery_fee: number
}

export interface SellerStorefront {
  seller: SellerProfile
  listings: Listing[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export interface PresignImageResponse {
  r2_key: string
  image_id: string
}
