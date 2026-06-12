---
"@mitumba/sdk": minor
---

Add `sdk.wishlists` module:

- `list()` — get saved listings (GET /listings/wishlists)
- `add(listingId)` — save a listing (POST /listings/wishlists/:listingId)
- `remove(listingId)` — unsave a listing (DELETE /listings/wishlists/:listingId)

New exported type: `WishlistListing`
