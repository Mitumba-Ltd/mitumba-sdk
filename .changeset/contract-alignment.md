---
"@mitumba/sdk": minor
---

Align all module methods with the SDK contract:

- **auth**: `refresh()` and `logout()` now accept `{ refresh_token }` object input
- **listings**: `getById()` returns `Listing & { images: ListingImage[] }`, `updateStatus()` returns `{ ok, status }`, `PresignImageResponse` uses `r2_key`
- **search**: Renamed `search()` → `query()`, `getTrending()` → `trending(params?)`
- **orders**: `getById()` returns `Order & { events: OrderEvent[] }`, `transition()` returns `{ ok, status }`
- **pay**: Renamed `initiateStkPush()` → `initiateStk()`
- **vazi**: Renamed `completeOutfit()` → `getCompleteLook()`
- **client**: Added `getToken()` utility method
