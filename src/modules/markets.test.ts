import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { MarketsModule } from './markets'
import type { MarketsResponse } from '../types'

describe('MarketsModule', () => {
  let apiClient: APIClient
  let marketsModule: MarketsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    marketsModule = new MarketsModule(apiClient)
  })

  describe('list', () => {
    it('calls GET /markets and returns the registry', async () => {
      const body: MarketsResponse = { version: 1, markets: [], updated_at: '2026-01-01T00:00:00Z' }
      vi.spyOn(apiClient, 'get').mockResolvedValue(body)

      await expect(marketsModule.list()).resolves.toBe(body)
      expect(apiClient.get).toHaveBeenCalledWith('/markets', undefined, undefined)
    })

    it('forwards request options', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ version: 1, markets: [], updated_at: '' })
      const controller = new AbortController()

      await marketsModule.list({ signal: controller.signal })

      expect(apiClient.get).toHaveBeenCalledWith('/markets', undefined, { signal: controller.signal })
    })

    it('propagates a failure instead of returning a partial registry', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('network down'))

      await expect(marketsModule.list()).rejects.toThrow('network down')
    })
  })
})
