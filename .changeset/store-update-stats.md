---
"@mitumba/sdk": minor
---

Add store management methods to `sdk.stores`:

- `update(storeId, input)` — update store details (PUT /listings/stores/:storeId)
- `getStats(storeId)` — get store statistics (GET /listings/stores/:storeId/stats)

New exported types: `UpdateStoreInput`, `StoreStats`
