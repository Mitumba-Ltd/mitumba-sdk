---
"@mitumba/sdk": minor
---

2FA lifecycle + messages store authorship:

- `sdk.settings.enable2FA(code)` — re-enable 2FA using existing secret (POST /auth/2fa/enable)
- `sdk.settings.delete2FA(code)` — permanently remove 2FA secret (DELETE /auth/2fa)
- `UserProfile.totp_configured` — whether a TOTP secret is on file (distinct from `totp_enabled`)
- `SendMessageInput.from_store` — marks message as sent by the store side
- `Message.from_store` — orientation field on received messages (1 = store side, 0 = buyer)
