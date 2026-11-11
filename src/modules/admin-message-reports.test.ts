import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient, APIError } from '../client'
import { MemoryTokenStore } from '../token-store'
import { AdminModule } from './admin'

describe('AdminModule messaging safety reports', () => {
  let client: APIClient
  let admin: AdminModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
  })

  it('lists the queue by status and page', async () => {
    const list = { data: [], page: 2, page_size: 25, thresholds: { masked_attempts_24h: 3, upheld_reports_30d: 2, effect: 'queue_priority_only' } }
    vi.spyOn(client, 'get').mockResolvedValue(list)
    await expect(admin.listMessageReports({ status: 'open', page: 2 })).resolves.toEqual(list)
    await admin.listMessageReports()
    expect(client.get).toHaveBeenNthCalledWith(1, '/admin/message-reports', { status: 'open', page: 2 }, undefined)
    expect(client.get).toHaveBeenNthCalledWith(2, '/admin/message-reports', undefined, undefined)
  })

  it('opens one report, encoding its id', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ id: 'r/1', thread: [], restricted_original: null, restricted_original_available: false })
    await admin.getMessageReport('r/1')
    expect(client.get).toHaveBeenCalledWith('/admin/message-reports/r%2F1', undefined, undefined)
  })

  it('surfaces the step-up refusal for opening a report', async () => {
    vi.spyOn(client, 'get').mockRejectedValue(new APIError(403, { error: 'reauthentication_required', message: 'Sign in with a passkey.' }))
    await expect(admin.getMessageReport('r1')).rejects.toMatchObject({ status: 403, code: 'reauthentication_required' })
  })

  it('resolves a report with its status, outcome and note', async () => {
    const result = { ok: true, status: 'actioned', outcome: 'upheld', deduplicated: false }
    vi.spyOn(client, 'post').mockResolvedValue(result)
    await expect(admin.resolveMessageReport('r1', { status: 'actioned', outcome: 'upheld', note: 'Shared a phone number twice.' })).resolves.toEqual(result)
    expect(client.post).toHaveBeenCalledWith('/admin/message-reports/r1/resolve', { status: 'actioned', outcome: 'upheld', note: 'Shared a phone number twice.' }, undefined)
  })

  it('surfaces a conflicting resolution', async () => {
    vi.spyOn(client, 'post').mockRejectedValue(new APIError(409, { error: 'already_resolved', message: 'Already resolved.' }))
    await expect(admin.resolveMessageReport('r1', { status: 'dismissed', outcome: 'not_upheld' })).rejects.toMatchObject({ status: 409, code: 'already_resolved' })
  })

  it('filters payouts that need their provider reference repaired', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [], page: 1, page_size: 25 })
    await admin.listPayouts({ needs_correlation: 1 })
    expect(client.get).toHaveBeenCalledWith('/admin/payouts', { needs_correlation: 1 }, undefined)
  })
})
