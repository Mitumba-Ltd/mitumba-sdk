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

export interface SendMessageInput {
  receiver_id: string
  body: string
  listing_id?: string
  store_id?: string
  order_id?: string
  from_store?: boolean
}

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
