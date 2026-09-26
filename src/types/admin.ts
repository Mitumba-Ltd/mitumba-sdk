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
  | 'roles:grant'
  | 'audit:read'

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

export interface AdminAuditEntry {
  id: string
  actor_id: string
  action: string
  target_type: string
  target_id: string
  detail: string | null
  created_at: string
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
  hold_reason: string | null
  held_at: string | null
}

export interface AdminWholesalePendingStore {
  id: string
  name: string
  seller_id: string
  [key: string]: unknown
}
