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
}

export interface PhoneRegisterInput {
  phone: string // format: +254XXXXXXXXX
}

export type RegisterInput = EmailRegisterInput | PhoneRegisterInput

export interface EmailLoginInput {
  email: string
  password: string
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
