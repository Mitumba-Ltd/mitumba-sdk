// Shop teams: members, invitations, the shop's audit log, and shop limit requests.

/** A permission a member holds in a shop. */
export type StorePermission =
  | 'store:listings.read'
  | 'store:listings.manage'
  | 'store:orders.read'
  | 'store:orders.fulfil'
  | 'store:orders.cancel'
  | 'store:messages.reply'
  | 'store:reviews.reply'
  | 'store:earnings.read'
  | 'store:payouts.manage'
  | 'store:settings.manage'
  | 'store:members.manage'
  | 'store:analytics.read'
  | 'store:store.close'
  | 'store:audit.read'

/** A member's role in a shop. Each role grants a fixed set of permissions. */
export type StoreRole = 'owner' | 'manager' | 'fulfilment' | 'stock' | 'support' | 'finance'

/** The roles an invitation can offer. */
export type InvitableStoreRole = Exclude<StoreRole, 'owner'>

/** A shop the caller works in, from `getMyStores`, with the caller's role in it. */
export interface StoreMembershipFields {
  my_role: StoreRole
  my_permissions: StorePermission[]
  is_owner: boolean
  listing_count: number
}

export interface StoreMember {
  id: string
  name: string
  role: StoreRole
  joined_at: string
  /** The caller's own row. */
  is_you: boolean
  /** Whether the caller may change this member's role or remove them. */
  can_manage: boolean
}

export interface StoreMembers {
  data: StoreMember[]
  /** The roles the caller may give, for the invite and change-role forms. */
  assignable_roles: InvitableStoreRole[]
}

/** An open invitation, as the shop sees it. `address` is masked. */
export interface StoreInvitation {
  id: string
  address: string
  role: InvitableStoreRole
  expires_at: string
  created_at: string
}

export interface StoreInvitationListItem extends StoreInvitation {
  invited_by: string
  can_revoke: boolean
}

export interface InviteToStoreInput {
  /** An email address or a Kenyan phone number. */
  address: string
  role: InvitableStoreRole
}

/** The answer to an invitation. The same whether or not an account uses the address. */
export interface InviteToStoreResult {
  message: string
  invitation: StoreInvitation
}

/** An invitation the caller received. */
export interface ReceivedStoreInvitation {
  id: string
  role: InvitableStoreRole
  permissions: StorePermission[]
  expires_at: string
  created_at: string
  invited_by: string
  shop: { id: string; name: string; slug: string; logo_url: string | null }
}

export interface AcceptStoreInvitationResult {
  ok: true
  store_id: string
  role: InvitableStoreRole
  permissions: StorePermission[]
}

export interface StoreAuditEntry {
  id: string
  actor_id: string
  action: string
  target_type: string | null
  target_id: string | null
  summary: string
  created_at: string
  actor: { id: string; name: string; is_you: boolean }
}

export interface StoreAuditPage {
  data: StoreAuditEntry[]
  page: number
  has_more: boolean
}

export type StoreLimitRequestStatus = 'pending' | 'approved' | 'rejected'

export interface StoreLimitRequest {
  id: string
  status: StoreLimitRequestStatus
  requested_limit: number
  approved_limit: number | null
  reason: string
  decision_note: string | null
  created_at: string
  decided_at: string | null
}

/** The caller's shop limit, how many shops they own, and their latest request. */
export interface StoreLimitState {
  limit: number
  open_shops: number
  at_limit: boolean
  request: StoreLimitRequest | null
}

export interface RequestStoreLimitInput {
  requested_limit: number
  /** At least 30 characters. */
  reason: string
}

/** A shop limit request in the operators' queue. */
export interface AdminShopLimitRequest {
  id: string
  user_id: string
  current_limit: number
  requested_limit: number
  reason: string
  status: StoreLimitRequestStatus
  approved_limit: number | null
  decision_note: string | null
  decided_by: string | null
  created_at: string
  decided_at: string | null
  account: { id: string; name: string; email: string | null; sti_score: number | null; completed_orders: number }
  shops: Array<{ id: string; name: string; slug: string; created_at: string }>
}

export interface AdminShopLimitRequestsPage {
  data: AdminShopLimitRequest[]
  page: number
  has_more: boolean
}

export type DecideShopLimitInput =
  | { decision: 'approve'; approved_limit: number; note?: string }
  | { decision: 'reject'; note: string }

export interface DecideShopLimitResult {
  ok: true
  status: 'approved' | 'rejected'
  approved_limit?: number
}
