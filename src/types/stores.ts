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
