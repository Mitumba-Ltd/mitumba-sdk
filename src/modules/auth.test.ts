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

  describe('sendLogin2FAChallenge', () => {
    it('calls POST /auth/2fa/login/challenge', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      const input = { temp_token: 'tmp_123', method_id: 'm_sms_1' }
      const result = await authModule.sendLogin2FAChallenge(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/login/challenge', input, undefined)
      expect(result).toEqual({ ok: true })
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

  describe('getDeletionEligibility', () => {
    it('calls GET /auth/account/deletion-eligibility', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ eligible: true, reasons: [], totp_enabled: false })
      const result = await authModule.getDeletionEligibility()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/account/deletion-eligibility', undefined, undefined)
      expect(result).toEqual({ eligible: true, reasons: [], totp_enabled: false })
    })
  })

  describe('requestAccountDeletion', () => {
    it('calls POST /auth/account/deletion-request', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ ok: true })
      const result = await authModule.requestAccountDeletion()
      expect(apiClient.post).toHaveBeenCalledWith('/auth/account/deletion-request', undefined, undefined)
      expect(result).toEqual({ ok: true })
    })
  })

  describe('confirmAccountDeletion', () => {
    it('calls DELETE /auth/account with token and clears session', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ ok: true })
      vi.spyOn(apiClient, 'clearToken').mockResolvedValueOnce(undefined)
      const result = await authModule.confirmAccountDeletion({ token: 'del_token_123', code: '654321' })
      expect(apiClient.delete).toHaveBeenCalledWith('/auth/account', { token: 'del_token_123', code: '654321' }, undefined)
      expect(apiClient.clearToken).toHaveBeenCalled()
      expect(result).toEqual({ ok: true })
    })
  })
})



describe('AuthModule capabilities, backup codes, and recovery coverage', () => {
  let apiClient: APIClient
  let auth: AuthModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    auth = new AuthModule(apiClient)
  })

  it('reads the public capability document', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ sms_otp_enabled: false, email_2fa_enabled: true, password_min_length: 8 })

    await auth.capabilities()

    expect(apiClient.get).toHaveBeenCalledWith('/auth/capabilities', undefined, undefined)
  })

  it('regenerates backup codes without persisting them', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ backup_codes: ['ABCD-EFGH-JK'], remaining: 1 })
    const setSession = vi.spyOn(apiClient, 'setSession')

    const result = await auth.regenerateBackupCodes('current password')

    expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/backup-codes/regenerate', { current_password: 'current password' }, undefined)
    expect(result.backup_codes).toEqual(['ABCD-EFGH-JK'])
    // Recovery credentials must never be written to the token store.
    expect(setSession).not.toHaveBeenCalled()
  })

  it('requests and checks recovery using the temp token', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'r1', status: 'pending', cooling_off_hours: 72, already_open: false })
    vi.spyOn(apiClient, 'get').mockResolvedValue({ status: 'pending', cooling_off_hours: 72 })

    await auth.requestRecovery({ temp_token: 'temp', reason: 'lost phone' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/recovery/request', { temp_token: 'temp', reason: 'lost phone' }, undefined)

    await auth.recoveryStatus('temp')
    expect(apiClient.get).toHaveBeenCalledWith('/auth/recovery/status', { temp_token: 'temp' }, undefined)
  })

  it('cancels with the emailed token', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })

    await auth.cancelRecovery('cancel-token')

    expect(apiClient.post).toHaveBeenCalledWith('/auth/recovery/cancel', { token: 'cancel-token' }, undefined)
  })

  it('persists tokens but not backup codes when recovery completes', async () => {
    const response = {
      access_token: 'access', refresh_token: 'refresh', expires_in: 900,
      backup_codes: ['ABCD-EFGH-JK'], payout_frozen_until: '2026-10-01T00:00:00.000Z', payout_freeze_days: 7,
    }
    vi.spyOn(apiClient, 'post').mockResolvedValue(response)
    const setSession = vi.spyOn(apiClient, 'setSession').mockResolvedValue(undefined)

    const result = await auth.completeRecovery('fresh-temp')

    expect(apiClient.post).toHaveBeenCalledWith('/auth/recovery/complete', { temp_token: 'fresh-temp' }, undefined)
    expect(setSession).toHaveBeenCalledWith(response)
    expect(result.backup_codes).toEqual(['ABCD-EFGH-JK'])
  })

  it('covers the recovery review queue and event trail', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ requests: [] })
    vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'r1', status: 'approved', effective_at: 'later' })

    await auth.listRecoveryRequests('pending')
    expect(apiClient.get).toHaveBeenCalledWith('/auth/recovery/queue', { status: 'pending' }, undefined)

    await auth.approveRecovery('r1', 'passport verified')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/recovery/r1/approve', { review_note: 'passport verified' }, undefined)

    vi.mocked(apiClient.post).mockResolvedValue({ id: 'r1', status: 'rejected' })
    await auth.rejectRecovery('r1', 'details did not match')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/recovery/r1/reject', { review_note: 'details did not match' }, undefined)

    vi.mocked(apiClient.get).mockResolvedValue({ events: [] })
    await auth.recoveryEvents('r1')
    expect(apiClient.get).toHaveBeenCalledWith('/auth/recovery/r1/events', undefined, undefined)
  })
})



describe('root setup and custom request headers', () => {
  it('sends the bootstrap secret in a header, never in the JSON body', async () => {
    const apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    const auth = new AuthModule(apiClient)
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, permissions: ['roles:grant', 'audit:read'], next_step: 'enrol' })

    await auth.setupRoot({
      email: 'root@mitumba.africa',
      password: 'a-long-password',
      setup_secret: 'one-time-secret',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/root/setup',
      { email: 'root@mitumba.africa', password: 'a-long-password' },
      { headers: { 'X-Root-Setup-Secret': 'one-time-secret' } },
    )
    const body = vi.mocked(apiClient.post).mock.calls[0]?.[1]
    expect(JSON.stringify(body)).not.toContain('one-time-secret')
  })
})
