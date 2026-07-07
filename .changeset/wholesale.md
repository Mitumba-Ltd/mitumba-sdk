---
"@mitumba/sdk": minor
---

Wholesale vertical (Phases A–C):

**Foundation (Phase A):**
- New types: `BusinessType` (`'individual' | 'business'`), `SellerType` (`'retail' | 'bale'`)
- `BecomeSellerInput.business_type` — replaces the overloaded `seller_type` field (kept as deprecated alias)

**Wholesale module (Phases B+C) — `sdk.wholesale`:**
- `getWholesaleStore()` — get user's wholesale store + depots
- `saveWholesaleStore(input)` — create/update wholesale store (bale_seller only)
- `addDepot(input)` / `removeDepot(id)` — manage depots
- `createBale(input)` — create a bale listing (requires verified store)
- `getBale(id)` — get bale detail (public)
- `updateBale(id, input)` — update a bale
- `removeBale(id)` — soft-delete a bale
- `myBales()` — list user's bales
- `wholesaleFeed(params?)` — browse the wholesale feed (public)

New exported types: `BusinessType`, `SellerType`, `BaleGrade`, `BaleType`, `WholesaleStore`, `WholesaleDepot`, `Bale`, `BaleDetail`, `CreateBaleInput`, `WholesaleFeedParams`, `BaleFeedItem`, `SaveWholesaleStoreInput`, `AddDepotInput`
