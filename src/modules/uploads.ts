import { APIClient } from '../client'
import type { RequestOptions } from '../types'

export class UploadsModule {
  constructor(private readonly client: APIClient) {}

  /** Upload a file (avatar, evidence, etc). Returns the public CDN URL. */
  async upload(file: Blob, options?: RequestOptions): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post<{ url: string }>('/listings/uploads', formData, options)
  }
}
