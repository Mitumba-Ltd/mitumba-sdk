import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient, APIError } from '../client'
import { MemoryTokenStore } from '../token-store'
import { AdminModule } from './admin'

describe('AdminModule platform settings', () => {
  let client: APIClient
  let admin: AdminModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
  })

  it('lists settings and reads one with its history', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ settings: [] })
    await admin.listSettings()
    await admin.getSetting('email_2fa_enabled')
    expect(client.get).toHaveBeenNthCalledWith(1, '/admin/settings', undefined, undefined)
    expect(client.get).toHaveBeenNthCalledWith(2, '/admin/settings/email_2fa_enabled', undefined, undefined)
  })

  it('changes a setting with its reason', async () => {
    const result = { ok: true, unchanged: false, setting: { key: 'email_2fa_enabled', value: 'true' } }
    vi.spyOn(client, 'put').mockResolvedValue(result)
    await expect(admin.changeSetting('email_2fa_enabled', { value: 'true', reason: 'Launch' })).resolves.toEqual(result)
    expect(client.put).toHaveBeenCalledWith('/admin/settings/email_2fa_enabled', { value: 'true', reason: 'Launch' }, undefined)
  })

  it('surfaces a lock-out refusal', async () => {
    vi.spyOn(client, 'put').mockRejectedValue(new APIError(409, { error: 'would_lock_you_out', message: 'Keep your domain.' }))
    await expect(admin.changeSetting('admin_email_domains', { value: 'example.org', reason: 'Move' })).rejects.toMatchObject({ status: 409, code: 'would_lock_you_out' })
  })
})
