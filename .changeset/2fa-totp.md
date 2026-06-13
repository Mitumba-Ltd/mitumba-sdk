---
"@mitumba/sdk": minor
---

Add 2FA (TOTP) support:

- `sdk.auth.login()` now returns `TwoFactorRequired` when 2FA is enabled
- `sdk.auth.verify2FA(input)` — verify TOTP code during login (POST /auth/2fa/login)
- `sdk.settings.setup2FA()` — get secret + QR URI (POST /auth/2fa/setup)
- `sdk.settings.verify2FA(code)` — confirm setup, receive backup codes (POST /auth/2fa/verify)
- `sdk.settings.disable2FA(code)` — disable 2FA (POST /auth/2fa/disable)

New exported types: `TwoFactorRequired`, `Verify2FAInput`
