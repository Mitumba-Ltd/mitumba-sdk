---
"@mitumba/sdk": minor
---

- Add `admin.listLibrary()`, which returns `LibraryListing`: the operations-library documents the caller may read, as summaries with review due dates, plus `can_read_all`.
- Add `admin.getLibraryDocument(slug)`, which returns `LibraryDocument`: one document with its markdown body. A document the caller may not read returns 404, exactly like a missing one.
- New types: `LibraryKind`, `LibraryCadence`, `LibraryDocumentSummary`, `LibraryDocument` and `LibraryListing`.
- `AdminPermission` gains `library:read_all`.
