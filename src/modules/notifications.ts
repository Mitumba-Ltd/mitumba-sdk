import { APIClient } from '../client'
import type { Notification, RequestOptions } from '../types'

export class NotificationsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List paginated notifications with unread count.
   */
  async list(page?: number, options?: RequestOptions): Promise<{ data: Notification[]; unread_count: number; page: number }> {
    return this.client.get<{ data: Notification[]; unread_count: number; page: number }>(
      '/notify/notifications',
      page !== undefined ? { page } : undefined,
      options
    )
  }

  /**
   * Mark notifications as read. If ids omitted, marks all as read.
   */
  async markRead(ids?: string[], options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/notify/notifications/read', ids ? { ids } : {}, options)
  }
}
