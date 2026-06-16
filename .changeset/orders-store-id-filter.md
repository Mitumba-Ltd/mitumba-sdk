---
"@mitumba/sdk": minor
---

Add optional `store_id` to `OrderHistoryParams` — allows multi-store sellers to filter order history by store when using `sdk.orders.getHistory({ role: 'seller', store_id })`.
