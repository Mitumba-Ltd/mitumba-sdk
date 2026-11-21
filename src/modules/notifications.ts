import { APIClient } from '../client'
import { ManagedNotificationStream } from '../realtime/notification-stream'
import { browserResume, createLiveUnread } from '../realtime/live-unread'
import type {
  LiveUnread, LiveUnreadOptions, MarketingConsentChange, Notification, NotificationPreferences, NotificationStream,
  NotificationStreamOptions, PreferenceCellChange, PreferenceSettingsChange, RequestOptions,
} from '../types'

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

  /**
   * The caller's notification settings: categories with their channels, which channels can reach
   * them now, quiet hours, muted pop-ups and marketing consent.
   */
  async getPreferences(options?: RequestOptions): Promise<NotificationPreferences> {
    return this.client.get<NotificationPreferences>('/notify/notifications/preferences', undefined, options)
  }

  /**
   * Set (or, with `enabled: null`, reset to default) 1 to 64 category × channel cells. A cell
   * applies to every event in its category. Answers the whole updated preferences.
   */
  async updatePreferences(cells: PreferenceCellChange[], options?: RequestOptions): Promise<NotificationPreferences> {
    return this.client.put<NotificationPreferences>('/notify/notifications/preferences', { cells }, options)
  }

  /** Change quiet hours, muted pop-up kinds, or both. Answers the whole updated preferences. */
  async updatePreferenceSettings(input: PreferenceSettingsChange, options?: RequestOptions): Promise<NotificationPreferences> {
    return this.client.put<NotificationPreferences>('/notify/notifications/preferences/settings', input, options)
  }

  /**
   * Opt in to or out of marketing on one channel. The server records its own consent wording
   * (shown to the person as `consentWording`). Answers the whole updated preferences.
   */
  async setMarketingConsent(input: MarketingConsentChange, options?: RequestOptions): Promise<NotificationPreferences> {
    return this.client.put<NotificationPreferences>('/notify/notifications/preferences/consent', { channel: input.channel, granted: input.granted }, options)
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
