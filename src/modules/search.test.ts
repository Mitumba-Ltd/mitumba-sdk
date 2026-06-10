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

  describe('query', () => {
    it('calls GET /search with query params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      const params = { q: 'shoes', min_price: 100, sort: 'relevance' as const }
      
      await searchModule.query(params)
      
      expect(apiClient.get).toHaveBeenCalledWith('/search', params, undefined)
    })
  })

  describe('trending', () => {
    it('calls GET /search/trending without params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ terms: [] })
      
      await searchModule.trending()
      
      expect(apiClient.get).toHaveBeenCalledWith('/search/trending', undefined, undefined)
    })

    it('calls GET /search/trending with city_id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ terms: [] })
      
      await searchModule.trending({ city_id: 'nbi' })
      
      expect(apiClient.get).toHaveBeenCalledWith('/search/trending', { city_id: 'nbi' }, undefined)
    })
  })
})
