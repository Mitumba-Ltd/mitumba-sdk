export interface StkPushInput {
  order_id: string
  phone: string // format: +254XXXXXXXXX
}

export type MpesaInput = StkPushInput

export interface StkPushResponse {
  payment_id: string
  provider: string
}

export interface PaystackInput {
  order_id: string
  email: string
}

export interface PaystackInitResponse {
  access_code: string
  authorization_url: string
  reference: string
}

export const PAYMENT_STATUSES = ['initiated', 'funded', 'failed', 'refunded', 'cancelled'] as const
export type PaymentStatus = typeof PAYMENT_STATUSES[number]

export interface PaymentStatusResponse {
  id: string
  status: PaymentStatus
  total: number
}
