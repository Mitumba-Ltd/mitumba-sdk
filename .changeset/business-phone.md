---
"@mitumba/sdk": minor
---

`Business` now carries `phone` (the contact / payout number in E.164), and `UpdateBusinessInput` accepts `phone` and `null` for `county` or `phone` to clear them. `county` must be a region name from `sdk.markets.regions()` and is stored canonically; an invalid county or phone is a 400 (`invalid_county` / `invalid_phone`). `becomeSeller` and `becomeBaleSeller` now store the phone they are given on the business, and validate both fields the same way.
