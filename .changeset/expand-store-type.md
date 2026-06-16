---
"@mitumba/sdk": minor
---

Expand `Store` type to match backend response:

- Add `seller_id`, `tagline`, `category`, `city_id`, `is_verified`, `updated_at`, `sti_score` fields
- Rename `owner_id` → `seller_id`, `city` → `city_id`
- Remove `premium` from `SubscriptionTier` (backend only supports `free` | `pro`)
- Mark `sti_score`, `follower_count`, `is_following` as optional (only present on `getBySlug`)
