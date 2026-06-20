---
"@mitumba/sdk": minor
---

Add to `sdk.messages`:

- `markRead(partnerId, storeId?)` — mark messages from a partner as read (POST /notify/messages/:partnerId/read)
- `connectTyping(partnerId)` — connect to typing indicator WebSocket (returns native WebSocket instance)

Also adds `getBaseUrl()` to `APIClient`.
