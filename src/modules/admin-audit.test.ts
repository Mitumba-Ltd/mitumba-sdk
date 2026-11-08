import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient } from '../client'
import { MemoryTokenStore } from '../token-store'
import { AdminModule } from './admin'

describe('AdminModule.listAuditLog', () => {
  let client: APIClient
  let admin: AdminModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
  })

  it('passes filters and the cursor straight through', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ entries: [], next_cursor: null })
    await admin.listAuditLog({ actor: 'iam:abc', action: 'user.suspend', limit: 50, before: '2026-11-03T10:00:00.000Z|e4' })
    expect(client.get).toHaveBeenCalledWith('/admin/audit', { actor: 'iam:abc', action: 'user.suspend', limit: 50, before: '2026-11-03T10:00:00.000Z|e4' }, undefined)
  })

  it('defaults to the latest entries', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ entries: [], next_cursor: null })
    await expect(admin.listAuditLog()).resolves.toEqual({ entries: [], next_cursor: null })
    expect(client.get).toHaveBeenCalledWith('/admin/audit', {}, undefined)
  })
})
