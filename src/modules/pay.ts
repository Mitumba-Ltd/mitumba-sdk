import { APIClient } from '../client'
import type { PaymentStatusResponse, StkPushInput, StkPushResponse, RequestOptions } from '../types'

export class PayModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Initiate an M-Pesa STK Push payment for an order.
   */
  async initiateStkPush(input: StkPushInput, options?: RequestOptions): Promise<StkPushResponse> {
    return this.client.post<StkPushResponse>('/pay/stk', input, options)
  }

  /**
   * Poll for the current status of a payment by its order ID.
   */
  async getStatus(orderId: string, options?: RequestOptions): Promise<PaymentStatusResponse> {
    return this.client.get<PaymentStatusResponse>(`/pay/status/${orderId}`, undefined, options)
  }
}
