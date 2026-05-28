import { APIClient } from '../client'
import type { PaymentStatusResponse, StkPushInput, StkPushResponse } from '../types'

export class PayModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Initiate an M-Pesa STK Push payment for an order.
   */
  async initiateStkPush(input: StkPushInput): Promise<StkPushResponse> {
    return this.client.post<StkPushResponse>('/pay/stk', input)
  }

  /**
   * Poll for the current status of a payment by its order ID.
   */
  async getStatus(orderId: string): Promise<PaymentStatusResponse> {
    return this.client.get<PaymentStatusResponse>(`/pay/status/${orderId}`)
  }
}
