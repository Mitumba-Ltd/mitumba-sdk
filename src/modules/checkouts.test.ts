import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { APIClient, APIError } from '../client'
import type { Checkout, CreateCheckoutInput } from '../types/checkouts'
import { CheckoutsModule, checkoutRefusal } from './checkouts'

const kes = (minor_units: number) => ({ currency: 'KES', minor_units })

const CHECKOUT: Checkout = {
  id: 'co_1',
  invoice_number: 'INV-20261112-CO1',
  status: 'awaiting_payment',
  market_code: 'KE',
  items_total: kes(570_000),
  delivery_total: kes(65_000),
  bpf_total: kes(28_500),
  total: kes(663_500),
  due_at: '2026-11-12T10:30:00.000Z',
  created_at: '2026-11-12T10:00:00.000Z',
  orders: [
    { order_id: 'ord_a', store_id: 'store_a', items_total: kes(320_000), delivery_fee: kes(25_000), bpf: kes(16_000), total: kes(361_000) },
    { order_id: 'ord_b', store_id: 'store_b', items_total: kes(250_000), delivery_fee: kes(40_000), bpf: kes(12_500), total: kes(302_500) },
  ],
}

const INPUT: CreateCheckoutInput = {
  address_id: 'addr_1',
  idempotency_key: 'intent-0001',
  deliveries: [{ store_id: 'store_a', quote_id: 'q_a' }, { store_id: 'store_b', quote_id: 'q_b' }],
}

describe('CheckoutsModule', () => {
  let client: APIClient
  let checkouts: CheckoutsModule

  beforeEach(() => {
    client = new APIClient({ baseUrl: 'https://api.mitumba.test', token: 'token' })
    checkouts = new CheckoutsModule(client)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('create', () => {
    it('posts the address, idempotency key and per-shop deliveries to POST /orders/checkout', async () => {
      const response = { checkout: CHECKOUT, order_ids: ['ord_a', 'ord_b'], count: 2 }
      vi.spyOn(client, 'post').mockResolvedValue(response)
      expect(await checkouts.create(INPUT)).toEqual(response)
      expect(client.post).toHaveBeenCalledWith('/orders/checkout', INPUT, undefined)
    })

    it('passes request options through', async () => {
      vi.spyOn(client, 'post').mockResolvedValue({ checkout: CHECKOUT, order_ids: [], count: 0 })
      const signal = new AbortController().signal
      await checkouts.create(INPUT, { signal })
      expect(client.post).toHaveBeenCalledWith('/orders/checkout', INPUT, { signal })
    })

    it('throws a refusal whose details can be read with checkoutRefusal', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response(
        JSON.stringify({ error: 'listing_unavailable', listings: [{ listing_id: 'l_1', available: 1 }] }),
        { status: 409, headers: { 'content-type': 'application/json' } },
      )))
      const error = await checkouts.create(INPUT).catch((thrown: unknown) => thrown)
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).code).toBe('listing_unavailable')
      expect(checkoutRefusal(error)).toEqual({ error: 'listing_unavailable', listings: [{ listing_id: 'l_1', available: 1 }] })
    })
  })

  describe('get', () => {
    it('reads GET /orders/checkouts/:id, encoding the id', async () => {
      vi.spyOn(client, 'get').mockResolvedValue({ checkout: CHECKOUT })
      expect(await checkouts.get('co 1')).toEqual({ checkout: CHECKOUT })
      expect(client.get).toHaveBeenCalledWith('/orders/checkouts/co%201', undefined, undefined)
    })

    it('rejects with the API error when the checkout is not the buyer\'s', async () => {
      vi.spyOn(client, 'get').mockRejectedValue(new APIError(404, { error: 'not_found', message: 'Checkout not found.' }))
      await expect(checkouts.get('co_other')).rejects.toMatchObject({ status: 404, code: 'not_found' })
    })
  })
})

describe('checkoutRefusal', () => {
  it('returns each known refusal body', () => {
    for (const body of [
      { error: 'delivery_required', store_ids: ['store_a'] },
      { error: 'checkout_payment_in_progress', checkout_id: 'co_0' },
      { error: 'delivery_quote_rejected', store_id: null, reason: 'expired' },
      { error: 'delivery_quotes_unavailable' },
    ]) expect(checkoutRefusal(new APIError(409, { error: body.error }, body))).toEqual(body)
  })

  it('returns null for anything that is not a checkout refusal', () => {
    expect(checkoutRefusal(new Error('boom'))).toBeNull()
    expect(checkoutRefusal('listing_unavailable')).toBeNull()
    expect(checkoutRefusal(new APIError(500, { error: 'internal_error' }))).toBeNull()
    expect(checkoutRefusal(new APIError(500, { error: 'internal_error' }, 'not json'))).toBeNull()
    expect(checkoutRefusal(new APIError(500, { error: 'internal_error' }, { error: 42 }))).toBeNull()
    expect(checkoutRefusal(new APIError(500, { error: 'internal_error' }, { error: 'internal_error' }))).toBeNull()
  })
})
