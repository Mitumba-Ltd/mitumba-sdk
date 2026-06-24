---
"@mitumba/sdk": minor
---

Extend `sdk.admin` with 25 new platform management methods (all backends live):

- **Users**: `listUsers`, `getUser`, `setUserRole`, `revokeUserSessions`
- **Stores**: `listStores`, `getStore`
- **Verification**: `listVerifications`, `approveVerification`, `rejectVerification`
- **STI**: `adjustSti`, `getStiEvents`
- **Listings**: `listListings`, `removeListing`, `reinstateListing`
- **Orders**: `listOrders`, `getOrder`, `forceTransitionOrder`
- **Payouts**: `getPayoutSummary`, `listPayouts`, `disbursePayout`
- **Metrics**: `getStatsTimeseries`, `getStatsByCity`
- **Reports**: `listReports`, `resolveReport`
- **Reviews**: `removeReview`, `reinstateReview`
- **VAZI**: `listVaziOutfits`, `removeVaziOutfit`, `reinstateVaziOutfit`
- **Broadcast**: `broadcast`

Add `sdk.reports` module (user-facing):
- `create(input)` — flag a listing/review/store/user for admin review (POST /listings/reports)

New exported types: `AdminUserListItem`, `AdminUserDetail`, `AdminStoreListItem`, `AdminStoreDetail`, `AdminVerificationItem`, `StiEvent`, `AdminListingItem`, `AdminOrderListItem`, `AdminOrderDetail`, `AdminPayoutItem`, `AdminReport`, `AdminVaziOutfit`, `CreateReportInput`
