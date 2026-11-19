---
'@mitumba/sdk': minor
---

Admin refunds.

- `sdk.admin.listRefunds({ status?, page? })` (`GET /admin/refunds`): refunds owed to buyers, with the masked recipient once sent and, while pending, what blocks sending.
- `sdk.admin.sendRefund(id)` (`POST /admin/refunds/:id/send`): send a pending refund to the number that paid.
- New types: `AdminRefundItem`, `AdminRefundStatus`, `AdminRefundReason`, `AdminRefundSendResult`.
