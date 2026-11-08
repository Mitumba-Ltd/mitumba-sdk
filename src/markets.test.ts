import { describe, it, expect } from 'vitest'
import {
  activeMarkets,
  findMarket,
  findRegion,
  formatAmount,
  formatMoney,
  formatMoneyCompact,
  formatPhone,
  isValidPhone,
  maskPhone,
  normalizePhone,
  regionById,
} from './markets'
import type { Market, MarketRegion } from './types/markets'

const KENYA: Market = {
  code: 'KE',
  slug: 'ke',
  name: 'Kenya',
  status: 'active',
  currency: { code: 'KES', minor_unit: 2, symbol: 'KSh', locale: 'en-KE' },
  locale: { default: 'en-KE', timezone: 'Africa/Nairobi' },
  phone: { calling_code: '+254', national_length: [9], example: '+254712345678' },
  regions: { label: 'County', plural: 'Counties' },
  payments: { method_types: ['mobile_money', 'card'] },
  fulfilment_methods: ['pickup_point', 'doorstep'],
}

// Synthetic markets: they exist only to prove the helpers are not Kenya-shaped.
const UGANDA: Market = {
  ...KENYA,
  code: 'UG',
  slug: 'ug',
  name: 'Uganda',
  status: 'coming_soon',
  currency: { code: 'UGX', minor_unit: 0, symbol: 'USh', locale: 'en-UG' },
  phone: { calling_code: '+256', national_length: [9], example: '+256712345678' },
}

const NIGERIA: Market = {
  ...KENYA,
  code: 'NG',
  slug: 'ng',
  name: 'Nigeria',
  status: 'coming_soon',
  currency: { code: 'NGN', minor_unit: 2, symbol: '₦', locale: 'en-NG' },
  phone: { calling_code: '+234', national_length: [10], example: '+2348031234567' },
}

describe('formatMoney', () => {
  it('leads with the currency code and a space', () => {
    expect(formatMoney(1850, KENYA)).toBe('KES 1,850')
    expect(formatMoney(1234567, KENYA)).toBe('KES 1,234,567')
    expect(formatMoney(0, KENYA)).toBe('KES 0')
  })

  it('follows the market, not Kenya', () => {
    expect(formatMoney(5000, UGANDA)).toBe('UGX 5,000')
    expect(formatMoney(5000, NIGERIA)).toBe('NGN 5,000')
  })

  it('keeps the sign in front and rounds to whole units', () => {
    expect(formatMoney(-1850, KENYA)).toBe('-KES 1,850')
    expect(formatMoney(1849.6, KENYA)).toBe('KES 1,850')
  })

  it('shows a dash instead of a believable number for a non-finite amount', () => {
    expect(formatMoney(Number.NaN, KENYA)).toBe('KES —')
    expect(formatMoney(Number.POSITIVE_INFINITY, KENYA)).toBe('KES —')
  })

  it('falls back to comma grouping when the locale is rejected', () => {
    const odd: Market = { ...KENYA, currency: { ...KENYA.currency, locale: 'not a locale!!' } }
    expect(formatMoney(1234567, odd)).toBe('KES 1,234,567')
  })
})

describe('formatAmount', () => {
  it('omits the currency', () => {
    expect(formatAmount(1850, KENYA)).toBe('1,850')
    expect(formatAmount(-1850, KENYA)).toBe('-1,850')
    expect(formatAmount(Number.NaN, KENYA)).toBe('—')
  })
})

describe('formatMoneyCompact', () => {
  it('uses the full amount below 10,000', () => {
    expect(formatMoneyCompact(9999, KENYA)).toBe('KES 9,999')
  })

  it('abbreviates thousands and millions', () => {
    expect(formatMoneyCompact(10000, KENYA)).toBe('KES 10K')
    expect(formatMoneyCompact(13500, KENYA)).toBe('KES 13.5K')
    expect(formatMoneyCompact(120000, KENYA)).toBe('KES 120K')
    expect(formatMoneyCompact(1_000_000, KENYA)).toBe('KES 1M')
    expect(formatMoneyCompact(2_400_000, KENYA)).toBe('KES 2.4M')
    expect(formatMoneyCompact(-13500, KENYA)).toBe('-KES 13.5K')
  })

  it('carries rounding into the next unit instead of printing 1000K', () => {
    expect(formatMoneyCompact(999_950, KENYA)).toBe('KES 1M')
  })

  it('uses the market currency', () => {
    expect(formatMoneyCompact(13500, UGANDA)).toBe('UGX 13.5K')
  })
})

describe('normalizePhone', () => {
  it.each([
    ['0712 345 678', '+254712345678'],
    ['712345678', '+254712345678'],
    ['254712345678', '+254712345678'],
    ['+254 712-345-678', '+254712345678'],
    ['(0712) 345 678', '+254712345678'],
    ['+254 0712345678', '+254712345678'],
    ['0112345678', '+254112345678'],
  ])('accepts %s for Kenya', (input, expected) => {
    expect(normalizePhone(input, KENYA)).toBe(expected)
  })

  it.each([
    [''],
    ['abc'],
    ['12345'],
    ['+255712345678'],
    ['+25471234567'],
    ['+2547123456789'],
    ['00254712345678'],
  ])('rejects %s for Kenya', (input) => {
    expect(normalizePhone(input, KENYA)).toBeNull()
    expect(isValidPhone(input, KENYA)).toBe(false)
  })

  it('follows the market calling code and length', () => {
    expect(normalizePhone('0803 123 4567', NIGERIA)).toBe('+2348031234567')
    expect(normalizePhone('0712345678', UGANDA)).toBe('+256712345678')
    // A Kenyan number is not valid in Nigeria, and the reverse.
    expect(normalizePhone('+254712345678', NIGERIA)).toBeNull()
    expect(normalizePhone('+2348031234567', KENYA)).toBeNull()
  })

  it('treats a leading plus literally', () => {
    expect(normalizePhone('+712345678', KENYA)).toBeNull()
  })
})

describe('formatPhone', () => {
  it('reads a stored number in groups', () => {
    expect(formatPhone('+254712345678', KENYA)).toBe('+254 712 345 678')
    expect(formatPhone('+2348031234567', NIGERIA)).toBe('+234 803 123 4567')
  })

  it('returns anything that is not a stored number for the market untouched', () => {
    expect(formatPhone('abc', KENYA)).toBe('abc')
    expect(formatPhone('0712345678', KENYA)).toBe('0712345678')
    expect(formatPhone('+2348031234567', KENYA)).toBe('+2348031234567')
  })
})

describe('maskPhone', () => {
  it('hides the middle', () => {
    expect(maskPhone('+254712345678', KENYA)).toBe('+254 712 ••• 678')
    expect(maskPhone('+2348031234567', NIGERIA)).toBe('+234 803 ••• 567')
  })

  it('returns anything that is not a stored number for the market untouched', () => {
    expect(maskPhone('abc', KENYA)).toBe('abc')
    expect(maskPhone('+2348031234567', KENYA)).toBe('+2348031234567')
  })
})

describe('market lookups', () => {
  const all = [KENYA, UGANDA, NIGERIA]

  it('finds a market by exact code', () => {
    expect(findMarket(all, 'UG')).toBe(UGANDA)
    expect(findMarket(all, 'ug')).toBeUndefined()
    expect(findMarket(all, 'ZZ')).toBeUndefined()
  })

  it('keeps only markets that can transact', () => {
    expect(activeMarkets(all)).toEqual([KENYA])
  })
})

describe('region lookups', () => {
  const regions: MarketRegion[] = [
    { id: 'nairobi', name: 'Nairobi' },
    { id: 'trans-nzoia', name: 'Trans-Nzoia' },
  ]

  it('finds a region by its canonical name, ignoring surrounding whitespace', () => {
    expect(findRegion(regions, 'Trans-Nzoia')).toBe(regions[1])
    expect(findRegion(regions, '  Nairobi ')).toBe(regions[0])
  })

  it('does not guess: case, separators and blanks must match the canonical name', () => {
    expect(findRegion(regions, 'nairobi')).toBeUndefined()
    expect(findRegion(regions, 'Trans Nzoia')).toBeUndefined()
    expect(findRegion(regions, '   ')).toBeUndefined()
    expect(findRegion([], 'Nairobi')).toBeUndefined()
  })

  it('finds a region by its id slug', () => {
    expect(regionById(regions, 'trans-nzoia')).toBe(regions[1])
    expect(regionById(regions, 'Trans-Nzoia')).toBeUndefined()
  })
})
