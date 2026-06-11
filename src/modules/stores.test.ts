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
    it('calls GET /listings with store_id and page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await storesModule.getListings('store_1', 2)
      expect(apiClient.get).toHaveBeenCalledWith('/listings', { store_id: 'store_1', page: 2 }, undefined)
    })

    it('calls GET /listings with store_id only', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await storesModule.getListings('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings', { store_id: 'store_1' }, undefined)
    })
  })
})
