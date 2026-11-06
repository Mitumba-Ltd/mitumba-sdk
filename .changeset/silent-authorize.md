---
"@mitumba/sdk": minor
---

Add `sdk.oauth.silentAuthorize()` for the `prompt=none` silent-SSO attempt. It performs the no-interaction authorize and returns a discriminated `SilentAuthorizeResult` — `{ ok: true, code, state }` on a silent mint, or `{ ok: false, reason: 'login_required' | 'interaction_required' | 'unauthenticated' }` for the expected fallbacks (returned, not thrown) — so a first-party app can attempt silent sign-in and fall back cleanly. Only genuinely unexpected errors throw.
