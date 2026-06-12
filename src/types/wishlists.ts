import type { Condition } from './listings'

export interface WishlistListing {
  id: string
  title: string
  price: number
  condition: Condition
  store_id: string | null
  category_id: string
  city_id: string
  status: string
  created_at: string
  image_keys?: string
}
