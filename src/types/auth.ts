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
}

export interface Verify2FAInput {
  temp_token: string
  code: string
}

export interface BecomeSellerInput {
  seller_type: 'individual' | 'business'
  sti_score: number
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
  onboarding_completed: boolean
  email_verified: boolean
  totp_enabled: boolean
  is_active: boolean
  created_at: string
  roles: string[]
}
