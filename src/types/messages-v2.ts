import type { APIError } from '../client'

/** Stable opaque identifier for one buyer/store conversation. */
export type ConversationId = string

/** Stable opaque identifier for one General, Listing, or Order thread. */
export type ThreadId = string

/** Stable opaque identifier for one human-authored message. */
export type MessageId = string

/** Stable opaque identifier for a message or system event in a thread timeline. */
export type ThreadTimelineItemId = string

/** Opaque server-issued cursor whose contents clients must not interpret. */
export type MessagingCursor = string

/** Explicit identity under which an authenticated human accesses messaging resources. */
export type MessagingPerspective =
  | {
      /** Act as the authenticated buyer. */
      kind: 'buyer'
    }
  | {
      /** Act as an authorized representative of one store. */
      kind: 'store'
      /** Store represented by this request. */
      store_id: string
    }

/** Versioned success envelope returned by every Messaging v2 resource operation. */
export interface ApiResponse<T> {
  /** Public messaging API version. */
  api_version: 2
  /** Typed operation result. */
  data: T
}

/** Cursor-paged resource collection. */
export interface CursorPage<T> {
  /** Resources in server-defined deterministic order. */
  items: T[]
  /** Cursor for the next page, or null when no next page exists. */
  next_cursor: MessagingCursor | null
  /** Whether another page exists after this page. */
  has_more: boolean
}

/** Recipient-safe buyer identity snapshot. */
export interface BuyerSummary {
  /** Stable buyer account identifier. */
  id: string
  /** Current buyer display name, when configured. */
  display_name: string | null
  /** Current buyer avatar URL, when configured. */
  avatar_url: string | null
}

/** Recipient-safe store identity snapshot. */
export interface StoreSummary {
  /** Stable store identifier. */
  id: string
  /** Current store display name. */
  name: string
  /** Current canonical store slug. */
  slug: string
  /** Current store logo URL, when configured. */
  logo_url: string | null
}

/** Immutable thread subject snapshot for General, Listing, or Order context. */
export type ThreadSubject =
  | {
      /** General buyer/store conversation subject. */
      kind: 'general'
    }
  | {
      /** Listing inquiry subject. */
      kind: 'listing'
      /** Listing represented by this thread. */
      listing_id: string
      /** Snapshotted listing title. */
      title: string
      /** Snapshotted listing image URL, when available. */
      image_url: string | null
      /** Current coarse listing availability. */
      availability: 'active' | 'sold' | 'inactive' | 'unknown'
    }
  | {
      /** Order support subject. */
      kind: 'order'
      /** Order represented by this thread. */
      order_id: string
      /** Human-readable short order identifier. */
      short_id: string
      /** Snapshotted listing title associated with the order. */
      listing_title: string
      /** Snapshotted listing image URL, when available. */
      image_url: string | null
      /** Current canonical order status. */
      order_status: string
    }

/** Public message author identity without private store-operator identity. */
export type MessageAuthor =
  | {
      /** Message was authored from the buyer perspective. */
      side: 'buyer'
      /** Recipient-safe buyer identity. */
      buyer: BuyerSummary
    }
  | {
      /** Message was authored from the store perspective. */
      side: 'store'
      /** Recipient-safe store identity; human operator identity is intentionally omitted. */
      store: StoreSummary
    }

/** Safe attachment metadata associated with a committed message. */
export interface MessageAttachment {
  /** Stable attachment identifier. */
  id: string
  /** Attachment presentation category. */
  kind: 'image' | 'file'
  /** Sanitized original file name. */
  file_name: string
  /** Validated media type. */
  content_type: string
  /** Validated byte size. */
  size_bytes: number
}

/** Canonical immutable human-authored message. */
export interface ThreadMessage {
  /** Stable message identifier. */
  id: MessageId
  /** Thread containing this message. */
  thread_id: ThreadId
  /** Monotonic order within the thread timeline. */
  sequence: number
  /** Explicit public author side and identity. */
  author: MessageAuthor
  /** Canonical message body after server policy processing. */
  body: string
  /** Same-thread quote snapshot, or null when the message is not a reply. */
  reply_to: {
    /** Quoted message identifier. */
    message_id: MessageId
    /** Recipient-safe author label captured for the quote. */
    author_name: string
    /** Immutable safe excerpt captured for the quote. */
    excerpt: string
  } | null
  /** Safe committed attachments; empty for text-only messages. */
  attachments: MessageAttachment[]
  /** Caller-owned idempotency identifier echoed for reconciliation, when supplied. */
  client_message_id: string | null
  /** UTC ISO 8601 creation timestamp. */
  created_at: string
}

/** Server-authored event linking a Listing thread and its related Order thread. */
export interface ThreadSystemEvent {
  /** Stable timeline-item identifier. */
  id: ThreadTimelineItemId
  /** Thread containing this system event. */
  thread_id: ThreadId
  /** Monotonic order within the thread timeline. */
  sequence: number
  /** System-event discriminator. */
  kind: 'thread.linked'
  /** Stable identifier shared by the paired link events. */
  relation_id: string
  /** Direction and correctly correlated related thread snapshot. */
  link:
    | {
        /** This Listing thread links forward to an Order thread. */
        direction: 'listing_to_order'
        /** Related Order thread. */
        related_thread: {
          /** Stable related thread identifier. */
          id: ThreadId
          /** Related thread kind. */
          kind: 'order'
          /** Correlated Order subject snapshot. */
          subject: Extract<ThreadSubject, { kind: 'order' }>
        }
      }
    | {
        /** This Order thread links back to a Listing thread. */
        direction: 'order_to_listing'
        /** Related Listing thread. */
        related_thread: {
          /** Stable related thread identifier. */
          id: ThreadId
          /** Related thread kind. */
          kind: 'listing'
          /** Correlated Listing subject snapshot. */
          subject: Extract<ThreadSubject, { kind: 'listing' }>
        }
      }
  /** Recipient-facing event label. */
  label: string
  /** Perspectives for which this event contributes to unread state. */
  notify_sides: Array<'buyer' | 'store'>
  /** UTC ISO 8601 creation timestamp. */
  created_at: string
}

/** Ordered item in a thread timeline. */
export type ThreadTimelineItem =
  | {
      /** Human-message timeline item. */
      kind: 'message'
      /** Canonical message. */
      message: ThreadMessage
    }
  | {
      /** Server system-event timeline item. */
      kind: 'system'
      /** Canonical system event. */
      event: ThreadSystemEvent
    }

/** Shared support lifecycle for Listing and Order threads. */
type ThreadStatus = 'open' | 'resolved'

/** Perspective-private presentation preferences for one thread. */
interface ThreadPreferences {
  /** Whether the current perspective archived this thread. */
  archived: boolean
  /** Whether the current perspective pinned this thread. */
  pinned: boolean
  /** Whether the current perspective muted this thread. */
  muted: boolean
}

/** Perspective-private presentation preferences for one conversation. */
interface ConversationPreferences {
  /** Whether the current perspective archived this conversation. */
  archived: boolean
  /** Whether the current perspective muted this conversation. */
  muted: boolean
}

type ThreadCardBase = {
  /** Stable thread identifier. */
  id: ThreadId
  /** Stable parent conversation identifier. */
  conversation_id: ConversationId
  /** Shared support status, independent of commerce status. */
  status: ThreadStatus
  /** Private preferences for the selected perspective. */
  preferences: ThreadPreferences
  /** Latest human-authored message, or null before the first message. */
  last_message: ThreadMessage | null
  /** Exact unread timeline-item count for the selected perspective. */
  unread_count: number
  /** UTC ISO 8601 timestamp of latest thread activity. */
  last_activity_at: string
  /** UTC ISO 8601 creation timestamp. */
  created_at: string
  /** UTC ISO 8601 last-update timestamp. */
  updated_at: string
}

/** Thread-card summary with kind and subject correlated at compile time. */
export type ThreadCard =
  | (ThreadCardBase & {
      /** General thread card. */
      kind: 'general'
      /** Correlated General subject. */
      subject: Extract<ThreadSubject, { kind: 'general' }>
    })
  | (ThreadCardBase & {
      /** Listing inquiry thread card. */
      kind: 'listing'
      /** Correlated Listing subject. */
      subject: Extract<ThreadSubject, { kind: 'listing' }>
    })
  | (ThreadCardBase & {
      /** Order support thread card. */
      kind: 'order'
      /** Correlated Order subject. */
      subject: Extract<ThreadSubject, { kind: 'order' }>
    })

/** Buyer/store conversation summary containing no loose messages. */
export interface ConversationSummary {
  /** Stable all-time buyer/store conversation identifier. */
  id: ConversationId
  /** Buyer in this relationship. */
  buyer: BuyerSummary
  /** Store in this relationship. */
  store: StoreSummary
  /** Most recently active thread, or null when no thread has activity. */
  last_thread: ThreadCard | null
  /** Exact aggregate unread count for the selected perspective. */
  unread_count: number
  /** UTC ISO 8601 timestamp of latest child-thread activity. */
  last_activity_at: string
  /** Private preferences for the selected perspective. */
  preferences: ConversationPreferences
  /** UTC ISO 8601 creation timestamp. */
  created_at: string
  /** UTC ISO 8601 last-update timestamp. */
  updated_at: string
}

/** Idempotent conversation/thread resolution result. */
export interface ResolveThreadResult {
  /** Resolved all-time buyer/store conversation. */
  conversation: ConversationSummary
  /** Resolved singleton context thread. */
  thread: ThreadCard
  /** Whether either resource was created by this resolution. */
  created: {
    /** Whether the conversation was created. */
    conversation: boolean
    /** Whether the thread was created. */
    thread: boolean
  }
}

/** Newest, older, or catch-up window of ascending thread timeline items. */
export interface MessagePage {
  /** Timeline items ordered by ascending sequence. */
  items: ThreadTimelineItem[]
  /** Cursor for older history, or null at the beginning. */
  older_cursor: MessagingCursor | null
  /** Cursor for newer catch-up, or null at the live edge. */
  newer_cursor: MessagingCursor | null
  /** Whether older history exists. */
  has_older: boolean
  /** Whether newer history exists. */
  has_newer: boolean
}

/** Authoritative monotonic read-cursor result. */
export interface ReadCursorResult {
  /** Thread whose cursor was evaluated. */
  thread_id: ThreadId
  /** Last committed visible message or system-event identifier. */
  last_read_item_id: ThreadTimelineItemId
  /** Monotonic sequence of the last read item. */
  last_read_sequence: number
  /** Whether this request advanced the cursor. */
  changed: boolean
  /** UTC ISO 8601 cursor-update timestamp. */
  updated_at: string
}

/** Buyer-authorized input for idempotent thread resolution. */
export type BuyerResolveThreadInput =
  | {
      /** Resolve the General thread for a store. */
      kind: 'general'
      /** Store to contact. */
      store_id: string
    }
  | {
      /** Resolve a Listing inquiry thread. */
      kind: 'listing'
      /** Store owning the listing. */
      store_id: string
      /** Listing to ask about. */
      listing_id: string
    }
  | {
      /** Resolve an Order support thread. */
      kind: 'order'
      /** Authorized buyer order. */
      order_id: string
    }

/** Store-authorized input for idempotent thread resolution. */
export type StoreResolveThreadInput =
  | {
      /** Resolve an entitled existing General relationship. */
      kind: 'general'
      /** Buyer in the entitled relationship. */
      buyer_id: string
    }
  | {
      /** Resolve an Order support thread. */
      kind: 'order'
      /** Authorized store order. */
      order_id: string
    }

/** Cursor inputs for newest, older, or catch-up message windows. */
export type ListThreadMessagesParams =
  | {
      /** Older-history cursor. */
      before?: MessagingCursor
      /** Catch-up cursor is mutually exclusive with before. */
      after?: never
      /** Requested page size. */
      limit?: number
    }
  | {
      /** Catch-up cursor. */
      after?: MessagingCursor
      /** Older-history cursor is mutually exclusive with after. */
      before?: never
      /** Requested page size. */
      limit?: number
    }

/** Caller-owned, idempotent input for one human-authored message. */
export interface SendThreadMessageInput {
  /**
   * Stable caller-generated identifier reused for every retry.
   *
   * The runtime method maps this value to the `Idempotency-Key` header, omits it from the JSON
   * body, and never generates a replacement key during retry.
   */
  client_message_id: string
  /** Required trimmed body of 1–2,000 characters. */
  body: string
  /** Same-thread quoted message; omit rather than send null when absent. */
  reply_to_message_id?: MessageId
  /** Safe staged attachment identifiers; empty or omitted for text-only sends. */
  attachment_ids?: string[]
}

/** Canonical result of an accepted or deduplicated send. */
export interface SendThreadMessageResult {
  /** Canonical committed message. */
  message: ThreadMessage
  /** Whether this response replayed an earlier accepted request. */
  deduplicated: boolean
  /** Server policy processing applied to the submitted body. */
  policy: {
    /** Whether policy processing changed the body. */
    body_modified: boolean
    /** Recipient-safe policy notices. */
    notices: string[]
  }
}

/** Lifecycle state of one staged attachment upload. */
export type AttachmentUploadState =
  | 'authorized'
  | 'uploaded'
  | 'pending_scan'
  | 'safe'
  | 'rejected'
  | 'expired'
  | 'claimed'

/** Server capability declaration for optional messaging features. */
export interface MessagingCapabilities {
  /** Optional attachment capability. */
  attachments: {
    /** Whether clients may expose attachment controls. */
    enabled: boolean
    /** Maximum accepted upload size. */
    max_size_bytes: number
    /** Allowed upload media types. */
    allowed_content_types: string[]
  }
}

/** Short-lived authorization for one private staged attachment upload. */
export interface AttachmentUploadAuthorization {
  /** Stable upload identifier. */
  id: string
  /** Thread for which the upload was authorized. */
  thread_id: ThreadId
  /** Initial upload state. */
  state: 'authorized'
  /** Absolute short-lived upload URL. */
  upload_url: string
  /** One-use upload ticket that is not an access token. */
  upload_ticket: string
  /** UTC ISO 8601 authorization expiry. */
  expires_at: string
  /** Server-accepted upload constraints. */
  accepted: {
    /** Accepted media type. */
    content_type: string
    /** Accepted byte size. */
    size_bytes: number
    /** Accepted SHA-256 digest. */
    sha256: string
  }
}

/** Current status of one private staged attachment upload. */
export interface AttachmentUploadStatus {
  /** Stable upload identifier. */
  id: string
  /** Thread for which the upload was authorized. */
  thread_id: ThreadId
  /** Current upload lifecycle state. */
  state: AttachmentUploadState
  /** UTC ISO 8601 upload expiry. */
  expires_at: string
  /** Safe rejection code, or null when not rejected. */
  rejection_code: string | null
  /** Committed safe attachment, or null until available. */
  attachment: MessageAttachment | null
}

/** Read-only summary of exact-participant history that cannot be assigned to a store. */
export interface LegacyMessageArchiveSummary {
  /** Stable legacy archive identifier. */
  id: string
  /** Other original participant. */
  other_user: BuyerSummary
  /** Latest historic message body. */
  last_message_body: string
  /** UTC ISO 8601 timestamp of the latest historic message. */
  last_message_at: string
}

/** Read-only historic message that cannot be assigned to a store conversation. */
export interface LegacyMessageRecord {
  /** Stable legacy message identifier. */
  id: string
  /** Original sender. */
  sender: BuyerSummary
  /** Historic message body. */
  body: string
  /** UTC ISO 8601 creation timestamp. */
  created_at: string
}

/** Safe result of resolving a temporary Buyer legacy navigation link. */
export type LegacyLinkResolution =
  | {
      /** Legacy link resolved to canonical v2 resources. */
      result: 'resolved'
      /** Canonical conversation identifier. */
      conversation_id: ConversationId
      /** Canonical thread identifier. */
      thread_id: ThreadId
    }
  | {
      /** Several stores match and the buyer must choose explicitly. */
      result: 'choose_store'
      /** Safe candidate stores. */
      stores: StoreSummary[]
    }
  | {
      /** Link targets exact-participant read-only legacy history. */
      result: 'legacy_archive'
      /** Canonical legacy archive identifier. */
      legacy_thread_id: string
    }
  | {
      /** Link is invalid, forbidden, or cannot be resolved safely. */
      result: 'unavailable'
    }

const MESSAGING_ERROR_CODES = [
  'invalid_input',
  'unauthorized',
  'session_expired',
  'forbidden',
  'conversation_not_found',
  'thread_not_found',
  'message_not_found',
  'timeline_item_not_found',
  'context_mismatch',
  'idempotency_conflict',
  'cursor_invalid',
  'cursor_expired',
  'attachment_not_ready',
  'blocked',
  'legacy_context_required',
  'client_upgrade_required',
  'rate_limited',
  'temporarily_unavailable',
  'internal_error',
  'invalid_response',
  'network_error',
] as const

/** Closed messaging-specific API error code vocabulary. */
export type MessagingErrorCode = typeof MESSAGING_ERROR_CODES[number]

const MESSAGING_ERROR_CODE_SET: ReadonlySet<string> = new Set(MESSAGING_ERROR_CODES)

type MessagingAPIError = APIError & { code: MessagingErrorCode }

/**
 * Narrow an unknown value to an API error carrying a recognized messaging code.
 *
 * @param value - Unknown caught value
 * @returns Whether the value is a messaging API error
 */
export function isMessagingAPIError(value: unknown): value is MessagingAPIError

/**
 * Narrow an unknown value to an API error carrying one expected messaging code.
 *
 * @param value - Unknown caught value
 * @param code - Expected messaging error code
 * @returns Whether the value carries the expected code
 */
export function isMessagingAPIError<Code extends MessagingErrorCode>(
  value: unknown,
  code: Code,
): value is APIError & { code: Code }

export function isMessagingAPIError(
  value: unknown,
  code?: MessagingErrorCode,
): value is MessagingAPIError {
  if (!(value instanceof Error) || value.name !== 'APIError') {
    return false
  }

  const candidate = value as Error & {
    code?: unknown
    status?: unknown
  }
  if (
    typeof candidate.code !== 'string' ||
    typeof candidate.status !== 'number' ||
    !MESSAGING_ERROR_CODE_SET.has(candidate.code)
  ) {
    return false
  }

  return code === undefined || candidate.code === code
}

/** Error raised when a Messaging realtime frame or protocol contract is invalid. */
export class RealtimeProtocolError extends Error {
  /** Construct a stable protocol failure without echoing an untrusted frame. */
  constructor() {
    super('Messaging realtime protocol is invalid.')
    this.name = 'RealtimeProtocolError'
  }
}

/** Error raised when the current runtime has no supported WebSocket implementation. */
export class RealtimeUnavailableError extends Error {
  /** Construct a stable runtime-unavailable failure. */
  constructor() {
    super('Messaging realtime is unavailable in this runtime.')
    this.name = 'RealtimeUnavailableError'
  }
}


/** Cursor parameters for conversation collections. */
export interface ListConversationsParams {
  /** Opaque next-page cursor. */
  cursor?: MessagingCursor
  /** Page size from 1 through 100. */
  limit?: number
}

/** Cursor and filter parameters for thread-card collections. */
export interface ListThreadsParams extends ListConversationsParams {
  /** Include threads archived by the selected perspective. */
  include_archived?: boolean
  /** Optional shared support-status filter. */
  status?: 'open' | 'resolved'
}

/** Thread preference patch for one perspective. */
export interface UpdateThreadPreferencesInput {
  /** Archive or restore the thread for this perspective. */
  archived?: boolean
  /** Pin or unpin the thread for this perspective. */
  pinned?: boolean
  /** Mute or unmute the thread for this perspective. */
  muted?: boolean
}

/** Conversation preference patch for one perspective. */
export interface UpdateConversationPreferencesInput {
  /** Archive or restore the conversation for this perspective. */
  archived?: boolean
  /** Mute or unmute the conversation for this perspective. */
  muted?: boolean
}

/** Request options for an idempotent operation. */
export interface MessagingIdempotentRequestOptions {
  /** Stable key reused for an exact retry. */
  idempotencyKey: string
  /** Optional cancellation signal. */
  signal?: AbortSignal
  /** Additional non-authorization headers. */
  headers?: Record<string, string>
}

/** Metadata used to authorize one private attachment upload. */
export interface CreateAttachmentUploadInput {
  /** Sanitized display file name. */
  file_name: string
  /** Lowercase allowlisted media type. */
  content_type: string
  /** Exact byte length. */
  size_bytes: number
  /** Lowercase hexadecimal SHA-256 digest. */
  sha256: string
}

/** Portable in-memory body accepted by attachment upload. */
export type AttachmentUploadBody = Blob | ArrayBuffer | ArrayBufferView

/** Short-lived mediated attachment download. */
export interface AttachmentDownloadAuthorization {
  /** Absolute application download URL containing a short-lived ticket. */
  url: string
  /** UTC ISO 8601 ticket expiry. */
  expires_at: string
}

/** Buyer and currently represented store inboxes. */
export interface MessagingInboxes {
  /** Personal buyer perspective. */
  buyer: { kind: 'buyer'; buyer: BuyerSummary }
  /** Authorized store perspectives. */
  stores: Array<{ kind: 'store'; store: StoreSummary }>
}

/** One-use realtime bootstrap ticket. */
export interface MessagesRealtimeTicket {
  /** Opaque ticket; never persist or log it. */
  ticket: string
  /** UTC ISO 8601 ticket expiry. */
  expires_at: string
  /** Absolute ticket-only WebSocket URL. */
  websocket_url: string
  /** Required negotiated subprotocol. */
  websocket_protocol: 'mitumba-messaging-v1'
  /** Realtime protocol version. */
  protocol_version: 1
  /** Requested resume cursor, or null for a fresh connection. */
  resume_cursor: MessagingCursor | null
}

/** Minimal event delivered by an isomorphic WebSocket transport. */
export interface WebSocketMessageEventLike {
  /** Untrusted frame data parsed by the SDK before exposure. */
  data: unknown
}

/** Minimal close event delivered by an isomorphic WebSocket transport. */
export interface WebSocketCloseEventLike {
  /** WebSocket close code. */
  code: number
  /** Safe close reason. */
  reason?: string
  /** Whether the transport observed a clean close. */
  wasClean?: boolean
}

/** Minimal WebSocket contract supported in Browser, Node, Edge, and Worker runtimes. */
export interface WebSocketLike {
  /** Connecting ready state. */
  readonly CONNECTING?: number
  /** Open ready state. */
  readonly OPEN?: number
  /** Current ready state. */
  readonly readyState: number
  /** Send one client frame. */
  send(data: string): void
  /** Close this transport. */
  close(code?: number, reason?: string): void
  /** Register a transport listener. */
  addEventListener(type: 'open', listener: () => void): void
  addEventListener(type: 'message', listener: (event: WebSocketMessageEventLike) => void): void
  addEventListener(type: 'close', listener: (event: WebSocketCloseEventLike) => void): void
  addEventListener(type: 'error', listener: (event: unknown) => void): void
  /** Remove a transport listener. */
  removeEventListener(type: 'open', listener: () => void): void
  removeEventListener(type: 'message', listener: (event: WebSocketMessageEventLike) => void): void
  removeEventListener(type: 'close', listener: (event: WebSocketCloseEventLike) => void): void
  removeEventListener(type: 'error', listener: (event: unknown) => void): void
}

/** Injectable WebSocket constructor for isomorphic runtimes. */
export type WebSocketFactory = (url: string, protocols: string | string[]) => WebSocketLike

/** Managed realtime lifecycle state. */
export type MessagesRealtimeState = 'connecting' | 'open' | 'reconnecting' | 'closed' | 'failed'

/** Durable realtime envelope shared by all resumable events. */
export interface MessagesRealtimeEnvelope<Type extends string, Payload> {
  /** Public resource schema version. */
  api_version: 2
  /** Wire protocol version. */
  protocol_version: 1
  /** Stable event identifier used for deduplication. */
  event_id: string
  /** Opaque audience resume cursor. */
  resume_cursor: MessagingCursor
  /** Event discriminator. */
  type: Type
  /** UTC ISO 8601 occurrence timestamp. */
  occurred_at: string
  /** Related conversation when applicable. */
  conversation_id?: ConversationId
  /** Related thread when applicable. */
  thread_id?: ThreadId
  /** Event payload validated before exposure. */
  payload: Payload
}

/** Validated managed Messaging realtime event. */
export type MessagesRealtimeEvent =
  | MessagesRealtimeEnvelope<'message.created', { message: ThreadMessage }>
  | MessagesRealtimeEnvelope<'system_event.created', { event: ThreadSystemEvent }>
  | MessagesRealtimeEnvelope<'conversation.updated', { conversation: ConversationSummary }>
  | MessagesRealtimeEnvelope<'thread.created', { thread: ThreadCard }>
  | MessagesRealtimeEnvelope<'thread.updated', { thread: ThreadCard }>
  | MessagesRealtimeEnvelope<'read_cursor.updated', { cursor: ReadCursorResult }>
  | MessagesRealtimeEnvelope<'attachment.updated', { upload: AttachmentUploadStatus }>
  | MessagesRealtimeEnvelope<'message.policy_applied', { message_id: MessageId; notices: string[] }>
  | {
      /** Resource schema version. */
      api_version: 2
      /** Wire protocol version. */
      protocol_version: 1
      /** Ephemeral event discriminator. */
      type: 'typing.updated'
      /** Thread scoped by this typing state. */
      thread_id: ThreadId
      /** Validated public author. */
      author: MessageAuthor
      /** Current typing state. */
      is_typing: boolean
      /** UTC ISO 8601 occurrence timestamp. */
      occurred_at: string
    }
  | {
      /** Resource schema version. */
      api_version: 2
      /** Wire protocol version. */
      protocol_version: 1
      /** Authoritative rebuild signal. */
      type: 'resync.required'
      /** Safe reason for rebuilding HTTP state. */
      reason: 'cursor_expired' | 'gap_detected' | 'authorization_changed'
      /** Resume cursor after the authoritative rebuild. */
      resume_cursor: MessagingCursor
    }

/** Options for an inert or immediately started managed realtime connection. */
export interface MessagesRealtimeOptions {
  /** Buyer or authorized-store audience. */
  perspective: MessagingPerspective
  /** Last acknowledged cursor, or null for a fresh connection. */
  resumeCursor?: MessagingCursor | null
  /** Optional cancellation signal for ticket requests. */
  signal?: AbortSignal
  /** Initial reconnect delay in milliseconds. */
  reconnectBaseDelayMs?: number
  /** Maximum reconnect delay in milliseconds. */
  reconnectMaxDelayMs?: number
  /** Injected randomness for deterministic tests. */
  random?: () => number
}

/** Managed, resumable messaging connection. */
export interface MessagesRealtimeConnection {
  /** Current connection lifecycle state. */
  readonly state: MessagesRealtimeState
  /** Last acknowledged durable cursor. */
  readonly resumeCursor: MessagingCursor | null
  /** Start the inert connection. Repeated calls are safe. */
  start(): Promise<void>
  /** Permanently close and release sockets, timers, and listeners. */
  close(): void
  /** Subscribe to validated messaging events. */
  onEvent(listener: (event: MessagesRealtimeEvent) => void | Promise<void>): () => void
  /** Subscribe to lifecycle changes. */
  onStateChange(listener: (state: MessagesRealtimeState) => void): () => void
  /** Select a thread for message and typing delivery. */
  subscribeThread(threadId: ThreadId): void
  /** Stop local delivery for one selected thread. */
  unsubscribeThread(threadId: ThreadId): void
  /** Publish thread-scoped ephemeral typing state. */
  setTyping(threadId: ThreadId, isTyping: boolean): void
}


/** Older-history page for one read-only legacy archive. */
export interface LegacyMessagePage {
  /** Historic messages in ascending display order. */
  items: LegacyMessageRecord[]
  /** Cursor for older history, or null at the beginning. */
  older_cursor: MessagingCursor | null
  /** Whether older history remains. */
  has_older: boolean
}
