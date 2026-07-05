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
  BecomeSellerInput,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
  UserProfile,
  AuthTokens,
  MessageResponse,
  RequestOptions,
} from '../types'

function isAuthTokens(result: unknown): result is AuthTokens {
  return typeof result === 'object' && result !== null && 'access_token' in result && 'refresh_token' in result
}

export class AuthModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Register a new account.
   * If using EmailRegisterInput, returns AuthTokens (auto-persisted).
   * If using PhoneRegisterInput, returns MessageResponse (OTP sent).
   */
  async register(input: RegisterInput, options?: RequestOptions): Promise<AuthTokens | MessageResponse> {
    const result = await this.client.post<AuthTokens | MessageResponse>('/auth/register', input, options)
    if (isAuthTokens(result)) {
      await this.client.setSession(result)
    }
    return result
  }

  /**
   * Log in to an existing account.
   * If using EmailLoginInput, returns AuthTokens (auto-persisted) or TwoFactorRequired.
   * If using PhoneLoginInput, returns MessageResponse (OTP sent).
   */
  async login(input: LoginInput, options?: RequestOptions): Promise<AuthTokens | MessageResponse | TwoFactorRequired> {
    const result = await this.client.post<AuthTokens | MessageResponse | TwoFactorRequired>('/auth/login', input, options)
    if (isAuthTokens(result)) {
      await this.client.setSession(result)
    }
    return result
  }

  /**
   * Send an OTP code to a phone number.
   */
  async sendOtp(input: SendOtpInput, options?: RequestOptions): Promise<MessageResponse> {
    return this.client.post<MessageResponse>('/auth/otp/send', input, options)
  }

  /**
   * Verify an OTP code. Tokens are auto-persisted.
   */
  async verifyOtp(input: VerifyOtpInput, options?: RequestOptions): Promise<AuthTokens> {
    const result = await this.client.post<AuthTokens>('/auth/otp/verify', input, options)
    await this.client.setSession(result)
    return result
  }

  /**
   * Refresh the access token using a refresh token.
   */
  async refresh(input: { refresh_token: string }, options?: RequestOptions): Promise<AuthTokens> {
    const result = await this.client.post<AuthTokens>('/auth/refresh', input, options)
    await this.client.setSession(result)
    return result
  }

  /**
   * Revoke the refresh token and log out. Clears stored session.
   */
  async logout(input: { refresh_token: string }, options?: RequestOptions): Promise<{ ok: boolean }> {
    const result = await this.client.post<{ ok: boolean }>('/auth/logout', input, options)
    await this.client.clearToken()
    return result
  }

  /**
   * Request a password reset email.
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
   * Verify 2FA code during login. Tokens are auto-persisted.
   */
  async verify2FA(input: Verify2FAInput, options?: RequestOptions): Promise<AuthTokens> {
    const result = await this.client.post<AuthTokens>('/auth/2fa/login', input, options)
    await this.client.setSession(result)
    return result
  }

  /**
   * Send a 2FA challenge during login (for SMS/email methods).
   * Call before verify2FA when the user picks a non-TOTP method.
   */
  async sendLogin2FAChallenge(input: { temp_token: string; method_id: string }, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/2fa/login/challenge', input, options)
  }

  /**
   * Send a verification code to the user's email.
   */
  async sendVerificationCode(email?: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/verify-email/send', email ? { email } : undefined, options)
  }

  /**
   * Verify the email with the 6-digit code.
   */
  async verifyEmail(code: string, email?: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/verify-email/confirm', email ? { code, email } : { code }, options)
  }

  /**
   * Upgrade the current user to a seller role.
   */
  async becomeSeller(input: BecomeSellerInput, options?: RequestOptions): Promise<{ ok: true; roles: string[]; sti_score: number }> {
    return this.client.post<{ ok: true; roles: string[]; sti_score: number }>('/auth/become-seller', input, options)
  }

  /**
   * Check if the account is eligible for deletion and what blockers exist.
   */
  async getDeletionEligibility(options?: RequestOptions): Promise<{ eligible: boolean; reasons: string[]; totp_enabled: boolean }> {
    return this.client.get<{ eligible: boolean; reasons: string[]; totp_enabled: boolean }>('/auth/account/deletion-eligibility', undefined, options)
  }

  /**
   * Request account deletion. Sends a confirmation email if eligible.
   */
  async requestAccountDeletion(options?: RequestOptions): Promise<{ ok: true } | { blocked: true; reasons: string[] }> {
    return this.client.post<{ ok: true } | { blocked: true; reasons: string[] }>('/auth/account/deletion-request', undefined, options)
  }

  /**
   * Confirm account deletion (from emailed link). Clears local session on success.
   */
  async confirmAccountDeletion(input: { token: string; code?: string }, options?: RequestOptions): Promise<{ ok: true }> {
    const result = await this.client.delete<{ ok: true }>('/auth/account', input, options)
    await this.client.clearToken()
    return result
  }

  // ── Passkey Login ──

  /**
   * Start passkey login — get assertion options for navigator.credentials.get().
   */
  async startPasskeyLogin(input: { temp_token: string; method_id?: string }, options?: RequestOptions): Promise<{ options: PublicKeyCredentialRequestOptionsJSON }> {
    return this.client.post<{ options: PublicKeyCredentialRequestOptionsJSON }>('/auth/2fa/login/passkey/start', input, options)
  }

  /**
   * Finish passkey login — submit the browser's assertion response. Tokens are auto-persisted.
   */
  async finishPasskeyLogin(input: { temp_token: string; credential: AuthenticationResponseJSON }, options?: RequestOptions): Promise<AuthTokens> {
    const result = await this.client.post<AuthTokens>('/auth/2fa/login/passkey/finish', input, options)
    await this.client.setSession(result)
    return result
  }
}
