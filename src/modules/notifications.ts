import { APIClient } from '../client'
import { ManagedNotificationStream } from '../realtime/notification-stream'
import { browserResume, createLiveUnread } from '../realtime/live-unread'
import type { LiveUnread, LiveUnreadOptions, Notification, NotificationStream, NotificationStreamOptions, RequestOptions } from '../types'

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

  /**
   * A bell's unread count, kept current without a reload. Reads the count once, then follows the
   * live stream; while the stream is not open (connecting, refused, failed) it polls on resume
   * and every minute, and asks for a new stream at most every ten minutes after a refusal.
   * Create one per page and share it between bells.
   */
  liveUnread(options: LiveUnreadOptions = {}): LiveUnread {
    return createLiveUnread({
      unread: () => this.unread(),
      stream: (streamOptions) => this.stream(streamOptions),
      onResume: options.onResume ?? browserResume,
      setInterval: (callback, ms) => setInterval(callback, ms),
      clearInterval: (handle) => clearInterval(handle as ReturnType<typeof setInterval>),
      surface: options.surface,
    })
  }
}
