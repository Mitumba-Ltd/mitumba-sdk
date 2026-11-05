---
"@mitumba/sdk": major
---

`SettingsModule.updateProfile` now resolves to the updated `UserProfile` instead of `{ ok: true }`, so a profile edit no longer needs a follow-up `getProfile()` to read back the server-normalized result (Mitumba-Ltd/mitumba#330).

`UpdateProfileInput` is now documented with the server-enforced contract: a non-empty display name (max 80), canonical Kenyan `+254` phone (unique — `phone_taken` 409), one of Kenya's 47 county names, a bounded bio (max 500), and a trusted-CDN avatar URL. Invalid input is rejected with `invalid_input` (400).

Migration: if you read the old `{ ok: true }` result, drop that check — a resolved promise already means success, and the resolved value is now the profile.
