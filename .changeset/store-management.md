---
"@mitumba/sdk": minor
---

Add store management to `sdk.stores`:

- `getMyStores()` — get all stores owned by the authenticated user (GET /listings/stores/mine)
- `create(input)` — create a new store (POST /listings/stores)

New exported type: `CreateStoreInput`
