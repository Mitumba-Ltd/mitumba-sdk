import { describe, expect, it } from 'vitest'
import { DEFAULT_SHARE_ORIGIN, baleShareUrl, listingShareUrl, storeShareUrl } from './share'

const ID = '3f9c0d2e4b7a41e8a5c6d7e8f9a0b1c2'

describe('share URL builders', () => {
  it('builds canonical production URLs', () => {
    expect(DEFAULT_SHARE_ORIGIN).toBe('https://go.mitumba.africa')
    expect(listingShareUrl(ID)).toBe(`https://go.mitumba.africa/l/${ID}`)
    expect(storeShareUrl('mama-wanjiku')).toBe('https://go.mitumba.africa/s/mama-wanjiku')
    expect(baleShareUrl(ID)).toBe(`https://go.mitumba.africa/b/${ID}`)
  })

  it('normalises case and surrounding whitespace', () => {
    expect(listingShareUrl(` ${ID.toUpperCase()} `)).toBe(`https://go.mitumba.africa/l/${ID}`)
    expect(storeShareUrl('Mama-Wanjiku')).toBe('https://go.mitumba.africa/s/mama-wanjiku')
  })

  it('rejects identifiers that could change the path', () => {
    for (const bad of ['', '123', `${ID}/x`, '../admin', `${ID}?x=1`, `${ID}#x`, 'g'.repeat(32)]) {
      expect(() => listingShareUrl(bad)).toThrow(TypeError)
      expect(() => baleShareUrl(bad)).toThrow(TypeError)
    }
    for (const bad of ['', 'a b', 'a/b', '-a', 'a--b', 'a'.repeat(65), 'ünicode', '%2e%2e']) {
      expect(() => storeShareUrl(bad)).toThrow(TypeError)
    }
  })

  it('accepts a configurable https origin for staging and localhost for development', () => {
    expect(listingShareUrl(ID, { origin: 'https://mitumba-go-staging.example.workers.dev' })).toBe(
      `https://mitumba-go-staging.example.workers.dev/l/${ID}`,
    )
    expect(storeShareUrl('a', { origin: 'https://staging.example/' })).toBe('https://staging.example/s/a')
    expect(baleShareUrl(ID, { origin: 'http://localhost:8787' })).toBe(`http://localhost:8787/b/${ID}`)
  })

  it('rejects unsafe origins', () => {
    for (const origin of ['http://go.mitumba.africa', 'javascript:alert(1)', 'https://u:p@x.example', 'https://x.example/path', 'https://x.example?q=1', 'not a url']) {
      expect(() => listingShareUrl(ID, { origin })).toThrow(TypeError)
    }
  })
})
