---
"@mitumba/sdk": minor
---

Add OIDC provider-client helpers to `sdk.oauth`: `discover()` (OpenID discovery document), `getJwks()` (public signing keys), and `userinfo()` (the current session's claim set). Wraps the provider's `/auth/oauth/openid-configuration`, `/auth/oauth/jwks.json`, and `/auth/oauth/userinfo` endpoints, with `OpenIdConfiguration`, `Jwks`/`Jwk`, and `UserInfo` types.
