import { APIClient } from '../client'
import type { BlockedIp, SystemStats, RequestOptions } from '../types'

export class AdminModule {
  constructor(private readonly client: APIClient) {}

  /** Block an IP address. Default duration: 24 hours. */
  async blockIp(ip: string, durationHours?: number, options?: RequestOptions): Promise<{ ok: true; blocked: string; hours: number }> {
    return this.client.post<{ ok: true; blocked: string; hours: number }>('/admin/block-ip', { ip, duration_hours: durationHours ?? 24 }, options)
  }

  /** Unblock an IP address. */
  async unblockIp(ip: string, options?: RequestOptions): Promise<{ ok: true; unblocked: string }> {
    return this.client.post<{ ok: true; unblocked: string }>('/admin/unblock-ip', { ip }, options)
  }

  /** List currently blocked IPs. */
  async getBlockedIps(options?: RequestOptions): Promise<{ data: BlockedIp[] }> {
    return this.client.get<{ data: BlockedIp[] }>('/admin/blocked-ips', undefined, options)
  }

  /** Get platform-wide statistics. */
  async getSystemStats(options?: RequestOptions): Promise<SystemStats> {
    return this.client.get<SystemStats>('/admin/stats', undefined, options)
  }

  /** Suspend a user account. */
  async suspendUser(userId: string, reason: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/users/${userId}/suspend`, { reason }, options)
  }

  /** Unsuspend a user account. */
  async unsuspendUser(userId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/users/${userId}/unsuspend`, undefined, options)
  }

  /** Grant verified badge to a store. */
  async verifyStore(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/stores/${storeId}/verify`, undefined, options)
  }

  /** Revoke verified badge from a store. */
  async unverifyStore(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/stores/${storeId}/unverify`, undefined, options)
  }
}
