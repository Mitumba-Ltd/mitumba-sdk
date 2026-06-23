import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { DisputesModule } from './disputes'
import { MemoryTokenStore } from '../token-store'

describe('DisputesModule', () => {
  let apiClient: APIClient
  let disputes: DisputesModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    disputes = new DisputesModule(apiClient)
  })

  describe('raise', () => {
    it('calls POST /orders/:orderId/dispute', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ dispute_id: 'd_1', status: 'open' })
      const input = { reason: 'damaged' as const, description: 'Item arrived broken', desired_resolution: 'refund' as const }
      const result = await disputes.raise('ord_1', input)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/ord_1/dispute', input, undefined)
      expect(result).toEqual({ dispute_id: 'd_1', status: 'open' })
    })
  })

  describe('getForOrder', () => {
    it('calls GET /orders/:orderId/dispute', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await disputes.getForOrder('ord_1')
      expect(apiClient.get).toHaveBeenCalledWith('/orders/ord_1/dispute', undefined, undefined)
    })
  })

  describe('get', () => {
    it('calls GET /orders/disputes/:disputeId', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await disputes.get('d_1')
      expect(apiClient.get).toHaveBeenCalledWith('/orders/disputes/d_1', undefined, undefined)
    })
  })

  describe('addEvidence', () => {
    it('calls POST /orders/disputes/:id/evidence', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await disputes.addEvidence('d_1', { type: 'image', content: 'https://cdn.mitumba.stanl.ink/evidence.jpg' })
      expect(apiClient.post).toHaveBeenCalledWith('/orders/disputes/d_1/evidence', { type: 'image', content: 'https://cdn.mitumba.stanl.ink/evidence.jpg' }, undefined)
    })
  })

  describe('escalate', () => {
    it('calls POST /orders/disputes/:id/escalate', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'under_review' })
      await disputes.escalate('d_1')
      expect(apiClient.post).toHaveBeenCalledWith('/orders/disputes/d_1/escalate', undefined, undefined)
    })
  })

  describe('withdraw', () => {
    it('calls POST /orders/disputes/:id/withdraw', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'withdrawn' })
      await disputes.withdraw('d_1')
      expect(apiClient.post).toHaveBeenCalledWith('/orders/disputes/d_1/withdraw', undefined, undefined)
    })
  })

  describe('respond', () => {
    it('calls POST /orders/disputes/:id/respond', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, voluntary: true })
      const input = { accept: true, message: 'I agree to refund' }
      await disputes.respond('d_1', input)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/disputes/d_1/respond', input, undefined)
    })
  })

  describe('list', () => {
    it('calls GET /orders/disputes with params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], page: 1, page_size: 20 })
      await disputes.list({ status: 'open', page: 2 })
      expect(apiClient.get).toHaveBeenCalledWith('/orders/disputes', { status: 'open', page: 2 }, undefined)
    })
  })

  describe('resolve', () => {
    it('calls POST /orders/disputes/:id/resolve', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'resolved_refund', sti_impact: -5 })
      const input = { resolution: 'refund' as const, note: 'Full refund granted' }
      await disputes.resolve('d_1', input)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/disputes/d_1/resolve', input, undefined)
    })
  })
})
