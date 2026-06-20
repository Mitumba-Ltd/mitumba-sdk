export interface CartItem {
  id: string
  listing_id: string
  store_id: string
  store_name: string
  store_slug: string
  title: string
  price: number
  condition: string
  size: string | null
  image_keys: string | null
  added_at: string
}
