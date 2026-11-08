---
"@mitumba/sdk": minor
---

Add `admin.listAuditLog(query)` for the attributed, filterable audit trail (`GET /admin/audit`): filters by `actor`, `action`, `target_type`, `target_id`, `since`/`until`, and keyset paging via `before` / `next_cursor`. Audit entries now carry an optional resolved `actor` (`user` | `iam` | `unknown` with email, display name and organization), and `target_id` is nullable.
