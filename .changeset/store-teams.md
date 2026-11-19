---
'@mitumba/sdk': minor
---

Shop teams and shop limits.

- `sdk.stores.getMyStores()` now returns each shop the caller works in, owned or joined, with `my_role`, `my_permissions`, `is_owner` and `listing_count`.
- Team: `getMembers`, `changeMemberRole`, `removeMember`, `leave`, `invite`, `getInvitations`, `revokeInvitation`, `getReceivedInvitations`, `acceptInvitation`, `declineInvitation`, `getAuditLog`.
- Shop limit: `getStoreLimit`, `requestStoreLimit`; for operators, `sdk.admin.listShopLimitRequests` and `sdk.admin.decideShopLimitRequest`.
- New types: `StoreRole`, `StorePermission`, `StoreMember`, `StoreInvitation`, `ReceivedStoreInvitation`, `StoreAuditPage`, `StoreLimitState`, `AdminShopLimitRequest`, and their inputs and results.
