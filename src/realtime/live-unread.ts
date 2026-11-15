// A notification bell's unread count, kept current without a reload (notifications.liveUnread()).
//
// One controller per page, shared by every bell on it:
// - reads the count once (GET /notify/notifications/unread), which also tells us someone is signed in;
// - then opens the live stream, whose every frame carries the count;
// - while the stream is not open (connecting, refused while the new feed is off, or failed), polls
//   on focus and every minute instead.
// The first subscriber starts it; the last one to leave stops it and closes the socket.

import type { LiveUnread, NotificationStream, NotificationStreamOptions, NotificationStreamState } from '../types'

export const POLL_MS = 60_000
/**
 * After a stream is refused or fails, wait this long before asking for another ticket. While the
 * new feed is off every ticket is refused (403 stream_disabled), so retrying on each focus would
 * only add a failed request per tab switch; polling keeps the count right meanwhile.
 */
export const STREAM_RETRY_MS = 10 * 60_000

export interface LiveUnreadDeps {
  unread(): Promise<{ unread_count: number }>
  stream(options: NotificationStreamOptions): NotificationStream
  /** Calls back when the page regains focus or becomes visible. Returns an unsubscribe. */
  onResume(listener: () => void): () => void
  setInterval(callback: () => void, ms: number): unknown
  clearInterval(handle: unknown): void
  /** Epoch ms. Default Date.now. */
  now?: () => number
  /** Which surface this client is, for pop-ups. Default web. */
  surface?: NotificationStreamOptions['surface']
}

/** Focus and visibility in a browser; nothing elsewhere (server rendering, workers, tests). */
export function browserResume(listener: () => void): () => void {
  const target = globalThis as { addEventListener?: (type: string, fn: () => void) => void; removeEventListener?: (type: string, fn: () => void) => void; document?: { visibilityState?: string; addEventListener?: (type: string, fn: () => void) => void; removeEventListener?: (type: string, fn: () => void) => void } }
  if (!target.addEventListener || !target.document?.addEventListener) return () => undefined
  const onVisible = () => { if (target.document?.visibilityState === 'visible') listener() }
  target.addEventListener('focus', listener)
  target.document.addEventListener('visibilitychange', onVisible)
  return () => {
    target.removeEventListener?.('focus', listener)
    target.document?.removeEventListener?.('visibilitychange', onVisible)
  }
}


export function createLiveUnread(deps: LiveUnreadDeps): LiveUnread {
  let count = 0
  let signedIn = false
  let streamState: NotificationStreamState = 'closed'
  let stream: NotificationStream | null = null
  let timer: unknown = null
  let offResume: (() => void) | null = null
  let streamRetryAt = 0
  const now = deps.now ?? Date.now
  const listeners = new Set<(count: number) => void>()

  const set = (next: number) => {
    if (next === count) return
    count = next
    for (const listener of [...listeners]) listener(count)
  }

  const read = async (): Promise<boolean> => {
    try {
      set((await deps.unread()).unread_count)
      signedIn = true
    } catch {
      // Signed out, or the service is unavailable: show nothing rather than a stale count.
      signedIn = false
      set(0)
    }
    return signedIn
  }

  const startStream = () => {
    if (stream || !signedIn || now() < streamRetryAt) return
    const current = deps.stream({ surface: deps.surface ?? 'web' })
    stream = current
    current.onFrame((frame) => { if ('unread' in frame) set(frame.unread) })
    current.onStateChange((state) => {
      streamState = state
      // Refused (the new feed is off), signed out, or revoked: drop it and keep polling. A resume
      // after STREAM_RETRY_MS tries again.
      if (state === 'failed' && stream === current) {
        streamRetryAt = now() + STREAM_RETRY_MS
        current.close()
        stream = null
        streamState = 'closed'
      }
    })
    current.start().catch(() => { /* reported through the failed state */ })
  }

  const polling = () => streamState !== 'open'

  const start = () => {
    offResume = deps.onResume(() => {
      if (!polling()) return
      void read().then((ok) => { if (ok) startStream() })
    })
    timer = deps.setInterval(() => { if (polling() && signedIn) void read() }, POLL_MS)
    void read().then((ok) => { if (ok) startStream() })
  }

  const stop = () => {
    offResume?.()
    offResume = null
    deps.clearInterval(timer)
    timer = null
    stream?.close()
    stream = null
    streamState = 'closed'
  }

  return {
    get count() { return count },
    subscribe(listener) {
      listeners.add(listener)
      listener(count)
      if (listeners.size === 1) start()
      return () => {
        if (!listeners.delete(listener)) return
        if (listeners.size === 0) stop()
      }
    },
    async refresh() { await read() },
  }
}
