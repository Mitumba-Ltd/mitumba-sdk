import { MitumbaClientConfig, APIErrorResponse } from './types'

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

export class APIClient {
  private config: MitumbaClientConfig
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  constructor(config: MitumbaClientConfig) {
    this.config = config
  }

  public setToken(token: string, refreshToken?: string) {
    this.config.token = token
    if (refreshToken) {
      this.config.refreshToken = refreshToken
    }
  }

  public clearToken() {
    this.config.token = undefined
    this.config.refreshToken = undefined
  }

  private async request<T>(method: string, path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
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
    }

    let response = await fetch(url.toString(), init)

    // Handle automatic token refresh
    if (response.status === 401 && this.config.refreshToken && !path.includes('/auth/refresh')) {
      await this.handleTokenRefresh()
      // Retry request with new token
      headers.set('Authorization', `Bearer ${this.config.token}`)
      response = await fetch(url.toString(), { ...init, headers })
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
        this.setToken(data.access_token, data.refresh_token)

        if (this.config.onTokenRefresh) {
          this.config.onTokenRefresh({ token: data.access_token, refreshToken: data.refresh_token })
        }
      } catch (err) {
        this.clearToken()
        throw new APIError(401, { error: 'token_expired', message: 'Session expired. Please log in again.' })
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  public get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('GET', path, undefined, params)
  }

  public post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }

  public put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body)
  }

  public patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body)
  }

  public delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }
}
