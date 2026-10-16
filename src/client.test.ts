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

  it('recovers an aborted checkout initiation by explicitly retrying the same request', async () => {
    await client.setToken('checkout-token')
    const input = {
      order_id: 'order_checkout_1',
      idempotency_key: 'checkout_attempt_1',
      method: { type: 'mobile_money', phone: '+254700000000' },
    } as const
    const response = {
      version: 1,
      order_id: input.order_id,
      attempt: {
        id: 'attempt_checkout_1',
        sequence: 1,
        provider: 'daraja',
        status: 'initiated',
      },
      next_action: { type: 'await_confirmation' },
    } as const
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'
    vi.mocked(globalThis.fetch)
      .mockRejectedValueOnce(abortError)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => response,
      } as Response)

    const cancelledController = new AbortController()
    cancelledController.abort()
    await expect(client.post('/pay/checkout/initiate', input, {
      signal: cancelledController.signal,
    })).rejects.toBe(abortError)

    const retryController = new AbortController()
    const result = await client.post('/pay/checkout/initiate', input, {
      signal: retryController.signal,
    })

    expect(result).toBe(response)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    const [cancelledUrl, cancelledInit] = vi.mocked(globalThis.fetch).mock.calls[0]
    const [retryUrl, retryInit] = vi.mocked(globalThis.fetch).mock.calls[1]
    expect(cancelledUrl).toBe(`${BASE_URL}/pay/checkout/initiate`)
    expect(retryUrl).toBe(cancelledUrl)
    expect(cancelledInit?.method).toBe('POST')
    expect(retryInit?.method).toBe('POST')
    expect(cancelledInit?.body).toBe(JSON.stringify(input))
    expect(retryInit?.body).toBe(cancelledInit?.body)
    expect(cancelledInit?.signal).toBe(cancelledController.signal)
    expect(retryInit?.signal).toBe(retryController.signal)
    expect((cancelledInit?.headers as Headers).get('Authorization')).toBe('Bearer checkout-token')
    expect((retryInit?.headers as Headers).get('Content-Type')).toBe('application/json')
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


describe('custom request headers', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('sends a one-off protocol header', async () => {
    const client = new APIClient({ baseUrl: BASE_URL })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response)

    await client.post('/auth/root/setup', { email: 'root@mitumba.africa' }, {
      headers: { 'X-Root-Setup-Secret': 'one-time' },
    })

    const init = vi.mocked(globalThis.fetch).mock.calls.at(-1)?.[1] as RequestInit
    expect((init.headers as Headers).get('X-Root-Setup-Secret')).toBe('one-time')
  })

  it('does not let a custom header replace the SDK session token', async () => {
    const client = new APIClient({ baseUrl: BASE_URL })
    await client.setToken('real-session')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response)

    await client.get('/admin/stats', undefined, {
      headers: { Authorization: 'Bearer attacker-chosen' },
    })

    const init = vi.mocked(globalThis.fetch).mock.calls.at(-1)?.[1] as RequestInit
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer real-session')
  })
})


describe('token refresh failure classification', () => {
  const expiringToken = (): string => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 10 }))
    return `header.${payload}.signature`
  }

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['AbortError', Object.assign(new Error('aborted replay'), { name: 'AbortError' })],
    ['network error', new TypeError('offline replay')],
  ])('propagates a replay %s without expiring a successfully refreshed session', async (_label, replayError) => {
    const onAuthExpired = vi.fn()
    const store = new MemoryTokenStore()
    const client = new APIClient({
      baseUrl: BASE_URL,
      token: 'old-access',
      refreshToken: 'valid-refresh',
      onAuthExpired,
      tokenStore: store,
      maxRetries: 0,
    })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'fresh-access', refresh_token: 'fresh-refresh' }),
      } as Response)
      .mockRejectedValueOnce(replayError)

    await expect(client.get('/protected')).rejects.toBe(replayError)
    expect(onAuthExpired).not.toHaveBeenCalled()
    expect(client.getToken()).toBe('fresh-access')
    expect(await store.getRefreshToken()).toBe('fresh-refresh')
  })

  it.each([
    ['offline', new TypeError('offline')],
    ['abort', Object.assign(new Error('aborted'), { name: 'AbortError' })],
  ])('preserves tokens when proactive refresh fails from %s', async (_label, refreshError) => {
    const store = new MemoryTokenStore()
    const token = expiringToken()
    const client = new APIClient({ baseUrl: BASE_URL, token, refreshToken: 'valid-refresh', tokenStore: store })
    const controller = new AbortController()
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(refreshError)

    await expect(client.ensureFreshToken({ signal: controller.signal })).rejects.toBe(refreshError)
    expect(client.getToken()).toBe(token)
    expect(await store.getRefreshToken()).toBe('valid-refresh')
    expect((vi.mocked(globalThis.fetch).mock.calls[0]![1] as RequestInit).signal).toBe(controller.signal)
  })

  it('preserves tokens for refresh 5xx and malformed transient responses', async () => {
    const store = new MemoryTokenStore()
    const token = expiringToken()
    const client = new APIClient({ baseUrl: BASE_URL, token, refreshToken: 'valid-refresh', tokenStore: store })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false, status: 503, statusText: 'Unavailable', json: async () => ({ error: 'temporarily_unavailable' }),
    } as Response)
    await expect(client.ensureFreshToken()).rejects.toMatchObject({ status: 503, code: 'temporarily_unavailable' })
    expect(client.getToken()).toBe(token)
    expect(await store.getRefreshToken()).toBe('valid-refresh')

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ nope: true }) } as Response)
    await expect(client.ensureFreshToken()).rejects.toMatchObject({ code: 'refresh_response_invalid' })
    expect(client.getToken()).toBe(token)
  })

  it.each([400, 401])('clears tokens only for definitive refresh credential status %i', async (status) => {
    const onAuthExpired = vi.fn()
    const store = new MemoryTokenStore()
    const client = new APIClient({
      baseUrl: BASE_URL, token: 'old', refreshToken: 'invalid', tokenStore: store, onAuthExpired, maxRetries: 0,
    })
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response)
      .mockResolvedValueOnce({ ok: false, status } as Response)

    await expect(client.get('/protected')).rejects.toMatchObject({ code: 'session_expired' })
    expect(onAuthExpired).toHaveBeenCalledOnce()
    expect(client.getToken()).toBeUndefined()
    expect(await store.getRefreshToken()).toBeNull()
  })

  it('shares one in-flight proactive refresh across concurrent callers', async () => {
    const token = expiringToken()
    const client = new APIClient({ baseUrl: BASE_URL, token, refreshToken: 'refresh', tokenStore: new MemoryTokenStore() })
    let resolveRefresh!: (response: Response) => void
    vi.mocked(globalThis.fetch).mockReturnValueOnce(new Promise<Response>((resolve) => { resolveRefresh = resolve }))

    const first = client.ensureFreshToken()
    const second = client.ensureFreshToken()
    expect(globalThis.fetch).toHaveBeenCalledOnce()
    resolveRefresh({
      ok: true, status: 200, json: async () => ({ access_token: 'new', refresh_token: 'new-refresh' }),
    } as Response)
    await Promise.all([first, second])
    expect(client.getToken()).toBe('new')
  })
})


describe('isomorphic WebSocket factory', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses an injected transport without requiring a browser global', () => {
    const socket = { readyState: 0 } as unknown as import('./types').WebSocketLike
    const webSocketFactory = vi.fn(() => socket)
    const client = new APIClient({ baseUrl: BASE_URL, webSocketFactory })
    expect(client.createWebSocket('wss://example.test/socket', 'protocol')).toBe(socket)
    expect(webSocketFactory).toHaveBeenCalledWith('wss://example.test/socket', 'protocol')
  })

  it('uses globalThis.WebSocket when available and fails with a typed error otherwise', async () => {
    const Constructor = vi.fn(function MockSocket() { return { readyState: 0 } })
    vi.stubGlobal('WebSocket', Constructor)
    const client = new APIClient({ baseUrl: BASE_URL })
    client.createWebSocket('wss://example.test/socket', ['protocol'])
    expect(Constructor).toHaveBeenCalledWith('wss://example.test/socket', ['protocol'])

    vi.stubGlobal('WebSocket', undefined)
    expect(() => client.createWebSocket('wss://example.test/socket', 'protocol'))
      .toThrow('Messaging realtime is unavailable in this runtime.')
  })
})


describe('versioned API error envelopes', () => {
  beforeEach(() => { globalThis.fetch = vi.fn() })
  afterEach(() => vi.restoreAllMocks())

  it('normalizes nested Messaging v2 errors into APIError', async () => {
    const client = new APIClient({ baseUrl: BASE_URL, maxRetries: 0 })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      json: async () => ({
        api_version: 2,
        error: { code: 'idempotency_conflict', message: 'Key reused', details: { field: 'body' } },
      }),
    } as Response)

    await expect(client.post('/notify/v2/inboxes/buyer/threads/t/messages', {})).rejects.toMatchObject({
      name: 'APIError', code: 'idempotency_conflict', status: 409, message: 'Key reused', details: { field: 'body' },
    })
  })

  it('uses a stable unknown error when an error body is malformed', async () => {
    const client = new APIClient({ baseUrl: BASE_URL, maxRetries: 0 })
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false, status: 418, statusText: 'Unexpected', json: async () => ({ error: { nope: true } }),
    } as Response)
    await expect(client.get('/test')).rejects.toMatchObject({ code: 'unknown_error', message: 'Unexpected' })
  })
})
