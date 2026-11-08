export interface Business {
  id: string
  owner_id: string
  name: string
  seller_type: 'individual' | 'business'
  kra_pin: string | null
  id_number: string | null
  /** Canonical region name (e.g. `Trans-Nzoia`), from `sdk.markets.regions()`. */
  county: string | null
  town: string | null
  /** Contact / payout phone in E.164, e.g. `+254712345678`. */
  phone: string | null
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
  /**
   * A region name from `sdk.markets.regions()`; known alternative spellings are accepted and stored
   * canonically. Anything else is a 400 `invalid_county`. `null` or blank clears it.
   */
  county?: string | null
  town?: string
  /**
   * Contact / payout phone in any common local form (`0712 345 678`, `+254 712 345 678`); stored in
   * E.164. An invalid number is a 400 `invalid_phone`. `null` or blank clears it.
   */
  phone?: string | null
  categories?: string[]
  condition_grades?: string[]
  delivery_method?: 'self' | 'mitumba-logistics'
  price_range_min?: number
  price_range_max?: number
}
