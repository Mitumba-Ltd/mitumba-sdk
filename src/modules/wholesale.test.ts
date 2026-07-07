import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { WholesaleModule } from './wholesale'
import { MemoryTokenStore } from '../token-store'

describe('WholesaleModule', () => {
  let apiClient: APIClient
  let wholesale: WholesaleModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    wholesale = new WholesaleModule(apiClient)
  })

  describe('getWholesaleStore', () => {
    it('calls GET /listings/wholesale/store', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ store: null })
      await wholesale.getWholesaleStore()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/wholesale/store', undefined, undefined)
    })
  })

  describe('saveWholesaleStore', () => {
    it('calls POST /listings/wholesale/store', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'ws_1' })
      await wholesale.saveWholesaleStore({ name: 'Bales Inc', origins: ['UK', 'US'] })
      expect(apiClient.post).toHaveBeenCalledWith('/listings/wholesale/store', { name: 'Bales Inc', origins: ['UK', 'US'] }, undefined)
    })
  })

  describe('addDepot', () => {
    it('calls POST /listings/wholesale/store/depots', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'dep_1' })
      await wholesale.addDepot({ name: 'Nairobi Depot', city_id: 'nbi' })
      expect(apiClient.post).toHaveBeenCalledWith('/listings/wholesale/store/depots', { name: 'Nairobi Depot', city_id: 'nbi' }, undefined)
    })
  })

  describe('removeDepot', () => {
    it('calls DELETE /listings/wholesale/store/depots/:id', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await wholesale.removeDepot('dep_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/listings/wholesale/store/depots/dep_1', undefined, undefined)
    })
  })

  describe('createBale', () => {
    it('calls POST /listings/bales', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'bale_1' })
      const input = { title: 'Mixed Denim', category: 'denim', grade: 'A' as const, weight_kg: 45, price_kes: 15000 }
      await wholesale.createBale(input)
      expect(apiClient.post).toHaveBeenCalledWith('/listings/bales', input, undefined)
    })
  })

  describe('getBale', () => {
    it('calls GET /listings/bales/:id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await wholesale.getBale('bale_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/bales/bale_1', undefined, undefined)
    })
  })

  describe('updateBale', () => {
    it('calls PATCH /listings/bales/:id', async () => {
      vi.spyOn(apiClient, 'patch').mockResolvedValue({ ok: true })
      await wholesale.updateBale('bale_1', { price_kes: 12000 })
      expect(apiClient.patch).toHaveBeenCalledWith('/listings/bales/bale_1', { price_kes: 12000 }, undefined)
    })
  })

  describe('removeBale', () => {
    it('calls DELETE /listings/bales/:id', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await wholesale.removeBale('bale_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/listings/bales/bale_1', undefined, undefined)
    })
  })

  describe('myBales', () => {
    it('calls GET /listings/wholesale/mine/bales', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await wholesale.myBales()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/wholesale/mine/bales', undefined, undefined)
    })
  })

  describe('wholesaleFeed', () => {
    it('calls GET /listings/wholesale/feed with params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], limit: 20, offset: 0 })
      await wholesale.wholesaleFeed({ grade: 'A', category: 'denim' })
      expect(apiClient.get).toHaveBeenCalledWith('/listings/wholesale/feed', { grade: 'A', category: 'denim' }, undefined)
    })
  })

  describe('createBaleOrder', () => {
    it('calls POST /listings/bale-orders', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'bo_1', total_kes: 15000 })
      await wholesale.createBaleOrder({ bale_id: 'bale_1', qty: 2, fulfillment: 'pickup' })
      expect(apiClient.post).toHaveBeenCalledWith('/listings/bale-orders', { bale_id: 'bale_1', qty: 2, fulfillment: 'pickup' }, undefined)
    })
  })

  describe('myBaleOrders', () => {
    it('calls GET /listings/bale-orders/mine', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await wholesale.myBaleOrders()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/bale-orders/mine', undefined, undefined)
    })
  })

  describe('incomingBaleOrders', () => {
    it('calls GET /listings/wholesale/orders', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await wholesale.incomingBaleOrders()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/wholesale/orders', undefined, undefined)
    })
  })

  describe('getBaleOrder', () => {
    it('calls GET /listings/bale-orders/:id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ id: 'bo_1', events: [] })
      await wholesale.getBaleOrder('bo_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/bale-orders/bo_1', undefined, undefined)
    })
  })

  describe('transitionBaleOrder', () => {
    it('calls POST /listings/bale-orders/:id/transition', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'confirmed' })
      await wholesale.transitionBaleOrder('bo_1', 'confirm')
      expect(apiClient.post).toHaveBeenCalledWith('/listings/bale-orders/bo_1/transition', { action: 'confirm' }, undefined)
    })
  })
})
