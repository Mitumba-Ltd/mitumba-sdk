import { APIClient } from '../client'
import { ManagedNotificationStream } from '../realtime/notification-stream'
import type { Notification, NotificationStream, NotificationStreamOptions, RequestOptions } from '../types'

export class NotificationsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List paginated notifications (20 per page, newest first) with the unread count.
   */
  async list(page?: number, options?: RequestOptions): Promise<{ data: Notification[]; unread_count: number; page: number }> {
    return this.client.get<{ data: Notification[]; unread_count: number; page: number }>(
      '/notify/notifications',
      page !== undefined ? { page } : undefined,
      options
    )
  }

  /**
   * The unread count alone: for a badge, on focus or on an interval when no stream is open.
   */
  async unread(options?: RequestOptions): Promise<{ unread_count: number }> {
    return this.client.get<{ unread_count: number }>('/notify/notifications/unread', undefined, options)
  }

  /**
   * Mark notifications as read (at most 90 ids per call). If ids are omitted, marks all as read.
   */
  async markRead(ids?: string[], options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/notify/notifications/read', ids ? { ids } : {}, options)
  }

  /** Create an inert live notification stream. Register listeners before `start()`. */
  stream(options?: NotificationStreamOptions): NotificationStream {
    return new ManagedNotificationStream(this.client, options)
  }

  /** Create and start a live notification stream. Resolves once connected. */
  async connectStream(options?: NotificationStreamOptions): Promise<NotificationStream> {
    const stream = this.stream(options)
    await stream.start()
    return stream
  }
}
