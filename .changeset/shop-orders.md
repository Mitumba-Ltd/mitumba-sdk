---
'@mitumba/sdk': minor
---

Shop orders.

- `sdk.orders.cancel(id, { reason, note? })` (`POST /orders/:id/cancel`), returning the refund owed and any shop pause.
- `sdk.orders.getById` types the shop's fields: `items`, `settlement` and `next_step`.
- `OrderHistoryEntry.next_step` on seller history.
- New types: `ShopNextStep`, `ShopHolder`, `ShopStep`, `ShopSettlement`, `SettlementLine`, `OrderItem`, `ShopOrderFields`, `ShopCancelReason`, `CancelOrderInput`, `CancelOrderResult`.
