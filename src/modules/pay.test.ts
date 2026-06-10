import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
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
      const mockResponse = { payment_id: 'pay_123', provider: 'daraja' }
      vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse)
      
      const input = { order_id: 'ord_123', phone: '+254700000000' }
      const result = await payModule.initiateStk(input)
      
      expect(apiClient.post).toHaveBeenCalledWith('/pay/stk', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getStatus', () => {
    it('calls GET /pay/status/:order_id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      
      await payModule.getStatus('ord_123')
      
      expect(apiClient.get).toHaveBeenCalledWith('/pay/status/ord_123', undefined, undefined)
    })
  })
})
