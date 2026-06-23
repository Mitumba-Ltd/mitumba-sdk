export const DISPUTE_REASONS = ['not_received', 'not_as_described', 'damaged', 'counterfeit', 'wrong_item'] as const
export type DisputeReason = typeof DISPUTE_REASONS[number]

export const DESIRED_RESOLUTIONS = ['refund', 'replacement', 'partial_refund'] as const
export type DesiredResolution = typeof DESIRED_RESOLUTIONS[number]

export const DISPUTE_STATUSES = ['open', 'seller_responded', 'under_review', 'resolved_refund', 'resolved_release', 'resolved_partial', 'withdrawn'] as const
export type DisputeStatus = typeof DISPUTE_STATUSES[number]

export interface DisputeEvidence {
  id: string
  uploader_role: 'buyer' | 'seller' | 'admin'
  type: 'image' | 'text'
  content: string
  created_at: string
}

export interface DisputeEvent {
  actor_role: 'buyer' | 'seller' | 'admin' | 'system'
  action: string
  old_status: string | null
  new_status: string | null
  note: string | null
  created_at: string
}

export interface Dispute {
  id: string
  order_id: string
  buyer_id: string
  seller_id: string
  reason: DisputeReason
  description: string
  desired_resolution: DesiredResolution
  status: DisputeStatus
  amount_disputed: number
  resolution: 'refund' | 'release' | 'partial' | null
  resolution_amount: number | null
  resolution_note: string | null
  sti_impact: number | null
  seller_responded_at: string | null
  escalated_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  evidence?: DisputeEvidence[]
  events?: DisputeEvent[]
}

export interface RaiseDisputeInput {
  reason: DisputeReason
  description: string
  desired_resolution: DesiredResolution
  evidence_urls?: string[]
}

export interface RespondDisputeInput {
  accept: boolean
  message?: string
  evidence_urls?: string[]
}

export interface ResolveDisputeInput {
  resolution: 'refund' | 'release' | 'partial'
  amount?: number
  note?: string
}

export interface DisputeListParams {
  status?: DisputeStatus
  page?: number
}
