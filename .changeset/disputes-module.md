---
"@mitumba/sdk": minor
---

Add `sdk.disputes` module for order dispute management:

**Buyer methods:**
- `raise(orderId, input)` — open a dispute (POST /orders/:orderId/dispute)
- `getForOrder(orderId)` — get dispute for an order (GET /orders/:orderId/dispute)
- `get(disputeId)` — get dispute by ID (GET /orders/disputes/:id)
- `addEvidence(disputeId, input)` — add evidence (POST /orders/disputes/:id/evidence)
- `escalate(disputeId)` — escalate to admin (POST /orders/disputes/:id/escalate)
- `withdraw(disputeId)` — withdraw dispute (POST /orders/disputes/:id/withdraw)

**Seller methods:**
- `respond(disputeId, input)` — accept or contest (POST /orders/disputes/:id/respond)

**Admin methods:**
- `list(params?)` — list all disputes (GET /orders/disputes)
- `resolve(disputeId, input)` — resolve dispute (POST /orders/disputes/:id/resolve)

New exported types: `Dispute`, `DisputeEvidence`, `DisputeEvent`, `DisputeReason`, `DesiredResolution`, `DisputeStatus`, `RaiseDisputeInput`, `RespondDisputeInput`, `ResolveDisputeInput`, `DisputeListParams`
