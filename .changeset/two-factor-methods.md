---
"@mitumba/sdk": minor
---

Add multi-method 2FA to `sdk.settings`:

- `list2FAMethods()` — list all 2FA methods
- `add2FAMethod(input)` — add totp/sms/email method
- `verify2FAMethod(id, code)` — confirm pending method
- `enable2FAMethod(id, code)` — re-enable disabled method
- `disable2FAMethod(id, code)` — disable method (keep credentials)
- `delete2FAMethod(id, code)` — permanently remove method
- `setPrimary2FAMethod(id)` — set default login method
- `challenge2FAMethod(id)` — resend sms/email code

Updated types:
- `TwoFactorRequired.methods` — available methods at login
- `Verify2FAInput.method_id` — specify which method to verify against
- `UserProfile.two_factor_methods_count` — count of verified methods

New exported types: `TwoFactorMethod`, `TwoFactorMethodType`, `Add2FAMethodInput`, `Add2FAMethodResult`
