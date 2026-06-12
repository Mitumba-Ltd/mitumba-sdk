---
"@mitumba/sdk": minor
---

Add `sdk.cart` module:

- `list()` — get cart items (GET /listings/cart)
- `add(listingId)` — add to cart (POST /listings/cart/:listingId)
- `remove(listingId)` — remove from cart (DELETE /listings/cart/:listingId)
- `checkout()` — create orders from cart grouped by store (POST /orders/checkout)

New exported type: `CartItem`
