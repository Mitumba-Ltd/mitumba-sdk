import { APIClient } from '../client'
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  Session,
  NotificationPref,
  Address,
  AddAddressInput,
  PaymentMethod,
  AddPaymentMethodInput,
  LinkedAccount,
  LinkedAccountProvider,
  TwoFactorMethod,
  Add2FAMethodInput,
  Add2FAMethodResult,
  UserProfile,
  RequestOptions,
} from '../types'

export class SettingsModule {
  constructor(private readonly client: APIClient) {}

  // ── Profile ──

  async getProfile(options?: RequestOptions): Promise<UserProfile> {
    return this.client.get<UserProfile>('/auth/me', undefined, options)
  }

  async updateProfile(input: UpdateProfileInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>('/auth/me', input, options)
  }

  // ── Security ──

  async changePassword(input: ChangePasswordInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/change-password', input, options)
  }

  async getSessions(options?: RequestOptions): Promise<{ data: Session[] }> {
    return this.client.get<{ data: Session[] }>('/auth/sessions', undefined, options)
  }

  async revokeSession(sessionId: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/auth/sessions/${sessionId}`, undefined, options)
  }

  // ── Notification Preferences ──

  async getNotificationPrefs(options?: RequestOptions): Promise<{ data: NotificationPref[] }> {
    return this.client.get<{ data: NotificationPref[] }>('/auth/notification-prefs', undefined, options)
  }

  async updateNotificationPref(channel: string, enabled: boolean, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/auth/notification-prefs/${channel}`, { enabled }, options)
  }

  // ── Preferences ──

  async getPreferences(options?: RequestOptions): Promise<{ data: Record<string, string> }> {
    return this.client.get<{ data: Record<string, string> }>('/auth/preferences', undefined, options)
  }

  async updatePreferences(prefs: Record<string, string>, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>('/auth/preferences', { prefs }, options)
  }

  // ── Addresses ──

  async getAddresses(options?: RequestOptions): Promise<{ data: Address[] }> {
    return this.client.get<{ data: Address[] }>('/auth/addresses', undefined, options)
  }

  async addAddress(input: AddAddressInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/auth/addresses', input, options)
  }

  async updateAddress(id: string, input: Partial<AddAddressInput>, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/auth/addresses/${id}`, input, options)
  }

  async deleteAddress(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/auth/addresses/${id}`, undefined, options)
  }

  async setDefaultAddress(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/auth/addresses/${id}/default`, undefined, options)
  }

  // ── Payment Methods ──

  async getPaymentMethods(options?: RequestOptions): Promise<{ data: PaymentMethod[] }> {
    return this.client.get<{ data: PaymentMethod[] }>('/auth/payment-methods', undefined, options)
  }

  async addPaymentMethod(input: AddPaymentMethodInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/auth/payment-methods', input, options)
  }

  async deletePaymentMethod(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/auth/payment-methods/${id}`, undefined, options)
  }

  async setDefaultPaymentMethod(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/auth/payment-methods/${id}/default`, undefined, options)
  }

  // ── Linked Accounts ──

  async getLinkedAccounts(options?: RequestOptions): Promise<{ data: LinkedAccount[] }> {
    return this.client.get<{ data: LinkedAccount[] }>('/auth/linked-accounts', undefined, options)
  }

  async linkAccount(provider: LinkedAccountProvider, token: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/linked-accounts', { provider, token }, options)
  }

  async unlinkAccount(provider: LinkedAccountProvider, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/auth/linked-accounts/${provider}`, undefined, options)
  }

  // ── 2FA ──

  async setup2FA(options?: RequestOptions): Promise<{ secret: string; otpauth_uri: string }> {
    return this.client.post<{ secret: string; otpauth_uri: string }>('/auth/2fa/setup', undefined, options)
  }

  async verify2FA(code: string, options?: RequestOptions): Promise<{ ok: true; backup_codes: string[] }> {
    return this.client.post<{ ok: true; backup_codes: string[] }>('/auth/2fa/verify', { code }, options)
  }

  async disable2FA(code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/2fa/disable', { code }, options)
  }

  async enable2FA(code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/auth/2fa/enable', { code }, options)
  }

  async delete2FA(code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>('/auth/2fa', { code }, options)
  }

  // ── Multi-Method 2FA ──

  async list2FAMethods(options?: RequestOptions): Promise<{ methods: TwoFactorMethod[] }> {
    return this.client.get<{ methods: TwoFactorMethod[] }>('/auth/2fa/methods', undefined, options)
  }

  async add2FAMethod(input: Add2FAMethodInput, options?: RequestOptions): Promise<Add2FAMethodResult> {
    return this.client.post<Add2FAMethodResult>('/auth/2fa/methods', input, options)
  }

  async verify2FAMethod(id: string, code: string, options?: RequestOptions): Promise<{ ok: true; backup_codes?: string[] }> {
    return this.client.post<{ ok: true; backup_codes?: string[] }>(`/auth/2fa/methods/${id}/verify`, { code }, options)
  }

  async enable2FAMethod(id: string, code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/auth/2fa/methods/${id}/enable`, { code }, options)
  }

  async disable2FAMethod(id: string, code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/auth/2fa/methods/${id}/disable`, { code }, options)
  }

  async delete2FAMethod(id: string, code: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/auth/2fa/methods/${id}`, { code }, options)
  }

  async setPrimary2FAMethod(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/auth/2fa/methods/${id}/primary`, undefined, options)
  }

  async challenge2FAMethod(id: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/auth/2fa/methods/${id}/challenge`, undefined, options)
  }
}
