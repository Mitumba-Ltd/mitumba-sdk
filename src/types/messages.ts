/** @deprecated Use ConversationSummary from Messaging v2. */
export interface Conversation {
  partner_id: string
  partner_name: string
  store_name?: string | null
  body: string
  created_at: string
  store_id?: string | null
  listing_id?: string | null
  listing_title?: string | null
  unread_count: number
}

/** @deprecated Use ThreadMessage from Messaging v2. */
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  listing_id: string | null
  store_id: string | null
  order_id?: string | null
  from_store?: number
  read_at: string | null
  created_at: string
}

/** @deprecated Resolve a thread and use SendThreadMessageInput. Context fields are server-validated hints. */
export interface SendMessageInput {
  receiver_id: string
  body: string
  listing_id?: string
  store_id?: string
  order_id?: string
  from_store?: boolean
}

/** @deprecated Use validated managed Messaging realtime events. */
export interface InboxRealtimeEvent {
  type: 'message'
  conversation_key: string
  partner_id: string
  store_id?: string | null
  from_store?: boolean
  preview: string
  created_at: string
  unread_count?: number
}


/** Recipient-safe reason for a message or conversation report. */
export type MessageReportReason =
  | 'off_platform_payment'
  | 'contact_sharing'
  | 'spam'
  | 'scam'
  | 'harassment'
  | 'counterfeit'
  | 'offensive'
  | 'other'

/** Typed report input for a message or buyer/store conversation. */
export type CreateMessageReportInput =
  | {
      subject_kind: 'message'
      message_id: string
      reason: MessageReportReason
      detail?: string
    }
  | {
      subject_kind: 'conversation'
      partner_id: string
      store_id: string
      reason: MessageReportReason
      detail?: string
    }

/** Idempotent open-report result. */
export interface CreateMessageReportResult {
  id: string
  status: 'open'
  deduplicated: boolean
}

/** Context used to block one buyer/store relationship. */
export interface CreateMessageBlockInput {
  partner_id: string
  store_id: string
  from_store?: boolean
  reason?: string
}

/** Idempotent active-block result. */
export interface CreateMessageBlockResult {
  id: string
  active: true
  deduplicated: boolean
}
