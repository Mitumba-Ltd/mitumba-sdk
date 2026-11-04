import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient, APIError } from '../client'
import { MessagesModule } from './messages'

describe('MessagesModule', () => {
  let apiClient: APIClient
  let messagesModule: MessagesModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    messagesModule = new MessagesModule(apiClient)
  })

  describe('list', () => {
    it('calls GET /notify/messages without storeId', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await messagesModule.list()
      expect(apiClient.get).toHaveBeenCalledWith('/notify/messages', undefined, undefined)
    })

    it('calls GET /notify/messages with storeId', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await messagesModule.list('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/notify/messages', { store_id: 'store_1' }, undefined)
    })
  })

  describe('getThread', () => {
    it('calls GET /notify/messages/:partnerId without storeId', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await messagesModule.getThread('partner_123')
      expect(apiClient.get).toHaveBeenCalledWith('/notify/messages/partner_123', undefined, undefined)
    })

    it('calls GET /notify/messages/:partnerId with storeId', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await messagesModule.getThread('partner_123', 'store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/notify/messages/partner_123', { store_id: 'store_1' }, undefined)
    })
  })

  describe('send', () => {
    it('calls POST /notify/messages with input', async () => {
      const mockResponse = { id: 'msg_abc' }
      vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse)

      const input = { receiver_id: 'user_2', body: 'Hello!', listing_id: 'lst_1' }
      const result = await messagesModule.send(input)

      expect(apiClient.post).toHaveBeenCalledWith('/notify/messages', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('markRead', () => {
    it('calls POST /notify/messages/:partnerId/read without storeId', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await messagesModule.markRead('partner_1')
      expect(apiClient.post).toHaveBeenCalledWith('/notify/messages/partner_1/read', undefined, undefined)
    })

    it('calls POST /notify/messages/:partnerId/read with storeId', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await messagesModule.markRead('partner_1', 'store_1')
      expect(apiClient.post).toHaveBeenCalledWith('/notify/messages/partner_1/read?store_id=store_1', undefined, undefined)
    })
  })

  describe('connectTyping', () => {
    it('constructs WebSocket URL with token', () => {
      vi.spyOn(apiClient, 'getToken').mockReturnValue('my-token')
      vi.spyOn(apiClient, 'getBaseUrl').mockReturnValue('https://api.mitumba.test')
      const MockWebSocket = vi.fn()
      vi.stubGlobal('WebSocket', MockWebSocket)

      messagesModule.connectTyping('partner_1')

      expect(MockWebSocket).toHaveBeenCalledWith('wss://api.mitumba.test/notify/messages/partner_1/ws?token=my-token')
      vi.unstubAllGlobals()
    })
  })

  describe('connectInbox', () => {
    it('constructs inbox WebSocket URL with token', () => {
      vi.spyOn(apiClient, 'getToken').mockReturnValue('my-token')
      vi.spyOn(apiClient, 'getBaseUrl').mockReturnValue('https://api.mitumba.test')
      const MockWebSocket = vi.fn()
      vi.stubGlobal('WebSocket', MockWebSocket)

      messagesModule.connectInbox()

      expect(MockWebSocket).toHaveBeenCalledWith('wss://api.mitumba.test/notify/messages/inbox?token=my-token')
      vi.unstubAllGlobals()
    })
  })
})

describe('MessagesModule v2 abuse control', () => {
  let apiClient: APIClient
  let messagesModule: MessagesModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    messagesModule = new MessagesModule(apiClient)
    vi.restoreAllMocks()
  })

  it('creates blocks per perspective, files reports, and removes blocks (v2 envelope)', async () => {
    const post = vi.spyOn(apiClient, 'post')
      .mockResolvedValueOnce({ api_version: 2, data: { id: 'block', active: true, deduplicated: false } })
      .mockResolvedValueOnce({ api_version: 2, data: { id: 'block2', active: true, deduplicated: false } })
      .mockResolvedValueOnce({ api_version: 2, data: { id: 'report', status: 'open', deduplicated: false } })
    const remove = vi.spyOn(apiClient, 'delete')
      .mockResolvedValueOnce({ api_version: 2, data: { ok: true, active: false } })

    const buyerBlock = await messagesModule.createMessagingBlock({ kind: 'buyer' }, { store_id: 'store/a', reason: 'spam' })
    expect(buyerBlock).toEqual({ id: 'block', active: true, deduplicated: false })
    expect(post.mock.calls[0]).toEqual(['/notify/v2/inboxes/buyer/blocks', { store_id: 'store/a', reason: 'spam' }, undefined])

    const storeBlock = await messagesModule.createMessagingBlock({ kind: 'store', store_id: 'store/a' }, { buyer_id: 'buyer1' })
    expect(storeBlock.id).toBe('block2')
    expect(post.mock.calls[1]).toEqual(['/notify/v2/inboxes/stores/store%2Fa/blocks', { buyer_id: 'buyer1' }, undefined])

    const report = await messagesModule.createMessagingReport(
      { kind: 'buyer' },
      { subject_kind: 'conversation', partner_id: 'seller', store_id: 'store1', reason: 'spam' },
    )
    expect(report).toEqual({ id: 'report', status: 'open', deduplicated: false })
    expect(post.mock.calls[2][0]).toBe('/notify/v2/inboxes/buyer/reports')

    const removed = await messagesModule.removeMessagingBlock({ kind: 'store', store_id: 'store/a' }, 'block/a')
    expect(removed).toEqual({ ok: true, active: false })
    expect(remove).toHaveBeenCalledWith('/notify/v2/inboxes/stores/store%2Fa/blocks/block%2Fa', undefined, undefined)
  })

  it('rejects a response that is not a v2 envelope', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ id: 'x', active: true })
    await expect(messagesModule.createMessagingBlock({ kind: 'buyer' }, { store_id: 's' })).rejects.toBeInstanceOf(APIError)
  })
})
