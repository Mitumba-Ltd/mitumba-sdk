import { APIClient, APIError } from '../client'
import type { RequestOptions } from '../types'
import type {
  CheckoutRefusal,
  CheckoutRefusalCode,
  CreateCheckoutInput,
  CreateCheckoutResponse,
  GetCheckoutResponse,
} from '../types/checkouts'

const REFUSAL_CODES: ReadonlySet<CheckoutRefusalCode> = new Set<CheckoutRefusalCode>([
  'invalid_input',
  'empty_cart',
  'cannot_buy_own',
  'invalid_deliveries',
  'address_not_found',
  'idempotency_conflict',
  'listing_unavailable',
  'mixed_market_cart',
  'market_not_active',
  'checkout_payment_in_progress',
  'delivery_quote_rejected',
  'address_region_invalid',
  'delivery_required',
  'delivery_quotes_unavailable',
])

/**
 * The checkout refusal carried by an error thrown from `checkouts.create`, or null when the error is
 * not one. The body is the server's own, so the refusal's details (such as `listings` for
 * `listing_unavailable`) are present.
 */
export function checkoutRefusal(error: unknown): CheckoutRefusal | null {
  if (!(error instanceof APIError)) return null
  const body = error.body
  if (typeof body !== 'object' || body === null) return null
  const code = (body as { error?: unknown }).error
  if (typeof code !== 'string' || !REFUSAL_CODES.has(code as CheckoutRefusalCode)) return null
  return body as CheckoutRefusal
}

export class CheckoutsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Create a checkout from the buyer's cart: one order per shop, each at the delivery quote picked
   * for it, held until the checkout's due-by. A retry with the same `idempotency_key` returns the
   * same checkout. A refusal throws an `APIError`; read it with `checkoutRefusal(error)`.
   */
  async create(input: CreateCheckoutInput, options?: RequestOptions): Promise<CreateCheckoutResponse> {
    return this.client.post<CreateCheckoutResponse>('/orders/checkout', input, options)
  }

  /** Read one of the buyer's checkouts. Anyone else gets a 404. */
  async get(checkoutId: string, options?: RequestOptions): Promise<GetCheckoutResponse> {
    return this.client.get<GetCheckoutResponse>(`/orders/checkouts/${encodeURIComponent(checkoutId)}`, undefined, options)
  }
}
