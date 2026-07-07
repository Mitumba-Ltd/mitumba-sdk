---
"@mitumba/sdk": minor
---

Wholesale Phase D + wholesaler onboarding:

- `sdk.auth.becomeBaleSeller(input)` — grant `bale_seller` role (POST /auth/become-bale-seller)
- `sdk.wholesale.createBaleOrder(input)` — create a bale order (buyer)
- `sdk.wholesale.myBaleOrders()` — buyer's bale orders
- `sdk.wholesale.incomingBaleOrders()` — seller's incoming bale orders
- `sdk.wholesale.getBaleOrder(id)` — order detail with events
- `sdk.wholesale.transitionBaleOrder(id, action)` — advance order status

New exported types: `BecomeBaleSellerInput`, `BaleOrder`, `BaleOrderEvent`, `BaleOrderStatus`, `BaleFulfillment`, `CreateBaleOrderInput`
