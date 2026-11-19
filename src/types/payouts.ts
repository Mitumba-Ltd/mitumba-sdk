// A shop's earnings, its payouts, and where it is paid.

import type { SettlementLine } from './orders'

/**
 * Where an order's payout stands:
 * - `in_escrow`: paid, being fulfilled, or delivered with the buyer's window still open.
 * - `on_hold`: disputed, or held.
 * - `awaiting_approval`: completed; waits to be released.
 * - `approved`: released, not yet sent.
 * - `sending`: submitted, not yet confirmed.
 * - `sent`: confirmed.
 * - `failed`: refused by the provider.
 * - `test`: paid in a test environment; never paid out.
 */
export type PayoutState =
  | 'in_escrow'
  | 'on_hold'
  | 'awaiting_approval'
  | 'approved'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'test'

/** Totals for one currency, per payout state, in minor units. */
export interface EarningsBalance {
  currency: string
  totals: Record<PayoutState, { amount_minor: number; count: number }>
  /** Whether any amount is an estimate (an order with no payout yet). */
  includes_estimates: boolean
}

/** `GET /orders/stores/:storeId/earnings`. */
export interface ShopEarnings {
  store_id: string
  /** One per currency, sorted by currency code. */
  balances: EarningsBalance[]
  /** When the owner's payouts are frozen until, or null. */
  frozen_until: string | null
}

/** A payout destination as everyone sees it: masked. */
export interface PayoutDestinationLabel {
  method: PayoutMethodType
  label: string
}

/** One order's entitlement: what the shop is owed or was paid for it. */
export interface ShopPayoutEntry {
  /** The payout's id, or null while the order has no payout yet. */
  id: string | null
  order_id: string
  invoice_number: string | null
  state: PayoutState
  amount_minor: number
  currency: string
  /** True when `amount_minor` is an estimate from the order's frozen fees. */
  estimated: boolean
  created_at: string
  /** When the provider confirmed it, for a sent payout. */
  sent_at: string | null
  /** Where it was sent, for a payout that is sending, sent or failed. */
  destination: PayoutDestinationLabel | null
}

/** `GET /orders/stores/:storeId/earnings/entries`. */
export interface ShopPayoutEntriesPage {
  data: ShopPayoutEntry[]
  page: number
  page_size: number
  total: number
}

export interface ShopPayoutEntriesParams {
  state?: PayoutState
  page?: number
}

/** `GET /orders/stores/:storeId/payouts/:payoutId`: one payout with its settlement lines. */
export interface ShopPayout extends ShopPayoutEntry {
  id: string
  /** Signed lines in minor units that sum to the payout. */
  lines: SettlementLine[]
}

/** A payout method. A market lists the ones it offers. */
export type PayoutMethodType = 'mpesa_mobile' | 'mpesa_pochi' | 'mpesa_till' | 'mpesa_paybill' | 'bank_account'

export interface PayoutMethodOption {
  id: PayoutMethodType
  name: string
  /** Whether destinations of this method can be added now. */
  enabled: boolean
}

export interface PayoutBankOption {
  id: string
  name: string
}

/** One of the shop's destinations, masked. */
export interface PayoutDestination {
  id: string
  method: PayoutMethodType
  method_name: string
  label: string
  /** `cooling_off` until `effective_at`: it cannot receive payouts yet. */
  state: 'active' | 'cooling_off'
  effective_at: string
  is_default: boolean
  created_at: string
}

/** The shop's destinations, as every change answers. */
export interface PayoutDestinationsState {
  destinations: PayoutDestination[]
  default_destination_id: string | null
  /** A change of default waiting out its cooling-off, or null. */
  pending_default: { destination_id: string; from: string } | null
}

/** `GET /listings/stores/:storeId/payout-destinations`. */
export interface PayoutDestinations extends PayoutDestinationsState {
  market_code: string
  methods: PayoutMethodOption[]
  banks: PayoutBankOption[]
  /** Whether the caller may change them (the owner). */
  can_manage: boolean
}

/** What the owner gives for each method. */
export type AddPayoutDestinationInput =
  | { method: 'mpesa_mobile' | 'mpesa_pochi'; phone: string; make_default?: boolean }
  | { method: 'mpesa_till'; till_number: string; make_default?: boolean }
  | { method: 'mpesa_paybill'; paybill_number: string; account_number: string; make_default?: boolean }
  | { method: 'bank_account'; bank_id: string; account_number: string; make_default?: boolean }

/** Why a destination was refused on entry, with the field to fix. */
export type PayoutDestinationRejection =
  | 'invalid_phone'
  | 'invalid_till'
  | 'invalid_paybill'
  | 'invalid_account'
  | 'unknown_bank'
  | 'method_not_offered'
