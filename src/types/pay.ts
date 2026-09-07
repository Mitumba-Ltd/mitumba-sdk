import type { OrderStatus } from './orders'
import type { BaleOrderStatus } from './wholesale'

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

export type KnownPaymentProvider =
  | 'daraja'
  | 'intasend'
  | 'paystack'
  | 'airtel'

export type ProviderId = KnownPaymentProvider | (string & {})

export type PaymentProvider = ProviderId

export type CheckoutPaymentMethod =
  | { type: 'mobile_money'; phone: string }
  | { type: 'card' }

export interface InitiateCheckoutInput {
  order_id: string
  idempotency_key: string
  method: CheckoutPaymentMethod
}

export type CheckoutNextAction =
  | { type: 'await_confirmation' }
  | { type: 'redirect'; url: string; expires_at: string | null }

export interface InitiateCheckoutResponse {
  version: 1
  order_id: string
  attempt: {
    id: string
    sequence: number
    provider: ProviderId
    status: 'initiated'
  }
  next_action: CheckoutNextAction
}

export type PaymentAttemptStatus = 'initiated' | 'funded' | 'failed' | 'refunded' | 'cancelled'

export type CheckoutStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

export type CheckoutOrder =
  | { type: 'retail'; status: OrderStatus }
  | { type: 'bale'; status: BaleOrderStatus }

export interface CheckoutStatusResponse {
  version: 1
  order_id: string
  order: CheckoutOrder
  checkout_status: CheckoutStatus
  terminal: boolean
  retryable: boolean
  amount: {
    currency: 'KES'
    minor_units: number
  }
  latest_attempt: {
    id: string
    sequence: number
    provider: PaymentProvider
    status: PaymentAttemptStatus
    terminal: boolean
    created_at: string
    updated_at: string
  } | null
  attempt_count: number
  order_updated_at: string
  status_updated_at: string
  server_time: string
  poll_after_ms: number
}
