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
