export interface Review {
  id: string
  store_id: string
  buyer_id: string
  order_id: string | null
  rating: number
  comment: string | null
  author_name: string | null
  created_at: string
}

export interface CreateReviewInput {
  rating: number
  comment?: string
  order_id?: string
}

export interface ReviewableOrder {
  order_id: string
  listing_title: string
  listing_image_url: string | null
  total: number
  delivered_at: string
}
