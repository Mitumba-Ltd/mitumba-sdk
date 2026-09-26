import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { AdminModule } from './admin'
import { MemoryTokenStore } from '../token-store'

describe('AdminModule', () => {
  let apiClient: APIClient
  let admin: AdminModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(apiClient)
  })

  it('blockIp calls POST /admin/block-ip with a mandatory reason', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, blocked: '1.2.3.4', hours: 24, expires_at: 'later', note: 'shared address' })
    await admin.blockIp('1.2.3.4', 'credential stuffing')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/block-ip', { ip: '1.2.3.4', reason: 'credential stuffing', duration_hours: 24 }, undefined)
  })

  it('unblockIp calls POST /admin/unblock-ip', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, unblocked: '1.2.3.4' })
    await admin.unblockIp('1.2.3.4')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/unblock-ip', { ip: '1.2.3.4' }, undefined)
  })

  it('getBlockedIps calls GET /admin/blocked-ips', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
    await admin.getBlockedIps()
    expect(apiClient.get).toHaveBeenCalledWith('/admin/blocked-ips', undefined, undefined)
  })

  it('getSystemStats calls GET /admin/stats', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({})
    await admin.getSystemStats()
    expect(apiClient.get).toHaveBeenCalledWith('/admin/stats', undefined, undefined)
  })

  it('listUsers calls GET /admin/users', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], page: 1, page_size: 20 })
    await admin.listUsers({ q: 'jane', page: 2 })
    expect(apiClient.get).toHaveBeenCalledWith('/admin/users', { q: 'jane', page: 2 }, undefined)
  })

  it('getUser calls GET /admin/users/:id', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({})
    await admin.getUser('u_1')
    expect(apiClient.get).toHaveBeenCalledWith('/admin/users/u_1', undefined, undefined)
  })

  it('setUserRole calls POST /admin/users/:id/roles', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, roles: ['buyer', 'seller'] })
    await admin.setUserRole('u_1', 'seller', 'grant')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/users/u_1/roles', { role: 'seller', action: 'grant' }, undefined)
  })

  it('revokeUserSessions calls POST /admin/users/:id/revoke-sessions', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
    await admin.revokeUserSessions('u_1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/users/u_1/revoke-sessions', undefined, undefined)
  })

  it('listStores calls GET /admin/stores', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], page: 1, page_size: 20 })
    await admin.listStores({ verified: 1 })
    expect(apiClient.get).toHaveBeenCalledWith('/admin/stores', { verified: 1 }, undefined)
  })

  it('listVerifications calls GET /admin/verifications', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], page: 1, page_size: 20 })
    await admin.listVerifications({ status: 'pending' })
    expect(apiClient.get).toHaveBeenCalledWith('/admin/verifications', { status: 'pending' }, undefined)
  })

  it('approveVerification calls POST /admin/verifications/:id/approve', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, verification_status: 'verified' })
    await admin.approveVerification('u_1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/verifications/u_1/approve', undefined, undefined)
  })

  it('adjustSti calls POST /admin/sellers/:id/sti', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, score_before: 50, score_after: 55 })
    await admin.adjustSti('u_1', { delta: 5, reason: 'Good reviews' })
    expect(apiClient.post).toHaveBeenCalledWith('/admin/sellers/u_1/sti', { delta: 5, reason: 'Good reviews' }, undefined)
  })

  it('removeListing calls POST /admin/listings/:id/remove', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'removed' })
    await admin.removeListing('lst_1', 'Policy violation')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/listings/lst_1/remove', { reason: 'Policy violation' }, undefined)
  })

  it('forceTransitionOrder calls POST /admin/orders/:id/transition', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'cancelled' })
    await admin.forceTransitionOrder('ord_1', 'cancelled', 'Admin override')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/orders/ord_1/transition', { status: 'cancelled', note: 'Admin override' }, undefined)
  })

  it('disbursePayout calls POST /admin/payouts/:id/disburse', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, result: {} })
    await admin.disbursePayout('pay_1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/payouts/pay_1/disburse', undefined, undefined)
  })

  it('listReports calls GET /admin/reports', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], page: 1, page_size: 20 })
    await admin.listReports({ status: 'open', type: 'listing' })
    expect(apiClient.get).toHaveBeenCalledWith('/admin/reports', { status: 'open', type: 'listing' }, undefined)
  })

  it('resolveReport calls POST /admin/reports/:id/resolve', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, status: 'actioned' })
    await admin.resolveReport('rpt_1', 'actioned', 'Listing removed')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/reports/rpt_1/resolve', { status: 'actioned', note: 'Listing removed' }, undefined)
  })

  it('removeReview calls POST /admin/reviews/:id/remove', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, hidden: true })
    await admin.removeReview('rev_1', 'Fake review')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/reviews/rev_1/remove', { reason: 'Fake review' }, undefined)
  })

  it('removeVaziOutfit calls POST /admin/vazi/outfits/:id/remove', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, removed: true })
    await admin.removeVaziOutfit('vazi_1', 'Inappropriate')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/vazi/outfits/vazi_1/remove', { reason: 'Inappropriate' }, undefined)
  })

  it('broadcast calls POST /admin/broadcast', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, segment: 'all', recipients: 5000 })
    await admin.broadcast({ title: 'Sale!', body: '50% off everything', segment: 'all' })
    expect(apiClient.post).toHaveBeenCalledWith('/admin/broadcast', { title: 'Sale!', body: '50% off everything', segment: 'all' }, undefined)
  })
})



describe('AdminModule IAM, payout approval, and wholesale coverage', () => {
  let apiClient: APIClient
  let admin: AdminModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    admin = new AdminModule(apiClient)
  })

  it('lists operators and the role catalogue', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ operators: [] })
    await admin.listOperators()
    expect(apiClient.get).toHaveBeenLastCalledWith('/admin/operators', undefined, undefined)

    vi.mocked(apiClient.get).mockResolvedValue({ roles: [], permissions: [] })
    await admin.listAdminRoles()
    expect(apiClient.get).toHaveBeenLastCalledWith('/admin/roles', undefined, undefined)
  })

  it('grants and revokes one permission', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, already_held: false })
    vi.spyOn(apiClient, 'delete').mockResolvedValue({ ok: true, note: 'done' })

    await admin.grantOperatorPermission('u 1', 'payouts:disburse')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/operators/u 1/permissions', { permission: 'payouts:disburse' }, undefined)

    await admin.revokeOperatorPermission('u 1', 'payouts:disburse')
    expect(apiClient.delete).toHaveBeenCalledWith('/admin/operators/u 1/permissions/payouts%3Adisburse', undefined, undefined)
  })

  it('grants a role preset, which the backend expands into permissions', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, role: 'support_agent', granted: [], already_held: [] })

    await admin.grantOperatorRole('u_1', 'support_agent')

    expect(apiClient.post).toHaveBeenCalledWith('/admin/operators/u_1/roles', { role: 'support_agent' }, undefined)
  })

  it('reads the audit trail', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ entries: [] })

    await admin.getAuditLog(250)

    expect(apiClient.get).toHaveBeenCalledWith('/admin/audit', { limit: 250 }, undefined)
  })

  it('lists, approves, and holds payouts', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ payouts: [] })
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })

    await admin.listPayoutsAwaitingApproval()
    expect(apiClient.get).toHaveBeenCalledWith('/admin/payouts/pending-approval', undefined, undefined)

    await admin.approvePayout('p_1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/payouts/p_1/approve', undefined, undefined)

    await admin.holdPayout('p_1', 'seller under review')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/payouts/p_1/hold', { reason: 'seller under review' }, undefined)
  })

  it('repairs payout correlation through the endpoint the SDK previously missed', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })

    await admin.repairPayoutCorrelation('p_1', 'originator-1')

    expect(apiClient.post).toHaveBeenCalledWith('/admin/payouts/p_1/correlation', { provider_ref: 'originator-1' }, undefined)
  })

  it('covers wholesale verification', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })

    await admin.listPendingWholesaleStores()
    expect(apiClient.get).toHaveBeenCalledWith('/admin/wholesale/pending', undefined, undefined)

    await admin.verifyWholesaleStore('s_1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/wholesale/stores/s_1/verify', undefined, undefined)

    await admin.unverifyWholesaleStore('s_1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/wholesale/stores/s_1/unverify', undefined, undefined)
  })
})

describe('AdminModule blockIp compatibility', () => {
  it('keeps the published blockIp signature source-compatible', async () => {
    const apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    const admin = new AdminModule(apiClient)
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true, blocked: '1.2.3.4', hours: 12, expires_at: 'later', note: 'legacy' })

    // Old form: blockIp(ip, durationHours, options). The endpoint did not exist when published, but
    // preserving it avoids turning an implementation fix into an unrelated SDK break.
    await admin.blockIp('1.2.3.4', 12)

    expect(apiClient.post).toHaveBeenCalledWith('/admin/block-ip', {
      ip: '1.2.3.4',
      reason: 'No reason supplied by legacy SDK caller',
      duration_hours: 12,
    }, undefined)
  })
})
