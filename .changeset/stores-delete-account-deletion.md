---
"@mitumba/sdk": minor
---

Add account deletion flow:

- `sdk.stores.delete(storeId)` — delete a store (blocked if active obligations)
- `sdk.auth.getDeletionEligibility()` — check if account can be deleted
- `sdk.auth.requestAccountDeletion()` — send confirmation email
- `sdk.auth.confirmAccountDeletion({ token, code? })` — confirm deletion (clears session)

Also: `APIClient.delete()` now supports an optional request body (for DELETE-with-body endpoints).
