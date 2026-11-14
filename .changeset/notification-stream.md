---
'@mitumba/sdk': minor
---

Live notifications.

- `notifications.stream(options?)` and `notifications.connectStream(options?)` return a managed `NotificationStream`:
  - it requests a one-use ticket (`POST /notify/notifications/stream/tickets`) and opens the socket for its `surface` (`web` by default);
  - it delivers `hello`, `item`, `read`, `flash` and `flash_resolved` frames, and tracks `unread`;
  - on close code 4001 it reconnects at once with a fresh ticket; otherwise it reconnects with jittered backoff. Close code 4003 (revoked), a protocol error, or a 401/403 ticket refusal stops it (`failed`).
- `notifications.unread()` (`GET /notify/notifications/unread`) returns `{ unread_count }`.
- `Notification` gains optional `data`, `category`, `event_type`, `actions`, `link` and `count`. `metadata` is deprecated (never sent). `NotificationType` lists the further values the API returns.
- `markRead` documents its limit of 90 ids per call.
