---
"@mitumba/sdk": major
---

`AuthModule.logout()` now reads the refresh token the SDK holds and revokes exactly that session server-side, then **always** clears local tokens — even when the request fails or there is no token — so the device is signed out regardless. It is idempotent and returns `{ ok, revoked }`, where `revoked` is true only when the server confirmed revocation (Mitumba-Ltd/mitumba#328).

**Breaking:** `logout()` no longer takes a `{ refresh_token }` argument — the SDK owns its stored token. Callers that passed one (including an empty placeholder) must drop the argument: `sdk.auth.logout()`.
