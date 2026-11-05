---
"@mitumba/sdk": minor
---

Add `Order.buyer_county` (nullable). A seller sees the buyer's first name and county before payment, while `buyer_phone`/`delivery_address` remain gated to the `paid`→`delivered` handover window (Mitumba-Ltd/mitumba#321). Additive, non-breaking.
