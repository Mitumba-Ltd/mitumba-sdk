import type { Market, MarketRegion } from './types/markets'

/**
 * Market-aware formatting and validation. Everything here is driven by a `Market` read from
 * `sdk.markets.list()`: no country, currency or calling code is hardcoded, so adding a market
 * needs no client change.
 *
 * Amounts are WHOLE major units (1850 means KES 1,850), exactly as the platform stores catalogue
 * and order prices. Phone numbers are stored in E.164.
 *
 * Pure and isomorphic: no network, no Node or browser APIs beyond `Intl.NumberFormat` for
 * digit grouping.
 */

type CurrencyMarket = Pick<Market, 'currency'>
type PhoneMarket = Pick<Market, 'phone'>

const GAP = ' '

/** Locale digit grouping, falling back to a plain comma grouping if Intl rejects the locale. */
function group(value: number, locale: string): string {
  const rounded = Math.round(Math.abs(value))
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(rounded)
  } catch {
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

/**
 * `1850` reads as `KES 1,850`. The currency code leads and a space follows it on purpose:
 * `KES1,850` misreads, and a symbol like `Ksh` is ambiguous across markets. A non-finite amount
 * renders as `KES —` rather than a believable-looking number.
 */
export function formatMoney(amount: number, market: CurrencyMarket): string {
  const { code, locale } = market.currency
  if (!Number.isFinite(amount)) return `${code}${GAP}—`
  return `${amount < 0 ? '-' : ''}${code}${GAP}${group(amount, locale)}`
}

/** The number alone, for rows that already say what currency they are in. */
export function formatAmount(amount: number, market: CurrencyMarket): string {
  if (!Number.isFinite(amount)) return '—'
  return `${amount < 0 ? '-' : ''}${group(amount, market.currency.locale)}`
}

/**
 * For dashboard figures where the magnitude matters more than the exact amount: `13500` reads as
 * `KES 13.5K`, `2400000` as `KES 2.4M`. Below 10,000 it falls back to the full amount.
 */
export function formatMoneyCompact(amount: number, market: CurrencyMarket): string {
  const absolute = Math.abs(amount)
  if (!Number.isFinite(amount) || absolute < 10_000) return formatMoney(amount, market)

  const { code } = market.currency
  const sign = amount < 0 ? '-' : ''
  const trim = (n: number): string => n.toFixed(1).replace(/\.0$/, '')

  if (absolute < 1_000_000) {
    const thousands = absolute / 1000
    // Rounding can carry into the next unit (999,950 → 1000K); render that as 1M instead.
    if (Math.round(thousands) < 1000) {
      return `${sign}${code}${GAP}${thousands < 100 ? trim(thousands) : String(Math.round(thousands))}K`
    }
  }
  return `${sign}${code}${GAP}${trim(absolute / 1_000_000)}M`
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Turn what a person typed into E.164 for this market, or `null` if it cannot be a number here.
 * Accepts `0712 345 678`, `712345678`, `254712345678` and `+254 712-345-678`. A leading `+` is
 * taken literally: it must carry this market's calling code. Without one, a trunk `0`, then the
 * calling code, then a bare national number are tried in that order.
 */
export function normalizePhone(input: string, market: PhoneMarket): string | null {
  const { calling_code, national_length } = market.phone
  const callingDigits = digitsOnly(calling_code)
  const trimmed = input.trim()
  const digits = digitsOnly(trimmed)
  if (digits.length === 0) return null

  const fits = (national: string): boolean => national_length.includes(national.length) && !national.startsWith('0')
  // After a calling code, a stray trunk 0 is common (`+254 0712…`). Accept it; reject anything else.
  const afterCallingCode = (rest: string): string | null => {
    if (fits(rest)) return rest
    if (rest.startsWith('0') && fits(rest.slice(1))) return rest.slice(1)
    return null
  }

  if (trimmed.startsWith('+')) {
    if (!digits.startsWith(callingDigits)) return null
    const national = afterCallingCode(digits.slice(callingDigits.length))
    return national === null ? null : `+${callingDigits}${national}`
  }
  if (digits.startsWith('0') && fits(digits.slice(1))) return `+${callingDigits}${digits.slice(1)}`
  if (digits.startsWith(callingDigits)) {
    const national = afterCallingCode(digits.slice(callingDigits.length))
    if (national !== null) return `+${callingDigits}${national}`
  }
  if (fits(digits)) return `+${callingDigits}${digits}`
  return null
}

/** True when `input` can be normalized to a number in this market. */
export function isValidPhone(input: string, market: PhoneMarket): boolean {
  return normalizePhone(input, market) !== null
}

function splitNational(e164: string, market: PhoneMarket): { calling: string; national: string } | null {
  const calling = market.phone.calling_code
  if (!e164.startsWith(calling)) return null
  const national = e164.slice(calling.length)
  if (!/^\d+$/.test(national) || !market.phone.national_length.includes(national.length)) return null
  return { calling, national }
}

/**
 * Reads an E.164 number in groups of three: `+254712345678` becomes `+254 712 345 678`. Anything
 * that is not a stored number for this market is returned untouched, because a half-formatted
 * number is worse than a raw one.
 */
export function formatPhone(value: string, market: PhoneMarket): string {
  const compact = value.replace(/[^\d+]/g, '')
  const parts = splitNational(compact, market)
  if (!parts) return value
  const groups = parts.national.match(/\d{1,3}/g) ?? []
  // A lone trailing digit reads badly; fold it into the group before it (…3 + 1 → …4).
  if (groups.length > 1 && groups[groups.length - 1]!.length === 1) {
    const last = groups.pop()!
    groups[groups.length - 1] += last
  }
  return `${parts.calling}${GAP}${groups.join(GAP)}`
}

/**
 * Hides the middle of a number where it only needs to prove which number it is:
 * `+254712345678` becomes `+254 712 ••• 678`. Untouched if it is not a stored number here.
 */
export function maskPhone(value: string, market: PhoneMarket): string {
  const compact = value.replace(/[^\d+]/g, '')
  const parts = splitNational(compact, market)
  if (!parts || parts.national.length < 7) return value
  const head = parts.national.slice(0, 3)
  const tail = parts.national.slice(-3)
  return `${parts.calling}${GAP}${head}${GAP}•••${GAP}${tail}`
}

/** Find a market by UPPERCASE ISO 3166-1 alpha-2 code in a list read from `sdk.markets.list()`. */
export function findMarket(markets: readonly Market[], code: string): Market | undefined {
  return markets.find((market) => market.code === code)
}

/** Markets that can transact. A `coming_soon` market is for discovery only. */
export function activeMarkets(markets: readonly Market[]): Market[] {
  return markets.filter((market) => market.status === 'active')
}

/**
 * Find a region by its canonical name in a list read from `sdk.markets.regions(code)`. Surrounding
 * whitespace is ignored; everything else must match exactly, so a stored value is always one the
 * platform accepts. Use it to preselect a saved region in a picker.
 */
export function findRegion(regions: readonly MarketRegion[], name: string): MarketRegion | undefined {
  const input = name.trim()
  if (!input) return undefined
  return regions.find((region) => region.name === input)
}

/** Find a region by its stable id slug, e.g. `"trans-nzoia"`. */
export function regionById(regions: readonly MarketRegion[], id: string): MarketRegion | undefined {
  return regions.find((region) => region.id === id)
}
