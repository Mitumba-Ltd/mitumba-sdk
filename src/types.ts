import type { TokenStore } from './token-store'

export interface MitumbaClientConfig {
  baseUrl: string
  debug?: boolean
  maxRetries?: number

  /**
   * Optional access token for authenticated requests.
   */
  token?: string

  /**
   * Optional refresh token. If provided, the client can automatically refresh
   * the access token when encountering a 401 response.
   */
  refreshToken?: string

  /**
   * Callback invoked when the token is automatically refreshed.
   * Useful for persisting the new tokens.
   */
  onTokenRefresh?: (tokens: { token: string; refreshToken: string }) => void

  /**
   * Callback invoked when the refresh token is invalid/expired and the user
   * needs to re-authenticate. Only fires when session is truly dead.
   */
  onAuthExpired?: () => void

  /**
   * Custom token store for persisting tokens. Defaults to IndexedDB in browsers,
   * in-memory elsewhere. Pass your own implementation for custom persistence.
   */
  tokenStore?: TokenStore
}

export interface APIErrorResponse {
  error: string
  message?: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export * from './types/auth'
export * from './types/listings'
export * from './types/search'
export * from './types/orders'
export * from './types/pay'
export * from './types/vazi'
export * from './types/messages'
export * from './types/notifications'
export * from './types/stores'
export * from './types/reviews'
export * from './types/wishlists'
export * from './types/cart'
export * from './types/settings'
export * from './types/mailer'
export * from './types/businesses'

export interface RequestOptions {
  signal?: AbortSignal
}
