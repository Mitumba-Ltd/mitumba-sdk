import { APIClient } from '../client'
import type { CreateOrderInput, Order, OrderHistoryParams, TransitionOrderInput } from '../types'

export class OrdersModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Create a new order from a listing.
   */
  async create(input: CreateOrderInput): Promise<{ order_id: string; total: number; delivery_fee: number }> {
    return this.client.post<{ order_id: string; total: number; delivery_fee: number }>('/orders', input)
  }

  /**
   * Get full details of an order, including its event timeline.
   */
  async getById(id: string): Promise<Order> {
    return this.client.get<Order>(`/orders/${id}`)
  }

  /**
   * Transition the status of an order.
   */
  async transition(id: string, input: TransitionOrderInput): Promise<Order> {
    return this.client.post<Order>(`/orders/${id}/transition`, input)
  }

  /**
   * Get the order history for the current authenticated user.
   */
  async getHistory(params?: OrderHistoryParams): Promise<{ data: Order[]; page: number; page_size: number }> {
    return this.client.get<{ data: Order[]; page: number; page_size: number }>(
      '/orders/history',
      params as unknown as Record<string, string | number | boolean | undefined>
    )
  }
}
