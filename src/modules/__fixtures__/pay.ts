import type { CheckoutStatusResponse, PaymentAttemptStatus } from '../../types'

const amount = {
  currency: 'KES',
  minor_units: 125000,
} as const

const serverTime = '2026-09-07T10:01:00.000Z'

function attempt(
  id: string,
  sequence: number,
  status: PaymentAttemptStatus,
  updatedAt: string,
): NonNullable<CheckoutStatusResponse['latest_attempt']> {
  return {
    id,
    sequence,
    provider: 'daraja',
    status,
    terminal: status !== 'initiated',
    created_at: '2026-09-07T10:00:00.000Z',
    updated_at: updatedAt,
  }
}

export const retailPendingCheckout = {
  version: 1,
  order_id: 'retail_pending',
  order: { type: 'retail', status: 'payment_pending' },
  checkout_status: 'pending',
  terminal: false,
  retryable: false,
  amount,
  latest_attempt: attempt('attempt_retail_pending', 1, 'initiated', '2026-09-07T10:00:10.000Z'),
  attempt_count: 1,
  order_updated_at: '2026-09-07T10:00:05.000Z',
  status_updated_at: '2026-09-07T10:00:10.000Z',
  server_time: serverTime,
  poll_after_ms: 1500,
} satisfies CheckoutStatusResponse

export const balePendingCheckout = {
  version: 1,
  order_id: 'bale_pending',
  order: { type: 'bale', status: 'pending_payment' },
  checkout_status: 'pending',
  terminal: false,
  retryable: false,
  amount,
  latest_attempt: null,
  attempt_count: 0,
  order_updated_at: '2026-09-07T10:00:05.000Z',
  status_updated_at: '2026-09-07T10:00:05.000Z',
  server_time: serverTime,
  poll_after_ms: 1500,
} satisfies CheckoutStatusResponse

export const paidCheckout = {
  version: 1,
  order_id: 'retail_paid',
  order: { type: 'retail', status: 'paid' },
  checkout_status: 'paid',
  terminal: true,
  retryable: false,
  amount,
  latest_attempt: attempt('attempt_paid', 1, 'funded', '2026-09-07T10:00:20.000Z'),
  attempt_count: 1,
  order_updated_at: '2026-09-07T10:00:30.000Z',
  status_updated_at: '2026-09-07T10:00:30.000Z',
  server_time: serverTime,
  poll_after_ms: 0,
} satisfies CheckoutStatusResponse

export const retryAfterFailureCheckout = {
  version: 1,
  order_id: 'retail_failed_attempt',
  order: { type: 'retail', status: 'payment_pending' },
  checkout_status: 'failed',
  terminal: false,
  retryable: true,
  amount,
  latest_attempt: attempt('attempt_failed', 2, 'failed', '2026-09-07T10:00:20.000Z'),
  attempt_count: 2,
  order_updated_at: '2026-09-07T10:00:05.000Z',
  status_updated_at: '2026-09-07T10:00:20.000Z',
  server_time: serverTime,
  poll_after_ms: 0,
} satisfies CheckoutStatusResponse

export const attemptCancelledCheckout = {
  version: 1,
  order_id: 'bale_cancelled_attempt',
  order: { type: 'bale', status: 'pending_payment' },
  checkout_status: 'cancelled',
  terminal: false,
  retryable: true,
  amount,
  latest_attempt: attempt('attempt_cancelled', 1, 'cancelled', '2026-09-07T10:00:20.000Z'),
  attempt_count: 1,
  order_updated_at: '2026-09-07T10:00:05.000Z',
  status_updated_at: '2026-09-07T10:00:20.000Z',
  server_time: serverTime,
  poll_after_ms: 0,
} satisfies CheckoutStatusResponse

export const orderCancelledCheckout = {
  version: 1,
  order_id: 'retail_cancelled_order',
  order: { type: 'retail', status: 'cancelled' },
  checkout_status: 'cancelled',
  terminal: true,
  retryable: false,
  amount,
  latest_attempt: attempt('attempt_order_cancelled', 1, 'initiated', '2026-09-07T10:00:10.000Z'),
  attempt_count: 1,
  order_updated_at: '2026-09-07T10:00:30.000Z',
  status_updated_at: '2026-09-07T10:00:30.000Z',
  server_time: serverTime,
  poll_after_ms: 0,
} satisfies CheckoutStatusResponse

export const refundedCheckout = {
  version: 1,
  order_id: 'retail_refunded',
  order: { type: 'retail', status: 'paid' },
  checkout_status: 'refunded',
  terminal: true,
  retryable: false,
  amount,
  latest_attempt: attempt('attempt_refunded', 1, 'refunded', '2026-09-07T10:00:40.000Z'),
  attempt_count: 1,
  order_updated_at: '2026-09-07T10:00:30.000Z',
  status_updated_at: '2026-09-07T10:00:40.000Z',
  server_time: serverTime,
  poll_after_ms: 0,
} satisfies CheckoutStatusResponse

export const fundedUnreconciledCheckout = {
  version: 1,
  order_id: 'bale_funded_unreconciled',
  order: { type: 'bale', status: 'pending_payment' },
  checkout_status: 'pending',
  terminal: false,
  retryable: false,
  amount,
  latest_attempt: attempt('attempt_funded_unreconciled', 1, 'funded', '2026-09-07T10:00:20.000Z'),
  attempt_count: 1,
  order_updated_at: '2026-09-07T10:00:05.000Z',
  status_updated_at: '2026-09-07T10:00:20.000Z',
  server_time: serverTime,
  poll_after_ms: 1500,
} satisfies CheckoutStatusResponse

export const checkoutStatusFixtures = [
  retailPendingCheckout,
  balePendingCheckout,
  paidCheckout,
  retryAfterFailureCheckout,
  attemptCancelledCheckout,
  orderCancelledCheckout,
  refundedCheckout,
  fundedUnreconciledCheckout,
] as const
