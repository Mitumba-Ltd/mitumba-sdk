---
"@mitumba/sdk": minor
---

Add `sdk.markets.regions(code)` (public `GET /markets/:code/regions`) returning a market's first-level regions, e.g. Kenya's 47 counties, with the market's `label`/`plural` for them. Send a region's canonical `name` back to the API. New root helpers `findRegion(regions, name)` (canonical name after trimming, otherwise exact) and `regionById(regions, id)`, plus the `MarketRegion` and `MarketRegionsResponse` types.
