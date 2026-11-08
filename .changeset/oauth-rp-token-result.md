---
"@mitumba/sdk": minor
---

OAuth token exchange for relying parties. `OAuthTokenResult` gains `id_token`, and `refresh_token` is now optional. It's present only when the exchange yields a Mitumba session. Other relying parties receive an access token addressed only to themselves, limited to the consented scope, and no refresh token. `exchangeCode()` persists a client session only when a `refresh_token` is returned, and otherwise returns the result untouched. `userinfo()` documents passing a relying party's own access token through `headers`.
