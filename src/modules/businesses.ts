import { APIClient } from '../client'
import type { Business, UpdateBusinessInput, RequestOptions } from '../types'

export class BusinessesModule {
  constructor(private readonly client: APIClient) {}

  /** Get all businesses owned by the current user. */
  async getMine(options?: RequestOptions): Promise<{ data: Business[] }> {
    return this.client.get<{ data: Business[] }>('/listings/businesses/mine', undefined, options)
  }

  /** Get a business by ID. */
  async getById(id: string, options?: RequestOptions): Promise<Business> {
    return this.client.get<Business>(`/listings/businesses/${id}`, undefined, options)
  }

  /** Update a business. */
  async update(id: string, input: UpdateBusinessInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.put<{ ok: true }>(`/listings/businesses/${id}`, input, options)
  }
}
