import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient, APIError } from '../client'
import {
  checkoutInitiationFixtures,
  checkoutStatusFixtures,
  retailPendingCheckout,
} from './__fixtures__/pay'
import { PayModule } from './pay'

describe('PayModule', () => {
  let apiClient: APIClient
  let payModule: PayModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    payModule = new PayModule(apiClient)
  })

  describe('initiateStk', () => {
    it('calls POST /pay/stk', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ payment_id: 'pay_1', provider: 'daraja' })
      const input = { order_id: 'ord_1', phone: '+254700000000' }
      await payModule.initiateStk(input)
      expect(apiClient.post).toHaveBeenCalledWith('/pay/stk', input, undefined)
    })
  })

  describe('initMpesa', () => {
    it('calls POST /pay/stk', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ payment_id: 'pay_1', provider: 'daraja' })
      const input = { order_id: 'ord_1', phone: '+254700000000' }
      await payModule.initMpesa(input)
      expect(apiClient.post).toHaveBeenCalledWith('/pay/stk', input, undefined)
    })
  })

  describe('initPaystack', () => {
    it('calls POST /pay/paystack/init', async () => {
      const mockResponse = { access_code: 'ac_123', authorization_url: 'https://paystack.com/pay/abc', reference: 'ref_1' }
      vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse)
      const input = { order_id: 'ord_1', email: 'buyer@example.com' }
      const result = await payModule.initPaystack(input)
      expect(apiClient.post).toHaveBeenCalledWith('/pay/paystack/init', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('initiateCheckout', () => {
    it.each(checkoutInitiationFixtures)(
      'posts the $input.method.type method and passes through its next action',
      async ({ input, response }) => {
        const options = { signal: new AbortController().signal }
        vi.spyOn(apiClient, 'post').mockResolvedValue(response)

        const result = await payModule.initiateCheckout(input, options)

        expect(apiClient.post).toHaveBeenCalledWith('/pay/checkout/initiate', input, options)
        expect(result).toBe(response)
      },
    )

    it.each([
      [400, 'invalid_input'],
      [401, 'unauthorized'],
      [404, 'not_found'],
      [409, 'order_not_payable'],
      [409, 'idempotency_conflict'],
      [422, 'payment_method_unavailable'],
      [503, 'payment_initiation_paused'],
      [503, 'payment_provider_unavailable'],
    ] as const)('passes through APIError(%i, %s) unchanged', async (status, code) => {
      const { input } = checkoutInitiationFixtures[0]
      const error = new APIError(status, { error: code })
      vi.spyOn(apiClient, 'post').mockRejectedValue(error)

      await expect(payModule.initiateCheckout(input)).rejects.toBe(error)
    })
  })

  describe('getStatus', () => {
    it('preserves the legacy route, options, and response passthrough', async () => {
      const response = { id: 'pay_1', status: 'funded' as const, total: 1500 }
      const options = { signal: new AbortController().signal }
      vi.spyOn(apiClient, 'get').mockResolvedValue(response)

      const result = await payModule.getStatus('ord_1', options)

      expect(apiClient.get).toHaveBeenCalledWith('/pay/status/ord_1', undefined, options)
      expect(result).toBe(response)
    })
  })

  describe('getCheckoutStatus', () => {
    it('calls the checkout route with no query and forwards request options', async () => {
      const options = { signal: new AbortController().signal }
      vi.spyOn(apiClient, 'get').mockResolvedValue(retailPendingCheckout)

      const result = await payModule.getCheckoutStatus('ord_1', options)

      expect(apiClient.get).toHaveBeenCalledWith('/pay/checkout-status/ord_1', undefined, options)
      expect(result).toBe(retailPendingCheckout)
    })

    it.each(checkoutStatusFixtures)('passes through the $order_id lifecycle fixture', async (fixture) => {
      vi.spyOn(apiClient, 'get').mockResolvedValue(fixture)

      const result = await payModule.getCheckoutStatus(fixture.order_id)

      expect(apiClient.get).toHaveBeenCalledWith(
        `/pay/checkout-status/${fixture.order_id}`,
        undefined,
        undefined,
      )
      expect(result).toBe(fixture)
    })
  })
})
