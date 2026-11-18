import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { OrdersModule } from './orders'
import type { OrderStatus } from '../types'

describe('OrdersModule', () => {
  let apiClient: APIClient
  let ordersModule: OrdersModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    ordersModule = new OrdersModule(apiClient)
  })

  describe('create', () => {
    it('calls POST /orders', async () => {
      const mockResponse = { order_id: '123', total: 1000, delivery_fee: 100 }
      vi.spyOn(apiClient, 'post').mockResolvedValue(mockResponse)
      
      const input = { listing_id: 'lst_123' }
      const result = await ordersModule.create(input)
      
      expect(apiClient.post).toHaveBeenCalledWith('/orders', input, undefined)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getById', () => {
    it('calls GET /orders/:id', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({})
      await ordersModule.getById('ord_123')
      expect(apiClient.get).toHaveBeenCalledWith('/orders/ord_123', undefined, undefined)
    })

    it("returns the shop's items, settlement and next step when the shop reads it", async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({
        id: 'ord_123',
        items: [{ listing_id: 'l1', title: 'Denim jacket', image_url: null, quantity: 1, price: 1200 }],
        settlement: { currency: 'KES', lines: [{ kind: 'item', amount_minor: 120_000 }, { kind: 'commission', amount_minor: -12_000 }], receive_minor: 108_000, final: false },
        next_step: { holder: 'shop', step: 'get_ready', deadline: '2026-11-20T08:00:00.000Z' },
      })
      const order = await ordersModule.getById('ord_123')
      expect(order.settlement?.receive_minor).toBe(108_000)
      expect(order.next_step).toEqual({ holder: 'shop', step: 'get_ready', deadline: '2026-11-20T08:00:00.000Z' })
      expect(order.items?.[0]?.price).toBe(1200)
    })
  })

  describe('cancel', () => {
    it('calls POST /orders/:id/cancel with the reason and returns the refund', async () => {
      const result = { order_id: 'ord 1', status: 'cancelled', refund: { id: 'r1', amount: 1560, currency: 'KES', status: 'pending' }, shop_paused_until: null }
      vi.spyOn(apiClient, 'post').mockResolvedValue(result)
      const input = { reason: 'sold_elsewhere' as const, note: 'Sold at the stall' }
      expect(await ordersModule.cancel('ord 1', input)).toEqual(result)
      expect(apiClient.post).toHaveBeenCalledWith('/orders/ord%201/cancel', input, undefined)
    })

    it('propagates a refusal from the API', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('parcel_ready'))
      await expect(ordersModule.cancel('ord_1', { reason: 'other' })).rejects.toThrow('parcel_ready')
    })
  })

  describe('getDocument', () => {
    const file = (headers: Record<string, string>) => ({
      blob: new Blob(['%PDF-'], { type: 'application/pdf' }),
      contentType: 'application/pdf',
      headers: new Headers(headers),
    })

    it('calls GET /orders/:id/document and reads the kind and file name from the headers', async () => {
      vi.spyOn(apiClient, 'getFile').mockResolvedValue(file({
        'X-Mitumba-Document': 'receipt',
        'Content-Disposition': 'inline; filename="Mitumba-Receipt-RCT-1.pdf"',
      }))

      const document = await ordersModule.getDocument('ord_123')

      expect(apiClient.getFile).toHaveBeenCalledWith('/orders/ord_123/document', undefined, undefined)
      expect(document.kind).toBe('receipt')
      expect(document.filename).toBe('Mitumba-Receipt-RCT-1.pdf')
      expect(await document.blob.text()).toBe('%PDF-')
    })

    it('reads an RFC 5987 file name, falling back to the plain one when it is malformed', async () => {
      vi.spyOn(apiClient, 'getFile')
        .mockResolvedValueOnce(file({ 'Content-Disposition': "inline; filename=\"x.pdf\"; filename*=UTF-8''Mitumba%20Invoice.pdf" }))
        .mockResolvedValueOnce(file({ 'Content-Disposition': "inline; filename=\"plain.pdf\"; filename*=UTF-8''%E0%A4%A.pdf" }))
      expect((await ordersModule.getDocument('o')).filename).toBe('Mitumba Invoice.pdf')
      expect((await ordersModule.getDocument('o')).filename).toBe('plain.pdf')
    })

    it('treats a missing kind as an invoice and names a file it was not told the name of', async () => {
      vi.spyOn(apiClient, 'getFile')
        .mockResolvedValueOnce(file({}))
        .mockResolvedValueOnce(file({ 'Content-Disposition': 'inline' }))
      const first = await ordersModule.getDocument('ord/1')
      expect(apiClient.getFile).toHaveBeenCalledWith('/orders/ord%2F1/document', undefined, undefined)
      expect(first).toMatchObject({ kind: 'invoice', filename: 'Mitumba-ord/1.pdf' })
      expect((await ordersModule.getDocument('o2')).filename).toBe('Mitumba-o2.pdf')
    })

    it('passes request options through and propagates errors', async () => {
      const controller = new AbortController()
      const notFound = new Error('document_not_found')
      vi.spyOn(apiClient, 'getFile').mockRejectedValue(notFound)
      await expect(ordersModule.getDocument('o', { signal: controller.signal })).rejects.toBe(notFound)
      expect(apiClient.getFile).toHaveBeenCalledWith('/orders/o/document', undefined, { signal: controller.signal })
    })
  })

  describe('transition', () => {
    it('calls POST /orders/:id/transition', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({})
      const input = { status: 'shipped' as OrderStatus, note: 'On the way' }
      
      await ordersModule.transition('ord_123', input)
      
      expect(apiClient.post).toHaveBeenCalledWith('/orders/ord_123/transition', input, undefined)
    })
  })

  describe('getHistory', () => {
    it('calls GET /orders/history with params', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
      const params = { role: 'seller' as const, page: 2 }
      
      await ordersModule.getHistory(params)
      
      expect(apiClient.get).toHaveBeenCalledWith('/orders/history', params, undefined)
    })

    it('returns each entry with its item preview, unit count and invoice', async () => {
      const entry = {
        id: 'o1',
        items: [{ listing_id: 'l1', title: 'Denim jacket', image_url: 'https://cdn.example/l1.jpg', quantity: 2 }],
        item_count: 2,
        checkout_id: 'co1',
        invoice_number: 'INV-20261115-0000C001',
        next_step: { holder: 'courier', step: 'in_transit', deadline: null },
      }
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [entry], page: 1, page_size: 20 })

      const result = await ordersModule.getHistory({ role: 'seller', store_id: 's1' })

      expect(result.data[0]?.items[0]?.quantity).toBe(2)
      expect(result.data[0]).toMatchObject({ item_count: 2, invoice_number: 'INV-20261115-0000C001' })
      expect(result.data[0]?.next_step?.holder).toBe('courier')
    })

    it('propagates an error from the API', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('unauthorized'))
      await expect(ordersModule.getHistory()).rejects.toThrow('unauthorized')
    })
  })
})
