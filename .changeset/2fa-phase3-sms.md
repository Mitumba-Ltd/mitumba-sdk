---
"@mitumba/sdk": minor
---

Complete multi-method 2FA (Phase 3):

- `sdk.auth.sendLogin2FAChallenge({ temp_token, method_id })` — request SMS/email code at login time (POST /auth/2fa/login/challenge)
- `UserProfile.sms_2fa_available` — whether the platform offers SMS as a 2FA method
