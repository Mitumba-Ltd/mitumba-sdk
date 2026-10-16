import { APIClient, APIError } from '../client'
import { RealtimeProtocolError, RealtimeUnavailableError } from '../types/messages-v2'
import type {
  ApiResponse,
  AttachmentUploadStatus,
  ConversationSummary,
  MessageAuthor,
  MessagesRealtimeConnection,
  MessagesRealtimeEvent,
  MessagesRealtimeOptions,
  MessagesRealtimeState,
  MessagesRealtimeTicket,
  ReadCursorResult,
  ThreadCard,
  ThreadMessage,
  ThreadSystemEvent,
  WebSocketCloseEventLike,
  WebSocketLike,
  WebSocketMessageEventLike,
} from '../types'

const PROTOCOL = 'mitumba-messaging-v1'
const TYPING_THROTTLE_MS = 750
const TYPING_CLEAR_MS = 3_000
const MAX_DEDUPLICATION_IDS = 2_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isAuthor(value: unknown): value is MessageAuthor {
  if (!isRecord(value)) return false
  if (value.side === 'buyer') return isRecord(value.buyer) && typeof value.buyer.id === 'string'
  return value.side === 'store' && isRecord(value.store) && typeof value.store.id === 'string'
}

function isThreadMessage(value: unknown): value is ThreadMessage {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.thread_id === 'string'
    && Number.isSafeInteger(value.sequence)
    && typeof value.body === 'string'
    && isAuthor(value.author)
    && Array.isArray(value.attachments)
    && typeof value.created_at === 'string'
}

function isThreadCard(value: unknown): value is ThreadCard {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.conversation_id === 'string'
    && ['general', 'listing', 'order'].includes(String(value.kind))
    && typeof value.unread_count === 'number'
}

function isConversation(value: unknown): value is ConversationSummary {
  return isRecord(value)
    && typeof value.id === 'string'
    && isRecord(value.buyer)
    && isRecord(value.store)
    && typeof value.unread_count === 'number'
}

function isSystemEvent(value: unknown): value is ThreadSystemEvent {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.thread_id === 'string'
    && Number.isSafeInteger(value.sequence)
    && value.kind === 'thread.linked'
}

function isReadCursor(value: unknown): value is ReadCursorResult {
  return isRecord(value)
    && typeof value.thread_id === 'string'
    && typeof value.last_read_item_id === 'string'
    && Number.isSafeInteger(value.last_read_sequence)
}

function isUpload(value: unknown): value is AttachmentUploadStatus {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.thread_id === 'string'
    && ['authorized', 'uploaded', 'pending_scan', 'safe', 'rejected', 'expired', 'claimed'].includes(String(value.state))
}

function validDurablePayload(type: string, payload: unknown): boolean {
  if (!isRecord(payload)) return false
  if (type === 'message.created') return isThreadMessage(payload.message)
  if (type === 'system_event.created') return isSystemEvent(payload.event)
  if (type === 'conversation.updated') return isConversation(payload.conversation)
  if (type === 'thread.created' || type === 'thread.updated') return isThreadCard(payload.thread)
  if (type === 'read_cursor.updated') return isReadCursor(payload.cursor)
  if (type === 'attachment.updated') return isUpload(payload.upload)
  return type === 'message.policy_applied'
    && typeof payload.message_id === 'string'
    && Array.isArray(payload.notices)
    && payload.notices.every((notice) => typeof notice === 'string')
}

function parseEvent(value: unknown): MessagesRealtimeEvent | { type: 'ready'; resume_cursor: string | null } {
  if (!isRecord(value) || value.api_version !== 2 || value.protocol_version !== 1 || typeof value.type !== 'string') {
    throw new RealtimeProtocolError()
  }
  if (value.type === 'ready') {
    if (typeof value.connection_id !== 'string' || (value.resume_cursor !== null && typeof value.resume_cursor !== 'string')) {
      throw new RealtimeProtocolError()
    }
    return { type: 'ready', resume_cursor: value.resume_cursor as string | null }
  }
  if (value.type === 'typing.updated') {
    if (typeof value.thread_id !== 'string' || !isAuthor(value.author) || typeof value.is_typing !== 'boolean' || typeof value.occurred_at !== 'string') {
      throw new RealtimeProtocolError()
    }
    return value as unknown as MessagesRealtimeEvent
  }
  if (value.type === 'resync.required') {
    if (!['cursor_expired', 'gap_detected', 'authorization_changed'].includes(String(value.reason)) || typeof value.resume_cursor !== 'string') {
      throw new RealtimeProtocolError()
    }
    return value as unknown as MessagesRealtimeEvent
  }
  const durableTypes = [
    'message.created', 'system_event.created', 'conversation.updated', 'thread.created',
    'thread.updated', 'read_cursor.updated', 'attachment.updated', 'message.policy_applied',
  ]
  if (!durableTypes.includes(value.type)
    || typeof value.event_id !== 'string'
    || typeof value.resume_cursor !== 'string'
    || typeof value.occurred_at !== 'string'
    || !validDurablePayload(value.type, value.payload)) {
    throw new RealtimeProtocolError()
  }
  return value as unknown as MessagesRealtimeEvent
}

function ticketPath(options: MessagesRealtimeOptions): string {
  return options.perspective.kind === 'buyer'
    ? '/notify/v2/inboxes/buyer/realtime/tickets'
    : `/notify/v2/inboxes/stores/${encodeURIComponent(options.perspective.store_id)}/realtime/tickets`
}

function parseTicket(value: unknown): MessagesRealtimeTicket {
  if (!isRecord(value) || value.api_version !== 2 || !isRecord(value.data)) throw new RealtimeProtocolError()
  const ticket = value.data
  if (typeof ticket.ticket !== 'string'
    || typeof ticket.expires_at !== 'string'
    || typeof ticket.websocket_url !== 'string'
    || ticket.websocket_protocol !== PROTOCOL
    || ticket.protocol_version !== 1
    || (ticket.resume_cursor !== null && typeof ticket.resume_cursor !== 'string')) {
    throw new RealtimeProtocolError()
  }
  const url = new URL(ticket.websocket_url)
  if (!['ws:', 'wss:'].includes(url.protocol) || url.searchParams.has('token') || !url.searchParams.has('ticket')) {
    throw new RealtimeProtocolError()
  }
  return ticket as unknown as MessagesRealtimeTicket
}

export class ManagedMessagesRealtimeConnection implements MessagesRealtimeConnection {
  private currentState: MessagesRealtimeState = 'closed'
  private currentCursor: string | null
  private socket: WebSocketLike | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private typingTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private typingSentAt = new Map<string, number>()
  private eventListeners = new Set<(event: MessagesRealtimeEvent) => void | Promise<void>>()
  private stateListeners = new Set<(state: MessagesRealtimeState) => void>()
  private subscribedThreads = new Set<string>()
  private seenEventIds = new Set<string>()
  private lastMessageSequence = new Map<string, number>()
  private explicitClose = false
  private reconnectAttempt = 0
  private startPromise: Promise<void> | null = null
  private resolveStart: (() => void) | null = null
  private rejectStart: ((error: unknown) => void) | null = null
  private readonly onOpen = (): void => undefined
  private readonly onMessage = (event: WebSocketMessageEventLike): void => { void this.handleMessage(event) }
  private readonly onClose = (event: WebSocketCloseEventLike): void => { this.handleClose(event) }
  private readonly onError = (): void => undefined

  constructor(
    private readonly client: APIClient,
    private readonly options: MessagesRealtimeOptions,
  ) {
    this.currentCursor = options.resumeCursor ?? null
  }

  get state(): MessagesRealtimeState { return this.currentState }
  get resumeCursor(): string | null { return this.currentCursor }

  onEvent(listener: (event: MessagesRealtimeEvent) => void | Promise<void>): () => void {
    this.eventListeners.add(listener)
    return () => { this.eventListeners.delete(listener) }
  }

  onStateChange(listener: (state: MessagesRealtimeState) => void): () => void {
    this.stateListeners.add(listener)
    return () => { this.stateListeners.delete(listener) }
  }

  subscribeThread(threadId: string): void { this.subscribedThreads.add(threadId) }

  unsubscribeThread(threadId: string): void {
    this.clearTyping(threadId, true)
    this.subscribedThreads.delete(threadId)
  }

  setTyping(threadId: string, isTyping: boolean): void {
    if (!this.subscribedThreads.has(threadId) || this.currentState !== 'open' || !this.socket) return
    const now = Date.now()
    const last = this.typingSentAt.get(threadId) ?? 0
    if (now - last < TYPING_THROTTLE_MS) return
    this.send({ protocol_version: 1, type: 'typing.set', thread_id: threadId, is_typing: isTyping })
    this.typingSentAt.set(threadId, now)
    const existing = this.typingTimers.get(threadId)
    if (existing) clearTimeout(existing)
    if (isTyping) {
      this.typingTimers.set(threadId, setTimeout(() => {
        this.typingSentAt.delete(threadId)
        this.setTyping(threadId, false)
        this.typingTimers.delete(threadId)
      }, TYPING_CLEAR_MS))
    } else {
      this.typingTimers.delete(threadId)
    }
  }

  async start(): Promise<void> {
    if (this.explicitClose) throw new RealtimeUnavailableError()
    if (this.startPromise) return this.startPromise
    const pending = new Promise<void>((resolve, reject) => {
      this.resolveStart = resolve
      this.rejectStart = reject
    })
    this.startPromise = pending
    await this.open(false).catch((error: unknown) => {
      if (error instanceof RealtimeProtocolError
        || error instanceof RealtimeUnavailableError
        || (error instanceof APIError && [401, 403, 409].includes(error.status))) {
        this.fail(error)
      } else {
        this.scheduleReconnect()
      }
    })
    return pending
  }

  close(): void {
    this.explicitClose = true
    this.clearReconnect()
    this.clearAllTyping()
    this.detachSocket(true)
    this.transition('closed')
    this.resolveStart?.()
    this.finishStart()
    this.eventListeners.clear()
    this.stateListeners.clear()
  }

  private async open(reconnecting: boolean): Promise<void> {
    this.transition(reconnecting ? 'reconnecting' : 'connecting')
    const raw = await this.client.post<unknown>(ticketPath(this.options), {
      resume_cursor: this.currentCursor,
      supported_protocol_versions: [1],
    }, { signal: this.options.signal })
    if (this.explicitClose) return
    const ticket = parseTicket(raw)
    const socket = this.client.createWebSocket(ticket.websocket_url, ticket.websocket_protocol)
    this.socket = socket
    socket.addEventListener('open', this.onOpen)
    socket.addEventListener('message', this.onMessage)
    socket.addEventListener('close', this.onClose)
    socket.addEventListener('error', this.onError)
  }

  private async handleMessage(event: WebSocketMessageEventLike): Promise<void> {
    try {
      if (typeof event.data !== 'string') throw new RealtimeProtocolError()
      let decoded: unknown
      try { decoded = JSON.parse(event.data) } catch { throw new RealtimeProtocolError() }
      const parsed = parseEvent(decoded)
      if (parsed.type === 'ready') {
        this.currentCursor = parsed.resume_cursor ?? this.currentCursor
        this.reconnectAttempt = 0
        this.transition('open')
        this.resolveStart?.()
        this.finishStart()
        return
      }
      if ('event_id' in parsed) {
        if (this.seenEventIds.has(parsed.event_id)) {
          this.ack(parsed.event_id, parsed.resume_cursor)
          return
        }
        if (parsed.type === 'message.created') {
          const message = parsed.payload.message
          const previous = this.lastMessageSequence.get(message.thread_id) ?? 0
          if (message.sequence <= previous) {
            this.remember(parsed.event_id)
            this.ack(parsed.event_id, parsed.resume_cursor)
            return
          }
          this.lastMessageSequence.set(message.thread_id, message.sequence)
        }
        if (parsed.thread_id && this.subscribedThreads.size > 0 && !this.subscribedThreads.has(parsed.thread_id)) {
          this.remember(parsed.event_id)
          this.ack(parsed.event_id, parsed.resume_cursor)
          return
        }
      } else if (parsed.type === 'typing.updated' && !this.subscribedThreads.has(parsed.thread_id)) {
        return
      }

      for (const listener of [...this.eventListeners]) await listener(parsed)
      if ('event_id' in parsed) {
        this.remember(parsed.event_id)
        this.currentCursor = parsed.resume_cursor
        this.ack(parsed.event_id, parsed.resume_cursor)
      } else if (parsed.type === 'resync.required') {
        this.currentCursor = parsed.resume_cursor
      }
    } catch (error) {
      this.fail(error instanceof RealtimeProtocolError ? error : new RealtimeProtocolError())
      this.socket?.close(4004, 'protocol_error')
    }
  }

  private handleClose(event: WebSocketCloseEventLike): void {
    this.detachSocket(false)
    this.clearAllTyping()
    if (this.explicitClose) return
    if ([4002, 4003, 4004].includes(event.code)) {
      this.fail(new RealtimeProtocolError())
      return
    }
    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.explicitClose) return
    this.transition('reconnecting')
    const base = Math.max(10, this.options.reconnectBaseDelayMs ?? 500)
    const maximum = Math.max(base, this.options.reconnectMaxDelayMs ?? 30_000)
    const cap = Math.min(maximum, base * (2 ** this.reconnectAttempt))
    const random = this.options.random ?? Math.random
    const delay = Math.floor(random() * cap)
    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      void this.open(true).catch((error: unknown) => {
        if (error instanceof APIError && [401, 403].includes(error.status)) this.fail(error)
        else this.scheduleReconnect()
      })
    }, delay)
  }

  private ack(eventId: string, cursor: string): void {
    this.send({ protocol_version: 1, type: 'ack', event_id: eventId, resume_cursor: cursor })
  }

  private send(frame: unknown): void {
    if (!this.socket || this.currentState !== 'open') return
    try { this.socket.send(JSON.stringify(frame)) } catch { /* close/reconnect owns recovery */ }
  }

  private remember(eventId: string): void {
    this.seenEventIds.add(eventId)
    if (this.seenEventIds.size <= MAX_DEDUPLICATION_IDS) return
    const oldest = this.seenEventIds.values().next().value
    if (typeof oldest === 'string') this.seenEventIds.delete(oldest)
  }

  private clearTyping(threadId: string, sendFalse: boolean): void {
    const timer = this.typingTimers.get(threadId)
    if (timer) clearTimeout(timer)
    this.typingTimers.delete(threadId)
    this.typingSentAt.delete(threadId)
    if (sendFalse) this.setTyping(threadId, false)
  }

  private clearAllTyping(): void {
    for (const timer of this.typingTimers.values()) clearTimeout(timer)
    this.typingTimers.clear()
    this.typingSentAt.clear()
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private detachSocket(close: boolean): void {
    const socket = this.socket
    if (!socket) return
    socket.removeEventListener('open', this.onOpen)
    socket.removeEventListener('message', this.onMessage)
    socket.removeEventListener('close', this.onClose)
    socket.removeEventListener('error', this.onError)
    if (close) {
      try { socket.close(1000, 'client_close') } catch { /* already closed */ }
    }
    this.socket = null
  }

  private transition(state: MessagesRealtimeState): void {
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
