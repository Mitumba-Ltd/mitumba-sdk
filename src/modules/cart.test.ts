import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { CartModule } from './cart'

describe('CartModule', () => {
  let apiClient: APIClient
  let cartModule: CartModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    cartModule = new CartModule(apiClient)
  })

  describe('list', () => {
    it('calls GET /listings/cart', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await cartModule.list()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/cart', undefined, undefined)
    })
  })

  describe('add', () => {
    it('calls POST /listings/cart/:listingId', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await cartModule.add('lst_1')
      expect(apiClient.post).toHaveBeenCalledWith('/listings/cart/lst_1', undefined, undefined)
    })
  })

  describe('remove', () => {
    it('calls DELETE /listings/cart/:listingId', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await cartModule.remove('lst_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/listings/cart/lst_1', undefined)
    })
  })

  describe('checkout', () => {
    it('calls POST /orders/checkout', async () => {
      const mockResponse = { order_ids: ['ord_1', 'ord_2'], count: 2 }
      vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse)
      const result = await cartModule.checkout()
      expect(apiClient.post).toHaveBeenCalledWith('/orders/checkout', undefined, undefined)
      expect(result).toEqual(mockResponse)
    })
  })
})
