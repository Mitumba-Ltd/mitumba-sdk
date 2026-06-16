---
"@mitumba/sdk": minor
---

Expand `Store` type with fields now returned by the backend:

- Add `seller_id` — the store owner's user ID
- Add `tagline`, `category` — store metadata fields
- Add `city_id` — store's city reference
- Add `is_verified` — store verification status
- Add `updated_at` — last update timestamp
- Add `sti_score` (optional) — seller's STI score (joined on getBySlug)
