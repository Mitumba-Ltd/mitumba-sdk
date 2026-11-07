---
'@mitumba/sdk': minor
---

Add `sdk.markets.list()` (public `GET /markets`) and market-driven helpers: `formatMoney`, `formatAmount`, `formatMoneyCompact`, `normalizePhone`, `isValidPhone`, `formatPhone`, `maskPhone`, `findMarket` and `activeMarkets`. Clients can now read a market's currency, calling code, phone rules and region naming at runtime instead of hardcoding Kenya.
