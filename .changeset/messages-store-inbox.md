---
"@mitumba/sdk": minor
---

Update `sdk.messages` for store-scoped inboxes:

- `list(storeId?)` — optional `storeId` param to filter by store inbox
- `getThread(partnerId, storeId?)` — optional `storeId` param for store context
- `Conversation` type now includes `listing_title` field
