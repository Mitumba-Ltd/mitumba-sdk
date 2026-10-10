/**
 * Canonical go.mitumba.africa share URLs — the one place clients build listing, store and bale share links.
 *
 * Forms follow Mitumba-Ltd/mitumba-links `docs/product/share-urls.md`: `/l/{listingId}`, `/s/{storeSlug}` and
 * `/b/{baleId}` with no slug, query or fragment. Pure functions: no network access, safe in any runtime.
 */

export const DEFAULT_SHARE_ORIGIN = 'https://go.mitumba.africa'

export interface ShareUrlOptions {
  /**
   * Override the share origin, e.g. a staging Worker. Must be an `https://` origin (no path, query or
   * credentials); `http://localhost` / `http://127.0.0.1` are allowed for local development.
   * Defaults to {@link DEFAULT_SHARE_ORIGIN}.
   */
  origin?: string
}

const ID_PATTERN = /^[0-9a-f]{32}$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function resolveOrigin(origin: string | undefined): string {
  if (origin === undefined) return DEFAULT_SHARE_ORIGIN
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    throw new TypeError(`Invalid share origin: ${origin}`)
  }
  const local = url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
  if ((url.protocol !== 'https:' && !local) || url.username || url.password) {
    throw new TypeError(`Share origin must be https:// (or http://localhost): ${origin}`)
  }
  if ((url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) {
    throw new TypeError(`Share origin must not include a path, query or fragment: ${origin}`)
  }
  return url.origin
}

function identifier(kind: string, value: string): string {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!ID_PATTERN.test(normalized)) throw new TypeError(`Invalid ${kind} ID: ${String(value)}`)
  return normalized
}

/** `https://go.mitumba.africa/l/{listingId}` */
export function listingShareUrl(listingId: string, options: ShareUrlOptions = {}): string {
  return `${resolveOrigin(options.origin)}/l/${encodeURIComponent(identifier('listing', listingId))}`
}

/** `https://go.mitumba.africa/s/{storeSlug}` */
export function storeShareUrl(storeSlug: string, options: ShareUrlOptions = {}): string {
  const slug = typeof storeSlug === 'string' ? storeSlug.trim().toLowerCase() : ''
  if (slug.length > 64 || !SLUG_PATTERN.test(slug)) throw new TypeError(`Invalid store slug: ${String(storeSlug)}`)
  return `${resolveOrigin(options.origin)}/s/${encodeURIComponent(slug)}`
}

/** `https://go.mitumba.africa/b/{baleId}` */
export function baleShareUrl(baleId: string, options: ShareUrlOptions = {}): string {
  return `${resolveOrigin(options.origin)}/b/${encodeURIComponent(identifier('bale', baleId))}`
}
