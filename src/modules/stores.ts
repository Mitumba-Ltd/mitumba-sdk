import { APIClient, APIError } from '../client'
import type {
  AcceptStoreInvitationResult,
  AddPayoutDestinationInput,
  CreateStoreInput,
  FollowedStore,
  InvitableStoreRole,
  InviteToStoreInput,
  InviteToStoreResult,
  Listing,
  PayoutDestinations,
  PayoutDestinationsState,
  ReceivedStoreInvitation,
  RequestOptions,
  SellerVerification,
  RequestStoreLimitInput,
  ShopEarnings,
  ShopPayout,
  ShopPayoutEntriesPage,
  ShopPayoutEntriesParams,
  Store,
  StoreAnalytics,
  StoreAuditPage,
  StoreInvitationListItem,
  StoreLimitState,
  StoreMembers,
  StoreMembershipFields,
  StoreSettings,
  StoreStats,
  UpdateStoreInput,
} from '../types'

export class StoresModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Get a store by its URL slug.
   */
  async getBySlug(slug: string, options?: RequestOptions): Promise<Store> {
    return this.client.get<Store>(`/listings/stores/${slug}`, undefined, options)
  }

  /**
   * Follow a store.
   */
  async follow(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/listings/stores/${storeId}/follow`, undefined, options)
  }

  /**
   * Unfollow a store.
   */
  async unfollow(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/listings/stores/${storeId}/follow`, undefined, options)
  }

  /**
   * Get paginated listings for a specific store.
   */
  async getListings(storeId: string, page?: number, options?: RequestOptions): Promise<{ data: Listing[] }> {
    return this.client.get<{ data: Listing[] }>(
      `/listings/stores/${storeId}/listings`,
      page !== undefined ? { page } : undefined,
      options
    )
  }

  /**
   * The shops the authenticated user works in, owned or joined, each with their role in it and the
   * permissions it grants. Show only the actions those permissions allow.
   */
  async getMyStores(options?: RequestOptions): Promise<{ data: Array<Store & StoreMembershipFields> }> {
    return this.client.get<{ data: Array<Store & StoreMembershipFields> }>('/listings/stores/mine', undefined, options)
  }

  /**
   * Get stores the authenticated user follows.
   */
  async getFollowing(params?: { page?: number }, options?: RequestOptions): Promise<{ data: FollowedStore[]; page: number; page_size: number }> {
    return this.client.get<{ data: FollowedStore[]; page: number; page_size: number }>(
      '/listings/stores/following',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * Create a new store.
   */
  async create(input: CreateStoreInput, options?: RequestOptions): Promise<{ id: string; slug: string }> {
    return this.client.post<{ id: string; slug: string }>('/listings/stores', input, options)
  }

  /**
   * Update a store's details.
   */
  async update(storeId: string, input: UpdateStoreInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/listings/stores/${storeId}`, input, options)
  }

  /**
   * Get store statistics.
   */
  async getStats(storeId: string, options?: RequestOptions): Promise<StoreStats> {
    return this.client.get<StoreStats>(`/listings/stores/${storeId}/stats`, undefined, options)
  }

  /** Where the shop owner's identity verification stands. Owner only (403 otherwise). */
  async getVerification(storeId: string, options?: RequestOptions): Promise<SellerVerification> {
    return this.client.get<SellerVerification>(`/listings/stores/${storeId}/verification`, undefined, options)
  }

  /**
   * Submit an identity document for review: upload it first with `documents.upload` (purpose
   * `identity_document`, this store). Owner only. 400 `invalid_document` for any other document,
   * 409 `already_verified` or `no_seller_profile`.
   */
  async submitVerification(storeId: string, documentId: string, options?: RequestOptions): Promise<SellerVerification> {
    return this.client.post<SellerVerification>(`/listings/stores/${storeId}/verification`, { document_id: documentId }, options)
  }

  /**
   * Get store settings.
   */
  async getSettings(storeId: string, options?: RequestOptions): Promise<StoreSettings> {
    return this.client.get<StoreSettings>(`/listings/stores/${storeId}/settings`, undefined, options)
  }

  /**
   * Update store settings (partial).
   */
  async updateSettings(storeId: string, input: Partial<StoreSettings>, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/listings/stores/${storeId}/settings`, input, options)
  }

  /**
   * Get store analytics.
   */
  async getAnalytics(storeId: string, period?: 'daily' | 'weekly' | 'monthly', options?: RequestOptions): Promise<StoreAnalytics> {
    return this.client.get<StoreAnalytics>(
      `/listings/stores/${storeId}/analytics`,
      period ? { period } : undefined,
      options
    )
  }

  /**
   * Upload a store logo image.
   */
  async uploadLogo(storeId: string, file: Blob, options?: RequestOptions): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ url: string }>(`/listings/stores/${storeId}/logo`, formData, options)
  }

  /**
   * Upload a store banner image.
   */
  async uploadBanner(storeId: string, file: Blob, options?: RequestOptions): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ url: string }>(`/listings/stores/${storeId}/banner`, formData, options)
  }

  /**
   * Delete a store. Blocked if active orders, pending payouts, or open disputes exist.
   */
  async delete(storeId: string, options?: RequestOptions): Promise<{ ok: true } | { blocked: true; reasons: string[] }> {
    return this.client.delete<{ ok: true } | { blocked: true; reasons: string[] }>(`/listings/stores/${storeId}`, undefined, options)
  }

  /**
   * A shop's earnings: per currency, what is in escrow, on hold, awaiting approval, approved,
   * sending, sent, failed or a test, in minor units. The owner, or a team member who may read
   * earnings.
   *
   * Errors: 403 forbidden (a member whose role does not include earnings); 404 not_found.
   */
  async getEarnings(storeId: string, options?: RequestOptions): Promise<ShopEarnings> {
    return this.client.get<ShopEarnings>(`/orders/stores/${encodeURIComponent(storeId)}/earnings`, undefined, options)
  }

  /**
   * Each paid order's entitlement, newest first, 20 per page, optionally of one state.
   *
   * Errors: 400 invalid_input (unknown state); 403 forbidden; 404 not_found.
   */
  async getEarningsEntries(storeId: string, params?: ShopPayoutEntriesParams, options?: RequestOptions): Promise<ShopPayoutEntriesPage> {
    return this.client.get<ShopPayoutEntriesPage>(
      `/orders/stores/${encodeURIComponent(storeId)}/earnings/entries`,
      params as Record<string, string | number | boolean | undefined> | undefined,
      options,
    )
  }

  /**
   * One payout of the shop, with the settlement lines that explain it.
   *
   * Errors: 403 forbidden; 404 not_found.
   */
  async getPayout(storeId: string, payoutId: string, options?: RequestOptions): Promise<ShopPayout> {
    return this.client.get<ShopPayout>(
      `/orders/stores/${encodeURIComponent(storeId)}/payouts/${encodeURIComponent(payoutId)}`,
      undefined,
      options,
    )
  }

  /**
   * Where the shop is paid: its destinations, masked, with the methods and banks on offer. The
   * owner, or a team member who may read earnings.
   *
   * Errors: 403 store_forbidden.
   */
  async getPayoutDestinations(storeId: string, options?: RequestOptions): Promise<PayoutDestinations> {
    return this.client.get<PayoutDestinations>(`/listings/stores/${encodeURIComponent(storeId)}/payout-destinations`, undefined, options)
  }

  /**
   * Owner: add a payout destination. The shop's first applies at once; every later one, and a change
   * of default, 48 hours later. Needs a second factor used in the last 10 minutes.
   *
   * Errors: 400 invalid_input, or a `PayoutDestinationRejection` with `field`; 403 store_forbidden,
   * step_up_required; 409 method_unavailable, destination_exists, too_many_destinations.
   */
  async addPayoutDestination(storeId: string, input: AddPayoutDestinationInput, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.post<PayoutDestinationsState>(`/listings/stores/${encodeURIComponent(storeId)}/payout-destinations`, input, options)
  }

  /**
   * Owner: make a destination the default, 48 hours from now. Choosing the current default again
   * cancels any pending change. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required; 404 not_found.
   */
  async setDefaultPayoutDestination(storeId: string, destinationId: string, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.post<PayoutDestinationsState>(this.destinationPath(storeId, destinationId, '/default'), undefined, options)
  }

  /**
   * Owner: cancel a pending change of default to this destination. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required; 404 not_found; 409 no_pending_default.
   */
  async cancelPendingDefault(storeId: string, destinationId: string, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.delete<PayoutDestinationsState>(this.destinationPath(storeId, destinationId, '/default'), undefined, options)
  }

  /**
   * Owner: remove a destination, or cancel one still cooling off. The current default cannot be
   * removed: make another destination the default first, and remove this one once that applies.
   * Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required; 404 not_found; 409 default_destination.
   */
  async removePayoutDestination(storeId: string, destinationId: string, options?: RequestOptions): Promise<PayoutDestinationsState> {
    return this.client.delete<PayoutDestinationsState>(this.destinationPath(storeId, destinationId, ''), undefined, options)
  }

  private destinationPath(storeId: string, destinationId: string, suffix: string): string {
    return `/listings/stores/${encodeURIComponent(storeId)}/payout-destinations/${encodeURIComponent(destinationId)}${suffix}`
  }

  // ── Team ──────────────────────────────────────────────────────────────────

  /**
   * The shop's members, and the roles the caller may give. `store:members.manage`.
   *
   * Errors: 403 store_forbidden; 404 not_found.
   */
  async getMembers(storeId: string, options?: RequestOptions): Promise<StoreMembers> {
    return this.client.get<StoreMembers>(`${this.storePath(storeId)}/members`, undefined, options)
  }

  /**
   * Change a member's role. The owner manages every role; a manager, the roles below manager.
   * Needs a second factor used in the last 10 minutes.
   *
   * Errors: 400 invalid_input; 403 store_forbidden, step_up_required, role_not_allowed; 404 member_not_found.
   */
  async changeMemberRole(storeId: string, memberId: string, role: InvitableStoreRole, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.patch<{ ok: true }>(`${this.storePath(storeId)}/members/${encodeURIComponent(memberId)}`, { role }, options)
  }

  /**
   * Remove a member. They lose access on their next request. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required, role_not_allowed; 404 member_not_found.
   */
  async removeMember(storeId: string, memberId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`${this.storePath(storeId)}/members/${encodeURIComponent(memberId)}`, undefined, options)
  }

  /**
   * Leave a shop's team. The owner cannot leave their own shop.
   *
   * Errors: 404 member_not_found; 409 owner_cannot_leave.
   */
  async leave(storeId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`${this.storePath(storeId)}/leave`, undefined, options)
  }

  /**
   * Invite someone by email address or Kenyan phone number. The answer is the same whether or not an
   * account uses the address. Needs a recent second factor. The invitation lasts 7 days.
   *
   * Errors: 400 invalid_input, invalid_address; 403 store_forbidden, step_up_required, role_not_allowed;
   * 404 not_found; 409 too_many_invitations.
   */
  async invite(storeId: string, input: InviteToStoreInput, options?: RequestOptions): Promise<InviteToStoreResult> {
    return this.client.post<InviteToStoreResult>(`${this.storePath(storeId)}/invitations`, input, options)
  }

  /**
   * The shop's open invitations, newest first. `store:members.manage`.
   *
   * Errors: 403 store_forbidden; 404 not_found.
   */
  async getInvitations(storeId: string, options?: RequestOptions): Promise<{ data: StoreInvitationListItem[] }> {
    return this.client.get<{ data: StoreInvitationListItem[] }>(`${this.storePath(storeId)}/invitations`, undefined, options)
  }

  /**
   * Revoke an open invitation. Needs a recent second factor.
   *
   * Errors: 403 store_forbidden, step_up_required, role_not_allowed; 404 invitation_not_found.
   */
  async revokeInvitation(storeId: string, invitationId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`${this.storePath(storeId)}/invitations/${encodeURIComponent(invitationId)}`, undefined, options)
  }

  /** Invitations the caller received and can still answer, newest first. */
  async getReceivedInvitations(options?: RequestOptions): Promise<{ data: ReceivedStoreInvitation[] }> {
    return this.client.get<{ data: ReceivedStoreInvitation[] }>('/listings/store-invitations', undefined, options)
  }

  /**
   * Join a shop. Needs a verified phone number; the manager role also needs a recent second factor.
   *
   * Errors: 403 step_up_required; 404 invitation_not_found, not_found; 409 phone_not_verified,
   * membership_limit, already_member.
   */
  async acceptInvitation(invitationId: string, options?: RequestOptions): Promise<AcceptStoreInvitationResult> {
    return this.client.post<AcceptStoreInvitationResult>(`/listings/store-invitations/${encodeURIComponent(invitationId)}/accept`, undefined, options)
  }

  /**
   * Decline an invitation.
   *
   * Errors: 404 invitation_not_found.
   */
  async declineInvitation(invitationId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/listings/store-invitations/${encodeURIComponent(invitationId)}/decline`, undefined, options)
  }

  /**
   * The shop's audit log, newest first, 50 per page. `store:audit.read`.
   *
   * Errors: 403 store_forbidden; 404 not_found.
   */
  async getAuditLog(storeId: string, params?: { page?: number }, options?: RequestOptions): Promise<StoreAuditPage> {
    return this.client.get<StoreAuditPage>(`${this.storePath(storeId)}/audit`, params, options)
  }

  // ── Shop limit ────────────────────────────────────────────────────────────

  /** The caller's shop limit, how many shops they own, and their latest request for more. */
  async getStoreLimit(options?: RequestOptions): Promise<StoreLimitState> {
    return this.client.get<StoreLimitState>('/listings/store-limit-request', undefined, options)
  }

  /**
   * Ask for a higher shop limit, at the limit, with a reason of at least 30 characters. One request
   * at a time.
   *
   * Errors: 400 invalid_input; 403 not_a_retail_seller; 409 not_at_limit, request_pending.
   */
  async requestStoreLimit(input: RequestStoreLimitInput, options?: RequestOptions): Promise<StoreLimitState> {
    return this.client.post<StoreLimitState>('/listings/store-limit-request', input, options)
  }

  private storePath(storeId: string): string {
    return `/listings/stores/${encodeURIComponent(storeId)}`
  }
}

/** Whether an error asks the caller to sign in again with a second factor before retrying. */
export function stepUpRequired(error: unknown): boolean {
  return error instanceof APIError && error.code === 'step_up_required'
}
