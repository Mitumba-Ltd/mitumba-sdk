---
"@mitumba/sdk": patch
---

- Fixed: an expiring access token whose refresh is refused (400 or 401) now behaves like a refusal after a 401. The SDK calls `onAuthExpired` and rejects with `APIError` 401 `session_expired`.
- Before this fix, the request rejected with a plain internal error ("Refresh credentials are invalid.") and `onAuthExpired` never fired. Apps could not tell that the session had ended.
- Transient refresh failures (offline, 5xx) still propagate unchanged and keep the session.
