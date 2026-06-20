---
"@mitumba/sdk": minor
---

Update `CartItem` and `WishlistListing` types to match backend response:

- `CartItem`: replace `image_keys` with `image_url` (full CDN URL), add `delivery_fee`, remove `id`/`added_at`
- `WishlistListing`: replace `image_keys` with `image_url`, add `size`, remove `store_id`/`category_id`/`city_id`/`status`/`created_at`
