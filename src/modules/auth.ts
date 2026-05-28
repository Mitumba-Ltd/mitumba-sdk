import { APIClient } from '../client'
import type {
  RegisterInput,
  LoginInput,
  SendOtpInput,
  VerifyOtpInput,
  AuthTokens,
  MessageResponse,
} from '../types'

export class AuthModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Register a new account.
   * If using EmailRegisterInput, returns AuthTokens.
   * If using PhoneRegisterInput, returns MessageResponse (OTP sent).
   */
  async register(input: RegisterInput): Promise<AuthTokens | MessageResponse> {
    return this.client.post<AuthTokens | MessageResponse>('/auth/register', input)
  }

  /**
   * Log in to an existing account.
   * If using EmailLoginInput, returns AuthTokens.
   * If using PhoneLoginInput, returns MessageResponse (OTP sent).
   */
  async login(input: LoginInput): Promise<AuthTokens | MessageResponse> {
    return this.client.post<AuthTokens | MessageResponse>('/auth/login', input)
  }

  /**
   * Send an OTP code to a phone number.
   */
  async sendOtp(input: SendOtpInput): Promise<MessageResponse> {
    return this.client.post<MessageResponse>('/auth/otp/send', input)
  }

  /**
   * Verify an OTP code.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<AuthTokens> {
    return this.client.post<AuthTokens>('/auth/otp/verify', input)
  }

  /**
   * Refresh the access token using a refresh token.
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    return this.client.post<AuthTokens>('/auth/refresh', { refresh_token: refreshToken })
  }

  /**
   * Revoke the refresh token and log out.
   */
  async logout(refreshToken: string): Promise<{ ok: boolean }> {
    return this.client.post<{ ok: boolean }>('/auth/logout', { refresh_token: refreshToken })
  }
}
