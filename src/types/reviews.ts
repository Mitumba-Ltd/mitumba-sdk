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
  /** The delivered/completed order being reviewed. Required: the server rejects a review without it,
   * and each order may be reviewed at most once. */
  order_id: string
}

export interface ReviewableOrder {
  order_id: string
  listing_title: string
  listing_image_url: string | null
  total: number
  delivered_at: string
}
