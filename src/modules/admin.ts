import { APIClient } from '../client'
import type {
  BlockedIp, SystemStats, AdminUserListItem, AdminUserDetail, AdminStoreListItem,
  AdminStoreDetail, AdminVerificationItem, StiEvent, AdminListingItem,
  AdminOrderListItem, AdminOrderDetail, AdminPayoutItem, AdminReport,
  AdminVaziOutfit, RequestOptions, AdminPermission, AdminRolePreset,
  AdminPermissionDescription, AdminOperator, AdminAuditEntry, AdminAuditQuery, PendingPayoutApproval,
  AdminWholesalePendingStore, OAuthClientSummary, OAuthClient, RegisterOAuthClientInput,
  RegisteredOAuthClient, OidcSigningKey, LibraryDocument, LibraryListing, LibraryOccurrenceRecorded,
  AdminMessageReportList, AdminMessageReportDetail, MessageReportStatus, ResolveMessageReportInput, ResolveMessageReportResult,
  PlatformSetting, PlatformSettingDetail, ChangePlatformSettingInput, ChangePlatformSettingResult,
} from '../types'

export class AdminModule {
  constructor(private readonly client: APIClient) {}

  // ── IP Blocking ──

  /**
   * @deprecated Pass a reason as the second argument. Kept source-compatible because the method was
   * already published, even though the endpoint did not exist at the time.
   */
  async blockIp(ip: string, durationHours?: number, options?: RequestOptions): Promise<{ ok: true; blocked: string; hours: number; expires_at: string; note: string }>
  async blockIp(ip: string, reason: string, durationHours?: number, options?: RequestOptions): Promise<{ ok: true; blocked: string; hours: number; expires_at: string; note: string }>
  async blockIp(
    ip: string,
    reasonOrDuration: string | number = 24,
    durationOrOptions?: number | RequestOptions,
    maybeOptions?: RequestOptions,
  ): Promise<{ ok: true; blocked: string; hours: number; expires_at: string; note: string }> {
    const modern = typeof reasonOrDuration === 'string'
    const reason = modern ? reasonOrDuration : 'No reason supplied by legacy SDK caller'
    const durationHours = modern
      ? (typeof durationOrOptions === 'number' ? durationOrOptions : 24)
      : reasonOrDuration
    const options = modern
      ? (typeof durationOrOptions === 'object' ? durationOrOptions : maybeOptions)
      : (typeof durationOrOptions === 'object' ? durationOrOptions : undefined)

    return this.client.post<{ ok: true; blocked: string; hours: number; expires_at: string; note: string }>(
      '/admin/block-ip',
      { ip, reason, duration_hours: durationHours },
      options,
    )
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

  /** Stores, newest first. `seller_id` lists one seller's stores (exact match). */
  async listStores(params?: { q?: string; seller_id?: string; verified?: 0 | 1; tier?: 'free' | 'pro'; page?: number }, options?: RequestOptions): Promise<{ data: AdminStoreListItem[]; page: number; page_size: number }> {
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

  async listPayouts(params?: { status?: 'pending' | 'sent' | 'failed'; on_hold?: 0 | 1; needs_correlation?: 0 | 1; page?: number }, options?: RequestOptions): Promise<{ data: AdminPayoutItem[]; page: number; page_size: number }> {
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

  // ── Messaging safety reports ──

  /**
   * The messaging safety queue: reported conversations and messages, oldest first, 25 per page.
   * Each report carries the reported side's recent risk signals and a `priority` derived from them;
   * priority orders the queue and decides nothing. Requires `admin:read`.
   */
  async listMessageReports(params?: { status?: MessageReportStatus; page?: number }, options?: RequestOptions): Promise<AdminMessageReportList> {
    return this.client.get<AdminMessageReportList>('/admin/message-reports', params as Record<string, string | number | boolean | undefined>, options)
  }

  /**
   * Open one report for review: the report, up to 100 messages of its thread as delivered, and the
   * unmasked original of the reported message when one exists and may be released. Requires
   * `audit:read` and a recent passkey sign-in (403 `reauthentication_required` otherwise). Opening a
   * report is recorded on the audit trail.
   */
  async getMessageReport(reportId: string, options?: RequestOptions): Promise<AdminMessageReportDetail> {
    return this.client.get<AdminMessageReportDetail>(`/admin/message-reports/${encodeURIComponent(reportId)}`, undefined, options)
  }

  /**
   * Resolve an open report. `upheld` records a risk signal against the reported side. Requires
   * `listings:moderate`. Resolving with the same status and outcome again is a safe retry
   * (`deduplicated: true`); a different resolution of an already resolved report is 409.
   */
  async resolveMessageReport(reportId: string, input: ResolveMessageReportInput, options?: RequestOptions): Promise<ResolveMessageReportResult> {
    return this.client.post<ResolveMessageReportResult>(`/admin/message-reports/${encodeURIComponent(reportId)}/resolve`, input, options)
  }

  // ── Platform settings ──

  /** Every platform setting with its current value and whether it can be changed here. Requires `admin:read`. */
  async listSettings(options?: RequestOptions): Promise<{ settings: PlatformSetting[] }> {
    return this.client.get<{ settings: PlatformSetting[] }>('/admin/settings', undefined, options)
  }

  /** One setting and its change history, newest first. Requires `admin:read`. */
  async getSetting(key: string, options?: RequestOptions): Promise<PlatformSettingDetail> {
    return this.client.get<PlatformSettingDetail>(`/admin/settings/${encodeURIComponent(key)}`, undefined, options)
  }

  /**
   * Change an editable setting. Requires `roles:grant` and a recent passkey (403
   * `reauthentication_required` otherwise). Errors: 403 `not_editable` for payment and messaging
   * settings, 400 `invalid_value`, 409 `would_lock_you_out` when an operator-domain change would
   * remove the caller's own domain. Recorded on the audit trail as `config.changed`.
   */
  async changeSetting(key: string, input: ChangePlatformSettingInput, options?: RequestOptions): Promise<ChangePlatformSettingResult> {
    return this.client.put<ChangePlatformSettingResult>(`/admin/settings/${encodeURIComponent(key)}`, input, options)
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

  // ── Operators, roles, and audit ──

  async listOperators(options?: RequestOptions): Promise<{ operators: AdminOperator[] }> {
    return this.client.get<{ operators: AdminOperator[] }>('/admin/operators', undefined, options)
  }

  async listAdminRoles(options?: RequestOptions): Promise<{ roles: AdminRolePreset[]; permissions: AdminPermissionDescription[] }> {
    return this.client.get<{ roles: AdminRolePreset[]; permissions: AdminPermissionDescription[] }>('/admin/roles', undefined, options)
  }

  async grantOperatorPermission(userId: string, permission: AdminPermission, options?: RequestOptions): Promise<{ ok: true; already_held: boolean }> {
    return this.client.post<{ ok: true; already_held: boolean }>(`/admin/operators/${userId}/permissions`, { permission }, options)
  }

  async revokeOperatorPermission(userId: string, permission: AdminPermission, options?: RequestOptions): Promise<{ ok: true; note: string }> {
    return this.client.delete<{ ok: true; note: string }>(`/admin/operators/${userId}/permissions/${encodeURIComponent(permission)}`, undefined, options)
  }

  async grantOperatorRole(userId: string, role: string, options?: RequestOptions): Promise<{ ok: true; role: string; granted: AdminPermission[]; already_held: AdminPermission[] }> {
    return this.client.post<{ ok: true; role: string; granted: AdminPermission[]; already_held: AdminPermission[] }>(`/admin/operators/${userId}/roles`, { role }, options)
  }

  async getAuditLog(limit = 100, options?: RequestOptions): Promise<{ entries: AdminAuditEntry[] }> {
    return this.client.get<{ entries: AdminAuditEntry[] }>('/admin/audit', { limit }, options)
  }

  /**
   * The attributed, filterable audit trail, newest first. Pass `next_cursor` back as `before` for
   * the next page; it is null on the last page.
   */
  async listAuditLog(query: AdminAuditQuery = {}, options?: RequestOptions): Promise<{ entries: AdminAuditEntry[]; next_cursor: string | null }> {
    return this.client.get<{ entries: AdminAuditEntry[]; next_cursor: string | null }>('/admin/audit', query as Record<string, string | number | boolean | undefined>, options)
  }

  // ── Identity provider: sign-in clients (requires clients:manage) ──

  /** Every registered sign-in client, oldest first. Secrets are never included. */
  async listOAuthClients(options?: RequestOptions): Promise<{ clients: OAuthClientSummary[] }> {
    return this.client.get<{ clients: OAuthClientSummary[] }>('/admin/clients', undefined, options)
  }

  /** One client with its redirect-URI allow-list and permitted scopes. */
  async getOAuthClient(clientId: string, options?: RequestOptions): Promise<OAuthClient> {
    return this.client.get<OAuthClient>(`/admin/clients/${encodeURIComponent(clientId)}`, undefined, options)
  }

  /**
   * Register a client. A confidential client's `client_secret` is in this response only — it is
   * stored hashed and cannot be retrieved again, so hand it to the client's owner immediately.
   */
  async registerOAuthClient(input: RegisterOAuthClientInput, options?: RequestOptions): Promise<RegisteredOAuthClient> {
    return this.client.post<RegisteredOAuthClient>('/admin/clients', input, options)
  }

  /** Stop a client authorising. Clients are deactivated, never deleted, so their history stays auditable. */
  async deactivateOAuthClient(clientId: string, options?: RequestOptions): Promise<{ ok: true; is_active: false }> {
    return this.client.post<{ ok: true; is_active: false }>(`/admin/clients/${encodeURIComponent(clientId)}/deactivate`, undefined, options)
  }

  /** Replace a client's whole redirect-URI allow-list. URIs match exactly: no wildcards or prefixes. */
  async setOAuthClientRedirectUris(clientId: string, redirectUris: string[], options?: RequestOptions): Promise<{ ok: true; redirect_uris: string[] }> {
    return this.client.put<{ ok: true; redirect_uris: string[] }>(`/admin/clients/${encodeURIComponent(clientId)}/redirect-uris`, { redirect_uris: redirectUris }, options)
  }

  /** Replace the set of scopes a client may request. */
  async setOAuthClientScopes(clientId: string, scopes: string[], options?: RequestOptions): Promise<{ ok: true; scopes: string[] }> {
    return this.client.put<{ ok: true; scopes: string[] }>(`/admin/clients/${encodeURIComponent(clientId)}/scopes`, { scopes }, options)
  }

  // ── Identity provider: signing keys (requires oidc:rotate_keys) ──

  /** The signing-key window — current, previous, retired — as metadata only. */
  async listOidcSigningKeys(options?: RequestOptions): Promise<{ keys: OidcSigningKey[] }> {
    return this.client.get<{ keys: OidcSigningKey[] }>('/auth/oidc/keys', undefined, options)
  }

  /**
   * Run the rotation ceremony: a new key becomes current, the current key becomes previous (still
   * verifying), and the old previous is retired. Do not rotate twice within an id_token lifetime
   * (one hour), or tokens signed by the retired key stop verifying.
   */
  async rotateOidcSigningKey(options?: RequestOptions): Promise<{ ok: true; kid: string }> {
    return this.client.post<{ ok: true; kid: string }>('/auth/oidc/keys/rotate', undefined, options)
  }

  // ── Operations library ──

  /**
   * The library documents the caller may read: summaries only, never bodies. Any operator may call
   * this; each document's `audience` decides whether it is listed. `can_read_all` is true for a
   * caller holding `library:read_all`, who sees every document.
   */
  async listLibrary(options?: RequestOptions): Promise<LibraryListing> {
    return this.client.get<LibraryListing>('/admin/library', undefined, options)
  }

  /**
   * One library document with its markdown body. A document the caller may not read is reported
   * exactly like one that does not exist (404).
   */
  async getLibraryDocument(slug: string, options?: RequestOptions): Promise<LibraryDocument> {
    return this.client.get<LibraryDocument>(`/admin/library/${encodeURIComponent(slug)}`, undefined, options)
  }

  /**
   * Record one occurrence of a scheduled routine as done, with an optional note (at most 500
   * characters). Only an operator whose role is in the document's audience may record it
   * (`LibraryDocument.can_record`); the librarian's `library:read_all` alone is not enough.
   *
   * `dueOn` (YYYY-MM-DD) must be one of the routine's due days, no more than 45 days old and no
   * further ahead than its notice. Errors: 403 not in the audience, 404 not readable, 409 already
   * recorded (the body carries the existing `occurrence`), 422 `invalid_occurrence` with a `reason`
   * (`not_scheduled`, `not_a_due_day`, `too_early`, `too_old`). Recorded on the audit trail as
   * `library.routine.completed`.
   */
  async completeLibraryOccurrence(slug: string, dueOn: string, note?: string, options?: RequestOptions): Promise<LibraryOccurrenceRecorded> {
    return this.client.post<LibraryOccurrenceRecorded>(
      `/admin/library/${encodeURIComponent(slug)}/occurrences/${encodeURIComponent(dueOn)}/complete`,
      note ? { note } : {},
      options,
    )
  }
  // ── Payout approval ──

  async listPayoutsAwaitingApproval(options?: RequestOptions): Promise<{ payouts: PendingPayoutApproval[] }> {
    return this.client.get<{ payouts: PendingPayoutApproval[] }>('/admin/payouts/pending-approval', undefined, options)
  }

  async approvePayout(payoutId: string, options?: RequestOptions): Promise<{ ok: true; already_approved: boolean }> {
    return this.client.post<{ ok: true; already_approved: boolean }>(`/admin/payouts/${payoutId}/approve`, undefined, options)
  }

  async holdPayout(payoutId: string, reason: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/payouts/${payoutId}/hold`, { reason }, options)
  }

  /** Repair a Daraja payout whose provider reference failed to persist. */
  async repairPayoutCorrelation(payoutId: string, providerRef: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/payouts/${payoutId}/correlation`, { provider_ref: providerRef }, options)
  }

  // ── Wholesale moderation ──

  async listPendingWholesaleStores(options?: RequestOptions): Promise<{ data: AdminWholesalePendingStore[] }> {
    return this.client.get<{ data: AdminWholesalePendingStore[] }>('/admin/wholesale/pending', undefined, options)
  }

  async verifyWholesaleStore(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/wholesale/stores/${storeId}/verify`, undefined, options)
  }

  async unverifyWholesaleStore(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/admin/wholesale/stores/${storeId}/unverify`, undefined, options)
  }

  /**
   * Wholesale applications by review state: `pending` (the queue, default) or `rejected` (refused,
   * with `review_note`). Supersedes {@link listPendingWholesaleStores}, which lists pending only.
   */
  async listWholesaleApplications(params?: { status?: 'pending' | 'rejected' }, options?: RequestOptions): Promise<{ data: AdminWholesalePendingStore[] }> {
    return this.client.get<{ data: AdminWholesalePendingStore[] }>('/admin/wholesale/pending', params as Record<string, string | number | boolean | undefined>, options)
  }

  /** Refuse a wholesale application. The reason is recorded and shown to the seller, who can resubmit. */
  async rejectWholesaleStore(storeId: string, reason: string, options?: RequestOptions): Promise<{ ok: true; review_status: 'rejected' }> {
    return this.client.post<{ ok: true; review_status: 'rejected' }>(`/admin/wholesale/stores/${encodeURIComponent(storeId)}/reject`, { reason }, options)
  }

  // ── Broadcast ──

  async broadcast(input: { title: string; body: string; segment?: 'all' | 'sellers' | 'buyers' }, options?: RequestOptions): Promise<{ ok: true; segment: string; recipients: number }> {
    return this.client.post<{ ok: true; segment: string; recipients: number }>('/admin/broadcast', input, options)
  }
}
