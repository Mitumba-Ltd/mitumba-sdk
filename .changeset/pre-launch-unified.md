---
"@mitumba/sdk": minor
---

Pre-launch unified update (issue #153):

- **Orders**: `Order` type now includes `listing_title`, `listing_image_url`, `listing_condition`, `listing_size`, `buyer_name`, `buyer_phone`, and `delivery_address`
- **Stores**: Add `uploadLogo(storeId, file)` and `uploadBanner(storeId, file)` methods (multipart upload, returns CDN URL)
- **Listings**: Add `image_url` field to `Listing` type (full CDN URL of first image)

New exported type: `DeliveryAddress`
