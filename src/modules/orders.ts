import { APIClient } from '../client'
import type { CreateOrderInput, Order, OrderEvent, OrderHistoryParams, OrderStatus, TransitionOrderInput, RequestOptions } from '../types'

export class OrdersModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Create a new order from a listing.
   */
  async create(input: CreateOrderInput, options?: RequestOptions): Promise<{ order_id: string; total: number; delivery_fee: number }> {
    return this.client.post<{ order_id: string; total: number; delivery_fee: number }>('/orders', input, options)
  }

  /**
   * Get full details of an order, including its event timeline.
   */
  async getById(id: string, options?: RequestOptions): Promise<Order & { events: OrderEvent[] }> {
    return this.client.get<Order & { events: OrderEvent[] }>(`/orders/${id}`, undefined, options)
  }

  /**
   * Transition the status of an order.
   */
  async transition(id: string, input: TransitionOrderInput, options?: RequestOptions): Promise<{ ok: boolean; status: OrderStatus }> {
    return this.client.post<{ ok: boolean; status: OrderStatus }>(`/orders/${id}/transition`, input, options)
  }

  /**
   * Get the order history for the current authenticated user.
   */
  async getHistory(params?: OrderHistoryParams, options?: RequestOptions): Promise<{ data: Order[]; page: number; page_size: number }> {
    return this.client.get<{ data: Order[]; page: number; page_size: number }>(
      '/orders/history',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }
}
