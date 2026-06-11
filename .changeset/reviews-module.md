---
"@mitumba/sdk": minor
---

Add `sdk.reviews` module:

- `list(storeId, page?)` — list store reviews with avg rating (GET /listings/stores/:storeId/reviews)
- `create(storeId, input)` — create a review (POST /listings/stores/:storeId/reviews)

New exported types: `Review`, `CreateReviewInput`
