---
"@mitumba/sdk": minor
---

Add email verification to `sdk.auth`:

- `sendVerificationCode()` — send 6-digit code to user's email (POST /auth/verify-email/send)
- `verifyEmail(code)` — confirm email with code (POST /auth/verify-email/confirm)
- `UserProfile` now includes `email_verified: boolean`
