---
"@mitumba/sdk": minor
---

- `OAuthAuthorizeInput` gains an optional `nonce`. It's forwarded by `oauth.authorize()` and `oauth.silentAuthorize()` and echoed in the id_token's `nonce` claim, so a relying party can bind the id_token to its request.
- `auth.verifyOtp()` now returns `AuthTokens | TwoFactorRequired`. A phone sign-in to an account with two-factor authentication returns the challenge (narrow with `'requires_2fa' in result`) and persists nothing. Finish it with `verify2FA()` or the passkey ceremony, as with `login()`. Accounts without 2FA are unchanged.
