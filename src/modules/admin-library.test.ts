import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient } from '../client'
import { MemoryTokenStore } from '../token-store'
import { AdminModule } from './admin'

describe('AdminModule operations library', () => {
  let client: APIClient
  let admin: AdminModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
  })

  it('lists the documents the caller may read', async () => {
    const listing = { documents: [], can_read_all: false }
    vi.spyOn(client, 'get').mockResolvedValue(listing)
    await expect(admin.listLibrary()).resolves.toEqual(listing)
    expect(client.get).toHaveBeenCalledWith('/admin/library', undefined, undefined)
  })

  it('reads one document, encoding its slug into the path', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ slug: 'incident-response', markdown: '# Incident' })
    await admin.getLibraryDocument('incident-response')
    await admin.getLibraryDocument('a/b')
    expect(client.get).toHaveBeenNthCalledWith(1, '/admin/library/incident-response', undefined, undefined)
    expect(client.get).toHaveBeenNthCalledWith(2, '/admin/library/a%2Fb', undefined, undefined)
  })
})
