---
"@mitumba/sdk": minor
---

Add password reset flow to auth module:

- `forgotPassword({ email })` — sends a password reset link to the given email (POST /auth/forgot-password)
- `resetPassword({ token, password })` — resets the password using the token from the reset email (POST /auth/reset-password)

New exported types: `ForgotPasswordInput`, `ResetPasswordInput`
