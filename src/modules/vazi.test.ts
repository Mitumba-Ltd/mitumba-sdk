import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { VaziModule } from './vazi'

describe('VaziModule', () => {
  let apiClient: APIClient
  let vaziModule: VaziModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    vaziModule = new VaziModule(apiClient)
  })

  describe('getFeed', () => {
    it('calls GET /vazi/feed with params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ outfits: [], total: 0, limit: 20, offset: 0 })
      const params = { limit: 10, offset: 20 }
      
      await vaziModule.getFeed(params)
      
      expect(apiClient.get).toHaveBeenCalledWith('/vazi/feed', params, undefined)
    })

    it('calls GET /vazi/feed without params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ outfits: [], total: 0, limit: 20, offset: 0 })
      
      await vaziModule.getFeed()
      
      expect(apiClient.get).toHaveBeenCalledWith('/vazi/feed', undefined, undefined)
    })
  })

  describe('getCompleteLook', () => {
    it('calls GET /vazi/complete/:listing_id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ outfits: [] })
      
      await vaziModule.getCompleteLook('lst_123')
      
      expect(apiClient.get).toHaveBeenCalledWith('/vazi/complete/lst_123', undefined, undefined)
    })
  })
})
