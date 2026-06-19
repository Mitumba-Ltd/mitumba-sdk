---
"@mitumba/sdk": major
---

**BREAKING:** Update VAZI types to match new backend response:

- `VAZIOutfitItem` now has `id`, `title`, `price`, `imageUrl` (removed `garment_type`, `seller_id`, `seller_sti`, `seller_city`, `image_url`, `is_seed`, `final_score`, `listing_id`, `price_kes`)
- `VAZIOutfit` now has `total_price`, `webm_url`, `mp4_url`, `has_video`, `item_count` (removed `total_price_kes`, `sellers_count`, `is_multi_city`, `assembled_at`)
- Removed `GarmentType` and `GARMENT_TYPES` exports
