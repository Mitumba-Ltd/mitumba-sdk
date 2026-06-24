import { APIClient } from '../client'
import type {
  BlockedIp, SystemStats, AdminUserListItem, AdminUserDetail, AdminStoreListItem,
  AdminStoreDetail, AdminVerificationItem, StiEvent, AdminListingItem,
  AdminOrderListItem, AdminOrderDetail, AdminPayoutItem, AdminReport,
  AdminVaziOutfit, RequestOptions,
} from '../types'

export class AdminModule {
  constructor(private readonly client: APIClient) {}

  // ── IP Blocking ──

  async blockIp(ip: string, durationHours?: number, options?: RequestOptions): Promise<{ ok: true; blocked: string; hours: number }> {
    return this.client.post<{ ok: true; blocked: string; hours: number }>('/admin/block-ip', { ip, duration_hours: durationHours ?? 24 }, options)
  }

  async unblockIp(ip: string, options?: RequestOptions): Promise<{ ok: true; unblocked: string }> {
    return this.client.post<{ ok: true; unblocked: string }>('/admin/unblock-ip', { ip }, options)
  }

  async getBlockedIps(options?: RequestOptions): Promise<{ data: BlockedIp[] }> {
    return this.client.get<{ data: BlockedIp[] }>('/admin/blocked-ips', undefined, options)
  }

  // ── Stats ──

  async getSystemStats(options?: RequestOptions): Promise<SystemStats> {
    return this.client.get<SystemStats>('/admin/stats', undefined, options)
  }

  async getStatsTimeseries(params?: { metric?: 'orders' | 'gmv' | 'users'; days?: number }, options?: RequestOptions): Promise<{ metric: string; days: number; data: { day: string; value: number }[] }> {
    return this.client.get<{ metric: string; days: number; data: { day: string; value: number }[] }>('/admin/stats/timeseries', params as Record<string, string | number | boolean | undefined>, options)
  }

  async getStatsByCity(options?: RequestOptions): Promise<{ data: { city: string; orders: number; gmv: number }[] }> {
    return this.client.get<{ data: { city: string; orders: number; gmv: number }[] }>('/admin/stats/by-city', undefined, options)
  }

  // ── Users ──

  async listUsers(params?: { q?: string; page?: number }, options?: RequestOptions): Promise<{ data: AdminUserListItem[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminUserListItem[]; page: number; page_size: number }>('/admin/users', params as Record<string, string | number | boolean | undefined>, options)
  }

  async getUser(userId: string, options?: RequestOptions): Promise<AdminUserDetail> {
    return this.client.get<AdminUserDetail>(`/admin/users/${userId}`, undefined, options)
  }

  async suspendUser(userId: string, reason: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/users/${userId}/suspend`, { reason }, options)
  }

  async unsuspendUser(userId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/users/${userId}/unsuspend`, undefined, options)
  }

  async setUserRole(userId: string, role: string, action: 'grant' | 'revoke', options?: RequestOptions): Promise<{ ok: true; roles: string[] }> {
    return this.client.post<{ ok: true; roles: string[] }>(`/admin/users/${userId}/roles`, { role, action }, options)
  }

  async revokeUserSessions(userId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/users/${userId}/revoke-sessions`, undefined, options)
  }

  // ── Stores ──

  async listStores(params?: { q?: string; verified?: 0 | 1; tier?: 'free' | 'pro'; page?: number }, options?: RequestOptions): Promise<{ data: AdminStoreListItem[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminStoreListItem[]; page: number; page_size: number }>('/admin/stores', params as Record<string, string | number | boolean | undefined>, options)
  }

  async getStore(storeId: string, options?: RequestOptions): Promise<AdminStoreDetail> {
    return this.client.get<AdminStoreDetail>(`/admin/stores/${storeId}`, undefined, options)
  }

  async verifyStore(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/stores/${storeId}/verify`, undefined, options)
  }

  async unverifyStore(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/stores/${storeId}/unverify`, undefined, options)
  }

  // ── Verification Queue ──

  async listVerifications(params?: { status?: 'pending' | 'verified' | 'rejected' | 'unverified'; page?: number }, options?: RequestOptions): Promise<{ data: AdminVerificationItem[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminVerificationItem[]; page: number; page_size: number }>('/admin/verifications', params as Record<string, string | number | boolean | undefined>, options)
  }

  async approveVerification(userId: string, options?: RequestOptions): Promise<{ ok: true; verification_status: 'verified' }> {
    return this.client.post<{ ok: true; verification_status: 'verified' }>(`/admin/verifications/${userId}/approve`, undefined, options)
  }

  async rejectVerification(userId: string, reason?: string, options?: RequestOptions): Promise<{ ok: true; verification_status: 'rejected' }> {
    return this.client.post<{ ok: true; verification_status: 'rejected' }>(`/admin/verifications/${userId}/reject`, reason ? { reason } : undefined, options)
  }

  // ── STI ──

  async adjustSti(userId: string, input: { score?: number; delta?: number; reason: string }, options?: RequestOptions): Promise<{ ok: true; score_before: number; score_after: number }> {
    return this.client.post<{ ok: true; score_before: number; score_after: number }>(`/admin/sellers/${userId}/sti`, input, options)
  }

  async getStiEvents(userId: string, params?: { page?: number }, options?: RequestOptions): Promise<{ data: StiEvent[]; page: number; page_size: number }> {
    return this.client.get<{ data: StiEvent[]; page: number; page_size: number }>(`/admin/sellers/${userId}/sti-events`, params as Record<string, string | number | boolean | undefined>, options)
  }

  // ── Listings Moderation ──

  async listListings(params?: { status?: string; photo_verified?: 0 | 1; page?: number }, options?: RequestOptions): Promise<{ data: AdminListingItem[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminListingItem[]; page: number; page_size: number }>('/admin/listings', params as Record<string, string | number | boolean | undefined>, options)
  }

  async removeListing(listingId: string, reason?: string, options?: RequestOptions): Promise<{ ok: true; status: 'removed' }> {
    return this.client.post<{ ok: true; status: 'removed' }>(`/admin/listings/${listingId}/remove`, reason ? { reason } : undefined, options)
  }

  async reinstateListing(listingId: string, options?: RequestOptions): Promise<{ ok: true; status: 'active' }> {
    return this.client.post<{ ok: true; status: 'active' }>(`/admin/listings/${listingId}/reinstate`, undefined, options)
  }

  // ── Orders ──

  async listOrders(params?: { status?: string; q?: string; page?: number }, options?: RequestOptions): Promise<{ data: AdminOrderListItem[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminOrderListItem[]; page: number; page_size: number }>('/admin/orders', params as Record<string, string | number | boolean | undefined>, options)
  }

  async getOrder(orderId: string, options?: RequestOptions): Promise<AdminOrderDetail> {
    return this.client.get<AdminOrderDetail>(`/admin/orders/${orderId}`, undefined, options)
  }

  async forceTransitionOrder(orderId: string, status: string, note?: string, options?: RequestOptions): Promise<{ ok: true; status: string }> {
    return this.client.post<{ ok: true; status: string }>(`/admin/orders/${orderId}/transition`, { status, note }, options)
  }

  // ── Payouts ──

  async getPayoutSummary(options?: RequestOptions): Promise<{ owed: number; held: number; sent_today: number }> {
    return this.client.get<{ owed: number; held: number; sent_today: number }>('/admin/payouts/summary', undefined, options)
  }

  async listPayouts(params?: { status?: 'pending' | 'sent' | 'failed'; on_hold?: 0 | 1; page?: number }, options?: RequestOptions): Promise<{ data: AdminPayoutItem[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminPayoutItem[]; page: number; page_size: number }>('/admin/payouts', params as Record<string, string | number | boolean | undefined>, options)
  }

  async disbursePayout(payoutId: string, options?: RequestOptions): Promise<{ ok: true; result: unknown }> {
    return this.client.post<{ ok: true; result: unknown }>(`/admin/payouts/${payoutId}/disburse`, undefined, options)
  }

  // ── Reports Moderation ──

  async listReports(params?: { status?: 'open' | 'reviewed' | 'dismissed' | 'actioned'; type?: 'listing' | 'review' | 'store' | 'user'; page?: number }, options?: RequestOptions): Promise<{ data: AdminReport[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminReport[]; page: number; page_size: number }>('/admin/reports', params as Record<string, string | number | boolean | undefined>, options)
  }

  async resolveReport(reportId: string, status: 'reviewed' | 'dismissed' | 'actioned', note?: string, options?: RequestOptions): Promise<{ ok: true; status: string }> {
    return this.client.post<{ ok: true; status: string }>(`/admin/reports/${reportId}/resolve`, { status, note }, options)
  }

  // ── Review Moderation ──

  async removeReview(reviewId: string, reason?: string, options?: RequestOptions): Promise<{ ok: true; hidden: true }> {
    return this.client.post<{ ok: true; hidden: true }>(`/admin/reviews/${reviewId}/remove`, reason ? { reason } : undefined, options)
  }

  async reinstateReview(reviewId: string, options?: RequestOptions): Promise<{ ok: true; hidden: false }> {
    return this.client.post<{ ok: true; hidden: false }>(`/admin/reviews/${reviewId}/reinstate`, undefined, options)
  }

  // ── VAZI Moderation ──

  async listVaziOutfits(params?: { page?: number }, options?: RequestOptions): Promise<{ data: AdminVaziOutfit[]; page: number; page_size: number }> {
    return this.client.get<{ data: AdminVaziOutfit[]; page: number; page_size: number }>('/admin/vazi/outfits', params as Record<string, string | number | boolean | undefined>, options)
  }

  async removeVaziOutfit(outfitId: string, reason?: string, options?: RequestOptions): Promise<{ ok: true; removed: true }> {
    return this.client.post<{ ok: true; removed: true }>(`/admin/vazi/outfits/${outfitId}/remove`, reason ? { reason } : undefined, options)
  }

  async reinstateVaziOutfit(outfitId: string, options?: RequestOptions): Promise<{ ok: true; removed: false }> {
    return this.client.post<{ ok: true; removed: false }>(`/admin/vazi/outfits/${outfitId}/reinstate`, undefined, options)
  }

  // ── Broadcast ──

  async broadcast(input: { title: string; body: string; segment?: 'all' | 'sellers' | 'buyers' }, options?: RequestOptions): Promise<{ ok: true; segment: string; recipients: number }> {
    return this.client.post<{ ok: true; segment: string; recipients: number }>('/admin/broadcast', input, options)
  }
}
