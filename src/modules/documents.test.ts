import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { DocumentsModule, isDocumentId } from './documents'
import { MemoryTokenStore } from '../token-store'

describe('DocumentsModule', () => {
  let apiClient: APIClient
  let documents: DocumentsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test', tokenStore: new MemoryTokenStore() })
    documents = new DocumentsModule(apiClient)
  })

  it('uploads with POST /listings/documents, sending purpose, subject and file', async () => {
    const stored = { id: 'doc_abc', purpose: 'dispute_evidence', content_type: 'image/webp', size_bytes: 10, created_at: '2026-01-01T00:00:00.000Z' }
    vi.spyOn(apiClient, 'post').mockResolvedValue(stored)
    const file = new Blob(['img'], { type: 'image/jpeg' })
    const result = await documents.upload({ file, purpose: 'dispute_evidence', subjectId: 'ord_1' })
    expect(result).toEqual(stored)
    const [path, body, options] = vi.mocked(apiClient.post).mock.calls[0]!
    expect(path).toBe('/listings/documents')
    expect(options).toBeUndefined()
    const form = body as FormData
    expect(form.get('purpose')).toBe('dispute_evidence')
    expect(form.get('subject_id')).toBe('ord_1')
    expect(form.get('file')).toBeInstanceOf(Blob)
  })

  it('reads a document as a file with GET /listings/documents/:id', async () => {
    const file = { blob: new Blob(['x']), contentType: 'image/webp', headers: new Headers() }
    vi.spyOn(apiClient, 'getFile').mockResolvedValue(file)
    expect(await documents.get('doc_abc')).toBe(file)
    expect(apiClient.getFile).toHaveBeenCalledWith('/listings/documents/doc_abc', undefined, undefined)
  })
})

describe('isDocumentId', () => {
  it('tells a document id from a URL', () => {
    expect(isDocumentId('doc_0123abcd')).toBe(true)
    expect(isDocumentId('https://cdn.example.com/a.webp')).toBe(false)
    expect(isDocumentId('doc_')).toBe(false)
    expect(isDocumentId('doc_ABC')).toBe(false)
  })
})
