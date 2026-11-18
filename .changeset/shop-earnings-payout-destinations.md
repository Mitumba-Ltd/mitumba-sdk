---
'@mitumba/sdk': minor
---

Shop earnings and payout destinations.

- `sdk.stores.getEarnings`, `getEarningsEntries` and `getPayout`: a shop's balances by payout state, each paid order's entitlement, and one payout with its settlement lines.
- `sdk.stores.getPayoutDestinations`, `addPayoutDestination`, `setDefaultPayoutDestination`, `cancelPendingDefault` and `removePayoutDestination`: masked destinations, with the cooling-off and pending default.
- `stepUpRequired(error)`: whether a change needs a fresh second factor first.
- New types: `PayoutState`, `EarningsBalance`, `ShopEarnings`, `ShopPayoutEntry`, `ShopPayoutEntriesPage`, `ShopPayoutEntriesParams`, `ShopPayout`, `PayoutDestinationLabel`, `PayoutMethodType`, `PayoutMethodOption`, `PayoutBankOption`, `PayoutDestination`, `PayoutDestinationsState`, `PayoutDestinations`, `AddPayoutDestinationInput`, `PayoutDestinationRejection`.
- `StoreSettings.payout_method`, `payout_mpesa_number`, `payout_bank_name` and `payout_account_number` are deprecated; updates ignore them.
