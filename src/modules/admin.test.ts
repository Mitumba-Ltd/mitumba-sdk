import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { AdminModule } from './admin'
import { MemoryTokenStore } from '../token-store'

describe('AdminModule', () => {
  let apiClient: APIClient
  let admin: AdminModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(apiClient)
  })

  describe('blockIp', () => {
    it('calls POST /admin/block-ip with default duration', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, blocked: '1.2.3.4', hours: 24 })
      const result = await admin.blockIp('1.2.3.4')
      expect(apiClient.post).toHaveBeenCalledWith('/admin/block-ip', { ip: '1.2.3.4', duration_hours: 24 }, undefined)
      expect(result).toEqual({ ok: true, blocked: '1.2.3.4', hours: 24 })
    })

    it('calls POST /admin/block-ip with custom duration', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, blocked: '1.2.3.4', hours: 72 })
      await admin.blockIp('1.2.3.4', 72)
      expect(apiClient.post).toHaveBeenCalledWith('/admin/block-ip', { ip: '1.2.3.4', duration_hours: 72 }, undefined)
    })
  })

  describe('unblockIp', () => {
    it('calls POST /admin/unblock-ip', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, unblocked: '1.2.3.4' })
      await admin.unblockIp('1.2.3.4')
      expect(apiClient.post).toHaveBeenCalledWith('/admin/unblock-ip', { ip: '1.2.3.4' }, undefined)
    })
  })

  describe('getBlockedIps', () => {
    it('calls GET /admin/blocked-ips', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await admin.getBlockedIps()
      expect(apiClient.get).toHaveBeenCalledWith('/admin/blocked-ips', undefined, undefined)
    })
  })

  describe('getSystemStats', () => {
    it('calls GET /admin/stats', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await admin.getSystemStats()
      expect(apiClient.get).toHaveBeenCalledWith('/admin/stats', undefined, undefined)
    })
  })

  describe('suspendUser', () => {
    it('calls POST /admin/users/:id/suspend', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await admin.suspendUser('user_1', 'spam')
      expect(apiClient.post).toHaveBeenCalledWith('/admin/users/user_1/suspend', { reason: 'spam' }, undefined)
    })
  })

  describe('unsuspendUser', () => {
    it('calls POST /admin/users/:id/unsuspend', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await admin.unsuspendUser('user_1')
      expect(apiClient.post).toHaveBeenCalledWith('/admin/users/user_1/unsuspend', undefined, undefined)
    })
  })

  describe('verifyStore', () => {
    it('calls POST /admin/stores/:id/verify', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await admin.verifyStore('store_1')
      expect(apiClient.post).toHaveBeenCalledWith('/admin/stores/store_1/verify', undefined, undefined)
    })
  })

  describe('unverifyStore', () => {
    it('calls POST /admin/stores/:id/unverify', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await admin.unverifyStore('store_1')
      expect(apiClient.post).toHaveBeenCalledWith('/admin/stores/store_1/unverify', undefined, undefined)
    })
  })
})
