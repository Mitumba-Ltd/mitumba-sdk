---
'@mitumba/sdk': minor
---

Platform settings gain a `Notifications` group and three value kinds:
- `choice`, with the allowed values in `options`;
- `number`, a whole number from `min` to `max`, with an optional `unit`;
- `recipients`, comma-separated account ids or `iam:<id>`.

New `admin.sendTestNotification()` (`POST /admin/notifications/test`, `broadcast:send`) sends a test notification to the caller only and returns `SendTestNotificationResult`. `503 notifications_unavailable` means nothing was sent.
