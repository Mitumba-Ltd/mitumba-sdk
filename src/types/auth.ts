export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface MessageResponse {
  message: string
}

export interface EmailRegisterInput {
  email: string
  password: string // min 8 chars
  display_name?: string
  device?: string
}

export interface PhoneRegisterInput {
  phone: string // format: +254XXXXXXXXX
}

export type RegisterInput = EmailRegisterInput | PhoneRegisterInput

export interface EmailLoginInput {
  email: string
  password: string
  device?: string
  remember?: boolean
}

export interface PhoneLoginInput {
  phone: string
}

export type LoginInput = EmailLoginInput | PhoneLoginInput

export interface SendOtpInput {
  phone: string
}

export interface VerifyOtpInput {
  phone: string
  code: string // 6 digits
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  password: string
}

export interface CompleteOnboardingInput {
  display_name: string
  county: string
  phone: string
}

export interface TwoFactorRequired {
  requires_2fa: true
  temp_token: string
  methods?: { id: string; type: TwoFactorMethodType; label: string | null }[]
}

export interface Verify2FAInput {
  temp_token: string
  code: string
  method_id?: string
}

export const TWO_FACTOR_METHOD_TYPES = ['totp', 'sms', 'email', 'passkey'] as const
export type TwoFactorMethodType = typeof TWO_FACTOR_METHOD_TYPES[number]

export interface TwoFactorMethod {
  id: string
  type: TwoFactorMethodType
  label: string | null
  enabled: boolean
  is_primary: boolean
  verified_at: string | null
  created_at: string
  last_used_at: string | null
}

export interface Add2FAMethodInput {
  type: TwoFactorMethodType
  label?: string
  target?: string
}

export interface Add2FAMethodResult {
  id: string
  otpauth_uri?: string
  secret?: string
}

/** WebAuthn L2 JSON — options returned by the server for navigator.credentials.create() */
export interface PublicKeyCredentialCreationOptionsJSON {
  rp: { name: string; id?: string }
  user: { id: string; name: string; displayName: string }
  challenge: string
  pubKeyCredParams: { type: string; alg: number }[]
  timeout?: number
  excludeCredentials?: { id: string; type: string; transports?: string[] }[]
  authenticatorSelection?: { authenticatorAttachment?: string; residentKey?: string; requireResidentKey?: boolean; userVerification?: string }
  attestation?: string
  extensions?: Record<string, unknown>
}

/** WebAuthn L2 JSON — the browser's response from navigator.credentials.create() */
export interface RegistrationResponseJSON {
  id: string
  rawId: string
  response: { clientDataJSON: string; attestationObject: string; transports?: string[] }
  type: string
  clientExtensionResults?: Record<string, unknown>
  authenticatorAttachment?: string
}

/** WebAuthn L2 JSON — options returned by the server for navigator.credentials.get() */
export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string
  timeout?: number
  rpId?: string
  allowCredentials?: { id: string; type: string; transports?: string[] }[]
  userVerification?: string
  extensions?: Record<string, unknown>
}

/** WebAuthn L2 JSON — the browser's response from navigator.credentials.get() */
export interface AuthenticationResponseJSON {
  id: string
  rawId: string
  response: { clientDataJSON: string; authenticatorData: string; signature: string; userHandle?: string }
  type: string
  clientExtensionResults?: Record<string, unknown>
  authenticatorAttachment?: string
}

export type BusinessType = 'individual' | 'business'
export type SellerType = 'retail' | 'bale'

export interface BecomeSellerInput {
  business_type?: BusinessType
  /** @deprecated Use business_type instead */
  seller_type?: 'individual' | 'business'
  sti_score?: number
  business_name?: string
  id_number?: string
  kra_pin?: string
  phone?: string
  county?: string
  town?: string
  categories?: string[]
  condition_grades?: string[]
  delivery_method?: 'self' | 'mitumba-logistics'
  price_range_min?: number
  price_range_max?: number
}

export interface BecomeBaleSellerInput {
  business_type?: BusinessType
  business_name?: string
  kra_pin?: string
  id_number?: string
  phone?: string
  county?: string
}

export interface UserProfile {
  id: string
  email: string | null
  phone: string | null
  display_name: string | null
  city_id: string | null
  county: string | null
  bio: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  email_verified: boolean
  totp_enabled: boolean
  totp_configured: boolean
  two_factor_methods_count?: number
  sms_2fa_available?: boolean
  email_2fa_available?: boolean
  /** Unused backup codes left. */
  backup_codes_remaining?: number
  /** True at two or fewer, while a verified second factor exists. */
  backup_codes_low?: boolean
  /** Explicit admin grants, whether or not they currently reach the token. */
  admin_permissions?: import('./admin').AdminPermission[]
  /** Grants exist but are withheld until a second factor is verified. */
  admin_enrolment_required?: boolean
  is_active: boolean
  created_at: string
  roles: string[]
}


// ── Public capabilities, backup-code lifecycle, and assisted recovery ─────────

export interface AuthCapabilities {
  sms_otp_enabled: boolean
  email_2fa_enabled: boolean
  password_min_length: number
}

export interface RegenerateBackupCodesResult {
  /** Shown once. Never persisted by the SDK. */
  backup_codes: string[]
  remaining: number
}

export type RecoveryStatus = 'none' | 'pending' | 'approved'

export interface RequestRecoveryInput {
  temp_token: string
  reason?: string
}

export interface RequestRecoveryResult {
  id: string
  status: 'pending' | 'approved'
  cooling_off_hours: number
  payout_freeze_days?: number
  hours_remaining?: number | null
  already_open: boolean
}

export interface RecoveryStatusResult {
  status: RecoveryStatus
  id?: string
  cooling_off_hours: number
  payout_freeze_days?: number
  hours_remaining?: number | null
  can_complete?: boolean
}

export interface CompleteRecoveryResult extends AuthTokens {
  /** Shown once. Never persisted by the SDK. */
  backup_codes: string[]
  payout_frozen_until: string
  payout_freeze_days: number
}

export interface AdminRecoveryRequest {
  id: string
  user_id: string
  email: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  reason: string | null
  requested_ip: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  effective_at: string | null
  completed_at: string | null
  created_at: string
}

export interface AdminRecoveryEvent {
  id: string
  event: string
  actor_id: string | null
  detail: string | null
  created_at: string
}

export interface RootSetupInput {
  email: string
  password: string
  /** One-time bootstrap secret, removed from the Worker immediately after setup. */
  setup_secret: string
}

export interface RootSetupResult {
  ok: true
  permissions: import('./admin').AdminPermission[]
  next_step: string
}
