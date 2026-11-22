---
"@mitumba/sdk": minor
---

`sdk.stores.getVerification(storeId)` and `sdk.stores.submitVerification(storeId, documentId)` read and submit the shop owner's identity verification. New types: `SellerVerification`, `SellerVerificationStatus` and the `SELLER_VERIFICATION_STATUSES` constant. `AdminVerificationItem` gains `verification_submitted_at`, `verification_decided_at` and `verification_note`. `admin.rejectVerification` now requires `reason`. `StoreSettings.id_document_url` is read-only through `updateSettings`.
