export type SubscriptionTier = 'free' | 'pro' | 'premium'

export interface Store {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  city: string | null
  subscription_tier: SubscriptionTier
  created_at: string
  follower_count?: number
  is_following?: boolean
}

export interface CreateStoreInput {
  name: string
  slug: string
  category?: string
  description?: string
  tagline?: string
  city_id?: string
}

export interface UpdateStoreInput {
  name?: string
  tagline?: string
  description?: string
  category?: string
  logo_url?: string
  banner_url?: string
  city_id?: string
}

export interface StoreStats {
  listings: number
  orders: number
  revenue: number
  followers: number
}

export interface StoreSettings {
  id: string
  store_id: string
  shipping_type: 'flat' | 'per_item' | 'free'
  flat_rate: number
  shipping_counties: string[]
  bus_partners: string[]
  delivery_days_min: number
  delivery_days_max: number
  payout_method: 'mpesa' | 'bank'
  payout_mpesa_number: string | null
  payout_bank_name: string | null
  payout_account_number: string | null
  payout_frequency: 'instant' | 'daily' | 'weekly'
  accept_returns: boolean
  refund_window_days: number
  accept_exchanges: boolean
  return_shipping_by: 'buyer' | 'seller'
  vacation_mode: boolean
  response_time_hours: number
  operating_days: 'everyday' | 'weekdays' | 'custom'
  custom_days: string[]
  phone_verified: boolean
  id_document_url: string | null
  id_verified: boolean
  kra_pin: string | null
  created_at: string
  updated_at: string
}

export interface StoreAnalytics {
  revenue: { date: string; revenue: number; orders: number }[]
  orders_breakdown: { date: string; completed: number; pending: number; cancelled: number }[]
  traffic_sources: { source: string; count: number }[]
  top_listings: { listing_id: string; title: string; views: number; revenue: number }[]
  geography: { city: string; orders: number }[]
  sti_trend: { date: string; score: number }[]
  totals: { views: number; orders: number; revenue: number; followers: number }
}
