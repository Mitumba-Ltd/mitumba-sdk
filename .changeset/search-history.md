---
"@mitumba/sdk": minor
---

Add search history to `sdk.search`:

- `getHistory()` — get user's recent searches (GET /search/history)
- `saveHistory(input)` — save a search query (POST /search/history)

New exported types: `SearchHistoryItem`, `SaveSearchInput`
