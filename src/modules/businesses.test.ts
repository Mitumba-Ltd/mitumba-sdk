import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { BusinessesModule } from './businesses'

describe('BusinessesModule', () => {
  let apiClient: APIClient
  let businesses: BusinessesModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    businesses = new BusinessesModule(apiClient)
  })

  describe('getMine', () => {
    it('calls GET /listings/businesses/mine', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await businesses.getMine()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/businesses/mine', undefined, undefined)
    })
  })

  describe('getById', () => {
    it('calls GET /listings/businesses/:id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await businesses.getById('biz_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/businesses/biz_1', undefined, undefined)
    })
  })

  describe('update', () => {
    it('calls PUT /listings/businesses/:id', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({ ok: true })
      const input = { name: 'New Name', county: 'Mombasa' }
      await businesses.update('biz_1', input)
      expect(apiClient.put).toHaveBeenCalledWith('/listings/businesses/biz_1', input, undefined)
    })
  })
})
