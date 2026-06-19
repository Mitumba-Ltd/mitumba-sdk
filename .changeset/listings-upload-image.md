---
"@mitumba/sdk": minor
---

Add `sdk.listings.uploadImage(listingId, file, index)` — uploads a listing image directly via multipart/form-data (POST /listings/:id/images/upload). Returns `{ r2_key, image_id, url }`.
