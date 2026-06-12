import type { Condition, Listing } from './listings'

export interface SearchParams {
  q: string // 1-100 chars, required
  city_id?: string
  category_id?: string
  min_price?: number
  max_price?: number
  condition?: Condition
  sort?: 'relevance' | 'recency' | 'price_asc' | 'price_desc' | 'sti'
  page?: number
  page_size?: number
}

export interface SearchResult extends Omit<Listing, 'images'> {
  rank: number // FTS relevance score
}

export interface TrendingTerm {
  term: string
  count: number
}

export interface SearchHistoryItem {
  id: string
  query: string
  result_count: number
  first_listing_id: string | null
  first_image: string | null
  created_at: string
}

export interface SaveSearchInput {
  query: string
  result_count: number
  first_listing_id?: string
}
