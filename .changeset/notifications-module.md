---
"@mitumba/sdk": minor
---

Add `sdk.notifications` module:

- `list(page?)` — list paginated notifications with unread count (GET /notify/notifications)
- `markRead(ids?)` — mark specific or all notifications as read (POST /notify/notifications/read)

New exported types: `Notification`, `NotificationType`
