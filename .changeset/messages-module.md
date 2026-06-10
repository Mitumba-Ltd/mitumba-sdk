---
"@mitumba/sdk": minor
---

Add `sdk.messages` module for in-app messaging:

- `list()` — list all conversations (GET /notify/messages)
- `getThread(partnerId)` — get message thread with a partner (GET /notify/messages/:partnerId)
- `send(input)` — send a message (POST /notify/messages)

New exported types: `Conversation`, `Message`, `SendMessageInput`
