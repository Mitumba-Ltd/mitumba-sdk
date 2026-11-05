---
"@mitumba/sdk": patch
---

Document the visibility rules for `Order.buyer_phone` and `Order.delivery_address`: both are always visible to the buyer, but visible to the seller only during the `paid`→`delivered` handover window and `null` otherwise (Mitumba-Ltd/mitumba#321). The fields were already nullable, so this is a documentation-only change — no type or runtime behavior changes.
