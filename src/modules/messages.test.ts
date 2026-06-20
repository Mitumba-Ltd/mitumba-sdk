import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
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
})
