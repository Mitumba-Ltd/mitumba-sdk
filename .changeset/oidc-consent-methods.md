---
"@mitumba/sdk": minor
---

Add OIDC consent support to `sdk.oauth`: `grantConsent()`, `revokeConsent()`, and `listConsents()` wrap the consent endpoints, and `authorize()` now returns `OAuthAuthorizeResult | OAuthConsentRequired` for `first_party_consent` clients (narrow with the new `isConsentRequired()` guard). Adds `OAuthConsentInput`, `OAuthConsent`, `OAuthConsentRevokeResult`, and `OAuthConsentRequired` types.
