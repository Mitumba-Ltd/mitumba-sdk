import { APIClient, APIError } from '../client'
import { RealtimeProtocolError, RealtimeUnavailableError } from '../types/messages-v2'
import type {
  NotificationStream,
  NotificationStreamFrame,
  NotificationStreamItem,
  NotificationStreamOptions,
  NotificationStreamState,
  NotificationStreamTicket,
  WebSocketCloseEventLike,
  WebSocketLike,
  WebSocketMessageEventLike,
} from '../types'

const TICKET_PATH = '/notify/notifications/stream/tickets'
/** The server closes a socket at its lifetime with this code; reconnect at once with a fresh ticket. */
const CLOSE_EXPIRED = 4001
/** Closed for good: signed out, revoked, or a protocol error. */
const CLOSE_FINAL = [4003, 4004]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const isCount = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0

function isItem(value: unknown): value is NotificationStreamItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.type === 'string'
    && typeof value.category === 'string'
    && typeof value.title === 'string'
    && typeof value.body === 'string'
    && Array.isArray(value.actions)
    && typeof value.createdAt === 'string'
    && (value.readAt === null || typeof value.readAt === 'string')
    && (value.flash === null || isRecord(value.flash))
}

export function parseNotificationFrame(value: unknown): NotificationStreamFrame | { type: 'pong' } {
  if (!isRecord(value) || typeof value.type !== 'string') throw new RealtimeProtocolError()
  switch (value.type) {
    case 'hello':
      if (isCount(value.unread) && (value.flash === null || isItem(value.flash))) return value as unknown as NotificationStreamFrame
      break
    case 'item':
      if (isCount(value.unread) && isItem(value.item)) return value as unknown as NotificationStreamFrame
      break
    case 'read':
      if (isCount(value.unread) && (value.ids === 'all' || (Array.isArray(value.ids) && value.ids.every((id) => typeof id === 'string')))) {
        return value as unknown as NotificationStreamFrame
      }
      break
    case 'flash':
      if (isItem(value.flash) && value.flash.flash !== null) return value as unknown as NotificationStreamFrame
      break
    case 'flash_resolved':
      if (typeof value.id === 'string' && isCount(value.unread)) return value as unknown as NotificationStreamFrame
      break
    case 'pong':
      return { type: 'pong' }
  }
  throw new RealtimeProtocolError()
}

function parseTicket(value: unknown): NotificationStreamTicket {
  if (!isRecord(value)
    || typeof value.ticket !== 'string'
    || typeof value.expires_at !== 'string'
    || typeof value.websocket_url !== 'string'
    || typeof value.socket_closes_at !== 'string') {
    throw new RealtimeProtocolError()
  }
  let url: URL
  try { url = new URL(value.websocket_url) } catch { throw new RealtimeProtocolError() }
  if (!['ws:', 'wss:'].includes(url.protocol) || url.searchParams.has('token') || !url.searchParams.has('ticket')) throw new RealtimeProtocolError()
  return value as unknown as NotificationStreamTicket
}

export class ManagedNotificationStream implements NotificationStream {
  private currentState: NotificationStreamState = 'closed'
  private currentUnread: number | null = null
  private socket: WebSocketLike | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private frameListeners = new Set<(frame: NotificationStreamFrame) => void>()
  private stateListeners = new Set<(state: NotificationStreamState) => void>()
  private explicitClose = false
  private reconnectAttempt = 0
  private startPromise: Promise<void> | null = null
  private resolveStart: (() => void) | null = null
  private rejectStart: ((error: unknown) => void) | null = null
  private readonly onMessage = (event: WebSocketMessageEventLike): void => { this.handleMessage(event) }
  private readonly onClose = (event: WebSocketCloseEventLike): void => { this.handleClose(event) }
  private readonly onIgnored = (): void => undefined

  constructor(private readonly client: APIClient, private readonly options: NotificationStreamOptions = {}) {}

  get state(): NotificationStreamState { return this.currentState }
  get unread(): number | null { return this.currentUnread }

  onFrame(listener: (frame: NotificationStreamFrame) => void): () => void {
    this.frameListeners.add(listener)
    return () => { this.frameListeners.delete(listener) }
  }

  onStateChange(listener: (state: NotificationStreamState) => void): () => void {
    this.stateListeners.add(listener)
    return () => { this.stateListeners.delete(listener) }
  }

  start(): Promise<void> {
    if (this.explicitClose) return Promise.reject(new RealtimeUnavailableError())
    if (this.currentState === 'open') return Promise.resolve()
    if (this.startPromise) return this.startPromise
    this.startPromise = new Promise<void>((resolve, reject) => {
      this.resolveStart = resolve
      this.rejectStart = reject
    })
    const pending = this.startPromise
    void this.open(false).catch((error: unknown) => this.openFailed(error))
    return pending
  }

  close(): void {
    this.explicitClose = true
    this.clearReconnect()
    this.detachSocket(true)
    this.transition('closed')
    this.resolveStart?.()
    this.finishStart()
    this.frameListeners.clear()
    this.stateListeners.clear()
  }

  private async open(reconnecting: boolean): Promise<void> {
    this.transition(reconnecting ? 'reconnecting' : 'connecting')
    const raw = await this.client.post<unknown>(TICKET_PATH, {}, { signal: this.options.signal })
    if (this.explicitClose) return
    const ticket = parseTicket(raw)
    const url = new URL(ticket.websocket_url)
    url.searchParams.set('surface', this.options.surface ?? 'web')
    const socket = this.client.createWebSocket(url.toString(), [])
    this.socket = socket
    socket.addEventListener('open', this.onIgnored)
    socket.addEventListener('message', this.onMessage)
    socket.addEventListener('close', this.onClose)
    socket.addEventListener('error', this.onIgnored)
  }

  /** A ticket that cannot be had because of who is asking is final; anything else is retried. */
  private openFailed(error: unknown): void {
    if (error instanceof RealtimeProtocolError || error instanceof RealtimeUnavailableError || (error instanceof APIError && [401, 403].includes(error.status))) {
      this.fail(error)
    } else {
      this.scheduleReconnect()
    }
  }

  private handleMessage(event: WebSocketMessageEventLike): void {
    let frame: NotificationStreamFrame | { type: 'pong' }
    try {
      if (typeof event.data !== 'string') throw new RealtimeProtocolError()
      let decoded: unknown
      try { decoded = JSON.parse(event.data) } catch { throw new RealtimeProtocolError() }
      frame = parseNotificationFrame(decoded)
    } catch (error) {
      this.fail(error)
      try { this.socket?.close(4004, 'protocol_error') } catch { /* already closed */ }
      return
    }
    if (frame.type === 'pong') return
    if ('unread' in frame) this.currentUnread = frame.unread
    if (frame.type === 'hello') {
      this.reconnectAttempt = 0
      this.transition('open')
      this.resolveStart?.()
      this.finishStart()
    }
    for (const listener of [...this.frameListeners]) {
      try { listener(frame) } catch { /* a listener's own failure is not the stream's */ }
    }
  }

  private handleClose(event: WebSocketCloseEventLike): void {
    this.detachSocket(false)
    if (this.explicitClose || this.currentState === 'failed') return
    if (CLOSE_FINAL.includes(event.code)) {
      this.fail(new RealtimeUnavailableError())
      return
    }
    if (event.code === CLOSE_EXPIRED) this.reconnectAttempt = 0
    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.explicitClose) return
    this.transition('reconnecting')
    const base = Math.max(10, this.options.reconnectBaseDelayMs ?? 500)
    const maximum = Math.max(base, this.options.reconnectMaxDelayMs ?? 30_000)
    const cap = Math.min(maximum, base * (2 ** this.reconnectAttempt))
    const delay = Math.floor((this.options.random ?? Math.random)() * cap)
    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      void this.open(true).catch((error: unknown) => this.openFailed(error))
    }, delay)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private detachSocket(close: boolean): void {
    const socket = this.socket
    if (!socket) return
    socket.removeEventListener('open', this.onIgnored)
    socket.removeEventListener('message', this.onMessage)
    socket.removeEventListener('close', this.onClose)
    socket.removeEventListener('error', this.onIgnored)
    if (close) {
      try { socket.close(1000, 'client_close') } catch { /* already closed */ }
    }
    this.socket = null
  }

  private transition(state: NotificationStreamState): void {
    if (this.currentState === state) return
    this.currentState = state
    for (const listener of [...this.stateListeners]) listener(state)
  }

  private fail(error: unknown): void {
    this.clearReconnect()
    this.transition('failed')
    this.rejectStart?.(error)
    this.finishStart()
  }

  private finishStart(): void {
    this.resolveStart = null
    this.rejectStart = null
    this.startPromise = null
  }
}
