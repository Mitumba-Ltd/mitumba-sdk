---
"@mitumba/sdk": patch
---

- Fix `stores.getListings()` to use correct path `GET /listings/stores/:storeId/listings`
- Add `store_id` (required) and `vazi_eligible` (optional) to `CreateListingInput`
