export interface Business {
  id: string
  owner_id: string
  name: string
  seller_type: 'individual' | 'business'
  kra_pin: string | null
  id_number: string | null
  county: string | null
  town: string | null
  categories: string | null
  condition_grades: string | null
  delivery_method: 'self' | 'mitumba-logistics'
  price_range_min: number | null
  price_range_max: number | null
  is_verified: number
  store_count?: number
  created_at: string
  updated_at: string
}

export interface UpdateBusinessInput {
  name?: string
  kra_pin?: string
  id_number?: string
  county?: string
  town?: string
  categories?: string[]
  condition_grades?: string[]
  delivery_method?: 'self' | 'mitumba-logistics'
  price_range_min?: number
  price_range_max?: number
}
