---
"@mitumba/sdk": minor
---

Three features in one release:

**1. Inbox Realtime** (`sdk.messages`)
- `connectInbox()` — user-scoped WebSocket for live conversation list updates
- New type: `InboxRealtimeEvent`

**2. UserProfile fields**
- Add `county`, `bio`, `avatar_url` to `UserProfile` (removes last `as any` cast in profile settings)

**3. WebAuthn / Passkeys** (Phase 4 of multi-method 2FA)
- `TwoFactorMethodType` now includes `'passkey'`
- `sdk.settings.startPasskeyRegistration(input?)` — begin passkey registration
- `sdk.settings.finishPasskeyRegistration(methodId, credential)` — complete attestation
- `sdk.auth.startPasskeyLogin(input)` — get assertion options for login
- `sdk.auth.finishPasskeyLogin(input)` — submit assertion, receive tokens

New exported types: `InboxRealtimeEvent`, `PublicKeyCredentialCreationOptionsJSON`, `RegistrationResponseJSON`, `PublicKeyCredentialRequestOptionsJSON`, `AuthenticationResponseJSON`
