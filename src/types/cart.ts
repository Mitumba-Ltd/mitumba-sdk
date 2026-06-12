export interface CartItem {
  id: string
  listing_id: string
  store_id: string
  store_name: string
  title: string
  price: number
  condition: string
  image_keys: string | null
  added_at: string
}
