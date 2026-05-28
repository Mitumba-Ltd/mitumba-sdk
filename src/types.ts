export interface MitumbaClientConfig {
  /**
   * The base URL of the Mitumba API gateway.
   * Example: 'https://api.mitumba.stanl.ink'
   */
  baseUrl: string

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
