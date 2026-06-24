import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { ReportsModule } from './reports'
import { MemoryTokenStore } from '../token-store'

describe('ReportsModule', () => {
  let apiClient: APIClient
  let reports: ReportsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    reports = new ReportsModule(apiClient)
  })

  describe('create', () => {
    it('calls POST /listings/reports', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      const input = { target_type: 'listing' as const, target_id: 'lst_1', reason: 'spam' as const, detail: 'Fake listing' }
      const result = await reports.create(input)
      expect(apiClient.post).toHaveBeenCalledWith('/listings/reports', input, undefined)
      expect(result).toEqual({ ok: true })
    })

    it('handles already_reported response', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, already_reported: true })
      const input = { target_type: 'store' as const, target_id: 's_1', reason: 'scam' as const }
      const result = await reports.create(input)
      expect(result).toEqual({ ok: true, already_reported: true })
    })
  })
})
