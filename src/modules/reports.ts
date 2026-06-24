import { APIClient } from '../client'
import type { CreateReportInput, RequestOptions } from '../types'

export class ReportsModule {
  constructor(private readonly client: APIClient) {}

  /** Report a listing, review, store, or user for admin review. */
  async create(input: CreateReportInput, options?: RequestOptions): Promise<{ ok: true; already_reported?: boolean }> {
    return this.client.post<{ ok: true; already_reported?: boolean }>('/listings/reports', input, options)
  }
}
