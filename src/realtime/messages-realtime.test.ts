import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { APIClient, APIError } from '../client'
import { ManagedMessagesRealtimeConnection } from './messages-realtime'

import type {
  MessagesRealtimeEvent,
  WebSocketCloseEventLike,
  WebSocketLike,
  WebSocketMessageEventLike,
} from '../types'

type Listener = ((event?: unknown) => void)

class FakeSocket implements WebSocketLike {
  readonly CONNECTING = 0
  readonly OPEN = 1
  readyState = 1
  sent: string[] = []
  closes: Array<{ code?: number; reason?: string }> = []
  failSend = false
  private listeners = new Map<string, Set<Listener>>()

  send(data: string): void {
    if (this.failSend) throw new Error('send failed')
    this.sent.push(data)
  }

  close(code?: number, reason?: string): void {
    this.closes.push({ code, reason })
    this.readyState = 3
  }

  addEventListener(type: 'open', listener: () => void): void
  addEventListener(type: 'message', listener: (event: WebSocketMessageEventLike) => void): void
  addEventListener(type: 'close', listener: (event: WebSocketCloseEventLike) => void): void
  addEventListener(type: 'error', listener: (event: unknown) => void): void
  addEventListener(type: string, listener: Listener): void {
    const listeners = this.listeners.get(type) ?? new Set<Listener>()
    listeners.add(listener)
    this.listeners.set(type, listeners)
  }

  removeEventListener(type: 'open', listener: () => void): void
  removeEventListener(type: 'message', listener: (event: WebSocketMessageEventLike) => void): void
  removeEventListener(type: 'close', listener: (event: WebSocketCloseEventLike) => void): void
  removeEventListener(type: 'error', listener: (event: unknown) => void): void
  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener)
  }

  emit(type: string, event?: unknown): void {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event)
  }

  listenerCount(): number {
    return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0)
  }
}

const ticket = (index = 1) => ({
  api_version: 2,
  data: {
    ticket: `ticket-${index}`,
    expires_at: '2099-01-01T00:00:00Z',
    websocket_url: `wss://api.mitumba.test/notify/v2/realtime?ticket=ticket-${index}`,
    websocket_protocol: 'mitumba-messaging-v1',
    protocol_version: 1,
    resume_cursor: null,
  },
})

function subject(options: { post?: ReturnType<typeof vi.fn>; random?: () => number } = {}) {
  const sockets: FakeSocket[] = []
  const post = options.post ?? vi.fn().mockResolvedValue(ticket())
  const client = {
    post,
    createWebSocket: vi.fn(() => {
      const socket = new FakeSocket()
      sockets.push(socket)
      return socket
    }),
  } as unknown as APIClient
  const connection = new ManagedMessagesRealtimeConnection(client, {
    perspective: { kind: 'buyer' },
    reconnectBaseDelayMs: 100,
    reconnectMaxDelayMs: 1_000,
    random: options.random ?? (() => 0.5),
  })
  return { connection, sockets, post, client }
}

async function begin(connection: ManagedMessagesRealtimeConnection, sockets: FakeSocket[]): Promise<{ started: Promise<void> }> {
  const started = connection.start()
  for (let index = 0; index < 5 && sockets.length === 0; index += 1) await Promise.resolve()
  expect(sockets).toHaveLength(1)
  return { started }
}

async function flush(): Promise<void> {
  for (let index = 0; index < 10; index += 1) await Promise.resolve()
}

function ready(cursor: string | null = 'cursor-0'): string {
  return JSON.stringify({
    api_version: 2, protocol_version: 1, type: 'ready', connection_id: 'connection',
    resume_cursor: cursor, heartbeat_interval_ms: 25_000,
  })
}

function messageEvent(id: string, sequence: number, threadId = 'thread'): MessagesRealtimeEvent {
  return {
    api_version: 2,
    protocol_version: 1,
    event_id: id,
    resume_cursor: `cursor-${sequence}`,
    type: 'message.created',
    occurred_at: '2026-10-16T00:00:00Z',
    conversation_id: 'conversation',
    thread_id: threadId,
    payload: {
      message: {
        id: `message-${sequence}`,
        thread_id: threadId,
        sequence,
        author: { side: 'buyer', buyer: { id: 'buyer', display_name: 'Buyer', avatar_url: null } },
        body: 'hello',
        reply_to: null,
        attachments: [],
        client_message_id: `client-${sequence}`,
        created_at: '2026-10-16T00:00:00Z',
      },
    },
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ManagedMessagesRealtimeConnection', () => {
  it('is inert until start, negotiates a ticket, and opens only after ready', async () => {
    const { connection, sockets, post, client } = subject()
    const states: string[] = []
    const unsubscribe = connection.onStateChange((state) => states.push(state))
    expect(connection.state).toBe('closed')
    expect(post).not.toHaveBeenCalled()

    const { started } = await begin(connection, sockets)
    expect(connection.state).toBe('connecting')
    expect(post).toHaveBeenCalledWith(
      '/notify/v2/inboxes/buyer/realtime/tickets',
      { resume_cursor: null, supported_protocol_versions: [1] },
      { signal: undefined },
    )
    expect(vi.mocked(client.createWebSocket)).toHaveBeenCalledWith(
      'wss://api.mitumba.test/notify/v2/realtime?ticket=ticket-1',
      'mitumba-messaging-v1',
    )
    sockets[0]!.emit('message', { data: ready() })
    await started
    expect(connection.state).toBe('open')
    expect(connection.resumeCursor).toBe('cursor-0')
    expect(states).toEqual(['connecting', 'open'])
    unsubscribe()
  })

  it('validates, serially delivers, deduplicates, orders, and ACKs durable events', async () => {
    const { connection, sockets } = subject()
    const seen: string[] = []
    connection.subscribeThread('thread')
    connection.onEvent(async (event) => {
      await Promise.resolve()
      if ('event_id' in event) seen.push(event.event_id)
    })
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started

    const first = JSON.stringify(messageEvent('event-1', 1))
    sockets[0]!.emit('message', { data: first })
    await flush()
    expect(seen).toEqual(['event-1'])
    expect(JSON.parse(sockets[0]!.sent.at(-1)!)).toEqual({
      protocol_version: 1, type: 'ack', event_id: 'event-1', resume_cursor: 'cursor-1',
    })
    sockets[0]!.emit('message', { data: first })
    sockets[0]!.emit('message', { data: JSON.stringify(messageEvent('event-old', 1)) })
    await Promise.resolve()
    expect(seen).toEqual(['event-1'])
    expect(connection.resumeCursor).toBe('cursor-1')
  })

  it('filters unsubscribed thread traffic but always exposes summary and resync events', async () => {
    const { connection, sockets } = subject()
    const seen: string[] = []
    connection.subscribeThread('selected')
    connection.onEvent((event) => seen.push(event.type))
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    sockets[0]!.emit('message', { data: JSON.stringify(messageEvent('other', 1, 'other')) })
    sockets[0]!.emit('message', { data: JSON.stringify({
      api_version: 2, protocol_version: 1, event_id: 'summary', resume_cursor: 'summary-cursor',
      type: 'conversation.updated', occurred_at: 'now', conversation_id: 'conversation',
      payload: { conversation: { id: 'conversation', buyer: {}, store: {}, unread_count: 0 } },
    }) })
    sockets[0]!.emit('message', { data: JSON.stringify({
      api_version: 2, protocol_version: 1, type: 'resync.required', reason: 'cursor_expired', resume_cursor: 'resync-cursor',
    }) })
    await flush()
    expect(seen).toEqual(['conversation.updated', 'resync.required'])
    expect(connection.resumeCursor).toBe('resync-cursor')
  })

  it('scopes and throttles typing, auto-clears it, and clears on unsubscribe', async () => {
    const { connection, sockets } = subject()
    connection.subscribeThread('thread')
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    connection.setTyping('other', true)
    connection.setTyping('thread', true)
    connection.setTyping('thread', true)
    expect(sockets[0]!.sent).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(3_000)
    expect(JSON.parse(sockets[0]!.sent.at(-1)!)).toMatchObject({ type: 'typing.set', is_typing: false })
    await vi.advanceTimersByTimeAsync(800)
    connection.setTyping('thread', true)
    connection.unsubscribeThread('thread')
    expect(JSON.parse(sockets[0]!.sent.at(-1)!)).toMatchObject({ type: 'typing.set', is_typing: false })
  })

  it('uses a fresh ticket and resume cursor after a transient close', async () => {
    const post = vi.fn()
      .mockResolvedValueOnce(ticket(1))
      .mockResolvedValueOnce({ ...ticket(2), data: { ...ticket(2).data, resume_cursor: 'cursor-1' } })
    const { connection, sockets } = subject({ post, random: () => 0 })
    connection.subscribeThread('thread')
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    sockets[0]!.emit('message', { data: JSON.stringify(messageEvent('event-1', 1)) })
    await flush()
    expect(connection.resumeCursor).toBe('cursor-1')
    sockets[0]!.emit('close', { code: 1011, reason: 'transient' })
    expect(connection.state).toBe('reconnecting')
    await vi.runOnlyPendingTimersAsync()
    await flush()
    expect(sockets).toHaveLength(2)
    expect(post.mock.calls[1]?.[1]).toMatchObject({ resume_cursor: 'cursor-1' })
    sockets[1]!.emit('message', { data: ready('cursor-1') })
    await flush()
    expect(connection.state).toBe('open')
  })

  it.each([4002, 4003, 4004])('treats close code %i as terminal', async (code) => {
    const { connection, sockets } = subject()
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    sockets[0]!.emit('close', { code })
    expect(connection.state).toBe('failed')
    await vi.runAllTimersAsync()
    expect(sockets).toHaveLength(1)
  })

  it.each([
    'not-json',
    JSON.stringify({ api_version: 2, protocol_version: 2, type: 'ready' }),
    JSON.stringify({ api_version: 2, protocol_version: 1, type: 'unknown' }),
  ])('fails safely on malformed frame %s', async (frame) => {
    const { connection, sockets } = subject()
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    sockets[0]!.emit('message', { data: frame })
    await flush()
    expect(connection.state).toBe('failed')
    expect(sockets[0]!.closes.at(-1)).toEqual({ code: 4004, reason: 'protocol_error' })
  })

  it('retries transient ticket failures but stops on terminal ticket auth errors', async () => {
    const transientPost = vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(ticket())
    const transient = subject({ post: transientPost, random: () => 0 })
    const pending = transient.connection.start()
    await vi.runOnlyPendingTimersAsync()
    await flush()
    expect(transient.sockets).toHaveLength(1)
    transient.sockets[0]!.emit('message', { data: ready() })
    await pending

    const terminal = subject({ post: vi.fn().mockRejectedValue(new APIError(401, { error: 'session_expired' })) })
    await expect(terminal.connection.start()).rejects.toBeInstanceOf(Error)
    expect(terminal.connection.state).toBe('failed')
  })

  it('explicit close releases listeners/timers and never reconnects', async () => {
    const { connection, sockets } = subject()
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    connection.subscribeThread('thread')
    connection.setTyping('thread', true)
    connection.close()
    expect(connection.state).toBe('closed')
    expect(sockets[0]!.listenerCount()).toBe(0)
    expect(sockets[0]!.closes.at(-1)).toEqual({ code: 1000, reason: 'client_close' })
    await vi.runAllTimersAsync()
    expect(sockets).toHaveLength(1)
    await expect(connection.start()).rejects.toBeInstanceOf(Error)
  })
})


describe('managed realtime event contract coverage', () => {
  it('validates every durable and ephemeral event type before exposure', async () => {
    const { connection, sockets } = subject()
    const seen: string[] = []
    connection.subscribeThread('thread')
    connection.onEvent((event) => seen.push(event.type))
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('open')
    sockets[0]!.emit('error', new Error('transport hint'))
    sockets[0]!.emit('message', { data: ready() })
    await started
    const base = {
      api_version: 2, protocol_version: 1, occurred_at: 'now', conversation_id: 'conversation', thread_id: 'thread',
    }
    const events = [
      { ...base, event_id: 'system', resume_cursor: 'c1', type: 'system_event.created', payload: { event: { id: 'system', thread_id: 'thread', sequence: 1, kind: 'thread.linked' } } },
      { ...base, event_id: 'created', resume_cursor: 'c2', type: 'thread.created', payload: { thread: { id: 'thread', conversation_id: 'conversation', kind: 'general', unread_count: 0 } } },
      { ...base, event_id: 'updated', resume_cursor: 'c3', type: 'thread.updated', payload: { thread: { id: 'thread', conversation_id: 'conversation', kind: 'listing', unread_count: 1 } } },
      { ...base, event_id: 'read', resume_cursor: 'c4', type: 'read_cursor.updated', payload: { cursor: { thread_id: 'thread', last_read_item_id: 'item', last_read_sequence: 1 } } },
      { ...base, event_id: 'upload', resume_cursor: 'c5', type: 'attachment.updated', payload: { upload: { id: 'upload', thread_id: 'thread', state: 'safe' } } },
      { ...base, event_id: 'policy', resume_cursor: 'c6', type: 'message.policy_applied', payload: { message_id: 'message', notices: ['hidden'] } },
      { ...base, type: 'typing.updated', author: { side: 'store', store: { id: 'store' } }, is_typing: true },
    ]
    for (const event of events) sockets[0]!.emit('message', { data: JSON.stringify(event) })
    await flush()
    expect(seen).toEqual([
      'system_event.created', 'thread.created', 'thread.updated', 'read_cursor.updated',
      'attachment.updated', 'message.policy_applied', 'typing.updated',
    ])
  })

  it('uses the encoded store ticket path and treats malformed ticket URLs as terminal', async () => {
    const sockets: FakeSocket[] = []
    const post = vi.fn().mockResolvedValue(ticket())
    const client = {
      post,
      createWebSocket: vi.fn(() => {
        const socket = new FakeSocket()
        sockets.push(socket)
        return socket
      }),
    } as unknown as APIClient
    const connection = new ManagedMessagesRealtimeConnection(client, {
      perspective: { kind: 'store', store_id: 'store/a' },
    })
    const started = connection.start()
    await flush()
    expect(post.mock.calls[0]?.[0]).toBe('/notify/v2/inboxes/stores/store%2Fa/realtime/tickets')
    sockets[0]!.emit('message', { data: ready(null) })
    await started
    await connection.start()
    expect(post).toHaveBeenCalledOnce()

    const malformed = subject({ post: vi.fn().mockResolvedValue({
      ...ticket(), data: { ...ticket().data, websocket_url: 'not a url' },
    }) })
    await expect(malformed.connection.start()).rejects.toMatchObject({ name: 'RealtimeProtocolError' })
    expect(malformed.connection.state).toBe('failed')
  })

  it('stops reconnecting when a refreshed ticket request returns terminal auth', async () => {
    const post = vi.fn()
      .mockResolvedValueOnce(ticket())
      .mockRejectedValueOnce(new APIError(401, { error: 'session_expired' }))
    const { connection, sockets } = subject({ post, random: () => 0 })
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    sockets[0]!.emit('close', { code: 1011 })
    await vi.runOnlyPendingTimersAsync()
    await flush()
    expect(connection.state).toBe('failed')
    expect(post).toHaveBeenCalledTimes(2)
  })

  it('tolerates socket send/close failures and permanently bounds deduplication memory', async () => {
    const { connection, sockets } = subject()
    connection.subscribeThread('thread')
    const { started } = await begin(connection, sockets)
    sockets[0]!.emit('message', { data: ready() })
    await started
    sockets[0]!.failSend = true
    connection.setTyping('thread', true)
    sockets[0]!.failSend = false

    const internal = connection as unknown as { remember(id: string): void }
    for (let index = 0; index < 2_005; index += 1) internal.remember(`event-${index}`)
    const ids = (connection as unknown as { seenEventIds: Set<string> }).seenEventIds
    expect(ids.size).toBe(2_000)
    expect(ids.has('event-0')).toBe(false)

    const originalClose = sockets[0]!.close.bind(sockets[0])
    sockets[0]!.close = () => { throw new Error('already closed') }
    expect(() => connection.close()).not.toThrow()
    sockets[0]!.close = originalClose
  })
})
