import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { ListingsModule } from './listings'

describe('ListingsModule', () => {
  let apiClient: APIClient
  let listingsModule: ListingsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    listingsModule = new ListingsModule(apiClient)
  })

  describe('getFeed', () => {
    it('calls GET /listings/feed with params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      const params = { city_id: 'nbi', min_price: 100 }
      
      await listingsModule.getFeed(params)
      
      expect(apiClient.get).toHaveBeenCalledWith('/listings/feed', params)
    })
  })

  describe('getById', () => {
    it('calls GET /listings/:id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await listingsModule.getById('123')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/123')
    })
  })

  describe('create', () => {
    it('calls POST /listings', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({})
      const input = { title: 'Test', category_id: 'cat1', city_id: 'nbi', price: 100, condition: 'new' as const }
      await listingsModule.create(input)
      expect(apiClient.post).toHaveBeenCalledWith('/listings', input)
    })
  })

  describe('update', () => {
    it('calls PUT /listings/:id', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({})
      const input = { title: 'Updated' }
      await listingsModule.update('123', input)
      expect(apiClient.put).toHaveBeenCalledWith('/listings/123', input)
    })
  })

  describe('updateStatus', () => {
    it('calls PATCH /listings/:id/status', async () => {
      vi.spyOn(apiClient, 'patch').mockResolvedValue({})
      await listingsModule.updateStatus('123', 'sold')
      expect(apiClient.patch).toHaveBeenCalledWith('/listings/123/status', { status: 'sold' })
    })
  })

  describe('delete', () => {
    it('calls DELETE /listings/:id', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await listingsModule.delete('123')
      expect(apiClient.delete).toHaveBeenCalledWith('/listings/123')
    })
  })

  describe('getSellerStorefront', () => {
    it('calls GET /listings/seller/:sellerId', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      const params = { page: 2 }
      await listingsModule.getSellerStorefront('seller1', params)
      expect(apiClient.get).toHaveBeenCalledWith('/listings/seller/seller1', params)
    })
  })

  describe('getCategories', () => {
    it('calls GET /listings/categories', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue([])
      await listingsModule.getCategories()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/categories')
    })
  })

  describe('getCities', () => {
    it('calls GET /listings/cities', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue([])
      await listingsModule.getCities()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/cities')
    })
  })

  describe('presignImage', () => {
    it('calls POST /listings/:id/images/presign', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({})
      await listingsModule.presignImage('123', 2)
      expect(apiClient.post).toHaveBeenCalledWith('/listings/123/images/presign', { index: 2 })
    })
  })
})
