---
"@mitumba/sdk": minor
---

**Self-contained token lifecycle — sessions can no longer silently die:**

1. `auth.login()`, `auth.register()`, `auth.verifyOtp()`, `auth.verify2FA()` now **auto-persist** tokens internally. Consumers no longer need to call `setToken()` after login.
2. `auth.logout()` now **auto-clears** the stored session.
3. `onAuthExpired` now fires on **any 401 with no usable refresh token** — not just on refresh failure. Prevents infinite 401 loops.
4. `setToken()` guards against empty refresh tokens (treats `""` as missing).
5. New: `sdk.setSession({ access_token, refresh_token })` — explicit method that requires both tokens.
