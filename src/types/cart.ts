export interface CartItem {
  listing_id: string
  title: string
  price: number
  condition: string
  size: string | null
  store_id: string
  store_name: string
  store_slug: string
  image_url: string | null
  delivery_fee: number
}
