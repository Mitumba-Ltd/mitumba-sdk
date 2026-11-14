/** Known notification types. Other values may appear; treat them as `system`. */
export type NotificationType =
  | 'order' | 'message' | 'price_drop' | 'offer' | 'payout' | 'system'
  | 'order_update' | 'dispute' | 'new_listing' | 'announcement'

/** Where a notification or one of its actions leads: an app route, or an https URL. */
export type NotificationLink = { route: string } | { url: string }

export interface NotificationAction {
  label: string
  link: NotificationLink
}

/** Notification category, as shown in notification settings. */
export type NotificationCategory = 'account' | 'orders' | 'payments' | 'messages' | 'store' | 'deals' | 'announcements' | 'operations'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  /** JSON text. When present on newer notifications: `{ link, actions }`. */
  data?: string | null
  /** @deprecated Never sent. Use `data`, or `link` and `actions`. */
  metadata?: string | null
  read_at: string | null
  created_at: string
  /** Present on newer notifications. */
  category?: NotificationCategory
  /** The catalogue event, e.g. `order.shipped`. */
  event_type?: string
  /** At most two. */
  actions?: NotificationAction[]
  link?: NotificationLink | null
  /** How many events were collapsed into this one notification. */
  count?: number
}

/** A pop-up (flash) notification's details, on stream items that carry one. */
export interface NotificationFlash {
  kind: 'security' | 'approval' | 'account_action' | 'service_status' | 'announcement'
  surfaces: Array<'web' | 'mobile' | 'console'>
  requiresAnswer: boolean
  answers: Array<{ id: string; label: string }>
  expiresAt: string
  state: 'pending' | 'dismissed' | 'answered' | 'expired'
  answer: string | null
}

/** A notification as the live stream delivers it. */
export interface NotificationStreamItem {
  id: string
  type: string
  category: NotificationCategory
  title: string
  body: string
  image: string | null
  actions: NotificationAction[]
  link: NotificationLink | null
  count: number
  createdAt: string
  readAt: string | null
  flash: NotificationFlash | null
}

export type NotificationStreamFrame =
  | { type: 'hello'; unread: number; flash: NotificationStreamItem | null }
  | { type: 'item'; item: NotificationStreamItem; unread: number }
  | { type: 'read'; ids: string[] | 'all'; unread: number }
  | { type: 'flash'; flash: NotificationStreamItem }
  | { type: 'flash_resolved'; id: string; unread: number }

export type NotificationStreamState = 'closed' | 'connecting' | 'open' | 'reconnecting' | 'failed'

export interface NotificationStreamTicket {
  ticket: string
  expires_at: string
  websocket_url: string
  /** The server closes the socket then (code 4001); the stream reconnects with a fresh ticket. */
  socket_closes_at: string
}

export interface NotificationStreamOptions {
  /** Which surface this client is, so pop-ups meant for it arrive. Defaults to `web`. */
  surface?: 'web' | 'mobile' | 'console'
  /** Cancels ticket requests. */
  signal?: AbortSignal
  /** Initial reconnect delay in milliseconds. Default 500. */
  reconnectBaseDelayMs?: number
  /** Maximum reconnect delay in milliseconds. Default 30 000. */
  reconnectMaxDelayMs?: number
  /** Injected randomness for deterministic tests. */
  random?: () => number
}

/** A managed live notification connection. */
export interface NotificationStream {
  readonly state: NotificationStreamState
  /** The unread count from the latest frame, or null before the first. */
  readonly unread: number | null
  /** Connect. Resolves on the first `hello`; rejects when the stream cannot be used (signed out, revoked). Repeated calls are safe. */
  start(): Promise<void>
  /** Permanently close and release the socket, timers and listeners. */
  close(): void
  onFrame(listener: (frame: NotificationStreamFrame) => void): () => void
  onStateChange(listener: (state: NotificationStreamState) => void): () => void
}
