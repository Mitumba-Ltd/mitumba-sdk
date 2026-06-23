import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { APIClient, APIError } from './client'
import { MemoryTokenStore } from './token-store'

const BASE_URL = 'https://api.mitumba.test'

describe('APIClient', () => {
  let client: APIClient

  beforeEach(() => {
    client = new APIClient({ baseUrl: BASE_URL, tokenStore: new MemoryTokenStore() })
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('performs a successful GET request', async () => {
    const mockData = { data: 'test' }
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response)

    const result = await client.get('/test')
    
    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/test`, expect.objectContaining({
      method: 'GET',
    }))
    expect(result).toEqual(mockData)
  })

  it('serializes query parameters correctly', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await client.get('/test', { foo: 'bar', num: 123, empty: undefined, flag: true })

    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE_URL}/test?foo=bar&num=123&flag=true`, expect.anything())
  })

  it('injects Authorization header when token is set', async () => {
    await client.setToken('test-token')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    await client.get('/test')

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]
    const requestInit = callArgs[1] as RequestInit
    const headers = requestInit.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer test-token')
  })

  it('throws APIError on non-2xx response', async () => {
    const errorResponse = { error: 'invalid_input', message: 'Bad request' }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    } as Response)

    await expect(client.get('/test')).rejects.toThrow(APIError)
    
    try {
      await client.get('/test')
    } catch (err) {
      expect(err).toBeInstanceOf(APIError)
      const apiErr = err as APIError
      expect(apiErr.code).toBe('invalid_input')
      expect(apiErr.status).toBe(400)
      expect(apiErr.message).toBe('Bad request')
    }
  })

  it('handles 204 No Content', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response)

    const result = await client.delete('/test')
    expect(result).toBeUndefined()
  })

  it('automatically refreshes token on 401', async () => {
    const onTokenRefresh = vi.fn()
    client = new APIClient({ 
      baseUrl: BASE_URL, 
      token: 'old-token', 
      refreshToken: 'refresh-token',
      onTokenRefresh,
      tokenStore: new MemoryTokenStore(),
    })

    // First call: returns 401
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'unauthorized' }),
    } as Response)

    // Refresh call: returns new tokens
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'new-token', refresh_token: 'new-refresh' }),
    } as Response)

    // Retry call: returns 200 with data
    const mockData = { success: true }
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response)

    const result = await client.get('/protected')

    expect(result).toEqual(mockData)
    expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    expect(onTokenRefresh).toHaveBeenCalledWith({ token: 'new-token', refreshToken: 'new-refresh' })
    
    const lastCallInit = vi.mocked(globalThis.fetch).mock.calls[2][1] as RequestInit
    expect((lastCallInit.headers as Headers).get('Authorization')).toBe('Bearer new-token')
  })

  it('retries requests on 5xx errors with exponential backoff', async () => {
    client = new APIClient({ baseUrl: BASE_URL, maxRetries: 2, debug: false, tokenStore: new MemoryTokenStore() })

    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response)

    const result = await client.get('/retry-test')
    
    expect(result).toEqual({ ok: true })
    expect(globalThis.fetch).toHaveBeenCalledTimes(3)
  })

  it('aborts the request when AbortSignal is aborted', async () => {
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'
    
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(abortError)

    const controller = new AbortController()
    controller.abort()

    await expect(client.get('/abort-test', undefined, { signal: controller.signal })).rejects.toThrow('The operation was aborted')
    
    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]
    expect((callArgs[1] as RequestInit).signal).toBe(controller.signal)
  })

  it('calls onAuthExpired when refresh fails', async () => {
    const onAuthExpired = vi.fn()
    client = new APIClient({
      baseUrl: BASE_URL,
      token: 'expired-token',
      refreshToken: 'bad-refresh',
      onAuthExpired,
      tokenStore: new MemoryTokenStore(),
    })

    // First call: 401
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false, status: 401, json: async () => ({ error: 'unauthorized' }),
    } as Response)

    // Refresh call: fails
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false, status: 401, json: async () => ({ error: 'invalid_token' }),
    } as Response)

    await expect(client.get('/protected')).rejects.toThrow(APIError)
    expect(onAuthExpired).toHaveBeenCalledOnce()
  })
})
