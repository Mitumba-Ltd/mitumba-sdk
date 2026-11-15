import { describe, expect, it, vi } from 'vitest'
import type { NotificationStreamFrame, NotificationStreamState } from '../types'
import { POLL_MS, STREAM_RETRY_MS, browserResume, createLiveUnread, type LiveUnreadDeps } from './live-unread'

class FakeStream {
  state: NotificationStreamState = 'closed'
  unread: number | null = null
  closed = false
  frames = new Set<(frame: NotificationStreamFrame) => void>()
  states = new Set<(state: NotificationStreamState) => void>()
  start = vi.fn(() => Promise.resolve())
  close() { this.closed = true }
  onFrame(listener: (frame: NotificationStreamFrame) => void) { this.frames.add(listener); return () => this.frames.delete(listener) }
  onStateChange(listener: (state: NotificationStreamState) => void) { this.states.add(listener); return () => this.states.delete(listener) }
  emit(frame: NotificationStreamFrame) { for (const listener of this.frames) listener(frame) }
  become(state: NotificationStreamState) { this.state = state; for (const listener of this.states) listener(state) }
}

function setup(unread: () => Promise<{ unread_count: number }> = async () => ({ unread_count: 2 })) {
  const streams: FakeStream[] = []
  const resume = new Set<() => void>()
  const intervals: Array<{ callback: () => void; ms: number; cleared: boolean }> = []
  const clock = { ms: 1_000_000 }
  const deps: LiveUnreadDeps = {
    now: () => clock.ms,
    unread: vi.fn(unread),
    stream: vi.fn(() => { const stream = new FakeStream(); streams.push(stream); return stream as never }),
    onResume: (listener) => { resume.add(listener); return () => resume.delete(listener) },
    setInterval: (callback, ms) => { const handle = { callback, ms, cleared: false }; intervals.push(handle); return handle },
    clearInterval: (handle) => { if (handle) (handle as { cleared: boolean }).cleared = true },
  }
  const live = createLiveUnread(deps)
  const settle = async () => { for (let i = 0; i < 5; i += 1) await Promise.resolve() }
  return { live, deps, streams, resume, intervals, settle, clock, fireResume: () => { for (const listener of [...resume]) listener() } }
}

describe('the live unread count', () => {
  it('reads the count, then follows the stream, for every bell at once', async () => {
    const { live, deps, streams, settle } = setup()
    const top: number[] = []
    const mobile: number[] = []
    live.subscribe((n) => top.push(n))
    live.subscribe((n) => mobile.push(n))
    await settle()
    expect(deps.unread).toHaveBeenCalledTimes(1)
    expect(deps.stream).toHaveBeenCalledWith({ surface: 'web' })
    expect(top).toEqual([0, 2])
    expect(mobile).toEqual([0, 2])

    streams[0]!.become('open')
    streams[0]!.emit({ type: 'item', item: {} as never, unread: 3 })
    streams[0]!.emit({ type: 'flash', flash: {} as never })
    streams[0]!.emit({ type: 'read', ids: 'all', unread: 0 })
    expect(top).toEqual([0, 2, 3, 0])
    expect(live.count).toBe(0)
  })

  it('does not open a stream for someone signed out, and shows nothing', async () => {
    const { live, deps, fireResume, intervals, settle } = setup(async () => { throw new Error('401') })
    const seen: number[] = []
    live.subscribe((n) => seen.push(n))
    await settle()
    intervals[0]!.callback()
    fireResume()
    await settle()
    expect(deps.stream).not.toHaveBeenCalled()
    expect(deps.unread).toHaveBeenCalledTimes(2) // first read, then on resume; the interval waits for a sign-in
    expect(seen).toEqual([0])
  })

  it('polls on focus and every minute while the stream is not open, and stops once it is', async () => {
    const { live, deps, streams, intervals, fireResume, settle } = setup()
    live.subscribe(() => undefined)
    await settle()
    expect(intervals[0]!.ms).toBe(POLL_MS)
    intervals[0]!.callback()
    fireResume()
    await settle()
    expect(deps.unread).toHaveBeenCalledTimes(3)
    expect(deps.stream).toHaveBeenCalledTimes(1)

    streams[0]!.become('open')
    intervals[0]!.callback()
    fireResume()
    await settle()
    expect(deps.unread).toHaveBeenCalledTimes(3)
  })

  it('drops a refused stream, keeps polling, and asks again only after a wait', async () => {
    const { live, deps, streams, fireResume, settle, clock } = setup()
    live.subscribe(() => undefined)
    await settle()
    streams[0]!.start.mockRejectedValueOnce(new Error('stream_disabled'))
    streams[0]!.become('failed')
    expect(streams[0]!.closed).toBe(true)
    // Focusing the tab again soon after polls, but asks for no new ticket.
    clock.ms += STREAM_RETRY_MS - 1
    fireResume()
    await settle()
    expect(deps.stream).toHaveBeenCalledTimes(1)
    expect(deps.unread).toHaveBeenCalledTimes(2)
    clock.ms += 1
    fireResume()
    await settle()
    expect(deps.stream).toHaveBeenCalledTimes(2)
    // A late state change from the dropped stream changes nothing.
    streams[0]!.become('failed')
    expect(streams[1]!.closed).toBe(false)
  })

  it('swallows a failed start, which the failed state reports', async () => {
    const { live, deps, settle } = setup()
    ;(deps.stream as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      const stream = new FakeStream()
      stream.start.mockRejectedValue(new Error('refused'))
      return stream as never
    })
    live.subscribe(() => undefined)
    await settle()
    expect(deps.stream).toHaveBeenCalledTimes(1)
  })

  it('uses the real clock when none is given', async () => {
    const { deps, settle } = setup()
    const live = createLiveUnread({ ...deps, now: undefined })
    live.subscribe(() => undefined)
    await settle()
    expect(deps.stream).toHaveBeenCalledTimes(1)
  })

  it('re-reads on request, e.g. after marking read', async () => {
    let n = 2
    const { live, settle } = setup(async () => ({ unread_count: n }))
    const seen: number[] = []
    live.subscribe((value) => seen.push(value))
    await settle()
    n = 0
    await live.refresh()
    expect(seen).toEqual([0, 2, 0])
  })

  it('stops everything when the last bell leaves, and starts again for the next one', async () => {
    const { live, deps, streams, intervals, resume, settle } = setup()
    const off1 = live.subscribe(() => undefined)
    const off2 = live.subscribe(() => undefined)
    await settle()
    off1()
    off1()
    expect(streams[0]!.closed).toBe(false)
    off2()
    expect(streams[0]!.closed).toBe(true)
    expect(intervals[0]!.cleared).toBe(true)
    expect(resume.size).toBe(0)

    live.subscribe(() => undefined)
    await settle()
    expect(deps.stream).toHaveBeenCalledTimes(2)
  })
})

describe('browserResume', () => {
  it('does nothing where there is no window or document', () => {
    const off = browserResume(() => undefined)
    expect(off()).toBeUndefined()
  })

  it('calls back on focus and when the page becomes visible, and stops on unsubscribe', () => {
    const windowListeners = new Map<string, () => void>()
    const documentListeners = new Map<string, () => void>()
    const doc = {
      visibilityState: 'hidden',
      addEventListener: (type: string, fn: () => void) => { documentListeners.set(type, fn) },
      removeEventListener: (type: string) => { documentListeners.delete(type) },
    }
    vi.stubGlobal('addEventListener', (type: string, fn: () => void) => { windowListeners.set(type, fn) })
    vi.stubGlobal('removeEventListener', (type: string) => { windowListeners.delete(type) })
    vi.stubGlobal('document', doc)
    try {
      const listener = vi.fn()
      const off = browserResume(listener)
      windowListeners.get('focus')!()
      documentListeners.get('visibilitychange')!()
      doc.visibilityState = 'visible'
      documentListeners.get('visibilitychange')!()
      expect(listener).toHaveBeenCalledTimes(2)
      off()
      expect(windowListeners.size).toBe(0)
      expect(documentListeners.size).toBe(0)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('tolerates a document whose listeners disappear', () => {
    vi.stubGlobal('addEventListener', () => undefined)
    vi.stubGlobal('removeEventListener', undefined)
    vi.stubGlobal('document', { addEventListener: () => undefined })
    try {
      const off = browserResume(() => undefined)
      vi.stubGlobal('document', undefined)
      expect(() => off()).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
