---
"@mitumba/sdk": minor
---

Add `wholesale.removeBaleImage(baleId, index)` to delete a bale photo, completing the bale image management surface alongside `presignBaleImage` / `uploadBaleImage` (shipped in 1.33.0). Backed by `DELETE /listings/bales/:baleId/images/:index` and returns `{ ok: true }`.
