import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { StoresModule } from './stores'

describe('StoresModule', () => {
  let apiClient: APIClient
  let storesModule: StoresModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    storesModule = new StoresModule(apiClient)
  })

  describe('getBySlug', () => {
    it('calls GET /listings/stores/:slug', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await storesModule.getBySlug('my-store')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/my-store', undefined, undefined)
    })
  })

  describe('follow', () => {
    it('calls POST /listings/stores/:storeId/follow', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await storesModule.follow('store_1')
      expect(apiClient.post).toHaveBeenCalledWith('/listings/stores/store_1/follow', undefined, undefined)
    })
  })

  describe('unfollow', () => {
    it('calls DELETE /listings/stores/:storeId/follow', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await storesModule.unfollow('store_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/listings/stores/store_1/follow', undefined)
    })
  })

  describe('getListings', () => {
    it('calls GET /listings/stores/:storeId/listings with page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await storesModule.getListings('store_1', 2)
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/listings', { page: 2 }, undefined)
    })

    it('calls GET /listings/stores/:storeId/listings without page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await storesModule.getListings('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/listings', undefined, undefined)
    })
  })

  describe('getMyStores', () => {
    it('calls GET /listings/stores/mine', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await storesModule.getMyStores()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/mine', undefined, undefined)
    })
  })

  describe('create', () => {
    it('calls POST /listings/stores', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'store_1', slug: 'my-store' })
      const input = { name: 'My Store', slug: 'my-store', description: 'A cool store' }
      await storesModule.create(input)
      expect(apiClient.post).toHaveBeenCalledWith('/listings/stores', input, undefined)
    })
  })

  describe('update', () => {
    it('calls PUT /listings/stores/:storeId', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({ ok: true })
      await storesModule.update('store_1', { name: 'New Name', tagline: 'Fresh' })
      expect(apiClient.put).toHaveBeenCalledWith('/listings/stores/store_1', { name: 'New Name', tagline: 'Fresh' }, undefined)
    })
  })

  describe('getStats', () => {
    it('calls GET /listings/stores/:storeId/stats', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ listings: 10, orders: 5, revenue: 50000, followers: 20 })
      await storesModule.getStats('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/stats', undefined, undefined)
    })
  })

  describe('getSettings', () => {
    it('calls GET /listings/stores/:storeId/settings', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await storesModule.getSettings('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/settings', undefined, undefined)
    })
  })

  describe('updateSettings', () => {
    it('calls PUT /listings/stores/:storeId/settings', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({ ok: true })
      const input = { shipping_type: 'flat' as const, flat_rate: 200 }
      await storesModule.updateSettings('store_1', input)
      expect(apiClient.put).toHaveBeenCalledWith('/listings/stores/store_1/settings', input, undefined)
    })
  })
})
