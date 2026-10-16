import { beforeEach, describe, expect, it, vi } from 'vitest'

import { APIClient, APIError } from '../client'
import { MessagesModule } from './messages'

import type { ApiResponse } from '../types'

const buyer = { kind: 'buyer' as const }
const store = { kind: 'store' as const, store_id: 'store/a' }
const page = { items: [], next_cursor: null, has_more: false }
const messagePage = { items: [], older_cursor: null, newer_cursor: null, has_older: false, has_newer: false }
const conversation = { id: 'conversation' }
const thread = { id: 'thread' }

function envelope<T>(data: T): ApiResponse<T> {
  return { api_version: 2, data }
}

describe('MessagesModule v2 HTTP surface', () => {
  let client: APIClient
  let messages: MessagesModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', maxRetries: 0 })
    messages = new MessagesModule(client)
    vi.restoreAllMocks()
  })

  it('lists inboxes and buyer/store conversations with encoded paths and cursors', async () => {
    const get = vi.spyOn(client, 'get')
      .mockResolvedValueOnce(envelope({ buyer: { kind: 'buyer', buyer: { id: 'buyer' } }, stores: [] }))
      .mockResolvedValueOnce(envelope(page))
      .mockResolvedValueOnce(envelope(page))
    await messages.listMessagingInboxes({ signal: new AbortController().signal })
    await messages.listConversations({ cursor: 'next/cursor', limit: 30 })
    await messages.listStoreConversations('store/a', { cursor: 'next/cursor', limit: 100 })
    expect(get.mock.calls).toEqual([
      ['/notify/v2/inboxes', undefined, expect.any(Object)],
      ['/notify/v2/inboxes/buyer/conversations', { cursor: 'next/cursor', limit: 30 }, undefined],
      ['/notify/v2/inboxes/stores/store%2Fa/conversations', { cursor: 'next/cursor', limit: 100 }, undefined],
    ])
  })

  it('gets, resolves, lists, and updates conversation/thread resources', async () => {
    const get = vi.spyOn(client, 'get')
      .mockResolvedValueOnce(envelope({ conversation }))
      .mockResolvedValueOnce(envelope(page))
      .mockResolvedValueOnce(envelope({ conversation, thread }))
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(envelope({ conversation, thread, created: { conversation: true, thread: true } }))
    const patch = vi.spyOn(client, 'patch')
      .mockResolvedValueOnce(envelope({ thread }))
      .mockResolvedValueOnce(envelope({ thread }))
      .mockResolvedValueOnce(envelope({ conversation }))
    await messages.getConversation(store, 'conversation/a')
    await messages.resolveThread(store, { kind: 'order', order_id: 'order/a' }, {
      idempotencyKey: 'resolve-key', headers: { 'X-Test': 'yes' },
    })
    await messages.listThreads(store, 'conversation/a', { cursor: 'cursor', limit: 20, include_archived: true, status: 'open' })
    await messages.getConversationThread(store, 'thread/a')
    await messages.updateThreadStatus(store, 'thread/a', 'resolved')
    await messages.updateThreadPreferences(store, 'thread/a', { archived: true, pinned: false })
    await messages.updateConversationPreferences(store, 'conversation/a', { muted: true })
    expect(get.mock.calls[0]?.[0]).toBe('/notify/v2/inboxes/stores/store%2Fa/conversations/conversation%2Fa')
    expect(post).toHaveBeenCalledWith(
      '/notify/v2/inboxes/stores/store%2Fa/threads/resolve',
      { kind: 'order', order_id: 'order/a' },
      { signal: undefined, headers: { 'X-Test': 'yes', 'Idempotency-Key': 'resolve-key' } },
    )
    expect(patch).toHaveBeenCalledTimes(3)
  })

  it('pages messages, preserves caller idempotency, and advances reads', async () => {
    const get = vi.spyOn(client, 'get').mockResolvedValueOnce(envelope(messagePage))
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(envelope({ message: { id: 'message' }, deduplicated: false, policy: { body_modified: false, notices: [] } }))
    const put = vi.spyOn(client, 'put').mockResolvedValueOnce(envelope({
      thread_id: 'thread', last_read_item_id: 'message', last_read_sequence: 1, changed: true, updated_at: 'now',
    }))
    const options = { signal: new AbortController().signal, headers: { 'X-Test': 'yes' } }
    await messages.listThreadMessages(buyer, 'thread/a', { before: 'older/cursor', limit: 50 }, options)
    await messages.sendThreadMessage(buyer, 'thread/a', {
      client_message_id: 'client-1', body: ' hello ', reply_to_message_id: 'reply', attachment_ids: ['upload'],
    }, options)
    await messages.advanceThreadReadCursor(buyer, 'thread/a', 'item/a', options)
    expect(get).toHaveBeenCalledWith(
      '/notify/v2/inboxes/buyer/threads/thread%2Fa/messages',
      { before: 'older/cursor', limit: 50 },
      options,
    )
    expect(post).toHaveBeenCalledWith(
      '/notify/v2/inboxes/buyer/threads/thread%2Fa/messages',
      { body: ' hello ', reply_to_message_id: 'reply', attachment_ids: ['upload'] },
      { ...options, headers: { 'X-Test': 'yes', 'Idempotency-Key': 'client-1' } },
    )
    expect(put).toHaveBeenCalledWith(
      '/notify/v2/inboxes/buyer/threads/thread%2Fa/read-cursor',
      { timeline_item_id: 'item/a' },
      options,
    )
  })

  it('supports legacy archives, safe link resolution, and capability discovery', async () => {
    const get = vi.spyOn(client, 'get')
      .mockResolvedValueOnce(envelope({ attachments: { enabled: false, max_size_bytes: 0, allowed_content_types: [] } }))
      .mockResolvedValueOnce(envelope(page))
      .mockResolvedValueOnce(envelope({ items: [], older_cursor: null, has_older: false }))
    const post = vi.spyOn(client, 'post').mockResolvedValueOnce(envelope({ result: 'unavailable' }))
    await messages.getMessagingCapabilities()
    await messages.listLegacyMessageArchives({ limit: 10 })
    await messages.listLegacyMessages('legacy/a', { before: 'older', limit: 10 })
    await messages.resolveLegacyLink({ partner_id: 'partner', store_id: null, order_id: null })
    expect(get.mock.calls[2]?.[0]).toBe('/notify/v2/legacy-messages/legacy%2Fa')
    expect(post).toHaveBeenCalledWith(
      '/notify/v2/inboxes/buyer/legacy-links/resolve',
      { partner_id: 'partner', store_id: null, order_id: null },
      undefined,
    )
  })

  it('implements derived-context reports and bilateral blocks', async () => {
    const post = vi.spyOn(client, 'post')
      .mockResolvedValueOnce({ id: 'report', status: 'open', deduplicated: false })
      .mockResolvedValueOnce({ id: 'block', active: true, deduplicated: false })
    const remove = vi.spyOn(client, 'delete').mockResolvedValueOnce({ ok: true, active: false })
    await messages.createReport({ subject_kind: 'message', message_id: 'message', reason: 'off_platform_payment' })
    await messages.createBlock({ partner_id: 'partner', store_id: 'store', reason: 'spam' })
    await messages.removeBlock('block/a')
    expect(post.mock.calls[0]).toEqual(['/notify/messages/reports', expect.any(Object), undefined])
    expect(post.mock.calls[1]).toEqual(['/notify/messages/blocks', expect.any(Object), undefined])
    expect(remove).toHaveBeenCalledWith('/notify/messages/blocks/block%2Fa', undefined, undefined)
  })

  it('authorizes, uploads, checks, and downloads private attachments without SDK credentials', async () => {
    const authorization = {
      id: 'upload', thread_id: 'thread', state: 'authorized' as const,
      upload_url: 'https://api.mitumba.test/notify/v2/attachment-uploads/upload?ticket=short',
      upload_ticket: 'short', expires_at: 'future',
      accepted: { content_type: 'image/jpeg', size_bytes: 3, sha256: 'a'.repeat(64) },
    }
    const post = vi.spyOn(client, 'post')
      .mockResolvedValueOnce(envelope(authorization))
      .mockResolvedValueOnce(envelope({ url: 'https://api.mitumba.test/content?ticket=short', expires_at: 'future' }))
    const get = vi.spyOn(client, 'get').mockResolvedValueOnce(envelope({
      id: 'upload', thread_id: 'thread', state: 'safe', expires_at: 'future', rejection_code: null, attachment: null,
    }))
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => envelope({
        id: 'upload', thread_id: 'thread', state: 'pending_scan', expires_at: 'future', rejection_code: null, attachment: null,
      }),
    } as Response)
    await messages.createThreadAttachmentUpload(buyer, 'thread', {
      file_name: 'photo.jpg', content_type: 'image/jpeg', size_bytes: 3, sha256: 'a'.repeat(64),
    })
    await messages.uploadThreadAttachment(authorization, new Uint8Array([1, 2, 3]), {
      headers: { 'Content-Type': 'attacker/type' }, signal: new AbortController().signal,
    })
    await messages.getThreadAttachmentUpload(buyer, 'thread', 'upload/a')
    await messages.createThreadAttachmentDownload(buyer, 'thread', 'attachment/a')
    const uploadInit = vi.mocked(globalThis.fetch).mock.calls[0]?.[1] as RequestInit
    expect((uploadInit.headers as Record<string, string>)['Content-Type']).toBe('image/jpeg')
    expect(uploadInit).not.toHaveProperty('Authorization')
    expect(get.mock.calls[0]?.[0]).toContain('upload%2Fa')
    expect(post.mock.calls[1]?.[0]).toContain('attachment%2Fa/download')
    vi.restoreAllMocks()
  })

  it.each([0, 101, 1.5])('rejects invalid collection limit %s before transport', async (limit) => {
    const get = vi.spyOn(client, 'get')
    await expect(messages.listConversations({ limit })).rejects.toBeInstanceOf(RangeError)
    expect(get).not.toHaveBeenCalled()
  })

  it('rejects invalid idempotency, send, attachment metadata, and body size before transport', async () => {
    await expect(messages.resolveThread(buyer, { kind: 'general', store_id: 'store' }, { idempotencyKey: ' ' }))
      .rejects.toBeInstanceOf(TypeError)
    await expect(messages.sendThreadMessage(buyer, 'thread', { client_message_id: '', body: 'hello' }))
      .rejects.toBeInstanceOf(TypeError)
    await expect(messages.sendThreadMessage(buyer, 'thread', { client_message_id: 'id', body: '   ' }))
      .rejects.toBeInstanceOf(RangeError)
    await expect(messages.createThreadAttachmentUpload(buyer, 'thread', {
      file_name: '', content_type: 'image/jpeg', size_bytes: 1, sha256: 'A'.repeat(64),
    })).rejects.toBeInstanceOf(TypeError)
    await expect(messages.uploadThreadAttachment({
      id: 'upload', thread_id: 'thread', state: 'authorized', upload_url: 'https://example.test',
      upload_ticket: 'ticket', expires_at: 'future',
      accepted: { content_type: 'image/jpeg', size_bytes: 2, sha256: 'a'.repeat(64) },
    }, new Uint8Array([1]))).rejects.toBeInstanceOf(RangeError)
  })

  it('rejects malformed envelopes and direct upload errors without leaking ticket data', async () => {
    vi.spyOn(client, 'get').mockResolvedValueOnce({ api_version: 1, data: page })
    await expect(messages.listConversations()).rejects.toMatchObject({ code: 'invalid_response' })

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 409, statusText: 'Conflict', json: async () => ({ api_version: 2, error: { code: 'attachment_not_ready', message: 'Not ready' } }) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => { throw new Error('bad json') } } as Response)
    const authorization = {
      id: 'upload', thread_id: 'thread', state: 'authorized' as const,
      upload_url: 'https://example.test/upload?ticket=secret-ticket', upload_ticket: 'secret-ticket', expires_at: 'future',
      accepted: { content_type: 'image/jpeg', size_bytes: 1, sha256: 'a'.repeat(64) },
    }
    const first = messages.uploadThreadAttachment(authorization, new Uint8Array([1]))
    await expect(first).rejects.toMatchObject({ code: 'attachment_not_ready' })
    await expect(first).rejects.not.toThrow(/secret-ticket/u)
    await expect(messages.uploadThreadAttachment(authorization, new Uint8Array([1]))).rejects.toMatchObject({ code: 'invalid_response' })
    vi.restoreAllMocks()
  })

  it.each([400, 401, 403, 404, 409, 429, 500, 503])('propagates API status %i from every thin transport family', async (status) => {
    const error = new APIError(status, { error: 'transport_error' })
    vi.spyOn(client, 'get').mockRejectedValue(error)
    vi.spyOn(client, 'post').mockRejectedValue(error)
    vi.spyOn(client, 'patch').mockRejectedValue(error)
    vi.spyOn(client, 'put').mockRejectedValue(error)
    await expect(messages.listConversations()).rejects.toBe(error)
    await expect(messages.resolveThread(buyer, { kind: 'general', store_id: 'store' }, { idempotencyKey: 'key' })).rejects.toBe(error)
    await expect(messages.updateThreadStatus(buyer, 'thread', 'open')).rejects.toBe(error)
    await expect(messages.advanceThreadReadCursor(buyer, 'thread', 'item')).rejects.toBe(error)
    vi.restoreAllMocks()
  })
})


describe('fresh legacy inbox compatibility', () => {
  it('hydrates or refreshes before creating the unchanged legacy inbox socket', async () => {
    const client = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    const messages = new MessagesModule(client)
    vi.spyOn(client, 'ensureFreshToken').mockResolvedValue()
    vi.spyOn(client, 'getToken').mockReturnValue('fresh token')
    const socket = { readyState: 0 } as unknown as import('../types').WebSocketLike
    const create = vi.spyOn(client, 'createWebSocket').mockReturnValue(socket)
    const signal = new AbortController().signal

    await expect(messages.connectInboxFresh({ signal })).resolves.toBe(socket)
    expect(client.ensureFreshToken).toHaveBeenCalledWith({ signal })
    expect(create).toHaveBeenCalledWith(
      'wss://api.mitumba.test/notify/messages/inbox?token=fresh%20token',
      [],
    )
  })
})


describe('MessagesModule managed realtime factories', () => {
  it('creates an inert connection and starts the convenience variant', async () => {
    const client = new APIClient({
      baseUrl: 'https://api.mitumba.test',
      webSocketFactory: () => ({
        readyState: 1,
        send: () => undefined,
        close: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    })
    const messages = new MessagesModule(client)
    const inert = messages.createMessagesRealtimeConnection({ perspective: { kind: 'buyer' } })
    expect(inert.state).toBe('closed')

    const started = { start: vi.fn().mockResolvedValue(undefined) }
    vi.spyOn(messages, 'createMessagesRealtimeConnection').mockReturnValue(started as unknown as import('../types').MessagesRealtimeConnection)
    await expect(messages.connectMessagesRealtime({ perspective: { kind: 'buyer' } })).resolves.toBe(started)
    expect(started.start).toHaveBeenCalledOnce()
  })
})
