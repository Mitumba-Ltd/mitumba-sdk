---
"@mitumba/sdk": major
---

`CreateReviewInput.order_id` is now **required**. The server has always rejected a review without an order and enforces one review per order (Mitumba-Ltd/mitumba#307), so omitting `order_id` only ever produced a runtime 400 — the type now reflects that. `ReviewsModule.create` documents the `review_not_allowed` and `already_reviewed` error codes it can throw.

Migration: pass the delivered/completed `order_id` you are reviewing (you almost certainly already do). This is a type-only tightening; no runtime behavior changed.
