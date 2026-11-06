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


// ── OAuth session hand-off (relying-party authorization code + PKCE) ──────────

/**
 * Request body for the authorize (mint) step. The accounts app calls this once the user is
 * authenticated to mint a one-time authorization code for the relying party.
 *
 * The SDK always sets `code_challenge_method: 'S256'` internally, so callers never supply it.
 */
export interface OAuthAuthorizeInput {
  /** The relying party's registered client identifier. */
  client_id: string
  /** The registered redirect URI the one-time code is returned to. */
  redirect_uri: string
  /** Optional space-delimited list of requested scopes. */
  scope?: string
  /** Opaque value echoed back unchanged, used by the relying party for CSRF protection. */
  state: string
  /** The PKCE code challenge (base64url SHA-256 of the verifier). */
  code_challenge: string
}

/**
 * Result of the authorize (mint) step: a one-time authorization code plus the echoed state.
 */
export interface OAuthAuthorizeResult {
  /** One-time authorization code to redirect back to the relying party. */
  code: string
  /** The `state` value supplied in the request, echoed back unchanged. */
  state: string
}

/**
 * Request body for the token exchange step. The relying party exchanges the one-time code for a
 * token pair. `grant_type` is set to `'authorization_code'` by the SDK, so callers need not pass it.
 */
export interface OAuthTokenExchangeInput {
  /** Always `'authorization_code'`. Defaulted by the SDK; callers may omit it. */
  grant_type?: 'authorization_code'
  /** The one-time authorization code returned by the authorize step. */
  code: string
  /** The redirect URI used in the authorize step; must match exactly. */
  redirect_uri: string
  /** The relying party's registered client identifier. */
  client_id: string
  /** The PKCE code verifier that matches the earlier code challenge. */
  code_verifier: string
  /** The client secret for confidential clients. Omit for public clients. */
  client_secret?: string
}

/**
 * Result of a successful token exchange: the access/refresh token pair and its metadata.
 */
export interface OAuthTokenResult {
  /** The access token (JWT) for authenticated requests. */
  access_token: string
  /** The refresh token used to rotate the access token. */
  refresh_token: string
  /** Lifetime of the access token in seconds. */
  expires_in: number
  /** Always `'Bearer'`. */
  token_type: 'Bearer'
  /** Space-delimited list of scopes actually granted. */
  scope: string
}

/**
 * The OpenID Connect discovery document, as served by `GET /auth/oauth/openid-configuration`.
 *
 * A relying party reads this once to learn the provider's endpoints and capabilities instead of
 * hard-coding them. The fields mirror the standard OIDC discovery metadata the backend advertises.
 */
export interface OpenIdConfiguration {
  /** The issuer identifier that appears in id_token `iss`. */
  issuer: string
  /** Where the authorization code is minted. */
  authorization_endpoint: string
  /** Where a code is exchanged for tokens. */
  token_endpoint: string
  /** Where the consented claims for an access token are read. */
  userinfo_endpoint: string
  /** The JWKS URL whose public keys verify id_token signatures. */
  jwks_uri: string
  /** Supported OAuth response types (e.g. `['code']`). */
  response_types_supported: string[]
  /** Supported grant types (e.g. `['authorization_code']`). */
  grant_types_supported: string[]
  /** Supported PKCE challenge methods (e.g. `['S256']`). */
  code_challenge_methods_supported: string[]
  /** id_token signing algorithms (e.g. `['ES256']`). */
  id_token_signing_alg_values_supported: string[]
  /** Requestable scopes (e.g. `['openid','profile','email','phone']`). */
  scopes_supported: string[]
  /** Subject identifier types (e.g. `['public']`). */
  subject_types_supported: string[]
  /** Supported client authentication methods at the token endpoint. */
  token_endpoint_auth_methods_supported: string[]
}

/** A single JSON Web Key, public parameters only (as served by the JWKS endpoint). */
export interface Jwk {
  /** Key type, e.g. `'EC'`. */
  kty: string
  /** Intended use, e.g. `'sig'`. */
  use?: string
  /** Algorithm, e.g. `'ES256'`. */
  alg?: string
  /** Key id; matches the id_token header `kid`. */
  kid?: string
  /** Curve for EC keys, e.g. `'P-256'`. */
  crv?: string
  /** EC public x coordinate (base64url). */
  x?: string
  /** EC public y coordinate (base64url). */
  y?: string
}

/** The JWKS document: the set of public keys that verify provider-issued id_tokens. */
export interface Jwks {
  keys: Jwk[]
}

/**
 * The OIDC userinfo claim set, from `GET /auth/oauth/userinfo`.
 *
 * `sub` is always present; the identity claims appear per the access token's granted scopes. Extra
 * claims the provider adds later are tolerated via the index signature rather than dropped.
 */
export interface UserInfo {
  /** The stable subject identifier (the user id). Always present. */
  sub: string
  /** Primary email, when the `email` scope was granted. */
  email?: string
  /** Whether the email is verified, when present. */
  email_verified?: boolean
  /** Display name, when the `profile` scope was granted. */
  name?: string
  /** Avatar URL, when the `profile` scope was granted. */
  picture?: string
  /** Phone number, when the `phone` scope was granted. */
  phone_number?: string
  /** Additional provider claims are preserved rather than discarded. */
  [claim: string]: unknown
}
