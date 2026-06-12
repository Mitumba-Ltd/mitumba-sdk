export interface Conversation {
  id: string
  sender_id: string
  receiver_id: string
  partner_id: string
  partner_name: string | null
  body: string
  listing_id: string | null
  listing_title: string | null
  store_id: string | null
  read_at: string | null
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  listing_id: string | null
  store_id: string | null
  read_at: string | null
  created_at: string
}

export interface SendMessageInput {
  receiver_id: string
  body: string
  listing_id?: string
  store_id?: string
}
