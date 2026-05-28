import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { AuthModule } from './auth'
import type { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput } from '../types'

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
      const refreshToken = 'my-refresh-token'
      const mockResponse = { access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 900 }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.refresh(refreshToken)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refresh_token: refreshToken }, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      const refreshToken = 'my-refresh-token'
      const mockResponse = { ok: true }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authModule.logout(refreshToken)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', { refresh_token: refreshToken }, undefined)
      expect(result).toEqual(mockResponse)
    })
  })
})
