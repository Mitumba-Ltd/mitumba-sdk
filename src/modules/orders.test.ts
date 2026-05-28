import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { OrdersModule } from './orders'
import type { OrderStatus } from '../types'

describe('OrdersModule', () => {
  let apiClient: APIClient
  let ordersModule: OrdersModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    ordersModule = new OrdersModule(apiClient)
  })

  describe('create', () => {
    it('calls POST /orders', async () => {
      const mockResponse = { order_id: '123', total: 1000, delivery_fee: 100 }
      vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse)
      
      const input = { listing_id: 'lst_123' }
      const result = await ordersModule.create(input)
      
      expect(apiClient.post).toHaveBeenCalledWith('/orders', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getById', () => {
    it('calls GET /orders/:id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await ordersModule.getById('ord_123')
      expect(apiClient.get).toHaveBeenCalledWith('/orders/ord_123', undefined, undefined)
    })
  })

  describe('transition', () => {
    it('calls POST /orders/:id/transition', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({})
      const input = { status: 'shipped' as OrderStatus, note: 'On the way' }
      
      await ordersModule.transition('ord_123', input)
      
      expect(apiClient.post).toHaveBeenCalledWith('/orders/ord_123/transition', input, undefined)
    })
  })

  describe('getHistory', () => {
    it('calls GET /orders/history with params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      const params = { role: 'seller' as const, page: 2 }
      
      await ordersModule.getHistory(params)
      
      expect(apiClient.get).toHaveBeenCalledWith('/orders/history', params, undefined)
    })
  })
})
