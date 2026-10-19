---
"@mitumba/sdk": minor
---

feat(wholesale): bale image upload and bale-seller analytics

Add three methods to `WholesaleModule`:

- `presignBaleImage(baleId, index)` and `uploadBaleImage(baleId, file, index)` — bale image upload, mirroring the listing image flow (multipart upload, slot 0 is the cover).
- `getAnalytics(period?)` — performance analytics for the session-resolved wholesale store.

Adds the `BaleImageUploadResult` and `WholesaleAnalytics` types. Backward compatible. Closes #170 and #171.
