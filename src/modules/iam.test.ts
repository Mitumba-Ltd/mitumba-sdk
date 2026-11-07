import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient, APIError } from '../client'
import { MemoryTokenStore } from '../token-store'
import { IamModule } from './iam'
import type { IamTokens } from '../types'

const TOKENS: IamTokens = {
  access_token: 'iam-access',
  refresh_token: 'iam-refresh',
  expires_in: 900,
  principal_type: 'iam',
  org_id: '123456789012',
  second_factor_enrolled: true,
}

function clientAndModule() {
  const client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
  return { client, iam: new IamModule(client) }
}

describe('IamModule session lifecycle', () => {
  let client: APIClient
  let iam: IamModule

  beforeEach(() => {
    ({ client, iam } = clientAndModule())
    vi.clearAllMocks()
  })

  it('starts sign-in and persists an immediate IAM session', async () => {
    vi.spyOn(client, 'post').mockResolvedValue(TOKENS)
    const setSession = vi.spyOn(client, 'setSession').mockResolvedValue()
    const input = { org: 'marketplace', email: 'ops@mitumba.africa', password: 'secret' }
    await expect(iam.login(input)).resolves.toBe(TOKENS)
    expect(client.post).toHaveBeenCalledWith('/auth/iam/login', input, undefined)
    expect(setSession).toHaveBeenCalledWith(TOKENS)
  })

  it('returns a second-factor challenge without persisting a session', async () => {
    const challenge = { requires_2fa: true as const, temp_token: 'temp', methods: [{ id: 'm1', type: 'totp' as const, label: 'Authenticator' }] }
    vi.spyOn(client, 'post').mockResolvedValue(challenge)
    const setSession = vi.spyOn(client, 'setSession')
    await expect(iam.login({ org: '1234-5678-9012', email: 'ops@mitumba.africa', password: 'secret' })).resolves.toBe(challenge)
    expect(setSession).not.toHaveBeenCalled()
  })

  it('finishes TOTP and passkey sign-in and persists each session', async () => {
    vi.spyOn(client, 'post').mockResolvedValue(TOKENS)
    const setSession = vi.spyOn(client, 'setSession').mockResolvedValue()
    await iam.verifyTwoFactor({ temp_token: 'temp', code: '123456', method_id: 'm1' })
    expect(client.post).toHaveBeenLastCalledWith('/auth/iam/login/2fa', { temp_token: 'temp', code: '123456', method_id: 'm1' }, undefined)
    await iam.finishPasskeyLogin({ temp_token: 'temp', credential: { id: 'cred', rawId: 'raw', type: 'public-key', response: { clientDataJSON: 'c', authenticatorData: 'a', signature: 's' } } })
    expect(client.post).toHaveBeenLastCalledWith('/auth/iam/login/passkey/finish', expect.objectContaining({ temp_token: 'temp' }), undefined)
    expect(setSession).toHaveBeenCalledTimes(2)
  })

  it('starts passkey sign-in', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ options: { challenge: 'c' } })
    await iam.startPasskeyLogin('temp')
    expect(client.post).toHaveBeenCalledWith('/auth/iam/login/passkey/start', { temp_token: 'temp' }, undefined)
  })

  it('activates, explicitly refreshes, and logs out', async () => {
    vi.spyOn(client, 'post')
      .mockResolvedValueOnce({ ok: true, next_step: 'Sign in' })
      .mockResolvedValueOnce(TOKENS)
      .mockResolvedValueOnce({ ok: true })
    const setSession = vi.spyOn(client, 'setSession').mockResolvedValue()
    const clear = vi.spyOn(client, 'clearToken').mockResolvedValue()
    vi.spyOn(client, 'getStoredRefreshToken').mockResolvedValue('iam-refresh')

    await iam.activate({ org: 'marketplace', email: 'ops@mitumba.africa', code: 'code', password: 'password' })
    expect(client.post).toHaveBeenNthCalledWith(1, '/auth/iam/activate', expect.anything(), undefined)
    await iam.refresh('iam-refresh')
    expect(client.post).toHaveBeenNthCalledWith(2, '/auth/iam/refresh', { refresh_token: 'iam-refresh' }, undefined)
    expect(setSession).toHaveBeenCalledWith(TOKENS)
    await iam.logout()
    expect(client.post).toHaveBeenNthCalledWith(3, '/auth/iam/logout', { refresh_token: 'iam-refresh' }, undefined)
    expect(clear).toHaveBeenCalled()
  })

  it('clears local state without a network request when logout has no refresh token', async () => {
    vi.spyOn(client, 'getStoredRefreshToken').mockResolvedValue(null)
    const post = vi.spyOn(client, 'post')
    const clear = vi.spyOn(client, 'clearToken').mockResolvedValue()
    await expect(iam.logout()).resolves.toEqual({ ok: true })
    expect(post).not.toHaveBeenCalled()
    expect(clear).toHaveBeenCalled()
  })
})

describe('IamModule self-service', () => {
  it('gets the profile and methods', async () => {
    const { client, iam } = clientAndModule()
    vi.spyOn(client, 'get').mockResolvedValue({})
    await iam.me()
    expect(client.get).toHaveBeenLastCalledWith('/auth/iam/me', undefined, undefined)
    await iam.listMethods()
    expect(client.get).toHaveBeenLastCalledWith('/auth/iam/2fa/methods', undefined, undefined)
  })

  it('adds and verifies an authenticator method', async () => {
    const { client, iam } = clientAndModule()
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true })
    await iam.addMethod({ type: 'totp', label: 'Work phone' })
    expect(client.post).toHaveBeenLastCalledWith('/auth/iam/2fa/methods', { type: 'totp', label: 'Work phone' }, undefined)
    await iam.verifyMethod('method/1', '123456')
    expect(client.post).toHaveBeenLastCalledWith('/auth/iam/2fa/methods/method%2F1/verify', { code: '123456' }, undefined)
  })

  it('finishes passkey enrollment', async () => {
    const { client, iam } = clientAndModule()
    const credential = { id: 'cred', rawId: 'raw', type: 'public-key', response: { clientDataJSON: 'c', attestationObject: 'a' } }
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true })
    await iam.finishPasskeyEnrollment('method/1', credential)
    expect(client.post).toHaveBeenCalledWith('/auth/iam/2fa/methods/method%2F1/passkey/finish', credential, undefined)
  })
})

describe('IamModule organization administration', () => {
  let client: APIClient
  let iam: IamModule

  beforeEach(() => {
    ({ client, iam } = clientAndModule())
    vi.clearAllMocks()
  })

  it('lists, creates, and updates organizations', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ organizations: [], kinds: [] })
    vi.spyOn(client, 'post').mockResolvedValue({ organization: {} })
    vi.spyOn(client, 'patch').mockResolvedValue({ organization: {} })
    await iam.listOrganizations()
    expect(client.get).toHaveBeenCalledWith('/auth/orgs', undefined, undefined)
    await iam.createOrganization({ alias: 'marketplace', name: 'Marketplace', kind: 'product' })
    expect(client.post).toHaveBeenCalledWith('/auth/orgs', { alias: 'marketplace', name: 'Marketplace', kind: 'product' }, undefined)
    await iam.updateOrganization('12/34', { status: 'suspended' })
    expect(client.patch).toHaveBeenCalledWith('/auth/orgs/12%2F34', { status: 'suspended' }, undefined)
  })

  it('lists and creates IAM users', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ iam_users: [] })
    vi.spyOn(client, 'post').mockResolvedValue({ iam_user: {}, activation: {} })
    await iam.listUsers('12/34')
    expect(client.get).toHaveBeenCalledWith('/auth/orgs/12%2F34/iam-users', undefined, undefined)
    const input = { email: 'ops@mitumba.africa', permissions: ['admin:read' as const] }
    await iam.createUser('12/34', input)
    expect(client.post).toHaveBeenCalledWith('/auth/orgs/12%2F34/iam-users', input, undefined)
  })

  it('grants and revokes encoded permissions', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true, permissions: [] })
    vi.spyOn(client, 'delete').mockResolvedValue({ ok: true, revoked: true, permissions: [] })
    await iam.grantPermission('org', 'user/a', 'listings:moderate')
    expect(client.post).toHaveBeenCalledWith('/auth/orgs/org/iam-users/user%2Fa/permissions', { permission: 'listings:moderate' }, undefined)
    await iam.revokePermission('org', 'user/a', 'listings:moderate')
    expect(client.delete).toHaveBeenCalledWith('/auth/orgs/org/iam-users/user%2Fa/permissions/listings%3Amoderate', undefined, undefined)
  })

  it('changes status and reissues activation', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true, status: 'disabled' })
    await iam.setUserStatus('org', 'user', 'disabled')
    expect(client.post).toHaveBeenLastCalledWith('/auth/orgs/org/iam-users/user/status', { status: 'disabled' }, undefined)
    vi.mocked(client.post).mockResolvedValue({ activation: {} })
    await iam.reissueActivation('org', 'user')
    expect(client.post).toHaveBeenLastCalledWith('/auth/orgs/org/iam-users/user/activation', undefined, undefined)
  })

  it.each([
    [400, 'invalid_input'],
    [401, 'session_expired'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [500, 'internal_error'],
  ])('preserves API errors (%i %s)', async (status, code) => {
    vi.spyOn(client, 'get').mockRejectedValue(new APIError(status, { error: code, message: code }))
    await expect(iam.listOrganizations()).rejects.toMatchObject({ status, code })
  })
})
