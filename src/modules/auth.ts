import { APIClient } from '../client'
import type {
  RegisterInput,
  LoginInput,
  SendOtpInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CompleteOnboardingInput,
  Verify2FAInput,
  TwoFactorRequired,
  UserProfile,
  AuthTokens,
  MessageResponse,
  RequestOptions,
} from '../types'

export class AuthModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Register a new account.
   * If using EmailRegisterInput, returns AuthTokens.
   * If using PhoneRegisterInput, returns MessageResponse (OTP sent).
   */
  async register(input: RegisterInput, options?: RequestOptions): Promise<AuthTokens | MessageResponse> {
    return this.client.post<AuthTokens | MessageResponse>('/auth/register', input, options)
  }

  /**
   * Log in to an existing account.
   * If using EmailLoginInput, returns AuthTokens (or TwoFactorRequired if 2FA enabled).
   * If using PhoneLoginInput, returns MessageResponse (OTP sent).
   */
  async login(input: LoginInput, options?: RequestOptions): Promise<AuthTokens | MessageResponse | TwoFactorRequired> {
    return this.client.post<AuthTokens | MessageResponse | TwoFactorRequired>('/auth/login', input, options)
  }

  /**
   * Send an OTP code to a phone number.
   */
  async sendOtp(input: SendOtpInput, options?: RequestOptions): Promise<MessageResponse> {
    return this.client.post<MessageResponse>('/auth/otp/send', input, options)
  }

  /**
   * Verify an OTP code.
   */
  async verifyOtp(input: VerifyOtpInput, options?: RequestOptions): Promise<AuthTokens> {
    return this.client.post<AuthTokens>('/auth/otp/verify', input, options)
  }

  /**
   * Refresh the access token using a refresh token.
   */
  async refresh(input: { refresh_token: string }, options?: RequestOptions): Promise<AuthTokens> {
    return this.client.post<AuthTokens>('/auth/refresh', input, options)
  }

  /**
   * Revoke the refresh token and log out.
   */
  async logout(input: { refresh_token: string }, options?: RequestOptions): Promise<{ ok: boolean }> {
    return this.client.post<{ ok: boolean }>('/auth/logout', input, options)
  }

  /**
   * Request a password reset email.
   * Sends a reset link to the provided email address.
   */
  async forgotPassword(input: ForgotPasswordInput, options?: RequestOptions): Promise<MessageResponse> {
    return this.client.post<MessageResponse>('/auth/forgot-password', input, options)
  }

  /**
   * Reset the password using a token from the reset email.
   */
  async resetPassword(input: ResetPasswordInput, options?: RequestOptions): Promise<MessageResponse> {
    return this.client.post<MessageResponse>('/auth/reset-password', input, options)
  }

  /**
   * Get the current authenticated user's profile.
   */
  async me(options?: RequestOptions): Promise<UserProfile> {
    return this.client.get<UserProfile>('/auth/me', undefined, options)
  }

  /**
   * Complete the onboarding flow.
   */
  async completeOnboarding(input: CompleteOnboardingInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/onboarding/complete', input, options)
  }

  /**
   * Verify 2FA code during login (when login returns requires_2fa).
   */
  async verify2FA(input: Verify2FAInput, options?: RequestOptions): Promise<AuthTokens> {
    return this.client.post<AuthTokens>('/auth/2fa/login', input, options)
  }

  /**
   * Send a verification code to the user's email.
   */
  async sendVerificationCode(options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/verify-email/send', undefined, options)
  }

  /**
   * Verify the email with the 6-digit code.
   */
  async verifyEmail(code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/verify-email/confirm', { code }, options)
  }
}
