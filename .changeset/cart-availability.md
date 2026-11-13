---
'@mitumba/sdk': minor
---

Cart lines carry their availability: `CartItem` gains `quantity`, `status`, `stock_quantity` and `available_quantity` (already returned by `GET /listings/cart`). New helpers `cartLineAvailability`, `isCartLineBuyable` and `partitionCart` classify each line as available, limited, reserved, sold or unavailable, so a client can fix the cart before checkout. `CartItem.delivery_fee` is deprecated: delivery is priced per shop at checkout.
