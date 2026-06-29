---
"@mitumba/sdk": minor
---

Update messages types to match grouped conversation backend:

- `SendMessageInput`: add optional `order_id`
- `Conversation`: now grouped per-partner with `partner_name`, `store_name`, `unread_count`
- `Message`: add optional `order_id`
