---
"@mitumba/sdk": minor
---

Add store-level aggregates and pagination metadata to `reviews.list()`. The response now includes `rating_counts` (a 1–5 star histogram across all of a store's reviews), `page_size`, and `has_more`, exposed through the new `StoreReviewsPage` return type.
