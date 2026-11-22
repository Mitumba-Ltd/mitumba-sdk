import { APIClient } from '../client'
import type { FileResponse, PrivateDocument, RequestOptions, UploadDocumentInput } from '../types'

/** Whether a stored value refers to a private document (`doc_…`) rather than a URL. */
export function isDocumentId(value: string): boolean {
  return /^doc_[a-z0-9]{1,60}$/.test(value)
}

export class DocumentsModule {
  constructor(private readonly client: APIClient) {}

  /** Upload a private document. Returns its id; the file itself is never public. */
  async upload(input: UploadDocumentInput, options?: RequestOptions): Promise<PrivateDocument> {
    const formData = new FormData()
    formData.append('purpose', input.purpose)
    formData.append('subject_id', input.subjectId)
    formData.append('file', input.file)
    return this.client.post<PrivateDocument>('/listings/documents', formData, options)
  }

  /** Read a private document the signed-in user may see. 404 for any other. */
  async get(documentId: string, options?: RequestOptions): Promise<FileResponse> {
    return this.client.getFile(`/listings/documents/${encodeURIComponent(documentId)}`, undefined, options)
  }
}
