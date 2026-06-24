import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { UploadsModule } from './uploads'
import { MemoryTokenStore } from '../token-store'

describe('UploadsModule', () => {
  let apiClient: APIClient
  let uploads: UploadsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    uploads = new UploadsModule(apiClient)
  })

  describe('upload', () => {
    it('calls POST /listings/uploads with FormData', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ url: 'https://cdn.mitumba.stanl.ink/uploads/user/img.png' })
      const file = new Blob(['img'], { type: 'image/png' })
      const result = await uploads.upload(file)
      expect(apiClient.post).toHaveBeenCalledWith('/listings/uploads', expect.any(FormData), undefined)
      expect(result).toEqual({ url: 'https://cdn.mitumba.stanl.ink/uploads/user/img.png' })
    })
  })
})
