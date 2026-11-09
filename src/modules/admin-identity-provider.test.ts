import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient } from '../client'
import { MemoryTokenStore } from '../token-store'
import { AdminModule } from './admin'

describe('AdminModule identity provider: sign-in clients', () => {
  let client: APIClient
  let admin: AdminModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
  })

  it('lists clients', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ clients: [] })
    await expect(admin.listOAuthClients()).resolves.toEqual({ clients: [] })
    expect(client.get).toHaveBeenCalledWith('/admin/clients', undefined, undefined)
  })

  it('reads one client, encoding its id into the path', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ client_id: 'a/b' })
    await admin.getOAuthClient('a/b')
    expect(client.get).toHaveBeenCalledWith('/admin/clients/a%2Fb', undefined, undefined)
  })

  it('registers a client with the input as the body and returns the one-time secret', async () => {
    const created = { client_id: 'c1', client_secret: 'shown-once' }
    vi.spyOn(client, 'post').mockResolvedValue(created)
    const input = { name: 'Vuma', client_type: 'confidential' as const, trust_level: 'first_party_consent' as const, redirect_uris: ['https://vuma.africa/callback'], scopes: ['openid'] }
    await expect(admin.registerOAuthClient(input)).resolves.toEqual(created)
    expect(client.post).toHaveBeenCalledWith('/admin/clients', input, undefined)
  })

  it('deactivates a client', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true, is_active: false })
    await admin.deactivateOAuthClient('marketplace')
    expect(client.post).toHaveBeenCalledWith('/admin/clients/marketplace/deactivate', undefined, undefined)
  })

  it('replaces the redirect-URI allow-list and the scopes with PUT', async () => {
    vi.spyOn(client, 'put').mockResolvedValue({ ok: true })
    await admin.setOAuthClientRedirectUris('marketplace', ['https://app.mitumba.africa/callback'])
    await admin.setOAuthClientScopes('marketplace', ['openid', 'email'])
    expect(client.put).toHaveBeenNthCalledWith(1, '/admin/clients/marketplace/redirect-uris', { redirect_uris: ['https://app.mitumba.africa/callback'] }, undefined)
    expect(client.put).toHaveBeenNthCalledWith(2, '/admin/clients/marketplace/scopes', { scopes: ['openid', 'email'] }, undefined)
  })
})

describe('AdminModule identity provider: signing keys', () => {
  let client: APIClient
  let admin: AdminModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
  })

  it('lists the key window from the auth worker', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ keys: [] })
    await expect(admin.listOidcSigningKeys()).resolves.toEqual({ keys: [] })
    expect(client.get).toHaveBeenCalledWith('/auth/oidc/keys', undefined, undefined)
  })

  it('rotates with an empty POST and returns the new kid', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true, kid: 'k2' })
    await expect(admin.rotateOidcSigningKey()).resolves.toEqual({ ok: true, kid: 'k2' })
    expect(client.post).toHaveBeenCalledWith('/auth/oidc/keys/rotate', undefined, undefined)
  })
})
