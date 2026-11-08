import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient } from '../client'
import { MemoryTokenStore } from '../token-store'
import { AdminModule } from './admin'
import { DisputesModule } from './disputes'

describe('admin list filters and wholesale review', () => {
  let client: APIClient
  let admin: AdminModule
  let disputes: DisputesModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(client)
    disputes = new DisputesModule(client)
  })

  it('filters stores by owner', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [], page: 1, page_size: 25 })
    await admin.listStores({ seller_id: 'seller-a', verified: 1 })
    expect(client.get).toHaveBeenCalledWith('/admin/stores', { seller_id: 'seller-a', verified: 1 }, undefined)
  })

  it('lists disputes across every status and searches by ID', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [], page: 1, page_size: 25 })
    await disputes.list({ status: 'all', q: 'order-1', page: 2 })
    expect(client.get).toHaveBeenCalledWith('/orders/disputes', { status: 'all', q: 'order-1', page: 2 }, undefined)
  })

  it('lists wholesale applications by review state', async () => {
    vi.spyOn(client, 'get').mockResolvedValue({ data: [] })
    await admin.listWholesaleApplications({ status: 'rejected' })
    expect(client.get).toHaveBeenCalledWith('/admin/wholesale/pending', { status: 'rejected' }, undefined)
    await admin.listWholesaleApplications()
    expect(client.get).toHaveBeenLastCalledWith('/admin/wholesale/pending', undefined, undefined)
  })

  it('rejects a wholesale application with a reason, encoding the id', async () => {
    vi.spyOn(client, 'post').mockResolvedValue({ ok: true, review_status: 'rejected' })
    await expect(admin.rejectWholesaleStore('ws/1', 'KRA PIN mismatch')).resolves.toEqual({ ok: true, review_status: 'rejected' })
    expect(client.post).toHaveBeenCalledWith('/admin/wholesale/stores/ws%2F1/reject', { reason: 'KRA PIN mismatch' }, undefined)
  })
})
