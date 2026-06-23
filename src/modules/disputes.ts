import { APIClient } from '../client'
import type { Dispute, RaiseDisputeInput, RespondDisputeInput, ResolveDisputeInput, DisputeListParams, RequestOptions } from '../types'

export class DisputesModule {
  constructor(private readonly client: APIClient) {}

  /** Raise a dispute on an order (buyer). */
  async raise(orderId: string, input: RaiseDisputeInput, options?: RequestOptions): Promise<{ dispute_id: string; status: 'open' }> {
    return this.client.post<{ dispute_id: string; status: 'open' }>(`/orders/${orderId}/dispute`, input, options)
  }

  /** Get the dispute for a specific order. */
  async getForOrder(orderId: string, options?: RequestOptions): Promise<Dispute> {
    return this.client.get<Dispute>(`/orders/${orderId}/dispute`, undefined, options)
  }

  /** Get a dispute by ID. */
  async get(disputeId: string, options?: RequestOptions): Promise<Dispute> {
    return this.client.get<Dispute>(`/orders/disputes/${disputeId}`, undefined, options)
  }

  /** Add evidence to a dispute. */
  async addEvidence(disputeId: string, input: { type: 'image' | 'text'; content: string }, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>(`/orders/disputes/${disputeId}/evidence`, input, options)
  }

  /** Escalate a dispute to admin review (buyer). */
  async escalate(disputeId: string, options?: RequestOptions): Promise<{ ok: true; status: 'under_review' }> {
    return this.client.post<{ ok: true; status: 'under_review' }>(`/orders/disputes/${disputeId}/escalate`, undefined, options)
  }

  /** Withdraw a dispute (buyer). */
  async withdraw(disputeId: string, options?: RequestOptions): Promise<{ ok: true; status: 'withdrawn' }> {
    return this.client.post<{ ok: true; status: 'withdrawn' }>(`/orders/disputes/${disputeId}/withdraw`, undefined, options)
  }

  /** Respond to a dispute (seller). */
  async respond(disputeId: string, input: RespondDisputeInput, options?: RequestOptions): Promise<{ ok: true; status?: string; voluntary?: boolean }> {
    return this.client.post<{ ok: true; status?: string; voluntary?: boolean }>(`/orders/disputes/${disputeId}/respond`, input, options)
  }

  /** List all disputes (admin). */
  async list(params?: DisputeListParams, options?: RequestOptions): Promise<{ data: Dispute[]; page: number; page_size: number }> {
    return this.client.get<{ data: Dispute[]; page: number; page_size: number }>(
      '/orders/disputes',
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /** Resolve a dispute (admin). */
  async resolve(disputeId: string, input: ResolveDisputeInput, options?: RequestOptions): Promise<{ ok: true; status: string; sti_impact: number }> {
    return this.client.post<{ ok: true; status: string; sti_impact: number }>(`/orders/disputes/${disputeId}/resolve`, input, options)
  }
}
