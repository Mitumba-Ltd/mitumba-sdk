---
"@mitumba/sdk": minor
---

Add `sdk.stores` module:

- `getBySlug(slug)` — get store by URL slug (GET /listings/stores/:slug)
- `follow(storeId)` — follow a store (POST /listings/stores/:storeId/follow)
- `unfollow(storeId)` — unfollow a store (DELETE /listings/stores/:storeId/follow)
- `getListings(storeId, page?)` — get store's listings (GET /listings?store_id=...)

Add convenience methods to `sdk.listings`:

- `feed(params?)` — browse listing feed with simplified params
- `get(id)` — alias for getById
- `search(params)` — full-text search with filters

New exported types: `Store`, `SubscriptionTier`
