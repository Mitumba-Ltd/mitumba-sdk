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
  is_active: boolean
  created_at: string
  roles: string[]
}
