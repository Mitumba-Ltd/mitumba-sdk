---
"@mitumba/sdk": major
---

Retire Messaging v1. The deprecated v1 methods are removed from `MessagesModule`:

- Conversations and messages: `list`, `getThread`, `send`, `markRead`
- Realtime sockets: `connectTyping`, `connectInbox`, `connectInboxFresh`
- Moderation: `createReport`, `createBlock`, `removeBlock`

Every client is on Messaging v2 and the backend now returns `410` for the v1 `/notify/messages*` routes (Mitumba-Ltd/mitumba#346). Migrate to the v2 surface: `listConversations` / `listStoreConversations`, `resolveThread` + `listThreadMessages`, `sendThreadMessage`, `advanceThreadReadCursor`, managed realtime (`createMessagesRealtimeConnection` / `connectMessagesRealtime`), and `createMessagingReport` / `createMessagingBlock` / `removeMessagingBlock`.
