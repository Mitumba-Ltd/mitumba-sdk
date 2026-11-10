import { APIClient } from '../client'
import type { CreateOrderInput, Order, OrderDocument, OrderEvent, OrderHistoryParams, OrderStatus, TransitionOrderInput, RequestOptions } from '../types'

/** The file name in a Content-Disposition header: the RFC 5987 filename* form first, then filename. */
function dispositionFilename(header: string | null): string | null {
  if (!header) return null
  const extended = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header)
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].trim())
    } catch {
      // A malformed encoding: fall back to the plain filename.
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/.exec(header)
  return plain?.[1]?.trim() || null
}

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
   * Get an order's invoice or receipt as a PDF: its receipt once it is paid, its invoice while it awaits
   * payment. Buyer only. Every order of one checkout returns the same document.
   *
   * Errors: 404 document_not_found when the order has no document to show.
   */
  async getDocument(id: string, options?: RequestOptions): Promise<OrderDocument> {
    const file = await this.client.getFile(`/orders/${encodeURIComponent(id)}/document`, undefined, options)
    const kind = file.headers.get('X-Mitumba-Document') === 'receipt' ? 'receipt' : 'invoice'
    return {
      kind,
      filename: dispositionFilename(file.headers.get('Content-Disposition')) ?? `Mitumba-${id}.pdf`,
      blob: file.blob,
    }
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
