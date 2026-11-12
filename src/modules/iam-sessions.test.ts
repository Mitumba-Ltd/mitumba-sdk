import { describe, expect, it, vi } from 'vitest'
import { APIClient, APIError } from '../client'
import { MemoryTokenStore } from '../token-store'
import { IamModule } from './iam'

function subject() {
  const client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
  return { client, iam: new IamModule(client) }
}

describe('IamModule sessions and sign-in history', () => {
  it('reads and ends this user\'s own sessions and sign-ins', async () => {
    const { client, iam } = subject()
    vi.spyOn(client, 'get').mockResolvedValue({ sessions: [] })
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true })
    await iam.listSessions()
    await iam.listSignIns({ limit: 20 })
    await iam.endSession('s/1')
    expect(client.get).toHaveBeenNthCalledWith(1, '/auth/iam/sessions', undefined, undefined)
    expect(client.get).toHaveBeenNthCalledWith(2, '/auth/iam/signins', { limit: 20 }, undefined)
    expect(client.post).toHaveBeenCalledWith('/auth/iam/sessions/s%2F1/revoke', undefined, undefined)
  })

  it('administers another user\'s sessions and reads their sign-ins', async () => {
    const { client, iam } = subject()
    vi.spyOn(client, 'get').mockResolvedValue({ signins: [] })
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true })
    await iam.listUserSessions('123456789012', 'u1')
    await iam.listUserSignIns('123456789012', 'u1', { limit: 5 })
    await iam.endUserSession('123456789012', 'u1', 's1')
    await iam.endAllUserSessions('123456789012', 'u1')
    expect(client.get).toHaveBeenNthCalledWith(1, '/auth/orgs/123456789012/iam-users/u1/sessions', undefined, undefined)
    expect(client.get).toHaveBeenNthCalledWith(2, '/auth/orgs/123456789012/iam-users/u1/signins', { limit: 5 }, undefined)
    expect(client.post).toHaveBeenNthCalledWith(1, '/auth/orgs/123456789012/iam-users/u1/sessions/s1/revoke', undefined, undefined)
    expect(client.post).toHaveBeenNthCalledWith(2, '/auth/orgs/123456789012/iam-users/u1/sessions/revoke-all', undefined, undefined)
  })

  it('surfaces a session that is not this user\'s as not found', async () => {
    const { client, iam } = subject()
    vi.spyOn(client, 'post').mockRejectedValue(new APIError(404, { error: 'not_found', message: 'No such session.' }))
    await expect(iam.endSession('someone-elses')).rejects.toMatchObject({ status: 404, code: 'not_found' })
  })
})
