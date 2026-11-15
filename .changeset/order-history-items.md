---
'@mitumba/sdk': minor
---

`orders.getHistory()` now returns `OrderHistoryEntry[]`: each order with `items` (its first four lines: `listing_id`, `title`, `image_url`, `quantity`), `item_count`, `checkout_id` and `invoice_number`. With `role: 'seller'`, only paid orders are listed.
