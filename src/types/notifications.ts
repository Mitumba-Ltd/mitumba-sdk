export type NotificationType = 'order' | 'message' | 'price_drop' | 'offer' | 'payout' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  metadata: string | null
  read_at: string | null
  created_at: string
}
