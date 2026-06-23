---
"@mitumba/sdk": minor
---

Reliable token lifecycle:

- **IndexedDB token persistence** — tokens survive browser cleanup (falls back to in-memory for Node/Edge)
- **Proactive refresh** — checks JWT expiry before every request, refreshes if <60s remaining
- **`onAuthExpired` callback** — fires only when refresh token is truly dead (user needs to re-login)
- **`sdk.hydrate()`** — restores tokens from IndexedDB on app boot
- **`sdk.isAuthenticated()`** — checks if a valid session exists in the store

New exports: `TokenStore` (interface), `MemoryTokenStore`, `IDBTokenStore`, `createTokenStore`
