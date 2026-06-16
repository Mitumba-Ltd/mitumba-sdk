import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { AuthModule } from './auth'
import type { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput, BecomeSellerInput } from '../types'

describe('AuthModule', () => {
  let apiClient: APIClient
  let authModule: AuthModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    // Mock the post method of APIClient
    vi.spyOn(apiClient, 'post').mockResolvedValue(undefined)
    authModule = new AuthModule(apiClient)
  })

  describe('register', () => {
    it('calls POST /auth/register with email input', async () => {
      const input: RegisterInput = { email: 'test@example.com', password: 'password123', display_name: 'Test' }
      const mockResponse = { access_token: 'access', refresh_token: 'refresh', expires_in: 900 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.register(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', input, undefined)
      expect(result).toEqual(mockResponse)
    })

    it('calls POST /auth/register with phone input', async () => {
      const input: RegisterInput = { phone: '+254700000000' }
      const mockResponse = { message: 'OTP sent.' }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.register(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('login', () => {
    it('calls POST /auth/login with email input', async () => {
      const input: LoginInput = { email: 'test@example.com', password: 'password123' }
      const mockResponse = { access_token: 'access', refresh_token: 'refresh', expires_in: 900 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.login(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', input, undefined)
      expect(result).toEqual(mockResponse)
    })

    it('calls POST /auth/login with phone input', async () => {
      const input: LoginInput = { phone: '+254700000000' }
      const mockResponse = { message: 'OTP sent.' }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.login(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('sendOtp', () => {
    it('calls POST /auth/otp/send', async () => {
      const input: SendOtpInput = { phone: '+254700000000' }
      const mockResponse = { message: 'OTP sent.' }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.sendOtp(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/send', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('verifyOtp', () => {
    it('calls POST /auth/otp/verify', async () => {
      const input: VerifyOtpInput = { phone: '+254700000000', code: '123456' }
      const mockResponse = { access_token: 'access', refresh_token: 'refresh', expires_in: 900 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.verifyOtp(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/verify', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('refresh', () => {
    it('calls POST /auth/refresh', async () => {
      const input = { refresh_token: 'my-refresh-token' }
      const mockResponse = { access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 900 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.refresh(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      const input = { refresh_token: 'my-refresh-token' }
      const mockResponse = { ok: true }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.logout(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('forgotPassword', () => {
    it('calls POST /auth/forgot-password with email', async () => {
      const input = { email: 'user@example.com' }
      const mockResponse = { message: 'Reset link sent' }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.forgotPassword(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('resetPassword', () => {
    it('calls POST /auth/reset-password with token and password', async () => {
      const input = { token: 'reset-token-abc', password: 'newPassword123' }
      const mockResponse = { message: 'Password reset successfully' }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.resetPassword(input)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('me', () => {
    it('calls GET /auth/me', async () => {
      const mockResponse = {
        id: 'user_1',
        email: 'test@example.com',
        phone: null,
        display_name: 'Test',
        city_id: 'nbi',
        onboarding_completed: true,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
        roles: ['buyer'],
      }
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse)

      const result = await authModule.me()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me', undefined, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('completeOnboarding', () => {
    it('calls POST /auth/onboarding/complete', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      const input = { display_name: 'Jane', county: 'Nairobi', phone: '+254712345678' }
      const result = await authModule.completeOnboarding(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/onboarding/complete', input, undefined)
      expect(result).toEqual({ ok: true })
    })
  })

  describe('verify2FA', () => {
    it('calls POST /auth/2fa/login', async () => {
      const mockResponse = { access_token: 'access', refresh_token: 'refresh', expires_in: 900 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)
      const input = { temp_token: 'tmp_123', code: '123456' }
      const result = await authModule.verify2FA(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/login', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('sendVerificationCode', () => {
    it('calls POST /auth/verify-email/send without email when authenticated', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      await authModule.sendVerificationCode()
      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email/send', undefined, undefined)
    })

    it('calls POST /auth/verify-email/send with email when unauthenticated', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      await authModule.sendVerificationCode('user@example.com')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email/send', { email: 'user@example.com' }, undefined)
    })
  })

  describe('verifyEmail', () => {
    it('calls POST /auth/verify-email/confirm with code only', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      await authModule.verifyEmail('123456')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email/confirm', { code: '123456' }, undefined)
    })

    it('calls POST /auth/verify-email/confirm with code and email', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      await authModule.verifyEmail('123456', 'user@example.com')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email/confirm', { code: '123456', email: 'user@example.com' }, undefined)
    })
  })

  describe('becomeSeller', () => {
    it('calls POST /auth/become-seller with input', async () => {
      const mockResponse = { ok: true, roles: ['buyer', 'seller'], sti_score: 55 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)
      const input: BecomeSellerInput = { seller_type: 'individual', sti_score: 55, county: 'Nairobi' }
      const result = await authModule.becomeSeller(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/become-seller', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })
})
