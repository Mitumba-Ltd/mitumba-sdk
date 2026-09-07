import { APIClient } from '../client'
import type {
  CheckoutStatusResponse,
  MpesaInput,
  PaystackInput,
  PaystackInitResponse,
  PaymentStatusResponse,
  StkPushInput,
  StkPushResponse,
  RequestOptions,
} from '../types'

export class PayModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Initiate an M-Pesa STK Push payment for an order.
   */
  async initiateStk(input: StkPushInput, options?: RequestOptions): Promise<StkPushResponse> {
    return this.client.post<StkPushResponse>('/pay/stk', input, options)
  }

  /**
   * Initiate M-Pesa STK Push (alias for initiateStk).
   */
  async initMpesa(input: MpesaInput, options?: RequestOptions): Promise<StkPushResponse> {
    return this.client.post<StkPushResponse>('/pay/stk', input, options)
  }

  /**
   * Initiate a Paystack payment — returns access_code for inline popup.
   */
  async initPaystack(input: PaystackInput, options?: RequestOptions): Promise<PaystackInitResponse> {
    return this.client.post<PaystackInitResponse>('/pay/paystack/init', input, options)
  }

  /**
   * Poll for the current status of a payment by its order ID.
   *
   * @deprecated Use {@link getCheckoutStatus} for the typed checkout lifecycle.
   * This method retains its legacy route and response for compatibility.
   */
  async getStatus(orderId: string, options?: RequestOptions): Promise<PaymentStatusResponse> {
    return this.client.get<PaymentStatusResponse>(`/pay/status/${orderId}`, undefined, options)
  }

  /**
   * Get the buyer-visible checkout lifecycle for a retail or bale order.
   */
  async getCheckoutStatus(orderId: string, options?: RequestOptions): Promise<CheckoutStatusResponse> {
    return this.client.get<CheckoutStatusResponse>(`/pay/checkout-status/${orderId}`, undefined, options)
  }
}
