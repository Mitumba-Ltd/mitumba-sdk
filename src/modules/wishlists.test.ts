import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { WishlistsModule } from './wishlists'

describe('WishlistsModule', () => {
  let apiClient: APIClient
  let wishlistsModule: WishlistsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    wishlistsModule = new WishlistsModule(apiClient)
  })

  describe('list', () => {
    it('calls GET /listings/wishlists', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await wishlistsModule.list()
      expect(apiClient.get).toHaveBeenCalledWith('/listings/wishlists', undefined, undefined)
    })
  })

  describe('add', () => {
    it('calls POST /listings/wishlists/:listingId', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await wishlistsModule.add('lst_1')
      expect(apiClient.post).toHaveBeenCalledWith('/listings/wishlists/lst_1', undefined, undefined)
    })
  })

  describe('remove', () => {
    it('calls DELETE /listings/wishlists/:listingId', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await wishlistsModule.remove('lst_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/listings/wishlists/lst_1', undefined, undefined)
    })
  })
})
