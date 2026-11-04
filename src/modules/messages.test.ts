import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient, APIError } from '../client'
import { MessagesModule } from './messages'

describe('MessagesModule v2 abuse control', () => {
  let apiClient: APIClient
  let messagesModule: MessagesModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    messagesModule = new MessagesModule(apiClient)
    vi.restoreAllMocks()
  })

  it('creates blocks per perspective, files reports, and removes blocks (v2 envelope)', async () => {
    const post = vi.spyOn(apiClient, 'post')
      .mockResolvedValueOnce({ api_version: 2, data: { id: 'block', active: true, deduplicated: false } })
      .mockResolvedValueOnce({ api_version: 2, data: { id: 'block2', active: true, deduplicated: false } })
      .mockResolvedValueOnce({ api_version: 2, data: { id: 'report', status: 'open', deduplicated: false } })
    const remove = vi.spyOn(apiClient, 'delete')
      .mockResolvedValueOnce({ api_version: 2, data: { ok: true, active: false } })

    const buyerBlock = await messagesModule.createMessagingBlock({ kind: 'buyer' }, { store_id: 'store/a', reason: 'spam' })
    expect(buyerBlock).toEqual({ id: 'block', active: true, deduplicated: false })
    expect(post.mock.calls[0]).toEqual(['/notify/v2/inboxes/buyer/blocks', { store_id: 'store/a', reason: 'spam' }, undefined])

    const storeBlock = await messagesModule.createMessagingBlock({ kind: 'store', store_id: 'store/a' }, { buyer_id: 'buyer1' })
    expect(storeBlock.id).toBe('block2')
    expect(post.mock.calls[1]).toEqual(['/notify/v2/inboxes/stores/store%2Fa/blocks', { buyer_id: 'buyer1' }, undefined])

    const report = await messagesModule.createMessagingReport(
      { kind: 'buyer' },
      { subject_kind: 'conversation', partner_id: 'seller', store_id: 'store1', reason: 'spam' },
    )
    expect(report).toEqual({ id: 'report', status: 'open', deduplicated: false })
    expect(post.mock.calls[2][0]).toBe('/notify/v2/inboxes/buyer/reports')

    const removed = await messagesModule.removeMessagingBlock({ kind: 'store', store_id: 'store/a' }, 'block/a')
    expect(removed).toEqual({ ok: true, active: false })
    expect(remove).toHaveBeenCalledWith('/notify/v2/inboxes/stores/store%2Fa/blocks/block%2Fa', undefined, undefined)
  })

  it('rejects a response that is not a v2 envelope', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ id: 'x', active: true })
    await expect(messagesModule.createMessagingBlock({ kind: 'buyer' }, { store_id: 's' })).rejects.toBeInstanceOf(APIError)
  })
})
