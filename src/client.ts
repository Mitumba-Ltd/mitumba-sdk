import { MitumbaClientConfig, APIErrorResponse, RequestOptions } from './types'
import { TokenStore, createTokenStore } from './token-store'

export class APIError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly details?: unknown

  constructor(status: number, data: APIErrorResponse) {
    super(data.message || data.error)
    this.name = 'APIError'
    this.code = data.error
    this.status = status
    this.details = data.details
  }
}

function isExpiringSoon(token: string, thresholdSeconds: number): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp as number
    return exp - (Date.now() / 1000) < thresholdSeconds
  } catch {
    return false
  }
}

export class APIClient {
  private config: MitumbaClientConfig
  private tokenStore: TokenStore
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  constructor(config: MitumbaClientConfig) {
    this.config = config
    this.tokenStore = config.tokenStore ?? createTokenStore()

    // Seed store from config if tokens provided
    if (config.token) {
      this.tokenStore.setTokens(config.token, config.refreshToken || '')
    }
  }

  public async setToken(token: string, refreshToken?: string): Promise<void> {
    this.config.token = token
    if (refreshToken && refreshToken.length > 0) {
      this.config.refreshToken = refreshToken
    }
    const effectiveRefresh = refreshToken && refreshToken.length > 0
      ? refreshToken
      : this.config.refreshToken && this.config.refreshToken.length > 0
        ? this.config.refreshToken
        : ''
    await this.tokenStore.setTokens(token, effectiveRefresh)
  }

  /**
   * Set both tokens explicitly. Requires a valid refresh token.
   * Preferred over setToken() to avoid dropping the refresh token.
   */
  public async setSession(tokens: { access_token: string; refresh_token: string }): Promise<void> {
    this.config.token = tokens.access_token
    this.config.refreshToken = tokens.refresh_token
    await this.tokenStore.setTokens(tokens.access_token, tokens.refresh_token)
  }

  public getToken(): string | undefined {
    return this.config.token
  }

  public getBaseUrl(): string {
    return this.config.baseUrl
  }

  public async clearToken(): Promise<void> {
    this.config.token = undefined
    this.config.refreshToken = undefined
    await this.tokenStore.clear()
  }

  /**
   * Check if user has a stored session (access or refresh token available).
   */
  public async isAuthenticated(): Promise<boolean> {
    const access = this.config.token ?? await this.tokenStore.getAccessToken()
    if (access) return true
    const refresh = await this.tokenStore.getRefreshToken()
    return !!refresh
  }

  /**
   * Hydrate tokens from the store into memory (call on app boot).
   */
  public async hydrate(): Promise<void> {
    const access = await this.tokenStore.getAccessToken()
    const refresh = await this.tokenStore.getRefreshToken()
    if (access) this.config.token = access
    if (refresh) this.config.refreshToken = refresh
  }

  private async ensureFreshToken(): Promise<void> {
    // Try hydrating from store if no in-memory token
    if (!this.config.token) {
      const stored = await this.tokenStore.getAccessToken()
      if (stored) this.config.token = stored
      const refresh = await this.tokenStore.getRefreshToken()
      if (refresh) this.config.refreshToken = refresh
    }

    // Proactive refresh if token expires within 60 seconds
    if (this.config.token && isExpiringSoon(this.config.token, 60) && this.config.refreshToken && this.config.refreshToken.length > 0) {
      await this.handleTokenRefresh()
    }
  }

  private async request<T>(
    method: string, 
    path: string, 
    body?: unknown, 
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    // Proactive refresh before request (skip for auth endpoints)
    if (!path.includes('/auth/refresh') && !path.includes('/auth/login') && !path.includes('/auth/register')) {
      await this.ensureFreshToken()
    }

    const url = new URL(path, this.config.baseUrl)
    
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      }
    }

    const headers = new Headers()
    if (body && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    if (this.config.token) {
      headers.set('Authorization', `Bearer ${this.config.token}`)
    }

    const init: RequestInit = {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: options?.signal
    }

    const maxRetries = this.config.maxRetries ?? 3
    let attempt = 0
    let response: Response

    while (true) {
      if (this.config.debug) {
        console.log(`[Mitumba SDK] ${method} ${url.toString()}`)
      }
      
      const startTime = Date.now()
      try {
        response = await fetch(url.toString(), init)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err
        }
        if (attempt < maxRetries) {
          attempt++
          if (this.config.debug) {
            console.log(`[Mitumba SDK] Network error. Retrying ${method} ${url.toString()} (attempt ${attempt})`)
          }
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
          continue
        }
        throw new APIError(0, { error: 'network_error', message: err instanceof Error ? err.message : 'Network request failed' })
      }

      if (this.config.debug) {
        console.log(`[Mitumba SDK] ${method} ${url.toString()} - ${response.status} (${Date.now() - startTime}ms)`)
      }

      if (response.status >= 500 && attempt < maxRetries) {
        attempt++
        if (this.config.debug) {
          console.log(`[Mitumba SDK] ${response.status} error. Retrying ${method} ${url.toString()} (attempt ${attempt})`)
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
        continue
      }

      break
    }

    // Handle 401 — attempt refresh and retry
    if (response.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login') && !path.includes('/auth/register')) {
      const hasRefreshToken = this.config.refreshToken && this.config.refreshToken.length > 0

      if (hasRefreshToken) {
        try {
          await this.handleTokenRefresh()
          headers.set('Authorization', `Bearer ${this.config.token}`)
          response = await fetch(url.toString(), { ...init, headers })
        } catch {
          if (this.config.onAuthExpired) {
            this.config.onAuthExpired()
          }
          throw new APIError(401, { error: 'session_expired', message: 'Session expired. Please log in again.' })
        }
      } else {
        // No refresh token — session is dead, fire callback immediately
        if (this.config.onAuthExpired) {
          this.config.onAuthExpired()
        }
        throw new APIError(401, { error: 'session_expired', message: 'Session expired. Please log in again.' })
      }
    }

    if (!response.ok) {
      let errorData: APIErrorResponse
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: 'unknown_error', message: response.statusText }
      }
      throw new APIError(response.status, errorData)
    }

    if (response.status === 204) {
      return undefined as unknown as T
    }

    return response.json() as Promise<T>
  }

  private async handleTokenRefresh(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const url = new URL('/auth/refresh', this.config.baseUrl)
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.config.refreshToken }),
        })

        if (!response.ok) {
          throw new Error('Refresh failed')
        }

        const data = await response.json() as { access_token: string, refresh_token: string }
        this.config.token = data.access_token
        this.config.refreshToken = data.refresh_token
        await this.tokenStore.setTokens(data.access_token, data.refresh_token)

        if (this.config.onTokenRefresh) {
          this.config.onTokenRefresh({ token: data.access_token, refreshToken: data.refresh_token })
        }
      } catch (err) {
        await this.clearToken()
        throw err
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  public get<T>(path: string, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, params, options)
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, undefined, options)
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, undefined, options)
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, undefined, options)
  }

  public delete<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, body, undefined, options)
  }
}
