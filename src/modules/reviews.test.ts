import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { ReviewsModule } from './reviews'

describe('ReviewsModule', () => {
  let apiClient: APIClient
  let reviewsModule: ReviewsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    reviewsModule = new ReviewsModule(apiClient)
  })

  describe('list', () => {
    it('calls GET /listings/stores/:storeId/reviews without page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], total: 0, avg_rating: 0, page: 1 })
      await reviewsModule.list('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/reviews', undefined, undefined)
    })

    it('calls GET /listings/stores/:storeId/reviews with page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], total: 0, avg_rating: 0, page: 2 })
      await reviewsModule.list('store_1', 2)
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/reviews', { page: 2 }, undefined)
    })
  })

  describe('create', () => {
    it('calls POST /listings/stores/:storeId/reviews', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'rev_1' })
      const input = { rating: 5, comment: 'Great store!' }
      const result = await reviewsModule.create('store_1', input)
      expect(apiClient.post).toHaveBeenCalledWith('/listings/stores/store_1/reviews', input, undefined)
      expect(result).toEqual({ id: 'rev_1' })
    })
  })

  describe('getReviewableOrders', () => {
    it('calls GET /listings/stores/:storeId/reviews/eligible', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await reviewsModule.getReviewableOrders('store_1')
      expect(apiClient.get).toHaveBeenCalledWith('/listings/stores/store_1/reviews/eligible', undefined, undefined)
    })
  })
})
