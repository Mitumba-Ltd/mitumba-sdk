import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient, APIError } from '../client'
import { MemoryTokenStore } from '../token-store'
import { NotificationsModule } from './notifications'
import type { NotificationPreferences } from '../types'

const preferences: NotificationPreferences = {
  categories: [{
    id: 'orders', label: 'Orders', description: 'Orders you placed or received.', kind: 'transactional', required: false,
    channels: [{ channel: 'in_app', enabled: true, default: true }, { channel: 'email', enabled: false, default: true }],
  }],
  channels: [{ channel: 'in_app', available: true }, { channel: 'email', available: true }],
  quietHours: { enabled: true, start: '21:00', end: '07:00', timeZone: 'Africa/Nairobi' },
  mutedFlashKinds: [],
  marketingConsent: [],
  consentWording: { email: 'Send me deals by email.' },
}

describe('NotificationsModule preferences', () => {
  let client: APIClient
  let notifications: NotificationsModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    notifications = new NotificationsModule(client)
  })

  it('reads the preferences', async () => {
    vi.spyOn(client, 'get').mockResolvedValue(preferences)
    await expect(notifications.getPreferences()).resolves.toEqual(preferences)
    expect(client.get).toHaveBeenCalledWith('/notify/notifications/preferences', undefined, undefined)
  })

  it('sets and resets cells', async () => {
    vi.spyOn(client, 'put').mockResolvedValue(preferences)
    const cells = [{ category: 'orders' as const, channel: 'email' as const, enabled: false }, { category: 'orders' as const, channel: 'push' as const, enabled: null }]
    await expect(notifications.updatePreferences(cells)).resolves.toEqual(preferences)
    expect(client.put).toHaveBeenCalledWith('/notify/notifications/preferences', { cells }, undefined)
  })

  it('changes quiet hours and pop-up mutes', async () => {
    vi.spyOn(client, 'put').mockResolvedValue(preferences)
    const input = { quietHours: { enabled: false, start: '22:30', end: '06:00', timeZone: 'Africa/Nairobi' }, mutedFlashKinds: ['announcement' as const] }
    await notifications.updatePreferenceSettings(input)
    expect(client.put).toHaveBeenCalledWith('/notify/notifications/preferences/settings', input, undefined)
  })

  it('sends only the channel and the choice for marketing consent', async () => {
    vi.spyOn(client, 'put').mockResolvedValue(preferences)
    await notifications.setMarketingConsent({ channel: 'email', granted: true, wording: 'injected' } as never)
    expect(client.put).toHaveBeenCalledWith('/notify/notifications/preferences/consent', { channel: 'email', granted: true }, undefined)
  })

  it('passes request options through', async () => {
    vi.spyOn(client, 'get').mockResolvedValue(preferences)
    const signal = new AbortController().signal
    await notifications.getPreferences({ signal })
    expect(client.get).toHaveBeenCalledWith('/notify/notifications/preferences', undefined, { signal })
  })

  it.each([
    [400, 'invalid_input'],
    [400, 'unknown_category'],
    [400, 'unknown_channel'],
    [400, 'invalid_time_zone'],
    [503, 'temporarily_unavailable'],
  ])('surfaces %i %s', async (status, error) => {
    vi.spyOn(client, 'put').mockRejectedValue(new APIError(status, { error, message: 'No.' }))
    await expect(notifications.updatePreferences([{ category: 'orders', channel: 'email', enabled: true }])).rejects.toMatchObject({ status, code: error })
  })
})
