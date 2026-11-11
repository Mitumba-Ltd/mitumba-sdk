import type { MessageReportReason } from './messages'

export interface BlockedIp {
  ip: string
  reason: string
  blocked_at: string
  expires_at: string
  lifted_at: string | null
  blocked_by_email: string | null
}

export interface SystemStats {
  total_users: number
  total_sellers: number
  total_listings: number
  total_orders: number
  total_revenue: number
  active_today: number
}

export interface AdminUserListItem {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  is_active: boolean
  roles: string[]
  created_at: string
}

export interface AdminUserDetail {
  id: string
  email: string | null
  phone: string | null
  display_name: string | null
  county: string | null
  city_id: string | null
  is_active: boolean
  suspended_at: string | null
  suspension_reason: string | null
  onboarding_completed: number
  email_verified: number
  created_at: string
  roles: string[]
  order_count: number
  seller: { sti_score: number; seller_type: string; verification_status: string } | null
}

export interface AdminStoreListItem {
  id: string
  name: string
  slug: string
  seller_id: string
  is_verified: boolean
  subscription_tier: 'free' | 'pro'
  sti_score: number | null
  created_at: string
}

export interface AdminStoreDetail {
  id: string
  seller_id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  category: string | null
  logo_url: string | null
  banner_url: string | null
  city_id: string | null
  subscription_tier: 'free' | 'pro'
  is_verified: boolean
  created_at: string
  updated_at: string
  owner_name: string | null
  owner_email: string | null
  sti_score: number | null
  seller_type: string | null
  verification_status: string | null
  listing_count: number
  order_count: number
}

export interface AdminVerificationItem {
  user_id: string
  seller_type: string
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  updated_at: string
  display_name: string | null
  email: string | null
  phone: string | null
  id_document_url: string | null
  kra_pin: string | null
}

export interface StiEvent {
  trigger_type: string
  trigger_order_id: string | null
  score_before: number
  score_after: number
  delta: number
  reason: string
  created_at: string
}

export interface AdminListingItem {
  id: string
  title: string
  price: number
  status: 'draft' | 'active' | 'sold' | 'removed'
  photo_verified: boolean
  seller_id: string
  store_id: string | null
  created_at: string
  image_url: string | null
}

export interface AdminOrderListItem {
  id: string
  buyer_id: string
  seller_id: string
  store_id: string | null
  total: number
  status: string
  created_at: string
  listing_title: string | null
}

export interface AdminOrderDetail {
  id: string
  buyer_id: string
  seller_id: string
  store_id: string | null
  listing_id: string
  amount: number
  delivery_fee: number
  total: number
  status: string
  city_id: string
  created_at: string
  updated_at: string
  events: unknown[]
  payment: unknown | null
  payout: unknown | null
  dispute: unknown | null
}

export interface AdminPayoutItem {
  id: string
  order_id: string
  seller_id: string
  amount: number
  provider: string
  status: 'pending' | 'sent' | 'failed'
  on_hold: boolean
  created_at: string
  /**
   * True for a Daraja payout that was submitted (`sent`) but whose provider reference was never
   * stored, so its result cannot be matched. Repair it with `admin.repairPayoutCorrelation()`.
   */
  needs_correlation?: boolean
}

// ── Messaging safety reports ──

export type MessageReportStatus = 'open' | 'reviewed' | 'dismissed' | 'actioned'
export type MessageReportOutcome = 'upheld' | 'not_upheld'
export type MessagingSide = 'buyer' | 'store'

/** One reported conversation or message in the safety queue, from `admin.listMessageReports()`. */
export interface AdminMessageReport {
  id: string
  reporter_principal_kind: MessagingSide
  reporter_principal_id: string
  conversation_id: string
  thread_id: string
  message_id: string | null
  subject_kind: 'conversation' | 'message'
  /** The side of the conversation being reported. */
  reported_side: MessagingSide
  reason: MessageReportReason | string
  detail: string | null
  status: MessageReportStatus
  outcome: MessageReportOutcome | null
  created_at: string
  thread_kind: string
  thread_title: string | null
  /** The reported message as delivered (contact details already masked), when one is reported. */
  message_body: string | null
  /** 1 when the platform masked part of the delivered message. */
  body_modified: number | null
  /** The reported principal (a buyer's users.id or a store id). */
  subject_principal_id: string
  /** Masked contact or payment attempts by the reported principal in the last 24 hours. */
  masked_attempts_24h: number
  /** Reports against the reported principal upheld in the last 30 days. */
  upheld_reports_30d: number
  /** `high` once either signal reaches its threshold. It orders the queue; it decides nothing. */
  priority: 'high' | 'standard'
}

export interface AdminMessageReportList {
  data: AdminMessageReport[]
  page: number
  page_size: number
  thresholds: { masked_attempts_24h: number; upheld_reports_30d: number; effect: 'queue_priority_only' }
}

/** One message of the reported thread, as delivered. */
export interface AdminMessageReportThreadMessage {
  id: string
  sender_id: string
  receiver_id: string | null
  body: string
  body_modified: number
  body_policy_version: string | null
  body_policy_notices: string | null
  author_side: MessagingSide | null
  sequence: number | null
  created_at: string
}

/**
 * A report opened for review, from `admin.getMessageReport()`. Opening one is recorded on the audit
 * trail, and so is whether the unmasked original was released.
 */
export interface AdminMessageReportDetail {
  id: string
  reporter_user_id: string
  reporter_principal_kind: MessagingSide
  reporter_principal_id: string
  conversation_id: string
  thread_id: string
  message_id: string | null
  subject_kind: 'conversation' | 'message'
  reported_side: MessagingSide
  reason: MessageReportReason | string
  detail: string | null
  status: MessageReportStatus
  outcome: MessageReportOutcome | null
  resolution_note: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  thread_kind: string
  thread_title: string | null
  buyer_id: string
  store_id: string
  /** Up to 100 messages of the thread, oldest first. */
  thread: AdminMessageReportThreadMessage[]
  /** The reported message before masking, when it was masked and may be released; otherwise null. */
  restricted_original: string | null
  restricted_original_available: boolean
}

export interface ResolveMessageReportInput {
  status: Exclude<MessageReportStatus, 'open'>
  /** `upheld` records a risk signal against the reported side; `not_upheld` records none. */
  outcome: MessageReportOutcome
  /** At most 1000 characters. */
  note?: string
}

export interface ResolveMessageReportResult {
  ok: true
  status: Exclude<MessageReportStatus, 'open'>
  outcome: MessageReportOutcome
  /** True when the same resolution had already been recorded (a safe retry). */
  deduplicated: boolean
}

export interface AdminReport {
  id: string
  reporter_id: string
  target_type: 'listing' | 'review' | 'store' | 'user'
  target_id: string
  reason: string
  detail: string | null
  status: 'open' | 'reviewed' | 'dismissed' | 'actioned'
  created_at: string
}

export interface AdminVaziOutfit {
  id: string
  name: string
  seed_listing_id: string
  render_status: string
  removed: boolean
  item_count: number
  total_price: number
  engagement_impressions: number
  engagement_clicks: number
  engagement_purchases: number
  assembled_at: string
}

export interface CreateReportInput {
  target_type: 'listing' | 'review' | 'store' | 'user'
  target_id: string
  reason: 'counterfeit' | 'offensive' | 'spam' | 'scam' | 'other'
  detail?: string
}


// ── Scoped admin access ───────────────────────────────────────────────────────

export type AdminPermission =
  | 'admin:read'
  | 'users:moderate'
  | 'ip:block'
  | 'listings:moderate'
  | 'orders:transition'
  | 'payouts:disburse'
  | 'sellers:verify'
  | 'recovery:review'
  | 'broadcast:send'
  | 'clients:manage'
  | 'oidc:rotate_keys'
  | 'roles:grant'
  | 'audit:read'
  | 'library:read_all'

export type AdminAuthStrength = 'password' | 'sms' | 'email' | 'totp' | 'passkey'

export interface AdminRolePreset {
  id: string
  name: string
  description: string
  permissions: AdminPermission[]
  sensitive: boolean
}

export interface AdminPermissionDescription {
  permission: AdminPermission
  requires_strength: AdminAuthStrength | null
}

export interface OperatorPermissionGrant {
  permission: AdminPermission
  granted_at: string
  granted_by: string | null
}

export interface AdminOperator {
  id: string
  email: string
  display_name: string | null
  permissions: OperatorPermissionGrant[]
}

/** Who performed an audited action, resolved from its operator subject. */
export interface AdminAuditActor {
  /** `user`: root / platform operator (users.id). `iam`: an IAM principal. `unknown`: not resolvable. */
  type: 'user' | 'iam' | 'unknown'
  email: string | null
  display_name: string | null
  /** The IAM principal's organization; null for platform operators. */
  organization: { id: string; alias: string | null; name: string | null } | null
}

export interface AdminAuditEntry {
  id: string
  /** Operator subject: users.id or iam:<iam_users.id>. */
  actor_id: string
  action: string
  target_type: string
  target_id: string | null
  detail: string | null
  created_at: string
  /** Present from the attributed audit trail onward. */
  actor?: AdminAuditActor
}

/** Filters for {@link AdminModule.listAuditLog}. All exact matches; `since`/`until` are ISO timestamps. */
export interface AdminAuditQuery {
  limit?: number
  actor?: string
  action?: string
  target_type?: string
  target_id?: string
  since?: string
  until?: string
  /** `next_cursor` from the previous page. */
  before?: string
}

export interface PendingPayoutApproval {
  id: string
  order_id: string
  seller_id: string
  seller_email: string
  seller_name: string | null
  amount: number
  created_at: string
  order_status: string | null
  fulfilled_at: string | null
  received_at: string | null
  dispute_count: number
  prior_payouts: number
  active_restrictions: number
  /** Present once a finance operator has approved it; item stays in the queue until disbursed. */
  approved_at: string | null
  approved_by: string | null
  hold_reason: string | null
  held_at: string | null
}

/** A wholesale application's review outcome. `verified` stays the trading gate. */
export type WholesaleReviewStatus = 'pending' | 'approved' | 'rejected'

export interface AdminWholesalePendingStore {
  id: string
  name: string
  seller_id: string
  review_status?: WholesaleReviewStatus
  /** Operator subject (users.id or iam:<id>) who last reviewed it. */
  reviewed_by?: string | null
  reviewed_at?: string | null
  /** Rejection reason, also shown to the seller. */
  review_note?: string | null
  [key: string]: unknown
}

// ── Identity provider: sign-in clients and signing keys ──

/** `public` clients (browser SPAs, mobile) use PKCE and have no secret; `confidential` clients have a server-side secret. */
export type OAuthClientType = 'public' | 'confidential'

/** `first_party_implicit` skips the consent screen; `first_party_consent` shows it. */
export type OAuthClientTrustLevel = 'first_party_implicit' | 'first_party_consent'

/** A registered sign-in (relying-party) client as listed by `admin.listOAuthClients()`. Never carries a secret. */
export interface OAuthClientSummary {
  client_id: string
  name: string
  client_type: OAuthClientType
  trust_level: OAuthClientTrustLevel
  is_active: boolean
  created_at: string
  updated_at: string
}

/** A client with its exact-match redirect-URI allow-list and permitted scopes. */
export interface OAuthClient extends OAuthClientSummary {
  redirect_uris: string[]
  scopes: string[]
}

export interface RegisterOAuthClientInput {
  name: string
  client_type: OAuthClientType
  trust_level: OAuthClientTrustLevel
  /** Exact-match allow-list. Can be set later with `setOAuthClientRedirectUris()`. */
  redirect_uris?: string[]
  /** Scopes the client may request. Can be set later with `setOAuthClientScopes()`. */
  scopes?: string[]
}

/**
 * A newly registered client. `client_secret` is present only for a confidential client and is
 * returned exactly once — it is stored hashed and can never be read back.
 */
export interface RegisteredOAuthClient extends OAuthClient {
  client_secret?: string
}

/** One OIDC signing key's metadata. Key material is never exposed. */
export interface OidcSigningKey {
  kid: string
  alg: string
  /** `current` signs; `previous` still verifies (published in JWKS); `retired` is neither. */
  status: 'current' | 'previous' | 'retired'
  created_at: string
  rotated_at: string | null
}

// ── Operations library ──

export type LibraryKind = 'runbook' | 'routine' | 'incident' | 'reference'
/** The coarse label of a schedule: its most frequent rule. */
export type LibraryCadence = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type LibraryWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Part of the year, MM-DD to MM-DD inclusive. `from` after `to` wraps the new year. */
export interface LibrarySeason {
  from: string
  to: string
}

/** One rule of a routine's schedule. Every day is East Africa Time. */
export type LibraryScheduleRule =
  | { every: 'daily'; during: LibrarySeason | null }
  | { every: 'weekdays'; during: LibrarySeason | null }
  | { every: 'weekly'; weekday: LibraryWeekday; during: LibrarySeason | null }
  | { every: 'monthly'; day: number | 'last'; during: LibrarySeason | null }
  | { every: 'quarterly'; day: number | 'last' }
  | { every: 'yearly'; date: string }

/** When a routine is due: on any day at least one rule matches. */
export interface LibrarySchedule {
  rules: LibraryScheduleRule[]
  /** The rules in plain words, e.g. "Every Monday". */
  label: string
  /** Days ahead of a monthly, quarterly or yearly due day the audience is reminded; 0 for none. */
  noticeDays: number
  /** Days after the due day before an unrecorded occurrence is escalated; null uses each rule's default. */
  graceDays: number | null
}

/** Where one occurrence of a routine stands. `missed` occurrences may still be recorded, as late. */
export type LibraryOccurrenceStatus = 'upcoming' | 'due' | 'missed' | 'done'

/** Who recorded an occurrence: a users.id or `iam:<id>`, with their name and address when known. */
export interface LibraryCompleter {
  subject: string
  name: string | null
  email: string | null
}

/** One due day of a routine. */
export interface LibraryOccurrence {
  /** YYYY-MM-DD. */
  dueOn: string
  status: LibraryOccurrenceStatus
  /** YYYY-MM-DD: the last day it may be recorded before it counts as missed. */
  graceEndsOn: string
  completedAt: string | null
  completedBy: LibraryCompleter | null
  note: string | null
}

/** Where a scheduled routine stands today. */
export interface LibraryRoutineState {
  /** The latest due day on or before today, or null when none falls in the lookback. */
  current: LibraryOccurrence | null
  /** YYYY-MM-DD, or null when no due day falls within a year. */
  nextDueOn: string | null
  /** Missed and still unrecorded occurrences (since tracking began, at most 45 days back). */
  missedCount: number
}

/** The result of `admin.completeLibraryOccurrence()`. */
export interface LibraryOccurrenceRecorded {
  ok: true
  occurrence: LibraryOccurrence
}

/** A library document as listed by `admin.listLibrary()`. Never includes the body. */
export interface LibraryDocumentSummary {
  slug: string
  title: string
  summary: string
  kind: LibraryKind
  /** The permissions that may read this document (any one of them suffices). */
  audience: AdminPermission[]
  owner: string
  /** How often a routine is carried out, coarsely; null when the document has no schedule. */
  cadence: LibraryCadence | null
  /** When the routine is due; null when the document has no schedule. */
  schedule: LibrarySchedule | null
  /**
   * Where the routine stands today. Null for an unscheduled document, and also when the worker
   * cannot read routine state at the moment (the document itself is still served).
   */
  routine: LibraryRoutineState | null
  /** How often the document itself must be re-checked. */
  reviewEveryDays: number
  /** YYYY-MM-DD. */
  lastReviewed: string
  /** YYYY-MM-DD: `lastReviewed` plus `reviewEveryDays`. */
  reviewDueOn: string
  /** True once `reviewDueOn` has passed. */
  reviewOverdue: boolean
}

/** One library document with its markdown body, from `admin.getLibraryDocument()`. */
export interface LibraryDocument extends LibraryDocumentSummary {
  markdown: string
  /** Recent occurrences, newest first, starting with the next due day. Empty when unscheduled. */
  occurrences: LibraryOccurrence[]
  /** True when the caller's role is in the audience, so they may record occurrences as done. */
  can_record: boolean
}

export interface LibraryListing {
  /** Only the documents the caller may read. */
  documents: LibraryDocumentSummary[]
  /** True when the caller holds `library:read_all` and so sees every document. */
  can_read_all: boolean
}
