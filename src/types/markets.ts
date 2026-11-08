/**
 * Platform markets: the countries Mitumba operates in (or plans to).
 *
 * The backend owns the registry and serves it at `GET /markets`. Clients read it at runtime and
 * never hardcode a country, a currency, a calling code or a region name.
 *
 * `code` is UPPERCASE ISO 3166-1 alpha-2 (`"KE"`). `slug` is the lowercase URL form (`"ke"`).
 */

export type MarketStatus = 'active' | 'coming_soon'

export interface MarketCurrency {
  /** ISO 4217 alpha-3, e.g. `"KES"`. */
  code: string
  /** The currency's real exponent: 2 for KES, 0 for UGX. */
  minor_unit: number
  symbol: string
  /** A locale that formats this currency correctly, e.g. `"en-KE"`. */
  locale: string
}

export interface MarketPhone {
  /** With the plus, e.g. `"+254"`. */
  calling_code: string
  /** Allowed digit counts after the calling code, without a trunk `0`. */
  national_length: number[]
  /** A valid example in E.164, for placeholders. */
  example: string
}

export interface Market {
  code: string
  slug: string
  name: string
  /** Only `active` markets can transact. `coming_soon` markets are discoverable only. */
  status: MarketStatus
  currency: MarketCurrency
  locale: {
    /** BCP 47 tag, e.g. `"en-KE"`. */
    default: string
    /** IANA zone, e.g. `"Africa/Nairobi"`. */
    timezone: string
  }
  phone: MarketPhone
  /** What the market calls its first-level administrative region, e.g. County / Counties. */
  regions: { label: string; plural: string }
  /** Buyer-visible payment rails, never a provider name. */
  payments: { method_types: string[] }
  /** Fulfilment methods offered in this market. */
  fulfilment_methods: string[]
}

export interface MarketsResponse {
  version: 1
  markets: Market[]
  updated_at: string
}

/** A first-level administrative region of a market, e.g. a county in Kenya. */
export interface MarketRegion {
  /** Stable lowercase slug, e.g. `"trans-nzoia"`. */
  id: string
  /** The canonical name the platform stores, e.g. `"Trans-Nzoia"`. Send this, not free text. */
  name: string
}

export interface MarketRegionsResponse {
  version: 1
  /** UPPERCASE ISO 3166-1 alpha-2, e.g. `"KE"`. */
  market_code: string
  /** Singular and plural labels for the region field, e.g. County / Counties. */
  label: string
  plural: string
  /** Regions in display (alphabetical) order. */
  regions: MarketRegion[]
  updated_at: string
}
