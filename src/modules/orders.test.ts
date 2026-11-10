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
  })
})
