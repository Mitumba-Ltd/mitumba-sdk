import { APIClient } from '../client'
import type { CancelOrderInput, CancelOrderResult, CreateOrderInput, Order, OrderDocument, OrderEvent, OrderHistoryEntry, OrderHistoryParams, OrderStatus, ShopOrderFields, TransitionOrderInput, RequestOptions } from '../types'

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
   * Get full details of an order, including its event timeline. For the shop (the seller, or a team
   * member who may read orders) it also carries `items`, `settlement` and `next_step`.
   */
  async getById(id: string, options?: RequestOptions): Promise<Order & { events: OrderEvent[] } & Partial<ShopOrderFields>> {
    return this.client.get<Order & { events: OrderEvent[] } & Partial<ShopOrderFields>>(`/orders/${id}`, undefined, options)
  }

  /**
   * Shop: cancel a paid order it cannot fulfil, before its parcel is ready. The buyer is refunded in
   * full. The owner or a team member who may cancel orders.
   *
   * Errors: 400 invalid_input; 403 store_forbidden; 404 not_found; 409 order_not_cancellable,
   * parcel_ready, not_refundable, conflict (reload and retry).
   */
  async cancel(id: string, input: CancelOrderInput, options?: RequestOptions): Promise<CancelOrderResult> {
    return this.client.post<CancelOrderResult>(`/orders/${encodeURIComponent(id)}/cancel`, input, options)
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
   * Get the order history for the current authenticated user. Each entry carries the order's first
   * four items and its unit count. With `role: 'seller'`, only orders that have been paid are listed.
   */
  async getHistory(params?: OrderHistoryParams, options?: RequestOptions): Promise<{ data: OrderHistoryEntry[]; page: number; page_size: number }> {
    return this.client.get<{ data: OrderHistoryEntry[]; page: number; page_size: number }>(
      '/orders/history',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }
}
