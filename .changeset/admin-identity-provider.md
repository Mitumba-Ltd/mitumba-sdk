---
"@mitumba/sdk": minor
---

- Add admin methods for the sign-in client registry, which require `clients:manage`:
  - `listOAuthClients()` and `getOAuthClient()`;
  - `registerOAuthClient()`, which returns a confidential client's secret once only;
  - `deactivateOAuthClient()`;
  - `setOAuthClientRedirectUris()` and `setOAuthClientScopes()`.
- Add admin methods for OIDC signing keys, which require `oidc:rotate_keys`: `listOidcSigningKeys()` returns key metadata only, and `rotateOidcSigningKey()` runs the rotation.
- New types: `OAuthClientSummary`, `OAuthClient`, `RegisterOAuthClientInput`, `RegisteredOAuthClient`, `OAuthClientType`, `OAuthClientTrustLevel` and `OidcSigningKey`.
- `AdminPermission` gains `clients:manage` and `oidc:rotate_keys`.
- The docs and examples now use the canonical API host, `https://api.mitumba.africa`.
