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

/** A page of a store's reviews, with aggregate rating data for the whole store. */
export interface StoreReviewsPage {
  data: Review[]
  /** Total number of reviews for the store (across all pages). */
  total: number
  /** Mean rating across all of the store's reviews. */
  avg_rating: number
  /** How many reviews gave each star rating, across all of the store's reviews. */
  rating_counts: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  /** 1-based page number returned. */
  page: number
  /** Number of reviews per page. */
  page_size: number
  /** Whether more pages of reviews exist after this one. */
  has_more: boolean
}

export interface ReviewableOrder {
  order_id: string
  listing_title: string
  listing_image_url: string | null
  total: number
  delivered_at: string
}
