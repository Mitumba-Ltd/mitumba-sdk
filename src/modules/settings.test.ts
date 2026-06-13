import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { SettingsModule } from './settings'

describe('SettingsModule', () => {
  let apiClient: APIClient
  let settings: SettingsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    settings = new SettingsModule(apiClient)
  })

  describe('profile', () => {
    it('getProfile calls GET /auth/me', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await settings.getProfile()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me', undefined, undefined)
    })

    it('updateProfile calls PUT /auth/me', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({ ok: true })
      await settings.updateProfile({ display_name: 'Jane' })
      expect(apiClient.put).toHaveBeenCalledWith('/auth/me', { display_name: 'Jane' }, undefined)
    })
  })

  describe('security', () => {
    it('changePassword calls POST /auth/change-password', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      const input = { current_password: 'old', new_password: 'new123' }
      await settings.changePassword(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', input, undefined)
    })

    it('getSessions calls GET /auth/sessions', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await settings.getSessions()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions', undefined, undefined)
    })

    it('revokeSession calls DELETE /auth/sessions/:id', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await settings.revokeSession('sess_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/auth/sessions/sess_1', undefined)
    })
  })

  describe('notification prefs', () => {
    it('getNotificationPrefs calls GET /auth/notification-prefs', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await settings.getNotificationPrefs()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/notification-prefs', undefined, undefined)
    })

    it('updateNotificationPref calls PUT /auth/notification-prefs/:channel', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({ ok: true })
      await settings.updateNotificationPref('new_message', false)
      expect(apiClient.put).toHaveBeenCalledWith('/auth/notification-prefs/new_message', { enabled: false }, undefined)
    })
  })

  describe('preferences', () => {
    it('getPreferences calls GET /auth/preferences', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} })
      await settings.getPreferences()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/preferences', undefined, undefined)
    })

    it('updatePreferences calls PUT /auth/preferences', async () => {
      vi.spyOn(apiClient, 'put').mockResolvedValue({ ok: true })
      await settings.updatePreferences({ language: 'sw', dark_mode: 'true' })
      expect(apiClient.put).toHaveBeenCalledWith('/auth/preferences', { prefs: { language: 'sw', dark_mode: 'true' } }, undefined)
    })
  })

  describe('addresses', () => {
    it('getAddresses calls GET /auth/addresses', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await settings.getAddresses()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/addresses', undefined, undefined)
    })

    it('addAddress calls POST /auth/addresses', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'addr_1' })
      const input = { label: 'Home', name: 'Jane', phone: '+254712345678', line1: '123 St', line2: null, city: 'Nairobi', county: 'Nairobi' }
      await settings.addAddress(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/addresses', input, undefined)
    })

    it('deleteAddress calls DELETE /auth/addresses/:id', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await settings.deleteAddress('addr_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/auth/addresses/addr_1', undefined)
    })

    it('setDefaultAddress calls POST /auth/addresses/:id/default', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await settings.setDefaultAddress('addr_1')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/addresses/addr_1/default', undefined, undefined)
    })
  })

  describe('payment methods', () => {
    it('getPaymentMethods calls GET /auth/payment-methods', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await settings.getPaymentMethods()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/payment-methods', undefined, undefined)
    })

    it('addPaymentMethod calls POST /auth/payment-methods', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'pm_1' })
      const input = { type: 'mpesa' as const, label: 'My M-Pesa', detail: '+254712345678' }
      await settings.addPaymentMethod(input)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/payment-methods', input, undefined)
    })

    it('deletePaymentMethod calls DELETE /auth/payment-methods/:id', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await settings.deletePaymentMethod('pm_1')
      expect(apiClient.delete).toHaveBeenCalledWith('/auth/payment-methods/pm_1', undefined)
    })

    it('setDefaultPaymentMethod calls POST /auth/payment-methods/:id/default', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await settings.setDefaultPaymentMethod('pm_1')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/payment-methods/pm_1/default', undefined, undefined)
    })
  })

  describe('linked accounts', () => {
    it('getLinkedAccounts calls GET /auth/linked-accounts', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      await settings.getLinkedAccounts()
      expect(apiClient.get).toHaveBeenCalledWith('/auth/linked-accounts', undefined, undefined)
    })

    it('linkAccount calls POST /auth/linked-accounts', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await settings.linkAccount('google', 'oauth-token-123')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/linked-accounts', { provider: 'google', token: 'oauth-token-123' }, undefined)
    })

    it('unlinkAccount calls DELETE /auth/linked-accounts/:provider', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true })
      await settings.unlinkAccount('apple')
      expect(apiClient.delete).toHaveBeenCalledWith('/auth/linked-accounts/apple', undefined)
    })
  })

  describe('2FA', () => {
    it('setup2FA calls POST /auth/2fa/setup', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ secret: 'ABCD', otpauth_uri: 'otpauth://...' })
      await settings.setup2FA()
      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/setup', undefined, undefined)
    })

    it('verify2FA calls POST /auth/2fa/verify', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, backup_codes: ['a', 'b'] })
      await settings.verify2FA('123456')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/verify', { code: '123456' }, undefined)
    })

    it('disable2FA calls POST /auth/2fa/disable', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      await settings.disable2FA('654321')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/disable', { code: '654321' }, undefined)
    })
  })
})
