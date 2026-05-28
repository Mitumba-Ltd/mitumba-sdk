import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { SearchModule } from './search'

describe('SearchModule', () => {
  let apiClient: APIClient
  let searchModule: SearchModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    searchModule = new SearchModule(apiClient)
  })

  describe('search', () => {
    it('calls GET /search with query params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      const params = { q: 'shoes', min_price: 100, sort: 'relevance' as const }
      
      await searchModule.search(params)
      
      expect(apiClient.get).toHaveBeenCalledWith('/search', params)
    })
  })

  describe('getTrending', () => {
    it('calls GET /search/trending without city_id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ terms: [] })
      
      await searchModule.getTrending()
      
      expect(apiClient.get).toHaveBeenCalledWith('/search/trending', undefined)
    })

    it('calls GET /search/trending with city_id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ terms: [] })
      
      await searchModule.getTrending('nbi')
      
      expect(apiClient.get).toHaveBeenCalledWith('/search/trending', { city_id: 'nbi' })
    })
  })
})
