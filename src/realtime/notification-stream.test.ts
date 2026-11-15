import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { APIClient, APIError } from '../client'
import { MemoryTokenStore } from '../token-store'
import { NotificationsModule } from '../modules/notifications'
import { RealtimeProtocolError, RealtimeUnavailableError } from '../types/messages-v2'
import { ManagedNotificationStream, parseNotificationFrame } from './notification-stream'

import type { NotificationStreamFrame, NotificationStreamState, WebSocketCloseEventLike, WebSocketLike, WebSocketMessageEventLike } from '../types'

type Listener = (event?: unknown) => void

class FakeSocket implements WebSocketLike {
  readyState = 1
  closes: Array<{ code?: number; reason?: string }> = []
  failClose = false
  private listeners = new Map<string, Set<Listener>>()
  constructor(readonly url: string, readonly protocols: string | string[]) {}
  send(): void {}
  close(code?: number, reason?: string): void {
    if (this.failClose) throw new Error('closed')
    this.closes.push({ code, reason })
  }
  addEventListener(type: 'open', listener: () => void): void
  addEventListener(type: 'message', listener: (event: WebSocketMessageEventLike) => void): void
  addEventListener(type: 'close', listener: (event: WebSocketCloseEventLike) => void): void
  addEventListener(type: 'error', listener: (event: unknown) => void): void
  addEventListener(type: string, listener: Listener): void {
    const set = this.listeners.get(type) ?? new Set<Listener>()
    set.add(listener)
    this.listeners.set(type, set)
  }
  removeEventListener(type: 'open', listener: () => void): void
  removeEventListener(type: 'message', listener: (event: WebSocketMessageEventLike) => void): void
  removeEventListener(type: 'close', listener: (event: WebSocketCloseEventLike) => void): void
  removeEventListener(type: 'error', listener: (event: unknown) => void): void
  removeEventListener(type: string, listener: Listener): void { this.listeners.get(type)?.delete(listener) }
  emit(type: string, event?: unknown): void { for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event) }
  frame(value: unknown): void { this.emit('message', { data: typeof value === 'string' ? value : JSON.stringify(value) }) }
  listenerCount(): number { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0) }
}

const ticket = (n = 1, over: Record<string, unknown> = {}) => ({
  ticket: `t${n}`,
  expires_at: '2099-01-01T00:00:30Z',
  websocket_url: `wss://api.mitumba.test/notify/notifications/stream?ticket=t${n}`,
  socket_closes_at: '2099-01-01T00:15:00Z',
  ...over,
})
const item = (over: Record<string, unknown> = {}) => ({
  id: 'i1', type: 'order.shipped', category: 'orders', title: 'Shipped', body: 'On its way', image: null,
  actions: [], link: null, count: 1, createdAt: '2026-11-15T10:00:00Z', readAt: null, flash: null, ...over,
})

function subject(options: { post?: ReturnType<typeof vi.fn>; surface?: 'web' | 'mobile' | 'console' } = {}) {
  const sockets: FakeSocket[] = []
  let n = 0
  const post = options.post ?? vi.fn(async () => ticket(++n))
  const client = {
    post,
    createWebSocket: vi.fn((url: string, protocols: string | string[]) => { const socket = new FakeSocket(url, protocols); sockets.push(socket); return socket }),
  } as unknown as APIClient
  const stream = new ManagedNotificationStream(client, { reconnectBaseDelayMs: 100, reconnectMaxDelayMs: 1_000, random: () => 0.5, ...(options.surface ? { surface: options.surface } : {}) })
  const states: NotificationStreamState[] = []
  const frames: NotificationStreamFrame[] = []
  stream.onStateChange((state) => states.push(state))
  stream.onFrame((frame) => frames.push(frame))
  return { stream, sockets, post, client, states, frames }
}

const settle = async () => { for (let i = 0; i < 6; i += 1) await Promise.resolve() }

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('ManagedNotificationStream', () => {
  it('gets a ticket, opens the socket for its surface, and is open on hello', async () => {
    const { stream, sockets, post, states, frames } = subject({ surface: 'mobile' })
    const started = stream.start()
    expect(stream.start()).toBe(started)
    await settle()
    expect(post).toHaveBeenCalledWith('/notify/notifications/stream/tickets', {}, { signal: undefined })
    expect(sockets[0]!.url).toBe('wss://api.mitumba.test/notify/notifications/stream?ticket=t1&surface=mobile')
    expect(sockets[0]!.protocols).toEqual([])
    expect(stream.unread).toBeNull()
    // Open and error carry nothing: hello says the stream is ready, close says it is gone.
    sockets[0]!.emit('open')
    sockets[0]!.emit('error', new Error('blip'))
    expect(stream.state).toBe('connecting')

    sockets[0]!.frame({ type: 'hello', unread: 3, flash: null })
    await expect(started).resolves.toBeUndefined()
    expect(stream.state).toBe('open')
    expect(stream.unread).toBe(3)
    expect(states).toEqual(['connecting', 'open'])
    expect(frames).toEqual([{ type: 'hello', unread: 3, flash: null }])
    await expect(stream.start()).resolves.toBeUndefined()
  })

  it('delivers items, reads and flashes, keeping the unread count, and ignores pongs', async () => {
    const { stream, sockets, frames } = subject()
    void stream.start()
    await settle()
    sockets[0]!.frame({ type: 'hello', unread: 0, flash: null })
    sockets[0]!.frame({ type: 'item', item: item(), unread: 1 })
    sockets[0]!.frame({ type: 'flash', flash: item({ id: 'f1', flash: { kind: 'security' } }) })
    sockets[0]!.frame({ type: 'flash_resolved', id: 'f1', unread: 1 })
    sockets[0]!.frame({ type: 'read', ids: 'all', unread: 0 })
    sockets[0]!.frame({ type: 'pong' })
    expect(frames.map((frame) => frame.type)).toEqual(['hello', 'item', 'flash', 'flash_resolved', 'read'])
    expect(stream.unread).toBe(0)
  })

  it('keeps going when a listener throws, and stops calling one that unsubscribed', async () => {
    const { stream, sockets, frames } = subject()
    const off = stream.onFrame(() => { throw new Error('listener bug') })
    void stream.start()
    await settle()
    sockets[0]!.frame({ type: 'hello', unread: 0, flash: null })
    off()
    sockets[0]!.frame({ type: 'item', item: item(), unread: 1 })
    expect(frames).toHaveLength(2)
  })

  it('reconnects with a fresh ticket at once when the socket reaches its lifetime', async () => {
    const { stream, sockets, post, states } = subject()
    void stream.start()
    await settle()
    sockets[0]!.frame({ type: 'hello', unread: 0, flash: null })
    sockets[0]!.emit('close', { code: 4001, reason: 'expired' })
    expect(stream.state).toBe('reconnecting')
    await vi.advanceTimersByTimeAsync(50)
    expect(post).toHaveBeenCalledTimes(2)
    expect(sockets[1]!.url).toContain('ticket=t2')
    sockets[1]!.frame({ type: 'hello', unread: 2, flash: null })
    expect(states).toEqual(['connecting', 'open', 'reconnecting', 'open'])
    expect(sockets[0]!.listenerCount()).toBe(0)
  })

  it('backs off after drops and failed ticket requests, and stops once it cannot be authorised', async () => {
    const post = vi.fn()
      .mockResolvedValueOnce(ticket(1))
      .mockRejectedValueOnce(new APIError(503, { error: 'temporarily_unavailable' }))
      .mockRejectedValueOnce(new Error('network'))
      .mockRejectedValueOnce(new APIError(401, { error: 'unauthorized' }))
    const { stream, sockets, states } = subject({ post })
    const outcome = stream.start().catch((error: unknown) => error)
    await settle()
    sockets[0]!.emit('close', { code: 1006 })
    await vi.advanceTimersByTimeAsync(50) // 0.5 × 100
    await vi.advanceTimersByTimeAsync(100) // 0.5 × 200
    await vi.advanceTimersByTimeAsync(200) // 0.5 × 400
    expect(await outcome).toMatchObject({ status: 401 })
    expect(states.at(-1)).toBe('failed')
    expect(post).toHaveBeenCalledTimes(4)
  })

  it('stops for good when the server revokes the stream', async () => {
    const { stream, sockets, post } = subject()
    void stream.start()
    await settle()
    sockets[0]!.frame({ type: 'hello', unread: 0, flash: null })
    sockets[0]!.emit('close', { code: 4003, reason: 'revoked' })
    expect(stream.state).toBe('failed')
    await vi.advanceTimersByTimeAsync(5_000)
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('closes with 4004 on a frame it cannot read, and does not reconnect after failing', async () => {
    for (const bad of ['not json', { type: 'item', unread: 1 }, { nope: true }]) {
      const { stream, sockets, post } = subject()
      const started = stream.start()
      await settle()
      sockets[0]!.frame(bad)
      await expect(started).rejects.toBeInstanceOf(RealtimeProtocolError)
      expect(sockets[0]!.closes).toEqual([{ code: 4004, reason: 'protocol_error' }])
      sockets[0]!.emit('close', { code: 1000 })
      await vi.advanceTimersByTimeAsync(5_000)
      expect(post).toHaveBeenCalledTimes(1)
    }
    const { stream, sockets } = subject()
    const started = stream.start()
    await settle()
    sockets[0]!.failClose = true
    sockets[0]!.emit('message', { data: new ArrayBuffer(1) })
    await expect(started).rejects.toBeInstanceOf(RealtimeProtocolError)
  })

  it('refuses a ticket that is malformed or would put a token in the URL', async () => {
    for (const bad of [null, ticket(1, { websocket_url: 'not a url' }), ticket(1, { websocket_url: 'https://api.mitumba.test/x?ticket=t' }), ticket(1, { websocket_url: 'wss://x/s?ticket=t&token=jwt' }), ticket(1, { websocket_url: 'wss://x/s' }), ticket(1, { socket_closes_at: 5 })]) {
      const { stream } = subject({ post: vi.fn().mockResolvedValue(bad) })
      await expect(stream.start()).rejects.toBeInstanceOf(RealtimeProtocolError)
    }
  })

  it('closes cleanly: no reconnect, no listeners, and cannot start again', async () => {
    const { stream, sockets, states } = subject()
    const started = stream.start()
    await settle()
    stream.close()
    await expect(started).resolves.toBeUndefined()
    expect(sockets[0]!.closes).toEqual([{ code: 1000, reason: 'client_close' }])
    expect(states.at(-1)).toBe('closed')
    sockets[0]!.emit('close', { code: 1006 })
    await expect(stream.start()).rejects.toBeInstanceOf(RealtimeUnavailableError)

    const late = subject()
    const pending = late.stream.start()
    late.stream.close()
    await settle()
    await expect(pending).resolves.toBeUndefined()
    expect(late.sockets).toHaveLength(0)

    const throwing = subject()
    void throwing.stream.start()
    await settle()
    throwing.sockets[0]!.failClose = true
    expect(() => throwing.stream.close()).not.toThrow()
  })

  it('ignores a close after the stream was closed during a reconnect wait', async () => {
    const { stream, sockets, post } = subject()
    void stream.start()
    await settle()
    sockets[0]!.emit('close', { code: 1006 })
    stream.close()
    await vi.advanceTimersByTimeAsync(5_000)
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('does not schedule a reconnect when closed while a ticket request was failing', async () => {
    let reject: (error: unknown) => void = () => undefined
    const post = vi.fn(() => new Promise((_resolve, rejectPromise) => { reject = rejectPromise }))
    const { stream, states } = subject({ post })
    void stream.start()
    stream.close()
    reject(new Error('network'))
    await settle()
    await vi.advanceTimersByTimeAsync(5_000)
    expect(post).toHaveBeenCalledTimes(1)
    expect(states.at(-1)).toBe('closed')
  })

  it('uses the default backoff when none is given', async () => {
    const sockets: FakeSocket[] = []
    const post = vi.fn(async () => ticket())
    const client = { post, createWebSocket: vi.fn((url: string, protocols: string | string[]) => { const socket = new FakeSocket(url, protocols); sockets.push(socket); return socket }) } as unknown as APIClient
    const stream = new ManagedNotificationStream(client)
    void stream.start()
    await settle()
    expect(sockets[0]!.url).toContain('surface=web')
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    sockets[0]!.emit('close', { code: 1006 })
    await vi.advanceTimersByTimeAsync(498)
    expect(post).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(2)
    expect(post).toHaveBeenCalledTimes(2)
    stream.close()
  })

  it('removes a state listener', async () => {
    const { stream } = subject()
    const seen: string[] = []
    const off = stream.onStateChange((state) => seen.push(state))
    off()
    void stream.start()
    await settle()
    expect(seen).toEqual([])
  })
})

describe('parseNotificationFrame', () => {
  it('accepts every frame the server sends', () => {
    expect(parseNotificationFrame({ type: 'hello', unread: 0, flash: item({ flash: {} }) })).toMatchObject({ type: 'hello' })
    expect(parseNotificationFrame({ type: 'read', ids: ['a', 'b'], unread: 0 })).toMatchObject({ type: 'read' })
    expect(parseNotificationFrame({ type: 'pong' })).toEqual({ type: 'pong' })
  })

  it.each([
    { type: 'hello', unread: -1, flash: null },
    { type: 'hello', unread: 0, flash: 'x' },
    { type: 'item', item: item({ readAt: 5 }), unread: 0 },
    { type: 'item', item: item({ flash: 'x' }), unread: 0 },
    { type: 'item', item: null, unread: 0 },
    { type: 'read', ids: [1], unread: 0 },
    { type: 'read', ids: 'some', unread: 0 },
    { type: 'flash', flash: item() },
    { type: 'flash_resolved', id: 5, unread: 0 },
    { type: 'mystery' },
    [],
  ])('refuses %j', (frame) => {
    expect(() => parseNotificationFrame(frame)).toThrow(RealtimeProtocolError)
  })
})

describe('NotificationsModule', () => {
  const client = () => new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })

  it('reads the unread count, marks read, and lists', async () => {
    const api = client()
    const module = new NotificationsModule(api)
    vi.spyOn(api, 'get').mockResolvedValue({ unread_count: 2 })
    vi.spyOn(api, 'post').mockResolvedValue({ ok: true })
    await expect(module.unread()).resolves.toEqual({ unread_count: 2 })
    expect(api.get).toHaveBeenCalledWith('/notify/notifications/unread', undefined, undefined)
    await module.markRead(['a'])
    await module.markRead()
    expect(api.post).toHaveBeenNthCalledWith(1, '/notify/notifications/read', { ids: ['a'] }, undefined)
    expect(api.post).toHaveBeenNthCalledWith(2, '/notify/notifications/read', {}, undefined)
    await module.list(2)
    await module.list()
    expect(api.get).toHaveBeenCalledWith('/notify/notifications', { page: 2 }, undefined)
    expect(api.get).toHaveBeenCalledWith('/notify/notifications', undefined, undefined)
  })

  it('keeps a live unread count from the module, for a given surface', async () => {
    vi.useRealTimers()
    const api = client()
    const module = new NotificationsModule(api)
    vi.spyOn(api, 'get').mockResolvedValue({ unread_count: 4 })
    vi.spyOn(api, 'post').mockRejectedValue(new APIError(403, { error: 'stream_disabled' }))
    const resumes: Array<() => void> = []
    const live = module.liveUnread({ surface: 'console', onResume: (listener) => { resumes.push(listener); return () => undefined } })
    const seen: number[] = []
    const off = live.subscribe((n) => seen.push(n))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(seen).toEqual([0, 4])
    expect(api.get).toHaveBeenCalledWith('/notify/notifications/unread', undefined, undefined)
    expect(api.post).toHaveBeenCalledWith('/notify/notifications/stream/tickets', {}, { signal: undefined })
    expect(resumes).toHaveLength(1)
    off()
    // With no resume hook given, the browser default is used (a no-op outside a browser).
    module.liveUnread().subscribe(() => undefined)()
  })

  it('creates an inert stream, or one already connected', async () => {
    const api = client()
    const module = new NotificationsModule(api)
    expect(module.stream().state).toBe('closed')
    const sockets: FakeSocket[] = []
    vi.spyOn(api, 'post').mockResolvedValue(ticket())
    vi.spyOn(api, 'createWebSocket').mockImplementation((url, protocols) => { const socket = new FakeSocket(url, protocols); sockets.push(socket); return socket })
    const connecting = module.connectStream({ surface: 'console' })
    await settle()
    sockets[0]!.frame({ type: 'hello', unread: 0, flash: null })
    const stream = await connecting
    expect(stream.state).toBe('open')
    expect(sockets[0]!.url).toContain('surface=console')
  })
})
